---
title: "Documentation"
translationKey: "documentation"
keywords: ["Java Job Manager", "Quartz Alternative", "Spring Batch Alternative", "Distributed Java Job Processing", "Background Job Scheduling", "java scheduler", "java cron", "job runner", "jobrunner"]
subtitle: "The architecture and terminology behind JobRunr"
description: "Find out all about the architecture and terminology behind JobRunr"
date: 2020-04-30T11:12:23+02:00
layout: "documentation"
menu: 
  main: 
    identifier: documentation
    weight: 10
sitemap:
  priority: 0.9
  changeFreq: monthly
---
<style>
#mobile-notice {
  display: none;
}

@media only screen and (max-width: 600px) {
  #mobile-notice {
    display: block;
  }
}
</style>

<div class="star-btn" style="text-align: center; margin: 2rem 0 3rem;">
  <a href="https://github.com/jobrunr/jobrunr" class="btn btn-black btn-lg" target="_blank" rel="noopener" style="display: inline-block; height: 45px; margin-right: 1rem;">
      <svg viewBox="0 0 16 16" style="margin: -4px 10px 0 0; display: inline-block; vertical-align: text-top; fill: currentColor; width: 25px; height: 25px;" aria-hidden="true"><path fill-rule="evenodd" d="M14 6l-4.9-.64L7 1 4.9 5.36 0 6l3.6 3.26L2.67 14 7 11.67 11.33 14l-.93-4.74L14 6z"></path></svg>
      <span>Star JobRunr on Github</span>
  </a>
</div>

<div id="mobile-notice" style="margin-top: 1rem">

> Visiting via your mobile phone? Note that the JobRunr website is more extensive on desktop.
</div>


## Architecture
<figure>

  ![Architecture](/documentation/architecture.webp)

  <figcaption>JobRunr architecture</figcaption>
</figure>

