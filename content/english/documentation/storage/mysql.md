---
title: "MySQL"
description: "Use MySQL as the JobRunr StorageProvider - driver dependency, configuration, and table creation."
date: 2026-07-31
layout: "documentation"
menu:
  sidebar:
    parent: storage
    weight: 30
---

JobRunr stores all background jobs in MySQL through the `MySqlStorageProvider`. JobRunr is tested against MySQL 8.

## Add the driver dependency

Add the MySQL JDBC driver (Connector/J) to your project. The latest version is on [Maven Central](https://central.sonatype.com/artifact/com.mysql/mysql-connector-j).

{{< codetabs category="dependency" >}}
{{< codetab label="Maven" >}}
```xml
<dependency>
  <groupId>com.mysql</groupId>
  <artifactId>mysql-connector-j</artifactId>
  <version><!-- latest version --></version>
</dependency>
```
{{< /codetab >}}
{{< codetab label="Gradle" >}}
```groovy
implementation 'com.mysql:mysql-connector-j' // version omitted, use latest
```
{{< /codetab >}}
{{< /codetabs >}}

## Configuration

If you use a framework starter, JobRunr automatically detects your existing `DataSource` - configure your database the usual way and you are done.

{{< codetabs category="framework" >}}
{{< codetab label="Fluent API" >}}
```java
HikariConfig config = new HikariConfig();
config.setJdbcUrl("jdbc:mysql://localhost:3306/mydb");
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
    url: jdbc:mysql://localhost:3306/mydb
    username: myuser
    password: mypassword
    driver-class-name: com.mysql.cj.jdbc.Driver
```
{{< /codetab >}}

{{< codetab label="Quarkus" >}}
```properties
quarkus.datasource.db-kind=mysql
quarkus.datasource.jdbc.url=jdbc:mysql://localhost:3306/mydb
quarkus.datasource.username=myuser
quarkus.datasource.password=mypassword
```
{{< /codetab >}}

{{< codetab label="Spring" >}}
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/mydb
spring.datasource.username=myuser
spring.datasource.password=mypassword
```
{{< /codetab >}}
{{< /codetabs >}}

## Creating the tables

By default JobRunr creates its tables automatically. If you want to create them yourself, use the `DatabaseCreator` or generate the SQL scripts with migration type `mysql`. See [Setting up an SQL database]({{< ref "documentation/storage#setting-up-an-sql-database" >}}).

## Next steps

- **Keep the tables in their own schema:** JobRunr can prefix every table it creates. See [table prefix and schema]({{< ref "documentation/storage#table-prefix-and-schema" >}}).
- **Using more than one database?** Tell JobRunr which one it should use. See [multiple databases in one application]({{< ref "documentation/storage#multiple-databases-in-one-application" >}}).
- **Build the `StorageProvider` yourself:** Useful for an explicit table prefix, `DatabaseOptions`, or a provider JobRunr does not pick up automatically. See [configuring the StorageProvider yourself]({{< ref "documentation/storage#configure-the-storageprovider-yourself" >}}).

Looking for another database? Back to the [Storage overview]({{< ref "documentation/storage" >}}).
