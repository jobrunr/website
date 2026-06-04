---
title: "What Is Durable Execution? A Practical Guide for Java Developers"
description: "Learn what durable execution means for Java applications, from journaled steps and automatic replay to exactly-once semantics and crash recovery, and how JobRunr delivers it without a separate workflow engine."
keywords: ["durable execution java", "what is durable execution", "durable execution", "crash recovery job processing", "exactly once java", "idempotent jobs", "automatic retries java"]
images:
  - /blog/what-is-durable-execution-java.webp
image: /blog/what-is-durable-execution-java.webp
date: 2026-06-04T10:00:00+02:00
author: "Nicholas D'hondt"
draft: true
tags:
  - blog
  - durable execution
  - job scheduling
---

Picture a job that charges a customer, reserves stock, and sends a confirmation email. It charges the card, reserves the stock, and then the pod restarts during a deploy. The email never goes out. The job is marked as failed, so it runs again from the top. Now the customer is charged twice.

This is the problem **durable execution** is meant to solve. The term has been getting a lot of attention lately, mostly from workflow engines like Temporal and Restate, and as of April 2026 there is even an AWS Lambda Durable Execution SDK for Java. But the idea behind it is older than the buzzword, and if you already run background jobs in Java, you are closer to it than you think.

This guide explains what durable execution actually means, the principles behind it, and how much of it you already get from a job scheduler like JobRunr without standing up a separate engine.

> **Short answer:** Durable execution is a way of writing code so it survives crashes and restarts and picks up where it left off, instead of starting over and repeating work. A durable execution engine records each step as it completes, so after a failure it skips the steps that already ran. You can get the core of this in Java with a database-backed job scheduler. You only need a dedicated workflow engine for the heaviest, longest-running orchestrations.

## What Durable Execution Actually Means

**Durable execution is a way of writing ordinary code so that it survives crashes, restarts, and infrastructure failures, then resumes from the last completed step instead of starting over.**

That is the whole idea. You write a normal function with several steps. The runtime records the result of each step to durable storage as it happens. If the process dies halfway through, a healthy worker picks the work back up, replays what already happened, and continues from the exact point of failure. Completed steps are not run a second time, and their results are reused.

Compare that to the naive version most of us start with. You write a method, something fails, the whole method runs again, and any step that already succeeded runs again too. Durable execution removes that "start over from zero" behavior. The progress your code made is durable, hence the name.

It helps to be precise about what is being made durable. It is not just the fact that the job exists somewhere. It is the progress *within* the job. The system remembers which steps finished, so a retry is a resume rather than a restart.

## The Four Principles of Durable Execution

Strip away the vendor language and durable execution rests on four ideas. Whether you use a full workflow engine or a database-backed job scheduler, these are the moving parts.

### Journaling: recording every step

The foundation is the journal, sometimes called the event history or command log. Before a result is handed back to your code, it is written to durable storage. That log becomes the source of truth for what has already happened.

The journal is what makes recovery possible. Without it, a worker that takes over after a crash has no idea how far the previous worker got. With it, the new worker can read the history and know exactly which steps are done.

### Replay and automatic retries

When something fails, the runtime does not give up. It retries. The trick is that retries replay the journal first. Already-completed steps return their recorded result instead of executing again, and the work resumes at the first step that never finished.

Automatic retries matter here on their own. Distributed systems fail in transient ways all the time, with network blips, brief database outages, and timeouts. A good runtime retries these with an exponential back-off, so a momentary problem does not become a permanent failure. The combination of replay and retries is what lets a multi-step process limp through a bad minute and still finish correctly.

### Exactly-once execution and idempotency

This is the principle people most often get wrong, so it is worth being exact.

Durable execution gives you exactly-once semantics for the *orchestration*. Each step is dispatched once, the overall flow runs as if it executed a single time, and you do not get duplicate runs of your business logic from the engine's point of view.

It does not magically give you exactly-once *side effects*. Most engines, Temporal included, run the individual steps with at-least-once semantics by default, which is exactly why their own docs insist that steps must be idempotent. If a step charges a card and the process dies after the charge but before the result is journaled, the retry has no record that the charge happened.

So durable execution moves the idempotency problem, it does not delete it. You still want your money-moving and data-writing steps to be safe to run more than once. We wrote a full piece on this, [Why is Idempotence Important in Java Job Scheduling?]({{<ref "blog/Idempotence-in-java-job-scheduling.md">}}), and the advice there applies no matter which durable execution tool you pick.

### Crash recovery and persistence

The last principle is the one that ties it together. The state lives outside the process that is running the job. Because the journal sits in durable storage, any worker can recover an in-flight execution after a crash. The process is disposable. The progress is not.

This is also where durable execution overlaps heavily with [distributed job scheduling]({{<ref "blog/distributed-job-scheduling-java.md">}}). The moment your state is in a shared store rather than one server's memory, you can run multiple workers, survive the loss of any one of them, and pick work back up elsewhere.

## How JobRunr Delivers Durable Execution

Here is the part that surprises people. If you run JobRunr, you already have most of this, and a lot of it is in the free, open-source version.

**Your jobs are persisted, not held in memory.** When you enqueue a job, JobRunr serializes it and stores it in your existing SQL or NoSQL database. No Redis, no separate message broker, just the database you already run. If your application goes down and comes back up, the job is still there, waiting to be processed. That is the persistence principle, with zero extra infrastructure.

