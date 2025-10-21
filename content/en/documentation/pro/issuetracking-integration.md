---
version: "pro"
title: "Issue Tracking Integration"
subtitle: "JobRunr Pro integrates with your existing issue tracking software so your developer can save time and do what they do best"
keywords: ["issue tracking", "issue tracking software", "github issues", "jira issues", "job failure", "issue tracking system", "jira issue tracking", "best issue tracking software", "jira issue tracking system", "it issue tracking software", "github bug tracking", "jira bug tracking", "issue tracking in jira", "jira and github issues", "jira to github issues", "github issue time tracking"]
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

![](/documentation/jobrunr-pro-issue-tracking-integration.png "Create an issue for failed jobs with 1 click in your issue tracking software.")

## Configuration
You can easily enable the issue tracking integration in Spring Boot, Micronaut and Quarkus using your existing configuration:

### GitHub
<figure>

```
jobrunr.dashboard.integrations.issue-tracking.github.organization=jobrunr
jobrunr.dashboard.integrations.issue-tracking.github.repo=jobrunr
jobrunr.dashboard.integrations.issue-tracking.github.labels=bug
jobrunr.dashboard.integrations.issue-tracking.github.assignees=me-myself-and-i
```
<figcaption>This configuration shows how to integrate JobRunr with GitHub.</figcaption>
</figure>

### Jira
<figure>

```
jobrunr.dashboard.integrations.issue-tracking.jira.root-url=https://[your-jira-instance].atlassian.net/
jobrunr.dashboard.integrations.issue-tracking.jira.project-id=10001
jobrunr.dashboard.integrations.issue-tracking.jira.issue-type=10007
```
<figcaption>This configuration shows how to integrate JobRunr with Jira.</figcaption>
</figure>


> Is your issue tracking software not included? [Contact us](/en/contact) and we'll see what we can work out.

{{< trial-button >}}