---
version: "pro"
title: "Dynamic Queues"
subtitle: "Dynamic Queues - also knows as load-balancing or multi-tenancy support - guarantees some fair-use!"
keywords: ["dynamic queues", "load balancing", "multi tenancy support", "priority queues", "multi tenant application", "types of load balancing", "multitenant application", "multi tenant system", "example of multi tenant application", "multitenant applications", "weighted round robin load balancing", "load balancer spring boot", "load balancer spring", "loadbalancing", "fixed size", "lenient"]
date: 2020-08-27T11:12:23+02:00
layout: "documentation"
menu: 
  sidebar:
    identifier: load-balancing
    parent: 'jobrunr-pro'
    weight: 4.7
---
{{< trial-button >}}

Are you running a multi-tenant application? Or do you have diverse types of jobs where certain types of jobs could potentially trigger peak workloads? Use JobRunr's built-in dynamic queues to make sure that there is some fair-use and all jobs get a fair amount of resources!

{{< demo-callout step="11" label="Fair Play" >}}

> [!NOTE]
> JobRunr Pro supports unlimited dynamic queues and they can be used together with the [priority queues]({{< ref "/documentation/pro/priority-queues.md" >}}).

## Example Use Cases
- In a **multi-tenant application** where each tenant can initiate their own jobs, JobRunr ensures fair-use processing. Regardless of whether one tenant generates millions of jobs, the system guarantees that jobs from other tenants are also duly processed.
- In a **diverse workload environment**, certain jobs, such as mass mailings, could potentially trigger surges by generating millions of subsidiary child jobs that require processing. However, it's crucial that other types of jobs remain unaffected by these spikes and continue to be processed smoothly.


## Load-balancing types
JobRunr supports four different types of load-balancing:
- **Round Robin Dynamic Queues**: here, each dynamic queue receives the same amount of resource usage
- **Weighted Round Robin Dynamic Queues**: here, certain dynamic queues can be configured with an optional weight. A queue with a weight of 2 will be checked twice as often as a queue with a weight of 1.
- **Fixed Worker Size Dynamic Queues**: here, a certain number of workers are reserved, so only jobs from the assigned queue can run on those reserved workers. Could be of use when you want some of your jobs to run as soon as they are enqueued, without waiting for other jobs enqueued earlier to finish processing.
- **Lenient Fixed Worker Size Dynamic Queues**: here, a certain number of workers are reserved, so only jobs from the assigned queue can run on those reserved workers. If there are more jobs than reserved workers, workers from the unreserved pool will run the extra jobs when possible.

## Dashboard
If you're using this feature, you can also enable an extra Dynamic Queues view in the dashboard. This view gives an immediate overview of the amount of jobs per dynamic queue.

![](/documentation/dynamic-queues.png "An overview of all the different dynamic queues")

## Configuration
### Round Robin Dynamic Queues

With round robin, each dynamic queue receives the same amount of resource usage. This means that on average, JobRunr processes the same amount of jobs from all dynamic queues.

#### Configuring Round Robin Dynamic Queues by means of the Fluent API
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

#### Configuring Round Robin Dynamic Queues by means of Spring Boot Properties
You can also enable the round robin dynamic queues easily via Spring properties:

<figure>

```java
jobrunr.jobs.dynamic-queue.round-robin.label-prefix=tenant: 
jobrunr.jobs.dynamic-queue.round-robin.title=Tenants
```
</figure>


### Weighted Round Robin Dynamic Queues

With weighted round robin, certain dynamic queues can be configured with an optional weight. A queue `A` with a weight of 2 will be checked twice as often as a queue `B` with a weight of 1. This means that on average, JobRunr processes twice as many jobs for queue `A` compared to queue `B`.

#### Configuring Weighted Round Robin Dynamic Queues by means of the Fluent API

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

#### Configuring Weighted Round Robin Dynamic Queues by means of Spring Boot Properties

You can also enable the weighted round robin dynamic queues easily via properties:

<figure>

```
jobrunr.jobs.dynamic-queue.weighted-round-robin.label-prefix=tenant:
jobrunr.jobs.dynamic-queue.weighted-round-robin.title=Tenants
jobrunr.jobs.dynamic-queue.weighted-round-robin.queues.tenantB=5
```

You can also create the configuration programatically by creating a `dynamicQueuePolicy` bean yourself in the same vein as the one passed in in the above Fluent API example.

