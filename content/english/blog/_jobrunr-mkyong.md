---
title: "JobRunr on Mkyong.com"
translationKey: "2020-10-22-jobrunr-mkyong"
description: "A guide on how to run background jobs in Spring with JobRunr"
image: /blog/2020-04-08-get-shit-done.webp
aspect_ratio: 1;
date: 2020-10-22T11:12:23+02:00
author: "Ronald Dehuysser"
draft: true
tags:
  - blog
  - release
---
## Overview

This article shows how to use [JobRunr](https://github.com/jobrunr/jobrunr) in combination with Spring to do distributed background job processing in Java.  

P.s.: tested with JobRunr v1.1.0


## Setup

### Maven Dependency

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
    <version>2.3.4.RELEASE</version>
</dependency>
<dependency>
    <groupId>org.jobrunr</groupId>
    <artifactId>jobrunr-spring-boot-starter</artifactId>
    <version>1.1.0</version>
</dependency>
```

### JobRunr Setup
As we're using the `jobrunr-spring-boot-starter` dependency, setup is easy. We only need to add some properties to the `application.properties`:

```properties
org.jobrunr.background-job-server.enabled=true
org.jobrunr.dashboard.enabled=true
```

The first property tells JobRunr that we want to start an instance of a `BackgroundJobServer` which is responsible to process jobs. The second property tells JobRunr to start the embedded dashboard. More documentation is available on [jobrunr.io](https://www.jobrunr.io/en/documentation/configuration/spring/)


By default, the jobrunr-spring-boot-starter will try to use your existing DataSource in case of a relational database to store all the job-related information. However, since we will use an in-memory data store, we need to provide a StorageProvider bean (the `JobMapper` bean will be provided by the `jobrunr-spring-boot-starter`):
```java
@Bean
public StorageProvider storageProvider(JobMapper jobMapper) {
    InMemoryStorageProvider storageProvider = new InMemoryStorageProvider();
    storageProvider.setJobMapper(jobMapper);
    return storageProvider;
}
```

## Usage
### Inject dependencies
To create jobs, we'll need to inject the `jobScheduler` and your existing service from which we want to create a job:
```java
@Inject
private JobScheduler jobScheduler;

@Inject
private SampleJobService sampleJobService;
```

### Creating fire-and-forget jobs
Now that we have our dependencies injected, we can create fire-and-forget jobs using the `enqueue` method:

```java
jobScheduler.enqueue(() -> sampleJobService.executeSampleJob());
```

Jobs can of course have parameters, just like any other lambda.

```java
jobScheduler.enqueue(() -> sampleJobService.executeSampleJob("some string"));
```


### Scheduling jobs in the future
We can also schedule jobs in the future using the `schedule` method:

```java
jobScheduler.schedule(() -> sampleJobService.executeSampleJob(), LocalDateTime.now().plusHours(5));
```

### Scheduling jobs recurrently
If we want to have recurrent jobs, we need to use the `scheduleRecurrently` method:

```java
jobScheduler.scheduleRecurrently(() -> sampleJobService.executeSampleJob(), Cron.hourly());
```

## Dashboard
JobRunr comes with a built-in dashboard which allows us to monitor our jobs. If you visit [http://localhost:8000](http://localhost:8000), you will have the possibility to inspect all the jobs, including the recurrent jobs.

<figure>
<img src="https://www.jobrunr.io/blog/2020-04-20-jobrunr-overview.png">
</figure>

Bad things can happen, for example, an SSL certificate expired, or a disk is full. JobRunr, by default, will reschedule the background job with an exponential back-off policy. If the background job continues to fail ten times, only then will it go to the Failed state. You can then decide to re-queue the failed job when the root cause has been solved.

All of this is visible in the dashboard, including each retry with the exact error message and the complete stack trace of why a job failed:
<figure>
<img src="https://www.jobrunr.io/blog/jobrunr-mkyong-1024x498-1.png">
</figure>

