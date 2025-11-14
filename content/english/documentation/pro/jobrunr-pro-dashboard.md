---
version: "pro"
title: "JobRunr Pro Dashboard"
subtitle: "The backoffice to your code!"
keywords: ["proxy", "set proxy in spring boot application", "spring boot set proxy", "dashboard server", "gdpr compliant", "openid authentication"]
date: 2020-08-27T11:12:23+02:00
layout: "documentation"
menu: 
  sidebar:
    identifier: jobrunr-pro-dashboard
    parent: 'jobrunr-pro'
    weight: 1
---

{{< trial-button >}}

The JobRunr Pro dashboard offers a lot of improvements that save your engineering teams a lot of time:
- [Find any Job using the search functionality](#find-any-job-using-the-search-functionality)
- [Save time thanks to usability improvements](#save-time-thanks-to-some-usability-improvements)
- {{< label version="enterprise" >}}JobRunr Pro Enterprise{{< /label >}} [Restrict access using Single Sign On authentication](/en/documentation/pro/sso-authentication)
- {{< label version="enterprise" >}}JobRunr Pro Enterprise{{< /label >}} [Embed the dashboard within Spring Server](#embed-the-dashboard-within-spring-application-server)
- {{< label version="enterprise" >}}JobRunr Pro Enterprise{{< /label >}} [GDPR compliant Dashboard](#gdpr-and-hipaa-compliant-dashboard)


## Find any Job using the search functionality
Are you processing millions of jobs? Do you need to find that one job and find out if it succeeded? JobRunr Pro has you covered - thanks to a new feature called Job Search.

![](/documentation/job-filters.gif "Thanks to the search filter, you can quickly find the job(s) you are interested in.")

You can combine multiple filters to quickly find any job you are looking for using:
- Job Name
- Job Signature / Method Signature
- Job Fingerprint / Complete method with serialized parameters (toString())
- Any label the Job was given
- The queue the job was submitted on
- The server tag of the job
- The recurring job id
- Created after / Created before
- Updated after / Updated before 

To see a complete demo of JobRunr Pro with job filtering, have a look at this [blog post](/blog/2021-07-12-jobrunr-pro-v3.4.0).

> This feature works great in combination with the [custom delete policies]({{< ref "custom-delete-policy.md" >}}). As you keep less data in your storage provider (either SQL or NoSQL), job filtering will be faster if there is less data.

## Save time thanks to some usability improvements
The JobRunr Pro dashboard also includes some usability improvements that save you a lot of time. Just requeue all your failed jobs with one click.

![](/documentation/jobrunr-pro-failed-requeue.png "Thanks to some usability features, you can quickly requeue or delete all jobs.")

## Easier support to Proxy with a custom context-path
Are you running multiple instances of JobRunr inside your organization? Do you want to proxy them? Then a custom context path per JobRunr instance can make life easy. This can be enabled both using the fluent api or the application configuration of the JobRunr Spring Boot Starter, the Micronaut integration or the Quarkus Extension.

To configure it, use the following settings:

```
jobrunr.dashboard.context-path=/my-context-path
```

For Quarkus, you need to prefix this with `quarkus.`.

Once configured, JobRunr will work with the context path configured by you - e.g. `http://localhost:8000/my-context-path/dashboard`.

## Embed the dashboard within Spring Application Server
{{< label version="enterprise" >}}JobRunr Pro Enterprise{{< /label >}}&nbsp;

Using JobRunr Pro Enterprise, you can also embed the dashboard within your existing Spring Application. This means that the JobRunr dashboard will be hosted by Spring and you can add your own authentication and authorization using Spring Security.

To configure it, use the following settings:

```
jobrunr.dashboard.type=embedded
```

For Quarkus, you need to prefix this with `quarkus.`.

## GDPR and HIPAA compliant dashboard
{{< label version="enterprise" >}}JobRunr Pro Enterprise{{< /label >}}&nbsp;

Is your company operating in the medical or financial world and is your dashboard showing sensitive information? Do you still want your developers to quickly resolve any bugs and provide great support? 

Thanks to the GDPR / HIPAA feature, any sensitive information will not be accessible in the dashboard anymore while still providing enough information to resolve bugs and provide support in case of unexpected exceptions.

{{< trial-button >}}