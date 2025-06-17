---
title: "Carbon Aware Jobs"
subtitle: "Use the Carbon Aware API to optimize the carbon footprint when scheduling (recurring) jobs."
drawing1: https://excalidraw.com/#json=yVa0Rvpt4dWtEKVWbq_EJ,vWq0sr45v9nCOZZjDuGzfQ
drawing2: https://excalidraw.com/#json=fUbk68riV80xkYlZTuUwb,6EA0BSlQ5zdXLXGC8Z6ODQ
date: 2025-06-13T09:15:00+02:00
layout: "documentation"
beta: true
menu: 
  main: 
    identifier: carbon-aware-jobs
    parent: 'background-methods'
    weight: 31
---

> **Configuration note**: In order to enable carbon aware capabilities for your jobs, please [correctly configure the Carbon Aware API](/en/documentation/configuration/carbon-aware/).

Adding a margin to your regular (recurring) schedule allows your jobs to be executed at the optimal time: when the CO2 footprint for your local region is the lowest. Instead of immediately scheduling a job, it will be created in a new _pending_ mode and scheduled as soon as JobRunr receives carbon intensity data to optimize the carbon footprint of your job. 

The following schematic summarizes how carbon aware job processing works:

![](/documentation/carbon-schematic.png "A carbon aware job timeline.")

As visible in the schematic, for carbon aware job processing, these concepts are important:

- The preferred time---your usual schedule when the job should be processed. If something goes wrong (see [important remarks](#-important-remarks)), the job will still be processed using this as a fallback.
- The carbon aware margin _\[From, To\]_---instead of always scheduling the job at the preferred time, with carbon aware, the job can be processed anywhere within this margin depending on the data of the energy provider. The interval limit can be seen as a _deadline_: if it is passed, the job will still be executed at that time.
- The carbon optimal time---this is a moment in-between the above margin JobRunr selects as the time when the CO2 footprint is the lowest. This is the new _scheduled at_ time. In this example, the job runs later than the initial preferred time, but still well within the deadline.

As usual, you can track the progress of your job in the dashboard:

![](/documentation/carbon-aware-job-scheduled-to-minimize-carbon-impact.png "An example carbon aware daily recurring job with a margin between 16PM and 20PM, with the local time being 15PM. The job was scheduled at 16PM to minimize carbon impact.")

Both regular scheduled jobs and recurring jobs can be made carbon aware. The following sections explain this in detail:

1. [Configuring Carbon Aware Scheduled Jobs](#carbon-aware-scheduled-jobsendocumentationbackground-methodsscheduling-jobs)
2. [Configuring Carbon Aware Recurring Jobs](#carbon-aware-recurring-jobsendocumentationbackground-methodsrecurring-jobs)

## Carbon Aware [Scheduled Jobs](/en/documentation/background-methods/scheduling-jobs/)

As with scheduling regular jobs, you can use either the `jobScheduler.schedule()` method and pass in the desired delay & margin:

```java
BackgroundJob.scheduleCarbonAware<>(CarbonAwarePeriod.between(now, now.plus(5, HOURS)), 
  x -> x.sendNewlyRegisteredEmail());
```

Note the used method here is **scheduleCarbonAware()** instead of your regular **schedule()**!

Or you can use the `JobBuilder` to achieve the same result:

```java
BackgroundJob.create(aJob()
    .withName("Send welcome email to newly registered users")
    .withCarbonAwareAwaitingState(CarbonAwarePeriod.between(now, now.plus(5, HOURS)))
    .<>withDetails(x -> x.sendNewlyRegisteredEmail()));
```

Note that the used builder method here is **withCarbonAwareAwaitingState()** instead of your regular **scheduleIn()**!

The following subsection details the different possibilities for creating a carbon-sepcific schedule.

### Creating Carbon Aware Periods

The `CarbonAwarePeriod` class houses several utility methods to quickly create a period and add some carbon aware slack. There are two main possibilities:

1. **before(x)** is a simple way to express you want to get a job done before certain time _in the future_. This is an alias for `between(now(), x)`. 
2. **between(x, y)** is a way to express you want to kick a job into gears between a certain period _in the future_. It can accept the following class instances

Both methods accept the following class instances: `Instant`, `LocalDate`, `LocalDateTime` (using the system default zone ID), and `ZonedDateTime`. 

## Carbon Aware [Recurring Jobs](/en/documentation/background-methods/recurring-jobs/)

The following subsection details the different possibilities for creating a carbon-specific recurring CRON string.

### Creating Carbon Aware Schedule Expressions

The `CarbonAware` class houses several utility methods to quickly create a carbon aware schedule expression string:

1. **dailyBetween(x, y)**: allows relaxing of a daily schedule as long as it stays within `x` and `y` hours. Both parameters need to be in 24-hour format and should be within the same day (they cannot cross the 12-hour boundary: e.g. between 20H and 6H the next day); for that employ `using()` instead. 
2. **dailyBefore(x)**: alias of `dailyBetween(0, x)`
3. **using(exprStr, x, y)**: allows relaxing of a schedule expression string by `[x, y]` where `x` and `y` are `Duration` instances (e.g. `using("0 16 * * *", Duration.ofHours(1), ofHours(4))` will schedule between 15PM and 20PM). 
4. **using(exprDur, x, y)**: allows relaxing of a schedule expression `Duration` by `[x, y]` where all parameters are `Duration`s.

Of course, you always have the option to add a carbon aware duration to the CRON expression string by hand. We have extended the CRON notation with a margin in the `Duration` string representation that is the least invasive. For example, you can either rely on `using()`, or just create the string yourself:

```java
// Both are exactly the same
jobScheduler.scheduleRecurrently("rj-id", CarbonAware.using("0 16 * * *", Duration.ofHours(1), ofHours(4)), x->doWork())
jobScheduler.scheduleRecurrently("rj-id", "0 16 * * * [PT1H/PT4H]", x->doWork())
```

The notation is `CRON [PTXX/PTYY]` where a space ` ` separates the usual CRON expression from the carbon aware margin interval, the square brackets `[]` identify the interval, and the slash `/` separates the margin from/margin to.

In the Dashboard, in the Recurring Jobs tab, you can see whether a Cron is a carbon-specific Cron by hovering over the electrified leaf icon:

![](/documentation/carbon-aware-recurring-job-in-dashboard.png "Carbon aware cron info in the dashboard.")


## ⚠️ Important Remarks

When making use of carbon aware schedules, there are a few important things to keep in mind:

- If the **margin is too small**, the job will be scheduled right away instead. This depends from energy data provider to data provider and from area code to area code. Most providers return carbon intensity data with hourly margins, but the EU is migrating to each 15 minutes. The configured margin should be three times as big as the margins returned by the data provider (e.g. if hourly, at least three hours). It does not make sense to schedule a job carbon aware between now and one hour if JobRunr does not receive carbon info between that margin. 
- If the Carbon Intensity API is down, jobs will still be scheduled at their preferred time.
- If the Carbon Intensity API has no forecast for a particular period, the job will be scheduled at their preferred time.
- If the deadline has passed (e.g. `between(now, now.plus(3, HOURS)` and it's past the third hour), the job will be scheduled immediately.
- If the Carbon API configuration is disabled, remaining carbon aware jobs in `AWAITING` will still be processed and scheduled at their preferred time. 
- If the specified margin is in the past, the `AWAITING` job will be processed the next time it hits that interval (e.g. `CarbonAware.dailyBetween(12, 18)` while it is 14PM: it will be processed the next day between 12 and 18PM). 

For each of the above cases, a specific reason will be recorded that can be consulted in the dashboard when opening the job details. 
