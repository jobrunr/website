---
title: "Job Chaining"
subtitle: "Verwenden Sie vorhandene Servicemethoden und Kettenjobs erneut, um saubereren Code und einen sofortigen Überblick über Ihre Geschäftsprozesse zu erhalten."
date: 2020-08-27T11:12:23+02:00
layout: "documentation"
menu: 
  main: 
    identifier: job-chaining
    parent: 'jobrunr-pro'
    weight: 10
---
Mit JobRunr Pro können Sie Jobs mithilfe eines fließenden API-Stils verketten. Dies gibt Ihnen einen sofortigen Überblick über Ihren Geschäftsprozess.

<figure>

```java
@Inject
private ArchiveService archiveService;
@Inject
private NotifyService notifyService;

public void createArchiveAndNotify(String folder) {
    BackgroundJob
        .enqueue(() -> archiveService.createArchive(folder))
        .continueWith(() -> notifyService.notifyViaSlack("ops-team", "The following folder was archived: " + folder))
}

```
<figcaption>

Die Benachrichtigung wird erst gesendet, wenn das Archiv erfolgreich erstellt wurde (und somit der Auftrag "archiveService.createArchive (String-Ordner)" erfolgreich war
</figcaption>
</figure>

#### Wie funktioniert es?
- Der erste Job (`archiveService.createArchive(Ordner)`) wird in die Warteschlange gestellt und beginnt mit der Verarbeitung, sobald einige Arbeitsthreads verfügbar sind
- Der zweite Job (`notifyService.notifyViaSlack(String room, String message)`) wird zunächst im Status `AWAITING` gespeichert.
- Sobald der erste Job erfolgreich ist, wird der zweite Job in die Warteschlange gestellt und verarbeitet.

> Dies ist sehr praktisch, wenn Sie [Batches]({{< ref "batches.md" >}}) verwenden. Starten Sie einen neuen Schritt in Ihrem Geschäftsprozess, wenn eine ganze Reihe verwandter Jobs abgeschlossen sind.