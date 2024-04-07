---
title: "Virtual Threads"
subtitle: "Use Virtual Threads to increase the throughput of your JobRunr application."
date: 2024-02-05T14:19:23+02:00
layout: "documentation"
menu: 
  main: 
    parent: 'configuration'
    weight: 21
---

[Virtual threads](https://openjdk.org/jeps/444) are lightweight threads finalized in JDK 21. The introduction of virtual threads allows programs to use a larger number of threads than the amount of threads made available by the underlying OS.

A virtual thread only consumes an OS thread while performing calculations on the CPU, the OS thread is freed when performing a blocking I/O operation. This allows for an increased throughput as other virtual threads can execute while some are waiting due to I/O operations.

Virtual threads are generally not recommended for CPU-intensive tasks.

> From JobRunr 7 and later, worker threads are by default virtual threads when the JDK version is 21 or later (virtual threads are only available when JDK is version 21 or later).

## Configuration
JobRunr allows to define worker threads as [`PlatformThreads`](https://docs.oracle.com/en/java/javase/21/core/virtual-threads.html#GUID-2BCFC2DD-7D84-4B0C-9222-97F9C7C6C521) or [`VirtualThreads`](https://docs.oracle.com/en/java/javase/21/core/virtual-threads.html#GUID-15BDB995-028A-45A7-B6E2-9BA15C2E0501).
Below are different ways to configure JobRunr to use either of those type of threads - just choose your preferred thread type depending on your expected workload:

```
org.jobrunr.background-job-server.thread-type=PlatformThreads
#or org.jobrunr.background-job-server.thread-type=VirtualThreads
```