---
title: "JobRunr, Project Loom and Virtual Threads"
summary: "After integrating the Virtual Threads of Project Loom, it's time for a showdown between Java 11, Java 16 without Virtual Threads and Java 16 with Virtual Threads."
feature_image: /blog/jobrunr-loves-project-loom-1.jpeg
date: 2020-08-17T11:12:23+02:00
author: "Ronald Dehuysser"
tags:
  - blog
  - tutorial
---

JDK 16 early access has a build available including Project Loom which is all about virtual, light-weight threads (also called Fibers) that can be created in large quantities, without worrying about exhausting system resources.

Project Loom is also the reason why I did not use a reactive framework for JobRunr as it will change the way we will write concurrent programs. Project Loom with it's Virtual Threads is supposed to be a drop-in replacement for the existing threading framework and I tried it out today using JobRunr.
This also means that JobRunr, as of v0.9.16 (to be released soon), will support project Loom out-of-the-box while still also supporting every JVM since Java 8!

Implementing support for Project Loom was easier than I thought using a `ServiceLoader`. I extracted a simple interface called `JobRunrExecutor` from the existing `ScheduledThreadPool`.

<figure style="width: 100%">

```java
public interface JobRunrExecutor extends Executor {

    Integer getPriority();

    void start();

    void stop();

}
```
<figcaption>The `JobRunrExecutor` interface which is implemented by the existing ScheduledThreadPool</figcaption>
</figure>

I then created another implementation of the interface using JDK 16 making use of Project Loom which does nothing more than delegating to a Virtual Thread:

<figure style="width: 100%">

```java
public class VirtualThreadJobRunrExecutor implements JobRunrExecutor {

    private static final Logger LOGGER = LoggerFactory.getLogger(VirtualThreadJobRunrExecutor.class);

    @Override
    public Integer getPriority() {
        return 5;
    }

    @Override
    public void start() {
        LOGGER.info("JobRunrExecutor of type 'VirtualThreadJobRunrExecutor' started");
    }

    @Override
    public void stop() {
        // nothing to do
    }

    @Override
    public void execute(Runnable runnable) {
        Thread.startVirtualThread(runnable);
    }
}
```
</figure>

Using a standard `ServiceLoader` I was then able to inject the `VirtualThreadJobRunrExecutor` thus adding support for Virtual Threads!

<figure style="width: 100%">

```java

private JobRunrExecutor loadJobRunrExecutor() {
    ServiceLoader<JobRunrExecutor> serviceLoader = ServiceLoader.load(JobRunrExecutor.class);
    return stream(spliteratorUnknownSize(serviceLoader.iterator(), Spliterator.ORDERED), false)
            .sorted((a, b) -> b.getPriority().compareTo(a.getPriority()))
            .findFirst()
            .orElse(new ScheduledThreadPoolExecutor(serverStatus.getWorkerPoolSize(), "backgroundjob-worker-pool"));
}
```
</figure>

With all this in place, it was time to test and see if performance is better.

## Performance showdown: Java 11 vs Java 16 without Project Loom vs Java 16 with Project Loom
As I want to make sure performance is as good as it gets, I have some end-to-end tests which I run regularly, which can be found in the following GitHub repository: https://github.com/jobrunr/example-salary-slip.
In that project, paychecks are generated for 2000 employees using a Word template and then transformed to PDF.

To compare Java 11, Java 16 and Java 16 with Project Loom, I ran this project again and hooked up JVisualVM. To give the JVM some time to warm up, I ran each test 3 times.

Comparing performances is not fair as JobRunr only checks for new jobs every 15 seconds and thus comparing these numbers just depends on the fact when I enqueued the jobs. Just to be complete, you can find the numbers below:


| Run | Java 11 | Java 16 | Java 16 with Loom |
|-----|---------|---------|-------------------|
| 1   |     140 |     146 |               151 |
| 2   |     132 |     167 |               139 |
| 3   |     139 |     167 |               137 |
All numbers are in seconds.

What we can compare is the results from JVisualVM. And boy, are these worthwhile!

<figure>
<img src="/blog/2020-08-17-jvisualvm-jdk11-1.webp" class="kg-image">
<figcaption>JDK 11.0.8</figcaption>
</figure>

<figure>
<img src="/blog/2020-08-17-jvisualvm-jdk16.webp" class="kg-image">
<figcaption>JDK Build 16-loom+5-54 without Virtual Threads</figcaption>
</figure>

<figure>
<img src="/blog/2020-08-17-jvisualvm-jdk16-withloom.webp" class="kg-image">
<figcaption>JDK Build 16-loom+5-54 with Virtual Threads</figcaption>
</figure>




__The biggest difference is memory usage:__

- JDK 11 occupied a heap of 6.8 GB with a peak use of 4.7 GB
- JDK 16 without Virtual Threads occupied a heap of 4.6 GB with a peak use of 3.7 GB
- JDK 16 with Virtual Threads occupied a heap of 2.7 GB with a peak use of 2.37 GB

So, using JDK 16 with these light-weight virtual threads resulted in:
- only 50% usage of heap memory compared to JDK 11
- only 64% usage of heap memory compared to JDK 16 without virtual threads

## Conclusion
While I initially thought that Project Loom would increase performance a lot, I currently see major improvements in memory usage. I was surprised as how easy it was to support Project Loom thanks to the use of the ServiceLoader.

> Do note that JDK 16 is an early-access build and it's not even sure if Project Loom will be part of JDK 16.