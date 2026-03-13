---
title: "External Jobs: Tracking Work Outside Your JVM"
description: Learn how to use JobRunr Pro's External Jobs to track GPU inference, human approvals, and other work that completes outside your application.
weight: 10
tags:
    - JobRunr Pro
    - External Jobs
    - Advanced
hideFrameworkSelector: true
---

In the real world, not every job completes inside your JVM. Some jobs depend on external systems, a GPU finishing an AI inference, a human approving content, a payment provider confirming a transaction. Traditional background job schedulers force you to keep a worker thread alive while waiting for these external results, wasting resources and limiting scalability.

JobRunr Pro's **External Jobs** solve this by decoupling the _trigger_ (starting the work) from the _completion signal_ (marking it done). The job is created and triggered by JobRunr, but its completion is signaled from outside: by a poller, a webhook handler, or even a human clicking a button.

## Prerequisites

- JobRunr Pro 8.5.0 or later
- You already know how to configure JobRunr
- Basic understanding of the JobRunr job lifecycle (ENQUEUED → PROCESSING → SUCCEEDED)

## How External Jobs Work

An External Job follows a slightly different lifecycle than a regular job:

1. **ENQUEUED**: the job is created and placed on a queue
2. **PROCESSING**: a worker picks up the job and executes the _trigger method_. This is where you start the external work (e.g., call a GPU API, send an email for approval)
3. **PROCESSED**: the trigger method completes. The job is now _parked_, consuming no worker threads, no resources. It simply waits
4. **SUCCEEDED** or **FAILED**: your code signals the job's final outcome from outside

The key insight: between PROCESSED and the final state, the job is just a row in the database. It can wait seconds, minutes, hours, or even days, without blocking anything.

## The External Jobs API

Creating an External Job uses the `JobBuilder` fluent API:

```java
import static org.jobrunr.scheduling.JobBuilder.anExternalJob;

BackgroundJob.create(anExternalJob()
        .withId(JobId.fromIdentifier("my-unique-key"))
        .withName("Descriptive Job Name")
        .withLabels("category", "subcategory")
        .withQueue("high-prio")
        .withDetails(() -> myService.triggerExternalWork("my-unique-key")));
```

The `withDetails` lambda defines the **trigger method**. This runs on a JobRunr worker thread and should _start_ the external work, not wait for it to finish.

When the external work completes, signal the job from anywhere in your application:

```java
// On success
BackgroundJob.signalExternalJobSucceeded(
        JobId.fromIdentifier("my-unique-key"),
        "Work completed successfully");

// On failure
BackgroundJob.signalExternalJobFailed(
        JobId.fromIdentifier("my-unique-key"),
        "Work failed: reason");
```

That's the entire API. Let's see it in action with two real-world scenarios.

## Scenario 1: GPU Video Generation with Polling

Imagine you're building an application that generates AI videos using a GPU cloud provider. The GPU work takes 10 to 30 seconds, far too long to keep a worker thread waiting. Here's how External Jobs handle this cleanly.

### Step 1: Create the External Job

When a user submits a video prompt, create an External Job whose trigger calls the GPU API:

```java
@Service
public class GpuJobService {

    private final ReplicateService replicate;
    private final Map<String, GpuJob> activeJobs = new ConcurrentHashMap<>();

    public void launch(String prompt) {
        String jobKey = "gpu-" + UUID.randomUUID();

        BackgroundJob.create(anExternalJob()
                .withId(JobId.fromIdentifier(jobKey))
                .withName("GPU Video: " + prompt)
                .withLabels("gpu", "replicate")
                .withQueue("high-prio")
                .withDetails(() -> triggerPrediction(jobKey, prompt)));
    }
}
```

### Step 2: Implement the Trigger Method

The trigger starts the GPU prediction and returns immediately. The job transitions from PROCESSING to PROCESSED:

```java
/** Called by JobRunr when the External Job is picked up by a worker. */
public void triggerPrediction(String jobKey, String prompt) {
    var prediction = replicate.createPrediction(prompt);
    activeJobs.put(jobKey, new GpuJob(jobKey, prompt, prediction.id()));
    ensurePollerRunning();
}
```

At this point, the worker thread is freed. The job sits in PROCESSED state while the GPU crunches away.

![](/guides/External-jobs-gpu-waiting.png "The JobRunr dashboard showing an External Job in PROCESSED state, waiting for the GPU to finish.")

### Step 3: Poll for Completion and Signal

A separate poller checks the GPU provider's API and signals the External Job when the work finishes:

```java
public void pollPredictions() {
    for (var entry : activeJobs.entrySet()) {
        String jobKey = entry.getKey();
        GpuJob job = entry.getValue();

        var prediction = replicate.getPrediction(job.predictionId());

        if (prediction.succeeded()) {
            BackgroundJob.signalExternalJobSucceeded(
                    JobId.fromIdentifier(jobKey),
                    "Video generated in %.1fs".formatted(prediction.predictTimeSeconds()));
            activeJobs.remove(jobKey);

        } else if (prediction.isTerminal()) {
            BackgroundJob.signalExternalJobFailed(
                    JobId.fromIdentifier(jobKey),
                    "Prediction failed: " + prediction.error());
            activeJobs.remove(jobKey);
        }
    }
}
```

