---
title: "JobRunr compared"
translationKey: "alternatives"
subtitle: "Comparing JobRunr to some alternatives..."
description: "Find out how JobRunr compares to some alternatives"
date: 2020-09-16T11:12:23+02:00
layout: "documentation"
menu: 
  sidebar: 
    identifier: alternatives
    name: JobRunr compared
    weight: 105
sitemap:
  priority: 0.1
  changeFreq: monthly
---

Below you can find an external audit where JobRunr is compared to some alternatives.

> This report was created on June 19, 2020 and updated on November 07, 2025.

### Solving the Real-World Pains

A feature matrix is useful, but developers choose tools to solve specific, frustrating problems. Here’s how JobRunr compares to traditional schedulers like Quartz on the pains that matter.

| The Pain Point | Traditional Schedulers (e.g., Quartz, In-house built solution, ...) | The JobRunr Way (Modern & Simple) |
| --- | --- | --- |
| When jobs fail, it's a black box. | No built-in dashboard. Requires custom-built monitoring, logging, and UI just to see what's happening. | A built-in dashboard from the first minute. You can see, monitor, and retry failed jobs with zero extra code. |
| My scheduler is complex and fragile. | Heavy setup. Requires manual implementation for retries and manual configuration of thread pools. Jobs are complex classes. | Lightweight and simple by design. Retries are built-in. Worker threads are managed automatically. |
| I just want to ship features faster. | Requires significant boilerplate. You must implement a `Job` interface, build `JobDetail`, and configure a `Trigger`. | A single line of code. Just use a Java 8 lambda to schedule a job in one line. This means less code, faster development, and easier maintenance. |
### Feature Matrix

The following tables provides an overview of each approach’s features.

**Project characteristics**

| Project characteristics | JobRunr | Quartz | Native JEE (Timer, ExecutorService) | Spring (scheduling support) | db-scheduler |
| --- | --- | --- | --- | --- | --- |
| Licence | LGPL v3 | Apache v2.0 | GNU GPL v2 | Apache v2.0 | Apache v2.0 |
| Cost | Free | Free | Free | Free | Free |
| Project health | Actively maintained since April 2020,<br>49 contributors, 120 releases | Actively maintained, on GitHub since 2010,<br>65 contributors, 26 releases | Since Java 5 | Actively maintained since 2002,<br>1k+ contributors, over 200 releases | Actively maintained since September 2015,<br>69 contributors, 72 releases |
| Support channels | GitHub Discussions and pro tier | Google groups (forum, mailing list) | N/A | Public community and pro tier | GitHub |
| Documentation | Online documentation | Online documentation | None dedicated (numerous guides) | Online documentation | GitHub README |
| Participates in OpenJDK<br>Quality Outreach Program | Yes | No | N/A | Yes | No |
| Developer friendliness | 5/5 | 2/5 | 3/5 | 3/5 | 3/5 |

**Core features**

| Core features | JobRunr | Quartz | Native JEE (Timer, ExecutorService) | Spring (scheduling support) | db-scheduler |
| --- | --- | --- | --- | --- | --- |
| Support for definition of job types | No | Yes | No | No | Yes |
| Custom Trigger support | No | Yes | No | Yes | Yes (Tasks.custom) |
| Cron support | Yes  | Yes | No | Yes | Yes |
| Asynchronous jobs | Yes  | Yes | Yes | Yes | Yes |
| Delayed jobs | Yes | Yes | Yes | Yes | Yes |
| Recurring (scheduled) jobs | Yes | Yes | Yes | Yes | Yes |
| Persistent jobs | Yes | Yes | No | Yes (with Quartz) | Yes |
| Management of existing jobs | Yes | Yes | No | Yes (with Quartz) | Yes |

**Advanced features**

| Advanced features | JobRunr | Quartz | Native JEE (Timer, ExecutorService) | Spring (scheduling support) | db-scheduler |
| --- | --- | --- | --- | --- | --- |
| Distributed processing | Yes, out-of-the-box | Yes | No | Yes (with Quartz) | Yes |
| Transactional scheduling | Yes | Yes | No | Yes (with Quartz) | Yes |
| Job execution thread pool | Yes | Yes | Yes | Yes | Yes |
| Cluster safe (i.e. single job execution) | Yes, (optimistic locking) | Yes, (row locks) | No | Yes (Quartz or Shedlock) | Yes, (optimistic locking) |
| Multiple job stores (e.g. in-memory and DB) | Yes | Yes | No | Yes (with Quartz) | No |
| Job listeners (notifications on jobs triggers) | Yes | Yes | No | Yes (with Quartz) | No |
| Decoupled scheduling and processing | Yes | Yes (?) | No | Yes (with Quartz) (?) | Yes |
| Storage support | JDBC, RAM, MongoDB,<br/>Amazon Document DB | JDBC, Ram, Terracotta | NA | Multiple (Quartz or Shedlock) | JDBC |
| Carbon-Aware Job Processing | Yes  | No | No | No | No |
| High-Throughput Queue (SmartQueue) | Yes (Pro)  | No | No | No | No |
| Built-in K8S Autoscaling Metrics | Yes (Pro)  | No | No | No | No |

**Bonus features**

| Bonus features | JobRunr | Quartz | Native JEE (Timer, ExecutorService) | Spring (scheduling support) | db-scheduler |
| --- | --- | --- | --- | --- | --- |
| Web dashboard | Yes  | No  | No | No | No |
| Easy scheduling using lambdas | Yes | No | No | No | Yes |
| Multi-Cluster Monitoring Dashboard | Yes (Pro)  | No | No | No | No |

#### JobRunr gets a __5/5 score for developer friendliness__ as it:

- comes out-of-the-box with a __web dashboard__ to present past, present and future jobs, along with execution statistics and management controls 
- has great Spring Boot, Micronaut and Quarkus integration
- auto generates all SQL Tables / NoSQL data structures on first launch
- allows to start and schedule jobs in a __1-liner using nothing more than a Java 8 lambda__