### Fixed amount of reserved workers

With fixed amount of reserved workers, only jobs from the assigned queue can run on those reserved workers. Could be of use when you want some of your jobs to run as soon as they are enqueued, without waiting for other jobs enqueued earlier to finish processing.

> [!NOTE]
> When you reserve workers for certain jobs, those jobs are restricted to their dedicated workers and won’t run on unreserved ones. This effectively caps how many of those jobs a server can process at the same time. If you want them to also use unreserved workers when capacity is available, use the lenient variant.
You can reserve a fix amount of workers for different queues using the fluent API or properties as follows:

#### Fluent API

{{< codeblock title="Notice the `FixedSizeWorkerPoolDynamicQueuePolicy` where we add the label prefix `tenant`. We've reserved 9 workers out of 20. We also enable the extra Dynamic Queue view in the dashboard and name it 'Tenants'">}}
```java
JobRunrPro.configure()
    .useStorageProvider(SqlStorageProviderFactory.using(dataSource))
    .useBackgroundJobServer(usingStandardBackgroundJobServerConfiguration()
            .andWorkerCount(20)
            .andDynamicQueuePolicy(new FixedSizeWorkerPoolDynamicQueuePolicy("tenant:", Map.of("Tenant-A", 6, "Tenant-B", 3)))
    .useDashboard(usingStandardDashboardConfiguration()
            .andDynamicQueueConfiguration("Tenants", "tenant:"))
    .initialize();
```
{{</ codeblock >}}

#### Properties (Spring Boot)

<figure>

```java
jobrunr.jobs.dynamic-queue.fixed-worker-pool-size.queues.Tenant-A=6
jobrunr.jobs.dynamic-queue.fixed-worker-pool-size.queues.Tenant-B=3
jobrunr.jobs.dynamic-queue.fixed-worker-pool-size.label-prefix=tenant:
jobrunr.jobs.dynamic-queue.fixed-worker-pool-size.title=Tenants
```
</figure>

<figure>

```
jobrunr.jobs.dynamic-queue.weighted-round-robin.label-prefix=tenant:
jobrunr.jobs.dynamic-queue.weighted-round-robin.title=Tenants
jobrunr.jobs.dynamic-queue.weighted-round-robin.queues.tenantB=5
```

You can also create the configuration programatically by creating a `dynamicQueuePolicy` bean yourself in the same vein as the one passed in in the above Fluent API example.

### Lenient fixed amount of reserved workers

With a _lenient_ fixed number of reserved workers, job processing behaves the same as the strict variant, except that jobs with dedicated workers can also run on unreserved workers when capacity is available.

You can reserve a lenient fix amount of workers for different queues using the fluent API or properties as follows:

#### Fluent API

{{< codeblock title="Notice the `LenientFixedSizeWorkerPoolDynamicQueuePolicy` where we add the label prefix `tenant`. We've reserved 9 workers out of 20. We also enable the extra Dynamic Queue view in the dashboard and name it 'Tenants'">}}
```java
JobRunrPro.configure()
    .useStorageProvider(SqlStorageProviderFactory.using(dataSource))
    .useBackgroundJobServer(usingStandardBackgroundJobServerConfiguration()
            .andWorkerCount(20)
            .andDynamicQueuePolicy(new LenientFixedSizeWorkerPoolDynamicQueuePolicy("tenant:", Map.of("Tenant-A", 6, "Tenant-B", 3)))
    .useDashboard(usingStandardDashboardConfiguration()
            .andDynamicQueueConfiguration("Tenants", "tenant:"))
    .initialize();
```
{{</ codeblock >}}

#### Properties (Spring Boot)

<figure>

```java
jobrunr.jobs.dynamic-queue.lenient-fixed-worker-pool-size.queues.Tenant-A=6
jobrunr.jobs.dynamic-queue.lenient-fixed-worker-pool-size.queues.Tenant-B=3
jobrunr.jobs.dynamic-queue.lenient-fixed-worker-pool-size.label-prefix=tenant:
jobrunr.jobs.dynamic-queue.lenient-fixed-worker-pool-size.title=Tenants
```
</figure>

## Usage
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
<figcaption>We can use the JobBuilder to create a Job and assign it a label.<br/>Note how we re-use the previously configured label prefix `tenant:`.</figcaption>
</figure>

<br/>

{{< trial-button >}}
