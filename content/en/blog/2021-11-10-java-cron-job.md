---
title: "Java Cron Jobs"
summary: "Need to run a CRON Job in Java? Try out JobRunr for all your recurring java CRON jobs!"
feature_image: /blog/2021-09-14-cron-job.webp
aspect_ratio: 1;
keywords: ["java recurring job", "java cron job", "cron", "crontab", "java cron"]
date: 2021-11-10T08:00:00+02:00
author: "Ronald Dehuysser"
tags:
  - blog
---
### What are CRON jobs?
CRON or crontab is a command-line utility to run certain tasks periodically at fixed times, dates, or intervals. CRON or crontab was originally created by AT&T Bell Laboratories in May 1975 and is by default now available on every OS. Most developers will know the Linux Crontab or the Windows Task Scheduler.

### How are CRON jobs useful?
As a developer, you already might have encountered a business requirement where each morning at 10 o'clock a report needs to be sent via email. This is a typical example where a CRON job comes in handy: using a simple CRON expression (in this case `0 10 * * *`), you can make sure the method is executed each morning at 10 o'clock. 

### How is a CRON expression created?
The CRON time string format exists of five fields that the CRON scheduler converts into a time interval. CRON then uses this interval to determine how often to run the associated task or method.

 ┌───────────── minute (0 - 59)<br/>
 │ ┌───────────── hour (0 - 23)<br/>
 │ │ ┌───────────── day of the month (1 - 31) or L for last day of the month<br/>
 │ │ │ ┌───────────── month (1 - 12 or Jan/January - Dec/December)<br/>
 │ │ │ │ ┌───────────── day of the week (0 - 6 or Sun/Sunday - Sat/Saturday)<br/>
 │ │ │ │ │<br/>
 │ │ │ │ │<br/>
 │ │ │ │ │<br/>
"* * * * *"<br/>

### How to run a CRON job in Java?
Today, you have several possibilities to run CRON jobs in Java: 
- there is of course Quartz Scheduler
- Spring framework has support for scheduled jobs using the `@Scheduled` annotation
- and since JobRunr is now also in the picture, you can use JobRunr to run CRON jobs in Java.

### What is the benefit of using JobRunr for Java CRON Jobs?
Using JobRunr for your CRON jobs brings some advantages:
- you can easily create a CRON job in a 1-liner using JobRunr: `BackgroundJob.scheduleRecurrently(Cron.daily(), () -> System.out.println("Easy!"));`
- if you are using Spring Framework, Micronaut or Quarkus: this is even easier. You can just add the JobRunr integration of your choice (`jobrunr-spring-boot-starter`, `jobrunr-micronaut-feature` or the `jobrunr-quarkus-extension`) and annotate the method that you want to schedule with the `@Recurring` annotation:
```java
@Service
public class SampleService {

    @Recurring(id = "my-recurring-job", cron = "*/5 * * * *")
    @Job(name = "My recurring job")
    public void executeSampleJob() {
        // your business logic here
        // you can also conditionally enqueue a new job - better visibility in the dashboard
    }
}
```
- it comes with a great UI where you have an overview of all your CRON jobs and where you check whether your CRON task / method finished successfully.
<figure>
<img src="/documentation/recurring-jobs-1.webp" class="kg-image">
<figcaption>
An overview of all recurring jobs with the ability to trigger or delete them</figcaption>
</figure>

<figure>
<img src="/blog/2021-09-14-cron-job-succeeded.png" class="kg-image">
<figcaption>A detailed overview of a succeeded CRON job</figcaption>
</figure>