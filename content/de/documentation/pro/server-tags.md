---
title: "Server Tags"
subtitle: "Mit Server-Tags können Sie Jobs nach bestimmten Tags filtern, sodass sie nur auf bestimmten Servern ausgeführt werden."
date: 2020-08-27T11:12:23+02:00
layout: "documentation"
menu: 
  main: 
    identifier: server-tags
    parent: 'jobrunr-pro'
    weight: 20
---
Haben Sie einige Jobs, die nur auf bestimmten Servern ausgeführt werden können (z. B. Jobs, die an ein bestimmtes Betriebssystem wie Linux, Max und Windows gebunden sind)? JobRunr hat Sie mit Server-Tags abgedeckt!

Ein `BackgroundJobServer` kann mehrere Server-Tags haben und ein Job kann nur ein Server-Tag über die Job-Annotation angeben. Wenn das Server-Tag des Jobs mit einem der Server-Tags des Servers übereinstimmt, kann der Server den Job ausführen.

> Jeder `BackgroundJobServer` und jeder `Job` ist standardmäßig mit dem `DEFAULT` -Tag gekennzeichnet. Dies stellt sicher, dass er trotzdem ausgeführt wird, wenn Sie im `Job` kein Tag angeben.

## Verwendung
Die Verwendung von Server-Tags ist dank der Annotation `Job` genauso einfach wie die Verwendung von Warteschlangen. Fügen Sie es einfach Ihrer Dienstmethode hinzu und geben Sie an, auf welchem ​​Server Ihr Hintergrundjob ausgeführt werden soll.
<figure>

```java
@Job(runOnServerWithTag =  LINUX)
public void doWorkOnLinuxServers() {
    System.out.println("This will only run on a server tagged with LINUX");
}
```
</figure>
<br>

## Konfiguration
Die Konfiguration ist sowohl in der fließenden API als auch in der Spring-Konfiguration einfach:

### Fließenden API
Übergeben Sie mit der fließenden API alle Server-Tags als Strings (oder String-Konstanten) an die `BackgroundJobServerConfiguration`.

<figure>

```java
JobRunrPro
    .configure()
    .useDefaultBackgroundJobServer(usingStandardBackgroundJobServerConfiguration().andTags(LINUX, MACOS))
    ...
```
<figcaption> Geben Sie beim Konfigurieren von Server-Tags alle Server-Tags für diesen Server an. </figcaption>
</figure>

### Spring-konfiguration
Für die Spring-konfiguration ist es genau das gleiche.

<figure>

```java
@Bean
public BackgroundJobServer backgroundJobServer(StorageProvider storageProvider, JobActivator jobActivator) {
    final BackgroundJobServer backgroundJobServer = new BackgroundJobServer(storageProvider, jobActivator, 
        usingStandardBackgroundJobServerConfiguration().andTags(LINUX, MACOS));
    backgroundJobServer.start();
    return backgroundJobServer;
}
```
<figcaption>

Erstellen Sie eine `BackgroundJobServer` -Instanz und übergeben Sie die Server-Tags mithilfe der Konfiguration </figcaption>
</figure>

