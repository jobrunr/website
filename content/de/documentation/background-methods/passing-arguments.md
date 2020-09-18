---
title: "Argumente übergeben"
subtitle: "Übergeben Sie Argumente an Hintergrundjobs - genau wie bei jedem anderen normalen Methodenaufruf."
date: 2020-04-30T11:12:23+02:00
layout: "documentation"
menu: 
  main: 
    identifier: passing-arguments
    parent: 'background-methods'
    weight: 40
---
JobRunr unterstützt die Übergabe von Argumenten an Hintergrundjobs - genau wie jeder andere normale Methodenaufruf. Diese Argumente können vom Typ "java.lang" oder sogar benutzerdefinierte Objekte sein.

> Berücksichtigen Sie Folgendes, wenn Sie benutzerdefinierte Objekte verwenden: <br>
> - Es muss möglich sein, sie über Jackson oder Gson zu serialisieren und zu deserialisieren
> - Sehen Sie sich einen Standardkonstruktor ohne Argumente an (er kann privat sein) - dies hilft Jackson und Gson, ihn zu deserialisieren

<figure>

```java
Mail mail = new Mail("from", "to", "subject", "message");
BackgroundJob.enqueue(() -> mailService.send(mail));
```
<figcaption> Da die Mail-Klasse mit Jackson und Gson serialisiert werden kann, kann sie als Argument an einen Hintergrundjob übergeben werden</figcaption> 
</figure>

Da Argumente serialisiert sind, sollten Sie ihre Werte sorgfältig prüfen, da sie Ihren StorageProvider in die Luft jagen können. In den meisten Fällen ist es effizienter, konkrete Werte in einer Anwendungsdatenbank zu speichern und nur deren Kennungen an Ihre Hintergrundjobs zu übergeben.

Denken Sie daran, dass Hintergrundjobs Tage oder Wochen nach dem Einreihen in die Warteschlange verarbeitet werden können. Wenn Sie Daten verwenden, deren Änderungen sich ändern können, können diese veraltet sein - Datenbankeinträge werden möglicherweise gelöscht, der Text eines Artikels wird möglicherweise geändert usw. Planen Sie diese Änderungen und gestalten Sie Ihre Hintergrundjobs entsprechend.