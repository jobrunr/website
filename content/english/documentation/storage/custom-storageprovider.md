---
title: "Custom StorageProvider"
description: "Your database is not supported out of the box? Implement a custom JobRunr StorageProvider for any database."
date: 2026-07-31
layout: "documentation"
menu:
  sidebar:
    parent: storage
    weight: 130
---

JobRunr supports all major [SQL]({{< ref "documentation/storage#sql-databases" >}}) and [NoSQL]({{< ref "documentation/storage#nosql-databases" >}}) databases out of the box. If yours is not listed, you have two options.

## Use an API-compatible database

Many databases speak a wire protocol that JobRunr already supports, so you can reuse an existing `StorageProvider`:

- **PostgreSQL-compatible** databases (TimescaleDB, YugabyteDB, AWS Aurora PostgreSQL, ...) work with the PostgreSQL driver. See [PostgreSQL]({{< ref "documentation/storage/postgres" >}}) and [CockroachDB]({{< ref "documentation/storage/cockroachdb" >}}).
- **MySQL-compatible** databases (AWS Aurora MySQL, TiDB, ...) work with the MySQL driver. See [MySQL]({{< ref "documentation/storage/mysql" >}}).
- **MongoDB-compatible** databases (Amazon DocumentDB, ...) work with the MongoDB driver. See [Amazon DocumentDB]({{< ref "documentation/storage/amazon-documentdb" >}}).

If your database is API-compatible with any of these, start there.

> [!NOTE]
> Support for **Redis** and **Elasticsearch** was deprecated in JobRunr v7 and removed in v8. If you relied on `LettuceStorageProvider`, `JedisStorageProvider`, or `ElasticSearchStorageProvider`, migrate to one of the [supported databases]({{< ref "documentation/storage" >}}).

## Implement a custom `StorageProvider`

For anything else, you can implement the `org.jobrunr.storage.StorageProvider` interface yourself. This is what every built-in provider does, so the existing implementations are your best reference - browse them in the [JobRunr source on GitHub](https://github.com/jobrunr/jobrunr/tree/master/core/src/main/java/org/jobrunr/storage).

Then register it like any other provider:

```java
JobRunr.configure()
    .useStorageProvider(new MyCustomStorageProvider(/* ... */))
    .useBackgroundJobServer()
    .initialize();
```

When using a framework, expose your implementation as a `StorageProvider` bean and JobRunr will pick it up.

### Test your implementation thoroughly

A `StorageProvider` is the backbone of JobRunr - if it misbehaves, jobs are lost, duplicated, or processed more than once. That is why JobRunr ships [`StorageProviderTest`](https://github.com/jobrunr/jobrunr/blob/master/core/src/testFixtures/java/org/jobrunr/storage/StorageProviderTest.java), the same abstract test suite every built-in provider is verified against. **To be fully compatible, your implementation has to pass it.** It is published as a test fixtures artifact, so you can depend on it directly:

{{< codetabs category="dependency" >}}
{{< codetab label="Maven" >}}
```xml
<dependency>
  <groupId>org.jobrunr</groupId>
  <artifactId>jobrunr</artifactId>
  <version>{{< param "JobRunrVersion" >}}</version>
  <classifier>test-fixtures</classifier>
  <scope>test</scope>
</dependency>
```
{{< /codetab >}}
{{< codetab label="Gradle" >}}
```groovy
testImplementation testFixtures('org.jobrunr:jobrunr:{{< param "JobRunrVersion" >}}')
```
{{< /codetab >}}
{{< /codetabs >}}

Extend it and hand it your provider:

```java
class MyCustomStorageProviderTest extends StorageProviderTest {

    @Override
    protected StorageProvider getStorageProvider() {
        return new MyCustomStorageProvider(/* ... */);
    }

    @Override
    protected void cleanup(int testMethodIndex) {
        // wipe the database between tests
    }
}
```

You may deliberately skip part of it. For instance, if you know you will never use recurring jobs, for instance, you can disable those tests. What you cannot skip is making sure the unsupported paths degrade gracefully instead of crashing JobRunr. The `InMemoryStorageProvider` and its tests are a good, dependency-free starting point to study.

> [!CAUTION]
> Test exhaustively, including concurrent access from multiple background job servers. JobRunr relies on the `StorageProvider` for distributed coordination; incomplete testing can lead to jobs being processed twice or skipped in production.

---

Back to the [Storage overview]({{< ref "documentation/storage" >}}).
