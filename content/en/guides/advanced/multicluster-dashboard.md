---
title: Installing And Configuring the JobRunr Multi-Cluster Dashboard
description: This guide explains how to make use of a single overarching dashboard to manage multiple JobRunr cluster instances.
weight: 10
tags:
    - multicluster
    - JobRunr Pro
    - dashboard
hideFrameworkSelector: true
---

The JobRunr Multi-Cluster Dashboard is an efficient way to manage multiple JobRunr-powered clusters. Instead of having to monitor these instances using their own separate dashboard instance, you can simply monitor everything from a single dashboard where all information on your infrastructure is aggregated. As explained in [the Multi-Cluster Dashboard documentation](/en/documentation/pro/jobrunr-pro-multi-dashboard/):

> The Multi-Cluster Dashboard provides a unified view of multiple JobRunr Pro clusters (i.e., independent schedulers). We designed it to be as easy to use as possible. In fact, from a user perspective, it has the same feel and set of features as the regular JobRunr Pro Dashboard, with a few additional markers to quickly distinguish between clusters.

In this guide, we'll explore how to install and configure this dashboard. 

## The Problem: Dashboard Micromanagement

Suppose your company is a big HR technology player that hosts and sells multiple HR-related solutions such as payroll systems, worker performance analysis, and report generation tooling. Since each of these three software parts require their own security levels and can be sold separately, it makes sense to run them in isolation. 

That is; we have three JobRunr-powered applications running, each with their own database, that may or may not be connected with various messaging queues we will leave out of scope for the purposes of this guide. 

![](/guides/multicluster-guide-drawing1.png "Three separate applications with three separate dashboards.")

Monitoring (recurring) jobs on these applications means having to surf to each `/dashboard` endpoint separately. There is no simple way to glance at the total failed jobs and quickly intervene. Imagine your HR company starts investing in the creation of even more isolated components... 

## The Solution: One Dashboard To Rule Them All

Instead of having to navigate to each of the dashboards on their own, we can install a Multi-Cluster Dashboard instance and point all the other dashboard to that "master" dashboard. It will automatically aggregate all information from these endpoints and show the administrator everything in one single place:

![](/guides/multicluster-guide-drawing2.png "Managing all three separate JobRunr-powered applications with a single dashboard.")

For this to work, we can configure the Multi-Cluster Dashboard in one of two ways:

1. We set it to **auto-discover mode**. This is the preferred and easiest way to configure it. By pointing all other JobRunr installations to this master dashboard instance, these will announce themselves and the Multi-Dashboard will automatically discover and configure them. This is especially handy when multiple clusters are spinning up and tearing down dynamically (e.g. when using Kubernets).
2. We set it to **manual mode** by providing a static list of all the other dashboard endpoints. This is useful if you don't have many clusters installed and they remain stable, or if you want to point directly to StorageProviders. That way, dashboards on the single endpoints can even be disabled. 

Let's explore both by starting with the first. 

### Creating a Multi-Cluster server

Besides the obvious JobRunr dependency, we need a second one that supplies the Multi-Cluster Dashboard code. Create a new Gradle project and add the following dependencies:

```
dependencies {
    implementation group: 'org.jobrunr', name: 'jobrunr-pro', version: '8.0.5'
    implementation group: 'org.jobrunr', name: 'jobrunr-pro-multi-cluster-dashboard', version: '8.0.5'
    implementation group: 'org.slf4j', name: 'slf4j-simple', version: '2.0.16'
    // ...
}

```

After that's done, the only thing we need is a single class file that configures and bootstraps the server:

```java
public class MultiClusterServerMain {
    public static void main(String[] args) {
        new MultiClusterWebServer(
                usingStandardMultiWebServerConfiguration()
                        .andContextPath("/hr")
                        .andPort(8000)
                        .andApiKey(System.getenv().getOrDefault("MY_API_KEY", ""))
                        , MultiClusterConfiguration.usingStandardMultiClusterConfiguration())
                .start();
    }
}
```

And that's it! As you can see, the webserver configuration follows the same FLuent API standards as the configuration of a regular JobRunr cluster. Please see the [Fluent API documentation](/en/documentation/configuration/fluent/) for more information, and the [Multi-Cluster Dashboard documentation](/en/documentation/pro/jobrunr-pro-multi-dashboard/#web-server-setup) for more configuration possibilities such as queue naming and timeout configuration. 

The `MY_API_KEY` system environment property acts as an API key that needs to be plugged into existing JobRunr dashboard servers. We'll get to that in a bit, but first we have to deploy the above.

> **Note**: we are not configuring any endpoints explicitly here, hence we're using _auto-discovery_ mode. 

### Deploying the Multi-Cluster server

Starting the above `main()` will run the Multi-Cluster Dashboard at `http://localhost:8000/hr/dashboard`. You can also wrap this in a Google Jib Docker image to easily deploy it using Docker. Add the following plugin to your Gradle config:

```
plugins {
    id 'com.google.cloud.tools.jib' version '3.4.4'    
}
// ... 
jib.to.image = 'jobrunr-multi-dashboard-jib'
```

