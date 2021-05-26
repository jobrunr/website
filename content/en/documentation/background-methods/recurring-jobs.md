---
title: "Recurring jobs"
subtitle: "Schedule recurring jobs with a single line of code using any CRON expression."
keywords: ["java recurring job", "java cron job"]
date: 2020-09-16T11:12:23+02:00
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
BackgroundJob.scheduleRecurrently(Cron.daily(), () -> System.out.println("Easy!"));
```
</figure>

This line creates a new recurring job entry in the `StorageProvider`. A special component in `BackgroundJobServer` checks the recurring jobs on a minute-based interval and then enqueues them as fire-and-forget jobs. This enables you to track them as usual.

> Remark: for recurring methods to work, at least one BackgroundJobServer should be running all the time and the jobs should be registered on startup of your application.

The Cron class contains different methods and overloads to run jobs on a minute, hourly, daily, weekly, monthly and yearly basis. You can also use standard CRON expressions to specify a more complex schedule:

<figure>

```java
BackgroundJob.scheduleRecurrently("0 12 * */2", () -> System.out.println("Powerful!"));
```
</figure>


All these methods are also available on the JobScheduler bean:

<figure>

```java
@Inject
private JobScheduler jobScheduler;

jobScheduler.scheduleRecurrently(Cron.daily(), () -> System.out.println("Easy!"));
```
</figure>

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
To make sure that your recurring jobs are properly registered, you need to make sure that the code to register these jobs (e.g. the examples above), is run when your application starts (which can either be a webapp, a console app, ...). This is different for each application/environment. Here are some examples on how it could be done:

###### Spring Framework
__Using Spring's @PostConstruct__
```java
@Configuration
public class MyConfiguration {

    @PostConstruct
    public void registerRecurrentlyJobs(JobScheduler jobScheduler) {
        jobScheduler.<SampleJobService>scheduleRecurrently("recurring-sample-job", every5minutes(), x -> x.executeSampleJob("Hello from recurring job"));
    }
}
```

__Or, on start of your Spring Boot Application__
```java
@SpringBootApplication
@Import(JobRunrExampleConfiguration.class)
public class JobRunrApplication {

    public static void main(String[] args) {
        ConfigurableApplicationContext applicationContext = SpringApplication.run(JobRunrApplication.class, args);

        JobScheduler jobScheduler = applicationContext.getBean(JobScheduler.class);
        jobScheduler.<SampleJobService>scheduleRecurrently("recurring-sample-job", every5minutes(), x -> x.executeSampleJob("Hello from recurring job"));
    }
}
```

###### Quarkus
```java
@ApplicationScoped
class CoolService {
  @Inject
  JobScheduler jobScheduler;

  void startup(@Observes StartupEvent event) { 
      jobScheduler.<SampleJobService>scheduleRecurrently("recurring-sample-job", every5minutes(), x -> x.executeSampleJob("Hello from recurring job"));
  }
}
```