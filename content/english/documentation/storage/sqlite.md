---
title: "SQLite"
description: "Use SQLite as the JobRunr StorageProvider - driver dependency, configuration, and table creation."
date: 2026-07-31
layout: "documentation"
menu:
  sidebar:
    parent: storage
    weight: 80
---

JobRunr stores all background jobs in SQLite through the `SqLiteStorageProvider`. JobRunr is tested against `sqlite-jdbc` version 3.47.2.0.

> [!NOTE]
> SQLite is an excellent embedded database - it ships with Android, iOS, macOS and most Linux distributions, which makes it a natural fit for mobile and desktop applications. It is serverless and file-based by design though, so there is no cluster mode: background job servers on different machines cannot share a SQLite database.

## Add the driver dependency

Add the SQLite JDBC driver to your project. The latest version is on [Maven Central](https://central.sonatype.com/artifact/org.xerial/sqlite-jdbc).

{{< codetabs category="dependency" >}}
{{< codetab label="Maven" >}}
```xml
<dependency>
  <groupId>org.xerial</groupId>
  <artifactId>sqlite-jdbc</artifactId>
  <version><!-- latest version --></version>
</dependency>
```
{{< /codetab >}}
{{< codetab label="Gradle" >}}
```groovy
implementation 'org.xerial:sqlite-jdbc' // version omitted, use latest
```
{{< /codetab >}}
{{< /codetabs >}}

## Configuration

If you use a framework starter, JobRunr automatically detects your existing `DataSource` - configure your database the usual way and you are done.

{{< codetabs category="framework" >}}
{{< codetab label="Fluent API" >}}
```java
HikariConfig config = new HikariConfig();
config.setJdbcUrl("jdbc:sqlite:./data/mydb.sqlite");
DataSource dataSource = new HikariDataSource(config);

JobRunr.configure()
    .useStorageProvider(SqlStorageProviderFactory.using(dataSource))
    .useBackgroundJobServer()
    .initialize();
```
{{< /codetab >}}

{{< codetab label="Micronaut" >}}
```yaml
datasources:
  default:
    url: jdbc:sqlite:./data/mydb.sqlite
    driver-class-name: org.sqlite.JDBC
```
{{< /codetab >}}

{{< codetab label="Quarkus" >}}
```properties
# requires the io.quarkiverse.jdbc:quarkus-jdbc-sqlite extension
quarkus.datasource.db-kind=sqlite
quarkus.datasource.jdbc.url=jdbc:sqlite:./data/mydb.sqlite
```
{{< /codetab >}}

{{< codetab label="Spring" >}}
```properties
spring.datasource.url=jdbc:sqlite:./data/mydb.sqlite
spring.datasource.driver-class-name=org.sqlite.JDBC
```
{{< /codetab >}}
{{< /codetabs >}}

## Creating the tables

By default JobRunr creates its tables automatically. If you want to create them yourself, use the `DatabaseCreator` or generate the SQL scripts with migration type `sqlite`. See [Setting up an SQL database]({{< ref "documentation/storage#setting-up-an-sql-database" >}}).

## Next steps

- **Keep the tables in their own schema:** JobRunr can prefix every table it creates. See [table prefix and schema]({{< ref "documentation/storage#table-prefix-and-schema" >}}).
- **Using more than one database?** Tell JobRunr which one it should use. See [multiple databases in one application]({{< ref "documentation/storage#multiple-databases-in-one-application" >}}).
- **Build the `StorageProvider` yourself:** Useful for an explicit table prefix, `DatabaseOptions`, or a provider JobRunr does not pick up automatically. See [configuring the StorageProvider yourself]({{< ref "documentation/storage#configure-the-storageprovider-yourself" >}}).

Looking for another database? Back to the [Storage overview]({{< ref "documentation/storage" >}}).
