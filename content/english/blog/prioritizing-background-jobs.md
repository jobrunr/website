---
title: "How To Prioritze Background Jobs?"
description: "Not all background tasks are created equal. Discover strategies to ensure your most critical jobs always run first, even under heavy load."
tags: ["blog", "Java", "Background Jobs", "Prioritization", "Concurrency", "JobRunr", "Performance", "Best Practices"]
categories: ["Java", "Development", "Concurrency"]
images:
  - "/blog/FeaturedImage-priority.webp" 
image: "/blog/FeaturedImage-priority.webp"
date: 2025-05-02T10:00:00+02:00
author: "Nicholas D'hondt"
slug: "prioritizing-background-jobs"
---

<div style="text-align: center;margin: -2em 0 2em;">
  <small style="font-size: 70%;">Image based on <a href='https://www.freepik.com/vectors/cartoon-astronaut'>cartoon astronaut vector created by catalyststuff - www.freepik.com</a></small>
</div>

Let's face it, not all background tasks are created equal. Sending a password reset email triggered by a user probably needs to happen as quickly as possible, while generating a non‑critical weekly analytics report can likely wait a bit, especially if the system is busy. If you just throw all your jobs into one big pile, that urgent password reset might get stuck waiting behind a long‑running, low‑urgency batch process. Not ideal!

This is where job prioritization comes in. It's about ensuring your background job system handles the most important tasks first, especially when resources are limited and the system cannot process all tasks within a reasonable time frame.

## Why bother prioritizing?

There are a few cases where we don’t need to bother about prioritizing tasks: a system that can handle a large amount of concurrent tasks, an application only dealing with a small amount of tasks at all times or the tasks all have the same priority. These scenarios are unlikely for most enterprise‑grade applications, where the following requirements are very important:

- **World‑class user experience:** Ensures time‑sensitive, user‑facing tasks (like those password resets, order confirmations, or activation emails) execute promptly, even when less critical jobs are queued up.
- **Meeting business needs & SLAs:** Guarantees that high‑priority business processes (processing payments, handling critical system alerts, time‑sensitive data synchronization) are dealt with according to their importance.
- **Smart resource allocation:** Prevents resource‑hungry but low‑urgency jobs (think: nightly data cleanup, batch report generation) from hogging all the worker threads and starving critical tasks.
- **Reliable and stable systems:** During unexpected load spikes or partial system outages, prioritization ensures that the most essential functions can continue operating by focusing resources on critical jobs.

## How to implement prioritization?

There are several strategies when it comes to job prioritization. Below, we detail a few approaches and give their pros and cons.

### Scheduling less critical jobs to run at times where the system is idle

A very simple approach to prioritisation is delaying non‑critical tasks for times when the system is expected to be nearly idle. This can be done easily in Java with `ScheduledThreadPoolExecutor`. Let’s say we’re operating a restaurant. During opening hours we receive orders that need to be immediately processed, so we submit the order to the worker pool for immediate execution. During closing hours, orders are not taken, so the system is idle, we can schedule a task to generate daily reports.

<span style="color: #39ae70;"><strong>Pros:</strong></span>
 Simple, can be achieved with built‑in Java functions alone.  

<span style="color: #dd2659;"><strong>Cons: </strong></span>Not generally applicable as you need to implement the logic beforehand and it’s not always possible to predict when a system is going to be idle. In such cases we’ll need more complex solutions.

### Using multiple queues / worker pools

This approach consists in creating separate queues for different priority levels, such as critical, high, normal, and low. This can be achieved by creating a `ThreadPoolExecutor` for each priority level; you may also set a priority at the thread level by passing a `ThreadFactory` to the executor. Dedicated worker threads are then assigned to handle these queues based on their priority.

> If you want to learn more about threads, read our blogpost: [*Mastering Java Background Jobs: Threads, Pools, Virtual Threads, and JobRunr*](blog/java-job-threading-options/) 

For example, more workers might be allocated to the critical queue than to the low‑priority queue. When a job is created, it is placed in the appropriate queue according to its priority, ensuring that higher‑priority tasks are processed in a timely manner thanks to having exclusive resources. This approach helps balance workload and ensures timely execution of more urgent tasks.

<span style="color: #39ae70;"><strong>Pros:</strong></span>
Provides strong isolation. A flood of low‑priority jobs won't directly block workers assigned to the critical queue.  

<span style="color: #dd2659;"><strong>Cons: </strong></span> Can lead to inefficient resource use if workers in one priority pool are idle while another pool is overwhelmed (resource fragmentation). Requires managing the configuration of multiple queues and worker assignments.

### Using a priority queue

The idea is to assign a numerical priority value (e.g., 1 for highest, 10 for lowest) to each job as you enqueue it. All jobs go into the same `PriorityQueue`, but the scheduler tries to pull jobs with higher priority first and assign them to available workers.

