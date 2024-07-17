---
title: Autoscale your JobRunr Application deployed on Kubernetes
description: This guide will help you utilize Jobrunr Pro features to create a Kubernetes deployment of your application that autoscales based on JobRunr metrics.
weight: 10
tags:
    - Autoscaling
    - JobRunr Pro
    - KEDA
    - Kubernetes
    - Spring Boot
---

[Autoscaling](https://en.wikipedia.org/wiki/Autoscaling) is a method used to dynamically adjust the resources allocated to or the number of instances running the application in the cloud based on some metrics. Usually scaling is performed based on CPU or memory usage but in the context of JobRunr [`Jobs`]({{<ref "_index.md#job">}}) we might be interested in scaling based on number of jobs in queue, time they spend in queue etc. JobRunr Pro provides the advanced metrics to allow efficient autoscaling of your application. In this guide, we'll show you how to setup [KEDA](https://keda.sh/) - a Kubernetes autoscaler to use JobRunr Pro metrics.

## Prerequisites
- JobRunr Pro x.x.x or later
- You already know how to configure JobRunr
- Basic knowledge of Kubernetes
- A working Kubernetes cluster (e.g. [Minikube](https://minikube.sigs.k8s.io/))

> In this guide we will be working locally using Minikube. If you use a different Kubernetes setup some steps might differ and you may skip any `minikube` commands.

## Setup
First clone the github repository containing the [example app](github-url). 

### Building the image
To deploy the example application in Kubernetes we need to build and load the image to Docker.
- Open terminal.
- We then have to set environment variables to point our docker client to Minikube's Docker daemon. Execute the following command:
    ```shell
    eval $(minikube docker-env)
    ```
> You can skip the above step if you are not using minikube.
- Build the container image to the Docker daemon:\
We have two options on how to do it. We can either use [Jib](https://github.com/GoogleContainerTools/jib) and execute:
    ```shell
    gradle jibDockerBuild
    ```
    **OR**\
    using Spring Boot task (based on [buildpacks.io](https://buildpacks.io/features/#comparison)):
    ```shell
    gradle bootBuildImage
    ```

After the build finished you should have jobrunr-example image in Docker. You can check it by running:
```shell
docker images -f reference=jobrunr-example
```
It should output something simillar to this: 
```shell
REPOSITORY        TAG       IMAGE ID       CREATED          SIZE
jobrunr-example   1.0       a3c890d38aa8   26 seconds ago   368MB
jobrunr-example   latest    a3c890d38aa8   26 seconds ago   368MB
```

### Deploying the application
In the `k8s` folder inside the project we have `.yaml` files specyfing Kubernetes objects:
- **0-keda-2.14.0-core.yaml** - KEDA operator with its CRDs. This file comes from [KEDA website](https://keda.sh/docs/latest/deploy/#yaml).
- **1-postgres.yaml** - PostgreSQL database
- **2-jobrunr-example.yaml** - Example JobRunr application. It includes one deployment running JobRunr dashboard and api for scheduling sample jobs and another deployment that runs JobRunr [`BackgroundJobServer`]({{<ref "_index.md#backgroundjobserver">}}) - this is the deployment we want to scale.
- **3-keda-scaling.yaml** - Declaration of KEDA `ScaledObject` - this is where we configure the autoscaling.

We can deploy everything to k8s cluster with the following command:
```shell
kubectl apply --server-side -f k8s
```

### Accessing the application
To access the application running within minikube we can get the urls to our service with the following command:
```shell
minikube service jobrunr-service
```
This will display the urls to JobRunr dashboard and to the api for enqueuing sample jobs. Depending on your setup, minikube will also open a tunnel forwarding the application ports to your localhost.
Two urls are displayed, we will refer to them as follows:
- `DASHBOARD_URL` - targeting `jobrunr-dashboard/8000` port
- `ENQUEUE_URL` - targeting `job-enqueue/8080` port

Let's open the JobRunr dashboard in the web browser
```shell
DASHBOARD_URL/dashboard
```
You will be prompt to login with the username and password that is specified in `k8s/2-jobrunr-example.yaml`.
- **username**: dashboard-user
- **password**: dashboard-password

Next you'll be promped to input your JobRunr Pro license.

## Scheduling sample jobs
Our example application exposes an endpoint that allows us to schedule sample jobs. This is useful if we want to play with autoscaling configuration and observe how our deployment scales depending on the jobs load.
By calling 
```shell
ENQUEUE_URL/schedule-example-jobs
```
we will schedule sample jobs. This endpoint also takes the following parameters:
- **name** - the name we want to give to our sample jobs `default: SampleJob`
- **count** - number of jobs we want to schedule `default: 100`
- **executionTimeMs** - how long should the execution of each job be in milliseconds `default: 15000`
- `optional` **runIn** - duration in ISO-8601 format specyfing time in which the jobs will be scheduled

Let's call:
```shell
ENQUEUE_URL/schedule-example-jobs?count=40&runIn=PT1M
```
this will schedule 40 jobs to run in 1 minute.

## JobRunr Pro metrics api
JobRunr Pro allows us to access useful metrics that can be used for autoscaling. This is the overview of them:
### Get Enqueued Jobs Metrics
`GET /api/metrics/jobs/enqueued` 

**Query parameters**: `queue=[string]` get metrics only for jobs from the queue with specified name.

#### Success response
**Code**: `200 OK`

**Content example**

```json
{
    "latency":500,
    "count":10
}
```
`latency` - time the oldest Job has spent in the queue in milliseconds.

`count` - number of jobs in the queue

### Get Scheduled Jobs Metrics
`GET /api/metrics/jobs/scheduled` 

**Query parameters**: `runInMax=[string]` ISO-8601 duration format, get metrics for jobs scheduled to run in specified time at the latest. By default we only count jobs that are scheduled to run not later than 1 minute from now.

`queue=[string]` get metrics only for jobs from the queue with specified name.

#### Success response
**Code**: `200 OK`

**Content example**

```json
{
    "count":10
}
```

`count` - number of jobs scheduled to run in max `runInMax` time

### Get Workers Metrics
`GET /api/metrics/workers` 

#### Success response
**Code**: `200 OK`

**Content example**

```json
{
    "usage":0.25,
    "totalWorkers":8,
    "occupiedWorkers":2
}
```

`usage` - percentage value of total usage of workers

`totalWorkers` - total number of workers across all `BackgroundJobServers`

`occupiedWorkers` - number of occupied workers

## Configuring scaling
To configure scaling of our application we can edit the specification describing [ScaledObject](https://keda.sh/docs/latest/concepts/scaling-deployments/#scaledobject-spec). Open the `k8s/3-keda-scaling.yaml` file in the project directory. Let's take a look at it:

```yaml
...
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
...
```

This section specifies the KEDA ScaledObject. `scaleTargetRef` points to the name of deployment we want to scale.
`pollingInterval` specifies how often KEDA should fetch metrics from JobRunr. `cooldownPeriod` defines after how many seconds of all metrics being 0, scaling to `minReplicaCount` should happen. `minReplicaCount` and `maxReplicaCount` specify minimal and maximal number of replicas we can have.

```yaml
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
        authMode: "basic"
      authenticationRef:
        name: jobrunr-dashboard-creds
    ...
```
In the `triggers` section we define what metrics trigger scaling. 

Our first trigger is based on the workers usage. This specification says that our target is 80% utilization of workers. If it's more, we want to scale up, if it's less we want to scale down.

We are using REST endpoints to fetch our metrics so we use `metrics-api` type of trigger. `metricType: Value` specifies this is the total value i.e. the target value is independent of number of pods. In the `metadata` section we specify the `targetValue` - the optimal value of the metric, `activationTargetValue` - threshold on which to scale to and from 0 replicas, `format` - format of the response from specified url, `url` - endpoint from which we fetch the metric, `valueLocation` - location of the metrics property inside the json response that we are interested in. `authMode` and `authenticationRef` are connected to authentication to the JobRunr endpoint.

The next trigger is based on scheduled jobs metrics.

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
        authMode: "basic"
      authenticationRef:
        name: jobrunr-dashboard-creds
    ...
```
It specifies that we are targetting to have 8 scheduled jobs per pod. We are interested in jobs that will run in the next 2 minutes. 
> Using the scheduled jobs metrics can be useful in the situation if we want to quickly process a big batch of jobs that are scheduled in some time in the future. We look 2 minutes ahead and already start creating pods to be ready when those jobs execute. Afterwards we scale down to save resources.
Here we use `metricType: AverageValue` to specify that the `targetVaue` is per pod (e.g. having 2 pods and 10 scheduled jobs we get value 5 per pod so we are below the targetValue of 8).

The last trigger is based on latency of the enqueued jobs.
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
        authMode: "basic"
      authenticationRef:
        name: jobrunr-dashboard-creds
```
This trigger defines that we want to scale up if there are jobs that are waiting in queue for more than 5 minutes.

> To learn more about KEDA autoscaling and see more advanced options visit the [KEDA documentation](https://keda.sh/docs/latest/concepts/scaling-deployments/).

## Testing the autoscaling
Let's see the autoscaler in action!

First look at the servers list on the dashboard
```shell
DASHBOARD_URL/dashboard/servers
```
You should see no servers found. This is because we specified `minReplicaCount` to be 0. There are no pods running `BackgroundJobServers`. 
> Warning! Be careful setting `minReplicaCount` to 0 as it might cause problems with executing recurring jobs.
Now let's schedule 40 jobs to run in 2 minutes:
```shell
ENQUEUE_URL/schedule-example-jobs?count=40&runIn=PT2M
```
With the configuration we specified our target is 8 jobs per pod. KEDA will scale up our deployment to match it. We can see the current pods with the following command:
```shell
kubectl get pods
```
We will get an output simmilar to this:
```shell
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

After around 1 minute the servers should announce themselves and will be visible in JobRunr dashboard.

Once it's time for our scheduled jobs to execute, they'll become enqueued and then processed. Now the workers usage metric kicks in! As we have 40 jobs and only 20 total workers, we will see 100% workers usage throughout the processing of all the jobs. After 30 seconds (poll interval) we can observe another pod being created to match our specified 80% workers usage target.

If we wait 5 minutes and don't schedule any new jobs, our deployment will scale back to 0.

## Limitations and Considerations

...

## Conclusion
In this guide, we’ve learned how to set up autoscaling in Kubernetes using KEDA and use JobRunr Pro metrics api to create the scaling triggers.