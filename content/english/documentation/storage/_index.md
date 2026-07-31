---
title: "Storage"
description: "Make background jobs durable by persisting them to your existing database. JobRunr works with all major SQL and NoSQL databases."
date: 2020-04-30T11:12:23+02:00
lastmod: 2026-07-31
layout: "documentation"
menu:
  sidebar:
    identifier: storage
    name: Storage
    weight: 12
sitemap:
  priority: 0.9
  changeFreq: monthly
aliases: ["/documentation/installation/storage"]
---

A `StorageProvider` is where JobRunr keeps everything related to background job processing - the job type, method, arguments, state, and metadata are [serialized to JSON]({{< ref "documentation/serialization" >}}) and stored in your database. Nothing is kept in process memory: this is what makes your jobs durable, resilient to crashes. Because every job lives in the database, JobRunr can distribute work across multiple servers and pick jobs back up after a restart or crash, so nothing is lost.

JobRunr supports all major **SQL** and document-based **NoSQL** databases out of the box. Pick yours below to get the dependency and configuration you need.

> [!IMPORTANT]
> You need to add the correct driver dependency (JDBC driver or database client) for the database you choose. Each page below lists the one it needs.

> [!CAUTION]
> Whatever database you pick, **JobRunr must read from the same node it writes to**. Replication is asynchronous and JobRunr is usually faster than it, so a read replica, a MongoDB secondary, or an Aurora/DocumentDB reader endpoint hands JobRunr stale data - which surfaces as `ConcurrentModificationException`s. Always point JobRunr at the primary (writer) node.

## SQL databases

<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
  <a href='{{< ref "documentation/storage/postgres" >}}' class="doc-card">
    <div class="w-10 h-10 shrink-0">{{< svg "assets/images/tech-logos/postgresql.svg" >}}</div>
    <h3 class="doc-card__title m-0">PostgreSQL</h3>
  </a>
  <a href='{{< ref "documentation/storage/mysql" >}}' class="doc-card">
    <div class="w-10 h-10 shrink-0">{{< svg "assets/images/tech-logos/mysql.svg" >}}</div>
    <h3 class="doc-card__title m-0">MySQL</h3>
  </a>
  <a href='{{< ref "documentation/storage/mariadb" >}}' class="doc-card">
    <div class="w-10 h-10 shrink-0">{{< svg "assets/images/tech-logos/mariadb.svg" >}}</div>
    <h3 class="doc-card__title m-0">MariaDB</h3>
  </a>
  <a href='{{< ref "documentation/storage/oracle" >}}' class="doc-card">
    <div class="w-10 h-10 shrink-0">{{< svg "assets/images/tech-logos/oracle.svg" >}}</div>
    <h3 class="doc-card__title m-0">Oracle</h3>
  </a>
  <a href='{{< ref "documentation/storage/sql-server" >}}' class="doc-card">
    <div class="w-10 h-10 shrink-0">{{< svg "assets/images/tech-logos/sqlserver.svg" >}}</div>
    <h3 class="doc-card__title m-0">SQL Server</h3>
  </a>
  <a href='{{< ref "documentation/storage/db2" >}}' class="doc-card">
    <div class="w-10 h-10 shrink-0">{{< svg "assets/images/tech-logos/db2.svg" >}}</div>
    <h3 class="doc-card__title m-0">IBM Db2</h3>
  </a>
  <a href='{{< ref "documentation/storage/h2" >}}' class="doc-card">
    <div class="w-10 h-10 shrink-0">{{< svg "assets/images/tech-logos/h2.svg" >}}</div>
    <h3 class="doc-card__title m-0">H2</h3>
  </a>
  <a href='{{< ref "documentation/storage/sqlite" >}}' class="doc-card">
    <div class="w-10 h-10 shrink-0">{{< svg "assets/images/tech-logos/sqlite.svg" >}}</div>
    <h3 class="doc-card__title m-0">SQLite</h3>
  </a>
  <a href='{{< ref "documentation/storage/cockroachdb" >}}' class="doc-card">
    <div class="w-10 h-10 shrink-0">{{< svg "assets/images/tech-logos/cockroachdb.svg" >}}</div>
    <h3 class="doc-card__title m-0">CockroachDB</h3>
  </a>
</div>

## NoSQL databases

