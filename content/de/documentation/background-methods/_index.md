---
title: "Hintergrundmethoden"
subtitle: "Hintergrundjobs in JobRunner sind nur Java 8-Lambdas - super-einfach!"
date: 2020-04-30T11:12:23+02:00
layout: "documentation"
menu: 
  main: 
    identifier: background-methods
    parent: 'documentation'
    weight: 15
---
Hintergrundjobs in JobRunr sehen aus wie normale Methodenaufrufe. Hintergrundjobs können wie im folgenden Beispiel sowohl Instanz- als auch statische Methodenaufrufe verwenden.

```java
BackgroundJob.enqueue<EmailSender>(x -> x.send("jobrunr@example.com"));
```

```java
BackgroundJob.enqueue(() -> System.out.println("Hello, world!"));
```

Im Gegensatz zu üblichen Methodenaufrufen, die sofort ausgeführt werden, handelt es sich bei diesen Methoden tatsächlich um Java 8-Funktionsschnittstellen, die asynchron und - je nach Konfiguration - auch außerhalb der aktuellen JVM ausgeführt werden. Der Zweck der obigen Methodenaufrufe besteht also darin, die folgenden Informationen zu sammeln und zu serialisieren:

- Geben Sie den Namen einschließlich des Pakets ein.
- Methodenname und seine Parametertypen.
- Argument values.

> Wichtig: Auf allen Servern muss dieselbe Version Ihres Codes ausgeführt werden. Wenn Ihr Webapp-Server eine neuere Version mit einer Methodensignatur hat, die nicht mit dem Server kompatibel ist, der Ihre Hintergrundjobs verarbeitet, wird eine NoSuchMethod-Ausnahme ausgelöst und die Jobverarbeitung schlägt fehl! Ab JobRunr v1.1.0 zeigt das Dashboard einen Fehler an, wenn Jobs nicht gefunden werden können.

Die Serialisierung wird entweder von Jackson, Gson oder Json-B durchgeführt, und der resultierende JSON, der wie im folgenden Snippet aussieht, wird in einem "StorageProvider" beibehalten, der ihn für andere Verarbeitungen in einem anderen Thread oder sogar einer anderen JVM verfügbar macht. Wie wir sehen können, wird alles als Wert übergeben, sodass auch schwere Datenstrukturen serialisiert werden und viele Bytes in der RDBMS- oder NoSQL-Datenbank verbrauchen.

<figure>

```json
{
  "lambdaType": "org.jobrunr.jobs.lambdas.JobLambda",
  "className": "java.lang.System",
  "staticFieldName": "out",
  "methodName": "println",
  "jobParameters": [
    {
      "className": "java.lang.String",
      "object": "a test"
    }
  ]
}
```
<figcaption> die serialisierten Jobdetails</figcaption>
</figure>

## Parameters
Sie können Parameter an Ihre Hintergrundjobmethoden weitergeben, diese sollten jedoch so klein wie möglich gehalten werden. Ein Parameter muss entweder sein:

ein Klasse von java.lang wie String, Integer, ...
eine benutzerdefinierte Klasse mit einem Standardkonstruktor ohne Argumente - dies, um sie vom `StorageProvider` zu deserialisieren