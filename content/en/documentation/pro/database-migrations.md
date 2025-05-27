---
version: "pro"
title: "Database Migrations"
subtitle: "Use Flyway or Liquibase to migrate your JobRunr related tables"
keywords: ["database migrations", "flyway", "liquibase", "ddl", "flyway migrations", "liquibase migrations", "sql server migration", "sql migration", "flyway database migration", "migrating data from one database to another", "sql database migration", "flyway data migration", "flyway liquibase", "data migrator", "database migration flyway", "database migration java", "java database migrations"]
date: 2021-06-24T11:12:23+02:00
layout: "documentation"
menu: 
  main: 
    identifier: database-migrations
    parent: 'jobrunr-pro'
    weight: 35
---
{{< trial-button >}}

JobRunr will by default perform all database related migrations automatically for you. This page gives more options in case you need/want more control over how database migrations are executed.

> [Unless otherwise configured](#take-full-control-over-database-migrations), JobRunr automatically handles creation/update of tables, indexes, views, etc.

## Setup a custom user only for the Database Migrations
In JobRunr Pro, you can setup a different user that will only be used during the database setup and migrations. As soon as the migrations are done, it will not be used anymore. This user can be configured in a property or in an environment variable.

To do so in Spring Boot, use the following `application.properties`:

```
org.jobrunr.database.skip-create=false
org.jobrunr.database.migration.username={ddl-user-name}
org.jobrunr.database.migration.password={ddl-user-password}
```

## Take full control over Database Migrations

If you are not allowed to have a user using DDL rights at runtime or if due to company policies, you cannot have JobRunr do the migrations for you, there are several options which we will discuss below. If you manually take control of your migrations, please note that new releases of JobRunr may introduce changes to the database schema. It is then up to you to make sure that all the necessary database changes are applied.

If you do your migrations [by hand](#apply-the-sql-scripts-yourself) or using a [3th party tool like Flyway or Liquibase](#generate-flyway-or-liquibase-migrations), you will need to tell JobRunr it should not perform the migrations for you. This can also be done via a property:

```
org.jobrunr.database.skip-create=true
```

Let's go over the different options to migrate your database:

### Generate Flyway or Liquibase migrations
Another option in JobRunr Pro, is to export the SQL Scripts in [Flyway](https://www.red-gate.com/products/flyway/community/) or [Liquibase](https://www.liquibase.com/) compatible format. You can then add these migrations to your existing managed sql scripts and do the JobRunr related database changes using your tool of choice.

To do so, use the `DatabaseSqlMigrationFileProvider`:

```
java -cp jobrunr-${jobrunr.version}.jar org.jobrunr.storage.sql.common.DatabaseSqlMigrationFileProvider {databaseType} (-DtablePrefix=...) (-DdatabaseManager=...) (-Doutput=...)
  where:
    - databaseType is one of 'cockroach', 'db2', 'h2', 'mariadb', 'mysql', 'oracle', 'postgres', 'sqlite', 'sqlserver'
    - databaseManager is one of 'none', 'liquibase', 'flyway' (defaults to none)
    - output is the directory where to create the requested files (defaults to current directory)
```

### Apply the SQL scripts yourself
You can always apply the scripts yourself by means of the `DatabaseSqlMigrationFileProvider`:

```
java -cp jobrunr-${jobrunr.version}.jar org.jobrunr.storage.sql.common.DatabaseSqlMigrationFileProvider {databaseType} ({tablePrefix})
```

This will generate all database related scripts and allows you to manually setup and update your database.

<br>

{{< trial-button >}}