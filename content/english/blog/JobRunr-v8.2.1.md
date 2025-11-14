---
title: "JobRunr & JobRunr Pro v8.2.1"
summary: "New Rate Limiter Dashboard, Automatic Cleanup, Enhanced Security, and Kotlin 2.2.20 Support."
feature_image: /blog/821.webp
images:
- /blog/821.webp
date: 2025-11-10T00:00:00+01:00
author: "Nicholas D'hondt"
tags:
- blog
- meta
- release
---

<style type="text/css">
    .post-full-content img {display: inline-block; margin: 0 auto}
</style>

# Say hi to JobRunr v8.2.1 and JobRunr Pro v8.2.1

JobRunr v8.2.1 is all about **hardening the dashboard**, giving you **powerful new insight**s into your Pro features, and ensuring **compatibility** with the latest Java and Kotlin frameworks.

We're excited to introduce a brand-new **Rate Limiter Dashboard** for Pro users, an **automatic cleanup** feature for unused rate limiters, significant security hardening, and full support for **Kotlin 2.2.20** and **Quarkus 2.27**.

A special thanks to our contributors [@miettal](https://github.com/miettal) and [@michal-mm](https://github.com/michal-mm) for their help on this release!

Let’s look at what’s new.

## **What’s New in JobRunr 8.2.0**

### Kotlin 2.2.20 Support (and Kotlin 2.0 Dropped)

We're committed to supporting the Kotlin ecosystem. This release introduces full support for **Kotlin 2.2.20** bridge methods, which fixes a `JobMethodNotFoundException` (detailed in [issue #1381](https://github.com/jobrunr/jobrunr/pull/1381)) that users experienced after upgrading.

As part of this update, we are also dropping support for Kotlin 2.0. If you're a Kotlin developer, this is a great time to update your dependencies and take advantage of the latest fixes.

### Framework & Build Updates

To keep your stack modern and secure, we've added support for **Quarkus 2.27**. We have also upgraded our internal build process to **Gradle v9.1**.

### Metrics Configuration Update

A small but important cleanup: we are streamlining our metrics configuration. `JobRunrConfiguration#useMicroMeter` is now deprecated in favor of the more general `JobRunrConfiguration#useMetrics`.

<br/>

##  **New in JobRunr Pro 8.2.0**

###  Monitor Rate Limiters on the Dashboard

Observability for our Pro features is a top priority. Just like your Recurring Jobs, you can now visually monitor all your active rate limiters in one central place. The new **Rate Limiters** tab is always visible and provides at-a-glance insights into your configured limiters.

When you click on a specific rate limiter, you get a detailed view of its state, including:
* **Waiting:** The number of jobs currently waiting for the limiter.
* **Processing:** The number of jobs currently processing (or "locked").
* **Throughput:** See how many jobs have passed through the limiter in the last 1, 5, and 15 minutes.

{{< video src="/blog/rate-limiters.mov" autoplay="true" width="100%" muted="true" loop="true" controls="true" >}}

Forgot how to configure a rate-limiter? Find more info in our [documentation](/documentation/pro/rate-limiters/)!

### Automatic Cleanup for Unused Rate Limiters

This is a powerful "under-the-hood" improvement. Previously, if you defined a rate limiter in your `application.properties` (or via the fluent API) and later renamed or removed it, the old definition would remain in the database as an "orphan." This orphan would uselessly poll the database forever, checking for jobs that would never come.

**Starting with v8.2.0, JobRunr is now smart about this.**

When you define rate limiters in your configuration and restart your application, JobRunr will **automatically remove any old rate limiters** from the database that are no longer in your configuration. This keeps your database clean and reduces unnecessary load.

**Important Note for Upgrading:** On your first startup with v8.2.0, JobRunr will *not* delete any old limiters, just to be safe (since it can't know if they were created manually). We highly recommend you visit the new **Rate Limiters** dashboard and use the new "Delete" button to manually clean up any old, unused limiters. From that point on, JobRunr will manage them automatically.


### Improve workflow linking.
Stop getting lost in complex job chains. You can now easily navigate both up (from child to parent) and down (from parent to child) in your workflows. It is also simple to explore which jobs are set to run on failure or on success. This new visibility makes it much faster to debug and understand your job chains.

{{< video src="/blog/workflow.mov" autoplay="true" width="100%" muted="true" loop="true" controls="true" >}}



### Important Pro Fixes

This release also includes key bugfixes for our Pro users:

* **Fixed `NullPointerException` in `JobContext#isLastRetry()`**: We've resolved a `NullPointerException` in the popular `isLastRetry()` feature we introduced in 8.1, making it more robust.
* **`CustomSchedule` API Fixed**: The `CustomSchedule` API (for creating your own recurring job schedules) was impacted by our recent Carbon-Aware changes. This is now fixed and working perfectly.
* **Tracing for Fluent API**: You can now enable and configure tracing directly on the `JobBuilder`, even when not using a framework.
* **Micronaut Fixes**: We've resolved issues with the embedded dashboard auth filters and connection providers in Micronaut.

---

### Heads-Up: Dashboard Security Hardening

To enhance security, we've hardened the dashboard's default settings. **Cross-origin (CORS) requests from a browser are now blocked by default.**

This is a security best practice, but it may require a configuration change if you are accessing the dashboard API from a different domain.

**For Open-Source Users:**
You will need to either proxy the dashboard web server or implement your own custom REST endpoints.

**For JobRunr Pro Users:**
We've made this easy. You can now configure a list of `allowed-origins` directly in your properties file.

#### Fluent API: 
```properties
.useDashboardIf(dashboardIsEnabled(args), usingStandardDashboardConfiguration()
      // ...
     .andAllowedOrigins("https://www.jobrunr.io")
)
````

#### Spring Boot & Micronaut
In your `application.properties` file:
```properties
jobrunr.dashboard.allowed-origins=https://www.jobrunr.io
````


#### Quarkus

In your `application.properties` file, remember to use the `quarkus.` prefix:

```properties
quarkus.jobrunr.dashboard.allowed-origins=https://www.jobrunr.io
```


#### Embedded dashboard

Micronaut and Quarkus provide properties for configuring CORS. The embedded dashboard and its REST endpoints are going to use the builtin CORS handler.




-----

## 🧪 **How to Upgrade**

Simply update your dependency version to `8.2.1` in Maven or Gradle\!

Full changelog available here:  
👉 [GitHub Release Notes 8.2.0](https://github.com/jobrunr/jobrunr/releases/tag/v8.2.0)
👉 [GitHub Release Notes 8.2.1](https://github.com/jobrunr/jobrunr/releases/tag/v8.2.1)


-----

## 🚀 **Ready to Simplify Your Background Jobs?**

JobRunr v8.2 makes your job processing more secure and more observable. With the new rate limiter dashboard, automatic cleanup, and important compatibility fixes, we're committed to providing the most reliable background job processing solution for all Java developers.

Ready to explore powerful Pro features like the new Rate Limiter Dashboard? [**Start your free JobRunr Pro trial today**](/try-jobrunr-pro/) and see for yourself how it can save you time\!

Have questions or feedback? Join the conversation in our [Reddit Community](https://www.reddit.com/r/JobRunr/) or on our [GitHub Discussions](https://github.com/jobrunr/jobrunr/discussions) page.

Let’s keep building. 💪