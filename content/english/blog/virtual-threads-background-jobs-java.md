---
title: "Virtual Threads and Background Jobs: A Practical Guide for Java Developers"
description: "Learn how Java 21 virtual threads change background job processing. Understand when to use them, common pitfalls, and how to maximize throughput on I/O bound workloads."
keywords: ["virtual threads java", "java 21 virtual threads", "project loom", "virtual threads background jobs", "java concurrent processing"]
image: /blog/virtual-threads-background-jobs.webp
date: 2026-03-03T12:00:00+02:00
author: "Nicholas D'hondt"
tags:
  - blog
  - virtual threads
  - java 21
  - performance
---

Java 21 introduced virtual threads, and we've been getting a lot of questions about them. Should you use them for background jobs? Will they make your jobs faster?

The short answer: it depends. Virtual threads can significantly increase throughput on I/O heavy workloads, especially at scale. But use them wrong and you might actually make things slower.

We've spent months testing virtual threads with JobRunr across different workload types. Here's what we learned.

## What Virtual Threads Actually Are

Before Java 21, every thread in your application mapped to an operating system thread. OS threads are expensive. Each one takes up [significant memory](https://docs.oracle.com/en/java/javase/21/core/virtual-threads.html) and OS resources. Creating and destroying them takes time. Context switching between them has overhead.

While you can run thousands of platform threads with the right JVM configuration and hardware, in practice most applications use thread pools to limit concurrency and avoid resource exhaustion.

Virtual threads change this. They're managed by the JVM, not the OS. They're cheap to create (a few KB each), cheap to destroy, and cheap to context switch. You can have millions of them.

```java
// Old way: OS threads, managed via thread pools
ExecutorService executor = Executors.newFixedThreadPool(100);

// New way: Virtual threads, scale to millions
ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor();
```

The key insight: virtual threads only consume an OS thread while doing CPU work. When they hit a blocking operation (database call, HTTP request, file I/O), they release the OS thread for other virtual threads to use.

## Why This Matters for Background Jobs

Here's the thing: most background jobs spend their time waiting. Think about what typical jobs actually do:

- Query a database
- Call an external API
- Send an email
- Process a file
- Wait for a response

These operations spend most of their time waiting. With platform threads, a thread sits idle during that wait, consuming resources and blocking other work.

With virtual threads, the wait is free. The virtual thread suspends, releases its carrier thread, and another virtual thread takes over. When the I/O completes, the original virtual thread resumes.

**Let's do the math.** Say you have a job that syncs customer data from an external API. Each job:
- Makes an HTTP call (200ms network latency)
- Queries your database (50ms)
- Writes the result back (50ms)
- Total: 300ms, of which maybe 5ms is actual CPU work

With **10 platform threads** processing 1,000 jobs:
- Each thread handles one job at a time
- 1,000 jobs ÷ 10 threads = 100 jobs per thread
- 100 jobs × 300ms = 30 seconds per thread
- **Total time: ~30 seconds**

With **virtual threads** (same hardware):
- All 1,000 jobs can run concurrently
- During the 295ms of I/O wait, the carrier thread serves other jobs
- With enough carrier threads to handle the 5ms of CPU work each, all jobs complete in roughly the time of one job
- **Total time: ~1-2 seconds** (limited by your external API's capacity)

Same hardware, significantly higher throughput. The improvement scales with how I/O bound your jobs are and how many concurrent jobs you run.

## When Virtual Threads Help

Virtual threads shine when:

1. **Jobs are I/O bound.** Database queries, HTTP calls, file operations. Anything where the thread spends time waiting.

2. **You have many small jobs.** Sending emails, processing webhooks, syncing data. High volume, low CPU per job.

3. **External services are the bottleneck.** If you're rate limited by an API or waiting on slow third party services, virtual threads let you parallelize without exhausting system resources.

4. **You want simpler code.** No more callbacks, no more reactive chains. Write blocking code and let the runtime handle concurrency.

## When Virtual Threads Hurt

Virtual threads are not a universal performance upgrade. They can make things worse when:

### 1. Jobs are CPU Bound

If your job crunches numbers, compresses files, or does heavy computation, virtual threads don't help. These jobs hold onto their carrier thread the entire time. You'll get the same throughput as platform threads, with added overhead.

```java
// This job is CPU bound. Virtual threads won't help.
public void processImage(UUID imageId) {
    byte[] image = imageStore.get(imageId);
    byte[] processed = imageProcessor.resize(image, 1920, 1080); // CPU intensive
    imageProcessor.compress(processed); // CPU intensive
    imageStore.save(processed);
}
```

### 2. You Hit Pinning

Pinning happens when a virtual thread can't release its carrier thread during a blocking operation. The two main causes:

**synchronized blocks:**
```java
// This pins the virtual thread
synchronized (lock) {
    database.query(); // Blocking I/O inside synchronized = pinning
}
```

**Native code / JNI:**
```java
// Native calls pin the virtual thread
nativeLibrary.doSomething();
```

Pinning negates the benefits of virtual threads. Your virtual thread holds onto its carrier thread even during I/O, blocking other work.

**Good news:** JDK 24 fixes synchronized pinning. If you're on JDK 21-23, audit your code for synchronized blocks around I/O operations. Use `ReentrantLock` instead.

### 3. Your Database Can't Handle It

Virtual threads make it easy to open thousands of concurrent database connections. Your database probably can't handle that.

If you have 1000 virtual threads each trying to query PostgreSQL, and your connection pool is sized at 50, 950 threads will block waiting for connections. While virtual threads handle blocking without consuming OS threads, those 950 jobs are still stuck waiting. With a connection pool like HikariCP, waiting threads may hit connection timeout limits and fail. Even without timeouts, jobs could wait minutes before getting a connection, hurting overall throughput.

The database connection pool becomes the bottleneck, and bottlenecks are always a problem — with or without virtual threads. If your connection pool is sized at 1000, you'll overwhelm PostgreSQL. Connection limits exist for a reason.

**Solution:** Keep your connection pool reasonably sized and be aware that it will be the limiting factor for database-heavy workloads. Size your worker count with your connection pool in mind.

## Practical Setup with JobRunr

JobRunr has first class virtual thread support. On JDK 21+, it uses virtual threads by default.

### Basic Configuration

```yaml
# application.yml
jobrunr:
  background-job-server:
    enabled: true
    thread-type: VirtualThreads  # Default on JDK 21+
    worker-count: 160  # Higher count for I/O bound jobs
```

Or in code:

```java
JobRunr.configure()
    .useStorageProvider(storageProvider)
    .useBackgroundJobServer(
        BackgroundJobServerConfiguration.usingStandardBackgroundJobServerConfiguration()
            .andWorkerCount(160))
    .initialize();
```

### Tuning Worker Count

JobRunr's default worker count is `availableProcessors * 8` for platform threads and `availableProcessors * 16` for virtual threads. With virtual threads, you can go much higher than the defaults.

**I/O bound jobs:** Start with `availableProcessors * 16` (JobRunr's default for virtual threads). If your jobs spend most of their time waiting on I/O and you want significant throughput gains, increase to thousands of workers. As a rule of thumb, [if your application never has 10,000 virtual threads or more, it is unlikely to benefit from virtual threads](https://docs.oracle.com/en/java/javase/21/core/virtual-threads.html).

**Mixed workload:** Lower the count. CPU bound jobs will occupy carrier threads longer, reducing effective parallelism. However, in a JobRunr context, if your jobs are very short-running, they can be considered I/O bound — saving the result to the database will likely take longer than the job itself.

**External rate limits:** Match your worker count to what external services can handle. 1000 concurrent jobs hitting a rate limited API at 100 requests per second will just cause retries. With [JobRunr Pro's rate limiting](https://www.jobrunr.io/en/documentation/pro/rate-limiters/), you can control exactly how many jobs hit an external service per time window, so you don't have to worry about overwhelming downstream APIs.

### Monitoring

Watch these metrics:

1. **Job throughput.** Jobs processed per minute should increase with virtual threads on I/O bound workloads.

2. **Database connections.** Make sure you're not exhausting your pool.

3. **External API response times.** If they spike, you're overwhelming downstream services.

4. **Carrier thread utilization.** JFR (Java Flight Recorder) can show pinning events.

## Code Patterns That Work

### Simple I/O Bound Jobs

Virtual threads handle these perfectly:

```java
@Job(name = "Sync customer %0")
public void syncCustomer(UUID customerId) {
    Customer customer = customerRepository.findById(customerId); // I/O
    ExternalData data = externalApi.fetchData(customer.getExternalId()); // I/O
    customer.updateFrom(data);
    customerRepository.save(customer); // I/O
}
```

Three I/O operations, each releasing the carrier thread while waiting. Virtual threads maximize throughput here.

### Batch Processing with Parallel Streams

Careful with parallel streams inside jobs:

```java
// Potentially problematic
public void processBatch(List<UUID> ids) {
    ids.parallelStream()
        .forEach(id -> processItem(id)); // Creates ForkJoinPool threads
}
```

Parallel streams use the common ForkJoinPool, not virtual threads. This can cause contention. Better:

```java
// Better: let JobRunr handle parallelism using Stream-based enqueue
// This performs better as jobs are saved in batches
public void processBatch(List<UUID> ids) {
    BackgroundJob.enqueue(ids.stream(), (id) -> processItem(id));
}
```

### Avoiding Pinning

If you encounter pinning issues (synchronized blocks around I/O operations), the simplest fix is to upgrade to JDK 24 or higher. JDK 24 [resolves synchronized pinning](https://openjdk.org/jeps/491), so virtual threads will no longer be pinned inside synchronized blocks. This is much easier than refactoring your entire codebase to use `ReentrantLock`.

## Migration Path

If you're already using JobRunr on JDK 17 or earlier:

1. **Upgrade to JDK 21+.** Virtual threads are enabled by default in JobRunr 7+.

2. **Test with existing worker count.** You might see improvements immediately on I/O bound jobs.

3. **Gradually increase worker count.** Monitor throughput and downstream services.

4. **Audit for pinning.** Use JFR to find synchronized blocks causing issues.

5. **Adjust based on workload.** CPU bound jobs might perform better with platform threads.

## Summary

Virtual threads are a significant upgrade for I/O bound background jobs. You get higher throughput without complex reactive code or massive thread pools.

But they're not magic:
- CPU bound jobs don't benefit
- Pinning can negate the advantages
- You can overwhelm downstream services

Start with JobRunr's defaults, measure, and adjust. For most applications processing typical background jobs (email, API calls, database syncs), virtual threads deliver a meaningful performance improvement with zero code changes.

---

*Want to see virtual threads in action? Try [JobRunr](https://www.jobrunr.io/en/documentation/5-minute-intro/) on JDK 21+. Virtual threads are enabled by default.*
