---
title: "Durable Execution Without a Workflow Engine: Just Your Database and JobRunr"
description: "Durable execution does not require a separate workflow engine. Here is the honest cost of Temporal-style engines, a real crash test of JobRunr's runStepOnce, and how to decide what your Java team actually needs."
keywords: ["durable execution", "durable execution java", "temporal alternative java", "do i need a workflow engine", "jobrunr vs temporal", "runsteponce", "exactly once java", "idempotent jobs", "database backed durable execution"]
images:
  - /blog/durable-execution-without-a-workflow-engine.webp
image: /blog/durable-execution-without-a-workflow-engine.webp
date: 2026-06-11T10:00:00+02:00
author: "Nicholas D'hondt"
draft: true
tags:
  - blog
  - durable execution
  - job scheduling
  - temporal
---

Durable execution is having a moment, and most of the moment comes with a sales pitch attached. Write ordinary code, the story goes, and it will survive any crash, any restart, any bad deploy. That part is true and genuinely worth wanting. The part that quietly rides along with it is the assumption that to get there you need to stand up a new distributed system next to the one you already run.

We covered the fundamentals in [What Is Durable Execution?]({{<ref "blog/what-is-durable-execution-java.md">}}), so this post takes the harder question head on. Do you actually need a dedicated workflow engine to get durable execution in Java? Our answer, after running the experiments below, is that most teams do not. They need durable jobs, and they almost certainly already have the one piece of infrastructure required to get them.

Let us make the case properly, including the parts that do not flatter our own tool.

> **Short answer:** A workflow engine like Temporal buys you full deterministic replay, which is real and powerful. It also charges you a real bill, with a separate clustered service to operate, a determinism contract your code must obey, and workflow versioning to manage. For the long-running, deeply branching, multi-language orchestrations, that trade is worth it. For the background jobs the rest of us run every day, a database-backed scheduler gives you persistence, automatic retries, and exactly-once steps with nothing extra to operate. And because even the big engines run your side effects at-least-once, you write idempotent steps either way.

## Two definitions of "durable execution"

There are two ideas wearing the same name, and conflating them is how teams end up over-buying.

The first is the property. Important work survives crashes and resumes instead of starting over. You want this for almost anything that runs in the background.

The second is the product category. A class of engines that deliver the property through deterministic event-sourced replay, where the engine records a journal of every step and, after a failure, re-runs your orchestration code from the top while feeding it the recorded results so it lands back exactly where it crashed.

The property is the goal. Event-sourced replay is one implementation of it, and a heavy one. A database-backed job scheduler reaches the same property by a lighter route, checkpointing completed steps rather than replaying the entire function. Both make your work durable. They simply pay for it differently, and the difference in price is the whole story.

## The bill the engine hands you

The durable execution engines are good software built by serious people. None of what follows is a knock on their quality. It is the operational and cognitive cost their model requires, taken straight from their own documentation, because that is the fairest possible source.

### You operate a distributed system to run your distributed system

Temporal's own architecture docs describe a cluster made of four independently scaling services, the Frontend, History, Matching, and internal Worker services, each with different scaling characteristics and recommended to run separately in production ([Temporal Service docs](https://docs.temporal.io/temporal-service/temporal-server)). That cluster cannot run on its own. It requires an external persistence store, with Cassandra, PostgreSQL, or MySQL as the supported options, and for production-grade search and visibility the docs point you to Elasticsearch ([Temporal persistence docs](https://docs.temporal.io/temporal-service/persistence)).

So before your first workflow runs, the self-hosted picture is four services, a database, and an Elasticsearch cluster, plus your own worker fleet that polls task queues. Temporal Cloud exists precisely so you can pay someone else to run that for you, which tells you how much there is to run.

