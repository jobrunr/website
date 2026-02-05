---
title: "Java Cron Jobs & Recurring Tasks: A Complete Scheduling Guide"
description: "Learn how to schedule recurring jobs in Java. Compare ScheduledExecutorService, Spring @Scheduled, Quartz cron triggers, and modern alternatives that actually scale."
keywords: ["java cron", "cron job java", "java cron expression", "java crontab", "java scheduled task", "cronjob java", "recurring job java", "recurring jobs", "java periodic task"]
image: /blog/java-cron-jobs-guide.png
date: 2026-02-02T11:00:00+02:00
author: "Nicholas D'hondt"
tags:
  - blog
  - cron
  - scheduling
  - tutorial
---

> [!TIP]
> Just looking to generate a cron expression? Try our [Cron Expression Generator](/en/tools/cron-expression-generator/) to quickly build and test cron schedules.

Running code on a schedule is one of those things that sounds simple until you actually try to do it right. Every hour, every day at midnight, every Monday at 9am. In Linux you'd just add a line to crontab and forget about it.

In Java, you have more options than you probably want. Some are built into the language, some come from frameworks, and some actually work in production. We'll walk through all of them so you can pick the right one for your situation.

## The Basics: What is a Cron Expression?

A cron expression defines when something should run. The format comes from Unix cron:

```
┌───────────── second (0-59) [optional in some implementations]
│ ┌───────────── minute (0-59)
│ │ ┌───────────── hour (0-23)
│ │ │ ┌───────────── day of month (1-31)
│ │ │ │ ┌───────────── month (1-12)
│ │ │ │ │ ┌───────────── day of week (0-6, Sunday=0)
│ │ │ │ │ │
* * * * * *
```

Examples:
- `0 * * * *` = every hour at minute 0
- `0 9 * * *` = every day at 9:00 AM
- `0 9 * * 1` = every Monday at 9:00 AM
- `0 0 1 * *` = first day of every month at midnight
- `*/15 * * * *` = every 15 minutes

Java cron libraries understand this format. Some extend it with seconds, some use slightly different syntax for day of week. We'll cover the differences.

## Option 1: ScheduledExecutorService

Java's built in option. No external dependencies.

```java
ScheduledExecutorService executor = Executors.newScheduledThreadPool(1);

// Run every hour
executor.scheduleAtFixedRate(
    () -> System.out.println("Running hourly task"),
    0,
    1,
    TimeUnit.HOURS
);

// Run every day at fixed delay
executor.scheduleWithFixedDelay(
    () -> cleanupOldFiles(),
    0,
    24,
    TimeUnit.HOURS
);
```

**Pros:**
- Built into Java, no dependencies
- Simple API

**Cons:**
- No cron expression support (only fixed intervals)
- Doesn't survive application restarts
- Single server only
- No visibility or monitoring
- If a task throws an exception, the schedule stops

This works for trivial cases. For anything production grade, keep reading.

## Option 2: Spring @Scheduled

If you're using Spring Boot, the `@Scheduled` annotation is convenient.

```java
@Component
public class ScheduledTasks {
    
    @Scheduled(cron = "0 0 9 * * *")
    public void dailyReportAt9am() {
        generateReport();
    }
    
    @Scheduled(fixedRate = 60000)
    public void everyMinute() {
        checkHealth();
    }
    
    @Scheduled(cron = "0 0 0 * * MON")
    public void everyMondayMidnight() {
        weeklyCleanup();
    }
}
```

Enable it in your configuration:

```java
@EnableScheduling
@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

**Spring cron format:**
- 6 fields: second, minute, hour, day, month, weekday
- Day of week: 0=Sunday, or use names (MON, TUE, etc.)
- Supports `?` for "no specific value" in day fields

**Pros:**
- Clean annotation syntax
- Integrated with Spring ecosystem
- Cron expressions supported

**Cons:**
- Doesn't survive restarts (in memory only)
- Multiple instances = duplicate execution
- No dashboard or monitoring
- Failed tasks don't automatically retry
- Can't schedule dynamically at runtime

Spring `@Scheduled` is fine for development. In production with multiple instances, you'll have problems.

## Option 3: Quartz Scheduler

[Quartz](https://www.quartz-scheduler.org/) has been around since 2001. It's the traditional choice for Java cron jobs.

```java
// Define a job
public class ReportJob implements Job {
    @Override
    public void execute(JobExecutionContext context) {
        generateReport();
    }
}

// Schedule it
JobDetail job = JobBuilder.newJob(ReportJob.class)
    .withIdentity("dailyReport")
    .build();

CronTrigger trigger = TriggerBuilder.newTrigger()
    .withIdentity("dailyTrigger")
    .withSchedule(CronScheduleBuilder.cronSchedule("0 0 9 * * ?"))
    .build();

