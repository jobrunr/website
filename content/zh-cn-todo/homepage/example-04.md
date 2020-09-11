---
title: "队列"
type: homepage-example
link: 'documentation/pro/queues'
badge: PRO
weight: 4
---
指定一个队列以绕过所有已排队的作业，这样您的关键业务流程将首先启动并按时完成。

```java
@Job(queue = HighPrioQueue)
public void doWork() { 
    ...
}
```