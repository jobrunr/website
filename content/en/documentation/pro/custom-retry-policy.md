---
version: "professional"
title: "Custom Retry Policy"
subtitle: "Setup custom retries per job depending on your business needs"
date: 2020-08-27T11:12:23+02:00
layout: "documentation"
menu: 
  main: 
    identifier: custom-retry-policy
    parent: 'jobrunr-pro'
    weight: 27
---
{{< trial-button >}}

By default, JobRunr will retry any failed jobs automatically up to 10 times with a smart, exponential back-off policy.

However, sometimes you may need a custom retry policy as it does not make sense to have exponential back-off policy. Or, you need a different retry policy per job.

## A custom `RetryPolicy` for all your jobs
If you want to have the same `RetryPolicy` for all jobs and you are using the `jobrunr-spring-boot-x-starter`, the `jobrunr-micronaut-feature` or the `jobrunr-quarkus-extension`, you can easily configure this in via your application's properties.

Here is the Spring Boot example:

```properties
org.jobrunr.jobs.custom-backoff-retry-policy=5,5,60,120
```

In the example above, all your jobs will be retried at most 4 times and the retries will happen after 5 seconds, 5 seconds, 60 seconds and then 120 seconds ...


## A custom `RetryPolicy` defined per job
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