---
title: "Background Job Scheduling in Kotlin"
description: "Learn how to schedule fire-and-forget, delayed, and recurring background jobs in a Kotlin application using JobRunr with Kotlin lambdas and Kotlin Serialization."
keywords: ["kotlin background jobs", "jobrunr kotlin", "kotlin job scheduler", "schedule jobs kotlin", "recurring job kotlin", "kotlin serialization jobrunr", "koin jobrunr", "jobrunr kotlin support"]
date: 2026-06-16T00:00:00+02:00
layout: "documentation"
menu:
  sidebar:
    parent: getting-started
    name: Kotlin
    weight: 5
sitemap:
  priority: 0.8
  changeFreq: monthly
---

This guide walks you through adding background job scheduling to a Kotlin application. As a practical example, we'll build a small HTTP server for a newsletter subscription service, using JobRunr to handle three common background job patterns:

- **Fire-and-forget job:** send a confirmation email without making the subscriber wait
- **Delayed job:** follow up a few days after confirmation with a welcome email
- **Recurring job:** send the weekly digest on a fixed schedule

> [!TIP]
> The complete example project for this guide is available at [github.com/jobrunr/jobrunr-examples/kotlin-app](https://github.com/jobrunr/jobrunr-examples/tree/main/kotlin-app).

## Step 1: Add the dependencies

```kotlin
// build.gradle.kts
plugins {
    kotlin("jvm") version "2.2.0"
    kotlin("plugin.serialization") version "2.2.0"
}

dependencies {
    implementation("org.jobrunr:jobrunr:{{< param "JobRunrVersion" >}}")
    // Optional but recommended for Kotlin projects: Kotlin-native features
    implementation("org.jobrunr:jobrunr-kotlin-support:{{< param "JobRunrVersion" >}}")
    // Required when using Kotlin Serialization as JSON mapper
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.11.0") // check for a more recent version
}
```

The package `jobrunr-kotlin-support` is not required to schedule jobs: the core `jobrunr` library already understands Kotlin lambdas. The package becomes useful when you want to use [Kotlin Serialization]({{< ref "documentation/serialization/kotlinx-serialization" >}}) instead of Jackson or Gson, resolve job dependencies from a Koin container via `KoinJobActivator`, or leverage [Exposed transactions]({{< ref "documentation/pro/transactions" >}}) (JobRunr Pro). When both `jobrunr-kotlin-support` and `kotlinx-serialization-json` are on the classpath, JobRunr picks up Kotlin Serialization automatically as its JSON mapper, no extra wiring needed.

> [!TIP]
> Using a framework with Kotlin? The [Spring Boot]({{< ref "documentation/getting-started/spring" >}}), [Quarkus]({{< ref "documentation/getting-started/quarkus" >}}), and [Micronaut]({{< ref "documentation/getting-started/micronaut" >}}) guides use dedicated integrations that make setup even simpler. You can add `jobrunr-kotlin-support` alongside any framework starter to unlock Kotlin-native features.

> [!PRO]
> Using JobRunr Pro? Replace `jobrunr` with `jobrunr-pro` and `jobrunr-kotlin-support` with `jobrunr-pro-kotlin-support`, then add the private repository. See [Pro Installation]({{< ref "documentation/pro/installation" >}}) for the full setup.

## Step 2: Create the EmailService

Create `EmailService.kt`. In a real application these methods would call a service like SendGrid or Mailchimp. Here we print to the console so the example runs with no external dependencies.

```kotlin
class EmailService {

    fun sendConfirmation(email: String) {
        println("Confirmation email sent to $email")
    }

    fun sendWelcome(email: String) {
        println("Welcome email sent to $email")
    }

    fun sendWeeklyDigest() {
        println("Weekly digest sent to all subscribers")
    }
}
```

> [!NOTE]
> JobRunr only requires a Kotlin lambda, e.g., `{ emailService.sendConfirmation("test@example.com") }`. `EmailService` is a plain Kotlin class with regular methods; there is no `Job` interface to implement or special contract to satisfy.

## Step 3: Build the subscription server

Create `App.kt`.

Three things happen here:
- a subscriber hits `POST /subscribe` and a confirmation email is sent as soon as possible (fire-and-forget job)
- once they confirm via `POST /confirm`, a welcome email is scheduled for three days later (delayed job)
- a weekly digest goes out to all subscribers every Monday (recurring job)

```kotlin
import com.sun.net.httpserver.HttpExchange
import com.sun.net.httpserver.HttpServer
import org.jobrunr.configuration.JobRunr
import org.jobrunr.scheduling.BackgroundJob
import org.jobrunr.scheduling.cron.Cron
import org.jobrunr.storage.InMemoryStorageProvider
import java.net.InetSocketAddress
import java.time.DayOfWeek
import java.time.Instant
import java.time.temporal.ChronoUnit

fun main() {
    val emailService = EmailService()

    JobRunr.configure() {{< conum 1 >}} // Using JobRunr Pro? Replace `JobRunr` with `JobRunrPro`
        .useStorageProvider(InMemoryStorageProvider())
        .useBackgroundJobServer()
        .useDashboard()
        .initialize()

    BackgroundJob.scheduleRecurrently("weekly-digest", Cron.weekly(DayOfWeek.MONDAY)) {
        emailService.sendWeeklyDigest()
    } {{< conum 2 >}}

    val server = HttpServer.create(InetSocketAddress(8080), 0)

    server.createContext("/subscribe") { exchange ->
        if (exchange.requestMethod != "POST") { exchange.respond(405, "Method Not Allowed"); return@createContext }
        val email = exchange.getEmailFromQueryParams()
            ?: run { exchange.respond(400, "Missing email parameter"); return@createContext }
        val jobId = BackgroundJob.enqueue { emailService.sendConfirmation(email) } {{< conum 3 >}}
        exchange.respond(202, "Confirmation email queued with job id $jobId")
    }

    server.createContext("/confirm") { exchange ->
        if (exchange.requestMethod != "POST") { exchange.respond(405, "Method Not Allowed"); return@createContext }
        val email = exchange.getEmailFromQueryParams()
            ?: run { exchange.respond(400, "Missing email parameter"); return@createContext }
        val jobId = BackgroundJob.schedule(Instant.now().plus(3, ChronoUnit.DAYS)) {
            emailService.sendWelcome(email)
        } {{< conum 4 >}}
        exchange.respond(202, "Welcome email scheduled with job id $jobId")
    }

    server.start()
    println("Listening on http://localhost:8080")
}

fun HttpExchange.getEmailFromQueryParams(): String? {
    val q = requestURI.query ?: return null
    val value = q.substringAfter("email=", missingDelimiterValue = "")
    return value.ifEmpty { null }
}

fun HttpExchange.respond(status: Int, body: String) {
    val bytes = body.toByteArray()
    sendResponseHeaders(status, bytes.size.toLong())
    responseBody.write(bytes)
    close()
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
cd jobrunr-examples/kotlin-app
./gradlew run
```

Or if you are building from scratch, run your application:

```bash
./gradlew run
```

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
- **Use Koin for dependency injection:** `KoinJobActivator` from `jobrunr-kotlin-support` lets JobRunr resolve job classes from the Koin container, so your job methods run with the full DI context at execution time.
- **Adopt a framework:** Moving to Spring Boot, Quarkus, or Micronaut? The dedicated integrations auto-configure JobRunr from your application properties file, and `jobrunr-kotlin-support` can be added alongside any of them.
- {{< badge >}}JobRunr Pro{{< /badge >}} **Scale with JobRunr Pro:** Unlock batches, job chaining, priority queues, rate limiting, Exposed transaction support, and an advanced dashboard. See [JobRunr Pro]({{< ref "documentation/pro" >}}).
