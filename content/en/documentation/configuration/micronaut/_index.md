---
title: "Micronaut Integration"
subtitle: "JobRunr has excellent support for Micronaut thanks to the JobRunr Micronaut Integration"
date: 2021-08-24T11:12:23+02:00
layout: "documentation"
menu: 
  main: 
    parent: 'configuration'
    weight: 15
---
Integration with Micronaut cannot be easier thanks to the `jobrunr-micronaut-feature`! There is even a complete example project available at [https://github.com/jobrunr/example-micronaut](https://github.com/jobrunr/example-micronaut)

__To add JobRunr to your Micronaut project, these are the steps you need to take:__
1. Add the `jobrunr-micronaut-feature` dependency to your project
2. Configure JobRunr via the Micronaut `application.yml` file
3. Inject the `JobScheduler` or `JobRequestScheduler` bean and use it to create background jobs!

> Do you want to create jobs that automatically participate in the transactions managed by Micronaut? Then checkout [JobRunr Pro]({{<ref "transactions.md">}})!

{{< trial-button >}}

## Add the dependency to the extension
As the Micronaut Integration is available in Maven Central, all you need to do is add this dependency:
### Maven
```xml
<dependency> 
    <groupId>org.jobrunr</groupId> 
    <artifactId>jobrunr-micronaut-feature</artifactId> 
    <version>${jobrunr.version}</version> 
</dependency>
```

### Gradle
```java
implementation 'org.jobrunr:jobrunr-micronaut-feature:${jobrunr.version}'
```
<br/>

## Configure JobRunr
JobRunr can be configured easily in your `application.yml`. If you only want to schedule jobs, you don't need to do anything. If you want to have a `BackgroundJobServer` to process background jobs or the dashboard enabled, just add the following properties to the `application.yml`:

```
jobrunr:
  background-job-server:
    enabled: true
  dashboard:
    enabled: true

```

These are disabled by default so that your web application does not start processing jobs by accident.


> The `jobrunr-micronaut-feature` will try to either use an existing `DataSource` bean for relational databases or it will use one of the provided NoSQL client beans (like `MongoClient` for MongoDB, `RestHighLevelClient` for ElasticSearch and the Lettuce `RedisClient` for Redis).<br/>
> If no such bean is defined, you will either need to define it or create a `StorageProvider` bean yourself.

## Features
The JobRunr Quarkus extension not only adds distributed background Job Processing to your application but also adds health endpoints and micrometer performance counters to the metrics endpoint.

## Advanced Configuration
Every aspect of JobRunr can be configured via the `application.yaml`. Below you will find all settings including their default value.

```
jobrunr:
  database:
    skip-create: false
    table_prefix: # allows to set a table prefix (e.g. schema for all tables)
    datasource: # allows to specify a DataSource specifically for JobRunr
    type: # if you have multiple supported storage providers available in your application (e.g. an SQL DataSource and Elasticsearch), it allows to specify which database to choose. Valid values are 'sql', 'mongodb', 'redis-lettuce', 'redis-jedis' and 'elasticsearch'.
  jobs:
    default-number-of-retries:10 #the default number of retries for a failing job
    retry-back-off-time-seed:3 #the default time seed for the exponential back-off policy.
  background-job-server:
    enabled: false
    worker-count: #this value normally is defined by the amount of CPU's that are available
    poll-interval: 15 #check for new work every 15 seconds
    delete-succeeded-jobs-after: 36
    permanently-delete-deleted-jobs-after: 72
    metrics:
      enabled: false #Micrometer integration - this was true in v5.
  dashboard:
    enabled: false
    port: 8000 #the port on which to start the dashboard
  miscellaneous:
    allow-anonymous-data-usage: true #this sends the amount of succeeded jobs for marketing purposes
```