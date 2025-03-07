---
title: "Logging & job progress"
subtitle: "Watch your job progress thanks to live updates"
date: 2020-04-30T11:12:23+02:00
layout: "documentation"
menu: 
  main: 
    identifier: logging-job-progress
    parent: 'background-methods'
    weight: 70
---
Some jobs take a very long time to complete - generating 1000's of emails, do a batch import of some large xml or CSV files, ... . How to know whether your code is actually running and doing its actual job (pun intended)?

Say hello to job logging and the job progress bar.

![](/documentation/job-progress.gif "Watch logging appear live from your actual job")

## Logging
JobRunr supports logging to the dashboard - new messages will appear as they're logged, it is as if you're looking at a real console. To log something in the dashboard, you have two options:

- you can use the JobContext and use its logger:<br>
`jobContext.logger().info('this will appear in the dashboard');`
- or - even easier - wrap your existing Logger as follows:<br>
`new JobRunrDashboardLogger(LoggerFactory.getLogger(MyService.class))`

The last logger will make sure that all info, warn and error statement will be shown in the dashboard for each job. Debug logging is not supported as I want to prevent to spam the various browsers.

## Progress bar
Long running jobs take time - and sometimes you need to know how long a job will take. Thanks to the progress bar in JobRunr, you can now track progress from within the dashboard - a progress bar will appear automatically just below the 'Processing job' header and advance while work is progressing.

To use this feature, you will need to inject the `JobContext` into your job: 
`BackgroundJob.enqueue(() -> myService.doWork(JobContext.Null))`.

Inside your actual job, you can then use the JobContext to create a progress bar:

```java
public class MyService {

	public void doWork(JobContext jobContext) {
    	JobDashboardProgressBar progressBar = jobContext.progressBar(1000);
        
        for(int i = 0; i < 1000; i++) {
        	//do actual work
            progressBar.increaseByOne();
            // or you can also use
            progressBar.setValue(i);
        }
    }
}
```
