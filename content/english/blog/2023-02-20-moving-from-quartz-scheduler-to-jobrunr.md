---
title: "How to move from Quartz to JobRunr"
description: "We migrated a real open-source Spring Boot app from Quartz Scheduler to JobRunr. The mapping table, before and after code, the cron and time zone gotchas we hit, and how we verified every job."
keywords: ["migrate from quartz to jobrunr", "quartz scheduler alternative", "java quartz alternative", "jobrunr vs quartz", "quartz to jobrunr migration", "replace quartz spring boot", "quartz cron expression"]
images:
  - /blog/quartz-to-jobrunr.webp
image: /blog/quartz-to-jobrunr.webp
date: 2026-11-16T09:00:00+01:00
lastmod: 2026-11-16T09:00:00+01:00
sort_by_lastmod: true
author: "Ronald Dehuysser"
tags:
  - blog
  - quartz
  - migration
---
> **TL;DR** We took a real open-source Spring Boot application with five Quartz jobs and moved it to JobRunr 9.0.3. Quartz is gone from the dependency tree, all tests are green, and every job fires on the same schedule as before, now stored in Postgres, with a dashboard and retries. 

Still deciding whether to move at all? Read our [Quartz vs. JobRunr benchmark on Postgres]({{< ref "blog/quartz-vs-jobrunr.md" >}}) and the comparison of [modern Quartz Scheduler alternatives in Java]({{< ref "blog/2024-10-31-task-schedulers-java-modern-alternatives-to-quartz.md" >}}). 

This post is for when you have decided and want to know what the migration looks like in a codebase that was not written for a blog. We'll walk through the code before and after, the mapping table we used, and the four gotchas that would have bitten us in production if we had not run the app and looked.

## Why move from Quartz Scheduler to JobRunr?

