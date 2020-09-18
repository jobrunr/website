---
title: "Konfiguration für Spring"
subtitle: "JobRunr lässt sich in nahezu jedes Framework integrieren - auch in Spring"
date: 2020-09-16T11:12:23+02:00
layout: "documentation"
menu: 
  main: 
    parent: 'configuration'
    weight: 10
---
## Einreihen und Verarbeiten in derselben JVM-Instanz
Wenn Sie mit minimalen Serverressourcen beginnen möchten, ist dies der richtige Weg: Die Anwendung kann Jobs von einer REST-API in die Warteschlange stellen und zurückkehren, ohne den http-Aufruf zu blockieren. Die Verarbeitung erfolgt dann in verschiedenen Hintergrundthreads, jedoch alle innerhalb derselben JVM-Instanz .

```java
@SpringBootApplication
@Import(JobRunrStorageConfiguration.class)
public class WebApplication {

    public static void main(String[] args) {
        SpringApplication.run(WebApplication.class, args);
    }

    @Bean
    public BackgroundJobServer backgroundJobServer(StorageProvider storageProvider, JobActivator jobActivator) {
        final BackgroundJobServer backgroundJobServer = new BackgroundJobServer(storageProvider, jobActivator);
        backgroundJobServer.start();
        return backgroundJobServer;
    }

    @Bean
    public JobRunrDashboardWebServer dashboardWebServer(StorageProvider storageProvider, JsonMapper jsonMapper) {
        final JobRunrDashboardWebServer jobRunrDashboardWebServer = new JobRunrDashboardWebServer(storageProvider, jsonMapper);
        jobRunrDashboardWebServer.start();
        return jobRunrDashboardWebServer;
    }

    @Bean
    public JobActivator jobActivator(ApplicationContext applicationContext) {
        return applicationContext::getBean;
    }

    @Bean
    public JobScheduler jobScheduler(StorageProvider storageProvider) {
        JobScheduler jobScheduler = new JobScheduler(storageProvider);
        BackgroundJob.setJobScheduler(jobScheduler);
        return jobScheduler;
    }

    @Bean
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

    @Bean
    public JobMapper jobMapper(JsonMapper jsonMapper) {
        return new JobMapper(jsonMapper);
    }

    @Bean
    public JsonMapper jsonMapper() {
        return new JacksonJsonMapper();
    }

}
```
__Was geschieht hier:__
- Eine BackgroundJobServer-Bean wird mit einem StorageProvider und einem JobActivator erstellt. Diese Bean ist für die Verarbeitung aller Hintergrundjobs verantwortlich.
- Das `JobRunrDashboardWebServer` Bean ist definiert, der die Verarbeitung aller Jobs visualisiert und den `StorageProvider` und den `JsonMapper` verbraucht
- Der `JobActivator` ist definiert und verwendet den Spring-Anwendungskontext, um die richtige Bean zu finden, auf der die Hintergrundjobmethode aufgerufen werden kann.
- Die `JobScheduler` Bean ist definiert, mit der Jobs in die Warteschlange gestellt werden können. Durch Hinzufügen des "JobScheduler" auch zur "BackgroundJob" -Klasse können die statischen Methoden für "BackgroundJob" direkt aufgerufen werden, und es ist nicht erforderlich, den "JobScheduler" in Klassen einzufügen, in denen Hintergrundjobs in die Warteschlange gestellt werden - dies ist natürlich eine Angelegenheit Des Geschmacks.
- Eine `StorageProvider`-Bean wird mit einer` DataSource` und einem` JobMapper` erstellt
- In diesem Beispiel wird eine SQLiteDataSource verwendet
- Ein JobMapper wird mit einem JsonMapper definiert, der die Verantwortung hat, die Hintergrundjobs Json zuzuordnen
- Ein `JsonMapper` wird erstellt, in diesem Fall handelt es sich um einen` JacksonJsonMapper`

<br>

## Einreihen und Verarbeitung in verschiedenen JVM-Instanzen
JobRunr kann wie jede andere Spring Bean konfiguriert werden. In diesem Beispiel wird eine gemeinsam genutzte Konfiguration in einer JobRunrStorageConfiguration-Klasse definiert, die später importiert wird.

