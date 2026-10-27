---
training: true
weight: 2
title: "Jobs That Do Not Bring Down Your Database"
meta_title: "Jobs that do not bring down your database: free live JobRunr training"
description: "Free one-hour live training on running JobRunr at scale without hurting your database: what a job costs, keeping the jobs table small, fewer and larger queries, the worker count, and where JobRunr Pro picks up."
tagline: "Background jobs and online traffic on one database, without one slowing down the other."
level: "Performance"
level_color: "blue"
duration: "60 minutes, live"
audience: "Developers running JobRunr in production, or about to. Architects who have to answer for the batch window and the database it shares with the online channel. DBAs who want to know what that jobs table is doing."
assumes: "You run JobRunr in at least one application, or you attended Foundations. This one is about protecting the database. Getting more jobs through is the Scaling Under Load session in January."

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
    title: "What a job costs your database"
    text: "The queries JobRunr runs for one job from enqueue to success, the poll interval, the indexes on the jobs table, and how to read the numbers your database already gives you. Where the load really comes from: the job scheduler, or the code inside the job."
  - time: "0:15"
    title: "Keeping the jobs table small"
    text: "Delete policies for succeeded and failed jobs, what to keep for auditing, and what a jobs table of millions of rows does to the dashboard and to your backups. Small job arguments: pass the ID and load the entity inside the job, instead of serializing the whole object into every row."
  - time: "0:25"
    title: "Fewer, larger queries"
    text: "What the poll interval really changes (how fast a job is picked up, not how many get through) and what it costs when every server polls. What changes when you run many servers against one database. In JobRunr Pro, the `JobPrefetchQueue` fetches jobs in chunks before workers ask for them."
  - time: "0:35"
    title: "Worker count: fixed versus self-learning"
    text: "Foundations covers how to set the worker count. This part is about your database: what happens when the workers outnumber the connection pool, and why a fixed count is always a guess. Then the `SelfLearningWorkerCapacityPolicy` in JobRunr Pro 9, live: we starve the database on purpose and watch JobRunr lower the worker count until connections are fast again."
  - time: "0:45"
    title: "Where JobRunr Pro picks up"
    text: "Rate limiters and mutexes when the bottleneck is downstream of you. Postgres `LISTEN/NOTIFY` for instant processing without polling. The Analytics dashboard for finding the slow job in a week of data. Labelled as Pro, shown briefly."
  - time: "0:50"
    title: "Your questions"
    text: "Ten minutes for the questions from the room and from the registration forms: your database, your jobs table, and the job you suspect."

prerequisites:
  - "JobRunr running in an application you can look at during the session, ideally one that does real work."
  - "Which database you run on, and roughly how many rows sit in your jobs table today. A `SELECT COUNT(*)` on `jobrunr_jobs` is enough."
  - "One job you suspect of being expensive. You will know more about it by the end."

takeaways:
  - "A tuning checklist for delete policies, job arguments, poll interval and worker count, per database"
  - "The demo application, including the script that starves the database"
  - "The recording, the next day"
  - "A free Architecture Review where we look at your own job design and your database together"

form:
  title: "Register for this training"
  intro: "Free. The link arrives by email the day before the session."
  button: "Register"
  note: "We use your answers to prepare the session and to send you the link and the recording. Nothing else. See our [privacy policy](/en/privacy/)."
---
