---
version: "pro"
title: "Transaction plugin"
subtitle: "Enjoy support for @Transactional out of the box in your preferred development framework"
date: 2020-08-27T11:12:23+02:00
layout: "documentation"
menu: 
  main: 
    identifier: transactions
    parent: 'jobrunr-pro'
    weight: 2
---
{{< trial-button >}}

The JobRunr [Spring Boot Starter]({{<ref "/documentation/configuration/spring/_index.md">}}) and [Micronaut integration]({{<ref "/documentation/configuration/micronaut/_index.md">}}) come with an `@Transactional` plugin that makes sure your jobs join the transaction created by the framework.
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
- the JobRunr Spring Boot Starter and Micronaut Integration check whether they can participate in a transaction created by that framework.  
- if one is present, it is used and the whole method is transactional.
- if not, JobRunr creates it's own transaction to make sure the job is saved to the database. 

> This of course only works for the SQL `StorageProvider`s.

{{< trial-button >}}