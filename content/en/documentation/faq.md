---
title: "Frequently Asked Questions"
translationKey: "faq"
subtitle: "Some frequently asked questions about JobRunr..."
description: "Find out all about the architecture and terminology behind JobRunr"
date: 2020-09-16T11:12:23+02:00
layout: "documentation"
menu: 
  main: 
    identifier: faq
    parent: 'documentation'
    name: FAQ
    weight: 95
sitemap:
  priority: 0.1
  changeFreq: monthly
---

## BackgroundJobServer FAQ
### Does JobRunr need open ports for distributing jobs?
No, JobRunr does not require an open port for distributing the workload - this is orchestrated via the `StorageProvider`.

### How is the coordination between different nodes done?
Each [`BackgroundJobServer`]({{<ref "_index.md#backgroundjobserver">}}) registers itself on startup in the `StorageProvider`. For an RDBMS, this is a plain old table called `jobrunr_backgroundjobservers`. The master is the server which is the longest running (so, the one that was registered as first node).  
Then, every 15 seconds, each `BackgroundJobServer` updates a lastHeartBeat timestamp. If a node crashes for some reason (this can also be the master node), the lastHeartBeat timestamp is not updated anymore. All other server participating in processing jobs see that the master node is not active anymore and it is removed from the `StorageProvider`.  
Next, the master reelection process starts which is again nothing more than the longest running `BackgroundJobServer`.

> Pro tip: if you are running in a Kubernetes environment, it is best to always keep your first `BackgroundJobServer` running and scale other pods up and down. This will result in less Master reelection processes and thus less database queries.

### What is the role of the master?
The master is a `BackgroundJobServer` like all other nodes processing but it does some extra tasks:
- it checks for recurring jobs and schedules them when they are about to run
- it checks for scheduled jobs and enqueues them when they need to run
- it checks for orphaned jobs and reschedules them
- it does some zookeeping like deleting all the succeeded jobs

### What happens to my scheduled and recurring jobs if my `BackgroundJobServer` is down
All scheduled jobs will run again at their scheduled time as soon as the server is up again. However, all scheduled jobs that have a scheduled time in the past (because they were not executed during downtime), will run as soon as the server is started.

Recurring jobs that were missed during downtime will not be scheduled again in JobRunr OSS once your `BackgroundJobServer` is up again. **JobRunr Pro** does have a feature to schedule the jobs that were skipped during downtime.

### My recurring jobs are not running nor available in the dashboard?
To schedule your recurring jobs, you must make sure that the code scheduling these jobs is executed on startup of your application. See the examples in [Recurring jobs]({{<ref "background-methods/recurring-jobs.md#registering-your-recurring-jobs">}})

### JobRunr stops completely if the SQL/NoSQL database goes down
JobRunr uses your database for a lot of things: 
- Master node election for the `BackgroundJobServer`
- Monitoring whether there are no zombie jobs (jobs that were being processed on a `BackgroundJobServer` node that crashed)
- Optimistic locking so that a job will be only executed once
- ... 

The moment JobRunr loses its connection to the database (or the database goes down), there will be a lot of threads that will try to write updates to the database but all of these writes will of course fail. This will result in __a huge amount of logging__ and if JobRunr would try to continue job processing, it would flood the disks fast because of each attempt to process a job fails. That's why I decided that if there are too many exceptions because of the `StorageProvider`, JobRunr stops all background job processing. This can of course be monitored via the dashboard and health endpoints.

> JobRunr Pro improves this by monitoring if the `StorageProvider` comes up again and if so, automatically restarts processing on all the different `BackgroundJobServer`s.

<!-- ### How can I control the amount of workers per BackgroundJobServer? -->

### I'm seeing an exception regarding a version check
I'm seeing the following exception in my logs:
```
Unable to check for new JobRunr version: api.github.com
```

Please upgrade to the latest JobRunr version. This call is no longer part of the backend.

