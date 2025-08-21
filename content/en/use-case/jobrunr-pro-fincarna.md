---
title: "Why JobRunr Pro Makes Sense When Your Jobs Aren't Just ETL Theater"
author: "Lloyd Chandran"
feature_image: /use-case/jobrunr-pro-fincarna.webp
summary: "At Fincarna, a modern monetization platform for banks, we learned that not all background jobs are the same. This article explains why we chose JobRunr Pro to handle our diverse job processing needs, from ETL operations to real-time notifications, and how it helps us focus on building better financial products."
date: 2025-08-21T10:55:00+02:00
tags:
  - use-case
---
*This article is a guest-contribution by Lloyd Chandran, Founder & Lead Architect at Fincarna*

Let me start with a confession: I've built more job processing systems than I care to admit, from the dark days of EJB timers to JMS queues, Spring Batch configurations, and even some bespoke batch frameworks that seemed like good ideas at the time.

At Fincarna, where we're building a modern monetization platform for small and medium banks, I've learned that not every background job is created equal, and many seem to think they are.

## The ETL Trap: When Your Hammer Thinks Everything's a Nail
Here's the thing about Extract, Transform, Load frameworks (ETL), they're fantastic when you're actually doing ETL operations.

Need to pull customer data from three different legacy banking systems, massage it into something resembling modern JSON, and dump it into your data warehouse? Perfect. ETL frameworks absolutely crush it in these scenarios.
<br/>
But what happens when your "job" is actually sending a push notification to a customer about their overdraft fee?
<br/>
Or calculating interchange fees in real-time? Or handling a webhook that needs to apply a new fee structure immediately?

Suddenly, your elegant Reader-Writer-Processor pipeline feels like using a forklift to hang a picture frame.

Sure, it'll work, but you're going to make a mess and probably over-engineer the hell out of something that should be simple.

And don't even get me started on trying to make these behemoth frameworks "near real-time”, you'll end up with the infrastructure budget of a Fortune 500 company and the maintenance headaches to match.

![ETL system vs Jobrunr Pro](/use-case/etl-vs-pro.webp)

## When Your Framework Becomes Your Boss
I've seen too many codebases where the job framework's opinions became architectural constraints.

You know the type - where every simple task gets shoehorned into a three-step dance of reading, processing, and writing, even when all you want to do is call an API and update a flag.

At Fincarna, we process everything from account reconciliations (hello, ETL!) to instant fee notifications (definitely not ETL).
The last thing I want is my job framework forcing me to think in terms of "chunks" and "item processors" when I'm just trying to send a fee notification or update an account balance.
Sometimes the best design is the one that gets out of your way.

> We discuss the importance of choosing the right tool for the job in our article on [modern alternatives to Quartz](/blog/2024-10-31-task-schedulers-java-modern-alternatives-to-quartz/).

## Scaling: The Art of Not Breaking Things
In fintech, scaling isn't just about handling more load, it's about handling more load without accidentally charging the same fee twice or missing a revenue opportunity.

The stakes are a bit higher than your average e-commerce site.

What I love about [JobRunr Pro](/en/pro) is that <b>scaling feels natural</b>. Need more throughput? Add more workers.
Need to handle spikes? The system adapts. No need to become a distributed systems PhD just to process more background jobs without losing money.

> Want to learn more about K8S autoscaling, check out the guide [Autoscale your JobRunr application deployed on Kubernetes](/guides/advanced/k8s-autoscaling/) or our blogpost [Optimizing Cost and Performance on Kubernetes: Scale Java Workloads with JobRunr Metrics](/blog/Scale-Java-Workloads-On-Kubernetes/)

The beauty is in the simplicity: your jobs scale horizontally without you having to think about partitioning strategies or coordination protocols.
Because honestly, I'd rather spend my time building features that make banks money than debugging why my job queue decided to process everything twice.

## Database Sympathy: Treating Your DB Like It Has Feelings
Here's where many job frameworks reveal their database ignorance. They'll happily slam your database instance with hundreds of concurrent connections, then act surprised when everything grinds to a halt.

<b>JobRunr pro gets it.</b> It understands that your database is not an infinite resource and treats it with the respect it deserves.
No connection pool exhaustion. No lock contention nightmares. No "why is my database CPU at 100% when I'm only processing 50 jobs?" moments.
This is especially crucial in banking applications where your database is often shared with real-time transaction processing.

The last thing you want is your background job to process monthly statements interfering with calculating a real-time fee.