A simple way to implement this idea is by passing a `PriorityBlockingQueue` when creating a `ThreadPoolExecutor`.

An approach using an SQL database as a job queue would instead sort on priority when retrieving jobs to process.

<span style="color: #39ae70;"><strong>Pros:</strong></span>
Generally leads to better overall worker utilization, as any available worker can pick the most important job. Simpler setup than managing multiple distinct pools.  

<span style="color: #dd2659;"><strong>Cons: </strong></span> Can be more complex to implement correctly within the scheduler. Susceptible to "starvation" where low‑priority jobs might never run if there's a constant stream of high‑priority tasks.

## How JobRunr helps with prioritization

[JobRunr Pro](/pricing/) provides sophisticated features designed to handle both the urgency—i.e., priorities—of critical tasks and the need for fairness across different types of job queues. Let's start by looking at its first key feature for managing importance: [**Priority Queues**](documentation/pro/priority-queues/).

### Priority queues

This feature embraces the *Priority Queue* strategy we discussed earlier. Each job is assigned a priority, and JobRunr processes them from highest priority to lowest. For better visibility, JobRunr lets you define your own logical queue names (think *critical‑notifications*, *default‑processing*, *batch‑reports*, *low‑priority‑cleanup*). When you create a background job, you simply assign it to the queue that makes sense for its urgency.

The Web UI allows you to follow, in near real‑time, the composition of the different queues you have configured. If a low‑priority queue is lagging behind, you can always lower or increase the priority of some jobs directly on the Dashboard to avoid starvation.

<figure>
    {{< img src="/blog/priorityqueues.webp" style="max-height:500px" >}}
    <figcaption>In your dashboard, you can see an overview how many jobs are enqueued on the high-prio queue, standard queue and low-prio queue</figcaption>
</figure>

This setup works great for making sure your most important tasks get immediate attention from available workers. However, relying only on these static priority queues can sometimes lead to a "starvation" scenario as we noted above.

Thankfully, if you're facing this challenge, [JobRunr Pro](/pricing/) offers an elegant enhancement specifically designed to prevent starvation: [**Dynamic Queues**](/documentation/pro/dynamic-queues/). This mechanism works alongside priority queues to ensure that even your lower‑priority tasks get a fair chance at execution, regardless of how busy the high‑priority queues are. We'll dive into exactly how Dynamic Queues achieve this a bit later in the article.

Here’s an example implementing Priority Queues using the Job annotation:

```java
public void runJobs() {
    BackgroundJob.enqueue(this::startJobOnLowPrioQueue);
    BackgroundJob.enqueue(this::startJobOnDefaultQueue);
    BackgroundJob.enqueue(this::startJobOnHighPrioQueue);
}

@Job(queue = "HighPrio")
public void startJobOnHighPrioQueue() {
    System.out.println("This job will bypass all other enqueued jobs.");
}

@Job(queue = "Default")
public void startJobOnDefaultQueue() {
    System.out.println("This job will only bypass jobs on the LowPrioQueue");
}

@Job(queue = "LowPrio")
public void startJobOnLowPrioQueue() {
    System.out.println("This job will only start when all other jobs on the HighPrioQueue and DefaultQueue are finished.");
}
```

In this example, we've created three jobs at three different priority levels—one assigned to the highest‑priority queue, a second assigned to the default queue, and the last assigned to the lowest‑priority queue. Ideally, the majority of our jobs will end up in the default queue, and we will only put jobs that can be delayed for a long time in the lowest‑priority queue.

> JobRunr Pro allows you to configure up to 5 priority queues.

If you don’t like annotations, JobRunr also offers a builder to fluently configure your jobs. Check out the [dedicated documentation page](/documentation/pro/priority-queues/) to find out how to use a `JobBuilder` to set priorities on your tasks and more.

### Dynamic Queues: ensuring fairness

While Priority Queues help organize jobs by importance, scenarios like multi‑tenant applications or diverse workloads can present a challenge: what if one tenant or one type of job generates a massive number of tasks, potentially overwhelming the system and delaying jobs from other tenants or types?

[JobRunr Pro](/pricing/) addresses this directly with its [**Dynamic Queues**](/documentation/pro/dynamic-queues/) feature, designed specifically to guarantee *fair‑use* processing.

#### An overview of different dynamic queues

Instead of relying solely on static priority, Dynamic Queues work using Job Labels and configurable load‑balancing policies. Find out more on dynamic‑queue configuration and usage in the [JobRunr documentation](/documentation/pro/dynamic-queues/) .

<figure>
    {{< img src="/documentation/dynamic-queues.png" style="max-height:500px" >}}
    <figcaption>In your dashboard, you can see an overview of all your different dynamic queues
</figcaption>
</figure>

