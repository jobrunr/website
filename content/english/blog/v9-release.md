---
title: "JobRunr & JobRunr Pro v9: See Inside Every Background Job"
description: "JobRunr v9 draws every attempt and every durable step of a job on a chart. JobRunr Pro v9 adds Job Analytics to the dashboard, can pause and resume a batch halfway and starts jobs within milliseconds on Postgres, without multicast."
keywords: ["jobrunr v9", "jobrunr 9", "java background jobs", "job analytics", "durable execution java", "pause batch job", "postgres listen notify"]
image: "/blog/thubm-jr-v-900.webp"
date: 2026-09-30T09:00:00+02:00
author: "The JobRunr Team"
draft: false
tags:
  - blog
  - release
  - dashboard
  - durable execution
  - postgres
---
JobRunr and JobRunr Pro `v9` have arrived! To show you what is in it, we broke a monthly invoice run for 600 customers on purpose. A quarter of the way into the run the payment provider stopped answering. The JobRunr Pro v9 dashboard showed us which job was in trouble and at which step, let us pause the run without killing the invoices that were already in progress, and after the fix all 600 customers were charged exactly once.

You probably know how many jobs sit in your queue right now. Which one is failing, at which step, and how to stop it safely are harder questions, and v9 is built around them:

- **See which step failed.** The new job history Chart draws every attempt of a job on a timeline, down to the individual steps of a durable job.
- **Find the job behind a slowdown.** Job Analytics in JobRunr Pro shows volume, retries and processing time per job type, server and exception.
- **Stop a run without losing work.** JobRunr Pro can now pause a batch job halfway and resume it later.
- **Start jobs within milliseconds.** On Postgres, JobRunr Pro now does this with zero configuration and without UDP multicast.

The Chart is part of the free version. JobRunr 9 also ships on the same day as Quarkus 3.40 LTS and supports it from day one, and Micronaut 5, Kotlin Exposed v1 and a faster Pro dashboard are in too. To upgrade from JobRunr `v8.x`, follow the [JobRunr v9 migration guide]({{< ref "guides/migration/v9.md" >}}) and **review the breaking changes** further down. Most applications only need the version bump. The one thing to plan for is the first start of JobRunr Pro on a very large jobs table, because it builds new indexes.

## The Example: One Broken Invoice Run

Our demo application sends the monthly invoices for 600 customers. Every invoice is a [durable job]({{< ref "guides/advanced/durable-executions.md" >}}), which is a job that remembers which of its steps already finished. You get that by wrapping each step in `runStepOnce`, an API we introduced during v8. When the job is retried, a step that completed is not executed again.

```java
@Job(name = "Invoice %1 for %0", retries = 5)
public void generateInvoice(String customerId, String period, JobContext jobContext) throws Exception {
    String invoiceId = "INV-" + period + "-" + customerId;

    long usage = jobContext.runStepOnce("calculate-usage", () -> calculateUsage(customerId, period));
    String pdf = jobContext.runStepOnce("generate-pdf", () -> generatePdf(invoiceId, usage));
    String chargeId = jobContext.runStepOnce("charge-card", () -> paymentProvider.charge(customerId, invoiceId));
    jobContext.runStepOnce("send-email", () -> sendInvoiceEmail(customerId, pdf, chargeId));
}
```

The payment provider in the demo has a switch that makes every charge time out after 2 seconds. Everything below ran on a developer laptop with Spring Boot 4, Java 26, 20 workers and the in-memory H2 database the example ships with. The single invoice and the batch run are separate runs on that setup. Only the Postgres half of the latency test further down ran against Postgres 17 in Docker. All numbers are measured, not estimated.

## JobRunr v9 Features

### See Which Step Failed With the Job History Chart

Open a job in the dashboard and the History section now has two modes. `Timeline` is the list of states you already know. `Chart` is new and draws the life of the job as a Gantt chart, with a row per state and a row per durable step.

To get a clean picture we first ran a single invoice, for customer `CUST-0042`, while the payment provider was down:

![](/blog/jobrunr-v9-job-history-chart.webp "The Chart mode for a durable job. The first attempt fails on charge-card, and the retry skips the two steps that had already finished.")

