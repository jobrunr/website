---
version: "pro"
title: "Multi-Cluster Dashboard"
subtitle: "One Dashboard to rule them all, One Dashboard to find them, One Dashboard to bring them all and from the database bind them."
date: 2025-02-21T13:00:00+01:00
layout: "documentation"
beta: true
menu: 
  main: 
    identifier: jobrunr-pro-multi-dashboard
    parent: 'jobrunr-pro'
    weight: 1
---

{{< trial-button >}}

When running multiple JobRunr clusters (i.e. different applications running on separate JobRunr tables), it becomes tedious to monitor all the different  dashboards. The _Multi-Cluster Dashboard_ is here to make this task easier. 

The Multi-Cluster Dashboard provides a unified view of multiple JobRunr Pro clusters (i.e., independent schedulers). We designed it to be as easy to use as possible. In fact, from a user perspective, it has the same feel and set of features as the regular [JobRunr Pro Dashboard]({{< ref "jobrunr-pro-dashboard.md" >}}), with a few additional markers to quickly distinguish between clusters.

<!-- Monitoring multiple instances can get tiresome when running a lot of different JobRunr clusters, all running their own jobs, for instance when deploying multiple single-tenant SaaS applications. With the _Multi Dashboard_, your one-stop job shop, you can **monitor the health of all clusters at once** within one dashboard server. -->

> We often use the shorter Multi Dashboard to refer to the Multi-Cluster Dashboard.

## Architectural overview

The _Multi Dashboard_ connects to all other clusters, either via a running `JobRunrDashboardWebServer`, or directly via a `StorageProvider`. It then collects the results and presents them to the user using the same UI and feature set as the regular [JobRunr Pro Dashboard]({{< ref "jobrunr-pro-dashboard.md" >}}).

Below is a schematic overview of how this works:

![](/documentation/multi-dashboard-context.png "The Multi-Cluster Dashboard Context Diagram.")

As shown in the diagram, instead of connecting to each dashboard for routine monitoring, a user can go directly to the multi-dashboard. The `MultiClusterWebServer` takes care of polling each cluster for data and running some filters to meet the user's request (e.g., serving the data in a certain order or setting a limit). The web server can be made aware of a cluster to query either at configuration time or at runtime via auto-discovery. See the [_Configuration_ section]({{< ref "#configuration" >}}) for more information.

Zooming in on the above blue "JobRunr MultiDashboard" block, we see the system in effect:

![](/documentation/multi-dashboard-container.png "The `MultiClusterWebServer` Container Diagram.")

As the diagram shows, the Multi Dashboard is smart enough to handle different types of data providers; it can connect directly to the database or send requests to a REST API.

## Configuration

### Multi-cluster web server

#### Pre-requisites
* Add `jobrunr-pro-dashboard-multi-instance` as a dependency.
* JDK 21 or higher

> ⚠️ The package `jobrunr-pro-dashboard-multi-instance` is planned to be renamed to `jobrunr-pro-multi-cluster-dashboard`.

#### Web server setup

Bootstrapping the _Multi Dashboard_ works in the same vein as bootstrapping any other JobRunr cluster: it starts with a set of configuration parameters, and then you call `start()`.

```java
var multiClusterWebServer = new MultiClusterWebServer();
multiClusterWebServer.start();
```

The above shows a setup of a `MultiClusterWebServer` with all default configuration. The dashboard can be reached by visiting `localhost:8000` but wouldn't do much.

The `MultiClusterWebServer` takes up to two parameters for more advanced configuration:
* `MultiClusterWebServerConfiguration` to configure the web server (e.g., authentication, hostname, port number, etc.).
* `MultiClusterConfiguration` to statically configure the different clusters to query from.

The `MultiClusterWebServerConfiguration` provides the same configuration as the `JobRunrDashboardWebServerConfiguration` with the following optional extras:

- `andQueues()`: Allows to provide the names for the priority queues that will be displayed on the Dashboard.
- `andApiKey()`: A shared secret used to secure the communication between the multi-cluster server and single cluster. 
- `andClusterConnectionTimeout()`: The maximum amount of time the multi server will wait on a cluster before aggregating the results back to the user. Default: 30 seconds.

The `MultiClusterConfiguration` allows to specify the clusters to query from at configuration time. Users have the option to specify multiple `StorageProvider`s to query or multiple REST APIs to connect to (or a combination of both).

