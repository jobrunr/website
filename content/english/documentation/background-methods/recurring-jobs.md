---
title: "Recurring jobs"
subtitle: "Schedule recurring jobs with a single line of code using any CRON expression or interval."
keywords: ["java recurring job", "java cron job", "cron", "crontab", "java cron", "cron interval", "cron expression", "recurring jobs", "distributed job scheduler"]
description: "Create a CRON job in Java using JobRunr with only one line of code."
date: 2020-09-16T11:12:23+02:00
layout: "documentation"
menu: 
  sidebar: 
    identifier: recurring-jobs
    parent: 'background-methods'
    weight: 30
---

Creating a recurring job (either a CRON job or a job with a fixed defined interval) is just as simple as creating a background job – you only need to write a single line of code (and it is even less if you use the [`jobrunr-spring-boot-2-starter`]({{<ref "/documentation/configuration/spring/_index.md">}}), [`jobrunr-spring-boot-3-starter`]({{<ref "/documentation/configuration/spring/_index.md">}}) , [`jobrunr-micronaut-feature`]({{<ref "/documentation/configuration/micronaut/_index.md">}}) or the [`jobrunr-quarkus-extension`]({{<ref "/documentation/configuration/quarkus/_index.md">}}) ).

On this page you can learn about:

- [Creating a recurring job using a CRON expression](#using-a-cron-expression)
- [Creating a recurring job using an Interval](#using-an-interval)
- [Making a carbon aware recurring job](#making-recurring-jobs-carbon-aware)
- [Managing recurring jobs](#managing-recurring-jobs)
- [Deleting recurring jobs](#deleting-recurring-jobs)
- {{< label version="professional" >}}JobRunr Pro{{< /label >}} [Pause and Resume recurring jobs](#pause-and-resume-recurring-jobs)
- {{< label version="professional" >}}JobRunr Pro{{< /label >}} [Recurring jobs with limited lifetime](#recurring-jobs-with-limited-lifetime)
- {{< label version="professional" >}}JobRunr Pro{{< /label >}} [Advanced Cron Expressions](#advanced-cron-expressions)
- {{< label version="professional" >}}JobRunr Pro{{< /label >}} [Custom Recurring Job Schedules](#custom-recurring-job-schedules)
- {{< label version="professional" >}}JobRunr Pro{{< /label >}} [Recurring jobs missed during downtime](#recurring-jobs-missed-during-downtime)
- {{< label version="professional" >}}JobRunr Pro{{< /label >}} [Concurrent recurring jobs](#concurrent-recurring-jobs)
- [Important remarks!](#important-remarks)


> Note that JobRunr OSS supports up to **100 recurring jobs** (depending on the performance of your SQL or NoSQL database). Do you need to run more than 100 recurring jobs? This is supported in [JobRunr Pro](/en/pricing/)!

> Note that recurring jobs may not be executed on the exact moment you specify using your CRON expression: Whenever JobRunr fetches all the jobs that are scheduled and need to be executed, it fetches all jobs that need to happen in the next poll interval and enqueues them immediately. This may result in a difference of a couple of seconds. If you need real-time scheduling, then have a look at [JobRunr Pro](/en/documentation/pro/real-time-scheduling).


## Using a CRON expression

<figure>

```java
BackgroundJob.scheduleRecurrently(Cron.daily(), () -> System.out.println("Easy!"));
```
</figure>

This line creates a new recurring CRON job entry in the `StorageProvider`. A special component in `BackgroundJobServer` checks the recurring jobs with a fixed interval (the `pollIntervalInSeconds`) and then enqueues them as fire-and-forget jobs. This enables you to track them as usual.

The `Cron` class contains different methods and overloads to run jobs on a minute, hourly, daily, weekly, monthly and yearly basis. You can also use a standard CRON expressions to specify a more complex schedule:

<figure>

```java
BackgroundJob.scheduleRecurrently("0 12 * */2", () -> System.out.println("Powerful!"));
```
</figure>


All these methods are also available on the `JobScheduler` and `JobRequestScheduler` bean:

<figure>

```java
@Inject
private JobScheduler jobScheduler;

jobScheduler.scheduleRecurrently(Cron.daily(), () -> System.out.println("Easy!"));
```
</figure>

<figure>

```java
@Inject
private JobRequestScheduler jobRequestScheduler;

jobRequestScheduler.scheduleRecurrently(Cron.daily(), new SysOutJobRequest("Easy!"));
```
</figure>


You can also create a recurring job with a CRON expression using the builder pattern:
<figure>

```java
@Inject
private JobScheduler jobScheduler;

jobScheduler.createRecurrently(aRecurringJob()
    .withCron(Cron.daily())
    .withDetails(() -> System.out.println("I'm created by the builder!"));
    
```
</figure>


If you are using the `jobrunr-spring-boot-starter`, the `jobrunr-micronaut-feature` or the `jobrunr-quarkus-extension` this becomes even easier: just add the `@Recurring` annotation to any bean method and JobRunr will schedule it as a recurring job:

<figure>

```java
@Recurring(id = "my-recurring-job", cron = "*/5 * * * *")
@Job(name = "My recurring job")
public void executeSampleJob() {
    // your business logic here
}
```
</figure>

## Using an Interval
Instead of giving a Cron expression, you can also give a duration. This will make sure that the recurring job will now be executed using a fixed interval starting as soon as the interval triggers (e.g. if your interval is `PT5M`, your first job will be enqueued after five minutes).

<figure>

```java
BackgroundJob.scheduleRecurrently(Duration.parse("P5D"), () -> System.out.println("Easy!"));
```
</figure>

Also in this case, you can create a recurring job with a fixed interval using the builder pattern:
<figure>

```java
@Inject
private JobScheduler jobScheduler;

jobScheduler.createRecurrently(aRecurringJob()
    .withInterval(Duration.ofDays(3))
    .withDetails(() -> System.out.println("I'm created by the builder!"));
    
```
</figure>


If you are using the `jobrunr-spring-boot-starter`, the `jobrunr-micronaut-feature` or the `jobrunr-quarkus-extension` this stays as easy as with a CRON expression: add the `@Recurring` annotation to any bean method with the `interval` attribute where you can pass an ISO8601 duration. JobRunr will schedule it again as a recurring job using the provided interval:

<figure>

```java
@Recurring(id = "my-recurring-job", interval = "P2D8H")
@Job(name = "My recurring job")
public void executeSampleJob() {
    // your business logic here
}
```
</figure>

## Making recurring jobs carbon aware

You can add margins to a recurring job schedule expression to let JobRunr run the job at a low carbon intensity moment. You can find more details on the dedicated [carbon aware job processing](/en/documentation/background-methods/carbon-aware-jobs/) page.


## Managing recurring jobs
Each recurring job has its own unique identifier. In the previous examples it was generated implicitly, using the type and method names of the given lambda expression (resulting in "`System.out.println()`" as the identifier). The `BackgroundJob` and `JobScheduler` class contains overloads that take an explicitly defined job identifier. This way, you can refer to the job later on.

<figure>

```java
BackgroundJob.scheduleRecurrently("some-id", "0 12 * */2",
  () -> System.out.println("Powerful!"));
```
</figure>

If you are using the `JobBuilder` pattern, this becomes:

<figure>

```java
BackgroundJob.createRecurrently(aRecurringJob()
    .withId("some-id")
    .withCron("0 12 * */2")
    .withDetails(() -> System.out.println("Powerful!")));
```
</figure>

The methods above will create a new recurring job if no recurring job with that id exists or else update the existing job with the given identifier.

> Identifiers should be unique - use unique identifiers for each recurring job, otherwise you’ll end with a single job.

## Deleting recurring jobs
You can remove an existing recurring job either via the dashboard or by calling the `BackgroundJob.delete` method with the id of the recurring job. It does not throw an exception when there is no such recurring job.

## Pause and Resume recurring jobs
{{< label version="professional" >}}JobRunr Pro{{< /label >}} 

Using JobRunr Pro, you can pause and resume recurring jobs from the dashboard and using the API.

## Recurring jobs with limited lifetime
{{< label version="professional" >}}JobRunr Pro{{< /label >}} 

By default, a `RecurringJob` is active for the entire lifetime of an application (unless [paused](#pause-and-resume-recurring-jobs)).

__With JobRunr Pro you can provide an end time__: each `RecurringJob` with a `deleteAt` in the passed will stop scheduling new jobs. JobRunr will also automatically remove the `RecurringJob` from the DB.

You can enable the feature using `@Job`:

<figure>

```java
@Recurring(id = "my-recurring-job", interval = "P2D8H", deleteAt = "2025-06-01T14:00:00Z")
@Job(name = "My recurring job")
public void executeSampleJob() {
    // your business logic here
}
```
</figure>

If you are using the `JobBuilder`, this is also possible:
<figure>

```java
BackgroundJob.createRecurrently(aRecurringJob()
    .withId("some-id")
    .withCron(Cron.daily())
    .withDeleteAt(Instant.parse("2025-06-01T14:00:00Z"))
    .withDetails(() -> System.out.println("Schedule me up to the 2025-06-01T14:00:00Z")));
```
</figure>

## Advanced CRON Expressions
{{< label version="professional" >}}JobRunr Pro{{< /label >}} 

Do you need to run recurring jobs on some special moments like the first business day of the month or the last business day of the month? JobRunr Pro has a CRON expression parser on steroids and supports your really complex schedule requirements.

### `L` character
`L` stands for "last". When used in the day-of-week field, it allows specifying constructs such as "the last Friday" (`5L`) of a given month. In the day-of-month field, it specifies the last day of the month.

__Some examples:__
- `0 0 * * 5L`: midnight the last Friday of each month
- `0 0 * 2 1L`: midnight the last Monday of each February
- `0 0 L *  *`: midnight the last day of each month
- `0 0 L 2  *`: midnight the last day of each February

### `#` character
`#` is allowed for the day-of-week field, and must be followed by a number between one and five. It allows specifying constructs such as "the second Friday" of a given month.

__Some examples:__
- `0 0 * * 1#1`: midnight the first Monday of each month
- `0 0 * 1 1#1`: midnight the first Monday of each January
- `0 0 * * 5#3`: midnight the third Friday of each month

### `W` character
The `W` character is allowed for the day-of-month field. This character is used to specify the weekday (Monday-Friday) nearest the given day. As an example, if "15W" is specified as the value for the day-of-month field, the meaning is: "the nearest weekday to the 15th of the month." So, if the 15th is a Saturday, the trigger fires on Friday the 14th. If the 15th is a Sunday, the trigger fires on Monday the 16th. If the 15th is a Tuesday, then it fires on Tuesday the 15th. However, if "1W" is specified as the value for day-of-month, and the 1st is a Saturday, the trigger fires on Monday the 3rd, as it does not 'jump' over the boundary of a month's days. The 'W' character can be specified only when the day-of-month is a single day, not a range or list of days.

__Some examples:__
- `0 0 1W * *`: midnight the first Monday of each month
- `0 0 1W+2 * *`: midnight 2 days after the first Monday of each month
- `0 0 20W * *`: midnight on the 20th or the closest workday to the 20th

## Custom Recurring Job Schedules
{{< label version="professional" >}}JobRunr Pro{{< /label >}} 

Do you have really complex recurring job schedule? Just extend the class `org.jobrunr.scheduling.custom.CustomSchedule` and implement one method where you provide the next `java.time.Instant` your job should run. For example, suppose you have a recurring job to run that needs to run once a day but can run every half hour during weekends:

<figure>

```java
@Recurring(id = "my-recurring-job", customSchedule = "com.project.services.MySchedule()")
public void myRecurringMethod(JobContext jobContext) {
    System.out.print("My recurring job method");
}
```

With `MySchedule` being:

```java
public class MySchedule extends CustomSchedule {
    private final CronExpression everyHalfHour = new CronExpression(Cron.everyHalfHour());
    private final CronExpression daily = new CronExpression(Cron.daily());

    @Override
    public Instant next(Instant createdAtInstant, Instant currentInstant, ZoneId zoneId) {
        var day = currentInstant.atZone(zoneId).getDayOfWeek();
        if(day == DayOfWeek.SATURDAY || day == DayOfWeek.SUNDAY) {
            return everyHalfHour.next(createdAtInstant, currentInstant, zoneId);
        }
        return daily.next(createdAtInstant, currentInstant, zoneId);
    }

    @Override
    public String asString() {
        return CustomSchedule.expressionFor(MySchedule.class, "");
    }
}

```

JobRunr Pro will instantiate the class com.project.services.MySchedule and pass the content between the parentheses as input to the constructor. You can use any amount of `String` inputs you want to determine when the recurring job should run: this could also be for example `com.project.services.MySchedule(2025-01-01T01:00:00.000Z,2026-01-01T01:00:00.000Z,2027-01-01T01:00:00.000Z)`. See the Javadoc on `CustomSchedule` for more examples on how to correctly make use of the class.

> ⚠️ Your `CustomSchedule` implementation must not throw an exception as this will result in an unexpected behavior, and in the worst case will kill the JobRunr background job processing server. 

## Recurring jobs missed during downtime
{{< label version="professional" >}}JobRunr Pro{{< /label >}} 

If for some reason all of your servers are down (e.g. deploying a new version / scheduled down time / ...), JobRunr OSS skips these recurring jobs: as there is no background job server running, it will not be able to schedule these recurring jobs.


__JobRunr Pro improves this and adds the capability to catch up all of the skipped recurring jobs__: for each run that was skipped during the downtime for a certain recurring job, it will schedule a job.

This feature is disabled by default and can be enabled using the following setting:

<figure>

```java
@Recurring(id = "my-recurring-job", interval = "P2D8H", scheduleJobsSkippedDuringDowntime=true)
@Job(name = "My recurring job")
public void executeSampleJob() {
    // your business logic here
}
```
</figure>

If you are using the `JobBuilder`, this is also possible:
<figure>

```java
BackgroundJob.createRecurrently(aRecurringJob()
    .withId("some-id")
    .withCron("0 12 * */2")
    .withScheduleJobsSkippedDuringDowntime()
    .withDetails(() -> System.out.println("Powerful!")));
```
</figure>


## Concurrent recurring jobs
{{< label version="professional" >}}JobRunr Pro{{< /label >}}

JobRunr by default does not allow concurrent recurring jobs - the reason being is that if your recurring jobs for some reason take longer than the given CRON expression or interval, you may create more jobs than you can process.
So, if a job instance created by a recurring job is still in state `SCHEDULED`, `ENQUEUED` or `PROCESSING` and it's time to again queue a new instance of the recurring job then this last instance will not be created.

Sometimes the business requirements define that recurring jobs may not be skipped in any case and your recurring job runs very fast in 95% of the cases. But you have some outliers (e.g. due to a lot of work to process) that may take longer than the given CRON expression or interval. **JobRunr Pro comes to the rescue** with the option `maxConcurrentJobs` to create a certain amount of job instances of that recurring job that will run concurrently.

By default, `maxConcurrentJobs` is set to 1 but this setting can be changed per recurring job:

<figure>

```java
@Recurring(id = "my-recurring-job", interval = "PT5M", maxConcurrentJobs=4)
@Job(name = "My recurring job")
public void executeSampleJob() {
    // if for some reason this method takes more than 5 minutes (=PT5M), 
    // JobRunr will create up to 4 concurrent job instances of this recurring job
}
```
</figure>

If you are using the JobBuilder, this is also possible:
<figure>

```java
BackgroundJob.createRecurrently(aRecurringJob()
    .withId("some-id")
    .withInterval(Duration.ofMinutes(5))
    .withMaxConcurrentJobs(4)
    .withDetails(() -> System.out.println("Powerful!")));
```
</figure>


## Important remarks!
> __Remark 1:__ for recurring jobs to work, at least one BackgroundJobServer should be running all the time.

> __Remark 2:__ also, for recurring job to work, they should be registered at application startup (which can either be a webapp, a console app, ...). This is different for each application/environment. The easiest way to do so is via the `@Recurring` annotation that ships with the `jobrunr-spring-boot-starter`, the `quarkus-jobrunr` extension or the `jobrunr-micronaut-feature` as shown above. If you are not using an integration with a certain framework, you will need to register these scheduled jobs yourselves using Container Startup Event listeners.

> __Remark 3:__ please note that the __cron interval__ or __duration__ for your recurring jobs __must be more than your `pollIntervalInSeconds`__. If your `pollIntervalInSeconds` is greater than your cron interval or duration of your recurring jobs, JobRunr will launch multiple instances of the same recurring job to keep up. This means that the same recurring job will be launched multiple times at the same moment.

> __Remark 4:__ also note that the __smallest possible cron interval__ for your recurring jobs is __every 5 seconds__. JobRunr prevents creating recurring jobs with cron values less than every 5 seconds (e.g. every second) as it would generate too much load on your StorageProvider (SQL or noSQL database).
