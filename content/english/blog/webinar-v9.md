---
title: "JobRunr v9 Launch Webinar: See Inside Every Background Job"
description: "Join the free JobRunr v9 launch webinar on Thursday 1 October 2026, 12:30 CEST. Live coding of durable jobs with runStepOnce, the new job progress timeline, and pausing a batch in JobRunr Pro. Register on LinkedIn or YouTube."
keywords: ["jobrunr v9 webinar", "jobrunr 9 launch", "jobrunr webinar", "java background jobs webinar", "durable execution java", "runStepOnce", "pause batch job"]
images:
  - "/blog/webinar-v9.webp"
image: "/blog/webinar-v9.webp"
date: 2026-09-24T12:00:00+02:00
author: "Nicholas D'hondt"
slug: "webinar-v9"
tags:
  - blog
  - webinar
  - release
  - durable execution
---
JobRunr v9 ships on Wednesday 30 September. The day after, we go live and celebrate the release with you by breaking jobs on purpose. No slides: Ronald Dehuysser, the creator of JobRunr, live-codes the whole hour and Nicholas D'hondt hosts.

**Thursday 1 October 2026, 12:30 to 13:30 CEST. Free, online.**

That is 11:30 in London, 06:30 in New York, 03:30 in San Francisco and 16:00 in Bengaluru.

<div style="display: flex; flex-wrap: wrap; gap: 1rem; margin: 2rem 0;">
  <a href="https://www.linkedin.com/events/7508498741159608320/" target="_blank" rel="noopener" style="display: inline-block; background: #744cbf; color: #fff; border-radius: 6px; padding: 12px 24px; font-weight: 600; text-decoration: none; box-shadow: none;">Register on LinkedIn</a>
  <a href="https://www.youtube.com/watch?v=bVNeB-ePdn0" target="_blank" rel="noopener" style="display: inline-block; background: #fff; color: #744cbf; border: 2px solid #744cbf; border-radius: 6px; padding: 10px 22px; font-weight: 600; text-decoration: none; box-shadow: none;">Set a reminder on YouTube</a>
</div>

It is the same stream on both platforms, so pick the one you already use. Ask your questions in the chat on either one, we read both.

## What we will show you

### In JobRunr OSS (free)

- **Durable jobs with `runStepOnce`.** Turn an ordinary background job into a durable job that resumes at the step that failed, instead of starting again from the top.
- **The new job progress timeline.** We fail step three of a durable job on purpose, then watch the automatic retry skip the finished steps on the dashboard.
- **One more thing** in the open source version that we are keeping for the stream.

### In JobRunr Pro

- **Batches.** Enqueue hundreds of jobs atomically and follow them as one run.
- **Pausing a batch** halfway through a failing run, letting the running jobs finish, and resuming once the cause is fixed.
- **The JobRunr Analytics Dashboard.** A completely new dashboard to see how your servers and jobs are doing and to triage where an issue sits.

We keep plenty of time for Q&A. Send your question in the comments of the LinkedIn event beforehand, or ask it live.

## Watch it here

The player below goes live on 1 October at 12:30 CEST and turns into the replay once the stream ends.

<iframe width="100%" height="400" src="https://www.youtube.com/embed/bVNeB-ePdn0" title="JobRunr v9 Launch Webinar: See Inside Every Background Job" frameborder="0" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## Cannot join live?

Register anyway. Every registrant on LinkedIn gets the recording within 24 hours, and the YouTube link above stays up as the replay.

## Want a head start?

`runStepOnce` is already in JobRunr today, so you can try durable steps before the webinar:

- [Durable executions guide](/en/guides/advanced/durable-executions/)
- [Batches in JobRunr Pro](/en/documentation/pro/batches/)

See you on Thursday 1 October.
