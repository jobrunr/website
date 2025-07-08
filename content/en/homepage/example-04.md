---
title: "🍀 Carbon Aware Jobs"
type: homepage-example
link: 'documentation/background-methods/carbon-aware-jobs/'
weight: 4
sitemapExclude: true
---

Employ Carbon Aware Job Processing to reduce the CO2 footprint of your server.

```java
BackgroundJob.schedule(
    CarbonAwarePeriod.between(now(), now().plus(5, HOURS)), 
      () -> service.doWork());
```
