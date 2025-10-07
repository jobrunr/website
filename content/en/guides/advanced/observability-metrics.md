---
title: Leveraging JobRunr's Metrics and Observability Features
description: This guide explains how to expose different metrics and how to integrate JobRunr into your observability platform.
weight: 30
tags:
    - metrics
    - MicroMeter
    - observability
hideFrameworkSelector: true
---

In this guide, we will unfold JobRunr's observability features that go beyond simply logging. In part one, we'll explore how to enable outputting various metrics to integrate with your favourite monitoring platform, while in part two, we'll investigate how to integrate with OpenTelemetry to more easily trace distributed end-to-end API calls that might run through a JobRunr job. 

# 1. Metrics

Suppose your software generates important documents that _have_ to make it to the end user---a failing job should immediately trigger an alarm, without having to constantly scan and manually refresh the JobRunr dashboard. This is exactly where metrics come in. JobRunr exposes both **job-based metrics** (e.g. job counts) and **server-based metrics** (e.g. resource usage of your active background job servers). These can be configured individually. 

Under the hood, JobRunr uses [Micrometer](https://micrometer.io/docs/) as a facade layer to connect to your existing monitoring system. Micrometer supports a bunch of them: from Graphite to CloudWatch and Prometheus. Additionally, Micrometer makes it easy to integrate with existing JVM frameworks. For the purposes of this guide, we'll be using the _Spring Boot + Prometheus_ combination.

Let's first start with just Spring Boot to showcase how JobRunr's metrics integrate with Spring Boot's Actuator system.

## 1.1 Spring Boot Actuators

First, we want to make sure to depend on the right libraries. Here's an excerpt for a `build.gradle` file:

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

Start your application and surf to [http://localhost:8080/actuator/metrics](http://localhost:8080/actuator/metrics). The Spring Boot metrics endpoint should display metric names in JSON format:

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

Let's try to enable the JobRunr specific ones. As mentioned before and in the [JobRunr Metrics docs](/en/documentation/configuration/metrics/), there are background job server metrics and job metrics; both can be toggled individually:

```
jobrunr.jobs.metrics.enabled=true
jobrunr.background-job-server.metrics.enabled=true
```

> ⚠️ **Warning**: enabling job metrics will generate more database load because of querying for job statistics to generate the metrics. If you do not need `jobs` metrics but only the `background-job-server`, disable that one.

Now, `/metrics` should include, among others, `jobrunr.background-job-server.process-free-memory` (a background-job-server one), and `jobrunr.jobs.by-state` (a job metric). The latter requires further drilling down by providing a state: are you interested in enqueued jobs, processing jobs, succeeded ones, or just the failed ones? The actual metric value can be retrieved by visiting [http://localhost:8080/actuator/metrics/jobrunr.jobs.by-state?tag=state:SUCCEEDED](http://localhost:8080/actuator/metrics/jobrunr.jobs.by-state?tag=state:SUCCEEDED). 

## 1.2 Micrometer + Prometheus

Micrometer itself does not ingest these values: it merely provides a convenient way to expose them. A popular monitoring tool is [Prometheus](https://prometheus.io/) that can scrape an endpoint every x (mili)seconds to aggregate, transform, visualize, ... the data. If you're using Spring Boot, all you need to do to enable this is add an extra dependency:

```groovy
dependencies {
    // Micrometer <-> Prometheus support
    runtimeOnly 'io.micrometer:micrometer-registry-prometheus'
}
```

Spring will do the rest and auto-expose `/actuator/prometheus` for Prometheus to scrape. We still have to configure Prometheus to look for the data there. Let's spin up a simple Prometheus docker image to showcase this. Add this to your `compose.yml`:

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

This tells Prometheus to look for `localhost:8080/actuator/prometheus` and scrape the data every five seconds. 

> ⚠️ **Warning**: do not create a tiny `scrape_interval`! The more Prometheus scrapes, the more often JobRunr has to query both the database and the JVM for its current status, resulting in unusual CPU spikes. This is inherent to how the JMX bean [fetches cpu load](https://docs.oracle.com/en/java/javase/17/docs/api/jdk.management/com/sun/management/OperatingSystemMXBean.html#getCpuLoad()).

If you spin up the above container using `docker compose up` and restart your Spring Boot application, you can navigate to [http://localhost:9090](http://localhost:9090) and visualize one of JobRunr's metrics to see the effect of incoming and processed jobs. The following graph shows an influx of several 1000 job spikes:

![](/guides/prometheus.jpg "A Prometheus graph showing realtime jobrunr_jobs_by_state(SUCCEEDED) metrics.")

You can even take this a step further by involving Grafana and adding scripts that send out Slack messages if the metric rises above a certain level (for instance if a `FAILED` job occurs).

{{< label version="professional" >}}JobRunr Pro {{< /label >}}---JobRunr Pro offers more job-specific metrics such as job timings that make it easier to precisely monitor certain behaviour of JobRunr. See our [JobRunr Pro Observability docs](/en/documentation/pro/observability/) for more information.

## 1.3 Custom Micrometer Registries

If you want to have full control on where JobRunr's metrics are exported to, you can create your own `meterRegistry` bean that automatically will be injected into JobRunr's `JobRunrMicroMeterIntegration` class.

If you don't use a framework, you can rely on the Fluent API to configure this yourself:

```java
JobRunr.configure()
  // ... other config
  .useMicroMeter(new JobRunrMicroMeterIntegration(meterRegistry))
```

That way, you can inject a registry that connects to another backend, just like the `micrometer-registry-prometheus` dependency we relied on. 


➡️ A JobRunr example repository on observability metrics + Spring Boot is available at https://github.com/jobrunr/example-jobrunr-pro-spring-boot-observability. For more metrics configuration options, see our [JobRunr Metrics docs](/en/documentation/configuration/metrics/).

# 2. Tracing

For distributed end-to-end tracing, passing in a TraceId and keeping it consistent is key for observability platforms that ease distributed debugging sessions. [Jaeger](https://www.jaegertracing.io/) and  is the de facto distributed tracing platform that eases the pain of troubleshooting complex systems. By enabling JobRunr Pro's Open Telemetry observability capabilities, we can follow the TraceId both in the JobRunr Pro dashboard and in Jaeger to see how it interacts with other systems.

Let's start with the same pre-requirements as above.

## 2.1 Micrometer + Otel

We'll be using Spring Boot---that again uses Micrometer behind the scenes as an abstraction layer---together with an Open Telemetry (Otel) exporter to make sure our trace information reaches Jaeger. Jaeger will be our tracing platform of choice. 

```groovy
dependencies {
    // This is again needed as a base for Spring Boot to enable any observability
    implementation 'org.springframework.boot:spring-boot-starter-actuator'
    // The micrometer bridge to Otel
    implementation 'io.micrometer:micrometer-tracing-bridge-otel'
    // The Otel exporter so it can send data to Jaeger
    implementation 'io.opentelemetry:opentelemetry-exporter-otlp'
}
```

The above configuration tells Spring Boot to use Micrometer to export traces in the Open Telemetry format (`tracing-brdige-otel`) to our Open Telemetry-compatible tracing platform (`exporter-otlp`) that in this case happens to be Jager. For debugging purposes, you can also enable the logging exporter by including and configuring `opentelemetry-exporter-logging` to see the traceIds and details in the log output that otherwise flow to the OTLP endpoint.

Next, we need to spin up an application able to receive and interpret the traces. The following Docker Jaeger configuration will do:

```yml
services:
  collector:
    image: jaegertracing/jaeger
    ports:
      - "4318:4318"
      - "16686:16686"
    restart: unless-stopped
```

Port `4318` is the receiving port and port `16686` is the UI interface we'll use to inspect the traces in Jaeger itself. Let's continue by pointing our Spring Boot application to the `4318` endpoint. Add these two lines to your properties:

```
management.tracing.sampling.probability=1.0 # export all traces instead of the default 10%
management.otlp.tracing.endpoint=http://localhost:4318/v1/traces # point to our running instance
```

Thanks to the Spring Boot Actuator dependency, our application will automatically generate traces for each HTTP request based on Spring Boot's annotations---see the official [Actuator Tracing docs](https://docs.spring.io/spring-boot/reference/actuator/tracing.html) for more information. Traces will also be automatically propagated across the network if you use the provided Spring Rest builders to execute your HTTP calls. 

Let's create a simple `CreditCardController` to demonstrate this:

```java
@Controller
public class CreditCardController {
    @PostMapping("/register")
    public String processRegistration(@Valid @ModelAttribute("creditCard") CreditCard creditCard) {
        LOGGER.info("registering new credit card: {}", creditCard);
        creditCardService.processRegistration(creditCard);
        return "redirect:/register?success";
    }
}
```

By opening up http://localhost:16686/search and looking for that http post `/register`, we can now find the traces in Jaeger.

## 2.2 Otel + JobRunr Pro

{{< label version="professional" >}}JobRunr Pro {{< /label >}} What about asynchronous JobRunr jobs that might even fire off distributed HTTP calls? JobRunr Pro offers the ability to export job information to the OTLP exporter and to integrate the TraceId in the JobRunr dashboard. For this, we need to configure JobRunr to enable tracing observability:

```
jobrunr.jobs.metrics.otel-observability.enabled=true # enable export 
jobrunr.dashboard.integrations.observability.jaeger.root-url=http://localhost:16686/ # enable linking in dashboard
```

The first configuration enables JobRunr to piggyback onto the previously configured Spring Boot OTLP system to export its job information to Jaeger and the second one allows us to click through from the JobRunr Pro dashboard to the Jaeger instance automatically filtering on a specific traceId. 

If you fire off a job in that `creditCardService` triggered in `/register` in the above controller example, the job will be visible in the trace. You don't even need to go look for it or to enable trace logging: just open the dashboard and click on the newly appeared TraceId link:

![](/guides/jobrunrpro-dashboard-tracing.jpg "The Trace ID is available to the right of the Job ID after configuring JobRunrPro to enable otel observability.")

The link takes us to the Jaeger dashboard and automatically filters on the specific trace (`/trace/id`). There, you will find info on the JobRunr job that has been exported as well:

![](/guides/jaeger.jpg "jobrunr.job tag information displayed in Jaeger: creditCardService.createNewCreditCard via org.springframework.boot.")

Once you've got this working, the real fun can begin, as of course the power of tracing lies in the distributed part and the above screenshot shows a job running locally for demonstration purposes. This allows for the whole trace to be visualized comprised of multiple "[spans](https://www.jaegertracing.io/docs/1.22/architecture/#span)" representing logical units of work. 

➡️ For more tracing configuration options, see our [JobRunr Pro Observability docs](/en/documentation/pro/observability/).

---

# Conclusion

In this guide, we have showcased how JobRunr's observability features and your favourite framework (in this case Spring Boot) can go hand in hand. First, we have explored how to leverage Micrometer to export both generic and JobRunr-specific metrics that can be collected and inspected in an observability platform such as Prometheus. Then, we enabled the Micrometer-powered Open Telemetry exporters that flow to a tracing platform such as Jaeger. 

Both tools are indispensable for distributed systems: close system health monitoring (such as job counts, background server resource usage, ...) and tracing spans to debug across systems will help improve the quality of your software. As we have seen, JobRunr and JobRunr Pro provide easy ways to hook into your existing solutions. 

