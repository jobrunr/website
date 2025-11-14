---
version: "pro"
title: "Transaction plugin"
subtitle: "Enjoy support for @Transactional out of the box in your preferred development framework"
keywords: ["Transactional", "database transaction", "transaction it", "transaction in a database", "transaction sql"]
date: 2020-08-27T11:12:23+02:00
layout: "documentation"
menu: 
  sidebar:
    identifier: transactions
    parent: 'jobrunr-pro'
    weight: 2
---
{{< trial-button >}}

The JobRunr [Spring Boot Starter]({{<ref "/documentation/configuration/spring/_index.md">}}), [Micronaut integration]({{<ref "/documentation/configuration/micronaut/_index.md">}}) (*), [Quarkus extension]({{<ref "/documentation/configuration/quarkus/_index.md">}}) come with an `@Transactional` plugin that makes sure your jobs join the transaction created by the framework. You can also benefit from this plugin when using Kotlin with [Exposed ORM](https://github.com/JetBrains/Exposed).

> (*) See important remarks at the end of this page.

<figure>

```java
@Inject
private UserRepository userRepositoy;
@Inject
private JobScheduler jobScheduler;

@Transactional
public void createUserAndSendWelcomeEmail(User user) {
    userRepositoy.save(user);
    jobScheduler.<UserService>enqueue(x -> x.sendWelcomeEmail(user.id));
}

```
<figcaption>

Thanks to the @Transactional support, the whole method - including the job scheduling - is transactional.

</figcaption>
</figure>

> Also works with Exposed's transaction block!

#### How does it work?
- the JobRunr Spring Boot Starter and Micronaut Integration, Quarkus Extension, Exposed Plugin check whether they can participate in a transaction created by that framework.  
- if one is present, it is used and the whole method is transactional.
- if not, JobRunr creates its own transaction to make sure the job is saved to the database. 

> This of course only works for the SQL `StorageProvider`s.

### Configuration
In most cases, you have nothing to do. JobRunr Pro is able to join any ongoing transaction started by your preferred framework.

The one exception is when you want to use Exposed. But you'll be up and running just by applying the following steps:

1. Add `jobrunr-pro-kotlin-XX-support` as a dependency (replace `XX` by a Kotlin version supported by JobRunr, e.g, `jobrunr-pro-kotlin-2.0-support`).
> Note: JobRunr officially only supports the last two versions of Kotlin. Make sure to regularly check that your version is still supported.
2. Configure the connection provider, depending on your situation:
    1. You're using a JobRunr Pro Spring Starter (e.g, `jobrunr-pro-spring-boot-3-starter`): make sure Exposed is on your classpath. JobRunr Pro automatically configures the plugin for you as long as Exposed is on your classpath.
    2. You're using JobRunr Pro without Spring Boot or you prefer to use the fluent API: you need to provide a `ExposedTransactionAwareConnectionProvider` to the `StorageProvider`. See below, for how to achieve this.

#### Programmatically configure a Transaction Plugin

If you're using one of the supported frameworks (Spring, Micronaut or Quarkus), then you may provide a `ConnectionProvider` bean that will be picked up automatically by JobRunr.

<figure>

```java
@Bean(name = "connectionProvider")
public ConnectionProvider getExposedTransactionAwareConnectionProvider() {
    return new ExposedTransactionAwareConnectionProvider();
}
```
<figcaption>

This example shows how to provide `ExposedTransactionAwareConnectionProvider` as a `Bean` when using the Spring framework.

</figcaption>
</figure>

If you're using the Fluent API, you can configure a `ConnectionProvider` as follows:

<figure>

```java
JobRunrPro.configure()
  // ...
  .useStorageProvider(SqlStorageProviderFactory.using(
    dataSource, 
    null,
    new ExposedTransactionAwareConnectionProvider(),
    new DatabaseOptions(false)
  ))
  // ...
  .initialize();
```
<figcaption>

This example shows how to provide `ExposedTransactionAwareConnectionProvider` to the `StorageProvider` when using the fluent API.

</figcaption>
</figure>

> Similarly you can provide a `ConnectionProvider` for Micronaut, Quarkus and Spring. JobRunr Pro comes with the following transaction aware connections: `ExposedTransactionAwareConnectionProvider`, `MicronautTransactionAwareConnectionProvider`, `QuarkusTransactionAwareConnectionProvider`, and `SpringTransactionAwareConnectionProvider`.


## Important remarks

- The Micronaut Transaction Plugin only supports `micronaut-data-jdbc`. If you're using `micronaut-hibernate-jpa` and needs transaction support, please let us know!

{{< trial-button >}}