Restate is lighter here, and credit where it is due. It ships as a single Rust binary and is pleasant to operate ([Restate key concepts](https://docs.restate.dev/foundations/key-concepts)). It is still a separate stateful service in your architecture, sitting in front of your application and owning the journal, with its own deployment, upgrades, and failure modes to understand.

### Your code has to obey a determinism contract

This is the cost people underestimate, because it does not show up on an architecture diagram. It shows up in your code review.

In Temporal, the orchestration code lives in a Workflow, and that code must be deterministic, because it is replayed from history after every failure ([Workflow definition](https://docs.temporal.io/workflow-definition)). Concretely, the Java SDK docs tell you that inside Workflow code you must not use `System.currentTimeMillis()` and must call `Workflow.currentTimeMillis()` instead, must not generate random values or `UUID.randomUUID()` directly, must not start native threads or use `Thread.sleep`, `Future`, or `CompletableFuture`, and must keep all input and output serializable ([Java workflow basics](https://docs.temporal.io/develop/java/workflows/basics)). Anything that touches the clock, the network, randomness, or the file system belongs in an Activity, not the Workflow.

That is a real mental model, and it is not optional. A single accidental `Instant.now()` in the wrong method is a latent bug that surfaces only when a replay produces a different command sequence than the recorded history, which fails the execution with a non-determinism error ([Java versioning docs](https://docs.temporal.io/develop/java/workflows/versioning)).

### Changing a running workflow is its own discipline

Because old executions replay against old history, you cannot freely edit a long-running workflow. Temporal's guidance is to use `Workflow.getVersion` (patching) for any change to workflow code, recording a marker in history so old and new executions take the correct path, and to run replay tests against representative production histories before you deploy ([versioning](https://docs.temporal.io/develop/java/workflows/versioning), [safe deployments](https://docs.temporal.io/develop/safe-deployments)). For a workflow that lives for weeks, every code change is a versioning decision. That is the right design for their model. It is also work you would not otherwise be doing.

### There are limits you have to architect around

A single Temporal Workflow Execution has a hard limit of 51,200 events or 50 MB of history, with a warning already at 10,240 events or 10 MB ([execution limits](https://docs.temporal.io/workflow-execution/limits)). The prescribed escape hatch for long or chatty workflows is Continue-As-New, which atomically closes the current run and starts a fresh one with a clean history ([very long-running workflows](https://temporal.io/blog/very-long-running-workflows)). Again, sensible engineering for the model. Again, a thing you now own.

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
    void charge(String orderId);
    void reserveStock(String orderId);
    void sendConfirmation(String orderId);
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
        activities.charge(orderId);
        activities.reserveStock(orderId);
        activities.sendConfirmation(orderId);
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

## The detail the pitch skips: exactly-once is not what you think

Here is the point that quietly levels the field, and it comes from Temporal's own documentation.

Temporal provides exactly-once semantics for Workflow *logic* and at-least-once semantics for *Activities* ([workflow execution](https://docs.temporal.io/workflow-execution)). Read that again, because it is the whole game. The orchestration runs as if once. The steps that actually touch the world, the ones that charge a card or call an API, can run more than once. That is why every durable execution engine, Temporal and Restate included, tells you in plain language that your steps must be idempotent.

So the determinism contract and the separate cluster do not buy you exactly-once side effects. They cannot, because the universe does not offer that guarantee across a process that can die at any instant. What they buy you is exactly-once orchestration with full in-memory replay. The idempotency work, the part that actually prevents the double charge, is still yours to do, exactly as it is with a job scheduler.

Once you see that, the comparison changes. The question is no longer "durable engine versus unsafe jobs." It is "two ways to get durable orchestration, both of which require idempotent steps, one of which needs a new distributed system and a determinism contract, and one of which needs the database you already run."

## The lighter route: durable execution on the database you already have

A database-backed job scheduler gets you the durable execution property without the engine. With [JobRunr](https://github.com/jobrunr/jobrunr), the moving parts are these, and most of them are in the free, open-source version.

Your jobs are persisted, not held in memory. Enqueue a job and JobRunr serializes it into your existing SQL or NoSQL database, the same one your app already uses, no Redis and no broker. If the app restarts, the job is still there. Failed jobs retry automatically with exponential back-off, up to ten attempts by default, which you can tune in [Dealing with exceptions]({{<ref "documentation/background-methods/dealing-with-exceptions.md">}}). Jobs stranded on a server that crashed are detected as zombie jobs and picked back up, because JobRunr elects a master node to handle exactly that. That is persistence, automatic retries, and crash recovery, the core of the durable execution property, with zero extra infrastructure.

For multi-step work, JobRunr v8 shipped a feature named, fittingly, durable executions, through `JobContext.runStepOnce`. You break a job into named steps that each run exactly once, and on a retry the completed steps are skipped. The entire order workflow from the Temporal example above looks like this:

```java
@Job(name = "Process order %0", retries = 5)
public void processOrder(String orderId, JobContext jobContext) {
    jobContext.runStepOnce("charge-payment",   () -> paymentService.charge(orderId));
    jobContext.runStepOnce("reserve-stock",    () -> stockService.reserve(orderId));
    jobContext.runStepOnce("send-confirmation",() -> emailService.sendConfirmation(orderId));
}
```

One class, one method, plain Java. No determinism contract, because this is not replayed code, it is normal code with checkpoints. You can call the clock, generate a UUID, and read config wherever you like. The only discipline you keep is the one you keep anyway, namely making the steps that touch the world safe to repeat.

## We tested it, including where it bites

Claims are cheap, so we built the order job above against a real PostgreSQL database and ran two scenarios. The full project is a single Maven module with JobRunr 8.6.1 and Postgres. Each step writes one row to a `ledger` table, so counting rows tells us, with no room for interpretation, how many times each side effect actually happened.

**Scenario one, a transient failure.** The shipping step throws an exception on its first attempt, the way a flaky downstream API would. JobRunr retries the whole job. The result, straight from the database:

```text
       step        | count
-------------------+-------
 reserve-inventory |     1
 charge-payment    |     1
 schedule-shipment |     1
```

Exactly once for every step. On the retry, the two completed steps were skipped and only the failed step ran again. This is `runStepOnce` doing precisely what it promises, and it is the case the feature is built for. The customer is charged once.

**Scenario two, a hard crash in the worst possible spot.** We killed the JVM with a `halt`, the equivalent of `kill -9`, in the microsecond window right after the payment was charged but before the step was checkpointed to the database. A fresh process then recovered the orphaned job:

```text
       step        | count
-------------------+-------
 reserve-inventory |     2
 charge-payment    |     2
 schedule-shipment |     1
```

The payment ran twice. We are showing you this on purpose, because it is the honest boundary of the lighter model and you deserve to know exactly where it is. `runStepOnce` checkpoints a completed step to the database at the poll interval. If the process dies in the slice of time after a side effect but before its checkpoint is written, the recovering worker has no record that the step finished, so it runs again.

And now the punchline you have already met. A full engine does not save you here either. Temporal runs activities at-least-once for the same fundamental reason, a process can die after the side effect and before the result is journaled. The fix in both worlds is identical. Make the money-moving step idempotent, with a provider idempotency key or a pre-check, and the second attempt becomes a no-op. We wrote the patterns up in [Why is Idempotence Important in Java Job Scheduling?]({{<ref "blog/Idempotence-in-java-job-scheduling.md">}}). The lesson is that the expensive engine and the lightweight scheduler leave you holding the same small, well-understood responsibility.

## What about DBOS, the other "just your Postgres" option

To be fair to the landscape, JobRunr is not the only tool making the database-only argument. DBOS is a durable execution library that embeds in your app and checkpoints workflow state to Postgres, with no separate orchestration server ([DBOS architecture](https://docs.dbos.dev/architecture)). It is genuinely close to the spirit of this post, and worth a look if you want library-based durable execution.

The difference is the programming model. DBOS is still a durable execution framework, so it asks your workflows to be deterministic and your steps to be idempotent, the replay model in a library wrapper. JobRunr comes at it from the job scheduler side. You enqueue normal method calls, you get a dashboard, recurring jobs, batches, and queues, and `runStepOnce` adds exactly-once steps when you want them. If your mental model is "background jobs that happen to be durable," a scheduler fits your hand. If your mental model is "durable functions first," a durable execution library will feel more native. Pick the abstraction that matches how your team already thinks.

## So which one do you actually need

Here is the honest decision table.

| Your situation | The fitting tool |
| :--- | :--- |
| Reliable multi-step background jobs, pipelines, integrations, reports | Database-backed scheduler, for example JobRunr |
| You want durability without operating a new service | Database-backed scheduler |
| Workflows that pause for days, weeks, or months awaiting human or external input | Workflow engine, for example Temporal or Restate |
| Deeply branching orchestration that needs full in-memory replay and per-workflow versioning | Workflow engine |
| One workflow coordinating services across several languages | Workflow engine |
| You need signals, queries, and child workflows as first-class primitives | Workflow engine |

_Table: matching the tool to the job_

The engines are the right answer for the heaviest orchestration problems, and the capabilities listed in their column are real and hard to replicate. The mistake is reaching for that column when your actual problem lives in the first one, which for most Java teams running background work, it does. You pay the full operational and cognitive cost of an orchestration platform to solve a problem a persistent job queue already solves.

## The honest conclusion

Durable execution is a property worth wanting, not a product you are obligated to buy. The property is persistence, journaled steps, automatic retries, and idempotent side effects. A workflow engine delivers it through deterministic replay, which is powerful and which costs you a clustered service, a determinism contract, and workflow versioning. A database-backed scheduler like JobRunr delivers the same property through checkpointed steps, on the database you already run, with the side-effect idempotency that you would owe the engine anyway.

We showed you the case it handles perfectly and the case where it bites, because a recommendation is only worth as much as its honesty. For the long-running, multi-language, deeply branching orchestrations, reach for the engine and do not look back. For the background jobs the rest of us ship every week, durable enough, on infrastructure you already operate, is not a compromise. It is the right amount of machinery.

Want to try the lighter route? [Get started with JobRunr]({{<ref "documentation/_index.md">}}), reach for `runStepOnce` on your next multi-step job, and keep your card-charging steps idempotent. That last habit is the one piece no tool, however expensive, will ever do for you.
