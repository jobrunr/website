---
title: "JobRunr & JobRunr Pro v8.1.0"
summary: "Async Jobs for Quarkus & Micronaut, Embedded Dashboards, bugfixes, and JDK 25 Support."
feature_image: /blog/JobRunr810.webp
images:
- /blog/JobRunr810.webp
date: 2025-09-22T09:00:00+02:00
author: "Nicholas D'hondt"
tags:
  - blog
  - meta
draft:
  -true
---

<style type="text/css">
    .post-full-content img {display: inline-block; margin: 0 auto}
</style>

# Say hi to JobRunr v8.1.0 and JobRunr Pro v8.1.0

Just a couple of months after our [major v8 release](/en/blog/v8-release/), we are back with v8.1. This release is all about expanding our powerful features to more frameworks and improving the developer experience.

We are bringing the highly-requested `@AsyncJob` annotation to Quarkus and Micronaut developers. We are also introducing embedded dashboards for Pro Enterprise users and adding full support for JDK 25.

Let’s look at what’s new.

## **What’s New in JobRunr 8.1.0**

### @AsyncJob for Quarkus and Micronaut

Spring developers have enjoyed the simplicity of [`@AsyncJob`](/en/guides/migration/v8/#asyncjob-to-reduce-boilerplate) since v8.0. Now, developers using Quarkus and Micronaut can also turn a method call directly into a background job with a single annotation. This feature significantly reduces boilerplate code and makes enqueuing jobs more intuitive. You can find more information about [`@AsyncJob` here](/en/guides/migration/v8/#asyncjob-to-reduce-boilerplate)

{{< codeblock >}}
```java
@Test
public void testAsyncJob() {
    asyncJobTestService.testMethodAsAsyncJob();
    await().atMost(30, TimeUnit.SECONDS).until(() -> storageProvider.countJobs(StateName.SUCCEEDED) == 1);
}

@Singleton
@AsyncJob
public static class AsyncJobTestService {

    @Job(name = "my async spring job")
    public void testMethodAsAsyncJob() {
        LOGGER.info("Running AsyncJobService.testMethodAsAsyncJob in a job");
    }
}
```
{{</ codeblock >}}

###  Official Support for JDK 25

We are committed to keeping you on the cutting edge of the Java ecosystem. While JobRunr v8.0 was already compatible with JDK 25, this release makes it official. We have run a full set of tests to ensure there are no issues at all. You can confidently use the newest features and performance optimizations from JDK 25 in your background jobs.

### Access Retry Count in JobContext

You can now access the current retry count of a job directly from the JobContext. This allows for more advanced logic within your jobs, like altering behavior after a certain number of failed attempts.


{{< codeblock >}}
```java
int currentRetry = jobContext.currentRetry();
```
{{</ codeblock >}}


<br/>


## 💼 **New in JobRunr Pro 8.1.0**

### Embedded Dashboards for Quarkus and Micronaut (And Spring Boot)

This is a big one for our [Pro Enterprise](/en/pro) users. The embedded dashboard, a popular feature already available in [Spring Boot](/en/documentation/pro/jobrunr-pro-dashboard/#embed-the-dashboard-within-spring-application-server), has now been extended to Quarkus and Micronaut. This eliminates the need to run the dashboard as a separate web server on a different port. It simplifies your architecture, streamlines deployment, and makes monitoring your jobs more seamless than ever.

Enabling it is straightforward. You just need to add the correct property to your configuration file:

#### Spring Boot
In your application.properties file:

{{< codeblock >}}
```java
jobrunr.dashboard.type=embedded
```
{{</ codeblock >}}

#### Quarkus
In your application.properties file, remember to use the quarkus. prefix:


{{< codeblock >}}
```java
quarkus.jobrunr.dashboard.type=embedded
```
{{</ codeblock >}}

#### Micronaut
In your application.yml file:


{{< codeblock >}}
```java
jobrunr:
  dashboard:
    type: embedded
```
{{</ codeblock >}}

Or, if you prefer using a .properties file:

Properties
{{< codeblock >}}
```java
# Enable the embedded dashboard
jobrunr.dashboard.type=embedded

# (Optional) Set a custom URL path for the dashboard
jobrunr.dashboard.context-path=/jobrunr
```
{{</ codeblock >}}

### Dashboard UI and Performance Improvements

We have added extra columns to the tables in the JobRunr Pro Dashboard, giving you more at-a-glance information about your jobs. We also improved the upsert logic for Oracle databases, enhancing performance and reliability for our enterprise users.

{{< video src="/blog/JR810Dasboard.mp4" autoplay="true" width="100%" muted="true" loop="true" controls="true" >}}

### Know When It's the Final Retry Attempt
In addition to getting the retry count, JobRunr Pro now lets you easily check if a job is on its final attempt. The new `jobContext.isLastRetry()` method returns a boolean, simplifying your code for handling final failure scenarios. This is perfect for tasks like sending an alert to an administrator, moving a failed item to a dead-letter queue, or triggering a final cleanup process only after all standard retries have been exhausted. 

{{< codeblock >}}
```java
if (jobContext.isLastRetry()) {
    System.err.println("Final attempt failed for customer " + customerId + ". Moving to manual review queue.");
    moveToManualReview(customerId);
}
```
{{</ codeblock >}}


---


### ⚠️ Heads-Up for Quarkus Developers

This release includes minor name changes to a few configuration properties in our Quarkus integration to improve consistency. If you are a Quarkus user, please review the property changes to ensure a smooth upgrade.

Here is a summary of what has changed:

* **Carbon-Aware Property Prefix:** The configuration prefix for carbon-aware job processing has been corrected.
    * **Old Prefix:** `quarkus.jobrunr.background-job-server.carbon-aware-job-processing-configuration`
    * **New Prefix:** `quarkus.jobrunr.background-job-server.carbon-aware-job-processing`
* **Carbon-Aware Timeout Properties:** The timeout properties now require a time unit (e.g., `ms`, `s`). For example, `api-client-connect-timeout=500` should now be `api-client-connect-timeout=500ms`.
* **Job Request Size Properties:** The word `job` has been changed to its plural form `jobs`.
    * `...succeeded-job-request-size` is now `...succeeded-jobs-request-size`.
    * `...awaiting-job-request-size` is now `...awaiting-jobs-request-size`.

---

## 🧪 **How to Upgrade**

Simply update your dependency version to `8.1.0` in Maven or Gradle!

Full changelog available here:  
👉 [GitHub Release Notes](https://github.com/jobrunr/jobrunr/releases/tag/v8.1.0)

---

## 🚀 **Ready to Simplify Your Background Jobs?**

JobRunr v8.1 makes background job processing more powerful and developer-friendly, especially for the Quarkus and Micronaut communities. With embedded dashboards and support for the latest JDK, we are committed to providing a modern, reliable, and efficient solution for all Java developers.

Ready to explore powerful Pro features like the embedded dashboard? [**Start your free JobRunr Pro trial today**](/en/try-jobrunr-pro/) and see for yourself how it can save you time!

Have questions or feedback? Join the conversation in our [Reddit Community](https://www.reddit.com/r/JobRunr/) or on our [GitHub Discussions](https://github.com/jobrunr/jobrunr/discussions) page.

Let’s keep building. 💪