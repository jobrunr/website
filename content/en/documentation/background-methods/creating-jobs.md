---
title: "Creating jobs"
subtitle: "Creating a background job could not have been easier..."
keywords: ["enqueue", "background job", "fire and forget", "enqueue jobs in bulk", "lambda"]
date: 2020-09-16T11:12:23+02:00
layout: "documentation"
menu: 
  main: 
    identifier: creating-jobs
    parent: 'background-methods'
    weight: 10
---
JobRunr supports various ways to easily generate background jobs:


## Java 8 lambda's
### Via a simple Java 8 lambda

<figure>

```java
@Inject
MyService myService;

JobId jobId = BackgroundJob.enqueue(() -> myService.doWork());
```
<figcaption>Almost all Java 8 lambda's are valid to create a JobRunr Job.<br />You can off-course also pass arguments to the method call of your lambda (in this case doWork())</figcaption>
</figure>


### Via a Java 8 lambda with generics

When you use the Java 8 lambda using generics, JobRunr will request the service (in this case `MyService`) from the IoC container.

<figure>

```java
JobId jobId = BackgroundJob.<MyService>enqueue(x -> x.doWork());
```
<figcaption>This enqueues a background job without a reference to an instance of MyService. During execution of the background job, the IoC container will need to provide an instance of type MyService.</figcaption>
</figure>


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

Since JobRunr 4.0.0, a new way to create jobs is supported: a `JobRequest`.
<figure>

```java

private class MyJobRequest implements JobRequest {

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

A `JobRequestHandler` is a regular service (e.g. a Spring bean / a Micronaut singleton / a Quarkus singleton) where you can inject other services and must be resolvable by your IoC container. When your job will be invoked, JobRunr asks the IoC container for the relevant `JobRequestHandler`, call the run method of the instance and pass the `JobRequest` as an argument. You can then use all the data from your `JobRequest` inside your `JobRequestHandler` to bring your job to a good end.

