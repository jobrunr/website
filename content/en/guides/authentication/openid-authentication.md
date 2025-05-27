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
> - [Microsoft Entra](https://www.microsoft.com/en-us/security/business/microsoft-entra) ([requires extra configuration to be OIDC compliant](https://xsreality.medium.com/making-azure-ad-oidc-compliant-5734b70c43ff)). 
> - [Google OIDC](https://cloud.google.com/security/products/identity-platform?hl=en) (uses opaque tokens)
> - [Spring Authorization Server](https://spring.io/projects/spring-authorization-server)
> - [Ping Identity](https://www.pingidentity.com/en.html)

## What is OpenID Connect
OpenID Connect provides a robust and standardized way to verify user identities. By leveraging OpenID, users can log into the JobRunr Dashboard using their existing credentials from a trusted OpenID provider, eliminating the need to manage multiple usernames and passwords. This enhances user convenience while significantly reducing the risk of password-related security breaches.

Moreover, OpenID providers typically support advanced security features such as multi-factor authentication, further strengthening the login process. For developers, integrating OpenID simplifies the authentication flow by providing a consistent protocol for secure logins across multiple identity providers. This makes OpenID Connect an ideal solution for securing the JobRunr Dashboard, delivering both strong security and a enhanced user experience.

## Enabling OpenID Authentication in JobRunr
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
    "jobrunr-client-id", // the client id 🤔
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
org.jobrunr.dashboard.openid-authentication.client-id="jobrunr-client-id"
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
quarkus.jobrunr.dashboard.openid-authentication.client-id="jobrunr-client-id"
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
      client-id: "jobrunr-client-id"
      client-secret: "client-secret"
      scope: "scope" // optional, defaults to "openid email profile" 
      
```
{{< /framework >}}

In the code snippet above, we configure all the necessary information to the JobRunr Dashboard to integrate with our `OpenIdConnectAuthenticationProvider`.

## Configuring OpenID Authorization in JobRunr
... TODO


## Conclusion
Incorporating the `OpenIdConnectAuthenticationProvider` into JobRunr Pro offers us an advanced solution for managing dashboard access in environments with diverse user needs. This guide has provided the necessary steps to implement user authentication and authorization securely and effectively, thereby significantly elevating the security posture of your dashboard. The `OpenIdConnectAuthenticationProvider` allows for a streamlined integration process with existing identity providers, ensuring that your application adheres to modern security standards while facilitating a seamless user experience.