---
title: "🍀 ⚡️JobRunr and JobRunr Pro v8.0.0!"
summary: "We're proud to announce the latest release, JobRunr & JobRunr Pro v8.0.0"
feature_image: /blog/2024-04-09-jobrunr-jobrunr-pro-v7.png
date: 2025-07-03T09:00:00+02:00
draft: true
author: "The JobRunr Team"
tags:
  - blog
  - meta
---

<div style="text-align: center;margin: -2em 0 2em;">
<small style="font-size: 70%;"><a href='https://www.freepik.com/vectors/cartoon-astronaut'>Cartoon astronaut vector created by catalyststuff - www.freepik.com</a></small>
</div>

JobRunr and JobRunr Pro `v8` has arrived! This release introduces a slew of new features such as _Carbon Aware Job Processing_; a new feature that optimizes job execution based on grid carbon intensity, helping reduce your application's environmental impact by running jobs when cleaner energy is available; _Kotlin Serialization_ support; a brand new _Dashboard Notification Centre_; significant database performance boosts; and more! 

To upgrade from JobRunr `v7.x`, please follow the [JobRunr v8 migration guide](/en/guides/migration/v8/). Let's explore these new features one by one to get a better understanding of what's new and what has been changed. Be sure to also **review the breaking changes section**. 

## JobRunr v8 Features

### Carbon Aware Job Processing

The brand new feature called _Carbon Aware Job Processing_ is JobRunr's way to help reduce the carbon footprint of your data centre by scheduling jobs in such a way that their energy consumption impact is minimised. By relying on energy forecast information of energy data providers such as the [ENTSO-E](https://www.entsoe.eu/) services for the European Union (EU), we can leverage the prediction to process jobs---and thus consume energy---a little sooner or later than their preferred time.

For instance, suppose you have a daily recurring job that generates invoice PDF files and sends them out to customers. That job can be configured by using a simple cron, e.g. `0 5 * * *`. Each early morning at 5AM, it will start to process data. But what if two hours later would be a better moment to reduce the CO2 footprint of the application?

Instead of scheduling jobs like this:

```java
BackgroundJob.scheduleRecurrently("0 5 * * *", () -> pdfService.generate());
```

You can now do this:

```java
BackgroundJob.scheduleRecurrently("0 5 * * * [PT1H/PT3H]", 
    () -> pdfService.generate());
// or
BackgroundJob.scheduleRecurrently(CarbonAware.dailyBetween(4, 8), 
    () -> pdfService.generate());
// or
BackgroundJob.scheduleRecurrently(CarbonAware.cron("0 5 * * *", Duration.of(1, HOURS), Duration.of(3, HOURS)), 
    () -> pdfService.generate());
```

The configured margin `[from, to]` adds slack to the schedule time of the job. Depending on the forecast put out by the data provider, the job can be enqueued an hour sooner (`[PT1H`) or at most three hours later (`/PT3H]`). JobRunr comes equipped with multiple expressive APIs that help ease the configuration of these Carbon Aware Jobs, by using the `CarbonAware` class or the `CarbonAwarePeriod` class for fire-and-forget jobs. 

As soon as recurring jobs with a Carbon Aware margin are scheduled, a job is created ahead of time in a "Pending" state, waiting to be scheduled depending on the Carbon Intensity forecast. Once JobRunr figures out when exactly to run the job, it will set a scheduled time to move on to the next states: "Scheduled", and when it is time to execute, "Enqueued" and "Processing". As usual, you can follow up in the progress of your job in the JobRunr Dashboard:

![](/blog/jobrunr-carbon-dashboard-anim.gif "Inspecting a scheduled job that is Carbon Aware.")

Note the appearance of the green energy leaf icon in the Pending tab, denoting that specific job is Carbon Aware. When going to the job details and opening up the Pending state tab, you can visually inspect why JobRunr chose to schedule it at a specific time. In this case, a recurring job is scheduled between 17h and 22h, and it will be triggered 6 hours from now at the best moment to minimize carbon impact. Also note that you can inspect which area the carbon forecast is coming from---in this case Belgium.

Want to get started? Great! Here are a few more articles that will be of great help:

- The [How To Reduce Your Carbon Impact With Carbon Aware Jobs](/en/guides/intro/how-to-reduce-carbon-impact-with-carbon-aware-jobs/) guide for more examples and how to correctly configure your setup.
- The [Carbon Aware Processing: Configuration](/en/documentation/configuration/carbon-aware/) documentation and
- The [Background Methods: Carbon Aware Jobs](/en/documentation/background-methods/carbon-aware-jobs/) documentation for more in-depth information about the feature.

### Kotlin Serialization Support

JobRunr v8 supports another JSON serializer: `kotlinx.serialization.json.Json`. If you love working with Kotlin and prefer their own serialization extension instead of the usual Jackson or Gson libraries---especially if compiling natively---you will love the new JSON Mapper class called `KotlinxSerializationJsonMapper`, which is present in the JobRunr Kotlin Support projects.

Simply start using it by injecting the mapper in the configuration:

```java
JobRunr
        .configure()
        .useJsonMapper(new KotlinxSerializationJsonMapper())
        .useStorageProvider(storageProvider)
        // ...
```

This requires the following plugins/libraries to be present as a dependency: plugins `org.jetbrains.kotlin.jvm` 2.1 or 2.2 and `org.jetbrains.kotlin.plugin.serialization`, library `org.jetbrains.kotlinx:kotlinx-serialization-json` 1.8.0 and up, and of course the JobRunr libraries: `org.jobrunr:jobrunr` and `org.jobrunr:jobrunr-kotlin-2.2-support`.

Check out the following example projects on how to integrate Kotlin serialization with your favourite application framework:

