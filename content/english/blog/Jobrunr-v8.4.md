---
title: "JobRunr & JobRunr Pro v8.4"
description: "Enhanced Kotlin support with Bazel compatibility, auto-configured serialization, and Micronaut 4.10"
image: "/blog/jr-v-840.png"
date: 2026-01-14T12:00:00+02:00
author: "Nicholas D'hondt"
tags:
  - blog
  - release
  - kotlin
  - micronaut
---

Say hi to **JobRunr v8.4.0** and **JobRunr Pro v8.4.0**! This release introduces Kotlin class-based SAM conversions support (enabling Bazel usage without config changes), improved `Jackson3JsonMapper` configuration, full support for Micronaut 4.10.0, and fixes for cron expression parsing and job assertion exception handling.

## New Features

* **Kotlin Class-based SAM Conversions**: Kotlin lambdas compiled with Bazel's `rules_kotlin` now work seamlessly with JobRunr. [PR #1460](https://github.com/jobrunr/jobrunr/pull/1460)

* **Auto-configured Kotlin Serialization**: `KotlinxSerializationJsonMapper` is now automatically detected and configured when using the Fluent API. [PR #1461](https://github.com/jobrunr/jobrunr/pull/1461)

* **Configurable Polymorphic Type Validators**: `Jackson3JsonMapper` now allows configuration of custom polymorphic type validators for enhanced security. [PR #1458](https://github.com/jobrunr/jobrunr/pull/1458)

### Kotlin + Bazel: Now It Just Works

If you're a Kotlin developer using Bazel's `rules_kotlin`, you may have encountered a `NullPointerException` when enqueueing Kotlin lambdas. The issue was that Bazel compiles lambdas using class-based SAM conversions, which JobRunr didn't previously support.

All of these patterns now work regardless of your build tool:

```kotlin
jobScheduler.enqueue { myService.doSomething() }
jobScheduler.enqueue<MyService> { it.doSomething() }
jobScheduler.enqueue(myService::doSomething)
```

Thanks to [@johnnymo87](https://github.com/johnnymo87) for reporting this issue and helping us find the root cause!

### Zero-Config Kotlin Serialization

`KotlinxSerializationJsonMapper` is now auto-configured when using the Fluent API. If you have `kotlinx-serialization-json` on your classpath, JobRunr will automatically use it:

```kotlin
// This now automatically configures KotlinxSerializationJsonMapper instead of JacksonJsonMapper!
JobRunr.configure()
    .useStorageProvider(storageProvider)
    .initialize()
```

## Bug Fixes

* **Cron Expression Parsing**: Fixed parsing of month step values in `CronExpression`. [PR #1462](https://github.com/jobrunr/jobrunr/pull/1462)
* **Job Assertion**: Fixed `assertJobExists` to keep job parameter not deserializable exception. [PR #1459](https://github.com/jobrunr/jobrunr/pull/1459)

## Misc

* **Micronaut 4.10 Compatibility**: Updated Micronaut integration to 4.10.6. [PR #1468](https://github.com/jobrunr/jobrunr/pull/1468)
* **Updated Dependencies**: Frontend and backend dependencies updated. [PR #1467](https://github.com/jobrunr/jobrunr/pull/1467) and [PR #1468](https://github.com/jobrunr/jobrunr/pull/1468)

---

## 💼 New in JobRunr Pro v8.4.0

* **Flexible License Key Loading**: Next to the already existing options, we've added the option to load your license from a remote server or from a file (call also be a shared drive). This makes it eaven easier to manage your license and easily update a license across all your JobRunr Pro instances. [PR #772](https://github.com/jobrunr/jobrunr-pro/pull/772)

* **Configurable Graceful Shutdown**: Set a custom shutdown period when the StorageProvider becomes unhealthy. [PR #771](https://github.com/jobrunr/jobrunr-pro/pull/771)

* **PostgreSQL Performance on Mac**: Improved PostgreSQL performance for JobRunr on macOS. [PR #773](https://github.com/jobrunr/jobrunr-pro/pull/773)

* **Dashboard Enhancements**:
  * Added logout button to control center. [PR #759](https://github.com/jobrunr/jobrunr-pro/pull/759)
  * Allow filtering on exception type from all tabs. [PR #756](https://github.com/jobrunr/jobrunr-pro/pull/756)

  ![](/blog/jobrunr-pro-filter-on-exceptions.png "Filter your failed jobs on Exception Type")

* **Bug Fixes**:
  * Fixed concurrent updates to pause or resume dynamic queues. [PR #760](https://github.com/jobrunr/jobrunr-pro/pull/760)
  * Resume scheduling recurring jobs when dynamic queue is resumed. [PR #760](https://github.com/jobrunr/jobrunr-pro/pull/760)
  * Fixed datagrid progress bar and batch children table flicker. [PR #755](https://github.com/jobrunr/jobrunr-pro/pull/755)

---

### **How to Upgrade**

Simply update your dependency version to `8.4.0` in Maven or Gradle:

{{< codetabs category="dependency" >}}
{{< codetab label="Maven" >}}
```xml
<dependency>
    <groupId>org.jobrunr</groupId>
    <artifactId>jobrunr</artifactId>
    <version>8.4.0</version>
</dependency>
```
{{</ codetab >}}
{{< codetab label="Gradle" >}}
```groovy
implementation 'org.jobrunr:jobrunr:8.4.0'
```
{{</ codetab >}}
{{</ codetabs >}}

Stay tuned for more updates, and don't forget to share your feedback with us!

Full changelog available here:
👉 [GitHub Release Notes 8.4.0](https://github.com/jobrunr/jobrunr/releases/tag/v8.4.0)
