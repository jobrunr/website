---
title: "Spring Boot Starter"
subtitle: "JobRunr bietet dank des jobrunr-spring-boot-starter eine hervorragende Spring-unterstützung."
date: 2020-09-16T11:12:23+02:00
layout: "documentation"
menu: 
  main: 
    parent: 'configuration'
    weight: 10
---
Die Integration mit Spring kann mit dem `jobrunr-spring-boot-starter` nicht einfacher sein!

## Fügen Sie die Abhängigkeit zum Starter hinzu
Da der `jobrunr-spring-boot-starter` in Maven Central verfügbar ist, müssen Sie lediglich die Abhängigkeit hinzufügen:
### Maven
```xml
<dependency> 
    <groupId>org.jobrunr</groupId> 
    <artifactId>jobrunr-spring-boot-starter</artifactId> 
    <version>${jobrunr.version}</version> 
</dependency>
```

### Gradle
```java
implementation 'org.jobrunr:jobrunr-spring-boot-starter:${jobrunr.version}'
```
<br/>

## Configure JobRunr
JobRunr kann einfach in Ihren `application.properties` konfiguriert werden. Wenn Sie nur Jobs planen möchten, müssen Sie nichts tun. Wenn Sie einen `BackgroundJobServer` zum Verarbeiten von Hintergrundjobs oder zum Aktivieren des Dashboards benötigen, fügen Sie der `application.properties` einfach die folgenden Eigenschaften hinzu:

```
org.jobrunr.background_job_server=true
org.jobrunr.dashboard=true
```

Diese sind standardmäßig deaktiviert, damit Ihre Webanwendung nicht versehentlich mit der Verarbeitung von Jobs beginnt.


> Der Jobrunr-Spring-Boot-Starter versucht entweder, eine vorhandene DataSource-Bean für relationale Datenbanken zu verwenden, oder er verwendet eine der bereitgestellten NoSQL-Client-Beans (wie `MongoClient` für MongoDB, `RestHighLevelClient` für ElasticSearch und `JedisPool` oder `RedisClient` für Redis). <br/>
> Wenn keine solche Bean definiert ist, müssen Sie sie entweder definieren oder selbst eine `StorageProvider`-Bean erstellen.

## Erweiterte Konfiguration
Jeder Aspekt von JobRunr kann über die `application.properties` konfiguriert werden. Nachfolgend finden Sie alle Einstellungen einschließlich des Standardwerts.

```
org.jobrunr.job_scheduler=true
org.jobrunr.background_job_server=false
org.jobrunr.background_job_server.worker_count=8 #this value normally is defined by the amount of CPU's that are available
org.jobrunr.background_job_server.poll_interval=15 #check for new work every 15 seconds
org.jobrunr.background_job_server.delete_succeeded_jobs_after=36 #succeeded jobs will go to the deleted state after 36 hours
org.jobrunr.background_job_server.permanently_delete_deleted_jobs_after=72 #deleted jobs will be deleted permanently after 72 hours
org.jobrunr.dashboard=false
org.jobrunr.dashboard.port=8000 #the port on which to start the dashboard
```