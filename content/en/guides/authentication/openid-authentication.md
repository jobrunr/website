---
title: Secure your JobRunr Dashboard with your OpenID Provider   
description: This guide will help you enhance the security of your JobRunr dashboard by setting up an OpenID authentication provider. Perfect for enterprise grade access control.
tags:
    - Auth
    - JobRunr Pro
draft: true
---
[OpenID Connect](https://openid.net/developers/how-connect-works/) is an authentication protocol that allows to verify the identity of users and obtain their profile information. JobRunr Pro allows you to use your existing OpenID Provider to secure your [JobRunr Pro Dashboard]({{< ref "/documentation/pro/jobrunr-pro-dashboard" >}} "Dashboard documentation") and its underlying `REST API` by using `OpenIdConnectAuthenticationProvider`. This authentication provider is perfect for an enterprise grade access control! In this guide, we'll show how to configure JobRunr to use an OpenID Provider. [Keycloak](https://www.keycloak.org/) will be our identity provider throughout this guide.

## Prerequisites
- JobRunr Pro 6.2.4 or later
- You already know how to configure JobRunr
- You have Keycloak up and running