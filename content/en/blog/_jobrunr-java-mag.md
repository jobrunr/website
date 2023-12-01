---
title: "JobRunr on Java Magazine"
translationKey: "2020-10-22-jobrunr-java-mag"
summary: "A guide on how to run background jobs in Spring with JobRunr"
feature_image: /blog/2020-04-08-get-shit-done.webp
aspect_ratio: 1;
date: 2020-10-22T11:12:23+02:00
author: "Ronald Dehuysser"
draft: true
tags:
  - blog
  - release
---
## Overview

In this tutorial, we're going to look into distributed background job scheduling and processing in Java using JobRunr and have it integrate with Spring.

[JobRunr](https://github.com/jobrunr/jobrunr) is a library that we can embed in our application and which allows us to schedule background jobs using a Java 8 lambda. We can use any existing method of our Spring services to create a job without the need to implement an interface. A job can be a short or long-running process, and it will be automatically offloaded to a background thread so that the current web request is not blocked.

To do its job, JobRunr analyses the Java 8 lambda. It serializes it as JSON, and stores it into either a relational database or a NoSQL data store.

If we see that we're producing too many background jobs and our server can not cope with the load, we can easily scale horizontally by just adding extra instances of our application. JobRunr will share the load automatically and distribute all jobs over the different instances of our application.

It also contains an automatic retry feature with an exponential back-off policy for failed jobs. There is also a built-in dashboard that allows us to monitor all jobs. JobRunr is self-maintaining – succeeded jobs will automatically be deleted after a configurable amount of time so there is no need to perform manual storage cleanup.



## Setup

### Maven Dependency
Let's jump straight to the Java code. But before that, we need to have the following [Maven dependency](https://search.maven.org/search?q=g:org.jobrunr%20AND%20a:jobrunr-spring-boot-starter) declared in our pom.xml file:

```xml
<dependency>
    <groupId>org.jobrunr</groupId>
    <artifactId>jobrunr-spring-boot-starter</artifactId>
    <version>1.2.0</version>
</dependency>
```

### JobRunr Setup
As we're using the `jobrunr-spring-boot-starter` dependency, setup is easy. We only need to add some properties to the `application.properties`:

```properties
org.jobrunr.background-job-server.enabled=true
org.jobrunr.dashboard.enabled=true
```

The first property tells JobRunr that we want to start an instance of a `BackgroundJobServer` which is responsible to process jobs. The second property tells JobRunr to start the embedded dashboard. More documentation is available on [jobrunr.io](https://www.jobrunr.io/en/documentation/configuration/spring/)


By default, the jobrunr-spring-boot-starter will try to use your existing `DataSource` in case of a relational database to store all the job-related information. However, since we will use an in-memory data store, we need to provide a StorageProvider bean (the `JobMapper` bean will be provided by the `jobrunr-spring-boot-starter`):
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

So, what happens behind the scene? JobRunr takes the lambda and analyses it using [ASM](https://asm.ow2.io/). It extracts the correct class (in this case `SampleJobService`) and the correct method (`executeSampleJob`) and serializes all this information together with the parameters into a small Json object:

```json
{
  "lambdaType": "org.jobrunr.jobs.lambdas.JobLambda",
  "className": "com.example.services.SampleJobService",
  "methodName": "executeSampleJob",
  "jobParameters": [
    {
      "className": "java.lang.String",
      "object": "some string"
    }
  ]
}
```

This information, together with some extra information about the Job itself is all serialized via the `StorageProvider` to your choice of data store (your SQL or NoSQL database). 

One or more `BackgroundJobServers` monitor the `StorageProvider` and take jobs from it. Since the BackgroundJobServers use optimistic locking, each job will be processed only once and all the different BackgroundJobServers will share the load. This works out great on Kubernetes where you can scale horizontally to have all your jobs processed faster by just bringing up more instances of your application.


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

### Annotating with the @Job Annotation
To control all aspects of a job, we can annotate our service method with the `@Job` annotation. This allows setting the display name in the dashboard and configuring the number of retries in case a job fails.

```java
@Job(name = "The sample job with variable %0", retries = 2)
public void executeSampleJob(String variable) {
    ...
}
```

We can even use variables that are passed to our job in the display name by means of the String.format() syntax.

If we have very specific use cases where we would want to retry a specific job only on a certain exception, we can write our own ElectStateFilter where we have access to the Job and full control on how to proceed.


## Dashboard
JobRunr comes with a built-in dashboard which allows us to monitor our jobs. If you visit [http://localhost:8000](http://localhost:8000), you will have the possibility to inspect all the jobs, including the recurrent jobs.

<figure>
<img src="https://www.jobrunr.io/blog/2020-04-20-jobrunr-overview.png">
</figure>

Bad things can happen, for example, an SSL certificate expired, or a disk is full. JobRunr, by default, will reschedule the background job with an exponential back-off policy. If the background job continues to fail ten times, only then will it go to the Failed state. You can then decide to re-queue the failed job from the dashboard when the root cause has been solved.

All of this is visible in the dashboard, including each retry with the exact error message and the complete stack trace of why a job failed:
<figure>
<img src="https://www.jobrunr.io/blog/jobrunr-java-mag-1024x498.png">
</figure>

## Conclusion
In this article, we built a basic scheduler using JobRunr with the `jobrunr-spring-boot-starter`. The key takeaway from this tutorial is that we were able to create a job with just one line of code and without any XML-based configuration or the need to implement an interface.

The complete source code for the example is available over on [GitHub](https://github.com/jobrunr/example-java-mag).