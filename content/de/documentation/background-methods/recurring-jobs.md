---
title: "Wiederkehrende Jobs"
subtitle: "Planen Sie wiederkehrende Jobs mit einer einzigen Codezeile unter Verwendung eines beliebigen CRON-Ausdrucks."
keywords: ["Java wiederkehrender Job", "Java Cron Job"]
date: 2020-09-16T11:12:23+02:00
layout: "documentation"
menu: 
  main: 
    identifier: recurring-jobs
    parent: 'background-methods'
    weight: 30
---
Das Registrieren eines wiederkehrenden Jobs ist genauso einfach wie das Registrieren eines Hintergrundjobs - Sie müssen nur eine einzige Codezeile schreiben:

<figure>

```java
BackgroundJob.scheduleRecurrently(Cron.daily(), () -> System.out.println("Einfach!"));
```
</figure>

Diese Zeile erstellt einen neuen wiederkehrenden Jobeintrag im `StorageProvider`. Eine spezielle Komponente in `BackgroundJobServer` überprüft die wiederkehrenden Jobs in einem minutenbasierten Intervall und stellt sie dann als Fire-and-Forget-Jobs in die Warteschlange. Auf diese Weise können Sie sie wie gewohnt verfolgen.

> Anmerkung: Damit wiederkehrende Methoden funktionieren, sollte immer mindestens ein BackgroundJobServer ausgeführt werden

Die Cron-Klasse enthält verschiedene Methoden und Überladungen, um Jobs auf Minuten-, Stunden-, Tages-, Wochen-, Monats- und Jahresbasis auszuführen. Sie können auch Standard-CRON-Ausdrücke verwenden, um einen komplexeren Zeitplan anzugeben:

<figure>

```java
BackgroundJob.scheduleRecurrently("0 12 * */2", () -> System.out.println("Stark!"));
```
</figure>


Alle diese Methoden sind auch in der JobScheduler-Bean verfügbar:

<figure>

```java
@Inject
private JobScheduler jobScheduler;

jobScheduler.scheduleRecurrently(Cron.daily(), () -> System.out.println("Einfach!"));
```
</figure>

### Bezeichner angeben
Jeder wiederkehrende Job hat eine eigene eindeutige Kennung. In den vorherigen Beispielen wurde es implizit unter Verwendung der Typ- und Methodennamen des angegebenen Aufrufausdrucks generiert (was zu `System.out.println` als Bezeichner führte). Die Klassen `BackgroundJob` und `JobScheduler` enthalten Überladungen, die eine explizit definierte Job-ID annehmen. Auf diese Weise können Sie später auf den Job verweisen.

<figure>

```java
BackgroundJob.scheduleRecurrently("some-id", "0 12 * */2",
  () -> System.out.println("Powerful!"));
```

Der Aufruf der Methode `scheduleRecurrently` erstellt einen neuen wiederkehrenden Job, wenn kein wiederkehrender Job mit dieser ID vorhanden ist, oder aktualisiert den vorhandenen Job mit dieser Kennung.

> Id's sollten eindeutig sein - verwenden Sie für jeden wiederkehrenden Job eindeutige Id's, andernfalls beenden Sie mit einem einzelnen Auftrag.

### Wiederkehrende Jobs bearbeiten
Sie können einen vorhandenen wiederkehrenden Job entfernen, indem Sie die Methode `BackgroundJob.delete` aufrufen. Es wird keine Ausnahme ausgelöst, wenn es keinen solchen wiederkehrenden Job gibt.