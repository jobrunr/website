---
title: Secure your JobRunr Dashboard with Anonymous Authentication
description: This guide will help you restrict access to your JobRunr dashboard using an anonymous authentication. Easily and quickly define authorization rules.  
tags:
    - Auth
    - JobRunr Pro
draft: true
---
JobRunr Pro allows to define a set of rules to restrict the access to the [Dashboard]({{< ref "/dashboard" >}} "Dashboard documentation") and its underlying `REST API`. In this guide, you will learn how to utilize the `AnonymousAuthenticationProvider` to implement authorization rules without the need for user authentication.

## Prerequisites
- JobRunr Pro 6.2.4 or later
- You already know how to configure JobRunr

## What is an `AnonymousAuthenticationProvider`
The `AnonymousAuthenticationProvider` is a simple authentication provider that defines a `null` user but allows you to specify authorization rules that are checked for every access to the REST API endpoints. This provider is primarily used for backward compatibility, as the previous behavior granted unrestricted access to all users, whether authenticated or not.

You may use this authentication provider to easily restrict access to specific resources. A good use-case is when your dashboard is only accessible by trusted users but you want to restrict read access to jobs for confidentiality reasons. It could also be that your dashboard is publicly available in which case you probably want to forbid updates (e.g., requeue or delete jobs, pause or trigger recurring jobs, etc.).

## Setting authorization rules using `AnonymousAuthenticationProvider`
JobRunr Pro's default setting is an `AnonymousAuthenticationProvider` with `allowAll` authorization rules. If this aligns with your requirements, no further action is needed.

> Note: you can also `denyAll` access using `AnonymousAuthenticationProvider` but this is typically more suitable for a multi-user setting. Instead you should disable the dashboard.

Now, let's configure JobRunr to:

1. Allow `read-only` access to the dashboard.
2. Allow viewing and controlling recurring jobs (e.g., `pause`, `resume`, `trigger`, and `edit schedule expressions`).

### Making the dashboard read-only
To make your JobRunr dashboard read-only, modify your configuration as follows:

> This configuration is only suitable when your jobs do not expose confidential data.

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