---
version: "pro"
title: "Rate Limiters"
subtitle: "Control the number of executions of your jobs by using JobRunr's builtin concurrent or window rate limiters."
date: 2024-02-05T14:19:23+02:00
layout: "documentation"
menu: 
  sidebar:
    identifier: rate-limiters
    parent: 'jobrunr-pro'
    weight: 24
---
{{< trial-button >}}

A `rate limiter` allows to control the execution rate of `Jobs` to avoid overwhelming some resources like external APIs or databases. JobRunr provides [`mutexes`]({{< ref "/documentation/pro/mutexes" >}}) as a mean to only allow a single execution from a set of `Jobs` at a time. Rate limiters gives more flexibility, the amount of concurrent jobs can be configured using the `ConcurrentJobRateLimiter` or the limit may be set over a time window using `SlidingTimeWindowRateLimiter`. 

You can configure different rate limiters to be used within your system and rate limiters can be shared by different job types, however each job can only use one `rate limiter`.

> [!IMPORTANT]
> When using a rate limiter there may be a latency of `pollIntervalInSeconds` before a rate-limited `Job` can start processing due an extra state change from `AWAITING` to `ENQUEUED`.<br>
> Please also note that you cannot use both a rate limiter and a [`mutex`]({{< ref "/documentation/pro/mutexes" >}}) on the same `Job`.

> [!IMPORTANT]
> **Recurring job**: Unless the rate-limiter is shared with other jobs, we don't recommend using a rate-limiter to limit the concurrency of a recurring job. By default, a recurring job cannot have multiple jobs running in parallel, therefore a rate-limiter is not needed. You can use the `RecurringJob` `maxConcurrentJobs` attribute to increase the allowed concurrency.

On this page you will learn how to:
- [configure a concurrent rate limiter](#concurrent-rate-limiters) 
- [configure a sliding time window rate limiter](#sliding-time-window-rate-limiters) 
- [how to use a rate limiter when creating a job](#how-to-use-a-configured-rate-limiter) 

## Concurrent Rate Limiters
Concurrent rate limiters can be used to control the rate at which certain jobs will be performed concurrently. They help in managing resource utilization, preventing overloads, and ensuring fair access to resources among multiple different job types.

### Configuration of Concurrent Rate Limiters
Below are different ways to configure a `ConcurrentJobRateLimiter`:

#### Using the Fluent API
```java
import static org.jobrunr.server.tasks.zookeeper.ratelimiters.ConcurrentJobRateLimiterConfiguration.concurrentJobRateLimiter;

JobRunrPro
    .configure()
    ...
    .useRateLimiter(concurrentJobRateLimiter("my-rate-limiter", 3))
    ...
```
<br>

#### Using Spring Boot / Quarkus / Micronaut
```properties
jobrunr.jobs.rate-limiter.concurrent-job-rate-limiter.my-rate-limiter=3
```

This configuration example tells JobRunr to use `ConcurrentJobRateLimiter` to rate limit `Jobs` whose `rateLimiter` attribute has value `my-rate-limiter` to only 3 concurrent executions. Note that `my-rate-limiter` can be any string of your choice (limited to 128 characters), you may view it as a resource identifier.

## Sliding Time Window Rate Limiters

A time window rate limiter works by limiting the amount of execution within a given time frame. JobRunr provides `SlidingTimeWindowRateLimiter` that implements the sliding window algorithm designed to reduce bursts.

> [!WARNING]
> When your `pollIntervalInSeconds` is greater than the window duration, `SlidingTimeWindowRateLimiter` works on a best-effort basis and doesn't guaranty the respect of the limit.

### Configuration

Below are different ways to configure a `SlidingTimeWindowRateLimiter`:

#### Using the Fluent API
```java
import static org.jobrunr.server.tasks.zookeeper.ratelimiters.SlidingTimeWindowRateLimiterConfiguration.slidingTimeWindowRateLimiter;

JobRunrPro
    .configure()
    ...
    .useRateLimiter(slidingTimeWindowRateLimiter("openai", 2, Duration.ofSeconds(5))
    ...
```
<br>

#### Using Spring Boot / Quarkus / Micronaut
```properties
jobrunr.jobs.rate-limiter.sliding-time-window-rate-limiter.my-rate-limiter=2/PT5S
```

This configuration example tells JobRunr to use `SlidingTimeWindowRateLimiter` to rate limit `Jobs` whose `rateLimiter` attribute has value `my-rate-limiter` to only 2 executions every 5 seconds. This is inferred by the value of the property `2/PT5S` which follows the syntax `amount/ISO Duration`. Note that `my-rate-limiter` can be any string of your choice (limited to 128 characters), you may view it as a resource identifier.


## How to use a configured rate limiter
Once configured, `RateLimiters` share the same usage API. As usual, you may use either `@Job` or `JobBuilder` to set the value of `Job`'s attribute.

> [!NOTE]
> In the following snippet, `MY_RATE_LIMITER` is a constant of the name of the rate limiter (from this documentation that is `MY_RATE_LIMITER = "my-rate-limiter"`, i.e., the rate limiter name provided in the configuration).

#### Using `@Job`

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

{{< trial-button >}}
