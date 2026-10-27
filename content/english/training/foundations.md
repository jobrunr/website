---
training: true
weight: 1
title: "JobRunr Foundations"
meta_title: "JobRunr Foundations: free live training"
description: "Free one-hour live training. From your first background job in Java to a production setup you can defend: how JobRunr works, enqueue, schedule, recurring jobs, retries, the dashboard and moving over from the scheduler you run today."
tagline: "From your first background job to a production setup, in one hour."
level: "Foundations"
level_color: "green"
duration: "60 minutes, live"
audience: "Java developers evaluating JobRunr or running JobRunr OSS in a first application. Team leads who need to decide whether JobRunr becomes the standard for background work."
assumes: "Java and your build tool of choice. No JobRunr knowledge needed."

sessions:
  - start: 2026-11-19T12:30:00+01:00
    end: 2026-11-19T13:30:00+01:00
    tz: "CET"

trainers:
  - name: "Ronald Dehuysser"
    role: "Creator of JobRunr, codes the whole hour"
  - name: "Nicholas D'hondt"
    role: "Host, asks the questions you are thinking"

agenda:
  - time: "0:00"
    title: "How JobRunr actually works"
    text: "The three parts you deploy: the `BackgroundJobServer`, the `StorageProvider` and the dashboard. What happens in the database between `enqueue()` and a worker picking the job up. Running more than one server against the same database, how JobRunr picks the worker count for each server, and when you should change it."
  - time: "0:10"
    title: "Your first jobs"
    text: "`BackgroundJob.enqueue()`, `schedule()` and `scheduleRecurrently()` with a cron expression. Job lambdas versus `JobRequest`, and when to pick which. Passing arguments and what serialization does to them."
  - time: "0:25"
    title: "When jobs fail"
    text: "Retries by default, the `@Job` annotation for names and retry counts, exceptions you want retried and exceptions you do not. Reading the dashboard: every job state and what it tells you."
  - time: "0:40"
    title: "Coming from another scheduler"
    text: "How Quartz, Spring `@Scheduled` and cron scripts map onto JobRunr, and how to run both side by side while you move jobs over. Plus what you get that you did not have before: every job visible in a dashboard, retries without writing them, and recurring jobs that run once across all your servers without ShedLock or a lock table of your own."
  - time: "0:50"
    title: "Your questions"
    text: "Ten minutes. Anything you asked on the registration form gets answered here if it did not come up earlier."

prerequisites:
  - "The starter project for your framework: Spring Boot, Quarkus or Micronaut. The link is in your confirmation email. It already runs JobRunr with the dashboard on port 8000, so you skip the setup and start where the session starts."
  - "Your IDE open, so you can try things during the session."
  - "One real background task from your own codebase in mind. If it runs on another scheduler today, even better. We will use it in the Q&A."

takeaways:
  - "The production checklist as a document you can hand to your team"
  - "The starter project and the code from the session, in a public repository"
  - "The recording, the next day"
  - "A free Architecture Review of one of your own job designs, if you want it"

form:
  title: "Register for JobRunr Foundations"
  intro: "Free. The link arrives by email the day before the session."
  button: "Register"
  note: "We use your answers to prepare the session and to send you the link and the recording. Nothing else. See our [privacy policy](/en/privacy/)."
---