Read it from left to right. On the first attempt `calculate-usage` took 218 ms and `generate-pdf` a second. Then `charge-card` hit the timeout after 2 seconds and the attempt failed, which is the red bar. JobRunr scheduled retry 1 of 5, and in the meantime we switched the provider back on. On the retry the two hollow diamonds tell you that `calculate-usage` and `generate-pdf` were skipped. `charge-card` went through in 697 ms according to the step log, `send-email` took 290 ms, and the retry needed less than a second of processing in total. The customer got one PDF and one charge. The job log agrees, because on the retry its first line is `Step 'charge-card' started`.

What else you should know about the Chart:

- It works for every job, durable or not. For a plain job you see per attempt how long it was scheduled, how long it sat in the queue and how long it was processing. So you can see whether a job is slow or was just waiting for a worker.
- `Compact` and `Detailed` switch between a summary and every single state. `Compressed` and `Linear` decide whether long waiting periods are squeezed together.
- Step durations and step outcomes also show up in the classic Timeline.
- `runStepOnce` guarantees that a **completed** step never runs again. A step that is running at the moment your JVM dies can run again, so a side effect inside a step still deserves an [idempotent]({{< ref "blog/Idempotence-in-java-job-scheduling.md" >}}) call. The demo passes the invoice id to the payment provider as idempotency key.

The Chart is available in JobRunr OSS and JobRunr Pro, and there is nothing to configure.

### {{< badge version="professional" >}}JobRunr Pro{{< /badge >}} Find the Job Behind a Slowdown With Job Analytics

When Prometheus shows the queue slowing down, Job Analytics is where you look up which job causes it.

It lives on the home page of the JobRunr Pro dashboard. Our invoice run was over in less than four minutes, which is too short to draw a trend, so the screenshots in this section come from a test application that one of our developers had been running for a week. You pick a time period, here the last 7 days, and get six numbers. Each of them comes with a small sparkline and a comparison with the previous period:

![](/blog/jobrunr-v9-job-analytics-kpis.webp "The top of Job Analytics for the last 7 days: 2,125 jobs, a success ratio of 99.67% and 7 failed jobs.")

2,125 jobs ran that week and 7 of them failed. Seven is not a lot, but the arrow tells you it is 54% up on the previous period, and the average queue latency went up by the same amount. Those are the arrows you want to notice before your users do.

Below the numbers, the trend shows how many jobs succeeded and failed over the period, and the breakdown splits them by state, by server or by job signature:

![](/blog/jobrunr-v9-job-analytics-trend.webp "The job processing trend over a week, next to the processing breakdown per server.")

In the server view the outer ring shows succeeded against failed, and the inner ring shows how the work was spread over the servers. The three servers in the legend are three runs of the same application on one laptop.

The table at the bottom answers the question you came for:

![](/blog/jobrunr-v9-job-analytics-signatures.webp "Detailed analytics per job signature. All 7 failures come from one method.")

All 7 failures come from one method, `TestService.doWorkThatFails()`, which failed every time it ran. The other job ran 2,118 times without a single failure, at 4.48 seconds on average. Click a job signature and you get a page for that job alone, with processing time split into succeeded and failed attempts, the fastest and the slowest run one click away from the actual job, and a tab with the exceptions that were thrown, how often and when last.

Some practical notes:

- In our invoice run `Total jobs failed` stayed at 0 the whole time, because JobRunr only marks a job as failed once its retries are used up and ours never got that far. During an incident, watch the retry counter and the success ratio instead.
- You get averages plus the fastest and the slowest run. There are no percentiles, so keep your Micrometer metrics for p95 and p99.
- There is nothing to set up. Every background job server collects the numbers by default and stores them aggregated per period, not per job.
- Job Analytics replaces the realtime graph that used to sit on the dashboard home page.

### {{< badge version="professional" >}}JobRunr Pro{{< /badge >}} Pause and Resume a Batch Job Without Losing Work

