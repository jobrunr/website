---
title: "Konfiguration für Quarkus"
subtitle: "JobRunr lässt sich in nahezu jedes Framework integrieren - auch in Quarkus"
date: 2020-09-16T11:12:23+02:00
layout: "documentation"
menu: 
  main: 
    parent: 'configuration'
    weight: 15
---
## Einreihen und Verarbeiten in derselben JVM-Instanz in Quarkus
Hier finden Sie ein beispiel wie Sie JobRunr in Quarkus integrieren können.


```java
public class JobRunrProvider {

    @Produces
    @Singleton
    public BackgroundJobServer backgroundJobServer(StorageProvider storageProvider, JobActivator jobActivator) {
        final BackgroundJobServer backgroundJobServer = new BackgroundJobServer(storageProvider, jobActivator);
        backgroundJobServer.start();
        return backgroundJobServer;
    }

    @Produces
    @Singleton
    public JobRunrDashboardWebServer dashboardWebServer(StorageProvider storageProvider, JsonMapper jsonMapper) {
        final JobRunrDashboardWebServer jobRunrDashboardWebServer = new JobRunrDashboardWebServer(storageProvider, jsonMapper);
        jobRunrDashboardWebServer.start();
        return jobRunrDashboardWebServer;
    }

    @Produces
    @Singleton
    public JobActivator jobActivator() {
        return new JobActivator() {
            @Override
            public <T> T activateJob(Class<T> aClass) {
                return CDI.current().select(aClass).get();
            }
        };
    }

    @Produces
    @Singleton
    public JobScheduler jobScheduler(StorageProvider storageProvider) {
        JobScheduler jobScheduler = new JobScheduler(storageProvider);
        BackgroundJob.setJobScheduler(jobScheduler);
        return jobScheduler;
    }

    @Produces
    @Singleton
    public StorageProvider storageProvider(DataSource dataSource, JobMapper jobMapper) {
        final SqLiteStorageProvider sqLiteStorageProvider = new SqLiteStorageProvider(dataSource);
        sqLiteStorageProvider.setJobMapper(jobMapper);
        return sqLiteStorageProvider;
    }

    @Bean
    public SQLiteDataSource dataSource() {
        final SQLiteDataSource dataSource = new SQLiteDataSource();
        dataSource.setUrl("jdbc:sqlite:" + Paths.get(System.getProperty("java.io.tmpdir"), "jobrunr.db"));
        return dataSource;
    }

    @Produces
    @Singleton
    public JobMapper jobMapper(JsonMapper jsonMapper) {
        return new JobMapper(jsonMapper);
    }

    @Produces
    @Singleton
    public JsonMapper jsonMapper() {
        return new JacksonJsonMapper();
    }

}
```
__Was geschieht hier:__
- Eine BackgroundJobServer-Singleton wird mit einem StorageProvider und einem JobActivator erstellt. Diese Singleton ist für die Verarbeitung aller Hintergrundjobs verantwortlich.
- Das `JobRunrDashboardWebServer` Singleton ist definiert, der die Verarbeitung aller Jobs visualisiert und den `StorageProvider` und den `JsonMapper` verbraucht
- Der `JobActivator` ist definiert und verwendet den Spring-Anwendungskontext, um die richtige Singleton zu finden, auf der die Hintergrundjobmethode aufgerufen werden kann.
- Die `JobScheduler` Singleton ist definiert, mit der Jobs in die Warteschlange gestellt werden können. Durch Hinzufügen des "JobScheduler" auch zur "BackgroundJob" -Klasse können die statischen Methoden für "BackgroundJob" direkt aufgerufen werden, und es ist nicht erforderlich, den "JobScheduler" in Klassen einzufügen, in denen Hintergrundjobs in die Warteschlange gestellt werden - dies ist natürlich eine Angelegenheit Des Geschmacks.
- Eine `StorageProvider`-Singleton wird mit einer` DataSource` und einem` JobMapper` erstellt
- In diesem Beispiel wird eine SQLiteDataSource verwendet
- Ein JobMapper wird mit einem JsonMapper definiert, der die Verantwortung hat, die Hintergrundjobs Json zuzuordnen
- Ein `JsonMapper` wird erstellt, in diesem Fall handelt es sich um einen` JacksonJsonMapper`

<br>

## Erweiterte Konfiguration

Mit der JobRunr-Konfiguration können Sie JobRunr vollständig nach Ihren Wünschen einrichten.

### BackgroundJobServer
Sie können die Anzahl der Arbeitsthreads und die verschiedenen `JobFilter` konfigurieren, die der `BackgroundJobServer` ausführen soll:

```java
BackgroundJobServer backgroundJobServer = new BackgroundJobServer(storageProvider, jobActivator, usingStandardBackgroundJobServerConfiguration().andWorkerCount(workerCount));
backgroundJobServer.setJobFilters(List.of(new RetryFilter(2)));
backgroundJobServer.start();
```

### DashboardWebServer
Es können auch einige Optionen des `DashboardWebServer` konfiguriert werden:

```java
int portOnWhichToRunDashboard = 8080;
JobRunrDashboardWebServer dashboardWebServer = new JobRunrDashboardWebServer(storageProvider, jsonMapper, portOnWhichToRunDashboard);
dashboardWebServer.start();
```


> Weitere Optionen finden Sie im JobRunr JavaDoc.