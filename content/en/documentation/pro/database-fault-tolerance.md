---
version: "pro"
title: "Database Fault Tolerance"
subtitle: "Keep your jobs running - even in a volatile infrastructure landscape."
date: 2021-06-24T11:12:23+02:00
layout: "documentation"
menu: 
  main: 
    identifier: database-fault-tolerance
    parent: 'jobrunr-pro'
    weight: 31
---
{{< trial-button >}}

JobRunr by defaults stops completely if my SQL / NoSQL database goes down and there is a reason for this - JobRunr namely uses your database for a lot of things:
- Master node election for the `BackgroundJobServer`
- Fetching the details of a `Job` and update the state when it's done
- Monitoring whether there are no zombie jobs (jobs that were being processed on a `BackgroundJobServer` node that crashed)
- Optimistic locking so that a job will be only executed once
- ...

The moment JobRunr loses it’s connection to the database (or the database goes down), there will be a lot of threads that will try to read and write updates to the database but all of these will off-course fail. This will result in a huge amount of logging and if JobRunr would try to continue job processing, it would flood the disks fast because of each attempt to process a job fails. I've seen it happen and it happens faster than you think.

That’s why I decided that if there are too many exceptions because of the StorageProvider, JobRunr stops all background job processing. This can off-course be monitored via the dashboard and health endpoints.

### JobRunr Pro has your back
**JobRunr Pro** increases resilience for this and pauses all job processing as soon as the StorageProvider goes down.
It continues to monitor the database whether it comes up again and if so, automatically restarts processing on all the different `BackgroundJobServers`.

{{< trial-button >}}