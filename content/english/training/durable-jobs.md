---
training: true
weight: 4
title: "Durable Jobs You Can Trust"
meta_title: "Durable jobs you can trust: free live JobRunr training"
description: "Free one-hour live training on jobs that survive failure without doing damage twice: idempotency, runStepOnce, the job progress Chart view, and batches you can pause in JobRunr Pro."
tagline: "Retries that never charge a customer twice."
level: "Reliability"
level_color: "purple"
duration: "60 minutes, live"
audience: "Developers who own jobs that call payment providers, send emails, move money or talk to anything that cannot be undone. Architects who have to sign off on how a retry behaves."
assumes: "You run JobRunr in at least one application, or you attended Foundations."

sessions:
  - start: 2027-01-14T12:30:00+01:00
    end: 2027-01-14T13:30:00+01:00
    tz: "CET"

trainers:
  - name: "Ronald Dehuysser"
    role: "Creator of JobRunr, codes the whole hour"
  - name: "Nicholas D'hondt"
    role: "Host, asks the questions you are thinking"

agenda:
  - time: "0:00"
    title: "What a retry really does"
    text: "An invoice run with 600 customers, a payment provider that times out at customer 161, and a retry that starts from the top. Where the damage happens, and why 'just add retries' is not a reliability strategy."
  - time: "0:12"
    title: "Durable jobs with runStepOnce"
    text: "Splitting a job into steps with `JobContext.runStepOnce()`. What JobRunr records per step, how a retried job skips the steps that already succeeded, and watching it happen in the job progress Chart view in JobRunr 9."
  - time: "0:28"
    title: "Designing idempotent steps"
    text: "Returning values between steps, external calls that are not idempotent by nature, idempotency keys, and the step boundaries that make a job safe to run twice. What belongs in one step and what does not."
  - time: "0:42"
    title: "Where JobRunr Pro picks up"
    text: "Batches: hundreds of child jobs as one run. Pausing a batch halfway through a failing run, letting running jobs finish, fixing the cause, resuming. Job chaining and job timeouts. Labelled as Pro, shown briefly."
  - time: "0:52"
    title: "Your questions"
    text: "Bring the job you worry about. We will talk through where its step boundaries should be."

prerequisites:
  - "JobRunr 9 or later running locally, so you can see the Chart view yourself. Earlier versions have `runStepOnce` too, but not the Chart."
  - "Read the [durable executions guide](/en/guides/advanced/durable-executions/) if you have fifteen minutes. Not required, but the hour goes further if you did."
  - "One multi-step job from your own codebase in mind, ideally one that touches money, email or an external API."

takeaways:
  - "A step-design checklist for idempotent, resumable jobs"
  - "The invoice-run demo application, failures included"
  - "The recording, the next day"
  - "A free Architecture Review of your own multi-step job"

form:
  title: "Register for this training"
  intro: "Free. The link arrives by email the day before the session."
  button: "Register"
  note: "We use your answers to prepare the session and to send you the link and the recording. Nothing else. See our [privacy policy](/en/privacy/)."
---
