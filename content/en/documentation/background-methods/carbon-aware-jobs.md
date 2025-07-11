---
title: "Carbon Aware Jobs"
subtitle: "Use Carbon Aware Job Processing to optimize the carbon footprint when scheduling (recurring) jobs."
drawing1: https://excalidraw.com/#json=yVa0Rvpt4dWtEKVWbq_EJ,vWq0sr45v9nCOZZjDuGzfQ
drawing2: https://excalidraw.com/#json=KQKZ3E-3krR7TIDXVu--H,yZQDrHalLHBjgnu-U0aNew
date: 2025-06-13T09:15:00+02:00
layout: "documentation"
menu: 
  main: 
    identifier: carbon-aware-jobs
    parent: 'background-methods'
    weight: 31
---

> **Configuration note**: In order to enable carbon aware capabilities for your jobs, please correctly setup the [Carbon Aware Job Processing Configuration]({{< ref "documentation/configuration/carbon-aware.md" >}}).

Adding a margin to your regular (recurring) schedule allows your jobs to be executed at the optimal time: when the CO2 footprint for your local region is the lowest. Instead of immediately scheduling a job, it will be created in a new _pending_ mode and scheduled as soon as JobRunr receives carbon intensity data to optimize the carbon footprint of your job. 

The following schematic summarizes how carbon aware job processing works:

![](/documentation/carbon-schematic.png "A carbon aware job timeline.")

As visible in the schematic, for carbon aware job processing, these concepts are important:

