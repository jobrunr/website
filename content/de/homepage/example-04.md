---
title: "Warteschlangen"
type: homepage-example
link: 'documentation/pro/queues'
badge: PRO
weight: 4
sitemapExclude: true
---
Geben Sie eine Warteschlange an, um alle bereits in die Warteschlange gestellten Jobs zu umgehen, damit Ihre kritischen Geschäftsprozesse pünktlich abgeschlossen werden.
```java
@Job(queue = HighPrioQueue)
public void doWork() { 
    ...
}
```