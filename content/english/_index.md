---
meta_title: "JobRunr - Distributed Java Background Job Scheduler"
title: "JobRunr - Distributed Java Background Job Scheduler"

# Banner
banner:
  title: "Never lose a background job again."
  description: "A simple to use Java library for durable background jobs.<br /> Backed by your existing database. Open-source and free for commercial use."
  image:
    bg_image: "/images/bg-pattern.png"
  button:
    get_started:
      enable: true
      label: "Get Started with JobRunr"
      link: "/en/guides/intro/5-minute-quickstart/"
    learn_more:
      enable: true
      label: "Try JobRunr Pro"
      link: "pro"
  examples:
    # NOTE: it's important that all dashboard images have the dimensions/aspect ratio
    - id: "fire-and-forget"
      filename: "Durable.java"
      title: "Execute jobs instantly"
      description: "Fire-and-forget jobs run once, almost immediately. Perfect for offloading non-critical tasks."
      code: |
        public void processOrder(UUID orderId, JobContext context) {
          context.runStepOnce("order-confirmation", () -> orderService.sendConfirmation(orderId));
          context.runStepOnce("warehouse-notification", () -> orderService.notifyWarehouse(orderId));
          context.runStepOnce("shipment-initiation", () -> orderService.initiateShipment(orderId));
        }

        BackgroundJob.enqueue(() -> processOrder(orderId, JobContext.Null));
      language: "java"
      dashboard_image: "/dashboard/succeeded-jobs-oss.webp"
      dashboard_alt: "JobRunr Dashboard showing enqueued jobs being processed"
      dashboard_url: "localhost:8000/dashboard/jobs?state=SUCCEEDED"
    - id: "scheduled"
      filename: "Delayed.java"
      title: "Schedule for later execution"
      description: "Schedule jobs to run at a specific time. JobRunr guarantees execution even after server restarts."
      code: |
        BackgroundJob.schedule(
          LocalDateTime.now().plusHours(24),
          () -> emailService.sendTips(email)
        );
      language: "java"
      dashboard_image: "/dashboard/scheduled-jobs-oss.webp"
      dashboard_alt: "JobRunr Pro Dashboard showing batch job processing with child jobs"
      dashboard_url: "localhost:8000/dashboard/jobs?state=SCHEDULED"
    - id: "recurring"
      filename: "Periodic.java"
      title: "Run jobs on a `cron` schedule"
      description: "Recurring jobs fire on a `cron` schedule. Ideal for daily reports, cleanup tasks, or nightly processing."
      code: |
        BackgroundJob.scheduleRecurrently(
          "0 0 * * *",
          () -> cleanupService.deleteOldRecords()
        );
      language: "java"
      dashboard_image: "/dashboard/recurring-jobs-oss.webp"
      dashboard_alt: "JobRunr Dashboard showing recurring jobs scheduled with `cron` expressions"
      dashboard_url: "localhost:8000/dashboard/recurring-jobs"
    - id: "workflow"
      filename: "Workflow.java"
      title: "Chain jobs into workflows"
      description: "Chain jobs with JobRunr Pro: run a follow-up when a job succeeds and a fallback when it fails."
      code: |
        BackgroundJob.enqueue(() -> orderService.process(orderId))
          .continueWith(
            () -> emailService.sendConfirmation(orderId), // on success
            () -> alertService.notifyOrderFailure(orderId) // on failure
          )
          .continueWith(() -> packagingService.startPackaging(orderId))
          .continueWith(() -> shippingService.initiateShipment(orderId));
      language: "java"
      dashboard_image: "/dashboard/workflow-job-details.webp"
      dashboard_alt: "JobRunr Pro Dashboard showing a chain of jobs in a workflow"
      dashboard_url: "localhost:8000/dashboard/jobs/019e9951-dd37-715c-92e5-be775d9bf020"

#How it Works
how_it_works:
  subtitle: "Go from fragile scripts to resilient workflows"
  title: "Schedule jobs with simple Java methods"
  description: "Add JobRunr using your favorite build tool, like Maven or Gradle, and start scheduling jobs in minutes."
  features:
    - title: "Fire-and-forget jobs"
      description: "Execute jobs only once and almost immediately. Perfect for offloading non-critical tasks."
      icon: "fa-solid fa-rocket" 
      link: "/en/documentation/background-methods/enqueueing-jobs/"
    - title: "Scheduled & delayed jobs"
      description: "Run jobs once at a specified time. JobRunr guarantees execution even after a restart."
      icon: "fa-solid fa-clock" 
      link: "/en/documentation/background-methods/scheduling-jobs/"
    - title: "Recurring CRON jobs"
      description: "Jobs fire each time on a specified CRON trigger. Ideal for daily reports or clean-up tasks."
      icon: "fa-solid fa-repeat" 
      link: "/en/documentation/background-methods/recurring-jobs/"
    - title: "Carbon Aware Jobs"
      description: "Employ Carbon Aware Job Processing to reduce the CO2 footprint of your server."
      icon: "fa-solid fa-leaf"
      link: "/en/documentation/configuration/carbon-aware/"
    - title: "Queues (Pro)"
      description: "Ensure your most critical jobs run first. Stop low-priority tasks from blocking high-priority jobs."
      icon: "fa-solid fa-list-ol"
      link: "/en/documentation/pro/priority-queues/"
    - title: "Batches (Pro)"
      description: "Create a bunch of background jobs atomically and get notified the moment the whole batch finishes."
      icon: "fa-solid fa-layer-group"
      link: "/en/documentation/pro/batches/"
    - title: "Workflows (Pro)"
      description: "Chain jobs into clear, sequential workflows so each step only runs once the previous one succeeds."
      icon: "fa-solid fa-diagram-project"
      link: "/en/documentation/pro/job-chaining/"
    - title: "External jobs (Pro)"
      description: "Track work that finishes outside your JVM, like GPU inference or human approval, and signal it done from anywhere."
      icon: "fa-solid fa-satellite-dish"
      link: "/en/guides/advanced/external-jobs/"



# Pricing
pricing:
  title: "Find the right plan for you"
  subtitle: "Pricing & Plans"
  description: "Start for free with our Open Source version. Or get advanced features like priority queues, <br /> batches, and workflow management with JobRunr Pro."

# Customers Review
customer_reviews:
  title: "Trusted by developers worldwide"
  subtitle: "300,000+ Monthly Downloads"
  description: "Don't trust our word on it. Read what these industry leaders have to say about JobRunr"

# JobRunr for AI
jobrunr_for_ai:
  badge: "JobRunr for AI"
  title: "Run your Java AI workloads in the background"
  description: "Embedding generation, RAG sync, and ML pipelines run reliably in the background, backed by your existing database. Works with Spring AI, LangChain4j, and any LLM."
  tags:
    - "RAG embedding sync"
    - "Fire-and-forget embeddings"
    - "AI agent scheduling"
  button:
    enable: true
    label: "Explore JobRunr for AI"
    link: "/en/ai/"

# JobRunr Spot CTA banner
spot_cta:
  enable: true
  badge: "Private beta live now"
  title: "Save 60 to 80% on your cloud bill."
  description: "Run your background jobs on spot instances in your own AWS and Google Cloud."
  button:
    label: "Join the private beta"
    link: "/en/spot/"
---
