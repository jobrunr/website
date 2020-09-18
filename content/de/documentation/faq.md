---
title: "Häufig gestellte Fragen"
translationKey: "faq"
subtitle: "Einige häufig gestellte Fragen zu JobRunr"
description: "Erfahren Sie alles über die Architektur und Terminologie von JobRunr"
date: 2020-09-16T11:12:23+02:00
layout: "documentation"
menu: 
  main: 
    identifier: faq
    parent: 'documentation'
    name: FAQ
    weight: 95
sitemap:
  priority: 0.1
  changeFreq: monthly
---

## BackgroundJobServer FAQ
### Benötigt JobRunr offene Ports zum Verteilen von Jobs?
Nein, JobRunr benötigt keinen offenen Port zum Verteilen der Workload - dies wird über den StorageProvider koordiniert.

### Wie erfolgt die Koordination zwischen verschiedenen Knoten?
Jeder [`BackgroundJobServer`]({{<ref "_index.md#backgroundjobserver">}}) registriert sich beim Start im `StorageProvider`. Für ein RDBMS ist dies eine einfache alte Tabelle mit dem Namen `jobrunr_backgroundjobservers`. Der Master ist der Server, der am längsten läuft (also derjenige, der als erster Node registriert wurde).
Dann aktualisiert jeder `BackgroundJobServer` alle 15 Sekunden einen `lastHeartBeat`-Zeitstempel. Wenn ein Node aus irgendeinem Grund abstürzt (dies kann auch der Master-Node sein), wird der Zeitstempel `lastHeartBeat` nicht mehr aktualisiert. Alle anderen Server, die an der Verarbeitung des Jobs teilnehmen, sehen, dass der Master-Node nicht mehr aktiv ist und entfernt dem aus der StorageProvider.
Als nächstes beginnt der Master-Wiederwahlprozess, der wiederum nichts anderes ist als der am längsten laufende `BackgroundJobServer`.

> Pro-Tipp: Wenn Sie in einer Kubernetes-Umgebung arbeiten, ist es am besten, Ihren ersten `BackgroundJobServer` immer am Laufen zu halten und andere Pods nach oben und unten zu skalieren. Dies führt zu weniger Master-Wiederwahlprozessen und damit zu weniger Datenbankabfragen.

### Welche Rolle spielt der Master?
Der Master ist wie alle anderen Knoten ein BackgroundJobServer, führt jedoch einige zusätzliche Aufgaben aus:
- Es prüft auf wiederkehrende Jobs und plant sie, wenn sie ausgeführt werden sollen
- Es sucht nach geplanten Jobs und stellt sie in die Warteschlange, wenn sie ausgeführt werden müssen
- Es sucht nach verwaisten Jobs und plant sie neu
- Es führt einige Zookeeping-Vorgänge wie das Löschen aller erfolgreichen Jobs durch

<!-- ### Wie kann ich die Anzahl der Mitarbeiter pro BackgroundJobServer steuern? -->

## Job FAQ
### Was ist, wenn ich nicht 10 Wiederholungsversuche haben möchte, wenn ein Job fehlschlägt?
Sie können die Anzahl der Wiederholungsversuche für alle Ihre Jobs oder pro Job konfigurieren.
- Um die Standardeinstellung für alle Jobs zu ändern, registrieren Sie einfach einen [`RetryFilter`]({{<ref "_index.md#retryfilter">}}) mit der Anzahl der Wiederholungen, die Sie mit der `withJobFilter`-Methode in der [Fluent API]({{<ref "configuration/fluent/_index.md">}}) oder im Fall der [Spring-Konfiguration]({{<ref "configuration/spring/_index.md">}}) übergeben Sie den Filter einfach an die Methode `setJobFilters` der Klasse `BackgroundJobServer`.
- Um die Anzahl der Wiederholungsversuche für einen einzelnen Job zu ändern, verwenden Sie einfach die Annotation `@Job`:

```java
@Job(name = "Doing some work", retries = 2)
public void doWork() {
    ...
}
```