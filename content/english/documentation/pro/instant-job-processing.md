---
version: "pro"
title: "Instant Job Processing"
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

JobRunr Pro achieves instant job processing by using a multicast (UDP) socket to send publish a message across all JobRunr Pro nodes at the moment a job is enqueued. This means that background job servers are immediately notified of possible new work that can be onboarded, allowing the job to move from enqueued to processing as soon as it is saved into the database---proivded that the queue is not full. 

## Configuring the multicast address

By default, the address `udp://239.076.159.181:8379` is used, but this can be configured either by setting this property in your favourite framework:

```properties
jobrunr.multicast-group-address=udp://239.076.159.181:8379
```

Or by passing in a `URI` in the Fluent API Configuration:

```java
JobRunrPro
        .configure()
        // ... your usual config
        .useMultiCastAddress(new URI("udp://239.076.159.181:8379"))
        .useDashboard(...)
        .useBackgroundJobServer(...)
```

Be sure to configure this before the configuration of the dashboard and background job server. 

The multicast---and therefore, instant job processing---will be disabled if `null` is passed in. 

> [!WARNING]
> The multicast will also be disabled if the address cannot be resolved (i.e. a `SocketException` or `UnknownHostException` is thrown). Make sure to adjust your firewall configuration accordingly. JobRunr Pro will issue the warning "Could not create JobRunrMulticastSender" to inform the user of this problem.
