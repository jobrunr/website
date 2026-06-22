---
title: "Background Job Scheduling in Micronaut"
description: "Learn how to schedule fire-and-forget, delayed, and recurring background jobs in a Micronaut application using the JobRunr Micronaut integration."
keywords: ["micronaut background jobs", "jobrunr micronaut", "micronaut job scheduler", "schedule jobs micronaut", "recurring job micronaut", "micronaut async job", "jobrunr micronaut integration"]
date: 2026-06-16T00:00:00+02:00
layout: "documentation"
menu:
  sidebar:
    parent: getting-started
    name: Micronaut
    weight: 4
sitemap:
  priority: 0.8
  changeFreq: monthly
---

Micronaut's `@Scheduled` is the standard way to run periodic tasks: annotate a method with a fixed delay, rate, or cron expression and Micronaut executes it on a background thread. It works well for lightweight recurring work, but it runs entirely in-process with no persistence and no retry mechanism. When a task fails, it is silently dropped. In a multi-node deployment, every node fires the same task at the same time, so a weekly digest email can go out as many times as you have nodes running.

The **JobRunr Micronaut Integration** drops into any Micronaut application with a single dependency to give you:

- **Persistent jobs** that survive restarts and crashes
- **Automatic retries** with exponential back-off on failure
- **Cluster-safe execution** so only one node runs each job, no matter how many nodes you run
- **Built-in dashboard** to monitor job progress and history

This guide builds the same newsletter example as the [Java quickstart]({{< ref "documentation/getting-started/java" >}}), this time using the Micronaut integration.

