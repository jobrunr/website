---
title: "Background Job Scheduling in Java"
subtitle: "Schedule background jobs in any Java application with just a few lines of code."
description: "Learn how to schedule fire-and-forget, delayed, and recurring background jobs in a plain Java application using JobRunr's Fluent API."
keywords: ["java background jobs", "java job scheduler", "schedule jobs java", "recurring job java", "java cron job", "background task java", "plain java jobrunr", "jobrunr fluent api", "java async job", "standalone jobrunr"]
date: 2026-05-28T00:00:00+02:00
layout: "documentation"
menu:
  sidebar:
    parent: getting-started
    name: Java
    weight: 1
sitemap:
  priority: 0.8
  changeFreq: monthly
---

This guide walks you through adding background job scheduling to a Java application. As a practical example, we'll build a small HTTP server for a newsletter subscription service, using JobRunr to handle three common background job patterns:

- **Fire-and-forget job:** send a confirmation email without making the subscriber wait
- **Delayed job:** follow up a few days after confirmation with a welcome email
- **Recurring job:** send the weekly digest on a fixed schedule

> [!NOTE]
> This guide uses modern Java features such as compact source files (Java 25). JobRunr itself is compatible with Java 8 and higher. On older versions, the examples will need to be adapted.

> [!TIP]
> The complete example project for this guide is available at [github.com/jobrunr/jobrunr-examples/java-app](https://github.com/jobrunr/jobrunr-examples/tree/main/java-app).

> [!TIP]
> Using a framework? The [Spring Boot]({{< ref "documentation/getting-started/spring" >}}), [Quarkus]({{< ref "documentation/getting-started/quarkus" >}}), and [Micronaut]({{< ref "documentation/getting-started/micronaut" >}}) guides use dedicated integrations that make setup even simpler.

## Step 1: Add the JobRunr dependency

{{< codetabs category="dependency" label="Build tool" >}}
{{< codetab label="Maven" >}}
```xml
<dependency>
    <groupId>org.jobrunr</groupId>
    <artifactId>jobrunr</artifactId>
    <version>{{< param "JobRunrVersion" >}}</version>
</dependency>
<!-- Pick one JSON library: Jackson (shown here), Gson, JSON-B -->
<dependency>
    <groupId>tools.jackson.core</groupId>
    <artifactId>jackson-databind</artifactId>
    <version>3.1.2<!-- check for a more recent version --></version>
</dependency>
```
{{< /codetab >}}
{{< codetab label="Gradle" >}}
```groovy
implementation 'org.jobrunr:jobrunr:{{< param "JobRunrVersion" >}}'
// Pick one JSON library: Jackson (shown here), Gson, JSON-B, or Kotlin Serialization
implementation 'tools.jackson.core:jackson-databind:3.1.2' // check for a later version
```
{{< /codetab >}}
{{< /codetabs >}}

JobRunr needs a JSON library to serialize job metadata. This example uses Jackson 3, but you can swap it for Jackson 2, Gson, or JSON-B. See [Serialization]({{< ref "documentation/serialization" >}}) for details.

> [!PRO]
> Using JobRunr Pro? Replace the `jobrunr` artifact with `jobrunr-pro` and add the private repository to your build. See [Pro Installation]({{< ref "documentation/pro/installation" >}}) for the full setup.

## Step 2: Create the EmailService

Create `EmailService.java`. In a real application these methods would call out to a service like SendGrid or Mailchimp. Here we print to the console so the example runs with no external dependencies.

```java
public class EmailService {

    public void sendConfirmation(String email) {
        IO.println("Confirmation email sent to " + email);
    }

    public void sendWelcome(String email) {
        IO.println("Welcome email sent to " + email);
    }

    public void sendWeeklyDigest() {
        IO.println("Weekly digest sent to all subscribers");
    }
}
```

> [!NOTE]
> JobRunr only requires a Java 8 lambda, e.g., `() -> emailService.sendConfirmation("test@example.com")`. `EmailService` is a plain Java class with regular methods; there is no `Job` interface to implement or special contract to satisfy.

## Step 3: Build the subscription server

Create `App.java`. Thanks to compact source files (Java 25), no class declaration is needed.

Three things happen here:
- a subscriber hits `POST /subscribe` and a confirmation email is sent as soon as possible (fire-and-forget job)
- once they confirm via `POST /confirm`, a welcome email is scheduled for three days later (delayed job)
- a weekly digest goes out to all subscribers every Monday (recurring job)

```java
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import org.jobrunr.configuration.JobRunr;
import org.jobrunr.scheduling.BackgroundJob;
import org.jobrunr.scheduling.cron.Cron;
import org.jobrunr.storage.InMemoryStorageProvider;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.time.DayOfWeek;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

void main() throws Exception {
    var emailService = new EmailService();

    JobRunr.configure() {{< conum 1 >}} // Using JobRunr Pro? Replace `JobRunr` by `JobRunrPro`
        .useStorageProvider(new InMemoryStorageProvider())
        .useBackgroundJobServer()
        .useDashboard()
        .initialize();

    BackgroundJob.scheduleRecurrently("weekly-digest", Cron.weekly(DayOfWeek.of(1)),
        () -> emailService.sendWeeklyDigest()); {{< conum 2 >}}

    var server = HttpServer.create(new InetSocketAddress(8080), 0);

    server.createContext("/subscribe", exchange -> {
        if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) { respond(exchange, 405, "Method Not Allowed"); return; }
        var email = getEmailFromQueryParams(exchange);
        if (email == null) { respond(exchange, 400, "Missing email parameter"); return; }
        var jobId = BackgroundJob.enqueue(() -> emailService.sendConfirmation(email)); {{< conum 3 >}}
        respond(exchange, 202, "Confirmation email queued with job id " + jobId);
    });

    server.createContext("/confirm", exchange -> {
        if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) { respond(exchange, 405, "Method Not Allowed"); return; }
        var email = getEmailFromQueryParams(exchange);
        if (email == null) { respond(exchange, 400, "Missing email parameter"); return; }
        var jobId = BackgroundJob.schedule(Instant.now().plus(3, ChronoUnit.DAYS),
            () -> emailService.sendWelcome(email)); {{< conum 4 >}}
        respond(exchange, 202, "Welcome email scheduled with job id " + jobId);
    });

    server.start();
    IO.println("Listening on http://localhost:8080");
}

String getEmailFromQueryParams(HttpExchange ex) {
    var query = ex.getRequestURI().getQuery();
    if (query == null) return null;
    for (var param : query.split("&")) {
        if (param.startsWith("email=")) return param.substring(6);
    }
    return null;
}

void respond(HttpExchange ex, int status, String body) throws IOException {
    var bytes = body.getBytes();
    ex.sendResponseHeaders(status, bytes.length);
    ex.getResponseBody().write(bytes);
    ex.close();
}
```

There is a lot to unpack from this simple code. Both HTTP handlers return `202 Accepted` immediately, so the caller never waits for email delivery. If the mail provider is temporarily down, the job is automatically retried. The weekly digest runs on its own schedule, independently of any HTTP request. Switch to a persistent database and you also get crash resilience: if the server goes down mid-job, JobRunr picks it back up on restart. That is already a quite powerful setup for a few lines of code.

Most of this code sets up the HTTP server. Here is what JobRunr contributes:

{{< conum-legend >}}
1. Configure and start JobRunr: sets up the storage, job processing server (aka background job server), and dashboard. The job server and dashboard are opt-in; storage is the only required piece.
2. Register a recurring job: JobRunr triggers this every Monday.
3. Enqueue a fire-and-forget job: picked up by a worker as soon as one is free.
4. Schedule a delayed job: stored and executed automatically 3 days from now.
{{< /conum-legend >}}

> [!TIP]
> `useBackgroundJobServer` and `useDashboard` are opt-in. Both accept configuration options, and each has a conditional variant (`useBackgroundJobServerIf`, `useDashboardIf`) that lets you toggle them via an environment variable or application argument.

> [!IMPORTANT]
> Jobs stored in `InMemoryStorageProvider` do not survive restarts. When you are ready to go to production, swap it for a real database. See [Storage]({{< ref "documentation/installation/storage" >}}).

## Step 4: Try it out

The fastest way to get running is to clone the example project directly:

```bash
git clone https://github.com/jobrunr/jobrunr-examples.git
cd jobrunr-examples/java-app
./gradlew run
```

Or if you are building from scratch, run your application:

{{< codetabs category="dependency" label="Build tool" >}}
{{< codetab label="Maven" >}}
```bash
mvn compile exec:java -Dexec.mainClass=App
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
# Subscribe: sends a confirmation email immediately
curl -X POST "http://localhost:8080/subscribe?email=test@example.com"

# Confirm: schedules a welcome email for 3 days from now
curl -X POST "http://localhost:8080/confirm?email=test@example.com"
```

Open the dashboard at [http://localhost:8000/dashboard](http://localhost:8000/dashboard):

- The **Dashboard** tab shows statistics about your job processing system.
- The **Jobs** tab shows the various jobs in queue or processed by JobRunr.
- The **Recurring Jobs** tab shows details about your periodic jobs.
- The **Servers** tab shows the servers executing your jobs.

{{< video src="/documentation/jobrunr-oss-dashboard.mp4" autoplay="true" width="100%" muted="true" loop="true" controls="true" >}}

## Next steps

- **Use a real database:** `InMemoryStorageProvider` is fine for local development. Before going to production, switch to a persistent [StorageProvider]({{< ref "documentation/installation/storage" >}}) backed by your existing SQL or NoSQL database.
- **Configure the job scheduler:** The [Fluent API reference]({{< ref "documentation/configuration/fluent" >}}) covers worker counts, custom retry policies, JMX, Micrometer metrics, and more.
- **Adopt a framework:** Moving to Spring Boot, Quarkus, or Micronaut? The dedicated integrations auto-configure JobRunr from your application properties file.
- {{< badge >}}JobRunr Pro{{< /badge >}}**Scale with JobRunr Pro:** Unlock batches, job chaining, priority queues, rate limiting, and an advanced dashboard. See [JobRunr Pro]({{< ref "documentation/pro" >}}).
