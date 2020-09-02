---
title: "Scheduled & delayed jobs"
type: homepage-example
link: 'documentation/background-methods/scheduling-jobs'
weight: 2
---
Scheduled and delayed jobs are also executed only once but will run at the specified time.

```java
BackgroundJob.schedule(
  () -> System.out.println("Reliable!"),
  now().plusHours(5));
```