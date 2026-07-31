---
title: "JobRunr vs. Temporal: Choosing the Right Durable Execution Tool for Java"
description: "We implemented the same order workflow in JobRunr and Temporal, benchmarked both on two machines, and counted every database transaction. Here is an honest comparison to help you pick the right tool."
keywords: ["jobrunr vs temporal", "temporal alternative java", "temporal java sdk", "durable execution java", "java workflow engine", "temporal vs jobrunr benchmark", "runsteponce"]
images:
  - /blog/jobrunr-vs-temporal.webp
image: /blog/jobrunr-vs-temporal.webp
date: 2026-07-12T10:00:00+02:00
author: "Nicholas D'hondt"
draft: false
aliases:
  - /blog/durable-execution-without-a-workflow-engine/
tags:
  - blog
  - job scheduling
  - durable execution
  - temporal
---

Search for durable execution in Java and you will quickly land on two very different answers. One is **Temporal**, a dedicated workflow orchestration platform with its own server cluster. The other is **JobRunr**, a job scheduling library that runs inside your application on the database you already have. Both promise the same headline: multi-step work that survives crashes, retries automatically, and never re-runs a completed step.

We did not want to compare marketing pages, so we implemented the exact same three-step order workflow in both, pushed 1000 orders through each on two different machines, and instrumented PostgreSQL on both sides to count every transaction. The full project, harness, and results are [on GitHub](https://github.com/iNicholasBE/temporal-vs-jobrunr-benchmark) so you can rerun everything yourself.

> **Short answer:** Temporal is a workflow orchestration platform. You deploy and operate it as its own distributed system, and in return you get deterministic replay, signals, durable timers, and multi-language orchestration. JobRunr is a Java library. You add a dependency, point it at your existing database, and get persistent jobs with checkpointed steps through `runStepOnce`, with nothing new to deploy. 
><br/> 
><br/> 
> Neither makes your code magically resilient: both run side effects at-least-once, so the [idempotency]({{<ref "blog/Idempotence-in-java-job-scheduling.md">}}) homework is yours either way, and Temporal additionally requires you to keep workflow code deterministic. For deeply branching, polyglot, long-lived orchestrations, Temporal earns its keep. For the multi-step background jobs most Java services actually run, JobRunr delivers the same durability guarantee at a fraction of the code, infrastructure, and CPU.

This post will break down the differences. As with our [Spring Batch comparison]({{<ref "blog/spring-batch-vs-jobrunr.md">}}), we are not here to declare a universal winner. We are here to give you a clear, honest comparison, with real code and measured numbers, so you can pick the right tool for your project.

## What is Temporal? The workflow orchestration platform

Temporal is an open-source durable execution platform that grew out of Uber's Cadence project. Its core idea is **event-sourced replay**. Your workflow code does not just run, it is recorded. Every step produces events in a history, and when a worker crashes, Temporal re-runs your workflow function from the top on another worker while feeding it the recorded results, so the code lands back exactly where it stopped. State lives in the history, not in your process.

That model is powerful, and it has architectural consequences. Temporal runs as a separate server, made of four independently scaling services (Frontend, History, Matching, and an internal Worker service), backed by its own persistence store for histories and visibility data ([Temporal service docs](https://docs.temporal.io/temporal-service/temporal-server)). Your application then runs a fleet of workers that poll the server for tasks over gRPC. You can self-host all of that or pay for Temporal Cloud.

The replay model also puts a contract on your code. Workflow code is re-executed from history after failures, so it must be deterministic ([workflow definition docs](https://docs.temporal.io/workflow-definition)). You cannot call `System.currentTimeMillis()` or `new Random()` directly, you use the SDK's deterministic substitutes like `Workflow.currentTimeMillis()` and `Workflow.randomUUID()`, and everything that actually touches the real world, with side-effects, moves into an Activity, which gets its own interface and implementation.

Here is the complete order workflow from our benchmark, in idiomatic Temporal Java:

```java
// 1. The workflow interface
@WorkflowInterface
public interface OrderWorkflow {
    @WorkflowMethod
    void processOrder(String orderId);
}

// 2. The activity interface (everything non-deterministic lives here)
@ActivityInterface
public interface OrderActivities {
    void chargePayment(String orderId);
    void reserveInventory(String orderId);
    void sendConfirmation(String orderId);
}

// 3. The workflow implementation. Deterministic code only.
public class OrderWorkflowImpl implements OrderWorkflow {

    private final OrderActivities activities = Workflow.newActivityStub(
            OrderActivities.class,
            ActivityOptions.newBuilder()
                    .setStartToCloseTimeout(Duration.ofSeconds(30))
                    .build());

    @Override
    public void processOrder(String orderId) {
        activities.chargePayment(orderId);
        activities.reserveInventory(orderId);
        activities.sendConfirmation(orderId);
    }
}

// 4. The activity implementation, plus a worker that registers both
//    and a starter that launches executions (not shown).
```

Four types and around 50 lines for three sequential calls, before the worker bootstrap. None of it is bad code, but it is a lot of ceremony for three method calls, and every piece of it exists because the replay model demands it.

## Should you use Temporal?

**You should not choose Temporal for the durability promise alone.** Persistent, automatically retried, checkpointed work is something a database-backed job scheduler already gives you. And durable execution is a programming paradigm before it is a product: no tool makes your code resilient by itself. Resilience comes from code that is safe to retry, which means a deterministic workflow and idempotent steps, and that discipline stays yours whichever tool records the checkpoints.

What a platform buys you is orchestration power. Temporal shines when the coordination itself is the hard problem. Choose it when:

* One workflow **coordinates services written in several languages**. Temporal has SDKs for Java, Go, TypeScript, Python, .NET, PHP, and Ruby, and a workflow in one language can drive activities in another.
* You need **signals, queries, durable timers, and child workflows as first-class primitives**: a workflow that sleeps for thirty days without holding a thread, or pauses mid-flight until a human approves and then branches on the answer.
* Your workflows **branch deeply and live for weeks or months**, and you want the full event history of every execution for replay-based debugging and audit.
* Your **steps are safe to repeat but expensive to repeat**: hours-long computations or heavily rate-limited API calls, where re-running an already completed step is waste you cannot afford. This justifies the cost of checkpointing overhead.
* You are **replacing a home-grown orchestrator**, hand-rolled state machines, status columns, and scheduler glue, and want tested primitives instead, with a testing story to match: Temporal's `TestWorkflowEnvironment` skips time, so a workflow that waits a month finishes its unit test in milliseconds.
* You are prepared to **operate the platform** (or pay for Temporal Cloud) and to teach the team the determinism contract and workflow versioning that come with the replay model.

If none of that describes your system and durability is what you are after, a lighter tool like JobRunr delivers the same guarantee without the learning curve, the platform to operate, and the consumption bill. Checkpointing through an engine also has a runtime cost, every step becomes task dispatches, gRPC round trips, and durable history writes, and the benchmark below puts a number on it.

Temporal's co-creator Maxim Fateev frames the tool the same way we do here: not as a replacement for existing queues, but as a different way to design and implement your application ([community.temporal.io](https://community.temporal.io/t/temporal-vs-queues-kafka-sqs-etc/7401)). Above all, Temporal is an application architecture.

## What is JobRunr? Durable execution on the database you already run

[JobRunr](https://github.com/jobrunr/jobrunr) approaches the same goal from the opposite direction. It is a lightweight library, not a platform. You add one dependency, point it at the SQL or NoSQL database your application already uses, and any Java method or lambda becomes a persistent background job. Jobs are serialized to the database, workers across all your app instances poll for them, failed jobs retry with exponential back-off, and jobs stranded on a crashed server are picked up again automatically. A built-in dashboard shows every job in real time.

<figure>
{{< svg "assets/blog/temporal-vs-jobrunr-architecture.svg" >}}
<figcaption>What each tool adds to your architecture. Temporal brings its own cluster and persistence store; JobRunr rides along inside the application and database you already run.</figcaption>
</figure>

For multi-step work, JobRunr v8 added [durable executions]({{<ref "guides/advanced/durable-executions.md">}}) through `JobContext.runStepOnce`, in the free open-source version. You name each step, JobRunr checkpoints it in the job's own database row when it completes, and a retry skips every completed step. 
The same order workflow from the Temporal example looks like this with JobRunr:

```java
public class OrderFulfillmentJob {

    @Job(name = "Fulfill order %0", retries = 5)
    public void fulfillOrder(String orderId, JobContext jobContext) {
        jobContext.runStepOnce("charge-payment", () ->
                paymentService.charge(orderId, jobContext.getJobId().toString()));
        jobContext.runStepOnce("reserve-inventory", () -> inventoryService.reserve(orderId));
        jobContext.runStepOnce("send-confirmation", () -> mailService.sendConfirmation(orderId));
    }
}
```

One class, 12 lines, plain Java. Because nothing is replayed from a history, there is no engine-enforced determinism contract: reading the clock or generating a UUID will not break a replay, and you can log freely. But be precise about what that buys you. A retry still re-runs the method from the top and only skips completed steps, so code *outside* the steps executes again on every attempt. Durable execution principles still apply: any value that must be identical across attempts belongs inside a step. Notice the second argument to `charge`: the job id is stable across every retry and recovery, which makes `jobContext.getJobId()` a ready-made [idempotency]({{<ref "blog/Idempotence-in-java-job-scheduling.md">}}) key for your payment provider. More on why you need that below, with either tool.

That "inside a step" rule is what the value-returning `runStepOnce` overload is for. The result is stored with the job and replayed into every later run:

```java
Instant startedAt = jobContext.runStepOnce("started-at", () -> Instant.now());
String chargeId = jobContext.runStepOnce("charge-payment", () -> paymentService.charge(orderId));
jobContext.runStepOnce("send-confirmation", () -> mailService.sendConfirmation(orderId, chargeId));
```

On a retry, `startedAt` and `chargeId` come back from the stored results instead of being recomputed. A bare `Instant.now()` at the top of the method would hand every attempt a different timestamp, so a check like "is this payment stale?" could flip its answer between attempt one and attempt three. Wrapped in a step, every attempt sees the same instant. The same applies to control flow: branch on stored step results and every retry follows the path the first attempt took. So the difference with Temporal is not that JobRunr repeals determinism. It is who enforces it and how far it reaches. In Temporal, non-deterministic workflow code breaks the replay mechanism itself, so the SDK polices your clock, your random numbers, and your data structures. In JobRunr, the engine does not care what you do between steps; you only have to checkpoint the specific values your logic depends on across retries. The [durable executions guide]({{<ref "guides/advanced/durable-executions.md">}}) walks through this in more detail.

## Should you use JobRunr?

**JobRunr is the right choice when the steps are the hard problem and the orchestration is straightforward.** Most background work in a JVM service looks exactly like that: a handful of dependent steps that must survive crashes and retries, not a months-long state machine. Choose it when:

* You need **background job processing, not only workflows**: fire-and-forget tasks, delayed jobs, and recurring cron jobs are one-liners that get the same persistence, retries, and monitoring. JobRunr is a job scheduler first; durable multi-step workflows are one of its features, not a separate system to adopt.
* Your workflows are **sequences of steps in a JVM application**, like order fulfillment, provisioning, billing runs, or data syncs, and you want them crash-proof without new infrastructure.
* You want **zero extra services to operate**. If your app and your database are up, your durable jobs run. There is nothing else to deploy, patch, monitor, or pay for.
* You value **plain Java and a minimal learning curve**. Any developer who can write a method can write a durable multi-step job in the first hour, and test it with plain JUnit (or any other JVM testing framework).
* You need **volume on a budget**. As you will see below, the same work costs a fraction of the CPU, memory, and database load.

JobRunr is not the right choice, today, when a single workflow needs complex control flow with long pauses: a multi-step job runs from top to bottom, so it cannot suspend itself for a fixed duration mid-method or block on an external signal. It is also JVM-only, so you cannot use it in cross language applications. If those are hard requirements, Temporal is the better choice. That said, [JobRunr Pro](/en/pro) closes the control-flow gap with a different model: instead of one method that suspends, [job chaining]({{<ref "documentation/pro/job-chaining.md">}}) composes the workflow out of jobs, where delays and external signals become links in the chain. More on that below.


## The numbers: the same 1000 orders on both

We ran the two implementations above through an identical harness: 1000 orders, 24 workers, two scenarios (instant steps to measure pure orchestration overhead, then 25 ms of simulated API latency per step), on a 14-core Apple Silicon Mac and on a dedicated 8-core Hetzner server. Versions: JobRunr OSS 8.7.1 on a plain Postgres 16 container with default settings, Temporal Server 1.29.7 self-hosted on its own Postgres 16, driven by Temporal Java SDK 1.30.1.

Wherever the harness forced a choice, we made it in Temporal's favor: the real production image with 512 history shards instead of the single-binary dev server and its in-memory store, workflow starts from 24 concurrent threads instead of sequential calls, and task pollers raised from the SDK default of 5 to 24 so we measured the engine rather than a misconfiguration. One caveat cuts the other way: all four Temporal services ran in a single container on the same host as the workload, which is the best case for latency and the worst case for CPU contention. JobRunr's totals include its Postgres too. The complete fairness notes live in the [repo](https://github.com/iNicholasBE/temporal-vs-jobrunr-benchmark).

| 1000 orders, 24 workers | Mac: JobRunr | Mac: Temporal | Hetzner: JobRunr | Hetzner: Temporal |
| :--- | ---: | ---: | ---: | ---: |
| **Instant steps** | 1.4 s | 14.3 s | 1.8 s | 13.6 s |
| **25 ms per step** | 8.4 s | 15.4 s | 8.4 s | 13.7 s |
| **CPU, all processes** | 3.9 cpu-s | 38.9 cpu-s | 13.3 cpu-s | 83.2 cpu-s |
| **Peak memory** | 340 MB | 996 MB | 388 MB | 868 MB |

<small>cpu-s means CPU-seconds: the total processor time consumed across every process involved, databases included. We highlight it because it is the column that maps to cost: wall-clock time is what you wait for, CPU-seconds are what you provision and pay for.</small>

The telling comparison is between the two scenarios. Give every step 25 ms of simulated API latency and JobRunr slows down by exactly that work, from 1.4 to 8.4 seconds, while Temporal registers almost no difference on either machine. The 75 ms of real work per order was already hiding inside the engine's per-order cost of task dispatches, gRPC round trips, and durable history writes. At this job size, you are not waiting on your code, you are waiting on the orchestrator.

> [!TIP]
> The JobRunr numbers above are plain JVM runs. If memory footprint matters to you, JobRunr also supports GraalVM native image builds with both Spring Boot and Quarkus, which shrinks footprint and startup time further.

To see where that cost lives, we re-ran the instant-steps scenario with `pg_stat_database` snapshots taken before and after, on both engines' databases:

| Measured over 1000 orders | JobRunr | Temporal |
| :--- | ---: | ---: |
| **Database transactions committed** | 1,181 | 113,218 |
| **Writes per order** | ~1.2 commits | ~113 commits |
| **Event history rows** | none needed | 12,004 |

That is a **95x difference in committed transactions** for identical work, and it is not a bug on Temporal's side. Temporal is an event-sourcing system, so it durably records every state transition of every workflow (our three-step workflow produces 23 history events), and that record is precisely what powers replay debugging and the complete audit trail. JobRunr stores derived state instead: one insert and two in-place updates per job, with the step checkpoints riding along on those saves and the writes batched across jobs, which is why 1000 orders need only around 1,200 commits. Neither model is wrong, but one of them pays roughly a hundred durable transactions per order for a history you may never look at, and that bill lands on your CPU, your latency, and your database whether you needed the history or not. Admittedly, this picture could differ in JobRunr Pro where each step writes to the database on completion.

The methodology, fairness notes, and raw numbers are in the [benchmark repo](https://github.com/iNicholasBE/temporal-vs-jobrunr-benchmark).

## The question both tools make you answer: exactly-once

Here is the detail that levels the playing field, straight from Temporal's own documentation. Temporal executes your workflow *logic* exactly once, but your Activities, the steps that actually charge cards and call APIs, "may be executed multiple times" ([activity definition docs](https://docs.temporal.io/activity-definition#idempotency)). A process can always die after the side effect happens but before its completion is recorded. No engine can remove that window, which is why Temporal tells you to make activities [idempotent]({{<ref "blog/Idempotence-in-java-job-scheduling.md">}}).

JobRunr is under the same law of physics and says so just as plainly. `runStepOnce` guarantees a completed step is never re-run on a *retry*. Across a *hard crash*, JobRunr OSS checkpoints step state at its poll interval, so a step that finished just before the crash can replay on recovery. JobRunr Pro closes most of that window by writing step state the moment a step completes. Either way, the discipline is the same one Temporal requires: make the side-effect idempotent, and the replay becomes a no-op.

We did not take our own word for it. The [benchmark repo](https://github.com/iNicholasBE/temporal-vs-jobrunr-benchmark) includes a crash test that writes a ledger row for every step execution, run once with an ordinary exception plus retry, and once with a `kill -9` fired right after the payment step completed but before its checkpoint reached the database:

<figure>
{{< svg "assets/blog/runsteponce-crash-test-ledger.svg" >}}
<figcaption>The crash test ledger. On a normal retry every completed step is skipped. After a hard crash inside the checkpoint window, the in-flight steps replay, which is exactly the case the idempotency key covers.</figcaption>
</figure>

So the real comparison is never "exactly-once versus at-least-once". Both tools give you durable orchestration with at-least-once side effects. The difference is what you pay to get it.

## Beyond a single job: workflows at scale

For orchestration that outgrows a single method, the two tools diverge in style. Temporal gives you child workflows, signals, and durable timers inside one long-lived workflow function. [JobRunr Pro](/en/pro) composes the same outcomes out of jobs: [job chaining]({{<ref "documentation/pro/job-chaining.md">}}) sequences work across services, [batches]({{<ref "documentation/pro/batches.md">}}) fan out thousands of child jobs and continue when all succeed, and [External Jobs]({{<ref "guides/advanced/external-jobs.md">}}) park a workflow for days or weeks waiting on an outside system or a human sign-off, as a plain database row that consumes no worker threads. A delay is just a scheduled job.

If you find yourself modelling a state machine with dozens of branches, signals steering it mid-flight, and cross-language hops, that is Temporal territory and we will happily say so. If your "workflow" is a chain of Java jobs with fan-out, a human sign-off, and a wait or two, you do not need to operate a second distributed system to get it.

## Key takeaways

<figure>
{{< svg "assets/blog/temporal-vs-jobrunr-decision-tree.svg" >}}
<figcaption>Three questions decide it. Answer yes to any of them and Temporal earns its platform; answer no to all three and a database-backed scheduler covers you.</figcaption>
</figure>

Choose **Temporal** when the orchestration itself is the hard problem: deeply branching workflows that live for months, coordination across services in multiple languages, signals and queries as core primitives, and a hard requirement for the complete event history of every execution. It is an application architecture you adopt, so budget for the platform work that comes with it, and do not choose it for the durability promise alone: that part, a scheduler already delivers.

Choose **JobRunr** when the steps are the hard problem: crash-proof, multi-step background jobs inside your JVM application, and all the everyday background work around them, fire-and-forget, delayed, and recurring jobs included. You get the same durable execution property in a much lighter package: less code to write, no new infrastructure to operate, and a fraction of the system resources for the same work. The code above and the benchmark put numbers on all three.

And whichever you choose, give the steps that move money or send emails an [idempotency]({{<ref "blog/Idempotence-in-java-job-scheduling.md">}}) key, because both tools will occasionally hand a step to you twice. That habit transfers between them. The infrastructure bill does not.

Ready to try the lighter route? [Get started with JobRunr]({{<ref "documentation/_index.md">}}) in 5 minutes, wrap your next multi-step job in `runStepOnce`, or [request a free JobRunr Pro trial](/en/try-jobrunr-pro/) to add job chaining, batches, and External Jobs on top.
