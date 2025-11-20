---
title: "Observability: Enabling JobRunr Metrics"
description: Follow this guide to expose and integrate different JobRunr-specific metrics into your observability platform.
date: 2025-10-07T00:00:00+02:00
lastmod: 2025-10-20T00:00:00+02:00
weight: 30
tags:
    - JobRunr Pro
    - Observability
    - Micrometer
    - Tracing
---

In this guide, we will unfold JobRunr's observability features that go beyond simply logging. We'll explore how to enable publishing various metrics to integrate with your favourite monitoring platform. 

> ⚠️ **Warning**: Adding any metrics to your application will generally impact performance as it adds extra computational/IO overhead. Only do this if you intent to monitor them and be sensible with metric scraping configurations.

> If you are interested in integrating tracing capabilities into your observability platform, please consult the [observability: tracing guide](/en/guides/advanced/observability-tracing).

## Prerequisites

- JobRunr 8.0.0 or later
- You already know how to configure JobRunr
- Basic knowledge of Micrometer

## Context

Many companies rely on a centralized monitoring platform to troubleshoot their different services. These platforms work by collecting metrics, among other things, from instrumented services. JobRunr fits seamlessly into this ecosystem by exposing both **job-based metrics** (e.g. job counts) and **server-based metrics** (e.g. resource usage of your active background job servers). These can be configured individually.

