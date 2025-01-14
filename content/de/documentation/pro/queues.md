---
title: "Warteschlangen"
subtitle: "Warteschlangen stellen sicher, dass Ihre kritischen Geschäftsprozesse pünktlich abgeschlossen werden."
date: 2020-08-27T11:12:23+02:00
layout: "documentation"
menu: 
  main: 
    identifier: queues
    parent: 'jobrunr-pro'
    weight: 1
---
Verarbeiten Sie Millionen von Jobs? Haben Sie einige High-Prio-Jobs, die schnell erledigt werden müssen? Verwenden Sie JobRunr-Warteschlangen, um sicherzustellen, dass kritische Jobs vor bereits in die Warteschlange gestellten Jobs geschnitten werden.

## Verwendung
Die Verwendung von Warteschlangen hätte dank der Annotation "Job" nicht einfacher sein können. Fügen Sie es einfach Ihrer Servicemethode hinzu und geben Sie an, in welcher Warteschlange Sie es ausführen möchten.

```java
public static final String HighPrioQueue = "high-prio";
public static final String DefaultQueue = "default";
public static final String LowPrioQueue = "low-prio";

public void runJobs() {
    BackgroundJob.enqueue(this::startJobOnLowPrioQueue);
    BackgroundJob.enqueue(this::startJobOnDefaultQueue);
    BackgroundJob.enqueue(this::startJobOnHighPrioQueue);
}

@Job(queue = HighPrioQueue)
public void startJobOnHighPrioQueue() {
    System.out.println("This job will bypass all other enqueued jobs.");
}

@Job(queue = DefaultQueue)
public void startJobOnDefaultQueue() {
    System.out.println("This job will only bypass jobs on the LowPrioQueue");
}

@Job(queue = LowPrioQueue)
public void startJobOnLowPrioQueue() {
    System.out.println("This job will only start when all other jobs on the HighPrioQueue and DefaultQueue are finished.");
}

```

<br/>

## Konfiguration
Die Konfiguration ist sowohl in der fließenden API als auch in der Spring-Konfiguration einfach:

### Fließenden API
Geben Sie unter Verwendung der fließenden API zuerst alle Warteschlangen als Zeichenfolgen (oder Zeichenfolgenkonstanten) an und setzen Sie dann die Konfiguration wie gewohnt fort.

<figure>

```java
JobRunrPro
    .configure()
    .useQueues(DefaultQueue, HighPrioQueue, DefaultQueue, LowPrioQueue)
    ...
```
<figcaption> Geben Sie beim Konfigurieren von Warteschlangen zuerst die Standardwarteschlange für alle Jobs an und dann alle Warteschlangen von der höchsten zur niedrigsten Priorität. Durch die Verwendung von Konstanten bleibt der Code lesbar. </figcaption>
</figure>

### Spring-Konfiguration
Definieren Sie für die Spring-Konfiguration einfach eine zusätzliche Bean vom Typ "Queues" und übergeben Sie sie an "JobRunrDashboardWebServer" und "JobScheduler".

<figure>

```java
    @Bean
    public Queues queues() {
        return new Queues(defaultQueue, queues);
    }

    @Bean
    public JobRunrDashboardWebServer dashboardWebServer(StorageProvider storageProvider, JsonMapper jsonMapper, Queues queues) {
        final JobRunrDashboardWebServer jobRunrDashboardWebServer = new JobRunrDashboardWebServer(storageProvider, jsonMapper, queues);
        jobRunrDashboardWebServer.start();
        return jobRunrDashboardWebServer;
    }

    @Bean
    public JobScheduler jobScheduler(StorageProvider storageProvider, Queues queues) {
        JobScheduler jobScheduler = new JobScheduler(storageProvider, queues);
        BackgroundJob.setJobScheduler(jobScheduler);
        return jobScheduler;
    }
  
```
<figcaption> Erstellen Sie eine Queues-Bean mit den verschiedenen Warteschlangen und übergeben Sie sie an JobRunrDashboardWebServer und JobScheduler </figcaption>
</figure>

## Dashboard

Die Pro-Version von JobRunr verfügt über ein erweitertes Dashboard, das Ihnen die verschiedenen Warteschlangen anzeigt.

![](/documentation/jobrunr-pro-enqueued.webp "Dank Warteschlangen haben wir einen Überblick darüber, wie viele Jobs in der High-Prio-Warteschlange, der Standardwarteschlange und der Low-Prio-Warteschlange in die Warteschlange gestellt werden")
