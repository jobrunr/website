---
title: Autoscale your JobRunr application deployed on Kubernetes
description: This guide will help you utilize Jobrunr Pro features to create a Kubernetes deployment of your application that autoscales based on JobRunr metrics.
weight: 10
tags:
    - Autoscaling
    - JobRunr Pro
    - KEDA
    - Kubernetes
    - Spring Boot
hideFrameworkSelector: true
---

[Autoscaling](https://en.wikipedia.org/wiki/Autoscaling) is a method used to dynamically adjust the resources allocated to the cloud application based on some metrics. Typically, scaling is done based on CPU or memory usage, but in the context of task scheduling and background job processing, we may be interested in scaling based on the number of jobs in the queue, the time they spend in the queue, etc. JobRunr Pro provides the advanced metrics to enable efficient autoscaling of your application.  
In this guide, we'll show you how to autoscale your [Kubernetes](https://kubernetes.io/)-managed JobRunr Pro applications using [KEDA](https://keda.sh/), a K8s-based event driven autoscaler.

## What you will learn
You will learn how to set up [KEDA](https://keda.sh/) to enable autoscaling of your JobRunr Pro applications on Kubernetes. You will also configure autoscaling triggers based on JobRunr Pro metrics such as workers' usage, job queue latency, and scheduled jobs count. 

## Why you should use JobRunr metrics to autoscale
Using JobRunr metrics for autoscaling ensures that your application scales dynamically based on real-time job processing needs. Unlike traditional autoscaling methods that rely solely on CPU or memory usage, JobRunr metrics allow you to scale based on specific workload factors such as workers' usage, job queue latency, and scheduled job count.  
This approach leads to more efficient resource utilization, faster job processing, and improved application performance, ultimately resulting in cost savings and a better user experience.

## Prerequisites
- JobRunr Pro 8.0.0 or later
- You already know how to configure JobRunr
- Basic knowledge of Kubernetes
- A working Kubernetes cluster

> In this guide, we will be working locally using [Minikube](https://minikube.sigs.k8s.io/). If you use a different Kubernetes setup, some steps might differ, and you may skip any `minikube` commands.

## Setup
You can follow this guide step-by-step to deploy your existing JobRunr application. If you want to learn how to include and use JobRunr in your project, follow [this guide]({{<ref "guides/intro/java-lambda.md">}}) first.  
We assume you already know how to deploy your application on Kubernetes.  
In case you prefer to get straight to the solution, you can view the code from this guide [here]({{<ref "#finished-example">}}).

### Kubernetes deployment
To run your application in the cluster with the autoscaling capability, we will need to deploy several services:
- [KEDA](https://keda.sh/) for autoscaling functionality,
- any [database supported by JobRunr]({{<ref "documentation/installation/storage/_index.md">}}),
- your application running JobRunr dashboard and your application running JobRunr `BackgroundJobServer`.

Besides that, we will create a [ScaledObject](https://keda.sh/docs/latest/concepts/scaling-deployments/#scaledobject-spec), which lets us configure the autoscaling behavior.  

First deploy KEDA in your Kubernetes cluster by executing the following command:
```
kubectl apply --server-side -f https://github.com/kedacore/keda/releases/download/v2.14.0/keda-2.14.0-core.yaml
```

> For other options to deploy KEDA, follow the [official guide](https://keda.sh/docs/latest/deploy).

Next, deploy your JobRunr application. For the purposes of this guide, we've deployed a simple Spring Boot application that allows us to schedule mock jobs via the `/schedule-example-jobs` endpoint.  
Our setup consists of 2 deployments:
- **jobrunr-dashboard** - which has enabled JobRunr dashboard exposed on the port `8000` and exposes job scheduling api on port `8080`
- **jobrunr-example** - which has JobRunr dashboard disabled and has background job server enabled

> The separation of the **dashboard** and the **background job server** is there to enable us to scale those two different parts separately. The dashboard deployment can be scaled independently to handle varying levels of user traffic without affecting the job processing capabilities. Similarly, the BackgroundJobServer can scale based on job queue metrics, ensuring optimal job processing efficiency.  
This separation also allows us to schedule jobs when no BackgroundJobServers are running, which together with the configured autoscaling will start a BackgroundJobServer on demand.

There is also a service called `jobrunr-service` that exposes ports of **jobrunr-dashboard**.  
We also chose to deploy PostgreSQL for our database.  
<!-- TODO: change github url -->
You can see all the deployment files we used [here](https://github.com/dumnicki/example-k8s-scaling/tree/main/k8s).

## Configuring autoscaling
To configure the scaling of our application, we define a [ScaledObject](https://keda.sh/docs/latest/concepts/scaling-deployments/#scaledobject-spec). Create the `keda-scaling.yaml` file in the k8s directory:
<figure style="width: 100%; max-width: 100%; margin: 0">

```yaml
apiVersion: keda.sh/v1alpha1
kind: ScaledObject
metadata:
  name: jobrunr-scaling
spec:
  scaleTargetRef:
    name: jobrunr-example
  pollingInterval:  30                                      # Optional. Default: 30 seconds
  cooldownPeriod:   300                                     # Optional. Default: 300 seconds
  minReplicaCount:  0                                       # Optional. Default: 0
  maxReplicaCount:  10                                      # Optional. Default: 100
```
</figure>

Let's take a look at the specification inside the `spec` section.  
The property `scaleTargetRef` points to the name of the deployment we want to scale.  
We can specify how often KEDA should fetch metrics from JobRunr by changing the `pollingInterval`.  
The `cooldownPeriod` property defines, after how many seconds of all metrics being 0, scaling to `minReplicaCount` should happen.  
Properties `minReplicaCount` and `maxReplicaCount` specify the minimal and maximal number of replicas our app can scale to.

> Warning! Be careful setting `minReplicaCount` to 0, as it might cause problems with executing recurring jobs. See the [considerations section]({{<ref "#limitations-and-considerations">}}).

Next, we define [triggers](https://keda.sh/docs/latest/concepts/scaling-deployments/#triggers) inside the spec section. Each `trigger` specifies which metrics trigger scaling.  

### Workers' usage
Imagine you are running an e-commerce platform that processes a large number of background tasks, such as order processing, email notifications, and data synchronization. During peak shopping hours, the number of tasks increases dramatically, leading to high demand on your job processing infrastructure. Conversely, during off-peak hours, the workload significantly decreases.

By configuring an autoscaling trigger based on workers' usage, you can dynamically adjust the number of job processing instances in your Kubernetes cluster. When the workers' usage exceeds a certain threshold (e.g., 80%), indicating that the system is under heavy load, KEDA will automatically scale up the number of instances to handle the increased workload. Conversely, when the workers' usage drops below the threshold, indicating reduced demand, the system will scale down to conserve resources.

We want to specify the target utilization of workers to be 80%.  
We get the workers' usage metrics from [JobRunr Pro metrics api]({{<ref "#jobrunr-pro-metrics-api">}}) and so we use the specific enpoint in our configuration below. 
<figure style="width: 100%; max-width: 100%; margin: 0">

```yaml
...
spec:
  ...
  triggers:
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

Let's briefy explain what this config means.  
We are using REST endpoints to fetch our metrics, so we use the `metrics-api` type of trigger.  
The property `metricType: Value` specifies this is the total value, i.e. the target value is independent of the number of pods.  
In the `metadata` section, we specify:  
`targetValue` - the optimal value of the metric,  
`activationTargetValue` - threshold on which to scale to and from 0 replicas,  
`format` - format of the response from the specified url,  
`url` - endpoint from which we fetch the metric,  
`valueLocation` - location of the metrics property inside the json response that we are interested in.

### Scheduled jobs metrics
Consider a data analytics platform that processes large batches of data at scheduled intervals. For instance, an organization might collect and process sales data from various sources every hour to generate real-time sales reports for management. By configuring an autoscaling trigger based on the number of scheduled jobs, you can ensure that your Kubernetes cluster scales up in anticipation of these data processing tasks. If a significant number of jobs are scheduled to run soon, the system can proactively allocate more resources to handle the increased workload efficiently, ensuring timely and accurate reporting.

Conversely, when there are fewer scheduled data processing jobs, the system can scale down to conserve resources and reduce operational costs. This dynamic scaling based on scheduled jobs metrics ensures that your data processing pipeline remains responsive and efficient, regardless of workload fluctuations. This approach helps maintain optimal performance and cost-efficiency, ensuring critical tasks are completed on time and improving overall system reliability.  
Let's configure the trigger as below.
<figure style="width: 100%; max-width: 100%; margin: 0">

```yaml
...
    - type: metrics-api
      metricType: AverageValue
      metadata:
        targetValue: "8"                                      # 8 scheduled jobs per pod
        activationTargetValue: "0"                            # activate when scheduled jobs > 0
        format: "json"
        url: "http://jobrunr-service.default:8000/api/metrics/jobs/scheduled?runInMax=PT2M"
        valueLocation: "count"
```
</figure>

It specifies that we are targeting having 8 scheduled jobs per pod. We are interested in jobs that will run in the next 2 minutes.  
Here we use `metricType: AverageValue` to specify that the `targetVaue` is per pod (e.g., having 2 pods and 10 scheduled jobs, we get value 5 per pod, so we are below the targetValue of 8).

> Using the scheduled jobs metrics can be useful in a situation where we want to quickly process a large batch of jobs that are scheduled for some time in the future. We look 2 minutes ahead, and we already start creating pods to be ready when those jobs execute. Afterward, we scale down to save resources.  

### Enqueued jobs metrics
Consider a financial services platform that processes real-time transactions and updates user accounts. Ensuring quick task completion is critical for accurate balances and timely confirmations. By configuring an autoscaling trigger based on enqueued jobs latency, you can dynamically scale your Kubernetes cluster to reduce processing delays. If job latency exceeds a threshold (e.g., 5 minutes), the system scales up to handle the backlog efficiently.

Conversely, when job latency is low, the system scales down to conserve resources and cut costs. This dynamic scaling ensures your platform remains responsive and efficient, even during peak periods, preventing bottlenecks and optimizing resource use for critical financial operations.

The last trigger we add to the `triggers` section is based on the latency of the enqueued jobs:
<figure style="width: 100%; max-width: 100%; margin: 0">

```yaml
...
    - type: metrics-api
      metricType: Value
      metadata:
        targetValue: "300000"                                 # max 5 min latency
        activationTargetValue: "0"                            # activate when jobs have > 0 latency
        format: "json"
        url: "http://jobrunr-service.default:8000/api/metrics/jobs/enqueued"
        valueLocation: "latency"
```
</figure>

This trigger is defining that we want to scale up if there are jobs that are waiting in queue for more than 5 minutes.  

> Beware of the artificial latency that might be introduced by using [mutexes]({{<ref "documentation/pro/mutexes/_index.md">}}) or [priority queues]({{<ref "documentation/pro/priority-queues/_index.md">}}). You can always specify the queue you are interested in by adding the `queue` parameter in the enqueued jobs metrics url, see [JobRunr Pro metrics api]({{<ref "#jobrunr-pro-metrics-api">}}) for more info.

Now all that is left to do is apply our autoscaling configuration in the Kubernetes cluster:
```
kubectl apply -f k8s/keda-scaling.yaml
```
Congratulations! Your app is now autoscaling based on the 3 metrics we specified!  
Let's verify it in the next section.

> To learn more about KEDA autoscaling and see more advanced options, visit the [KEDA documentation](https://keda.sh/docs/latest/concepts/scaling-deployments/).


## Testing the autoscaling
It's time to see the autoscaler in action!  
Before we start, let us forward our application ports to localhost by executing this command:
```
kubectl port-forward svc/jobrunr-service 8000 8080
```
Now the JobRunr dashboard and metrics api are available at [http://localhost:8000/](http://localhost:8000/), and our api for scheduling sample jobs is located at [http://localhost:8080/](http://localhost:8080/).

Let's open the JobRunr dashboard in the web browser: [http://localhost:8000/dashboard](http://localhost:8000/dashboard).

<!-- You will be prompt to login with the username and password that is specified in `k8s/2-jobrunr-example.yaml`.
- **username**: dashboard-user
- **password**: dashboard-password -->

You will be promped to input your JobRunr Pro license key.

First, look at the servers list on the dashboard [http://localhost:8000/dashboard/servers](http://localhost:8000/dashboard/servers).  
You should see no servers found. This is because we specified `minReplicaCount` to be 0. There are no pods running `BackgroundJobServers`. 

Now let's schedule 40 jobs to run in 2 minutes by calling [http://localhost:8080/schedule-example-jobs?count=40&runIn=PT2M](http://localhost:8080/schedule-example-jobs?count=40&runIn=PT2M).  
With the configuration we specified, our target is 8 jobs per pod. KEDA will scale up our deployment to match it. We can see the current pods with the following command:
```
kubectl get pods
```
We will get an output similar to this:
```
NAME                                 READY   STATUS              RESTARTS   AGE
jobrunr-dashboard-74db64f488-spv5g   1/1     Running             0          121m
jobrunr-example-854f975c57-2pmds     0/1     ContainerCreating   0          1s
jobrunr-example-854f975c57-fgrlz     0/1     ContainerCreating   0          1s
jobrunr-example-854f975c57-n49bx     0/1     ContainerCreating   0          2s
jobrunr-example-854f975c57-t9wvw     0/1     ContainerCreating   0          1s
jobrunr-example-854f975c57-vbdjr     0/1     ContainerCreating   0          1s
postgres-f879f4c78-6xhpg             1/1     Running             0          121m
```
Great! We see there are 5 new pods being created.  
After around 1 minute, the servers should announce themselves and will be visible in the JobRunr dashboard.

Once it's time for our scheduled jobs to execute, they'll be queued and then processed. Now the workers' usage metric kicks in! As we have 40 jobs and only 20 total workers, we will see 100% workers' usage throughout the processing of all the jobs. After 30 seconds (poll interval), we can observe another pod being created to match our specified 80% workers' usage target.

If we wait 5 minutes and don't schedule any new jobs, our deployment will scale back to 0.

## Optional - secure your JobRunr dashboard
Securing your JonRunr dashboard is explained in detail in the [authentication guides](guides/authentication/_index.md). KEDA inside your Kubernetes cluster can still access the secured metrics api, but it requieres some additional configuration. In this section, we will show how to set up a basic authorization for our JobRunr dashboard and api, and enable KEDA to access it.  
First, inside the `jobrunr-autoscaling-example.yaml` file add the `Secret` which will store our username and password: 
<figure style="width: 100%; max-width: 100%; margin: 0">

```yaml
---
apiVersion: v1
kind: Secret
metadata:
  name: jobrunr-dashboard-secret
  namespace: default
type: kubernetes.io/basic-auth
stringData:
  username: "dashboard-user"
  password: "dashboard-password"
```
</figure>

We also need to set those credentials in our JobRunr dashboard deployment. Edit the "jobrunr-dashboard" deployment inside the `jobrunr-autoscaling-example.yaml` file and add 2 new env items:
<figure style="width: 100%; max-width: 100%; margin: 0">

```yaml
...
apiVersion: apps/v1
kind: Deployment
metadata:
  name: jobrunr-dashboard
spec:
  ...
  template:
    ...
    spec:
      containers:
        - name: jobrunr-dashboard
          ...
          env:
            - name: ORG_JOBRUNR_DASHBOARD_BASIC-AUTHENTICATION_USERNAME
              valueFrom:
               secretKeyRef:
                  name: jobrunr-dashboard-secret
                  key: username
            - name: ORG_JOBRUNR_DASHBOARD_BASIC-AUTHENTICATION_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: jobrunr-dashboard-secret
                  key: password
            ...
```
</figure>

Now, your JobRunr dashboard is secured with basic authentication, but KEDA can't fetch any metrics. We have to configure our autoscaler to authenticate using our username and password. To do this, let's edit the `keda-scaling.yaml` file and add this `TriggerAuthentication` object at the end:
<figure style="width: 100%; max-width: 100%; margin: 0">

```yaml
---
apiVersion: keda.sh/v1alpha1
kind: TriggerAuthentication
metadata:
  name: jobrunr-dashboard-creds
  namespace: default
spec:
  secretTargetRef:
    - parameter: username
      name: jobrunr-dashboard-secret
      key: username
    - parameter: password
      name: jobrunr-dashboard-secret
      key: password
```
</figure>

This specifies an authentication details that can be used in our triggers as follows:
<figure style="width: 100%; max-width: 100%; margin: 0">

```yaml
...
  triggers:
    - type: metrics-api
      ...
      metadata:
        ...
        authMode: "basic"
      authenticationRef:
        name: jobrunr-dashboard-creds
...
```
</figure>

Add it to all 3 of our triggers. Now, the autoscaling should work with the secured JobRunr endpoints.

## Finished example
<!-- TODO: Change the github url -->
The example app and k8s deployment files that we created in this guide are available in our [github repository](https://github.com/dumnicki/example-k8s-scaling).

## Limitations and considerations
Pay an extra attention when setting `minReplicaCount` property to 0. When no pods are running, workers' usage will always be 0 so to scale from 0 this metric has to be used with at least one additional metric (e.g. latency of enqueued jobs + workers usage).  
No recurring jobs can be executed if no `BackgroundJobServers` are running. We recommend having always 1 `BackgroundJobServer` running.  

The workers' usage is updated at every [background job server poll interval](documentation/configuration/spring#advanced-configuration). Therefore, setting a higher poll interval in KEDA when using only workers' usage metric is not recommended.


## Conclusion
In this guide, we’ve learned how to set up autoscaling in Kubernetes using KEDA and use the JobRunr Pro metrics api to create the scaling triggers.

---

<!-- TODO: This API reference should be moved to documentation -->
## JobRunr Pro metrics api
JobRunr Pro allows us to access useful metrics that can be used for autoscaling. This is an overview of them:
### Get Enqueued Jobs Metrics
`GET /api/metrics/jobs/enqueued?queue=[string]`

**Query parameters**: 
- `queue` get metrics only for jobs from the queue with a specified name.

#### Response content example
<figure style="width: 100%; max-width: 100%; margin: 0">

```json
{
    "latency":500,
    "count":10
}
```
</figure>

`latency` - time the oldest Job has spent in the queue in milliseconds.

`count` - number of jobs in the queue

### Get Scheduled Jobs Metrics
`GET /api/metrics/jobs/scheduled?runInMax=[string]&queue=[string]` 

**Query parameters**: 
- `runInMax` ISO-8601 duration format, get metrics for jobs scheduled to run in specified time at the latest. By default, we only count jobs that are scheduled to run no later than 1 minute from now.
- `queue` get metrics only for jobs from the queue with a specified name.

#### Response content example
<figure style="width: 100%; max-width: 100%; margin: 0">

```json
{
    "count":10
}
```
</figure>

`count` - number of jobs scheduled to run in max `runInMax` time

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

`usage` - percentage value of total usage of workers

`totalWorkers` - total number of workers across all `BackgroundJobServers`

`occupiedWorkers` - number of occupied workers