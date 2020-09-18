---
title: "Batch-Jobs"
subtitle: "Mit Batch-Jobs können Sie eine Reihe von Hintergrundjobs atomar erstellen."
date: 2020-08-27T11:12:23+02:00
layout: "documentation"
menu: 
  main: 
    identifier: batches
    parent: 'jobrunr-pro'
    weight: 15
---

Mit Batch-Jobs können Sie eine Reihe von Hintergrundjobs atomar erstellen. Dies bedeutet, dass keine Ausnahme verarbeitet wird, wenn beim Erstellen von Hintergrundjobs eine Ausnahme aufgetreten ist. Stellen Sie sich vor, Sie möchten 1000 E-Mails an Ihre Kunden senden, und diese möchten diese E-Mails wirklich erhalten. Hier ist der alte Weg:

```java
public class NewsletterService {

  @Inject
  private UserRepository userRepository;

  public void sendEmailsToAllSubscribers() {
      List<User> users = userRepository.getAllUsers();
      for(User user : users) {
          BackgroundJob.enqueue(() -> mailService.send(user.getId(), "mail-template-key"));
      }
  }
}
```

Was aber, wenn der Speicher nicht mehr verfügbar ist, nachdem die Hälfte aller E-Mails an die Benutzer gesendet wurde? Diese E-Mails werden möglicherweise bereits gesendet, da Worker-Threads Aufträge abrufen und verarbeiten, sobald sie erstellt wurden. Wenn Sie diesen Code erneut ausführen, erhalten einige Ihrer Clients möglicherweise störende Duplikate. Wenn Sie damit richtig umgehen möchten, sollten Sie mehr Code schreiben, um zu verfolgen, welche E-Mails gesendet wurden.

__Aber hier ist eine viel einfachere Methode:__

```java
public class NewsletterService {

  @Inject
  private UserRepository userRepository;

  public void sendEmailsToAllSubscribers() {
      BackgroundJob.startBatch(this::sendEmailToEachSubscriber);
  }

  public void sendEmailToEachSubscriber() {
      List<User> users = userRepository.getAllUsers();
      for(User user : users) {
          BackgroundJob.enqueue(() -> mailService.send(user.getId(), "mail-template-key"));
      }
  }
}
```
<br>

#### Wie funktioniert es?
- Alle untergeordneten Jobs (`mailService.send(UUID userId, String mailTemplateKey)`) werden nicht im Status `ENQUEUED` gespeichert, sondern im Status `AWAITING`.
- Im Falle einer Ausnahme, während alle Jobs in die Warteschlange gestellt werden, um E-Mails an die verschiedenen Benutzer zu senden, wird der `sendEmailToEachSubscriber` (der übergeordnete Job) dank des "RetryFilter" ebenfalls automatisch wiederholt. Es werden jedoch zuerst alle untergeordneten Jobs gelöscht, die sich im Status "WARTEN" befinden, wodurch die Möglichkeit verhindert wird, E-Mails zweimal zu senden.
- Wenn der übergeordnete Job (`newsletterService.sendEmailToEachSubscriber ()`) erfolgreich abgeschlossen wurde, werden alle untergeordneten Jobs in den Status `ENQUEUED` aktualisiert und beginnen mit der Verarbeitung.


> Damit Batch-Jobs funktionieren, ist es wichtig, dass Sie zuerst einen übergeordneten Job planen (in diesem Fall `BackgroundJob.startBatch(this::sendEmailToEachSubscriber)`) und erst dann die untergeordneten Jobs in einer anderen Methode planen.

__Beachten Sie, dass Folgendes nicht funktioniert:__
<figure>

```java
public class NewsletterService {

    @Inject
    private UserRepository userRepository;

    public void sendEmailToAllSubscribers() {
        BackgroundJob.startBatch(() -> {
            List<User> users = userRepository.getAllUsers();
            for(User user : users) {
                BackgroundJob.enqueue(() -> mailService.send(user.getId(), "mail-template-key"));
            }
        });
    }
}
```
<figcaption> Dieses Beispiel funktioniert nicht, da JobRunr kein Lambda innerhalb eines Lambda analysieren kann. </figcaption>
</figure>

