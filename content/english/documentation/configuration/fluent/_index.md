---
title: "Fluent API"
keywords: ["JobRunr Configuration"]
subtitle: "Use the Fluent API to configure JobRunr in your application within minutes."
date: 2020-09-16T11:12:23+02:00
layout: "documentation"
menu: 
  main: 
    parent: 'configuration'
    weight: 10
---
## Enqueueing and processing in the same JVM instance
JobRunr can easily be configured using the Fluent API to enqueue and process jobs within the same application:

> **Note**: although most of the examples use Spring, this is not a prerequisite as shown below. JobRunr can also work fine without any framework. Important is that the `jobScheduler` should be a **singleton** in all cases.


```java
public class Application {

    public static void main(String[] args) {
        JobScheduler jobScheduler = JobRunr.configure()
                .useStorageProvider(new InMemoryStorageProvider())
                .useBackgroundJobServer()
                .useDashboard()
                .initialize()
                .getJobScheduler();

        jobScheduler.enqueue(() -> System.out.println("Up & Running from a background Job"));
    }
}
```

__What happens here?__
- a simple Java class called `Application` with a `main` method is created
- the important things to note about the configuration are:
  - the Fluent API is started using JobRunr.configure()
  - after that, a `StorageProvider` is created---in this case an `InMemoryStorageProvider`.
  - we enable the `BackgroundJobServer` which will process the actual jobs
  - we enable the `Dashboard`
  - the Fluent API is ended with the initialize method call from which the `JobScheduler` is retrieved.
- after that, you can start to create background Jobs!

## Enqueueing and processing in different JVM instances
As we want to enqueue jobs in one JVM and process jobs in another JVM, we will need to use a `StorageProvider` can be shared (so not the `InMemoryStorageProvider`). This can be a SQL Database or a NoSQL Database like MongoDB.

### 1. Enqueueing background jobs via the `EnqueueingApplication`:
In the application that enqueues background jobs, the Fluent API is used again and speaks for itself. The important thing to note is that we will not add the `useBackgroundJobServer()` method as we do not want to process jobs in this JVM instance. Omitting this line results in the fact that no `BackgroundJobServer` will be started.

```java
public class EnqueueingApplication {

    public static void main(String[] args) {
        HikariConfig config = new HikariConfig();
        config.setJdbcUrl("<your jdbc url>");
        config.setUsername("<your database username>");
        config.setPassword("<your database password>");
        HikariDataSource dataSource = new HikariDataSource(config);

        JobScheduler jobScheduler = JobRunr.configure()
                .useStorageProvider(SqlStorageProviderFactory.using(dataSource))
                .useDashboard()
                .initialize()
                .getJobScheduler();

        jobScheduler.enqueue(() -> System.out.println("Up & Running from a background Job"));
    }
}
```
__What happens here?__
- a simple Java class called `EnqueueingApplication` with a `main` method is created. It will only create jobs but will not process them.
- the important things to note about the configuration are:
  - the Fluent API is started using JobRunr.configure()
  - after that, a `StorageProvider` is created---in this case an instance of a `SqlStorageProvider`.
  - we again enable the `Dashboard`
  - the Fluent API is ended with the initialize method call from which the `JobScheduler` is retrieved.
- after that, you can start to create background Jobs! But ... they will not be processed in this JVM. See the section below on how to process the actual jobs.

### 2. Processing background jobs via the `ProcessingApplication`:
In the application that processes background jobs, the Fluent API is used again and speaks for itself:

```java
public class ProcessingApplication {

    public static void main(String[] args) {
        HikariConfig config = new HikariConfig();
        config.setJdbcUrl("<your jdbc url>");
        config.setUsername("<your database username>");
        config.setPassword("<your database password>");
        HikariDataSource dataSource = new HikariDataSource(config);

        JobRunrPro.configure()
                .useStorageProvider(SqlStorageProviderFactory.using(dataSource))
                .useBackgroundJobServer()
                .useJmxExtensions()
                .initialize();
    }
}
```

__What happens here?__
- a simple Java class called `ProcessingApplication` with a `main` method is created. It will only process jobs in this case.
- the important things to note about the configuration are:
  - the Fluent API is started using JobRunr.configure()
  - after that, a `StorageProvider` is created---in this case an instance of a `SqlStorageProvider`. It must use the same database settings as the `EnqueueingApplication`
  - we enable the `BackgroundJobServer` which will process the actual jobs on this JVM instance
  - we enable JMX extensions to better monitor the server
  - the Fluent API is ended with the initialize method call
- after that, jobs created in the `EnqueueingApplication` (running in JVM instance A) will automatically be processed in `ProcessingApplication` (running in JVM instance B).

## Advanced Configuration

The JobRunr configuration allows you to setup JobRunr completely to your liking:

```java
boolean isBackgroundJobServerEnabled = true; // or get it via ENV variables
boolean isDashboardEnabled = true; // or get it via ENV variables
JobRunr.configure()
            .useJobActivator(jobActivator)
            .useJobStorageProvider(jobStorageProvider)
            .withJobFilter(new RetryFilter(2)) // only do two retries by default
            .useBackgroundJobServerIf(isBackgroundJobServerEnabled, 
                usingStandardBackgroundJobServerConfiguration().andWorkerCount(4))  // only use 4 worker threads (extra options available)
            .useDashboardIf(isDashboardEnabled, 80) // start on port 80 instead of 8000
            .useJmxExtensions()
            .useMicroMeter(new JobRunrMicroMeterIntegration(meterRegistry))
            .initialize();

```

> For more options, check out the `JobRunrConfiguration` and `JobRunrDashboardWebServerConfiguration` classes.
