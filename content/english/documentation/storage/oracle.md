---
title: "Oracle"
description: "Use Oracle Database as the JobRunr StorageProvider - driver dependency, configuration, and table creation."
date: 2026-07-31
layout: "documentation"
menu:
  sidebar:
    parent: storage
    weight: 40
---

JobRunr stores all background jobs in Oracle Database through the `OracleStorageProvider`. JobRunr is tested against the latest `gvenzl/oracle-free` container.

## Add the driver dependency

Add the Oracle JDBC driver to your project. Pick the `ojdbc` artifact that matches your JDK; the latest versions are on [Maven Central](https://central.sonatype.com/artifact/com.oracle.database.jdbc/ojdbc11).

{{< codetabs category="dependency" >}}
{{< codetab label="Maven" >}}
```xml
<dependency>
  <groupId>com.oracle.database.jdbc</groupId>
  <artifactId>ojdbc11</artifactId>
  <version><!-- latest version --></version>
</dependency>
```
{{< /codetab >}}
{{< codetab label="Gradle" >}}
```groovy
implementation 'com.oracle.database.jdbc:ojdbc11' // version omitted, use latest
```
{{< /codetab >}}
{{< /codetabs >}}

## Configuration

If you use a framework starter, JobRunr automatically detects your existing `DataSource` - configure your database the usual way and you are done.

{{< codetabs category="framework" >}}
{{< codetab label="Fluent API" >}}
```java
HikariConfig config = new HikariConfig();
config.setJdbcUrl("jdbc:oracle:thin:@localhost:1521/XEPDB1");
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
    url: jdbc:oracle:thin:@localhost:1521/XEPDB1
    username: myuser
    password: mypassword
    driver-class-name: oracle.jdbc.OracleDriver
```
{{< /codetab >}}

{{< codetab label="Quarkus" >}}
```properties
quarkus.datasource.db-kind=oracle
quarkus.datasource.jdbc.url=jdbc:oracle:thin:@localhost:1521/XEPDB1
quarkus.datasource.username=myuser
quarkus.datasource.password=mypassword
```
{{< /codetab >}}

{{< codetab label="Spring" >}}
```properties
spring.datasource.url=jdbc:oracle:thin:@localhost:1521/XEPDB1
spring.datasource.username=myuser
spring.datasource.password=mypassword
```
{{< /codetab >}}
{{< /codetabs >}}

## Creating the tables

By default JobRunr creates its tables automatically. If you want to create them yourself, use the `DatabaseCreator` or generate the SQL scripts with migration type `oracle`. See [Setting up an SQL database]({{< ref "documentation/storage#setting-up-an-sql-database" >}}).

## Next steps

- **Keep the tables in their own schema:** JobRunr can prefix every table it creates. See [table prefix and schema]({{< ref "documentation/storage#table-prefix-and-schema" >}}).
- **Using more than one database?** Tell JobRunr which one it should use. See [multiple databases in one application]({{< ref "documentation/storage#multiple-databases-in-one-application" >}}).
- **Build the `StorageProvider` yourself:** Useful for an explicit table prefix, `DatabaseOptions`, or a provider JobRunr does not pick up automatically. See [configuring the StorageProvider yourself]({{< ref "documentation/storage#configure-the-storageprovider-yourself" >}}).

Looking for another database? Back to the [Storage overview]({{< ref "documentation/storage" >}}).
