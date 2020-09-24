---
title: "Umgang mit Ausnahmen"
subtitle: "Es passieren schlimme Dinge - aber JobRunr hat dank RetryFilter alles abgedeckt!"
date: 2020-04-30T11:12:23+02:00
layout: "documentation"
menu: 
  main: 
    identifier: dealing-with-exceptions
    parent: 'background-methods'
    weight: 60
---
Es passieren schlimme Dinge. Jede Methode kann verschiedene Arten von Ausnahmen auslösen. Diese Ausnahmen können entweder durch Programmierfehler verursacht werden, bei denen Sie die Anwendung erneut bereitstellen müssen, oder durch vorübergehende Fehler, die ohne zusätzliche Bereitstellung behoben werden können.

JobRunr behandelt alle Ausnahmen, die sowohl in internen (zu JobRunr selbst gehörenden) als auch in externen Methoden (Jobs, Filter usw.) auftreten, sodass nicht die gesamte Anwendung heruntergefahren wird. Alle internen Ausnahmen werden protokolliert (vergessen Sie also nicht, die Protokollierung zu aktivieren). Im schlimmsten Fall wird die Hintergrundverarbeitung eines Jobs nach 10 Wiederholungsversuchen mit zunehmendem Verzögerungsmodifikator gestoppt.

Wenn JobRunr auf eine externe Ausnahme stößt, die während der Ausführung des Jobs aufgetreten ist, wird automatisch versucht, den Status des Jobs in "Fehlgeschlagen" zu ändern, und Sie können diesen Job immer in der Dashbord-Benutzeroberfläche finden (er läuft nur ab, wenn Sie dies tun explizit löschen).


<figure>
<img src = "/documentation/failed-job.webp" class = "kg-image">
<figcaption> Detaillierte Informationen, warum ein Job fehlgeschlagen ist </figcaption>
</figure>

Im vorherigen Absatz wurde erwähnt, dass JobRunr __versucht__, den Status des "Jobs" in "fehlgeschlagen" zu ändern, da der Statusübergang einer der Orte ist, an denen Jobfilter den Statusübergang abfangen und ändern können. Die `RetryFilter`-Klasse ist eine davon, die den fehlgeschlagenen Job neu plant, damit er nach zunehmender Verzögerung automatisch wiederholt wird.

Dieser Filter wird global auf alle Methoden angewendet und hat standardmäßig 10 Wiederholungsversuche. Daher werden Ihre Methoden im Falle einer Ausnahme automatisch wiederholt, und Sie erhalten bei jedem fehlgeschlagenen Versuch Warnprotokollmeldungen. Wenn die Wiederholungsversuche ihr Maximum überschritten haben, bleibt der Job im Status "Fehlgeschlagen" (mit einer Fehlerprotokollmeldung), und Sie können ihn manuell wiederholen.

### Configuration
Sie können natürlich konfigurieren, wie viele Wiederholungen JobRunr standardmäßig ausführt.

<figure>

```java
JobRunr.configure()
    .withJobFilters(new RetryFilter(2))
    .useBackgroundJobServer(new BackgroundJobServer(...))
    ....
```
<figcaption> Jobs werden nur 2-mal statt 10-mal wiederholt, da der Standard-RetryFilter überschrieben wird. </figcaption>
</figure>

<figure>

```java
    @Job(name="Job Name", retries=2)
    public void doWorkWithCustomJobFilters() {
        System.out.println("I will only be retried two times ");
    }
```
<figcaption> Die Anzahl der Wiederholungsversuche kann auch mithilfe der @ Job-Annotation pro Job konfiguriert werden. </figcaption>
</figure>