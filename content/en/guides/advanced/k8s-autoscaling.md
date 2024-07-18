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
In this guide, we'll show you how to set up a [Kubernetes](https://kubernetes.io/) autoscaler [KEDA](https://keda.sh/) using JobRunr Pro metrics to achieve an efficient scaling of your application.

## Prerequisites
- JobRunr Pro 8.0.0 or later
- You already know how to configure JobRunr
- Basic knowledge of Kubernetes
- A working Kubernetes cluster

> In this guide we will be working locally using [Minikube](https://minikube.sigs.k8s.io/). If you use a different Kubernetes setup, some steps might differ and you may skip any `minikube` commands.

## Setup
You can follow this guide step by step to deploy your existing JobRunr application. If you want to learn how to include and use JobRunr in your project, follow [this guide]({{<ref "guides/intro/java-lambda.md">}}) first.  
In case you prefer to get straight to the solution, you can view the code from this guide [here]({{<ref "#finished-example">}}).

### Building the container image
To deploy the application in Kubernetes we need to build and load the image into Docker.  
> If you already know how to create a Docker image, you can skip this part.

1. Open terminal in your project's root directory.
2. Set environment variables to point our docker client to Minikube's Docker daemon with the following command:
    ```
    eval $(minikube docker-env)
    ```
3. Build the container image to the Docker daemon:  
If your project uses Spring Boot, the easiest way to create an [OCI image](https://github.com/opencontainers/image-spec) is to use [build tool plugin](https://docs.spring.io/spring-boot/build-tool-plugin/index.html) provided by Spring Boot which is available for Maven and Gradle. Executing the command below will create an image using [Cloud Native Buildpacks](https://buildpacks.io/features/#comparison).
{{< codetabs >}}
    {{< codetab type="gradle" label="Gradle">}}
    gradle bootBuildImage --imageName=jobrunr-autoscaling-example:1.0
    {{< /codetab >}}
    {{< codetab type="maven" label="Maven">}}
    mvm command spring-boot:build-image --Dspring-boot.build-image.imageName=jobrunr-autoscaling-example:1.0
    {{< /codetab >}}
{{< /codetabs >}}
> There are other ways to build an image for your application. Feel free to use your preferred tools such as [Jib](https://github.com/GoogleContainerTools/jib) or building with the [Dockerfile](https://docs.docker.com/reference/dockerfile/).

After the build finished you should have a jobrunr-autoscaling-example image in Docker. You can check it by running:
```
docker images -f reference=jobrunr-autoscaling-example
```
It should output something similar to this:
```
REPOSITORY                    TAG       IMAGE ID       CREATED          SIZE
jobrunr-autoscaling-example   1.0       20cfff6c943e   26 seconds ago   350MB
```

### Creating k8s deployment
To run your application in the cluster with the autoscaling capability we will need to deploy several services:
- [KEDA](https://keda.sh/) for autoscaling functionality,
- any [database supported by JobRunr]({{<ref "documentation/installation/storage/_index.md">}}),
- your application running JobRunr dashboard and your application running JobRunr `BackgroundJobServer`.

Besides that, we will create a [ScaledObject](https://keda.sh/docs/latest/concepts/scaling-deployments/#scaledobject-spec) which lets us configure the autoscaling behaviour.  
Let's create the k8s folder inside your project's root directory.  
Then deploy KEDA in your Kubernetes cluster by following the [official guide](https://keda.sh/docs/2.14/deploy).  

Now we are going to deploy the database, we will use the [PostgreSQL](https://www.postgresql.org/). Inside the k8s folder, we create `postgres.yaml` file:
<figure style="width: 100%; max-width: 100%; margin: 0">

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgres
spec:
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
        - name: postgres
          image: postgres:16.3
          ports:
            - containerPort: 5432
          env:
            - name: POSTGRES_DB
              value: jobrunr-db
            - name: POSTGRES_USER
              value: jobrunr-user
            - name: POSTGRES_PASSWORD
              value: jobrunr-pass
---
apiVersion: v1
kind: Service
metadata:
  name: postgres
spec:
  selector:
    app: postgres
  type: NodePort
  ports:
    - port: 5432
```
</figure>

This specifies a deployment of PostgreSQL visible on port `5432` with admin credentials `jobrunr-user` and `jobrunr-pass`. To deploy it, execute:
```
kubectl apply -f k8s/postgres.yaml
```
Next, let's deploy our application running JobRunr dashboard and one running `BackgroundJobServer`. The difference is in the configuration, here we use separate Spring profiles for dashboard and workers, which enable or disable dashboard or `BackgroundJobServer`. To learn more about JobRunr configuration see [this document]({{<ref "documentation/configuration/_index.md">}}).  
Inside k8s folder, we create `jobrunr-autoscaling-example.yaml`:
<figure style="width: 100%; max-width: 100%; margin: 0">

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: datasource-config
data:
  SPRING_DATASOURCE_DRIVER_CLASS_NAME: org.postgresql.Driver
  SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/jobrunr-db
  SPRING_DATASOURCE_USERNAME: jobrunr-user
  SPRING_DATASOURCE_PASSWORD: jobrunr-pass
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: jobrunr-dashboard
spec:
  selector:
    matchLabels:
      app: jobrunr-dashboard
  template:
    metadata:
      labels:
        app: jobrunr-dashboard
    spec:
      containers:
        - name: jobrunr-dashboard
          image: jobrunr-autoscaling-example:1.0
          ports:
            - name: dashboard-svc
              containerPort: 8000
            - name: job-enqueue-svc
              containerPort: 8080
          envFrom:
            - configMapRef:
                name: datasource-config
          env:
            - name: SPRING_PROFILES_ACTIVE
              value: 'dashboard'
---
apiVersion: v1
kind: Service
metadata:
  name: jobrunr-service
spec:
  selector:
    app: jobrunr-dashboard
  type: NodePort
  ports:
    - name: jobrunr-dashboard
      protocol: TCP
      port: 8000
      targetPort: dashboard-svc
    - name: job-enqueue
      protocol: TCP
      port: 8080
      targetPort: job-enqueue-svc
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: jobrunr-example
spec:
  selector:
    matchLabels:
      app: jobrunr-example
  template:
    metadata:
      labels:
        app: jobrunr-example
    spec:
      containers:
        - name: jobrunr-example
          image: jobrunr-autoscaling-example:1.0
          envFrom:
            - configMapRef:
                name: datasource-config
          env:
            - name: SPRING_PROFILES_ACTIVE
              value: 'worker'
```
<figcaption> jobrunr-autoscaling-example.yaml </figcaption>
</figure>

And just as before, let's deploy it in Kubernetes:
```
kubectl apply -f k8s/jobrunr-autoscaling-example.yaml
```
After this section, in our Minikube cluster we have running JobRunr dashboard and `BackgroundJobServer` connected to PostgreSQL database. There is also KEDA operator running in `keda` namespace.

### Configuring autoscaling
To configure scaling of our application we define a [ScaledObject](https://keda.sh/docs/latest/concepts/scaling-deployments/#scaledobject-spec). Create the `keda-scaling.yaml` file in the k8s directory:
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
Property `scaleTargetRef` points to the name of deployment we want to scale.  
We can specify how often KEDA should fetch metrics from JobRunr by changing the `pollingInterval`.  
The `cooldownPeriod` property defines after how many seconds of all metrics being 0, scaling to `minReplicaCount` should happen.  
Properties `minReplicaCount` and `maxReplicaCount` specify minimal and maximal number of replicas our app can scale to.

> Warning! Be careful setting `minReplicaCount` to 0 as it might cause problems with executing recurring jobs. See [considerations section]({{<ref "#limitations-and-considerations">}}).

Next we define [triggers](https://keda.sh/docs/latest/concepts/scaling-deployments/#triggers) inside the spec section. Each `trigger` specify which metrics trigger scaling.  
<!-- TODO: introduce the scenario -->
Let's assume ... :some usecase: ...

Our first trigger is based on the workers usage. The specification below says that our target is 80% utilization of workers. If it's more, we want to scale up, if it's less we want to scale down.  
We get the workers usage metric from [JobRunr Pro metrics api]({{<ref "#jobrunr-pro-metrics-api">}}).
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

Let's shortly explain what this config means.  
We are using REST endpoints to fetch our metrics so we use `metrics-api` type of trigger.  
Property `metricType: Value` specifies this is the total value i.e. the target value is independent of number of pods.  
In the `metadata` section we specify:  
`targetValue` - the optimal value of the metric,  
`activationTargetValue` - threshold on which to scale to and from 0 replicas,  
`format` - format of the response from specified url,  
`url` - endpoint from which we fetch the metric,  
`valueLocation` - location of the metrics property inside the json response that we are interested in.

The next trigger is based on scheduled jobs metrics.
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

It specifies that we are targetting to have 8 scheduled jobs per pod. We are interested in jobs that will run in the next 2 minutes.  
Here we use `metricType: AverageValue` to specify that the `targetVaue` is per pod (e.g. having 2 pods and 10 scheduled jobs we get value 5 per pod so we are below the targetValue of 8).

> Using the scheduled jobs metrics can be useful in the situation if we want to quickly process a big batch of jobs that are scheduled in some time in the future. We look 2 minutes ahead and already start creating pods to be ready when those jobs execute. Afterwards we scale down to save resources.  

The last trigger we add to `triggers` section is based on latency of the enqueued jobs:
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

This trigger defines that we want to scale up if there are jobs that are waiting in queue for more than 5 minutes.  

> Beware the artificial latency that might be introduced by using [mutexes]({{<ref "documentation/pro/mutexes/_index.md">}}) or [priority queues]({{<ref "documentation/pro/priority-queues/_index.md">}}). You can always specify the queue you are interested in by adding the `queue` parameter in the enqueued jobs metrics url, see [JobRunr Pro metrics api]({{<ref "#jobrunr-pro-metrics-api">}}) for more info.

Now all is left to do is to apply our autoscaling configuration in the Kubernetes cluster:
```
kubectl apply -f k8s/keda-scaling.yaml
```
Congratulations, your app is now autoscaling based on the 3 metrics we specified!  
Let's verify it in the next section.

> To learn more about KEDA autoscaling and see more advanced options visit the [KEDA documentation](https://keda.sh/docs/latest/concepts/scaling-deployments/).


<!-- ## Scheduling sample jobs
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
this will schedule 40 jobs to run in 1 minute. -->

## Testing the autoscaling
It's time to see the autoscaler in action!  
<!-- ### Accessing the application
To access the application running within Minikube we can get the urls to our service with the following command:
```
minikube service jobrunr-service
```
This will display the urls to JobRunr dashboard and to the api for enqueuing sample jobs. Depending on your setup, minikube will also open a tunnel forwarding the application ports to your localhost.  
You'll see an output like this:
```
|-----------|-----------------|------------------------|---------------------------|
| NAMESPACE |      NAME       |      TARGET PORT       |            URL            |
|-----------|-----------------|------------------------|---------------------------|
| default   | jobrunr-service | jobrunr-dashboard/8000 | http://192.168.49.2:30924 |
|           |                 | job-enqueue/8080       | http://192.168.49.2:31660 |
|-----------|-----------------|------------------------|---------------------------|
🏃  Starting tunnel for service jobrunr-service.
|-----------|-----------------|-------------|------------------------|
| NAMESPACE |      NAME       | TARGET PORT |          URL           |
|-----------|-----------------|-------------|------------------------|
| default   | jobrunr-service |             | http://127.0.0.1:43447 |
|           |                 |             | http://127.0.0.1:36337 |
|-----------|-----------------|-------------|------------------------|
[default jobrunr-service  http://127.0.0.1:43447
http://127.0.0.1:36337]
❗  Because you are using a Docker driver on linux, the terminal needs to be open to run it.
```

We are interested in the last two urls that are displayed, we will refer to them as follows:
- `DASHBOARD_URL` - targeting `jobrunr-dashboard/8000` port
- `ENQUEUE_URL` - targeting `job-enqueue/8080` port -->

Before we start let us forward our application ports to localhost by executing this command:
```
kubectl port-forward svc/jobrunr-service 8000 8080
```
Now the JobRunr dashboard and metrics api is available at [http://localhost:8000/](http://localhost:8000/) and our api for scheduling sample jobs is located at [http://localhost:8080/](http://localhost:8080/).

Let's open the JobRunr dashboard in the web browser [http://localhost:8000/dashboard](http://localhost:8000/dashboard).

<!-- You will be prompt to login with the username and password that is specified in `k8s/2-jobrunr-example.yaml`.
- **username**: dashboard-user
- **password**: dashboard-password -->

You will be promped to input your JobRunr Pro license key.

First look at the servers list on the dashboard [http://localhost:8000/dashboard/servers](http://localhost:8000/dashboard/servers).  
You should see no servers found. This is because we specified `minReplicaCount` to be 0. There are no pods running `BackgroundJobServers`. 

Now let's schedule 40 jobs to run in 2 minutes by calling [http://localhost:8080/schedule-example-jobs?count=40&runIn=PT2M](http://localhost:8080/schedule-example-jobs?count=40&runIn=PT2M).  
With the configuration we specified our target is 8 jobs per pod. KEDA will scale up our deployment to match it. We can see the current pods with the following command:
```
kubectl get pods
```
We will get an output simmilar to this:
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
After around 1 minute the servers should announce themselves and will be visible in JobRunr dashboard.

Once it's time for our scheduled jobs to execute, they'll become enqueued and then processed. Now the workers usage metric kicks in! As we have 40 jobs and only 20 total workers, we will see 100% workers usage throughout the processing of all the jobs. After 30 seconds (poll interval) we can observe another pod being created to match our specified 80% workers usage target.

If we wait 5 minutes and don't schedule any new jobs, our deployment will scale back to 0.

## Optional - secure your JobRunr dashboard
Securing your JonRunr dashboard is explained in detail in the [authentication guides](guides/authentication/_index.md). KEDA inside your Kubernetes cluster can still access the secured metrics api but it requieres some additional configuration. In this section we will show how to set up a basic authorization of our JobRunr dashboard and api, and enable KEDA to access it.  
First inside the `jobrunr-autoscaling-example.yaml` file add the `Secret` which will store our username and password: 
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

Now your JobRunr dashboard is secured with basic authentication but KEDA can't fetch any metrics. We have to configure our autoscaler to authenticate using our username and password. To do this, let's edit the `keda-scaling.yaml` file and add this `TriggerAuthentication` object at the end:
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

Add it to all 3 of our triggers. Now the autoscaling should work with the secured JobRunr endpoints.

## Finished example
<!-- TODO: Change the github url -->
The example app together with k8s deployment files that we created in this guide is available in our [github repository](https://github.com/dumnicki/example-k8s-scaling).

## Limitations and considerations
Pay an extra attention when setting `minReplicaCount` property to 0. When no pods are running, workers usage will always be 0 so to scale from 0 this metric has to be used with at least one additional metric (e.g. latency of enqueued jobs + workers usage).  
No recurring jobs can be executed if no `BackgroundJobServers` are running. We recommend having always 1 `BackgroundJobServer` running.  

The workers usage is updated every [background job server poll interval](documentation/configuration/spring#advanced-configuration). 


## Conclusion
In this guide, we’ve learned how to set up autoscaling in Kubernetes using KEDA and use JobRunr Pro metrics api to create the scaling triggers.

---

<!-- TODO: This API reference should be moved to documentation -->
## JobRunr Pro metrics api
JobRunr Pro allows us to access useful metrics that can be used for autoscaling. This is the overview of them:
### Get Enqueued Jobs Metrics
`GET /api/metrics/jobs/enqueued?queue=[string]`

**Query parameters**: 
- `queue` get metrics only for jobs from the queue with specified name.

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
- `runInMax` ISO-8601 duration format, get metrics for jobs scheduled to run in specified time at the latest. By default we only count jobs that are scheduled to run not later than 1 minute from now.
- `queue` get metrics only for jobs from the queue with specified name.

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