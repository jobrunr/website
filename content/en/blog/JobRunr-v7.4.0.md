---
title: "JobRunr & JobRunr Pro v7.4.0"
summary: "New release packed with enhancements, compatibility updates, and bug fixes!"
feature_image: /blog/JobRunr740.webp
date: 2025-01-17T09:00:00+02:00
author: "Nicholas D'hondt"
tags:
  - blog
  - meta
---
{{< trial-button >}}

<div style="text-align: center;margin: -2em 0 2em;">
<small style="font-size: 70%;"><a href='https://www.freepik.com/vectors/cartoon-astronaut'></a></small>
</div>

<style type="text/css">
    .post-full-content img {display: inline-block; margin: 0 auto}
</style>

# Introducing JobRunr v7.4.0 and JobRunr Pro v7.4.0

We’re excited to share that JobRunr v7.4.0 and JobRunr Pro v7.4.0 are now available! 
These new versions are built to make your Java background job scheduling even smoother and more efficient.

## 🌟 **Notable Highlights**


**Compatibility updates**

- **Support for JDK 24:** Future-proof your applications with support for the latest Java version.
- **Spring Boot 3.4 Compatibility:** Enjoy seamless integration with the newest Spring Boot framework, ensuring smoother workflows.
- **Kotlin 2.1 Support:** Stay current with the latest Kotlin improvements, enhancing productivity and sustainability.
- **Dropped Kotlin 1.8 Support:** Focus on cutting-edge features by retiring older dependencies.
- **Elasticsearch Java API Client v8.15+ Required:** If you’re using ElasticStorageProvider, upgrade to the latest Elasticsearch client to access new API features.

⚠️ We needed to cleanup SQL migration files. This change is mostly inconsequential but **if your migrations are managed by tools like Flyway, you may need to intervene** and manually update the checksum of the changed files.

## 🛠 **Enhancements**

JobRunr v7.4.0 and JobRunr Pro v7.4.0 deliver multiple improvements to optimize your job scheduling and monitoring processes:

- **JDK 24 Support** https://github.com/jobrunr/jobrunr/pull/1171
- Wait until Spring Boot is ready before starting the `BackgroundJobServer`. [PR #1183](https://github.com/jobrunr/jobrunr/pull/1183)
- **Enhanced Logging with jobSignature in MDC** (thanks @mhdatie). [PR #1159](https://github.com/jobrunr/jobrunr/pull/1159)
- **Consistent SQL Syntax Enforcement** [PR #1163](https://github.com/jobrunr/jobrunr/pull/1163) and [PR #1165](https://github.com/jobrunr/jobrunr/pull/1165)

## 🐞 **Bug Fixes**

We’ve resolved several critical issues to improve reliability:

- Skip collection validation if configured for MongoDB. [PR #1173](https://github.com/jobrunr/jobrunr/pull/1173) (fixes [#1172](https://github.com/jobrunr/jobrunr/issues/1172))

## 🛠 **JobRunr Pro-Only Enhancements and Fixes**

JobRunr Pro v7.4.0 includes exclusive updates and fixes, ensuring reliability and precision for enterprise-grade job processing:

- **Legacy Spring Compatibility**: Allow `JobRunrAutoConfiguration` to work for Spring 2.6 and lower. [PR #489](https://github.com/jobrunr/jobrunr-pro/pull/489)
- **Recurring Jobs Accuracy**: Fixed handling of recurring jobs running less than once per minute. [PR #478](https://github.com/jobrunr/jobrunr-pro/pull/478)
- **OSS-to-Pro Migration Improvements**: Resolved null constraint violations in `RecurringJobTable` during migration. [PR #490](https://github.com/jobrunr/jobrunr-pro/pull/490)
- **Server Pause Handling**: Ensured that jobs don't remain stuck in `SCHEDULED` state when servers are paused. [PR #481](https://github.com/jobrunr/jobrunr-pro/pull/481)

## 🔧 **How to Update**

Updating to JobRunr v7.4.0 or JobRunr Pro v7.4.0 is straightforward! Just update your dependency to 7.4.0 and you are good to go. You can find more info in our our [documentation](https://www.jobrunr.io/en/documentation/installation/).

## 💡 **Thank You to Our Contributors!**

A big thank-you to all the incredible contributors who made this release possible. Your efforts continue to drive JobRunr’s growth and success.

## 🚀 **Ready to Experience the Upgrade?**

Elevate your job processing with JobRunr v7.4.0! Take advantage of the latest features, compatibility updates, and enhancements for a seamless development experience.

Have feedback or questions? Share your thoughts with us in the [JobRunr Community](https://github.com/jobrunr/jobrunr/discussions).

Stay tuned for more updates, and don’t forget to share your feedback with us!
