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
    weight: 26
---
{{< trial-button >}}

A `Job Filter` can be used to extend the functionality of JobRunr with extra business processes when a job succeeds or fails. They also exist in the free version but in the Pro version integration is a lot easier as any Spring / Micronaut / Quarkus Bean can become a `Job Filter`.


## Usage
To create a Job Filter, just implement a bean with the interface `JobClientFilter` or `JobServerFilter`.
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

    void onProcessed(Job job) {
        if("Monthly Stripe Report".equals(job.getJobName())) {
            if(job.hasState(SUCCEEDED)) {
                slackNotificationService.sendNotification("#accounting-team", "Monthly Stripe Report is generated.");
            } else if(job.hasState(FAILED)) {
                Optional<FailedState> lastJobStateOfType = job.getLastJobStateOfType(FailedState.class);
                String exceptionMessage = lastJobStateOfType.map(s -> s.getException().getMessage()).orElse("Unknown exception");
                slackNotificationService.sendNotification("#support-team", "Error generating Monthly Stripe Report." + exceptionMessage);
            }
        }
    }
}
```

<br>
{{< trial-button >}}