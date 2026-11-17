---
title: "Customer-Defined Recurring Jobs, Created at Runtime"
author: "Nicholas D'hondt"
image: /use-case/pattern-recurring-schedules.webp
summary: "Your customers want their own schedules: a firmware check every hour, a maintenance run every Monday. This pattern stores every schedule in your database, lets one instance plan and all instances work, and keeps going when a server dies."
description: "An architecture pattern for a scheduling engine inside your Java product: schedules created at runtime, stored in your database and executed across all your instances without a single point of failure."
date: 2026-11-12T16:20:00+01:00
draft: true
# TODO before publish: get permission to name the two customers behind [Customer A] and [Customer B] in "Who runs this", Ronald confirms the scale numbers (1 million tested, 64 GB machine), flip draft.
tags:
  - use-case
  - pattern
---
> "Customer-Defined Recurring Jobs, Created at Runtime"

Sometimes the sentence sounds different. "I need a scheduling engine inside my product for my customers' maintenance schedules." "I need to push firmware and security updates to millions of devices." "I need to defrost the fridges at midnight." In each case, the schedule is data that changes while the application runs.

## The challenge

A schedule in your code is a fixed thing. You write it once, it ships with the release, and it is the same on every server. A schedule that belongs to a customer is data. Someone creates it on a Tuesday afternoon, changes it a week later and deletes it when the contract ends, all while the application keeps running.

That changes what the scheduler has to do:

- **It has to remember.** A schedule that only lives in memory is gone after a restart or a deployment. Nobody notices until the fridges were not defrosted.
- **It has to run once.** You run more than one instance, and every instance knows every schedule. With three instances, the customer gets three text messages unless something decides who goes first.
- **It has to survive crashes.** When an instance crashes, another instance has to pick up its work. Only the run that was interrupted should be done again, not everything else that was handled in the same loop.
- **It has to understand local time.** "Every day at 9" means 9 in Sydney for one customer and 9 in Brussels for the next, and both shift when daylight saving time starts or ends.

Each of these is solvable. The hard part is that they have to hold at the same time, for every schedule, while customers keep changing them.

## The pattern

{{< svg "assets/use-case/pattern-recurring-schedules.svg" >}}

1. **A customer sets a schedule.** Your application stores it as a recurring job with its own id. The same call updates it later, and one call deletes it.
2. **The master plans.** The longest-running instance is elected master automatically. On every poll interval it looks up the schedules that are due and creates one normal job per run.
3. **Every instance works.** All instances, the master included, claim jobs and run your code. A job is claimed by exactly one worker, so a run never happens twice at the same time.

Every instance writes a heartbeat, every 15 seconds by default. When the master stops, the next longest-running instance takes over the planning. You do not set up the election or the failover, and no extra coordination service is involved. The database is the only shared component.

When a customer changes or deletes a schedule, the run that was already planned is the part to watch. JobRunr Pro detects the change, removes that run and plans the new one. JobRunr OSS makes no promise here: the planned run stays where it is, so a change may not apply right away. A schedule that goes from monthly to hourly can keep waiting for the monthly run that was already planned. In OSS, the most predictable way to change a schedule is to delete it and create it again under a new id. The run that was already planned for the old one is [yours to clean up]({{< ref "documentation/background-methods/recurring-jobs.md#deleting-recurring-jobs" >}}), through the `StorageProvider` or the dashboard.

```java
public void saveSchedule(String customerId, String cron, ZoneId zone) {
    jobScheduler.scheduleRecurrently(
        "firmware-check-" + customerId,   // one id per customer schedule
        cron, zone,
        () -> firmwareService.checkAndPush(customerId));
}

public void removeSchedule(String customerId) {
    jobScheduler.deleteRecurringJob("firmware-check-" + customerId);
}
```

A scheduler that only fires a trigger leaves the rest to you. Here every run is a normal job, so each one comes with more than a start time:

- **Retries.** A run that throws an exception is retried automatically, 10 times by default, with exponential back-off. You can [configure the number of retries]({{< ref "documentation/background-methods/dealing-with-exceptions.md#how-to-configure-the-amount-of-retries" >}}).
- **A dashboard that shows what happened.** JobRunr ships with a [built-in dashboard]({{< ref "documentation/background-methods/dashboard.md" >}}). It lists every schedule and every run, and for each run its state, its attempts and its exceptions. When a firmware update fails, or a server crashes halfway, you open the dashboard and see that the update never happened, for which customer, and why. A run that is out of retries stays in the dashboard as failed until someone retries or deletes it from there. With Pro you can also send job traces to your observability platform through [OpenTelemetry]({{< ref "guides/advanced/observability-tracing.md" >}}) and alert on failures there.
- **Recovery after a crash.** A run that was busy on an instance that died is picked up by another instance. Nobody has to find out by hand what was running at that moment.
- **Resuming where it stopped.** A plain loop over a million devices has no memory. When the server crashes at device 600,000, nothing knows where it stopped, so you run the whole loop again or you guess. With the [fan out pattern]({{< ref "use-case/pattern-update-millions-of-rows.md" >}}) the run creates one small job per chunk of devices, and only the chunks that were interrupted are done again. Inside a single job, [durable steps]({{< ref "use-case/pattern-never-charge-twice.md" >}}) skip the steps that already finished.

## What goes wrong when you build it yourself

