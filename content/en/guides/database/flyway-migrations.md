---
title: Update your database using Flyway
description: This guide walks you through exporting the JobRunr Pro database migrations, allowing you to seamlessly integrate them into your Flyway migrations. By following these steps, you'll be able to execute the migrations through Flyway effortlessly.
weight: 5
tags:
    - JobRunr Pro
    - Flyway
---
[Flyway](https://flywaydb.org/) is a database migration tool that simplifies the process of managing and applying database changes across different environments. This guide will walk you through migrating your JobRunr database using Flyway.

## Prerequisites
- JobRunr Pro 7.0.0 or later
- You already know how to configure JobRunr

## Steps to Migrate JobRunr Database with Flyway
### 1. Export JobRunr Pro Database Migrations
First, export the JobRunr Pro database migrations. This step ensures that you have the necessary SQL scripts to apply the required changes to your database.

To do so, you can use the command:

```
java -cp jobrunr-{{< param "JobRunrVersion" >}}.jar;slf4j-api.jar org.jobrunr.storage.sql.common.DatabaseSqlMigrationFileProvider {databaseType} -DdatabaseManager=flyway (-DtablePrefix=...) (-Doutput=...)
  where:
    - databaseType is one of 'db2', 'h2', 'mariadb', 'mysql', 'oracle', 'postgres', 'sqlite', 'sqlserver'
    - databaseManager is flyway
    - tablePrefix can be a custom prefix you want to give to all JobRunr related tables 
    - output is the directory where to create the requested files (defaults to current directory)
```


### 2. Organize Migrations
Organize the exported database migrations into the Flyway migration directory structure. Flyway follows a specific directory structure where migrations are stored and executed in a specific order. Place the exported JobRunr Pro database migrations into the appropriate Flyway migration directory.

### 3. Configure Flyway
Configure Flyway to connect to your JobRunr database. Ensure that Flyway is configured with the correct database connection parameters, such as URL, username, password, and driver.

### 4. Run Flyway Migration
Once Flyway is configured, run the migration using the Flyway command-line interface or API. Flyway will automatically apply the JobRunr Pro database migrations to your database in the specified order.

### 5. Verify Migration
After the migration process is complete, verify that the JobRunr database has been successfully migrated. Check the database schema and data to ensure that the migration was applied correctly.

## Conclusion
Migrating the JobRunr database using Flyway is a straightforward process that streamlines the management of database changes. By following these steps, you can ensure that your JobRunr database remains up-to-date and consistent across different environments.