> [!TIP]
> The complete example project for this guide is available at [github.com/jobrunr/jobrunr-examples/micronaut-app](https://github.com/jobrunr/jobrunr-examples/tree/main/micronaut-app).

## Step 1: Add the JobRunr Micronaut Integration

If you are starting from scratch, generate a project at [micronaut.io/launch](https://micronaut.io/launch/). Select **Micronaut Application** as the application type; HTTP server support is included by default. You can also search for the **jobrunr** feature in the launcher to have the dependency added automatically.

The integration requires two artifacts: the runtime dependency and an annotation processor that registers `@Recurring` jobs at compile time.

{{< codetabs category="dependency" label="Build tool" >}}
{{< codetab label="Maven" >}}
```xml
<dependency>
    <groupId>org.jobrunr</groupId>
    <artifactId>jobrunr-micronaut-feature</artifactId>
    <version>{{< param "JobRunrVersion" >}}</version>
</dependency>
<!-- Pick one JSON library: Jackson (shown here), Gson, JSON-B -->
<dependency>
    <groupId>io.micronaut</groupId>
    <artifactId>micronaut-jackson-databind</artifactId>
</dependency>
<!-- ... -->
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-compiler-plugin</artifactId>
    <configuration>
        <annotationProcessorPaths>
            <!-- ... existing Micronaut processors ... -->
            <path>
                <groupId>org.jobrunr</groupId>
                <artifactId>jobrunr-micronaut-annotations</artifactId>
                <version>{{< param "JobRunrVersion" >}}</version>
            </path>
        </annotationProcessorPaths>
    </configuration>
</plugin>
```
{{< /codetab >}}
{{< codetab label="Gradle" >}}
```groovy
annotationProcessor 'org.jobrunr:jobrunr-micronaut-annotations:{{< param "JobRunrVersion" >}}'
implementation 'org.jobrunr:jobrunr-micronaut-feature:{{< param "JobRunrVersion" >}}'
// Pick one JSON library: Jackson (shown here), Gson, JSON-B
implementation 'io.micronaut:micronaut-jackson-databind'
```
{{< /codetab >}}
{{< /codetabs >}}

JobRunr needs a JSON library to serialize job parameters. This example uses Jackson via `micronaut-jackson-databind`, which is managed by the Micronaut BOM so no explicit version is needed. See [Serialization]({{< ref "documentation/serialization" >}}) for other supported libraries.

The annotation processor is required to use `@Recurring`, it generates the necessary Micronaut bean metadata at compile time so JobRunr can discover and register your recurring jobs on startup.

> [!PRO]
> Using JobRunr Pro? Replace `jobrunr-micronaut-feature` with `jobrunr-pro-micronaut-feature` and `jobrunr-micronaut-annotations` with `jobrunr-pro-micronaut-annotations`, then add the private Maven repository. See [Pro Installation]({{< ref "documentation/pro/installation" >}}) for the full setup.

## Step 2: Configure JobRunr

Add the following to `application.yml`:

```yaml
jobrunr:
  background-job-server:
    enabled: true
  dashboard:
    enabled: true
  database:
    type: mem
```

The first two are `false` by default so your web application does not accidentally start processing jobs. The third tells JobRunr to use an in-memory store so no database setup is required for this example.

> [!IMPORTANT]
> `database.type: mem` does not survive restarts. Before going to production, remove it and configure a real database. JobRunr will pick up the existing Micronaut `DataSource` automatically. See [Storage]({{< ref "documentation/installation/storage" >}}).

> [!TIP]
> Most aspects of JobRunr are configurable via `application.yml`: worker count, retry policy, poll interval, dashboard port, and more. See the [Micronaut Integration configuration reference]({{< ref "documentation/configuration/micronaut" >}}) for all available properties.

## Step 3: Build the application

We'll cover three job patterns:

- **Fire-and-forget job:** send a confirmation email without making the subscriber wait
- **Delayed job:** follow up a few days after confirmation with a welcome email
- **Recurring job:** send the weekly digest on a fixed schedule

### Create the EmailService

The `EmailService` holds the actual email logic. In a real application these methods would call a provider like SendGrid or Mailchimp. Here they print to the console so the example runs without external dependencies.

```java
import jakarta.inject.Singleton;
import org.jobrunr.jobs.annotations.Job;
import org.jobrunr.jobs.annotations.Recurring;

@Singleton
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
1. JobRunr scans Micronaut beans for `@Recurring` on startup and registers them automatically, no explicit registration code needed. The `sendWeeklyDigest` method is triggered every Monday. `@Recurring` replaces Micronaut's `@Scheduled` for periodic tasks; it supports both `cron` expressions and fixed `interval` durations.
{{< /conum-legend >}}

> [!TIP]
> You can also create recurring jobs programmatically with the `scheduleRecurrently` method from `JobScheduler`.

> [!NOTE]
> JobRunr only requires a Java 8 lambda, e.g., `() -> emailService.sendConfirmation("test@example.com")`. `EmailService` is a regular Micronaut service with regular methods; there is no `Job` interface to implement or special contract to satisfy.

### Create the SubscriptionController

Let's implement the two remaining job patterns. We're going to use the `JobScheduler` bean, which is provided automatically by the integration, to create the jobs.

```java
import io.micronaut.http.HttpResponse;
import io.micronaut.http.annotation.Controller;
import io.micronaut.http.annotation.Post;
import io.micronaut.http.annotation.QueryValue;
import org.jobrunr.scheduling.JobScheduler;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Controller
public class SubscriptionController {

    private final JobScheduler jobScheduler;
    private final EmailService emailService;

    public SubscriptionController(JobScheduler jobScheduler, EmailService emailService) {
        this.jobScheduler = jobScheduler;
        this.emailService = emailService;
    }

    @Post("/subscribe")
    public HttpResponse<String> subscribe(@QueryValue String email) {
        var jobId = jobScheduler.enqueue(() -> emailService.sendConfirmation(email)); {{< conum 1 >}}
        return HttpResponse.accepted().body("Confirmation email queued with job id " + jobId);
    }

    @Post("/confirm")
    public HttpResponse<String> confirm(@QueryValue String email) {
        var jobId = jobScheduler.schedule(Instant.now().plus(3, ChronoUnit.DAYS),
            () -> emailService.sendWelcome(email)); {{< conum 2 >}}
        return HttpResponse.accepted().body("Welcome email scheduled with job id " + jobId);
    }
}
```

Both endpoints return `202 Accepted` immediately, the caller never waits for email delivery. If the mail provider is temporarily down, the job is automatically retried. Use a persistent database and you also get crash resilience: if the server goes down mid-job, JobRunr picks it back up on restart.

{{< conum-legend >}}
1. Enqueue a fire-and-forget job: a worker picks it up as soon as one is free.
2. Schedule a delayed job: stored and executed automatically 3 days from now.
{{< /conum-legend >}}

> [!NOTE]
> When a job lambda references a Micronaut bean, like `emailService.sendConfirmation(email)`, JobRunr serializes the method call, not the bean itself. At execution time, JobRunr asks the Micronaut application context for an instance of `EmailService`. This means your job methods benefit from the full DI container, including injected repositories and other beans.

## Step 4: Try it out

The fastest way to get running is to clone the example project directly:

```bash
git clone https://github.com/jobrunr/jobrunr-examples.git
cd jobrunr-examples/micronaut-app
./gradlew run
```

Or if you are building from scratch, start the application:

{{< codetabs category="dependency" label="Build tool" >}}
{{< codetab label="Maven" >}}
```bash
./mvnw mn:run
```
{{< /codetab >}}
{{< codetab label="Gradle" >}}
```bash
./gradlew run
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
- **Configure the integration:** Worker count, retry policy, poll interval, and dashboard port are all configurable via `application.yml`. See the full [Micronaut Integration reference]({{< ref "documentation/configuration/micronaut" >}}).
- **Explore health and metrics:** The integration registers Micronaut health indicators automatically. Micrometer metrics are also available to plug into your observability platform of choice.
- {{< badge >}}JobRunr Pro{{< /badge >}} **Scale with JobRunr Pro:** Unlock batches, job chaining, priority queues, rate limiting, transaction-aware job creation, and an advanced dashboard. See [JobRunr Pro]({{< ref "documentation/pro" >}}).
