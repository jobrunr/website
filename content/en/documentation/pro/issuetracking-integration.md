---
version: "pro"
title: "Issue Tracking Integration"
subtitle: "JobRunr Pro integrates with your existing issue tracking software so your developer can save time and do what they do best"
date: 2020-08-27T11:12:23+02:00
layout: "documentation"
menu: 
  main: 
    identifier: issue-tracking
    parent: 'jobrunr-pro'
    weight: 60
---
{{< trial-button >}}

Some jobs may fail due to downtime of an external system, some unforeseen circumstances or perhaps due to a bug.

JobRunr Pro integrates with GitHub issues and Jira so you can easily create an issue in case of a job failure. It will prefill all fields so you can save time and do what you do best: create excelling software without bugs 😊.


<figure>
<img src="/documentation/jobrunr-pro-issue-tracking-integration.png" class="kg-image">
<figcaption>Create an issue for failed jobs with 1 click in your issue tracking software.</figcaption>
</figure>


## Configuration
You can easily enable the issue tracking integration in Spring Boot, Micronaut and Quarkus using your existing configuration:

### GitHub
<figure>

```
org.jobrunr.dashboard.integrations.issue-tracking.github.organization=jobrunr
org.jobrunr.dashboard.integrations.issue-tracking.github.repo=jobrunr
org.jobrunr.dashboard.integrations.issue-tracking.github.labels=bug
org.jobrunr.dashboard.integrations.issue-tracking.github.assignees=me-myself-and-i
```
<figcaption>This configuration shows how to integrate JobRunr with GitHub.</figcaption>
</figure>

### Jira
<figure>

```
org.jobrunr.dashboard.integrations.issue-tracking.jira.root-url=https://[your-jira-instance].atlassian.net/
org.jobrunr.dashboard.integrations.issue-tracking.jira.project-id=10001
org.jobrunr.dashboard.integrations.issue-tracking.jira.issue-type=10007
```
<figcaption>This configuration shows how to integrate JobRunr with Jira.</figcaption>
</figure>


> Is your issue tracking software not included? [Contact us](/en/contact) and we'll see what we can work out.

{{< trial-button >}}