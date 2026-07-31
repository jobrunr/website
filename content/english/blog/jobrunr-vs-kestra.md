---
title: "JobRunr vs. Kestra: Orchestration Platform or Java Job Scheduler?"
description: "We built the same order workflow in Kestra and JobRunr, ran 1000 of them through each, and counted every CPU-second and database transaction. An honest comparison of two tools that are not in the same category."
keywords: ["jobrunr vs kestra", "kestra vs jobrunr", "kestra alternative", "kestra alternative java", "kestra java", "java workflow orchestration", "java job scheduler", "kestra benchmark"]
images:
  - /blog/jobrunr-vs-kestra.webp
image: /blog/jobrunr-vs-kestra.webp
date: 2026-07-30T10:00:00+02:00
author: "Nicholas D'hondt"
draft: true
tags:
  - blog
  - job scheduling
  - workflow orchestration
  - kestra
---

Search for a way to run scheduled or background work and you will be handed two very different kinds of answer. One is **Kestra**, a declarative orchestration platform where you describe workflows in YAML and a server coordinates them across your systems. The other is **JobRunr**, a Java library that turns any method into a persistent background job on the database you already run. Both retry your work, survive a crash, and give you a dashboard, which is exactly why they end up on the same shortlist.

They are not competing for the same job. Rather than argue that from a feature table, we implemented the same three-step order workflow in both, pushed 1000 orders through each with identical simulated work, and instrumented PostgreSQL on both sides. The project, the harness, and every raw measurement are [on GitHub](https://github.com/iNicholasBE/kestra-vs-jobrunr-benchmark) so you can rerun all of it.

> **Short answer:** Kestra is an orchestration platform. You deploy it next to your systems, describe flows in YAML, and its plugins move data and commands between services written in any language. JobRunr is a Java library. You add a dependency, point it at your existing database, and your background jobs are plain Java methods with persistence, retries, and checkpointed steps.
><br/>
><br/>
> If the work spans systems and languages, or the people writing the workflows do not live in your codebase, Kestra earns its keep. If the work is a sequence of steps inside one JVM application, JobRunr does the same job for a fraction of the CPU, memory, and database load. Neither one makes your code safe to retry: both execute side effects at-least-once, so the [idempotency]({{<ref "blog/Idempotence-in-java-job-scheduling.md">}}) homework is yours either way.

## At a glance

| | Kestra | JobRunr |
| :--- | :--- | :--- |
| **What it is** | Orchestration platform | Java library |
| **What you deploy** | A server plus its own database | Nothing new |
| **Workflows defined in** | YAML, edited in a UI or in Git | Java methods |
| **Who usually writes them** | Developers, data engineers, ops | The developers who own the service |
| **Steps in Python, shell, other languages** | Yes, first-class | No, JVM only |
| **Triggers from Kafka, S3, webhooks** | Built in, declared in YAML | You wire the listener or endpoint, then enqueue |
| **Skips completed steps on retry** | Yes | Yes, through `runStepOnce` |
| **Side-effect guarantee** | At-least-once | At-least-once |
| **Where state lives** | Its own PostgreSQL, which is also its message queue | The database you already have |
| **Our measured cost, 1000 orders** | 58.6 CPU-seconds, ~1 GB, 46,345 DB commits | 4.0 CPU-seconds, ~300 MB, 1,186 DB commits |
| **Recovery after a hard crash** | ~370 s by default, tunable | ~31 s |
| **License** | Apache 2.0 core, paid Enterprise tier | LGPL 3.0 core, paid [Pro tier](/en/pricing/) |

Everything below is where those numbers come from, and where each tool genuinely wins.

## What is Kestra?

[Kestra](https://github.com/kestra-io/kestra) is an open-source orchestration platform, Apache 2.0 licensed at its core, built on the idea that a workflow should be **described rather than coded**. You write a flow in YAML and Kestra's plugins do the work: pull from S3, run a Python script, load into Snowflake, post to Slack. Their plugin page currently advertises [1,800+ plugins](https://kestra.io/plugins).

That model comes with a platform to run it. A Kestra deployment is a set of independently scalable components (Webserver, Scheduler, Executor, Worker, and an Indexer used with the Kafka backend) coordinating through a shared backend ([architecture docs](https://kestra.io/docs/architecture/server-components)). In the open-source edition that backend is JDBC, which means your PostgreSQL is not only the state store, it is also the queue the components talk through. Kafka and Elasticsearch are [Enterprise-only](https://kestra.io/docs/architecture/deployment-architecture).

Here is what that looks like in practice. This is Kestra's Executions view after the benchmark has pushed a batch of orders through:

![Kestra Executions view listing order_fulfillment executions with duration, namespace, flow and SUCCESS state, above a chart of executions per date](/blog/kestra-ui-executions.webp "Kestra's Executions view. Every run of every flow, filterable, with a duration chart on top. This is the orchestration tier's own control plane.")

And here is the order workflow from our benchmark as a Kestra flow:

```yaml
id: order_fulfillment
namespace: orders

inputs:
  - id: orderId
    type: STRING

tasks:
  - id: charge-payment
    type: dev.example.orders.plugin.SimulatedCall
    step: charge-payment
    orderId: "{{ inputs.orderId }}"
    idempotencyKey: "{{ execution.id }}"
    retry:
      type: constant
      interval: PT1S
      maxAttempt: 5

  # reserve-inventory and send-confirmation repeat the same shape
```

Readable, declarative, and completely language-agnostic. Look at the task type though. `dev.example.orders.plugin.SimulatedCall` is a plugin we wrote ourselves in Java for this benchmark, because the steps in this workflow are ordinary Java method calls rather than an S3 copy or a Snowflake query. Every task needs something on the other side of it, and when your steps are your own code, that something is a Java class you build, package, and drop into the server:

```java
@SuperBuilder @Getter @NoArgsConstructor
public class SimulatedCall extends Task implements RunnableTask<VoidOutput> {
    private Property<String> step;
    private Property<String> orderId;
    private Property<String> idempotencyKey;

    @Override
    public VoidOutput run(RunContext runContext) throws Exception {
        String step = runContext.render(this.step).as(String.class).orElseThrow();
        // ... dispatch to the payment, inventory or mail service
    }
}
```

That seam is where the two categories part. If your steps were HTTP calls, Python scripts, or database loads, that plugin would not exist and the YAML would be the whole story. That is Kestra at its best, and it is worth being clear about before we count anything.

## Should you use Kestra?

**Choose Kestra when the coordination reaches beyond your application.** That is what a platform is for, and Kestra is good at it. Choose it when:

* **Your steps are not JVM code.** Kestra runs Python, R, Node.js, and shell as first-class tasks. JobRunr cannot do this at all, and if half your pipeline is a Python model and a `dbt` run, that is the end of the discussion.
* **The workflow is mostly moving data between systems.** With a catalog that size, the S3-to-Snowflake-to-Slack pipeline is configuration rather than code you write, test, and maintain.
* **You want event sources to be configuration rather than code.** Kestra ships Schedule, Webhook, and Flow triggers, plus plugin-provided polling and realtime triggers for the likes of Kafka, SQS, and S3 ([trigger docs](https://kestra.io/docs/workflow-components/triggers)), so a new event source is a YAML block. JobRunr has no such catalog, though this is the weakest of these bullets: a `@KafkaListener` or a REST endpoint that calls `enqueue` is a few lines of ordinary Spring or Quarkus code, and plenty of teams prefer their event handling to live in the same codebase as everything else. The real question is whether you want that wiring declared in a flow or written in your service.
* **The people writing workflows do not live in your codebase.** A data engineer or an ops colleague can author, edit, and replay a YAML flow in Kestra's UI without touching your Java build or waiting for your release train.
* **You want an orchestration tier that outlives any one application.** Namespaces, subflows, and a full execution UI give you a coordination layer that is deliberately independent of the services it drives.
* **You are prepared to operate it.** A server plus its own database, upgraded on their release cadence, with the JDBC-to-Kafka move waiting if you outgrow the open-source backend.

If that describes your system, the rest of this article is a cost you are choosing to pay for capability you need, and you should go use Kestra. If it does not, keep reading, because the bill is larger than most people expect.

## What is JobRunr?

[JobRunr](https://github.com/jobrunr/jobrunr) starts from the opposite end. It is a library rather than a platform: one dependency, pointed at the SQL or NoSQL database your application already uses, and any Java method or lambda becomes a persistent background job. Jobs are serialized to the database, workers across all your app instances poll for them, failures retry with exponential back-off, and a built-in dashboard shows every job in real time.

![JobRunr dashboard showing 200 succeeded jobs named Fulfill order, with counts for pending, scheduled, enqueued, processing, succeeded and failed](/blog/jobrunr-dashboard-jobs.webp "JobRunr's built-in dashboard, served from inside your application. Same jobs, no extra service: the counts down the left are the job states, and each row is one order.")

<figure>
{{< svg "assets/blog/kestra-vs-jobrunr-architecture.svg" >}}
<figcaption>What each tool adds to your architecture. Kestra brings its own server and its own database, and your application talks to it over the network. JobRunr runs inside the application and database you already have.</figcaption>
</figure>

For multi-step work, JobRunr v8 added [durable executions]({{<ref "guides/advanced/durable-executions.md">}}) through `JobContext.runStepOnce`, in the free open-source version. You name each step, JobRunr checkpoints it in the job's own database row, and a retry skips every step that already completed:

```java
public class OrderFulfillmentJob {

    @Job(name = "Fulfill order %0", retries = 5)
    public void fulfillOrder(String orderId, JobContext jobContext) {
        jobContext.runStepOnce("charge-payment", () ->
                paymentService.charge(orderId, jobContext.getJobId().toString()));
        jobContext.runStepOnce("reserve-inventory", () -> inventoryService.reserve(orderId));
        jobContext.runStepOnce("send-confirmation", () -> mailService.sendConfirmation(orderId));
    }
}
```

One class, twelve lines, plain Java, with no YAML to keep in sync with the code it calls and no server to deploy. The second argument to `charge` matters: the job id is stable across every retry and recovery, which makes it a ready-made [idempotency]({{<ref "blog/Idempotence-in-java-job-scheduling.md">}}) key for your payment provider. Kestra's `{{ execution.id }}` plays exactly the same role, and both tools need you to use it.

Side by side, that is the whole code and footprint comparison:

| | JobRunr | Kestra |
| :--- | ---: | ---: |
| The workflow definition | **12 lines of Java** | 26 lines of YAML plus a 47-line Java plugin |
| The simulated services both call | 51 lines | the same 51 lines |
| Extra infrastructure to operate | none | a server and its own PostgreSQL |
| Container image to pull | none | 230 MB for the slim variant, 3.2 GB for the default image |

## Should you use JobRunr?

**Choose JobRunr when the work lives inside your Java application.** Most background work does: a handful of dependent steps that must survive a crash, plus all the ordinary scheduled and fire-and-forget tasks around them. Choose it when:

* You need **background jobs, not only workflows**. Fire-and-forget tasks, delayed jobs, and recurring cron jobs are one-liners with the same persistence, retries, and monitoring.
* Your steps are **your own Java code**, calling your own services, sharing your own transactions and domain objects.
* You want **zero extra services to operate**. If your app and your database are up, your jobs run.
* You want **the workflow and the code it calls to be one artifact**, refactored together, reviewed together, and tested with plain JUnit.
* You need **volume on a budget**, which the numbers below make concrete.

JobRunr is the wrong choice when any of the Kestra bullets above are hard requirements. It will not run your Python step, it ships no event-source connectors (you write the listener and call `enqueue` yourself), and it will never offer a UI where a non-developer authors a new workflow. Those are not oversights, they are what you give up by being a library instead of a platform.

One more honest concession while we are here, because it is the thing developers actually shop on. Kestra's execution UI is richer than JobRunr's dashboard, and the two detail views make the difference obvious.

![Kestra Gantt view of one order_fulfillment execution showing charge-payment, reserve-inventory and send-confirmation as timed bars across 0.45 seconds](/blog/kestra-ui-gantt.webp "Kestra, one execution: a Gantt of the three tasks with per-task timings, plus tabs for logs, topology, outputs and metrics. Replay from any task is one click.")

![JobRunr dashboard detail for one job titled Fulfill order order-199, showing the invocation code and a history of Job Enqueued, Job Processing and Job Processing Succeeded](/blog/jobrunr-dashboard-job-detail.webp "JobRunr, one job: the exact method invocation that will run, the state history, and a requeue button. Enough to debug a failure, without the per-task timeline.")

If a deep visual audit trail of every run is part of what you are buying, Kestra gives you more of it. If you mainly need to know which job failed, why, and how to retry it, the dashboard covers that and costs you nothing to run.

## 1000 orders, measured on both

We ran both implementations through an identical harness: 1000 orders, 24 concurrent execution slots on each side, two scenarios (instant steps to isolate orchestration overhead, then 25 ms of simulated API latency per step), on a 14-core Apple Silicon Mac. Versions: JobRunr OSS 8.7.1 and Kestra OSS 1.3.30, each on its own PostgreSQL 16 container with default settings. One machine, one round per configuration, and every raw measurement is in the repo.

Wherever the harness forced a choice, we made it in Kestra's favor:

* **Its tasks run in-process.** Kestra's default runner for script tasks is Docker, one container per task run, and the open-source alternative forks a process ([task runner docs](https://kestra.io/docs/task-runners/types)). Either would have charged Kestra thousands of container or JVM startups that have nothing to do with orchestration, so we wrote that custom plugin instead and its tasks run inside the Kestra worker JVM, exactly as JobRunr's steps run inside the application JVM. **The Kestra numbers below are an upper bound on its performance, not a typical one.**
* **We measured all three fan-out patterns and published Kestra's fastest.** "Nobody starts 1000 executions with 1000 API calls" is the obvious objection, so we built the alternatives too. The table below is the answer, and the REST path we used for the headline numbers is the quickest of the three.
* **JobRunr was not tuned, and one setting handicaps it here.** It polls for work every 5 seconds, which is the smallest interval it allows, against Kestra's 25 ms default. JobRunr looks for work 200 times less often by design, to keep load off your database.

Because that last point is the one people ask about most, here it is in full. Same 1000 orders, same plugin, same simulated work, three ways of fanning them out:

| Kestra fan-out pattern (instant steps) | Wall-clock | CPU |
| :--- | ---: | ---: |
| **1000 executions started over REST** (what we publish) | **6.99 s** | **58.6 cpu-s** |
| One execution per order via `ForEachItem` + subflow | 14.07 s | 72.3 cpu-s |
| One execution fanning out with `ForEach` | 430 s | 1005 cpu-s |

`ForEachItem` is the pattern Kestra's own best-practices page recommends for large item counts, and it is roughly **twice as slow** as simply starting the executions over the API, because every order becomes its own subflow execution plus the parent's per-batch bookkeeping. `ForEach` inside a single execution is 60 times slower again, and that is documented rather than a gotcha: their page warns it "can generate many task runs in a single execution" and to "prefer `ForEachItem` or a `Subflow`-based design" for large fan-out ([best practices](https://kestra.io/docs/best-practices/foreach-and-foreachitem)). With 25 ms per step the ordering holds: 7.00 s for REST against 12.45 s for `ForEachItem`.

One honest limit on that: we ran `ForEachItem` with `batch: rows: 1`, one order per subflow, to keep the per-order retry granularity identical to the other two patterns. Larger batches would amortise the per-execution cost, at the price of a retry replaying a whole batch rather than one order. We did not test that trade.

Two caveats cut the other way and are worth stating with numbers rather than hand-waving. All Kestra components ran in one `server standalone` JVM on the same host as the workload, which is the best case for latency and the worst for CPU contention. And the submission paths are not equivalent: JobRunr enqueues in-process with one batched call, while Kestra received 1000 authenticated HTTP POSTs, which its access log shows accounted for 26.1 seconds of summed server-side handling time. Concurrency makes the true CPU share of that much smaller than the sum suggests, but it is not nothing, and it sits inside Kestra's total. The [full fairness notes](https://github.com/iNicholasBE/kestra-vs-jobrunr-benchmark/blob/main/results/RESULTS.md) list every one of these.

| 1000 orders, 24 concurrent slots | JobRunr OSS | Kestra OSS |
| :--- | ---: | ---: |
| **Instant steps**, wall-clock | **1.44 s** | 6.99 s |
| **25 ms per step**, wall-clock | 8.73 s | **7.00 s** |
| **CPU, everything included** (instant steps) | **4.0 cpu-s** | 58.6 cpu-s |
| **CPU, everything included** (25 ms per step) | **6.6 cpu-s** | 61.0 cpu-s |
| **Peak memory, whole stack** (app, engine, database) | 304-370 MB | 991-1048 MB |

<small>cpu-s means CPU-seconds: total processor time across every process involved, databases included. These come from cumulative counters rather than sampling, because a 1/s sampler cannot measure a 1.44 s run. Memory is the peak resident set excluding page cache, summed across the whole stack; Kestra's own container accounts for 768 to 978 MB of its total depending on the run. It is the weakest number here, because it comes from a 1/s sampler and a short run yields few samples. Measured instead from cgroup peaks, which include page cache, the gap widens in JobRunr's favour, so we published the conservative figure.</small>

**Kestra wins the second row, and it deserves the credit.** Both engines cap at 24 concurrent steps, but JobRunr ties a worker up for an order's whole 75 ms while Kestra refills its 24 threads from a pool of 3000 independent task runs. JobRunr's 5 second poll interval contributes too. If your mental model was that the lighter tool always wins on wall-clock, that row is the correction.

Now look at the CPU column, and at what happens when you try to move Kestra's wall-clock:

| Kestra configuration (25 ms per step) | Wall-clock | CPU |
| :--- | ---: | ---: |
| 24 worker threads, default poll settings | 7.00 s | 61.0 cpu-s |
| 128 worker threads | 6.74 s | 59.2 cpu-s |
| 256 worker threads | 6.57 s | 57.9 cpu-s |
| 128 threads, queue poll tuned down to 10 ms | 6.86 s | 60.6 cpu-s |

Ten times the threads buys about 6%, and tuning the queue poll down does nothing useful. Roughly 6.5 to 7 seconds per 1000 executions is the floor for the open-source JDBC backend in this configuration, and the CPU cost sits at about 60 CPU-seconds no matter which knob you turn. Kestra's own answer for scaling past this is the Kafka and Elasticsearch backend, which is Enterprise-only and which we did not measure.

JobRunr has no equivalent floor, because there is no engine between the jobs and the workers:

| JobRunr workers (25 ms per step) | Wall-clock | Throughput | CPU |
| :--- | ---: | ---: | ---: |
| 24 | 8.73 s | 115 orders/s | 6.6 cpu-s |
| 64 | 4.57 s | 219 orders/s | 6.0 cpu-s |
| 128 | **3.04 s** | **329 orders/s** | 5.5 cpu-s |

Note the last column: JobRunr gets nearly three times faster while spending *less* total CPU, because more of the wall-clock goes into waiting on the simulated API call rather than into coordination.

The flatness on Kestra's side is the real finding. It spent 58.6 CPU-seconds with instant steps and 61.0 with 75 ms of work per order, so adding real work changed its bill by 4%: almost none of that bill was ever your code. The cost does not stop when the work does, either. After a two minute warm-up, an idle Kestra stack with nothing running consumed 3.98 CPU-seconds per minute, about 6.6% of a core, continuously.

### Where the cost lives

We snapshotted `pg_stat_database` before and after the instant-steps run on both databases:

| Measured over 1000 orders | JobRunr | Kestra |
| :--- | ---: | ---: |
| **Database transactions committed** | **1,186** | **46,345** |
| Tuples inserted | 1,418 | 27,899 |
| Tuples updated | 2,016 | 47,148 |
| **Writes per order** | ~1.2 commits | ~46 commits |

A **39x difference in committed transactions** for identical work, and it is not a bug on Kestra's side. JobRunr writes about 1.4 inserts and 2 updates per job, nearly all of it to the same `jobrunr_jobs` row, with the `runStepOnce` checkpoints riding along on those saves and writes batched across jobs. Kestra's open-source backend uses PostgreSQL as its message queue as well as its state store, so every message between Webserver, Scheduler, Executor, and Worker is a durable row write, and each of the three task runs passes through that queue several times. After the run the `queues` table held 2,058 live rows next to the 1,000 `executions`.

Before anyone asks whether our own polling caused that: it did not. Both engines poll for completion every 250 ms, and Kestra's access log shows those checks account for 42 requests and 574 ms of server time, under 1% of its CPU. The load is in the queue, where Kestra's PostgreSQL alone burned 22.6 CPU-seconds against JobRunr's 0.62.

That queue is precisely what buys Kestra its independently scalable components and its complete execution history. It is a fair price for a distributed orchestrator, and a strange one for three method calls inside a single application.

### What that means on an invoice

For anyone sizing this rather than reading the Java: before a single flow runs, a Kestra open-source stack holds roughly a gigabyte of memory and a few percent of a core, and it needs its own PostgreSQL alongside your application's. In practice that is one always-on instance plus a managed database, per environment, so multiply it by development, staging, and production. Then add whoever owns the upgrades, and add the move to the Enterprise Kafka backend if you outgrow JDBC.

JobRunr's line on that same invoice is the extra load on a database you are already paying for, which our measurements put at about 1.2 additional commits per job, plus a [Pro license](/en/pricing/) if you want job chaining, batches, or External Jobs. The honest framing is not that one is free and the other is not. It is that one of them bills you for servers before it bills you for features.

## Neither tool gives you exactly-once

Here is the part that levels the field. Neither one gives you exactly-once side effects, and anyone who tells you otherwise is selling something. A process can always die after your code charged the card but before the engine recorded that it did, and no engine can close that window.

So we tested it on both, with a ledger row written for every step execution that actually ran: first an ordinary exception in the last step, then a hard kill fired immediately after the payment step succeeded but before the engine recorded it. One caveat on the Kestra side: because it ran in `server standalone` mode, that kill took the scheduler, executor, and webserver down with the worker, so this is a whole-node failure rather than a lost worker. A deployment with separate workers would keep the coordinator alive, though it would still wait out the same grace period below.

| | JobRunr | Kestra |
| :--- | :--- | :--- |
| Ordinary failure in the last step | Only that step re-ran. The two completed steps were skipped. | Only that task re-ran. Completed task runs were not repeated. |
| Hard crash after payment, before it was recorded | Payment **replayed**, with the same job id as key | Payment **replayed**, with the same execution id as key |
| Time until the stranded work was picked up | **~31 seconds** | **~370 seconds** |

Both are at-least-once, and Kestra says so itself: its liveness mechanism "resubmits pending jobs from a terminating worker to another worker, ensuring each job runs at least once" ([server lifecycle docs](https://kestra.io/docs/administrator-guide/server-lifecycle)).

One asymmetry is worth stating rather than glossing over, and it runs against JobRunr: JobRunr OSS checkpoints step state on its poll interval, so a hard crash can lose up to a poll interval of checkpoints and replay more than the single in-flight step. JobRunr Pro writes step state the moment a step completes, which closes most of that window.

The recovery gap is the other real difference, and the mechanism is visible in Kestra's own log. The worker is flagged as non-responding after about 67 seconds, but its in-flight task is only resubmitted once the termination grace period expires at around 310 seconds:

```
11:06:20 WARN  Detected non-responding service [type=WORKER] after timeout (67356ms).
11:11:30 WARN  Detected non-responding service [type=WORKER] after termination grace period (309989ms).
11:11:30 WARN  [task: charge-payment] Re-resubmitting WorkerTask.
```

That period is `kestra.server.terminationGracePeriod` and defaults to `5m`, so it is tunable. Five minutes is simply what an untouched install gives you, which is worth knowing before an incident rather than during one.

Either way the discipline is identical: give the step that moves money a stable [idempotency]({{<ref "blog/Idempotence-in-java-job-scheduling.md">}}) key and the replay becomes a harmless no-op. In our benchmark the payment provider deduplicated on that key, so the second charge did nothing.

## Where they overlap, and why "both" is a real answer

The honest picture is not a contest, it is a boundary. Kestra is strongest above your applications, coordinating systems, languages, and teams. JobRunr is strongest inside one of them, making a sequence of Java steps survive a crash without new infrastructure.

Plenty of teams need both, and they compose cleanly. A Kestra flow calls your Java service, and that service hands the work to JobRunr:

```yaml
  - id: kick-off-fulfillment
    type: io.kestra.plugin.core.http.Request
    uri: "https://orders.internal/api/fulfillment"
    method: POST
    body: "{{ inputs.orderBatch }}"
```

```java
@PostMapping("/api/fulfillment")
public ResponseEntity<Void> fulfill(@RequestBody List<String> orderIds) {
    jobScheduler.enqueue(orderIds.stream(),
            id -> orderFulfillmentJob.fulfillOrder(id, JobContext.Null));
    return ResponseEntity.accepted().build();
}
```

Your orchestration tier keeps the cross-system view, and your application keeps its background work where the code and the transactions already are.

If your workflows outgrow a single method on the JobRunr side, [JobRunr Pro](/en/pro) composes them out of jobs rather than adding a platform: [job chaining]({{<ref "documentation/pro/job-chaining.md">}}) sequences work, [batches]({{<ref "documentation/pro/batches.md">}}) fan out thousands of child jobs and continue when all succeed, and [External Jobs]({{<ref "guides/advanced/external-jobs.md">}}) park a workflow for days waiting on an outside system or a human approval, as a database row that consumes no worker threads.

## Common questions

### Is Kestra a job scheduler?

It schedules, but it is really a workflow orchestrator. Scheduling is one of its trigger types alongside webhooks and event triggers, and its center of gravity is coordinating steps across systems rather than running background work inside one application.

### Can Kestra run Java code?

Yes, in two ways: shell out to a JVM from a script task, or write a custom plugin in Java as we did for this benchmark. Neither gives you the thing a Java library gives you, which is calling your own services in your own process with your own transactions.

### Is Kestra free?

The core is open source under Apache 2.0. The Kafka and Elasticsearch backend, worker groups, RBAC, and multi-tenancy are Enterprise features, and the JDBC backend is what you get for free.

### What is a good Kestra alternative for a Java team?

If your steps are Java and the orchestration does not leave your application, a background job library is the lighter answer, and JobRunr is the one we build. If your steps genuinely span languages and systems, the honest Kestra alternative is another orchestrator such as Airflow, Dagster, or Temporal, not a job scheduler.

### Can I use Kestra and JobRunr together?

Yes, and it is a sensible pattern. Kestra orchestrates across services, each service uses JobRunr for its own durable background work.

### How does this compare to Temporal?

Different axis. Temporal is a durable execution engine for long-lived, deeply branching workflows in code, which we measured separately in [JobRunr vs. Temporal]({{<ref "blog/jobrunr-vs-temporal.md">}}). Kestra is declarative and connector-first. We also compared [Spring Batch]({{<ref "blog/spring-batch-vs-jobrunr.md">}}) if your work is bulk data processing.

## Picking one

<figure>
{{< svg "assets/blog/kestra-vs-jobrunr-decision-tree.svg" >}}
<figcaption>Three questions decide it, and none of them is about speed: whether the work leaves your application, leaves the JVM, or leaves your team.</figcaption>
</figure>

Choose **Kestra** when the orchestration reaches beyond your application: steps in languages other than Java, pipelines assembled from connectors rather than written, event sources you would rather declare than wire up, and workflows authored by people who do not build your service. It is a platform you adopt, so budget for the server, the database behind it, and the operational work that comes with both.

Choose **JobRunr** when the steps are your own Java code. You get the same durability property, the same skip-completed-steps-on-retry behavior, and the same at-least-once reality, in twelve lines instead of a YAML file plus a plugin, with no second system to run. On the measurements above that is about a tenth of the CPU, a third of the memory, and 39 times fewer database writes, with recovery in seconds rather than the five minute default you would want to tune.

And whichever you pick, put an [idempotency]({{<ref "blog/Idempotence-in-java-job-scheduling.md">}}) key on the steps that move money or send email, because both of these tools will hand you a step twice eventually.

Want to see the lighter route for yourself? [Get started with JobRunr]({{<ref "documentation/_index.md">}}) in five minutes and wrap your next multi-step job in `runStepOnce`, or [request a free JobRunr Pro trial](/en/try-jobrunr-pro/) for job chaining, batches, and External Jobs on top.
