---
title: "Metrics"
keywords: ["JobRunr Metrics"]
subtitle: "Expose JobRunr specific metrics to seamlessly integrate with your monitoring system of choice."
date: 2025-09-26T13:15:00+02:00
layout: "documentation"
menu: 
  sidebar:
    parent: 'configuration'
    weight: 22
---

JobRunr can be configured to export metrics informing your monitoring system of choice on how many jobs are enqueued, processed, failed, ... and how much resources the background job server is currently using. We distinguish two different types of metrics (see below). 

Enabling these is as simple as adding one line to your `application.properties` file. If you're using a Spring Actuator-enabled Spring Boot project, the setting will integrate with Spring's actuator endpoint at [http://localhost:8080/actuator/metrics](http://localhost:8080/actuator/metrics). 

If you'd like to configure the Micrometer meter registry yourself or do not use frameworks in your project, you can use the Fluent API to configure metrics:

```java
JobRunr.configure()
  // ... other config
  .useMicroMeter(new JobRunrMicroMeterIntegration(meterRegistry))
```

Here, `meterRegistry` can be an injected bean from your framework, or you can create it yourself (e.g. a `SimpleMeterRegistry`, a `JmxMeterRegistry`, a `PrometheusMeterRegistry`, ...---depending on your monitoring backend). For more information on how to configure the registry, see the [Micrometer Documentation](https://docs.micrometer.io/micrometer/reference/).


## 1. Background Job Server Metrics

How to enable: `jobrunr.background-job-server.metrics.enabled=true`. For Spring and Micronaut, this is `true` by default.

The following metrics are exposed:

```
jobrunr.background-job-server.first-heartbeat
jobrunr.background-job-server.last-heartbeat
jobrunr.background-job-server.poll-interval-in-seconds
jobrunr.background-job-server.process-all-located-memory
jobrunr.background-job-server.process-cpu-load
jobrunr.background-job-server.process-free-memory
jobrunr.background-job-server.system-cpu-load
jobrunr.background-job-server.system-free-memory
jobrunr.background-job-server.system-total-memory
jobrunr.background-job-server.worker-pool-size
```

## 2. Job Metrics

How to enable: `jobrunr.jobs.metrics.enabled=true`. This is **disabled** by default to preserve resources.

The following metrics are exposed:

```
jobrunr.jobs.by-state
```

Where `jobrunr.jobs.by-state` can be further drilled down by adding a state as request parameter; e.g. [http://localhost:8080/actuator/metrics/jobrunr.jobs.by-state?tag=state:SUCCEEDED](http://localhost:8080/actuator/metrics/jobrunr.jobs.by-state?tag=state:SUCCEEDED).

{{< badge version="professional" >}}JobRunr Pro {{< /badge >}}---JobRunr Pro offers more job-specific metrics such as job timings. For more info, see the [JobRunr Pro Observability docs](/en/documentation/pro/observability/#micrometer-job-timings).
