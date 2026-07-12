---
title: "Durable Execution Without a Workflow Engine: Just Your Database and JobRunr"
description: "Durable execution does not require a separate workflow engine. Here is the honest cost of Temporal-style engines, a real crash test of JobRunr's runStepOnce, and how to decide what your Java team actually needs."
keywords: ["durable execution", "durable execution java", "do i need a workflow engine", "runsteponce", "exactly once java", "idempotent jobs", "database backed durable execution"]
images:
  - /blog/durable-execution-without-a-workflow-engine.webp
image: /blog/durable-execution-without-a-workflow-engine.webp
date: 2026-07-09T10:00:00+02:00
author: "Nicholas D'hondt"
draft: true
tags:
  - blog
  - durable execution
  - job scheduling
  - temporal
---

Durable execution is having a moment, and most of the moment comes with a sales pitch attached. Write ordinary code, the story goes, and it will survive any crash, any restart, any bad deploy. That part is true and genuinely worth wanting. The part that quietly rides along with it is the assumption that to get there you need to stand up a new distributed system next to the one you already run.

We covered the fundamentals in [What Is Durable Execution?]({{<ref "blog/what-is-durable-execution-java.md">}}), so this post takes the harder question head on. Do you actually need a dedicated workflow engine to get durable execution in Java? Our answer, after running the experiments below, is that most teams don't. They need durable jobs, and they almost certainly already have the one piece of infrastructure required to get them.

> **Short answer:** A **workflow engine** like Temporal buys you **full deterministic replay**, which is real and powerful. It also charges you **a real bill**, with a separate clustered service to operate, a determinism contract your code must obey, and workflow versioning to manage. For the long-running, deeply branching, multi-language orchestrations, that trade is worth it.
> <br/><br/>
> For the background jobs the rest of us run every day, a **database-backed scheduler** gives you **persistence, automatic retries, and checkpointed steps** that skip on retry, with **nothing extra to operate**. And because even the big engines run your side effects at-least-once, you write [idempotent]({{<ref "blog/Idempotence-in-java-job-scheduling.md">}}) steps either way.

## Two definitions of "durable execution"

There are two ideas wearing the same name, and mixing them up is how teams end up over-buying.

The first is **the property**: important work survives crashes and resumes instead of starting over. You want this for almost anything that runs in the background.

The second is **the product category**: a class of engines that deliver the property through deterministic event-sourced replay, where the engine records a journal of every step and, after a failure, re-runs your orchestration code from the top while feeding it the recorded results so it lands back exactly where it crashed.

The property is the goal. Event-sourced replay is one implementation of it, and a heavy one. A database-backed job scheduler reaches the same property by a lighter route, checkpointing completed steps rather than replaying the entire function. Both make your work durable; they just pay for it differently, and the price difference is the whole story.

## The bill the engine hands you

The durable execution engines are good software built by serious people, and none of what follows is a knock on their quality. It is about the operational and cognitive cost their model requires, taken straight from their own documentation because that is the fairest possible source.

### You operate a distributed system to run your distributed system

Temporal's own architecture docs describe a cluster made of four independently scaling services, the Frontend, History, Matching, and internal Worker services, each with different scaling characteristics and recommended to run separately in production ([Temporal Service docs](https://docs.temporal.io/temporal-service/temporal-server)). That cluster cannot run on its own. It requires its own persistence store to hold workflow histories and visibility data, separate from the database your application already uses ([Temporal persistence docs](https://docs.temporal.io/temporal-service/persistence)).

So before your first workflow runs, the self-hosted picture is four services and a dedicated datastore, plus your own worker fleet that polls task queues. Temporal Cloud exists precisely so you can pay someone else to run that for you, which tells you how much there is to run.

{{< svg "assets/blog/workflow-engine-vs-jobrunr-architecture.svg" >}}

