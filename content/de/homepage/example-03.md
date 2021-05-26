---
title: "Wiederkehrende Jobs"
type: homepage-example
link: 'documentation/background-methods/recurring-jobs/'
weight: 3
sitemapExclude: true
---
Wiederkehrende Jobs werden jedes Mal nach dem angegebenen CRON-Zeitplan ausgelöst.

```java
BackgroundJob.scheduleRecurrently(Cron.daily(),
  () -> service.doWork());
```