---
version: "business"
title: "Server Tags"
subtitle: "Server Tags allow you to filter jobs by certain tags so that they are only run on specific servers."
date: 2020-08-27T11:12:23+02:00
layout: "documentation"
menu: 
  main: 
    identifier: server-tags
    parent: 'jobrunr-pro'
    weight: 20
---
{{< trial-button >}}

Do you have some jobs that can only be run on certain servers (e.g. jobs tied to a specific OS like Linux, Max and Windows)? Or do you want to run a job only on the server that created the job? JobRunr has you covered with Server Tags!

A `BackgroundJobServer` can have multiple server tags and a job can specify only one server tag via the Job annotation. If the server tag of the job matches any of the server tags of the server, the server is eligible to run the job.

> Each `BackgroundJobServer` and each `Job` is by default tagged with the `DEFAULT` tag - this makes sure that if you do not specify a tag on the `Job`, it gets executed anyway.

## Usage via `@Job` annotation
Using server tags is as easy as using Queues, again thanks to the `Job` annotation. Just add it to your service method and specify on which server your background job should run.
<figure>

```java
@Job(runOnServerWithTag =  LINUX)
public void doWorkOnLinuxServers() {
    System.out.println("This will only run on a server tagged with LINUX");
}
```
</figure>

## Usage via `JobBuilder` pattern
When you are using the `JobBuilder` pattern, you can pass the serverTag via the `JobBuilder`.
<figure>

```java
jobScheduler.create(aJob()
        .withServerTag(LINUX)
        .withDetails(() -> System.out.println("This will only run on a server tagged with LINUX"));
```
</figure>
<br>

### Run job on the server that created the job
A special server tag is available to run a job on the server that created that same job. This comes in handy when you want to run a job that uses a resource (like a file, ...) that is only available on the server that created the job.

In that case, you can use the following:
<figure>

```java
@Job(runOnServerWithTag =  "%CURRENT_SERVER")
public void doWorkOnCurrentServers() {
    System.out.println("This will only run on the same server as where the job was enqueued or scheduled.");
}
```
</figure>
<br>

## Configuration
Configuration is easy, both in the fluent api and using Spring configuration:

### Fluent Api
Using the fluent API, pass all the server tags as Strings (or string constants) to the `BackgroundJobServerConfiguration`.

<figure>

```java
JobRunrPro
    .configure()
    .useBackgroundJobServer(usingStandardBackgroundJobServerConfiguration().andTags(LINUX, MACOS))
    ...
```
<figcaption>When configuring server tags, specify all the server tags for that server.</figcaption>
</figure>

### Spring configuration
For the Spring configuration, you can use the `org.jobrunr.background-job-server.tags` property to set the different server tags.

{{< trial-button >}}