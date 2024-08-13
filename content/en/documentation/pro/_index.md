---
title: "JobRunr Pro"
subtitle: "Add some steroids to JobRunr to support your difficult business processes."
keywords: ["observability", "batches", "server tags", "dynamic queues", "priority queues", "Workflows using Job Chains", "Advanced CRON expressions", "Server Tags", "real time scheduling", "enqueueing", "workflows"]
date: 2020-04-30T11:12:23+02:00
layout: "documentation"
menu: 
  main: 
    identifier: jobrunr-pro
    parent: 'documentation'
    weight: 50
---

{{< trial-button >}}

JobRunr Pro is a drop-in replacement for JobRunr, available under a [paid subscription]({{< ref "/pricing.md" >}}) and adds a lot of extra functionality to support your difficult business processes. 

- __[JobRunr Pro Dashboard]({{< ref "jobrunr-pro-dashboard.md" >}}):__ are you processing a lot of jobs and do you quickly need to find that one job? Thanks to the Job Search feature in the JobRunr Pro dashboard you will quickly find any job by name, method signature or any other fields.
- __[Built-in Observability]({{< ref "observability.md" >}}):__ keep track on how your jobs are doing over time. Corelate failures easily thanks to built-in observability using your existing observability provider like [Jaeger](https://www.jaegertracing.io/) or [New Relic](https://newrelic.com/).
- __[Transaction plugin]({{< ref "transactions.md" >}}):__ are you using the [Spring Boot Starter]({{<ref "/documentation/configuration/spring/_index.md">}}) or the [Micronaut integration]({{<ref "/documentation/configuration/micronaut/_index.md">}})? Enjoy out of the box integration with their transactions using the `@Transactional` annotation thanks to the Transaction plugin.
- __Instant job processing:__ Are you in a hurry? JobRunr Pro starts processing your enqueued jobs instantly.
- __[Real-time scheduling]({{< ref "real-time-scheduling.md" >}}):__ Are you very punctually? JobRunr Pro has support for real-time scheduling and enqueueing and makes sure your jobs run at the exact moment you specified!
- __[Dynamic Queues]({{< ref "dynamic-queues.md" >}}):__ are you managing a multi-tenant application where a single tenant could potentially generate millions of jobs? Thanks to dynamic queues, a fair-usage policy is enforced, thereby ensuring that other tenants maintain their ability to process jobs effectively.
- __[Priority Queues]({{< ref "priority-queues.md" >}}):__ are you processing a lot of jobs and do you have critical business processes that must finish on-time? Priority queues to the rescue! Just schedule your job with a higher priority and it will bypass all the other jobs.
- __[Workflows via Job Chaining]({{< ref "job-chaining.md" >}}):__ reuse existing service methods and chain jobs to have cleaner code and an immediate overview of your business process.
- __[Batches]({{< ref "batches.md" >}}):__ batches allow you to create a bunch of background jobs atomically and combined with [Job Chaining]({{< ref "job-chaining.md" >}}) they can make complex workflows easy!
- __[Advanced CRON Expressions]():__ do you need to run recurring jobs on some special moments like the first business day of the month or the last business day of the month? JobRunr Pro has a CRON expression parser on steroids and supports your really complex schedule requirements.
- __[Schedule recurring jobs skipped during downtime]({{< ref "documentation/background-methods/recurring-jobs.md#recurring-jobs-missed-during-downtime" >}}):__ are you redeploying but do you have some business critical Recurring Jobs that may not be skipped? Just configure your jobs with the `scheduleSkippedJobsDuringDowntime` and JobRunr Pro will schedule all of the skipped jobs as soon as a `BackgroundJobServer` is up & running again.
- __[Server Tags]({{< ref "server-tags.md" >}}):__ do you have jobs that can only run on certain servers (e.g. Jobs that should only run on Windows, Linux, ...)? Server Tags let you filter jobs by certain tags so that they are only run on certain servers.
- __[Mutexes]({{< ref "mutexes.md" >}}):__ do you consume a resource in your jobs that can not be shared? Thanks to mutexes, JobRunr will postpone jobs with shared mutexes until the mutex is free.
- __[Job time-outs]({{< ref "job-timeout.md" >}}):__ Do you have jobs that take forever due to some 3th party libraries that are unreliable? JobRunr Pro will interrupt your forever taking jobs is you specify a `processTimeOut`.
- __[Job Results]({{< ref "results.md" >}}):__ are your jobs returning results? Do you have API clients polling for the outcome of a certain job? Thanks to `JobResults` you can easily return results without needing to worry about (D)DOS attacks.
- __[Replace your jobs]({{< ref "replace-jobs.md" >}}):__ are you enqueueing your jobs with an external id and do you need to replace a job? By default, JobRunr will ignore the update to [avoid job duplicates in a load-balanced environment]({{<ref "faq.md#im-listening-for-jobs-using-service-bus-messages-in-a-load-balanced-environment-and-i-want-to-schedule-jobs-only-once">}}). Have a look at [replacing your jobs]({{< ref "replace-jobs.md" >}}) using `enqueueOrReplace` and `scheduleOrReplace`.
- __[Custom Retry Policy]({{< ref "documentation/background-methods/dealing-with-exceptions.md#custom-retrypolicy-configuration" >}}):__ Do you have some special needs regarding retrying failed Jobs? Then use the `CustomRetryPolicy` where you can specify the time to wait between each retry or just implement your own `RetryPolicy` if you want to have full control.
- __[Custom extensions using Job Filters]({{< ref "job-filters.md" >}}):__ do you want to execute some custom business logic when a Job succeeds or fails? JobRunr filters to the rescue! And in JobRunr Pro, JobRunr filters can be any Spring / Micronaut / Quarkus bean - JobRunr will automatically find and use them.
- __[Custom delete policy]({{< ref "custom-delete-policy.md" >}}):__ You probably like clean code? Then you also like a clean dashboard. Using a custom delete policy, you can delete jobs faster and keep the dashboard and database clean and mean - increasing performance.
- __[Database fault-tolerance]({{< ref "database-fault-tolerance.md">}}):__ is your SQL / NoSQL database sometimes going down? Are you having connection troubles from your application to your database? JobRunr Pro has you covered and it will automatically stop job processing temporarily in this case. The moment your database is back online, JobRunr will start processing jobs again as if nothing ever happened.
- __[CI/CD integration and Job Migrations]({{< ref "migrations.md" >}}):__ test whether your recent refactoring did not break any job and easily migrate existing scheduled jobs via job migrations. CI/CD for your background jobs is now easier than ever. Or, you can just make your old job methods package private and JobRunr Pro will still execute them.
- __Pause recurring jobs:__ Do you want to pause your recurring jobs? Just pause them from the dashboard and resume them whenever you are ready.
- __Start & Stop Background Job Processing:__ Do you want to stop background job processing for a while? Just stop the background job servers from the dashboard and start them whenever you are ready.
- __[Issue tracking Integration]({{< ref "issuetracking-integration.md" >}}):__ Save time by integrating JobRunr with your issue tracking software.


{{< label version="enterprise" >}}JobRunr Pro Enterprise{{< /label >}}<br> 
The enterprise version adds all the features of JobRunr Pro, plus the following features:
- __[Unlimited recurring jobs]({{< ref "documentation/background-methods/recurring-jobs.md" >}}):__ enjoy (almost) unlimited recurring jobs using JobRunr Pro Enterprise. We have personally tested with up to 10.000 jobs per minute (in combination with `CustomDeletePolicy`).
- __[Dashboard security]({{< ref "jobrunr-pro-dashboard.md#restrict-access-using-openid-authentication" >}}):__ add SSO and security to your dashboard with the OpenID integration and limit access to authorized personnel only. 
- __[Dashboard embedded within your application framework]({{< ref "jobrunr-pro-dashboard.md#embed-the-dashboard-within-spring-application-server" >}}):__ instead of running an embedded server, you can run the dashboard within your existing application server. Save resources and plug-in any security framework you already have running in-house. 
- __[GDPR compliant dashboard]({{< ref "jobrunr-pro-dashboard.md#gdpr-compliant-dashboard" >}}):__ hide sensitive information from preying eyes in the dashboard using the GDPR toggle.


### Upcoming features
JobRunr Pro is by no means a finished product - subscribing will allow me to build extra features including:
- Notification support if suddenly many jobs start failing
- a Slack and Microsoft Teams plugin which allows you to follow up on jobs and be notified if batches are finished (so business does not have to disturb you to find out how long a job will take)
- feature requests from you!
