---
title: "5 Minuten Intro"
subtitle: "Verwenden Sie diese einfachen Beispiele und unsere umfassende Dokumentation, um schnell loszulegen!"
date: 2020-04-30T11:12:23+02:00
layout: "documentation"
menu: 
  main: 
    parent: 'documentation'
    weight: 5
sitemap:
  priority: 0.7
  changeFreq: monthly
---

## Schauen Sie sich unsere Beispielprojekte an:
Wir haben verschiedene Beispielprojekte auf GitHub, die Ihnen beim Start helfen:

- https://github.com/jobrunr/example-spring <br>
Dieses Repository ist das einfachste Beispiel für die Spring-Integration. Es besteht aus einem Backend-Modul und einem Frontend-Modul mit einem gemeinsam genutzten Modul, das den Hintergrundjob enthält. Das Frontend-Modul stellt neue Hintergrundjobs in die Warteschlange, die vom Hintergrundmodul verarbeitet werden.
- https://github.com/jobrunr/example-salary-slip <br>
Dieses Repository enthält ein Beispiel dafür, wie Sie jeden Sonntagabend mithilfe eines wiederkehrenden Jobs viele Gehaltsabrechnungen erstellen können.
- https://github.com/jobrunr/example-salary-slip/tree/kubernetes <br>
Möchten Sie skalieren und die Verarbeitung beschleunigen? In diesem Beispiel verwenden wir Terraform, um die Infrastruktur als Code zu definieren und einen Kubernetes-Cluster mit 10 Instanzen von JobRunr einzurichten. Mehr Info? Siehe auch den dazugehörigen Blogbeitrag.

Es gibt auch andere Beispielprojekte - Sie finden sie hier: https://github.com/jobrunr?q=example

## Oder folge mit!
### Fügen Sie die Abhängigkeit zu JobRunr hinzu
Fügen Sie die Abhängigkeit mit dem Build-Tool Ihrer Wahl dem folgenden Artefakt hinzu:
- groupId: `org.jobrunr`
- Artefakt-ID: `jobrunr`
- Version: `${jobrunr.version}`

### Wählen Sie Ihr Speichersystem und konfigurieren Sie JobRunr
Erstellen Sie mit dem RDBMS Ihrer Wahl eine DataSource und übergeben Sie sie an JobRunr:

```java
JobRunr.configure ()
        .useStorageProvider(SqlStorageProviderFactory.using(applicationContext.getBean(DataSource.class)))
        .useJobActivator(applicationContext::getBean)
        .useDefaultBackgroundJobServer()
        .useDashboard()
        .intialize();
```

### Stellen Sie Jobs in die Warteschlange!
```java
BackgroundJob.enqueue (() -> System.out.println ("Simple!"));
```

### Und überwache die Jobs
Gehen Sie mit Ihrem Browser zum JobRunr-Dashboard unter http://localhost:8000/dashboard

## Credits
JobRunr hätte ohne einige andere Projekte nicht existiert und ich möchte ihnen [Kredit]({{<ref "Credits.md">}}) geben.