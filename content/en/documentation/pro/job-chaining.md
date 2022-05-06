---
title: "Job Chaining"
subtitle: "Reuse existing service methods and chain jobs for cleaner code and and immediate overview of your business process"
date: 2020-08-27T11:12:23+02:00
layout: "documentation"
menu: 
  main: 
    identifier: job-chaining
    parent: 'jobrunr-pro'
    weight: 10
---
{{< trial-button >}}

JobRunr Pro allows you to chain jobs using a fluent API style. This gives you an immediate overview of your business process.

<figure>

```java
@Inject
private ArchiveService archiveService;
@Inject
private NotifyService notifyService;

public void createArchiveAndNotify(String folder) {
    BackgroundJob
        .enqueue(() -> archiveService.createArchive(folder))
        .continueWith(() -> notifyService.notifyViaSlack("ops-team", "The following folder was archived: " + folder))
}

```
<figcaption>

The notification will only be send once the archive was created successfully (and thus the `archiveService.createArchive(String folder)` job succeeded
</figcaption>
</figure>

#### How does it work?
- the first job (`archiveService.createArchive(folder)`) is enqueued and will start processing as soon as some worker threads are available
- the second job (`notifyService.notifyViaSlack(String room, String message)`) will initially be saved using the `AWAITING` state.
- once the first job succeeds, the second job will be enqueued and processed.

> This comes in really handy when using [Batches]({{< ref "batches.md" >}}) - start a new step in your business process when a whole bunch of related jobs have finished.

{{< trial-button >}}