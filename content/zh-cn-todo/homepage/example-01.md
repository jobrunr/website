---
title: "一劳永逸的工作"
type: homepage-example
link: 'documentation/background-methods/enqueueing-jobs'
weight: 1
---
即弃式作业仅执行一次，并且几乎在创建后立即执行。

```java
BackgroundJob.enqueue(
    () -> System.out.println("Simple!"));
```