Quartz has been the default Java scheduler for two decades and it still works. JobRunr, also [open source on GitHub](https://github.com/jobrunr/jobrunr), takes a different approach that shows up in day-to-day code:

- **A job is a method call.** Any public method on any class or bean becomes a background job through a lambda (`jobScheduler.enqueue(() -> service.process(id))`), or through a `JobRequest` and `JobRequestHandler` if you prefer the command pattern. No `Job` interface, no `JobDetail`, no `Trigger`, no `JobDataMap` lookups by string key. 
- **Your database is the store.** JobRunr uses the database you already run, [SQL or NoSQL]({{< ref "documentation/storage/_index.md" >}}): PostgreSQL, MySQL, MariaDB, Oracle, SQL Server, DB2, H2, SQLite, CockroachDB, MongoDB or Amazon DocumentDB. It creates its own tables; there is no `QRTZ_*` schema to maintain.
- **Distributed by default.** Every instance that runs a background job server takes work from the same store. Adding capacity means starting another instance, without changing code.
- **A [built-in dashboard]({{< ref "documentation/background-methods/dashboard.md" >}}).** Every recurring, scheduled, enqueued, running, succeeded and failed job, with the exact method call, its arguments, its history and the stack trace when it failed.
- **Retries out of the box.** A job that throws is [retried up to 10 times]({{< ref "documentation/background-methods/dealing-with-exceptions.md" >}}) with exponential back-off, configurable per job. Durable jobs with `runStepOnce` make sure a completed step is not repeated on the retry.
- **Extensible.** [Job filters]({{< ref "documentation/pro/job-filters.md" >}}) hook into every state change of a job.
- **Actively developed.** JobRunr ships [regular releases](https://github.com/jobrunr/jobrunr/releases), has a [community that answers questions](https://github.com/jobrunr/jobrunr/discussions), and integrates with Spring Boot, Quarkus and Micronaut.

## The app we migrated

The project is [github-scheduled-reminder-app](https://github.com/bbaga/github-scheduled-reminder-app) by [bbaga](https://github.com/bbaga), MIT licensed. It is a GitHub App that reads a `.demo-bot.yaml` from each repository it is installed on and posts reminders about open issues and pull requests to Slack on a schedule the repository owner chooses. Spring Boot 3.5, Java 21, Maven, 74 tests, actively maintained until 2025. Thanks to bbaga for publishing it under a license that lets us do this.

It uses Quartz the way most real applications do: a bit of everything, grown over time.

<div class="table-wrap">

| Quartz job | When it runs | Job data |
|---|---|---|
| `GitHubInstallationScan` | Every 12 hours and once at startup (`SimpleTriggerFactoryBean`, interval in ms) | none |
| `GitHubInstallationRepositoryScan` | On demand, one durable `JobDetail` per installation, fired from the scan and from a webhook | `installationId` |
| `ScheduledNotification` | One `CronTrigger` per notification, cron and time zone **written by the user** in YAML | the `JobKey` name |
| `ScheduledStateDump` | Every hour (`SimpleTrigger`) | none |
| `SlackChannelMessageDelete` | Every minute (`SimpleTrigger`) | in-memory queues |

</div>

All of them except `ScheduledNotification` carry `@DisallowConcurrentExecution`.

The Quartz store is the default `RAMJobStore`: no persistence, no clustering, no UI.

## Step 0: prove the original works first

Before touching a line, we ran the original against a small fake GitHub API and recorded every job that fired, so we had a baseline to verify the migration against. That paid off right away: the app was broken at `main` (a Dependabot bump to `jjwt` 0.12 crashed every installation scan while the tests stayed green), so we pinned `jjwt` back to 0.11.5 before migrating anything.

## Step 1: swap the dependency

Remove `spring-boot-starter-quartz` (or `org.quartz-scheduler:quartz`) and add the JobRunr starter. On Spring Boot 4:

{{< codeblock >}}

```xml
<!-- After (JobRunr): the JobRunr starter replaces spring-boot-starter-quartz in pom.xml -->
<dependency>
    <groupId>org.jobrunr</groupId>
    <artifactId>jobrunr-spring-boot-4-starter</artifactId>
    <version>9.0.3</version>
</dependency>
```
{{</ codeblock >}}

This app is on Spring Boot 3.5, so it got `jobrunr-spring-boot-3-starter` 9.0.3. Do not mix a Spring Boot upgrade into the scheduler migration: one change at a time is what makes the before and after comparable. For Gradle it is `implementation 'org.jobrunr:jobrunr-spring-boot-4-starter:9.0.3'`.

JobRunr stores jobs in a database you already have. The [Spring Boot starter]({{< ref "documentation/configuration/spring/_index.md" >}}) picks up the existing `DataSource`; this app had none, so we added `spring-boot-starter-jdbc` with H2 as a zero-setup default and the Postgres driver for production, then switched on job processing and the dashboard:

{{< codeblock >}}

```yaml
# After (JobRunr): application.yml, a datasource plus job processing and the dashboard
spring:
  datasource:
    url: ${DATABASE_URL:jdbc:h2:file:./data/reminder-jobs}
    username: ${DATABASE_USERNAME:sa}
    password: ${DATABASE_PASSWORD:}

jobrunr:
  background-job-server:
    enabled: true
  dashboard:
    enabled: true
```
{{</ codeblock >}}

JobRunr creates its own tables on startup (five `jobrunr_*` tables on Postgres). We also added `org.quartz-scheduler` to the `maven-enforcer-plugin` banned dependencies, so Quartz cannot sneak back in transitively.

## The mapping table

Every row below was checked against the [JobRunr documentation]({{< ref "documentation/_index.md" >}}) and, for the edge cases, against the JobRunr 9.0.3 source.

<div class="table-wrap">

| Quartz | JobRunr | Watch out for |
|---|---|---|
| `Job` / `QuartzJobBean` | a public method on any bean, or a `JobRequestHandler<T>` | |
| `JobDataMap` | typed method parameters, or fields on a `JobRequest` | pass ids, not entities |
| `scheduler.triggerJob(key, data)` | `jobScheduler.enqueue(...)` | |
| `newTrigger().startAt(date)` | `jobScheduler.schedule(instant, ...)` | |
| `cronSchedule(expr)` with `inTimeZone(tz)` | `scheduleRecurrently(id, cron, zoneId, ...)` or `@Recurring(cron = ..., zoneId = ...)` | Quartz cron is not Unix cron, see below |
| `withIntervalInHours(n)` with `repeatForever()` | `scheduleRecurrently(id, Duration, ...)` or `@Recurring(interval = "PT1H")` | first run is one interval later |
| `JobKey` to update a trigger | the recurring job id: same id means update | ids only allow `A-Z a-z 0-9 - _ ( ) , .` |
| `scheduler.deleteJob(key)` | `jobScheduler.deleteRecurringJob(id)` | never recreate it under the same id (gotcha 4, OSS only) |
| `@DisallowConcurrentExecution` on a recurring job | default: a new run is skipped while the previous one is still scheduled, enqueued or processing | |
| `@DisallowConcurrentExecution` on one-off jobs | no OSS equivalent, [JobRunr Pro mutexes]({{< ref "documentation/pro/mutexes.md" >}}) | make the job [idempotent]({{< ref "blog/Idempotence-in-java-job-scheduling.md" >}}) or lock |
| `JobExecutionException`, swallowed exceptions | throw; JobRunr [retries]({{< ref "documentation/background-methods/dealing-with-exceptions.md" >}}) 10 times with exponential back-off, `@Job(retries = n)` per job | retries need idempotent jobs |
| `@PersistJobDataAfterExecution` | your own table, or job metadata and durable steps within one job's retries | |
| Misfire instructions | none in OSS: runs missed while every server was down are not caught up (JobRunr Pro can) | |
| JDBC JobStore, `isClustered=true` | any supported [storage provider]({{< ref "documentation/storage/_index.md" >}}); every node with the background job server enabled takes work | |
| `threadPool.threadCount` | `jobrunr.background-job-server.worker-count` | |
| no UI | [built-in dashboard]({{< ref "documentation/background-methods/dashboard.md" >}}) on port 8000 | |

</div>

## Interval jobs: `@Recurring` replaces the trigger beans

The state dump and the Slack cleanup were plain Quartz jobs with a `SimpleTrigger` built in a configuration class. The installation scan was wired with Spring's factory beans:

{{< codeblock >}}

```java
// Before (Quartz): a JobDetail bean and a trigger bean to run one method every N ms
@Bean
public JobDetailFactoryBean jobDetail() {
    JobDetailFactoryBean jobDetailFactory = new JobDetailFactoryBean();
    jobDetailFactory.setJobClass(GitHubInstallationScan.class);
    jobDetailFactory.setDescription("Invoke Sample Job service...");
    jobDetailFactory.setDurability(true);
    return jobDetailFactory;
}

@Bean
public SimpleTriggerFactoryBean trigger(JobDetail jobDetail) {
    SimpleTriggerFactoryBean trigger = new SimpleTriggerFactoryBean();
    trigger.setJobDetail(jobDetail);
    trigger.setRepeatInterval(Long.parseLong(installationScanIntervals));
    trigger.setRepeatCount(SimpleTrigger.REPEAT_INDEFINITELY);
    return trigger;
}
```
{{</ codeblock >}}

When the schedule is a constant, the job class stops implementing `org.quartz.Job` and the method gets an annotation:

{{< codeblock >}}

```java
// After (JobRunr): @Recurring on the method it runs, no beans
@Component
public class ScheduledStateDump {

    @Recurring(id = "state-dump", interval = "PT1H")
    @Job(name = "Dump notification state")
    public void dump() {
        persistentConfigStorage.dump(this.configGraph);
    }
}
```
{{</ codeblock >}}

`@Recurring` also resolves `${...}` placeholders, but the installation scan interval is configured in milliseconds through an environment variable that existing deployments already set, so we registered that one in code with `JobScheduler`:

{{< codeblock >}}

```java
// After (JobRunr): an interval from config, registered in code, plus one run at startup
@EventListener(ApplicationReadyEvent.class)
public void scheduleInstallationScan(ApplicationReadyEvent event) {
    JobScheduler jobScheduler = event.getApplicationContext().getBean(JobScheduler.class);
    Duration interval = Duration.ofMillis(installationScanIntervalMillis);

    jobScheduler.<GitHubInstallationScan>scheduleRecurrently("github-installation-scan", interval, scan -> scan.scan(JobContext.Null));

    // A Quartz SimpleTrigger fires right away, a JobRunr interval job fires one interval after it was created.
    jobScheduler.<GitHubInstallationScan>enqueue(scan -> scan.scan(JobContext.Null));
}
```
{{</ codeblock >}}

**Gotcha 1: the first run.** A Quartz `SimpleTrigger` with `startNow()` fires immediately. A JobRunr interval job is first enqueued one interval after it is created, which the [recurring jobs docs]({{< ref "documentation/background-methods/recurring-jobs.md" >}}) state plainly. This app keeps its installations in memory, so without the extra `enqueue` it would have sat idle for twelve hours after every deploy. For the state dump and the Slack cleanup, starting one interval later is harmless, so they just use `@Recurring`.

## One-off jobs with data: the `JobDataMap` becomes a parameter

The repository scan shows the typical Quartz dance: build a durable `JobDetail` with the data in a `JobDataMap`, store it, then trigger it by key. The job reads the data back by string key and casts.

{{< codeblock >}}

```java
// Before (Quartz): a durable JobDetail per installation, triggered with a JobDataMap
public void triggerJob(long installationId) throws SchedulerException {
    String jobIdentity = getJobIdentity(installationId);

    if (scheduler.getJobDetail(new JobKey(jobIdentity)) == null) {
        JobDetail job = JobBuilder.newJob(GitHubInstallationRepositoryScan.class)
                .withIdentity(jobIdentity)
                .usingJobData("installationId", installationId)
                .storeDurably(true)
                .build();
        scheduler.addJob(job, true);
    }
    scheduler.triggerJob(new JobKey(jobIdentity));
}

// in the job
public void execute(JobExecutionContext context) {
    long installationId = context.getJobDetail().getJobDataMap().getLong("installationId");
    ...
}
```
{{</ codeblock >}}

{{< codeblock >}}

```java
// After (JobRunr): enqueue a lambda, installationId is a typed argument
public JobId triggerJob(long installationId) {
    return jobScheduler.<GitHubInstallationRepositoryScan>enqueue(scan -> scan.scan(installationId));
}

// in the job
@Job(name = "Scan repositories of installation %0")
public void scan(long installationId) throws IOException, SchedulingException {
    ...
}
```
{{</ codeblock >}}

JobRunr analyses the lambda, stores the class, the method and the `installationId` argument as JSON, and later calls `scan(1001)` on the Spring bean. The `%0` in the job name puts the argument in the dashboard.

**What has no 1:1 equivalent here:** `@DisallowConcurrentExecution`. Quartz guaranteed that two scans of the same installation never overlap, because the annotation applies per `JobDetail` and there was one per installation. JobRunr OSS only prevents overlap for recurring jobs; for one-off jobs, [mutexes are a JobRunr Pro feature]({{< ref "documentation/pro/mutexes.md" >}}). This app keeps its configuration graph in memory, so it runs on one node anyway, and a `ReentrantLock` per installation inside the job gives the same guarantee. We wrote that down in the migration notes together with the consequence: do not start a second instance against the same database until the in-memory state moves out.

## Dynamic cron jobs from user config: a `JobRequest`

The notifications are the interesting part. Each one is created at runtime from a repository's YAML file, with a cron expression and time zone the repository owner typed in.

{{< codeblock >}}

```java
// Before (Quartz): a JobDetail and a CronTrigger per notification
public void createSchedule(String fullName, ScheduledNotificationConfigurationInterface config) throws SchedulerException {
    Optional<String> schedule = config.getSchedule();

    if (schedule.isEmpty()) {
        return;
    }

    JobKey jobKey = new JobKey(fullName);

    JobDetail job = JobBuilder.newJob(ScheduledNotification.class)
        .withIdentity(jobKey)
        .storeDurably(true)
        .build();

    TimeZone timeZone = TimeZone.getTimeZone(config.getTimeZone());

    Trigger trigger = TriggerBuilder.newTrigger()
        .withSchedule(CronScheduleBuilder.cronSchedule(schedule.get()).inTimeZone(timeZone))
        .withIdentity(jobKey.getName()).build();

    scheduler.scheduleJob(job, trigger);
}
```
{{</ codeblock >}}

Quartz needed a separate `updateSchedule` with `rescheduleJob` and an `upsertSchedule` that called `checkExists` to pick one. In JobRunr, scheduling with an existing recurring job id updates it, so the three methods became one:

{{< codeblock >}}

```java
// After (JobRunr): one upsert, the recurring job id decides create or update
public void upsertSchedule(String fullName, ScheduledNotificationConfigurationInterface config) throws SchedulingException {
    Optional<String> schedule = config.getSchedule();

    if (schedule.isEmpty()) {
        return;
    }

    try {
        jobRequestScheduler.scheduleRecurrently(
            existingRecurringJobId(fullName).orElseGet(() -> newRecurringJobId(fullName, Instant.now())),
            QuartzCron.toJobRunr(schedule.get()),
            toZoneId(config.getTimeZone()),
            new ScheduledNotificationRequest(fullName)
        );
    } catch (RuntimeException e) {
        throw new SchedulingException("Could not schedule notification " + fullName + " with schedule '" + schedule.get() + "'", e);
    }
}
```
{{</ codeblock >}}

The job itself is a `JobRequestHandler`, and the request is a record:

{{< codeblock >}}

```java
// After (JobRunr): the notification job as a JobRequest and its JobRequestHandler
public record ScheduledNotificationRequest(String notificationKey) implements JobRequest {

    @Override
    public Class<ScheduledNotification> getJobRequestHandler() {
        return ScheduledNotification.class;
    }

    @Override
    public String toString() {
        return notificationKey;
    }
}

@Component
public class ScheduledNotification implements JobRequestHandler<ScheduledNotificationRequest> {

    @Override
    @Job(name = "Slack notification %0", retries = 2)
    public void run(ScheduledNotificationRequest request) {
        ConfigGraphNode node = configGraph.get(request.notificationKey());
        ...
        getStrategy(node.getNotification().getType()).sendNotification(node);
    }
}
```
{{</ codeblock >}}

![JobRunr dashboard job detail for Slack notification acme/billing-service-team-standup, showing the call ScheduledNotification.run with the JSON payload notificationKey acme/billing-service-team-standup and the history Scheduled by recurring job, Enqueued, Processing, Succeeded](/blog/quartz-to-jobrunr-job-request.webp "One notification run in the dashboard. The JobRequest is stored as JSON, so you see exactly which notification ran, which recurring job scheduled it and when each state happened.")

### Lambda or `JobRequest`?

Both are first-class in JobRunr, so this is a design choice, not a workaround. We used lambdas for the scans, the state dump and the Slack cleanup: each is one public method on a bean with at most one simple argument, and a lambda is the least code. We used a `JobRequest` for notifications because they are created from data, there is one recurring job per notification, and the payload is a small command object that a unit test can capture and compare with `equals`. The request is a plain DTO that gets serialized to JSON; the handler is a normal Spring bean with its services injected. Our rule of thumb: thin wrapper around a service method, use a lambda; job built from data or passed around as a value, use a `JobRequest`.

### Gotcha 2: Quartz cron is not Unix cron

The app's documentation tells users to write Quartz cron, like `*/30 * * * * ?`. Those expressions live in other people's repositories, so changing the format was not an option. We ran every Quartz construct through JobRunr 9.0.3's own `CronExpression` parser:

<div class="table-wrap">

| Quartz expression | JobRunr OSS 9.0.3 | Translation |
|---|---|---|
| `0 */2 * * * ?` | rejected: `invalid day_of_week field: "?"` | `?` becomes `*` |
| `0 0 9 ? * MON-FRI 2027` (year field) | rejected: 5 or 6 fields only | drop `*` years, reject real ones |
| `0 0 9 ? * 2-6` | `0 0 9 * * 2-6` parses, but runs **Tuesday to Saturday** | shift day-of-week numbers by one |
| `0 0 9 15W * ?`, `0 0 9 ? * 6#3` | rejected | needs [JobRunr Pro advanced CRON]({{< ref "documentation/pro/advanced-cron-expressions.md" >}}) |
| `MON-FRI`, `JAN-MAR`, `0/15` | same meaning | none |

</div>

The third row is the one that would have hurt. Quartz numbers the days of the week 1 to 7 starting on Sunday, Unix cron (and JobRunr) 0 to 6 starting on Sunday. An expression with day numbers parses fine in both and silently runs a day later. So the app got a small `QuartzCron.toJobRunr()` translator, and a test that feeds every translated expression back into JobRunr's `CronExpression` and checks that "Monday to Friday" really lands on a Monday:

{{< codeblock >}}

```java
// After (JobRunr): a test that translated Quartz cron still runs on the right days
@Test
void weekdaysStayWeekdays() {
    // Quartz 2-6 is Monday to Friday. Left untouched, JobRunr would read it as Tuesday to Saturday.
    CronExpression cron = new CronExpression(QuartzCron.toJobRunr("0 0 9 ? * 2-6"));
    ZoneId zone = ZoneId.of("Europe/Brussels");
    Instant friday = ZonedDateTime.of(2026, 10, 30, 10, 0, 0, 0, zone).toInstant();

    Instant next = cron.next(friday, friday, zone);

    assertEquals(DayOfWeek.MONDAY, next.atZone(zone).getDayOfWeek());
}
```
{{</ codeblock >}}

For your own expressions you do not need to write a translator: paste a Quartz expression into our [Quartz to JobRunr cron converter]({{< ref "tools/cron-expression-generator.md#quartz" >}}) and it gives you the JobRunr expression, flags anything that needs JobRunr Pro and shows the next run times.

### Gotcha 3: time zones and ids

The app's docs use `timezone: "EST"`. Quartz takes a `java.util.TimeZone`, which accepts `EST`. JobRunr takes a `java.time.ZoneId`, and `ZoneId.of("EST")` throws `Unknown time-zone ID`. `TimeZone.getTimeZone(id).toZoneId()` keeps the Quartz behaviour exactly.

The `JobKey` names were notification keys like `acme/billing-service-team-standup`. A JobRunr recurring job id may only contain letters, digits and `-_(),.` and must stay under 128 characters, so the `/` would have thrown an `IllegalArgumentException` at runtime. The ids are now `notification-acme.billing-service-team-standup(mvts1fse)`: `/` becomes `.`, a short hash is appended when a key needs more sanitising than that, and the part in parentheses is gotcha 4.

![JobRunr dashboard Recurring Jobs page listing state-dump every PT1H, slack-channel-message-delete every PT1M, github-installation-scan every PT3M, the team-standup notification every 2 minutes in Europe/Brussels and the weekday-digest notification at 30 seconds past the minute Monday through Friday in -05:00](/blog/quartz-to-jobrunr-recurring-jobs.webp "The five Quartz triggers as JobRunr recurring jobs, running against Postgres. The translated cron reads as 'Monday through Friday' and the EST zone became -05:00, exactly what Quartz did.")

## Exceptions, retries and durable jobs

Every Quartz job in this app caught its exceptions, printed the stack trace and returned. Quartz reported success, nothing retried, and the only trace was in the logs. JobRunr's [best practices]({{< ref "documentation/background-methods/best-practices.md" >}}) say the opposite: let the exception out and JobRunr retries the job (10 times by default, with exponential back-off) and shows the stack trace in the dashboard.

So the scans now let their exceptions out. A GitHub API hiccup becomes a retried job instead of a silent twelve-hour gap. We tested it by making the fake GitHub API answer `502` for one scan: the job failed with the GitHub client's exception, JobRunr scheduled "Retry 1 of 10" three seconds out, the next poll picked it up, and with the API back the retry succeeded.

![JobRunr dashboard job detail for Scan GitHub App installations: Scheduled ahead of time by the recurring job, Enqueued, Processing, then Job processing failed with org.kohsuke.github.GHException Failed to retrieve /app/installations and the full stack trace](/blog/quartz-to-jobrunr-failed-retry.webp "The Quartz version printed this stack trace to stdout and reported success. Now it fails the job, shows the exception and retries it.")

You can change how many times JobRunr retries a job automatically, per job. The notification job uses `@Job(retries = 2)` instead of the default 10, because a Slack reminder that arrives hours late is worse than no reminder at all. Keep in mind that a retry after a partially posted Slack message posts it again, which is why retried jobs need to be [idempotent]({{< ref "blog/Idempotence-in-java-job-scheduling.md" >}}).

The installation scan fans out: it enqueues one repository scan per installation. If it fails halfway, a plain retry enqueues the first scans a second time. That is what durable jobs are for. With `runStepOnce`, a completed step is skipped on the retry:

{{< codeblock >}}

```java
// After (JobRunr): the scan throws so JobRunr retries it, runStepOnce skips finished steps
@Job(name = "Scan GitHub App installations")
public void scan(JobContext jobContext) throws IOException {
    PagedIterable<GHAppInstallation> list = gitHub.getApp().listInstallations();
    ...
    for (Long installationId : checkList.keySet()) {
        ...
        jobContext.runStepOnce("enqueue-repository-scan-" + installationId, () -> {
            // the app's own InstallationScanJobScheduler, the triggerJob shown earlier
            jobScheduler.triggerJob(installationId);
        });
    }
}
```
{{</ codeblock >}}

Note the block lambda. `runStepOnce` has an overload for steps that return a value, and an expression lambda returning the `JobId` would pick it, after which JobRunr tries to store the `JobId` as a step result. The braces make it a step without a result. More on durable jobs in the [durable executions guide]({{< ref "guides/advanced/durable-executions.md" >}}).

![JobRunr dashboard Chart view of the retried installation scan: Enqueued bars before and after Retry 1, a red diamond for the failed attempt, a green diamond for the successful one, and a row for the durable step enqueue-repository-scan-1001 that took 2 ms](/blog/quartz-to-jobrunr-durable-step-chart.webp "The same job in the Chart view: the failed attempt, the retry and the durable step enqueue-repository-scan-1001 on its own row. This is JobRunr 9.0.3 OSS.")

## Gotcha 4 (JobRunr OSS only): never recreate a deleted recurring job under the same id

This gotcha applies to JobRunr OSS. JobRunr Pro handles it for you, see below.

When a repository owner removes a notification from their YAML, the app deletes its recurring job, and when they add it back, the app creates it again. We tested that with the `weekday-digest` notification, which runs every minute. We removed it, added it back six minutes later under the same id, and JobRunr immediately sent it **six times**, once for every minute it had been gone:

```
Recurring job 'Slack notification acme/billing-service-weekday-digest' resulted in 6 scheduled jobs in time range ... (PT15S).
This means either its schedule is smaller than the pollInterval, your server was down or a long GC happened and JobRunr is catching up.
```

In JobRunr OSS, the running server keeps the last run of each recurring job id in memory, and deleting the recurring job does not clear it. Recreate the same id and JobRunr catches up on every run it missed in between. The [recurring jobs docs]({{< ref "documentation/background-methods/recurring-jobs.md" >}}) give the fix for JobRunr OSS: use a different id.

So each notification id now ends with its creation time in base 36, like `notification-acme.billing-service-team-standup(mvts1fse)`. A schedule change keeps the existing id, a notification that comes back after a delete gets a new one, and the digest is sent once.

The same docs page warns that deleting a recurring job in OSS does not remove the run it already scheduled ahead of time. Our notification job ignores notifications that are no longer configured, so that one run does nothing.

**In JobRunr Pro this gotcha does not exist.** Deleting a recurring job also clears what the server remembers about it and removes the runs it already scheduled ahead of time, so recreating it under the same id starts fresh. And if all you want is to stop a recurring job for a while, Pro lets you [pause and resume it]({{< ref "documentation/background-methods/recurring-jobs.md#pause-and-resume-recurring-jobs" >}}) instead of deleting it.

## Verifying the migration

The full migration is on GitHub in the [`migrate-to-jobrunr` branch](https://github.com/iNicholasBE/github-scheduled-reminder-app/tree/migrate-to-jobrunr) of our fork, together with the [notes we kept along the way](https://github.com/iNicholasBE/github-scheduled-reminder-app/blob/migrate-to-jobrunr/MIGRATION-NOTES.md).

1. **Build and tests.** 97 tests green (74 before; 2 Quartz tests rewritten into 10, plus 15 cron translation tests).
2. **Quartz is gone.** `mvn dependency:tree | grep -i quartz` returns nothing (it showed `org.quartz-scheduler:quartz:jar:2.5.0` before), and no file imports `org.quartz`.
3. **Real storage.** The app started against Postgres 17 in Docker; JobRunr created its tables and registered five recurring jobs with the expected schedules and zones (`-05:00` for `EST`).
4. **Every baseline job fired.** Same fake GitHub API, same YAML, a window of about seven minutes, and the fake API saw the same calls as before: per scan the app, its installations, an installation token, the repositories and both config files; per notification the repository, its open issues and its open pull requests.
5. **Dashboard.** Recurring jobs with their schedules and zones, every execution under Succeeded, the simulated outage as a failed attempt with its stack trace followed by a successful retry.
6. **Delete and re-add** a notification: one deletion, one new id, no catch-up burst (gotcha 4).
7. **Restart.** Stopped and started the app on the same database: still five recurring jobs, no duplicates. Runs that were already scheduled ahead of time and fell due while the app was down ran once right after startup, then everything continued on schedule. No catch-up beyond that.

<div class="table-wrap">

| Job | Schedule | Quartz | JobRunr |
|---|---|---|---|
| Installation scan + repository scan | startup, then every 3 min | 17:16:13, 17:19:13, 17:22:13 | 17:47:57, 17:50:57, 17:53:57 |
| `team-standup` | `0 */2 * * * ?`, Europe/Brussels | 17:18:00, 17:20:00, 17:22:00 | 17:50:12, 17:52:12, 17:54:12 |
| `weekday-digest` | `30 * * ? * MON-FRI`, EST | every minute at :30, 7 runs | every minute at :42, 7 runs |
| Slack cleanup | every minute | every minute at :13, 7 runs | every minute, 6 runs |
| State dump | every hour | at startup | one hour after startup, by design |

</div>

The one systematic difference is the offset: Quartz fires on the second, JobRunr's background job server checks for due work every 15 seconds (`poll-interval-in-seconds`), so a run starts up to one poll interval off its cron moment. In this run the polls fell 12 seconds after the minute; after the restart they fell 1 second after it. For reminders that is irrelevant. If you need second-precise starts, that is what [real-time scheduling in JobRunr Pro]({{< ref "documentation/pro/real-time-scheduling.md" >}}) is for.

![JobRunr dashboard Succeeded jobs list with Scan repositories of installation 1001, Scan GitHub App installations, Delete outdated Slack notification messages and Slack notification acme/billing-service-team-standup](/blog/quartz-to-jobrunr-succeeded-jobs.webp "Every execution of every former Quartz job, with a readable name thanks to @Job(name = ...) and the %0 argument placeholder.")

## No Spring Boot? The three basic cases in plain Java

Not every Quartz codebase is a Spring Boot app. Here are the three basic job types from the [Quartz quick start](https://www.quartz-scheduler.org/documentation/quartz-2.3.0/quick-start.html), with a couple of job parameters added, next to their JobRunr equivalent. The JobRunr side ran as-is on JobRunr 9.0.3 with Jackson on the classpath for JSON.

### A one-off job

<p class="code-label"><strong>Quartz:</strong> implement <code>Job</code>, store it durably, trigger it with a <code>JobDataMap</code></p>

{{< codeblock >}}

```java
public class QuartzExampleOneOffJob {

    // we create an implementation of a Job that will be executed
    public static class HelloJob implements Job {
        @Override
        public void execute(JobExecutionContext jobExecutionContext) throws JobExecutionException {
            // get the variables from the JobDataMap
            String framework = jobExecutionContext.getMergedJobDataMap().getString("framework");
            Instant createdAt = (Instant) jobExecutionContext.getMergedJobDataMap().get("createdAt");

            // run the actual business code
            System.out.println(framework + " says Hello at " + createdAt);
        }
    }

    public static void main(String[] args) throws InterruptedException {
        try {
            // Grab the Scheduler instance from the Factory
            Scheduler scheduler = StdSchedulerFactory.getDefaultScheduler();

            // create a JobKey so we can trigger it instantly
            JobKey jobKey = new JobKey("job1", "group1");

            // define the job and tie it to our HelloJob class
            JobDetail jobDetail = newJob(HelloJob.class)
                    .withIdentity(jobKey)
                    .storeDurably() // otherwise it cannot be triggered immediately
                    .build();

            // store the job in the job store
            scheduler.addJob(jobDetail, true);

            // create the JobDataMap
            JobDataMap jobDataMap = new JobDataMap();
            jobDataMap.put("framework", "Quartz");
            jobDataMap.put("createdAt", Instant.now());

            // trigger the job using the JobKey and the JobDataMap
            scheduler.triggerJob(jobKey, jobDataMap);

            // and start it off
            scheduler.start();

            // keep the main thread running
            Thread.currentThread().join();
            scheduler.shutdown();
        } catch (SchedulerException se) {
            se.printStackTrace();
        }
    }
}
```
{{</ codeblock >}}

<p class="code-label"><strong>JobRunr:</strong> any class, a lambda, typed arguments</p>

{{< codeblock >}}

```java
public class JobRunrExampleOneOffJob {

    // we can use any class or bean without implementing an interface
    public static class HelloJob {
        public void sayHello(String framework, Instant createdAt) {
            System.out.println(framework + " says Hello at " + createdAt);
        }
    }

    public static void main(String[] args) throws InterruptedException {
        JobScheduler jobScheduler = JobRunr.configure()
                .useStorageProvider(new InMemoryStorageProvider()) // or SqlStorageProviderFactory.using(dataSource)
                .useBackgroundJobServer()
                .useDashboard()
                .initialize()
                .getJobScheduler();

        jobScheduler.<HelloJob>enqueue(x -> x.sayHello("JobRunr", Instant.now()));

        // keep the main thread running
        Thread.currentThread().join();
    }
}
```
{{</ codeblock >}}

The [Fluent API]({{< ref "documentation/configuration/fluent/_index.md" >}}) replaces `StdSchedulerFactory`. With the Spring Boot starter, the Quarkus extension or the Micronaut feature you skip it and inject `JobScheduler`.

### A job scheduled in the future

<p class="code-label"><strong>Quartz:</strong> a trigger with <code>startAt</code></p>

{{< codeblock >}}

```java
JobDetail jobDetail = newJob(HelloJob.class)
        .withIdentity(jobKey)
        .build();

JobDataMap jobDataMap = new JobDataMap();
jobDataMap.put("framework", "Quartz");
jobDataMap.put("createdAt", now());

// Create the trigger to schedule the job 1 day from now and the JobDataMap
Trigger trigger = newTrigger()
        .withIdentity("trigger1", "group1")
        .startAt(Date.from(now().plus(1, ChronoUnit.DAYS)))
        .forJob(jobKey)
        .usingJobData(jobDataMap)
        .build();

scheduler.scheduleJob(jobDetail, trigger);
```
{{</ codeblock >}}

<p class="code-label"><strong>JobRunr:</strong> <code>schedule</code> with an <code>Instant</code></p>

{{< codeblock >}}

```java
jobScheduler.<HelloJob>schedule(now().plus(1, ChronoUnit.DAYS), x -> x.sayHello("JobRunr", now()));
```
{{</ codeblock >}}

[`schedule`]({{< ref "documentation/background-methods/scheduling-jobs.md" >}}) takes any `Instant`, `ZonedDateTime`, `OffsetDateTime` or `LocalDateTime`. The job is stored right away and waits in the Scheduled state until it is due.

### A recurring job

<p class="code-label"><strong>Quartz:</strong> a <code>CronTrigger</code> in Quartz cron syntax</p>

{{< codeblock >}}

```java
Trigger trigger = newTrigger()
        .withIdentity("trigger1", "group1")
        .startNow()
        .withSchedule(cronSchedule("0/30 * * * * ? *"))
        .forJob(jobKey)
        .usingJobData(jobDataMap)
        .build();

scheduler.scheduleJob(jobDetail, trigger);
```
{{</ codeblock >}}

<p class="code-label"><strong>JobRunr:</strong> <code>scheduleRecurrently</code> with an id, in standard cron syntax</p>

{{< codeblock >}}

```java
jobScheduler.<HelloJob>scheduleRecurrently("say-hello", "*/30 * * * * *", x -> x.sayHello("JobRunr", Instant.now()));
```
{{</ codeblock >}}

Note the cron expression: Quartz's `0/30 * * * * ? *` has a `?` and a year field, which JobRunr rejects, so it becomes `*/30 * * * * *` (gotcha 2). The [`Cron`]({{< ref "documentation/background-methods/recurring-jobs.md" >}}) helper class (`Cron.daily()`, `Cron.every30seconds()`, ...) avoids writing expressions by hand. As with the `JobDataMap`, the `Instant.now()` argument is evaluated once, when the recurring job is registered.

## Your migration checklist

1. Baseline the original: tests, and every job firing, with timestamps.
2. Inventory every `Job`, trigger, cron expression (including ones that come from data), `JobDataMap` key, `@DisallowConcurrentExecution`, misfire setting, listener and calendar.
3. Map them with the table above and write down every behaviour change.
4. Translate Quartz cron: `?`, year field, day-of-week numbers, `W`/`#`, time zone ids.
5. Sanitise recurring job ids, and give a recreated recurring job a new id.
6. Let exceptions propagate and decide retries per job; use durable jobs with `runStepOnce` where a retry must not repeat a side effect.
7. Remove Quartz and ban it in the build.
8. Verify against the baseline: tests, dependency tree, every job firing, dashboard, restart.

Want to try it on your own codebase? [Get started with JobRunr]({{< ref "documentation/_index.md" >}}) in a few minutes, or [request a free JobRunr Pro trial](/en/try-jobrunr-pro/) if you need mutexes, advanced CRON expressions, catching up on missed runs or more than 100 recurring jobs.
