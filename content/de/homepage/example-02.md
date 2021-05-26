---
title: "Geplante und verzögerte Jobs"
type: homepage-example
link: 'documentation/background-methods/scheduling-jobs/'
weight: 2
sitemapExclude: true
---
Geplante Jobs werden ebenfalls nur einmal ausgeführt, jedoch zum angegebenen Zeitpunkt ausgeführt.

```java
BackgroundJob.schedule(now().plusHours(5),
  () -> System.out.println("Reliable!"));
```