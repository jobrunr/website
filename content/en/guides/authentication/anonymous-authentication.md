---
title: Anonymous Authentication
description: This guide will help you easily restrict access to your JobRunr dashboard using an anonymous authentication provider.
tags:
    - Auth
    - JobRunr Pro
draft: true
---
JobRunr Pro allows to define a set of rules to restrict the access to the [Dashboard]({{< ref "/dashboard" >}} "Dashboard documentation") and the `REST API` backing it. In this guide, you will learn how to use `AnonymousAuthenticationProvider` to set authorization rules without the need for defining users.

## Prerequisites
- JobRunr Pro 6.2.4
- You already know how to configure JobRunr

## What is an `AnonymousAuthenticationProvider`
We created a simple authentication provider that defines a `null` user but allows to define authorization rules that are checked for every access to the endpoint of `REST API`. The provider is named `AnonymousAuthenticationProvider`. We use it internally for backward compatibility, indeed the previous behavior gives unrestricted access to any user (authenticated or not).

You may use this authentication provider to easily restrict access to certain resources. For instance, your dashboard is only accessible by trusted individuals but you want to forbid read access to jobs for confidentiality reasons. Or your dashboard is publicly available in which case you probably want to forbid updates (e.g., requeue or delete jobs, pause or trigger recurring jobs, etc.).

## Setting authorization rules using `AnonymousAuthenticationProvider`
When no authentication provider is configured, JobRunr sets all authorization rules to `true`. If what you desire, you don't need to make further changes.

> Note: you can also deny all access using `AnonymousAuthenticationProvider` but this only makes sense for a multi-user setting. Instead you should disable the dashboard.

Next, we'll configure JobRunr
1. to only allow read access,
2. and to only allow viewing and controlling recurring jobs, i.e., `pause`, `resume`, `trigger`, and `edit schedule expression`.

### Making the dashboard read only
To make your JobRunr dashboard read only, modify your configuration as follows: 

> This configuration is only suitable when your jobs do not expose confidential data.

```java
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
```

In the above code snippet, we imported the `AnonymousAuthenticationProvider` class and the static method `readOnly` from `JobRunrUserAuthorizationRules`. The method is used to obtain an instance `JobRunrUserAuthorizationRules` where only read access rules are set to `true`. We use this instance to set the authorization rules of the authentication provider.

Launching the application with this configuration, any access to an endpoint that changes the state of `jobs`, `recurring jobs` or `servers` will result in a `403`.

### Allowing to view and control recurring jobs
JobRunr allows for more flexible authorization rules configurations. Here, we'll configure the application to only allow `read`, `pause`, `resume`, `trigger` and `edit` of recurring jobs. 

> This essentially forbids access to any other resources, including deleting recurring jobs! But should only be used if the dashboard is not publicly accessible.

```java
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
```

In the above code snippet, we imported the `AnonymousAuthenticationProvider` class and the static method `denyAll` from `JobRunrUserAuthorizationRulesBuilder`. We use this method to create a builder of `JobRunrUserAuthorizationRules` where all rules are initially `false`. Then, we set the desired rules (`canAccessRecurringJobs`, i.e., `read` and `canControlRecurringJobs`, i.e. `pause`, `resume`, `trigger` and `edit`) to `true`.

> If `canAccessRecurringJobs` is set to `false` the recurring jobs page will no longer be accessible, you'll need to use tools such as `curl` to perform changes to the recurring jobs.

Launching the application with this configuration, any access to an endpoint that does anything besides the enabled authorizations will result in a `403`.
