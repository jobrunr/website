---
title: "Fluent API"
subtitle: "Use the Fluent API to configure JobRunr in your application within minutes."
date: 2020-04-30T11:12:23+02:00
layout: "documentation"
menu: 
  main: 
    parent: 'configuration'
    weight: 10
---
## Enqueueing and processing in the same JVM instance
JobRunr can easily be configured using the Fluent API to enqueue and process jobs within the same application:

```java
@SpringBootApplication
@Import(JobRunrStorageConfiguration.class)
public class WebApplication {

    public static void main(String[] args) {
        SpringApplication.run(WebApplication.class, args);
    }

    @Bean
    public JobScheduler initJobRunr(ApplicationContext applicationContext) {
        return JobRunr.configure()
                .useJobActivator(applicationContext::getBean)
                .useStorageProvider(SqlStorageProviderFactory
                          .using(applicationContext.getBean(DataSource.class)))
                .useBackgroundJobServer()
                .useJmxExtensions()
                .useDashboard()
                .initialize();
    }
}
```

__What happens here?__
- first a Spring Application is created, this can either be a CommandLineRunner application or a WebApplication
- the important method here is the initJobRunr method:
  - the Fluent API is started using JobRunr.configure()
  - after that, a `StorageProvider` is created with a DataSource that is defined in the `JobRunrStorageConfiguration` Spring configuration class.
  - a `JobActivator` is defined which uses the `getBean` method of the Spring `ApplicationContext`
  - the `BackgroundJobServer` itself is started
  - `JmxExtensions` are enabled
  - and the Dashboard is also started

In this setup, the application enqueues new background jobs and also processes them because of the method `useBackgroundJobServer` that is called.

<br>

## Enqueueing and processing in different JVM instances
In the setup below, the application that enqueues background jobs, typical the web application, only schedules new jobs and does not process any background jobs. 

### Enqueueing background jobs:
To enqueue background jobs, the configuration is again done using the Fluent API:

```java
@SpringBootApplication
@Import(JobRunrStorageConfiguration.class)
public class WebApplication {

    public static void main(String[] args) {
        SpringApplication.run(WebApplication.class, args);
    }

    @Bean
    public JobScheduler initJobRunr(ApplicationContext applicationContext) {
        return JobRunr.configure()
                .useStorageProvider(SqlStorageProviderFactory
                          .using(applicationContext.getBean(DataSource.class)))
                .initialize();
    }
}
```

__What happens here?__
- first a Spring Application is created, in this case a Spring WebApplication
- the important method here is again the initJobRunr method:
  - the Fluent API is started using JobRunr.configure()
  - after that, a `StorageProvider` is created with a DataSource that is defined in the `JobRunrStorageConfiguration` Spring configuration class.
  - the Fluent API is ended with the initialize method call which returns a `JobScheduler`.

> You can choose to autowire the JobScheduler bean in classes where you want to enqueue background jobs, or you can use the static methods on BackgroundJob.

### Processing background jobs:
In the application that processes background jobs (this can be a Spring command line runner application packaged within a Docker container using Jib) the Fluent API is used again and speaks for itself:

```java
@SpringBootApplication
@Import(JobRunrStorageConfiguration.class)
public class JobServerApplication implements CommandLineRunner {

    public static void main(String[] args) {
        SpringApplication.run(JobServerApplication.class, args);
    }

    @Override
    public void run(String... args) throws InterruptedException {
        Thread.currentThread().join();
    }

    @Bean
    public JobScheduler initJobRunr(ApplicationContext applicationContext) {
        return JobRunr.configure()
                .useJobActivator(applicationContext::getBean)
                .useStorageProvider(SqlStorageProviderFactory
                          .using(applicationContext.getBean(DataSource.class)))
                .useBackgroundJobServer()
                .useDashboard()
                .initialize();
    }
}
```

__What happens here?__
- first a Spring Application is created, in this case a Spring Command Line application
- the important method here is again the `initJobRunr` method:
  - the Fluent API is started using JobRunr.configure()
  - after that, a `StorageProvider` is created with a DataSource that is defined in the `JobRunrStorageConfiguration` Spring configuration class.
  - a `JobActivator` is defined which uses the `getBean` method of the Spring `ApplicationContext`
  - the `BackgroundJobServer` itself is started by means of the `useBackgroundJobServer` method
  - the Dashboard is also started