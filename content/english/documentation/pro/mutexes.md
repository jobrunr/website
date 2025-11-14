---
version: "pro"
title: "Mutexes"
subtitle: "Mutexes in JobRunr will postpone jobs until a shared mutex is free"
keywords: ["mutexes", "shared mutex", "shared mutexes", "mutex", "mutex in os", "postpone jobs", "mutexes job parameters"]
date: 2020-08-27T11:12:23+02:00
layout: "documentation"
menu: 
  main: 
    identifier: mutexes
    parent: 'jobrunr-pro'
    weight: 25
---
{{< trial-button >}}

A `mutex` is a mutually exclusive flag. It acts as a gate keeper to a resource allowing only one `Job` to use it and postpones all others jobs using the same `mutex`.

> You cannot use both a mutex and a [rate limiter]({{< ref "/documentation/pro/rate-limiters" >}}) on the same `Job`.

> **Recurring job**: Unless the mutex is shared with other jobs, we don't recommend using a mutex to limit the concurrency of a recurring job. By default, a recurring job cannot have multiple jobs running in parallel, therefore a mutex is not needed.

## Usage via `@Job` annotation
Using a mutex is as easy as using Queues and Server Tags, again thanks to the `Job` annotation. Just add it to your service method and specify the mutex to use
<figure>

```java
@Job(mutex = "virus-scanner")
public void onlyProcessOneJobAtTheSameTime() {
    System.out.println("This will not run parallel as it is guarded by a mutex");
}
```

## Usage via `JobBuilder` pattern
When you are using the `JobBuilder` pattern, you can pass the serverTag via the `JobBuilder`.
<figure>

```java
jobScheduler.create(aJob()
        .withMutex("virus-scanner")
        .withDetails(() -> System.out.println("This will not run parallel as it is guarded by a mutex"));
```
</figure>

<br>

__Advanced example__
Mutexes can also take into account job parameters. In the example below, we have 3 mutexes in total:
- `virus-scanner/LINUX`
- `virus-scanner/WINDOWS`
- `virus-scanner/MACOS`

<figure>

```java
public void scanForViruses(File folder) {
    for(String f : folder.list()) {
        scanForViruses(f);
    }
}

public void scanForViruses(String file) {
    BackgroundJob.enqueue(() -> osSpecificVirusScan("LINUX", file));
    BackgroundJob.enqueue(() -> osSpecificVirusScan("WINDOWS", file));
    BackgroundJob.enqueue(() -> osSpecificVirusScan("MACOS", file));
}


@Job(mutex = "virus-scanner/%0")
public void osSpecificVirusScan(String os, String file) {
    System.out.println(String.format("This will result in a mutex virus-scanner/%0", os));
}
```
<figcaption>Even if we would have 100 worker threads and over 1000 files in the given folder, only 3 jobs would be processed in parallel as the mutex makes sure the virus scanner is only processing one file at the same time per OS</figcaption>
</figure>



## Configuration
Mutexes don't require any configuration.

{{< trial-button >}}