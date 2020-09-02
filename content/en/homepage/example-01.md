---
title: "Fire-and-forget jobs"
type: homepage-example
link: 'documentation/background-methods/enqueueing-jobs'
weight: 1
---
Fire-and-forget jobs are executed only once and almost immediately after creation.

```java
BackgroundJob.enqueue(
    () -> System.out.println("Simple!"));
```