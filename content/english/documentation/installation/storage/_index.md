---
title: "Storage"
subtitle: "JobRunr supports both SQL and NoSQL databases"
date: 2020-04-30T11:12:23+02:00
layout: "documentation"
menu: 
  sidebar: 
    identifier: storage
    parent: 'installation'
    weight: 5
---
JobRunr stores the job details for each job using a `StorageProvider` and supports all major SQL databases and NoSQL databases.

> __Important__: you will need to add the correct dependency (jdbc-driver) for each of the databases below.

## SQL databases
Setting up an SQL database is easy-peasy because you probably don't need to do a thing!

#### Sit back, relax and let JobRunr do the work for you!
By default, **JobRunr will automatically create the necessary tables** for your database. Just like Liquibase and Flyway, it comes with [a database migration manager](/en/documentation/pro/database-migrations/) that manages the database for you.

#### Setting up the database yourself
If however you do not want to give the JobRunr DataSource DDL rights, you can easily create the tables JobRunr uses yourself using one of the following methods:


###### Run the DatabaseCreator
The DatabaseCreator class allows you to create the necessary tables using a terminal. You must provide a user that has DDL rights.

<div class="terminal">

```
java -cp jobrunr-${jobrunr.version}.jar org.jobrunr.storage.sql.common.DatabaseCreator {jdbcUrl} {userName} {password}
```
</div>

If the command succeeds, a confirmation message will be shown.

###### Apply the SQL scripts yourself
To generate the sql scripts for your database so you can apply them yourself, use the following command (the files will be generated in the current directory): 

<div class="terminal">

```
java -cp jobrunr-${jobrunr.version}.jar org.jobrunr.storage.sql.common.DatabaseSqlMigrationFileProvider {databaseType} ({tablePrefix})
```
</div>

Where `databaseType` is one of the supported SQL database types (see below).

Once you created the tables, you can configure JobRunr as follows (when using `jobrunr-spring-boot-starter`, this is not necessary):

```java
JobRunr.configure()
    .useStorageProvider(new DefaultSqlStorageProvider(dataSource, DatabaseOptions.SKIP_CREATE))
    .useBackgroundJobServer()
    .initialize();
```

### TablePrefix
JobRunr also supports a table prefix which will prefix all tables with a custom prefix. This comes in handy if you want to specify a schema for your tables. Please notice the delimiter between your schema and table has to be added manually.

Example configuration for a Spring Boot Starter:

```
jobrunr.database.tablePrefix: MY_SCHEMA.
```

#### Supported SQL database types

- **MariaDB** and **MySQL**: Migration type `mariadb` and `mysql`.
  - Use the `MariaDbStorageProvider` or `MySqlStorageProvider`. Tested with MySQL version 8 and the latest MariaDB version.
    > **Note**: Make sure [your connection string]() is setup that it [UTC timestamps correctly](https://stackoverflow.com/questions/1646171/mysql-datetime-fields-and-daylight-savings-time-how-do-i-reference-the-extra).
- **DB2**: Migration type `db2`. Tested with container version 12.1.0.0.
  - Use the `DB2StorageProvider`.
- **H2**: Migration type `h2`. Tested with library version 2.3.232.
  - Use the `H2StorageProvider`.
- **Oracle**: Migration type `oracle`. Tested with the latest version of the `gvenzl/oracle-free` container.
  - Use the `OracleStorageProvider`.
- **PostgreSQL**: Migration type `postgres`. Tested with container version 15.
  - Use the `PostgresStorageProvider`.
- **SQLite**: Migration type `sqlite`. Tested with library version 3.47.2.0.
  - Use the `SqLiteStorageProvider`.
- Microsoft **SQL Server**: Migration type `sqlserver`. Tested with the latest version of the `mcr.microsoft.com/azure-sql-edge` container as a replacement for `mcr.microsoft.com/mssql/server`.
  - Use the `SQLServerStorageProvider`.
- **CockroachDB**: Migration type `cockroach`. requires version 25.1 and up due to migration script issues in 24.x and lower.
  - Use the `CockroachStorageProvider`.

For more information on database migration, see the [database migration docs page](/en/documentation/pro/database-migrations/).

## NoSQL databases

Next to classic SQL databases, JobRunr also supports the following document-based NoSQL databases.

### Supported NoSQL database types

- __Mongo__ - JobRunr will create a database called `jobrunr` and all the necessary collection to save all Jobs and Recurring Jobs automatically for you
  - Use the `MongoDBStorageProvider` - JobRunr supports all Mongo versions from Mongo 3.4 and up.
  > **Note**: if you're using a MongoDB cluster it is important that JobRunr reads from the `primary` node as otherwise you will encounter `ConcurrentModificationExceptions`. The reason for that is that MongoDB needs to replicate updates to the other nodes and JobRunr is often faster than that in which case it receives stale data.
- __Amazon DocumentDB__ - JobRunr will create a database called `jobrunr` and all the necessary collection to save all Jobs and Recurring Jobs automatically for you
  - Use the `AmazonDocumentDBStorageProvider`
  > **Note**: if you're using a Amazon Document DB cluster it is important that JobRunr reads from the `primary` node as otherwise you will encounter `ConcurrentModificationExceptions`. The reason for that is that MongoDB needs to replicate updates to the other nodes and JobRunr is often faster than that in which case it receives stale data.
- __InMemory__ - JobRunr comes with an InMemoryStorageProvider, which is ideal for testing and for lightweight tasks that are server-instance specific and where persistence is not important. Note that if you use the `InMemoryStorageProvider`, you can not scale horizontally as the storage is not shared.
  - Use the `InMemoryStorageProvider` for in-memory support

<script type="text/javascript">
  if (window.navigator.userAgent.indexOf("Win") != -1) {
    const nodeList = document.querySelectorAll("div.terminal");
    for (let i = 0; i < nodeList.length; i++) {
      nodeList[i].innerHTML = nodeList[i].innerHTML.replace(':', ';');
    }
  }
</script>