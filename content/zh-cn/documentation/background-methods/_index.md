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
Background jobs in JobRunr look like regular method calls. Background jobs can use both instance and static method calls as in the following example.

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

> Important: all your servers __must run the same version of your code__! If your webapp server has a newer version with a method signature that is not compatible with the server that processes your background jobs, a NoSuchMethod Exception will be thrown and job processing will fail!

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

## Parameters
You can pass parameters along to your background job methods but these should be kept as small as possible. A parameter must either be:

a type of java.lang like String, Integer, ...
a custom class with a default no argument constructor - this to deserialize it from the `StorageProvider`