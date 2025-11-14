---
title: Update your database using Liquibase
description: This guide walks you through exporting the JobRunr Pro database migrations, allowing you to seamlessly integrate them into your Liquibase migrations. By following these steps, you'll be able to execute the migrations through Liquibase effortlessly.
weight: 10
tags:
    - JobRunr Pro
    - Database migration
    - Liquibase
hideFrameworkSelector: true
---

[Liquibase](https://www.liquibase.org/) is a database migration tool that simplifies the process of managing and applying database changes across different environments. This guide will walk you through migrating your JobRunr Pro database using Liquibase. If you're looking for other guides on database configuration and migration, please browse the [database guides](/guides/database/).

## Prerequisites

- JobRunr Pro 8.0.0 or later
- You are familiar with Liquibase
- You already know how to configure JobRunr

## Steps to Migrate JobRunr Database with Liquibase

### 1. Skip automatic migrations

By default, JobRunr will automatically manage database related migrations by keeping track of them in a dedicated `jobrunr_migrations` table, not unlike automatic Hibernate/JPA migrations. However, sometimes more control is needed. It might not always be possible to use the default user to execute these statements. In that case, you can [set up a custom user just for the database migrations](/en/documentation/pro/database-migrations/#setup-a-custom-user-only-for-the-database-migrations). But sometimes it might not always be a good idea to automatically upgrade, or due to company policies DDL statements need to be passed through dedicated systems. 


In that case, you can tell JobRunr to skip the automatic migrations and take full control instead. To skip the migrations, set the property `jobrunr.database.skip-create=true` in your favourite framework, or inject a `DatabaseOptions` instance setting skip to `true` using the Fluent configuration API:

```java
JobRunrPro
  .configure()
  // ...
  . useStorageProvider(SqlStorageProviderFactory.using(dataSource, tablePrefix, new DatabaseOptions(true)))
  // ...
```

Okay, now JobRunr stopped migrating for us. The next steps are exporting the migrations into a Liquibase-compatible format and telling Liquibase to take over.


### 2. Export JobRunr Pro Database Migrations

Exporting the JobRunr Pro database migrations ensures that you have the necessary SQL scripts to apply the required changes to your database.

To do so, you can use the `DatabaseSqlMigrationFileProvider` command, as explained in [our database migrations documentation](/en/documentation/pro/database-migrations/):

```
java -cp jobrunr-pro-{{< param "JobRunrVersion" >}}.jar org.jobrunr.storage.sql.common.DatabaseSqlMigrationFileProvider {databaseType} -DdatabaseManager=liquibase (-DtablePrefix=...) (-Doutput=...)
  where:
    - databaseType is one of 'cockroach', 'db2', 'h2', 'mariadb', 'mysql', 'oracle', 'postgres', 'sqlite', 'sqlserver'
    - databaseManager is liquibase
    - tablePrefix can be a custom prefix you want to give to all JobRunr related tables 
    - output is the directory where to create the requested files (defaults to current directory)
```

For example; suppose your database is a Postgres one and you're using the latest version of JobRunr Pro:

```
java -cp jobrunr-pro-8.1.0.jar org.jobrunr.storage.sql.common.DatabaseSqlMigrationFileProvider -DdatabaseManager=liquibase
```

For liquibase, this will generate `.sql` files in the current directory along with a changelog XML file called `database-changelog.jobrunr.xml`. The changelog file is the master configuration file Liquibase reads to execute commands including the raw SQL files that were outputted. See the [What is a Changelog?](https://docs.liquibase.com/pro/user-guide-4-33/what-is-a-changelog) documentation from Liquibase for more information about the specific format.

Next, we need to move the files accordingly and tell Liquibase to use that changelog file---or merge with your own.

### 3. Organize the migrations

In order for Liquibase to recognize the JobRunr migrations, we need to organize the exported database migrations into the Liquibase migration directory structure. Liquibase follows a specific directory structure where migrations are stored and executed in a certain order. Place the exported JobRunr Pro database migrations into the appropriate Liquibase migration directory, usually in `/src/main/resources/db`.

You can set additional search patterns via `--search-path` if needed. Please see the [Liquibase documentation](https://docs.liquibase.com/pro/user-guide-4-33/how-does-liquibase-find-files) for more information on how Liquibase locates files. 

### 4. Configure Liquibase

Configure Liquibase to connect to your JobRunr database. Ensure that Liquibase is configured with the correct database connection parameters, such as URL, username, password, and driver.

Additionally, if you already have an existing Liquibase-enabled application and want to plug the JobRunr Pro migrations into it, you will have to alter your own changelog file to add the generated lines by the `DatabaseSqlMigrationFileProvider` class:

```xml
       <include file="V000__jobrunr_v6_sqlserver_baseline.sql" relativeToChangelogFile="true"/>
       <include file="V001__alter_job_table_add_dynamic_queue.sql" relativeToChangelogFile="true"/>
       <!-- ... -->
```

For instance, you might already have a YAML-style changelog "master" file that includes all your usual migrations, then you can add the above `<include/>` directives like so:

```yaml
databaseChangeLog:
  - include:
      file: /src/main/resources/db/changelog/V000__jobrunr_v6_sqlserver_baseline.sql
      # etc ...
```

JobRunr groups all changesets for the migration into one `databaseChangeLog`.

### 5. Run the Liquibase migration

Once Liquibase is configured, run the migration using the [Liquibase command-line interface](https://docs.liquibase.com/reference-guide/init-update-and-rollback-commands) or API. Liquibase will automatically apply the JobRunr Pro database migrations to your database in the specified order.

For example:

```
liquibase --url=jdbc:postgresql://127.0.0.1:5432/postgres --username=root update --changelog-file=database-changelog.jobrunr.xml
```

> ⚠️ Keep in mind that if you use your own changelog-file you will have to include the SQL files exported by JobRunr and keep that updated manually as new versions of JobRunr might come with new migration scripts.

### 6. Verify the migration

After the migration process is complete, verify that the JobRunr database has been successfully migrated. Check the database schema and data to ensure that the migration was applied correctly. You should be able to locate the JobRunr tables `jobrunr_jobs`, `jobrunr_recurring_jobs`, `jobrunr_backgroundjobservers`, and `jobrunr_metadata`. Additionally, you can issue specific Liquibase commands such as [status](https://docs.liquibase.com/reference-guide/database-inspection-change-tracking-and-utility-commands/status) to validate the migration. 

## Conclusion

Migrating the JobRunr database using Liquibase is a straightforward process that streamlines the management of database changes. By following the above steps, you can ensure that your JobRunr database remains up-to-date and consistent across different environments.

