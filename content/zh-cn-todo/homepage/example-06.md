---
title: "Job chaining"
type: homepage-example-bis
link: 'documentation/pro/job-chaining/'
badge: PRO
weight: 6
---
Specify a queue to bypass all jobs already enqueued so your critical business processes finish on-time.

```java
BackgroundJob
    .enqueue(() -> archiveService.createArchive(folder))
    .continueWith(() -> notifyService.notifyViaSlack("ops-team", "Folder archived: " + folder))
```