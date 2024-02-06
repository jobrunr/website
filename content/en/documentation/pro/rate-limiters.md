---
version: "pro"
title: "Rate Limiters"
subtitle: "Control the number of executions of your jobs by using JobRunr's builtin concurrent or window rate limiters."
date: 2024-02-05T14:19:23+02:00
layout: "documentation"
menu: 
  main: 
    identifier: rate-limiters
    parent: 'jobrunr-pro'
    weight: 25
---
{{< trial-button >}}

A `rate limiter` allows to control the execution rate of `Jobs` to avoid overwhelming some resources. JobRunr provides [`mutexes`]({{< ref "/documentation/pro/mutexes" >}}) as a mean to only allow a single execution from a set of `Jobs` at a time. Rate limiters gives more flexibility, the rate can be `> 1` using `ConcurrentJobRateLimiter` or the limit may be set over a time window using `SlidingTimeWindowRateLimiter`. These two approaches are described below, first we detail how to configure each, then how to use the configured rate limiter.

## Concurrent Rate Limiters

In addition to [`mutexes`]({{< ref "/documentation/pro/mutexes" >}}), that only allow a single `Job` execution at a time but do not require any configuration, JobRunr has the builtin feature of limiting the rate of concurrent execution of a set of `Jobs` to a number greater or equal than 1. This is achieved using `ConcurrentJobRateLimiter`.

### Configuration of Concurrent Rate Limiters
Below are different ways to configure a `ConcurrentJobRateLimiter` (just choose your preferred configuration approach!):
```
org.jobrunr.jobs.rate-limiter.concurrent-job-rate-limiter.my-rate-limiter=3
```

This configuration example tells JobRunr to use `ConcurrentJobRateLimiter` to rate limit `Jobs` whose `rateLimiter` attribute has value `my-rate-limiter` to only 3 concurrent executions. Note that `my-rate-limiter` can be any string of your choice (limited to 128 characters), you may view it as a resource identifier.

## Sliding Window Rate Limiters

A time window rate limiter works by limiting the amount of execution within a given time frame. JobRunr provides `SlidingTimeWindowRateLimiter` that implements the sliding window algorithm designed to reduce bursts.

> When your `pollIntervalInSeconds` is smaller than the window duration, `SlidingTimeWindowRateLimiter` works on a best-effort basis and doesn't guaranty the respect of the limit.

### Configuration

Below are different ways to configure a `SlidingTimeWindowRateLimiter` (just choose your preferred configuration approach!):

```
org.jobrunr.jobs.rate-limiter.sliding-time-window-rate-limiter.my-rate-limiter=2/PT5S
```

This configuration example tells JobRunr to use `SlidingTimeWindowRateLimiter` to rate limit `Jobs` whose `rateLimiter` attribute has value `my-rate-limiter` to only 2 executions every 5 seconds. This is inferred by the value of the property `2/PT5S` which follows the syntax `amount/ISO Duration`. Note that `my-rate-limiter` can be any string of your choice (limited to 128 characters), you may view it as a resource identifier.

## Usage of Rate Limiters

Once configured, `RateLimiters` share the same usage API. As usual, you may use either `@Job` or `JobBuilder` to set the value of `Job`'s attribute.

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