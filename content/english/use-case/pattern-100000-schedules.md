---
title: "How to Run 100,000 Customer Schedules That Survive a Server Crash"
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
> "I need to have 100,000 different schedules for things to happen at regular intervals."

Sometimes the sentence sounds different. "I need a scheduling engine inside my product for my customers' maintenance schedules." "I need to push firmware and security updates to millions of devices." "I need to defrost every fridge in every store at night." "I need to send my crew a text message before every shift." In each case, the schedule is data that changes while the application runs.

## Why it is hard

A scheduled thread pool in the JVM works for ten fixed tasks. So does `@Scheduled` in Spring. Both stop working for this problem, for the same reasons:

- The schedules live in the code. A customer cannot add one at runtime.
- The schedules live in memory. When the server dies, they are gone, and every customer has to register theirs again. Nobody notices until the fridges were not defrosted.
- A scheduled thread pool only knows fixed rates and delays. It has no cron expressions.
- Every instance runs every schedule. With three instances, the customer gets three text messages.
- Time zones and daylight saving time turn "every day at 9" into a support ticket twice a year.

## What goes wrong when you build it yourself

You move the schedules to a table and write a loop that checks what is due. Now you need to decide which instance runs that loop, and what happens when that instance disappears. You need to make sure a run is never started twice. You need to decide what happens when a run takes longer than its interval. The architecture works on the whiteboard and then needs a lot of tuning in production.

If you need more than a scheduled thread pool, use a library that already handled those cases.

## The pattern

{{< svg "assets/use-case/pattern-recurring-schedules.svg" >}}

1. **A customer sets a schedule.** Your application stores it as a recurring job with its own id. The same call updates it later, and one call deletes it.
2. **The master plans.** The longest-running instance is elected master automatically. On every poll interval it looks up the schedules that are due and creates one normal job per run.
3. **Every instance works.** All instances, the master included, claim jobs and run your code. A job is claimed by exactly one worker, so a run never happens twice at the same time.

Every instance writes a heartbeat every 15 seconds. When the master stops, the next longest-running instance takes over the planning. You do not configure this, and no extra coordination service is involved. The database is the only shared component.

When a customer changes a schedule, the master notices on its next poll, removes the run it had already planned and plans the new one.

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

Because every run is a normal job, it gets the rest for free: retries, a history, and a place in the dashboard. A run that has to reach a million devices can use the [fan out pattern]({{< ref "use-case/pattern-update-millions-of-rows.md" >}}) to split the work.

## What is open source and what is Pro

| You need | JobRunr OSS | JobRunr Pro |
|---|---|---|
| Schedules created, changed and deleted at runtime | Yes | Yes |
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

**Does this scale to a million schedules?** The limit is the memory of the master, because it loads the schedules that are due. So it depends on how many are due at the same moment, much more than on how many exist. We tested one million recurring jobs with the same schedule on a single machine. If a million things really have to happen at the same second, use one schedule that fans out into a batch of jobs.

**What if a run is still busy when a server dies?** While a job runs, its worker keeps updating it in the database. When the updates stop, the master marks the job as orphaned and another instance picks it up.

**What if a run takes longer than its interval?** The next run is skipped while the previous one is still active. Pro can allow a set number of concurrent runs per schedule.

## Who runs this

[Customer A], Decathlon and [Customer B] run this pattern. Prophia moved [from vanishing cron jobs to 25,000 leases processed every night]({{< ref "use-case/jobrunr-pro-prophia.md" >}}).

## Not a fit when

- The schedules never change and one node is enough. Keep your `@Scheduled` methods.
- You do not care what happens to the schedule when a server crashes.
- You need intervals below 5 seconds. That is the smallest interval a recurring job supports.

## Check the fit for your own system

Paste the URL of this page into your coding agent and ask whether the pattern fits your codebase. Or read the docs on [recurring jobs]({{< ref "documentation/background-methods/recurring-jobs.md" >}}).
