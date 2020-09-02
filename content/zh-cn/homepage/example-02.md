---
title: "计划和延迟的工作"
type: homepage-example
link: 'documentation/background-methods/scheduling-jobs'
weight: 2
---
计划和延迟的作业也仅执行一次，但将在指定的时间运行。

```java
BackgroundJob.schedule(
  () -> System.out.println("Reliable!"),
  now().plusHours(5));
```