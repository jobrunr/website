---
title: Create and schedule jobs with JobRunr using only a Java lambda
description: This guide will explain you how to setup JobRunr and explore how to enqueue and schedule jobs using only a Java 8 lambda.  
weight: 20
tags:
    - Java 8 lambda
    - Spring Boot
    - Quarkus
    - Micronaut
---
In this guide, we will learn how to:
- setup JobRunr
- learn how to enqueue and schedule a job in vanilla Java or your favorite web framework using only a Java 8 lambda
- monitor your jobs using the built-in dashboard

## What is JobRunr
### Introduction
[JobRunr](https://github.com/jobrunr/jobrunr) is a library that we can embed in our application and which allows us to schedule background jobs using a Java 8 lambda. We can use any existing method of our Spring services to create a job without the need to implement an interface. A job can be a short or long-running process, and it will be automatically offloaded to a background thread so that the current web request is not blocked.

To do its job (pun intended 😅), JobRunr analyses the Java 8 lambda. It serializes it as JSON, and stores it into either a relational database or a NoSQL data store.

### Creating jobs using a Job Lambda
When we create a job by means of a Java 8 lambda, JobRunr analyzes it and finds the class, the method and all the arguments we've passed to it. Given the following class:
{{< codeblock >}}

```java
package com.demo.jobrunr.services;

public class EmailService {

    public void sendEmail(String to, String from, String subject, String body) {
        // here you send the actual email using services like SendGrid or the SMTP service of your choice
    }

}
```
{{</ codeblock >}}

And the following lambda:
{{< codeblock >}}

```java
public void onboardCustomer(Customer customer) {
    // ... other code like saving customer in DB
    // send the email via a BackgroundJob
    String customerEmail = customer.getEmailAddress();
    BackgroundJob.enqueue(() -> emailService.sendEmail(customerEmail, "hello@jobrunr.io", "Happy you joined us!", "the email body..."));
}
```
{{</ codeblock >}}

Then JobRunr will analyze this lambda and create a JSON representation of it which can be saved in the SQL or NoSQL database and then be processed even on another server:
{{< codeblock >}}

```json
{
    "cacheable": true,
    "className": "com.demo.jobrunr.services.EmailService",
    "staticFieldName": null,
    "methodName": "sendEmail",
    "jobParameters": [
      {
        "className": "java.lang.String",
        "object": "great@customer.com"
      },
      {
        "className": "java.lang.String",
        "object": "hello@jobrunr.io"
      },
      {
        "className": "java.lang.String",
        "object": "Happy you joined us!"
      },
      {
        "className": "java.lang.String",
        "object": "the email body..."
      }
    ]
}
```
{{</ codeblock >}}


## Setup
### Maven dependency
Now that we know how JobRunr works, let’s jump straight to the Java code. But before that, we need to have the following Maven dependency declared in our `pom.xml` file:
{{< framework type="fluent-api" label="Fluent API" >}}

```xml
<dependency>
    <groupId>org.jobrunr</groupId>
    <artifactId>jobrunr</artifactId>
    <version>{{< param "JobRunrVersion" >}}</version>
</dependency>
<dependency>
    <groupId>com.fasterxml.jackson.core</groupId>
    <artifactId>jackson-databind</artifactId>
    <version>2.17.0</version> <!-- use latest version -->
</dependency>
```
As JobRunr also needs a library for JSON handling, we also include [Jackson](https://github.com/FasterXML/jackson) as a dependency.
{{< /framework >}}
{{< framework type="spring-boot" label="Spring Boot" >}}
```xml
<dependency>
    <groupId>org.jobrunr</groupId>
    <artifactId>jobrunr-spring-boot-3-starter</artifactId>
    <version>{{< param "JobRunrVersion" >}}</version>
</dependency>
```
JobRunr also needs a library for JSON handling, but as Spring Boot by default comes with Jackson support this is already covered.
{{< /framework >}}
{{< framework type="quarkus" label="Quarkus" >}}
```xml
<dependency>
    <groupId>org.jobrunr</groupId>
    <artifactId>quarkus-jobrunr</artifactId>
    <version>{{< param "JobRunrVersion" >}}</version>
</dependency>
<dependency>
    <groupId>com.fasterxml.jackson.core</groupId>
    <artifactId>jackson-databind</artifactId>
    <version>2.17.0</version> <!-- use latest version -->
</dependency>
```
JobRunr also needs a library for JSON handling and just like Quarkus, JobRunr both supports Jackson and JSON-B.
{{< /framework >}}
{{< framework type="micronaut" label="Micronaut" >}}
```xml
<dependency>
    <groupId>org.jobrunr</groupId>
    <artifactId>jobrunr-micronaut-feature</artifactId>
    <version>{{< param "JobRunrVersion" >}}</version>
</dependency>
<dependency>
    <groupId>com.fasterxml.jackson.core</groupId>
    <artifactId>jackson-databind</artifactId>
    <version>2.17.0</version> <!-- use latest version -->
</dependency>
```
JobRunr also needs a library for JSON handling - for Micronaut we recommend [Jackson](https://github.com/FasterXML/jackson).
{{< /framework >}}



### JobRunr Configuration
Before we jump straight to how to create background jobs, we need to initialize JobRunr. In this guide, we will enable both the `BackgroundJobServer` so that jobs get processed and the dashboard.
{{< framework type="fluent-api" >}}
Configuring JobRunr using the Fluent API is really easy, we only need a bit of code to configure JobRunr:

```java

public class Main {
    public static void main(String[] args) throws Exception {
        JobRunr
            .configure()
            .useStorageProvider(new InMemoryStorageProvider())
            .useDashboard()
            .useBackgroundJobServer()
            .initialize();
    }
}
```
{{< /framework >}}
{{< framework type="spring-boot" >}}
As we’re using the `jobrunr-spring-boot-3-starter` dependency, this is easy. We only need to add some properties to the `application.properties`:

```properties
jobrunr.background-job-server.enabled=true
jobrunr.dashboard.enabled=true
```
{{< /framework >}}
{{< framework type="quarkus" >}}
As we’re using the `quarkus-jobrunr` extension, this is easy. We only need to add some properties to the `application.properties`:

```properties
quarkus.jobrunr.background-job-server.enabled=true
quarkus.jobrunr.dashboard.enabled=true
```
{{< /framework >}}
{{< framework type="micronaut" >}}
As we’re using the `jobrunr-micronaut-feature`, this is easy. We only need to add some properties to the `application.yml`:

```yml
jobrunr:
  background-job-server:
    enabled: true
  dashboard:
    enabled: true
```
{{< /framework >}}


## Enqueueing one-off jobs
Now, let’s find out how to create some fire-and-forget background jobs using JobRunr.
{{< framework type="fluent-api" >}}
We can now start using JobRunr by means of the `BackgroundJob`:

```java
public class Main {
    public static void main(String[] args) throws Exception {
        // ... 
        BackgroundJob.enqueue(() -> System.out.println("This is a background job!"));
    }
}
```
{{< /framework >}}
{{< framework type="spring-boot" >}}
When we want to create jobs, we’ll need to inject the `JobScheduler` and our existing Spring service containing the method for which we want to create jobs, in this case, the `SampleJobService`:

```java
@RestController
public class JobController {

    private final JobScheduler jobScheduler;
    private final SampleJobService sampleService;

    public JobController(JobScheduler jobScheduler, SampleJobService sampleService) {
        this.jobScheduler = jobScheduler;
        this.sampleService = sampleService;
    }

    @GetMapping("/enqueue-example-job")
    public String enqueueExampleJob(@RequestParam(value = "name", defaultValue = "World") String name) {
        final JobId enqueuedJobId = jobScheduler.enqueue(() -> sampleService.executeSampleJob("Hello " + name));
        return "Job Enqueued: " + enqueuedJobId.toString();
    }
}
```


{{< /framework >}}
{{< framework type="quarkus" >}}
When we want to create jobs, we’ll need to inject the `JobScheduler` and our existing Quarkus bean containing the method for which we want to create jobs, in this case, an actual instance of the `MyServiceInterface` interface:

```java
@Path("jobs")
@ApplicationScoped
public class JobResource {

    @Inject
    MyServiceInterface myService;
    @Inject
    JobScheduler jobScheduler;

    @GET
    @Path("/simple-job")
    @Produces(MediaType.TEXT_PLAIN)
    public String simpleJob(@DefaultValue("Hello world") @QueryParam("value") String value) {
        final JobId enqueuedJobId = jobScheduler.enqueue(() -> myService.doSimpleJob(value));
        return "Job Enqueued: " + enqueuedJobId;
    }
}
```
{{< /framework >}}
{{< framework type="micronaut" >}}
When we want to create jobs, we’ll need to inject the `JobScheduler` and our existing Micronaut service containing the method for which we want to create jobs, in this case, an actual instance of the `MyServiceInterface` interface:

```java
@Controller("/jobs")
public class JobController {

    @Inject
    private JobScheduler jobScheduler;

    @Inject
    private MyServiceInterface myService;

    @Get("/simple-job")
    @Produces(MediaType.TEXT_PLAIN)
    public String simpleJob(@QueryValue(value = "value", defaultValue = "Hello world") String value) {
        final JobId enqueuedJobId = jobScheduler.enqueue(() -> myService.doSimpleJob(value));
        return "Job Enqueued: " + enqueuedJobId;
    }
}
```
{{< /framework >}}


## Scheduling jobs
We can also schedule jobs in the future using the schedule method:
{{< framework type="fluent-api" >}}
```java
public class Main {
    public static void main(String[] args) throws Exception {
        // ... 
        BackgroundJob.schedule(LocalDateTime.now().plusHours(5), () -> System.out.println("This is a background job!"));
    }
}
```
{{< /framework >}}
{{< framework type="spring-boot" >}}
```java
@RestController
public class JobController {

    // ...

    @GetMapping("/schedule-example-job")
    public String scheduleExampleJob(
            @RequestParam(value = "name", defaultValue = "World") String name,
            @RequestParam(value = "when", defaultValue = "PT3H") String when) {
        final JobId scheduledJobId = jobScheduler.schedule(now().plus(Duration.parse(when)), () -> sampleService.executeSampleJob("Hello " + name));
        return "Job Scheduled: " + scheduledJobId.toString();
    }
}
```
{{< /framework >}}
{{< framework type="quarkus" >}}
```java
@Path("jobs")
@ApplicationScoped
public class JobResource {

    // ...

    @GET
    @Path("/schedule-simple-job")
    @Produces(MediaType.TEXT_PLAIN)
    public String scheduleSimpleJob(
            @DefaultValue("Hello world") @QueryParam("value") String value,
            @DefaultValue("PT3H") @QueryParam("when") String when) {
        final JobId scheduledJobId = jobScheduler.schedule(now().plus(Duration.parse(when)), () -> myService.doSimpleJob(value));
        return "Job Scheduled: " + scheduledJobId;
    }
}
```
{{< /framework >}}
{{< framework type="micronaut" >}}
```java
@Controller("/jobs")
public class JobController {

    // ...

    @Get("/schedule-simple-job")
    @Produces(MediaType.TEXT_PLAIN)
    public String scheduleSimpleJob(
            @QueryValue(value = "value", defaultValue = "Hello world") String value,
            @QueryValue(value = "when", defaultValue = "PT3H") String when) {
        final JobId scheduledJobId = jobScheduler.schedule(now().plus(Duration.parse(when)), () -> myService.doSimpleJob(value));
        return "Job Scheduled: " + scheduledJobId;
    }
}
```
{{< /framework >}}



## Monitoring jobs using the built-in dashboard
JobRunr comes with a built-in dashboard that allows us to monitor our jobs. We can find it at http://localhost:8000 and inspect all the jobs, including all recurring jobs and an estimation of how long it will take until all the enqueued jobs are processed:

<figure>
{{< img src="/documentation/jobrunr-overview-1.webp" class="kg-image" >}}
<figcaption>A complete overview of the amount of jobs that are being processed</figcaption>
</figure>

Bad things can happen, for example, an SSL certificate expired, or a disk is full. JobRunr, by default, will reschedule the background job with an exponential back-off policy. If the background job continues to fail ten times, only then will it go to the Failed state. You can then decide to re-queue the failed job when the root cause has been solved.

All of this is visible in the dashboard, including each retry with the exact error message and the complete stack trace of why a job failed:
<figure>
{{< img src="/documentation/job-details-failed-2.webp" class="kg-image" >}}
<figcaption>When a job failed, you see a detailed message why it did fail</figcaption>
</figure>

## Conclusion
In this guide, we've learned how to effortlessly set up and use JobRunr to create and schedule jobs using a Java 8 lambda and we also learned how to monitor jobs with its user-friendly dashboard.
