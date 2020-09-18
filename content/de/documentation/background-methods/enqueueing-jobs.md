---
title: "Jobs in die Warteschlange stellen"
subtitle: "Dank JobRunr war der Aufruf der Fire-and-Forget Jobs noch nie so einfach."
keywords: ["Einreihen", "Hintergrundjobs", "Fire and Forget", "Enqueue Jobs in großen Mengen"]
date: 2020-09-16T11:12:23+02:00
layout: "documentation"
menu: 
  main: 
    identifier: enqueueing-jobs
    parent: 'background-methods'
    name: 'Jobs einreihen'
    weight: 15
---
Wie Sie bereits aus dem 5-minütigen Intro wissen, müssen Sie nur ein Lambda mit der entsprechenden Methode und ihren Argumenten übergeben, um einen Hintergrundjob in die Warteschlange zu stellen:

<figure>

```java
UUID jobId = BackgroundJob.enqueue(() -> myService.doWork());
```
<figcaption> Hiermit wird ein Hintergrundjob mithilfe einer Instanz von MyService in die Warteschlange gestellt, die während der Warteschlange verfügbar ist. </figcaption>
</figure>

<figure>

```java
UUID jobId = BackgroundJob.<MyService>enqueue(x -> x.doWork());
```
<figcaption> Hiermit wird ein Hintergrundjob ohne Verweis auf eine Instanz von MyService in die Warteschlange gestellt. Während der Ausführung des Hintergrundjobs muss der IoC-Container eine Instanz vom Typ MyService bereitstellen. </figcaption>
</figure>


Die Enqueue-Methode ruft die Zielmethode nicht sofort auf, sondern führt stattdessen die folgenden Schritte aus:

- Analysieren Sie das Lambda, um die Methodeninformationen und alle ihre Argumente zu extrahieren.
- Serialisieren Sie die Methodeninformationen und alle ihre Argumente.
- Erstellen Sie einen neuen Hintergrundjob basierend auf den serialisierten Informationen.
- Speichern Sie den Hintergrundjob im konfigurierten `StorageProvider`.
- Nachdem diese Schritte ausgeführt wurden, kehrt die Methode "BackgroundJob.enqueue" sofort zum Aufrufer zurück. Eine andere JobRunr-Komponente namens "BackgroundJobServer" überprüft den persistenten Speicher auf Hintergrundjobs in der Warteschlange und führt sie zuverlässig aus.

Anstelle der statischen Methode "BackgroundJob.enqueue" können Sie auch die Bean "JobScheduler" verwenden. Es hat genau die gleichen Methoden wie die BackgroundJob-Klasse. Um es zu verwenden, lassen Sie einfach Ihr Abhängigkeitsinjektionsframework eine Instanz der JobScheduler-Bean injizieren und fahren Sie wie zuvor fort:


<figure>

```java
@Inject
private JobScheduler jobScheduler;
 
jobScheduler.enqueue(() -> myService.doWork());
```
<figcaption> Hintergrundjobplanung mit der JobScheduler-Bean </figcaption>
</figure>
 
Nach wie vor benötigen Sie auch keine Instanz des verfügbaren myService, wenn die MyService-Klasse Ihrem Abhängigkeitsinjektionsframework bekannt ist.

<figure>

```java
@Inject
private JobScheduler jobScheduler;
 
jobScheduler.<MyService>enqueue(x -> x.doWork());
```
<figcaption> Hintergrundjobplanung mit der JobScheduler-Bean ohne Verweis auf die MyService-Instanz. Die MyService-Instanz wird beim Starten des Hintergrundjobs mithilfe des IoC-Frameworks aufgelöst. </figcaption>
</figure>


## Hintergrundjobs in großen Mengen in die Warteschlange stellen
Manchmal möchten Sie viele Jobs in die Warteschlange stellen - zum Beispiel eine E-Mail an alle Benutzer senden. JobRunr kann einen Java 8-Stream <T> von Objekten verarbeiten und für jedes Element in diesem Stream einen Hintergrundjob erstellen. Dies hat den Vorteil, dass diese Jobs in großen Mengen in der Datenbank gespeichert werden - was zu einer großen Leistungsverbesserung führt.

<figure>

```java
Stream<User> userStream = userRepository.getAllUsers();
BackgroundJob.enqueue(userStream, (user) -> mailService.send(user.getId(), "mail-template-key"));
```
<figcaption> Einreihen von E-Mails in großen Mengen mithilfe der Stream-API mit einer verfügbaren Instanz des mailService </figcaption>
</figure>

<figure>

```java
Stream<User> userStream = userRepository.getAllUsers();
BackgroundJob.enqueue<MailService, User>(userStream, (service, user) -> service.send(user.getId(), "mail-template-key"));
```
<figcaption> Einreihen von E-Mails in großen Mengen mithilfe der Stream-API mit einer nicht verfügbaren Instanz des mailService </figcaption>
</figure>

Dies ermöglicht eine gute Integration in das Spring Data-Framework, das Java 8-Streams zurückgeben kann. Auf diese Weise können Elemente inkrementell verarbeitet werden und die gesamte Datenbank darf nicht in den Speicher gestellt werden.

Natürlich können die beiden oben genannten Warteschlangenmethoden auch mit der JobScheduler-Bean ausgeführt werden.

<figure>

```java
@Inject
private JobScheduler jobScheduler;

Stream<User> userStream = userRepository.getAllUsers();
jobScheduler.enqueue(userStream, (user) -> mailService.send(user.getId(), "mail-template-key"));
```
<figcaption> Einreihen von Hintergrundjobmethoden in großen Mengen mithilfe der JobScheduler-Bean </figcaption>
</figure>

<figure>

```java
@Inject
private JobScheduler jobScheduler;

Stream<User> userStream = userRepository.getAllUsers();
jobScheduler.enqueue<MailService, User>(userStream, (service, user) -> service.send(user.getId(), "mail-template-key"));
```
<figcaption> Einreihen von Hintergrundjobmethoden in großen Mengen mithilfe der JobScheduler-Bean </figcaption>
</figure>