---
title: "Configuration"
keywords: ["configuration", "fluent api", "spring boot starter", "quarkus extension", "processing jobs", "managing jobs", "spring starter", "configuration java", "configure spring boot", "spring boot configuration", "spring boot java configuration", "spring application configuration", "spring server configuration"]
date: 2020-04-30T11:12:23+02:00
layout: "documentation"
menu: 
  main: 
    identifier: configuration
    parent: 'documentation'
    weight: 10
---

You can choose to configure JobRunr using our [Fluent  API]({{<ref "/documentation/configuration/fluent/_index.md">}}) or use the [Spring Starter]({{<ref "/documentation/configuration/spring/_index.md">}}), [Micronaut integration]({{<ref "/documentation/configuration/micronaut/_index.md">}}) or the [Quarkus]({{<ref "/documentation/configuration/quarkus/_index.md">}}) extension.

Once you have configured JobRunr, various beans and helper classes are available. The most important you will use, are:
- `JobScheduler`: a bean that will allow you to enqueue and schedule jobs using Java 8 lambda's
- `JobRequestScheduler`: a bean that will allow you to enqueue and schedule jobs using instances of the `JobRequest` interface. For each `JobRequest` an appropriate handler should be created.
- `BackgroundJob`: a helper class that wraps a `JobScheduler` and has static methods to enqueue and schedule jobs using Java 8 lambda's
- `BackgroundJobRequest`: a helper class that wraps a `JobRequestScheduler` and has static methods to enqueue and schedule jobs using instances of the `JobRequest` interface.
- `BackgroundJobServer`: the server responsible for managing and processing jobs