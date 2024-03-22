---
title: Secure your JobRunr Dashboard with Anonymous Authentication
description: This guide will help you restrict access to your JobRunr dashboard using an anonymous authentication. Easily and quickly define authorization rules.  
weight: 5
tags:
    - Auth
    - JobRunr Pro
    - Spring Boot
    - Quarkus
    - Micronaut
draft: true
---
JobRunr Pro allows to define a set of rules to restrict the access to the [JobRunr Pro Dashboard]({{< ref "/documentation/pro/jobrunr-pro-dashboard" >}} "Dashboard documentation") and its underlying `REST API`. In this guide, you will learn how to utilize the `AnonymousAuthenticationProvider` to implement authorization rules without the need for user authentication.

## Prerequisites
- JobRunr Pro 7.0.0 or later
- You already know how to configure JobRunr

## What is an `AnonymousAuthenticationProvider`
The `AnonymousAuthenticationProvider` is a simple authentication provider that allows you to specify authorization rules that are checked whenever we visit the dashboard and for all access to the REST API endpoints. This provider is primarily used for backward compatibility, as the previous behavior granted unrestricted access to all users, whether authenticated or not.

You may use this authentication provider to easily restrict access to specific resources. A good use-case is when your dashboard is only accessible in your internal network but you want to only enable read access in the dashboard and thus prohibiting the possibility to requeue or delete jobs, pause or trigger recurring jobs, etc.

## Setting authorization rules using `AnonymousAuthenticationProvider`
JobRunr Pro's default setting is an `AnonymousAuthenticationProvider` with `allowAll` authorization rules. If this aligns with your requirements, no further action is needed.

In this guide, we will provide two examples:
1. Only allow `read-only` access to the dashboard.
2. Only allow viewing and controlling recurring jobs (e.g., `pause`, `resume`, `trigger`, and `edit schedule expressions`).

### 1. Making the dashboard read-only
{{< framework type="fluent-api" >}}
To make our JobRunr dashboard read-only, we need to modify our configuration as follows:

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
{{< /framework >}}
{{< framework type="spring-boot" label="Spring">}}
In Spring Boot, we can just create an `AnonymousAuthenticationProvider` Bean that will be automatically used by the `jobrunr-spring-boot-3-starter`:

```java
@Bean
public AuthenticationProvider authenticationProvider() {
    return new AnonymousAuthenticationProvider(readOnly());
}
```
{{< /framework >}}
{{< framework type="quarkus" label="Quarkus">}}
In Quarkus, we can just create an `AnonymousAuthenticationProvider` Bean that will be automatically used by the `quarkus-jobrunr` extension:

```java
@Produces
@Singleton
public AuthenticationProvider authenticationProvider() {
    return new AnonymousAuthenticationProvider(readOnly());
}
```
{{< /framework >}}
{{< framework type="micronaut" label="Micronaut">}}
In Micronaut, we can just create an `AnonymousAuthenticationProvider` Bean that will be automatically used by the `jobrunr-micronaut-feature`:

```java
@Singleton
public AuthenticationProvider authenticationProvider() {
    return new AnonymousAuthenticationProvider(readOnly());
}
```
{{< /framework >}}

In the code snippet above, we imported the `AnonymousAuthenticationProvider` class and the static `readOnly` method from `JobRunrUserAuthorizationRules` to set the authorization rules of the authentication provider. Launching the application with this configuration will result in a `HTTP Forbidden (403)` for any access to endpoints that change the state of jobs, recurring jobs, or servers.

### 2. Only allow viewing and controlling of recurring jobs
JobRunr allows more flexible authorization rules configurations. In this example, we'll configure the JobRunr Dashboard to only allow `read`, `pause`, `resume`, `trigger` and `edit` of recurring jobs. 

> This essentially forbids access to any other resources, including deleting recurring jobs!

{{< framework type="fluent-api" >}}
To only viewing and controlling recurring jobs tab inside the JobRunr dashboard, we need to modify our configuration as follows:

```java
// ...
import org.jobrunr.dashboard.server.security.AnonymousAuthenticationProvider;
import static org.jobrunr.dashboard.server.security.JobRunrUserAuthorizationRules.denyAll;
// ...
JobRunrPro
        .configure()
        // ...
        .useDashboard(usingStandardDashboardConfiguration()
            // ...
            .andAuthentication(new AnonymousAuthenticationProvider(denyAll()
                .canAccessRecurringJobs(true)
                .canControlRecurringJobs(true)
                .build()))
        )
        // ...
```
{{< /framework >}}
{{< framework type="spring-boot" label="Spring">}}
In Spring Boot, we can again just create an `AnonymousAuthenticationProvider` Bean and pass the correct `JobRunrUserAuthorizationRules` which will then be automatically used by the `jobrunr-spring-boot-3-starter`:

```java
@Bean
public AuthenticationProvider authenticationProvider() {
    return new AnonymousAuthenticationProvider(denyAll()
                .canAccessRecurringJobs(true)
                .canControlRecurringJobs(true)
                .build());
}
```
{{< /framework >}}
{{< framework type="quarkus" label="Quarkus">}}
In Quarkus, we can again just create an `AnonymousAuthenticationProvider` Bean and pass the correct `JobRunrUserAuthorizationRules` which will then be automatically used by the `quarkus-jobrunr` extension:

```java
@Produces
@Singleton
public AuthenticationProvider authenticationProvider() {
    return new AnonymousAuthenticationProvider(denyAll()
                .canAccessRecurringJobs(true)
                .canControlRecurringJobs(true)
                .build());
}
```
{{< /framework >}}
{{< framework type="micronaut" label="Micronaut">}}
In Micronaut, we can just create an `AnonymousAuthenticationProvider` Bean and pass the correct `JobRunrUserAuthorizationRules` which will then be automatically used by the `jobrunr-micronaut-feature`:

```java
@Singleton
public AuthenticationProvider authenticationProvider() {
    return new AnonymousAuthenticationProvider(denyAll()
                .canAccessRecurringJobs(true)
                .canControlRecurringJobs(true)
                .build());
}
```
{{< /framework >}}

In the code snippet above, we imported the `AnonymousAuthenticationProvider` class and the `denyAll` method from `JobRunrUserAuthorizationRulesBuilder` to set the desired rules for accessing and controlling recurring jobs. Launching the dashboard with this configuration will restrict access to any other resources besides those explicitly enabled.

> If `canAccessRecurringJobs` is set to `false` the recurring jobs page will no longer be accessible, you'll need to use tools such as `curl` to perform changes to the recurring jobs.

## Limitations

It's important to be aware of a limitation when using Anonymous Authentication with JobRunr Pro. The setup discussed in this guide requires that the JobRunr instance be restarted to update the authorization rules. This means that if you need to modify or fine-tune the access control rules, you will need to restart your JobRunr application.

## Conclusion

In this guide, we've learned how to use `AnonymousAuthenticationProvider` in JobRunr Pro. With `AnonymousAuthenticationProvider`, you can set authorization rules without user authentication. This offers you precise control on how any user can access your JobRunr dashboard and REST API.