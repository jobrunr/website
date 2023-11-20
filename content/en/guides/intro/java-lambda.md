---
title: Create and schedule jobs with JobRunr using only a Java lambda
description: This guide will explain you how to setup JobRunr and explore how to enqueue and schedule jobs using only a Java 8 lambda.  
weight: 20
tags:
    - JobRunr
    - Java 8 lambda
draft: true
---
In this guide, we will learn how to:
- setup JobRunr
- learn how to enqueue and schedule a job in vanilla Java or your favorite web framework
- monitor your jobs using the built-in dashboard


## Prerequisites
- JobRunr Pro 6.4.0 or later

## What is JobRunr
[JobRunr](https://github.com/jobrunr/jobrunr) is a library that we can embed in our application and which allows us to schedule background jobs using a Java 8 lambda. We can use any existing method of our Spring services to create a job without the need to implement an interface. A job can be a short or long-running process, and it will be automatically offloaded to a background thread so that the current web request is not blocked.

To do its job (pun intended 😅), JobRunr analyses the Java 8 lambda. It serializes it as JSON, and stores it into either a relational database or a NoSQL data store.

## Setup
### Maven dependency
Let’s jump straight to the Java code. But before that, we need to have the following Maven dependency declared in our pom.xml file:

```xml
<dependency>
    <groupId>org.jobrunr</groupId>
    <artifactId>jobrunr-spring-boot-starter</artifactId>
    <version>6.4.0</version>
</dependency>
```

### JobRunr Configuration
Before we jump straight to how to create background jobs, we need to initialize JobRunr. As we’re using the jobrunr-spring-boot-starter dependency, this is easy. We only need to add some properties to the application.properties:

{{< codetabs >}}
{{< codetab type="fluent-api" label="Fluent API" >}}
// ...
import org.jobrunr.dashboard.server.security.AnonymousAuthenticationProvider;
import static org.jobrunr.dashboard.server.security.JobRunrUserAuthorizationRules.readOnly;
// ...
JobRunrPro
        .configure()
        // ...
        .useDashboard(usingStandardDashboardConfiguration()
            // ...
            .andAuthentication(new AnonymousAuthenticationProvider(readOnly()))
        )
        // ...
{{< /codetab >}}
{{< codetab type="spring" label="Spring">}}
// ... Spring
import org.jobrunr.dashboard.server.security.AnonymousAuthenticationProvider;
import static org.jobrunr.dashboard.server.security.JobRunrUserAuthorizationRules.readOnly;
// ...
JobRunrPro
        .configure()
        // ...
        .useDashboard(usingStandardDashboardConfiguration()
            // ...
            .andAuthentication(new AnonymousAuthenticationProvider(readOnly()))
        )
        // ...
{{< /codetab >}}
{{< /codetabs >}}

JobRunr Pro's default setting is an `AnonymousAuthenticationProvider` with `allowAll` authorization rules. If this aligns with your requirements, no further action is needed.

> Note: you can also `denyAll` access using `AnonymousAuthenticationProvider` but this is typically more suitable for a multi-user setting. Instead you should disable the dashboard.

Now, let's configure JobRunr to:

1. Allow `read-only` access to the dashboard.
2. Allow viewing and controlling recurring jobs (e.g., `pause`, `resume`, `trigger`, and `edit schedule expressions`).

### Making the dashboard read-only
To make your JobRunr dashboard read-only, modify your configuration as follows:

> This configuration is only suitable when your jobs do not expose confidential data.



In the code snippet above, we imported the `AnonymousAuthenticationProvider` class and the `readOnly` method from `JobRunrUserAuthorizationRules` to set the authorization rules of the authentication provider. Launching the application with this configuration will result in a `403` for any access to endpoints that change the state of jobs, recurring jobs, or servers.

Launching the application with this configuration, any access to an endpoint that changes the state of `jobs`, `recurring jobs` or `servers` will result in a `403`.

### Allowing to view and control recurring jobs
JobRunr allows for more flexible authorization rules configurations. Here, we'll configure the application to only allow `read`, `pause`, `resume`, `trigger` and `edit` of recurring jobs. 

> This essentially forbids access to any other resources, including deleting recurring jobs! But should only be used if the dashboard is not publicly accessible.

{{< codetabs >}}
{{< codetab type="fluent-api" label="Fluent API" >}}
// ...
import org.jobrunr.dashboard.server.security.AnonymousAuthenticationProvider;
import static org.jobrunr.dashboard.server.security.JobRunrUserAuthorizationRulesBuilder.denyAll;
// ...
JobRunrPro
        .configure()
        // ...
        .useDashboard(usingStandardDashboardConfiguration()
            // ...
            .andAuthentication(new AnonymousAuthenticationProvider(denyAll()
                .canAccessRecurringJobs(true)
                .canControlRecurringJobs(true)
                .build())
            )
        )
        // ...
{{< /codetab >}}
{{< codetab type="spring" label="Spring">}}
// ... Spring
import org.jobrunr.dashboard.server.security.AnonymousAuthenticationProvider;
import static org.jobrunr.dashboard.server.security.JobRunrUserAuthorizationRulesBuilder.denyAll;
// ...
JobRunrPro
        .configure()
        // ...
        .useDashboard(usingStandardDashboardConfiguration()
            // ...
            .andAuthentication(new AnonymousAuthenticationProvider(denyAll()
                .canAccessRecurringJobs(true)
                .canControlRecurringJobs(true)
                .build())
            )
        )
        // ...
{{< /codetab >}}
{{< /codetabs >}}

In the code snippet above, we imported the `AnonymousAuthenticationProvider` class and the `denyAll` method from `JobRunrUserAuthorizationRulesBuilder` to set the desired rules for accessing and controlling recurring jobs. Launching the application with this configuration will restrict access to any other resources besides those explicitly enabled.

> If `canAccessRecurringJobs` is set to `false` the recurring jobs page will no longer be accessible, you'll need to use tools such as `curl` to perform changes to the recurring jobs.

## Limitations

It's important to be aware of a limitation when using Anonymous Authentication with JobRunr Pro. The setup discussed in this guide requires that the JobRunr instance be restarted to update the authorization rules. This means that if you need to modify or fine-tune the access control rules, you will need to restart your JobRunr application.

While this limitation may not be a significant issue for many scenarios, it's essential to plan accordingly if your application requires frequent changes to authorization rules. Restarting the JobRunr instance may lead to brief downtime or disruption in background job processing.

## Conclusion

In this guide, we've learned how to use `AnonymousAuthenticationProvider` in JobRunr Pro. With `AnonymousAuthenticationProvider`, you can set authorization rules without user authentication. This offers you precise control over access to your JobRunr dashboard and REST API.