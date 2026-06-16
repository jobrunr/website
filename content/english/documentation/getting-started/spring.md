---
title: "Background Job Scheduling in Spring Boot"
description: "Learn how to schedule fire-and-forget, delayed, and recurring background jobs in a Spring Boot application using the JobRunr Spring Boot Starter. A persistent, distributed alternative to @Scheduled."
keywords: ["spring boot background jobs", "spring boot job scheduler", "spring boot task scheduling", "spring boot cron job", "jobrunr spring boot starter", "quartz scheduler spring boot", "ShedLock spring boot"]
date: 2026-06-16T00:00:00+02:00
layout: "documentation"
menu:
  sidebar:
    parent: getting-started
    name: Spring Boot
    weight: 2
sitemap:
  priority: 0.8
  changeFreq: monthly
---

Spring Boot's `@Scheduled` runs tasks in-process with no persistence, no retries, and, in a cluster, every node fires the same task at the same time. [ShedLock](https://github.com/lukas-krecan/ShedLock) is a common add-on for that last problem: it adds a distributed lock so only one node runs each task, but it stops there. For full background job processing with persistence, retries, fire-and-forget, and delayed execution, teams reach for [Quartz Scheduler](http://www.quartz-scheduler.org/), which works but demands significant boilerplate, its own schema, and offers no built-in monitoring.

The **JobRunr Spring Boot Starter** drops into any Spring Boot application with a single dependency to give you:

- **Persistent jobs** that survive restarts and crashes
- **Automatic retries** with exponential back-off on failure
- **Cluster-safe execution** so only one node runs each job, no matter how many nodes you run
- **Built-in dashboard** to monitor job progress and history

This guide builds the same newsletter example as the [Java quickstart]({{< ref "documentation/getting-started/java" >}}), this time using the Spring Boot Starter.

