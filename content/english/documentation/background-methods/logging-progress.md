---
title: "Logging & job progress"
subtitle: "Watch your job progress thanks to live updates"
keywords: ["logging jobs", "job progress", "job logging", "mapped diagnostic context", "mdc", "progress bar", "job logger"]
date: 2020-04-30T11:12:23+02:00
layout: "documentation"
menu: 
  sidebar:
    identifier: logging-job-progress
    parent: 'background-methods'
    weight: 70
---
Some jobs take a very long time to complete - generating 1000's of emails, do a batch import of some large xml or CSV files, ... . How to know whether your code is actually running and doing its actual job (pun intended)?

Say hello to job logging and the job progress bar.

![](/documentation/job-progress.gif "The Job History progress bar is updated live as you schedule jobs.")

## Logging
JobRunr supports logging to the dashboard - new messages will appear as they're logged, it is as if you're looking at a real console. To log something in the dashboard, you have two options:

- you can use the JobContext and use its logger:<br>
`jobContext.logger().info('this will appear in the dashboard');`
- or - even easier - wrap your existing Logger as follows:<br>
`Logger log = new JobRunrDashboardLogger(LoggerFactory.getLogger(MyService.class))`<br>
where `log` is now an SL4J logger which will still continue to log to the original SLF4J logger but also to the dashboard.

The last logger will make sure that all info, warn and error statement will be shown in the dashboard for each job. Debug logging is not supported as I want to prevent to spam the various browsers.

### Mapped Diagnostic Context (MDC)
JobRunr also supports the mapped diagnostic context or MDC of SLF4J. This means that any variables you have put in the MDC will also be available when the actual job is being processed and if you log from your job, this will thus also include the variables from your MDC. This is ideal in a distributed system where you have a correlation id generated when the request comes in and you can thus track everything (including your jobs) using this correlation id.

You can even have MDC variables in the display name of a job - this comes in handy with the [JobRunr Pro dashboard]({{< ref "jobrunr-pro-dashboard.md" >}}) where you can then search for a job using that correlation id. To do so, you need to annote your job as follows:

```java
@Job(name="Job related to %X{request.correlationId}", retries=2)
public void runJob() { ... }
```
<br/>


## Progress bar
Long running jobs take time - and sometimes you need to know how long a job will take. Thanks to the progress bar in JobRunr, you can now track progress from within the dashboard - a progress bar will appear automatically just below the 'Processing job' header and advance while work is progressing.

### For Java 8 lambdas
To use this feature, you will need to inject the `JobContext` into your job: 
`BackgroundJob.enqueue(() -> myService.doWork(JobContext.Null))`.

Inside your actual job, you can then use the JobContext to create a progress bar:

```java
public class MyService {

	public void doWork(JobContext jobContext) {
    	JobDashboardProgressBar progressBar = jobContext.progressBar(1000);
        
        for(int i = 0; i < 1000; i++) {
        	//do actual work
            progressBar.incrementSucceeded();
            // or you can also use
            progressBar.setProgress(i);
        }
    }
}
```

<br/>

### For JobRequestHandlers
To use this feature, you will need to access the `JobContext` from your `JobRequestHandler`. It is available via a default method available on the `JobRequestHandler` interface and gives thread-safe access to the `JobContext`: 


```java
public class MySimpleJobRequestHandler implements JobRequestHandler<MySimpleJobRequest> {

	public void run(MySimpleJobRequest jobRequest) {
    	JobDashboardProgressBar progressBar = jobContext().progressBar(1000);
        
        for(int i = 0; i < 1000; i++) {
        	//do actual work
            progressBar.incrementSucceeded();
            // or you can also use
            progressBar.setProgress(i);
        }
    }
}
```

