---
title: "Quarkus Configuration"
subtitle: "JobRunr integrates almost with any framework - also with Quarkus"
date: 2020-09-16T11:12:23+02:00
layout: "documentation"
menu: 
  main: 
    parent: 'configuration'
    weight: 15
---
## Enqueueing and processing in the same JVM instance in Quarkus
Here is an example on how to integrate JobRunr with Quarkus.

```java
public class JobRunrProvider {

    @Produces
    @Singleton
    public BackgroundJobServer backgroundJobServer(StorageProvider storageProvider, JobActivator jobActivator) {
        final BackgroundJobServer backgroundJobServer = new BackgroundJobServer(storageProvider, jobActivator);
        backgroundJobServer.start();
        return backgroundJobServer;
    }

    @Produces
    @Singleton
    public JobRunrDashboardWebServer dashboardWebServer(StorageProvider storageProvider, JsonMapper jsonMapper) {
        final JobRunrDashboardWebServer jobRunrDashboardWebServer = new JobRunrDashboardWebServer(storageProvider, jsonMapper);
        jobRunrDashboardWebServer.start();
        return jobRunrDashboardWebServer;
    }

    @Produces
    @Singleton
    public JobActivator jobActivator() {
        return new JobActivator() {
            @Override
            public <T> T activateJob(Class<T> aClass) {
                return CDI.current().select(aClass).get();
            }
        };
    }

    @Produces
    @Singleton
    public JobScheduler jobScheduler(StorageProvider storageProvider) {
        JobScheduler jobScheduler = new JobScheduler(storageProvider);
        BackgroundJob.setJobScheduler(jobScheduler);
        return jobScheduler;
    }

    @Produces
    @Singleton
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

    @Produces
    @Singleton
    public JobMapper jobMapper(JsonMapper jsonMapper) {
        return new JobMapper(jsonMapper);
    }

    @Produces
    @Singleton
    public JsonMapper jsonMapper() {
        return new JacksonJsonMapper();
    }

}
```
__What happens here:__
- a `BackgroundJobServer` bean is created using a `StorageProvider` and a `JobActivator`. This singleton is responsible for the processing of all the background jobs.
- the `JobRunrDashboardWebServer` singleton is defined which visualizes the processing of all jobs and consumes the `StorageProvider` and `JsonMapper`
- the `JobActivator` is defined and uses the CDI to find the correct singleton on which to call the background job method.
- the `JobScheduler` singleton is defined which allows to enqueue jobs. By adding the `JobScheduler` also to the `BackgroundJob` class, the static methods on `BackgroundJob` can be called directly and there is no need to inject the `JobScheduler` in classes where background jobs are enqueued - this is off course a matter of taste.
- a `StorageProvider` singleton is created using a `DataSource` and a `JobMapper`
- in this example a SQLiteDataSource is used
- a `JobMapper` is defined using a `JsonMapper` which has the responsability to map the background jobs to Json
- a `JsonMapper` is created, in this case it is a `JacksonJsonMapper`

<br>

## Advanced Configuration

The JobRunr configuration allows you to setup JobRunr completely to your liking. 

### BackgroundJobServer
You can configure the amount of worker threads and the different JobFilters that the `BackgroundJobServer` should run:

```java
BackgroundJobServer backgroundJobServer = new BackgroundJobServer(storageProvider, jobActivator, usingStandardBackgroundJobServerConfiguration().andWorkerCount(workerCount));
backgroundJobServer.setJobFilters(List.of(new RetryFilter(2)));
backgroundJobServer.start();
```

### DashboardWebServer
Also some options of the `DashboardWebServer` can be configured:

```java
int portOnWhichToRunDashboard = 8080;
JobRunrDashboardWebServer dashboardWebServer = new JobRunrDashboardWebServer(storageProvider, jsonMapper, portOnWhichToRunDashboard);
dashboardWebServer.start();
```


> For more options, check out the JobRunr JavaDoc.