With the provider down, 440 invoices were still lined up to call it. Until v9 you could let the run burn through its retries, or delete it and clean up by hand afterwards. Most teams end up writing their own kill switch and a cleanup script for this.

In JobRunr Pro v9 a [batch job]({{< ref "documentation/pro/batches.md" >}}) has a **Pause** button. We pressed it 15 seconds after the payment provider went down:

![](/blog/jobrunr-v9-batch-paused.webp "The paused invoice run. 160 invoices are done, the other 440 wait until someone presses Resume, and nothing is calling the broken provider.")

At that point 160 invoices were done. The invoices that were processing were allowed to finish their attempt. The 340 invoices that had not started yet and the 100 that were waiting for a retry moved to `Pending`, where they stay until you press Resume. A few seconds later the last running attempts were done and no job called the provider anymore. If you check the counters in the screenshot, `Pending` shows 441 because the batch job itself waits there too, and `Succeeded` shows 162 because the recurring job had run twice.

We fixed the provider and pressed **Resume** 1 minute and 41 seconds later. All 600 invoices succeeded, each of them exactly once, and 100 of them needed a second attempt. The whole run took 3 minutes and 27 seconds, the pause included.

The Chart of one of those 100 invoices shows the complete incident in one picture:

![](/blog/jobrunr-v9-job-history-chart-paused.webp "An invoice from the paused run. It fails on charge-card, waits out the pause, and finishes after the resume while skipping the two steps that were already done.")

Compact mode has no row for `Pending`, so most of the pause hides in the compressed gap that ends at +2m 15s.

The run itself is an ordinary batch with one child job per customer:

```java
public JobId startMonthlyInvoiceRun(String period, int customers) {
    return jobScheduler.startBatch(() -> createInvoiceJobs(period, customers));
}

@Job(name = "Monthly invoice run %0")
public void createInvoiceJobs(String period, int customers) {
    jobScheduler.enqueue(
            IntStream.rangeClosed(1, customers).mapToObj(i -> "CUST-%04d".formatted(i)),
            customerId -> generateInvoice(customerId, period, JobContext.Null));
}
```

Besides the buttons in the dashboard there is a REST API, with `POST /jobs/{batchJobId}/pause` and `POST /jobs/{batchJobId}/resume`, and you can pause from your own code. That is handy when your monitoring already knows the payment provider is down. Create a `BatchJobManager` once:

```java
@Bean
public BatchJobManager batchJobManager(StorageProvider storageProvider, EventTransport eventTransport) {
    return new BatchJobManager(storageProvider, eventTransport);
}
```

And use it wherever you need it:

```java
batchJobManager.pauseBatchJob(batchJobId);   // unstarted invoices wait, running ones finish
batchJobManager.resumeBatchJob(batchJobId);
```

Pausing has two limits. It does not interrupt child jobs that are already processing, and a batch job can only be paused once it has created all of its child jobs.

### {{< badge version="professional" >}}JobRunr Pro{{< /badge >}} Jobs Start Within Milliseconds on Postgres, With Nothing to Configure

Take another look at the first Chart. The long blue bar is the invoice for `CUST-0042` sitting in `Enqueued` for 10 seconds, on a server that had nothing else to do. It was waiting for the next poll.

JobRunr Pro has offered [instant job processing]({{< ref "documentation/pro/instant-job-processing.md" >}}) for a while through UDP multicast. That works well where multicast is allowed, but plenty of cloud networks and Kubernetes clusters block it, and several of you told us that your servers quietly fell back to polling. Our own laptop did exactly that in the run above, which used H2 and the default multicast transport.

For v9 we rebuilt this part as an **EventBus** with pluggable transports. UDP multicast is still there and PostgreSQL `LISTEN/NOTIFY` is new. If your `StorageProvider` runs on Postgres, JobRunr Pro picks it automatically. You do not need a bean, a property or a firewall ticket for your platform team, because the notification travels through the database you already have.

On Postgres a job now starts a few milliseconds after it is created, instead of somewhere in the next 15 seconds. We measured the time between `ENQUEUED` and `PROCESSING` for 20 empty jobs, enqueued 1.5 seconds apart on an idle server:

