---
version: "professional"
title: "Custom delete policy"
subtitle: "You probably like clean code - then you also like a clean JobRunr Dashboard."
date: 2021-06-24T11:12:23+02:00
layout: "documentation"
menu: 
  main: 
    identifier: custom-delete-policy
    parent: 'jobrunr-pro'
    weight: 30
---
{{< trial-button >}}

Do you have a recurring job that triggers every 5 minutes and only does a small check to see whether something needs to be processed? 95% of the time there is probably nothing to do and the job succeeds immediately. But, all these recurring jobs fill up your JobRunr Dashboard (a huge amount of succeeded and deleted jobs) and also fill up your database. 

JobRunr already allows you to configure the deletion policy for all jobs in the JobRunr configuration. By default, succeeded jobs will go to the deleted state after 36 hours and they will then be permanently deleted after 72 hours.

Thanks to the `deleteOnSuccess` and `deleteOnFailure` attributes on the `@Job` annotation you know have fine-grained control per Job on when it will move from the `Succeeded` state to the `Deleted` state and when the `Job` will be deleted permanently.

## Usage

### Using Java 8 lambda's
Specifying a custom delete policy for a job is easy thanks to the `Job` annotation. Just add it to your service method and specify when you want your job to be deleted.
<figure>

```java
@Job(deleteOnSuccess="PT10M!PT10M")
public void startImportingFilesIfPresent() {
    if(Files.list(importDirectory).findAny()) {
        BackgroundJob.enqueue(() -> fileImportService.import(Files.list(importDirectory).collect(toList())));
    }
}
```
</figure>

### Using JobRequest and JobRequestHandler
When you are using a `JobRequest` and a `JobRequestHandler`, just add the `@Job` annotation to the run method of the handler.
<figure>

```java
public class ImportFilesJobRequest implements JobRequest {

    public final String folder;

    public ImportFilesJobRequest(String folder) {
        this.folder = folder;
    }

    @Override
    public Class<? extends JobRequestHandler> getJobRequestHandler() {
        return ImportFilesJobRequestHandler.class;
    }
}

@Component
public class ImportJobRequestHandler implements JobRequestHandler<ImportFilesJobRequest> {

    @Job(deleteOnSuccess="PT10M!PT10M")
    public void run(ImportFilesJobRequest importFiles) {
        // business logic here
    }
}

```
</figure>

### Using the `JobBuilder` pattern
If you prefer the `JobBuilder` pattern, you can again pass the `deleteOnSuccess` and `deleteOnFailure` to the builder.
<figure>

```java
jobScheduler.create(aJob()
        .withDeleteOnSuccess(Duration.ofHours(1))
        .withDeleteOnFailure(Duration.ofHours(8))
        .withDetails(() -> System.out.println("This job will move to the deleted state after 1 hour if it succeeded and after 8 hours if it failed."));
```
</figure>

<br>

The `deleteOnSuccess` and `deleteOnFailure` attribute accept the following string format: `duration1!duration2`:
- `duration1` (optional): the duration in [ISO8601 format](https://en.wikipedia.org/wiki/ISO_8601#Durations) before the job will move from `Succeeded` or `Failed` to `Deleted`
- `!` (optional): a separator
- `duration2` (optional): the duration in [ISO8601 format](https://en.wikipedia.org/wiki/ISO_8601#Durations) before the job will be permanently deleted

Below is a table with some examples:

| Format       | From `Succeeded` or `Failed` to `Deleted` | From `Deleted` to permanently deleted                  |
|--------------|-------------------------------------------|--------------------------------------------------------|
| `PT10M`      | After 10 minutes                          | After default configured in `deleteSucceededJobsAfter` |
| `PT10M!PT2H` | After 10 minutes                          | After 2 hours                                          |
| `P2DT10M!`   | After 2 days and 10 minutes               | Immediately (won't be available in `Deleted` state)    |
| `!PT2H`      | Immediately                               | After 2 hours                                          |

As you can specify both `deleteOnSuccess` and `deleteOnFailure`, this means you can keep failed jobs around longer (to see what went wrong). If you don't specify `deleteOnFailure`, it falls back to JobRunr's default which means the job will stay in the `Failed` state until manual action is taken.

{{< trial-button >}}