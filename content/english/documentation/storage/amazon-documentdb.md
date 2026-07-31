---
title: "Amazon DocumentDB"
description: "Use Amazon DocumentDB as the JobRunr StorageProvider - client dependency, configuration, and the primary-node read requirement."
date: 2026-07-31
layout: "documentation"
menu:
  sidebar:
    parent: storage
    weight: 110
---

JobRunr stores all background jobs in Amazon DocumentDB through the `AmazonDocumentDBStorageProvider`. It creates a database called `jobrunr` and all the necessary collections automatically.

## Add the client dependency

Amazon DocumentDB is compatible with the MongoDB API, so it uses the MongoDB Java driver (sync).

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

Point a `MongoClient` at your DocumentDB cluster endpoint. Unlike MongoDB, DocumentDB is never selected implicitly - a `MongoClient` on its own gives you the MongoDB provider - so in Spring Boot and Quarkus you have to [set the database type]({{< ref "documentation/storage#choosing-the-database-type" >}}) to `documentdb`.

{{< codetabs category="framework" >}}
{{< codetab label="Fluent API" >}}
```java
MongoClient mongoClient = MongoClients.create(MongoClientSettings.builder()
    .applyConnectionString(new ConnectionString("mongodb://<user>:<password>@<cluster-endpoint>:27017/?tls=true&replicaSet=rs0&readPreference=primary"))
    .uuidRepresentation(UuidRepresentation.STANDARD)
    .build());

JobRunr.configure()
    .useStorageProvider(new AmazonDocumentDBStorageProvider(mongoClient))
    .useBackgroundJobServer()
    .initialize();
```
{{< /codetab >}}

{{< codetab label="Quarkus" >}}
```properties
quarkus.mongodb.connection-string=mongodb://<user>:<password>@<cluster-endpoint>:27017/?tls=true&replicaSet=rs0&readPreference=primary
quarkus.mongodb.uuid-representation=standard # required, see below
quarkus.jobrunr.database.type=documentdb
```
{{< /codetab >}}

{{< codetab label="Spring" >}}
```properties
spring.data.mongodb.uri=mongodb://<user>:<password>@<cluster-endpoint>:27017/?tls=true&replicaSet=rs0&readPreference=primary
# spring.data.mongodb.uuid-representation already defaults to java-legacy
jobrunr.database.type=documentdb
```
{{< /codetab >}}
{{< /codetabs >}}

> [!NOTE]
> Micronaut has no DocumentDB auto-configuration. Define a `StorageProvider` bean backed by `AmazonDocumentDBStorageProvider` yourself - see [configure the StorageProvider yourself]({{< ref "documentation/storage#configure-the-storageprovider-yourself" >}}).

> [!WARNING]
> Just like with MongoDB clusters, JobRunr must read from the `primary` node. Reading from a secondary returns stale data (replication is asynchronous) and causes `ConcurrentModificationException`s. Use `readPreference=primary` in your connection string.

> [!WARNING]
> **Your `MongoClient` must have a UUID representation configured.** DocumentDB speaks to the MongoDB Java driver, whose default representation has been `UNSPECIFIED` since version 4.0 - and the driver refuses to encode the `java.util.UUID`s JobRunr uses as job ids. JobRunr fails fast at startup with a `StorageException` rather than breaking on the first job, so a `MongoClient` bean needs the same `uuidRepresentation` as the example above.
>
> JobRunr accepts both `standard` and `java-legacy`. Pick one and keep it: the two encode the same UUID to different bytes, so switching later makes the job ids already in your database unreadable.

## Next steps

- **Using more than one database?** Tell JobRunr which one it should use. See [multiple databases in one application]({{< ref "documentation/storage#multiple-databases-in-one-application" >}}).
- **Build the `StorageProvider` yourself:** Take full control instead of letting the framework integration configure it for you. See [configuring the StorageProvider yourself]({{< ref "documentation/storage#configure-the-storageprovider-yourself" >}}).

Looking for another database? Back to the [Storage overview]({{< ref "documentation/storage" >}}).
