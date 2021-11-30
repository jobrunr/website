---
title: "Quarkus Extension"
subtitle: "JobRunr has excellent support for Quarkus thanks to the JobRunr Quarkus Extension"
date: 2021-08-24T11:12:23+02:00
layout: "documentation"
menu: 
  main: 
    parent: 'configuration'
    weight: 20
---
Integration with Quarkus cannot be easier using the `quarkus-jobrunr` extension! There is even a complete example project available at [https://github.com/jobrunr/example-quarkus]

## Add the dependency to the extension
As the Quarkus Extension is available in Maven Central, all you need to do is add this dependency:
### Maven
```xml
<dependency> 
    <groupId>org.jobrunr</groupId> 
    <artifactId>quarkus-jobrunr</artifactId> 
    <version>${jobrunr.version}</version> 
</dependency>
```

### Gradle
```java
implementation 'org.jobrunr:quarkus-jobrunr:${jobrunr.version}'
```
<br/>

> Do note that you also need to add either [Jackson](https://search.maven.org/artifact/io.quarkus/quarkus-jackson) or [Yasson](https://search.maven.org/artifact/io.quarkus/quarkus-jsonb) for Json serialization. See the [installation]({{< ref "../../installation/_index.md" >}}) page for more info.


## Configure JobRunr
JobRunr can be configured easily in your `application.properties`. If you only want to schedule jobs, you don't need to do anything. If you want to have a `BackgroundJobServer` to process background jobs or the dashboard enabled, just add the following properties to the `application.properties`:

```
quarkus.jobrunr.background-job-server.enabled=true
quarkus.jobrunr.dashboard.enabled=true

```

These are disabled by default so that your web application does not start processing jobs by accident.


> The `quarkus-jobrunr` extension will try to either use an existing `DataSource` bean for relational databases or it will use one of the provided NoSQL client beans (like `MongoClient` for MongoDB and `RestHighLevelClient` for ElasticSearch. Redis is only supported by adding a custom Singleton that makes use of either Jedis or Lettuce). <br/>
> If no such bean is defined, you will either need to define it or create a `StorageProvider` bean yourself.

## Features
The JobRunr Quarkus extension not only adds distributed background Job Processing to your application but also adds Smallrye health checks and micrometer performance counters.

## Advanced Configuration
Every aspect of JobRunr can be configured via the `application.properties`. Below you will find all settings including their default value.

```
quarkus.jobrunr.database.skip-create=false
quarkus.jobrunr.database.table-prefix= # allows to set a table prefix (e.g. schema for all tables)
quarkus.jobrunr.database.datasource= # allows to specify a DataSource specifically for JobRunr
quarkus.jobrunr.job-scheduler.enabled=true
quarkus.jobrunr.background-job-server.enabled=false
quarkus.jobrunr.background-job-server.worker-count= #this value normally is defined by the amount of CPU's that are available
quarkus.jobrunr.background-job-server.poll-interval=15 #check for new work every 15 seconds
quarkus.jobrunr.background-job-server.delete-succeeded-jobs-after=36 #succeeded jobs will go to the deleted state after 36 hours
quarkus.jobrunr.background-job-server.permanently-delete-deleted-jobs-after=72 #deleted jobs will be deleted permanently after 72 hours
quarkus.jobrunr.dashboard.enabled=false
quarkus.jobrunr.dashboard.port=8000 #the port on which to start the dashboard
```