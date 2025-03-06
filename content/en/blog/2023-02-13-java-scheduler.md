---
title: "JobRunr - the best Java Scheduler?"
summary: "Easily schedule jobs in Java and monitor them using JobRunr"
feature_image: /blog/job-schedueler.webp
date: 2025-03-05T09:12:23+02:00
author: "Ronald Dehuysser"
tags:
  - blog
  - meta
images: ["/blog/meme-job-schedueler.webp"]

---
{{< trial-button >}}

## What is a Scheduler in Java?
In Java, a scheduler is a tool that allows you to execute tasks or jobs at a specific time or after a specific interval.
This is useful for tasks such as sending emails, create recurring automated reports, batch import files from XML or JSON or performing any other type of automated task.

## Which is the Best Scheduler for Java?
When it comes to choosing the best scheduler for Java, JobRunr stands out from the competition. While there are some other scheduler frameworks available for Java, including the standard `java.util.TimerTask` and `java.util.concurrent.ScheduledExecutorService`, Quartz and DB-Scheduler, JobRunr offers a number of advantages over these traditional frameworks.
Features of JobRunr include:
- a really easy API that allows you to schedule any job with just one line of code or by means of the `@Recurring` annotation
- an embedded dashboard showing you the status of each job
- distributed execution over different JVM instances
- integration with various frameworks including Spring Boot, Micronaut and Quarkus.

Unlike Quartz, which is quite a heavy and complex framework, JobRunr is a more modern, lightweight, and easy-to-use scheduler. Additionally, JobRunr is designed with enterprise-grade capabilities, providing reliability, security, and support for large-scale production deployments.

## What Types of Job Scheduling Exist?
When it comes to scheduling jobs in Java, there are three main types of scheduling to consider: direct execution, scheduled execution in the future, and recurring execution by means of a cron expression.

- **Direct execution**: This type of scheduling is used when you want a job to be executed immediately. It is often used for one-off tasks or to distribute load over multiple servers. JobRunr allows to create a one-off job by means the the `enqueue` function on the `BackgroundJob` class or the `JobScheduler` class.
<figure style="width: 100%; margin-left: 3em; margin-top: -1em;">

```java
BackgroundJob.enqueue(() -> System.out.println("This will run immediately and perhaps even on another server"));
```
</figure>

- **Scheduled execution in the future**: This type of scheduling allows you to schedule a job to be executed at a specific time in the future. This is useful for tasks that need to be executed at a specific time, such as sending out reminders or triggering reports. To do so, you can use the `schedule` method in JobRunr:
<figure style="width: 100%; margin-left: 3em; margin-top: -1em;">

```java
BackgroundJob.schedule(Instant.now().plus(5, DAYS), () -> System.out.println("This will run 5 days from now!"));
```
</figure>

- **Recurring execution by means of a cron expression**: This type of scheduling is used when you want a job to be executed repeatedly at specific intervals, such as every day, every week, or every month. 
<figure style="width: 100%; margin-left: 3em; margin-top: -1em;">

```java
BackgroundJob.scheduleRecurrently("*/5 * * * *", () -> System.out.println("This will be printed every 5 minutes!"));
```
</figure>
<br />

## How to implement Job Scheduling in Java with JobRunr?
Getting started with JobRunr as a Java Scheduler is really easy - in fact we promise you will be up & running in 5 minutes! In this example, we will use the Spring Boot Starter to quickly add scheduling to your Spring Boot application.

### 1. Add the JobRunr dependency to your project
Using your build tool of choice, add the dependency to the JobRunr Spring Boot Starter artifact. We'll be using Maven in this example, so we need to have the following declared in our `pom.xml`:

<figure style="width: 50%; margin: 0 auto 1em 0">

```xml
<dependency>
  <groupId>org.jobrunr</groupId>
  <artifactId>jobrunr-spring-boot-2-starter</artifactId>
  <version>6.0.0</version>
</dependency>
```
</figure>

### 2. Make sure you have a StorageProvider
JobRunr will need to save your jobs in a SQL or NoSQL database by means of a `StorageProvider`. Thanks to the `jobrunr-spring-boot-2-starter`, JobRunr will automatically try to use your existing `DataSource`. In this example, we will use the H2 Database. To do so, also add the H2 dependency to your `pom.xml`.

<figure style="width: 50%; margin: 0 auto 1em 0">

```xml
<dependency>
    <groupId>com.h2database</groupId>
    <artifactId>h2</artifactId>
</dependency>
```
</figure>

### 3. Configure JobRunr using Spring's application.properties.
To configure JobRunr, you can leverage the `application.properties` file from Spring Boot. In this example, we will enable all off JobRunr's features including the actual job processing and the dashboard.

<figure style="width: 50%; margin: 0 auto 1em 0">

```
org.jobrunr.background-job-server.enabled=true
org.jobrunr.dashboard.enabled=true
```
</figure>


### 4. Start creating jobs using JobRunr's java job scheduler API
###### Easily create one-off jobs:
Now that we have setup our dependencies, we can easily create fire-and-forget jobs using the `enqueue` method:

<figure style="width: 80%; margin: 0 auto 1em 0">

```java
@Inject
private JobScheduler jobScheduler;
 
jobScheduler.enqueue(() -> myService.doWork());
```
<figcaption>Enqueueing background jobs using the JobScheduler bean</figcaption>
</figure>

This line makes sure that the lambda – including type, method, and arguments – is serialized as JSON to persistent storage (an RDBMS like Oracle, Postgres, MySql, and MariaDB or a NoSQL database).

A dedicated worker pool of threads running in all the different BackgroundJobServers will then execute these queued background jobs as soon as possible, in a first-in-first-out manner. JobRunr guarantees the **execution of your job by a single worker** by means of optimistic locking.


###### Schedule a job in the future:
We can also schedule jobs in the future using the schedule method:


<figure style="width: 80%; margin: 0 auto 2em 0">

```java
@Inject
private JobScheduler jobScheduler;
 
jobScheduler.schedule(now().plus(8, HOURS), () -> myService.doWork());
```
<figcaption>Scheduling a job in the future using the JobRunr Job Scheduler</figcaption>
</figure>

###### Schedule a recurrent job using a CRON expression:
If we want to have recurrent jobs, we need to use the `scheduleRecurrently` method:

<figure style="width: 80%; margin: 0 auto 2em 0">

```java
@Inject
private JobScheduler jobScheduler;
 
jobScheduler.scheduleRecurrently(Cron.daily(), () -> myService.doWork());
```
<figcaption>Scheduling a recurring jobs using a CRON expression</figcaption>
</figure>


### 5. Visit the dashboard and see how your jobs are doing!
<figure>
<img src="/documentation/jobs-enqueued.webp" class="kg-image">
<figcaption>An overview of all enqueued jobs</figcaption>
</figure>


## Conclusion
JobRunr is probably the best choice for a scheduler in any Java project.
With its modern features and simple API, you can quickly and easily create one-off jobs, schedule jobs to run at a specific time or after a specific interval.

JobRunr's enterprise-grade capabilities ensure reliability, security, and support for large-scale production deployments, making it the ideal choice for any Java scheduling needs. And, it also comes with great support if you take a [JobRunr Pro license]({{< ref "/pricing.md" >}}).

<div style="display:none;>

![](/blog//meme-job-schedueler.webp "Overview of JobRunr Architecture to run RAG workflows")

</div>