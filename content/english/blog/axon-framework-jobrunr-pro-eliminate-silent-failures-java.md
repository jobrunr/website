---
title: "Axon Framework + JobRunr Pro Eliminates Silent Failures in Distributed Java"
description: "Axon Framework handles event sourcing and long-running workflows. JobRunr Pro enforces time boundaries on every step. Together, they build distributed Java systems that recover, and prove it."
image: /blog/axon_jobrunr_header.webp
date: 2026-04-29T10:00:00+02:00
draft: false
author: "AxonIQ"
slug: "axon-framework-jobrunr-pro-eliminate-silent-failures-java"
tags:
  - blog
  - meta
  - axon-framework
  - enterprise
_build:
  list: never
  render: always
---

If you're building distributed systems in Java, you're already familiar with two problems that never fully go away.

**The first is auditability.** Every state change needs to be traceable, because in a system where dozens of services exchange thousands of messages a day, something will eventually go wrong, and you need to know exactly what happened and in what order. Event sourcing solves this by acting as a system of record for decisions. Instead of overwriting state, you append immutable events to a permanent record. The history of your business is now complete by the sheer construction of your system itself. The current state of any entity is always a projection computed from the events that produced it. Ask what the state of any account was at any point in time, and the answer is already there, because the causal history was never discarded.

