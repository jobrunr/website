---
title: "经常性工作"
type: homepage-example
link: 'documentation/background-methods/recurring-jobs/'
weight: 3
---
周期性作业重复发生，并在指定的CRON时间表上每次触发。

```java
BackgroundJob.scheduleRecurringly(
  () -> service.doWork(), 
  Cron.daily());
```