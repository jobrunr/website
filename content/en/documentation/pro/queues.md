---
version: "pro"
title: "Queues"
subtitle: "Queues will make sure your critical business processes finish on-time."
date: 2020-08-27T11:12:23+02:00
layout: "documentation"
menu: 
  main: 
    identifier: queues
    parent: 'jobrunr-pro'
    weight: 5
---
{{< trial-button >}}

Are you processing millions of jobs? Do you have some high-prio jobs that need to finish fast? Use JobRunr queues to make sure that critical jobs cut in front of already enqueued jobs.

## Usage
### Using the Job Annotation
Using queues could not have been easier thanks to the `Job` annotation. Just add it to your service method and specify on which queue you want to run it.

```java
public static final String HighPrioQueue = "high-prio";
public static final String DefaultQueue = "default";
public static final String LowPrioQueue = "low-prio";

public void runJobs() {
    BackgroundJob.enqueue(this::startJobOnLowPrioQueue);
    BackgroundJob.enqueue(this::startJobOnDefaultQueue);
    BackgroundJob.enqueue(this::startJobOnHighPrioQueue);
}

@Job(queue = HighPrioQueue)
public void startJobOnHighPrioQueue() {
    System.out.println("This job will bypass all other enqueued jobs.");
}

@Job(queue = DefaultQueue)
public void startJobOnDefaultQueue() {
    System.out.println("This job will only bypass jobs on the LowPrioQueue");
}

@Job(queue = LowPrioQueue)
public void startJobOnLowPrioQueue() {
    System.out.println("This job will only start when all other jobs on the HighPrioQueue and DefaultQueue are finished.");
}

```


### Using the Job Builder
If you are using the `JobBuilder`, queues are also really easy to use and you can even pass the queues at runtime using a variable:

```java
public void startJobOnQueue(JobQueue jobQueue) { // JobQueue can be an enum value
    jobScheduler.create(aJob()
        .withQueue(jobQueue)
        .withDetails(() -> System.out.println("This job will start on the given queue"));
}
```

<br/>

## Configuration
Configuration is easy, both in the fluent api and using Spring configuration:

### Fluent Api
Using the fluent API, first specify all the queues as Strings (or string constants) and then continue the configuration as normal.

<figure>

```java
JobRunrPro
    .configure()
    .useQueues(DefaultQueue, HighPrioQueue, DefaultQueue, LowPrioQueue)
    ...
```
<figcaption>When configuring queues, specify the default queue for all jobs first and then specify all the queues, going from highest priority to lowest priority. Using constants keeps the code readable.</figcaption>
</figure>

### Framework configuration using property file
For the Spring / Micronaut / Quarkus, you can just define the queues in your configuration file. Below you can find the example for Spring.

<figure>

```
org.jobrunr.queues.default-queue-name=Default
org.jobrunr.queues.names=HighPrio, Default, LowPrio
#org.jobrunr.queues.from-enum=org.jobrunr.examples.services.JobRunrQueues # you can also pass the fully qualified name to an enum but due to the Java compiler, enums van not be used in an annotation
  
```
<figcaption>Just define the default queue name and the other queue names using your configuration.</figcaption>
</figure>



### Framework configuration using beans
You can also configure the Queues using beans by means of an extra bean of type `Queues`. This bean must then be passed to the `JobRunrDashboardWebServer` and the `JobScheduler`.

<figure>

```java
    @Bean
    public Queues queues() {
        return new Queues(defaultQueue, queues);
    }

    @Bean
    public JobRunrDashboardWebServer dashboardWebServer(StorageProvider storageProvider, JsonMapper jsonMapper, Queues queues) {
        final JobRunrDashboardWebServer jobRunrDashboardWebServer = new JobRunrDashboardWebServer(storageProvider, jsonMapper, queues);
        jobRunrDashboardWebServer.start();
        return jobRunrDashboardWebServer;
    }

    @Bean
    public JobScheduler jobScheduler(StorageProvider storageProvider, Queues queues) {
        JobScheduler jobScheduler = new JobScheduler(storageProvider, queues);
        BackgroundJob.setJobScheduler(jobScheduler);
        return jobScheduler;
    }
  
```
<figcaption>Create a Queues bean with the different queues and pass it to the JobRunrDashboardWebServer and the JobScheduler</figcaption>
</figure>



## Dashboard

The Pro version of JobRunr comes with an enhanced dashboard that shows you the different queues.
<figure>
<img src="/documentation/jobrunr-pro-enqueued.webp" class="kg-image">
<figcaption>Thanks to queues, we have an overview how many jobs are enqueued on the high-prio queue, standard queue and low-prio queue</figcaption>
</figure>

{{< trial-button >}}