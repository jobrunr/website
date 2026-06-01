---
title: "JobRunr | Enjoying Your Coffee?"
description: "You got a JobRunr coffee mug at Voxxed Days Amsterdam. Here's what we do, plus a free Pro trial when you're back at your desk."
layout: "coffee"
sitemap:
  priority: 0.1
  changeFreq: never

hero:
  badge: "Voxxed Days Amsterdam 2026"
  title_start: "Enjoying your"
  title_highlight: "JobRunr coffee?"
  description: "That reusable mug is from us. We build the Java background job scheduler you'll wish you'd found sooner."

button:
  primary:
    enable: true
    label: "Show me the code"
    link: "#code-example"
  secondary:
    enable: true
    label: "I don't want to read right now"
    link: "#email-capture"

features_section:
  title: "What JobRunr does in 30 seconds"
  description: "Background job processing for Java. No PhD required."
  items:
    - title: "Just write Java code"
      description: "Schedule any Java method as a background job. No XML, no annotations on your domain, just a lambda."
    - title: "Your database is enough"
      description: "No Redis. No Kafka. No RabbitMQ. JobRunr uses the SQL database you already have. Postgres, MySQL, Oracle, you name it."
    - title: "Built for scale"
      description: "Handles millions of jobs without breaking a sweat. A real-time dashboard shows exactly what's happening and helps you find failed jobs in seconds."
    - title: "Carbon and electricity price aware"
      description: "Optionally schedule heavy batch jobs to run when the grid is green and electricity is cheap. Save money and reduce your carbon footprint at the same time."

code_section:
  title: "See it in action"
  description: "Schedule background jobs in plain Java. Fire and forget, delayed, or recurring. JobRunr handles retries, persistence, and distribution automatically."
  filename: "MyService.java"
  highlights:
    - "<strong>Fire and forget</strong> any Java method"
    - "<strong>Schedule</strong> jobs for later execution"
    - "<strong>Recurring jobs</strong> with cron expressions"
    - "Works with <strong>Spring Boot, Quarkus, and Micronaut</strong>"
  code: |
    <span style="color:#546e7a">// Enqueue a fire-and-forget background job</span>
    <span style="color:#c792ea">BackgroundJob</span>.<span style="color:#82aaff">enqueue</span>(() -> myService.<span style="color:#82aaff">doWork</span>());

    <span style="color:#546e7a">// Schedule it for later</span>
    <span style="color:#c792ea">BackgroundJob</span>.<span style="color:#82aaff">schedule</span>(<span style="color:#c792ea">Instant</span>.now().plus(
        <span style="color:#c792ea">Duration</span>.<span style="color:#82aaff">ofHours</span>(<span style="color:#f78c6c">5</span>)),
        () -> myService.<span style="color:#82aaff">doWork</span>());

    <span style="color:#546e7a">// Or make it recurring</span>
    <span style="color:#c792ea">BackgroundJob</span>.<span style="color:#82aaff">scheduleRecurrently</span>(<span style="color:#a5d6ad">"my-recurring-job"</span>,
        <span style="color:#c792ea">Cron</span>.<span style="color:#82aaff">daily</span>(),
        () -> myService.<span style="color:#82aaff">generateReport</span>());
  caption: "That's it. No boilerplate. It just works with Spring Boot, Quarkus, or Micronaut."

email_section:
  title: "Back to the talks? We get it."
  description: "Enjoy Voxxed Days. We'll send you everything you need to try JobRunr when you're back at your desk."
  button_label: "Send me the good stuff"
  form_note: "No spam, ever. Just the dev package below."
  success_title: "Check your inbox when you're ready!"
  success_message: "We've sent your JobRunr developer package. Now go enjoy the next talk."
  package_items:
    - "Ready-to-run code examples (Spring Boot + Quarkus)"
    - "Free JobRunr Pro trial license"
    - "Quick-start guide: from zero to running in 5 minutes"
    - "Direct line to our team if you have questions"

social_proof:
  title: "Trusted by engineering teams at"
  logos:
    - src: "images/brand-logo/adobe-logo.png"
      alt: "Adobe"
    - src: "images/brand-logo/JP-Morgan-Chase-logo.webp"
      alt: "JP Morgan Chase"
    - src: "images/brand-logo/Thoughtworks-logo.webp"
      alt: "Thoughtworks"
    - src: "images/brand-logo/Capgemini-logo.webp"
      alt: "Capgemini"
    - src: "images/brand-logo/intuit-logo.svg"
      alt: "Intuit"

accordion:
  title: "Got questions?"
  subtitle: "FAQ"
  description: "Quick answers for developers at Voxxed Days."
  list:
    - title: "What exactly is JobRunr?"
      description: "JobRunr is a background job processing library for Java. It lets you schedule any Java method to run in the background, with automatic retries, persistence, and a built-in dashboard. Think of it as a modern replacement for homegrown schedulers, Quartz, or rolling your own with @Scheduled."
    - title: "What do I need to run it?"
      description: "Just your existing SQL database (PostgreSQL, MySQL, MariaDB, Oracle, SQL Server, or MongoDB). No Redis, no message brokers, no extra infrastructure. Add the Maven or Gradle dependency, set two config lines, and you're running."
    - title: "What's the difference between JobRunr and JobRunr Pro?"
      description: "JobRunr (open source) gives you fire-and-forget jobs, delayed jobs, recurring jobs, and a dashboard. JobRunr Pro adds priority queues, batches, job chaining/workflows, server tags, real-time enqueueing, and a multi-cluster dashboard. The Pro trial we're offering gives you access to all of that."
    - title: "How does JobRunr compare to Quartz or Spring @Scheduled?"
      description: "Unlike Quartz, JobRunr doesn't require complex XML configuration or a special database schema you manage yourself. Unlike @Scheduled, jobs survive application restarts, automatically distribute across multiple instances, and have a visual dashboard. You schedule plain Java methods, not framework-specific constructs."
---
