---
title: "JobRunr Pro Dashboard"
subtitle: "The backoffice to your code!"
date: 2020-08-27T11:12:23+02:00
layout: "documentation"
menu: 
  main: 
    identifier: jobrunr-pro-dashboard
    parent: 'jobrunr-pro'
    weight: 3
---

<div style="text-align: center; margin-top: 1rem;">
    <a href="/en/try-jobrunr-pro/" class="btn btn-black btn-lg">
        <span>Try JobRunr Pro for free!</span>
    </a>
</div>

## Job search
Are you processing millions of jobs? Do you need to find that one job and find out if it succeeded? JobRunr Pro has you covered - thanks to a new feature called Job Search.

<figure>
<img src="/documentation/job-filters.gif" class="kg-image">
<figcaption>Thanks to job filters, you can quickly find the job you are interested in.</figcaption>
</figure>

> Note that users using __Redis__ as StorageProvider can only filter on State, Job Signature, Queue and ServerTag.

You can combine multiple filters to quickly find the job you are looking for like:
- Job Name
- Job Signature / Method Signature
- Job Fingerprint / Complete method with serialized parameters (toString())
- The queue the job was submitted on
- The server tag of the job
- Created after / Created before
- Updated after / Updated before 

To see a complete demo of JobRunr Pro with job filtering, have a look at this [blog post]({{< ref "/blog/2021-07-12-jobrunr-pro-v3.4.0.md" >}}).

> This feature works great in combination with the [custom delete policies]({{< ref "custom-delete-policy.md" >}}). As you keep less data in your storage provider (either SQL or NoSQL), job filtering will be faster if there is less data.

## Make life easy
The JobRunr Pro dashboard also includes some usability improvements that save you a lot of time. Just requeue all your failed jobs with one click.

<figure>
<img src="/documentation/jobrunr-pro-failed-requeue.png" class="kg-image">
<figcaption>Thanks to some usability features, you can quickly requeue or delete all jobs.</figcaption>
</figure>

## Easier support to Proxy
Are you running multiple instances of JobRunr inside your organization? Do you want to proxy them? Then a custom context path per JobRunr instance can make life easy. This can be enabled both using the fluent api or the application configuration of the JobRunr Spring Boot Starter, the Micronaut integration or the Quarkus Extension.

Once configured, JobRunr will work with the contentpath configured by you - e.g. `http://localhost:8000/my-context-path/dashboard`.

<div style="text-align: center; margin: 1rem 0 3rem;">
    <a href="/en/try-jobrunr-pro/" class="btn btn-black btn-lg">
        <span>Try JobRunr Pro for free!</span>
    </a>
</div>