---
title: Autoscale your JobRunr application deployed on Kubernetes
description: This guide will help you use Jobrunr Pro features to create a Kubernetes deployment of your application that autoscales based on JobRunr provided metrics.
weight: 10
tags:
    - Autoscaling
    - JobRunr Pro
    - KEDA
    - Kubernetes
hideFrameworkSelector: true
draft: true
---

[Autoscaling](https://en.wikipedia.org/wiki/Autoscaling) is a method used to dynamically adjust the resources allocated to a cloud application based on some metrics. Typically, scaling is done based on CPU or memory usage, but in the context of task scheduling and background job processing, we may be interested in scaling based on the number of jobs in the queue, the time they spend in the queue, etc. JobRunr Pro provides the advanced metrics to enable efficient autoscaling of your application.  

In this guide, we'll show you how to autoscale your [Kubernetes](https://kubernetes.io/)-managed JobRunr Pro applications using [KEDA](https://keda.sh/), a K8s-based event driven autoscaler. You will learn 
- how to set up KEDA to enable autoscaling of your JobRunr Pro applications on Kubernetes
- how to configure autoscaling triggers based on JobRunr Pro metrics such as workers' usage, job queue latency, and scheduled jobs count.

## Prerequisites
- JobRunr Pro 8.0.0 or later
- You already know how to configure JobRunr
- Basic knowledge of Kubernetes
- A working Kubernetes cluster

## Why you should use JobRunr metrics to autoscale
Using JobRunr metrics for autoscaling ensures that your application scales dynamically based on real-time job processing needs. Unlike traditional autoscaling methods that rely solely on CPU or memory usage, JobRunr metrics allow you to scale based on specific workload factors such as workers' usage, job queue latency, and scheduled jobs count.  
If configured properly, this approach helps ensure efficient resource utilization and faster job processing, leading to better application performance and potential cost savings.

## Setup
You can follow this guide step-by-step to deploy and configure autoscaling for your existing JobRunr application on Kubernetes. If you're new to JobRunr, you can begin by following [this guide]({{<ref "guides/intro/java-lambda.md">}}) to learn how to include and use it in your project. We assume you already know how to deploy your application on Kubernetes (otherwise check out the [Kubernetes basics](https://kubernetes.io/docs/tutorials/kubernetes-basics/)).

In case you prefer to get straight to the solution, you can view the code from this guide [here]({{<ref "#finished-example">}}).

### Kubernetes deployment
To run your application in the cluster with the autoscaling capability, we will need to deploy several services:
- [KEDA](https://keda.sh/) for autoscaling functionality,
- any [database supported by JobRunr]({{<ref "documentation/installation/storage/_index.md">}}),
- your application running JobRunr.

First, deploy your JobRunr application. You will need to enable the dashboard to use the [JobRunr Pro metrics API](#jobrunr-pro-metrics-api) which is going to be used to trigger autoscaling. You can deploy the background job server together with the dashboard or separately but make sure that the metrics API is always available for KEDA to fetch the metrics. 
For the purposes of this guide, we've deployed a simple Spring Boot application that allows us to schedule mock jobs via the `/schedule-example-jobs` endpoint.

Our setup consists of 2 deployments:
- `web` - which exposes the JobRunr dashboard on port `8000` and an API to schedule jobs on port `8080`
- `workers` - which enables background job server for background task processing

> The separation of the `web` and the `workers` is there to enable us to scale those two different parts separately. The dashboard deployment can be scaled independently to handle varying levels of user traffic without affecting the job processing capabilities. Similarly, the `BackgroundJobServer` can scale based on job queue metrics, ensuring optimal job processing efficiency.  This separation ensures that even if no `BackgroundJobServers` are currently running, scheduled jobs will still be processed as the autoscaling configuration will start a new `BackgroundJobServer` on demand.

We have also created a [Service](https://kubernetes.io/docs/concepts/services-networking/service/) object called `jobrunr-service` that exposes ports of the `web` deployment, enabling access to the dashboard and API from outside of the cluster. Additionally, we deployed [PostgreSQL](https://www.postgresql.org/) as our database.  
<!-- TODO: change github url -->
You can see all the deployment files we used [here](https://github.com/dumnicki/example-k8s-scaling/tree/main/k8s).

Next, you can deploy KEDA in your Kubernetes cluster by executing the following command:
```
kubectl apply --server-side -f https://github.com/kedacore/keda/releases/download/v2.14.0/keda-2.14.0-core.yaml
```

> For further deployment options, you may refer to the [official KEDA guide](https://keda.sh/docs/latest/deploy).

Now, we are ready to configure the autoscaling behavior.

## Configuring autoscaling
To configure the scaling of our application, we define a [ScaledObject](https://keda.sh/docs/latest/concepts/scaling-deployments/#scaledobject-spec). Create a YAML file for our scaling configuration, we'll call it `keda-scaling.yaml`:
<figure style="width: 100%; max-width: 100%; margin: 0">

```yaml
apiVersion: keda.sh/v1alpha1
kind: ScaledObject
metadata:
  name: jobrunr-scaling
spec:
  scaleTargetRef:
    name: workers
  pollingInterval:  30
  cooldownPeriod:   300
  minReplicaCount:  0
  maxReplicaCount:  10
```
</figure>

Let's take a look at the specification inside the `spec` section. The property `scaleTargetRef` points to the name of the deployment we want to scale. We can specify how often KEDA should fetch metrics from JobRunr by changing the `pollingInterval`. The `cooldownPeriod` property defines, after how many seconds of all triggers being inactive (based on `activationTargetValue`), scaling to 0 should happen (takes effect only when `minReplicaCount` is set to 0). Finally, the `minReplicaCount` and `maxReplicaCount` properties specify the minimal and maximal number of replicas our app can scale to.

> Warning! Be careful setting `minReplicaCount` to 0, as it might cause problems with executing recurring jobs. See the [considerations section]({{<ref "#limitations-and-considerations">}}).

For more configuration options, you can check the [KEDA documentation](https://keda.sh/docs/latest/concepts/scaling-deployments/#scaledobject-spec).

Next, we define [triggers](https://keda.sh/docs/latest/concepts/scaling-deployments/#triggers) inside the `spec` section of the KEDA autoscaling specification. Each `trigger` specifies which metric is used to trigger scaling.  

### Workers' usage
Imagine you are running an e-commerce platform that processes a large number of background tasks, such as order processing, email notifications, and data synchronization. During peak shopping hours, the number of tasks increases dramatically, leading to high demand on your job processing infrastructure. Conversely, during off-peak hours, the workload significantly decreases.

By configuring an autoscaling trigger based on workers' usage, you can dynamically adjust the number of job processing instances in your Kubernetes cluster. When the workers' usage exceeds a certain threshold (e.g., 80%), indicating that the system is under heavy load, KEDA will automatically scale up the number of instances to handle the increased workload. Conversely, when the workers' usage drops below the threshold, indicating reduced demand, the system will scale down to conserve resources.

To handle such a case, we can configure KEDA to scale based on the workers' usage metric. In this example, we set the target utilization of workers to be 80%. The workers' usage is exposed by [JobRunr Pro metrics API]({{<ref "#jobrunr-pro-metrics-api">}}), we can use the provided endpoint in our configuration below.
<figure style="width: 100%; max-width: 100%; margin: 0">

```yaml
# ... your other configs
spec:
  # ... your other specs
  triggers:
    # ... your other triggers
    - type: metrics-api
      metricType: Value
      metadata:
        targetValue: "0.8"
        activationTargetValue: "0.0"
        format: "json"
        url: "http://jobrunr-service.default:8000/api/metrics/workers"
        valueLocation: "usage"
```
</figure>

Let's briefly explain what this config means.  
In this setup, we are using REST endpoints to fetch our metrics, so we use the `metrics-api` type of trigger. The property `metricType: Value` specifies that the target value is independent of the number of pods. What is the most interesting to us is the `metadata` section. There we specify:  
- `targetValue` - the desired value of the metric,  
- `activationTargetValue` - the threshold on which to scale from and to 0 replicas,  
- `format` - the format of the response from the specified url,  
- `url` - the endpoint from which to fetch the metric,  
- `valueLocation` - the field name of the metric of interest in the retrieved JSON object.

### Scheduled jobs metrics
Consider a data analytics platform that processes large batches of data at scheduled intervals. For instance, an organization might collect and process sales data from various sources every hour to generate real-time sales reports for management. By configuring an autoscaling trigger based on the number of scheduled jobs, you can ensure that your Kubernetes cluster scales up in anticipation of these data processing tasks. If a significant number of jobs are scheduled to run soon, the system can proactively allocate more resources to handle the increased workload efficiently, ensuring timely and accurate reporting.

Conversely, when there are fewer scheduled data processing jobs, the system can scale down to conserve resources and reduce operational costs. This dynamic scaling based on scheduled jobs metrics ensures that your data processing pipeline remains responsive and efficient, regardless of workload fluctuations. This approach helps maintain optimal performance and cost-efficiency, ensuring critical tasks are completed on time and improving overall system reliability.

For this example we configure the mentioned trigger to ensure that there are on average 8 jobs per pod that are scheduled in 2 minutes. This configuration is shown below.
<figure style="width: 100%; max-width: 100%; margin: 0">

```yaml
# ... your other configs
spec:
  # ... your other specs
  triggers:
    # ... your other triggers
    - type: metrics-api
      metricType: AverageValue
      metadata:
        targetValue: "8"                                      # 8 scheduled jobs per pod
        activationTargetValue: "0"                            # activate when scheduled jobs > 0
        format: "json"
        url: "http://jobrunr-service.default:8000/api/metrics/jobs/scheduled?scheduledIn=PT2M"
        valueLocation: "count"
```
</figure>

It specifies that we are targeting to have 8 scheduled jobs per pod. We are interested in jobs that will run in the next 2 minutes. Here we use `metricType: AverageValue` to specify that the `targetVaue` is per pod (e.g., having 2 pods and 10 scheduled jobs, we get value 5 per pod, so we are below the `targetValue` of 8).

> Using the scheduled jobs metrics can be useful in a situation where we want to quickly process a large batch of jobs that are scheduled for some time in the future. We look 2 minutes ahead, and we already start creating pods to be ready when those jobs execute. Afterward, we scale down to save resources.  

### Enqueued jobs metrics
Consider a financial services platform that processes real-time transactions and updates user accounts. Ensuring quick task completion is critical for accurate balances and timely confirmations. By configuring an autoscaling trigger based on enqueued jobs latency, you can dynamically scale your Kubernetes cluster to reduce processing delays. If job latency exceeds a threshold (e.g., 5 minutes), the system scales up to handle the backlog efficiently.

Conversely, when job latency is low, the system scales down to conserve resources and cut costs. This dynamic scaling ensures your platform remains responsive and efficient, even during peak periods, preventing bottlenecks and optimizing resource use for critical financial operations.

In this case, our example includes a trigger that monitors when the latency of enqueued jobs exceeds 5 minutes in order to scale up. Let's add this trigger to the `triggers` section. Its configuration is below.
<figure style="width: 100%; max-width: 100%; margin: 0">

```yaml
# ... your other configs
spec:
  # ... your other specs
  triggers:
    # ... your other triggers
    - type: metrics-api
      metricType: Value
      metadata:
        targetValue: "300"                                    # max 5 min latency
        activationTargetValue: "0"                            # activate when jobs have > 0 latency
        format: "json"
        url: "http://jobrunr-service.default:8000/api/metrics/jobs/enqueued"
        valueLocation: "latency"
```
</figure>

This trigger is defining that we want to scale up if there are jobs that are waiting in queue for more than 5 minutes.  

> Beware of the artificial latency that might be introduced by using [mutexes]({{<ref "documentation/pro/mutexes/_index.md">}}) or [priority queues]({{<ref "documentation/pro/priority-queues/_index.md">}}). You can always specify the priority of the queue you are interested in by adding the `priority` parameter in the enqueued jobs metrics url, see [JobRunr Pro metrics API]({{<ref "#jobrunr-pro-metrics-api">}}) for more info.

### Applying the autoscaling configuration
Now, all that is left to do is applying our autoscaling configuration to the Kubernetes cluster:
```
kubectl apply -f k8s/keda-scaling.yaml
```
Congratulations! Your app is now autoscaling based on the 3 metrics we specified! Let's verify it in the next section.

> To learn more about KEDA autoscaling and see more advanced options, visit the [KEDA documentation](https://keda.sh/docs/latest/concepts/scaling-deployments/).


## Testing the autoscaling
It's time to see the autoscaler in action! We have defined three triggers, and when any of these triggers meet the criteria, KEDA will start scaling. The Horizontal Pod Autoscaler ([HPA](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/)), which drives the scaling, will process the proposed replica counts for each trigger and use the highest one to scale the workload to. 

Before we start, let us forward our application ports to localhost by executing this command:
```
kubectl port-forward svc/jobrunr-service 8000 8080
```
Now the JobRunr dashboard and metrics API are available at [http://localhost:8000/](http://localhost:8000/), and our API for scheduling sample jobs is located at [http://localhost:8080/](http://localhost:8080/).

Let's open the JobRunr dashboard in the web browser: [http://localhost:8000/dashboard](http://localhost:8000/dashboard).

If it's your first time running the application, you will be prompted to input your JobRunr Pro license key.

First, look at the servers list on the dashboard [http://localhost:8000/dashboard/servers](http://localhost:8000/dashboard/servers). You should see `no servers found`. This is because we specified `minReplicaCount` to be 0. There are no pods running `BackgroundJobServers`. 

Now let's schedule 40 jobs to run in 2 minutes by calling [http://localhost:8080/schedule-example-jobs?count=40&runIn=PT2M](http://localhost:8080/schedule-example-jobs?count=40&runIn=PT2M). With the configuration we specified, our target is 8 jobs per pod. KEDA will scale up our deployment to match it. We can see the current pods with the following command:
```
kubectl get pods
```
We will get an output similar to this:
```
NAME                                 READY   STATUS              RESTARTS   AGE
postgres-f879f4c78-6xhpg             1/1     Running             0          121m
web-74db64f488-spv5g                 1/1     Running             0          121m
workers-854f975c57-2pmds             0/1     ContainerCreating   0          1s
workers-854f975c57-fgrlz             0/1     ContainerCreating   0          1s
workers-854f975c57-n49bx             0/1     ContainerCreating   0          2s
workers-854f975c57-t9wvw             0/1     ContainerCreating   0          1s
workers-854f975c57-vbdjr             0/1     ContainerCreating   0          1s
```
Great! We see there are 5 new pods being created. After around 1 minute, the servers should announce themselves and will be visible in the JobRunr dashboard.

<figure style="width: 100%; max-width: 100%">
    <img src="/documentation/k8s-autoscaling-servers.gif" class="kg-image">
    <figcaption>JobRunr Pro dashboard showing autoscaling in action (the GIF is accelerated)</figcaption>
</figure>


Once it's time for our scheduled jobs to execute, they'll be queued and then processed. Now the workers' usage metric kicks in! As we have 40 jobs and only 20 total workers, we will see 100% workers' usage throughout the processing of all the jobs. After 30 seconds (poll interval), we can observe another pod being created to match our specified 80% workers' usage target.

If we wait 5 minutes and don't schedule any new jobs, our deployment will scale back to 0.

## Autoscaling your secured JobRunr dashboard
Securing your JobRunr dashboard is explained in detail in the [authentication guides](guides/authentication/_index.md). KEDA inside your Kubernetes cluster can still access the secured metrics API, but it requires some additional configuration. This is described in detail in the [KEDA documentation](https://keda.sh/docs/2.14/concepts/authentication/).

## Limitations and considerations
Deploying a distributed application with enabled autoscaling might be tricky. There are some corner cases that are not be obvious at first. Moreover, Kubernetes comes with some limitations that we should be aware of.

### Minimum replica count
Pay an extra attention when setting `minReplicaCount` property to 0. When no pods are running, workers' usage will always be 0 so to scale from 0 this metric has to be used with at least one additional metric (e.g. latency of enqueued jobs + workers usage). No recurring jobs can be executed if no `BackgroundJobServers` are running. You should always have 1 `BackgroundJobServer` running in your cluster, as it is responsible for checking if any jobs need to be processed.

### Long-running jobs
If you are planning to run jobs with long execution times, you might want to prevent Kubernetes from terminating your replicas that are still processing a long-running job. To do that, you can modify the graceful termination period for your pods in Kubernetes. This can be done by setting the `terminationGracePeriodSeconds` property in your Pod `spec`. You'll also have to configure the duration to wait before interrupting jobs in JobRunr. 

The termination period of both Kubernetes and JobRunr can be determined by the maximum expected runtime of your jobs. Imagine your longest running job takes 1 hour to complete. Then your graceful period should be greater than the execution time of that job, for example an 1 hour and 30 minutes.

You can configure your deployment as follows:
<figure style="width: 100%; max-width: 100%; margin: 0">

```yaml
apiVersion: apps/v1
kind: Deployment
# ... your other configs
spec:
    # ... your other specs
    template:
        # ... your other templates configs
        spec:
            # ... your other template specs
            terminationGracePeriodSeconds: 5400
```
</figure>

Similarly, a termination period would also have to be configured for JobRunr. There are multiple different options to [configure JobRunr](/documentation/configuration/). Since we are using the `jobrunr-pro-spring-boot-3-starter` dependency, we can add the following property to the `application.properties`:
<figure style="width: 100%; max-width: 100%; margin: 0">

```properties
org.jobrunr.background-job-server.interrupt-jobs-await-duration-on-stop=90m
```
</figure>

> Important thing to note here, is that the Kubernetes termination period should match or be larger than the JobRunr one. This will ensure a safe interruption of the jobs and graceful termination of the JobRunr. If you are curious about how Kubernetes terminates the Pods, you can follow [this link](https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/#pod-termination).

### Poll interval
The workers' usage is updated at every [background job server poll interval](documentation/configuration/spring#advanced-configuration). Therefore, setting a shorter poll interval in HPA when using only workers' usage metric is not going to increase the frequency of workers' usage updates.

## Autoscaling your secured JobRunr dashboard
Securing your JobRunr dashboard is explained in detail in the [authentication guides](guides/authentication/_index.md). KEDA inside your Kubernetes cluster can still access the secured metrics API, but it requires some additional configuration. This is described in detail in the [KEDA documentation](https://keda.sh/docs/2.14/concepts/authentication/).

## Conclusion
In this guide, we’ve learned how to set up autoscaling in Kubernetes using KEDA and use the JobRunr Pro metrics API to create the scaling triggers.

### Finished example
<!-- TODO: Change the github url -->
The example app and k8s deployment files that we created in this guide are available in our [github repository](https://github.com/dumnicki/example-k8s-scaling).

---

<!-- TODO: This API reference should be moved to documentation -->
## JobRunr Pro metrics API
JobRunr Pro allows us to access metrics that can be used for autoscaling. This is an overview of them:
### Get Enqueued Jobs Metrics
`GET /api/metrics/jobs/enqueued?priority=[integer]`

**Query parameters**: 
- `priority` get metrics only for jobs with a specified priority.

#### Response content example
<figure style="width: 100%; max-width: 100%; margin: 0">

```json
{
    "latency":500,
    "count":10
}
```
</figure>

- `latency` - time the oldest Job has spent in the queue in seconds.

- `count` - number of jobs in the queue.

### Get Scheduled Jobs Metrics
`GET /api/metrics/jobs/scheduled?scheduledIn=[string]&priority=[integer]` 

**Query parameters**: 
- `scheduledIn` ISO-8601 duration format, get metrics for jobs scheduled to run in specified time at the latest. By default, we only count jobs that are scheduled to run no later than 1 minute from now.
- `priority` get metrics only for jobs with a specified priority.

#### Response content example
<figure style="width: 100%; max-width: 100%; margin: 0">

```json
{
    "count":10
}
```
</figure>

- `count` - number of jobs scheduled to run in max `scheduledIn` time.

### Get Workers Metrics
`GET /api/metrics/workers` 

#### Response content example
<figure style="width: 100%; max-width: 100%; margin: 0">

```json
{
    "usage":0.25,
    "totalWorkers":8,
    "occupiedWorkers":2
}
```
</figure>

- `usage` - percentage value of total usage of workers.

- `totalWorkers` - total number of workers across all `BackgroundJobServers`.

- `occupiedWorkers` - number of occupied workers.