---
title: "JobRunr and JobRunr Pro v7.0.0!"
description: "We're proud to announce the latest release, JobRunr & JobRunr Pro v7.0.0"
image: /blog/2024-04-09-jobrunr-jobrunr-pro-v7.png
date: 2024-04-09T09:00:00+02:00
author: "Donata Petkevičiūtė"
tags:
  - blog
  - meta
---
{{< trial-button >}}

<div style="text-align: center;margin: -2em 0 2em;">
<small style="font-size: 70%;"><a href='https://www.freepik.com/vectors/cartoon-astronaut'>Cartoon astronaut vector created by catalyststuff - www.freepik.com</a></small>
</div>

<style type="text/css">
    .post-full-content img {display: inline-block; margin: 0 auto}
</style>

# 🎉 Time for JobRunr v7.0.0 🎉

### It's Celebration Time Once Again at JobRunr!
We are excited to announce the release of JobRunr v7.0.0 and JobRunr Pro v7.0.0. This major release is now available via Maven Central and directly for our Pro subscribers through the customer portal. Building on our promise to deliver robust job scheduling solutions, v7.0.0 brings a suite of powerful new features, substantial performance enhancements, and critical dashboard improvements. Let’s delve into what makes this release a game-changer for developers and enterprises alike for both [JobRunr Pro](#pro-version) and [JobRunr OSS](#oss-version)!

🙏 We'd also like to thank all of the developers and companies who have beta tested JobRunr v7 beta's and release candidates.

# What is new?
## Pro Version:

> Please note that we also added license verification as of JobRunr Pro v7.0.0. If you're a JobRunr Pro customer and ready to update to v7.0.0, please <a href="mailto:hello@jobrunr.io">reach out to us</a> and we will provide you with a valid license key.

### New Features
- JobRunr Pro now has builtin support for Virtual Threads! They are enabled by default for JDK 21 and higher. [PR #906](https://github.com/jobrunr/jobrunr/pull/906)
- Improved OpenId authentication with authorization - add authorization support in the dashboard based on extensive rule-set. [PR #188](https://github.com/jobrunr/jobrunr-pro/pull/188)
- Dashboard GDPR/HIPAA support: allow to redact jobs so that no confidential information can be leaked. [PR #194](https://github.com/jobrunr/jobrunr-pro/pull/194)
- Rate Limiting - rate limit the amount of jobs being processed using either a `ConcurrentJobRateLimiter` and the `SlidingTimeWindowRateLimiter`. [PR #202](https://github.com/jobrunr/jobrunr-pro/pull/202)
- Add support for Strings as a `JobIdentifier`. [PR #285](https://github.com/jobrunr/jobrunr-pro/pull/285) (fixes [#236](https://github.com/jobrunr/jobrunr/issues/236))
- Workflow improvement: jobs can now continueOn success and continueOn failure or just onFailure. [PR #260](https://github.com/jobrunr/jobrunr-pro/pull/260)
- Make `BackgroundJobServer` shutdown period configurable. [PR #297](https://github.com/jobrunr/jobrunr-pro/pull/297) (fixes [#288](https://github.com/jobrunr/jobrunr/issues/236))
- Add option to skip retries with `DoNotRetryPolicy` for individual jobs and exceptions. [PR #303](https://github.com/jobrunr/jobrunr-pro/pull/303)
- Dashboard - add extra columns to job tables and allow to configure columns visibility. [PR #250](https://github.com/jobrunr/jobrunr-pro/pull/250)
- Cursor based Job Page - add support for Cursor Based Paging to support multi dashboard. [PR #212](https://github.com/jobrunr/jobrunr-pro/pull/212)
- `InMemoryStorageProvider` now allows for a pollInterval as small as 200ms (useful for testing purposes). [PR #909](https://github.com/jobrunr/jobrunr-pro/pull/909) (fixes [#619](https://github.com/jobrunr/jobrunr/issue/619)) 
- Dynamic Queues can reserve a certain amount of the total workers using the `FixedSizeWorkerPoolDynamicQueuePolicy`. [PR #237](https://github.com/jobrunr/jobrunr-pro/pull/237)
- Allow updating job labels from within a `JobFilter`. [PR #251](https://github.com/jobrunr/jobrunr-pro/pull/251) (fixes [#239](https://github.com/jobrunr/jobrunr-pro/issues/239))
- Allow to delete recurring jobs automatically using a `deleteAt` hint. [PR #257](https://github.com/jobrunr/jobrunr-pro/pull/257)
- Add support for job progress monitoring via `JobServerFilter` to get notified on job progress. [PR #282](https://github.com/jobrunr/jobrunr-pro/pull/282)

### Enhancements
- BackgroundJobServer Master Tasks are now spread over multiple threads for smooth processing.  [PR #280](https://github.com/jobrunr/jobrunr-pro/pull/280)
- Use Time-based UUID's as ID's for jobs instead of UUID.randomUUID() for lower disk usage in databases. [PR #890](https://github.com/jobrunr/jobrunr/pull/890) (fixes [#891](https://github.com/jobrunr/jobrunr/issues/891))
- Significantly decrease JSON size. [PR #892](https://github.com/jobrunr/jobrunr/pull/892)
- Improve Dynamic Queue Policy in combination with rate limiters by slowly phasing out unused dynamic queues. [PR #216](https://github.com/jobrunr/jobrunr-pro/pull/216)
- Workflow improvement: jobs within batch jobs can now use continuations while batch jobs themselves have continuations. (fixes [#201](https://github.com/jobrunr/jobrunr-pro/issues/201))
- Performance improvement: prevent Optimistic Locking Exceptions and use `select for update skip locked` if the database supports it. [PR #904](https://github.com/jobrunr/jobrunr/pull/904)
- Refactor batch jobs to not use metadata for succeeded child jobs. (fixes [#217](https://github.com/jobrunr/jobrunr-pro/issues/217))
- Support for unlimited batch jobs. [PR #265](https://github.com/jobrunr/jobrunr-pro/pull/265) (fixes [#254](https://github.com/jobrunr/jobrunr-pro/issues/254))
- Dashboard: batch jobs are now directly visible on the jobs page. [PR #250](https://github.com/jobrunr/jobrunr-pro/pull/250)
- Improve Job Metrics using MicroMeter. [PR #274](https://github.com/jobrunr/jobrunr-pro/pull/274) (fixes [#242](https://github.com/jobrunr/jobrunr-pro/issues/242))
- Wait for database migrations to finish before starting background job processing [PR #266](https://github.com/jobrunr/jobrunr-pro/pull/266)
- Improve Recurring Jobs in Spring Boot / Micronaut / Quarkus and keep paused state. [PR #304](https://github.com/jobrunr/jobrunr-pro/pull/304)
- Fetch all `SCHEDULED` jobs at the same `pollInterval`. [PR #273](https://github.com/jobrunr/jobrunr-pro/pull/273)
- JobRunr let's you know when your JobFilters are too slow via a warning. [PR #961](https://github.com/jobrunr/jobrunr-pro/pull/282)
- Query new JobRunr version via frontend instead of via the backend. [PR #979](https://github.com/jobrunr/jobrunr/pull/979)
- Refactor the `StorageProvider` and cleanup deprecated methods. [PR #893](https://github.com/jobrunr/jobrunr/pull/893)
- Performance improvement: improved SQL indexes (thanks to the customers who where willing to share their data)
- Log warning if ASM is not compatible. [PR #925](https://github.com/jobrunr/jobrunr/pull/925) (fixes [#924](https://github.com/jobrunr/jobrunr/issues/924))

### Fixed bugs
- Fix Bug where Micronaut integration fails if multiple servers are used. [PR #852](https://github.com/jobrunr/jobrunr/pull/852)
- Make sure MicroMeter Job metrics is also working with Fluent configuration .[PR #207](https://github.com/jobrunr/jobrunr-pro/pull/207)
- Fix when moving from JobRunr OSS v4 to JobRunr Pro v6. [PR #880](https://github.com/jobrunr/jobrunr/pull/880)
- Fix bug in`MigrateFromV5toV6Task` related `RecurringJobs` migration. [PR #238](https://github.com/jobrunr/jobrunr-pro/pull/238)
- Allow to gracefully stop the `BackgroundJobServer`. [PR #272](https://github.com/jobrunr/jobrunr-pro/pull/272)
- `enqueueOrReplace` and `scheduleOrReplace` now also update server tags [PR #267](https://github.com/jobrunr/jobrunr-pro/pull/267) (fixes [#164](https://github.com/jobrunr/jobrunr-pro/issues/164)) 
- Fix GraalVM native mode in Quarkus [PR #295](https://github.com/jobrunr/jobrunr-pro/pull/295)
- Make database migrations work on  WildFly. [PR #883](https://github.com/jobrunr/jobrunr/pull/883)
- Fix Bug `ApplyStateFilter` is called before save resulting in multiple calls to `onStateApplied`. [PR #903](https://github.com/jobrunr/jobrunr/pull/903) (fixes [#902](https://github.com/jobrunr/jobrunr/issues/902))
- Use Jackson by default in Quarkus if present. [PR #913](https://github.com/jobrunr/jobrunr/pull/913) (fixes [#887](https://github.com/jobrunr/jobrunr/issues/887)) 
- Fix Bug `JobServerFilter.onProcessingFailed` is not called when a job orphans (e.g. if background job server dies). [PR #921](https://github.com/jobrunr/jobrunr/pull/921) (fixes [#920](https://github.com/jobrunr/jobrunr/issues/920)) 
- Fix Bug `IllegalStateException`: Can not find variable 3 in stack. [PR #941](https://github.com/jobrunr/jobrunr/pull/941), [PR #945](https://github.com/jobrunr/jobrunr/pull/945) (fixes [#942](https://github.com/jobrunr/jobrunr/issues/942)) 
- Fix Bug `CronExpression.validateSchedule()` does not correctly check for interval size. [PR #859](https://github.com/jobrunr/jobrunr/pull/859) (fixes [#858](https://github.com/jobrunr/jobrunr/issues/858))

### Breaking changes
- `@Recurring` has been moved to core `org.jobrunr.jobs.annotations.Recurring` and uses enums instead of booleans. The attributes `paused` and `scheduleJobsSkippedDuringDowntime` now use an enum instead of a boolean. This allows us to keep the paused state of a Recurring job even if you redeploy (default) whereas in the past, on redeploy, the Job would be started automatically again. If `paused` is put to false in the `@Recurring`, the Recurring job will start on redeploy even if it was paused before via the dashboard
- `JobScheduler.delete(String id)` has been renamed to `JobScheduler.deleteRecurringJob(String id)`
- The `StorageProvider` has been updated and is not backwards compatible as is the `Page` and `PageRequest`.  A new class `org.jobrunr.storage.Paging` was added where all utility methods regarding Paging have been collected
- For SQL databases, JobRunr deletes all indexes and recreates them for better performance. If you have a lot of jobs in your database, the migration may take a while. Also, on some databases **column types are changed** for better performance making this release not backwards compatible.
- JobRunr and JobRunr Pro 7 requires MongoDB Driver 5.0.0 or higher (please be aware that Spring Boot 3.2 still depends on Mongo 4.x)
- **We're also dropping the `RedisStorageProvider` and the `ElasticSearchStorageProvider`** in JobRunr Pro. JobRunr 7 OSS will be the last to support it.
- `JobContext.getSignature()` has been renamed to `JobContext.getJobSignature()`
- `JobDashboardProgressBar.setValue(...)` has been renamed to `JobDashboardProgressBar.setProgress(long succeededAmount)`
- Overall `BatchJob`s logic has been rewritten, make sure `MigrateFromV6toV7Task` is run
- Dynamic queues configuration has been changed in Spring, Quarkus and Micronaut: `dynamic-queues.type` has been removed, instead the type is now part of the dynamic queues property keys, e.g., `org.jobrunr.jobs.dynamic-queue.round-robin.label-prefix` (please adapt to your framework)

If you are a JobRunr OSS user and you are interested in JobRunr Pro, you can find all the pricing information [here]({{< ref "jobrunr-pro.md" >}}).


## OSS version:
### New features
- JobRunr now has builtin support for Virtual Threads! They are enabled by default for JDK 21 and higher. [PR #906](https://github.com/jobrunr/jobrunr/pull/906)
- InMemoryStorageProvider now allows for a pollInterval as small as 200ms (useful for testing purposes). [PR #909](https://github.com/jobrunr/jobrunr/pull/909)  (fixes [#619](https://github.com/jobrunr/jobrunr/issues/619))
- Make BackgroundJob server shutdown period configurable. [PR #973](https://github.com/jobrunr/jobrunr/pull/973) (fixes [#288](https://github.com/jobrunr/jobrunr/issues/236))

### Enhancements
- Use Time-based UUID's as ID's for jobs instead of UUID.randomUUID() for lower disk usage in databases. [PR #890](https://github.com/jobrunr/jobrunr/pull/890) (fixes [#891](https://github.com/jobrunr/jobrunr/issues/891))
- Significantly decrease JSON size, [PR #892](https://github.com/jobrunr/jobrunr/pull/892)
- Performance improvement: prevent Optimistic Locking Exceptions and use `select for update skip locked` if the database supports it [PR #904](https://github.com/jobrunr/jobrunr/pull/904):
- BackgroundJobServer Master Tasks are now spread over multiple threads for smooth processing. [PR #954](https://github.com/jobrunr/jobrunr/pull/954)
- Add access to labels via `JobContext`. [PR #969](https://github.com/jobrunr/jobrunr-pro/pull/969) (fixes [#286](https://github.com/jobrunr/jobrunr-pro/issues/286))
- JobRunr let’s you know when your JobFilters are too slow via a warning. [PR #961](https://github.com/jobrunr/jobrunr/pull/961)
- Quarkus - Separate build time and runtime configuration. [PR #845](https://github.com/jobrunr/jobrunr/pull/845)
- Update ElasticSearch to new Java API. [PR #850](https://github.com/jobrunr/jobrunr/pull/850) (fixes [#499](https://github.com/jobrunr/jobrunr/issues/499))
- Wait for database migrations to finish before starting background job processing
- Query new JobRunr version via frontend instead of via the backend [PR #979](https://github.com/jobrunr/jobrunr/pull/979)
- Log warning if ASM is not compatible. [PR #925](https://github.com/jobrunr/jobrunr/pull/925) (fixes [#924](https://github.com/jobrunr/jobrunr/issues/924))


### Fixed bugs
- Make database migrations work on WildFly. [PR #883](https://github.com/jobrunr/jobrunr/pull/883)
- Fix Bug `ApplyStateFilter` is called before save resulting in multiple calls to `onStateApplied`. [PR #903](https://github.com/jobrunr/jobrunr/pull/903) (fixes [#902](https://github.com/jobrunr/jobrunr/issues/902))
- Use Jackson by default in Quarkus if present. [PR #913](https://github.com/jobrunr/jobrunr/pull/913) (fixes [#887](https://github.com/jobrunr/jobrunr/issues/887)) 
- Fix Bug `JobServerFilter.onProcessingFailed` is not called when a job orphans (e.g. if background job server dies). [PR #921](https://github.com/jobrunr/jobrunr/pull/921) (fixes [#920](https://github.com/jobrunr/jobrunr/issues/920)) 
- Fix Bug `IllegalStateException`: Can not find variable 3 in stack. [PR #941](https://github.com/jobrunr/jobrunr/pull/941), [PR #945](https://github.com/jobrunr/jobrunr/pull/945) (fixes [#942](https://github.com/jobrunr/jobrunr/issues/942)) 
- Fix Bug where Micronaut integration fails if multiple servers are used. [PR #852](https://github.com/jobrunr/jobrunr/pull/852) (fixes [#847](https://github.com/jobrunr/jobrunr/issues/847))
- Fix Bug `CronExpression.validateSchedule()` does not correctly check for interval size. [PR #859](https://github.com/jobrunr/jobrunr/pull/859) (fixes [#858](https://github.com/jobrunr/jobrunr/issues/858))

### Misc
- Updated dependencies [PR #851](https://github.com/jobrunr/jobrunr/pull/851), [PR #886](https://github.com/jobrunr/jobrunr/pull/886), [PR #889](https://github.com/jobrunr/jobrunr/pull/889), [PR #917](https://github.com/jobrunr/jobrunr/pull/917), [PR #943](https://github.com/jobrunr/jobrunr/pull/943), [PR #956](https://github.com/jobrunr/jobrunr/pull/956)
- Refactoring and cleanup [PR #893](https://github.com/jobrunr/jobrunr/pull/893), [PR #894](https://github.com/jobrunr/jobrunr/pull/894), [PR #895](https://github.com/jobrunr/jobrunr/pull/895), [PR #934](https://github.com/jobrunr/jobrunr/pull/934), [PR #937](https://github.com/jobrunr/jobrunr/pull/937), [PR #938](https://github.com/jobrunr/jobrunr/pull/938)
- Improved logging and exception handling [PR #860](https://github.com/jobrunr/jobrunr/pull/860), [PR #925](https://github.com/jobrunr/jobrunr/pull/925)

### Breaking changes
- `@Recurring` has been moved to core `org.jobrunr.jobs.annotations.Recurring`
- `JobScheduler.delete(String id)` has been renamed to `JobScheduler.deleteRecurringJob(String id)`
- The `StorageProvider` has been updated and is not backwards compatible as is the `Page` and `PageRequest`.  A new class `org.jobrunr.storage.Paging` was added where all utility methods regarding Paging have been collected
- For SQL databases, JobRunr deletes all indexes and recreates them for better performance. If you have a lot of jobs in your database, the migration may take a while.
- JobRunr and JobRunr Pro 7 requires MongoDB Driver 5.0.0 or higher (please be aware that Spring Boot 3.2 still depends on Mongo 4.x)
- **We're also deprecating the `RedisStorageProvider` and the `ElasticSearchStorageProvider`**. JobRunr 7 will be the last to support it.
- `JobContext.getSignature()` has been renamed to `JobContext.getJobSignature()`
- `JobDashboardProgressBar.setValue(...)` has been renamed to `JobDashboardProgressBar.setProgress(long succeededAmount)`

#### Contributors
We thank the following contributors for their help with JobRunr v7!
- @[coschtl](https://github.com/coschtl)
- @[tms0](https://github.com/jobrunr/jobrunr/issues?q=is%3Apr+author%3Atms0)


Try it out now and let us know your feedback! Your input is very important, so we can provide you smooth v7.0.0 JobRunr!

Best,<br>
Friends of developers<br>
The JobRunr Team