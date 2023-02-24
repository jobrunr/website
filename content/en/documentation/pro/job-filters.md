---
version: "professional"
title: "Job Filters"
subtitle: "Extend JobRunr with extra business processes using Job Filter Beans"
date: 2020-08-27T11:12:23+02:00
layout: "documentation"
menu: 
  main: 
    identifier: job-filters
    parent: 'jobrunr-pro'
    weight: 27
---
{{< trial-button >}}

A `Job Filter` can be used to extend the functionality of JobRunr with extra business processes when a job succeeds or fails. They also exist in the free version but in the Pro version integration is a lot easier as any Spring / Micronaut / Quarkus Bean can become a `Job Filter`.


## Usage
To create a Job Filter, just implement a bean with the interface [`JobClientFilter`](https://www.javadoc.io/doc/org.jobrunr/jobrunr/latest/org/jobrunr/jobs/filters/JobClientFilter.html) or [`JobServerFilter`](https://www.javadoc.io/doc/org.jobrunr/jobrunr/latest/org/jobrunr/jobs/filters/JobServerFilter.html). Other filters are also available like the [`ApplyStateFilter`](https://www.javadoc.io/doc/org.jobrunr/jobrunr/latest/org/jobrunr/jobs/filters/ApplyStateFilter.html) and the [`ElectStateFilter`](https://www.javadoc.io/doc/org.jobrunr/jobrunr/latest/org/jobrunr/jobs/filters/ElectStateFilter.html).
<figure>

```java
@Component
public class NotifyJobCreatedFilter implements JobClientFilter, JobServerFilter {
    
    private SlackNotificationService slackNotificationService;

    public NotifyJobCreatedFilter(SlackNotificationService slackNotificationService) {
        this.slackNotificationService = slackNotificationService;
    }

    void onCreated(Job job) {
        if("Monthly Stripe Report".equals(job.getJobName())) {
            slackNotificationService.sendNotification("#accounting-team", "Monthly Stripe Report is being generated");
        }
    }

    void onProcessingSucceeded(Job job) {
        if("Monthly Stripe Report".equals(job.getJobName())) {
            slackNotificationService.sendNotification("#accounting-team", "Monthly Stripe Report is generated.");
        }
    }

    void onProcessingFailed(Job job, Exception e) {
        if("Monthly Stripe Report".equals(job.getJobName())) {
            // optional logging that the job failed. Not sending a notification as Job will still be retried
        }
    }

    void onFailedAfterRetries(Job job) {
        if("Monthly Stripe Report".equals(job.getJobName())) {
            Optional<FailedState> lastJobStateOfType = job.getLastJobStateOfType(FailedState.class);
            String exceptionMessage = lastJobStateOfType.map(s -> s.getException().getMessage()).orElse("Unknown exception");
            slackNotificationService.sendNotification("#support-team", "Error generating Monthly Stripe Report." + exceptionMessage);
        }
    }
}
```

<br>
{{< trial-button >}}