**The second problem is coordination.** In a monolithic Banking application, a payment transfer is a single database transaction. In a microservices architecture, that same transfer touches multiple services — accounts, fraud detection, compliance, notifications — none of which can be wrapped in a single atomic operation. The [Saga pattern](https://docs.axoniq.io/axon-framework-reference/4.11/sagas/) handles this: instead of relying on a distributed lock, you coordinate a sequence of local transactions, each producing an event that triggers the next step.

But there's a third problem. One that tends to hide in the seams between those first two.

**What happens when nothing happens?**

## The invisible failure: what happens when a distributed saga never receives its event

A transfer saga initiates. Funds are reserved on the source account. A `ReserveFundsCommand` is processed, a `FundsReservedEvent` is published, and the saga moves to step two: crediting the target account. It sends the `CreditAccountCommand` and waits for a `AccountCreditedEvent` to confirm success.

The event never arrives.

Maybe the target account is frozen. Maybe the downstream service restarted. Maybe there was a transient network partition that resolved itself two seconds later, after the command handler had already decided to do nothing. The saga never receives its expected event. There's no error. There's no failure message. There's just silence.

In generic messaging setups, this creates a dangerous "half-happened" state.

Without a mechanism to enforce time boundaries on each step, the saga sits open indefinitely. Funds remain reserved. The user sees a pending transaction. The audit trail records a process that started but never concluded. And the system, from the outside, looks fine — but the business reality is broken.

This is the problem that deadline management exists to solve. It is how you ensure that correctness is enforced by the platform, not left to ad-hoc application discipline. And it's why the combination of [Axon Framework](https://www.axoniq.io/products/axon-framework) and [JobRunr Pro]({{< ref "documentation/pro" >}}) forms something more cohesive than the sum of its parts: ensuring that even when the network falls silent, your architecture structurally guarantees an outcome.

## How Axon Framework handles event sourcing, CQRS, and long-running Sagas

Axon Framework is the most [widely adopted open-source](https://github.com/AxonFramework/AxonFramework) Java toolkit for building event-driven systems using CQRS and event sourcing, with over 70 million downloads. It's built specifically for the patterns that distributed business applications actually need: [Domain-Driven Design](https://www.axoniq.io/concepts/domain-driven-design) (DDD), [Command Query Responsibility Segregation](https://www.axoniq.io/concepts/cqrs) (CQRS), [event sourcing](https://www.axoniq.io/concepts/event-sourcing), and the Saga pattern for managing long-running processes.

The key abstractions for this discussion:

**Event-sourced entities** (previously aggregates) store state as a sequence of immutable events rather than current values. Every command either produces an event — which is appended to the event store and becomes a permanent record — or it throws an exception. Because there is no silent mutation, no in-place updates, and no overwritten history the history is complete by construction. This creates the exact causal graph that regulators and AI agents need to understand not just what the state is, but why it got there and under what rules.

**Sagas** orchestrate processes that span multiple bounded contexts and entities. Instead of relying on fragile distributed locks or giant database transactions, sagas subscribe to events, issue commands, and maintain the state of a long-running workflow. A money transfer Saga, for example, knows that after `FundsReservedEvent` it needs to wait for `AccountCreditedEvent`, and if that event doesn't arrive, something needs to happen.

It's worth noting that Axon Framework 5 introduces [Dynamic Consistency Boundaries (DCB)](https://www.axoniq.io/blog/dcb-in-af-5), which eliminates the need for Sagas in a meaningful class of problems, specifically those where cross-aggregate rules can be enforced atomically within a single operation. You can evolve from strict transactional consistency to eventual consistency as your load changes, achieving growth without rewrites. If DCB can handle your consistency requirement, use it: no Saga, no deadline, no compensating action needed.

But for workflows that are genuinely temporal, the Saga pattern and deadline management remain the right tool.

**The `DeadlineManager`** is the extension point where time enters the picture, moving your architecture from "best-effort conventions" to structural guarantees. Sagas and aggregates can schedule deadlines, a named trigger that fires after a specified duration. When a deadline fires, the corresponding `@DeadlineHandler` is invoked, and the saga can take deterministic corrective action: releasing reserved funds, sending a notification, or initiating a compensating command.

Axon Framework ships with several `DeadlineManager` implementations. The `SimpleDeadlineManager` works fine in development, but keeps everything in memory — deadlines disappear on restart. For production, you cannot afford "best effort" recovery; you need persistence, clustering, and absolute reliability so that if a node fails, your pending deadlines are not lost. That's where the choice of production-grade implementation matters.

## What JobRunr Pro adds: distributed deadline scheduling with label-based cancellation

[JobRunr](https://www.jobrunr.io/en/) is an enterprise-grade background job processing library for Java. JobRunr Pro extends the open-source version with the capabilities that production deadline management actually requires: distributed processing across nodes, misfire management for jobs that were scheduled during a service outage, a real-time dashboard for operational visibility, and the ability to search and cancel jobs by label.

That last capability is what makes the integration work cleanly.

When Axon's `JobRunrProDeadlineManager` schedules a deadline, it attaches a label to the job. When the expected event arrives and the saga needs to cancel the deadline because the `AccountCreditedEvent` came through before the timeout, it doesn't scan the entire job store. It performs a direct lookup by label and cancels exactly the right jobs. The standard (non-Pro) version of JobRunr has no way to search for deadlines beyond their ID, which means the `cancelAll` and `cancelAllWithinScope` methods on Axon's `DeadlineManager` API simply can't be implemented. JobRunr Pro is what unlocks the full contract.

The result is a deadline lifecycle that works like this:

1. Saga step initiates. `DeadlineManager.schedule()` is called with a duration and a named deadline.
2. JobRunr Pro persists the job to its configured store (SQL or NoSQL) and schedules execution.
3. If the expected event arrives in time, the saga calls `cancelAllWithinScope()` — JobRunr Pro looks up the job by label and cancels it cleanly.
4. If the deadline window expires before the event arrives, JobRunr Pro fires the `@DeadlineHandler`. The saga executes its compensating action.
5. That compensating action produces a new domain event — appended permanently to the event store.

Every step is traceable. Every outcome is recorded.

## Where Axon Server completes the picture: event store, message routing, and full traceability

It's worth being explicit about what sits underneath this entire architecture: [Axon Server](https://www.axoniq.io/products/axon-server).

Axon Server is a purpose-built event store and message router. It handles event storage, command routing, event distribution, and service discovery as a single component — deployed with `docker compose up`, requiring zero custom infrastructure code. When JobRunr fires a deadline and the saga dispatches a compensating command, Axon Server uses context-aware routing to route that command to the correct handler, wherever it's running in the cluster. When that handler produces a new event, Axon Server appends it to the immutable event sequence that began with the original transaction.

This is what makes the audit trail complete rather than a fragmented afterthought.

- JobRunr records that a deadline has fired at a specific time.
- Axon Framework records the compensating action as a domain event.
- Axon Server writes both into the same permanent, ordered record with sequence intact and context preserved.

A regulator or a support engineer tracing a failed transaction doesn't get log files and guesswork. They get the full causal chain: *funds reserved, deadline scheduled, credit command ignored, deadline fired, funds released*. Every step, rule and temporal boundary is self-documented in the architecture that produced it.

## A concrete example: money transfer with deadline recovery

The [Axon + JobRunr Pro demo project](https://github.com/iNicholasBE/axon-framework-jobrunr) makes this concrete. It's a Spring Boot application with a `MoneyTransferSaga` that coordinates a bank transfer between two accounts in two steps.

Each step schedules a deadline via JobRunr Pro. If the step completes, if the `AccountCreditedEvent` arrives within the window, the deadline is cancelled. If it doesn't (for example, because the target account is frozen and the `CreditAccountCommand` is silently ignored), the deadline fires after ten seconds and triggers a compensating action that releases the reserved funds.

The final state: both accounts unchanged, funds returned to the source, and the entire sequence of initiation, reservation, timeout, compensation are all recorded as a permanent, queryable event history.

To run it locally:

```bash
git clone https://github.com/iNicholasBE/axon-framework-jobrunr
```

Then follow the setup instructions in the README and open the JobRunr Pro dashboard at `http://localhost:8000/dashboard` to watch deadlines, schedule, track, and resolve in real time.

## How to configure the JobRunr Pro DeadlineManager in Axon Framework

The JobRunr Pro Extension is a first-class, officially supported Axon Framework extension. Configuration via Spring Boot is straightforward.

Add the dependency:

{{< codetabs category="dependency" >}}
{{< codetab label="Maven" >}}
```xml
<dependency>
  <groupId>org.axonframework.extensions.jobrunrpro</groupId>
  <artifactId>axon-jobrunrpro-spring-boot-starter</artifactId>
  <version>${axon-jobrunrpro.version}</version>
</dependency>
```
{{< /codetab >}}
{{< codetab label="Gradle" >}}
```groovy
implementation 'org.axonframework.extensions.jobrunrpro:axon-jobrunrpro-spring-boot-starter:${axon-jobrunrpro.version}'
```
{{< /codetab >}}
{{< /codetabs >}}

> [!NOTE]
> This is for Axon Framework 4, there are large expected differences when this is ported to Axon Framework 5.

Inject the `DeadlineManager` in your Saga:

```java
@StartSaga
public void handle(TransferInitiatedEvent event,
                   DeadlineManager deadlineManager) {
    this.deadlineId = deadlineManager.schedule(
        Duration.ofSeconds(30), "transfer-deadline"
    );
}

@SagaEventHandler(associationProperty = "transferId")
public void handle(AccountCreditedEvent event,
                   DeadlineManager deadlineManager) {
    deadlineManager.cancelAllWithinScope("transfer-deadline");
    // complete the saga
}

@DeadlineHandler(deadlineName = "transfer-deadline")
public void onDeadline(CommandGateway gateway) {
    gateway.send(new ReleaseReservedFundsCommand(this.transferId));
}
```

For full configuration options, see the [JobRunr Pro Extension reference documentation](https://docs.axoniq.io/jobrunrpro-extension-reference/4.11/) and the [Axon Framework deadline managers reference](https://docs.axoniq.io/axon-framework-reference/4.11/deadlines/deadline-managers/).

## Why this matters beyond the happy path

In a demo, the happy path is easy. Services respond. Events arrive. Deadlines cancel cleanly. The interesting architecture decisions are made for the failure cases and in regulated industries, those failure cases aren't theoretical, they're the scenarios auditors ask about first.

The combination of Axon Framework's event sourcing, JobRunr Pro's deadline management, and Axon Server's persistent event store gives you an architecture where every outcome including the ones that happened because something timed out is recorded, traceable, and explainable. Not as a compliance feature bolted on after the fact, but as a structural property of how the system was built.

That's the design goal worth chasing. Not systems that look correct in monitoring dashboards, but systems that can prove they behaved correctly, even when things went wrong.

## Further reading

**Axoniq:**

- [Axon Framework deadline managers reference](https://docs.axoniq.io/axon-framework-reference/4.13/deadlines/deadline-managers/) — full documentation on all four `DeadlineManager` implementations
- [Event schedulers in Axon Framework](https://docs.axoniq.io/axon-framework-reference/4.13/deadlines/event-schedulers/) — when to use event scheduling vs. deadline management

**JobRunr:**

- [Axon Framework + JobRunr Pro: Saga deadlines done right]({{< ref "axon-framework-jobrunr-pro.md" >}}) — the original joint post with a full walkthrough and YouTube demo
- [JobRunr Pro documentation]({{< ref "documentation/pro" >}}) — clustering, dashboard configuration, misfire management, and more

---

*Ready to add deadline management to your Axon application? Start with the [JobRunr Pro Extension guide](https://docs.axoniq.io/jobrunrpro-extension-reference/4.13/) or explore [Axon Server](https://www.axoniq.io/products/axon-server) as your event store and message router.*

> [!NOTE]
> Sagas as a theoretical concept will remain with Axon Framework, however sagas will not remain as a technical concept as it has been from AF1 to AF4. Workflows will replace sagas for the complex scenarios, [Dynamic Consistency Boundary](https://www.axoniq.io/blog/dcb-in-af-5) replaces sagas for the simple paths.
