---
title: Create and schedule jobs with JobRunr using a JobRequest and JobRequestHandler
description: This guide will explain you how to setup JobRunr and explore how to enqueue and schedule jobs using the JobRequest / JobRequestHandler pattern.  
weight: 25
tags:
    - JobRequest
    - Spring Boot
    - Quarkus
    - Micronaut
---
In this guide, we will learn how to:
- setup JobRunr
- learn how to enqueue and schedule a job in vanilla Java or your favorite web framework using the `JobRequest` / `JobRequestHandler` pattern.
- monitor your jobs using the built-in dashboard

## What is JobRunr
### Introduction
[JobRunr](https://github.com/jobrunr/jobrunr) is a library that we can embed in our application and which allows us to schedule background jobs using a Java 8 lambda. We can use any existing method of our Spring services to create a job without the need to implement an interface. A job can be a short or long-running process, and it will be automatically offloaded to a background thread so that the current web request is not blocked.

To do its job (pun intended 😅), JobRunr can not only use a Java 8 lambda but it can also use the [`Command`](https://en.wikipedia.org/wiki/Command_pattern) / [`CommandHandler`](https://en.wikipedia.org/wiki/Command_pattern) pattern, in this case an implementation of a `JobRequest` and a `JobRequestHandler`. It serializes the `JobRequest` (consider it as a DTO) as JSON, and stores it into either a relational database or a NoSQL data store.

### Creating jobs using the JobRequest and JobRequestHandler pattern
When we want to enqueue or schedule a job by means of a `JobRequest` we will need to create two classes, one implementing the `JobRequest` interface and one implementing the `JobRequestHandler` interface:

{{< codeblock >}}

```java
package com.demo.jobrunr.services;

public record SendEmailJobRequest(String to, String from, String subject, String body) implements JobRequest {

    @Override
    public Class<SendEmailJobRequestHandler> getJobRequestHandler() {
        return SendEmailJobRequestHandler.class;
    }

}
```
{{</ codeblock >}}

{{< codeblock >}}

```java
package com.demo.jobrunr.services;

public class SendEmailJobRequestHandler implements JobRequestHandler<SendEmailJobRequest> {

    @Override
    public void run(SendEmailJobRequest jobRequest) throws InterruptedException {
        // here you send the actual email using services like SendGrid or the SMTP service of your choice
        // all the data will be available on the JobRequest record
    }

}
```
{{</ codeblock >}}

We can now create a job as follows:
{{< codeblock >}}

```java
public void onboardCustomer(Customer customer) {
    // ... other code like saving customer in DB
    // send the email via a BackgroundJobRequest
    BackgroundJobRequest.enqueue(new SendEmailJobRequest(customer.getEmailAddress(), "hello@jobrunr.io", "Happy you joined us!", "the email body..."));
}
```
{{</ codeblock >}}

Then JobRunr will analyze this lambda and create a JSON representation of it which can be saved in the SQL or NoSQL database and then be processed even on another server:
{{< codeblock >}}

```json
{
    "cacheable": true,
    "className": "com.demo.jobrunr.services.SendEmailJobRequestHandler",
    "staticFieldName": null,
    "methodName": "run",
    "jobParameters": [
      {
        "className": "com.demo.jobrunr.services.SendEmailJobRequest",
        "object": {
            "to": "great@customer.com",
            "from": "hello@jobrunr.io",
            "subject": "Happy you joined us!",
            "body": "the email body..."
        } 
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
org.jobrunr.background-job-server.enabled=true
org.jobrunr.dashboard.enabled=true
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
        BackgroundJobRequest.enqueue(new SysOutJobRequest("This is a background job!")); // you will also need a SysOutJobRequestHandler to run the actual job
    }
}
```
{{< /framework >}}
{{< framework type="spring-boot" >}}
When we want to create jobs, we’ll need to inject the `JobRequestScheduler` so we can pass it an implementation of a `JobRequest`, in this case a `MyJobRequest`:

```java
@RestController
public class JobController {

    private final JobRequestScheduler jobRequestScheduler;

    public JobController(JobRequestScheduler jobRequestScheduler) {
        this.jobRequestScheduler = jobRequestScheduler;
    }

    @GetMapping("/enqueue-example-job")
    public String enqueueExampleJob(@RequestParam(value = "name", defaultValue = "World") String name) {
        final JobId enqueuedJobId = jobRequestScheduler.enqueue(new MyJobRequest(name));
        return "Job Request Enqueued: " + enqueuedJobId;
    }
}
```


{{< /framework >}}
{{< framework type="quarkus" >}}
When we want to create jobs, we’ll need to inject the `JobRequestScheduler` so we can pass it an implementation of a `JobRequest`, in this case a `MyJobRequest`:

```java
@Path("jobs")
@ApplicationScoped
public class JobResource {
    @Inject
    JobRequestScheduler jobRequestScheduler;

    @GET
    @Path("/simple-job")
    @Produces(MediaType.TEXT_PLAIN)
    public String simpleJob(@DefaultValue("Hello world") @QueryParam("value") String value) {
        final JobId enqueuedJobId = jobRequestScheduler.enqueue(new MyJobRequest(value));
        return "Job Request Enqueued: " + enqueuedJobId;
    }
}
```
{{< /framework >}}
{{< framework type="micronaut" >}}
When we want to create jobs, we’ll need to inject the `JobRequestScheduler` so we can pass it an implementation of a `JobRequest`, in this case a `MyJobRequest`:

```java
@Controller("/jobs")
public class JobController {

    @Inject
    private JobRequestScheduler jobRequestScheduler;

    @Get("/simple-job")
    @Produces(MediaType.TEXT_PLAIN)
    public String simpleJob(@QueryValue(value = "value", defaultValue = "Hello world") String value) {
        final JobId enqueuedJobId = jobRequestScheduler.enqueue(new MyJobRequest(value));
        return "Job Request Enqueued: " + enqueuedJobId;
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
        BackgroundJob.schedule(LocalDateTime.now().plusHours(5), new SysOutJobRequest("This is a background job!"));
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
        final JobId scheduledJobId = jobRequestScheduler.schedule(now().plus(Duration.parse(when)), new MyJobRequest(name));
        return "Job Request Scheduled: " + scheduledJobId.toString();
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
        final JobId scheduledJobId = jobRequestScheduler.schedule(now().plus(Duration.parse(when)), new MyJobRequest(value));
        return "Job Request Scheduled: " + scheduledJobId.toString();
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
        final JobId scheduledJobId = jobRequestScheduler.schedule(now().plus(Duration.parse(when)), new MyJobRequest(value));
        return "Job Request Scheduled: " + scheduledJobId.toString();
    }
}
```
{{< /framework >}}



## Monitoring jobs using the built-in dashboard
JobRunr comes with a built-in dashboard that allows us to monitor our jobs. We can find it at http://localhost:8000 and inspect all the jobs, including all recurring jobs and an estimation of how long it will take until all the enqueued jobs are processed:

<figure>
<img src="/documentation/jobrunr-overview-1.webp" class="kg-image">
<figcaption>A complete overview of the amount of jobs that are being processed</figcaption>
</figure>

Bad things can happen, for example, an SSL certificate expired, or a disk is full. JobRunr, by default, will reschedule the background job with an exponential back-off policy. If the background job continues to fail ten times, only then will it go to the Failed state. You can then decide to re-queue the failed job when the root cause has been solved.

All of this is visible in the dashboard, including each retry with the exact error message and the complete stack trace of why a job failed:
<figure>
<img src="/documentation/job-details-failed-2.webp" class="kg-image">
<figcaption>When a job failed, you see a detailed message why it did fail</figcaption>
</figure>

## Conclusion
In this guide, we've learned how to effortlessly set up and use JobRunr to create and schedule jobs using a `JobRequest` and `JobRequestHandler` and we also learned how to monitor jobs with its user-friendly dashboard.