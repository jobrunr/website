---
title: "Observability: Tracing JobRunr Jobs"
description: Follow this guide to enable and configure distributed tracing for JobRunr Pro jobs using your observability platform of choice.
weight: 30
drawing: https://excalidraw.com/#json=eVCmWXqZLhc1hQGLVyDpN,ePXi5lYY-0msET2JM_btOg
tags:
    - Observability
    - Metrics
    - Micrometer
---

In this JobRunr Pro guide, we will unfold JobRunr's observability features that go beyond simply logging. In this part, we'll investigate how to integrate with OpenTelemetry to easily trace distributed end-to-end API calls that might run through a JobRunr job. 

> If you are interested in exposing JobRunr-specific metrics and feeding these into your observability platform, please consult the [observability: metrics guide](/en/guides/advanced/observability-metrics) instead.

## Prerequisites

- JobRunr Pro 8.0.0 or later
- You already know how to configure JobRunr Pro
- Basic knowledge of OpenTelemetry

## What we're going to build

Let's start with creating a simple scenario to better demonstrate the distributed tracing capabilities. We'll create two applications. A banking app, running on port `8080`, with a controller that registers new credit cards. This will fire off a JobRunr job doing a HTTP call to a government app at port `8088` verifying credentials.

![](/guides/tracing-app-structure.png "The system structure: two applications (banking and government app) interacting through HTTP.")

The distributed nature and the HTTP call inside the asynchronous JobRunr job will showcase why tracing can be hard and how observability tools can be of great help. 

In order to trace specific actions through a distributed system---such as the registration of a credit card---a unique ID called a _TraceId_ has to be passed along to retrace the steps of an execution path through every piece of software involved. Every trace is a graph of _spans_, representing the executed operations (with their names, timings, and other attributes). 

By enabling JobRunr Pro's OpenTelemetry observability capabilities, we can instrument JobRunr to report job execution traces or add job creation events to ongoing spans. Then, we can [use any observability platform](https://opentelemetry.io/ecosystem/vendors/) that's able to consume OpenTelemetry traces.

