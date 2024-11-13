---
version: "pro"
title: "Transaction plugin"
subtitle: "Enjoy support for @Transactional out of the box in your preferred development framework"
keywords: ["Transactional", "database transaction", "transaction it", "transaction in a database", "transaction sql"]
date: 2020-08-27T11:12:23+02:00
layout: "documentation"
menu: 
  main: 
    identifier: transactions
    parent: 'jobrunr-pro'
    weight: 2
---
{{< trial-button >}}

The JobRunr [Spring Boot Starter]({{<ref "/documentation/configuration/spring/_index.md">}}), [Micronaut integration]({{<ref "/documentation/configuration/micronaut/_index.md">}}), [Quarkus extension]({{<ref "/documentation/configuration/quarkus/_index.md">}}) come with an `@Transactional` plugin that makes sure your jobs join the transaction created by the framework. You can also benefit from this plugin when using Kotlin with the [Exposed ORM](https://github.com/JetBrains/Exposed).

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

#### How does it work?
- the JobRunr Spring Boot Starter and Micronaut Integration, Quarkus Extension, Exposed Plugin check whether they can participate in a transaction created by that framework.  
- if one is present, it is used and the whole method is transactional.
- if not, JobRunr creates it's own transaction to make sure the job is saved to the database. 

> This of course only works for the SQL `StorageProvider`s.

{{< trial-button >}}