## How does it all work?
- You can enqueue, schedule or schedule a recurring background [Job](#job) the [JobScheduler](#jobscheduler).
- The [JobScheduler](#jobscheduler) analyses and decomposes the lambda to a JSON object and saves it into the [StorageProvider](#storage-provider).
- JobRunr returns immediately to the caller so that it is not blocking
- One or more [BackgroundJobServers](#backgroundjobserver) poll the [StorageProvider](#storage-provider) for new enqueued jobs and process them
- When a job has been processed, it updates the state in the [StorageProvider](#storage-provider) and fetches the next job to perform

{{< trial-button >}}

## Terminology
### Job
At the core of JobRunr, we have the `Job` entity - it contains the name, the signature, the `JobDetails` (the type, the method to execute and all arguments) and the history - including all states - of the background job itself. A `Job` is a unit of work that should be performed outside of the current execution context, e.g. in a background thread, other process, or even on different server – all is possible with JobRunr, without any additional configuration.

<figure>

```java
BackgroundJob.enqueue(() -> System.out.println("Simple!"));
```
<figcaption>Instead of calling the method immediately, JobRunr serializes the type (System), static field (out) and method name (println, with all the parameter types to identify it later), and all the given arguments, and stores it as Json using a StorageProvider. It will then later be processed by a BackgroundJobServer<figcaption>
</figure>

### RecurringJob
A `RecurringJob` is in essence a `Job` with a CRON schedule or a fixed interval. A special component within JobRunr checks the recurring jobs and then enqueues them as fire-and-forget jobs when the time has come to run the job in question.

### Storage Provider
A `StorageProvider` is a place where JobRunr keeps all the information related to background job processing. All the details like types, method names, arguments, etc. are serialized to Json and placed into storage, no data is kept in a process’ memory. The `StorageProvider` is abstracted in JobRunr well enough to be implemented for RDBMS and NoSQL solutions.

> This is the main decision you must make, and the only configuration required before you start using the framework.

### BackgroundJob
`BackgroundJob` is a class that allows to enqueue background jobs using static helper methods - it in fact delegates everything to the JobScheduler. You are completely free to choose how to enqueue background jobs - either using the static helper methods in the `BackgroundJob` class or either directly on the `JobScheduler` class. It may help readability but can make things more difficult to test.

### JobScheduler
The `JobScheduler` is responsible for analyzing the lambda, collecting all the required job parameters, creating background jobs and saving them into the `StorageProvider`. This process is very fast and once it is stored in the `StorageProvider`, it returns to the caller immediately.

### BackgroundJobRequest
`BackgroundJobRequest` is also a class that allows to enqueue background jobs using static helper methods - it in fact delegates everything to the `JobRequestScheduler`. You are again completely free to choose how to enqueue background jobs - either using the static helper methods in the `BackgroundJobRequest` class or either directly on the `JobRequestScheduler` class. It may help readability but can make things more difficult to test.

### JobRequestScheduler
The `JobScheduler` is responsible for transforming a `JobRequest` together with its internal data to a background job and save it into the `StorageProvider`. This process is very fast and once it is stored in the `StorageProvider`, it returns to the caller immediately.

### JobRequest
A `JobRequest` is an interface that allows to create a background job. It can contain extra data that also will be serialized and will be saved into the `StorageProvider`. When you implement this interface, you will need to provide the `JobRequestHandler`-class which will process your `JobRequest`.

```java
public interface JobRequest extends JobRunrJob {
    Class<? extends JobRequestHandler> getJobRequestHandler();
}
```

### JobRequestHandler
A `JobRequestHandler` is an interface that that will be used to run the background job during job execution. As a parameter, it will receive the `JobRequest` and can thus access all data that was provided when the job was created.

### Job annotation
The `@Job` annotation allows you to manage certain aspects from a Job like the name and the label (visible in the dashboard), the amount of retries and various other aspects like the `queue`, the `server tag` and the `mutex` if you are using JobRunr Pro.

### JobBuilder
The `JobBuilder` is an alternative to the `@Job` annotation and also allows you to configure all the different aspects from a Job. The difference is that using the `JobBuilder` certain aspects can be set at runtime which is not possible via the `@Job` annotation.

### BackgroundJobServer
The `BackgroundJobServer` class processes background jobs by querying the StorageProvider. Roughly speaking, it’s a set of background threads that listen to the storage provider for new background jobs, and perform them by first de-serializing the stored type, method and arguments and then executing it.

You can place this `BackgroundJobServer` in any process you want - even if you terminate a process, your background jobs will be retried automatically after restart. So in a basic configuration for a web application, you don’t need to use any Windows services for background processing anymore.

> <u>**IMPORTANT:**</u>
> <br/>**Remark 1**: You should have always 1 `BackgroundJobServer` running as it is responsible to see whether any jobs need to be processed.
> <br/>**Remark 2**: You should have only 1 `BackgroundJobServer` per application / JVM instance. If you want to process more jobs or you want to distribute the jobs over multiple JVM's, you must launch a complete new instance of your application. **Starting multiple `BackgroundJobServers` within the same JVM instance is bad practice and should NOT be done.**

### JobActivator
Most enterprise applications make use of an [IoC framework](https://en.wikipedia.org/wiki/Inversion_of_control) like [Spring](https://github.com/spring-projects/spring-framework) or [Guice](https://github.com/google/guice) - we off course support these IoC frameworks. The `JobActivator` is a Java 8 functional interface and has the responsability to lookup the correct class on which the background job method is defined.

<figure>

```java
public interface JobActivator {
    <T> T activateJob(Class<T> type);
}
```
<figcaption>Given a class, the JobActivator must return a instance of that class that is completely initialized</figcaption>
</figure>

### JobRunrDashboardWebServer
The `JobRunrDashboardWebserver` gives insights in all jobs that are enqueued, being processed, have succeeded or have failed. You can see on which `BackgroundJobServer` a background job is being processed, the current state it is in and in case of a failure, have a look at why it failed.
The dashboard exists out of a React frontend and makes use of a REST API.

### JobMapper
The `JobMapper` is used to serialize and deserialize the job to Json as all jobs are stored in the `StorageProvider` as Json. It uses the `JsonMapper` underneath and has some utility functions to serialize a Job and a RecurringJob.

### JsonMapper
The `JsonMapper` is the abstraction layer above either [Jackson](https://github.com/FasterXML/jackson), [Gson](https://github.com/google/gson) or [Json-B](http://json-b.net/). It is used by the JobMapper and the JobRunrDashboardWebServer to map domain objects like `Job` and `RecurringJob` to json entities for the REST API.

### JobFilter
The `JobFilter` allows you to extend and intervene with background jobs in JobRunr. There are several types of JobFilters:

- `JobClientFilter`: filters that are called before and after the job is created
- `JobServerFilter`: filters that are called before and after the processing of the job
- `ElectStateFilter`: a filter that decides the new state based on the old state
- `ApplyStateFilter`: filters that are called when a state change happens within a job

### RetryFilter
This is a default filter of type `ElectStateFilter` and is automatically added for each job which is run by JobRunr. When a job fails, the `RetryFilter` will automatically retry the job 10 times with an exponential back-off policy. Is some API server down while processing jobs? No worries, JobRunr has you covered.

### JobContext
If access is needed to info about the background job itself (like the id of the job, the name, the state, ...) within the execution, the `JobContext` comes in handy. Using it is simple: if you use Java 8 lambda's you just need to pass an extra parameter of type `JobContext.Null` to your background job method and at execution time an instance will be injected into your background job method. If you use a `JobRequest` then it is available as a default method on `JobRequestHandler` interface.

> Note: that this is best avoided as it couples your domain logic tightly with JobRunr.

<figure>

```java
BackgroundJob.enqueue(() -> myService.doWork(JobContext.Null));
```
<figcaption>When executing the doWork method of myService, JobContext will be available</figcaption>
</figure>