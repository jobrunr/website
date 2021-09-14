---
title: "JobRunr Pro Release v3.2.0"
summary: "Clean code - clean dashboard!"
feature_image: /blog/New-Release.webp
date: 2021-06-24T21:00:00+02:00
author: "Ronald Dehuysser"
tags:
  - blog
---
### Celebration time!
I'm pleased to announce the release of JobRunr Pro v3.2.0. It is now available for all users with a JobRunr Pro subscription (so 1 - yes one/uno/eins/eentje 🤣). 

I will also blog a little bit more about the Pro releases - I think I did not give these JobRunr Pro releases enough <span style="color:red">♥</span>.

### Keeping it clean...
Do you have a recurring job that triggers every 5 minutes and only does a small check to see whether something needs to be processed? 99% of the time there is probably nothing to do and the job succeeds immediately. But, all these recurring jobs fill up your JobRunr Dashboard (a huge amount of succeeded and deleted jobs) and also fill up your database. 

Well, no more! Thanks to two brand new attributes on the `@Job` annotation, you can now easily decide how fast succeeded and failed jobs are deleted.

<figure>

```java
@Job(name="Check for new files to import" deleteOnSuccess="PT10M!PT10M")
public void startImportingFilesIfPresent() {
    if(Files.list(importDirectory).findAny()) {
        BackgroundJob.enqueue(() -> fileImportService.import(Files.list(importDirectory).collect(toList())));
    }
}
```
<figcaption>All of the above jobs will be gone from your database 20 minutes after they succeeded!</figcaption>
</figure>

Off-course, you can read all about it in the [JobRunr Pro documentation]({{<ref "/documentation/pro/custom-delete-policy.md">}}).

Stay tuned as there will be quite some new [JobRunr Pro]({{<ref "/documentation/pro/_index.md">}}) features coming up...