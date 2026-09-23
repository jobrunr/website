---
version: "pro"
title: "Rate Limiters"
subtitle: "Control the number of executions of your jobs by using JobRunr's builtin concurrent or window rate limiters."
date: 2024-02-05T14:19:23+02:00
lastmod: 2026-09-23
layout: "documentation"
menu: 
  sidebar:
    identifier: rate-limiters
    parent: 'jobrunr-pro'
    weight: 24
---
{{< trial-button >}}

A `rate limiter` allows to control the execution rate of `Jobs` to avoid overwhelming some resources like external APIs or databases. JobRunr provides [`mutexes`]({{< ref "/documentation/pro/mutexes" >}}) as a mean to only allow a single execution from a set of `Jobs` at a time. Rate limiters gives more flexibility, the amount of concurrent jobs can be configured using the `ConcurrentJobRateLimiter` or the limit may be set over a time window using `SlidingTimeWindowRateLimiter`. 

{{< demo-callout step="15" label="Go Easy on Your Partners" >}}

You can configure different rate limiters to be used within your system and rate limiters can be shared by different job types, however each job can only use one `rate limiter`.

> [!IMPORTANT]
> When using a rate limiter there may be a latency of `pollIntervalInSeconds` before a rate-limited `Job` can start processing due an extra state change from `AWAITING` to `ENQUEUED`.<br>
> Please also note that you cannot use both a rate limiter and a [`mutex`]({{< ref "/documentation/pro/mutexes" >}}) on the same `Job`.

> [!IMPORTANT]
> **Recurring job**: Unless the rate-limiter is shared with other jobs, we don't recommend using a rate-limiter to limit the concurrency of a recurring job. By default, a recurring job cannot have multiple jobs running in parallel, therefore a rate-limiter is not needed. You can use the `RecurringJob` `maxConcurrentJobs` attribute to increase the allowed concurrency.

