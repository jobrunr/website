---
title: "What Is Durable Execution? A Practical Guide for Java Developers"
description: "Learn what durable execution means for Java applications, from journaled steps and automatic replay to exactly-once semantics and crash recovery, and how JobRunr delivers it without a separate workflow engine."
keywords: ["durable execution java", "what is durable execution", "durable execution", "crash recovery job processing", "exactly once java", "idempotent jobs", "automatic retries java"]
images:
  - /blog/what-is-durable-execution-java.webp
image: /blog/what-is-durable-execution-java.webp
date: 2026-06-05T10:00:00+02:00
author: "Nicholas D'hondt"
tags:
  - blog
  - durable execution
  - job scheduling
---

Picture a job that charges a customer, reserves stock, and sends a confirmation email. It charges the card, reserves the stock, and then the pod restarts during a deploy. The email never goes out. The job is marked as failed, so it runs again from the top. Now the customer is charged twice.

This is the problem **durable execution** is meant to solve. The term has been getting a lot of attention lately, mostly from workflow engines like Temporal and Restate. But the idea behind it is older than the buzzword, and if you already run background jobs in Java, you are closer to it than you think.

> [!TIP]
> Just want to see how JobRunr handles this? [Skip ahead to How JobRunr Delivers Durable Execution](#how-jobrunr-delivers-durable-execution). Otherwise, read on for what durable execution is and why it matters.


## What Durable Execution Actually Means

> **Short answer:** Durable execution is a way of writing code that survives crashes, restarts, and infrastructure failures, then resumes from the last completed step instead of starting over.

That is the whole idea. You write a normal function with several steps. The runtime records the result of each step to durable storage as it happens. If the process dies halfway through, a healthy worker picks the work back up, replays what already happened, and continues from the exact point of failure. Completed steps are not run a second time, and their results are reused.

Compare that to the naive version most of us start with. You write a method, something fails, the whole method runs again, and any step that already succeeded runs again too. Durable execution removes that "start over from zero" behavior. The progress your code made is durable, hence the name.

{{< svg "assets/blog/durable-execution-replay.svg" >}}

<div style="text-align:center;margin:-1em 0 2em;"><small style="font-size:80%;">Both jobs crash on the email step. Without durable execution, the retry replays the whole job and charges the customer a second time. With it, the completed steps are skipped and the job resumes at the step that failed.</small></div>


## The Four Principles of Durable Execution

Strip away the vendor language and durable execution rests on four ideas. Whether you use a full workflow engine or a database-backed job scheduler, these are the moving parts.

### Journaling: recording every step

The foundation is the journal, sometimes called the event history or command log. Before a result is handed back to your code, it is written to durable storage. That log becomes the source of truth for what has already happened.

The journal is what makes recovery possible. Without it, a worker that takes over after a crash has no idea how far the previous worker got. With it, the new worker can read the history and know exactly which steps are done.

### Replay and automatic retries

When something fails, the runtime does not give up. It retries. The trick is that retries replay the journal first. Already-completed steps return their recorded result instead of executing again, and the work resumes at the first step that never finished.


### Exactly-once execution and idempotency

Durable execution gives you **exactly-once** semantics for the *orchestration*. Each step is dispatched once, the overall flow runs as if it executed a single time, and you do not get duplicate runs of your business logic from the engine's point of view.

It does not magically give you exactly-once *side effects*. Most engines, Temporal included, run the individual steps with at-least-once semantics by default, which is exactly why their own docs insist that steps must be idempotent. If a step charges a card and the process dies after the charge but before the result is journaled, the retry has no record that the charge happened.

So durable execution moves the idempotency problem, it does not delete it. You still want your money-moving and data-writing steps to be safe to run more than once. We wrote a full piece on this, [Why is Idempotence Important in Java Job Scheduling?]({{<ref "blog/Idempotence-in-java-job-scheduling.md">}}), and the advice there applies no matter which durable execution tool you pick.

### Crash recovery and persistence

The last principle is the one that ties it together. The state lives outside the process that is running the job. Because the journal sits in durable storage, any worker can recover an in-flight execution after a crash. The process is disposable. The progress is not.

This is also where durable execution overlaps heavily with [distributed job scheduling]({{<ref "blog/distributed-job-scheduling-java.md">}}). The moment your state is in a shared store rather than one server's memory, you can run multiple workers, survive the loss of any one of them, and pick work back up elsewhere.

## How JobRunr Delivers Durable Execution

Here is the part that surprises people. If you run JobRunr, you already have most of this, and a lot of it is in the open-source version.

**Your jobs are persisted, not held in memory.** When you enqueue a job, JobRunr serializes it and stores it in your existing SQL or NoSQL database. No Redis, no separate message broker, just the database you already run. If your application goes down and comes back up, the job is still there, waiting to be processed. That is the persistence principle, with zero extra infrastructure.

**No separate service to deploy.** JobRunr is a library, not a server you stand up and redeploy on its own. Add it to your application and it runs in-process, or run it as its own microservice if you prefer. Either way there is no extra system to operate, monitor, or keep in sync with your releases.

**Failed jobs retry automatically with back-off.** Out of the box, JobRunr retries a failing job up to 10 times with a smart exponential back-off policy. You can read the details in [Dealing with exceptions]({{<ref "documentation/background-methods/dealing-with-exceptions.md">}}). That is the automatic-retries principle, handled for you.

**Crashed-server jobs get noticed.** JobRunr watches for zombie jobs, which are jobs that were being processed on a server node that crashed. It elects a master node to coordinate this housekeeping, so a job stuck on a dead worker does not silently vanish.

And then there is the piece that maps most directly onto durable execution. JobRunr v8 shipped a feature called, fittingly, **durable executions**, through `JobContext.runStepOnce`.

It lets you break a job into named steps that each run exactly once. If the job is retried, any step that already completed is skipped, and execution resumes at the first step that did not finish. That is journaling and replay, expressed as plain Java. You give every step a stable id and wrap the work in `runStepOnce`:

```java
public class OrderService {

    public void processOrder(Long orderId, JobContext jobContext) {
        jobContext.runStepOnce("charge-customer", () -> paymentService.charge(orderId));
        jobContext.runStepOnce("reserve-stock", () -> stockService.reserve(orderId));
        jobContext.runStepOnce("send-confirmation", () -> emailService.sendConfirmation(orderId));
    }
}
```

You do not create that `jobContext` yourself. You add it as a parameter to your job method, and JobRunr passes in the live context when the job runs. 

Now go back to the scenario from the top of this post. The job charges the customer, reserves the stock, and the pod restarts before the email is sent. When JobRunr retries the job, `charge-customer` and `reserve-stock` are already recorded as complete, so they are skipped. Only `send-confirmation` runs. No double charge.

If a step throws, it is not marked complete, so the retry runs it again. And `runStepOnce` can return a value to feed into the next step, so you can pass results down the chain.

> [!NOTE]
> There is a small difference between editions in *when* a completed step is saved. JobRunr Pro writes the job state to the database the moment a step finishes, so recovery after an abrupt crash resumes from exactly the last completed step. JobRunr OSS saves state on its normal poll interval, so a hard crash in the window since the last save can replay the step that had just finished.

```java
// runStepOnce returns the step's result and stores it, so a later
// replay reuses the value instead of recomputing it.
String chargeId = jobContext.runStepOnce("charge-customer",
        () -> paymentService.charge(orderId));

jobContext.runStepOnce("send-confirmation",
        () -> emailService.sendConfirmation(orderId, chargeId));
```

On a retry that skips `charge-customer`, the stored `chargeId` is replayed, so the confirmation still references the original charge.

For a hands-on walkthrough, with a runnable demo and the JobRunr dashboard showing a job resume after a failure, see the [durable executions guide]({{<ref "guides/advanced/durable-executions.md">}}).

Now the honest part. JobRunr gives you durable *jobs* with exactly-once *steps*, and it stores each step's result and replays it on a retry, all on the database you already have. That covers the large majority of background work, the reservation jobs, the report generation, the multi-step pipelines, the API integrations, and you get it without running another service.

Where a dedicated engine like Temporal goes further is long-running waits as first-class primitives, pausing a single function for days with a durable `sleep`, or blocking until an external signal arrives with a durable `await`. JobRunr reaches those same outcomes a different way. A delay is just a scheduled job, waiting on an outside system is what JobRunr Pro's [External Jobs]({{<ref "guides/advanced/external-jobs.md">}}) are for, and sequencing work across jobs is [job chaining]({{<ref "documentation/pro/job-chaining.md">}}). For the everyday case you need none of it, and what you do need runs on infrastructure you already operate.


## The Short Version

Durable execution is not a magic product category. It is a set of properties you want from anything that runs important work in the background.

- **Persist the work**, so a restart does not lose it.
- **Journal the steps**, so a retry can resume instead of restarting.
- **Retry automatically**, so transient failures heal themselves.
- **Keep your side effects idempotent**, because at-least-once is the honest default.

If you already run JobRunr, you have persistent jobs, automatic retries with back-off, zombie-job recovery, and exactly-once steps through `runStepOnce`, most of it in the open-source version, all of it on the database you already have. For the long-running, deeply branching, multi-language orchestrations, a dedicated engine like Temporal is the right call. For the background jobs the rest of us run every day, being durable enough on the database you already have is usually all you need.

Want to see it work? [Get started with JobRunr]({{<ref "documentation/_index.md">}}) and try `runStepOnce` on your next multi-step job. Your future self, the one not explaining a double charge, will thank you.
