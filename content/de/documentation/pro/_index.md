---
title: "JobRunr Pro"
subtitle: "Fügen Sie JobRunr einige Steroide hinzu, um Ihre schwierigen Geschäftsprozesse zu unterstützen."
date: 2020-04-30T11:12:23+02:00
layout: "documentation"
menu: 
  main: 
    identifier: jobrunr-pro
    parent: 'documentation'
    weight: 50
---
JobRunr Pro ist ein Ersatz für JobRunr, der unter einem [kostenpflichtigen Abonnement]({{< ref "/pricing.md" >}}) verfügbar ist und viele zusätzliche Funktionen zur Unterstützung Ihrer schwierigen Geschäftsprozesse bietet:
- __Einfache Upgrades:__ Sie haben viele Jobs im `SCHEDULED` state und möchten diese aber umgestalten? JobRunr Pro hat Sie abgedeckt - machen Sie einfach Ihr altes Jobmethoden-Paket privat und JobRunr Pro führt sie weiterhin aus.
- __[Warteschlangen]({{< ref "queues.md" >}}):__ Verarbeiten Sie viele Jobs und haben Sie kritische Geschäftsprozesse, die pünktlich abgeschlossen werden müssen? Warteschlangen zur Rettung! Planen Sie einfach Ihren Job mit einer höheren Priorität und alle anderen Jobs werden umgangen.
- __[Job Chaining]({{< ref "job-chaining.md" >}}):__ Verwenden Sie vorhandene Servicemethoden und Chain-Jobs erneut, um saubereren Code und einen sofortigen Überblick über Ihren Geschäftsprozess zu erhalten.
- __[Batches]({{< ref "batches.md" >}}):__ Mit Batches können Sie eine Reihe von Hintergrundjobs atomar erstellen und in Kombination mit [Job Chaining]({{< ref "job-chaining.md" >}}) komplexe Workflows vereinfachen!
- __[Server-Tags]({{< ref "server-tags.md" >}}):__ Haben Sie Jobs, die nur auf bestimmten Servern ausgeführt werden können (z. B. Jobs, die nur unter Windows, Linux usw. ausgeführt werden sollten)? Mit Server-Tags können Sie Jobs nach bestimmten Tags filtern, sodass sie nur auf bestimmten Servern ausgeführt werden.
- __[Mutexe]({{< ref "mutexes.md" >}}):__ verbrauchen Sie in Ihren Jobs eine Ressource, die nicht freigegeben werden kann? Dank Mutexe verschiebt JobRunr Jobs mit gemeinsam genutzten Mutexen, bis der Mutex frei ist.

### Kommende Funktionen
JobRunr Pro ist keineswegs ein fertiges Produkt. Durch das Abonnieren kann ich zusätzliche Funktionen erstellen, darunter:
- Authentifizierung für das Dashboard
- Benachrichtigungsunterstützung, wenn plötzlich viele Jobs fehlschlagen
- ein Slack- und Microsoft Teams-Plugin, mit dem Sie Aufträge verfolgen und benachrichtigt werden können, wenn Stapel beendet sind (damit Sie nicht gestört werden müssen, um herauszufinden, wie lange ein Auftrag dauern wird).
- Feature-Anfragen von Ihnen!