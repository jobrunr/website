---
title: "Logging & Auftragsfortschritt"
subtitle: "Beobachten Sie Ihren Jobfortschritt dank Live-Updates"
date: 2020-04-30T11:12:23+02:00
layout: "documentation"
menu: 
  main: 
    identifier: logging-job-progress
    parent: 'background-methods'
    weight: 70
---
Einige Jobs dauern sehr lange - sie generieren Tausende von E-Mails, führen einen Stapelimport einiger großer XML- oder CSV-Dateien durch, .... Woher wissen Sie, ob Ihr Code tatsächlich ausgeführt wird und seinen eigentlichen Job erledigt (Wortspiel beabsichtigt)?

Begrüßen Sie die Jobprotokollierung und den Jobfortschrittsbalken.

<figure>
<img src="/documentation/job-progress.gif" class="kg-image">
<figcaption> Beobachten Sie die Protokollierung live von Ihrem eigentlichen Job </figcaption>
</figure>

## Logging
JobRunr unterstützt die Protokollierung im Dashboard. Neue Nachrichten werden angezeigt, sobald sie protokolliert werden. Es ist, als würden Sie eine echte Konsole betrachten. Um etwas im Dashboard zu protokollieren, haben Sie zwei Möglichkeiten:

- Sie können den JobContext und seinen Logger verwenden: <br>
`jobContext.logger().info('dies wird im Dashboard angezeigt');`
- oder - noch einfacher - wickeln Sie Ihren vorhandenen Logger wie folgt ein: <br>
`new JobRunrDashboardLogger(LoggerFactory.getLogger(MyService.class))`

Der letzte Logger stellt sicher, dass alle Informationen, Warnungen und Fehleranweisungen für jeden Job im Dashboard angezeigt werden. Die Debug-Protokollierung wird nicht unterstützt, da ich verhindern möchte, dass die verschiedenen Browser Spam senden.

## Fortschrittsanzeige
Lang laufende Jobs brauchen Zeit - und manchmal müssen Sie wissen, wie lange ein Job dauert. Dank der Fortschrittsanzeige in JobRunr können Sie den Fortschritt jetzt über das Dashboard verfolgen. Eine Fortschrittsanzeige wird automatisch direkt unter der Kopfzeile "Auftrag bearbeiten" angezeigt und wird während der Arbeit fortgesetzt.

Um diese Funktion nutzen zu können, müssen Sie den JobContext in Ihren Job einfügen:
`BackgroundJob.enqueue(() -> myService.doWork(JobContext.Null))`.

Innerhalb Ihres eigentlichen Jobs können Sie dann den JobContext verwenden, um einen Fortschrittsbalken zu erstellen:

```java
public class MyService {

	public void doWork(JobContext jobContext) {
    	JobDashboardProgressBar progressBar = jobContext.progressBar(1000);
        
        for(int i = 0; i < 1000; i++) {
        	//do actual work
            progressBar.increaseByOne();
            // or you can also use
            progressBar.setValue(i);
        }
    }
}
```
