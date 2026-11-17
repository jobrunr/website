---
title: "Multi-Step Jobs That Resume After a Crash"
author: "Nicholas D'hondt"
image: /use-case/pattern-crash-recovery.webp
summary: "A payment job charges the customer, then the server dies before the next step. This pattern stores every completed step in your own database, so another server resumes the job at the step that did not finish."
description: "An architecture pattern for crash recovery in Java: durable jobs with steps that are stored in your database, so work resumes after an outage without repeating what already succeeded."
date: 2026-11-12T16:10:00+01:00
# TODO before publish: flip draft.
tags:
  - use-case
  - pattern
---
> "I need to make sure that I never take money from a customer twice if my system goes down."

The same problem shows up outside payments. After an outage, the system has to recover quickly and continue processing. Work that was running on the server that died has to be picked up by another one. And nobody should have to check by hand what did and did not happen.

## The challenge

A real job does more than one thing. It charges the customer, updates the ledger and pays out the merchant. As Murphy's law dictates, the crash will not happen once all your steps are done. It will happen somewhere between charging the customer and paying out the merchant.

After the crash you have two bad options. If you run the job again from the top, the customer pays twice. If you do not run it again, the merchant never gets paid.

Getting out of that takes four things:

- **It has to remember the job.** The job has to exist outside the server that runs it. Otherwise the crash takes the job with it.
- **It has to remember progress.** Knowing that the job exists is not enough. Which steps finished has to be recorded too.
- **It has to notice the crash.** A dead server does not report that it died. Something else has to see that it went quiet.
- **It has to resume, not restart.** Another instance continues at the first step that did not finish, and leaves the finished ones alone.

## The pattern

{{< svg "assets/use-case/pattern-crash-recovery.svg" >}}

1. **The job is stored before it runs.** It is written to your own database first, so it exists independently of any server. This is what makes every job durable.
2. **Every step records that it finished.** `runStepOnce` writes a marker for the step in the same database.
3. **A crash is noticed.** While a job runs, its worker keeps updating it in the database. When those updates stop, the master marks the job as orphaned and schedules it again. The master is the longest-running instance. When the master itself goes down, the next one takes over.
4. **Another instance resumes.** It runs the same job. Steps that have a marker are skipped. Execution continues at the first step without one.

```java
public void payOut(String orderId, JobContext jobContext) {
    jobContext.runStepOnce("charge-customer",  () -> paymentGateway.charge(orderId));
    jobContext.runStepOnce("update-ledger",    () -> ledger.book(orderId));
    jobContext.runStepOnce("pay-out-merchant", () -> payouts.transfer(orderId));
}
```

That is the whole change to your code. These are [durable jobs]({{< ref "guides/advanced/durable-executions.md" >}}), and they come with more than the step markers:

- **Retries.** If a step throws an exception, the job is retried automatically, 10 times by default, with exponential back-off, and resumes at that step. You can [configure the number of retries]({{< ref "documentation/background-methods/dealing-with-exceptions.md#how-to-configure-the-amount-of-retries" >}}).
- **A dashboard that shows what happened.** JobRunr ships with a [built-in dashboard]({{< ref "documentation/background-methods/dashboard.md" >}}). After a crash you open the dashboard and see both attempts of the job, the instance that ran each one and the steps it executed. A job that is out of retries stays in the dashboard as failed, with its full history, until someone decides what to do.
- **Recovery after a crash.** A job that was busy on an instance that died is picked up by another instance. Nobody has to find out by hand what was running at that moment.
- **No second system.** There is no workflow server to run and no extra store to keep in sync. The jobs and their step markers live in your own database.

### Is this always 100% safe?

No. A completed step never runs again. But there is a small window between the moment a step did its work and the moment the marker is saved. If the crash happens in that window, the step runs a second time. Every distributed system has this window, a workflow engine included.

You close it yourself in one of two ways. Give the external call an idempotency key, so the payment provider recognises the second attempt. Or record the result in your own tables and check it first: was this transaction already processed? [This article explains how to design for it]({{< ref "blog/Idempotence-in-java-job-scheduling.md" >}}).

