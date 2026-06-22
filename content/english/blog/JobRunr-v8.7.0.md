---
title: "JobRunr & JobRunr Pro v8.7.0"
description: "Lazy server initialization for any JVM framework, a system-aware dashboard theme, polymorphic collection deserialization with Jackson 3, and batch continuations from within a batch."
image: "/blog/thubm-jr-v-870.png"
date: 2026-06-19T12:00:00+02:00
author: "Nicholas D'hondt"
tags:
  - blog
  - release
  - fluent-api
  - jackson
  - dashboard
---

Say hi to **JobRunr v8.7.0** and **JobRunr Pro v8.7.0**! This release makes it much easier to plug JobRunr into any JVM framework, gives the dashboard a system-aware theme and a direct link to each release, and teaches the `Jackson3JsonMapper` to deserialize the most common Java collections out of the box. JobRunr Pro 8.7.0 adds batch continuations created from within a batch, plus a round of dashboard security hardening.

Let's dig in.

## Lazy Server Initialization: Integrate JobRunr Into Any JVM Framework

JobRunr ships first-class starters for [Spring](/en/documentation/configuration/spring/), [Quarkus](/en/documentation/configuration/quarkus/), and [Micronaut](/en/documentation/configuration/micronaut/). But plenty of teams run on something else, and until now wiring JobRunr into a custom framework meant fighting the Fluent API, which started the Background Job Server and Dashboard the moment you called `useBackgroundJobServer()` or `useDashboard()`. That eager startup happened before the rest of your container was ready, and you had no handle on the resulting servers to manage their lifecycle.