![](/guides/External-jobs-gpu-succesfull.png "The JobRunr dashboard showing an External Job that succeeded after GPU video generation completed.")

> In production, you would typically use **webhooks** instead of polling. The GPU provider calls your endpoint when done, and your webhook handler signals the External Job. This is more efficient and eliminates the polling delay.

## Scenario 2: Human-in-the-Loop Content Approval

Some workflows require a human decision before a job can complete. Consider a content moderation pipeline: AI generates marketing copy, but a human must approve it before publication. This could take minutes, hours, or even days, and no job scheduler should block a thread for that.

### Step 1: Create the External Job

When a user requests AI-generated content, create an External Job. The trigger method generates the content, and then the job parks itself waiting for human review:

```java
@Service
public class AiApprovalService {

    private final ApprovalRepository repository;

    public void createReviewRequest(String productName) {
        String jobKey = "review-" + UUID.randomUUID();

        var request = new ApprovalRequest();
        request.setJobKey(jobKey);
        request.setProductName(productName);
        request.setStatus("ANALYZING");
        request = repository.save(request);

        Long requestId = request.getId();

        BackgroundJob.create(anExternalJob()
                .withId(JobId.fromIdentifier(jobKey))
                .withName("AI Content Review: " + productName)
                .withLabels("ai-review", productName)
                .withQueue("high-prio")
                .withAmountOfRetries(0)
                .withDetails(() -> analyzeContent(requestId)));
    }
}
```

### Step 2: The Trigger Generates Content

The trigger method runs the AI analysis. When it completes, the job automatically enters PROCESSED state, parked and waiting:

```java
/** Called by JobRunr. AI generates marketing copy and a confidence score. */
@Transactional
public void analyzeContent(Long requestId) {
    var request = repository.findById(requestId).orElseThrow();

    String content = generateMarketingCopy(request.getProductName());
    double confidence = calculateConfidenceScore(content);

    request.setContent(content);
    request.setAiConfidence(confidence);
    request.setAiRecommendation(confidence > 0.85 ? "PUBLISH" : "NEEDS_REVIEW");
    request.setStatus("PENDING_REVIEW");
    repository.save(request);
}
```

### Step 3: Human Signals the Job

When a human reviewer clicks "Approve" or "Decline" in your UI, signal the External Job:

```java
@Transactional
public void approve(Long requestId) {
    var request = repository.findById(requestId).orElseThrow();

    BackgroundJob.signalExternalJobSucceeded(
            JobId.fromIdentifier(request.getJobKey()),
            "Content approved by human reviewer");

    request.setStatus("APPROVED");
    repository.save(request);
}

@Transactional
public void decline(Long requestId) {
    var request = repository.findById(requestId).orElseThrow();

    BackgroundJob.signalExternalJobFailed(
            JobId.fromIdentifier(request.getJobKey()),
            "Content declined by human reviewer");

    request.setStatus("DECLINED");
    repository.save(request);
}
```

![](/guides/External-jobs-declined-by-human.png "The JobRunr dashboard showing an External Job that was declined by a human reviewer.")

The job moved from PROCESSED to SUCCEEDED or FAILED, and during the entire waiting period, zero worker threads were consumed.

## When to Use External Jobs

External Jobs are the right choice when:

- **The work happens outside your JVM**: GPU inference, third-party API callbacks, payment confirmations
- **A human decision is required**: content moderation, approval workflows, manual review queues
- **The wait time is unpredictable**: it could be seconds or days, and you don't want to waste resources
- **You need audit trail and visibility**: the JobRunr dashboard tracks the full lifecycle from creation to completion

For work that executes entirely within your JVM, regular background jobs remain the better choice.

## Polling vs. Webhooks

In the GPU example above, we used polling to detect completion. This works well for demos and simple setups, but in production you'll likely want **webhooks**:

| Approach | Pros | Cons |
|----------|------|------|
| **Polling** | Simple to implement, no public endpoint needed | Adds latency (up to poll interval), wastes API calls |
| **Webhooks** | Instant notification, no wasted calls | Requires a publicly accessible endpoint |

With webhooks, the external system calls your endpoint when done, and your webhook handler simply calls `signalExternalJobSucceeded` or `signalExternalJobFailed`. The External Job doesn't care _how_ it gets signaled, only that it eventually does.

## Conclusion

External Jobs bring any external process under JobRunr's umbrella. Whether it's GPU inference, human approvals, third-party API callbacks, or payment confirmations, you get the same dashboard, the same monitoring, and the same retry/failure handling, but for work that happens outside your JVM. No worker threads are wasted, no timeouts are ticking, and the full job lifecycle is tracked and visible.

## Resources

- A complete working example of External Jobs with GPU video generation and human-in-the-loop approval is available at https://github.com/iNicholasBE/external-jobs-demo.
