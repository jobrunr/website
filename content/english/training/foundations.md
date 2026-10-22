---
training: true
weight: 1
title: "JobRunr Foundations"
meta_title: "JobRunr Foundations: free live training"
description: "Free one-hour live training. From your first background job in Java to a production setup you can defend: enqueue, schedule, recurring jobs, retries, the dashboard and the production checklist."
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
    text: "The three parts you deploy: the `BackgroundJobServer`, the `StorageProvider` and the dashboard. What happens in the database between `enqueue()` and a worker picking the job up, and why that design matters for the rest of the hour."
  - time: "0:10"
    title: "Your first jobs"
    text: "`BackgroundJob.enqueue()`, `schedule()` and `scheduleRecurrently()` with a cron expression. Job lambdas versus `JobRequest`, and when to pick which. Passing arguments and what serialization does to them."
  - time: "0:25"
    title: "When jobs fail"
    text: "Retries by default, the `@Job` annotation for names and retry counts, exceptions you want retried and exceptions you do not. Reading the dashboard: every job state and what it tells you."
  - time: "0:40"
    title: "The production checklist"
    text: "Running more than one server, choosing the worker count, graceful shutdown, database tables and migrations, and the Spring Boot, Quarkus and Micronaut starters. The checklist you leave with."
  - time: "0:50"
    title: "Your questions"
    text: "Ten minutes. Anything you asked on the registration form gets answered here if it did not come up earlier."

prerequisites:
  - "JobRunr running locally with the dashboard open on port 8000. The [Getting Started guide](/en/documentation/getting-started/) takes about ten minutes."
  - "Your IDE open, so you can try things during the session."
  - "One real background task from your own codebase in mind. We will use it in the Q&A."

takeaways:
  - "The production checklist as a document you can hand to your team"
  - "The code from the session, in a public repository"
  - "The recording, the next day"
  - "A free Architecture Review of one of your own job designs, if you want it"

form:
  title: "Register for JobRunr Foundations"
  intro: "Free. The link arrives by email the day before the session."
  button: "Register"
  note: "We use your answers to prepare the session and to send you the link and the recording. Nothing else. See our [privacy policy](/en/privacy/)."
---
