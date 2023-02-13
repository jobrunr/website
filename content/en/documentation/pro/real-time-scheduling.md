---
version: "business"
title: "Real-time scheduling and enqueueing"
subtitle: "Do you have strict timing requirements? JobRunr Pro has you covered!"
date: 2020-08-27T11:12:23+02:00
layout: "documentation"
menu: 
  main: 
    identifier: real-time-scheduling
    parent: 'jobrunr-pro'
    weight: 4.5
---
{{< trial-button >}}

Do your jobs need to run some jobs on an exact moment? JobRunr Pro will do realtime enqueueing out-of-the-box!

### Some history
For performance reasons, JobRunr fetches all the jobs that need to be executed during the whole next `pollIntervalInSeconds`. This allows JobRunr to query, update and save jobs in bulk and that's the reason why scheduled and recurring jobs are sometimes performed a couple of seconds too early.

### JobRunr Pro to the rescue!
JobRunr Pro improves on this and:
- if the amount of jobs to schedule during the next `pollIntervalInSeconds` is less than 1000, it will automatically switch to real-time enqueueing with a __one-second precision__. This means if you have scheduled a job at 8pm, it will typically start processing within 50 milliseconds after 8pm.
- if the amount of jobs to schedule during the next `pollIntervalInSeconds` is more than 1000, JobRunr Pro will automatically fall back to near real-time enqueueing (so, a couple of seconds difference) again for the same performance reasons mentioned above.

> One-second precision means JobRunr Pro will group all the jobs that need to be scheduled in buckets per second and enqueue these jobs at that second. So, if there are 2 jobs that are scheduled at `2023-01-30T20:00:00.350` and `2023-01-30T20:00:00.550`, they will both be enqueued at `2023-01-30T20:00:00.000` (give or take a couple of milliseconds)