---
title: "JobRunr: the best Java Scheduler?"
description: "What a job scheduler in Java does, how to choose one (ScheduledExecutorService, @Scheduled, Quartz, JobRunr) and a step-by-step Spring Boot 4 tutorial with JobRunr."
image: /blog/job-scheduler.webp
date: 2025-03-05T09:12:23+02:00
lastmod: 2026-11-16T10:00:00+01:00
author: "Ronald Dehuysser"
tags:
  - blog
  - meta
images: ["/blog/meme-job-schedueler2.webp"]

---
{{< trial-button >}}

## What is a job scheduler in Java?

In Java, a scheduler is a tool that allows the execution of tasks or jobs at a given time, interval, or condition. A scheduler allows to reliably automate tasks such as mass emailing, document/image processing (e.g, medical image analysis, or [RAG chatbots]({{< ref "/blog/Simplified-RAG-Workflows-in-Java.md" >}})), [order fulfilment](https://foojay.io/today/getting-started-with-jobrunr-a-powerful-task-scheduler-in-ja/), notification management, reporting, [and more]({{< ref "/use-case" >}}). It has the potential to simplify workflows and increase productivity through retry mechanisms that reduce errors and manual intervention.

Job schedulers are obviously well suited for batch processing, but they are really suited for any task that can be delayed (e.g., a registration confirmation email). Their use allows greater control over computing resources, preventing system overloads and keeping costs under control.

Given the benefits and capabilities, job schedulers are a valuable addition to a wide range of industries, including healthcare, finance, and e-commerce. They are especially important for applications where workload automation is mission critical.

> Using a good job scheduler greatly reduces the burden on teams, allowing them to focus on innovating instead of maintaining.

## What makes a good scheduler?

A good job scheduler is a tool that allows developers to automate and manage tasks in a transparent and straightforward way, while ensuring reliability and scalability. Here are the key features, we believe, a good scheduler should have:

- **Essential scheduling features:** a scheduler should be able to *handle one-time scheduling* (for fire-and-forget or delayed tasks) and *recurring scheduling* (e.g., for cron jobs). Under normal circumstances, the scheduler should also ensure that once registered, *a task is executed, once and only once*, so the same task never runs in parallel.
- **Developer-friendly:** tools should not get in the way of solving actual business problems and hinder productivity. Therefore a job scheduler should be *easy-to-use*, with a *simple straightforward AP*I, and easy to *integrate into existing applications*. Additionally, the scheduler should possess an *extensible architecture*.
- **Fault tolerance:** schedulers should have mechanisms to *handle errors*, and *automatically retry jobs should be built-into the system* to ensure that tasks are successfully completed even under unpredictable conditions (e.g., network failure, unexpected system shutdown, etc.). Fault tolerance indirectly *increases productivity*, as developers will no longer need to monitor the system closely and manually restart failed processes. This important feature is *often missing or incomplete in simpler schedulers*. For jobs that do several things in a row, a retry should also not redo the steps that already succeeded. That is what *durable jobs* give you, for example with `runStepOnce` in JobRunr.
- **Distributed processing:** processing of tasks across multiple servers is a must for systems that should never go down (thus requiring high availability) or where the expected load cannot be handled by a single machine.
- **Real-time monitoring:** asynchronous job processing systems are opaque, often we *do not know when a task starts or finishes*. Without realtime monitoring capabilities to *provide visibility into task execution*, a failure may go unnoticed for days. The scheduler should make it easy to identify and proactively resolve issues.
- **Reliability:** a job scheduler should be *well tested* and *actively maintained* to evolve with user needs and fix critical bugs. Furthermore, a job scheduling tool, should keep its *number of third-party dependencies to a minimum*, for *better security insurance*.

To summarise, a good scheduler is one that is easy-to-use, reliable, and designed to meet the demands of modern applications. With these features, it enables teams to easily automate workflows, while ensuring stability and scalability.

JobRunr ticks all these boxes, making it the ideal choice for teams looking to improve their workload automation and increase productivity.

> Of course, a scheduler can have more features than those listed, such as [priority queues]({{< ref "/documentation/pro/priority-queues" >}}), [multi-tenancy]({{< ref "/documentation/pro/dynamic-queues" >}}), [rate limiting]({{< ref "/documentation/pro/rate-limiters" >}}), etc., which makes it even better, as long as they do not make it more complex.

## Choosing the best Java job scheduler

There are many job scheduling frameworks in Java: the standard built-in `java.util.Timer` with `TimerTask` and `java.util.concurrent.ScheduledExecutorService`, framework features such as Spring's `@Scheduled`, or [third-party job schedulers]({{< ref "/blog/2024-10-31-task-schedulers-java-modern-alternatives-to-quartz">}}) such as JobRunr, db-scheduler and Quartz.

The right one depends less on taste than on two questions: does a job have to survive a restart, and how many instances of your application run at the same time? This is how the options line up:

| Option | Jobs survive a restart | Safe with several instances | Retries | Monitoring |
|---|---|---|---|---|
| `Timer` / `ScheduledExecutorService` | No, they live in memory | No, every instance runs them | Write them yourself | None |
| Spring `@Scheduled` | No | No, every instance runs them | No | None |
| Spring `@Scheduled` + ShedLock | No | Yes, a lock keeps it to one instance at a time | No | None |
| Quartz | Yes, with the JDBC job store | Yes, once clustering is enabled | Manual, by throwing a `JobExecutionException` that refires the job | None built in |
| db-scheduler | Yes, one database table | Yes | Yes, via a failure handler | Community add-on |
| JobRunr | Yes, in your SQL database or MongoDB | Yes, by default | Yes, automatic with exponential back-off | Built-in dashboard |

A few rules of thumb follow from that table:

- **A single instance and nothing important to lose?** `ScheduledExecutorService` is part of the JDK and fine for a cache refresh or a heartbeat. If you use Spring, `@Scheduled` is the same idea with an annotation.
- **Recurring tasks on several instances?** You need either a lock (ShedLock) or a scheduler that coordinates through a database. Our [Java cron jobs guide]({{< ref "/blog/java-cron-jobs-guide.md" >}}) compares `ScheduledExecutorService`, `@Scheduled`, Quartz and JobRunr for recurring work, with a cron expression cheat sheet.
- **Jobs that must complete, even if a pod dies halfway?** You need persistence and retries, so a library like JobRunr, db-scheduler or Quartz. Our guide on [distributed job scheduling in Java]({{< ref "/blog/distributed-job-scheduling-java.md" >}}) explains what goes wrong with homegrown database locks, message queues and Kubernetes CronJobs, and how many workers you need.
- **Work that spans several services or languages, or waits weeks for a human?** Then a workflow engine such as Temporal or Kestra is a better fit than an in-application scheduler.
- **Already on Quartz?** It still works and is maintained, but see our [comparison of Quartz alternatives]({{< ref "/blog/2024-10-31-task-schedulers-java-modern-alternatives-to-quartz">}}) and the [JobRunr vs Quartz benchmark]({{< ref "/blog/quartz-vs-jobrunr.md" >}}) before you start new code on it.

Choosing the best scheduler may come down to personal preferences. However, **JobRunr stands out from its competition** by offering a number of advantages over the traditional frameworks:

- a really easy fluent API that allows you to enqueue or schedule java tasks with just one line of code or by means of the `@Recurring` annotation
- an embedded job scheduler dashboard showing you the status of each job
- distributed job execution over different JVM instances
- integration with various frameworks including Spring Boot, Micronaut and Quarkus.
- durable jobs: wrap the steps of a job in `runStepOnce` and a retry continues at the step that failed
- virtual threads by default on JDK 21 and later, for more throughput on I/O bound jobs

**Loved and used by developers from all horizons**, JobRunr combines modern, lightweight, and easy-to-use features with enterprise-grade capabilities, providing reliability, security, and support for large-scale production deployments. In comparison, frameworks like Quartz feel really heavy and complex.


## What types of job scheduling exist?

When it comes to job scheduling in Java, there are three main types of scheduling to consider: direct execution, scheduled execution in the future, and recurring execution using a [cron expression](https://www.jobrunr.io/en/blog/2021-11-10-java-cron-job/).

- **Direct execution (aka fire-and-forget)**: This type of scheduling is used when you want a job to be executed ~~immediately~~ as soon as possible (because execution is asynchronous and other tasks may already be in the queue or processing). This makes it ideal for one-off tasks or to distribute load over multiple servers. JobRunr allows to create a one-time job by means of the `enqueue` function on the `BackgroundJob` class or the `JobScheduler` class.
{{< codeblock >}}
```java
BackgroundJob.enqueue(() -> System.out.println("This will run asap and perhaps even on another server"));
```
{{< /codeblock >}}

- **Scheduled (aka delayed) execution in the future**: This type of job scheduling allows you to schedule a task for execution at a specific time in the future. This is useful for tasks that need to be executed at a specific time, such as sending out reminders or triggering reports. To do so, you can use the `schedule` method in JobRunr:
{{< codeblock >}}
```java
BackgroundJob.schedule(Instant.now().plus(5, DAYS), () -> System.out.println("This will run 5 days from now!"));
```
{{< /codeblock >}}

- **Recurring execution using a cron expression**: This type of scheduling allows a job to be executed repeatedly at a set intervals, such as daily, weekly, or monthly. For the full picture on cron expressions, time zones and recurring jobs in a cluster, see our [Java cron jobs guide]({{< ref "/blog/java-cron-jobs-guide.md" >}}).
{{< codeblock >}}
```java
BackgroundJob.scheduleRecurrently("*/5 * * * *", () -> System.out.println("This will be printed every 5 minutes!"));
```
{{< /codeblock >}}

## Guide to implementing job scheduling in Java using JobRunr
Getting started with job scheduling in Java is simple and fast, you can be up and running in just 5 minutes! In this example, we’ll use the _JobRunr Spring Boot Starter_ to quickly add background job scheduling to your _Spring Boot application_.

### 1. Add the JobRunr dependency to your project
Using your build tool of choice, add the JobRunr scheduler dependency to your Spring Boot project. This can be done by adding the `jobrunr-spring-boot-4-starter` artifact (on Spring Boot 3, use `jobrunr-spring-boot-3-starter` instead). In this guide, we’ll be using Maven in this example, so we need to have the following declared in our `pom.xml`:

{{< codeblock >}}
```xml
<dependency>
	<groupId>org.jobrunr</groupId>
	<artifactId>jobrunr-spring-boot-4-starter</artifactId>
	<version>9.0.3</version>
</dependency>
```
{{< /codeblock >}}

> JobRunr stores your jobs as JSON. In a web application, Spring Boot already brings Jackson and JobRunr picks it up automatically. If your application is **not** a web application, add a JSON library yourself, see [serialization]({{< ref "documentation/serialization" >}}).

### 2. Make sure you have a StorageProvider
JobRunr will need to save your jobs in a SQL or NoSQL database by means of a `StorageProvider`, which makes job scheduling independent of the application life-cycle. Thanks to the `jobrunr-spring-boot-4-starter`, JobRunr will automatically try to use your existing `DataSource`. In this example, we will use the H2 Database. To do so, also add the H2 dependency to your `pom.xml`, together with `spring-boot-starter-jdbc` so that Spring Boot creates the `DataSource` for you (skip it if you already use Spring Data JPA or JDBC).

{{< codeblock >}}
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-jdbc</artifactId>
</dependency>
<dependency>
    <groupId>com.h2database</groupId>
    <artifactId>h2</artifactId>
</dependency>
```
{{< /codeblock >}}

> H2 is just one of many databases supported by JobRunr, [find out more here]({{< ref "documentation/storage" >}}).

### 3. Configure JobRunr using Spring's application.properties.
To configure JobRunr, you can leverage the `application.properties` file from Spring Boot.  In this example, we will enable all off JobRunr’s features including the actual job processing and the scheduler’s Web UI (for monitoring purposes).

{{< codeblock >}}
```properties
jobrunr.background-job-server.enabled=true
jobrunr.dashboard.enabled=true
```
{{< /codeblock >}}

Both are `false` by default, so that your web application does not start processing jobs by accident. All other properties, such as the number of retries, are listed in the [Spring Boot Starter configuration reference]({{< ref "documentation/configuration/spring" >}}).

### 4. Start creating jobs using JobRunr's java job scheduler API
#### Create a fire-and-forget job:
Now that we have setup our dependencies, we can easily create fire-and-forget jobs using the `enqueue` method:

{{< codeblock title="Enqueueing background jobs using the `JobScheduler` bean" >}}
```java
@Autowired
private JobScheduler jobScheduler;
 
jobScheduler.enqueue(() -> myService.doWork());
```
{{< /codeblock >}}

This line makes sure that the lambda, including type, method, and arguments, is serialized as JSON to persistent storage (an RDBMS like Oracle, Postgres, MySql, and MariaDB or a NoSQL database).

A dedicated worker pool of threads running in all the different BackgroundJobServers will then execute these queued background jobs as soon as possible, in a first-in-first-out manner. JobRunr guarantees the **execution of your job by a single worker** by means of optimistic locking. On JDK 21 and later, these workers are [virtual threads]({{< ref "documentation/configuration/virtual-threads" >}}) by default.

#### Schedule a job in the future:
We can also schedule jobs in the future using the schedule method:

{{< codeblock title="Scheduling a job in the future using the JobRunr Job Scheduler" >}}
```java
@Autowired
private JobScheduler jobScheduler;
 
jobScheduler.schedule(Instant.now().plus(8, ChronoUnit.HOURS), () -> myService.doWork());
```
{{< /codeblock >}}

#### Schedule a recurrent job using a cron expression:
If we want to have recurrent jobs, we need to use the `scheduleRecurrently` method:

{{< codeblock title="Scheduling a recurring jobs using a cron expression" >}}
```java
@Autowired
private JobScheduler jobScheduler;
 
jobScheduler.scheduleRecurrently(Cron.daily(), () -> myService.doWork());
```
{{< /codeblock >}}

In a Spring Boot application you can also put the `@Recurring` annotation on a method of a Spring bean. JobRunr finds it on startup and registers the recurring job for you, which makes it a drop-in replacement for `@Scheduled`:

{{< codeblock title="Scheduling a recurring job with the `@Recurring` annotation" >}}
```java
@Service
public class ReportService {

    @Recurring(id = "daily-report", cron = "0 6 * * *")
    @Job(name = "Daily report")
    public void generateDailyReport() {
        // ...
    }
}
```
{{< /codeblock >}}

#### Make a multi-step job durable:
Real jobs often do several things in a row. If the last step fails, a plain retry runs the whole method again from the top. With `runStepOnce`, each completed step is recorded, and a retry skips the steps that already succeeded. This is what we call a durable job:

{{< codeblock title="A durable job with `runStepOnce`" >}}
```java
@Job(name = "Fulfil order %0", retries = 5)
public void fulfilOrder(String orderId, JobContext jobContext) {
    jobContext.runStepOnce("charge-payment", () -> paymentGateway.charge(orderId));
    jobContext.runStepOnce("reserve-stock", () -> inventoryService.reserve(orderId));
    jobContext.runStepOnce("send-confirmation", () -> emailService.sendConfirmation(orderId));
}

// enqueue it, JobRunr injects the real JobContext at runtime
jobScheduler.enqueue(() -> orderService.fulfilOrder(orderId, JobContext.Null));
```
{{< /codeblock >}}

A completed step never runs again, but a step that is running at the moment the JVM dies can, so a side effect such as a payment should still be [idempotent]({{< ref "blog/Idempotence-in-java-job-scheduling.md" >}}). The [durable executions guide]({{< ref "guides/advanced/durable-executions.md" >}}) covers the details.

### 5. Visit the Web UI and see how your jobs are doing!
![](/documentation/jobs-enqueued.webp "An overview of all enqueued jobs")

The [dashboard]({{< ref "/documentation/background-methods/dashboard" >}}) provides an overview of all enqueued jobs, and other states, helping you track the status of each job and ensure reliable execution. By default it runs on port 8000, so open `http://localhost:8000` once your application is up.

Open a job and switch its history to Chart to see every attempt of the job on a timeline, including the individual steps of a durable job, so you see at a glance which step failed and which steps the retry skipped.

## Conclusion
JobRunr is probably the best choice for a scheduler in any Java project. With its modern features and simple API, you can quickly and easily create one-off jobs, schedule jobs to run at a specific time or after a specific interval.

JobRunr's enterprise-grade capabilities ensure reliability, security, and support for large-scale production deployments, making it the ideal choice for any Java scheduling needs. And, it also comes with great support if you take a [JobRunr Pro license]({{< ref "pro.md" >}}).

Want to go deeper? Read the [Java cron jobs guide]({{< ref "/blog/java-cron-jobs-guide.md" >}}) for recurring tasks, [distributed job scheduling in Java]({{< ref "/blog/distributed-job-scheduling-java.md" >}}) for running jobs over several instances, and our [overview of Quartz alternatives]({{< ref "/blog/2024-10-31-task-schedulers-java-modern-alternatives-to-quartz">}}) if you are comparing libraries.

---

## FAQ

### 1. What is job scheduling in Java, and why is it essential?

Job scheduling in Java automates task execution at specific times or intervals, reducing the need for manual intervention and improving efficiency. Scheduling ensures that background jobs run in an organized order, prevents system overload, and manages complex workflows, all crucial for high-performing applications.

### 2. What is the best job scheduler for Java?

It depends on what a job must survive. For in-memory tasks on a single instance, the JDK's `ScheduledExecutorService` or Spring's `@Scheduled` is enough. As soon as jobs must survive restarts, run safely on several instances and be retried on failure, you need a persistent scheduler such as JobRunr, db-scheduler or Quartz. JobRunr adds a built-in dashboard, durable jobs with `runStepOnce` and a one-line API on top of that. See [Choosing the best Java job scheduler](#choosing-the-best-java-job-scheduler) above.

### 3. How does JobRunr’s Java job scheduler handle task automation?

JobRunr’s Java job scheduler integrates easily with popular frameworks like Spring Boot, enabling you to enqueue tasks, schedule jobs for future execution, or set up recurring tasks using cron expressions. Its job scheduler dashboard provides real-time monitoring, making it simple to manage and track background job performance.

JobRunr’s workers, if enabled, will regularly check the database for newly submitted jobs via the `JobScheduler` API. If a job is found, the worker that retrieved it, will start executing the task.

### 4. What types of job scheduling does JobRunr support?

JobRunr supports three main types of job scheduling:
* **Direct execution (aka fire-and-forget)** for immediate tasks.
* **Scheduled execution in the future (aka delayed)** for tasks set to run at a later time.
*	**Recurring execution with cron expressions or fixed intervals** for periodic or repeating jobs, such as daily or weekly tasks.

### 5. Can JobRunr schedule tasks across multiple servers with distributed job scheduling?

Yes, JobRunr’s distributed job scheduling feature allows tasks to execute across multiple JVM instances, improving scalability and enabling efficient task management in multi-server environments. Every instance that has the background job server enabled picks up work from the shared database, and a job is only processed by one of them. Our guide on [distributed job scheduling in Java]({{< ref "/blog/distributed-job-scheduling-java.md" >}}) goes into the details.

### 6. How does JobRunr’s job scheduler dashboard help with task monitoring?

The Web UI in JobRunr provides a comprehensive view of each job’s status, including completion history and any errors encountered. This makes it easier for teams to monitor job performance, troubleshoot issues, and optimize resource usage. The job history Chart shows every attempt and every durable step of a job on a timeline.

### 7. What is a cron expression, and how is it used for recurring jobs?

A cron expression is a syntax that defines intervals for recurring job scheduling, such as daily, weekly, or monthly tasks. JobRunr enables you to use cron expressions for repetitive tasks, making it easy to automate ongoing processes like generating reports or sending reminders. The [Java cron jobs guide]({{< ref "/blog/java-cron-jobs-guide.md" >}}) has a cheat sheet with the most common expressions.

### 8. Is Quartz still a good Java job scheduler?

Quartz works and is maintained, and version 2.5 runs on the `jakarta` namespace and Java 11. It is still verbose, needs 11 database tables, has no built-in dashboard and no virtual thread support. Our [overview of Quartz alternatives]({{< ref "/blog/2024-10-31-task-schedulers-java-modern-alternatives-to-quartz">}}) compares it with JobRunr, db-scheduler, ShedLock, Kestra and Temporal.

<div style="display:none;">

![](/blog//meme-job-schedueler2.webp "Overview of JobRunr Architecture to run RAG workflows")

</div>
