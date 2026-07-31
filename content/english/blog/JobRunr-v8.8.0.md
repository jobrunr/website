---
title: "JobRunr & JobRunr Pro v8.8.0"
description: "Quieter logs when your database hiccups, SmallRye now optional for Quarkus users, Kotlin 2.4 support, and a much faster dashboard on MySQL for Pro."
image: "/blog/thubm-jr-v-880.png"
date: 2026-07-31T12:00:00+02:00
author: "Nicholas D'hondt"
tags:
  - blog
  - release
  - quarkus
  - kotlin
  - dashboard
---

Say hi to **JobRunr v8.8.0** and **JobRunr Pro v8.8.0**! This release is all about operational peace of mind: your logs stay calm when your database has a bad moment, Quarkus users get to drop a dependency, and Kotlin 2.4 is now officially supported. JobRunr Pro 8.8.0 adds a serious dashboard performance boost for MySQL and other databases, plus a round of bugfixes.

Let's dig in.

## Quieter Logs When Your StorageProvider Acts Up

Every JobRunr deployment eventually meets a database that blinks: a failover, a saturated connection pool, a network blip between your app and your SQL instance. Up to now, a single transient hiccup produced this in your logs:

```
12:10:20 WARN org.jobrunr.server.JobSteward - JobRunr encountered a problematic exception.
Please create a bug report (if possible, provide the code to reproduce this and the stacktrace)
- Processing will continue.
org.jobrunr.storage.StorageException: org.postgresql.util.PSQLException:
ERROR: canceling statement due to statement timeout
	at org.jobrunr.storage.sql.common.DefaultSqlStorageProvider.getJobList(...)
	...
```

That message asked you to file a bug report for something that was neither a JobRunr bug nor, in most cases, worth waking anyone up for. And since every job handler logged it on every poll cycle, one flaky minute could trip your log-based alerting.

v8.8.0 replaces this with an escalation ladder that matches how serious the situation actually is [PR #1587](https://github.com/jobrunr/jobrunr/pull/1587):

* The **first** storage exception is logged at **DEBUG**. A one-off blip that immediately heals stays out of your logs entirely at default log levels.
* If exceptions **continue**, JobRunr logs at **INFO**.
* If they **keep coming**, the level raises to **WARN**.
* Only when the StorageProvider keeps failing does JobRunr log an **ERROR** and stop the background job server to protect your data.

Every successful poll cycle counts back down, so a database that recovers also resets the ladder. Here is a real capture from a v8.8.0 instance where the jobs table became unresponsive for about a minute (stack traces omitted for brevity):

```
12:03:38 INFO io.demo.OrderService - Exchange rates synced
12:04:13 INFO org.jobrunr.server.JobZooKeeper - JobRunr encountered continued exceptions
related to your StorageProvider. If exceptions continue, processing will pause until the
StorageProvider recovers
12:04:48 WARN org.jobrunr.server.JobZooKeeper - JobRunr encountered many exceptions
related to your StorageProvider. If exceptions continue, processing will pause until the
StorageProvider recovers.
12:05:03 INFO io.demo.OrderService - Exchange rates synced
```

The first failing poll at 12:03:55 only shows up if you enable DEBUG logging. The database came back just before 12:05, and processing resumed on its own with no restarts and no bug report template in sight.

And if your database stays down? JobRunr OSS shuts the background job server down cleanly after repeated failures. JobRunr Pro goes further with [database fault tolerance](/en/documentation/pro/database-fault-tolerance/): it pauses processing while the database is unreachable and picks the work back up automatically once it recovers.

---

## Quarkus: SmallRye No Longer Required

If you use the JobRunr Quarkus extension, `quarkus-smallrye-health` was until now pulled in as a required dependency, whether you exposed health endpoints or not. As of v8.8.0 it is optional [PR #1589](https://github.com/jobrunr/jobrunr/pull/1589):

* **Keep** the dependency if you want JobRunr to contribute to your application's health endpoint.
* **Drop** it if you don't, and enjoy a slightly leaner dependency tree.

```xml
<!-- Only needed if you want JobRunr in your health endpoint -->
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-smallrye-health</artifactId>
</dependency>
```

---

## Kotlin 2.4 Support

We've tested JobRunr against Kotlin 2.4 and can confirm official support [PR #1588](https://github.com/jobrunr/jobrunr/pull/1588). If you were waiting on this to upgrade your Kotlin toolchain, the wait is over.

---

## Bug Fixes

* **No more racing migrations on startup.** When multiple JobRunr instances started at the same time against the same fresh database, a time-of-check to time-of-use race in the `DatabaseCreator` could cause two instances to attempt the same migration. The list of migrations to run is now recomputed after acquiring the migrations lock, so concurrent deployments boot cleanly. [PR #1583](https://github.com/jobrunr/jobrunr/pull/1583)

### Maintenance

* Backend and frontend dependency updates for the v8.8 release. [PR #1588](https://github.com/jobrunr/jobrunr/pull/1588)

---

## 💼 New in JobRunr Pro v8.8.0

### A Much Faster Dashboard on MySQL and Friends

JobRunr Pro 8.8.0 reworks the database indexes behind the dashboard so that job overview pages load noticeably faster on MySQL and other SQL databases, especially with large amounts of jobs. Among other changes, the jobs table gains an index on `(state, updatedAt)`, which is exactly the access pattern behind the job listing pages.

In a quick test on a developer laptop (MySQL 8.4 in Docker, 400,000 succeeded jobs, identical data on both versions), the query behind the succeeded jobs page averaged **57 ms on 8.8.0** versus **640 ms on 8.7.1**. Your numbers will vary with your hardware and data, but the difference is hard to miss once your jobs table grows.

![](/blog/jr-880-pro-dashboard.png "The Pro dashboard browsing through a healthy pile of succeeded jobs.")

> ⚠️ **Note before you upgrade:** these improvements ship as new database migrations that drop and create indexes on the jobs table. On a large table that takes time and I/O. Plan the upgrade of a busy production cluster accordingly.

### Bug Fixes

* **Dashboard filters now apply correctly in queries once locked.** [PR #920, #922]
* **Providing a rate-limited job with a different limiter now throws** instead of silently misbehaving, so configuration mistakes surface immediately. [PR #924]
* **Batch child status is no longer disregarded in `JobRequestScheduler#enqueue(Stream<JobRequest>)`.** [PR #923]
* The `DatabaseCreator` race condition fix from OSS. [PR #919]

### Enhancements

* All OSS enhancements above (quieter StorageProvider logging, optional SmallRye for Quarkus, and Kotlin 2.4 support).

---

### How to Upgrade

Bump your dependency version to `8.8.0`:

{{< codetabs category="dependency" >}}
{{< codetab label="Maven" >}}
```xml
<dependency>
    <groupId>org.jobrunr</groupId>
    <artifactId>jobrunr</artifactId>
    <version>8.8.0</version>
</dependency>
```
{{</ codetab >}}
{{< codetab label="Gradle" >}}
```groovy
implementation 'org.jobrunr:jobrunr:8.8.0'
```
{{</ codetab >}}
{{</ codetabs >}}

JobRunr Pro users: remember that this release runs new index migrations on the jobs table at startup. For most clusters that is a non-event, but if your jobs table is huge, give the first boot a moment.

Stay tuned for more updates, and don't forget to share your feedback with us!

Full changelog available here:
👉 [GitHub Release Notes 8.8.0](https://github.com/jobrunr/jobrunr/releases/tag/v8.8.0)