<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
  <a href='{{< ref "documentation/storage/mongodb" >}}' class="doc-card">
    <div class="w-10 h-10 shrink-0">{{< svg "assets/images/tech-logos/mongodb.svg" >}}</div>
    <h3 class="doc-card__title m-0">MongoDB</h3>
  </a>
  <a href='{{< ref "documentation/storage/amazon-documentdb" >}}' class="doc-card">
    <div class="w-10 h-10 shrink-0">{{< svg "assets/images/tech-logos/amazon-documentdb.svg" >}}</div>
    <h3 class="doc-card__title m-0">Amazon DocumentDB</h3>
  </a>
  <a href='{{< ref "documentation/storage/in-memory" >}}' class="doc-card">
    <div class="w-10 h-10 shrink-0">{{< svg "assets/images/tech-logos/in-memory.svg" >}}</div>
    <h3 class="doc-card__title m-0">In-memory</h3>
  </a>
</div>

> Your database is not listed? See [Custom StorageProvider]({{< ref "documentation/storage/custom-storageprovider" >}}) for how to implement support for any database.

## Setting up an SQL database

Setting up an SQL database is easy because you probably don't need to do anything: by default **JobRunr automatically creates the necessary tables** for your database. Just like Liquibase and Flyway, it ships with [a database migration manager](/en/documentation/pro/database-migrations/) that manages the schema for you.

If you don't want to give JobRunr's `DataSource` DDL rights, you can create the tables yourself using one of the methods below.

### Run the `DatabaseCreator`

The `DatabaseCreator` class creates the necessary tables from a terminal. Provide a user that has DDL rights:

<div class="terminal">

```
java -cp jobrunr-{{< param "JobRunrVersion" >}}.jar org.jobrunr.storage.sql.common.DatabaseCreator {jdbcUrl} {userName} {password}
```
</div>

If the command succeeds, a confirmation message is shown.

> [!PRO] Pro tip
> With JobRunr Pro you don't have to do this by hand. You can hand JobRunr a separate user that is only used during database setup and migrations. JobRunr keeps creating and updating the tables for you, while the user your application runs with never needs DDL rights. See [Database migrations]({{< ref "documentation/pro/database-migrations#setup-a-custom-user-only-for-the-database-migrations" >}}).

### Generate the SQL scripts yourself

To generate the SQL scripts for your database so you can apply them manually (the files are generated in the current directory):

<div class="terminal">

```
java -cp jobrunr-{{< param "JobRunrVersion" >}}.jar org.jobrunr.storage.sql.common.DatabaseSqlMigrationFileProvider {databaseType} ({tablePrefix})
```
</div>

Where `databaseType` is the migration type listed on each database's page (e.g. `postgres`, `mysql`, `oracle`).

Then configure JobRunr to skip table creation, so it uses the tables you created instead of trying to create them again:

{{< codetabs category="framework" >}}
{{< codetab label="Fluent API" >}}
```java
JobRunr.configure()
    .useStorageProvider(SqlStorageProviderFactory.using(dataSource, null, DatabaseOptions.SKIP_CREATE))
    // ...
    .initialize();
```
{{< /codetab >}}

{{< codetab label="Micronaut" >}}
```yaml
jobrunr:
  database:
    skip-create: true
```
{{< /codetab >}}

{{< codetab label="Quarkus" >}}
```properties
quarkus.jobrunr.database.skip-create=true
```
{{< /codetab >}}

{{< codetab label="Spring" >}}
```properties
jobrunr.database.skip-create=true
```
{{< /codetab >}}
{{< /codetabs >}}

> [!PRO] Pro warning
> In JobRunr Pro, `DatabaseOptions` is a class that exposes additional configuration options (e.g., the database migration credentials).

> [!PRO] Pro tip
> JobRunr Pro can export the same scripts in [Flyway or Liquibase]({{< ref "documentation/pro/database-migrations#generate-flyway-or-liquibase-migrations" >}}) format, so you can add them to the migrations you already manage.

### Table prefix and schema

JobRunr supports a table prefix that is prepended to all table names. This is handy if you want to place the tables in a specific schema. Note that the delimiter between the schema and table must be added manually:

```
jobrunr.database.tablePrefix=MY_SCHEMA.
```

## Setting up a NoSQL database

For the supported NoSQL databases, JobRunr creates a database called `jobrunr` and all the necessary collections automatically. See the [MongoDB]({{< ref "documentation/storage/mongodb" >}}) and [Amazon DocumentDB]({{< ref "documentation/storage/amazon-documentdb" >}}) pages for the client dependency and configuration.

