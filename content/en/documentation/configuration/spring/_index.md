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
Integration with Spring cannot be easier using the `jobrunr-spring-boot-starter`! There is even a complete example project available at [https://github.com/jobrunr/example-spring](https://github.com/jobrunr/example-spring).

## Add the dependency to the starter
As the `jobrunr-spring-boot-starter` is available in Maven Central, all you need to do is add this dependency:
### Maven
```xml
<dependency> 
    <groupId>org.jobrunr</groupId> 
    <artifactId>jobrunr-spring-boot-starter</artifactId> 
    <version>${jobrunr.version}</version> 
</dependency>
```

### Gradle
```java
implementation 'org.jobrunr:jobrunr-spring-boot-starter:${jobrunr.version}'
```
<br/>

> Do note that if you are **not** working in a web environment, you also need to add either _Jackson_, _Gson_ or _Yasson_ for Json serialization. See the [installation]({{< ref "../../installation/_index.md" >}}) page for more info.


## Configure JobRunr
JobRunr can be configured easily in your `application.properties`. If you only want to schedule jobs, you don't need to do anything. If you want to have a `BackgroundJobServer` to process background jobs or the dashboard enabled, just add the following properties to the `application.properties`:

```
org.jobrunr.background-job-server.enabled=true
org.jobrunr.dashboard.enabled=true
```

These are disabled by default so that your web application does not start processing jobs by accident.


> The `jobrunr-spring-boot-starter` will try to either use an existing `DataSource` bean for relational databases or it will use one of the provided NoSQL client beans (like `MongoClient` for MongoDB, `RestHighLevelClient` for ElasticSearch and `JedisPool` or `RedisClient` for Redis). <br/>
> If no such bean is defined, you will either need to define it or create a `StorageProvider` bean yourself.

## Features
The `jobrunr-spring-boot-starter` not only adds distributed background Job Processing to your application but also adds health actuators and micrometer performance counters.

## Advanced Configuration
Every aspect of JobRunr can be configured via the `application.properties`. Below you will find all settings including their default value.

```
org.jobrunr.database.skip_create=false
org.jobrunr.database.table_prefix= # allows to set a table prefix (e.g. schema  or schema and tableprefix for all tables. e.g. MYSCHEMA._jobrunr)
org.jobrunr.database.datasource= # allows to specify a DataSource specifically for JobRunr
org.jobrunr.database.type= # if you have multiple supported storage providers available in your application (e.g. an SQL DataSource and Elasticsearch), it allows to specify which database to choose. Valid values are 'sql', 'mongodb', 'redis-lettuce', 'redis-jedis' and 'elasticsearch'.
org.jobrunr.jobs.default-number-of-retries=10 #the default number of retries for a failing job
org.jobrunr.jobs.retry-back-off-time-seed=3 #the default time seed for the exponential back-off policy.
org.jobrunr.job-scheduler.enabled=true
org.jobrunr.background-job-server.enabled=false
org.jobrunr.background-job-server.worker-count= #this value normally is defined by the amount of CPU's that are available
org.jobrunr.background-job-server.poll-interval=15 #check for new work every 15 seconds
org.jobrunr.background-job-server.delete-succeeded-jobs-after=36 #succeeded jobs will go to the deleted state after 36 hours
org.jobrunr.background-job-server.permanently-delete-deleted-jobs-after=72 #deleted jobs will be deleted permanently after 72 hours
org.jobrunr.dashboard.enabled=false
org.jobrunr.dashboard.port=8000 #the port on which to start the dashboard
```