**Failed jobs retry automatically with back-off.** Out of the box, JobRunr retries a failing job up to 10 times with a smart exponential back-off policy. This is the default in the open-source version, not a paid add-on. You can read the details in [Dealing with exceptions]({{<ref "documentation/background-methods/dealing-with-exceptions.md">}}). That is the automatic-retries principle, for free.

**Crashed-server jobs get noticed.** JobRunr watches for zombie jobs, which are jobs that were being processed on a server node that crashed. It elects a master node to coordinate this housekeeping, so a job stuck on a dead worker does not silently vanish.

And then there is the piece that maps most directly onto durable execution. JobRunr v8 shipped a feature called, fittingly, **durable executions**, through `JobContext.runStepOnce`.

It lets you break a job into named steps that each run exactly once. If the job is retried, any step that already completed is skipped, and execution resumes at the first step that did not finish. That is journaling and replay, expressed as plain Java.

First, you inject a `JobContext` when you enqueue the job:

```java
jobScheduler.<OrderService>enqueue(orderService -> orderService.processOrder(orderId, JobContext.Null));
```

Then you wrap each step with `runStepOnce`, giving every step a stable id:

```java
public class OrderService {

    public void processOrder(Long orderId, JobContext jobContext) {
        jobContext.runStepOnce("charge-customer", () -> paymentService.charge(orderId));
        jobContext.runStepOnce("reserve-stock", () -> stockService.reserve(orderId));
        jobContext.runStepOnce("send-confirmation", () -> emailService.sendConfirmation(orderId));
    }
}
```

Now go back to the scenario from the top of this post. The job charges the customer, reserves the stock, and the pod restarts before the email is sent. When JobRunr retries the job, `charge-customer` and `reserve-stock` are already recorded as complete, so they are skipped. Only `send-confirmation` runs. No double charge.

If a step throws, it is not marked complete, so the retry runs it again. And `runStepOnce` can return a value to feed into the next step, so you can pass results down the chain.

Now the honest part, because it matters. JobRunr gives you durable *jobs* with exactly-once *steps* on top of the database you already have. It is not a full deterministic-replay engine that rebuilds every in-memory local variable after a crash the way Temporal does. For the large majority of background work, the reservation jobs, the report generation, the multi-step pipelines, the API integrations, that lighter guarantee is exactly what you need, and you get it without running another service. It is durable enough, on infrastructure you already operate.

## Where You Still Need to Design for It

No runtime makes correctness automatic, and anyone who tells you otherwise is selling something.

Because steps can run at least once, the steps that touch the outside world still need to be safe to repeat. If your payment provider supports an idempotency key, use it. If your API exposes a way to check whether an action already happened, check it before acting. `runStepOnce` shrinks the window considerably, since a completed step will not fire again, but the rare crash *inside* a step, after the side effect but before the result is recorded, is still on you to handle.

This is the same discipline that makes any background job reliable, and it is worth internalizing once. Our [idempotence guide]({{<ref "blog/Idempotence-in-java-job-scheduling.md">}}) walks through the patterns with real Java examples, including how to use the job's context to guard non-idempotent calls.

## When to Reach for a Full Workflow Engine

Database-backed durable jobs cover a huge amount of ground, but they are not the answer to everything. There is a point where a dedicated durable execution engine earns its keep, and being clear about that line builds trust rather than eroding it.

Reach for a tool like **Temporal**, **Restate**, **AWS Step Functions**, **Azure Durable Functions**, or the new **AWS Lambda Durable Execution SDK for Java** when you have:

- **Long-running orchestrations that pause for days or weeks.** Workflows that sleep waiting for a human approval or an external event, sometimes for months, are what these engines are built for. Some support durable waits of up to a year.
- **Complex branching across many services**, where you genuinely need full deterministic replay of in-memory state and step-by-step versioning of long-lived workflows.
- **Polyglot orchestration**, where the same workflow coordinates services written in several languages.

Those capabilities are real, and they are powerful. They also come at a cost that the vendors themselves are candid about. You run and operate a separate service. Your workflow code has to obey a determinism contract, which means no calling the clock, the network, or random number generators outside of designated steps. And your team has to learn how replay and workflow versioning behave, which is a genuine mental model, not a one-line dependency.

For many Java teams, that is more machinery than the problem calls for. If what you actually need is reliable, resumable, retried background work on the infrastructure you already run, a database-backed job scheduler gets you there with far less to operate. If you are weighing the options, our comparisons of [JobRunr versus Spring Batch]({{<ref "blog/spring-batch-vs-jobrunr.md">}}) and [the modern alternatives to Quartz]({{<ref "blog/2024-10-31-task-schedulers-java-modern-alternatives-to-quartz.md">}}) lay out where each tool fits.

## The Short Version

Durable execution is not a magic product category. It is a set of properties you want from anything that runs important work in the background.

- **Persist the work**, so a restart does not lose it.
- **Journal the steps**, so a retry can resume instead of restarting.
- **Retry automatically**, so transient failures heal themselves.
- **Keep your side effects idempotent**, because at-least-once is the honest default.

If you already run JobRunr, you have persistent jobs, automatic retries with back-off, zombie-job recovery, and exactly-once steps through `runStepOnce`, most of it in the open-source version, all of it on the database you already have. For the long-running, deeply branching, multi-language orchestrations, a dedicated engine like Temporal is the right call. For the background jobs the rest of us run every day, durable enough, without a separate engine, is usually exactly right.

Want to see it work? [Get started with JobRunr]({{<ref "documentation/_index.md">}}) and try `runStepOnce` on your next multi-step job. Your future self, the one not explaining a double charge, will thank you.
