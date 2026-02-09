---
title: "Migrate to JobRunr"
description: "Migration guides from Quartz, Spring @Scheduled, Hangfire, and custom schedulers to JobRunr. Make the switch in hours, not weeks."
keywords: ["migrate from quartz", "quartz to jobrunr", "spring scheduled migration", "hangfire java alternative", "replace quartz scheduler"]
weight: 20
tags:
    - Migration
    - JobRunr
hideFrameworkSelector: true
aliases:
    - /en/migrate-to-jobrunr/
skip_meta: true
---

<style>
.migration-card {
    border: 1px solid #e1e4e8;
    border-radius: 12px;
    padding: 1.5rem;
    margin: 1rem 0;
    transition: box-shadow 0.2s;
}
.migration-card:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
.migration-card h3 {
    margin-top: 0;
    display: flex;
    align-items: center;
    gap: 0.75rem;
}
.migration-card .difficulty {
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    background: #ddf4ff;
    color: #0969da;
}
.migration-card .difficulty.easy {
    background: #dafbe1;
    color: #1a7f37;
}
.migration-card .time {
    font-size: 0.9rem;
    color: #57606a;
    margin-bottom: 1rem;
}
.quick-start {
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    color: white;
    padding: 2rem;
    border-radius: 12px;
    margin: 2rem 0;
}
.quick-start h2 {
    color: #58a6ff;
    margin-top: 0;
}
.quick-start p,
.quick-start ol,
.quick-start li {
    color: white;
}
.quick-start code {
    background: rgba(255,255,255,0.1);
    padding: 0.2rem 0.4rem;
    border-radius: 4px;
    color: #58a6ff;
}
.comparison-snippet {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin: 1rem 0;
}
@media (max-width: 768px) {
    .comparison-snippet {
        grid-template-columns: 1fr;
    }
}
.comparison-snippet pre {
    margin: 0;
    padding: 1rem;
    border-radius: 8px;
    font-size: 0.85rem;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
    overflow-x: auto;
}
.comparison-snippet .before {
    background: #ffeef0;
    border: 1px solid #ffc1c0;
}
.comparison-snippet .after {
    background: #e6ffec;
    border: 1px solid #a7f3d0;
}
a.btn-primary {
    text-decoration: none;
}
.comparison-snippet .label {
    font-size: 0.75rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: #57606a;
}
</style>

Switching to JobRunr is straightforward. Most migrations take a few hours, not days. Pick your starting point below.

<div class="quick-start">
<h2>The Fastest Path</h2>
<p>Already have jobs defined as methods in your codebase? JobRunr works with your existing code.</p>
<ol>
<li>Add the JobRunr dependency</li>
<li>Configure JobRunr (see the <a href="/en/documentation/">documentation</a>)</li>
<li>Schedule your jobs using the JobRunr API</li>
</ol>
<p>Your job methods stay the same. Only the scheduling layer changes.</p>
</div>

## Migration Guides

<div class="migration-card">
<h3>
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
From Quartz Scheduler
<span class="difficulty">Medium</span>
</h3>
<p class="time">2-4 hours for typical projects</p>
<p>Quartz requires Job classes, triggers, and complex configuration. JobRunr uses simple lambdas or <code>JobRequest</code>/<code>JobRequestHandler</code>.</p>
<div class="comparison-snippet">
<div>
<div class="label">BEFORE (Quartz)</div>
<pre class="before">JobDetail job = JobBuilder.newJob(EmailJob.class)
    .withIdentity("sendEmail")
    .usingJobData("userId", id)
    .build();
<br/>Trigger trigger = TriggerBuilder.newTrigger()
    .startNow()
    .build();
<br/>scheduler.scheduleJob(job, trigger);</pre>
</div>
<div>
<div class="label">AFTER (JobRunr)</div>
<pre class="after">BackgroundJob.enqueue(
    () -> emailService.send(userId)
);</pre>
</div>
</div>
<p><strong>What changes:</strong></p>
<ul>
<li>Remove Job interface implementations</li>
<li>Remove trigger configuration</li>
<li>Replace with lambda calls or job requests</li>
<li>Delete 11 Quartz tables, JobRunr manages its own schema</li>
</ul>
<p><a href="/en/blog/2023-02-20-moving-from-quartz-scheduler-to-jobrunr/">Full Quartz Migration Guide &rarr;</a></p>
</div>

