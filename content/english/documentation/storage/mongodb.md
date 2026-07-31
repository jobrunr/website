---
title: "MongoDB"
description: "Use MongoDB as the JobRunr StorageProvider - client dependency, configuration, and the primary-node read requirement."
date: 2026-07-31
layout: "documentation"
menu:
  sidebar:
    parent: storage
    weight: 100
---

JobRunr stores all background jobs in MongoDB through the `MongoDBStorageProvider`. JobRunr supports all MongoDB versions from 4 and up. It creates a database called `jobrunr` and all the necessary collections automatically.

## Add the client dependency

JobRunr uses the **synchronous** MongoDB Java driver - it needs a `com.mongodb.client.MongoClient`, so the reactive driver on its own is not enough.

If you use a framework, add its MongoDB module rather than the driver: it brings the driver along and pins a version that matches your framework release, so leave the version to the BOM.

Without a framework, add the driver yourself. The latest version is on [Maven Central](https://central.sonatype.com/artifact/org.mongodb/mongodb-driver-sync).

{{< codetabs category="dependency" >}}
{{< codetab label="Maven" >}}
```xml
<dependency>
  <groupId>org.mongodb</groupId>
  <artifactId>mongodb-driver-sync</artifactId>
  <version><!-- latest version --></version>
</dependency>
```
{{< /codetab >}}
{{< codetab label="Gradle" >}}
```groovy
implementation 'org.mongodb:mongodb-driver-sync' // version omitted, use latest
```
{{< /codetab >}}
{{< /codetabs >}}

## Configuration

If you use a framework starter, JobRunr automatically detects an existing `MongoClient` bean. When your application also has an SQL `DataSource`, [set the database type]({{< ref "documentation/storage#choosing-the-database-type" >}}) to `mongodb` so JobRunr knows which one to use.

{{< codetabs category="framework" >}}
{{< codetab label="Fluent API" >}}
```java
MongoClient mongoClient = MongoClients.create(MongoClientSettings.builder()
    .applyConnectionString(new ConnectionString("mongodb://localhost:27017"))
    .uuidRepresentation(UuidRepresentation.STANDARD)
    .build());

JobRunr.configure()
    .useStorageProvider(new MongoDBStorageProvider(mongoClient))
    .useBackgroundJobServer()
    .initialize();
```
{{< /codetab >}}

{{< codetab label="Micronaut" >}}
```yaml
mongodb:
  uri: mongodb://localhost:27017/mydb
  uuid-representation: standard # required, see below
jobrunr:
  database:
    # only needed when an SQL DataSource is also present:
    type: mongodb
```
{{< /codetab >}}

{{< codetab label="Quarkus" >}}
```properties
quarkus.mongodb.connection-string=mongodb://localhost:27017
quarkus.mongodb.uuid-representation=standard # required, see below
# only needed when an SQL DataSource is also present:
quarkus.jobrunr.database.type=mongodb
```
{{< /codetab >}}

{{< codetab label="Spring" >}}
```properties
spring.data.mongodb.uri=mongodb://localhost:27017/mydb
# spring.data.mongodb.uuid-representation already defaults to java-legacy
# only needed when an SQL DataSource is also present:
jobrunr.database.type=mongodb
```
{{< /codetab >}}
{{< /codetabs >}}

> [!WARNING]
> When using a MongoDB cluster, JobRunr must read from the `primary` node. MongoDB replicates updates to secondary nodes asynchronously, and JobRunr is often faster than that replication - reading from a secondary returns stale data and causes `ConcurrentModificationException`s.

> [!WARNING]
> **Your `MongoClient` must have a UUID representation configured.** JobRunr identifies jobs and background job servers by `java.util.UUID`. Since version 4.0 of the MongoDB Java driver the default representation is `UNSPECIFIED`, which the driver refuses to encode - so JobRunr fails fast at startup with a `StorageException` instead of breaking on the first job. Quarkus and Micronaut leave the driver default in place, so you have to set it yourself; Spring Boot already defaults to `java-legacy`.
>
> JobRunr accepts both `standard` and `java-legacy`. Pick one and keep it: the two encode the same UUID to different bytes, so switching later makes the job ids already in your database unreadable. For a new setup, `standard` is the portable choice.

## Next steps

- **Using more than one database?** Tell JobRunr which one it should use. See [multiple databases in one application]({{< ref "documentation/storage#multiple-databases-in-one-application" >}}).
- **Build the `StorageProvider` yourself:** Take full control instead of letting the framework integration configure it for you. See [configuring the StorageProvider yourself]({{< ref "documentation/storage#configure-the-storageprovider-yourself" >}}).

Looking for another database? Back to the [Storage overview]({{< ref "documentation/storage" >}}).
