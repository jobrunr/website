---
title: "Spring Configuration"
subtitle: "JobRunr integrates almost with any framework - also with Spring"
date: 2020-04-30T11:12:23+02:00
layout: "documentation"
menu: 
  main: 
    parent: 'configuration'
    weight: 10
---
## Enqueueing and processing in the same JVM instance
If you want to start with minimal server resources, this is the way to go: the application can enqueue jobs from a REST API and return without blocking the http call and the processing then takes place in different background threads but all within the same JVM instance.

```java
@SpringBootApplication
@Import(JobRunrStorageConfiguration.class)
public class WebApplication {

    public static void main(String[] args) {
        SpringApplication.run(WebApplication.class, args);
    }

    @Bean
    public BackgroundJobServer backgroundJobServer(StorageProvider storageProvider, JobActivator jobActivator) {
        final BackgroundJobServer backgroundJobServer = new BackgroundJobServer(storageProvider, jobActivator);
        backgroundJobServer.start();
        return backgroundJobServer;
    }

    @Bean
    public JobRunrDashboardWebServer dashboardWebServer(StorageProvider storageProvider, JsonMapper jsonMapper) {
        final JobRunrDashboardWebServer jobRunrDashboardWebServer = new JobRunrDashboardWebServer(storageProvider, jsonMapper);
        jobRunrDashboardWebServer.start();
        return jobRunrDashboardWebServer;
    }

    @Bean
    public JobActivator jobActivator(ApplicationContext applicationContext) {
        return applicationContext::getBean;
    }

    @Bean
    public JobScheduler jobScheduler(StorageProvider storageProvider) {
        JobScheduler jobScheduler = new JobScheduler(storageProvider);
        BackgroundJob.setJobScheduler(jobScheduler);
        return jobScheduler;
    }

    @Bean
    public StorageProvider storageProvider(DataSource dataSource, JobMapper jobMapper) {
        final SqLiteStorageProvider sqLiteStorageProvider = new SqLiteStorageProvider(dataSource);
        sqLiteStorageProvider.setJobMapper(jobMapper);
        return sqLiteStorageProvider;
    }

    @Bean
    public SQLiteDataSource dataSource() {
        final SQLiteDataSource dataSource = new SQLiteDataSource();
        dataSource.setUrl("jdbc:sqlite:" + Paths.get(System.getProperty("java.io.tmpdir"), "jobrunr.db"));
        return dataSource;
    }

    @Bean
    public JobMapper jobMapper(JsonMapper jsonMapper) {
        return new JobMapper(jsonMapper);
    }

    @Bean
    public JsonMapper jsonMapper() {
        return new JacksonJsonMapper();
    }

}
```
__What happens here:__
- a `BackgroundJobServer` bean is created using a `StorageProvider` and a `JobActivator`. This bean is responsible for the processing of all the background jobs.
- the `JobRunrDashboardWebServer` which visualizes the processing of all jobs and consumes the `StorageProvider` and `JsonMapper`
- the `JobActivator` is defined and uses the Spring application context to find the correct bean on which to call the background job method.
- the `JobScheduler` bean is defined which allows to enqueue jobs. By adding the `JobScheduler` also to the `BackgroundJob` class, the static methods on `BackgroundJob` can be called directly and there is no need to inject the `JobScheduler` in classes where background jobs are enqueued---of course this is a matter of taste.
- a `StorageProvider` bean is created using a `DataSource` and a `JobMapper`
- in this example a SQLiteDataSource is used
- a `JobMapper` is defined using a `JsonMapper` which has the responsability to map the background jobs to Json
- a `JsonMapper` is created, in this case it is a `JacksonJsonMapper`

<br>

## Enqueueing and processing in different JVM instances
JobRunr can be configured like any other spring bean and in this example - where the application that enqueues background jobs is __not__ processing these jobs, a shared configuration is defined in a `JobRunrStorageConfiguration` class which is then imported later on.