### My jobs are not being processed and the dashboard is not visible

Often, this is due to a misconfiguration. Please make sure you have enabled the background job server and dashboard. They are disabled by default. Thus why jobs are not executed or the dashboard is unreachable.

> Are you using Spring Boot? Please check that you properties are properly configured. Pre v8, all JobRunr properties are prefixed with `org.`. **Make sure your properties have this `org.` prefix if you're still on v7 or lower**.

## Job FAQ

### How does JobRunr make sure to only process a job once?
JobRunr uses [optimistic locking](https://en.wikipedia.org/wiki/Optimistic_concurrency_control) to make sure that a job is only processed once. 
Concretely, this means that when a `BackgroundJob` server starts processing a job, it first changes the state to `PROCESSING` and tries to save that with the `StorageProvider`. If that fails, it means that the job is already processing by another `BackgroundJob` server and the current `BackgroundJob` server will not process it again. 
If it succeeds, it means that the job is not being processed by another `BackgroundJob` server and the current `BackgroundJob` server can process it.



### What if I don't want to have 10 retries when a job fails?
You can configure the amount of retries for all your jobs or per job.
- To change the default for all jobs, just register a [`RetryFilter`]({{<ref "_index.md#retryfilter">}}) with the amount of retries you want using the `withJobFilter` method in the [Fluent API]({{<ref "configuration/fluent/_index.md">}}) or in case of the [Spring configuration]({{<ref "configuration/spring/_index.md">}}), just change the `jobrunr.jobs.default-number-of-retries` property.
- To change the amount of retries on a single Job, just use the `@Job` annotation:

```java
@Job(name = "Doing some work", retries = 2)
public void doWork() {
    ...
}
```

### What if my job is in a state where I do not want to retry up to 10 times?
In case you encounter a state where it does not make sense anymore to retry, you can throw a `JobRunrException` with as second parameter `true` (= `doNotRetry`):

```java
@Job(name = "Doing some work", retries = 20)
public void doWork() {
    if(itsBeerOClockTime()) {
      throw new JobRunrException("It's beer o'clock time!", true);
    }
    ...
}
```

Notice the true value in the constructor of the `JobRunrException`: passing true there means do not retry. For more info, see the [JavaDoc](https://javadoc.io/doc/org.jobrunr/jobrunr/latest/org/jobrunr/JobRunrException.html).


### I'm encountering a `java.lang.IllegalThreadStateException`
While developing, you may encounter the following error:

```java
java.lang.IllegalThreadStateException: Job was too long in PROCESSING state without being updated.
at org.jobrunr.server.JobZooKeeper.lambda$checkForOrphanedJobs$2(JobZooKeeper.java:134)
```

This is because you stopped a running JVM instance where a `BackgroundJobServer` was processing a job. When a job is being processed, it is regularly updated with a timestamp so that in case of a node failure, the job can be retried automatically on a different server. The error message you see here, is an example of such a case.

### I'm listening for jobs using Service Bus messages in a load-balanced environment and I want to schedule jobs only once.
If you are in an environment using JMS or any other Service Bus Message and you are listening on multiple nodes for these messages to create jobs, you will probably enqueue the same job on each node. This is because each node that is listening, receive the JMS message and enqueue the same job.

This can easily be solved using the following technique:

```java
public class JobMessageListener implements MessageListener {
    private JobScheduled jobScheduler;
    private MessageHandler messageHandler;
 
    public ConsumerMessageListener(JobScheduled jobScheduler, MessageHandler messageHandler) {
        this.jobScheduler = jobScheduler;
        this.messageHandler = messageHandler;
    }
 
    public void onMessage(Message message) {
        TextMessage textMessage = (TextMessage) message;
        jobScheduler.enqueue(
          message.getJMSCorrelationID(), // by passing the JMS correlation id, this will be the id of the job and thus unique.
          () -> messageHandler.handleServiceBusMessage(textMessage.getText())
        );

    }
}
```