scheduler.scheduleJob(job, trigger);
```

**Quartz cron format:**
- 6 or 7 fields (year optional)
- Uses `?` for day of month or day of week
- Day of week: 1=Sunday through 7=Saturday, or SUN-SAT

**Pros:**
- Mature and battle tested
- Can persist jobs to database
- Clustering support

**Cons:**
- Verbose API
- Complex configuration
- 11+ database tables required
- Dashboard not included
- Maintenance has been sporadic

Quartz works, but there are better options now. We wrote about [why teams are moving away from Quartz](/en/blog/2023-02-20-moving-from-quartz-scheduler-to-jobrunr/).

## Option 4: JobRunr (Modern Approach)

[JobRunr](https://www.jobrunr.io) simplifies cron jobs in Java. Lambda syntax, built in dashboard, persistent storage.

```java
// Schedule a recurring job
BackgroundJob.scheduleRecurrently(
    "daily-report",
    Cron.daily(9, 0),
    () -> reportService.generateDailyReport()
);

// Or use cron expression directly
BackgroundJob.scheduleRecurrently(
    "weekly-cleanup",
    "0 0 * * 1",
    () -> cleanupService.weeklyCleanup()
);
```

**JobRunr cron format:**
- 5 fields: minute, hour, day, month, weekday (standard Unix)
- Weekday: 0=Sunday through 6=Saturday
- Helper class `Cron` for common patterns

Common patterns with the `Cron` helper:

```java
Cron.minutely()           // Every minute
Cron.hourly()             // Every hour at :00
Cron.hourly(30)           // Every hour at :30
Cron.daily()              // Every day at midnight
Cron.daily(9, 0)          // Every day at 9:00 AM
Cron.weekly()             // Every Sunday at midnight
Cron.monthly()            // First of month at midnight
Cron.monthly(15, 14, 30)  // 15th of month at 2:30 PM
```

**Pros:**
- Simple lambda syntax
- Jobs persist in your database
- Built in dashboard
- Automatic retries on failure
- Works with multiple instances (no duplicates)
- Spring Boot, Quarkus, Micronaut integration

**Cons:**
- Requires a database (but you probably have one)

### Using Annotations (Spring Boot)

If you prefer annotations over programmatic scheduling, JobRunr supports the `@Recurring` annotation in Spring Boot:

```java
@Component
public class ReportService {

    @Recurring(id = "daily-report", cron = "0 9 * * *")
    public void generateDailyReport() {
        // This runs every day at 9:00 AM
    }

    @Recurring(id = "weekly-cleanup", cron = "0 0 * * 1")
    public void weeklyCleanup() {
        // This runs every Monday at midnight
    }
}
```

The annotation approach is familiar if you're coming from Spring's `@Scheduled`, but with JobRunr's benefits: the jobs are persisted, visible in the dashboard, and won't run twice when you have multiple instances.

### Setting Up JobRunr

Add the dependency:

{{< codetabs category="framework" >}}
{{< codetab label="Fluent API" >}}
```xml
<dependency>
    <groupId>org.jobrunr</groupId>
    <artifactId>jobrunr</artifactId>
    <version>${jobrunr.version}</version>
</dependency>
```
{{< /codetab >}}
{{< codetab label="Spring Boot" >}}
```xml
<dependency>
    <groupId>org.jobrunr</groupId>
    <artifactId>jobrunr-spring-boot-3-starter</artifactId>
    <version>${jobrunr.version}</version>
</dependency>
```
{{< /codetab >}}
{{< codetab label="Micronaut" >}}
```xml
<dependency>
    <groupId>org.jobrunr</groupId>
    <artifactId>jobrunr-micronaut-feature</artifactId>
    <version>${jobrunr.version}</version>
</dependency>
```
{{< /codetab >}}
{{< codetab label="Quarkus" >}}
```xml
<dependency>
    <groupId>org.jobrunr</groupId>
    <artifactId>jobrunr-quarkus-extension</artifactId>
    <version>${jobrunr.version}</version>
</dependency>
```
{{< /codetab >}}
{{< /codetabs >}}

Initialize JobRunr:

{{< codetabs category="framework" >}}
{{< codetab label="Fluent API" >}}
```java
JobRunr.configure()
    .useStorageProvider(new SqLiteStorageProvider(dataSource))
    .useBackgroundJobServer()
    .useDashboard()
    .initialize();
```
{{< /codetab >}}
{{< codetab label="Spring Boot" >}}
```properties
jobrunr.background-job-server.enabled=true
jobrunr.dashboard.enabled=true
```
{{< /codetab >}}
{{< codetab label="Micronaut" >}}
```yaml
jobrunr:
  background-job-server:
    enabled: true
  dashboard:
    enabled: true
```
{{< /codetab >}}
{{< codetab label="Quarkus" >}}
```properties
quarkus.jobrunr.background-job-server.enabled=true
quarkus.jobrunr.dashboard.enabled=true
```
{{< /codetab >}}
{{< /codetabs >}}

Schedule jobs:

```java
@Service
public class ScheduledJobsConfig {
    
    private final ReportService reportService;
    private final CleanupService cleanupService;
    
