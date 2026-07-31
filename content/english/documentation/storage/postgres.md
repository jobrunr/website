---
title: "PostgreSQL"
description: "Use PostgreSQL as the JobRunr StorageProvider - driver dependency, configuration, and table creation."
date: 2026-07-31
layout: "documentation"
menu:
  sidebar:
    parent: storage
    weight: 10
---

JobRunr stores all background jobs in PostgreSQL through the `PostgresStorageProvider`. JobRunr is tested against it on every release (container version 15). PostgreSQL is a great default: in doubt, just use postgres.

## Add the driver dependency

Add the PostgreSQL JDBC driver to your project. The latest version is on [Maven Central](https://central.sonatype.com/artifact/org.postgresql/postgresql).

{{< codetabs category="dependency" >}}
{{< codetab label="Maven" >}}
```xml
<dependency>
  <groupId>org.postgresql</groupId>
  <artifactId>postgresql</artifactId>
  <version><!-- latest version --></version>
</dependency>
```
{{< /codetab >}}
{{< codetab label="Gradle" >}}
```groovy
implementation 'org.postgresql:postgresql' // version omitted, use latest
```
{{< /codetab >}}
{{< /codetabs >}}

## Configuration

If you use a framework starter, JobRunr automatically detects your existing `DataSource` - configure your database the usual way and you are done.

{{< codetabs category="framework" >}}
{{< codetab label="Fluent API" >}}
```java
HikariConfig config = new HikariConfig();
config.setJdbcUrl("jdbc:postgresql://localhost:5432/mydb");
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
    url: jdbc:postgresql://localhost:5432/mydb
    username: myuser
    password: mypassword
    driver-class-name: org.postgresql.Driver
```
{{< /codetab >}}

{{< codetab label="Quarkus" >}}
```properties
quarkus.datasource.db-kind=postgresql
quarkus.datasource.jdbc.url=jdbc:postgresql://localhost:5432/mydb
quarkus.datasource.username=myuser
quarkus.datasource.password=mypassword
```
{{< /codetab >}}

{{< codetab label="Spring" >}}
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/mydb
spring.datasource.username=myuser
spring.datasource.password=mypassword
```
{{< /codetab >}}
{{< /codetabs >}}

> [!NOTE]
> Does your application talk to more than one database, or to more than one `DataSource`? See [Multiple databases in one application]({{< ref "documentation/storage#multiple-databases-in-one-application" >}}) to tell JobRunr which one to use.

## Creating the tables

By default JobRunr creates its tables automatically. If you want to create them yourself, use the `DatabaseCreator` or generate the SQL scripts with migration type `postgres`. See [Setting up an SQL database]({{< ref "documentation/storage#setting-up-an-sql-database" >}}).

## Next steps

- **Keep the tables in their own schema:** JobRunr can prefix every table it creates. See [table prefix and schema]({{< ref "documentation/storage#table-prefix-and-schema" >}}).
- **Using more than one database?** Tell JobRunr which one it should use. See [multiple databases in one application]({{< ref "documentation/storage#multiple-databases-in-one-application" >}}).
- **Build the `StorageProvider` yourself:** Useful for an explicit table prefix, `DatabaseOptions`, or a provider JobRunr does not pick up automatically. See [configuring the StorageProvider yourself]({{< ref "documentation/storage#configure-the-storageprovider-yourself" >}}).

Looking for another database? Back to the [Storage overview]({{< ref "documentation/storage" >}}).
