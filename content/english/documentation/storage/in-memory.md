---
title: "In-memory"
description: "Use the JobRunr InMemoryStorageProvider for testing and lightweight, instance-local tasks."
date: 2026-07-31
layout: "documentation"
menu:
  sidebar:
    parent: storage
    weight: 120
---

JobRunr ships with an `InMemoryStorageProvider` that keeps all jobs in process memory. It is ideal for tests and for lightweight, server-instance-specific tasks where persistence does not matter.

> [!WARNING]
> The `InMemoryStorageProvider` is not persistent: jobs do not survive a restart. Because the storage is not shared, you **cannot scale horizontally** - run only a single instance. For most production workload, you want to use a persistent [SQL]({{< ref "documentation/storage#sql-databases" >}}) or [NoSQL]({{< ref "documentation/storage#nosql-databases" >}}) database.

## Configuration

No dependency is required - the `InMemoryStorageProvider` is part of JobRunr core.

{{< codetabs category="framework" >}}
{{< codetab label="Fluent API" >}}
```java
JobRunr.configure()
    .useStorageProvider(new InMemoryStorageProvider())
    .useBackgroundJobServer()
    .initialize();
```
{{< /codetab >}}

{{< codetab label="Micronaut" >}}
```yaml
jobrunr:
  database:
    type: mem
```
{{< /codetab >}}

{{< codetab label="Quarkus" >}}
```properties
quarkus.jobrunr.database.type=mem
```
{{< /codetab >}}

{{< codetab label="Spring" >}}
```properties
jobrunr.database.type=mem
```
{{< /codetab >}}
{{< /codetabs >}}

## Next steps

- **Using more than one database?** Tell JobRunr which one it should use. See [multiple databases in one application]({{< ref "documentation/storage#multiple-databases-in-one-application" >}}).
- **Build the `StorageProvider` yourself:** Take full control instead of letting the framework integration configure it for you. See [configuring the StorageProvider yourself]({{< ref "documentation/storage#configure-the-storageprovider-yourself" >}}).

Looking for another database? Back to the [Storage overview]({{< ref "documentation/storage" >}}).