    @PostConstruct
    public void registerRecurringJobs() {
        // Daily at 9 AM
        BackgroundJob.scheduleRecurrently(
            "daily-report",
            Cron.daily(9, 0),
            reportService::generateDailyReport
        );
        
        // Every Monday at midnight
        BackgroundJob.scheduleRecurrently(
            "weekly-cleanup",
            "0 0 * * 1",
            cleanupService::weeklyCleanup
        );
        
        // Every 15 minutes
        BackgroundJob.scheduleRecurrently(
            "health-check",
            "*/15 * * * *",
            () -> healthService.check()
        );
    }
}
```

Open `/dashboard` to see your recurring jobs:

<figure>
<img src="/documentation/recurring-jobs-1.webp" class="kg-image">
<figcaption>JobRunr dashboard showing recurring jobs and their next run times</figcaption>
</figure>

## Comparison Table

| Feature | ScheduledExecutor | Spring @Scheduled | Quartz | JobRunr |
|---------|-------------------|-------------------|--------|---------|
| Cron expressions | ❌ | ✅ | ✅ | ✅ |
| Survives restarts | ❌ | ❌ | ✅ | ✅ |
| Multiple instances | ❌ | ❌ | ✅ | ✅ |
| Dashboard | ❌ | ❌ | ❌ | ✅ |
| Automatic retries | ❌ | ❌ | ✅ | ✅ |
| Simple API | ✅ | ✅ | ❌ | ✅ |
| Database tables | 0 | 0 | 11+ | 4 |

## Handling Common Scenarios

### "Run at startup, then every hour"

```java
// JobRunr handles this automatically
// The job runs immediately if it's never run before
BackgroundJob.scheduleRecurrently(
    "hourly-sync",
    Cron.hourly(),
    () -> syncService.sync()
);
```

### "Run only on weekdays"

```java
// Monday through Friday at 9 AM
BackgroundJob.scheduleRecurrently(
    "weekday-report",
    "0 9 * * 1-5",
    () -> reportService.generate()
);
```

### "Run every 5 minutes during business hours"

```java
// 9 AM to 5 PM, every 5 minutes, weekdays only
BackgroundJob.scheduleRecurrently(
    "business-hours-check",
    "*/5 9-17 * * 1-5",
    () -> alertService.checkSystems()
);
```

### "Run on the last day of every month"

Standard cron doesn't support "last day of month" directly. You can:

1. Schedule for the 28th (safe for all months)
2. Use application logic to check the date
3. Schedule multiple jobs for 28th, 29th, 30th, 31st with date checks

```java
// Option 2: check in code
BackgroundJob.scheduleRecurrently(
    "month-end-report",
    Cron.daily(23, 59),
    () -> {
        if (isLastDayOfMonth()) {
            reportService.monthEndReport();
        }
    }
);

private boolean isLastDayOfMonth() {
    LocalDate today = LocalDate.now();
    return today.equals(today.withDayOfMonth(today.lengthOfMonth()));
}
```

### "Run at a specific timezone"

JobRunr uses the server's timezone by default. For explicit timezone control:

```java
// This runs at 9 AM New York time, regardless of server location
BackgroundJob.scheduleRecurrently(
    "nyc-report",
    "0 9 * * *",
    ZoneId.of("America/New_York"),
    () -> reportService.generate()
);
```

## Cron Expression Cheat Sheet

| Expression | Description |
|------------|-------------|
| `* * * * *` | Every minute |
| `*/5 * * * *` | Every 5 minutes |
| `0 * * * *` | Every hour |
| `0 */2 * * *` | Every 2 hours |
| `0 9 * * *` | Daily at 9:00 AM |
| `0 9,17 * * *` | At 9:00 AM and 5:00 PM |
| `0 9-17 * * *` | Every hour from 9 AM to 5 PM |
| `0 0 * * *` | Daily at midnight |
| `0 0 * * 0` | Weekly on Sunday |
| `0 0 * * 1-5` | Weekdays at midnight |
| `0 0 1 * *` | Monthly on the 1st |
| `0 0 1 1 *` | Yearly on January 1st |

## What to Use

**For local development or simple scripts:**
JobRunr OSS is a solid choice. Quick to set up, persistent jobs, and a built-in dashboard to see what's happening.

**For production applications:**
JobRunr OSS handles most use cases well. If you need enterprise features like priority queues, smart queues, or advanced dashboard filters, consider [JobRunr Pro](/en/pro/).

**If you're already using Quartz:**
Consider [migrating to JobRunr](/en/blog/2023-02-20-moving-from-quartz-scheduler-to-jobrunr/). The API is simpler and you get a dashboard.

---

*Build cron expressions visually with our [Cron Expression Generator](/en/tools/cron-expression-generator/).*

*Need more than recurring jobs? JobRunr also handles [fire and forget](/en/documentation/background-methods/enqueueing-jobs/), [delayed jobs](/en/documentation/background-methods/scheduling-jobs/), and [job workflows](/en/documentation/pro/job-chaining/).*
