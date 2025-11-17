---
version: "enterprise"
title: "Single Sign On"
subtitle: "JobRunr Pro's dashboard integrates seamlessly with OpenID"
date: 2025-10-10T10:00:00+02:00
layout: "documentation"
menu: 
  sidebar:
    identifier: single-sign-on-authentication
    parent: 'jobrunr-pro'
    weight: 61
---

{{< trial-button >}}

JobRunr Pro Enterprise comes with out-of-the-box Single Sign On (SSO) support and adds the possibility to protect the dashboard from prying eyes. Using the OpenId Connect Integration, you can decide which users have access and has fine grained authorization rules that be sued for role based access control, e.g., readOnly, allowAll, ...

Please consult our [Secure your JobRunr Dashboard with your OpenID Provider](/en/guides/authentication/openid-authentication/) guide to get started with JobRunr Pro and your OpenID provider of choice.

## Configuration

The following settings can be used to configure JobRunr:

- **Configuration URL**---the OpenID configuration URL; e.g. `http://localhost:8080/realms/master/.well-known/openid-configuration`
- **Client ID**---the clientId that is configured in your OpenID Authorization server
- **Client Secret**---the client secret that is configured in your OpenID Authorization server
- **Scope**---the optional scope; if `null` the default `"openid email profile"` will be used
- **Accepted Audience**---the optional JWT audience claim passed into the OID provider (being mapped to a `Set<String>` there can be multiple audiences provided)

In addition of the JobRunr configuration settings, be sure to configure your OpenID provider to redirect back to the JobRunr Pro dashboard after logging in (see below).

### Using a framework

Add properties to your framework configuration:

```
jobrunr.dashboard.enabled=true
jobrunr.dashboard.openid-authentication.openid-configuration-url="your-well-known-openid-configuration-url"
jobrunr.dashboard.openid-authentication.client-id="client-id"
jobrunr.dashboard.openid-authentication.client-secret="client-secret"
jobrunr.dashboard.openid-authentication.scope="scope" # if null, the default "openid email profile" is used
jobrunr.dashboard.openid-authentication.accepted-audience="my-app" # optional but recommended, if provided, the claims must be issued to at least one of the accepted audience
````

> **Quarkus**: You'll need to prefix the properties with `quarkus.`, e.g., `quarkus.jobrunr.dashboard.openid-authentication.client-id="client-id"` and replace `jobrunr.dashboard.enabled=true` by `quarkus.jobrunr.dashboard.included=true`

### Using the Fluent API

Inject an instance of a configured `OpenIdConnectSettings` object into the dashboard configuration:

```java
OpenIdConnectSettings openIdConnectSettings = new OpenIdConnectSettings(
    "your-well-known-openid-configuration-url",
    "client-id",
    "client-secret",
    "scope",
    Set.of("acceptedAudience")
);

JobRunrPro
        .configure()
        // ...
        .useDashboard(usingStandardDashboardConfiguration()
            // ...
            .andAuthentication(new OpenIdConnectAuthenticationProvider(openIdConnectSettings))
        )
```

## OpenID Connect endpoints

JobRunr Pro exposes a callback URI for OpenID to redirect to: `/oidc/auth_callback`. Set the redirect URI in your OpenID provider to this endpoint to return to the JobRunr dashboard after a successful login. 

In addition, you an logout by visiting `/oidc/logout`. This will logout the user and revoke any active tokens by redirecting to the logout endpoint of the OpenID provider based on the OpenID `configuration-url`. 

## Mapping claims to JobRunr authorization rules

By default, JobRunr gives authenticated users the rights to perform any available action on the dashboard. They can view jobs and server statuses, as well as trigger or delete jobs, and pause, or resume servers. You can restrict specific user actions (e.g. only viewing, not deleting, ...) by mapping claims to JobRunr-specific roles.

See [the OpenID Authentication guide](/en/guides/authentication/openid-authentication/#mapping-claims-to-jobrunr-authorization-rules) on how to implement a custom `JobRunrUserProvider` to realize these restrictions.

