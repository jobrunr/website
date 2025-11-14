---
title: "Job Scheduling at Scale: How Prophia’s Team Runs Thousands of Jobs Reliably"
author: "Nicholas D'hondt"
images:
  - /use-case/jobrunr-pro-prophia.webp
feature_image: /use-case/jobrunr-pro-prophia.webp
summary: "Prophia processes thousands of commercial leases every night, requiring speed, scale, and reliability.
By switching to JobRunr Pro, they simplified job scheduling and cut cloud costs.
Now their developers focus on features, not firefighting failing tasks."
date: 2025-05-08T09:00:00+02:00
tags:
  - use-case
---

Managing data for commercial real estate is no small task, especially when dealing with thousands of leases and heavy data processing every night. Prophia, a SaaS company specializing in lease abstraction and analytics, relies on [JobRunr Pro](/pricing/) to keep their operations smooth and scalable. It’s become a favorite tool for their developers, thanks to its simplicity and performance under pressure.

## The Challenge Prophia Faced

Prophia processes thousands of leases every night, consolidating data for reports, analytics, and cache refreshes. With upwards of 25,000 leases to manage nightly, their existing setup struggled to keep up.

> “Before JobRunr, we were using Spring Boot crons, and every time a server restarted, any ongoing job would just disappear. It wasn’t reliable, and scaling was expensive. We needed something better.”
> **— Brent Young, Director of Engineering at Prophia**

Their old system forced them to run additional servers full-time to handle peak workloads, leading to higher costs and inefficiencies.

## Why They Chose JobRunr Pro

Prophia explored several options, including [Quartz Scheduler](/blog/2024-10-31-task-schedulers-java-modern-alternatives-to-quartz/), but JobRunr Pro stood out for its lightweight setup and developer-friendly design.

> "We liked that JobRunr Pro didn’t require constant maintenance or specialized knowledge to get started," Brent said. "It just fits into your system without any hassle."

## What Changed After Adopting JobRunr Pro

Integrating [JobRunr Pro](/pricing/) was quick and straightforward for Prophia. Their developers were able to adapt it to their workflows within a couple of weeks. 

The results have been impressive:
- **Scalability:** Prophia can now scale their worker clusters dynamically, reducing the number of servers they need during quiet periods and adding capacity when workloads increase.  
- **Reliability:** With JobRunr Pro, even if a server goes down, jobs resume where they left off without any manual intervention.  
- **Visibility:** The JobRunr dashboard allows Prophia’s team to monitor job performance and troubleshoot issues faster.

> "Tasks that used to require constant oversight are now hands-off," Brent explained. "It’s a big relief for our small team."

## Features That Make the Difference

Prophia has made full use of [JobRunr Pro](/pricing/)’s advanced features, which have directly addressed their needs:

- **Batch Jobs and Priority Queues:** By using [priority queues](/blog/prioritizing-background-jobs/), Prophia ensures that critical jobs, like customer notifications, are never delayed by heavy workloads.  
- **Worker Threads Customization:** Prophia fine-tuned their worker threads to balance performance and resource usage. This allowed them to scale their system while staying cost-effective.  
- **Real-Time Monitoring:** The ability to track jobs in real-time helped their team quickly identify and fix issues with resource bottlenecks.

> "We love how JobRunr Pro gives us visibility into every part of the process," Brent said. "It makes debugging and optimizing our system so much easier."

## What the Team Thinks

Prophia’s developers have been impressed by how easy it is to work with JobRunr Pro.

> "The setup was simple, and it just works," Brent shared. "For 90% of our jobs, we don’t even think about them anymore—they run exactly how they should."

Prophia’s backend team also appreciates the lightweight design of JobRunr Pro, which doesn’t add unnecessary complexity to their stack.

> "It’s rare to find a tool that makes such a big impact without creating more work for us," 

## The Bottom Line

By switching to JobRunr Pro, Prophia has:

- Reduced cloud costs by scaling up and down based on workload.  
- Improved reliability for their nightly processing tasks.  
- Freed up their developers to focus on building features instead of babysitting job systems.

> "JobRunr Pro has saved us time and money," Brent said. "It’s the kind of tool you wish you’d found sooner."

For Prophia, JobRunr Pro is a key part of how they deliver value to their customers. Whether processing leases or sending notifications, they know they can count on JobRunr Pro to get the job done.
