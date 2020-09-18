---
title: "Documentation"
translationKey: "documentation"
subtitle: "Die Architektur und Terminologie von JobRunr"
description: "Erfahren Sie alles über die Architektur und Terminologie von JobRunr"
date: 2020-04-30T11:12:23+02:00
layout: "documentation"
menu: 
  main: 
    identifier: documentation
    weight: 10
sitemap:
  priority: 0.9
  changeFreq: monthly
---
## Architektur
<figure>

  ![Architecture](/documentation/architecture.webp)

  <figcaption>Die Architektur</figcaption>
</figure>

## Wie funktioniert das alles?

- Beim Einreihen eines Hintergrundjobs wird das Lambda zerlegt und als Json im Speicheranbieter gespeichert.
- JobRunr kehrt sofort zum Anrufer zurück, damit er nicht blockiert
- Ein oder mehrere Hintergrund-Jobserver fragen den Speicheranbieter nach neuen Jobs in der Warteschlange ab und verarbeiten diese
- Wenn der Vorgang abgeschlossen ist, wird der Status im Speicheranbieter aktualisiert und der nächste auszuführende Job abgerufen

## Terminologie
### Job
Im Kern von JobRunr befindet sich die Job-Entität - sie enthält den Namen, die Signatur, die JobDetails (den Typ, die auszuführende Methode und alle Argumente) und den Verlauf - einschließlich aller Status - des Hintergrundjobs selbst. Ein Job ist eine Arbeitseinheit, die außerhalb des aktuellen Ausführungskontexts ausgeführt werden sollte, z. In einem Hintergrundthread, einem anderen Prozess oder sogar auf einem anderen Server ist mit JobRunr alles ohne zusätzliche Konfiguration möglich.

### Wiederkehrender Job
Ein `RecurringJob` ist im Wesentlichen ein Job mit einem CRON-Zeitplan. Eine spezielle Komponente in JobRunr überprüft die wiederkehrenden Jobs und stellt sie dann als Fire-and-Forget-Jobs in die Warteschlange.

### Speicheranbieter
Ein `StorageProvider` ist ein Ort, an dem JobRunr alle Informationen zur Hintergrundjobverarbeitung speichert. Alle Details wie Typen, Methodennamen, Argumente usw. werden in Json serialisiert und gespeichert. Es werden keine Daten im Speicher eines Prozesses gespeichert. Der StorageProvider ist in JobRunr gut genug abstrahiert, um für RDBMS- und NoSQL-Lösungen implementiert zu werden.

> Dies ist die Hauptentscheidung, die Sie treffen müssen, und die einzige Konfiguration, die erforderlich ist, bevor Sie das Framework verwenden.

### BackgroundJob
`BackgroundJob` ist eine Klasse, mit der Hintergrundjobs mithilfe statischer Hilfsmethoden in die Warteschlange gestellt werden können. Tatsächlich delegiert sie alles an den JobScheduler. Sie können völlig frei wählen, wie Hintergrundjobs in die Warteschlange gestellt werden sollen - entweder mithilfe der statischen Hilfsmethoden in der BackgroundJob-Klasse oder direkt in der JobScheduler-Klasse. Dies kann die Lesbarkeit verbessern, das Testen jedoch erschweren.

### JobScheduler
Der `JobScheduler` ist dafür verantwortlich, das Lambda zu analysieren, alle erforderlichen Jobparameter zu sammeln, Hintergrundjobs zu erstellen und im StorageProvider zu speichern. Dieser Vorgang ist sehr schnell und sobald er im StorageProvider gespeichert ist, kehrt er sofort zum Aufrufer zurück.

```java
BackgroundJob.enqueue (() -> System.out.println ("Simple!"));
```

