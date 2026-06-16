---
title: "Background Job Scheduling in Quarkus"
description: "Learn how to schedule fire-and-forget, delayed, and recurring background jobs in a Quarkus application using the JobRunr Quarkus extension."
keywords: ["quarkus background jobs", "jobrunr quarkus", "quarkus job scheduler", "schedule jobs quarkus", "recurring job quarkus", "quarkus async job", "jobrunr quarkus extension"]
date: 2026-06-16T00:00:00+02:00
layout: "documentation"
menu:
  sidebar:
    parent: getting-started
    name: Quarkus
    weight: 3
sitemap:
  priority: 0.8
  changeFreq: monthly
---

Most Quarkus applications require job scheduling to efficiently manage background tasks. For simple periodic work, `@Scheduled` and Quarkus's virtual thread executors get the job done. For more complex requirements such as persistent execution across restarts, automatic retries on failure, cluster-safe processing, and a built-in dashboard, a more sophisticated solution is necessary.

The **JobRunr Quarkus Extension** adds exactly that to any Quarkus application with a single dependency:

- **Persistent jobs** that survive restarts and crashes
- **Automatic retries** with exponential back-off on failure
- **Cluster-safe execution** so only one node runs each job, no matter how many nodes you run
- **Built-in dashboard** to monitor job progress and history

This guide builds the same newsletter example as the [Java quickstart]({{< ref "documentation/getting-started/java" >}}), this time using the Quarkus extension.

