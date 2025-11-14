---
version: "pro"
title: "Job time-outs"
subtitle: "Cancel your jobs automatically if they take too long to complete"
keywords: ["job timeout", "job time out", "job configuration", "configuration job", "configurator jobs", "long complete time jobs", "3th party libraries", "job execution stuck", "jobs fail automatically", "failed state automatically", "automatically retry job"]
date: 2020-08-27T11:12:23+02:00
layout: "documentation"
menu: 
  sidebar:
    identifier: job-timeout
    parent: 'jobrunr-pro'
    weight: 27
---
{{< trial-button >}}

Do you have jobs that take forever due to some 3th party libraries that are unreliable? Or are your job executions sometimes stuck due to networking issues? With JobRunr Pro, you can have your jobs fail automatically if they take too long. 


## Usage via `@Job` annotation
Using a job timeout is really easy, again thanks to the `Job` annotation. Just add the annotation to your service method and specify the job process timeout in [ISO8601 Duration format](https://en.wikipedia.org/wiki/ISO_8601#Durations):
<figure>

```java
@Job(processTimeOut = "PT5M")
public void jobCanBeInterruptedIfItTakesTooLong() {
    System.out.println("This job will be interrupted if it stays longer than 5 minutes in PROCESSING state");
}
```

## Usage via `JobBuilder` pattern
When you are using the `JobBuilder` pattern, you can pass the serverTag via the `JobBuilder`.
<figure>

```java
jobScheduler.create(aJob()
        .withProcessTimeOut(Duration.ofMinutes(5))
        .withDetails(() -> System.out.println("This will not run parallel as it is guarded by a mutex"));
```
</figure>

<br>

> <b>Important:</b> If your `Job` times out, it will go to the `FAILED` state automatically. Using the default `Job` configuration, it will automatically retry thanks to the exponential back-off policy. Depending on your business need, this may not be the desired and it can make sense to change the amount of retries to for example 0.

## Configuration
Job time-outs don't require any configuration.

{{< trial-button >}}