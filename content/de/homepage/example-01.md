---
title: "Fire-and-forget jobs"
type: homepage-example
link: 'documentation/background-methods/enqueueing-jobs'
weight: 1
sitemapExclude: true
---
Fire-and-Forget-Jobs werden nur einmal und fast unmittelbar nach der Erstellung ausgeführt.

```java
BackgroundJob.enqueue(
    () -> System.out.println("Simple!"));
```