### Gemeinsame Konfiguration

```java
@Configuration
@ComponentScan(basePackageClasses = JobRunrStorageConfiguration.class)
public class JobRunrStorageConfiguration {

    @Bean
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

    @Bean
    public JobMapper jobMapper(JsonMapper jsonMapper) {
        return new JobMapper(jsonMapper);
    }

    @Bean
    public JsonMapper jsonMapper() {
        return new JacksonJsonMapper();
    }

}
```

__Was geschieht hier:__
- Eine `StorageProvider`-Bean wird mit einer` DataSource` und einem` JobMapper` erstellt
- In diesem Beispiel wird eine SQLiteDataSource verwendet
- Ein `JobMapper` wird mit einem `JsonMapper` definiert, der die Verantwortung hat, die Hintergrundjobs Json zuzuordnen
- Ein `JsonMapper` wird erstellt, in diesem Fall handelt es sich um einen` JacksonJsonMapper`


### WebApp-Konfiguration
In der WebApp-Konfiguration wird die freigegebene Konfiguration wiederverwendet:

```java
@SpringBootApplication
@Import(JobRunrStorageConfiguration.class)
public class WebApplication {

    public static void main(String[] args) {
        SpringApplication.run(WebApplication.class, args);
    }

    @Bean
    public JobScheduler jobScheduler(StorageProvider storageProvider) {
        JobScheduler jobScheduler = new JobScheduler(storageProvider);
        BackgroundJob.setJobScheduler(jobScheduler);
        return jobScheduler;
    }
}
```

Die einzige zusätzliche Bean, die hier definiert ist, ist die `JobScheduler`-Bean. Durch Hinzufügen des `JobScheduler` auf die `BackgroundJob` -Klasse können die statischen Methoden von dem `BackgroundJob` direkt aufgerufen werden, und es ist nicht erforderlich, den `JobScheduler` in Klassen zu injectieren, in denen Hintergrundjobs in die Warteschlange gestellt werden - dies ist natürlich eine Angelegenheit Des Geschmacks.

### Konfiguration des Hintergrund-Jobservers
Die Konfiguration des Hintergrund-Jobservers verwendet die freigegebene Konfiguration erneut:

```java
@SpringBootApplication
@Import(JobRunrStorageConfiguration.class)
public class JobServerApplication implements CommandLineRunner {

    public static void main(String[] args) {
        SpringApplication.run(JobServerApplication.class, args);
    }

    @Override
    public void run(String... args) throws InterruptedException {
        Thread.currentThread().join(); // keep running forever
    }

    @Bean
    public JobRunrDashboardWebServer dashboardWebServer(StorageProvider storageProvider, JsonMapper jsonMapper) {
        final JobRunrDashboardWebServer jobRunrDashboardWebServer = new JobRunrDashboardWebServer(storageProvider, jsonMapper);
        jobRunrDashboardWebServer.start();
        return jobRunrDashboardWebServer;
    }

    @Bean
    public BackgroundJobServer backgroundJobServer(StorageProvider storageProvider, JobActivator jobActivator) {
        final BackgroundJobServer backgroundJobServer = new BackgroundJobServer(storageProvider, jobActivator);
        backgroundJobServer.start();
        return backgroundJobServer;
    }

    @Bean
    public JobActivator jobActivator(ApplicationContext applicationContext) {
        return applicationContext::getBean;
    }
}
```

Hier werden drei zusätzliche Beans definiert:
- der `JobRunrDashboardWebServer`, der die Verarbeitung aller Jobs visualisiert und den `StorageProvider` und `JsonMapper` verwendet, die in der gemeinsam genutzten Konfiguration definiert sind
- Der `BackgroundJobServer` ist definiert und verbraucht erneut den `StorageProvider` und den `JobActivator`
- Der `JobActivator` ist definiert und verwendet den Spring-Anwendungskontext, um die richtige Bean zu finden, auf der die Hintergrundjobmethode aufgerufen werden kann.

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