Most teams start with what the JVM or the framework already offers. Each option solves one part and leaves the rest to you.

### A scheduled thread pool

```java
executor.scheduleAtFixedRate(
    () -> firmwareService.checkAndPush(customerId),
    delayUntilNineInSydney(), 24, TimeUnit.HOURS);
```

A `ScheduledExecutorService` accepts new tasks at runtime, and the number of tasks is not the limit. But it only understands fixed rates and delays. There is no cron syntax and no time zone, so "every day at 9 for a customer in Sydney" is math you do yourself. A fixed period of 24 hours also drifts: after a daylight saving change the task runs at 8 or at 10.

### Spring's `@Scheduled`

```java
@Scheduled(cron = "0 0 9 * * *", zone = "Australia/Sydney")
public void checkFirmware() {
    firmwareService.checkAndPush("customer-42");
}
```

`@Scheduled` gives you cron expressions and a time zone. Both are written on an annotation, so they are fixed when the application starts. A customer cannot add a schedule from your product, and you cannot write one method per customer.

### `TaskScheduler` and a map

```java
ScheduledFuture<?> future = taskScheduler.schedule(
    () -> firmwareService.checkAndPush(customerId),
    new CronTrigger(cron, zone));
schedules.put(customerId, future);
```

With Spring's `TaskScheduler` you get cron, time zones and registration at runtime. Now you are keeping the schedules yourself. The map lives in memory, so after a restart something has to register every schedule again. And every instance holds the same map, so every instance runs every schedule.

### A table and a polling loop

So you move the schedules to a table and write a loop that checks what is due:

```java
@Scheduled(fixedDelay = 5000)
public void runDueSchedules() {
    for (Schedule schedule : scheduleRepository.findDue(Instant.now())) {
        firmwareService.checkAndPush(schedule.getCustomerId());
        schedule.setNextRun(nextRunOf(schedule));
        scheduleRepository.save(schedule);
    }
}
```

The schedules now survive a restart. The loop raises new questions:

- Which instance runs the loop? If all of them do, two instances find the same due schedule and both run it.
- What happens when that instance disappears? If only one runs the loop, nothing is planned until someone notices.
- What if the server dies between the work and the `save`? After the restart the schedule is still due, so it runs again.
- What if one run takes ten minutes? Every schedule behind it in the loop waits, and the next tick may pick up the same schedule while it is still busy.

The architecture works on the whiteboard and then needs a lot of tuning in production.

If you need more than a scheduled thread pool, use a library that already handled those cases.

## What is available in JobRunr?

| You need | JobRunr OSS | JobRunr Pro |
|---|---|---|
| Schedules created at runtime | Yes | Yes |
| Schedules changed and deleted at runtime | Yes, but a change may not apply right away. Delete the schedule and create it again, and clean up the run that was already planned | Yes, the change is detected and the planned run is replaced |
| One instance plans, all instances work, automatic takeover | Yes | Yes |
| No overlapping runs of the same schedule | Yes | Yes |
| Dashboard with every schedule and every run | Yes | Yes |
| Number of schedules | Up to about 100 | 100,000 and more |
| Start time of a run | Within the poll interval | [Within a second]({{< ref "documentation/pro/real-time-scheduling.md" >}}) |
| Runs that were missed while everything was down | Skipped | Can be caught up |
| Pause and resume one schedule | No | Yes |
| A schedule with an end date, for a customer who leaves next year | No | Yes |
| Your own schedule type next to cron and intervals | No | Yes |

## Questions a sceptical architect asks

**Why not cron or Kubernetes CronJobs?** They are fine for a fixed list that your operations team owns. A customer cannot add a line to your crontab from your product.

**Why not Kafka?** Kafka moves events. It has no notion of "every Monday at 9 in the time zone of this customer".

**Why not Quartz?** It can do this. You configure its cluster mode and its tables yourself, and it ships without a dashboard, so you build your own view of what ran.

**Why not let my coding agent build it?** The table and the loop are easy to generate. Master election, takeover and the daylight saving cases are the parts that need years of production use.

**How do workers avoid running the same job twice?** A worker claims a job by updating it in the database. On PostgreSQL, MySQL and MariaDB that claim uses `SELECT ... FOR UPDATE SKIP LOCKED`, so workers do not wait on each other. On other databases it falls back to optimistic locking.

**Does this scale to a million schedules?** The limit is the memory of the master, because it loads the schedules that are due. So it depends on how many are due at the same moment, much more than on how many exist. We used JobRunr Pro to test one million recurring jobs with the same schedule on a single machine. And all jobs fired on time. 

 Alternatively, if a million things really have to happen at the same second, you can use one recurring job that create a job for each task.

**What if a run is still busy when a server dies?** While a job runs, its worker keeps updating it in the database. When the updates stop, the master marks the job as orphaned and another instance picks it up.

**What if a run takes longer than its interval?** The next run is skipped while the previous one is still active. Pro can allow a set number of concurrent runs per schedule.

## Not a fit when

- The schedules never change and one node is enough. Keep your `@Scheduled` methods.
- You do not care what happens to the schedule when a server crashes.
- You need intervals below 5 seconds. That is the smallest interval a recurring job supports.

## Check the fit for your own system

Paste the URL of this page into your coding agent and ask whether the pattern fits your codebase. Or read the docs on [recurring jobs]({{< ref "documentation/background-methods/recurring-jobs.md" >}}).
