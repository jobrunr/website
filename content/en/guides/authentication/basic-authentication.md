---
title: Secure your JobRunr Dashboard with Basic Authentication
description: This guide will help you enhance the security of your JobRunr dashboard by setting up Basic Authentication. Control user access and authorization rules effectively.
tags:
    - Auth
    - JobRunr Pro
    - Spring Boot
    - Quarkus
    - Micronaut
draft: true
---

[Basic authentication](https://en.wikipedia.org/wiki/Basic_access_authentication) is an HTTP standard used for access control. Basic authentication is already available to both JobRunr OSS and JobRunr Pro. JobRunr Pro provides enhanced security by configuring the `BasicAuthenticationProvider`, allowing you to set up authorization rules for each user. In this guide, we'll show you how to leverage the `BasicAuthenticationProvider` to secure your dashboard with customized access control.

> Do not use `BasicAuthenticationProvider` on a dashboard that is publicly available on the internet as this authentication can be brute forced.

## Prerequisites
- JobRunr Pro 7.0.0 or later
- You already know how to configure JobRunr

## What is a `BasicAuthenticationProvider`
`BasicAuthenticationProvider` handles authentication requests using the basic authentication scheme. When configured, users will be prompted to provide their credentials, typically a `username` and `password`, before they can access the [JobRunr Pro Dashboard]({{< ref "/documentation/pro/jobrunr-pro-dashboard" >}} "Dashboard documentation") and its underlying `REST API`. This `AuthenticationProvider` enables you to define multiple users and establish specific authorization rules for each of them.

We may use this provider if we're in a multi-user setting where users have different privileges. It's also handy for logging user activities. However, we can only use this `AuthenticationProvider` if our dashboard can only be accessed within a secure environment (so not publicly available on the internet).

## Defining users and their authorizations
As an example, we'll configure JobRunr to only allow 'User A' and 'User B' to access the dashboard. User A will have all access, essentially making him an administrator, while User B will be given `read only` access, and additionally `requeue` jobs. In this way, User B can monitor the system and requeue certain jobs when needed.

{{< framework type="fluent-api" >}}
To make our JobRunr dashboard read-only, we need to modify our configuration as follows:

```java
// ...

import org.jobrunr.dashboard.server.security.JobRunrUserAuthorizationRules;
import org.jobrunr.dashboard.server.security.JobRunrUserAuthorizationRulesBuilder;
import org.jobrunr.dashboard.server.security.basic.BasicAuthenticationProvider;
import org.jobrunr.dashboard.server.security.basic.BasicAuthenticationUser;

// ...

BasicAuthenticationUser userA = new BasicAuthenticationUser("User A", "**************", JobRunrUserAuthorizationRules.allowAll());
BasicAuthenticationUser userB = new BasicAuthenticationUser("User B", "**************", JobRunrUserAuthorizationRulesBuilder.readOnly().canEnqueueJobs(true).build());

// ...

JobRunrPro
        .configure()
        // ...
        .useDashboard(usingStandardDashboardConfiguration()
            // ...
            .andAuthentication(new BasicAuthenticationProvider(userA, userB))
        )
        // ...
```
{{< /framework >}}
{{< framework type="spring-boot" label="Spring">}}
In Spring Boot, we can just create an `BasicAuthenticationProvider` Bean that will be automatically used by the `jobrunr-spring-boot-3-starter`:

```java
// ...

import org.jobrunr.dashboard.server.security.JobRunrUserAuthorizationRules;
import org.jobrunr.dashboard.server.security.JobRunrUserAuthorizationRulesBuilder;
import org.jobrunr.dashboard.server.security.basic.BasicAuthenticationProvider;
import org.jobrunr.dashboard.server.security.basic.BasicAuthenticationUser;

// ...

@Bean
public AuthenticationProvider authenticationProvider() {
    return new BasicAuthenticationProvider(
        new BasicAuthenticationUser("User A", "**************", JobRunrUserAuthorizationRules.allowAll()),
        new BasicAuthenticationUser("User B", "**************", JobRunrUserAuthorizationRulesBuilder.readOnly().canEnqueueJobs(true).build())
    );
}
```
{{< /framework >}}
{{< framework type="quarkus" label="Quarkus">}}
In Quarkus, we can just create a `BasicAuthenticationProvider` Bean that will be automatically used by the `quarkus-jobrunr` extension:

```java
// ...

import org.jobrunr.dashboard.server.security.JobRunrUserAuthorizationRules;
import org.jobrunr.dashboard.server.security.JobRunrUserAuthorizationRulesBuilder;
import org.jobrunr.dashboard.server.security.basic.BasicAuthenticationProvider;
import org.jobrunr.dashboard.server.security.basic.BasicAuthenticationUser;

// ...

@Produces
@Singleton
public AuthenticationProvider authenticationProvider() {
    return new BasicAuthenticationProvider(
        new BasicAuthenticationUser("User A", "**************", JobRunrUserAuthorizationRules.allowAll()),
        new BasicAuthenticationUser("User B", "**************", JobRunrUserAuthorizationRulesBuilder.readOnly().canEnqueueJobs(true).build())
    );
}
```
{{< /framework >}}
{{< framework type="micronaut" label="Micronaut">}}
In Micronaut, we can just create a `BasicAuthenticationProvider` Bean that will be automatically used by the `jobrunr-micronaut-feature`:

```java
// ...

import org.jobrunr.dashboard.server.security.JobRunrUserAuthorizationRules;
import org.jobrunr.dashboard.server.security.JobRunrUserAuthorizationRulesBuilder;
import org.jobrunr.dashboard.server.security.basic.BasicAuthenticationProvider;
import org.jobrunr.dashboard.server.security.basic.BasicAuthenticationUser;

// ...

@Singleton
public AuthenticationProvider authenticationProvider() {
    return new BasicAuthenticationProvider(
        new BasicAuthenticationUser("User A", "**************", JobRunrUserAuthorizationRules.allowAll()),
        new BasicAuthenticationUser("User B", "**************", JobRunrUserAuthorizationRulesBuilder.readOnly().canEnqueueJobs(true).build())
    );
}
```
{{< /framework >}}

In the code snippet above, we first import the necessary classes, including `BasicAuthenticationProvider`, `BasicAuthenticationUser`, `JobRunrUserAuthorizationRules`, and `JobRunrUserAuthorizationRulesBuilder`.

- `BasicAuthenticationProvider`: See the above section about *What is a BasicAuthenticationProvider*.
- `BasicAuthenticationUser`: The class for creating basic authentication users. Here, we use it to register User A and User B, each with a username, password, and authorization rules.
- `JobRunrUserAuthorizationRules.allowAll()`: This method is used to grant User A all access rights.
- `JobRunrUserAuthorizationRulesBuilder.canRead().canEnqueueJobs().build()`: This defines User B access rights, allowing him to read but also enqueue jobs.

By configuring your `BasicAuthenticationProvider` in this way, you can control who can access the JobRunr dashboard and what actions they are permitted to take. For example, if User B attempts an unauthorized action, such as triggering a recurring job, it will result in an `HTTP Forbidden (403)` error.

## Limitations

While configuring Basic Authentication with JobRunr Pro offers enhanced security for your dashboard, it's essential to be aware of its limitations and potential security risks. Here are a few important points to consider:

- **Restart required for user updates**: Changes to to user credentials or privileges take effect after your JobRunr instance is restarted. This may lead to brief downtime or disruption in background job processing if not carefully planned.
- **Clear text passwords**: In this configuration, passwords are provided and stored in clear text within your code. They can of course be passed as environment variables.
- **Vulnerable to brute force**: Basic authentication allows an *unlimited number of attempts*. Attackers may attempt to brute force passwords, thus the importance to keep the dashboard confidential.

## Conclusion

Using `BasicAuthenticationProvider` in JobRunr Pro offers a simple way to control access to your dashboard in a multi-user setting. This guide has equipped you with the knowledge needed to set up user access and authorization rules, enhancing the security of your dashboard.

While Basic Authentication is a valuable security feature, it's important to be aware of certain limitations, such as the need to restart the JobRunr instance to update users, the storage of passwords in clear and the vulnerability to brute forcing. Those are important considerations to keep in mind.