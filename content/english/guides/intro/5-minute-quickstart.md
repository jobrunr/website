---
title: "JobRunr 5-Minute Quickstart Guide"
meta_title: "Get Started with JobRunr - 10-Minute Quickstart"
description: "This guide shows you how to add JobRunr to a Java project, schedule your first (recurring) job, and see it live in the dashboard."
weight: 1
tags:
    - JobRunr
    - Job scheduling
draft: false
aliases: ["/get-started"]
---
### Step 1: Add the JobRunr dependency

Add JobRunr to your project using Maven or Gradle. This quickstart uses the built-in in-memory storage, so we only need a json parser and we are ready to go. 

We recommend using the latest version of JobRunr (e.g., `8.1.0`).

#### Maven

```xml
<dependency> 
    <groupId>org.jobrunr</groupId> 
    <artifactId>jobrunr</artifactId> 
    <version>8.1.0</version> 
</dependency>
<!-- you can use either Jackson, Gson or Yasson (Json-B compatible).  -->
<dependency>
    <groupId>com.fasterxml.jackson.core</groupId>
    <artifactId>jackson-databind</artifactId>
    <version>2.11.0</version>
</dependency>
```

#### Gradle
```xml
implementation 'org.jobrunr:jobrunr:8.1.0'
```

> **Tip:** Are you using <a href="/en/documentation/configuration/spring/">Spring</a>, <a href="/en/documentation/configuration/micronaut/">Micronaut</a> or <a href="/en/documentation/configuration/quarkus/">Quarkus</a>? We created starters to get you going even quicker.

### Step 2: Initialize JobRunr

In your application's main method, configure and initialize JobRunr. We will use the simple `InMemoryStorageProvider` for this demo.

Create a `MainApplication.java` file and add the following code:

```java
import org.jobrunr.configuration.JobRunr;
import org.jobrunr.storage.InMemoryStorageProvider;

public class MainApplication {

    public static void main(String[] args) {

        // Initialize JobRunr
        JobRunr.configure()
            .useStorageProvider(new InMemoryStorageProvider()) // No database needed
            .useBackgroundJobServer() // Starts the processing thread
            .useDashboard()           // Starts the dashboard at http://localhost:8000
            .initialize();
    }
}
```

### Step 3: Schedule your first job

Now, let's schedule a <a href= "/en/documentation/background-methods/recurring-jobs"> recurring job </a> to run every minute. JobRunr uses CRON expressions for scheduling.

Add this code to your `main` method right after `.initialize()`:

```java
import org.jobrunr.configuration.JobRunr;
import org.jobrunr.storage.InMemoryStorageProvider;
import org.jobrunr.scheduling.BackgroundJob;
import org.jobrunr.scheduling.cron.Cron;

public class MainApplication {

    public static void main(String[] args) {

        // Initialize JobRunr
        JobRunr.configure()
            .useStorageProvider(new InMemoryStorageProvider())
            .useBackgroundJobServer()
            .useDashboard()
            .initialize();

        // Schedule your first recurring job
            BackgroundJob.scheduleRecurrently(
                "my-first-job",     // Optional id for this job
                Cron.every5minutes(), // A simple CRON expression
                () -> System.out.println("My recurring job is running!")
        );
    }
}
```

> **Tip:** You can also run a job just <a href= "https://www.jobrunr.io/en/documentation/background-methods/enqueueing-jobs/">once (fire-and-forget) </a> using `BackgroundJob.enqueue(() -> ...)` or <a href= "https://www.jobrunr.io/en/documentation/background-methods/scheduling-jobs/">schedule it</a> for the future with `BackgroundJob.schedule(Instant.now().plusHours(1), () -> ...)` .

### Step 4: Watch it run

Run your `MainApplication.java` file. That's it.

1.  Open your browser and go to **http://localhost:8000/dashboard**.
2.  You will see "my-first-job" listed in the **Recurring Jobs** tab.
3.  Click the **Jobs** tab. Within a minute, you will see your job processing live.

{{< img src="/images/recurring.gif" alt="Animation of a recurring job being scheduled" class="rounded-lg" >}}

---

### What's next?

You've just scheduled your first reliable, recurring job. Here is what to do next.

* **Use a Real Database:** The `InMemoryStorageProvider` is great for testing. When you are ready, switch to a persistent database. See our <a href="https://www.jobrunr.io/en/documentation/installation/storage/">documentation about storage</a> to use JobRunring with your existing SQL or NoSQL database.
* **Save energy and costs with Carbon Aware Scheduling (v8+):** Automatically schedule non-critical jobs to run when the grid's carbon intensity is lowest. This optimizes your server's energy consumption, helping to reduce your CO2 footprint and lower cloud utility costs. [See the Carbon Aware documentation](https://www.jobrunr.io/en/documentation/configuration/carbon-aware/).
* **Using Spring Boot, Micronaut, or Quarkus?** Our auto-configuration and dedicated integration packages make setup a one-liner. Have a look at the <a href="https://www.jobrunr.io/en/documentation/configuration/spring/">Spring Boot</a>, <a href="https://www.jobrunr.io/en/documentation/configuration/micronaut/">Micronaut</a> & <a href="https://www.jobrunr.io/en/documentation/configuration/quarkus/">Quarkus</a> guides.
* **Prefer watching videos?** Check-out our video tutorials on [Youtube](https://www.youtube.com/watch?v=iMCtKdo0NEQ&list=PLk8V-ptqO6kv2oK5XKpG9Ev86h0GIAsqf).
* **Example projects:** We have different example projects on [GitHub](https://github.com/jobrunr?q=example) that help you start. 
* **Explore JobRunr Pro:** Ready to scale? [JobRunr Pro](/en/pro/) offers priority queues, complex workflows, and a multi-cluster dashboard.