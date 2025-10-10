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
jobrunr.background-job-server.thread-type=PlatformThreads
#jobrunr.background-job-server.thread-type=VirtualThreads
```

## Making the best use of Virtual Threads in JobRunr

Maximizing the potential of virtual threads in JobRunr comes down to one thing: increasing the parallelism. JobRunr can execute a maximum of `worker-count`--you can configure this--jobs in parallel. Thus you want to allow JobRunr to onboard as many jobs as possible. This is why we've set the default `worker-count` to `availableProcessors * 16` when `thread-type` is `VirtualThreads`.

By onboarding more jobs, we want to make sure there is a job ready to take advantage of another job's blocking operations. In practice, this works well if your jobs are IO bound or have a short execution time.

> The effect may differ from one application to another thus we'd like to encourage you to test various settings. Your application may have some other bottleneck (e.g., the database, rate-limited APIs, etc.). Would like to share your discoveries? Start a [discussion over on GitHub](https://github.com/jobrunr/jobrunr/discussions).

## Mind the Pinning Pitfall and long running CPU-intensive operations

Virtual threads make it much easier to structure applications. They allow us to use a simple, easy to understand, thread-per-request model.

But virtual threads have, had?, one major flaw: pinning. Pinning means that the virtual thread cannot release its carrier, the platform thread, while performing an IO operation. This is problematic because the scheduler is not able to mount another virtual thread on the carrier.

Another noteworthy behavior of virtual threads is that they are not time sharing, there is no forceful preemption. A virtual thread releases the carrier only when encountering a blocking operation. This is bad news for CPU-bound tasks. When all the carrier threads are occupied by CPU-bound tasks, other tasks need to wait until those complete. With platform threads, this is not an issue thanks to time sharing.

> One major cause to pinning is the use of `synchronized`. This is solved in JDK 24. From JDK 24 pinning may still happen but only in [a few rare cases](https://openjdk.org/jeps/491#Future-Work), e.g., calling native code.

> The pinning and no non-preemptive behavior can lead an unacceptable wait time for other tasks (or even starvation). By default virtual threads run on `availableProcessors`--configurable via `jdk.virtualThreadScheduler.parallelism`.

> The JVM can, temporarily, expand the parallelism of the virtual-thread scheduler, i.e., increasing the number of carriers. Can we count on this? Unfortunately, no. This expansion mechanism only occurs in a few specific blocking operations that do not unmount the virtual thread from its carrier. Pinning is not included.

### Practical consequences in JobRunr

In JobRunr, a background job server processes a maximum of `worker-count` jobs in parallel, `availableProcessors * 16` by default. Suppose all the carriers are occupied, because of pinning or CPU-bound workload. Then you may have up to `availableProcessors * 15` jobs waiting for the carriers to be released (assuming default `jdk.virtualThreadScheduler.parallelism`).

Consequently, if you were to closely follow the progress of the jobs, you may notice that the other jobs are doing nothing although JobRunr reports them as in progress. They appear to be _stuck in Processing_. They essentially are, just not because of a faulty background job server. They may also run anytime as long as the tasks holding the carrier threads complete their work.

## Recommendations

- Avoid virtual threads when the workload may lead a high number of pinned virtual threads.
- Consider using JDK 24 or higher to prevent virtual thread pinning.
- Avoid using virtual threads when the workload is CPU bound, especially if the tasks are long running.
- Throughput is achieved by running more tasks in parallel, so set the `worker-count` to a high number (run tests to avoid overwhelming your resources!).