Under the hood, JobRunr uses [Micrometer](https://micrometer.io/docs/) as a facade layer to connect to your existing monitoring system. JobRunr is tool agnostic: you can use any existing observability platform you already have in place. Micrometer supports a bunch of them: from Graphite to CloudWatch and Prometheus, [and more](https://docs.micrometer.io/micrometer/reference/implementations.html). Additionally, Micrometer makes it easy to integrate with various JVM frameworks. 

Let's first start with just a base observability framework to then showcase how JobRunr's metrics integrate with the Micrometer metrics system.

## Setup

First, we add the following dependencies to our application, using Gradle, feel free to adapt to Maven or your preferred build tool. This naturally includes JobRunr and Micrometer. Note, in this guide, we use [Prometheus](https://prometheus.io/), a popular open source system monitoring platform, to collect and visualize the exposed JobRunr metrics.

> Although we use Prometheus, you may replace the dependency by another that works with your platform of choice. Micrometer offers [several other implementations](https://docs.micrometer.io/micrometer/reference/implementations.html).

{{< framework type="fluent-api" >}}
```groovy
dependencies {
    implementation 'org.jobrunr:jobrunr:{{< param "JobRunrVersion" >}}'
    // or implementation 'org.jobrunr:jobrunr-pro:{{< param "JobRunrVersion" >}}' for JobRunr Pro users
    implementation 'io.micrometer:micrometer-registry-prometheus:1.15.4' // always check for a newer version! 
}
```
{{< /framework >}}

{{< framework type="spring-boot" label="Spring" >}}
If you don't have a Spring Boot application, you can scaffold a new one using https://start.spring.io/. Then, add the following dependencies if you do not yet have them:

```groovy
dependencies {
    implementation 'org.jobrunr:jobrunr-spring-boot-3-starter:{{< param "JobRunrVersion" >}}'
    // or implementation 'org.jobrunr:jobrunr-spring-boot-3-starter:{{< param "JobRunrVersion" >}}' for JobRunr Pro users
    implementation 'org.springframework.boot:spring-boot-starter-actuator'
    implementation 'io.micrometer:micrometer-registry-prometheus'
}
```

The actuator dependency exposes vital monitoring information (e.g. dump info, resource info, ...) through an HTTP endpoint. By default, [Spring Boot's actuators](https://docs.spring.io/spring-boot/how-to/actuator.html) do not expose all endpoints: only `/health` and `/info` are available, but the one we're interested in---`/metrics`---is disabled. Let's expose the metrics endpoint by changing the following `application.properties` settings:

```
management.endpoints.web.exposure.include=*
management.endpoint.health.show-details=always
```

Next, start your application and surf to [http://localhost:8080/actuator/metrics](http://localhost:8080/actuator/metrics) (you may need to tweak this link if you use a different port). The metrics endpoint should display metric names in JSON format:

```json
{
  "names": [
    "jvm.gc.pause",
    "jvm.buffer.memory.used",
    "jvm.memory.used",
    "jvm.buffer.count",
    // ...
  ]
}
```

> For extra details on Micrometer's integration in Spring follow: https://docs.spring.io/spring-boot/reference/actuator/metrics.html.
{{< /framework >}}

{{< framework type="quarkus" label="Quarkus">}}
If you don't have a Quarkus application, you can scaffold a new one using https://code.quarkus.io/. Then, add the following dependencies if you do not yet have them:

```groovy
dependencies {
    implementation 'org.jobrunr:quarkus-jobrunr:{{< param "JobRunrVersion" >}}'
    // or implementation 'org.jobrunr:quarkus-jobrunr-pro:{{< param "JobRunrVersion" >}}' for JobRunr Pro users
    implementation 'io.quarkus:quarkus-micrometer-registry-prometheus'
}
```

Collected metrics are exposed at [http://localhost:8080/q/metrics](http://localhost:8080/q/metrics), in the Prometheus `application/openmetrics-text` format.

> For extra details on Micrometer's integration in Quarkus follow: https://quarkus.io/guides/telemetry-micrometer.
{{< /framework >}}

{{< framework type="micronaut" label="Micronaut">}}
If you don't have a Micronaut application, you can scaffold a new one using https://micronaut.io/launch/. Then, add the following dependencies if you do not yet have them:

```groovy
dependencies {
    implementation 'org.jobrunr:jobrunr-micronaut:8.1.0'
    // ... other micronaut dependencies
    implementation 'io.micronaut:micronaut-management'
    implementation 'io.micronaut.micrometer:micronaut-micrometer-core'
    implementation 'io.micronaut.micrometer:micronaut-micrometer-registry-prometheus'
}
```

The management and micrometer-core dependency expose vital monitoring information (e.g. dump info, resource info, ...) through an HTTP endpoint. By default, Micronaut does not expose all endpoints. Since we're interested in `/metrics`, let's expose the metrics endpoint by changing the following `application.yml` settings:

```
micronaut:
  metrics:
    enabled: true
endpoints:
  metrics:
    enabled: true
    sensitive: false
```

Next, start your application and surf to [http://localhost:8080/metrics](http://localhost:8080/metrics) (you may need to tweak this link if you use a different port). The metrics endpoint should display metric names in JSON format:

```json
{
  "names": [
    "jvm.gc.pause",
    "jvm.buffer.memory.used",
    "jvm.memory.used",
    "jvm.buffer.count",
    // ...
  ]
}
```

> For extra details on Micrometer's integration in Micronaut follow: https://micronaut-projects.github.io/micronaut-micrometer/latest/guide.
{{< /framework >}}

> To learn more about micrometer follow: https://docs.micrometer.io/micrometer/reference/.

### JobRunr Configuration

Next, let's try to enable the JobRunr specific metrics. As mentioned before and in the [JobRunr Metrics docs](/en/documentation/configuration/metrics/), there are background job server metrics and job metrics; both can be toggled individually:

{{< framework type="fluent-api" >}}
```java
var meterRegistry = new PrometheusMeterRegistry(PrometheusConfig.DEFAULT);
JobRunr.configure()
  // ... other config
  .useMicroMeter(new JobRunrMicroMeterIntegration(meterRegistry))
```
{{< /framework >}}
{{< framework type="spring-boot" label="Spring">}}
```
jobrunr.jobs.metrics.enabled=true
jobrunr.background-job-server.metrics.enabled=true
```

When `jobrunr.background-job-server.metrics.enabled` is missing, then the server metrics are enabled by default.
{{< /framework >}}
{{< framework type="quarkus" label="Quarkus">}}
```
quarkus.jobrunr.jobs.metrics.enabled=true
quarkus.jobrunr.background-job-server.metrics.enabled=true
```
{{< /framework >}}
{{< framework type="micronaut" label="Micronaut">}}
```
jobrunr.jobs.metrics.enabled=true
jobrunr.background-job-server.metrics.enabled=true
```

When `jobrunr.background-job-server.metrics.enabled` is missing, then the server metrics are enabled by default.
{{< /framework >}}

This configuration adds instrumentation at to the `StorageProvider` (for frameworks, this is enabled with `jobrunr.jobs.metrics.enabled`) and the `BackgroundJobServer`. 
- The `StorageProvider` instrumentation adds different statistics to the metrics (e.g., job counts per state, number of recurring jobs and number of background job servers). These metrics are published with prefix `jobrunr.jobs.by-state` and identifiable by their tags. Therefore you'll need to provide a the tag of interest. For instance, if you are using a framework, the actual metric value can be retrieved by visiting `/metrics/jobrunr.jobs.by-state?tag=state:SUCCEEDED`.
- The `BackgroundJobServer` instrumentation makes available metrics on resource usage by the server, e.g., CPU usage, memory usage, etc. These metrics are retrieved using `OperatingSystemMXBean`. The server metrics also include other background job server configuration values, such as the poll interval and the worker pool size but also the license key expiry date for JobRunr Pro users. These metrics are published with prefix `jobrunr.background-job-server`.

> ⚠️ **Warning**: Be careful with enabling `StorageProvider` metrics as this generates more database load. Ideally, only enable it on the same server running the dashboard.

#### {{< badge version="professional" >}}JobRunr Pro {{< /badge >}} Job Timings {#job-timings}

In addition to `StorageProvider` and `BackgroundJobServer` metrics, JobRunr Pro can instrument job executions to export processing times and other metrics like job failure count per job type. For the specific metrics, see the documentation page: [Micrometer job timings]({{< ref "documentation/pro/observability.md#micrometer-job-timings" >}}).

You can enable this instrumentation as follows:

{{< framework type="fluent-api" >}}
```java
var meterRegistry = new PrometheusMeterRegistry(PrometheusConfig.DEFAULT);
JobRunr.configure()
  // ... other config
  .useMicroMeter(new JobRunrMicroMeterIntegration(meterRegistry, /* publishJobTimings */ true))
```
{{< /framework >}}
{{< framework type="spring-boot" label="Spring">}}
```
jobrunr.jobs.metrics.micrometer-timers.enabled=true
```
{{< /framework >}}
{{< framework type="quarkus" label="Quarkus">}}
```
quarkus.jobrunr.jobs.metrics.micrometer-timers.enabled=true
```
{{< /framework >}}
{{< framework type="micronaut" label="Micronaut">}}
```
jobrunr:
  jobs:
    metrics:
      micrometer-timers:
        enabled: true
```
{{< /framework >}}

Of course, you also need a running `BackgroundJobServer`.

Furthermore, if your jobs are labelled with the following format `key`:`value` (e.g., `customer:a`, `building:z`), you can instruct JobRunr to publish the above metrics with these job labels.

{{< framework type="fluent-api" >}}
```java
var meterRegistry = new PrometheusMeterRegistry(PrometheusConfig.DEFAULT);
JobRunr.configure()
  // ... other config
  .useMicroMeter(new JobRunrMicroMeterIntegration(meterRegistry, /* labelsToPublish */ "customer", "building"))
```
{{< /framework >}}
{{< framework type="spring-boot" label="Spring">}}
```
jobrunr.jobs.metrics.micrometer-timers.enabled=true
jobrunr.jobs.metrics.micrometer-timers.labels-to-publish=customer,building
```
{{< /framework >}}
{{< framework type="quarkus" label="Quarkus">}}
```
quarkus.jobrunr.jobs.metrics.micrometer-timers.enabled=true
quarkus.jobrunr.jobs.metrics.micrometer-timers.labels-to-publish=customer,building
```
{{< /framework >}}
{{< framework type="micronaut" label="Micronaut">}}
```
jobrunr:
  jobs:
    metrics:
      micrometer-timers:
        enabled: true
        labels-to-publish: customer,building
```
{{< /framework >}}

With the above, if a Job is labelled with `customer:a`, the tag `job.labels.customer=a` is added to the reported metrics by when executing that job.

> Be extra careful when enabling this option and make sure the label values are finite to avoid the [_tag cardinality explosion_](https://www.robustperception.io/cardinality-is-key/). Otherwise, it could lead to huge performance issues and increased expenses.

> 💡 JobRunr include other tags: e.g., the job type--`jobSignature`--, the priority queue name, the dynamic queue name, the server name and the server tag. Make sure the values of these attributes are always predictable and finite, for instance always give a name to your background job servers. You can rely on tools from you platform of choice to filter out some tags. For instance, you can [instruct Prometheus](https://prometheus.io/docs/prometheus/latest/configuration/configuration/) to only keep some labels with `labelkeep` or drop any label you don't want with `labeldrop`.

## Scrape and Visualize Metrics with Prometheus

Micrometer itself does not ingest these values: it merely provides a convenient way to expose them. A popular monitoring tool is [Prometheus](https://prometheus.io/) that can scrape an endpoint every x milliseconds to aggregate, transform, visualize, ... the data. 

### Prometheus Setup

First, let's make sure there is an endpoint from which Prometheus can fetch the metrics.

{{< framework type="fluent-api" >}}
We'll have to expose `/prometheus` ourselves if we don't rely on a framework doing it for us:

> If you're building your application with a framework, it may already provide a prometheus-compatible endpoint for you.

```java
HttpServer server = HttpServer.create(new InetSocketAddress(8080), 0);

server.createContext("/prometheus", exchange -> {
    String response = meterRegistry.scrape(); // meterRegistry should be the same as the one provided to JobRunr
    exchange.getResponseHeaders().add("Content-Type", "text/plain; version=0.0.4");
    exchange.sendResponseHeaders(200, response.getBytes().length);
    try (OutputStream os = exchange.getResponseBody()) {
        os.write(response.getBytes());
    }
});

new Thread(server::start).start();
```

> Micrometer documentation provides [more configuration options](https://docs.micrometer.io/micrometer/reference/implementations/prometheus.html#_configuring).
{{< /framework >}}
{{< framework type="spring-boot" label="Spring">}}
By adding the `io.micrometer:micrometer-registry-prometheus` dependency, Spring will do the rest and auto-expose `/actuator/prometheus` for Prometheus to scrape. 
{{< /framework >}}
{{< framework type="quarkus" label="Quarkus">}}
Quarkus, by default, exposes metrics in a Prometheus compatible format [http://localhost:8080/q/metrics](http://localhost:8080/q/metrics).
{{< /framework >}}
{{< framework type="micronaut" label="Micronaut">}}
Since the default Micronaut `/metrics` endpoint is not compatible with Prometheus, we need to do some small changes to our `application.yaml`:

```yml
micronaut:
  metrics:
    enabled: true
    export:
      prometheus:
        enabled: true
        step: PT1M
endpoints:
  prometheus:
    enabled: true
    sensitive: false
```

This now exposes the prometheus compatible metrics under `/prometheus`.
{{< /framework >}}

We still have to configure Prometheus to look for the data there. Let's spin up a simple Prometheus docker image to showcase this. Add this to your `compose.yml`:

```yml
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    restart: unless-stopped
```

And create a `prometheus.yml` file in the root of your project:

{{< framework type="fluent-api" >}}
```yml
global:
  scrape_interval: 5s

scrape_configs:
  - job_name: "prometheus_jobr"
    metrics_path: '/prometheus'
    static_configs:
      - targets: [ 'host.docker.internal:8080' ]
```
{{< /framework >}}
{{< framework type="spring-boot" label="Spring">}}
```yml
global:
  scrape_interval: 5s

scrape_configs:
  - job_name: "prometheus_jobr"
    metrics_path: '/actuator/prometheus'
    static_configs:
      - targets: [ 'host.docker.internal:8080' ]
```
{{< /framework >}}
{{< framework type="quarkus" label="Quarkus">}}
```yml
global:
  scrape_interval: 5s

scrape_configs:
  - job_name: "prometheus_jobr"
    metrics_path: '/q/metrics'
    static_configs:
      - targets: [ 'host.docker.internal:8080' ]
```
{{< /framework >}}
{{< framework type="micronaut" label="Micronaut">}}
```yml
global:
  scrape_interval: 5s

scrape_configs:
  - job_name: "prometheus_jobr"
    metrics_path: '/prometheus'
    static_configs:
      - targets: [ 'host.docker.internal:8080' ]
```
{{< /framework >}}


Here we tell Prometheus to scrape the data every 5 seconds by connecting to the `targets`. The `metrics_path` tells Prometheus which endpoint exposes the metrics.

### Detect Spikes with Prometheus Dashboard

Let's create an endpoint to create 1000 jobs showcasing how Prometheus visualizes the sudden spike in jobs. 

{{< framework type="fluent-api" >}}
We presume you created a REST server exposed at port `8080` that can serve the GET endpoint `/bulk-add-cards`:

```java
public class AdminController {

  // This is a GET endpoint at /bulk-add-cards
  public void bulkAddCreditCards() {
    jobScheduler.enqueue(
      IntStream.range(0, 1000).boxed(),
      i -> System.out.println("creating new credit card #" + i)
    );
  }
}
```
{{< /framework >}}
{{< framework type="spring-boot" label="Spring">}}
```java
@Controller
public class AdminController {
  private final JobScheduler jobScheduler;
  
  public AdminController(JobScheduler jobScheduler) {
    this.jobScheduler = jobScheduler;
  }

  @GetMapping({"/bulk-add-cards"})
  public void bulkAddCreditCards() {
    jobScheduler.enqueue(
      IntStream.range(0, 1000).boxed(),
      i -> System.out.println("creating new credit card #" + i)
    );
  }
}
```
{{< /framework >}}
{{< framework type="micronaut" label="Micronaut">}}
```java
@Controller
public class AdminController {
  private final JobScheduler jobScheduler;
  
  public AdminController(JobScheduler jobScheduler) {
    this.jobScheduler = jobScheduler;
  }

  @Get("/bulk-add-cards")
  public void bulkAddCreditCards() {
    jobScheduler.enqueue(
      IntStream.range(0, 1000).boxed(),
      i -> System.out.println("creating new credit card #" + i)
    );
  }
}
```

{{< /framework >}}
{{< framework type="quarkus" label="Quarkus">}}
```java
@ApplicationScoped
public class AdminResource {
  JobScheduler jobScheduler;
  
  public AdminResource(JobScheduler jobScheduler) {
    this.jobScheduler = jobScheduler;
  }

  @GET
  @Path("/bulk-add-cards")
  public void bulkAddCreditCards() {
    jobScheduler.enqueue(
      IntStream.range(0, 1000).boxed(),
      i -> System.out.println("creating new credit card #" + i)
    );
  }
}
```
{{< /framework >}}

If you spin up the above container using `docker compose up` and start your application, you can navigate to [http://localhost:9090](http://localhost:9090) and visualize one of JobRunr's metrics to see the effect of incoming and processed jobs. The following graph shows an influx of several 1000 job spikes after continually hitting [http://localhost:8080/bulk-add-cards](http://localhost:8080/bulk-add-cards) as a test:

![](/guides/prometheus.jpg "A Prometheus graph showing realtime jobrunr_jobs_by_state(SUCCEEDED) metrics.")

You can even take this a step further by involving [Grafana](https://grafana.com/) and adding scripts that send out Slack messages if the metric rises above a certain level (for instance if a lot jobs start failing).

## Configuring Custom Micrometer Registries

If you want to have full control on where JobRunr's metrics are exported and go beyond the auto-configuration magic. You can directly create and manage instances of the following classes involved in instrumenting JobRunr.

- `StorageProviderMetricsBinder` requires a `StorageProvider` and `MeterRegistry`. This instrumentation provides global statics on the system (number of jobs in each state, number of recurring jobs and number of background job servers). The metric is key is `jobrunr.jobs.by-state` and identifiable by the `state` tag. ⚠️ Its lifecycle is tied to the `StorageProvider`, thus you need to close it before closing the `StorageProvider`.
- `BackgroundJobServerMetricsBinder` requires a `StorageProvider` and `MeterRegistry`. This instrumentation provides information on the performance of a server (different CPU and memory usage metrics) in addition to server configuration information (e.g., the worker pool size). Should be closed when stopping the `BackgroundJobServer`.
- `MicroMeterJobMetrics` requires `MeterRegistry` and `Queues` (can be given optional other arguments). This instrumentation provides job timings (e.g., execution time, actively processing jobs, etc., [see above for details]({{< ref "#job-timings" >}})). It's a `JobServerFilter` that needs to be provided to the `BackgroundJobServer`. See [Job Filters]({{< ref "/documentation/pro/job-filters">}}) for more details.


## Conclusion

By configuring job and background server metrics, JobRunr is able to plug into the existing metrics observability system of your framework of choice, relaying job stats and background server resource information to an observability platform such as Prometheus. Close system health monitoring is an indispensable part of improving the quality of your software. As we have seen, JobRunr and JobRunr Pro provides easy ways to expand these, in addition to the builtin JobRunr Dashboard.

## Resources

- A JobRunr Pro example repository on observability metrics + Spring Boot is available at https://github.com/jobrunr/example-jobrunr-pro-spring-boot-observability (private repo accessible to JobRunr Pro customers).


## Further reading
- [More metrics configuration options](/en/documentation/configuration/metrics/)
- [How to publish Job execution traces](/en/guides/advanced/observability-tracing)