## What goes wrong when you build it yourself

Most teams get here in three steps. Each one fixes the previous problem and exposes the next.

### A background thread

```java
@Async
public void payOut(String orderId) {
    paymentGateway.charge(orderId);
    ledger.book(orderId);
    payouts.transfer(orderId);
}
```

The work runs on a thread of the application, so its lifetime is tied to the application. When the application crashes after `charge`, the work is gone and nothing remembers it existed. The merchant never gets paid, and you find out when they call.

### Store the job and run it again

So you store every payout before you start it, and after a restart you run the unfinished ones again:

```java
for (Payout payout : payoutRepository.findUnfinished()) {
    payOut(payout.getOrderId());
}
```

Now the job survives the crash. But `payOut` starts at the first line again, so the customer who was already charged is charged a second time.

### Your own progress table

So you record every step:

```java
public void payOut(String orderId) {
    if (!steps.isDone(orderId, "charge-customer")) {
        paymentGateway.charge(orderId);
        steps.markDone(orderId, "charge-customer");
    }
    if (!steps.isDone(orderId, "update-ledger")) {
        ledger.book(orderId);
        steps.markDone(orderId, "update-ledger");
    }
    // and again for every next step
}
```

This is the pattern on this page, written by hand. The code around it is where the work is:

- Who notices that the server running a payout has gone quiet? Something has to watch for it, and tell a dead server apart from a slow one.
- Who runs the unfinished payouts again? If every instance does it at startup, two instances pick up the same payout.
- What happens when a step keeps failing? You need retries with back-off, and a limit.
- How do you see which payouts are stuck, and at which step?

It is expensive to write and maintain. None of it is free to keep either: every time your framework or your database gets a new version, you have to think about all of it again.

Most teams discover the edge cases one incident at a time.

## What is available in JobRunr?

| You need | JobRunr OSS | JobRunr Pro |
|---|---|---|
| Jobs stored in your database | Yes | Yes |
| `runStepOnce` and resuming at the failed step after an exception | Yes | Yes |
| Automatic retries with back-off | Yes | Yes |
| Jobs of a crashed instance picked up by another one | Yes | Yes |
| Dashboard with every attempt and every failure | Yes | Yes |
| Step markers written the moment a step finishes, so a hard crash resumes at exactly the last step | No, markers are saved on the poll interval | Yes |
| The job is created in the same transaction as your business data ([transactions]({{< ref "documentation/pro/transactions.md" >}})) | No | Yes |

## Questions a sceptical architect asks

**Why not cron?** Cron starts things. It does not know what a job finished before the server died.

**Why not Kafka?** A redelivered message runs your handler again from the first line. You still need to record which steps are done, and that record is the pattern on this page.

**Why not a workflow engine?** It solves the same problem, and it brings a separate cluster to operate. If your steps live in one Java service, your own database is enough.

**Why not write it ourselves, or let a coding agent build it?** The progress table is the easy part. Then come the edge cases: the takeover when the master dies, retries that work across servers, and telling a dead node apart from a node that is paused by a long garbage collection. That tuning takes years of production use, and you would maintain it with every new version of your stack.

**Where is the state stored?** In the metadata of the job, in the same database row as the job itself. There is no second store.

**How do I know a crashed job was picked up?** The dashboard shows both attempts of the job, with the instance that ran each one and the steps it executed.

## Not a fit when

- It does not matter if the work runs more than once, or if some of it is lost.
- The work takes a few milliseconds. Each step adds a write to the database, so for very fast work the round trips cost more than the work itself.
- You run a single server and can accept a manual check after a crash.

## Check the fit for your own system

Paste the URL of this page into your coding agent and ask whether the pattern fits your codebase. Or follow the guide on [durable executions with `runStepOnce`]({{< ref "guides/advanced/durable-executions.md" >}}), which runs a job, breaks it and shows the resume in the dashboard.
