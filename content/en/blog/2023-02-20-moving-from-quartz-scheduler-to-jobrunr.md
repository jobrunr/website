---
title: "How to move from Quartz to JobRunr"
summary: "An in-depth guide on how to switch from Quartz Scheduler to JobRunr"
feature_image: /blog/2023-02-20-from-quartz-to-jobrunr.png
date: 2023-02-20T09:12:23+02:00
author: "Ronald Dehuysser"
tags:
  - blog
  - meta
---
{{< trial-button >}}

> TLDR; If you're using Quartz as your job scheduler and you're looking for an alternative that's more modern, flexible, and powerful, JobRunr might be just what you need. In this blog post, we'll explore how to move from Quartz to JobRunr, step by step. You can also use it to compare JobRunr as a Java Scheduler with Quartz.

<div style="text-align: center; margin-bottom: 1em;">
  <a href="https://github.com/jobrunr/jobrunr" class="btn btn-black btn-lg" target="_blank" rel="noopener" style="display: inline-block; height: 45px; margin-right: 1rem;">
      <svg viewBox="0 0 16 16" style="margin: -4px 10px 0 0; display: inline-block; vertical-align: text-top; fill: currentColor; width: 25px; height: 25px;" aria-hidden="true"><path fill-rule="evenodd" d="M14 6l-4.9-.64L7 1 4.9 5.36 0 6l3.6 3.26L2.67 14 7 11.67 11.33 14l-.93-4.74L14 6z"></path></svg>
      <span>Star us on GitHub!</span>
  </a>
</div>

