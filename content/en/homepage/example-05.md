---
title: "Batches & job chaining"
type: homepage-example
link: 'documentation/pro/batches/'
badge: PRO
weight: 5
---
Create a bunch of background jobs atomically using a batch and then chain a new job which will run when the complete batch finishes.

```java
 BackgroundJob
    .startBatch(this::sendEmailToEachSubscriber)
    .continueWith(() -> reportService.createReport(...))
    .continueWith(() -> notifyService.notify("sales-team", ...));
```