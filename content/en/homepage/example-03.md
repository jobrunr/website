---
title: "Recurring jobs"
type: homepage-example
link: 'documentation/background-methods/recurring-jobs/'
weight: 3
sitemapExclude: true
---
Recurring jobs fire each time on the specified CRON schedule.

```java
BackgroundJob.scheduleRecurringly(
  () -> service.doWork(), 
  Cron.daily());
```