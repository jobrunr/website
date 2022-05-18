---
title: "JobRunr Pro"
subtitle: "Add some steroids to JobRunr to support your difficult business processes."
date: 2020-04-30T11:12:23+02:00
layout: "documentation"
menu: 
  main: 
    identifier: jobrunr-pro
    parent: 'documentation'
    weight: 50
---

{{< trial-button >}}

JobRunr Pro is a drop-in replacement for JobRunr, available under a [paid subscription]({{< ref "/pricing.md" >}}) and adds a lot of extra functionality to support your difficult business processes:
- __[JobRunr Pro Dashboard]({{< ref "jobrunr-pro-dashboard.md" >}}):__ are you processing a lot of jobs and do you quickly need to find that one job? Thanks to the Job Filter feature in the JobRunr Pro dashboard you will quickly find any job by name, method signature or any other filters.
- __[Transaction plugin]({{< ref "transactions.md" >}}):__ are you using the [Spring Boot Starter]({{<ref "/documentation/configuration/spring/_index.md">}}) or the [Micronaut integration]({{<ref "/documentation/configuration/micronaut/_index.md">}})? Enjoy out of the box integration with their transactions using the `@Transactional` annotation thanks to the Transaction plugin.
- __Instant job processing:__ Are you in a hurry? JobRunr Pro starts processing your enqueued jobs instantly.
- __[Queues]({{< ref "queues.md" >}}):__ or are you processing a lot of jobs and do you have critical business processes that must finish on-time? Queues to the rescue! Just schedule your job with a higher priority and it will bypass all the other jobs.
- __[Job Chaining]({{< ref "job-chaining.md" >}}):__ reuse existing service methods and chain jobs to have cleaner code and an immediate overview of your business process.
- __[Batches]({{< ref "batches.md" >}}):__ batches allow you to create a bunch of background jobs atomically and combined with [Job Chaining]({{< ref "job-chaining.md" >}}) they can make complex workflows easy!
- __[Server Tags]({{< ref "server-tags.md" >}}):__ do you have jobs that can only run on certain servers (e.g. Jobs that should only run on Windows, Linux, ...)? Server Tags let you filter jobs by certain tags so that they are only run on certain servers.
- __[Mutexes]({{< ref "mutexes.md" >}}):__ do you consume a resource in your jobs that can not be shared? Thanks to mutexes, JobRunr will postpone jobs with shared mutexes until the mutex is free.
- __[Replace your jobs]({{< ref "replace-jobs.md" >}}):__ are you enqueueing your jobs with an external id and do you need to replace a job? By default, JobRunr will ignore the update to [avoid job duplicates in a load-balanced environment]({{<ref "faq.md#im-listening-for-jobs-using-service-bus-messages-in-a-load-balanced-environment-and-i-want-to-schedule-jobs-only-once">}}). Have a look at [replacing your jobs]({{< ref "replace-jobs.md" >}}) using `enqueueOrReplace` and `scheduleOrReplace`.
- __[Job Results]({{< ref "results.md" >}}):__ are your jobs returning results? Do you have API clients polling for the outcome of a certain job? Thanks to `JobResults` you can easily return results without needing to worry about (D)DOS attacks. //TODO
- __[Job Filters]({{< ref "job-filters.md" >}}):__ do you want to execute some custom business logic when a Job succeeds or fails? JobRunr filters to the rescue! And in JobRunr Pro, JobRunr filters can be any Spring / Micronaut / Quarkus bean - JobRunr will automatically find and use them.
- __[Job Migrations]({{< ref "migrations.md" >}}):__ easily migrate existing scheduled jobs via job migrations - CI/CD for your background jobs is now easier than ever. Or, you can just make your old job methods package private and JobRunr Pro will still execute them.
- __[Custom delete policy]({{< ref "custom-delete-policy.md" >}}):__ You probably like clean code? Then you also like a clean dashboard. Using a custom delete policy, you can delete jobs faster and keep dashboard and database clean.
- __Pause recurring jobs:__ Do you want to pause your recurring jobs? Just pause them from the dashboard and resume them whenever you are ready.
- __Start & Stop Background Job Processing:__ Do you want to stop background job processing for a while? Just stop the background job servers from the dashboard and start them whenever you are ready.
- __[Database fault-tolerance]({{< ref "database-fault-tolerance.md">}}):__ is your SQL / NoSQL database sometimes going down? Are you having connection troubles from your application to your database? JobRunr Pro has you covered and it will automatically stop job processing temporarily in this case. The moment your database is back online, JobRunr will start processing jobs again as if nothing ever happened.

### Upcoming features
JobRunr Pro is by no means a finished product - subscribing will allow me to build extra features including:
- Notification support if suddenly many jobs start failing
- a Slack and Microsoft Teams plugin which allows you to follow up on jobs and be notified if batches are finished (so business does not have to disturb you to find out how long a job will take)
- feature requests from you!