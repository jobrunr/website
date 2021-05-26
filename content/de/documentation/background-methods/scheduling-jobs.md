---
title: "Jobs planen"
subtitle: "Planen Sie Jobs in der Zukunft und überwachen Sie sie mithilfe des Dashboards."
keywords: ["Zeitplan", "Java-Hintergrundjob", "Java-Zeitplanmethode", "Java-Zeitplan-Hintergrundjob"]
date: 2020-09-16T11:12:23+02:00
layout: "documentation"
menu: 
  main: 
    identifier: scheduling-jobs
    parent: 'background-methods'
    weight: 15
---
Manchmal möchten Sie möglicherweise einen Methodenaufruf verschieben. Zum Beispiel, um einen Tag nach ihrer Registrierung eine E-Mail an neu registrierte Benutzer zu senden. Rufen Sie dazu einfach die Methode "BackgroundJob.schedule" auf und übergeben Sie die gewünschte Verzögerung:

<figure>

```java
BackgroundJob.schedule<EmailService>(Instant.now().plusHours(24),
  x -> x.sendNewlyRegisteredEmail());
```
</figure>

Der `BackgroundJobServer` von JobRunr überprüft regelmäßig alle geplanten Jobs und stellt sie in die Warteschlange, wenn sie ausgeführt werden müssen, damit die Mitarbeiter sie ausführen können. Standardmäßig beträgt das Prüfintervall 15 Sekunden. Sie können es jedoch ändern, indem Sie das entsprechende Argument an den Konstruktor `BackgroundJobServer` übergeben.

Die `BackgroundJob.schedule` -Methoden haben Überladungen und akzeptieren:

- ein [ZonedDateTime] (https://docs.oracle.com/javase/8/docs/api/java/time/ZonedDateTime.html)
- ein [OffsetDateTime] (https://docs.oracle.com/javase/8/docs/api/java/time/OffsetDateTime.html)
- ein [LocalDateTime](https://docs.oracle.com/javase/8/docs/api/java/time/LocalDateTime.html)
- und ein [Instant] (https://docs.oracle.com/javase/8/docs/api/java/time/Instant.html)

Alle DateTime-Objekte werden in einen "Instant" konvertiert. Im Fall von "LocalDateTime" wird die systemDefault zoneId zum Konvertieren verwendet.

Diese Planungsmethoden sind natürlich auch auf der JobScheduler-Bean verfügbar.

<figure>

```java
@Inject
private JobScheduler jobScheduler;

jobScheduler.schedule<EmailService>(Instant.now().plusHours(24),
  x -> x.sendNewlyRegisteredEmail());
```
<figcaption>Planen Sie in Zukunft einen Hintergrundjob mit der JobScheduler-Bean</figcaption>
</figure>