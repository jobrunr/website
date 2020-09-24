---
title: "JobRunr on Baeldung"
translationKey: "2020-04-08-jobrunr-release"
summary: "A guide on how to run background jobs in Spring with JobRunr"
feature_image: /blog/2020-04-08-get-shit-done.webp
date: 2020-04-08T11:12:23+02:00
author: "Ronald Dehuysser"
draft: true
tags:
  - blog
  - release
---
## Overview

In this article, we're going to look into distributed background job processing in Java using JobRunr and have it integrate with Spring.  

JobRunr is a library that we can embed in our application and which allows us to schedule background jobs using a Java 8 lambda. To do it's job, JobRunr analyses the Java 8 lambda, serializes it as Json and stores it into either a database or a NoSql data store. 
A job can be a short or long-running processes and it will be automatically off-loaded to a background thread so that the current web request is not blocked. If we see that we're producing too many background jobs and our server can not cope with the load, we can easily scale horizontally by just adding extra instances of our application. JobRunr will share the load automatically and distribute all jobs over the different instances of our application.
It also contains an automatic retry feature with exponential back-off policy for failed jobs and comes with a built-in dashboard that allows us to monitor all jobs.


## Setup
For the sake of simplicity, we'll use an InMemory data store to store all Job related information.


### Maven Configuration
Let's jump straight to the Java code. First of all, we need to have the following Maven dependency declared in our pom.xml file:

<dependency>
    <groupId>org.jobrunr</groupId>
    <artifactId>jobrunr-spring-boot-starter</artifactId>
    <version>1.0.0</version>
</dependency>

You can always check the latest versions hosted by the Maven Central with the link provided before.

### Setup
Before we jump straight to how to create background jobs, we need to initialize JobRunr. As we're using the `jobrunr-spring-boot-starter` dependency, this is easy. We only need to add some properties to the `application.properties`:

```
org.jobrunr.background_job_server=true
org.jobrunr.dashboard=true
```

The first property tells JobRunr that we want to start an instance of a `BackgroundJobServer` which is responsible to process jobs. The second property tells JobRunr to start the embedded dashboard.

## Usage
### Inject dependencies
When we want to create jobs, we'll need to inject the `jobScheduler` and the service from which we want to create a job:
```java
@Inject
private JobScheduler jobScheduler;

@Inject
private SampleJobService sampleJobService;
```

### Creating fire-and-forget jobs
Now that we have our dependencies, we can create fire-and-forget jobs using the `enqueue` method:

```java

jobScheduler.enqueue(() -> sampleJobService.executeSampleJob());
```

Jobs can off-course have parameters, just like any other lambda.

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
JobRunr comes with a built-in dashboard which allows us to monitor our jobs. If you visit http://localhost:8000, you will have the possibility to inspect all the jobs, including the recurrent jobs.

## Conclusion
That's all. We have just built our first basic scheduler using JobRunr as well as Spring's convenience classes.

The key takeaway from this tutorial is that we were able to configure a job with just a few lines of code and without any XML-based configuration or the need to implement an interface.

The complete source code for the example is available in this github project. It is a Maven project which can be imported and run as-is.