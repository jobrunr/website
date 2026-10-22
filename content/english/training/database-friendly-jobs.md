---
training: true
weight: 2
title: "Jobs That Do Not Bring Down Your Database"
meta_title: "Jobs that do not bring down your database: free live JobRunr training"
description: "Free one-hour live training on running JobRunr at scale without hurting your database: what a job costs, self-learning worker capacity, prefetching, keeping the jobs table small, and where JobRunr Pro picks up."
tagline: "Throughput without a 3 a.m. call from the DBA."
level: "Performance"
level_color: "blue"
duration: "60 minutes, live"
audience: "Developers and architects running JobRunr in production, or about to. DBAs who want to know what that jobs table is doing. Anyone who has watched a batch of jobs take the database with it."
assumes: "You run JobRunr in at least one application, or you attended Foundations. This one is about protecting the database. Getting more jobs through is the Scaling Under Load session the week after."

sessions:
  - start: 2026-12-03T12:30:00+01:00
    end: 2026-12-03T13:30:00+01:00
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
    title: "Worker count: fixed versus self-learning"
    text: "Why a fixed worker count is a guess. The `SelfLearningWorkerCapacityPolicy` in JobRunr 9: what it measures (connection wait time, CPU, memory, server health), how it lowers and raises the count, and a live demo where we starve the database on purpose and watch JobRunr back off."
  - time: "0:30"
    title: "Fewer, larger queries"
    text: "The `JobPrefetchQueue`: fetching jobs in chunks before workers ask for them. Tuning the poll interval. What changes when you run many servers against one database."
  - time: "0:40"
    title: "Keeping the jobs table small"
    text: "Delete policies for succeeded and failed jobs, what to keep for auditing, and what a jobs table of millions of rows does to the dashboard and to your backups."
  - time: "0:48"
    title: "Where JobRunr Pro picks up"
    text: "Rate limiters and mutexes when the bottleneck is downstream of you. Postgres `LISTEN/NOTIFY` for instant processing without polling. The Analytics dashboard for finding the slow job in a week of data. Labelled as Pro, shown briefly."
  - time: "0:53"
    title: "Your questions"
    text: "Bring your numbers. Jobs per day, peak per minute, database flavour. We answer with those in mind."

prerequisites:
  - "JobRunr running in an application you can look at during the session, ideally one that does real work."
  - "Your numbers: roughly how many jobs per day, the peak per minute, and which database you run on."
  - "One job you suspect of being expensive. You will know more about it by the end."

takeaways:
  - "A tuning checklist for worker count, poll interval and delete policies, per database"
  - "The demo application, including the script that starves the database"
  - "The recording, the next day"
  - "A free Architecture Review where we look at your own job design and your database together"

form:
  title: "Register for this training"
  intro: "Free. The link arrives by email the day before the session."
  button: "Register"
  note: "We use your answers to prepare the session and to send you the link and the recording. Nothing else. See our [privacy policy](/en/privacy/)."
---