## Batchen verketten
Mit Fortsetzungen können Sie mehrere Stapel miteinander verketten. Sie werden ausgeführt, sobald alle Hintergrundjobs eines übergeordneten Stapels abgeschlossen sind. Betrachten Sie das vorherige Beispiel, in dem Sie 1000 E-Mails senden müssen. Wenn Sie nach dem Senden eine endgültige Aktion ausführen möchten, fügen Sie einfach eine Fortsetzung hinzu:

<figure>

```java
public class NewsletterService {

    @Inject
    private UserRepository userRepository;
    @Inject
    private ReportService reportService;
    @Inject
    private NotifyService notifyService;

    public void sendCampaingEmailToAllSubscribers(String campaignId) {
        String campaignReportLocation = "/path/to/campaign/report/" + campaignId + ".csv";
        BackgroundJob
            .startBatch(this::sendEmailToEachSubscriber)
            .continueWith(() -> reportService.createReportForCampaign(campaignId, campaignReportLocation))
            .continueWith(() -> notifyService.notifyViaSlack("sales-team", "Successfully sent newsletter for campaign " + campaignId, campaignReportLocation));
    }

    public void sendEmailToEachSubscriber() {
        List<User> users = userRepository.getAllUsers();
        for(User user : users) {
            BackgroundJob.enqueue(() -> mailService.send(user.getId(), "mail-template-key"));
        }
    }
}
```
<figcaption>

Das Verkaufsteam wird auf Slack erst dann mit einem netten Bericht benachrichtigt, wenn jeder Abonnent eine E-Mail erhalten hat. Der zweite Job (`reportService.createReportForCampaign (String CampaignId, String CampaignReportLocation)`) wird nur ausgeführt, wenn die E-Mail erfolgreich an alle Abonnenten gesendet wurde. Der dritte Job (`notifyService.notifyViaSlack (String-Kanal, String-Nachricht, String-Anhangsstandort)`) wird nur ausgeführt, wenn der zweite Job erfolgreich war.
</figcaption>
</figure>

Mit Batch-Jobs und Batch-Fortsetzungen können Sie Workflows definieren und konfigurieren, welche Aktionen parallel ausgeführt werden. Dies ist sehr nützlich für umfangreiche Berechnungsmethoden, da diese auf verschiedene Maschinen verteilt werden können.

## Komplexe Workflows
Mit JobRunr können Sie komplexe Workflows erstellen. Innerhalb eines Stapeljobs können Sie Jobs so planen, dass sie später ausgeführt werden, Fortsetzungen hinzufügen, Fortsetzungen zu Fortsetzungen hinzufügen usw.

```java
public void aComplexWorkflow() {
    String campaignReportLocation = "/path/to/campaign/report/" + campaignId + ".csv";
    BackgroundJob
        .startBatch(this::step1)
        .continueWith(() -> System.out.println("Step 2 which will only run after Step 1 completely succeeded"));
}

public void step1() {
  BackgroundJob.enqueue(() -> System.out.println("Step 1A of batch"));
  BackgroundJob
      .schedule(() -> System.out.println("Step 1B of batch which will run tomorrow"), now().add(24, HOURS))
      .continueWith(() -> System.out.println("Step 1C of batch which will run just after Step 1B has succeeded"));
}

```

## Dashboard
Dank des erweiterten Dashboards, das mit JobRunr Pro geliefert wird, haben Sie einen detaillierten Überblick über alle Ihre verschiedenen Stapeljobs.
<figure>
<img src="/documentation/jobrunr-pro-batches.png" class="kg-image">
<figcaption> Die Pro-Version bietet auch einen Überblick über alle Ihre Stapel </figcaption>
</figure>

<figure>
<img src="/documentation/jobrunr-pro-batch-details.png" class="kg-image">
<figcaption> Verfolgen Sie Ihre Stapeljobs dank der erweiterten Jobdetails eines Stapeljobs </figcaption>
</figure>

<figure>
<img src="/documentation/jobrunr-pro-batch-details-processing.png" class="kg-image">
<figcaption> Die Registerkarte Verarbeitung in einem Stapeljob zeigt an, welche untergeordneten Jobs verarbeitet werden </figcaption>
</figure>