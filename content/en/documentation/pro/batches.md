---
version: "pro"
title: "Batches"
subtitle: "Batches allow you to create a bunch of background jobs atomically"
date: 2020-08-27T11:12:23+02:00
layout: "documentation"
menu: 
  main: 
    identifier: batches
    parent: 'jobrunr-pro'
    weight: 15
---
{{< trial-button >}}

Batches allow you to create a bunch of background jobs atomically. This means that if there was an exception during the creation of background jobs, none of them will be processed. Consider you want to send 1000 emails to your clients, and they really want to receive these emails. Here is the old way:

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

But what if storage becomes unavailable after enqueueing half of all emails to the users? These emails may be already sent, because worker threads will pick up and process jobs once they are created. And, if you re-execute this code, some of your clients may receive annoying duplicates. So if you want to handle this correctly, you should write more code to track what emails were sent.

__But here is a much simpler method:__

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

#### How does it work?
- All the child jobs (`mailService.send(UUID userId, String mailTemplateKey)`) are not saved using the `ENQUEUED` state but they are saved in the `AWAITING` state.
- In case of an exception while enqueueing all the jobs to send emails to the different users, the `sendEmailToEachSubscriber` (which is the parent job) will retry also automatically thanks to the `RetryFilter`. However, it will first delete all child jobs which are in the `AWAITING` state, thus preventing the possibility to send emails twice.
- When the parent job (`newsletterService.sendEmailToEachSubscriber()`) has completed successfully, all child jobs will be updated to the `ENQUEUED` state and they will start processing.


> To make batches work, it is important that you first schedule a parent job (in this case `BackgroundJob.startBatch(this::sendEmailToEachSubscriber)`) and that you only then schedule the child jobs in __a different method__.

__Note that the following will not work:__
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
<figcaption>This example will not work as JobRunr is unable to analyse a lambda within a lambda</figcaption>
</figure>

## Chaining Batches
Continuations allow you to chain multiple batches together. They will be executed once all background jobs of a parent batch finished. Consider the previous example where you have 1000 emails to send. If you want to make final action after sending, just add a continuation:

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

The sales team will be notified on Slack with a nice report only after each subscriber received an email. The second job (`reportService.createReportForCampaign(String campaignId, String campaignReportLocation)`) will only run if the email was successfully sent to all subscribers. The third job (`notifyService.notifyViaSlack(String channel, String message, String attachmentLocation)`) will only run if the second job succeeded.
</figcaption>
</figure>

So batches and batch continuations allow you to define workflows and configure what actions will be executed in parallel. This is very useful for heavy computational methods as they can be distributed to different machines.

## Complex Workflows
JobRunr allows you to create complex workflows. Within a batch job, you can schedule jobs to execute later, add continuations, add continuations to continuations, etc..

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

Thanks to the enhanced dashboard that comes with JobRunr Pro, you have an in-depth overview of all your different batch jobs.
<figure>
<img src="/documentation/jobrunr-pro-batches.webp" class="kg-image">
<figcaption>The Pro version also gives an overview of all your batches</figcaption>
</figure>

<figure>
<img src="/documentation/jobrunr-pro-batch-details.webp" class="kg-image">
<figcaption>Follow up on your batch jobs thanks to the enhanced job details of a batch job</figcaption>
</figure>

<figure>
<img src="/documentation/jobrunr-pro-batch-details-processing.webp" class="kg-image">
<figcaption>The processing tab within a batch job shows which child jobs are being processed</figcaption>
</figure>

{{< trial-button >}}