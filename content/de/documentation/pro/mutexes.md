---
title: "Mutexe"
subtitle: "Mutexe in JobRunr verschieben Jobs, bis ein freigegebener Mutex frei ist."
date: 2020-08-27T11:12:23+02:00
layout: "documentation"
menu: 
  main: 
    identifier: mutexes
    parent: 'jobrunr-pro'
    weight: 25
---
Ein Mutex schließt sich gegenseitig aus. Es fungiert als Gate Keeper für eine Ressource, die es nur einem `Job` ermöglicht, sie zu verwenden, und verschiebt alle anderen Jobs, die denselben "Mutex" verwenden, kostenlos.


## Verwendung
Die Verwendung eines Mutex ist dank der Annotation `@Job` genauso einfach wie die Verwendung von Warteschlangen und Server-Tags. Fügen Sie es einfach Ihrer Servicemethode hinzu und geben Sie den zu verwendenden Mutex an
<figure>

```java
@Job(mutex = "virus-scanner")
public void onlyProcessOneJobAtTheSameTime() {
    System.out.println("This will not run parallel as it is guarded by a mutex");
}
```

<br>

__Erweitertes Beispiel__
Mutexe können auch Jobparameter berücksichtigen. Im folgenden Beispiel haben wir insgesamt 3 Mutexe:
- `virus-scanner/LINUX`
- `virus-scanner/WINDOWS`
- `virus-scanner/MACOS`

<figure>

```java
public void scanForVirusses(File folder) {
    for(String f : folder.list()) {
        scanForVirusses(f);
    }
}

public void scanForVirusses(String file) {
    BackgroundJob.enqueue(() -> osSpecificVirusScan("LINUX", file));
    BackgroundJob.enqueue(() -> osSpecificVirusScan("WINDOWS", file));
    BackgroundJob.enqueue(() -> osSpecificVirusScan("MACOS", file));
}


@Job(mutex = "virus-scanner/%0")
public void osSpecificVirusScan(String os, String file) {
    System.out.println(String.format("This will result in a mutex virus-scanner/%0", os));
}
```
<figcaption> Selbst wenn sich 100 Arbeitsthreads und über 1000 Dateien im angegebenen Ordner befinden würden, würden nur 3 Jobs parallel verarbeitet, da der Mutex sicherstellt, dass der Virenscanner nur eine Datei gleichzeitig pro Betriebssystem verarbeitet </figcaption>
</figure>



## Konfiguration
Mutexe erfordern keine Konfiguration.