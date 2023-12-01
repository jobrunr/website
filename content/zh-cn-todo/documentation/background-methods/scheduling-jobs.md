---
title: "Scheduling jobs"
subtitle: "Schedule jobs in the future and monitor them using the dashboard."
date: 2020-04-30T11:12:23+02:00
layout: "documentation"
menu: 
  main: 
    identifier: scheduling-jobs
    parent: 'background-methods'
    weight: 15
---
Sometimes you may want to postpone a method invocation; for example, to send an email to newly registered users a day after their registration. To do this, just call the `BackgroundJob.schedule` method and pass the desired delay:

<figure>

```java
BackgroundJob.schedule<EmailService>(x -> x.sendNewlyRegisteredEmail(), 
  Instant.now().plusHours(24));
```
</figure>

JobRunr's BackgroundJobServer periodically checks all scheduled jobs and enqueues them when it is time to run them, allowing workers to execute them. By default, the check interval is equal to 15 seconds, but you can change it by passing the relevant argument to the `BackgroundJobServer` constructor.

The `BackgroundJob.schedule` methods has overloads and accepts:

- a [ZonedDateTime](https://docs.oracle.com/javase/8/docs/api/java/time/ZonedDateTime.html)
- an [OffsetDateTime](https://docs.oracle.com/javase/8/docs/api/java/time/OffsetDateTime.html)
- a [LocalDateTime](https://docs.oracle.com/javase/8/docs/api/java/time/LocalDateTime.html)
- and an [Instant](https://docs.oracle.com/javase/8/docs/api/java/time/Instant.html)

All DateTime objects are converted to an `Instant` - in case of the `LocalDateTime`, the systemDefault zoneId is used to convert it.

These scheduling methods are also of course available on the `JobScheduler` bean.

<figure>

```java
@Inject
private JobScheduler jobScheduler;

jobScheduler.schedule<EmailService>(x -> x.sendNewlyRegisteredEmail(), 
  Instant.now().plusHours(24));
```
<figcaption>Scheduling a background job in future using the JobScheduler bean</figcaption>
</figure>