---
title: "Enqueueing jobs"
subtitle: "Fire-and-forget method invocation has never been simpler thanks to JobRunr."
keywords: ["enqueue", "background job", "fire and forget", "enqueue jobs in bulk"]
date: 2020-09-16T11:12:23+02:00
layout: "documentation"
menu: 
  main: 
    identifier: enqueueing-jobs
    parent: 'background-methods'
    weight: 15
---
As you already know from the 5 minute intro, you only need to pass a lambda with the corresponding method and its arguments to enqueue a background job:

<figure>

```java
UUID jobId = BackgroundJob.enqueue(() -> myService.doWork());
```
<figcaption>This enqueues a background job using an instance of MyService which is available during enqueueing.</figcaption>
</figure>

<figure>

```java
UUID jobId = BackgroundJob.<MyService>enqueue(x -> x.doWork());
```
<figcaption>This enqueues a background job without a reference to an instance of MyService. During execution of the background job, the IoC container will need to provide an instance of type MyService.</figcaption>
</figure>


The enqueue method does not call the target method immediately, it runs the following steps instead:

- Analyse the lambda to extract the method information and all its arguments.
- Serialize the method information and all its arguments.
- Create a new background job based on the serialized information.
- Save background job to the configured `StorageProvider`.
- After these steps were performed, the `BackgroundJob.enqueue` method immediately returns to the caller. Another JobRunr component, called `BackgroundJobServer`, checks the persistent storage for enqueued background jobs and performs them in a reliable way.

Instead of the static method call `BackgroundJob.enqueue` you can also use the `JobScheduler` bean. It has exactly the same methods as the `BackgroundJob` class. To use it, just let your dependency injection framework inject an instance of the `JobScheduler` bean and continue as before:


<figure>

```java
@Inject
private JobScheduler jobScheduler;
 
jobScheduler.enqueue(() -> myService.doWork());
```
<figcaption>Background job scheduling using the JobScheduler bean</figcaption>
</figure>
 
As before, you also do not need an instance of the myService available if the `MyService` class is know by your dependency injection framework.

<figure>

```java
@Inject
private JobScheduler jobScheduler;
 
jobScheduler.<MyService>enqueue(x -> x.doWork());
```
<figcaption>Background job scheduling using the JobScheduler bean without a reference to the MyService instance. The MyService instance will be resolved using the IoC framework when the background job is started.</figcaption>
</figure>


## Enqueueing background jobs in bulk
Sometimes you want to enqueue a lot of jobs - for example send an email to all users. JobRunr can process a Java 8 Stream<T> of objects and for each item in that Stream, create a background job. The benefit of this is that it saves these jobs in bulk to the database - resulting in a big performance improvement.

<figure>

```java
Stream<User> userStream = userRepository.getAllUsers();
BackgroundJob.enqueue(userStream, (user) -> mailService.send(user.getId(), "mail-template-key"));
```
<figcaption>Enqueueing emails in bulk using the Stream API with an instance of the mailService available</figcaption>
</figure>

<figure>

```java
Stream<User> userStream = userRepository.getAllUsers();
BackgroundJob.enqueue<MailService, User>(userStream, (service, user) -> service.send(user.getId(), "mail-template-key"));
```
<figcaption>Enqueueing emails in bulk using the Stream API with an instance of the mailService not available</figcaption>
</figure>

This allows for nice integration with the Spring Data framework which can return Java 8 Streams - this way, items can be processed incrementally and the entire database must not be put into memory.

Off-course the above two enqueueing methods can also be done using the JobScheduler bean.

<figure>

```java
@Inject
private JobScheduler jobScheduler;

Stream<User> userStream = userRepository.getAllUsers();
jobScheduler.enqueue(userStream, (user) -> mailService.send(user.getId(), "mail-template-key"));
```
<figcaption>Enqueueing background job methods in bulk using the JobScheduler bean</figcaption>
</figure>

<figure>

```java
@Inject
private JobScheduler jobScheduler;

Stream<User> userStream = userRepository.getAllUsers();
jobScheduler.enqueue<MailService, User>(userStream, (service, user) -> service.send(user.getId(), "mail-template-key"));
```
<figcaption>Enqueueing background job methods in bulk using the JobScheduler bean</figcaption>
</figure>