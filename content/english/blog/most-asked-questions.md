---
title: "10 Most Asked questions about JobRunr in 2025"
description: "Since launching our AI-powered chatbot on the documentation page in August, it has answered over 5,000 developer questions. This massive influx of curiosity has given us a clear picture of exactly what you need to know to get JobRunr running smoothly."
image: "/blog/MostAskedQuestions.png"
date: 2025-12-23T00:24:16+02:00
author: "Nicholas D'hondt"
tags:
  - blog
---

Whether you are migrating to **JobRunr v8**, integrating with **Spring Boot 3**, or just trying to figure out why your dashboard will not start, we have compiled the answers to the top 10 most-asked questions of the year.

## **1\. How do I integrate JobRunr with Spring Boot?**

**The Short Answer:**

Add the [JobRunr spring boot starter](https://www.jobrunr.io/en/documentation/configuration/spring/) dependency and enable the dashboard and background job server in your application.properties. Then inject the JobScheduler bean to enqueue jobs using simple lambda expressions.

**The Details:**

Integration is designed to be plug-and-play. Here is the standard setup for Spring Boot 4\.

**1\. Add the Dependency (Maven)**

```xml
<dependency>
    <groupId>org.jobrunr</groupId>
    <artifactId>jobrunr-spring-boot-4-starter</artifactId>
    <version>8.3.1</version>
</dependency>
```

**2\. Configure Properties**

Update your application.properties. Note the property changes in v8 where we removed the org prefix.

```
# Enable the background job server and dashboard
jobrunr.background-job-server.enabled=true
jobrunr.dashboard.enabled=true
```

**3\. Enqueue a Job**

Inject the JobScheduler and fire an async job.

```java
@Service
public class MyService {
    
    private final JobScheduler jobScheduler;

    public MyService(JobScheduler jobScheduler) {
        this.jobScheduler = jobScheduler;
    }

    public void createJob() {
        jobScheduler.enqueue(() -> System.out.println("Hello World from JobRunr!"));
    }
}
```

If you want more information, check out the specific page about the [Spring Boot Starter.](https://www.jobrunr.io/en/documentation/configuration/spring/)

## 

## **2\. Why is my dashboard not starting or showing 'Connection Refused'?**

**The Short Answer:**

This is usually due to a missing configuration property or a port conflict. Ensure *jobrunr.dashboard.enabled* is set to true and that port 8000 is free.

**The Details:**

If you cannot access the dashboard at http://localhost:8000 check these three common culprits.

* **Disabled by Default:** You must explicitly enable the dashboard in your config.  
* **Port Conflict:** If port 8000 is taken, change it using jobrunr.dashboard.port=9000.  
* **v8 Property Prefix Change:** If you recently upgraded to v8 check your property prefixes. We removed the org. prefix.  
  * ❌ **Old:** org.jobrunr.dashboard.enabled=true  
  * ✅ **New:** jobrunr.dashboard.enabled=true

## **3\. Can I pause or cancel a job mid-execution?**

**The Short Answer:**

Cancelling a job mid-execution is the same thing as deleting it. You can delete any job via the dashboard or the JobScheduler API. JobRunr will then move it to a `DELETED` state and you can still manually requeue it.

You cannot pause a job mid-execution, the closest features would be pausing recurring jobs or pausing an entire dynamic queue, which are both features in JobRunr Pro.

**The Details:**

* **Deleting Jobs Programmatically:** Use BackgroundJob.delete(jobId) or `jobScheduler.delete(jobId).` If the job is currently *processing*, JobRunr will attempt to interrupt the thread. Best practice is to ensure your job logic handles InterruptedException correctly so it can stop gracefully.  
* Deleting Jobs Interactively: Find a job on the Dashboard and click on the `DELETE` button. This will kick out the same process outlined above.  
* Deleting Jobs (Pro): JobRunr Pro’s Advanced Dashboard allows you to select multiple jobs and delete them all at once.  
* **Pausing (Pro Feature):** In the Pro version you can pause processing for specific queues or recurring jobs directly from the dashboard. This is a lifesaver during deployments or when downstream services are down.

Learn more about [**JobRunr Pro features here**](https://www.jobrunr.io/en/pro/).

## **4\. What are the major breaking changes in Version 8?**

**The Short Answer:**

JobRunr v8 removes support for Redis and Elasticsearch storage providers, drops the `org.` prefix from Spring properties, and changes several method signatures.

**The Details:**

Before upgrading, check your application for these critical changes.

1. **Property Prefix:** Update your application.properties to remove org. from all JobRunr configurations.  
2. **Storage Providers:** Support for Redis and Elasticsearch has been removed. You must migrate to a supported [**database**](https://www.jobrunr.io/en/documentation/installation/storage/).  
3. **API Signatures:** Methods that accepted Set\<String\> for labels now expect List\<String\> to support ordered labels in the dashboard.

For a complete checklist, visit our [**v8 Migration Guide**](https://www.jobrunr.io/en/guides/migration/v8/).

## 

## **5\. How does the retry mechanism and exponential back-off work?**

**The Short Answer:**

Failed jobs are automatically retried 10 times using an "exponential back-off" strategy. The delay between retries increases with each failure. The number of retries is of course configurable, globally or per job.

**The Details:**

JobRunr handles transient failures for you.

* **Default Behavior:** If a job throws an exception it goes back into the queue with a scheduled delay.  
* **The Limit:** After 10 failed attempts the job moves to the **FAILED** state in the dashboard.  
* **Dead Letter Queue:** Failed jobs essentially sit in a "Dead Letter Queue". You can inspect the exception stack trace in the dashboard, fix the underlying issue, and then manually **requeue** the job.

## **6\. What are the limits for recurring jobs in the OSS version?**

**The Short Answer:** 

JobRunr OSS is technically optimized for up to **100 recurring jobs per database instance**. This is a technical guardrail to ensure reliability.

**The Details:**

* **Technical Stability:** The OSS engine was not originally architected for high-volume recurring schedules. Past users attempting to run hundreds of recurring jobs on the free tier experienced missed executions, which is why we advise staying within this limit for production stability.

* **Per-Database Context:** This limit applies per storage connection. If you run multiple applications connecting to **separate** databases, each application can safely run around 100 recurring jobs. You are not violating our terms if your total company usage exceeds 100 jobs.

* **Concurrency Control:** By default, JobRunr does not allow concurrent runs of the same recurring job. If an instance is still processing when the next trigger occurs, the new run is skipped to prevent pile-ups.

* **Need More?** JobRunr Pro features an optimized engine designed to handle thousands of recurring jobs reliably. It also allows you to configure `maxConcurrentJobs` if you specifically want overlapping executions.

## **7\. Is JobRunr safe for horizontal scaling across multiple servers?**

**The Short Answer:**

Yes. JobRunr is distributed by design. It uses optimistic locking to ensure jobs are processed exactly once even when multiple servers are running simultaneously.

**The Details:**

You do not need complex configurations like Zookeeper.

* **Coordination:** All coordination happens through your **database**.  
* **Master Election:** One server is automatically elected as the "master" to handle recurring job scheduling while all servers act as workers to process background jobs.  
* **Scaling:** Simply spin up more application instances and they will automatically start picking up work.

## **8\. How do I show logs or progress bars in the dashboard?**

**The Short Answer:**

Use the JobContext object within your job method. You can log messages visible in the dashboard via jobContext.logger() and update a progress bar using jobContext.progressBar().

**The Details:**

This feature turns your "black box" background tasks into transparent processes.

```java

public void performLongTask(JobContext jobContext) {
    jobContext.logger().info("Starting heavy processing...");
    
    ProgressBar progressBar = jobContext.progressBar(100); 
    
    for (int i = 0; i < 100; i++) {
        doWork(i);
        progressBar.incrementSucceeded(); // Updates the UI bar
    }
    
    jobContext.logger().info("Processing complete!");
}

```

**Note**: In v8 increaseByOne was renamed to incrementSucceeded. 

Check out the documentation to read more about [logging & job progress](https://www.jobrunr.io/en/documentation/background-methods/logging-progress/)

## **9\. What is the recommended setup for Kubernetes?**

**The Short Answer:**

Split your deployment into two types of pods: a Web Pod for the Dashboard and REST API and scalable Worker Pods for the BackgroundJobServers.

**The Details:**

* **Web Pod (1 Replica):** Runs the Dashboard. Keeping this stable avoids frequent "master re-election" events.  
* **Worker Pods (Scalable):** These run the BackgroundJobServer. You can scale these up and down based on CPU load or queue depth using KEDA.  
* **Graceful Shutdown:** Configure JobRunr to wait for running jobs to finish on shutdown and ensure Kubernetes gives the pod enough time via terminationGracePeriodSeconds before forcibly killing it. You can easily configure this using the jobrunr.background-job-server.interrupt-jobs-await-duration-on-stop=90m property.

Read our detailed guide on [**Kubernetes Autoscaling**](https://www.jobrunr.io/en/guides/advanced/k8s-autoscaling/).

## **10\. How can I avoid or prevent duplicate jobs?**

**The Short Answer:**

In OSS generate a deterministic UUID based on business keys when creating the job. In Pro use the JobId.fromIdentifier() feature or the enqueueOrReplace method for built-in de-duplication.

**The Details:**

**OSS Strategy:**

```java

// Create a UUID based on unique data
UUID distinctId = UUID.nameUUIDFromBytes(("email-order-" + order.getId()).getBytes());
jobScheduler.enqueue(distinctId, () -> mailService.sendConfirmation(order.getId()));
```

If a job with this ID already exists the new request is ignored.

**Pro Strategy:**

JobRunr Pro makes this cleaner with business keys and while updating the job parameters:

```java
// Updates the existing job if it exists or creates a new one
jobScheduler.enqueueOrReplace(JobId.fromIdentifier(order.getId()), () -> mailService.sendConfirmation(order.getId());
```

---

### 

### **Ready to Upgrade Your Background Jobs?**

Whether you are scaling up to millions of jobs or just want a dashboard that tells you *exactly* why that one import failed last Tuesday, JobRunr has you covered.

If you are running mission-critical workloads, check out [**JobRunr Pro features**](https://www.jobrunr.io/en/pro/) like priority queues, (atomic) batch processing and workflows.

