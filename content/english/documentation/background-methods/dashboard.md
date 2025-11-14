---
title: "Dashboard"
subtitle: "The built-in dashboard gives you helpful insights into your background jobs"
date: 2020-04-30T11:12:23+02:00
keywords: ["dashboard", "fluent configuration", "spring configuration", "job overview", "find dashboard", "spring boot java configuration", "dashboard board"]
layout: "documentation"
menu: 
  sidebar:
    identifier: dashboard
    parent: 'background-methods'
    weight: 1
---
JobRunr includes a built-in dashboard which gives helpful insights into your background job methods. The dashboard allows you to see and control any aspect of background job processing - you have a detailed view on any exception that occurred and you can see the complete background job history.

By default, it is available on the following url: [http://localhost:8000](http://localhost:8000). Of course, this is configurable:

__Using fluent configuration__
<figure>

```java
JobRunr.configure()
    .useDashboard(8000)
```
<figcaption>The dashboard will be started on port 8000</figcaption>
</figure>

__Using Spring configuration__
<figure>

```java
jobrunr.dashboard.enabled=true 
jobrunr.dashboard.port=8000
```
<figcaption>Using the application.properties you can enable the dashboard which will be started on the given port</figcaption>
</figure>

> Do you want a more powerful dashboard with authentication, configurable context path or even embedded within Spring, Micronaut or Quarkus? Then have a look at the [JobRunr Pro Dashboard]({{<ref "jobrunr-pro-dashboard.md">}})!

<br/>

__Readable Job Names thanks to the `@Job` annotation or the `JobBuilder`__<br/>
You can easily configure your Job Name and some Job Labels for the dashboard by means of the `@Job` annotation:
<figure>

```java
@Job(name = "Sending email to %2 (requestId: %X{request.id})", labels = {"tenant:%0", "email"})
public void sendEmail(String tenant, String from, String to, String subject, String body) {
    // business code here
}
```
<figcaption>We can use the @Job annotation to provide the dashboard with a readable Job name and some labels.<br/>These properties support parameter substitution. In the example above, %2 will be replaced with the `to` parameter. You can also access the SLF4J Mapped Diagnostic Context (see %X{request.id}).<br/>The same is also possible for labels.</figcaption>
</figure>

This is of-course also possible using the `JobBuilder` pattern:
<figure>

```java
jobScheduler.create(aJob()
    .withName("Sending email to " + to)
    .withLabels("tenant:" + tenant, "email")
    .withDetails(() -> emailService.sendEmail(tenant, from, to, subject, body)))
```
<figcaption>We can use the JobBuilder pattern to provide the dashboard with a readable Job name and some labels.</figcaption>
</figure>


## Screenshots

![](/documentation/jobrunr-overview-1.webp "A complete overview of the amount of jobs that are being processed")

![](/documentation/jobs-enqueued.webp "An overview of all enqueued jobs")

![](/documentation/job-details-failed-2.webp "When a job failed, you see a detailed message why it did fail")

![](/documentation/job-details-succeeded.webp "A detailed overview of a succeeded job")

![](/documentation/recurring-jobs-1.webp "An overview of all recurring jobs with the ability to trigger or delete them")

![](/documentation/job-servers.webp "An overview of all background job servers processing background jobs")

## JobRunr Pro comes with handy dashboard improvements

![](/documentation/jobrunr-pro-enqueued.webp "Thanks to queues, we have an overview how many jobs are enqueued on the high-prio queue, standard queue and low-prio queue")

![](/documentation/jobrunr-pro-batches.webp "The Pro version also gives an overview of all your batches")

![](/documentation/jobrunr-pro-batch-details.webp "Follow up on your batch jobs thanks to the enhanced job details of a batch job")
