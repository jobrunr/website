---
version: "pro"
title: "Dynamic Queues"
subtitle: "Dynamic Queues - also knows as load-balancing or multi-tenancy support - guarantees some fair-use!"
keywords: ["dynamic queues", "load balancing", "multi tenancy support", "priority queues", "multi tenant application", "types of load balancing", "multitenant application", "multi tenant system", "example of multi tenant application", "multitenant applications", "weighted round robin load balancing", "load balancer spring boot", "load balancer spring", "loadbalancing"]
date: 2020-08-27T11:12:23+02:00
layout: "documentation"
menu: 
  main: 
    identifier: load-balancing
    parent: 'jobrunr-pro'
    weight: 4.7
---
{{< trial-button >}}

Are you running a multi-tenant application? Or do you have diverse types of jobs where certain types of jobs could potentially trigger peak workloads? Use JobRunr's built-in dynamic queues to make sure that there is some fair-use and all jobs get a fair amount of resources!

> **Note**: JobRunr Pro supports unlimited dynamic queues and they can be used together with the [priority queues]({{< ref "/priority-queues.md" >}}).

## Example Use Cases
- In a **multi-tenant application** where each tenant can initiate their own jobs, JobRunr ensures fair-use processing. Regardless of whether one tenant generates millions of jobs, the system guarantees that jobs from other tenants are also duly processed.
- In a **diverse workload environment**, certain jobs, such as mass mailings, could potentially trigger surges by generating millions of subsidiary child jobs that require processing. However, it's crucial that other types of jobs remain unaffected by these spikes and continue to be processed smoothly.


## Load-balancing types
JobRunr supports two different types of load-balancing:
- **Round Robin Dynamic Queues**: here, each dynamic queue receives the same amount of resource usage
- **Weighted Round Robin Dynamic Queues**: : here, certain dynamic queues can be configured with an optional weight. A queue with a weight of 2 will be checked twice as often as a queue with a weight of 1.


## Dashboard
If you're using this feature, you can also enable an extra Dynamic Queues view in the dashboard. This view gives an immediate overview of the amount of jobs per dynamic queue.

<figure>
<img src="/documentation/dynamic-queues.png" class="kg-image">
<figcaption>An overview of all the different dynamic queues</figcaption>
</figure>

## Usage
Using dynamic queues is as easy as adding a label to your job! 

### Configuration
###### Round Robin Dynamic Queues
_Configuring Round Robin Dynamic Queues by means of the Fluent API_:<br/>
You can configure your round robin dynamic queues easily by means of the Fluent API:

<figure>

```java
JobRunrPro.configure()
    .useStorageProvider(SqlStorageProviderFactory.using(dataSource))
    .useBackgroundJobServer(usingStandardBackgroundJobServerConfiguration()
            .andWorkerCount(100)
            .andDynamicQueuePolicy(new RoundRobinDynamicQueuePolicy("tenant:")))
    .useDashboard(usingStandardDashboardConfiguration()
            .andDynamicQueueConfiguration("Tenants", "tenant:"))
    .initialize();
```
<figcaption>Notice the RoundRobinDynamicQueuePolicy where we add the label prefix 'tenant:'.<br/>We also enable the extra Dynamic Queue view in the dashboard and name it 'Tenants'</figcaption>
</figure>

_Configuring Round Robin Dynamic Queues by means of Spring Boot Properties_:<br/>
You can also enable the round robin dynamic queues easily via Spring properties:

<figure>

```java
org.jobrunr.jobs.dynamic-queue.round-robin.label-prefix=tenant: 
org.jobrunr.jobs.dynamic-queue.round-robin.title=Tenants
```
</figure>


###### Weighted Round Robin Dynamic Queues
_Configuring Weighted Round Robin Dynamic Queues by means of the Fluent API_:<br/>
You can again easily configure your weighted round robin dynamic queues by means of the Fluent API:

<figure>

```java
JobRunrPro.configure()
    .useStorageProvider(SqlStorageProviderFactory.using(dataSource))
    .useBackgroundJobServer(usingStandardBackgroundJobServerConfiguration()
            .andWorkerCount(100)
            .andDynamicQueuePolicy(new WeightedRoundRobinDynamicQueuePolicy("tenant:", Map.of("Tenant-A", 5))))
    .useDashboard(usingStandardDashboardConfiguration()
            .andDynamicQueueConfiguration("Tenants", "tenant:"))
    .initialize();
```
<figcaption>Notice the WeightedRoundRobinDynamicQueuePolicy where we add the label prefix 'tenant:'.<br/>'Tenant-A' is configured with a weight of 5 meaning that it will get 5 times more resources than other tenants.</figcaption>
</figure>

_Configuring Weighted Round Robin Dynamic Queues by means of Spring Boot Properties_:<br/>
You can also enable the weighted round robin dynamic queues easily via Spring Bean:

<figure>

```java
@Bean(name = "dynamicQueuePolicy")
public DynamicQueuePolicy weightedRoundRobinDynamicQueuePolicy() {
    return new WeightedRoundRobinDynamicQueuePolicy(labelPrefix, Map.of("Tenant-A", 5));
}
```
<figcaption>A DynamicQueuePolicy bean is created where we again add the label prefix 'tenant:'.<br/>'Tenant-A' is configured with a weight of 5 meaning that it will get 5 times more resources than other tenants.</figcaption>
</figure>


### Usage
Using dynamic queues could not have been easier thanks to Job Labels:

__Using the `@Job` annotation__:

<figure>

```java
@Job(name = "Job %1 for %0", labels = {"tenant:%0", "slow-job"})
public void runBackgroundWork(String tenant, int index) {
    // business code here
}
```
<figcaption>We can use the @Job annotation and note how we re-use the previously configured label prefix 'tenant:'.<br/>This can be done both hardcoded or dynamic by means of a placeholder in the label, like in this example.</figcaption>
</figure>


__Using the `JobBuilder` pattern__:

If you prefer the `JobBuilder` pattern, this is also really easy:
<figure>

```java
jobScheduler.create(aJob()
    .withName("Job " + i + " for tenant " + tenant)
    .withLabels("tenant:" + tenant)
    .withDetails(() -> myService.runBackgroundWork(input)))
```
<figcaption>We can use the JobBuilder to create a Job and assign it a label.<br/>Note how we re-use the previously configured label prefix 'tenant:'.</figcaption>
</figure>

<br/>

{{< trial-button >}}