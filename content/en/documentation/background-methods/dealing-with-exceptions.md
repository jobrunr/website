---
title: "Dealing with exceptions"
subtitle: "Bad things happen - but JobRunr has everything covered thanks to the RetryFilter!"
keywords: ["exceptions", "programming errors", "exception handling in java", "exception handling example in java", "exception java example", "exception in java example", "dealing with exceptions"]
date: 2020-04-30T11:12:23+02:00
layout: "documentation"
menu: 
  main: 
    identifier: dealing-with-exceptions
    parent: 'background-methods'
    weight: 60
---
Bad things happen. Any method can throw different types of exceptions. These exceptions can be caused either by programming errors that require you to re-deploy the application, or transient errors, that can be fixed without additional deployment.

JobRunr handles all exceptions that occur both in internal (belonging to JobRunr itself), and external methods (jobs, filters and so on), so it will not bring down the whole application. All internal exceptions are logged (so, don’t forget to enable logging) and in the worst case, background processing of a job will be stopped after 10 retry attempts with a smart exponential back-off policy.

On this page you will learn how to:
- [how you can monitor your failed jobs](#how-to-monitor-your-failed-jobs)
- [how JobRunr handles exceptions](#how-does-jobrunr-handle-exceptions)
- [how to configure the amount of retries?](#how-to-configure-the-amount-of-retries)


## How to monitor your failed jobs
When JobRunr encounters external exception that occured during the execution of the job, it will automatically change the state of the `Job` to `FAILED`, and you always can find this job in the Dashbord UI under the `FAILED` jobs sections (it will not expire unless you delete it explicitly).

![](/documentation/failed-job.webp "Detailed information why a job failed")

## How does JobRunr handle exceptions?
In the previous paragraph it is mentioned that JobRunr will change the state of the `Job` to `FAILED` but thanks to `JobFilters` that are triggered by state transitions, we can intercept these state changes and update the job. The `RetryFilter` is one of them and it reschedules the failed job to be automatically retried after increasing delay.

This filter is applied globally to all methods and has **10 retry attempts** by default. So, your methods will be retried in case of exception automatically, and you receive warning log messages in the dashboard on every failed attempt. If retry attempts exceeded their maximum, the job will stay in the `FAILED` state (with an error log message), and you will be able to retry it manually.

## How to configure the amount of retries?
You can of course configure how many retries JobRunr will do by default.

- [Default retry policy configuration](#default-retry-policy-configuration)
- [Per Job](#per-job)
- {{< label version="professional" >}}JobRunr Pro{{< /label >}} [Custom retry policy for all your jobs](#a-custom-retrypolicy-for-all-your-jobs)
- {{< label version="professional" >}}JobRunr Pro{{< /label >}} [Custom retry policy per job](#a-custom-retrypolicy-defined-per-job)
- {{< label version="professional" >}}JobRunr Pro{{< /label >}} [Custom retry policy per exception](#a-custom-retrypolicy-defined-per-job)
- {{< label version="professional" >}}JobRunr Pro{{< /label >}} [Do Not Retry policy](#a-donotretrypolicy-in-case-nothing-helps)

#### Default retry policy configuration
<figure>

```java
JobRunr.configure()
    .withJobFilters(new RetryFilter(2))
    .useBackgroundJobServer(new BackgroundJobServer(...))
    ....
```
<figcaption>Jobs will only be retried 2 times instead of 10 times as the default RetryFilter is overriden.</figcaption>
</figure>

This is also configurable by means of a property setting (`default-number-of-retries` and `retry-back-off-time-seed`) if you are using the [Spring]({{< ref "../configuration/spring/_index.md#advanced-configuration" >}}), [Micronaut]({{< ref "../configuration/micronaut/_index.md#advanced-configuration" >}}) or [Quarkus]({{< ref "../configuration/quarkus/_index.md#advanced-configuration" >}}) integration.


#### Per job
You can configure the amount of retries per job by means of the `@Job` annotation.
<figure>

```java
    @Job(name="Job Name", retries=2)
    public void doWorkWithCustomJobFilters() {
        System.out.println("I will only be retried two times ");
    }
```
<figcaption>The number of retries can also be configured per job by using the @Job annotation on each service method.</figcaption>
</figure>

<figure>

```java
    @Job(name="Job Name", retries=2)
    public void run(MyJobRequest myJobRequest) {
        System.out.println("I will only be retried two times ");
    }
```
<figcaption>Of course, this is also possible on the run method of a JobRequestHandler.</figcaption>
</figure>

### Custom `RetryPolicy` configuration
{{< label version="professional" >}}JobRunr Pro{{< /label >}}

Sometimes you may need a custom retry policy as it does not make sense to have exponential back-off policy. Or, you need a different retry policy per job or per Exception. Using the custom `RetryPolicy`, you can configure different rules based on the job and the exceptions you encounter. The first rule that matches, will be used.

Using the `PerJobRetryPolicy`, you now can handle the most exotic business rules where you can define custom rules based on the `Exception` you are encountering, the `JobDetails`, Job labels, ... .


#### A custom `RetryPolicy` for all your jobs
{{< label version="professional" >}}JobRunr Pro{{< /label >}}

If you want to have the same `RetryPolicy` for all jobs and you are using the `jobrunr-spring-boot-x-starter`, the `jobrunr-micronaut-feature` or the `jobrunr-quarkus-extension`, you can easily configure this in via your application's properties.

Here is the Spring Boot example:

```properties
org.jobrunr.jobs.custom-backoff-retry-policy=5,5,60,120
```

In the example above, all your jobs will be retried at most 4 times and the retries will happen after 5 seconds, 5 seconds, 60 seconds and then 120 seconds ...


#### A custom `RetryPolicy` defined per job
{{< label version="professional" >}}JobRunr Pro{{< /label >}}

If one of your jobs need to connect to an external service that is often down for a longer period, it may make sense to have a custom `RetryPolicy` only for that job. 
With JobRunr Pro, this is now also possible:

```java
    @Bean
    public RetryPolicy myCustomRetryPolicy() {
        return new PerJobRetryPolicy(
            new ExponentialBackoffRetryPolicy(), // default policy if no per job policy matches
            new CustomRetryPolicy(3, 4).ifJob(job -> job.getLabels().contains("tenant-A")),
            new CustomRetryPolicy(9, 10).ifJob(job -> job.getLabels().contains("tenant-B"))
        );
    }
```

If you're using a framework integration (e.g. `jobrunr-spring-boot-x-starter`, the `jobrunr-micronaut-feature` or the `jobrunr-quarkus-extension`), you just need to define a Bean of type `RetryPolicy` which will be automatically picked up by JobRunr Pro.

<br>

#### A custom `RetryPolicy` defined per exception
{{< label version="professional" >}}JobRunr Pro{{< /label >}}

If you want to change the `RetryPolicy` based on the exception, this can also easily be done:

```java
    @Bean
    public RetryPolicy myCustomRetryPolicy() {
        return new PerJobRetryPolicy(
            new ExponentialBackoffRetryPolicy(), // default policy if no per job policy matches
            new CustomRetryPolicy(60, 60, 60, 180).ifException(e -> e instanceof TimeoutException),
            new CustomRetryPolicy(3600).ifException(e -> e instanceof DatabaseException)
        );
    }
```

If you're using a framework integration (e.g. `jobrunr-spring-boot-x-starter`, the `jobrunr-micronaut-feature` or the `jobrunr-quarkus-extension`), you just need to define a Bean of type `RetryPolicy` which will be automatically picked up by JobRunr Pro.

<br>

#### A `DoNotRetryPolicy` in case nothing helps
{{< label version="professional" >}}JobRunr Pro{{< /label >}}

If you do not want to retry failing jobs, this is also easily configurable:

```java
    @Bean
    public RetryPolicy myCustomRetryPolicy() {
        return new PerJobRetryPolicy(
            new ExponentialBackoffRetryPolicy(), // default policy if no per job policy matches
            new DoNotRetryPolicy().ifException(e -> e instanceof MyIllegalStateException),
            new DoNotRetryPolicy().ifJob(job -> job.getName().contains("Cache update"))
        );
    }
```

If you're using a framework integration (e.g. `jobrunr-spring-boot-x-starter`, the `jobrunr-micronaut-feature` or the `jobrunr-quarkus-extension`), you just need to define a Bean of type `RetryPolicy` which will be automatically picked up by JobRunr Pro.

<br>
{{< trial-button >}}