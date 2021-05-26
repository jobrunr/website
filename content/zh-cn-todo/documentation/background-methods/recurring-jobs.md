---
title: "Recurring jobs"
subtitle: "Schedule recurring jobs with a single line of code using any CRON expression."
date: 2020-04-30T11:12:23+02:00
layout: "documentation"
menu: 
  main: 
    identifier: recurring-jobs
    parent: 'background-methods'
    weight: 30
---
Registering a recurring job is just as simple as registering a background job – you only need to write a single line of code:

<figure>

```java
BackgroundJob.scheduleRecurrently(() -> System.our.println("Easy!"), Cron.daily());
```
</figure>

This line creates a new recurring job entry in the `StorageProvider`. A special component in `BackgroundJobServer` checks the recurring jobs on a minute-based interval and then enqueues them as fire-and-forget jobs. This enables you to track them as usual.

> Remark: for recurring methods to work, at least one BackgroundJobServer should be running all the time

The Cron class contains different methods and overloads to run jobs on a minute, hourly, daily, weekly, monthly and yearly basis. You can also use standard CRON expressions to specify a more complex schedule:

<figure>

```java
BackgroundJob.scheduleRecurrently(() -> System.our.println("Powerful!), "0 12 * */2");
```
</figure>


All these methods are also available on the JobScheduler bean:

<figure>

```java
@Inject
private JobScheduler jobScheduler;

jobScheduler.scheduleRecurrently(() -> System.our.println("Easy!), Cron.daily());
```
</figure>

### Specifying identifiers
Each recurring job has its own unique identifier. In the previous examples it was generated implicitly, using the type and method names of the given call expression (resulting in "`System.out.println`" as the identifier). The `BackgroundJob` and `JobScheduler` class contains overloads that take an explicitly defined job identifier. This way, you can refer to the job later on.

<figure>

```java
BackgroundJob.scheduleRecurrently("some-id", 
  () -> System.our.println("Powerful!), "0 12 * */2");
```

The call to the `scheduleRecurrently` method will create a new recurring job if no recurring job with that id exists or else update the existing job with that identifier.

> Identifiers should be unique - use unique identifiers for each recurring job, otherwise you’ll end with a single job.

### Manipulating recurring jobs
You can remove an existing recurring job by calling the `BackgroundJob.deleteRecurringly` method. It does not throw an exception when there is no such recurring job.