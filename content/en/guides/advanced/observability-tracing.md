---
title: "Observability: Tracing JobRunr Jobs"
description: Follow this guide to enable and configure distributed tracing for JobRunr Pro jobs using your observability platform of choice.
weight: 30
drawing: https://excalidraw.com/#json=eVCmWXqZLhc1hQGLVyDpN,ePXi5lYY-0msET2JM_btOg
draft: true
tags:
    - observability
    - metrics
    - MicroMeter
---

In this {{< label version="professional" >}}JobRunr Pro {{< /label >}} guide, we will unfold JobRunr's observability features that go beyond simply logging. In this part, we'll investigate how to integrate with OpenTelemetry to more easily trace distributed end-to-end API calls that might run through a JobRunr job. 

If you are interested in exposing JobRunr-specific metrics and feeding these into your observability platform, please consult the [observability: metrics guide](/guides/advanced/observability-metrics) instead.

For distributed end-to-end tracing, passing in a TraceId and keeping it consistent is key for observability platforms that ease distributed debugging sessions. [Jaeger](https://www.jaegertracing.io/) and [Zipkin](https://zipkin.io/) are popular distributed tracing platforms that ease the pain of troubleshooting complex systems. By enabling JobRunr Pro's Open Telemetry observability capabilities, we can follow the TraceId both in the JobRunr Pro dashboard and in Jaeger to see how it interacts with other systems.

Let's start with creating a sample scenario to better demonstrate the distributed tracing capabilities. We'll create two applications: port `8080` will run our banking app with a controller that registers new credit cards. That will fire off a JobRunr job doing a HTTP call to the government app at port `8088` verifying credentials. The distributed nature and the HTTP call inside the async job will showcase why tracing can be hard and how tools like Jaeger and Zipkin can be of great help.

![](/guides/tracing-app-structure.png)

## Framework Boot Setup

Your framework of choice (please pick one on the top right of this article) uses Micrometer behind the scenes as an abstraction layer together with an Open Telemetry (Otel) exporter to make sure our trace information reaches Jaeger. For demonstration purposes of this guid, Jaeger will be our tracing platform of choice. 

### The Banking App

{{< framework type="fluent-api" >}}
Please **select a framework of your choice** on the top right of this article.
{{< /framework >}}
{{< framework type="quarkus" label="Quarkus">}}
Createa a new Quarkus application. Add the following dependencies (Gradle example):

```groovy
dependencies {
    // JobRunr Pro integration
    implementation 'org.jobrunr:quarkus-jobrunr-pro:8.1.0'
    // This is needed as a base to enable Open Telemetry
    implementation 'io.quarkus:quarkus-opentelemetry'
    // The Otel exporter so it can send data to Jaeger
    implementation 'io.quarkus:quarkus-opentelemetry-exporter-otlp'
}
```

The above dependencies instruct Quarkus to export traces in the Open Telemetry format (`opentelemetry-exporter-otlp`) to an exporter that in this case happens to be Jager. 

Next, we'll create a resource endpoint that registers a new credit card, creating a JobRunr job that executes a HTTP call to the government app---just like in the schematic above. 

The resource:

```java
public class CreditCardResource {
    private static final Logger LOGGER = LoggerFactory.getLogger(CreditCardController.class);
    @Inject
    CreditCardService creditCardService;

    @POST
    @Path("/register")
    @Produces(MediaType.TEXT_PLAIN)
    public String processRegistration(@Valid @ModelAttribute("creditCard") CreditCard creditCard) {
        LOGGER.info("registering new credit card: {}", creditCard);

        creditCardService.processRegistration(creditCard);
        return "success!";
    }  
}
```

The JobRunr-enabled CreditCardService that relies on the [Quarkus way of building REST clients](https://quarkus.io/guides/rest-client) (that requires the `quarkus-rest-client-jackson` extra dependency):

```java
@Service
@ApplicationScoped
public class CreditCardService {

    private static final Logger LOGGER = LoggerFactory.getLogger(CreditCardService.class);

    @Inject
    @RestClient
    VerificationClient verificationClient;

    @Job
    public void processRegistration(CreditCard creditCard) {
        String verified = verificationClient.verifyCredentials();
        LOGGER.info("Created new credit card: {} - verified: {}", creditCard, verified);
    }
}


@RegisterRestClient(configKey = "verification-api")
public interface VerificationClient {
    
    @GET
    @Path("/verify-credentials")
    String verifyCredentials();
}

```

In Quarkus, the tracing functionality is supported and **on** by default---see the official [Quarkus OpenTelemetry tracing documentation](https://quarkus.io/guides/opentelemetry-tracing) for more information. All that is left to do is pointing our Quarkus application to the `4318` endpoint where our tracing provider will be deployed (see the next section). Add these config properties:

```
quarkus.application.name=banking-app
# point to our running instance
quarkus.otel.exporter.otlp.endpoint=http://localhost:4318
# quarkus by default uses gRPC (port 4317); we will send data to Jaeger over HTTP
quarkus.otel.tracer.exporter.otlp.protocol=http/protobuf

# optionally, change the log output to also include the traceIds
quarkus.log.console.format=%d{HH:mm:ss} %-5p traceId=%X{traceId}, parentId=%X{parentId}, spanId=%X{spanId}, sampled=%X{sampled} [%c{2.}] (%t) %s%e%n

# don't forget to configure our REST endpoint to point to the government app
quarkus.rest-client.verification-api.url=http://localhost:8088
```

If you don't see the spans immediately appearing in Jaeger, that is because Quarkus batches them. Disabled this with `quarkus.otel.simple=true` to double-check that everything is working correctly.

{{< /framework >}}
{{< framework type="spring-boot" label="Spring">}}
Scaffoled a new Spring Boot application using https://start.spring.io/. Add the following dependencies (Gradle example):

```groovy
dependencies {
    // JobRunr Pro integration
    implementation 'org.jobrunr:jobrunr-pro-spring-boot-3-starter:8.1.0'
    // This is needed as a base for Spring Boot to enable any observability
    implementation 'org.springframework.boot:spring-boot-starter-actuator'
    // The micrometer bridge to Open Telemetry (otel)
    implementation 'io.micrometer:micrometer-tracing-bridge-otel'
    // The Otel exporter so it can send data to Jaeger
    implementation 'io.opentelemetry:opentelemetry-exporter-otlp'
}
```

The above dependencies instruct Spring Boot to use Micrometer to export traces in the Open Telemetry format (`tracing-brdige-otel`) to our Open Telemetry-compatible tracing platform (`exporter-otlp`) that in this case happens to be Jager. For debugging purposes, you can also enable the logging exporter by including and configuring `opentelemetry-exporter-logging` to see the traceIds and details in the log output that otherwise flow to the OTLP endpoint.

Next, we'll create a controller endpoint that registers a new credit card, creating a JobRunr job that executes a HTTP call to the government app---just like in the schematic above. 

The controller:

```java
@Controller
public class CreditCardController {
    private static final Logger LOGGER = LoggerFactory.getLogger(CreditCardController.class);
    private final CreditCardService creditCardService;

    public CreditCardController(CreditCardService creditCardService) {
        this.creditCardService = creditCardService;
    }

    @PostMapping("/register")
    public String processRegistration(@Valid @ModelAttribute("creditCard") CreditCard creditCard) {
        LOGGER.info("registering new credit card: {}", creditCard);

        creditCardService.processRegistration(creditCard);
        return "redirect:/register?success";
    }  
}
```

The JobRunr-enabled service that relies on Spring's built-in `RestClient`:

```java
@Service
public class CreditCardService {
  private final RestClient restClient;
  private static final Logger LOGGER = LoggerFactory.getLogger(CreditCardService.class);

  public CreditCardService(RestClient.Builder restClientBuilder) {
      this.restClient = restClientBuilder.baseUrl("http://localhost:8088").build();
  }
  @Job
  public void processRegistration(CreditCard creditCard) {
    var verified = this.restClient.get().uri("/verify-credentials").retrieve().body(String.class);
    LOGGER.info("Created new credit card: {} - verified: {}", creditCard, verified);
  }
}
```

Thanks to the Spring Boot Actuator dependency, our application will automatically generate traces for each HTTP request based on Spring Boot's annotations---see the official [Actuator Tracing docs](https://docs.spring.io/spring-boot/reference/actuator/tracing.html) for more information. Traces will also be automatically propagated across the network if you use the provided Spring Rest builders to execute your HTTP calls. 

All that is left to do is pointing our Spring Boot application to the `4318` endpoint where our tracing provider will be deployed (see the next section). Add these two lines to your properties:

```
management.tracing.sampling.probability=1.0 # export all traces instead of the default 10%
management.otlp.tracing.endpoint=http://localhost:4318/v1/traces # point to our running instance
```
{{< /framework >}}
{{< framework type="micronaut" label="Micronaut">}}
Create a new Micronaut application. Add the following dependencies (Gradle example):

```groovy
dependencies {
    // JobRunr Pro integration
    implementation 'org.jobrunr:jobrunr-pro-micronaut:8.1.0'
    // OpenTelemetry + the exporter
    implementation 'io.micronaut:micronaut-tracing-opentelemetry'
    implementation 'io.opentelemetry:opentelemetry-exporter-otlp'
}
```

The above dependencies instruct Micronaut to export traces in the Open Telemetry format (`opentelemetry-exporter-otlp`) to an exporter that in this case happens to be Jager. 

Next, we'll create a controller endpoint that registers a new credit card, creating a JobRunr job that executes a HTTP call to the government app---just like in the schematic above. 

The controller:

```java
@Controller
public class CreditCardController {
    private static final Logger LOGGER = LoggerFactory.getLogger(CreditCardController.class);
    private final CreditCardService creditCardService;

    public CreditCardController(CreditCardService creditCardService) {
        this.creditCardService = creditCardService;
    }

    @Post("/register")
    @Produces(MediaType.TEXT_PLAIN)
    public String processRegistration(@Valid @ModelAttribute("creditCard") CreditCard creditCard) {
        LOGGER.info("registering new credit card: {}", creditCard);

        creditCardService.processRegistration(creditCard);
        return "success!";
    }  
}
```

The JobRunr-enabled service that relies on Micronaut's `@Client` interface:

```java
@Service
public class CreditCardService {
  private final VerificationClient verificationClient;
  private static final Logger LOGGER = LoggerFactory.getLogger(CreditCardService.class);

  public CreditCardService(VerificationClient verificationClient) {
      this.verificationClient = verificationClient;
  }
  @Job
  public void processRegistration(CreditCard creditCard) {
    var verified = this.restClient.get().uri("/verify-credentials").retrieve().body(String.class);
    LOGGER.info("Created new credit card: {} - verified: {}", creditCard, verified);
  }
}

@Client("http://localhost:8088")
public interface VerificationClient {

    @Get("/verify-credentials")
    String verifyCredentials();
}
```

For the REST client to work you'll need to add the `io.micronaut:micronaut-http-client` dependency.

All that is left to do is pointing our Micronaut application to the `4318` endpoint where our tracing provider will be deployed (see the next section). Add these two lines to your properties:

```yml
otel:
  sdk:
    enabled: true
    resource:
      service:
        name: banking-app
    tracer:
      exporter:
        otlp:
          endpoint: http://localhost:4318
          protocol: http/protobuf
    sampler:
      probability: 1.0
```
{{< /framework >}}

Then, we'll enable the JobRunr Pro tracing capabilities as well. JobRunr Pro offers the ability to export job information to the OTLP exporter and to integrate the TraceId in the JobRunr dashboard. For this, we need to configure JobRunr to enable tracing observability:

```
jobrunr.jobs.metrics.otel-observability.enabled=true # enable export 
jobrunr.dashboard.integrations.observability.jaeger.root-url=http://localhost:16686/ # enable linking in dashboard
```

The first configuration enables JobRunr to piggyback onto the previously configured Spring Boot OTLP system to export its job information to Jaeger and the second one allows us to click through from the JobRunr Pro dashboard to the Jaeger instance automatically filtering on a specific traceId. 

Our application will automatically generate traces for each HTTP request thanks to the way the frameworks integrate Rest clients with OpenTelemetry. Traces will also be automatically propagated across the network, which is exactly what we will be doing when calling the government app from a JobRunr job inside the banking app. 

This means that in one "trace"---the act of registering a single credit card starting at `CreditCardController.processRegistration()` in the banking app---there will be multiple "spans" visible---hops the trace will go through from system to system, to the government app. Speaking of which...

### The Government App

This one is just a simple endpoint that logs something when we hit `http://localhost:8088/verify-credentials`. All you need is a minimal controller implementing this:

{{< framework type="fluent-api" >}}
Please **select a framework of your choice** on the top right of this article.
{{< /framework >}}
{{< framework type="quarkus" label="Quarkus">}}
```java
@ApplicationScoped
public class CredentialsResource {
  private static final Logger LOGGER = LoggerFactory.getLogger(CredentialsController.class);
  @GET
  @Path("/verify-credentials")
  @Produces(MediaType.TEXT_PLAIN)
  public String verify() {
    LOGGER.info("verifying credentials");
    return "looks good to me!";
  }
}
```
{{< /framework >}}
{{< framework type="micronaut" label="Micronaut">}}
```java
@Controller
public class CredentialsController {
  private static final Logger LOGGER = LoggerFactory.getLogger(CredentialsController.class);
  @Get("/verify-credentials")
  @Produces(MediaType.TEXT_PLAIN)
  public String verify() {
    LOGGER.info("verifying credentials");
    return "looks good to me!";
  }
}
```

{{< /framework >}}
{{< framework type="spring-boot" label="Spring">}}
```java
@Controller
public class CredentialsController {
  private static final Logger LOGGER = LoggerFactory.getLogger(CredentialsController.class);
  @GetMapping("/verify-credentials")
  @ResponseBody
  public String verify() {
    LOGGER.info("verifying credentials");
    return "looks good to me!";
  }
}
```
{{< /framework >}}

We don't need the JobRunr dependency here, but this application must also send its tracing data to our provider otherwise the spans will not be added to the existing trace. Don't forget to set the server port to `8088` with `server.port=8088` to avoid port collisions.

## Inspecting Distributed Traces

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

Port `4318` is the receiving port and port `16686` is the UI interface we'll use to inspect the traces in Jaeger itself. If you prefer Zipkin, there's a dedicated Spring Boot Zipkin exporter available as well. 

By opening up http://localhost:16686/search and looking for that entry http post `/register` of our banking app, we can now find the traces in Jaeger. Note that Jaeger or similar automatically detect multiple services: you should see both `banking-app` and `government-app` popping up in the combobox provied you configured the application name property (e.g. `spring.application.name` or `otel.sdk.resource.service.name` or `quarkus.application.name` depending on your framework) correctly for both applications.

If you fire off a job in that `creditCardService` triggered in `/register` in the above controller example, the JobRunr job will be visible in the trace, as will the HTTP call hopping to the next span: our government app. You don't even need to go look for it or to enable trace logging: just open the dashboard and click on the newly appeared TraceId link:

![](/guides/jobrunrpro-dashboard-tracing.png "The Trace ID is available to the right of the Job ID after configuring JobRunrPro to enable otel observability.")

The link takes us to the Jaeger dashboard and automatically filters on the specific trace (`/trace/id`). There, we can clearly see the single trace starting in the `banking-app`, creating a `jobrunr.job` span inside the same service (if you click open "Tags" you'll get more info like the job name: `CreditCardService.createNewCreditCard(...)`) that fires off a `http.get` into another service or "hop" (the colour transitions from lightblue to orange indicating the TraceId reached an external system: `government.app`):

![](/guides/jaeger.png "jobrunr.job tag information displayed in Jaeger: creditCardService.createNewCreditCard via org.springframework.boot.")

For more information about spans and traces, see the [Jaeger documentation](https://www.jaegertracing.io/docs/1.22/architecture/#span) explaining the terms and architecture. For more tracing configuration options, see our [JobRunr Pro Observability docs](/en/documentation/pro/observability/).

---

# Conclusion

In this guide, we have showcased how JobRunr's observability features and your favourite framework can go hand in hand. We enabled the Micrometer-powered Open Telemetry exporters both in the framework and in JobRunr Pro that flow to a distributed tracing platform such as Jaeger or Zipkin. 

Both metrics analysis and distributed tracing are indispensable for modern complex software systems: close system health monitoring (such as job counts, background server resource usage, ...) and tracing spans to debug across systems will help improve the quality of your software. As we have seen, JobRunr and JobRunr Pro provide easy ways to hook into your existing solutions. 

If you are interested in also exposing JobRunr-specific metrics and feeding these into your observability platform, please consult the [observability: metrics guide](/guides/advanced/observability-metrics).
