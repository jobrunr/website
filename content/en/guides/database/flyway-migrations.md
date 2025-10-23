---
title: Update your database using Flyway
description: This guide walks you through exporting the JobRunr Pro database migrations, allowing you to seamlessly integrate them into your Flyway migrations. By following these steps, you'll be able to execute the migrations through Flyway effortlessly.
weight: 5
tags:
    - JobRunr Pro
    - Database migration
    - Flyway
hideFrameworkSelector: true
---

[Flyway](https://flywaydb.org/) is a database migration tool that simplifies the process of managing and applying database changes across different environments. This guide will walk you through migrating your JobRunr Pro database using Flyway. If you're looking for other guides on database configuration and migration, please browse the [database guides](/guides/database/).

## Prerequisites

- JobRunr Pro 8.0.0 or later
- You are familiar with Flyway
- You already know how to configure JobRunr

## Steps to Migrate JobRunr Database with Flyway

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

Okay, now JobRunr stopped migrating for us. The next steps are exporting the migrations into a Flyway-compatible format and telling Flyway to take over.


### 2. Export JobRunr Pro Database Migrations

Exporting the JobRunr Pro database migrations ensures that you have the necessary SQL scripts to apply the required changes to your database.

To do so, you can use the `DatabaseSqlMigrationFileProvider` command, as explained in [our database migrations documentation](/en/documentation/pro/database-migrations/):

```
java -cp jobrunr-pro-{{< param "JobRunrVersion" >}}.jar org.jobrunr.storage.sql.common.DatabaseSqlMigrationFileProvider {databaseType} -DdatabaseManager=flyway (-DtablePrefix=...) (-Doutput=...)
  where:
    - databaseType is one of 'cockroach', 'db2', 'h2', 'mariadb', 'mysql', 'oracle', 'postgres', 'sqlite', 'sqlserver'
    - databaseManager is flyway
    - tablePrefix can be a custom prefix you want to give to all JobRunr related tables 
    - output is the directory where to create the requested files (defaults to current directory)
```

For example; suppose your database is a Postgres one and you're using the latest version of JobRunr Pro:

```
java -cp jobrunr-pro-8.1.0.jar org.jobrunr.storage.sql.common.DatabaseSqlMigrationFileProvider -DdatabaseManager=flyway
```

For Flyway, this will generate the `.sql` migration files in the current directory. Flyway enforces a naming convention for versioned migrations: `{prefix}{version}{separator}{description}{suffix}`. JobRunr follows that convention: e.g. a file might be called `V004__alter_job_table_add_rate_limiter.sql` where `{prefix}` is `V` (the default), `{version}` is `004`, `{separator}` is `__` (the default), `{description}` is `alter_job_table_add_rate_limiter` and `{suffix}` is `.sql`. See the [Flyway documentation on versioned migrations](https://documentation.red-gate.com/fd/versioned-migrations-273973333.html) for more information. Flyway uses this to track which scripts already have been applied, which are pending, and in which order they need to be executed.

Next, we need to move the files to a directory that Flyway scans.

### 3. Organize Migrations

Most Java-based projects keep their migration scripts in `src/main/resources/db/migration` but this is configurable. JobRunr Pro generates scripts from version `V000` and upwards: if you already have a script with that version you will have to change these accordingly.

Ensure that Flyway knows where to look for migration files by correctly setting the [Flyway Locations Setting](https://documentation.red-gate.com/flyway/reference/configuration/flyway-namespace/flyway-locations-setting) property with key `flyway.locations`. Speaking of configuration... 

### 4. Configure Flyway

Flyway not only needs a location, but also credentials to be able to connect to your JobRunr database. Ensure that Flyway is configured with the correct database connection parameters, such as URL, username, password, and driver. These settings can be configured in either configurable properties (e.g. Maven properties), as system properties (`-Dflyway.user`) or in a separate `flyway.conf` file:

```
flyway.user=databaseUser
flyway.password=databasePassword
flyway.locations=classpath:db/migration
````

For more information on how to configure Flyway such as the correct usage of the above `classpath:` prefix (that points to `src/main/resources`), please see the [official documentation](https://documentation.red-gate.com/flyway/reference/configuration/flyway-namespace/flyway-locations-setting).

### 5. Run Flyway Migration

Once Flyway is configured, run the migration using the Flyway command-line interface or API. Flyway will automatically apply the JobRunr Pro database migrations to your database in the specified order. Execute the `migrate` command via command line, Maven, or Gradle:

```sh
# command line
flyway migrate
# Maven
mvn flyway:migrate
# Gradle
gradle flywayMigrate
```

For more information on the possible parameters, please see [the Flyway documentation](https://documentation.red-gate.com/fd/migrate-277578887.html).

### 6. Verify Migration

After the migration process is complete, verify that the JobRunr database has been successfully migrated. Check the database schema and data to ensure that the migration was applied correctly. You should be able to locate the JobRunr tables `jobrunr_jobs`, `jobrunr_recurring_jobs`, `jobrunr_backgroundjobservers`, and `jobrunr_metadata`. Additionally, you can issue a Flyway `validate` command to verify the applied migrations against the available ones. 

## Conclusion

Migrating the JobRunr database using Flyway is a straightforward process that streamlines the management of database changes. By following these steps, you can ensure that your JobRunr database remains up-to-date and consistent across different environments.
