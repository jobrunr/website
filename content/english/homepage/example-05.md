---
title: "Queues"
type: homepage-example
link: 'documentation/pro/priority-queues/'
badge: PRO
weight: 5
sitemapExclude: true
---
Specify a queue to bypass all jobs already enqueued so your critical business processes finish on-time.

```java
@Job(queue = HighPrioQueue)
public void doWork() { 
    ...
}
```