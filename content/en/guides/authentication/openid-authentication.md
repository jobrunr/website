---
title: Secure your JobRunr Dashboard with your OpenID Provider   
description: This guide will help you enhance the security of your JobRunr dashboard by setting up an OpenID authentication provider. Perfect for enterprise grade access control.
weight: 15
tags:
    - Auth
    - JobRunr Pro
    - Spring Boot
    - Quarkus
    - Micronaut
draft: true
---
[OpenID Connect](https://openid.net/developers/how-connect-works/) (OIDC) is an authentication protocol that allows to verify the identity of users and obtain their profile information. JobRunr Pro allows you to use your existing OpenID Provider to secure your [JobRunr Pro Dashboard]({{< ref "/documentation/pro/jobrunr-pro-dashboard" >}} "Dashboard documentation") and its underlying `REST API` by using `OpenIdConnectAuthenticationProvider`. This authentication provider is perfect for enterprise grade access control.

In this guide, we’ll start by configuring JobRunr to use an OpenID Provider, with [Keycloak](https://www.keycloak.org/) serving as our identity provider. We’ll then map OpenID claims to JobRunr authorization rules, enabling fine-grained, user-specific access control.

> The setup may not go as smoothly as in this guide, because some providers may not be fully OpenID Connect compliant. We'll get back to this issue and provide some guidance on how to overcome these difficulties.

## Prerequisites
- JobRunr Pro Enterprise 7.0.0 or later
- You already know how to configure JobRunr
- Basic knowledge about OAuth 2.0 and OpenID Connect.
- You have Keycloak up and running

> JobRunr Dashboard has been tested with the following identity providers: 
> - [Keycloak](https://www.keycloak.org/)
> - [Okta](https://www.okta.com/) / [Auth0](https://auth0.com/)
> - [Microsoft Entra ID](https://www.microsoft.com/en-us/security/business/microsoft-entra) ([requires extra configuration to be OIDC compliant](https://xsreality.medium.com/making-azure-ad-oidc-compliant-5734b70c43ff)). 
> - [Google OIDC](https://cloud.google.com/security/products/identity-platform?hl=en) (uses opaque tokens)
> - [Spring Authorization Server](https://spring.io/projects/spring-authorization-server)
> - [Ping Identity](https://www.pingidentity.com/en.html)

## What is OpenID Connect
OpenID Connect provides a robust and standardized way to verify user identities. By leveraging OpenID, users can log into the JobRunr Dashboard using their existing credentials from a trusted OpenID provider, eliminating the need to manage multiple usernames and passwords. This enhances user convenience while significantly reducing the risk of password-related security breaches.

Moreover, OpenID providers typically support advanced security features such as multi-factor authentication, further strengthening the login process. For developers, integrating OpenID simplifies the authentication flow by providing a consistent protocol for secure logins across multiple identity providers. This makes OpenID Connect an ideal solution for securing the JobRunr Dashboard, delivering both strong security and a enhanced user experience.

## Enabling OpenID Authentication and Authorization in JobRunr

As we’ll see in this section, enabling the OpenID integration to secure the dashboard is quite simple. The process usually consists of three simple steps.
- [Adding the OpenID integration dependency]({{< ref "#add-the-openid-dependency" >}}),
- [Configuring the OpenID authentication provider]({{< ref "#configuring-the-openid-integration" >}}),
- [And, optionally, converting the claims to authorization rules]({{< ref "#configuring-openid-authorization-in-jobrunr" >}}).

We assume you have an OpenID Provider up and running. If this is not the case and you do want to follow this guide, for our testing purposes, we use [Keycloak, an open source identity management tool](https://www.keycloak.org/). You can quickly set up a Keycloak server by following the [_Get started with Keycloak on Docker_](https://www.keycloak.org/getting-started/getting-started-docker) guide.

### Add the OpenId dependency
First, we need to add the additional dependency to add the OpenID capability inside the dashboard. To do so, you must add the following dependency to your `pom.xml`

{{< codeblock >}}
```xml
<dependency>
    <groupId>org.jobrunr</groupId>
    <artifactId>jobrunr-pro-dashboard-authentication-openid</artifactId>
    <version>{{< param "JobRunrVersion" >}}</version>
</dependency>
```
{{</ codeblock >}}

> **Important**: before downloading this artifact, please make sure you've a JobRunr Pro Enterprise subscription or a deal that includes the use of OpenID authentication integration.

### Configuring the OpenId integration
Next, we need to enable and configure OpenID authentication in the dashboard.
{{< framework type="fluent-api" >}}
To make our JobRunr dashboard use OpenID, we will need to:

```java
// ...

import org.jobrunr.dashboard.server.security.openidconnect.OpenIdConnectAuthenticationProvider;
import org.jobrunr.dashboard.server.security.openidconnect.OpenIdConnectSettings;

// ...

OpenIdConnectSettings openIdConnectSettings = new OpenIdConnectSettings(
    "your-well-known-openid-configuration-url", // you know, your well known openId configuration URL 😉
    "client-id", // the client id 🤔
    "client-secret", // the client secret 🤯
    "scope" // if null, the default "openid email profile" is used
);

JobRunrPro
        .configure()
        // ...
        .useDashboard(usingStandardDashboardConfiguration()
            // ...
            .andAuthentication(new OpenIdConnectAuthenticationProvider(openIdConnectSettings))
        )
        // ...
```
{{< /framework >}}
{{< framework type="spring-boot" label="Spring">}}
In Spring Boot, we just need to configure some properties in the `application.properties` to enable OpenID integration:

```java
org.jobrunr.dashboard.enabled=true
org.jobrunr.dashboard.port=9000
org.jobrunr.dashboard.openid-authentication.openid-configuration-url="your-well-known-openid-configuration-url"
org.jobrunr.dashboard.openid-authentication.client-id="client-id"
org.jobrunr.dashboard.openid-authentication.client-secret="client-secret"
org.jobrunr.dashboard.openid-authentication.scope="scope" // optional, defaults to "openid email profile" 
```
{{< /framework >}}
{{< framework type="quarkus" label="Quarkus">}}
In Quarkus, we just need to configure some properties in the `application.properties` to enable OpenID integration:

```java
quarkus.jobrunr.dashboard.enabled=true
quarkus.jobrunr.dashboard.port=9000
quarkus.jobrunr.dashboard.openid-authentication.openid-configuration-url="your-well-known-openid-configuration-url"
quarkus.jobrunr.dashboard.openid-authentication.client-id="client-id"
quarkus.jobrunr.dashboard.openid-authentication.client-secret="client-secret"
quarkus.jobrunr.dashboard.openid-authentication.scope="scope" // optional, defaults to "openid email profile" 
```
{{< /framework >}}
{{< framework type="micronaut" label="Micronaut">}}
In Micronaut, we just need to configure some properties in the `application.yaml` to enable OpenID integration:

```yml
jobrunr:
  dashboard:
    enabled: true
    openid-authentication:
      openid-configuration-url: "your-well-known-openid-configuration-url"
      client-id: "client-id"
      client-secret: "client-secret"
      scope: "scope" // optional, defaults to "openid email profile" 
      
```
{{< /framework >}}

In the code snippet above, we configure all the necessary information to the JobRunr Dashboard to integrate with our `OpenIdConnectAuthenticationProvider`.

To set these values, please refer to the documentation of your OpenID identity provider. As an example, for Keycloak, we can create a realm named `jobrunr` and a client named `dashboard`. Giving the following configuration values to provide to JobRunr:
- Configuration URL: `http://localhost:9001/realms/jobrunr/.well-known/openid-configuration`
- Client ID: `dashboard`

> We omit the two other parameters. The `scope` because it's optional and in Keycloak, by default the `email` and `profile` are available under the `openid` scope. The `client secret` as it should remain confidential.

> **Important**: Don't forget to properly configure the redirect urls of the client (i.e., the url of the dashboard).

This configuration restricts access to the dashboard, preventing anonymous users from viewing or browsing the insights that JobRunr provides into the job processing system. Next, we'll see how to also restrict the actions of authenticated users based on the assigned roles by the OpenID authorization server.

### Mapping claims to JobRunr authorization rules
By default, JobRunr gives authenticated users the rights to perform any available action on the dashboard. They can view jobs and server statuses, as well as trigger or delete jobs, and pause, or resume servers.

You can restrict actions by mapping OpenID claims to `JobRunrUserAuthorizationRules`. This allows you to define which actions each user is allowed to perform on the dashboard. To do this, we're asked to create a `JobRunrUserProvider` for the `OpenIdConnectAuthenticationProvider`. The below examples show how to achieve this. First, we create a custom implementation of `JobRunrUserProvider`, then we enable by passing it to `OpenIdConnectAuthenticationProvider`.

#### Creating a custom JobRunrUserProvider

Authorization is often done role-based instead of per user. Thus, we will add the roles of `manager` and `developer` to our Keycloak `jobrunr` realm. These roles can be assigned to users, who are then mapped to authorization rules. We'll allow a `manager` to perform any available action. A `developer` may only perform read actions and can requeue jobs. Additionally, the company policy allows developers to upload the license via the dashboard.

This translates into the following code:
{{< codeblock >}}
```java
public class UserProvider extends JobRunrUserUsingJWTAccessTokenProvider {

    public enum UserRole {
        MANAGER,
        DEVELOPER;
    }

    public UserProvider(OpenIdConnectSettings openIdConnectSettings) {
        super(openIdConnectSettings);
    }

    @Override
    protected JobRunrUserAuthorizationRules authorizationRules(JWTClaimsSet claimsSet) {
        var roles = getRoles(claimsSet);
        if (roles.contains(UserRole.MANAGER.name().toLowerCase())) 
            return JobRunrUserAuthorizationRulesBuilder.allowAll().build();
        if (roles.contains(UserRole.DEVELOPER.name().toLowerCase())) 
            return JobRunrUserAuthorizationRulesBuilder.readOnly().canEnqueueJobs(true).canUploadLicense(true).build();
        return JobRunrUserAuthorizationRulesBuilder.denyAll().build();
    }

    private List<String> getRoles(JWTClaimsSet claimsSet) {
        try {
            return ReflectionUtils.cast(claimsSet.getJSONObjectClaim("realm_access").get("roles"));
        } catch (ParseException e) {
            return List.of();
        }
    }
}
```
{{< /codeblock >}}

In the above code snippet, we extend the `JobRunrUserUsingJWTAccessTokenProvider` which already parses the access token and construct a `JobRunrUser` out of the claims. It's the default `JobRunrUserProvider`. And, by default, it allows the authenticated user to perform all available actions. So we need to override the `authorizationRules` method to implement our own logic.

From the claims, we get the roles and map them to `JobRunrUserAuthorizationRules` using the associated builder `JobRunrUserAuthorizationRulesBuilder`. Managers are given every rights while developers can read, requeue jobs and upload license keys. Users without one of the two roles is simply denied access to the dashboard.

> This code serves as an example and works for Keycloak, but keep in mind that the format of the claims may differ for other identity providers. You may also use more of the claim to shape the enabled rules, for instance, its good practice to check 

JobRunr provides three builtin implementations of `JobRunrUserProvider`.
- `JobRunrUserUsingJWTAccessTokenProvider`
- `JobRunrUserUsingUserInfoEndpointProvider`
- `JobRunrUserUsingJWTAccessTokenAndUserInfoEndpointProvider`

Using these, you can override the method called `authorizationRules(...)` as we have done above. These specialized classes allow either to map a `JWTClaimsSet`, a `UserInfo` or both to `JobRunrUserAuthorizationRules`. Please refer to the javadoc of the classes for more details.

> By default, each of these classes allow unrestricted access to the dashboard. Additionally, they use the `sub` (subject) as identifier of the user and `email` as the username. If it's important that each user is properly identifiable, e.g., for auditing purposes, make sure those fields are available on the claims or user-info.

#### Enabling the custom JobRunrUserProvider

The last step is to make `OpenIdConnectAuthenticationProvider` aware of our custom implementation of `JobRunrUserProvider`.
{{< framework type="fluent-api" >}}
Let's extend the early authentication configuration to provide an instance of `UserProvider` to the `OpenIdConnectAuthenticationProvider`.

```java
OpenIdConnectSettings openIdConnectSettings = new OpenIdConnectSettings(
    "http://localhost:9001/realms/jobrunr/.well-known/openid-configuration",
    "dashboard", "client-secret", null
);

JobRunrPro
        .configure()
        // ...
        .useDashboard(usingStandardDashboardConfiguration()
            // ...
            .andAuthentication(new OpenIdConnectAuthenticationProvider(openIdConnectSettings, new UserProvider(openIdConnectSettings)))
        )
        // ...
```
{{< /framework >}}
{{< framework type="spring-boot" label="Spring">}}
In Spring Boot, we simply define a `Bean`, and the framework automatically handles dependency injection.

```java
@Bean
public JobRunrUserProvider jobRunrUserProvider(OpenIdConnectSettings openIdConnectSettings) {
    return new UserProvider(openIdConnectSettings);
}
```
{{< /framework >}}
{{< framework type="quarkus" label="Quarkus">}}
In Quarkus, we simply define a `Bean`, and the framework automatically handles dependency injection.

```java
@Produces
@Singleton
public JobRunrUserProvider jobRunrUserProvider(OpenIdConnectSettings openIdConnectSettings) {
    return new UserProvider(openIdConnectSettings);
}
```
{{< /framework >}}
{{< framework type="micronaut" label="Micronaut">}}
In Micronaut, we simply define a `Bean`, and the framework automatically handles dependency injection.

```java
@Singleton
@Requires(missingBeans = JobRunrUserProvider.class)
public JobRunrUserProvider jobRunrUserProvider(OpenIdConnectSettings openIdConnectSettings) {
    return new UserProvider(openIdConnectSettings);
}     
```
{{< /framework >}}

This is it. Now, for each request, the web server will parse the access token, construct a `JobRunrUser` using the custom `UserProvider` we just implemented. We have the best-in-class authentication scheme: any unauthenticated will be redirected to the identity provider to login. On success, they are redirected to the JobRunr dashboard which performs applies the authorization rules defined by the claims.

## Troubleshooting
Unfortunately the setup may not go smoothly for all identity providers. In this section, we'll go through some common issues you may encounter and how our OpenID integration allows you to solve them with code examples.

### The Access Token cannot be validated
You may get an Exception with a message similar to the following:

> `Signed JWT rejected: Invalid signature`

This may be a sign of misconfiguration of your identity provider. You may get this when using [Microsoft Entra ID](https://www.microsoft.com/en-us/security/business/microsoft-entra), because, under the default scope `openid`, the access token can only be validated by Microsoft's own services, and they are not OpenID compliant. This is also a sign that we're attempting to use a token that our application is not supposed to look into.

#### Making Entra ID OpenID compliant
If you're using Entra ID and the access token cannot be validated then you'll need to configure Entra ID to generate an access token for your application, in our case: the JobRunr Pro Dashboard. Apply the following steps:
1. Add a new scope to the registered application, e.g., `jobrunr-pro-dashboard`.
2. Update the manifest to make sure Entra ID returns v2 tokens by setting `accessTokenAcceptedVersion: 2`. 
3. Optional: By default the `email` claim is not returned by Entra ID. JobRunr by default sets the username to this email (`null` is an acceptable value). If you don't want the username to be `null`, you need to enable the optional `email` claim. Or override the default `JobRunUser` instantiation.
4. Update the JobRunr OpenID integration configuration scope, e.g., `openid api://client-id/jobrunr-pro-dashboard`.

All these steps are provided in greater detail in this article: https://xsreality.medium.com/making-azure-ad-oidc-compliant-5734b70c43ff.

## Conclusion
Incorporating the `OpenIdConnectAuthenticationProvider` into JobRunr Pro offers us an advanced solution for managing dashboard access in environments with diverse user needs. This guide has provided the necessary steps to implement user authentication and authorization securely and effectively, thereby significantly elevating the security posture of your dashboard. The `OpenIdConnectAuthenticationProvider` allows for a streamlined integration process with existing identity providers, ensuring that your application adheres to modern security standards while facilitating a seamless user experience.