> You may choose to not provide this configuration and instead [use auto-discovery]({{< ref "#auto-discovery" >}}) to register clusters at runtime.

Below is a more advanced configuration:

```java
var multiClusterWebServer = new MultiClusterWebServer(
        usingStandardMultiWebServerConfiguration()
                .andContextPath("/multi")
                .andHost("localhost", 8000)
                .andApiKey("my-api-key")
                // .and(...) more config (see MultiClusterWebServerConfiguration's API)
        ,
        usingStandardMultiClusterConfiguration()
                .andStorageProviderClusters(
                        new StorageProviderClusterConfiguration("Accounting", provider1),
                        new StorageProviderClusterConfiguration("Human Resources", provider2)
                )
                .andRestApiClusters(
                        new RestApiClusterConfiguration("Order fulfillment", "https://order-fulfillment-service.acme.com")
                )
);
multiClusterWebServer.start();
```

Running this example will start a web server reachable at `http://localhost:8000/multi/dashboard`. The `MultiClusterWebServer` will serve requests by querying the two with `StorageProvider`s (i.e., `provider1` and `provider2`) and one JobRunr cluster web server at `https://order-fulfillment-service.acme.com`.

> We expect the Multi-Cluster Dashboard to be deployed as a standalone application (e.g., inside a docker container). Therefore we require the use of JDK 21 or higher and internally use `Jackson` for JSON serialization needs.

### Auto-discovery

Providing the `MultiClusterConfiguration` at boot has the advantage of not having to expose any dashboard servers. However, if you have multiple clusters deployed in Kubernetes pods where new clusters are dynamically spun up and down, you may want to enable our **auto-discovery** feature where a cluster announces itself to the multi-cluster web server.

The only thing to add here is `andAutoDiscovery()` at the JobRunr Pro cluster dashboard configuration:

```java
JobRunrPro
        .configure()
        // .use... your usual config
        .useDashboard(usingStandardDashboardConfiguration()
            .andPort(9000)
            // .and... your usual dashboard web server config
            .andAutoDiscovery("https://multi-cluster.acme.com/multi", "my-api-key", "Order fulfillment service")
```

That's it! As soon as the above cluster has booted, it'll announce itself and communicate its URL to the `MultiClusterWebServer`.

> ⚠️ We pulled the `apiKey` configuration out of the auto-discovery configuration. In the next release this configuration is changing from `.andAutoDiscovery("https://multi-cluster.acme.com/multi", "my-api-key", "Order fulfillment service")` to `andApiKey("my-api-key").andAutoDiscovery("https://multi-cluster.acme.com/multi", "Order fulfillment service")`.

> **Note**: if provided, the API-Key needs to be shared by both servers.

> For alternative auto-discovery configuration see the API of `JobRunrDashboardWebServerConfiguration`.


### Authentication

The Multi-Cluster Dashboard supports the same [user authentication schemes]({{< ref "guides/authentication" >}}) as a regular JobRunr Pro Dashboard. The only way to authenticate server-to-server communication is to configure shared API keys. Once configured, servers pass the key along with each request. A valid API key provides full access to all the endpoints.

> Due to the nature of these exchanges, we recommend using HTTPS.

## Working with the Multi Dashboard

By default the dashboard provides an integrated view of data from all the clusters. For instance, this allows to search without first having to find out which cluster an item is located on. If not for a few markers, the experience is almost the same as using the regular dashboard. The below gif showcases the use of the Multi-Cluster Dashboard.

![](/documentation/multi-cluster-dashboard.gif "Usage of the Multi-Cluster Dashboard.")

You can perform any action you're used to issuing from the [JobRunr Pro Dashboard](/en/documentation/pro/jobrunr-pro-dashboard): triggering recurring jobs, requeueing jobs, stop servers, etc. On the overview page, a new card also displays the current number of clusters discovered, and how many of them are currently online.

### Filter out clusters

You may want to isolate a few clusters. As the below gif shows, the _Multi Dashboard_ comes with a button on the top right that shows all currently discovered clusters where you can filter on specific ones. 

![](/documentation/multi-cluster-dashboard-filter.gif "Filtering on cluster in the Multi Dashboard UI.")

> This filter remains persistent, so on your next visit, you'll view the clusters you isolated.
