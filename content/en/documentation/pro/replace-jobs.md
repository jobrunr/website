---
version: "professional"
title: "Replacing jobs"
subtitle: "Is your job running with outdated information? Then just replace it..."
keywords: ["enqueue", "background job", "fire and forget", "enqueue jobs in bulk"]
date: 2020-09-16T11:12:23+02:00
layout: "documentation"
menu: 
  main: 
    identifier: replacing-jobs
    parent: 'jobrunr-pro'
    weight: 26
---
{{< trial-button >}}

Do you need to replace an already enqueued job? Or a job that is already being processed? Thanks to the JobRunr Pro `enqueueOrReplace` and `scheduleOrReplace` you can update the existing job easily.

<figure>

```java
UUID cityId = city.getId();
Observation observation = observationService.getLatestObservation(cityId); // the original observation
BackgroundJob.enqueue(myId, () -> weatherService.predictWeather(cityId, observation));

Observation observation = observationService.getLatestObservation(cityId); // the updated observation after a storm
BackgroundJob.enqueueOrReplace(myId, () -> weatherService.predictWeather(cityId, observation));
```
<figcaption>This replaces the existing background job as it uses the same uuid to create the job.</figcaption>
</figure>

> By default, JobRunr ignores jobs with an id that already exist in the JobRunr database. The reason for this is that JobRunr allows to create jobs from [JMS messages in a load-balanced environment]({{<ref "faq.md#im-listening-for-jobs-using-service-bus-messages-in-a-load-balanced-environment-and-i-want-to-schedule-jobs-only-once">}}). By ignoring a job that already exists, we're sure to run the job only once.

{{< trial-button >}}