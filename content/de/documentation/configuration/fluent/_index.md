---
title: "Fließende API"
keywords: ["JobRunr-Konfiguration"]
subtitle: "Verwenden Sie die Fließende API, um JobRunr in Ihrer Anwendung innerhalb von Minuten zu konfigurieren."
date: 2020-09-16T11:12:23+02:00
layout: "documentation"
menu: 
  main: 
    parent: 'configuration'
    weight: 10
---
## Einreihen und Verarbeiten in derselben JVM-Instanz
JobRunr kann mithilfe der Fluent-API einfach konfiguriert werden, um Jobs in derselben Anwendung in die Warteschlange zu stellen und zu verarbeiten:

```java
@SpringBootApplication
@Import(JobRunrStorageConfiguration.class)
public class WebApplication {

    public static void main(String[] args) {
        SpringApplication.run(WebApplication.class, args);
    }

    @Bean
    public JobScheduler initJobRunr(ApplicationContext applicationContext) {
        return JobRunr.configure()
                .useStorageProvider(SqlStorageProviderFactory
                          .using(applicationContext.getBean(DataSource.class)))
                .useJobActivator(applicationContext::getBean)
                .useDefaultBackgroundJobServer()
                .useJmxExtensions()
                .useDashboard()
                .initialize();
    }
}
```

__Was geschieht hier:__
- Zuerst wird eine Spring-Anwendung erstellt. Dies kann entweder eine CommandLineRunner-Anwendung oder eine WebApplication sein
- Die wichtige Methode hier ist die initJobRunr-Methode:
  - Die Fluent-API wird mit JobRunr.configure () gestartet.
  - Danach wird ein StorageProvider mit einer DataSource erstellt, die in der Spring-Konfigurationsklasse JobRunrStorageConfiguration definiert ist.
  - Es wird ein JobActivator definiert, der die getBean-Methode des Spring ApplicationContext verwendet
  - Der `BackgroundJobServer` selbst wird gestartet
  - `JmxExtensions` are enabled
  - und das Dashboard wird ebenfalls gestartet

In diesem Setup stellt die Anwendung neue Hintergrundjobs in die Warteschlange und verarbeitet sie auch aufgrund der aufgerufenen Methode `useDefaultBackgroundJobServer`.

<br>

## Enqueueing und Verarbeitung in verschiedenen JVM-Instanzen
Im folgenden Setup plant die Anwendung, die Hintergrundjobs in die Warteschlange stellt, typisch für die Webanwendung, nur neue Jobs und verarbeitet keine Hintergrundjobs.

### Hintergrundjobs Einreihen:
Um Hintergrundjobs in die Warteschlange zu stellen, wird die Konfiguration erneut mithilfe der Fluent-API durchgeführt:

```java
@SpringBootApplication
@Import(JobRunrStorageConfiguration.class)
public class WebApplication {

    public static void main(String[] args) {
        SpringApplication.run(WebApplication.class, args);
    }

    @Bean
    public JobScheduler initJobRunr(ApplicationContext applicationContext) {
        return JobRunr.configure()
                .useStorageProvider(SqlStorageProviderFactory
                          .using(applicationContext.getBean(DataSource.class)))
                .initialize();
    }
}
```

__Was geschieht hier:__
- Zuerst wird eine Spring-Anwendung erstellt, in diesem Fall eine Spring-Webanwendung
- Die wichtige Methode hier ist wieder die initJobRunr-Methode:
  - Die Fluent-API wird mit JobRunr.configure () gestartet.
  - Danach wird ein StorageProvider mit einer DataSource erstellt, die in der Spring-Konfigurationsklasse JobRunrStorageConfiguration definiert ist.
  - Die Fluent-API wird mit dem Methodenaufruf initialize beendet, der einen JobScheduler zurückgibt.

> Sie können die JobScheduler-Bean in Klassen, in denen Sie Hintergrundjobs in die Warteschlange stellen möchten, automatisch verdrahten oder die statischen Methoden für BackgroundJob verwenden.

### Hintergrundjobs verarbeiten:
In der Anwendung, die Hintergrundjobs verarbeitet (dies kann eine Spring-Commandline-Runner-Anwendung sein, die mit Jib in einem Docker-Container gepackt ist), wird die Fluent-API erneut verwendet und spricht für sich selbst:

```java
@SpringBootApplication
@Import(JobRunrStorageConfiguration.class)
public class JobServerApplication implements CommandLineRunner {

    public static void main(String[] args) {
        SpringApplication.run(JobServerApplication.class, args);
    }

    @Override
    public void run(String... args) throws InterruptedException {
        Thread.currentThread().join();
    }

    @Bean
    public JobScheduler initJobRunr(ApplicationContext applicationContext) {
        return JobRunr.configure()
                .useStorageProvider(SqlStorageProviderFactory
                          .using(applicationContext.getBean(DataSource.class)))
                .useJobActivator(applicationContext::getBean)
                .useDefaultBackgroundJobServer()
                .useDashboard()
                .initialize();
    }
}
```

__Was geschieht hier:__
- Zuerst wird eine Spring-Anwendung erstellt, in diesem Fall eine Spring-Befehlszeilenanwendung
- Die wichtige Methode hier ist wieder die `initJobRunr` Methode:
  - Die Fluent-API wird mit JobRunr.configure () gestartet.
  - Danach wird ein StorageProvider mit einer DataSource erstellt, die in der Spring-Konfigurationsklasse JobRunrStorageConfiguration definiert ist.
  - Es wird ein JobActivator definiert, der die getBean-Methode des Spring ApplicationContext verwendet
  - Der "BackgroundJobServer" selbst wird mit der "useDefaultBackgroundJobServer" -Methode gestartet
  - Das Dashboard wird ebenfalls gestartet

## Erweiterte Konfiguration

Mit der JobRunr-Konfiguration können Sie JobRunr vollständig nach Ihren Wünschen einrichten:

```java
boolean isBackgroundJobServerEnabled = true; // or get it via ENV variables
boolean isDashboardEnabled = true; // or get it via ENV variables
JobRunr.configure()
            .useJobStorageProvider(jobStorageProvider)
            .useJobActivator(jobActivator)
            .withJobFilter(new RetryFilter(2)) // only do two retries by default
            .useDefaultBackgroundJobServerIf(isBackgroundJobServerEnabled, 4)  // only use 4 worker threads
            .useDashboardIf(isDashboardEnabled, 80) // start on port 80 instead of 8000
            .useJmxExtensions()
            .initialize();

```

> Weitere Optionen finden Sie im JobRunr JavaDoc.