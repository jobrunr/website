---
version: "pro"
title: "Workflows using Job Chains"
subtitle: "Reuse existing service methods and chain jobs for cleaner code and an immediate overview of your business process"
keywords: ["workflows", "job chains", "process workflow", "process management software", "creating workflows", "business workflow", "business workflow", "business process workflow", "workflow example", "it workflow", "example of workflow process", "workflow pro"]
date: 2020-08-27T11:12:23+02:00
layout: "documentation"
menu: 
  main: 
    identifier: job-chaining
    parent: 'jobrunr-pro'
    weight: 10
---
{{< trial-button >}}

JobRunr's job chaining and workflow capabilities enhance software development efficiency by enabling logical task sequencing and complex workflow management. This setup ensures tasks execute in order, maintaining data integrity and operational consistency, especially when subsequent processes depend on earlier outcomes. The Pro version offers advanced controls and insights, further optimizing performance and providing you with an instant overview of your business process.

> This comes in really handy when using [Batches]({{< ref "batches.md" >}}) - start a new step in your business process when a whole bunch of related jobs have finished.

### Job chaining via `continueWith` and `onFailure`

###### Running a job after another job succeeded
<figure>

```java
@Inject
private ArchiveService archiveService;
@Inject
private NotifyService notifyService;

public void createArchiveAndNotify(String folder) {
    BackgroundJob
        .enqueue(() -> archiveService.createArchive(folder))
        .continueWith(() -> notifyService.notifyViaSlack("ops-team", "The following folder was archived: " + folder));
}

```
<figcaption>

The notification will only be sent if the archive is created successfully, and thus the `archiveService.createArchive(String folder)` job succeeded.
</figcaption>
</figure>

> Do you have other tasks to run after the slack notification is sent? You can keep on chaining jobs using `continueWith`. <b>BUT</b> if at any step of the chain, a job fails, JobRunr will not execute the remaining tasks in the chain.

###### Running a job after another job failed
<figure>

```java
@Inject
private ArchiveService archiveService;
@Inject
private NotifyService notifyService;

public void createArchiveAndNotify(String folder) {
    BackgroundJob
        .enqueue(() -> archiveService.createArchive(folder))
        .onFailure(() -> notifyService.notifyViaSlack("ops-team", "The following folder could NOT be archived: " + folder));
}

```
<figcaption>

The notification will only be sent if the archive could not be created, and thus the `archiveService.createArchive(String folder)` job failed.
</figcaption>
</figure>

> Contrary to `continueWith`, `onFailure` does not allow for the chain to continue. If you try, the editor will complain as the method returns `void`. Essentially, `onFailure` indicates the end of the chain.

###### Running a job after another job succeeded or failed
<figure>

```java
@Inject
private ArchiveService archiveService;
@Inject
private NotifyService notifyService;

public void createArchiveAndNotify(String folder) {
    BackgroundJob
        .enqueue(() -> archiveService.createArchive(folder))
        .continueWith(
            () -> notifyService.notifyViaSlack("ops-team", "The following folder was archived: " + folder), // on success
            () -> notifyService.notifyViaSlack("ops-team", "The following folder could NOT be archived: " + folder) // on failure
        );
}

```
<figcaption>

The first notification will only be sent if the archive is created, and thus the `archiveService.createArchive(String folder)` job failed. While the second notification is sent only if the archive could not be created, and thus the `archiveService.createArchive(String folder)` job failed.
</figcaption>
</figure>

> Yes, here too you can keep the chain going using `continueWith`! If the previous job succeeds, the `on success` job is executed. <b>BUT</b> if at any step of the chain, a job fails, JobRunr will end the chain with the execution of the `on failure` task. Essentially, the execution of a `on failure` job always ends the chain, while execution of a `on success` job keeps the chain going.

### Job chaining when using the  `JobBuilder`
If you are using the `JobBuilder` pattern, this is also possible by means of the `runAfter` method.

<figure>

```java
@Inject
private ArchiveService archiveService;
@Inject
private NotifyService notifyService;

public void createArchiveAndNotify(String folder) {
    JobId createArchiveJobId = BackgroundJob
        .create(aJob()
            .withDetails(() -> archiveService.createArchive(folder)));

    JobId notifyViaSlackJobId = BackgroundJob
        .create(aJob()
            .runAfter(createArchiveJobId)
            .withDetails(() -> notifyService.notifyViaSlack("ops-team", "The following folder was archived: " + folder)));
}

```
<figcaption>

The notification will only be sent once the archive is created successfully, and thus the `archiveService.createArchive(String folder)` job succeeded.
</figcaption>
</figure>

#### How does it work?
- the first job (`archiveService.createArchive(folder)`) is enqueued and will start processing as soon as some worker threads are available
- the second job (`notifyService.notifyViaSlack(String room, String message)`) will initially be saved using the `AWAITING` state.
- once the first job either succeeds or fails, JobRunr will look for the relevant job to enqueue and process.

> Note: you shouldn't expect `notifyViaSlack` to be the exact first job executed by JobRunr after `createArchive`. The reason being that JobRunr runs tasks in the order they are `ENQUEUED` (unless [priorities]({{< ref "priority-queues.md" >}}) are involved).

{{< trial-button >}}