On this page you will learn how to:
- [configure a concurrent rate limiter](#concurrent-rate-limiters) 
- [configure a sliding time window rate limiter](#sliding-time-window-rate-limiters) 
- [create or delete rate limiters at runtime](#managing-rate-limiters-at-runtime)
- [how to use a rate limiter when creating a job](#how-to-use-a-configured-rate-limiter) 
- [remove a rate limiter](#removing-a-rate-limiter)

## Concurrent Rate Limiters
Concurrent rate limiters can be used to control the rate at which certain jobs will be performed concurrently. They help in managing resource utilization, preventing overloads, and ensuring fair access to resources among multiple different job types.

### Configuration of Concurrent Rate Limiters
Configure a `ConcurrentJobRateLimiter` using the Fluent API or, when using Spring Boot / Quarkus / Micronaut, properties:

{{< codetabs category="config-style" >}}
{{< codetab label="Fluent API" >}}
```java
import static org.jobrunr.server.tasks.zookeeper.ratelimiters.ConcurrentJobRateLimiterConfiguration.concurrentJobRateLimiter;

JobRunrPro
    .configure()
    ...
    .useRateLimiter(concurrentJobRateLimiter("my-rate-limiter", 3))
    ...
```
{{< /codetab >}}

{{< codetab label="Properties" >}}
```properties
jobrunr.jobs.rate-limiter.concurrent-job-rate-limiter.my-rate-limiter=3
```
{{< /codetab >}}

{{< codetab label="YAML" >}}
```yaml
jobrunr:
  jobs:
    rate-limiter:
      concurrent-job-rate-limiter:
        my-rate-limiter: 3
```
{{< /codetab >}}
{{< /codetabs >}}

This configuration example tells JobRunr to use `ConcurrentJobRateLimiter` to rate limit `Jobs` whose `rateLimiter` attribute has value `my-rate-limiter` to only 3 concurrent executions. Note that `my-rate-limiter` can be any string of your choice (limited to 128 characters), you may view it as a resource identifier.

## Sliding Time Window Rate Limiters

A time window rate limiter works by limiting the amount of execution within a given time frame. JobRunr provides `SlidingTimeWindowRateLimiter` that implements the sliding window algorithm designed to reduce bursts.

> [!WARNING]
> When your `pollIntervalInSeconds` is greater than the window duration, `SlidingTimeWindowRateLimiter` works on a best-effort basis and doesn't guaranty the respect of the limit.

### Configuration

Configure a `SlidingTimeWindowRateLimiter` using the Fluent API or, when using Spring Boot / Quarkus / Micronaut, properties:

{{< codetabs category="config-style" >}}
{{< codetab label="Fluent API" >}}
```java
import static org.jobrunr.server.tasks.zookeeper.ratelimiters.SlidingTimeWindowRateLimiterConfiguration.slidingTimeWindowRateLimiter;

JobRunrPro
    .configure()
    ...
    .useRateLimiter(slidingTimeWindowRateLimiter("my-rate-limiter", 2, Duration.ofSeconds(5)))
    ...
```
{{< /codetab >}}

{{< codetab label="Properties" >}}
```properties
jobrunr.jobs.rate-limiter.sliding-time-window-rate-limiter.my-rate-limiter=2/PT5S
```
{{< /codetab >}}

{{< codetab label="YAML" >}}
```yaml
jobrunr:
  jobs:
    rate-limiter:
      sliding-time-window-rate-limiter:
        my-rate-limiter: 2/PT5S
```
{{< /codetab >}}
{{< /codetabs >}}

This configuration example tells JobRunr to use `SlidingTimeWindowRateLimiter` to rate limit `Jobs` whose `rateLimiter` attribute has value `my-rate-limiter` to only 2 executions every 5 seconds. This is inferred by the value of the property `2/PT5S` which follows the syntax `amount/ISO Duration`. Note that `my-rate-limiter` can be any string of your choice (limited to 128 characters), you may view it as a resource identifier.


## Managing rate limiters at runtime
The configurations above are static: rate limiters are defined at startup. You may also create and delete them dynamically using the `RateLimiterManager`.

JobRunr does not provide a framework managed bean for the `RateLimiterManager`, you need to create it yourself. It needs the `StorageProvider` and a duration for cache updates:

```java
RateLimiterManager rateLimiterManager = new RateLimiterManager(storageProvider, Duration.ofSeconds(15));
```

The `RateLimiterManager` exposes the following methods:
- `saveRateLimiters(RateLimiterConfiguration...)`: creates or updates the given rate limiters.
- `deleteRateLimiter(String name)`: deletes the rate limiter with the given name.
- `getRateLimiters()` and `getRateLimiterConfigurations()`: return the existing rate limiters.

```java
rateLimiterManager.saveRateLimiters(
    concurrentJobRateLimiter("tenant-" + tenantId, 3),
    slidingTimeWindowRateLimiter("openai-" + tenantId, 2, Duration.ofSeconds(5)));

rateLimiterManager.deleteRateLimiter("tenant-" + tenantId);
```

Rate limiters saved this way are not removed on startup when they are missing from your configuration (see [Removing a rate limiter](#removing-a-rate-limiter)). They remain until you delete them.

> [!NOTE]
> The `RateLimiterManager` also exposes `synchronizeRateLimiterConfigurations`, this is for internal use by JobRunr.

## How to use a configured rate limiter
Once configured, `RateLimiters` share the same usage API. As usual, you may use either `@Job` or `JobBuilder` to set the value of `Job`'s attribute.

> [!NOTE]
> In the following snippet, `MY_RATE_LIMITER` is a constant of the name of the rate limiter (from this documentation that is `MY_RATE_LIMITER = "my-rate-limiter"`, i.e., the rate limiter name provided in the configuration).

### Using `@Job`

```java
@Job(rateLimiter = MY_RATE_LIMITER)
public void doWorkWithRateLimiter() {
    // your business logic
}
```

### Using `JobBuilder`

```java
aJob()
    // ...
    .withRateLimiter(MY_RATE_LIMITER);
```

> [!IMPORTANT]
> The rate limiter must be configured before jobs can use it. The `JobScheduler` and `JobRequestScheduler` reject the creation of a job that references a rate limiter that is not configured.

## Removing a rate limiter
A rate limiter is removed either automatically, when it disappears from your configuration, or manually, via the `RateLimiterManager` or the dashboard.

> [!WARNING]
> Removing a rate limiter, whether via configuration, the dashboard or the `RateLimiterManager`, does not update the jobs that use it. Jobs referencing a rate limiter that no longer exists may stay in the `AWAITING` state until you either enqueue them manually (e.g., from the dashboard) or configure the rate limiter again.

### Automatic synchronization with your configuration
Rate limiter configurations are stored in the database. On startup, JobRunr synchronizes the stored rate limiters with the ones found in your configuration: rate limiters that were created by configuration but are no longer present in it are deleted from the database.

This applies to rate limiters configured via properties (Spring Boot / Quarkus / Micronaut). When using the Fluent API, mark the rate limiter with `asCreatedByConfiguration()` to get the same behavior:

```java
JobRunrPro
    .configure()
    ...
    .useRateLimiter(concurrentJobRateLimiter("my-rate-limiter", 3).asCreatedByConfiguration())
    ...
```

In other words, to remove such a rate limiter, remove it from your configuration and redeploy. Rate limiters that are not created by configuration are not removed automatically.

> [!CAUTION]
> Because of this synchronization, all JobRunr instances connected to the same database must share the same rate limiter configuration. Otherwise, an instance that starts without a rate limiter deletes it for all other instances, and jobs using it may end up stuck in `AWAITING`.

### Manual removal
Any rate limiter can be removed manually, regardless of how it was created:
- **`RateLimiterManager`**: call `deleteRateLimiter(name)` (see [Managing rate limiters at runtime](#managing-rate-limiters-at-runtime)).
- **Dashboard**: delete the rate limiter from the JobRunr Pro dashboard.

{{< trial-button >}}
