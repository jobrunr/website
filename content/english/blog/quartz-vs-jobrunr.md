---
title: "Why We Ran the Numbers: Benchmarking JobRunr vs. Quartz on Postgres"
description: "We benchmarked JobRunr Pro against Quartz on Postgres. The results are in: JobRunr is 18 times faster, processing 500,000 jobs with a fraction of the database load."
image: "/blog/quartz-vs-jobrunr.webp"
date: 2025-11-12T12:24:16+02:00
author: "Nicholas D'hondt"
tags:
  - blog
  - quartz
---

A potential customer recently asked us: "We run on Postgres. We know Quartz is the old standard, but how does JobRunr's performance really stack up against it?"

It's a question many Java developers have. You have a long-standing scheduler like Quartz that's been part of the ecosystem for years. But you also feel the pain of bottlenecks. You suspect your scheduler might be heavy on the database, but it's hard to prove without a direct comparison.

Many schedulers can struggle with modern Postgres stacks, leading to performance issues that are hard to diagnose.

So we decided to find out. We ran the numbers.

We set up a head-to-head benchmark. JobRunr Pro versus Quartz, both on the same Postgres database, to see how many jobs they could process.

The results were... even we were surprised.


### Setting Up a Fair Test

To make this a real-world comparison, we needed to eliminate as many variables as possible.

Here was our setup.

* **Hardware:** A dedicated Hetzner server (model EX44) so no other load would interfere.
* **Database:** The same Postgres 18.0 database.
* **The Test:** Enqueue 500,000 "hello-world" jobs and measure how long it takes to process them all. We wanted to test the schedulers, not the job logic.
* **Configuration:** Both JobRunr and Quartz were set up with identical thread pool sizes and used the same database connection pool settings. We used the default settings for both projects otherwise.

We did try to use bulk scheduling in Quartz to make job creation faster. But we ran into exceptions and after losing time, we focused on the processing throughput. That's the part that matters most for application stability.

> A quick note on "hello-world" jobs: This test uses jobs that execute instantly. This is a best-case scenario designed to stress-test the scheduler's overhead. In real-world applications, where your jobs might take 500ms or more, this 18x gap will naturally be smaller as the bottleneck shifts from the scheduler to your job's execution time.



### The Performance Results

We ran the test. And we checked the numbers.

For processing 500,000 jobs, the job throughput was:

* **Quartz:** 145.48 jobs per second.
* **JobRunr Pro:** 2732.24 jobs per second.

That's not a small difference. **JobRunr Pro was 18 times faster than Quartz** on the exact same hardware and database.

Here is the raw data from our benchmark runs.


| Date & Time | Host name | Java version | Tool | Tool version | StorageProvider | amount of created jobs | amount of succeeded jobs | creation duration | processing duration | job throughput (jobs / sec) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 2025-11-10T09:39:45.308751361Z | Ubuntu-2204-jammy-amd64-base | 25.0.1+8-LTS | quartz | 2.5.1-SNAPSHOT (branch unknown) | postgres:18.0 | 500000 | 500000 | PT57M53.5989764S | PT57M17.435478266S | 145.48 |
| 2025-10-17T09:26:10.167417043Z | Ubuntu-2204-jammy-amd64-base | 25.0.1+8-LTS | JobRunr Pro | 8.1.0 (master@d16a6f6e4) | postgres:18.0 | 500000 | 500000 | PT27.787648139S | PT3M3.102498029S | 2732.24 |


### Why the 18x Difference? A Look at the Code

An 18x difference is massive. We had to know why.

We looked at the Quartz code and found a key design difference. Quartz uses row-level locking in a separate table called `QRTZ_LOCKS`.

```sql
SELECT * FROM QRTZ_LOCKS WHERE SCHED_NAME = ? AND LOCK_NAME = ? FOR UPDATE
```

This isn't just our finding. In a techical article titled [Performance Tuning on Quartz Scheduler](https://innovation.ebayinc.com/stories/performance-tuning-on-quartz-scheduler/), **eBay**'s engineering team documented this exact problem. They found that under heavy load, Quartz "runs into trouble" as database sessions stack up, all waiting on SELECT * FROM qrtz_LOCKS ... FOR UPDATE. 

Their article confirms that this lock competition is the main bottleneck.
This means that for every job it processes, it's making *at least* double the amount of database calls compared to JobRunr. It has to check and manage that separate lock table, which adds significant overhead and slows everything down.

JobRunr is built differently. It's designed to be lightweight and use modern, efficient database patterns. For Postgres, this means using features like `FOR UPDATE SKIP LOCKED`.

This approach integrates the lock directly into the job fetch query. It allows JobRunr to grab and lock available jobs in a single, efficient database call. The database isn't spending its time managing a separate lock table; it's spending its time processing your jobs.

The 18x performance gain isn't magic. It's the result of a modern design choice that directly reduces your database load. While the gap will vary based on your job's complexity, the underlying overhead in Quartz remains, creating unnecessary load on your database for every job.

### Choosing the Right Tool (Not Just the Fastest)
Performance isn't everything. This benchmark shows a specific scenario, and it's important to be transparent about trade-offs.

When **Quartz might still fit**: Quartz is free and has been in production for decades. If you need highly complex, calendar-based scheduling (like custom holiday or fiscal calendars) or are maintaining a legacy enterprise system, it's a mature choice.

When **JobRunr fits**: If your priority is high-throughput, high-reliability, and low database overhead for modern Java applications and microservices, this benchmark shows the clear architectural advantage.

This test compared the free and open-source Quartz with JobRunr Pro. 


### See the Proof for Yourself

We believe in transparency. You shouldn't just take our word for it.

We are cleaning up the benchmark code and will make the full, reproducible benchmark available on GitHub soon. You can run it yourself and see the numbers on your own stack.

Choosing a scheduler is a big decision. We hope this data helps you understand the real-world cost of database overhead.

If your application relies on high-throughput background jobs, ask yourself. 

Could you benefit from a scheduler that's 18 times faster and lighter on your database?
