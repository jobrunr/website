---
title: "SQL Server"
description: "Use Microsoft SQL Server as the JobRunr StorageProvider - driver dependency, configuration, and table creation."
date: 2026-07-31
layout: "documentation"
menu:
  sidebar:
    parent: storage
    weight: 50
---

JobRunr stores all background jobs in Microsoft SQL Server through the `SQLServerStorageProvider`. JobRunr is tested against the latest `mcr.microsoft.com/azure-sql-edge` container (a drop-in replacement for `mcr.microsoft.com/mssql/server`).

## Add the driver dependency

Add the Microsoft SQL Server JDBC driver to your project. The latest version is on [Maven Central](https://central.sonatype.com/artifact/com.microsoft.sqlserver/mssql-jdbc).

{{< codetabs category="dependency" >}}
{{< codetab label="Maven" >}}
```xml
<dependency>
  <groupId>com.microsoft.sqlserver</groupId>
  <artifactId>mssql-jdbc</artifactId>
  <version><!-- latest version --></version>
</dependency>
```
{{< /codetab >}}
{{< codetab label="Gradle" >}}
```groovy
implementation 'com.microsoft.sqlserver:mssql-jdbc' // version omitted, use latest
```
{{< /codetab >}}
{{< /codetabs >}}

## Configuration

If you use a framework starter, JobRunr automatically detects your existing `DataSource` - configure your database the usual way and you are done.

{{< codetabs category="framework" >}}
{{< codetab label="Fluent API" >}}
```java
HikariConfig config = new HikariConfig();
config.setJdbcUrl("jdbc:sqlserver://localhost:1433;databaseName=mydb");
config.setUsername("myuser");
config.setPassword("mypassword");
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
    url: jdbc:sqlserver://localhost:1433;databaseName=mydb
    username: myuser
    password: mypassword
    driver-class-name: com.microsoft.sqlserver.jdbc.SQLServerDriver
```
{{< /codetab >}}

{{< codetab label="Quarkus" >}}
```properties
quarkus.datasource.db-kind=mssql
quarkus.datasource.jdbc.url=jdbc:sqlserver://localhost:1433;databaseName=mydb
quarkus.datasource.username=myuser
quarkus.datasource.password=mypassword
```
{{< /codetab >}}

{{< codetab label="Spring" >}}
```properties
spring.datasource.url=jdbc:sqlserver://localhost:1433;databaseName=mydb
spring.datasource.username=myuser
spring.datasource.password=mypassword
```
{{< /codetab >}}
{{< /codetabs >}}

## Creating the tables

By default JobRunr creates its tables automatically. If you want to create them yourself, use the `DatabaseCreator` or generate the SQL scripts with migration type `sqlserver`. See [Setting up an SQL database]({{< ref "documentation/storage#setting-up-an-sql-database" >}}).

## Next steps

- **Keep the tables in their own schema:** JobRunr can prefix every table it creates. See [table prefix and schema]({{< ref "documentation/storage#table-prefix-and-schema" >}}).
- **Using more than one database?** Tell JobRunr which one it should use. See [multiple databases in one application]({{< ref "documentation/storage#multiple-databases-in-one-application" >}}).
- **Build the `StorageProvider` yourself:** Useful for an explicit table prefix, `DatabaseOptions`, or a provider JobRunr does not pick up automatically. See [configuring the StorageProvider yourself]({{< ref "documentation/storage#configure-the-storageprovider-yourself" >}}).

Looking for another database? Back to the [Storage overview]({{< ref "documentation/storage" >}}).