| Setup | Median | Max |
|---|---|---|
| Postgres with `LISTEN/NOTIFY`, zero configuration | 7 ms | 19 ms |
| Polling every 15 seconds, because multicast was not delivered | 7.7 s | 14.5 s |

In practice a user who clicks "Export" sees the export start right away. To be fair, if multicast worked on your network, v8 was just as fast. The gain is for everyone on Postgres where it did not.

Three notes for Postgres users. Every server keeps one extra connection open to listen on. Polling stays in place as a safety net, so a missed notification delays a job by at most one poll interval. And `LISTEN` needs a real session, so behind PgBouncer in transaction mode the listener needs a direct connection to Postgres.

If you want to choose the transport yourself, provide an `EventTransport`:

```java
@Bean
EventTransport eventTransport(DataSource dataSource) {
    return new PostgresEventTransport(dataSource);
}
```

The `jobrunr.multicast-group-address` property is gone. If you used it, configure a `MulticastEventTransport` instead. The [migration guide]({{< ref "guides/migration/v9.md#eventbus" >}}) shows how to register an `EventTransport` in every framework.

### And More!

- **Quarkus 3.40 LTS from day one.** JobRunr 9 comes out on the same day as Quarkus 3.40 LTS, and the JobRunr Quarkus extension supports the new LTS from the first hour.
- **Micronaut 5.** JobRunr and JobRunr Pro v9 require Micronaut 5, and support for Micronaut 4 has been removed. Nothing changes for Spring Boot and Quarkus users.
- **A restore-friendly stats view on MySQL and MariaDB.** The `jobrunr_jobs_stats` view is now created with `SQL SECURITY INVOKER`, so restoring a database dump into another environment no longer trips over the view.
- **A warning for large job arguments.** Large job arguments slow JobRunr down, so the dashboard and the server logs now warn you when a serialized job gets too big. The dashboard warns first, at a lower threshold. See our [best practices]({{< ref "documentation/background-methods/best-practices.md#make-job-arguments-small-and-simple" >}}) for how to keep them small.
- **Amazon DocumentDB on Micronaut.** The Micronaut integration now autoconfigures Amazon DocumentDB, like the other frameworks already did.
- {{< badge version="professional" >}}JobRunr Pro{{< /badge >}} **Custom views in the dashboard.** Save a filter as a custom view, similar to a bookmark, and for the first time show jobs of multiple states on one page.
- {{< badge version="professional" >}}JobRunr Pro{{< /badge >}} **Permanently delete deleted jobs from the dashboard.** Users with the `canDeleteJobs` access rule can now do this from the job page and from the Deleted overview.
- {{< badge version="professional" >}}JobRunr Pro{{< /badge >}} **A faster dashboard.** New indexes speed up the job pages on several databases.
- {{< badge version="professional" >}}JobRunr Pro{{< /badge >}} **Retention settings in one place.** The `DeleteFilter` is now a default filter and the retention properties moved from `jobrunr.background-job-server.*` to `jobrunr.jobs.*`. The old keys keep working until v10.
- {{< badge version="professional" >}}JobRunr Pro{{< /badge >}} **Kotlin Exposed v1.** The Exposed transaction plugin now requires Exposed v1.

## What Is Free and What Is Pro

| New in v9 | JobRunr OSS | JobRunr Pro |
|---|---|---|
| See every attempt and every durable step in the job history Chart | ✅ | ✅ |
| Micronaut 5 support | ✅ | ✅ |
| MySQL and MariaDB stats view fix | ✅ | ✅ |
| Find the job behind a slowdown with Job Analytics | | ✅ |
| Pause a failing batch run and resume it later | | ✅ |
| Jobs start within milliseconds on Postgres, no network changes | | ✅ |
| Faster dashboard on large job tables | | ✅ |
| Custom views in the dashboard | | ✅ |

---

## Upgrading to JobRunr v9

The [JobRunr v9 migration guide]({{< ref "guides/migration/v9.md" >}}) walks you through every change, with examples for the Fluent API, Spring Boot, Quarkus and Micronaut.

