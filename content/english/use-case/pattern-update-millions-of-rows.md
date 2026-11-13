---
title: "How to Update Millions of Database Rows Without Timeouts"
author: "Nicholas D'hondt"
image: /use-case/pattern-chunked-database-update.webp
summary: "One big UPDATE locks tables, hits the statement timeout and rolls back at 80%. This pattern splits the work into small durable chunks that run in parallel, retry on their own and survive a crashed server."
description: "An architecture pattern for large data migrations and bulk updates in Java: split the work into small durable jobs, run them in parallel, retry each chunk on its own and continue only when all of them succeeded."
date: 2026-11-12T16:00:00+01:00
draft: true
# TODO before publish: get permission to name the two customers behind [Customer A] and [Customer B] in "Who runs this", flip draft.
tags:
  - use-case
  - pattern
---
> "I need to update millions of rows in a database without the database timing out."

The classic case: you deploy a new version of your software and the JSON stored in every row needs a new structure. You may know the problem in another shape too. A backfill after a schema change. A recalculation for every customer at the end of the month. Billions of small transactions every week that all have to land.

## Why it is hard

One big statement is the obvious first try, and it fails in a predictable way. The transaction holds its locks for minutes, the statement timeout kicks in, and the database rolls back everything it did so far. Your live traffic waits behind those locks in the meantime.

So you split the work and run it on a few threads. That works until the server restarts halfway. Now part of the table is in the new shape, part is in the old shape, and nothing tells you where it stopped.

## What goes wrong when you build it yourself

The first version is a loop with a thread pool. Then the list of extras starts to grow:

- a progress table, so a restart knows where to continue
- retry logic for the chunk that hit a deadlock
- a way to spread the work over more than one server without two servers taking the same chunk
- a way to slow down when the database is busy
- a screen that shows how far along it is, because someone will ask every hour

Each item is a small project. Together they are a job scheduler that only your team maintains.

## The pattern

{{< svg "assets/use-case/pattern-chunked-database-update.svg" >}}

1. **Plan.** One planner job reads the id range of the table and creates one small job per chunk, for example 100 jobs of 10,000 rows each. A chunk job only carries a start id and an end id, never the rows themselves.
2. **Fan out.** Every instance of your application picks up chunk jobs and runs them in parallel. Each chunk is one short transaction, so locks are held for milliseconds. A job is claimed by exactly one worker thread.
3. **Fan in.** A follow-up job runs once, after all chunks succeeded. This is where you verify the counts, switch the feature flag or drop the old column.

The state of every chunk is stored in your own SQL database, next to your business data. If a chunk fails halfway, its transaction rolls back and only that chunk retries, with exponential back-off. The amount of work you redo after a failure is one chunk, never the whole table. If an instance dies, another instance picks up its chunks. If you need it done sooner, you start another instance.

```java
public void migrateOrders() {
    BackgroundJob
        .startBatch(this::planChunks)
        .continueWith(() -> migrationService.verifyAndSwitchOver());
}

public void planChunks() {
    for (IdRange range : orderRepository.idRangesOf(10_000)) {
        BackgroundJob.enqueue(() -> migrationService.migrate(range.from(), range.to()));
    }
}

@Job(name = "Migrate orders %0 to %1", rateLimiter = "order-migration")
public void migrate(long fromId, long toId) {
    orderRepository.migrateRange(fromId, toId); // one short transaction, safe to run twice
}
```

## What is open source and what is Pro

| You need | JobRunr OSS | JobRunr Pro |
|---|---|---|
| Chunk jobs stored in your database, processed on every instance | Yes | Yes |
| Automatic retries per chunk, with back-off | Yes | Yes |
| Recovery when an instance crashes | Yes | Yes |
| Dashboard with the state and history of every chunk | Yes | Yes |
| Creating many jobs in one go with `enqueue(Stream)` | Yes | Yes |
| Chunks that only start when planning fully succeeded ([batches]({{< ref "documentation/pro/batches.md" >}})) | No | Yes |
| A follow-up job after all chunks succeeded ([`continueWith`]({{< ref "documentation/pro/job-chaining.md" >}})) | No | Yes |
| A cap on how many chunks touch the database at once ([rate limiters]({{< ref "documentation/pro/rate-limiters.md" >}})) | No | Yes |
| Pause and resume the whole batch | No | Yes |

With OSS you can build the fan out today. The fan in is the part you would have to track yourself.

## Questions a sceptical architect asks

**Why not a cron script?** A script has no memory. When it stops at row 600,000 you find out the next morning, and you restart it by hand. Here every chunk has a state, so a restart continues where it stopped.

**Why not Kafka?** You can put one message per chunk on a topic. You still need to know when all chunks are done, which ones failed for good, and how to run the next step only then. That bookkeeping is the hard part, and it is what the batch gives you.

**Why not let my coding agent build it?** It will write the loop and the progress table in an afternoon. You then own the retries, the locking between servers and the edge cases in production for years.

**How is this transactional if it is no longer one transaction?** It is not one transaction, and that is the point. Each chunk commits on its own. The batch as a whole only succeeds when every chunk succeeded, and the follow-up job waits for that.

**How do you make sure no row is missed and no row is migrated twice?** The planner splits by id, so every row belongs to exactly one chunk. That split is your code, and it is the part to test. Then make the migration safe to repeat: add a version field to the row and skip rows that already have the new version. A retry of a finished chunk then costs almost nothing.

**What if the application writes to a row while it is being migrated?** Use optimistic locking on the row. One of the two writers loses. If it is the migration, the chunk retries. If it is the user, they reload and save again.

**Can old and new versions of my application run during the migration?** Yes, if you plan for it. First add the new fields in a way the old version ignores. Migrate. Remove the old fields in a later deployment, when nothing reads them anymore. This is the hard part of any zero-downtime migration, with or without JobRunr.

**How do I know when to step in?** The dashboard shows every chunk with its state and its exceptions. With Pro you can also send job traces to your observability platform through [OpenTelemetry]({{< ref "guides/advanced/observability-tracing.md" >}}) and alert on failures there.

**What does it cost my database?** Every chunk is a row in the JobRunr tables and a few small writes. Keep chunks big enough that the real work dominates. A chunk that takes two seconds is a good size. A chunk of one row is not.

## Who runs this

[Customer A] and [Customer B] run this pattern. Decathlon uses the same shape to process [50 million scans a day across 1,700 stores]({{< ref "use-case/jobrunr-pro-decathlon.md" >}}).

## Not a fit when

- The dataset is small. If it succeeds in one transaction, use one transaction.
- Every row has to change at the same instant. This pattern migrates gradually, so old and new rows exist side by side for a while.
- A chunk cannot run twice safely. Jobs can be retried, so each chunk has to be idempotent. If your team does not think in jobs, idempotence and re-entrancy yet, read [why idempotence matters]({{< ref "blog/Idempotence-in-java-job-scheduling.md" >}}) before you start.

## Check the fit for your own system

Paste the URL of this page into your coding agent and ask whether the pattern fits your codebase. Or start with the docs on [enqueueing jobs in bulk]({{< ref "documentation/background-methods/enqueueing-jobs.md" >}}) and [batches]({{< ref "documentation/pro/batches.md" >}}).
