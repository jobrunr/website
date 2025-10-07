---
title: Leveraging JobRunr's Metrics and Observability Features
description: This guide explains how to expose different metrics and how to integrate JobRunr into your OpenTelemetry observability platform.
weight: 30
draft: true
tags:
    - metrics
    - MicroMeter
    - observability
    - OpenTelemetry
hideFrameworkSelector: true
---

In this guide, we will unfold JobRunr's observability features that go beyond simply logging. In this part, we'll investigate how to integrate with OpenTelemetry to more easily trace distributed end-to-end API calls that might run through a JobRunr job. 

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