Build the image using `./gradlew jibDockerBuild` to build and upload it to your local Docker deamon. Running the server then is a matter of simply starting the image. An example `docker-compose.yml` file could look like this:

```yml
services:
  multiserver:
    image: jobrunr-multi-dashboard-jib
    ports:
      - "8000:8000"
    environment:
      MY_API_KEY: "my-secure-api-access-token"
```

### Reconfiguring the existing JobRunr clusters

For an existing cluster to announce itself to the multi-cluster dashboard, we need to slightly alter the configuration to help point it to the new endpoint including providing the `MY_API_KEY` key:

```java
var dashboardWebserverConfig = usingStandardDashboardConfiguration()
        // ...
        .andApiKey(System.getenv().getOrDefault("MY_API_KEY", ""))
        .andAutoDiscovery(usingStandardAutoDiscoveryConfiguration(
            "http://localhost:8000/hr", "Payroll Engine Cluster", "http://localhost:9000/payroll"));

JobRunrPro
        .configure()
        // ...
        .useDashboardIf(true, dashboardWebserverConfig)
        .useBackgroundJobServer(// ...
        .initialize();
```

Note that, again, we are using auto-discovery mode, meaning the instance requires a dashboard webserver that automatically issues HTTP(S) calls to the multi-cluster endpoint. `andAutoDiscovery()` requires the multi-cluster endpoint and the endpoint of that particular instance to help with the discovery: `http://localhost:9000/payroll` is this particular JobRunr dashboard endpoint. No `/dashboard` trailing URL part is needed here. 

That's pretty much it! Now the Payroll Engine Cluster will try to announce itself to the Multi-Cluster Dashboard, after which the latter will take over by asking and aggregating data based on the endpoints provided. If we repeat the procedure for the second and third cluster, the setup will be complete. After that, you can open the Multi-Dashboard and filter on specific clusters as shown in the following animation:

![](/documentation/multi-cluster-dashboard.gif)

### Using manual cluster configuration

If you do not want to enable each individual dashboard webserver or you want to statically configure all the cluster endpoints during the startup of the Multi-Cluster server, you can skip the `andAutoDiscovery()` configuration and rely on manual mode instead. We'll adjust our `MultiClusterServerMain` accordingly:

```java
public class MultiClusterServerMain {
    public static void main(String[] args) {
        var multiClusterConfig = MultiClusterConfiguration.usingStandardMultiClusterConfiguration()
            .andStorageProviderClusters(
                new StorageProviderClusterConfiguration("direct db payroll engine cluster",
                    postgresStorageProvider("jdbc:postgresql://postgres:1234/postgres", "postgres-payroll", "password")),
                new StorageProviderClusterConfiguration("direct db performance analylsis cluster",
                        postgresStorageProvider("jdbc:postgresql://postgres:4567/postgres", "postgres-performance", "password")),
                new StorageProviderClusterConfiguration("direct db reporting cluster",
                        postgresStorageProvider("jdbc:postgresql://postgres:8901/postgres", "postgres-reporting", "password")));
        new MultiClusterWebServer(
                usingStandardMultiWebServerConfiguration()
                        .andContextPath("/hr")
                        .andPort(8000))
                .start();
    }
}
```

Note following key differences:

- We're directly linking to a database using `andStorageProviderClusters()` meaning our Multi-Cluster Dashboard project will also require dataSource dependencies (in this example  you'll need to add the `com.zaxxer:HikariCP:6.2.1` and `org.postgresql:postgresql:42.7.4` dependencies to your Gradle build file).
- There is no need for an API key as that's the key used to exchange information from dashboard to dashboard over HTTP(S). Instead, we directly query using JobRunr's storage provider system.
- There is no need to reconfigure each cluster as no API key or auto discovery property is used. You can disable the dashboard on each individual cluster.

`andRestApiClusters()` is also available if you still want to point to a dashboard without directly linking to a database. Again, see the [Multi-Cluster Dashboard documentation](/en/documentation/pro/jobrunr-pro-multi-dashboard/) for more information.

Manual cluster configuration does have its downsides: you will need to programmatically update the config in `MultiClusterServerMain` if another cluster is created: it will not announce itself automatically. Also, direct database connections might or might not be possible depending on your network setup. 

## Conclusion

Instead of having to navigate to each dashboard in order to monitor job progression and handle possible errors, the Multi-Cluster Dashboard provides a quick and easy way to maintain the overview of all your background jobs, regardless of which cluster they are running on. Configuration and deployment is straightforward thanks to the auto-discovery mode and the FluentAPI configuration known and loved by JobRunr users.

If you are interested in using the Multi-Cluster dashboard, check out our complete [JobRunr Pro](/en/pro/) feature set or [Try JobRunr Pro for free](/en/try-jobrunr-pro/)!

---

➡️ Want to check out an example repository on how to deploy everything? Check out https://github.com/jobrunr/multi-cluster-dashboard-test that even comes with containerization examples using Docker!
