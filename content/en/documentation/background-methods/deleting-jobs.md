---
title: "Deleting jobs"
subtitle: "You're fired!"
keywords: ["enqueue", "background job", "fire and forget", "enqueue jobs in bulk"]
date: 2020-09-16T11:12:23+02:00
layout: "documentation"
menu: 
  main: 
    identifier: deleting-jobs
    parent: 'background-methods'
    weight: 35
---
Sometimes you may want to delete a job that is scheduled, enqueued or already processing. This can be done easily via the Dashboard or even programmatically.

<figure>

```java
JobId jobId = BackgroundJob.enqueue(() -> myService.doWork());

BackgroundJob.delete(jobId);
```
<figcaption>Thanks to the <em>BackgroundJob.delete</em> method, the job that was enqueued earlier on can be deleted.</figcaption>
</figure>

 When the job is still enqueued or scheduled, things are easy - JobRunr changes the state of your Job to Deleted and all is well.
 
 However, if the job is already processing, JobRunr will try to interrupt the thread that is currently processing the job.
 Most of the JDK and third party libraries that do I/O will be able to listen for the thread interrupt signal and throw an `InterruptedException`. As a primer on how Thread interruption works, I advise to read the Baeldung article on [how to Handle InterruptedException in Java](https://www.baeldung.com/java-interrupted-exception).

> The purpose of the interrupt system is to provide a well-defined framework for allowing threads to interrupt tasks (potentially time-consuming ones) in other threads.  

If you have code that can throw an `InterruptedException`, things are easy - let JobRunr handle it:
<figure>

```java
public void doWorkThatTakesLong(int seconds) throws InterruptedException {
    TimeUnit.SECONDS.sleep(seconds);
    System.out.println("WORK IS DONE!!!!!!!!");
}
```
<figcaption>The sleep method throws the checked <em>InterruptedException</em>. JobRunr supports this and will handle it gracefully.</figcaption>
</figure>


If you decide to catch the `InterruptedException` for some reason, it is important to either rethrow that same exception or interrupt the current thread itself.
<figure>

```java
public void doWorkThatTakesLong(int seconds) throws InterruptedException {
    try {
        TimeUnit.SECONDS.sleep(seconds);
        System.out.println("WORK IS DONE!!!!!!!!");
    } catch (InterruptedException e) {
        System.out.println("Thread has been interrupted");
        throw e; // it is important to rethrow / propagate the InterruptedException
    }
}
```
<figcaption>In this example, the <em>InterruptedException</em> is caught but re-thrown so that JobRunr can handle it gracefully.</figcaption>
</figure>

<figure>

```java
public void doWorkThatTakesLongInterruptThread(int seconds) {
    try {
        TimeUnit.SECONDS.sleep(seconds);
        System.out.println("WORK IS DONE!!!!!!!!");
    } catch (InterruptedException e) {
        System.out.println("Thread has been interrupted");
        Thread.currentThread().interrupt();
    }
}
```
<figcaption>If you cannot rethrow the <em>InterruptedException</em>, it is important to interrupt the current thread.</figcaption>
</figure>



If you don't have any code that does I/O or it does not adhere to the standard interrupt framework, this means your code is basically uninterruptible and the job will keep running until it finishes (either succeeds or fails).

To solve this, you check in certain places of your own job method whether the thread is interrupted (as JobRunr will signal the thread that is running the job to interrupt when it is deleted).

<figure>

```java
while (true) {
    if (Thread.currentThread().isInterrupted()) throw new InterruptedException();
    // do some work
}
```
<figcaption>By manually checking if the current thread is interrupted, you can throw an <em>InterrupedException</em> that will be handled by JobRunr.</figcaption>
</figure>

More examples can be found in the JobRunr [end-to-end tests](https://github.com/jobrunr/jobrunr/blob/master/core/src/test/java/org/jobrunr/scheduling/BackgroundJobTest.java#L346-L413).