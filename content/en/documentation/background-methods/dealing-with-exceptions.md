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

When JobRunr encounters external exception that occured during the execution of the job, it will automatically try to change the state of the `Job` to `Failed`, and you always can find this job in the Dashbord UI (it will not expire unless you delete it explicitly).


<figure>
<img src="/documentation/failed-job.webp" class="kg-image">
<figcaption>Detailed information why a job failed</figcaption>
</figure>

In the previous paragraph it is mentioned that JobRunr will __try__ to change the state of the `Job` to failed, because state transition is one of places where job filters can intercept and change the state transition. The `RetryFilter` class is one of them, that reschedules the failed job to be automatically retried after increasing delay.

This filter is applied globally to all methods and has 10 retry attempts by default. So, your methods will be retried in case of exception automatically, and you receive warning log messages on every failed attempt. If retry attempts exceeded their maximum, the job will stay in the Failed state (with an error log message), and you will be able to retry it manually.

## Configuration
You can of course configure how many retries JobRunr will do by default.

- [Default retry policy configuration](#default-retry-policy-configuration)
- [Per Job](#per-job)
- {{< label version="professional" >}}JobRunr Pro{{< /label >}} [Custom retry policy for all your jobs](#a-custom-retrypolicy-for-all-your-jobs)
- {{< label version="professional" >}}JobRunr Pro{{< /label >}} [Custom retry policy per job](#a-custom-retrypolicy-defined-per-job)

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
<figcaption>This is off course also possible on the run method of a JobRequestHandler.</figcaption>
</figure>

## Custom `RetryPolicy` configuration
{{< label version="professional" >}}JobRunr Pro{{< /label >}}

Sometimes you may need a custom retry policy as it does not make sense to have exponential back-off policy. Or, you need a different retry policy per job.

#### A custom `RetryPolicy` for all your jobs
If you want to have the same `RetryPolicy` for all jobs and you are using the `jobrunr-spring-boot-x-starter`, the `jobrunr-micronaut-feature` or the `jobrunr-quarkus-extension`, you can easily configure this in via your application's properties.

Here is the Spring Boot example:

```properties
org.jobrunr.jobs.custom-backoff-retry-policy=5,5,60,120
```

In the example above, all your jobs will be retried at most 4 times and the retries will happen after 5 seconds, 5 seconds, 60 seconds and then 120 seconds ...


#### A custom `RetryPolicy` defined per job
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

Using the `PerJobRetryPolicy`, you now can handle the most exotic business rules where you can define custom rules based on the `JobDetails`, Job labels, ... .

<br>
{{< trial-button >}}