> For demonstration purposes of this guide, [Jaeger](https://www.jaegertracing.io/) will be our tracing platform of choice. Thanks to the Micrometer and OpenTelemetry abstraction layer, JobRunr is tool agnostic: you can use any existing observability platform you already have in place. [Zipkin](https://zipkin.io/) is another popular alternative.

## Setup

To enable JobRunr tracing instrumentation, we need to add a few dependencies: JobRunr itself and OpenTelemetry the OpenTelemetry SDK to get a `Tracer` instance. We'll use this setup for two the demo applications we'll create below.

{{< framework type="fluent-api" >}}
```groovy
dependencies {
  implementation 'org.jobrunr:jobrunr-pro:{{< param "JobRunrVersion" >}}'
  // always check for later version of these dependencies
  implementation 'io.opentelemetry:opentelemetry-api:1.54.1'
  implementation 'io.opentelemetry:opentelemetry-sdk:1.54.1'           // to build an Otel instance
  implementation 'io.opentelemetry:opentelemetry-semconv:1.24.0-alpha' // for the service name
  implementation 'io.opentelemetry:opentelemetry-exporter-otlp:1.54.1' // the exporter to the OTLP endpoint
  implementation 'io.opentelemetry.instrumentation:opentelemetry-java-http-client:2.20.1-alpha' // to instrument http requests
}
```
{{< /framework >}}


{{< framework type="fluent-api" >}}

If you are not using a framework, you'll have to use the OpenTelemetry SDK to get a `Tracer` instance, programmatically. This `tracer` can be passed into the JobRunr Fluent API configuration. See the [OpenTelemetry Java documentation](https://opentelemetry.io/docs/languages/java/intro/) for more information.

The following code snippet creates a `Tracer` using the SDK builder that later can be injected into JobRunr Pro:

```java
SpanExporter otlpExporter = OtlpHttpSpanExporter.builder()
        .setEndpoint("http://localhost:4318/v1/traces")
        .build();

// this is the name that will appear in the Jaeger dropdown box.
Resource resource = Resource.create(
        Attributes.of(ResourceAttributes.SERVICE_NAME, "jobrunr-test")
);

SdkTracerProvider tracerProvider = SdkTracerProvider.builder()
        .addSpanProcessor(BatchSpanProcessor
                .builder(otlpExporter)
                .build())
        .setResource(Resource.getDefault().merge(resource))
        .build();

OpenTelemetry openTelemetry = OpenTelemetrySdk.builder()
        .setTracerProvider(tracerProvider)
        .buildAndRegisterGlobal();

// this object will be needed for the JobRunr Pro config.
Tracer tracer = openTelemetry.getTracer("jobrunr-test");
```

> The `BatchSpanProcessor` by default batches trace exports every five seconds. This can be configured with for instance `.setScheduleDelay(10, TimeUnit.MILLISECONDS)` and `.setMaxExportBatchSize(1)`.
{{< /framework >}}
{{< framework type="spring-boot" label="Spring">}}
Scaffold a new Spring Boot application using https://start.spring.io/. Add the following dependencies (Gradle example):

```groovy
dependencies {
  // JobRunr Pro integration
  implementation 'org.jobrunr:jobrunr-pro-spring-boot-3-starter:{{< param "JobRunrVersion" >}}'
  // This is needed as a base for Spring Boot to enable any observability
  implementation 'org.springframework.boot:spring-boot-starter-actuator'
  // The micrometer bridge to OpenTelemetry (otel)
  implementation 'io.micrometer:micrometer-tracing-bridge-otel'
  // The Otel exporter so it can send data to Jaeger
  implementation 'io.opentelemetry:opentelemetry-exporter-otlp'
}
```

The above dependencies instruct Spring Boot to use Micrometer to export traces in the OpenTelemetry format (`tracing-brdige-otel`) to our OpenTelemetry-compatible tracing platform (`exporter-otlp`). For debugging purposes, you can also enable the logging exporter by including and configuring `opentelemetry-exporter-logging` to see the traceIds and details in the log output that otherwise flow to the OTLP endpoint.

All that is left to do is pointing our Spring Boot application to the `4318` endpoint where our tracing provider will be deployed (see the next section). Add these two lines to your properties:

```
management.tracing.sampling.probability=1.0 # export all traces instead of the default 10%
management.otlp.tracing.endpoint=http://localhost:4318/v1/traces # point to our running instance
```
{{< /framework >}}
{{< framework type="quarkus" label="Quarkus">}}
Create a new Quarkus application. Add the following dependencies (Gradle example):

```groovy
dependencies {
  // JobRunr Pro integration
  implementation 'org.jobrunr:quarkus-jobrunr-pro:{{< param "JobRunrVersion" >}}'
  // This is needed as a base to enable OpenTelemetry
  implementation 'io.quarkus:quarkus-opentelemetry'
}
```

The above dependencies instruct Quarkus to export traces in the OpenTelemetry format (`opentelemetry-exporter-otlp`) to an exporter. Tshe tracing functionality is supported and enabled by default, see the official [Quarkus OpenTelemetry tracing documentation](https://quarkus.io/guides/opentelemetry-tracing) for more information.

All that is left to do is pointing our Quarkus application to the `4318` endpoint where our tracing provider will be deployed (see the next section). Add these config properties:

```
quarkus.application.name=banking-app
# for the government app: quarkus.application.name=government-app
# point to our running instance
quarkus.otel.exporter.otlp.endpoint=http://localhost:4318
# quarkus by default uses gRPC (port 4317); we will send data to Jaeger over HTTP
quarkus.otel.tracer.exporter.otlp.protocol=http/protobuf

# optionally, change the log output to also include the traceIds
quarkus.log.console.format=%d{HH:mm:ss} %-5p traceId=%X{traceId}, parentId=%X{parentId}, spanId=%X{spanId}, sampled=%X{sampled} [%c{2.}] (%t) %s%e%n
```

> If you don't see the spans immediately appearing in Jaeger, that is because Quarkus batches them. You can disable this with `quarkus.otel.simple=true` to double-check that everything is working correctly.
{{< /framework >}}
{{< framework type="micronaut" label="Micronaut">}}
Create a new Micronaut application. Add the following dependencies (Gradle example):

```groovy
dependencies {
  // JobRunr Pro integration
  implementation 'org.jobrunr:jobrunr-pro-micronaut:{{< param "JobRunrVersion" >}}'
  // OpenTelemetry + the exporter
  implementation 'io.micronaut:micronaut-tracing-opentelemetry-http'
  implementation 'io.opentelemetry:opentelemetry-exporter-otlp'
}
```

The above dependencies instruct Micronaut to export traces in the OpenTelemetry format (`opentelemetry-exporter-otlp`) to an exporter that in this case happens to be Jager. 

All that is left to do is pointing our Micronaut application to the `4318` endpoint where our tracing provider will be deployed (see the next section). Add these lines to your properties:

```yml
otel:
  sdk:
    enabled: true
    resource:
      service:
        # don't forget to change accordingly for government-app
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

Next, we'll create an endpoint that registers a new credit card in the banking app, creating a JobRunr job that executes a HTTP call to the government app---just like in the schematic above. For the banking app to properly work, we'll also configure JobRunr there and enable its instrumentation.


## Building The Banking App

This service is going to expose an endpoint to register new credit cards. This registration is going to happen as a background task thanks to the use of JobRunr.

### Credit card registration

{{< framework type="fluent-api" >}}
We assume that you create a REST server exposing a POST endpoint at `/register` at port `8080` to enqueue a JobRunr job:


```java
public class CreditCardController {
  private static final Logger LOGGER = LoggerFactory.getLogger(CreditCardController.class);
  private final CreditCardService creditCardService;
  
  public class CreditCardController(CreditCardService creditCardService) {
    this.creditCardService = creditCardService;
  }

  // a POST endpoint at /register
  public String processRegistration(CreditCard creditCard) {
    LOGGER.info("registering new credit card: {}", creditCard);

    BackgroundJob.enqueue(() -> creditCardService.processRegistration(creditCard));
    return "enqueued";
  }  
}
```

The `CreditCardService` that verifies credentials via the government app.

> For this demo to work we need use an instrumented `HttpClient`. This could be a Spring `RestClient` if you're using Spring Boot. Below we'll use the Java `HttpClient` wrapper from `opentelemetry-java-http-client`.

```java
public class CreditCardService {

  private static final Logger LOGGER = LoggerFactory.getLogger(CreditCardService.class);
  private final HttpClient httpClient;

  public CreditCardService(OpenTelemetry openTelemetry) {
    this.httpClient = JavaHttpClientTelemetry.builder(openTelemetry).build().newHttpClient(HttpClient.newBuilder().build());
  }

  public void processRegistration(CreditCard creditCard) {
    HttpRequest request = HttpRequest.newBuilder().uri(new URI("http://localhost:8089/verify-credentials")).GET().build();
    HttpResponse<String> response = httpClient.send(request, BodyHandlers.ofString());
    LOGGER.info("Created new credit card: {} - verified: {}", creditCard, response.body());
  }
}

```

{{< /framework >}}
{{< framework type="spring-boot" label="Spring">}}
The REST controller:

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

    BackgroundJob.enqueue(() => creditCardService.processRegistration(creditCard));
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

Our application will automatically generate traces for each HTTP request based on Spring Boot's annotations thanks to the OpenTelemetry tracer hooking into Spring Actuator---see the official [Actuator Tracing docs](https://docs.spring.io/spring-boot/reference/actuator/tracing.html) for more information.

{{< /framework >}}
{{< framework type="quarkus" label="Quarkus">}}
Let's create a resource representing the registration of the credit card service:

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

    BackgroundJob.enqueue(() => creditCardService.processRegistration(creditCard));
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

We also need to configure our REST endpoint to point to the government app:

```
quarkus.rest-client.verification-api.url=http://localhost:8088
```

{{< /framework >}}
{{< framework type="micronaut" label="Micronaut">}}

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

    BackgroundJob.enqueue(() => creditCardService.processRegistration(creditCard));
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
    var verified = this.verificationClient.verifyCredentials();
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
{{< /framework >}}

Notice how the controller immediately fires off a background job. Next, let's take a look at how to configure JobRunr Pro OpenTelemetry instrumentation.

### JobRunr Setup: Instrumenting Job Execution

Here, we'll enable the JobRunr Pro tracing capabilities. JobRunr Pro offers the ability to export job information to the OTLP exporter and to integrate the TraceId in the JobRunr dashboard. For this, we need to configure JobRunr to enable tracing observability:

{{< framework type="fluent-api" >}}

Inject the `tracer` we created earlier into the Fluent API configuration:

```java
JobRunrPro
  .configure()
  // ... other config
  .useTracing(JobRunrOpenTelemetryTracingConfiguration.usingOpenTelemetryTracing(tracer))
  .useDashboardIf(dashboardIsEnabled(args), usingStandardDashboardConfiguration()
    // ... other config
    .andIntegration(new JaegerObservabilityIntegration("http://localhost:16686/"))
  )
  .initialize();

```

> ⚠️ The Fluent API `useTracing()` method is supported for JobRunr Pro versions newer than 8.1.0. For earlier versions, you can provide `OpenTelemetryJobObservability` with `JobRunrPro.configure().withJobFilters(new OpenTelemetryJobObservability(tracer, queues))`. Where `queues` is an instance of `org.jobrunr.jobs.queues.Queues`.

{{< /framework >}}
{{< framework type="quarkus" label="Quarkus">}}
```
quarkus.jobrunr.jobs.metrics.otel-observability.enabled=true # enable export 
quarkus.jobrunr.dashboard.integrations.observability.jaeger.root-url=http://localhost:16686/ # enable linking in dashboard
```
{{< /framework >}}
{{< framework type="spring-boot" label="Spring">}}
```
jobrunr.jobs.metrics.otel-observability.enabled=true # enable export 
jobrunr.dashboard.integrations.observability.jaeger.root-url=http://localhost:16686/ # enable linking in dashboard
```
{{< /framework >}}
{{< framework type="micronaut" label="Micronaut">}}
```
jobrunr.jobs.metrics.otel-observability.enabled=true # enable export 
jobrunr.dashboard.integrations.observability.jaeger.root-url=http://localhost:16686/ # enable linking in dashboard
```
{{< /framework >}}

> In addition to enabling OpenTelemetry instrumentation, we've also added an extra configuration for the JobRunr UI. When the Jaeger dashboard URL is provided, JobRunr will add a direct link to the job trace in Jaeger. More on this below. What about other platforms? This dashboard integration only supports Jaeger for now, if you're interested in this feature for another vendor, let us know!

Enabling observability in JobRunr piggybacks onto the previously configured framework's OTLP system to export its job information to Jaeger and setting the Jaeger root URL allows us to click through from the JobRunr Pro dashboard to the Jaeger instance automatically filtering on a specific traceId. 

Thanks to the integration of the various HTTP clients with OpenTelemetry, traces will also be automatically propagated across the network.  Which is exactly what we will be doing when calling the government app from a JobRunr job inside the banking app.

This means that in one "trace"---the act of registering a single credit card starting at `CreditCardController.processRegistration()` in the banking app---there will be multiple "spans" visible---hops the trace will go through from system to system, to the government app.

> See [context propagation for more details](https://opentelemetry.io/docs/concepts/context-propagation/) on how OpenTelemetry tracks requests across services.

## Building The Government App

This one is just a simple endpoint that logs something when we hit `http://localhost:8088/verify-credentials`. All you need is a minimal controller implementing this:

{{< framework type="fluent-api" >}}
We assume that you create a Rest server on port `8088` exposing a POST endpoint at `/verify-credentials` returning a simple string:


```java
public class CredentialsController {
  private static final Logger LOGGER = LoggerFactory.getLogger(CredentialsController.class);
  // a GET endpoint at /verify-credentials
  public String verify() {
    LOGGER.info("verifying credentials");
    return "looks good to me!";
  }
}
```
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

We don't need the JobRunr dependency here, but this application must also send its tracing data to our provider otherwise the spans will not be added to the existing trace. Don't forget to set the server port to `8088` (e.g. in Spring Boot with `server.port=8088`) to avoid port collisions.

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

By opening up [http://localhost:16686/search](http://localhost:16686/search) and looking for the entry `/register` of our banking app, we can now find the traces in Jaeger. Note that Jaeger or similar automatically detect multiple services: you should see both `banking-app` and `government-app` popping up in the combobox, provided that you configured the application name property correctly (e.g. `spring.application.name` or `otel.sdk.resource.service.name` or `quarkus.application.name` depending on your framework).

If you fire off a job in that `creditCardService` triggered in `/register` in the above controller example, the JobRunr job will be visible in the trace. As will the HTTP call `/verify-credentials` to the government-app.

Pro tip: your JobRunr Dashboard provides a direct link to the trace created by the job execution. Simply find the job you're interested in and open its page to find a direct link to the job's trace in Jaeger:

![](/guides/jobrunrpro-dashboard-tracing.png "The Trace ID is available to the right of the Job ID after configuring JobRunrPro to enable otel observability.")

The link takes us to the Jaeger dashboard and automatically filters on the specific trace (`/trace/id`):

![](/guides/jaeger.png "jobrunr.job tag information displayed in Jaeger: creditCardService.createNewCreditCard via org.springframework.boot.")

There, we can clearly see the trace starting in the `banking-app`, creating a `jobrunr.job` span inside the same service. JobRunr adds other attributes to the span, thus, if you click open "Tags", you'll get more info like the job name: `CreditCardService.createNewCreditCard(...)`. Then we see the span of the `http.get` request to `/verify-credentials` that was fired off by the job. This leads as to the final span from the `government-app` (the colour transitions from lightblue to orange indicating the TraceId reached an external system: `government.app`).

## Conclusion

In this guide, we have showcased how JobRunr's observability features and your favourite framework can go hand in hand. We enabled the Micrometer-powered OpenTelemetry exporters both in the framework and in JobRunr Pro that flow to a distributed tracing platform such as Jaeger or Zipkin. 

Both metrics analysis and distributed tracing are indispensable for modern complex software systems: close system health monitoring (such as job counts, background server resource usage, ...) and tracing spans to debug across systems will help improve the quality of your software. As we have seen, JobRunr and JobRunr Pro provide easy ways to hook into your existing solutions. 

## Further Reading
- [JobRunr Pro Observability docs](/en/documentation/pro/observability/)
- [How to publish performance metrics with Micrometer integration]({{< ref "/guides/advanced/observability-metrics" >}})
