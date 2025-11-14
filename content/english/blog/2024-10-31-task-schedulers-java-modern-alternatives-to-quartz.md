---
title: "Task schedulers in Java: modern alternatives to Quartz Scheduler"
description: "Quartz is often considered the standard job scheduling library in Java, which can lead developers to overlook more modern alternatives."
images:
- /blog/modern-alternatives-to-quartz.png
image: /blog/modern-alternatives-to-quartz.png
date: 2024-10-31T16:00:00+02:00
author: "Ismaila Abdoulahi"
tags:
  - blog
---
<div style="text-align: center;margin: -2em 0 2em;">
<small style="font-size: 70%;">Image based on <a href='https://www.freepik.com/vectors/cartoon-astronaut'>cartoon astronaut vector created by catalyststuff - www.freepik.com</a></small>
</div>

For a long time, Quartz, also known as Quartz Scheduler, was the only viable open source task scheduler in Java. In fact, the official Quartz documentation still suggests that there is [no real alternative](https://www.quartz-scheduler.org/documentation/2.3.1-SNAPSHOT/faq.html). In this article, we will list a few different **Quartz Scheduler alternatives that offer a similar set of features while being easier and more enjoyable to use**.

## The Quartz Scheduler: how good is it really?

Similar to its alternative, the **Quartz Scheduler can be integrated into almost any Java application to schedule and process any task implemented in Java**. In its decades of existence, Quartz has evolved into a feature-rich framework for persisting task states,  automatically retrying tasks on failure, defining complex schedules, prioritizing tasks, achieving distributed processing, and more.

The fact that Quartz has been around for so long has two major advantages: **the library is battle-tested and has a large community**, which makes it easier to find help. All these elements together make it the most popular job scheduling library in Java. Despite all these strengths, **choosing Quartz is no longer so obvious due to some glaring issues**.

### Limitations of Quartz

#### Quartz is showing its age

The Quartz scheduler has several issues that make it less of an obvious choice, especially when **[there are several really good alternatives](#modern-alternatives-to-quartz-scheduler)**.

The age of Quartz, while an advantage, is also a disadvantage, as the **Quartz API and architecture are also getting older**. The Quartz API can be considered verbose by today's standards. This may not seem like a big deal, but it's important for a library or language to remain attractive to the next generation of developers. Reduced verbosity is one of the main factors contributing to the popularity of Kotlin, and Java itself is moving toward [becoming more beginner-friendly](https://www.infoq.com/news/2024/05/jep477-implicit-classes-main/).

Another place where Quartz shows its age is in its architecture. When using an RDBMS, **the scheduler requires the creation of more than 10 tables**, which is probably overkill for most applications where the actual business logic requires fewer tables.

We have written an article that [explains why some people move from Quartz to JobRunr and how to do so.](https://www.jobrunr.io/en/blog/2023-02-20-moving-from-quartz-scheduler-to-jobrunr/). This article **gives a feel for how complex and verbose Quartz is to use**.

#### Performs worse than modern alternatives

When compared to more modern alternatives, **Quartz is reported as having significantly lower performance**. This performance issue may be caused by the use of row level lock and the complexity of the configuration making the Quartz Scheduler harder to fine-tune.

#### Lack of built-in monitoring

Quartz Scheduler **lacks an intuitive dashboard or UI for tracking and monitoring jobs**. It also doesn't provide a way to interface with external monitoring tools like [Grafana](https://grafana.com/) or [Jaeger](https://www.jaegertracing.io/). Quartz users cannot actively monitor the system to proactively address issues such as job failures.

#### Distributed scheduling is opt-in

Quartz has the ability to handle the tasks in a distributed fashion, but this feature is opt-in. With tools like [Kubernetes](https://kubernetes.io/) now allowing a pod to spin up on demand, such a feature should not be an afterthought, but rather the default.

#### Sporadic maintenance

The last non-beta release of Quartz dates back to October 23, 2019. While development was on hold, **the ecosystem around it didn't stop evolving**. This hiatus led to a pile of unresolved issues. The users of the library are still suffering from the `javax` to `jakarta` namespace change, unless they use the latest release candidate, along with many bugs and security issues. They also **cannot use newest Java features such as virtual threads**, that may benefit background job processing, for instance to increase throughput…

> There is good news for Quartz users. the recent acquisition by IBM led to a spark in activity, with the community helping to fix all the major issues. It is still unclear what this acquisition means for the future of Quartz…
> 

## Modern alternatives to Quartz Scheduler

If you're looking for a Quartz alternative for your Java application, there are **several modern open source schedulers that offer similar features,** more developer-friendly APIs, and more robust support for distributed and cloud-based environments. 

We distinguish between two types of schedulers:

- The first class consists of [Java job scheduling libraries](#alternatives-to-quartz-in-java). Similar to Quartz, **they can be included in any Java application**. They live inside your application.
- The second class are [workflow engines](#other-job-scheduling-tools), which target a broader audience. These are **standalone services that your application will need to communicate with**.

### Alternatives to Quartz in Java

There are two great alternatives to Quartz for scheduling jobs in Java, namely [JobRunr](#jobrunr) and [db-scheduler](#db-scheduler). They can be added as a dependency to any Java application.

These libraries keep the number of third-party dependencies to a minimum, providing better security insurance. They are available as standard Java jars on Maven Central. 

#### JobRunr

[JobRunr](https://github.com/jobrunr/jobrunr) is a modern, actively maintained, open source Java library designed for background job processing. JobRunr offers an **easy-to-use API that simplifies job scheduling**. Unlike Quartz, JobRunr was designed with cloud-native applications in mind and provides support for distributed job scheduling.

JobRunr aims to be **developer friendly** by providing a simple, flexible and straightforward API, automatic retries on failure, and seamless integration with your existing infrastructure. In fact, all you need to create a background job is a Java 8 lambda. JobRunr also supports all major SQL databases and popular NoSQL databases.

A feature of JobRunr that neither Quartz nor db-scheduler provide out of the box is a dashboard. Thanks to the built-in dashboard, its **easy to monitor the system** to see why a job failed or to perform actions such as requeuing or deleting a job.

Used and trusted by industry leaders, the open source version of **JobRunr provides the essential features you need to schedule tasks in Java**. You can expect features similar to those in the Quartz Scheduler, but much easier to use. The JobRunr team also develop and maintain JobRunr Pro which offers Enterprise grade features, making JobRunr Pro the best job scheduling library in Java!

[Get started with JobRunr](/documentation/5-minute-intro/) or [watch Ronald present the motivation, design and code of JobRunr at Spring I/O 2022!](https://www.youtube.com/watch?v=2KFeeFuM9og)

<figure>
<img src="/documentation/jobs-enqueued.webp" class="kg-image" style="height: 400px">
<figcaption>An out of the box monitoring Dashboard provided by JobRunr</figcaption>
</figure>

#### DB Scheduler

Another good alternative to Quartz is [db-scheduler](https://github.com/kagkarlsson/db-scheduler). The library was originally designed to be **a simpler alternative to Quartz**. This design reduces the number of required tables to one (compared to Quartz's 11 tables!) and provides a much simpler API.

Similar to JobRunr, db-scheduler is **distributed by default** and guarantees that the same job will not be run concurrently. This guarantee is achieved by using the same centralized DB; in the case of db-scheduler, a relational database is typically required.

DB Scheduler **provides all the essential features for background job scheduling**, it can handle fire-and-forget jobs as well as scheduled (a.k.a. delayed) and recurring jobs. The library provides some simple monitoring via Micrometer. It can also perform an automatic retry if a task fails.

The library is well maintained and growing in features to match the capabilities of Quartz Scheduler, without the extra complexity.

### Other job scheduling tools

There are several job scheduling alternatives to Quartz that are aimed at a broader audience; we could probably not list them all, even if we wanted to. These alternatives come as standalone services, often referred to as **workflow engines**, that communicates with your application. 

Using these tools means you'll **have to get used to the terminology they use**. In particular, you'll have to accept that every task, even the simplest, must be defined as a workflow.

Here we'll briefly introduce two such workflow engines that work well with Java applications: [Temporal](#temporal) and [Kestra](#kestra).

#### Temporal

[Temporal](https://temporal.io/) is an open source **workflow engine designed to make applications more resilient**. The engine is written in Go and can be interfaced with your Java application using the provided [Java SDK](https://github.com/temporalio/sdk-java).

Very similar to pure Java-based solutions like JobRunr or Quartz, Temporal provides the essential features that **help developers to focus on business logic** instead of worrying about the complex mechanisms behind a resilient and distributed scheduler.

In addition to providing features such as retries, scalability, delayed and recurring executions, Temporal also provides a user interface that **allows you to monitor workflow execution** to detect failed tasks.

#### Kestra

[Kestra](https://kestra.io/) is an open-source **workflow automation platform that makes job scheduling easy**. The engine is written in Java but aims at running any task in any programming language. Kestra is a great **low-code alternative to Quartz**. It provides several hundreds of plugin allowing to extract data from any database, cloud storage, or API, and run scripts in any language.

Kestra **provides a UI for writing or configuring workflows**. This UI can also be used to monitor the system and track workflow state changes.

Kestra also has all the **essential features required for job scheduling**: reliable distributed system, retries, delayed and recurring executions, etc.

## Conclusion

For a long time, there was no real alternative to Quartz for job scheduling in Java. This is no longer the case, as there are several modern tools available to developers. These tools are simpler to use while providing the essential building blocks to achieve reliable and distributed scheduling.

You may be looking for a persistent task scheduling library that integrates seamlessly into a Java application. In this case, we highly recommend trying out our solution JobRunr. DB Scheduler is another option that can give you satisfactory results.

You can also take a look at workflow engines such as Temporal or Kestra. These are especially useful if your tasks are written in different programming languages.

With these diverse tools at their disposal, Java developers can now select the one that best meets their needs, rather than relying on a single option.