To keep JobRunr's collections in the database your application already uses, set `database.database-name`. The table prefix works here too and is prepended to every collection name:

{{< codetabs category="framework" >}}
{{< codetab label="Micronaut" >}}
```yaml
jobrunr:
  database:
    database-name: my-application
    table-prefix: jobrunr_
```
{{< /codetab >}}

{{< codetab label="Quarkus" >}}
```properties
quarkus.jobrunr.database.database-name=my-application
quarkus.jobrunr.database.table-prefix=jobrunr_
```
{{< /codetab >}}

{{< codetab label="Spring" >}}
```properties
jobrunr.database.database-name=my-application
jobrunr.database.table-prefix=jobrunr_
```
{{< /codetab >}}
{{< /codetabs >}}

## What JobRunr creates in your database

JobRunr manages these objects itself through its migration manager - you never write to them directly, and their columns and fields are an implementation detail that may change between releases.

In an **SQL database**:

| Table | Contains |
| --- | --- |
| `jobrunr_jobs` | Every job, its current state, and its serialized JSON payload |
| `jobrunr_recurring_jobs` | The definitions of your recurring jobs |
| `jobrunr_backgroundjobservers` | The background job servers in your cluster and their heartbeats |
| `jobrunr_metadata` | Internal metadata such as cluster-wide settings and job statistics |
| `jobrunr_migrations` | Which schema migrations have already been applied |
| `jobrunr_jobs_stats` | A view (not a table) that aggregates the job counts shown in the dashboard |

In a **NoSQL database**, the same objects exist as collections in the `jobrunr` database: `jobs`, `recurring_jobs`, `background_job_servers`, `metadata` and `migrations`.

If you configured a [table prefix]({{< ref "#table-prefix-and-schema" >}}), it is prepended to all of these names. To see the exact DDL for your database, [generate the SQL scripts]({{< ref "#generate-the-sql-scripts-yourself" >}}) - you can then adapt them to your needs. If you apply them yourself and keep tracking migrations in your own tool, you can drop the script that creates `jobrunr_migrations`: JobRunr only requires `jobrunr_jobs`, `jobrunr_recurring_jobs`, `jobrunr_backgroundjobservers` and `jobrunr_metadata` to be present when it starts with table creation skipped.

## Multiple databases in one application

The framework integrations detect your database automatically - an SQL `DataSource` bean, or a NoSQL client bean such as `MongoClient`. When your application has more than one candidate, you have to tell JobRunr which one to use.

### Choosing the database type

JobRunr picks its storage from the beans it finds - a `DataSource` selects the SQL provider, a `MongoClient` the MongoDB one - so most applications never set this. Use `database.type` when that choice isn't the one you want:

{{< codetabs category="framework" >}}
{{< codetab label="Micronaut" >}}
```yaml
jobrunr:
  database:
    type: sql
```
{{< /codetab >}}

{{< codetab label="Quarkus" >}}
```properties
quarkus.jobrunr.database.type=sql
```
{{< /codetab >}}

{{< codetab label="Spring" >}}
```properties
jobrunr.database.type=sql
```
{{< /codetab >}}
{{< /codetabs >}}

| Value | Storage | When it is selected |
| --- | --- | --- |
| `sql` | Any [SQL database]({{< ref "documentation/storage#sql-databases" >}}) | Automatically, as soon as a `DataSource` bean is available |
| `mongodb` | [MongoDB]({{< ref "documentation/storage/mongodb" >}}) | Automatically, as soon as a `MongoClient` bean is available |
| `documentdb` | [Amazon DocumentDB]({{< ref "documentation/storage/amazon-documentdb" >}}) (Spring Boot and Quarkus only) | Only when set explicitly - a `MongoClient` on its own gives you the MongoDB provider |
| `mem` | [In-memory]({{< ref "documentation/storage/in-memory" >}}) | Only when set explicitly |

So there are two reasons to set it: your application has **more than one** candidate bean, or you want DocumentDB or the in-memory provider, which are never picked implicitly.

With the Fluent API there is nothing to disambiguate: you pass the `StorageProvider` you want yourself.

### Using a dedicated datasource

Use `database.datasource` when you have several `DataSource`s of the same kind - for example one for your domain data and a separate one for JobRunr. The value is the **name of the datasource bean**, not a JDBC URL, and the setting only exists in the framework integrations.

