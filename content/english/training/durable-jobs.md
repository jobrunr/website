---
training: true
weight: 4
title: "Durable Jobs You Can Trust"
meta_title: "Durable jobs you can trust: free live JobRunr training"
description: "Free one-hour live training on jobs that survive failure without doing damage twice: what a retry really does, runStepOnce and idempotent steps, servers that die in the middle of a job, and where JobRunr Pro picks up with retry policies, transactions, timeouts and batches."
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
    text: "An invoice run with 600 customers, a payment provider that times out at customer 161, and a retry that starts from the top. How often JobRunr retries and how far apart, which exceptions deserve a retry, and what should happen after the last one fails: a `JobFilter` that tells somebody, instead of a red row in the dashboard that nobody looks at."
  - time: "0:10"
    title: "Durable jobs with runStepOnce"
    text: "Splitting a job into steps with `JobContext.runStepOnce()`. What JobRunr records per step, how a retried job skips the steps that already succeeded, and watching it happen in the job progress Chart view in JobRunr 9."
  - time: "0:20"
    title: "Designing idempotent steps"
    text: "Returning values between steps, external calls that are not idempotent by nature, idempotency keys, and the step boundaries that make a job safe to run twice. What belongs in one step and what does not."
  - time: "0:30"
    title: "When the server dies, not the job"
    text: "We kill a server halfway through the invoice run. How JobRunr notices the missing heartbeat and hands the orphaned job to another server, what graceful shutdown buys you on every deploy, and why the Kubernetes grace period has to be at least as long as the one JobRunr waits for. With steps, the job carries on from the last one that finished."
  - time: "0:40"
    title: "Where JobRunr Pro picks up"
    text: "A retry policy per exception, and the `DoNotRetryPolicy` for failures no retry will fix. The `@Transactional` plugin, so a job is saved in the same transaction as your own data and disappears with it on a rollback. Job timeouts for the call that hangs forever. Batches you pause halfway through a failing run, fix and resume. Labelled as Pro on screen."
  - time: "0:50"
    title: "Your questions"
    text: "Ten minutes. Bring the job you worry about and we talk through where its step boundaries should be."

prerequisites:
  - "JobRunr 9 or later running locally, so you can see the Chart view yourself. Earlier versions have `runStepOnce` too, but not the Chart."
  - "One multi-step job from your own codebase in mind, ideally one that touches money, email or an external API."
  - "Your shutdown settings at hand, such as `terminationGracePeriodSeconds` if you run on Kubernetes. You will want to check them afterwards."

takeaways:
  - "A step-design checklist for idempotent, resumable jobs, including the shutdown settings to check"
  - "The invoice-run demo application, failures and the server crash included"
  - "The recording, the next day"
  - "The [durable executions guide](/en/guides/advanced/durable-executions/) as the written reference for `runStepOnce`, for when you build your own"
  - "A free Architecture Review of your own multi-step job"

form:
  title: "Register for this training"
  intro: "Free. The link arrives by email the day before the session."
  button: "Register"
  note: "We use your answers to prepare the session and to send you the link and the recording. Nothing else. See our [privacy policy](/en/privacy/)."
---