### BackgroundJobServer
Die `BackgroundJobServer`-Klasse verarbeitet Hintergrundjobs, indem sie den `StorageProvider` abfragt. Grob gesagt handelt es sich um eine Reihe von Hintergrund-Threads, die den Speicheranbieter auf neue Hintergrundjobs warten und diese ausführen, indem sie zuerst den gespeicherten Typ, die gespeicherte Methode und die Argumente de-serialisieren und dann ausführen.
Sie können diesen `BackgroundJobServer` in einem beliebigen Prozess platzieren. Selbst wenn Sie einen Prozess beenden, werden Ihre Hintergrundjobs nach dem Neustart automatisch wiederholt. In einer Grundkonfiguration für eine Webanwendung müssen Sie also keine Windows-Dienste mehr für die Hintergrundverarbeitung verwenden.

### JobActivator
Die meisten Unternehmensanwendungen verwenden ein IoC-Framework wie Spring oder Guice - wir unterstützen diese IoC-Frameworks natürlich. Der `JobActivator` ist eine Java 8-Funktionsschnittstelle und hat die Verantwortung, die richtige Klasse zu suchen, für die die Hintergrundjobmethode definiert ist.

```java
public interface JobActivator {
    <T> T activateJob(Class<T> type);
}
```

### JobRunrDashboardWebServer
Der `JobRunrDashboardWebserver` bietet Einblicke in alle Jobs, die in die Warteschlange gestellt werden, verarbeitet werden, erfolgreich waren oder fehlgeschlagen sind. Sie können sehen, auf welchem ​​BackgroundJobServer ein Hintergrundjob verarbeitet wird, in welchem ​​aktuellen Status er sich befindet und im Fehlerfall einen Blick darauf werfen, warum er fehlgeschlagen ist.
Das Dashboard befindet sich außerhalb eines React-Frontends und verwendet eine REST-API.

### JobMapper
Der `JobMapper` wird zum Serialisieren und Deserialisieren des Jobs an Json verwendet, da alle Jobs im StorageProvider als Json gespeichert sind. Es verwendet den darunter liegenden JsonMapper und verfügt über einige Dienstprogrammfunktionen zum Serialisieren eines Jobs und eines RecurringJob.

### JsonMapper
Der `JsonMapper` ist die Abstraktionsschicht über Jackson, Gson oder Json-B. Es wird vom JobMapper und vom JobRunrDashboardWebServer verwendet, um Domänenobjekte wie Job und RecurringJob json-Entitäten für die REST-API zuzuordnen.

### JobFilter
Mit dem `JobFilter` können Sie Hintergrundjobs in JobRunr erweitern und intervenieren. Es gibt verschiedene Arten von JobFiltern:

- `JobClientFilter`: Filter, die vor und nach dem Erstellen des Jobs aufgerufen werden
- `JobServerFilter`: Filter, die vor und nach der Verarbeitung des Jobs aufgerufen werden
- `ElectStateFilter`: Ein Filter, der den neuen Status basierend auf dem alten Status bestimmt
- `ApplyStateFilter`: Filter, die aufgerufen werden, wenn eine Statusänderung innerhalb eines Jobs auftritt

### RetryFilter
Dies ist ein Standardfilter vom Typ `ElectStateFilter` und wird automatisch für jeden Job hinzugefügt, der von JobRunr ausgeführt wird. Wenn ein Job fehlschlägt, wiederholt der `RetryFilter` den Job automatisch zehnmal mit einer exponentiellen Backoff-Richtlinie. Ist ein API-Server während der Verarbeitung von Jobs ausgefallen? Keine Sorge, JobRunr hat Sie abgedeckt.

### JobContext
Wenn Zugriff auf Informationen über den Hintergrundjob selbst (wie die ID des Jobs, den Namen, den Status usw.) während der Ausführung erforderlich ist, ist der JobContext hilfreich. Die Verwendung ist einfach: Sie übergeben einen zusätzlichen Parameter vom Typ "JobContext.Null" an Ihre Hintergrundjobmethode, und zur Ausführungszeit wird eine Instanz in Ihre Hintergrundjobmethode eingefügt.

> Hinweis: Dies wird am besten vermieden, da Ihre Domänenlogik eng mit JobRunr gekoppelt ist.

<figure>

```Java
BackgroundJob.enqueue (() -> myService.doWork(JobContext.Null));
```
<figcaption> Wenn Sie die doWork-Methode von myService ausführen, ist JobContext verfügbar. </figcaption>
</figure>