Restate is lighter here, and credit where it is due. It ships as a single Rust binary and is pleasant to operate ([Restate key concepts](https://docs.restate.dev/foundations/key-concepts)). It is still a separate stateful service in your architecture, sitting in front of your application and owning the journal, with its own deployment, upgrades, and failure modes to understand.

### Your code has to obey a determinism contract

This is the cost people underestimate, because it does not show up on an architecture diagram. It shows up in your code review.

Temporal workflow code is replayed from history after every failure, so it must be deterministic ([Workflow definition](https://docs.temporal.io/workflow-definition)). No reading the clock, no random values or UUIDs, no threads, no I/O. Anything that touches the real world has to move into an Activity.

### Changing a running workflow is its own discipline

Because old executions replay against old history, you cannot freely edit a long-running workflow. Temporal's recommended approach today is Worker Versioning, where you pin running executions to the worker deployment that started them, with `Workflow.getVersion` patching as the in-place alternative, and replay tests against representative production histories before you deploy ([versioning](https://docs.temporal.io/develop/java/workflows/versioning), [safe deployments](https://docs.temporal.io/develop/safe-deployments)). So when a workflow runs for weeks, every code change you ship in the meantime turns into a versioning question. Fair enough, the replay model demands it, but it's a discipline you simply wouldn't have to learn with a plain job queue.

### What the boilerplate looks like

To make the cost concrete, here is the shape of a minimal Temporal job in Java. It is faithful to the official getting-started structure: an interface and implementation for the workflow, an interface and implementation for the activity, a worker that registers them, and a starter that kicks it off.

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
    void reserveInventory(String orderId);
    void charge(String orderId);
    void scheduleShipment(String orderId);
}

// 3. The workflow implementation. Deterministic only.
//    No clock, no randomness, no I/O, no native threads.
public class OrderWorkflowImpl implements OrderWorkflow {
    private final OrderActivities activities = Workflow.newActivityStub(
        OrderActivities.class,
        ActivityOptions.newBuilder()
            .setStartToCloseTimeout(Duration.ofSeconds(30))
            .build());

    @Override
    public void processOrder(String orderId) {
        activities.reserveInventory(orderId);
        activities.charge(orderId);
        activities.scheduleShipment(orderId);
    }
}

// 4. The worker process you run and operate
public class OrderWorker {
    public static void main(String[] args) {
        WorkflowServiceStubs service = WorkflowServiceStubs.newLocalServiceStubs();
        WorkflowClient client = WorkflowClient.newInstance(service);
        WorkerFactory factory = WorkerFactory.newInstance(client);
        Worker worker = factory.newWorker("ORDER_TASK_QUEUE");
        worker.registerWorkflowImplementationTypes(OrderWorkflowImpl.class);
        worker.registerActivitiesImplementations(new OrderActivitiesImpl());
        factory.start();
    }
}

// 5. The starter that enqueues an execution
WorkflowOptions options = WorkflowOptions.newBuilder()
    .setTaskQueue("ORDER_TASK_QUEUE")
    .setWorkflowId("order-" + orderId)
    .build();
OrderWorkflow workflow = client.newWorkflowStub(OrderWorkflow.class, options);
workflow.processOrder(orderId);
```

None of that is bad code. It is the price of admission for deterministic replay, and behind it sits the cluster and datastore from earlier. Hold this example in mind, because the JobRunr version of the same job is a single annotated method.

**Spoiler:** [jump right to the JobRunr implementation](#the-lighter-route-durable-execution-on-the-database-you-already-have).

## The detail the pitch skips: exactly-once is not what you think

Here is the point that quietly levels the field, and it comes from Temporal's own documentation.

Temporal runs your Workflow *logic* exactly once and to completion ([Temporal docs](https://docs.temporal.io/temporal)), but your *Activities* "may be executed multiple times" ([Activity definition](https://docs.temporal.io/activity-definition#idempotency)). Read that again, because it is the whole game. The orchestration runs as if once. The steps that actually touch the world, the ones that charge a card or call an API, can run more than once. That is why every durable execution engine, Temporal and Restate included, tells you in plain language that your steps must be [idempotent]({{<ref "blog/Idempotence-in-java-job-scheduling.md">}}).

So the determinism contract and the separate cluster don't buy you exactly-once side effects. They can't, because the universe doesn't offer that guarantee across a process that can die at any instant. What they buy you is exactly-once orchestration with full in-memory replay. The [idempotency]({{<ref "blog/Idempotence-in-java-job-scheduling.md">}}) work, the part that actually prevents the double charge, is still yours to do, exactly as it is with a job scheduler.

Once you see that, the comparison changes. The question is no longer "durable engine versus unsafe jobs." It is "two ways to get durable orchestration, both of which require idempotent steps, one of which needs a new distributed system and a determinism contract, and one of which needs the database you already run."

## The lighter route: durable execution on the database you already have

A database-backed job scheduler gets you the durable execution property without the engine. With [JobRunr](https://github.com/jobrunr/jobrunr), the moving parts are these, and all of them are in the free, open-source version.

Your jobs are persisted, not held in memory. Enqueue a job and JobRunr serializes it into your existing SQL or NoSQL database, no Redis and no broker. If the app restarts, the job is still there. Failed jobs retry automatically with exponential back-off, up to ten attempts by default, which you can tune in [Dealing with exceptions]({{<ref "documentation/background-methods/dealing-with-exceptions.md">}}). Jobs stranded on a server that crashed are detected as zombie jobs and picked back up, because JobRunr elects a master node to handle exactly that.

That is persistence, automatic retries, and crash recovery, the core of the durable execution property, with zero extra infrastructure.

For multi-step work, JobRunr v8 shipped a feature named, fittingly, durable executions, through `JobContext.runStepOnce`. You break a job into named steps, JobRunr checkpoints each one as it completes, and a retry never re-runs a completed step. The entire order workflow from the Temporal example above looks like this:

```java
@Job(name = "Process order %0", retries = 5)
public void processOrder(String orderId, JobContext jobContext) {
    jobContext.runStepOnce("reserve-inventory", () -> inventoryService.reserve(orderId));
    jobContext.runStepOnce("charge-payment",    () -> paymentService.charge(orderId));
    jobContext.runStepOnce("schedule-shipment", () -> shippingService.schedule(orderId));
}
```

One class, one method, plain Java. No determinism contract, because this isn't replayed code, it's normal code with checkpoints. You can call the clock, generate a UUID, and read config wherever you like. The only discipline you keep is the one you keep anyway: making the steps that touch the world safe to repeat.

## We tested it, including where it bites

Claims are cheap, so we built the order job above, step names and all, against a real PostgreSQL database and ran two scenarios. The full project is a single Maven module with JobRunr 8.6.1 and Postgres, and the complete code is [on GitHub](https://github.com/iNicholasBE/temporal-vs-jobrunr-benchmark) so you can run both scenarios yourself. Each step writes one row to a `ledger` table, so counting rows tells us, with no room for interpretation, how many times each side effect actually happened.

**Scenario one, a transient failure.** The shipping step throws an exception on its first attempt, the way a flaky downstream API would. JobRunr retries the whole job. The result, straight from the database:

```text
       step        | count
-------------------+-------
 reserve-inventory |     1
 charge-payment    |     1
 schedule-shipment |     1
```

Exactly once for every step. On the retry, the two completed steps were skipped and only the failed step ran again. This is `runStepOnce` doing precisely what it promises, and it is the case the feature is built for. The customer is charged once.

**Scenario two, a hard crash in the worst possible spot.** We killed the JVM with a `halt`, the equivalent of `kill -9`, right after the payment was charged but before the step's checkpoint reached the database. A fresh process then recovered the orphaned job:

```text
       step        | count
-------------------+-------
 reserve-inventory |     2
 charge-payment    |     2
 schedule-shipment |     1
```

The payment ran twice. We are showing you this on purpose, because it is the honest boundary of the lighter model and you deserve to know exactly where it is. `runStepOnce` checkpoints completed steps to the database at the poll interval, so the vulnerable window is not some freak microsecond, it can be seconds wide. If the process dies after a side effect but before its checkpoint is written, the recovering worker has no record that the step finished and runs it again. That is also why `reserve-inventory` shows two rows: its checkpoint was waiting on the same flush when the process died, so it replayed too.

{{< svg "assets/blog/runsteponce-crash-test-ledger.svg" >}}

And now the punchline you have already met. A full engine doesn't save you here either. Temporal runs activities at-least-once for the same fundamental reason, a process can die after the side effect and before the result is journaled. The fix in both worlds is identical. Make the money-moving step idempotent, with a provider idempotency key or a pre-check, and the second attempt becomes a no-op. We wrote the patterns up in [Why is Idempotence Important in Java Job Scheduling?]({{<ref "blog/Idempotence-in-java-job-scheduling.md">}}).

JobRunr even hands you the key for it. A job keeps the same id across every retry and recovery, so `jobContext.getJobId()` is a ready-made idempotency key to pass along to your payment provider:

```java
jobContext.runStepOnce("charge-payment", () ->
    paymentService.charge(orderId, jobContext.getJobId().toString()));
```

When the recovered job runs the step again, it sends the same key, the provider recognizes it, and the double charge from scenario two turns into a no-op.

## We also raced them: 1000 orders, fair rules

Correctness was only half the question, so we benchmarked the cost too. We implemented the exact same three-step order fulfillment workflow twice, once as the Temporal workflow you saw above and once as the single JobRunr method, and pushed 1000 orders through each with 24 workers. The harness lives in the same [GitHub repo](https://github.com/iNicholasBE/temporal-vs-jobrunr-benchmark) as the crash test.

And because a rigged benchmark would be worse than no benchmark, we deliberately stacked the deck in Temporal's favor wherever there was a choice to make. No dev server with its in-memory store: Temporal ran the real self-hosted production image against its own PostgreSQL 16, with 512 history shards, Temporal's own production default. Workflow starts were issued from 24 concurrent threads, because sequential starts would have unfairly inflated Temporal's enqueue time. And we raised the worker's task pollers from the SDK default of 5 to 24, because the default quietly throttles fast activities and we wanted to measure the engine, not a misconfiguration. 

JobRunr got nothing special: a plain Postgres container and default settings. Then we ran the whole suite twice over, on a 14-core Apple Silicon Mac and on a dedicated 8-core Hetzner server, so nobody can blame the laptop.

Here is what the same 1000 orders cost, on both machines:

| 1000 orders, 24 workers | Mac: JobRunr | Mac: Temporal | Hetzner: JobRunr | Hetzner: Temporal |
| :--- | ---: | ---: | ---: | ---: |
| Instant steps | **1.4 s** | 14.3 s | **1.8 s** | 13.6 s |
| 25 ms per step | **8.4 s** | 15.4 s | **8.4 s** | 13.7 s |
| CPU, all processes | **3.9 cpu-s** | 38.9 cpu-s | **13.3 cpu-s** | 83.2 cpu-s |
| Peak memory | **340 MB** | 996 MB | **388 MB** | 868 MB |

The numbers worth staring at are not the totals, they are the first two rows read together. Add 25 ms of simulated API latency to every step and JobRunr's total grows several times over, because JobRunr spends its time waiting on the actual work. Temporal's total barely moves on either machine, because the actual work was already hiding inside the engine's own overhead: every step becomes task-queue dispatches, gRPC round trips, and durable history writes. For a job this size, the orchestrator, not your code, is the bottleneck.

Same fairness in the other direction: that overhead is not waste, it is the receipt for the features from earlier in this post, the full event history, replay debugging, queryable state, signals, and timers. If you need those, the bill is worth paying. The benchmark just puts a number on the bill, and for a three-step background job it is roughly six to ten times the CPU, twice the memory, and a second database, to run the same 1000 orders slower.

## So which one do you actually need?

Three questions decide it: does your orchestration branch so deeply that you need full replay and workflow versioning, does one workflow coordinate services written in several languages, and do you need signals, queries and child workflows as first-class primitives?

{{< svg "assets/blog/workflow-engine-decision-tree.svg" >}}

The engines are the right answer for the heaviest orchestration problems, and the capabilities behind those three questions are real and hard to replicate. The mistake is reaching for an engine when your answer to all three is no, and for most Java teams running background work, it is no to all three. You pay the full operational and cognitive cost of an orchestration platform to solve a problem a persistent job queue already solves.

And one case that looks like engine territory but is not: jobs that wait days or weeks on an external system or a human sign-off. JobRunr Pro parks these as [External Jobs]({{<ref "guides/advanced/external-jobs.md">}}), a plain row in your database that consumes no worker threads until the completion signal arrives.

## Where this leaves you

Durable execution is a property worth wanting, not a product you are obligated to buy. The property is persistence, checkpointed steps, automatic retries, and idempotent side effects. A workflow engine delivers it through deterministic replay, which is powerful and costs you a clustered service, a determinism contract, and workflow versioning. A database-backed scheduler like JobRunr delivers the same property on the database you already run, with the side-effect [idempotency]({{<ref "blog/Idempotence-in-java-job-scheduling.md">}}) that you would owe the engine anyway.

We showed you the case it handles perfectly and the case where it bites. For the long-running, multi-language, deeply branching orchestrations, reach for the engine and don't look back. For the background jobs the rest of us ship every week, durable enough, on infrastructure you already operate, is not a compromise, it is the right amount of machinery.

Want to try the lighter route? [Get started with JobRunr]({{<ref "documentation/_index.md">}}), reach for `runStepOnce` on your next multi-step job, and keep your card-charging steps [idempotent]({{<ref "blog/Idempotence-in-java-job-scheduling.md">}}). That last habit is the one piece no tool, however expensive, will ever do for you.
