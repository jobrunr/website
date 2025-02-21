---
version: "pro"
title: "JobRunr Pro Multi Dashboard"
subtitle: "One Dashboard To Rule Them All!"
date: 2025-02-21T13:00:00+01:00
layout: "documentation"
draft: true
menu: 
  main: 
    identifier: jobrunr-pro-multi-dashboard
    parent: 'jobrunr-pro'
    weight: 1
---

{{< trial-button >}}

The JobRunr Pro _Multi Dashboard_ is a separate webserver instance that controls all other [JobRunr Pro Dashboards](/en/documentation/pro/jobrunr-pro-dashboard). Monitoring multiple instances can get tiresome when running a lot of different JobRunr clusters, all running their own jobs, for instance when deploying multiple single-tenant SaaS applications. With the _Multi Dashboard_, your one-stop job shop, you can **monitor the health of all clusters at once** within one dashboard server.

## Architectural overview

The _Multi Dashboard_ connects to all other clusters, either via a running `DashboardServer` using the autodiscovery mode, or directly through a `StorageProvider`. It then collects and aggregates the results, showing it to the user using the same UI and feature set of the regular [JobRunr Pro Dashboard](/en/documentation/pro/jobrunr-pro-dashboard).

Below is a schematic overview of how this works:

![](/documentation/multi-dashboard-context.png "The MultiDashboard Context Diagram.")

Instead of surfing to `http://mycluster:9000/dashboard`, you now access `http://themulticluster:8000/dashboard` which is deployd separately. Various configuration options (see below) allow you to either inject the database providers directly into the multi cluster instance, or have each cluster announce itself to the multi instance.

For instance, the _Multi Dashboard_ will be smart enough to figure out how to query all jobs, either through a cluster `DashboardServer` that announced itself or was pre-configured, or directly through a pre-configured `StorageProvider` if you choose not to expose/run any single dashboard webserver for the clusters themselves. 

Zooming in on the above blue "JobRunr MultiDashboard" block, we see the system in effect:

![](/documentation/multi-dashboard-container.png "The MultiDashboard Container Diagram.")

## Configuration

### The Multi Instance

Bootstrapping the _Multi Dashboard_ works in the same vein as bootstrapping any other JobRunr Cluster: it starts with a set of configuration parameters, and then you call `start()`. That's it, you now have a multi instance running! 

```java
var multiClusterWebServer = new MultiClusterWebServer(
        usingStandardMultiWebServerConfiguration()
                .andHost("localhost", 8000)
                .andContextPath("/multi")
                .andApiKey("my-api-token"));
multiClusterWebServer.start();
```

The above code configures the webserver according to the `MultiClusterWebServerConfiguration` class, which provides the same configuration as the `JobRunrDashboardWebServerConfiguration` and the following extras:

- `andQueues()`: Allows to provide the names for the priority queues that will be displayed on the Dashboard.
- `andApiKey()`: Used to communicate between multi and single cluster instances.
- `andClusterConnectionTimeout()`: The maximum amount of time the multi server will wait on a cluster before aggregating the results back to the user. Default: 30 seconds.

You can now open your browser at [http://localhost:8000/multi/dashboard](http://localhost:8000/multi/dashboard). Without any clusters configured or discovered, the dashboard will say it is waiting for clusters to be discovered. If you'd rather pre-configure the server with the storage provider or REST API cluster instances during boot, you can do that as well by **providing a second constructor parameter**, the `MultiClusterConfiguration`:

```java
var multiClusterWebServer = new MultiClusterWebServer(
        usingStandardMultiWebServerConfiguration()
                .andContextPath("/test")
                // .and(...) more config (see above)
              ),
        usingStandardMultiClusterConfiguration()
                .andStorageProviderClusters(
                        new StorageProviderClusterConfiguration("cluster 1", provider1),
                        new StorageProviderClusterConfiguration("cluster 2", provider2))
                .andRestApiClusters(new RestApiClusterConfiguration("cluster 3", "http://cluster3.host")));
multiClusterWebServer.start();
```

The above code pre-loads the multi server with knowledge of three clusters: two with a direct database connection and one with a HTTP link to the exposed dashboard running at `http://cluster3.host`.

### Single Instances

Providing cluster configuration at boot has the advantage of not having to expose dashboard servers. However, if you have multiple clusters deployed in Kubernetes pods, of which dynamically new ones are spin up and taken down, you might want to enable our **auto-discovery feature** in which a cluster announces itself to the multi server (each minute).

The only thing to add here is `andAutoDiscovery()` at the JobRunr Pro cluster dashboard configuration:

```java
JobRunrPro
        .configure()
        // .use... your usual config
        .useDashboardIf(true, usingStandardDashboardConfiguration()
            .andHost("localhost", 9000)
            // .and... your usual dashboard web server config
            .andAutoDiscovery("http://localhost:8000/multi", "my-api-token", "Cluster 1 at port 9000")
```

That's it! As soon as the above cluster has booted, it will issue a `PUT` to the configured _Multi Dashboard_ server, announcing its name ("Cluster 1 at port 9000") and location. From here on, the _Multi Dashboard_ will retrieve the cluster ID and the dashboard will show all data of that cluster. If the cluster goes down (e.g. retrieving jobs fails), the _Multi Dashboard_ will mark it as `OFFLINE`, until it announces itself again, making it resilient against potential crashes. 

## Working With the Multi Dashboard

When you have a lot of clusters running, you may want to enable filtering in the different views. As you can see in the screenshot below, the _Multi Dashboard_ comes with a Cluster button on the top right that shows all currently discovered clusters where you can filter on specific ones. This filter remains persistent. Also, you can filter on _cluster name_ if you so desire in job tables. On the Dashboard overview page, a new badge also showcases the current number of clusters discovered, and how many of them are currently online.

![](/documentation/multi-dashboard-filter.png "Filtering on cluster in the Multi Dashboard UI.")

The number on the top right of the button gives an immediate indication of the amount of connected clusters (10 in the above example).

You can issue any action you're used to issuing from the [JobRunr Pro Dashboard](/en/documentation/pro/jobrunr-pro-dashboard): triggering recurring jobs, retrying jobs, ... The _Multi Dashboard_ server itself does not handle any job processing: it simply delegates the actions to the designated cluster, either using the REST API or using the direct link to the database. 