- The preferred time---your usual schedule when the job should be processed. If something goes wrong (see [important remarks](#-important-remarks)), the job will still be processed using this as a fallback.
- The carbon aware margin _\[From, To\]_---instead of always scheduling the job at the preferred time, with carbon aware, the job can be processed anywhere within this margin depending on the data of the energy provider. The interval limit can be seen as a _deadline_: if it is passed, the job will still be executed at that time.
- The carbon optimal time---this is a moment in-between the above margin JobRunr selects as the time when the CO2 footprint is the lowest. This is the new _scheduled at_ time. In this example, the job runs later than the initial preferred time, but still well within the deadline.

As usual, you can track the progress of your job in the dashboard:

![](/documentation/carbon-aware-job-scheduled-to-minimize-carbon-impact.png "An example carbon aware daily recurring job with a margin between 9h and 16h, with the local time being 9h. The job was scheduled at 15h to minimize carbon impact.")

As visible in the above screenshot, the optimal low-carbon time window is visualized in the pending history. JobRunr picks an optimal time window inside the job's execution window---the `[From, To]` margins: everything that falls in-between the red line. The greener the time slice, the lower the carbon emissions will be at that time. 

Both delayed jobs and recurring jobs can be made carbon aware. The following sections explain this in detail:

1. [Configuring Carbon Aware Scheduled Jobs](#carbon-aware-scheduled-jobs)
2. [Configuring Carbon Aware Recurring Jobs](#carbon-aware-recurring-jobs)

## Carbon Aware Scheduled Jobs

> For general documentation on scheduled jobs, see [Scheduled Jobs]({{< ref "documentation/background-methods/scheduling-jobs.md" >}}).

As with scheduling regular jobs, call the `schedule()` method and pass in an instance of `Temporal`:

```java
BackgroundJob.schedule(CarbonAware.between(now, now.plus(5, HOURS)), 
  () -> myService.sendNewlyRegisteredEmail());
```


The new `CarbonAwarePeriod` class returned by the `CarbonAware` API implements `Temporal` and configures the desired delay and margin of your job. 

Or you can use the `JobBuilder` to achieve the same result:

```java
BackgroundJob.create(aJob()
    .withName("Send welcome email to newly registered users")
    .scheduleAt(CarbonAware.between(now, now.plus(5, HOURS)))
    .withDetails(() -> myService.sendNewlyRegisteredEmail()));
```

With the `JobBuilder`, it is possible to pass in an instance of `Temporal` using `scheduleAt()` or an instance of `TemporalAmount` using `scheduleIn()` to schedule the job to run after the specified duration from now. For Carbon Aware jobs, we again create a `CarbonAwarePeriod`.

The following subsection details the different possibilities for creating a carbon-sepcific schedule.

### Creating Carbon Aware Periods

The `CarbonAwarePeriod` class houses several utility methods to quickly create a period and add some carbon aware slack. There are two main possibilities:

1. `before(time)` is a simple way to express you want to get a job done before certain time _in the future_. This is an alias for `between(now(), time)`. 
2. `between(startTime, endTime)` is a way to express you want to kick a job into gears between a certain period _in the future_. It can accept the following class instances

Both methods accept the following class instances: `Instant`, `LocalDate`, `LocalDateTime` (using the system default zone ID), and `ZonedDateTime`. 

## Carbon Aware Recurring Jobs

> For general documentation on recurring jobs, see [Recurring Jobs]({{< ref "documentation/background-methods/recurring-jobs.md" >}}).

The following subsection details the different possibilities for creating a carbon-aware recurring job.

### Creating Carbon Aware Schedule Expressions using a utility class

The `CarbonAware` class houses several utility methods to quickly create a carbon aware schedule expression string:

1. `dailyBetween(fromHour, untilHour)`: allows relaxing of a daily schedule as long as it stays within `fromHour` and `untilHour` hours. Both parameters need to be in 24-hour format and should be within the same day (they cannot cross the 12-hour boundary: e.g. between 20H and 6H the next day); for that employ `using()` instead. 
2. `dailyBefore(untilHour)`: alias of `dailyBetween(0, untilHour)`
3. `cron(cronExpression, marginBefore, marginAfter)`: allows relaxing of a schedule expression string by `[marginBefore, marginAfter]` where `marginBefore` and `marginAfter` are `Duration` instances (e.g. `using("0 16 * * *", Duration.ofHours(1), ofHours(4))` will schedule between 15 p.m. and 20 p.m.). 
4. `cron(cronExpression, marginBeforeAndAfter)`: alias of `cron(cronExpression, marginBeforeAndAfter, marginBeforeAndAfter)`
4. `interval(fixedDelay, marginBefore, marginAfter)`: allows relaxing of a recurring job with a fixed delay between runs by `[marginBefore, marginAfter]` where all parameters are `Duration`s.
5. `interval(fixedDelay, marginBeforeAndAfter)`: alias of `interval(fixedDelay, marginBeforeAndAfter, marginBeforeAndAfter)`

> The `cron` method accepts any valid scheduleExpression string, meaning that you can use the same methods for custom schedules available in JobRunr Pro!

### Creating Carbon Aware Schedule Expressions manually

Of course, you always have the option to add the carbon aware margin to the CRON expression string by hand. We have extended the schedule expression notation (for cron or interval recurring jobs) to accept carbon aware margins. For example, you can either rely on `using()` as shown in the above section, or just create the string yourself:

```java
// Both are exactly the same
jobScheduler.scheduleRecurrently("rj-id", CarbonAware.using("0 16 * * *", Duration.ofHours(1), ofHours(4)), x->doWork())
jobScheduler.scheduleRecurrently("rj-id", "0 16 * * * [PT1H/PT4H]", x->doWork())
```

The notation is `scheduleExpression [marginBefore/marginAfter]` (e.g., `0 8 * * * [PT0S/PT5H]` for a recurring running daily between 8 a.m. and 1 p.m.) where a space ` ` separates the usual schedule expression from the carbon aware margin, the square brackets `[]` identify the interval, and the slash `/` separates the margin from/margin to.

This notation allows use to specify margins when using the `@Recurring` annotation:

```java
@Recurring(id="doing-some-thing-recurrently-carbon-aware", cron="0 8 * * * [PT0S/PT5H]")
@Job(name="A job doing some work")
public void doWork() {
  // doing some work
}
```

In the Dashboard, in the Recurring Jobs tab, you can see whether a Cron is a carbon-specific Cron by hovering over the electrified leaf icon:

![](/documentation/carbon-aware-recurring-job-in-dashboard.png "Carbon aware cron info in the dashboard.")


## ⚠️ Important Remarks

When making use of carbon aware schedules, there are a few important things to keep in mind:

- If the **margin is too small**, the job will be scheduled right away instead. This depends from energy data provider to data provider and from area code to area code. Most providers return carbon intensity data with hourly margins, but the EU is migrating to each 15 minutes. The configured margin should be twice as big as the margins returned by the data provider (e.g. if hourly, at least three hours). It does not make sense to schedule a job carbon aware between now and one hour if JobRunr does not receive carbon info between that margin. 
- If the Carbon Intensity API is down or cannot be reached (e.g., because of a firewall), jobs will be scheduled at their preferred time.
- If the Carbon Intensity API has no forecast for a particular period, the job will be scheduled at their preferred time.
- If the deadline has passed (e.g. `between(now, now.plus(3, HOURS)` and it's past the third hour), the job will be scheduled immediately.
- If Carbon Aware Job Processing is disabled, remaining carbon aware jobs in `AWAITING` will be processed and scheduled at their preferred time.

For each of the above cases, a specific reason will be recorded that can be consulted in the dashboard when opening the job details. 