## The Features That Actually Mattered for Us
### [JobFilters](/documentation/pro/job-filters/)
This is where [JobRunr Pro](/en/pro) shows its distributed systems maturity.
When you're running jobs across multiple nodes in a cluster, thread-local variables become... complicated.
Add multi-tenancy to the mix (because of course we're multi-tenant), and JobFilters become absolutely essential.

They handle this elegantly, letting you <b>maintain context without losing your sanity</b>.
It's the kind of feature you don't appreciate until you need it, and then you can't live without it.

```kotlin
class UserContextClientFilter : JobClientFilter {
    private val logger = LoggerFactory.getLogger(javaClass)

    override fun onCreating(job: AbstractJob?) {
        logger.debug("Capturing user context for job creation")
        val jobInstance = job as? Job
        jobInstance?.metadata?.apply {
            put("userId", UserContext.getCurrentUserId())
            put("organizationId", UserContext.getOrganizationId())
        }
    }
}

class UserContextServerFilter : JobServerFilter {
    private val logger = LoggerFactory.getLogger(javaClass)

    override fun onProcessing(job: Job?) {
        logger.debug("Restoring user context for job processing")
        val jobInstance = job as? Job
        jobInstance?.metadata?.let { metadata ->
            val userId = metadata["userId"]?.toString()
            val organizationId = metadata["organizationId"]?.toString()

            userId?.let { UserContext.setUserId(it) }
            organizationId?.let { UserContext.setOrganizationId(it) }
        }
    }
}
```
### [Job Dependencies & Workflows](/documentation/background-methods/background-jobs-dependencies/)
This is where <b>JobRunr Pro</b> really <b>shines for complex financial operations</b>.
Being able to define job dependencies means we can orchestrate multi-step processes without the usual coordination headaches.
The parent job functionality gave us a solid foundation, but we sprinkled some extra magic on top to make chunking easier.
<div id="workflow">

![Workflow diagram](/use-case/jobrunr-pro-fincarna-workflow.webp)
</div>
When you're processing thousands of fee calculations or account updates, being able to break work into manageable pieces while maintaining parent-child relationships is a game changer.

```kotlin
override fun startProcessingWorkflow(batchId: String): JobProId {
    logger.info("Starting data processing workflow for batch: {}", batchId)
    // Step 1: Staging table with filtered data
    val preparationJobId = jobScheduler.create(
        JobBuilder.aJob()
            .withName("Data Preparation")
            .withLabels("batch-$batchId")
            .withAmountOfRetries(2)
            .withDetails { prepareStagingTable(batchId) }
    )

    // Step 2: Create partitions and process chunks
    val partitionJobId = jobScheduler.create(
        JobBuilder.aBatchJob()
            .withName("Data Partition Processing")
            .withLabels("batch-$batchId")
            .withAmountOfRetries(1)
            .runAfter(preparationJobId)
            .withDetails { createAndProcessPartitions(batchId) }
    )

    // Step 3: Finalize batch
    val finalizationJobId = jobScheduler.create(
        JobBuilder.aJob()
            .withName("Batch Finalization")
            .withLabels("batch-$batchId")
            .withAmountOfRetries(3)
            .runAfter(partitionJobId)
            .withDetails { finalizeBatch(batchId) }
    )

    // Register failure handlers
    preparationJobId.onFailure { handleProcessingFailure(batchId, "PREPARATION_FAILED") }
    partitionJobId.onFailure { handleProcessingFailure(batchId, "PARTITION_FAILED") }
    finalizationJobId.onFailure { handleProcessingFailure(batchId, "FINALIZATION_FAILED") }

    logger.info("Created processing workflow with ID: {} for batch: {}", finalizationJobId, batchId)
    return finalizationJobId
}
```

Take invoice generation, for example. We need to calculate all fees for the period, apply any promotional discounts, generate invoice files, and then send notifications.

With [JobRunr Pro](/en/pro)'s [workflow capabilities](/documentation/pro/job-chaining/), we can chain these steps together elegantly—if fee calculation fails, we don't waste time generating invoice files.
If invoice generation succeeds but notification fails, we can retry just the notification step.
<b>It's like having a state machine, but without the complexity.</b>

### [Spring Boot Integration](/documentation/configuration/spring/)
At Fincarna, we're pretty much a Spring shop, we love the ecosystem, the conventions, and how everything just works together.

[JobRunr Pro](/en/pro)'s seamless Spring Boot integration means we didn't have to fight our existing architecture or learn a completely new way of doing things.
Configuration is clean, dependency injection works as expected, and our job classes fit naturally into our existing Spring context.

### Kubernetes Vision
While we're currently using our own container orchestration approach at Fincarna, knowing that JobRunr Pro is built with [Kubernetes](/guides/advanced/k8s-autoscaling/) in mind gives me confidence for future scaling decisions.
When we do evaluate different orchestration strategies, we won't need to rethink our entire job processing architecture.

## The Bottom Line
Look, sure, I could spend months building yet another custom job processing system. I've been down that road before.
But at some point, you realize that job processing is not your competitive advantage - building better financial products is.

<b>JobRunr Pro lets me focus on the problems that actually matter</b>: How do we provide the tools and arsenal for small banks to think big and aim high?
How do we make complex monetization operations simple? How do we build systems that are both innovative and compliant?

These are the problems worth solving. Everything else should just work.

> ## Ready to take control of your background jobs?
>Stop wrestling with frameworks that weren't built for your use case. Discover how JobRunr Pro can simplify your architecture, scale with your needs, and let you focus on what you do best.
>
>[Explore JobRunr Pro Features](/en/pro) or [Request a Free Trial](/try-jobrunr-pro/)

***
*Lloyd Chandran is the founder and lead architect of <a href="https://fincarna.com/">Fincarna</a>, a cutting-edge, cloud-native monetization platform helping small and medium banks compete in the digital age. When he's not building Fincarna's next feature, he's probably debugging why his lawn mower isn't working (again).*
<style>
  #workflow img{
    max-height: 500px;
  }
</style>

