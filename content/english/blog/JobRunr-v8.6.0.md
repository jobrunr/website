---
title: "JobRunr & JobRunr Pro v8.6.0"
description: "JDK 26 compatibility, Quarkus 3.33 LTS support, faster recurring jobs and SQL validation, and a friendlier Fluent API."
image: "/blog/thubm-jr-v-860.png"
date: 2026-05-06T12:00:00+02:00
author: "Nicholas D'hondt"
tags:
  - blog
  - release
  - jdk26
  - quarkus
  - performance
---

Say hi to **JobRunr v8.6.0** and **JobRunr Pro v8.6.0**! This release brings full **JDK 26** compatibility, official support for **Quarkus 3.33 LTS**, sizeable performance wins on recurring jobs and SQL table validation, a clearer Fluent API with `withJobLambda`, and a stack of bug fixes across the board. JobRunr Pro 8.6.0 adds OpenID PKCE, smarter recurring job throttling after GC events, a new exception trimming filter, and more.

Let's dig in.

## JDK 26 Compatibility

Java 26 ships with the new `--illegal-final-field-mutation=deny` flag, which makes the JVM refuse any reflective mutation of `final` fields. Several spots in JobRunr historically relied on that pattern, so running on JDK 26 with strict settings would fail outright.

We dropped every final field mutation from the codebase. JobRunr now runs cleanly on JDK 26 with the strict flag enabled. [PR #1529](https://github.com/jobrunr/jobrunr/pull/1529)

> **Note**: the Multi-Cluster Dashboard web server in JobRunr Pro still uses one final field mutation internally, so it remains incompatible with `--illegal-final-field-mutation=deny`. We are tracking that for a follow-up release.

---

## Quarkus 3.33 LTS Support

Quarkus 3.33 is the newest LTS line, and JobRunr now officially supports it. If you are on the LTS train, you can upgrade Quarkus and JobRunr together without any compatibility surprises.

---

## Faster Recurring Jobs

If you run many recurring jobs, this one is for you. Looking up the latest scheduled instant of a recurring job previously used an `ORDER BY scheduledAt DESC LIMIT 1` query. On busy installs that grew expensive.

We replaced it with a single `MAX(scheduledAt)` aggregate. The result: recurring jobs now handle equivalent volumes to earlier 7.x and 8.x versions on the same hardware, without you changing a thing. [PR #1549](https://github.com/jobrunr/jobrunr/pull/1549)

---

## Much Faster SQL Table Validation on Large Schemas

A community user [reported](https://github.com/jobrunr/jobrunr/issues/1538) that startup on a database with 10+ schemas and roughly 8,000 tables per schema was taking **over 40 minutes** just to validate which JobRunr tables existed. The culprit: `DatabaseCreator.getAllTableNames` was pulling every table from every schema with a `getTables(catalog, null, "%", null)` call.

In v8.6.0 we narrow the query using the database's identifier casing rules, so it only scans tables whose names match `%jobrunr%`. On the same setup, validation drops from **40+ minutes to under 5 seconds**. [PR #1539](https://github.com/jobrunr/jobrunr/pull/1539)

If your DBA has ever raised an eyebrow at JobRunr's startup queries on Oracle or DB2, this should make their day.

---

## A Friendlier Fluent API: `withJobLambda`

The Fluent API has two ways to describe what a job does: a lambda for the classic `BackgroundJob.enqueue` style, or a `JobRequest` for the request/handler pattern. Both lived on the same builder, but the lambda variant was called `withDetails`, which was easy to confuse with `withJobRequest`.

So we renamed it. `withDetails` is now deprecated in favor of `withJobLambda`, which pairs much more clearly with `withJobRequest`:

{{< codeblock >}}
```java
// Before (still works, but deprecated)
BackgroundJob.create(aJob()
        .withName("Send welcome email")
        .withDetails(() -> emailService.sendWelcome(userId)));

// After
BackgroundJob.create(aJob()
        .withName("Send welcome email")
        .withJobLambda(() -> emailService.sendWelcome(userId)));
```
{{</ codeblock >}}

The same rename applies to `RecurringJobBuilder` and the `JobTestBuilder` / `RecurringJobTestBuilder` test helpers. Existing `withDetails` calls keep working through deprecation, so you can migrate at your own pace. [PR #1530](https://github.com/jobrunr/jobrunr/pull/1530), [PR #1545](https://github.com/jobrunr/jobrunr/pull/1545), [PR #1546](https://github.com/jobrunr/jobrunr/pull/1546)

---

## Whitespace-Preserving Job Logs

Multi-line log statements used to collapse into a single line in the dashboard's job log view, which made structured output (stack traces, formatted JSON, table-style messages) painful to read.

The dashboard now preserves whitespace and line breaks via `white-space: pre-wrap`, so your logs render exactly the way they were written. Thanks to [@RomanJobRunr](https://github.com/RomanJobRunr) for the first contribution! [PR #1533](https://github.com/jobrunr/jobrunr/pull/1533) (closes [#1524](https://github.com/jobrunr/jobrunr/issues/1524))

---

## Spring Boot: Start on `ApplicationReadyEvent`

The Spring Boot starter previously kicked off the Background Job Server and Dashboard during `SmartInitializingSingleton.afterSingletonsInstantiated()`. That fires before the rest of the application context (and any `@PostConstruct` work elsewhere) has fully signaled readiness.

In v8.6.0, both servers start on Spring Boot's `ApplicationReadyEvent`, which means JobRunr only begins polling for jobs after your application is fully up. This avoids subtle startup race conditions where a job started before its dependencies were ready. [PR #1540](https://github.com/jobrunr/jobrunr/pull/1540)

This applies to both the Spring Boot 3 and Spring Boot 4 starters.

---

## Bug Fixes

* **HikariDataSource graceful shutdown**. Fixed a race condition where running jobs were interrupted but did not get a chance to release the `HikariDataSource` before it closed. [PR #1528](https://github.com/jobrunr/jobrunr/pull/1528)
* **MongoDB write exception on server reannounce**. Fixed a write exception thrown when a Background Job Server announces itself again after going down. [PR #1541](https://github.com/jobrunr/jobrunr/pull/1541)
* **Jackson 3 / Kotlin Serialization collection deserialization**. Fixed deserialization of collection-typed job parameters when using `Jackson3JsonMapper` or `KotlinxSerializationJsonMapper`. [PR #1548](https://github.com/jobrunr/jobrunr/pull/1548)

### Maintenance
* SECURITY.md updated to reflect supported versions. [PR #1537](https://github.com/jobrunr/jobrunr/pull/1537)
* Dependency updates for the v8.6 release. [PR #1547](https://github.com/jobrunr/jobrunr/pull/1547)
* Fluent API logging now has dedicated test coverage. [PR #1535](https://github.com/jobrunr/jobrunr/pull/1535)
* JUnit version pinned via BOM. [PR #1551](https://github.com/jobrunr/jobrunr/pull/1551)
* JDK test correctness fix. [PR #1550](https://github.com/jobrunr/jobrunr/pull/1550)

A huge thank you to **[@keldkemp](https://github.com/keldkemp)** and **[@RomanJobRunr](https://github.com/RomanJobRunr)** for their contributions in this release.

---

## 💼 New in JobRunr Pro v8.6.0

### ⚠️ Breaking Change: Multi-Cluster Dashboard requires `clusterId`

If you run the Multi-Cluster Dashboard, every cluster must now register itself with an explicit `clusterId`. This removes a class of edge cases where two clusters could end up sharing identity in the dashboard. See the [migration guide](/en/documentation/pro/multi-cluster-dashboard/) before upgrading.

### New Features

* **External Job Timeouts in `PROCESSED` state**. Building on External Jobs from v8.5.0, you can now define a timeout for how long an external job is allowed to wait for its signal in the `PROCESSED` state. Past that, JobRunr will fail the job for you, no babysitting required.
* **Recurring job throttling after GC**. A new `maxConcurrentJobs` control prevents thundering herds when many recurring jobs come due simultaneously after a long Garbage Collector pause or a paused dynamic queue is resumed.
* **OpenID PKCE support**. The OpenID integration now supports the PKCE (Proof Key for Code Exchange) extension, which most modern identity providers either recommend or require for browser-based flows.
* **`LenientFixedSizeWorkerPoolDynamicQueuePolicy`**. A new dynamic queue policy that keeps the worker pool size fixed but is more forgiving when reassigning workers between queues. Great for clusters with bursty queue mixes.
* **`TrimExceptionFilter`**. A new built-in `JobFilter` that lets you intercept and transform exceptions before they are persisted with the job. Use it to redact secrets, trim noisy stack traces, or normalize error messages across services.

### Enhancements

* All OSS enhancements above (JDK 26, Quarkus 3.33 LTS, recurring job perf, SQL validation perf, Spring Boot `ApplicationReadyEvent`, `withJobLambda`, whitespace-preserving job logs).
* **Observability**: a new `is-last-retry` attribute on traces and a dedicated failed-jobs counter in Micrometer, so you can alert specifically on terminal failures rather than transient retries.
* **`getAwaitedJobId`** method added on continuations. The previous `getAwaitedJob` is now deprecated.
* **Deprecation cleanup**: alongside the OSS `withDetails` rename, the Pro builders also deprecate `withQueue`, `useQueues`, and `withDetails` in favor of clearer replacements.

### Bug Fixes

* **`JobFilter` injection in framework integrations**. Fixed a case where custom `JobFilter` beans were not being injected when running under Spring Boot, Quarkus, or Micronaut.
* **`PreviousJobState` timestamp correction**. Fixed an off-by-one in how the previous state's timestamp was being persisted on transitions.
* All OSS bug fixes above.

---

### How to Upgrade

Bump your dependency version to `8.6.0`:

{{< codetabs category="dependency" >}}
{{< codetab label="Maven" >}}
```xml
<dependency>
    <groupId>org.jobrunr</groupId>
    <artifactId>jobrunr</artifactId>
    <version>8.6.0</version>
</dependency>
```
{{</ codetab >}}
{{< codetab label="Gradle" >}}
```groovy
implementation 'org.jobrunr:jobrunr:8.6.0'
```
{{</ codetab >}}
{{</ codetabs >}}

If you are running the Multi-Cluster Dashboard, double-check that every cluster sets a `clusterId` before you roll out.

Stay tuned for more updates, and don't forget to share your feedback with us!

Full changelog available here:
👉 [GitHub Release Notes 8.6.0](https://github.com/jobrunr/jobrunr/releases/tag/v8.6.0)
