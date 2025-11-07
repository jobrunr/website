---
title: "Spring Boot Starter"
subtitle: "JobRunr has excellent Spring support thanks to the jobrunr-spring-boot-starter"
date: 2021-08-24T11:12:23+02:00
layout: "documentation"
menu: 
  main: 
    parent: 'configuration'
    weight: 10
---

Integration with Spring cannot be easier using the ~`jobrunr-spring-boot-2-starter`~ or `jobrunr-spring-boot-3-starter`! There is even a complete example project available at [https://github.com/jobrunr/example-spring](https://github.com/jobrunr/example-spring).

> **Important**: the `jobrunr-spring-boot-starter-2` is removed since JobRunr v8. In JobRunr Pro, support is still available.

__To add JobRunr to your Spring project, these are the steps you need to take:__
1. Depending on your version of Spring Boot, add the `jobrunr-spring-boot-3-starter` dependency to your project
2. Configure JobRunr via the Spring `application.properties` file
3. Inject the `JobScheduler` or `JobRequestScheduler` bean and use it to create background jobs!

> Do you want to create jobs that automatically participate in the transactions managed by Spring? Then checkout [JobRunr Pro]({{<ref "transactions.md">}})!

{{< trial-button >}}

## Add the dependency to the starter
As `jobrunr-spring-boot-3-starter` is available in Maven Central, all you need to do is add this dependency:
### Maven
```xml
<dependency> 
    <groupId>org.jobrunr</groupId> 
    <artifactId>jobrunr-spring-boot-3-starter</artifactId>
    <version>${jobrunr.version}</version> 
</dependency>
```

### Gradle
```java
implementation 'org.jobrunr:jobrunr-spring-boot-3-starter:${jobrunr.version}'
```
<br/>

> Do note that if you are **not** working in a web environment, you also need to add either _Jackson_, _Gson_ or _Yasson_ for Json serialization. See the [installation]({{< ref "../../installation/_index.md" >}}) page for more info.


## Configure JobRunr
JobRunr can be configured easily in your `application.properties`. If you only want to schedule jobs, you don't need to do anything. If you want to have a `BackgroundJobServer` to process background jobs or the dashboard enabled, just add the following properties to the `application.properties`:

```
jobrunr.background-job-server.enabled=true
jobrunr.dashboard.enabled=true
```

These are disabled by default so that your web application does not start processing jobs by accident.


> The `jobrunr-spring-boot-starter` will try to either use an existing `DataSource` bean for relational databases or it will use one of the provided NoSQL client beans (like `MongoClient` for MongoDB). <br/>
> If no such bean is defined, you will either need to define it or create a `StorageProvider` bean yourself.

## Features

`jobrunr-spring-boot-3-starter` not only adds distributed background Job Processing to your application but also add health actuators and micrometer performance counters.

## Advanced Configuration

Every aspect of JobRunr can be configured via the `application.properties`. Below you will find all settings including their default value.

```
jobrunr.database.skip-create=false
jobrunr.database.table-prefix= # allows to set a table prefix (e.g. schema  or schema and tableprefix for all tables. e.g. MYSCHEMA._jobrunr)
jobrunr.database.database-name=jobrunr # Override the default database name to use (e.g. use main application database)
jobrunr.database.datasource= # allows to specify a DataSource specifically for JobRunr
jobrunr.database.type= # if you have multiple supported storage providers available in your application (e.g. an SQL DataSource and a NoSQL one), it allows to specify which database to choose. Valid values are 'sql', 'mongodb'.
jobrunr.jobs.default-number-of-retries=10 #the default number of retries for a failing job
jobrunr.jobs.retry-back-off-time-seed=3 #the default time seed for the exponential back-off policy.
jobrunr.jobs.metrics.enabled=false #Micrometer integration - this was true in v5.
jobrunr.job-scheduler.enabled=true
jobrunr.background-job-server.enabled=false
jobrunr.background-job-server.worker-count= #this value normally is defined by the amount of CPU's that are available
jobrunr.background-job-server.poll-interval-in-seconds=15 #check for new work every 15 seconds
jobrunr.background-job-server.delete-succeeded-jobs-after=36h #succeeded jobs will go to the deleted state after 36 hours
jobrunr.background-job-server.permanently-delete-deleted-jobs-after=72h #deleted jobs will be deleted permanently after 72 hours
jobrunr.background-job-server.metrics.enabled=true # Micrometer integration: reports server metrics (cpu usage, memory usage, worker pool size, etc.)
jobrunr.dashboard.enabled=false
jobrunr.dashboard.port=8000 #the port on which to start the dashboard
jobrunr.miscellaneous.allow-anonymous-data-usage=true #this sends the amount of succeeded jobs for marketing purposes
```

See the [Carbon Aware Job Processing docs](/en/documentation/configuration/carbon-aware/) for info on how to configure Carbon Aware specific properties. 
