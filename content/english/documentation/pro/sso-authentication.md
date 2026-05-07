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

JobRunr Pro Enterprise comes with out-of-the-box Single Sign On (SSO) support and adds the possibility to protect the dashboard from prying eyes. Using the OpenId Connect Integration, you can decide which users have access and has fine grained authorization rules that be used for role based access control, e.g., readOnly, allowAll, ...

Please consult our [Secure your JobRunr Dashboard with your OpenID Provider](/en/guides/authentication/openid-authentication/) guide to get started with JobRunr Pro and your OpenID provider of choice.

## Configuration

The following settings can be used to configure JobRunr:

- **Configuration URL**---the OpenID configuration URL; e.g. `http://localhost:8080/realms/master/.well-known/openid-configuration`
- **Client ID**---the clientId that is configured in your OpenID Authorization server
- **Client Secret**---the client secret that is configured in your OpenID Authorization server
- **Scope**---the optional scope; if `null` the default `"openid email profile"` will be used
- **Accepted Audience**---the optional JWT audience claim passed into the OID provider (being mapped to a `Set<String>` there can be multiple audiences provided)
- **Authentication Mode**---the optional configuration for which authentication mode you want to use, by default this is `CLIENT_SECRET`, you can also configure this to be `PKCE`

In addition to the JobRunr configuration settings, be sure to configure your OpenID provider to redirect back to the JobRunr Pro dashboard after logging in (see below).

### Using a framework

Add properties to your framework configuration:

```
jobrunr.dashboard.enabled=true
jobrunr.dashboard.openid-authentication.openid-configuration-url="your-well-known-openid-configuration-url"
jobrunr.dashboard.openid-authentication.client-id="client-id"
jobrunr.dashboard.openid-authentication.client-secret="client-secret"
jobrunr.dashboard.openid-authentication.scope="scope" # if null, the default "openid email profile" is used
jobrunr.dashboard.openid-authentication.accepted-audience="my-app" # optional but recommended, if provided, the claims must be issued to at least one of the accepted audience
jobrunr.dashboard.openid-authentication.openid-client-authentication-mode="CLIENT_SECRET" # optional, if provided, configures the authentication mode, default value is CLIENT_SECRET
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

## Using PKCE for authentication for public client
Starting in JobRunr Pro v8.6.0 you can use PKCE as an authentication mode for your application instead of client_secret.

To configure JobRunr to use PKCE as an authentication method you have to configure the `jobrunr.dashboard.openid-authentication.openid-client-authentication-mode` property
to have the value `PKCE`. You do not have to provide a client secret to work with PKCE, when configured for PKCE JobRunr accepts a null value for this.

If you are providing us with an instance of `OpenIdConnectSettings` then you will have to specify it as follows (you can also still add the accepted audience when creating the `OpenIdConnectSettings`):
```java
OpenIdConnectSettings openIdConnectSettings = new OpenIdConnectSettings(
    "your-well-known-openid-configuration-url",
    "client-id",
    null,
    "scope",
    OpenIdClientAuthenticationMode.PKCE
);
```

Make sure to also configure your identity provider to be set up for PKCE connections. The necessary configurations vary per provider.

## OpenId Connect Providers

Here you can find relevant information to setup your OpenId Connect Provider.

### Microsoft Azure Entra OpenId
To use Microsoft Azure Entra OpenId, there are some special settings that need to configured:
- When registering JobRunr as an application for Entra, select `Web` for platform type and use the following redirect URI: `https://<your-jobrunr-dashboard-hostname>/oidc/auth_callback`
- Under Certificates and Secrets, on the Client Secrets tab, create a new Client Secret and be sure to copy the secret value for later
- To make sure Microsoft Azure Entra OpenId provides valid OpenID tokens, we need to expose an API. To do so, go to the Expose an API page and add a scope called `access_as_user`.
- Next, we need the connect the created to scope to an authorized client application. On the Expose an API page, add a client application where you connect the client id and the authorized scope. The authorized scope will have the form of `api://<client-id>/access_as_user`
- We now need to configure the API permissions. Navigate to the API permissions page and add the `openid`, `email` and `User.Read` permissions.
- Last but not least, we must make sure Azure returns AccessTokens with the v2 format. On the Manifest page, on the tab 'Microsoft Graph App Manifest (New)' search for `requestedAccessTokenVersion` and set it to 2.
- In your JobRunr OpenId settings, you now need to configure the following settings:

<figure>

```properties
jobrunr.dashboard.openid-authentication.openid-configuration-url=<azure-entra-openid-configuration-endpoint> # available on Entra Overview Page under endpoints
jobrunr.dashboard.openid-authentication.client-id=<client-id>
jobrunr.dashboard.openid-authentication.client-secret=<client-secret> # the client-secret from step 2
jobrunr.dashboard.openid-authentication.scope=openid api://<client-id>/access_as_user
```
</figure>

##### References:
- [How do I configure Microsoft Azure Entra for JobRunr Pro OpenId integration](https://github.com/jobrunr/jobrunr-pro/discussions/830)
- [Making Azure AD OIDC Compliant](https://xsreality.medium.com/making-azure-ad-oidc-compliant-5734b70c43ff)