{{< codetabs category="framework" >}}
{{< codetab label="Micronaut" >}}
```yaml
jobrunr:
  database:
    datasource: jobRunrDataSource
```
{{< /codetab >}}

{{< codetab label="Quarkus" >}}
```properties
quarkus.jobrunr.database.datasource=jobRunrDataSource
```
{{< /codetab >}}

{{< codetab label="Spring" >}}
```properties
# the name of the DataSource bean JobRunr should use
jobrunr.database.datasource=jobRunrDataSource
```
{{< /codetab >}}
{{< /codetabs >}}

Without this setting, JobRunr uses the default (unnamed) `DataSource` bean.

## Configure the StorageProvider yourself

You can always build the `StorageProvider` yourself instead of letting JobRunr configure it - useful when you want a specific table prefix, explicit `DatabaseOptions`, or a provider that is not picked up automatically.

There are two ways to create one for an SQL database. `SqlStorageProviderFactory` inspects the JDBC connection and returns the matching implementation:

```java
StorageProvider storageProvider = SqlStorageProviderFactory.using(dataSource);
```

Or instantiate the provider directly - each database page names its class (`PostgresStorageProvider`, `MySqlStorageProvider`, `MongoDBStorageProvider`, ...). All SQL providers accept a `DataSource` and optionally a table prefix and `DatabaseOptions`. Other constructors are available too, please check the Javadoc of the `StorageProvider` implementation you're interested in.

The framework integrations step aside as soon as you define a `StorageProvider` bean yourself:

{{< codetabs category="framework" >}}
{{< codetab label="Fluent API" >}}
```java
JobRunr.configure()
    .useStorageProvider(new PostgresStorageProvider(dataSource))
    .useBackgroundJobServer()
    .initialize();
```
{{< /codetab >}}

{{< codetab label="Micronaut" >}}
```java
@Factory
public class JobRunrStorageProviderFactory {

    @Singleton
    @Replaces(bean = StorageProvider.class, factory = JobRunrSqlStorageProviderFactory.class)
    public StorageProvider storageProvider(DataSource dataSource, JobMapper jobMapper) {
        // JobRunr needs the pooled DataSource, not Micronaut Data's transaction-bound proxy
        DataSource target = DelegatingDataSource.unwrapDataSource(dataSource);
        PostgresStorageProvider storageProvider = new PostgresStorageProvider(target);
        storageProvider.setJobMapper(jobMapper);
        return storageProvider;
    }
}
```
{{< /codetab >}}

{{< codetab label="Quarkus" >}}
```java
@ApplicationScoped
public class JobRunrStorageProviderProducer {

    @Produces
    @Singleton
    public StorageProvider storageProvider(DataSource dataSource, JobMapper jobMapper) {
        PostgresStorageProvider storageProvider = new PostgresStorageProvider(dataSource);
        storageProvider.setJobMapper(jobMapper);
        return storageProvider;
    }
}
```
{{< /codetab >}}

{{< codetab label="Spring" >}}
```java
@Bean(destroyMethod = "close")
@DependsOnDatabaseInitialization // so JobRunr creates its tables after Flyway or Liquibase have run
public StorageProvider storageProvider(DataSource dataSource, JobMapper jobMapper) {
    PostgresStorageProvider storageProvider = new PostgresStorageProvider(dataSource);
    storageProvider.setJobMapper(jobMapper);
    return storageProvider;
}
```
{{< /codetab >}}
{{< /codetabs >}}

> [!WARNING]
> Always call `setJobMapper(jobMapper)` when you create the `StorageProvider` in a framework - the auto-configuration normally does this for you, and without it JobRunr throws a `NullPointerException` as soon as it serializes a job. The `JobMapper` bean is provided by the starter, so you can simply inject it.

In Micronaut, JobRunr's own factory is `@Primary`, so `@Replaces` is needed to override it whenever a `DataSource` or `MongoClient` bean is present. In Spring Boot and Quarkus, your bean wins automatically.

The Micronaut example unwraps the `DataSource` for a reason. When Micronaut Data is on the classpath it wraps *every* `DataSource` bean in a proxy whose `getConnection()` hands back the connection bound to the current transaction - and throws `NoConnectionException` when there is none. A `BackgroundJobServer` polls for work, claims jobs and writes state transitions on its own threads, outside any transaction, so it needs the real pooled `DataSource`. If you want job scheduling to join your `@Transactional` methods, that is what the JobRunr Pro [transaction plugin]({{< ref "documentation/pro/transactions" >}}) is for.
