---
plan: "pro"
title: "Instant Job Processing"
lastmod: 2026-10-01
subtitle: "Are you in a hurry? JobRunr Pro starts processing your enqueued jobs instantly!"
keywords: ["real time scheduling", "scheduling", "real time enqueueing", "enqueueing", "strict timing requirements", "fetch jobs", "fetch all jobs"]
layout: "documentation"
menu: 
  sidebar: 
    identifier: instant-job-processing
    parent: 'jobrunr-pro'
    weight: 3
---
{{< trial-button >}}

JobRunr Pro achieves instant job processing by notifying all JobRunr Pro nodes at the moment a job is enqueued. This means that background job servers are immediately notified of possible new work that can be onboarded, allowing the job to move from enqueued to processing as soon as it is saved into the database---provided that the queue is not full.

Notifications are propagated using the **EventBus**, which supports multiple interchangeable transports:

- `PostgresEventTransport` --- uses PostgreSQL `LISTEN/NOTIFY`. This is selected automatically when your `StorageProvider` runs on PostgreSQL, with no extra configuration needed.
- `MulticastEventTransport` --- uses a UDP multicast socket. This is the default for all other storage providers.

If you do not explicitly configure an `EventTransport`, JobRunr Pro picks the `PostgresEventTransport` when you are using PostgreSQL as your storage provider, and the `MulticastEventTransport` otherwise.

> [!NOTE]
> Polling remains in place as a safety net, so a missed notification delays a job by at most one poll interval.

## Configuring the EventTransport

JobRunr automatically picks a suitable builtin `EventTransport` for you. You may still choose to configure an `EventTransport` either via the Fluent API Configuration or by providing an `EventTransport` bean in your favourite framework:

{{< codetabs category="framework" >}}
{{< codetab label="Fluent API" >}}
```java
JobRunrPro
        .configure()
        // ... your usual config
        .useEventTransport(new MulticastEventTransport(URI.create("udp://239.76.159.181:8379")))
        .useDashboard(...)
        .useBackgroundJobServer(...)
```
{{< /codetab >}}

{{< codetab label="Spring" >}}
```java
@Bean
EventTransport eventTransport() {
    return new MulticastEventTransport(URI.create("udp://239.76.159.181:8379"));
}
```
{{< /codetab >}}

{{< codetab label="Quarkus" >}}
```java
@Produces
@Singleton
EventTransport eventTransport() {
    return new MulticastEventTransport(URI.create("udp://239.76.159.181:8379"));
}
```
{{< /codetab >}}

{{< codetab label="Micronaut" >}}
```java
@Singleton
EventTransport eventTransport() {
    return new MulticastEventTransport(URI.create("udp://239.76.159.181:8379"));
}
```
{{< /codetab >}}
{{< /codetabs >}}

## Multicast

When using the `MulticastEventTransport`, the following addresses are used by default:

- IPv4: `udp://239.76.159.181:8379`
- IPv6: `udp://[ff12::4c9f:b5]:8379`

This can be configured by passing a `URI` to the `MulticastEventTransport` constructor as shown above.

Before v9, multicast was the only supported channel for propagating enqueue events. JobRunr Pro v9 replaced it with the EventBus and the other interchangeable transports, a breaking change described in the [v9 migration guide]({{< ref "guides/migration/v9.md#multicast" >}}).

> [!WARNING]
> The multicast transport will also be disabled if the address cannot be resolved (i.e. a `SocketException` or `UnknownHostException` is thrown). Make sure to adjust your firewall configuration accordingly. JobRunr Pro will issue the warning "Could not create JobRunrMulticastSender" to inform the user of this problem.

## PostgreSQL

When using `PostgresEventTransport`, notifications travel through your existing database via `LISTEN/NOTIFY`, so no changes to your network or firewall are required.

> [!IMPORTANT]
> Every JobRunr Pro server takes one connection out of the pool and keeps it open to listen for notifications. `LISTEN` requires a real session, so if you run PgBouncer in transaction mode the listener needs a direct connection to PostgreSQL.

## Custom EventTransport

If neither of the built-in transports fits your infrastructure, you can implement the `org.jobrunr.utils.events.EventTransport` interface and provide your own transport. This lets you propagate enqueue events over whatever channel you already run in your environment---for example a message broker, a distributed cache or an internal pub/sub service.

```java
public class CustomEventTransport implements EventTransport {
    // ...
}
```

Register it exactly like any other transport, as shown in [Configuring the EventTransport](#configuring-the-eventtransport).

A custom transport is responsible for both sides of the communication: publishing the enqueue events when a job is added, and receiving them on the other JobRunr Pro nodes so they can pick up the new work.