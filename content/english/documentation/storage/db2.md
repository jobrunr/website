---
title: "IBM Db2"
description: "Use IBM Db2 as the JobRunr StorageProvider - driver dependency, configuration, and table creation."
date: 2026-07-31
layout: "documentation"
menu:
  sidebar:
    parent: storage
    weight: 60
---

JobRunr stores all background jobs in IBM Db2 through the `DB2StorageProvider`. JobRunr is tested against Db2 container version 12.1.0.0.

## Add the driver dependency

Add the IBM Db2 JDBC driver (JCC) to your project. The latest version is on [Maven Central](https://central.sonatype.com/artifact/com.ibm.db2/jcc).

{{< codetabs category="dependency" >}}
{{< codetab label="Maven" >}}
```xml
<dependency>
  <groupId>com.ibm.db2</groupId>
  <artifactId>jcc</artifactId>
  <version><!-- latest version --></version>
</dependency>
```
{{< /codetab >}}
{{< codetab label="Gradle" >}}
```groovy
implementation 'com.ibm.db2:jcc' // version omitted, use latest
```
{{< /codetab >}}
{{< /codetabs >}}

## Configuration

If you use a framework starter, JobRunr automatically detects your existing `DataSource` - configure your database the usual way and you are done.

{{< codetabs category="framework" >}}
{{< codetab label="Fluent API" >}}
```java
HikariConfig config = new HikariConfig();
config.setJdbcUrl("jdbc:db2://localhost:50000/mydb");
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
    url: jdbc:db2://localhost:50000/mydb
    username: myuser
    password: mypassword
    driver-class-name: com.ibm.db2.jcc.DB2Driver
```
{{< /codetab >}}

{{< codetab label="Quarkus" >}}
```properties
quarkus.datasource.db-kind=db2
quarkus.datasource.jdbc.url=jdbc:db2://localhost:50000/mydb
quarkus.datasource.username=myuser
quarkus.datasource.password=mypassword
```
{{< /codetab >}}

{{< codetab label="Spring" >}}
```properties
spring.datasource.url=jdbc:db2://localhost:50000/mydb
spring.datasource.username=myuser
spring.datasource.password=mypassword
```
{{< /codetab >}}
{{< /codetabs >}}

## Creating the tables

By default JobRunr creates its tables automatically. If you want to create them yourself, use the `DatabaseCreator` or generate the SQL scripts with migration type `db2`. See [Setting up an SQL database]({{< ref "documentation/storage#setting-up-an-sql-database" >}}).

## Next steps

- **Keep the tables in their own schema:** JobRunr can prefix every table it creates. See [table prefix and schema]({{< ref "documentation/storage#table-prefix-and-schema" >}}).
- **Using more than one database?** Tell JobRunr which one it should use. See [multiple databases in one application]({{< ref "documentation/storage#multiple-databases-in-one-application" >}}).
- **Build the `StorageProvider` yourself:** Useful for an explicit table prefix, `DatabaseOptions`, or a provider JobRunr does not pick up automatically. See [configuring the StorageProvider yourself]({{< ref "documentation/storage#configure-the-storageprovider-yourself" >}}).

Looking for another database? Back to the [Storage overview]({{< ref "documentation/storage" >}}).
