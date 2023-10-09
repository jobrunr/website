---
title: Basic Authentication
description: This guide will help you configure basic authentication and define authorization rules for each user to restrict access to your JobRunr dashboard.
tags:
    - Auth
    - JobRunr Pro
draft: true
---

[Basic authentication](https://en.wikipedia.org/wiki/Basic_access_authentication) is an HTTP standard used for access control. Basic authentication is already available to both JobRunr OSS and JobRunr Pro. In JobRunr Pro, the implementation has been improved to support multiple users as well as defining authorization rules for each user. In this guide, you will learn how to use `BasicAuthenticationProvider` to set the authorization rules for each allowed user.

> Note: do not use `BasicAuthenticationProvider` on dashboard publicly available on the internet as this authentication can be brute forced.

## Prerequisites
- JobRunr Pro 6.2.4
- You already know how to configure JobRunr

## What is a `BasicAuthenticationProvider`
`BasicAuthenticationProvider` handles requests and authenticates users using the basic authentication scheme. When configured, users will be prompted to provide their credentials, i.e., `username` and `password`. The credentials are validated before allowing access to the [Dashboard]({{< ref "/dashboard" >}} "Dashboard documentation") and the `REST API` backing it. This provider allows to define multiple users and their associated authorization rules.

You may use this provider if you're in a multi-user setting with different privileges. It's also handy for logging user activities. However, only use this authentication provider if your dashboard can only be accessed by trusted individuals.

## Defining users and their authorizations
We'll configure JobRunr to only allow John and Doe to access the dashboard. John will have all access, an admin level control, while Doe will be given `read only` access, and additionally `requeue` jobs. In this way, Doe can monitor the system and requeue certain jobs when needed.

```java
// ...

import org.jobrunr.dashboard.server.security.JobRunrUserAuthorizationRules;
import org.jobrunr.dashboard.server.security.JobRunrUserAuthorizationRulesBuilder;
import org.jobrunr.dashboard.server.security.basic.BasicAuthenticationProvider;
import org.jobrunr.dashboard.server.security.basic.BasicAuthenticationUser;

// ...

BasicAuthenticationUser john = new BasicAuthenticationUser(
    "john",
    "**************", 
    JobRunrUserAuthorizationRules.allowAll()
);
BasicAuthenticationUser doe = new BasicAuthenticationUser(
    "doe",
    "**************", 
    JobRunrUserAuthorizationRulesBuilder.readOnly().canEnqueueJobs(true).build()
);
JobRunrPro
        .configure()
        // ...
        .useDashboard(usingStandardDashboardConfiguration()
            // ...
            .andAuthentication(new BasicAuthenticationProvider(john, doe))
        )
        // ...
```

In the above code snippet, we imported different classes: `BasicAuthenticationProvider`, `BasicAuthenticationUser`, `JobRunrUserAuthorizationRules` and `JobRunrUserAuthorizationRulesBuilder`. We already know `BasicAuthenticationProvider` and pass its constructor our two users created using `BasicAuthenticationUser`. `BasicAuthenticationUser` has constructor that requires three parameters: `username`, `password` and `authorizationRules`. We assign to John all rights using the static method `allowAll` that creates a `JobRunrUserAuthorizationRules` with all authorization rules set to `true`. We assign to Doe `read only` and `enqueue` jobs access using `JobRunrUserAuthorizationRulesBuilder`.

Launching the application with this configuration, if Doe tries to perform an unauthorized action, i.e., trigger a recurring job, it will result in a `403`.