v8.7.0 makes server startup **lazy**. The Background Job Server and Dashboard Web Server are now created and started when you call `initialize()`, and `JobRunrConfigurationResult` exposes two new accessors, `getBackgroundJobServer()` and `getDashboardWebServer()`, so you can hand the servers to your container and control exactly when they start and stop. [PR #1566](https://github.com/jobrunr/jobrunr/pull/1566)

The new overloads of `useBackgroundJobServer(...)` and `useDashboard(...)` take a boolean that decides whether the server starts immediately on `initialize()`, or stays dormant until you start it yourself:

{{< codeblock >}}
```java
JobRunrConfigurationResult configuration = JobRunr.configure()
        .useJobActivator(this::jobInstanceProvider)
        .useStorageProvider(storageProvider)
        // false: build the server but don't start it on initialize()
        .useBackgroundJobServer(usingStandardBackgroundJobServerConfiguration(), false)
        .useDashboard(usingStandardDashboardConfiguration(), false)
        .initialize();

BackgroundJobServer backgroundJobServer = configuration.getBackgroundJobServer();
JobRunrDashboardWebServer dashboardWebServer = configuration.getDashboardWebServer();
```
{{</ codeblock >}}

You then start and stop the servers in step with your framework's own lifecycle. Here is the pattern using CDI lifecycle events as an example:

{{< codeblock >}}
```java
void startup(@Observes StartupEvent event) {
    dashboardWebServer.start();
    backgroundJobServer.start();
}

void shutdown(@Observes ShutdownEvent event) {
    backgroundJobServer.stop();
    dashboardWebServer.stop();
}
```
{{</ codeblock >}}

As part of this change, the configuration ordering constraints are gone too. You no longer have to configure the `JsonMapper` before the `StorageProvider`, or the `JobActivator` and `JobFilter`s before the Background Job Server. Everything is now wired up at `initialize()`, so the builder calls can come in any order.

Our new guide walks through the complete integration pattern: [Integrating JobRunr in other JVM frameworks](/en/documentation/getting-started/other/#integrating-jobrunr-in-other-jvm-frameworks).

---

## Dashboard: System Theme and a Link to the Release

Two small but welcome dashboard improvements landed in [PR #1570](https://github.com/jobrunr/jobrunr/pull/1570):

* **Defaults to your system color scheme.** If your OS is set to dark mode, the dashboard now shows up in dark mode too, no manual toggle required.
* **A direct link to the GitHub release page.** When the dashboard notifies you that a newer JobRunr version is available, the notification now links straight to that version's release notes, so you can see what changed before you upgrade.

---

## Jackson 3: Polymorphic Collection Deserialization

When you enqueue a job with a `List`, `Set`, or `Map` parameter, the concrete type (say `ArrayList`) is often different from the declared type (`List`). For that to round-trip safely, the JSON mapper has to allow polymorphic deserialization of those concrete types, and the `Jackson3JsonMapper`'s strict type validator previously rejected most of them unless you registered custom overrides.

v8.7.0 teaches the `Jackson3JsonMapper` to handle the most common Java collection types out of the box, including `ArrayList`, `HashSet`, `HashMap`, `LinkedList`, `TreeSet`, `TreeMap`, the unmodifiable wrappers, and the immutable collections produced by `List.of(...)`, `Set.of(...)`, and `Map.of(...)`. [PR #1572](https://github.com/jobrunr/jobrunr/pull/1572)

So this just works now, no extra configuration needed:

{{< codeblock >}}
```java
BackgroundJob.enqueue(() ->
        reportService.generate(List.of("Q1", "Q2", "Q3")));
```
{{</ codeblock >}}

If you were previously working around this with a custom `BasicPolymorphicTypeValidator`, you can drop that boilerplate.

---

## Bug Fixes

* **False positive `JobNotFound` notification on Quarkus dev mode.** The dashboard would occasionally show a `JobNotFound` notification when running a Quarkus project in dev mode. The root cause was a `ClassLoader` mismatch: the HTTP server threads inherited the `AppClassLoader` from the dispatcher instead of the `QuarkusClassLoader`. Fixed. [PR #1560](https://github.com/jobrunr/jobrunr/pull/1560)

### Maintenance

* Removed the unused `canOnboardNewWork` method from `WorkDistributionStrategy`, following [this discussion](https://github.com/jobrunr/jobrunr/discussions/1552). [PR #1568](https://github.com/jobrunr/jobrunr/pull/1568)
* Added a `context7.json` so AI coding assistants get accurate, up-to-date JobRunr configuration context. [PR #1561](https://github.com/jobrunr/jobrunr/pull/1561)
* Build now resolves `mavenLocal` last to avoid picking up stale local artifacts. [PR #1567](https://github.com/jobrunr/jobrunr/pull/1567)
* Backend and frontend dependency updates for the v8.7 release. [PR #1575](https://github.com/jobrunr/jobrunr/pull/1575), [PR #1576](https://github.com/jobrunr/jobrunr/pull/1576)

---

## 💼 New in JobRunr Pro v8.7.0

### Batch Continuation From Within a Batch

You can now create a batch continuation job from inside the batch itself. This is handy when a batch needs to fan out work and only then decide what should run after every item has succeeded, without setting up the continuation up front. Grab the current job's id from the `JobContext` and use it as the anchor for `runAfterSuccessOf`:

{{< codeblock >}}
```java
@Job
public void enqueueNewBatchWorkWithBatchContinuationUsingJobBuilder() {
    var items = repository.getItems();
    BackgroundJob.enqueue(items.stream(), item -> processItem(item));

    BackgroundJob.create(aJob()
            .withJobLambda(() -> runAfterProcessingAllItems())
            .runAfterSuccessOf(ThreadLocalJobContext.getJobContext().getJobId()));
}
```
{{</ codeblock >}}

The continuation runs once the enclosing batch finishes successfully, JobRunr guards against the circular dependency you would otherwise create by anchoring a job on its own batch. This works across the SQL, MongoDB, and in-memory storage providers.

### Dashboard Security Hardening

Several improvements to the Pro dashboard's security posture:

* **License key kept server side.** Previously the license key was sent to the web client for a secondary validation, which risked leaking it. The key is now validated on the server, and only its payload is sent to the browser. Client-side validation still happens when you upload a new key from the dashboard. A nice side effect: it is now much simpler to deploy public demo applications without exposing your license.
* **Authorization enforced on SSE streams.** The dashboard's Server-Sent Events streams now respect the signed-in user's authorization rules, not just the regular REST API. If a user is not allowed to access background job servers or jobs, the SSE stream closes instead of pushing live updates, and individual jobs are redacted unless the user is allowed to see unredacted data. This is applied consistently across the core dashboard, the Multi-Cluster Dashboard, and the Micronaut, Quarkus, and Spring Boot 2/3/4 integrations.
* **Stricter API key validation for the Multi-Cluster Dashboard.** A dashboard web server can no longer register with the Multi-Cluster Dashboard unless it shares the same API key.

### Bug Fixes

* **Recurring job schedule changes now take effect immediately.** JobRunr Pro keeps recurring jobs that run more than once per minute in an internal cache. Changing such a job to a less frequent schedule (for example, from every 15 seconds to every 5 minutes) while the server was running left the old schedule running, because the cached entry was never evicted. The job is now removed from the cache when its schedule changes, so the new schedule takes effect right away. Thanks to Collibra for the report. [Fixes #896]
* **Browser reconnects on SSE timeout.** A regression caused the wrong listener to be removed, so the browser would not reconnect after a Server-Sent Events connection timed out. The dashboard now reconnects cleanly.
* All OSS bug fixes above.

### Enhancements

* All OSS enhancements above (lazy server initialization, system-aware dashboard theme, GitHub release link, and Jackson 3 collection deserialization).

---

### How to Upgrade

Bump your dependency version to `8.7.0`:

{{< codetabs category="dependency" >}}
{{< codetab label="Maven" >}}
```xml
<dependency>
    <groupId>org.jobrunr</groupId>
    <artifactId>jobrunr</artifactId>
    <version>8.7.0</version>
</dependency>
```
{{</ codetab >}}
{{< codetab label="Gradle" >}}
```groovy
implementation 'org.jobrunr:jobrunr:8.7.0'
```
{{</ codetab >}}
{{</ codetabs >}}

If you configure JobRunr through the Fluent API and rely on a server being up immediately after a builder call, note that servers now start on `initialize()`. For the standard `useBackgroundJobServer()` and `useDashboard()` calls this is transparent, your servers still start by default.

Stay tuned for more updates, and don't forget to share your feedback with us!

Full changelog available here:
👉 [GitHub Release Notes 8.7.0](https://github.com/jobrunr/jobrunr/releases/tag/v8.7.0)