> [!TIP]
> Prefer watching? Check out the full tutorial: [How to Run Background Jobs in Spring Boot 4 with JobRunr](https://youtu.be/72OJux5H2Ng) on YouTube. The complete example project for this guide is available at [github.com/jobrunr/jobrunr-examples/spring-app](https://github.com/jobrunr/jobrunr-examples/tree/main/spring-app).

## Step 1: Add the JobRunr Spring Boot Starter

If you are starting from scratch, generate a project at [start.spring.io](https://start.spring.io/) with the **Spring Web** dependency selected. The web starter pulls in Jackson, JobRunr will automatically pick it up for its [JSON serialization]({{< ref "/documentation/serialization.md" >}}) needs.

Add the JobRunr starter to your project:

{{< codetabs category="dependency" label="Build tool" >}}
{{< codetab label="Maven" >}}
```xml
<dependency>
    <groupId>org.jobrunr</groupId>
    <artifactId>jobrunr-spring-boot-4-starter</artifactId>
    <version>{{< param "JobRunrVersion" >}}</version>
</dependency>
```
{{< /codetab >}}
{{< codetab label="Gradle" >}}
```groovy
implementation 'org.jobrunr:jobrunr-spring-boot-4-starter:{{< param "JobRunrVersion" >}}'
```
{{< /codetab >}}
{{< /codetabs >}}

> [!NOTE]
> For Spring Boot 3, replace `jobrunr-spring-boot-4-starter` with `jobrunr-spring-boot-3-starter`. The `jobrunr-spring-boot-4-starter` artifact requires JobRunr 8.3.0 or higher.

> [!PRO]
> Using JobRunr Pro? Replace `jobrunr-spring-boot-4-starter` with `jobrunr-pro-spring-boot-4-starter` and add the private Maven repository. See [Pro Installation]({{< ref "documentation/pro/installation" >}}) for the full setup.

## Step 2: Configure JobRunr

Add three lines to `application.properties`:

```properties
jobrunr.background-job-server.enabled=true
jobrunr.dashboard.enabled=true
jobrunr.database.type=mem
```

The first two are `false` by default so your web application does not accidentally start processing jobs. The third tells JobRunr to use an in-memory store so no database setup is required for this example.

> [!IMPORTANT]
> `jobrunr.database.type=mem` does not survive restarts. Before going to production, remove it and configure a real database. JobRunr will pick up the existing Spring `DataSource` automatically. See [Storage]({{< ref "documentation/installation/storage" >}}).

> [!TIP]
> Most aspects of JobRunr are configurable via `application.properties`: worker count, retry policy, poll interval, dashboard port, and more. See the [Spring Boot Starter configuration reference]({{< ref "documentation/configuration/spring" >}}) for all available properties.

## Step 3: Build the application

We'll cover three job patterns:

- **Fire-and-forget job:** send a confirmation email without making the subscriber wait
- **Delayed job:** follow up a few days after confirmation with a welcome email
- **Recurring job:** send the weekly digest on a fixed schedule

### Create the EmailService

The `EmailService` holds the actual email logic. In a real application these methods would call a provider like SendGrid or Mailchimp. Here they print to the console so the example runs without external dependencies.

```java
import org.jobrunr.jobs.annotations.Job;
import org.jobrunr.jobs.annotations.Recurring;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Recurring(id = "weekly-digest", cron = "0 0 * * MON") {{< conum 1 >}}
    @Job(name = "Weekly Digest")
    public void sendWeeklyDigest() {
        System.out.println("Weekly digest sent to all subscribers");
    }

    public void sendConfirmation(String email) {
        System.out.println("Confirmation email sent to " + email);
    }

    public void sendWelcome(String email) {
        System.out.println("Welcome email sent to " + email);
    }
}
```

{{< conum-legend >}}
1. JobRunr scans Spring beans for `@Recurring` on startup and registers them automatically, no explicit registration code needed. The `sendWeeklyDigest` is triggered every Monday. `@Recurring` replaces Spring's `@Scheduled` for periodic tasks, JobRunr supports `cron` and `interval` (which is close to `fixedRateString` of `@Scheduled`).
{{< /conum-legend >}}

> [!TIP]
> You can also create recurring jobs programmatically with the `scheduleRecurrently` method from `JobScheduler`.

> [!NOTE]
> JobRunr only requires a Java 8 lambda, e.g., `() -> emailService.sendConfirmation("test@example.com")`. `EmailService` is a regular Spring service with regular methods; there is no `Job` interface to implement or special contract to satisfy.

### Create the SubscriptionController

Let's implement the two remaining job patterns. We're going to use the `JobScheduler` bean, which is provided automatically by the starter, to create the jobs.

```java
import org.jobrunr.scheduling.JobScheduler;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@RestController
public class SubscriptionController {

    private final JobScheduler jobScheduler;
    private final EmailService emailService;

    public SubscriptionController(JobScheduler jobScheduler, EmailService emailService) {
        this.jobScheduler = jobScheduler;
        this.emailService = emailService;
    }

    @PostMapping("/subscribe")
    public ResponseEntity<String> subscribe(@RequestParam String email) {
        var jobId = jobScheduler.enqueue(() -> emailService.sendConfirmation(email)); {{< conum 1 >}}
        return ResponseEntity.accepted().body("Confirmation email queued with job id " + jobId);
    }

    @PostMapping("/confirm")
    public ResponseEntity<String> confirm(@RequestParam String email) {
        var jobId = jobScheduler.schedule(Instant.now().plus(3, ChronoUnit.DAYS),
            () -> emailService.sendWelcome(email)); {{< conum 2 >}}
        return ResponseEntity.accepted().body("Welcome email scheduled with job id " + jobId);
    }
}
```

Both endpoints return `202 Accepted` immediately, the caller never waits for email delivery. If the mail provider is temporarily down, the job is automatically retried. By using a database, you also get crash resilience: if the server goes down mid-job, JobRunr picks it back up on restart.

{{< conum-legend >}}
1. Enqueue a fire-and-forget job: a worker picks it up as soon as one is free.
2. Schedule a delayed job: stored and executed automatically 3 days from now.
{{< /conum-legend >}}

> [!NOTE]
> When a job lambda references a Spring bean, like `emailService.sendConfirmation(email)`, JobRunr serializes the method call, not the bean itself. At execution time, JobRunr asks the Spring IoC container for an instance of `EmailService`. This means your job methods benefit from the full DI container, including injected repositories, transaction management, and other beans.

## Step 4: Try it out

The fastest way to get running is to clone the example project directly:

```bash
git clone https://github.com/jobrunr/jobrunr-examples.git
cd jobrunr-examples/spring-app
./gradlew bootRun
```

Or if you are building from scratch, start the application:

{{< codetabs category="dependency" label="Build tool" >}}
{{< codetab label="Maven" >}}
```bash
./mvnw spring-boot:run
```
{{< /codetab >}}
{{< codetab label="Gradle" >}}
```bash
./gradlew bootRun
```
{{< /codetab >}}
{{< /codetabs >}}

Then hit the endpoints:

```bash
# Subscribe: sends a confirmation email in the background
curl -X POST "http://localhost:8080/subscribe?email=test@example.com"

# Confirm: schedules a welcome email for 3 days from now
curl -X POST "http://localhost:8080/confirm?email=test@example.com"
```

Open the dashboard at [http://localhost:8000/dashboard](http://localhost:8000/dashboard):

- The **Dashboard** tab shows statistics about your job processing system.
- The **Jobs** tab shows the various jobs in queue or processed by JobRunr.
- The **Recurring Jobs** tab shows the weekly digest job registered via `@Recurring`.
- The **Servers** tab shows the servers executing your jobs.

{{< video src="/documentation/jobrunr-oss-dashboard.mp4" autoplay="true" width="100%" muted="true" loop="true" controls="true" >}}

## Next steps

- **Use a real database:** H2 is fine for local development but data is lost on restart. Before going to production, configure a persistent database. JobRunr picks up any `DataSource` bean automatically — see [Storage]({{< ref "documentation/installation/storage" >}}) for all supported databases.
- **Configure the starter:** Worker count, retry policy, poll interval, and dashboard credentials are all configurable via `application.properties`. See the full [Spring Boot Starter reference]({{< ref "documentation/configuration/spring" >}}).
- **Explore health and metrics:** The starter registers Spring Boot Actuator health indicators automatically. Micrometer metrics are also available to plug into your observability platform of choice.
- {{< badge >}}JobRunr Pro{{< /badge >}} **Scale with JobRunr Pro:** Unlock batches, job chaining, priority queues, rate limiting, transaction-aware job creation, and an advanced dashboard. See [JobRunr Pro]({{< ref "documentation/pro" >}}).
