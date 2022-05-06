---
title: "Recurring jobs"
subtitle: "Schedule recurring jobs with a single line of code using any CRON expression."
keywords: ["java recurring job", "java cron job", "cron", "crontab", "java cron"]
date: 2020-09-16T11:12:23+02:00
layout: "documentation"
menu: 
  main: 
    identifier: recurring-jobs
    parent: 'background-methods'
    weight: 30
---
Creating a recurring job (also known as a CRON or crontab job) is just as simple as creating a background job – you only need to write a single line of code (and it is even less if you use the `jobrunr-spring-boot-starter`, `jobrunr-micronaut-feature` or the `jobrunr-quarkus-extension`):

> Note that recurring jobs may not be executed on the exact moment you specify using your CRON expression: Whenever JobRunr fetches all the jobs that are scheduled and need to be executed, it fetches all jobs that need to happen in the next poll interval and enqueues them immediately. This may result in a difference of a couple of seconds.

## Using a Cron expression
<figure>

```java
BackgroundJob.scheduleRecurrently(Cron.daily(), () -> System.out.println("Easy!"));
```
</figure>

This line creates a new recurring CRON job entry in the `StorageProvider`. A special component in `BackgroundJobServer` checks the recurring jobs on a minute-based interval and then enqueues them as fire-and-forget jobs. This enables you to track them as usual.

> __Remark:__ for recurring methods to work, at least one BackgroundJobServer should be running all the time and the jobs should be registered on startup of your application.
> Also note that the __smallest possible cron interval__ for your recurring jobs is __every 5 seconds__. JobRunr prevents creating recurring jobs every with cron values less than 5 seconds (e.g. every second) as it would generate too much load on your StorageProvider (SQL or noSQL database).

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

## Using a Duration 
Instead of giving a Cron expression, you can also give a duration. This will make sure that the recurring job will now be executed using a fixed interval starting the moment the recurring job was scheduled.

<figure>

```java
BackgroundJob.scheduleRecurrently(Duration.parse("P5D"), () -> System.out.println("Easy!"));
```
</figure>


All the examples above create a new recurring job entry in the `StorageProvider`. A special component in `BackgroundJobServer` checks the recurring jobs on a minute-based interval and then enqueues them as fire-and-forget jobs. This enables you to track them as usual.


### Specifying identifiers
Each recurring job has its own unique identifier. In the previous examples it was generated implicitly, using the type and method names of the given call expression (resulting in "`System.out.println`" as the identifier). The `BackgroundJob` and `JobScheduler` class contains overloads that take an explicitly defined job identifier. This way, you can refer to the job later on.

<figure>

```java
BackgroundJob.scheduleRecurrently("some-id", "0 12 * */2",
  () -> System.out.println("Powerful!"));
```

The call to the `scheduleRecurrently` method will create a new recurring job if no recurring job with that id exists or else update the existing job with that identifier.

> Identifiers should be unique - use unique identifiers for each recurring job, otherwise you’ll end with a single job.

### Manipulating recurring jobs
You can remove an existing recurring job by calling the `BackgroundJob.delete` method. It does not throw an exception when there is no such recurring job.

### Registering your recurring jobs
To make sure that your recurring jobs are properly registered, you need to make sure that the code to register these jobs (e.g. the examples above), is run when your application starts (which can either be a webapp, a console app, ...). This is different for each application/environment. The easiest way to do so is via the `@Recurring` annotation that ships with the `jobrunr-spring-boot-starter`, the `quarkus-jobrunr` extension or the `jobrunr-micronaut-feature`. Here are some examples on how it could be done:

###### Spring Framework
__Using JobRunr's @Recurring annotation__
```java
@Service
public class SampleService {

    @Recurring(id = "my-recurring-job", cron = "*/5 * * * *")
    @Job(name = "My recurring job")
    public void executeSampleJob() {
        // your business logic here
        // you can also conditionally enqueue a new job - better visibility in the dashboard
    }
}
```


###### Micronaut
__Using JobRunr's @Recurring annotation__
```java
@Singleton
public class SampleService {

    @Recurring(id = "my-recurring-job", cron = "*/5 * * * *")
    @Job(name = "My recurring job")
    public void executeSampleJob() {
        // your business logic here
        // you can also conditionally enqueue a new job - better visibility in the dashboard
    }
}
```


###### Quarkus
__Using JobRunr's @Recurring annotation__
```java
@ApplicationScoped
@RegisterForReflection
public class SampleService {

    @Recurring(id = "my-recurring-job", cron = "*/5 * * * *")
    @Job(name = "My recurring job")
    public void executeSampleJob() {
        // your business logic here
        // you can also conditionally enqueue a new job - better visibility in the dashboard
    }
}
```


###### Other ways
If you are not using an integration with a certain framework, you will need to register these scheduled jobs yourselves using Container Startup Event listeners.