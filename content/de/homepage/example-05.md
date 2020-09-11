---
title: "Batches & Job Chaining"
type: homepage-example
link: 'documentation/pro/batches/'
badge: PRO
weight: 5
sitemapExclude: true
---
Erstellen Sie mithilfe eines Stapels atomar eine Reihe von Hintergrundjobs und verketten Sie dann einen neuen Job, der ausgeführt wird, wenn der gesamte Stapel abgeschlossen ist.

```java
 BackgroundJob
    .startBatch(this::sendEmailToEachSubscriber)
    .continueWith(() -> reportService.createReport(...))
    .continueWith(() -> notifyService.notify("sales-team", ...));
```