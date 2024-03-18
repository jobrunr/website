---
version: "pro"
title: "JobRunr Pro Dashboard"
subtitle: "The backoffice to your code!"
keywords: ["proxy", "set proxy in spring boot application", "spring boot set proxy", "dashboard server", "gdpr compliant", "openid authentication"]
date: 2020-08-27T11:12:23+02:00
layout: "documentation"
menu: 
  main: 
    identifier: jobrunr-pro-dashboard
    parent: 'jobrunr-pro'
    weight: 1
---

{{< trial-button >}}

The JobRunr Pro dashboard offers a lot of improvements that save your engineering teams a lot of time:
- [Find any Job using the search functionality](#find-any-job-using-the-search-functionality)
- [Save time thanks to usability improvements](#save-time-thanks-to-some-usability-improvements)
- {{< label version="enterprise" >}}JobRunr Pro Enterprise{{< /label >}} [Restrict access using OpenID Authentication](#restrict-access-using-openid-authentication)
- {{< label version="enterprise" >}}JobRunr Pro Enterprise{{< /label >}} [Embed the dashboard within Spring Server](#embed-the-dashboard-within-spring-application-server)
- {{< label version="enterprise" >}}JobRunr Pro Enterprise{{< /label >}} [GDPR compliant Dashboard](#gdpr-compliant-dashboard)


## Find any Job using the search functionality
Are you processing millions of jobs? Do you need to find that one job and find out if it succeeded? JobRunr Pro has you covered - thanks to a new feature called Job Search.

<figure>
<img src="/documentation/job-filters.gif" class="kg-image">
<figcaption>Thanks to the search filter, you can quickly find the job(s) you are interested in.</figcaption>
</figure>

> Note that users using __Redis__ as StorageProvider can only filter on State, Job Signature, Queue and ServerTag.

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

To see a complete demo of JobRunr Pro with job filtering, have a look at this [blog post]({{< ref "/blog/2021-07-12-jobrunr-pro-v3.4.0.md" >}}).

> This feature works great in combination with the [custom delete policies]({{< ref "custom-delete-policy.md" >}}). As you keep less data in your storage provider (either SQL or NoSQL), job filtering will be faster if there is less data.

## Save time thanks to some usability improvements
The JobRunr Pro dashboard also includes some usability improvements that save you a lot of time. Just requeue all your failed jobs with one click.

<figure>
<img src="/documentation/jobrunr-pro-failed-requeue.png" class="kg-image">
<figcaption>Thanks to some usability features, you can quickly requeue or delete all jobs.</figcaption>
</figure>

## Easier support to Proxy
Are you running multiple instances of JobRunr inside your organization? Do you want to proxy them? Then a custom context path per JobRunr instance can make life easy. This can be enabled both using the fluent api or the application configuration of the JobRunr Spring Boot Starter, the Micronaut integration or the Quarkus Extension.

Once configured, JobRunr will work with the contentpath configured by you - e.g. `http://localhost:8000/my-context-path/dashboard`.

{{< trial-button >}}

## Restrict access using OpenID authentication
{{< label version="enterprise" >}}JobRunr Pro Enterprise{{< /label >}} {{< label >}}Preview{{< /label >}}

JobRunr Pro Enterprise adds the possibility to protect the dashboard using OpenId authentication and is currently available for a select number of customers as it is in preview.

To configure it, use the following settings:
```
org.jobrunr.dashboard.openid-authentication.provider=keycloak # one of keycloak, google, okta or springauthorizationserver
org.jobrunr.dashboard.openid-authentication.openid-configuration-url=http://localhost:8080/realms/master/.well-known/openid-configuration
org.jobrunr.dashboard.openid-authentication.openid-base-url=http://localhost:8000/
org.jobrunr.dashboard.openid-authentication.client-id=client-id # the clientId that is configured in your OpenID Authorization server
org.jobrunr.dashboard.openid-authentication.client-secret=client-secret # the client secret that is configured in your OpenID Authorization server
```

## Embed the dashboard within Spring Application Server
{{< label version="enterprise" >}}JobRunr Pro Enterprise{{< /label >}}&nbsp;

Using JobRunr Pro Enterprise, you can also embed the dashboard within your existing Spring Application. This means that the JobRunr dashboard will be hosted by Spring and you can add your own authentication and authorization using Spring Security.

> This feature is also planned for the Micronaut and Quarkus integration.

<br />

## GDPR compliant dashboard
{{< label version="enterprise" >}}JobRunr Pro Enterprise{{< /label >}}&nbsp; {{< label >}}est: Q4 2023{{< /label >}}&nbsp;

Is your company operating in the medical or financial world and is your dashboard showing sensitive information? Do you still want your developers to quickly resolve any bugs and provide great support? 

Thanks to the GDPR toggle, any sensitive information will not be accessible in the dashboard anymore while still providing enough information to resolve bugs and provide support in case of unexpected exceptions.

> This feature is planned for end of Q4 2023.

<br />