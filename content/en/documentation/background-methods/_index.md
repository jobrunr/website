---
title: "Background methods"
subtitle: "Background jobs in JobRunr are just Java 8 lambda's - easy peasy!"
date: 2020-04-30T11:12:23+02:00
layout: "documentation"
menu: 
  main: 
    identifier: background-methods
    parent: 'documentation'
    weight: 15
---
JobRunr supports 2 ways to easily generate background jobs:

- [Using only a Java 8 lambda](#java-8-lambdas)
- [Using JobRequests](#via-a-jobrequest)

## Java 8 lambda's
Background jobs using Java 8 lambda's in JobRunr look like regular method calls. Background jobs can use both instance and static method calls as in the following example.

```java
BackgroundJob.enqueue<EmailSender>(x -> x.send("jobrunr@example.com"));
```

```java
BackgroundJob.enqueue(() -> System.out.println("Hello, world!"));
```

Unlike usual method invocations which are run instantly, these methods are in fact Java 8 Functional Interfaces and are executed asynchronously and - depending on the configuration - even outside the current JVM. So the purpose of the method calls above is to collect and serialize the following information:

- Type name, including package.
- Method name and its parameter types.
- Argument values.

> Important: all your servers __must run the same version of your code__! If your webapp server has a newer version with a method signature that is not compatible with the server that processes your background jobs, a NoSuchMethod Exception will be thrown and job processing will fail! <br>As of JobRunr v1.1.0, the dashboard shows an error if there are jobs which cannot be found.

Serialization is performed by the either Jackson, Gson or Json-B and the resulting JSON, that looks like in the following snippet, is persisted in a `StorageProvider` making it available for other processing in a different thread or even a different JVM. As we can see everything is passed by value, so heavy data structures will also be serialized and consume a lot of bytes in the RDBMS or NoSQL database.

<figure>

```json
{
  "lambdaType": "org.jobrunr.jobs.lambdas.JobLambda",
  "className": "java.lang.System",
  "staticFieldName": "out",
  "methodName": "println",
  "jobParameters": [
    {
      "className": "java.lang.String",
      "object": "a test"
    }
  ]
}
```
<figcaption>the serialized job details</figcaption>
</figure>

### Parameters
You can pass parameters along to your background job methods but these should be kept as small as possible. A parameter must either be:
- a type of java.lang like String, Integer, ...
- a custom class with a default no argument constructor - this to deserialize it from the `StorageProvider`

### Method visibility
JobRunr only runs methods with `public` visibility.

### Constraints for Java 8 lambda's
JobRunr uses some ASM magic to analyse the Job Lambda and covers most use cases. It is important to note the following:

###### Only one method to enqueue is supported
You can not enqueue the following job as it results in two jobs to run which is not supported and this will fail:
<figure>

```java
BackgroundJob.enqueue(() -> {
  myService.createPDF();
  myService.sendPDF();
);
```
<figcaption>This will fail as only one method call is supported.</figcaption>
</figure>

###### You cannot pass IoC injected services as parameters to the lambda
You can not enqueue the following job as the reference to the `MyService` instance is used as parameter to the lambda and thus not an instance during the analysis of the job lambda.
<figure>

<figure>

```java
BackgroundJob.<MyService>enqueue(x -> doWork(x));
```
<figcaption>As the bean `MyService` is only retrieved from the IoC container when the job is about to run (so not during the scheduling phase), you cannot pass it as a parameter to the job.<br/>The above will fail with a NullPointerException thrown by JobRunr as x is null during the analysis.</figcaption>
</figure>

## Via a JobRequest

Since JobRunr 4.0.0, a new way to create jobs is supported: a `JobRequest`. A `JobRequest` follows the command/command handler pattern.
<figure>

```java
public class MyJobRequest implements JobRequest {

  private UUID id;

  public MyJobRequest(UUID id) {
    this.id = id;
  }

  @Override
  public Class<MyJobRequestHandler> getJobRequestHandler() {
      return MyJobRequestHandler.class;
  }

  public UUID getId() {
    return id;
  }

}

JobId jobId = BackgroundJobRequest.enqueue(new MyJobRequest(id));
```
<figcaption>This enqueues a background job using a JobRequest. The JobRequest can contain data and will the actual job will be invoked, the JobRequest object will be provided to the run method of the JobRequestHandler.</figcaption>
</figure>

When using a `JobRequest` to create jobs it is important to note that the `JobRequest` itself is nothing more than a __data transfer object__. You should not pass services or beans with it. The smaller the `JobRequest` is, the better as it will be serialized to Json and stored in your StorageProvider.

> Note that your `JobRequest` will be serialized and deserialized to/from Json. This also means that it needs a default no-arg constructor and that all fields must also be capable of being serialized/deserialized to/from Json.

A `JobRequestHandler` is a regular service (e.g. a Spring bean / a Micronaut singleton / a Quarkus singleton) where you can inject other services and must be resolvable by your IoC container. When your job will be invoked, JobRunr asks the IoC container for the relevant `JobRequestHandler`, calls the `run` method of the instance and passes the `JobRequest` as an argument. You can then use all the data from your `JobRequest` inside your `JobRequestHandler` to bring your job to a good end.

<figure>

```java
@Component
public class MyJobRequestHandler implements JobRequestHandler<MyJobRequest> {

  @Inject
  private SomeService someService; // you can inject other services (or constructor-injection)

  @Override
  @Job(name = "Some neat Job Display Name", retries = 2)
  public void run(MyJobRequest jobRequest) {
      // do your background work here
  }
}
```
<figcaption>This JobRequestHandler handles all MyJobRequests. As it is a regular bean, you can inject other services.</figcaption>
</figure>
