---
title: "Queues"
type: homepage-example
link: 'documentation/pro/queues'
badge: PRO
weight: 4
sitemapExclude: true
---
Specify a queue to bypass all jobs already enqueued so your critical business processes finish on-time.

```java
@Job(queue = HighPrioQueue)
public void doWork() { 
    ...
}
```