## Why move from Quartz Scheduler to JobRunr?
Quartz is a popular open-source job scheduling library that has been around for many years. While Quartz is a solid solution, JobRunr, also [open-source and available on GitHub](https://github.com/jobrunr/jobrunr), is a newer and more modern alternative that offers a number of advantages over Quartz. Here are some reasons why you might want to consider moving from Quartz to JobRunr:

- **Simple and modern API:** JobRunr has a clean and modern API that is easy to use and understand: you only need a Java 8 lambda. It's designed to be intuitive, to provide a simple way to schedule and manage jobs and supports recent JSR's (e.g. JSR 310 - the Java 8 Date and Time API).
- **Cloud-native by default:** JobRunr includes built-in support for cloud-native, distributed background processing, making it easy to perform long-running tasks asynchronously. This can improve the performance and scalability of your application without impact on the code.
- **Support for multiple SQL and NoSQL databases:** JobRunr supports [multiple databases]({{< ref "documentation/installation/storage/_index.md" >}}), including PostgreSQL, MySQL, MariaDB, Oracle and SQL Server, as well as NoSQL databases like MongoDB.
- **Built-in dashboard:** JobRunr comes with a [built-in dashboard]({{< ref "documentation/background-methods/dashboard.md" >}}) that allows you to monitor your jobs in real-time. 
- **Reliable in all situations:** JobRunr will retry any job that fails automatically up to 10 times with a smart back-off policy. No need to worry about external services that go down or network hiccups. 
- **Flexible and extensible architecture:** JobRunr is built with a modular architecture that allows you to easily customize and extend its functionality using [JobFilters]({{< ref "documentation/pro/job-filters.md" >}}). This makes it easier to adapt JobRunr to your specific use case.
- **Active development and community:** JobRunr is [actively developed and maintained](https://github.com/jobrunr/jobrunr) by a dedicated team of developers, with [regular releases and updates](https://github.com/jobrunr/jobrunr/releases). It has currently no known [vulnerabilities](https://ossindex.sonatype.org/component/pkg:maven/org.jobrunr/jobrunr) and has an active community of users who contribute to the project and [offer support](https://github.com/jobrunr/jobrunr/discussions).

Overall, if you're looking for a modern, flexible, and easy-to-use job scheduling library that offers built-in support for background processing and can integrate with multiple backends, JobRunr may be a good choice for you.

## Migration from Quartz Scheduler to JobRunr
In the examples below, you will be using the latest example from the [Quartz Quick Start Guide](http://www.quartz-scheduler.org/documentation/2.4.0-SNAPSHOT/quick-start-guide.html). To make the example a bit more realistic, some job parameters that will be consumed by the job are added.
If you're more a `give me the source code kind of guy`, the examples below are also   [available on GitHub](https://github.com/jobrunr/quartz-to-jobrunr).

### Add the JobRunr Dependency
If you want to migrate from Quartz to JobRunr, you'll need to add the JobRunr dependency and a dependency for JSON serialization (e.g. Jackson or GSON). To do so, add the following dependency to your `pom.xml`: 
{{< codeblock >}}

```xml
<dependency>
  <groupId>org.jobrunr</groupId>
  <artifactId>jobrunr</artifactId>
  <version>6.0.0</version>
</dependency>
```
{{</ codeblock >}}

### Creating one-off jobs
A one-off job is a job that you can create to distribute load over multiple servers (e.g. on your preferred cloud provider). You can create a long-running one-off job from your web-application that is then immediately stored in a database and thus not blocking the `HttpRequest`. Another server can then pick these jobs from the database and process them. 

###### Creating a one-off job using Quartz
If you want to create a one-off job using Quartz, you will first need to create an implementation of the `org.quartz.Job` interface. Once you have done that, you can trigger the job using a `JobKey` and the `JobDataMap`.

{{< codeblock >}}

```java
package com.example.quartz;

import org.quartz.*;
import org.quartz.impl.StdSchedulerFactory;

import java.time.Instant;

import static org.quartz.JobBuilder.newJob;

public class QuartzExampleOneOffJob {

    // we create an implementation of a Job that will be executed
    public static class HelloJob implements Job {
        @Override
        public void execute(JobExecutionContext jobExecutionContext) throws JobExecutionException {
            // get the variables from the JobDataMap
            String framework = jobExecutionContext.getMergedJobDataMap().getString("framework");
            Instant createdAt = (Instant) jobExecutionContext.getMergedJobDataMap().get("createdAt");

            // run the actual business code
            System.out.println(framework + " says Hello at " + createdAt);
        }
    }

    public static void main(String[] args) throws InterruptedException {
        try {
            // Grab the Scheduler instance from the Factory
            Scheduler scheduler = StdSchedulerFactory.getDefaultScheduler();

            // create a JobKey so we can trigger it instantly
            JobKey jobKey = new JobKey("job1", "group1");

            // define the job and tie it to our HelloJob class
            JobDetail jobDetail = newJob(HelloJob.class)
                    .withIdentity(jobKey)
                    .storeDurably() // otherwise it cannot be triggered immediately
                    .build();

            // store the job in the job store
            scheduler.addJob(jobDetail, true);

            // create the JobDataMap
            JobDataMap jobDataMap = new JobDataMap();
            jobDataMap.put("framework", "Quartz");
            jobDataMap.put("createdAt", Instant.now());

            // trigger the job using the JobKey and the JobDataMap
            scheduler.triggerJob(jobKey, jobDataMap);

            // and start it off
            scheduler.start();

            // keep the main thread running
            Thread.currentThread().join();
            scheduler.shutdown();
        } catch (SchedulerException se) {
            se.printStackTrace();
        }
    }
}
```
{{</ codeblock >}}

###### Creating a one-off job using JobRunr
If you want to create a one-off job with JobRunr, you can use any existing class or bean and just call the actual method using a Java 8 lambda using the [`JobScheduler.enqueue`]({{< ref "documentation/background-methods/enqueueing-jobs.md" >}}) method.

{{< codeblock >}}

```java
package com.example.jobrunr;

import org.jobrunr.scheduling.JobScheduler;

import java.time.Instant;

public class JobRunrExampleOneOffJob {

    // we can use any class or bean without implementing an interface
    public static class HelloJob {
        public void sayHello(String framework, Instant createdAt) {
            // run the actual business code
            System.out.println(framework + " says Hello at " + createdAt);
        }
    }

    public static void main(String[] args) throws InterruptedException {
        // Create a JobScheduler using a factory method with defaults
        JobScheduler jobScheduler = JobRunrFactory.initializeJobRunr();

        // Create and trigger your job
        jobScheduler.<HelloJob>enqueue(x -> x.sayHello("JobRunr", Instant.now()));

        // keep the main thread running
        Thread.currentThread().join();
    }
}
```
{{</ codeblock >}}


### Scheduling a job in the future
Sometimes you may want to schedule a job in the future (e.g. sending an email one day after a user who signed up). These scheduled jobs will not be executed immediately but will be stored in the database until they need to be run.

###### Creating a scheduled job using Quartz
If you want to create a scheduled job using Quartz, we will again need to create an implementation of the `org.quartz.Job` interface. Once we have that, we can trigger the job using a `JobKey` and the `JobDataMap`.

{{< codeblock >}}

```java
package com.example.quartz;

import org.quartz.*;
import org.quartz.impl.StdSchedulerFactory;

import java.sql.Date;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

import static java.time.Instant.now;
import static org.quartz.JobBuilder.newJob;
import static org.quartz.SimpleScheduleBuilder.simpleSchedule;
import static org.quartz.TriggerBuilder.newTrigger;

public class QuartzExampleScheduledJob {

    // we create an implementation of a Job that will be executed
    public static class HelloJob implements Job {
        @Override
        public void execute(JobExecutionContext jobExecutionContext) throws JobExecutionException {
            // get the variables from the JobDataMap
            String framework = jobExecutionContext.getMergedJobDataMap().getString("framework");
            Instant createdAt = (Instant) jobExecutionContext.getMergedJobDataMap().get("createdAt");

            // run the actual business code
            System.out.println(framework + " says Hello at " + createdAt);
        }
    }

    public static void main(String[] args) throws InterruptedException {
        try {
            // Grab the Scheduler instance from the Factory
            Scheduler scheduler = StdSchedulerFactory.getDefaultScheduler();

            // create a JobKey so we can trigger it instantly
            JobKey jobKey = new JobKey("job1", "group1");

            // define the job and tie it to our HelloJob class
            JobDetail jobDetail = newJob(HelloJob.class)
                    .withIdentity(jobKey)
                    .build();

            // create the JobDataMap
            JobDataMap jobDataMap = new JobDataMap();
            jobDataMap.put("framework", "Quartz");
            jobDataMap.put("createdAt", now());

            // Create the trigger to schedule the job 1 day from now and the JobDataMap
            Trigger trigger = newTrigger()
                    .withIdentity("trigger1", "group1")
                    .startAt(Date.from(now().plus(1, ChronoUnit.DAYS)))
                    .forJob(jobKey)
                    .usingJobData(jobDataMap)
                    .build();

            // schedule the job using the jobDetail and the trigger
            scheduler.scheduleJob(jobDetail, trigger);

            // and start it off
            scheduler.start();

            // keep the main thread running
            Thread.currentThread().join();
            scheduler.shutdown();
        } catch (SchedulerException se) {
            se.printStackTrace();
        }
    }
}
```
{{</ codeblock >}}

###### Creating a scheduled job using JobRunr
If you want to create a scheduled job using JobRunr, we can use again use the same approach as before using a Java 8 lambda and the [`JobScheduler.schedule`]({{< ref "documentation/background-methods/scheduling-jobs.md" >}}) method..

{{< codeblock >}}

```java
package com.example.jobrunr;

import org.jobrunr.scheduling.JobScheduler;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

import static java.time.Instant.now;

public class JobRunrExampleScheduledJob {

    // we can use any class or bean without implementing an interface
    public static class HelloJob {
        public void sayHello(String framework, Instant createdAt) {
            // run the actual business code
            System.out.println(framework + " says Hello at " + createdAt);
        }
    }

    public static void main(String[] args) throws InterruptedException {
        // Create a JobScheduler using a factory method with defaults
        JobScheduler jobScheduler = JobRunrFactory.initializeJobRunr();

        // Create and schedule your job one day from now
        jobScheduler.<HelloJob>schedule(now().plus(1, ChronoUnit.DAYS), x -> x.sayHello("JobRunr", now()));

        // keep the main thread running
        Thread.currentThread().join();
    }
}
```
{{</ codeblock >}}

### Creating a recurring or CRON job
Sometimes you may want to create a job that runs every x amount of time (e.g. to see whether new data is available in a file share). These recurring jobs will again not be executed immediately but will be stored in the database until they need to be run.

###### Creating a recurring job using Quartz
If you want to create a recurring job using Quartz, we will again need to create an implementation of the `org.quartz.Job` interface. Once we have that, we can trigger the job using a `JobKey`, the `JobDataMap` and a `schedule`.

{{< codeblock >}}

```java
package com.example.quartz;

import org.quartz.*;
import org.quartz.impl.StdSchedulerFactory;

import java.sql.Date;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

import static java.time.Instant.now;
import static org.quartz.CronScheduleBuilder.cronSchedule;
import static org.quartz.JobBuilder.newJob;
import static org.quartz.SimpleScheduleBuilder.simpleSchedule;
import static org.quartz.TriggerBuilder.newTrigger;

public class QuartzExampleRecurringJob {

    // we create an implementation of a Job that will be executed
    public static class HelloJob implements Job {
        @Override
        public void execute(JobExecutionContext jobExecutionContext) throws JobExecutionException {
            // get the variables from the JobDataMap
            String framework = jobExecutionContext.getMergedJobDataMap().getString("framework");
            Instant createdAt = (Instant) jobExecutionContext.getMergedJobDataMap().get("createdAt");

            // run the actual business code
            System.out.println(framework + " says Hello at " + Instant.now() + "(created at " + createdAt + ")");
        }
    }

    public static void main(String[] args) throws InterruptedException {
        try {
            // Grab the Scheduler instance from the Factory
            Scheduler scheduler = StdSchedulerFactory.getDefaultScheduler();

            // create a JobKey so we can trigger it instantly
            JobKey jobKey = new JobKey("job1", "group1");

            // define the job and tie it to our HelloJob class
            JobDetail jobDetail = newJob(HelloJob.class)
                    .withIdentity(jobKey)
                    .build();

            // create the JobDataMap
            JobDataMap jobDataMap = new JobDataMap();
            jobDataMap.put("framework", "Quartz");
            jobDataMap.put("createdAt", now());

            // Create the trigger for the job using a cronSchedule that runs every 30 seconds and pass the JobDataMap
            Trigger trigger =  newTrigger()
                    .withIdentity("trigger1", "group1")
                    .startNow()
                    .withSchedule(cronSchedule("0/30 * * * * ? *"))
                    .forJob(jobKey)
                    .usingJobData(jobDataMap)
                    .build();

            // schedule the job using the jobDetail and the trigger
            scheduler.scheduleJob(jobDetail, trigger);

            // and start it off
            scheduler.start();

            // keep the main thread running
            Thread.currentThread().join();
            scheduler.shutdown();
        } catch (SchedulerException se) {
            se.printStackTrace();
        }
    }
}
```
{{</ codeblock >}}

###### Creating a recurring job using JobRunr
If you want to create a one-off job using JobRunr, we can use again use the same approach as before using a Java 8 lambda and the [`JobScheduler.scheduleRecurrently`]({{< ref "documentation/background-methods/recurring-jobs.md" >}}) method..

{{< codeblock >}}

```java
package com.example.jobrunr;

import org.jobrunr.scheduling.JobScheduler;

import java.time.Instant;

import static org.jobrunr.scheduling.cron.Cron.every30seconds;

public class JobRunrExampleRecurringJob {

    // we can use any class or bean without implementing an interface
    public static class HelloJob {
        public void sayHello(String framework, Instant createdAt) {
            // run the actual business code
            System.out.println(framework + " says Hello at " + Instant.now() + "(created at " + createdAt + ")");
        }
    }

    public static void main(String[] args) throws InterruptedException {
        // Create a JobScheduler using a factory method with defaults
        JobScheduler jobScheduler = JobRunrFactory.initializeJobRunr();

        // Schedule your job every 30 seconds
        jobScheduler.<HelloJob>scheduleRecurrently(every30seconds(), x -> x.sayHello("JobRunr", Instant.now()));

        // keep the main thread running
        Thread.currentThread().join();
    }
}
```
{{</ codeblock >}}

### But I do not want to use Java 8 lambdas...
No worries, also in this case, we have your back. You can also create a Job using a `JobRequest` and `JobRequestHandler` (which is based on the command & command handler pattern):

{{< codeblock title="This enqueues a background job using a JobRequest. The JobRequest can contain data and when the actual job will be invoked, the JobRequest object will be provided to the run method of the JobRequestHandler." >}}

```java
public class MyJobRequest implements JobRequest {

  private UUID id;

  public MyJobRequest(UUID id) {
    this.id = id;
  }

  @Override
  public Class<MyJobRequestHandler> getJobRequestHandler() {
      return MyJobRequestHandler.class;
  }

  public UUID getId() {
    return id;
  }

}

JobId jobId = BackgroundJobRequest.enqueue(new MyJobRequest(id));
```
{{</ codeblock >}}

When using a `JobRequest` to create jobs it is important to note that the `JobRequest` itself is nothing more than a __data transfer object__. You should not pass services or beans with it. The smaller the `JobRequest` is, the better as it will be serialized to Json and stored in your StorageProvider.

> Note that your `JobRequest` will be serialized and deserialized to/from Json. This also means that it needs a default no-arg constructor and that all fields must also be capable of being serialized/deserialized to/from Json.

A `JobRequestHandler` is a regular service (e.g. a Spring bean) where you can inject other services and must be resolvable by your IoC container. When your job will be invoked, JobRunr asks the IoC container for the relevant `JobRequestHandler`, calls the `run` method of the instance and passes the `JobRequest` as an argument. You can then use all the data from your `JobRequest` inside your `JobRequestHandler` to bring your job to a good end.

{{< codeblock title="This JobRequestHandler handles all MyJobRequests. As it is a regular bean, you can inject other services." >}}

```java
@Component
public class MyJobRequestHandler implements JobRequestHandler<MyJobRequest> {

  @Inject
  private SomeService someService; // you can inject other services (or constructor-injection)

  @Override
  @Job(name = "Some neat Job Display Name", retries = 2)
  public void run(MyJobRequest jobRequest) {
      // do your background work here
  }
}
```
{{</ codeblock >}}

## Conclusion
Migrating from JobRunr to Quartz is not difficult - you can easily use your existing methods or swith to a `JobRequest` and a `JobRequestHandler`. 
With its modern features and simple API, you can quickly and easily create one-off jobs, schedule jobs to run at a specific time or after a specific interval.

JobRunr's enterprise-grade capabilities ensure reliability, security, and support for large-scale production deployments, making it the ideal choice for any Java scheduling needs. And, it also comes with great support if you take a [JobRunr Pro license]({{< ref "/jobrunr-pro.md" >}}).

If you want to review the source code for the examples above, you can find them over on [GitHub](https://github.com/jobrunr/quartz-to-jobrunr).


## But wait! I'm using [insert your preferred framework here]!
Are you using Spring Boot, Micronaut or Quarkus? JobRunr has you covered! If you're using Spring Boot, just add following dependency to your `pom.xml`: 
{{< codeblock >}}

```xml
<dependency>
  <groupId>org.jobrunr</groupId>
  <artifactId>jobrunr-spring-boot-3-starter</artifactId>
  <version>6.0.0</version>
</dependency>
```
{{</ codeblock >}}

Next, configure which JobRunr features you want to enable using the `application.properties`:

```properties
org.jobrunr.background-job-server.enabled=true # if you want to enable job processing
org.jobrunr.dashboard.enabled=true # if you want to enable the dashboard
```

Now you can inject the `JobScheduler` bean and create or schedule any job!

## Ooh yeah, there is one more thing... an awesome dashboard!
Did you know that JobRunr also comes with a built-in dashboard that allows you to monitor all your jobs and the servers that participate in Job Processing? Well, of course there is! 

<figure>
<img src="/documentation/jobs-enqueued.webp" class="kg-image">
<figcaption>An overview of all enqueued jobs</figcaption>
</figure>

And you can instantly view the exact reason why a Job failed...
<figure>
<img src="/documentation/job-details-failed-2.webp" class="kg-image">
<figcaption>When a job failed, you see a detailed message why it failed</figcaption>
</figure>