### How JobRunr Pro guarantees fairness

JobRunr allows you to configure different dynamic‑queue policies (e.g., *RoundRobin* or *WeightedRoundRobin*) that instruct the JobRunr scheduler how to distribute processing effort across the different dynamic queues identified by the labels.

Even if one dynamic queue (like Tenant‑A) has millions of jobs waiting, the policy ensures that other queues (like Tenant‑B) still receive their fair share of processing time according to the provided policy. 

For example, when a round‑robin policy is configured, JobRunr processes jobs from Tenant‑A on the first run, then jobs from Tenant‑B on the second run, resulting in an execution chain similar to Tenant‑A, Tenant‑B, Tenant‑A, Tenant‑B,….

### Combining Dynamic Queues & Priority Queues

Dynamic Queues can be used together with Priority Queues. This allows for combined strategies where, for example, you ensure fairness between tenants using Dynamic Queues while also potentially prioritizing jobs within each tenant's workload using Priority Queues.

In essence, Dynamic Queues provide a powerful mechanism for load‑balancing and ensuring fairness in complex environments, preventing any single source of jobs from monopolizing background processing resources.

Below you can find an example of how you can use dynamic queues together with priority queues.

```java
// Priority‑queue name constants (also used as labels below)
public static final String HIGH_PRIO_QUEUE = "HighPrio";
public static final String DEFAULT_QUEUE   = "Default";
public static final String LOW_PRIO_QUEUE  = "LowPrio";

public void runJobs() {
    String tenantA = "TenantA";
    String tenantB = "TenantB";

    // Match methods with the two arguments we pass
    BackgroundJob.enqueue(() -> highPriorityTenantJob(tenantA, HIGH_PRIO_QUEUE));
    BackgroundJob.enqueue(() -> lowPriorityTenantJob (tenantA, LOW_PRIO_QUEUE));
    BackgroundJob.enqueue(() -> defaultPriorityTenantJob(tenantB, DEFAULT_QUEUE));
    BackgroundJob.enqueue(() -> highPriorityTenantJob(tenantB, HIGH_PRIO_QUEUE));
}

@Job(
  name   = "High Prio Job for %0",
  labels = { "tenant:%0", "%1" }
)
public void highPriorityTenantJob(String tenant, String priorityLabel) {
    System.out.printf("Executing HIGH priority job for tenant %s on queue %s%n", tenant, priorityLabel);
}

@Job(
  name   = "Default Prio Job for %0",
  labels = { "tenant:%0", "%1" }
)
public void defaultPriorityTenantJob(String tenant, String priorityLabel) {
    System.out.printf("Executing DEFAULT priority job for tenant %s on queue %s%n", tenant, priorityLabel);
}

@Job(
  name   = "Low Prio Job for %0",
  labels = { "tenant:%0", "%1" }
)
public void lowPriorityTenantJob(String tenant, String priorityLabel) {
    System.out.printf("Executing LOW priority job for tenant %s on queue %s%n", tenant, priorityLabel);
}
```

In this example, we define our three queue names once as constants and then enqueue each job by passing in both the tenant (e.g., “TenantA”) and the priority label (e.g., “HighPrio”). 

The `@Job` annotation uses `%0` and `%1` to substitute those values into the job’s name and its labels, so you automatically get a descriptive name like “High Prio Job for TenantA” and two labels—`tenant:TenantA` (for dynamic‑queue fairness) and `HighPrio` (for priority routing). 

When you call `BackgroundJob.enqueue(...)`, JobRunr Pro picks up those annotations, applies your round‑robin or priority‑queue policies behind the scenes, and schedules the work on exactly the right queue. Your business‑logic methods stay clean and focused—everything about naming, labeling, and prioritization happens in the annotation metadata.

More information about dynamic queues can be found in the [*Dynamic Queues* section of the JobRunr Pro documentation](/documentation/pro/dynamic-queues/).

## Quick tips for effective prioritization

- **KISS (Keep It Simple, Scheduler!):** Avoid creating too many priority levels. Often 3 or 4 (e.g., Critical, High, Normal, Low) are enough to cover most needs.
- **Define priorities clearly:** Make sure your team has a shared understanding of what criteria place a job into a specific priority tier.
- **Monitor your queues:** Keep an eye on queue lengths and job processing times for each priority level (JobRunr's dashboard is great for this!). Are critical jobs flowing smoothly? Are low‑priority jobs eventually getting processed?
- **Prevent starvation:** Ensure your setup allows low‑priority tasks to run eventually.

## Conclusion

Don't treat all your background jobs the same! Implementing prioritization is key to building responsive, reliable applications that meet user expectations and business requirements. By understanding the strategies and leveraging features in tools like [JobRunr Pro](/pricing/), you can ensure your most critical tasks always get the attention they deserve.
