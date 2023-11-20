---
title: Secure your JobRunr Dashboard with Basic Authentication
description: This guide will help you enhance the security of your JobRunr dashboard by setting up Basic Authentication. Control user access and authorization rules effectively.
tags:
    - Auth
    - JobRunr Pro
draft: true
---

[Basic authentication](https://en.wikipedia.org/wiki/Basic_access_authentication) is an HTTP standard used for access control. Basic authentication is already available to both JobRunr OSS and JobRunr Pro. JobRunr Pro provides enhanced security by configuring the `BasicAuthenticationProvider`, allowing you to set up authorization rules for each user. In this guide, we'll show you how to leverage the `BasicAuthenticationProvider` to secure your dashboard with customized access control.

> Do not use `BasicAuthenticationProvider` on dashboard publicly available on the internet as this authentication can be brute forced.

## Prerequisites
- JobRunr Pro 6.2.4 or later
- You already know how to configure JobRunr

## What is a `BasicAuthenticationProvider`
`BasicAuthenticationProvider` handles authentication requests using the basic authentication scheme. When configured, users will be prompted to provide their credentials, typically a `username` and `password`, before they can access the [JobRunr Pro Dashboard]({{< ref "/documentation/pro/jobrunr-pro-dashboard" >}} "Dashboard documentation") and its underlying `REST API`. This provider enables you to define multiple users and establish specific authorization rules for each of them.

You may use this provider if you're in a multi-user setting with different privileges. It's also handy for logging user activities. However, only use this authentication provider if your dashboard can only be accessed by trusted individuals.

## Defining users and their authorizations
As an example, we'll configure JobRunr to only allow John and Doe to access the dashboard. John will have all access, essentially making him an administrator., while Doe will be given `read only` access, and additionally `requeue` jobs. In this way, Doe can monitor the system and requeue certain jobs when needed.

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

In the code snippet above, we first import the necessary classes, including `BasicAuthenticationProvider`, `BasicAuthenticationUser`, `JobRunrUserAuthorizationRules`, and `JobRunrUserAuthorizationRulesBuilder`.

- `BasicAuthenticationProvider`: See above section *What is a BasicAuthenticationProvider*.
- `BasicAuthenticationUser`: The class for creating basic authentication users. Here, we use it to register John and Doe, each with a username, password, and authorization rules.
- `JobRunrUserAuthorizationRules.allowAll()`: This method is used to grant John all access rights.
- `JobRunrUserAuthorizationRulesBuilder.canRead().canEnqueueJobs().build()`: This defines Doe's access, allowing her to read but also enqueue jobs.

By configuring your `BasicAuthenticationProvider` in this way, you can control who can access the JobRunr dashboard and what actions they are permitted to take. For example, if Doe attempts an unauthorized action, such as triggering a recurring job, it will result in a `403` error.

## Limitations

While configuring Basic Authentication with JobRunr Pro offers enhanced security for your dashboard, it's essential to be aware of its limitations and potential security risks. Here are a few important points to consider:

- **Restart required for user updates**: Changes to to user credentials or privileges take effect after your JobRunr instance is restarted. This may lead to brief downtime or disruption in background job processing if not carefully planned.
- **Clear text passwords**: In this configuration, passwords are provided and stored in clear text.
- **Vulnerable to brute force**: Basic authentication allows an *unlimited number of attempts*. Attackers may attempt to brute force passwords, thus the importance to keep the dashboard confidential.

## Conclusion

Using `BasicAuthenticationProvider` in JobRunr Pro offers a simple way to control access to your dashboard in a multi-user setting. This guide has equipped you with the knowledge needed to set up user access and authorization rules, enhancing the security of your dashboard.

While Basic Authentication is a valuable security feature, it's important to be aware of certain limitations, such as the need to restart the JobRunr instance to update users, the storage of passwords in clear and the vulnerability to brute forcing. Those are important considerations to keep in mind.