---
title: "Observability: Enabling JobRunr Metrics"
description: Follow this guide to expose and integrate different JobRunr-specific metrics into your observability platform.
weight: 30
draft: true
tags:
    - JobRunr Pro
    - observability
    - MicroMeter
    - tracing
---

In this guide, we will unfold JobRunr's observability features that go beyond simply logging. We'll explore how to enable outputting various metrics to integrate with your favourite monitoring platform. If you are interested in integrating tracing capabilities into your observability platform, please consult the [observability: tracing guide](/guides/advanced/observability-tracing) instead.

> ⚠️ **Warning**: Adding any metrics to your application will generally impact performance as it adds extra computational/IO overhead. Only do this if you intent to monitor them and be sensible with metric scraping configurations.

Suppose your software generates important documents that _have_ to make it to the end user---a failing job should immediately trigger an alarm, without having to constantly scan and manually refresh the JobRunr dashboard. This is exactly where metrics come in. JobRunr exposes both **job-based metrics** (e.g. job counts) and **server-based metrics** (e.g. resource usage of your active background job servers). These can be configured individually. 

Under the hood, JobRunr uses [Micrometer](https://micrometer.io/docs/) as a facade layer to connect to your existing monitoring system. Micrometer supports a bunch of them: from Graphite to CloudWatch and Prometheus. Additionally, Micrometer makes it easy to integrate with existing JVM frameworks. 

Let's first start with just the base framework to showcase how JobRunr's metrics integrate with the Micrometer metrics system.

## Framework Setup

{{< framework type="fluent-api" >}}
Please **select a framework of your choice** on the top right of this article.
{{< /framework >}}
{{< framework type="quarkus" label="Quarkus">}}
In Quarkus, there’s no separate generic Micrometer `/metrics` HTTP endpoint like in Micronaut or Spring Boot that returns JSON. Instead, if you directly configure and add the Prometheus dependency, that endpoint will directly expose metrics in the Prometheus format. 

Therefore, if you're using Quarkus, you can skip this step and go directly to the "Enabling Micrometer + Prometheus" step.
{{< /framework >}}
{{< framework type="spring-boot" label="Spring">}}
Scaffoled a new Spring Boot application using https://start.spring.io/. Then, we want to make sure to depend on the right libraries (adding JobRunr and Spring Boot's Actuator). Here's an excerpt for a `build.gradle` file:

```groovy
dependencies {
    implementation 'org.jobrunr:jobrunr-spring-boot-3-starter:8.1.0'
    implementation 'org.springframework.boot:spring-boot-starter-actuator'
}
```

The actuator dependency exposes vital monitoring information (e.g. dump info, resource info, ...) through an HTTP endpoint. By default, [Spring Boot's actuators](https://docs.spring.io/spring-boot/how-to/actuator.html) do not expose all endpoints: only `/health` and `/info` are available, but the one we're interested in---`/metrics`---is disabled. Let's expose the metrics endpoint by changing the following `application.properties` settings:

```
management.endpoints.web.exposure.include=*
management.endpoint.health.show-details=always
```

Next, start your application and surf to [http://localhost:8080/actuator/metrics](http://localhost:8080/actuator/metrics). The Micrometer metrics endpoint should display metric names in JSON format:

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
{{< /framework >}}
{{< framework type="micronaut" label="Micronaut">}}
Create a new Micronaut application. Then, we want to make sure to depend on the right libraries (adding JobRunr and Micronaut's bindings for Micrometer). Here's an excerpt for a `build.gradle` file:

```groovy
dependencies {
    implementation 'org.jobrunr:jobrunr-micronaut:8.1.0'
    // ... other micronaut dependencies
    implementation 'io.micronaut:micronaut-management'
    implementation 'io.micronaut.micrometer:micronaut-micrometer-core'
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

Next, start your application and surf to [http://localhost:8080/metrics](http://localhost:8080/metrics). The Micrometer metrics endpoint should display metric names in JSON format:

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
{{< /framework >}}

Let's try to enable the JobRunr specific metrics. As mentioned before and in the [JobRunr Metrics docs](/en/documentation/configuration/metrics/), there are background job server metrics and job metrics; both can be toggled individually:

```
jobrunr.jobs.metrics.enabled=true
jobrunr.background-job-server.metrics.enabled=true
```

> ⚠️ **Warning**: Be careful with enabling `jobs` metrics as this generates more database load. Ideally, only enable it on the same server running the dashboard.

Now, `/metrics` should include, among others, `jobrunr.background-job-server.process-free-memory` (a background-job-server one), and `jobrunr.jobs.by-state` (a job metric). The latter requires further drilling down by providing a state: are you interested in enqueued jobs, processing jobs, succeeded ones, or just the failed ones? The actual metric value can be retrieved by visiting `/metrics/jobrunr.jobs.by-state?tag=state:SUCCEEDED`. 

## Enabling Micrometer + Prometheus

Micrometer itself does not ingest these values: it merely provides a convenient way to expose them. A popular monitoring tool is [Prometheus](https://prometheus.io/) that can scrape an endpoint every x (mili)seconds to aggregate, transform, visualize, ... the data. 

{{< framework type="fluent-api" >}}
Please **select a framework of your choice** on the top right of this article.
{{< /framework >}}
{{< framework type="quarkus" label="Quarkus">}}
If you're using Quarkus, we need to add the following extra dependency:

```groovy
dependencies {
    // JobRunr support for Quarkus
    implementation 'org.jobrunr:quarkus-jobrunr:8.1.0'
    // Micrometer <-> Prometheus support
    implementation 'io.quarkus:quarkus-micrometer-registry-prometheus'
}
```

Then, we want to expose `/prometheus` with the Prometheus-specific properties format. Add the following configuration:

```
quarkus.micrometer.enabled=true
quarkus.micrometer.export.prometheus.enabled=true
quarkus.micrometer.export.prometheus.path=/prometheus
```

{{< /framework >}}
{{< framework type="spring-boot" label="Spring">}}
If you're using Spring Boot, all you need to do to enable this is add an extra dependency:

```groovy
dependencies {
    // Micrometer <-> Prometheus support
    runtimeOnly 'io.micrometer:micrometer-registry-prometheus'
}
```

Spring will do the rest and auto-expose `/actuator/prometheus` for Prometheus to scrape. 
{{< /framework >}}
{{< framework type="micronaut" label="Micronaut">}}
If you're using Micronaut, we need to add the following extra dependency:

```groovy
dependencies {
    // Micrometer <-> Prometheus support
    implementation 'io.micronaut.micrometer:micronaut-micrometer-registry-prometheus'
}
```

Then, instead of exposing `/metrics`, we want to expose `/prometheus` with the Prometheus-specific properties format. Add the following configuration:

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

Note that we already enabled `micronaut.metrics` before but we did not export and enable the `prometheus` key.
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

```yml
global:
  scrape_interval: 5s

scrape_configs:
  - job_name: "prometheus_jobr"
    metrics_path: '/actuator/prometheus'
    static_configs:
      - targets: [ 'host.docker.internal:8080' ]
```

This tells Prometheus to look for `localhost:8080/actuator/prometheus` and scrape the data every five seconds. For other frameworks, simply `/pometheus` will suffice.

Let's create an endpoint to create 1000 jobs to showcase how Prometheus visualizes the sudden spike in jobs. 

{{< framework type="fluent-api" >}}
Please **select a framework of your choice** on the top right of this article.
{{< /framework >}}
{{< framework type="quarkus" label="Quarkus">}}
```java
@ApplicationScoped
public class AdminResource {
    @Inject
    JobScheduler jobScheduler;
    
    public AdminController(JobScheduler jobScheduler) {
      this.jobScheduler = jobScheduler;
    }

    @GET
    @Path("/bulk-add-cards")
    public void bulkAddCreditCards() {
        for(int i = 1; i <= 1000; i++) {
            jobScheduler.enqueue(() -> System.out.println("creating new credit card #" + i));
        }
    }
}
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
        for(int i = 1; i <= 1000; i++) {
            jobScheduler.enqueue(() -> System.out.println("creating new credit card #" + i));
        }
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
        for(int i = 1; i <= 1000; i++) {
            jobScheduler.enqueue(() -> System.out.println("creating new credit card #" + i));
        }
    }
}
```
{{< /framework >}}

If you spin up the above container using `docker compose up` and restart your Spring Boot application, you can navigate to [http://localhost:9090](http://localhost:9090) and visualize one of JobRunr's metrics to see the effect of incoming and processed jobs. The following graph shows an influx of several 1000 job spikes after continually hitting [http://localhost:8080/bulk-add-cards](http://localhost:8080/bulk-add-cards) as a test:

![](/guides/prometheus.jpg "A Prometheus graph showing realtime jobrunr_jobs_by_state(SUCCEEDED) metrics.")

You can even take this a step further by involving Grafana and adding scripts that send out Slack messages if the metric rises above a certain level (for instance if a `FAILED` job occurs).

{{< label version="professional" >}}JobRunr Pro {{< /label >}}---JobRunr Pro offers more job-specific metrics such as job timings that make it easier to precisely monitor certain behaviour of JobRunr. See our [JobRunr Pro Observability docs](/en/documentation/pro/observability/) for more information.

## Configuring Custom Micrometer Registries

If you want to have full control on where JobRunr's metrics are exported to, you can create your own `meterRegistry` bean that automatically will be injected into JobRunr's `JobRunrMicroMeterIntegration` class.

If you don't use a framework, you can rely on the Fluent API to configure this yourself:

```java
JobRunr.configure()
  // ... other config
  .useMicroMeter(new JobRunrMicroMeterIntegration(meterRegistry))
```

That way, you can inject a registry that connects to another backend, just like the `micrometer-registry-prometheus` dependency we relied on. 


➡️ A JobRunr example repository on observability metrics + Spring Boot is available at https://github.com/jobrunr/example-jobrunr-pro-spring-boot-observability. For more metrics configuration options, see our [JobRunr Metrics docs](/en/documentation/configuration/metrics/).


# Conclusion

By configuring job and background server metrics, JobRunr is able to plug into the existing metrics observability system of your framework of choice, relaying among others job stats and background server resource information to an observability platform such as Prometheus. Close system health monitoring is an indispensable part of improving the quality of your software. As we have seen, JobRunr and JobRunr Pro provides easy ways to expand these.

If you are interested in also integrating tracing capabilities into your observability platform, please consult the [observability: tracing guide](/guides/advanced/observability-tracing).
