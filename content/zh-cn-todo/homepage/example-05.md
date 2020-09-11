---
title: "批次和工作链"
type: homepage-example
link: 'documentation/pro/batches/'
badge: PRO
weight: 5
---
使用批处理原子地创建一堆后台作业，然后链接一个新的作业，该作业将在整个批处理完成时运行。

```java
 BackgroundJob
    .startBatch(this::sendEmailToEachSubscriber)
    .continueWith(() -> reportService.createReport(...))
    .continueWith(() -> notifyService.notify("sales-team", ...));
```