> [!TIP]
> The complete example project for this guide is available at [github.com/jobrunr/jobrunr-examples/quarkus-app](https://github.com/jobrunr/jobrunr-examples/tree/main/quarkus-app).

## Step 1: Add the JobRunr Quarkus Extension

If you are starting from scratch, generate a project at [code.quarkus.io](https://code.quarkus.io/). Select **REST Jackson** for HTTP support; Jackson is included by default and JobRunr will pick it up automatically for [JSON serialization]({{< ref "documentation/serialization" >}}). You can also search for the **jobrunr** extension directly in the launcher to have the dependency added automatically.

Add the extension to your project:

{{< codetabs category="dependency" label="Build tool" >}}
{{< codetab label="Maven" >}}
```xml
<dependency>
    <groupId>org.jobrunr</groupId>
    <artifactId>quarkus-jobrunr</artifactId>
    <version>{{< param "JobRunrVersion" >}}</version>
</dependency>
```
{{< /codetab >}}
{{< codetab label="Gradle" >}}
```groovy
implementation 'org.jobrunr:quarkus-jobrunr:{{< param "JobRunrVersion" >}}'
```
{{< /codetab >}}
{{< /codetabs >}}

> [!PRO]
> Using JobRunr Pro? Replace `quarkus-jobrunr` with `quarkus-jobrunr-pro` and add the private Maven repository. See [Pro Installation]({{< ref "documentation/pro/installation" >}}) for the full setup.

## Step 2: Configure JobRunr

Add the following to `application.properties`:

```properties
quarkus.jobrunr.background-job-server.enabled=true
quarkus.jobrunr.dashboard.enabled=true
quarkus.jobrunr.database.type=mem
```

The first two are `false` by default so your web application does not accidentally start processing jobs. The third tells JobRunr to use an in-memory store so no database setup is required for this example.

> [!IMPORTANT]
> `quarkus.jobrunr.database.type=mem` does not survive restarts. Before going to production, remove it and configure a real database. JobRunr will pick up the existing Quarkus `DataSource` automatically. See [Storage]({{< ref "documentation/installation/storage" >}}).

> [!TIP]
> Most aspects of JobRunr are configurable via `application.properties`: worker count, retry policy, poll interval, dashboard port, and more. See the [Quarkus Extension configuration reference]({{< ref "documentation/configuration/quarkus" >}}) for all available properties.

## Step 3: Build the application

We'll cover three job patterns:

- **Fire-and-forget job:** send a confirmation email without making the subscriber wait
- **Delayed job:** follow up a few days after confirmation with a welcome email
- **Recurring job:** send the weekly digest on a fixed schedule

### Create the EmailService

The `EmailService` holds the actual email logic. In a real application these methods would call a provider like SendGrid or Mailchimp. Here they print to the console so the example runs without external dependencies.

```java
import jakarta.enterprise.context.ApplicationScoped;
import org.jobrunr.jobs.annotations.Job;
import org.jobrunr.jobs.annotations.Recurring;

@ApplicationScoped
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
1. JobRunr scans CDI beans for `@Recurring` on startup and registers them automatically, no explicit registration code needed. The `sendWeeklyDigest` method is triggered every Monday. `@Recurring` is a persistent, cluster-safe alternative to Quarkus's `@Scheduled`; it supports both `cron` expressions and fixed `interval` durations.
{{< /conum-legend >}}

> [!TIP]
> You can also create recurring jobs programmatically with the `scheduleRecurrently` method from `JobScheduler`.

> [!NOTE]
> JobRunr only requires a Java 8 lambda, e.g., `() -> emailService.sendConfirmation("test@example.com")`. `EmailService` is a regular Quarkus service with regular methods; there is no `Job` interface to implement or special contract to satisfy.

### Create the SubscriptionResource

Let's implement the two remaining job patterns. We're going to use the `JobScheduler` bean, which is provided automatically by the extension, to create the jobs.

```java
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.jobrunr.scheduling.JobScheduler;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Path("/")
@Produces(MediaType.TEXT_PLAIN)
public class SubscriptionResource {

    @Inject
    JobScheduler jobScheduler;

    @Inject
    EmailService emailService;

    @POST
    @Path("/subscribe")
    public Response subscribe(@QueryParam("email") String email) {
        var jobId = jobScheduler.enqueue(() -> emailService.sendConfirmation(email)); {{< conum 1 >}}
        return Response.accepted("Confirmation email queued with job id " + jobId).build();
    }

    @POST
    @Path("/confirm")
    public Response confirm(@QueryParam("email") String email) {
        var jobId = jobScheduler.schedule(Instant.now().plus(3, ChronoUnit.DAYS),
            () -> emailService.sendWelcome(email)); {{< conum 2 >}}
        return Response.accepted("Welcome email scheduled with job id " + jobId).build();
    }
}
```

Both endpoints return `202 Accepted` immediately, the caller never waits for email delivery. If the mail provider is temporarily down, the job is automatically retried. Use a persistent database and you also get crash resilience: if the server goes down mid-job, JobRunr picks it back up on restart.

{{< conum-legend >}}
1. Enqueue a fire-and-forget job: a worker picks it up as soon as one is free.
2. Schedule a delayed job: stored and executed automatically 3 days from now.
{{< /conum-legend >}}

> [!NOTE]
> When a job lambda references a CDI bean, like `emailService.sendConfirmation(email)`, JobRunr serializes the method call, not the bean itself. At execution time, JobRunr asks the CDI container for an instance of `EmailService`. This means your job methods benefit from the full DI container, including injected repositories and other beans.

## Step 4: Try it out

The fastest way to get running is to clone the example project directly:

```bash
git clone https://github.com/jobrunr/jobrunr-examples.git
cd jobrunr-examples/quarkus-app
./mvnw quarkus:dev
```

Or if you are building from scratch, start the application in dev mode:

{{< codetabs category="dependency" label="Build tool" >}}
{{< codetab label="Maven" >}}
```bash
./mvnw quarkus:dev
```
{{< /codetab >}}
{{< codetab label="Gradle" >}}
```bash
./gradlew quarkusDev
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

- **Use a real database:** The in-memory store is fine for local development but data is lost on restart. Before going to production, configure a persistent database. JobRunr picks up any `DataSource` bean automatically. See [Storage]({{< ref "documentation/installation/storage" >}}) for all supported databases.
- **Configure the extension:** Worker count, retry policy, poll interval, and dashboard port are all configurable via `application.properties`. See the full [Quarkus Extension reference]({{< ref "documentation/configuration/quarkus" >}}).
- **Explore health and metrics:** The extension registers Smallrye health checks automatically. Micrometer metrics are also available to plug into your observability platform of choice.
- {{< badge >}}JobRunr Pro{{< /badge >}} **Scale with JobRunr Pro:** Unlock batches, job chaining, priority queues, rate limiting, transaction-aware job creation, and an advanced dashboard. See [JobRunr Pro]({{< ref "documentation/pro" >}}).