<div class="migration-card">
<h3>
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
From Spring @Scheduled
<span class="difficulty easy">Easy</span>
</h3>
<p class="time">30 minutes to 1 hour</p>
<p>Spring @Scheduled is simple but doesn't persist jobs or handle multiple instances. JobRunr adds reliability.</p>
<div class="comparison-snippet">
<div>
<div class="label">BEFORE (Spring)</div>
<pre class="before">@Scheduled(cron = "0 0 9 * * *")
public void dailyReport() {
    reportService.generate();
}</pre>
</div>
<div>
<div class="label">AFTER (JobRunr)</div>
<pre class="after">@Recurring(id = "daily-report",
    cron = "0 0 9 * * *")
public void dailyReport() {
    reportService.generate();
}</pre>
</div>
</div>
<p><strong>What you gain:</strong></p>
<ul>
<li>Jobs survive application restarts</li>
<li>No duplicate execution across instances</li>
<li>Built-in dashboard and monitoring</li>
<li>Automatic retries on failure</li>
</ul>
<p><a href="/en/documentation/configuration/spring/">Spring Boot Starter Configuration &rarr;</a> | <a href="/en/blog/java-cron-jobs-guide/">Java Scheduling Guide &rarr;</a></p>
</div>

<div class="migration-card">
<h3>
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
From Spring Batch
<span class="difficulty">Medium</span>
</h3>
<p class="time">Varies by complexity</p>
<p>Spring Batch is for ETL and chunk processing. JobRunr is for background tasks. You might need both, or just JobRunr.</p>
<p><strong>Use JobRunr instead when:</strong></p>
<ul>
<li>You're processing items individually, not in chunks</li>
<li>You don't need reader/processor/writer pattern</li>
<li>You want simpler code without batch infrastructure</li>
</ul>
<p><strong>Keep Spring Batch when:</strong></p>
<ul>
<li>You're doing true ETL workloads</li>
<li>You need chunk-based transaction management</li>
<li>You're processing millions of records in a single job</li>
</ul>
<p><a href="/en/blog/spring-batch-vs-jobrunr/">Spring Batch vs JobRunr &rarr;</a></p>
</div>

<div class="migration-card">
<h3>
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
From Hangfire (.NET)
<span class="difficulty easy">Easy</span>
</h3>
<p class="time">1-2 hours (API is nearly identical)</p>
<p>Moving from .NET to Java? JobRunr's API was inspired by Hangfire. The concepts map directly.</p>
<div class="comparison-snippet">
<div>
<div class="label">Hangfire (.NET)</div>
<pre class="before">BackgroundJob.Enqueue(
    () => Console.WriteLine("Hello!")
);
<br/>BackgroundJob.Schedule(
    () => SendEmail(userId),
    TimeSpan.FromDays(7)
);</pre>
</div>
<div>
<div class="label">JobRunr (Java)</div>
<pre class="after">BackgroundJob.enqueue(
    () -> System.out.println("Hello!")
);
<br/>BackgroundJob.schedule(
    Instant.now().plus(Duration.ofDays(7)),
    () -> sendEmail(userId)
);</pre>
</div>
</div>
<p><a href="/en/blog/hangfire-for-java/">Hangfire for Java Guide &rarr;</a></p>
</div>

<div class="migration-card">
<h3>
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
From Custom/Homegrown Scheduler
<span class="difficulty">Varies</span>
</h3>
<p class="time">Depends on current implementation</p>
<p>Built your own job scheduler? Time to stop maintaining it.</p>
<p><strong>Common patterns to replace:</strong></p>
<ul>
<li>Database polling loops &rarr; JobRunr handles this</li>
<li>Custom locking logic &rarr; Built into JobRunr</li>
<li>Retry mechanisms &rarr; Automatic with exponential backoff</li>
<li>Status tracking tables &rarr; JobRunr manages its own schema</li>
<li>Admin UI &rarr; Built-in dashboard</li>
</ul>
<p><a href="/en/blog/distributed-job-scheduling-java/">Why DIY Schedulers Fail &rarr;</a></p>
</div>

## Common Migration Questions

### Can I run both during migration?

Yes. JobRunr doesn't interfere with existing schedulers. You can migrate incrementally:

1. Add JobRunr alongside existing scheduler
2. Move jobs one by one
3. Remove old scheduler when complete

### What about my existing job data?

JobRunr creates its own tables. Your existing job history stays in the old system. For most teams, this is fine. Starting fresh with JobRunr's cleaner data model is often preferred.

### Do I need to change my job code?

Usually no. JobRunr calls your existing methods. You're changing how jobs are scheduled, not what they do.

### How do I handle in-flight jobs during migration?

1. Stop creating new jobs with the old scheduler
2. Wait for in-flight jobs to complete (monitor the old dashboard/logs)
3. Switch to JobRunr for new jobs
4. Shut down old scheduler

For recurring jobs, schedule them in JobRunr before removing from the old system to avoid gaps.
