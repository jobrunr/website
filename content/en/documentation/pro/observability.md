---
version: "pro"
title: "Observability"
subtitle: "JobRunr Pro integrates with your observability platform to make sure all your jobs keep running like clockwork"
keywords: ["observability", "configuration", "observability metrics", "observability in it", "define observability", "metrics observability", "real time observability", "it observability", "observability it", "micrometer job timings", "integrates with observability platform", "jobs keep running", "observability in micrnaut", "observability in spring boot", "observability in quarkus"]
date: 2020-08-27T11:12:23+02:00
layout: "documentation"
menu: 
  main: 
    identifier: observability
    parent: 'jobrunr-pro'
    weight: 2
---
{{< trial-button >}}

Although the JobRunr Pro Dashboard gives instant insights how your jobs are doing, you may already have an observability platform like [Jaeger](https://www.jaegertracing.io/), [HoneyComb](https://www.honeycomb.io) or [New Relic](https://newrelic.com) running. JobRunr Pro out-of-the box integrates with many of these observability platforms so you can keep on top of things.


## MicroMeter Job Timings
JobRunr allows to export amount of jobs processed, average job duration, maximum job duration and other metrics like job failure count per job. This allows you to reuse your existing tools like [Prometheus](https://prometheus.io), [Grafana](https://grafana.net), ... and be notified by your existing alerting platform in case things go south.

### Configuration
You can easily enable these timings in Spring Boot, Micronaut and Quarkus using your existing configuration:

<figure>

```
org.jobrunr.jobs.metrics.micrometer-timers.enabled=true
```
<figcaption>This configuration shows how to enable the MicroMeter timers.</figcaption>
</figure>


{{< trial-button >}}

## Observability
You can also integrate JobRunr with your observability platform thanks to [OpenTelemetry](https://opentelemetry.io/) and [MicroMeter](https://micrometer.io/).

Using the integration of your choice will not only show you the TraceId within the JobRunr Pro Dashboard but it will also show detailed job information in your observability platform.

![](/documentation/jobrunr-pro-traceid.png "Jaeger - the duration and all the different API interactions over multiple microservices are automatically available")

![](/documentation/jobrunr-pro-jaeger-succeeded-job.png "Jaeger - the duration and all the different API interactions over multiple microservices are automatically available")

![](/documentation/jobrunr-pro-jaeger-failed-job.png "Jaeger - if a job failed, you can easily see what is happening")

### Configuration
You can easily enable observability in Spring Boot, Micronaut and Quarkus using your existing configuration:

<figure>

```
# enable linking from within the JobRunr Pro Dashboard to your Tracing Provider
org.jobrunr.dashboard.integrations.observability.jaeger.root-url=http://localhost:16686/

# if you prefer MicroMeter
org.jobrunr.jobs.metrics.micrometer-observability.enabled=true

# or, if you prefer OpenTelemetry
org.jobrunr.jobs.metrics.otel-observability.enabled=true
```
<figcaption>Just define your preferred observability intregration.</figcaption>
</figure>



{{< trial-button >}}