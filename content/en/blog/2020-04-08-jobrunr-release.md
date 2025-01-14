---
title: "Java batch processing made easy..."
translationKey: "2020-04-08-jobrunr-release"
summary: "The birth of JobRunr - easy process long-running jobs!"
feature_image: /blog/2020-04-08-get-shit-done.webp
aspect_ratio: 1;
date: 2020-04-08T11:12:23+02:00
author: "Ronald Dehuysser"
tags:
  - blog
  - release
---

Today all the hype is around the distributed real-time processing frameworks, like [Apache Hadoop](https://hadoop.apache.org/), [Apache Kafka](https://kafka.apache.org/) or [Apache Spark](https://spark.apache.org/). These frameworks are well-established and a necessity if you are a company like Facebook, Netflix or Linkedin but they are not developer friendly - the learning curve is high and managing the infrastructure they are running on is not a trivial task.

And, let's face it - we are not all working for a company like the ones mentioned above - that process terabytes of data each day. Often we just need to solve some complex business processes with a moderate amount of data. I myself still need to meet my first customer who has more than one terabyte of relevant data within the same business process.

What I did need to do - already a couple of times - is, make some really difficult calculations on several gigabytes of data. And for these types of calculations, I never found the right Java framework to assist me getting the job done reliable and in a clean code manner.

Yes, there is Spring Batch or Quartz, but these frameworks all make you implement custom interfaces and they add a lot of overhead while I just want to run some long-running tasks in the background.

So, presenting __JobRunr__ - a port of the excellent [Hangfire framework](https://www.hangfire.io/) in the .NET world written by Sergey Odinokov to Java!

JobRunr allows you to create background jobs using just Java 8 lambdas! An example:

<figure style="width: 100%; max-width: 100%">

```java
BackgroundJob.enqueue(() -> myService.doWork());
```
</figure>

This one line of code makes sure that the lambda - including type, method and arguments - is serialized to persistent storage (an RDBMS like Oracle, Postgres, MySql and MariaDB or a NoSQL database which will be supported soon). A dedicated worker pool of threads will then execute these queued background jobs as soon as possible.

Do you need to do schedule a background jobs tomorrow? Next week? Next month? JobRunr has you covered:

<figure style="width: 100%; max-width: 100%">

```java
BackgroundJob.schedule(() -> System.out.println("Reliable!"), now().plusHours(5));
```
</figure>

Even recurring jobs have never been simpler - JobRunr allows to perform any kind of recurring task using CRON expressions.
<figure style="width: 100%; max-width: 100%">

```java
BackgroundJob.scheduleRecurringly(() -> service.doWork(), Cron.daily());
```
</figure>

### The benefits:

- __Easy__: there is no new framework to learn - just use your existing Java 8 skills.
- __Simple__: as you don't need to implement special interfaces or extend abstract classes, your code is almost agnostic of JobRunr. You can reuse your existing services without any change.
- __Fault-tolerant__: Bad things happen - a service you consume can be down, disks can get full, SSL certificates expire, ... . If JobRunr encounters an exception, by default it will reschedule the background job with an exponential back-off policy. If the background job continues to fail ten times, it will go to the Failed state. You can then decide to re-queue the failed job when the root cause has been solved.
- __Transparent__: JobRunr includes a built-in dashboard which allows you to monitor your jobs. It gives you an overview of all your background jobs and you can observe the state of each job in detail.
- __Distributed__: as the lambda or background job is serialized to persistent storage, the background process can travel over JVM boundaries and this allows distributed processing. Do you need to process 1.000.000 background jobs? Temporarily add extra background job servers - let's say 10 - which can process these jobs and your total processing time will be divided by almost 10.
- __Self-maintainable__: you don't need to perform manual storage clean-up – JobRunr keeps it as clean as possible and removes successfully completed jobs automatically.

JobRunr is currently in release candidate phase - we are now at v0.8.0 - and undergoing rigorous testing. It's open-source, available on [GitHub](https://github.com/jobrunr/jobrunr) and you are free to use it for commercial use. Give it a try!