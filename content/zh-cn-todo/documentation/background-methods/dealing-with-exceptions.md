---
title: "Dealing with exceptions"
subtitle: "Bad things happen - but JobRunr has everything covered thanks to the RetryFilter!"
date: 2020-04-30T11:12:23+02:00
layout: "documentation"
menu: 
  main: 
    identifier: dealing-with-exceptions
    parent: 'background-methods'
    weight: 60
---
Bad things happen. Any method can throw different types of exceptions. These exceptions can be caused either by programming errors that require you to re-deploy the application, or transient errors, that can be fixed without additional deployment.

JobRunr handles all exceptions that occur both in internal (belonging to JobRunr itself), and external methods (jobs, filters and so on), so it will not bring down the whole application. All internal exceptions are logged (so, don’t forget to enable logging) and in the worst case, background processing of a job will be stopped after 10 retry attempts with increasing delay modifier.

When JobRunr encounters external exception that occured during the execution of the job, it will automatically try to change the state of the `Job` to `Failed`, and you always can find this job in the Dashbord UI (it will not expire unless you delete it explicitly).


<figure>
<img src="/documentation/failed-job.png" class="kg-image">
<figcaption>Detailed information why a job failed</figcaption>
</figure>

In the previous paragraph it is mentioned that JobRunr will __try__ to change the state of the `Job` to failed, because state transition is one of places where job filters can intercept and change the state transition. The `RetryFilter` class is one of them, that reschedules the failed job to be automatically retried after increasing delay.

This filter is applied globally to all methods and has 10 retry attempts by default. So, your methods will be retried in case of exception automatically, and you receive warning log messages on every failed attempt. If retry attempts exceeded their maximum, the job will stay in the Failed state (with an error log message), and you will be able to retry it manually.

### Configuration
You can off-course configure how many retries JobRunr will do by default.

<figure>

```java
JobRunr.configure()
    .withJobFilters(new RetryFilter(2))
    .useBackgroundJobServer(new BackgroundJobServer(...))
    ....
```
<figcaption>Jobs will only be retried 2 times instead of 10 times as the default RetryFilter is overriden.</figcaption>
</figure>

<figure>

```java
    @Job(name="Job Name", retries=2)
    public void doWorkWithCustomJobFilters() {
        System.out.println("I will only be retried two times ");
    }
```
<figcaption>The number of retries can also be configured per job by using the @Job annotation.</figcaption>
</figure>