You have some work to do if you are on Micronaut 4, if you configured a custom multicast address in JobRunr Pro, if you use the Kotlin Exposed transaction plugin, if you still call an API that we deprecated in v8, or if you extend JobRunr Pro internals such as the `SmartQueue` or the job states. Everybody else changes the version to `9.0.0`. JobRunr Pro users find the release in our private Maven repository.

> [!WARNING]
> JobRunr v9 is the last open source version that supports Java 8. If you need Java 8 on later versions, that is available in JobRunr Pro.

{{< codetabs category="dependency" >}}
{{< codetab label="Maven" >}}
```xml
<dependency>
    <groupId>org.jobrunr</groupId>
    <artifactId>jobrunr</artifactId>
    <version>9.0.0</version>
</dependency>
```
{{</ codetab >}}
{{< codetab label="Gradle" >}}
```groovy
implementation 'org.jobrunr:jobrunr:9.0.0'
```
{{</ codetab >}}
{{</ codetabs >}}

### Breaking Changes

The most common ones are below. The [v9 migration guide: Breaking Changes]({{< ref "guides/migration/v9.md#breaking-changes" >}}) has the complete list and how to deal with each change.

- The APIs that were deprecated in v8 have been removed. Use `JobRunrConfiguration#useMetrics` instead of `useMicroMeter`, and `JobBuilder#withJobLambda` and `RecurringJobBuilder#withJobLambda` instead of `withDetails`.
- {{< badge version="professional" >}}JobRunr Pro{{< /badge >}} The Pro APIs deprecated in v8 are gone too. Use `withPriorityQueue` instead of `withQueue` on the `JobSearchRequestBuilder` and `RecurringJobSearchRequestBuilder`, and `JobServerFilter#getProgressAsRatio` instead of `getProgress`.
- Micronaut 4 is no longer supported. Upgrade your application to Micronaut 5 before you move to JobRunr v9.
- The JobRunr test fixtures now require JDK 17 or higher.
- {{< badge version="professional" >}}JobRunr Pro{{< /badge >}} The property `jobrunr.multicast-group-address` and the method `useMulticastAddress` are gone. Configure an `EventTransport` instead, or nothing at all when you run on Postgres.
- {{< badge version="professional" >}}JobRunr Pro{{< /badge >}} Several constructors now accept an `EventTransport` or an `EventBus`. This only matters when you create a `BackgroundJobServer`, `JobScheduler`, `JobRequestScheduler` or `JobRunrDashboardWebServer` by hand.
- {{< badge version="professional" >}}JobRunr Pro{{< /badge >}} Kotlin Exposed needs to be on v1.
- {{< badge version="professional" >}}JobRunr Pro{{< /badge >}} `SmartQueue` is renamed to `JobPrefetchQueue`, and `ConcurrentJobModificationPolicy` is removed without a replacement.- {{< badge version="enterprise" >}}JobRunr Pro{{< /badge >}} Upgrade the Multi-Cluster Dashboard together with your clusters, unless they already run 8.7 or higher.

JobRunr Pro users, the new dashboard indexes are created by database migrations the first time v9 starts. As with 8.8.0, that takes time and I/O on a very large jobs table, so plan the first boot of a busy production cluster accordingly.

## Try It on Your Own Jobs

In our run we paused the batch 15 seconds after the payment provider went down, the last running attempts failed a few seconds later, and all 600 customers were still charged exactly once.

Upgrade to v9, open the job that worries you most and switch its history to `Chart`. It is free, and we would love to hear what you find via [GitHub Discussions](https://github.com/jobrunr/jobrunr/discussions). The invoice run from this post is in the [example-java-mag](https://github.com/jobrunr/example-java-mag) repository, with a script that replays the whole incident.

Job Analytics, pausing a batch and instant processing on Postgres need JobRunr Pro. Ask for a trial license and rehearse this incident in a test environment with one of your own batch runs.

{{< trial-button >}}

Thanks to all our contributors, and thanks to you for trying out the new version.

Full changelog available here:
👉 [GitHub Release Notes 9.0.0](https://github.com/jobrunr/jobrunr/releases/tag/v9.0.0)
