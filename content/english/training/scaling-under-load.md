---
training: true
weight: 3
title: "Scaling JobRunr Under Load"
meta_title: "Scaling JobRunr under load: free live JobRunr training"
description: "Free one-hour live training on getting more jobs through JobRunr when the load goes up: more servers on one database, what to do when that database becomes the limit, bulk enqueueing, autoscaling on queue metrics, and where JobRunr Pro picks up with priority and dynamic queues."
tagline: "From one server to a fleet, without rewriting a single job."
level: "Scale"
level_color: "amber"
duration: "60 minutes, live"
audience: "Teams whose job volume is growing faster than their servers. Architects who have been asked 'can it handle ten times this?' and want a real answer before the Christmas peak, the month-end run or the next big customer."
assumes: "You run JobRunr in at least one application, or you attended Foundations."

sessions:
  - start: 2026-12-10T12:30:00+01:00
    end: 2026-12-10T13:30:00+01:00
    tz: "CET"

trainers:
  - name: "Ronald Dehuysser"
    role: "Creator of JobRunr, codes the whole hour"
  - name: "Nicholas D'hondt"
    role: "Host, asks the questions you are thinking"

agenda:
  - time: "0:00"
    title: "Where throughput stops"
    text: "We enqueue ten times the load on a single server and watch what gives first: the worker count, the poll interval, or the database as the one queue everyone fetches from. How to read the dashboard and the Micrometer metrics before you touch any setting."
  - time: "0:10"
    title: "More servers, one database"
    text: "Adding `BackgroundJobServer` instances and watching them share the work. What the jobs table does with three servers instead of one, and the settings that stop them from stepping on each other. Then the honest part: every server works from the same database, so at some point the database is the limit. The way past it is splitting your jobs over several clusters, each with its own database, and the Multi-Cluster Dashboard in JobRunr Pro Enterprise to watch them all from one place."
  - time: "0:25"
    title: "Enqueueing a lot at once"
    text: "Creating 100,000 jobs from a `Stream`, saved to the database in bulk instead of one round trip each. How long that takes, what it does to the database compared to a loop, and what the workers do when 100,000 jobs land at once."
  - time: "0:35"
    title: "Scaling the servers themselves"
    text: "Autoscaling on queue depth and queue latency instead of CPU, using KEDA on Kubernetes with the metrics JobRunr Pro exposes. What to scale on, what to ignore, and why CPU is the wrong signal for a job server."
  - time: "0:45"
    title: "Where JobRunr Pro picks up"
    text: "Priority queues so the invoice run does not wait behind the newsletter. Dynamic queues for fair share between tenants. Server tags to pin heavy jobs to big machines. Labelled as Pro, shown briefly."
  - time: "0:50"
    title: "Your questions"
    text: "Ten minutes for the scaling questions from the room and from the registration forms: the peak you are planning for, the setup you run today, and what to change first."

prerequisites:
  - "JobRunr running in an application you can look at during the session, with the dashboard open."
  - "Your numbers: jobs per day today, the peak you have to survive, how many servers you run now."

takeaways:
  - "A scaling checklist: what to change first, second and third when the load doubles"
  - "The questions to take to whoever owns your Kubernetes cluster before you switch on autoscaling"
  - "The demo application, including the load generator"
  - "The recording, the next day"
  - "A free Architecture Review of how your jobs are set up to scale"

form:
  title: "Register for this training"
  intro: "Free. The link arrives by email the day before the session."
  button: "Register"
  note: "We use your answers to prepare the session and to send you the link and the recording. Nothing else. See our [privacy policy](/en/privacy/)."
---