- https://github.com/jobrunr/example-quarkus-kotlin/ for Quarkus + JobRunr + Kotlin + Kotlin Serialization
- https://github.com/jobrunr/example-spring-kotlin/ for Spring Boot 3 + JobRunr + Kotlin + Kotlin Serialization

Be sure to thoroughly inspect the `build.gradle` files to find out how the dependencies interact with each other. 

### Dashboard Notification Centre

In previous versions of JobRunr, notifications appeared on the Dashboard main page, for instance in case of detected CPU allocation irregularities, or in case of severe exceptions that demand immediate attention. Each notification, whether they were informative, warnings, or critical errors, resulted in another UI block that ended up cluttering the Dashboard.

No longer! In JobRunr v8, we have grouped all these notifications into the Notification Centre that can be opened by clicking on the bell icon 🛎️ on the top right. Notifications can be marked as read or dismissed entirely. The number in the red circle indicates the amount of messages that have not yet been marked as read. 

The following recording demonstrates the usage of the Notification Centre:

![](/blog/jobrunr-notification-centre-anim.gif "Opening and interacting with the new Notification Centre by clicking on the bell on the top right in the JobRunr Dashboard.")

Some notifications, such as the severe exception one, contain details that can be opened up in a separate window to inspect configuration properties, stack traces, or possible hints towards a solution. That pop-up screen can be dismissed by simply clicking next to it.

### {{< label version="professional" >}}JobRunr Pro{{< /label >}} Database Performance Optimizations

In JobRunr v8, we’ve reviewed the data types, queries and indexes to improve performance and reduce the load on the database. In our tests we’ve seen at least 2x improvement across all databases when all JobRunr features (such as dynamic queues, rate limiters, batch jobs, etc.) are enabled. In practice, you can expect less load on your database as queries run faster and data takes less space.

### {{< label version="professional" >}}JobRunr Pro{{< /label >}} K8S Autoscaling

JobRunr Pro v8 provides different metrics (e.g., the worker’s usage, the amount of enqueued jobs, etc.), to customize Kubernetes autoscaling. 

See the [JobRunr K8S Autoscaling guide](/en/guides/advanced/k8s-autoscaling/) that demonstrates the power of these metrics when coupled to KEDA, an event-driven way to autoscale your Kubernetes cluster.

### {{< label version="enterprise" >}}JobRunr Pro{{< /label >}} Multi-Cluster Dashboard

The JobRunr Pro Multi-Cluster Dashboard is a separate web server that offers a unified view over multiple JobRunr Pro clusters. Monitoring multiple instances can get tiresome when running a lot of different clusters, all running their own jobs. With the Multi-Cluster Dashboard, you can monitor the health of all clusters in one place.

Suppose you have three different JobRunr background servers and dashboard servers up and running, each for different clients, and you want to quickly check via the dashboard if all jobs have succeeded. Instead of having to log in into each dashboard separately to follow up on the events of the day, you can now do so in another single dashboard instance that pulls all data from the others:

![](/blog/jobrunr-multicluster-dashboard-anim.gif "The Multi-Cluster Dashboard main page with the filter functionality shown on the top right.")

This UI Dashboard looks & works exactly the same as the one you are used to, but it aggregates all information from all the other clusters. If you have tens or hundreds of clusters up and running, this will get messy quickly. Therefore, a way to quickly filter on specific clusters is possible via the new cluster icon on the top right, as shown in the above animation. The filter settings are automatically applied in all tables. In that popup, you can also see which ones are temporarily down (e.g. a Kubernetes pod that is restarting). 

Configuration is easy with the auto-discoverability settings turned on: each cluster will announce itself to the Multi-Cluster Dashboard server through HTTP, and if the server does not receive timely pings, it will assume a cluster went down. Of course, you can still configure everything by hand, including directly pointing to data providers in case you do not have a dashboard server running on the clusters.

See the [Multi-Cluster Dashboard Documentation](/en/documentation/pro/jobrunr-pro-multi-dashboard/) for more information on its architectural approach and how to configuration it. 

### And more!

Other minor features are described in the [JobRunr v8 migration guide](/en/guides/migration/v8/) or in the release notes below. 

---

## JobRunr v8 Release Notes

This section summarizes minor enhancements and breaking changes. For a more detailed and technical overview, please check out the **full release notes** over at our [GitHub Releases Page](https://github.com/jobrunr/jobrunr/releases).


### Enhancements

- `@AsyncJob` to reduce boilerplate. 
- Improved `@Recurring` synchronisation
- Label ordering
- Durable executions with `JobContext#runStepOnce`

### What's Changed

* Ensure that methods added in SLF4J v2 are not used in JobRunr core
* Add notification center
* CarbonAware Job Processing - fix layout labeling
* Usability: rework the Carbon Aware API + add the icon in the dashboard overview
* refactor the ossrh staging api sed json extration into a proper Gralde task
* add carbon intensity api response code + message in the notification centre
* Chore/carbon intensity region endpoint update
* Fix possible NPE when processing carbon aware jobs
* Drop support for Spring Boot 2
* Align frontend components with JobRunr Pro

### Breaking Changes

See [v8 Migraiton Guide: Breaking Changes](/en/guides/migration/v8/#breaking-changes) for more details on how to deal with these changes. 

- End of support for Redis and Elasticsearch
- End of support for Spring Boot 2 in JobRunr OSS (_Note_: Spring Boot 2 will still be supported in JobRunr Pro)
- The `RecurringJobBuilder#withDuration()` method has been renamed to `RecurringJobBuilder#withInterval()`

Thanks to all our contributors and thanks to you, the user, for trying out the new version. Be sure to drop some feedback via [GitHub Discussions](https://github.com/jobrunr/jobrunr/discussions); that way we can make JobRunr an even better experience.
