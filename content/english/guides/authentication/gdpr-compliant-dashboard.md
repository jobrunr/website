---
title: GDPR compliancy - hide sensitive Job data to prying eyes 
description: This guide will help you hide sensitive data of your JobRunr dashboard by redacting Job Details and StackTraces. Crucial for sectors like banking and healthcare, where data sensitivity is paramount.
weight: 20
tags:
    - Auth
    - JobRunr Pro
    - GDPR
draft: true
---
[OpenID Connect](https://openid.net/developers/how-connect-works/) is an authentication protocol that allows to verify the identity of users and obtain their profile information. JobRunr Pro allows you to use your existing OpenID Provider to secure your [JobRunr Pro Dashboard]({{< ref "/documentation/pro/jobrunr-pro-dashboard" >}} "Dashboard documentation") and its underlying `REST API` by using `OpenIdConnectAuthenticationProvider`. This authentication provider is perfect for enterprise grade access control. 

In this guide, we'll first configure JobRunr to use an OpenID Provider and we'll use [Keycloak](https://www.keycloak.org/) as our identity provider throughout this guide. Next, we will also map OpenID claims to JobRunr Authorization rules enabling customized access control for each user.

## Prerequisites
- JobRunr Pro Enterprise 7.0.0 or later
- You already know how to configure JobRunr
- Basic knowlegde about securing your dashboard by either Basic Authentication or OpenId