### Shared configuration

```java
@Configuration
@ComponentScan(basePackageClasses = JobRunrStorageConfiguration.class)
public class JobRunrStorageConfiguration {

    @Bean
    public StorageProvider storageProvider(DataSource dataSource, JobMapper jobMapper) {
        final SqLiteStorageProvider sqLiteStorageProvider = new SqLiteStorageProvider(dataSource);
        sqLiteStorageProvider.setJobMapper(jobMapper);
        return sqLiteStorageProvider;
    }

    @Bean
    public SQLiteDataSource dataSource() {
        final SQLiteDataSource dataSource = new SQLiteDataSource();
        dataSource.setUrl("jdbc:sqlite:" + Paths.get(System.getProperty("java.io.tmpdir"), "jobrunr.db"));
        return dataSource;
    }

    @Bean
    public JobMapper jobMapper(JsonMapper jsonMapper) {
        return new JobMapper(jsonMapper);
    }

    @Bean
    public JsonMapper jsonMapper() {
        return new JacksonJsonMapper();
    }

}
```

__What happens here:__
- a `StorageProvider` bean is created using a `DataSource` and a `JobMapper`
- in this example a SQLiteDataSource is used
- a `JobMapper` is defined using a `JsonMapper` which has the responsability to map the background jobs to Json
- a `JsonMapper` is created, in this case it is a `JacksonJsonMapper`


### WebApp configuration
In the WebApp configuration, the shared configuration is reused:

```java
@SpringBootApplication
@Import(JobRunrStorageConfiguration.class)
public class WebApplication {

    public static void main(String[] args) {
        SpringApplication.run(WebApplication.class, args);
    }

    @Bean
    public JobScheduler jobScheduler(StorageProvider storageProvider) {
        JobScheduler jobScheduler = new JobScheduler(storageProvider);
        BackgroundJob.setJobScheduler(jobScheduler);
        return jobScheduler;
    }
}
```

The only extra bean defined here is the `JobScheduler` bean. By adding the `JobScheduler` also to the `BackgroundJob` class, the static methods on `BackgroundJob` can be called directly and there is no need to inject the `JobScheduler` in classes where background jobs are enqueued---of course this is a matter of taste.

### Background job server configuration
The Background job server configuration again reuses the shared configuration:

```java
@SpringBootApplication
@Import(JobRunrStorageConfiguration.class)
public class JobServerApplication implements CommandLineRunner {

    public static void main(String[] args) {
        SpringApplication.run(JobServerApplication.class, args);
    }

    @Override
    public void run(String... args) throws InterruptedException {
        Thread.currentThread().join(); // keep running forever
    }

    @Bean
    public JobRunrDashboardWebServer dashboardWebServer(StorageProvider storageProvider, JsonMapper jsonMapper) {
        final JobRunrDashboardWebServer jobRunrDashboardWebServer = new JobRunrDashboardWebServer(storageProvider, jsonMapper);
        jobRunrDashboardWebServer.start();
        return jobRunrDashboardWebServer;
    }

    @Bean
    public BackgroundJobServer backgroundJobServer(StorageProvider storageProvider, JobActivator jobActivator) {
        final BackgroundJobServer backgroundJobServer = new BackgroundJobServer(storageProvider, jobActivator);
        backgroundJobServer.start();
        return backgroundJobServer;
    }

    @Bean
    public JobActivator jobActivator(ApplicationContext applicationContext) {
        return applicationContext::getBean;
    }
}
```

Here, three extra beans are defined:
- the `JobRunrDashboardWebServer` which visualizes the processing of all jobs and consumes the `StorageProvider` and `JsonMapper` which are defined in the shared configuration
- the `BackgroundJobServer` is defined and consumes again the `StorageProvider` and the `JobActivator`
- the `JobActivator` is defined and uses the Spring application context to find the correct bean on which to call the background job method.