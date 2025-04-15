---
title: "JobRunr & JobRunr Pro v7.5.0"
summary: "New release brings Quarkus 3.20 and Micronaut 4.8 support, smarter config validation, and CockroachDB integration!"
feature_image: /blog/750.webp
images:
- /blog/750.webp
date: 2025-04-15T09:00:00+02:00
author: "Nicholas D'hondt"
tags:
  - blog
  - meta
---
<div style="text-align: center;margin: -2em 0 2em;">
<small style="font-size: 70%;">Image based on <a href='https://www.freepik.com/vectors/cartoon-astronaut'>cartoon astronaut vector created by catalyststuff - www.freepik.com</a></small>
</div>

<style type="text/css">
    .post-full-content img {display: inline-block; margin: 0 auto}
</style>

# 🚀 Introducing JobRunr v7.5.0 and JobRunr Pro v7.5.0

Frameworks evolve—and so does JobRunr.  

Whether you're modernizing your stack with **Quarkus 3.20** or **Micronaut 4.8**, looking to catch misconfigurations early, or expanding with **CockroachDB**, this release is all about supporting the tools and environments our community actually uses.

Let’s walk through what’s new!

## 🌟 **What’s New in JobRunr 7.5.0**

### ✅ Framework Compatibility Updates

- Official support for **Quarkus 3.20 (LTS)**
- Full support for **Micronaut 4.8**

Modern Java frameworks move fast—and JobRunr keeps pace. We want to make sure you can safely upgrade your tech stack.

### 🧠 Improved Misconfiguration Detection

Catching mistakes earlier saves time and prevents production issues. JobRunr now warns you if a there is a mismatch between `JobRequest` and `JobRequestHandler`.

No more silent failures or confusing runtime errors—just clearer, earlier feedback.

### ⚙️ Property-Based InMemoryStorage Configuration

Using JobRunr for testing or local development? You can now configure the in-memory storage directly with a simple property:

{{< codeblock >}}
```properties
jobrunr.database.type=mem
```
{{</ codeblock >}}

No need to manually define a storage bean anymore. This works in **Spring**, **Quarkus**, and **Micronaut** environments.

### ⚠️ Heads-Up: No More Silent Storage Fallbacks

> In Quarkus and Micronaut: If no `StorageProvider` is configured, **JobRunr will no longer automatically fall back to in-memory**.

This change removes unexpected behaviors in production environments. If you want to continue using in-memory storage, you’ll need to **explicitly set it via config or a bean.**

---

## 💼 **New in JobRunr Pro 7.5.0**

### 🪳 CockroachDB Support with CockroachStorageProvider

You can now use **CockroachDB** as your underlying storage engine with the new `CockroachStorageProvider`—available in JobRunr Pro.

Why CockroachDB?

- Strong consistency with distributed SQL
- Horizontally scalable
- Ideal for cloud-native, multi-region architectures

If you're building resilient, scalable systems, this new provider fits right in.

CockroachDB is our newest addition—but it’s far from the only one.
JobRunr now supports more than **10 StorageProviders**.
👉 [Check out the full overview here.](documentation/installation/storage/)

### 🧹 Pro-Only Fixes and Enhancements

- Fix for `BatchJob` creation using `JobBuilder`

---

## 🛠️ **Bug Fixes and Improvements Across the Board**

- Fixed `IndexOutOfBoundsException` in job processing scenarios
- Cleaned up datasource creation in storage provider tests
- Updated dependency versions for stability and security
- Improved internal build pipelines
- Architecture test improvements to enforce clean code standards
- Migrated E2E UI tests from Cypress to Playwright for speed and reliability

---

## 💡 **Thank You to Our Contributors**

A special shoutout to [@xuhuisheng](https://github.com/xuhuisheng) for their first contribution—adding the ability to configure the InMemoryStorageProvider via properties! 👏  
We’re proud of our growing community of developers who make JobRunr better with every release.

---

## 🧪 **How to Upgrade**

Simply update your dependency version to `7.5.0` in Maven or Gradle!

Full changelog available here:  
👉 [GitHub Release Notes](https://github.com/jobrunr/jobrunr/releases/tag/v7.5.0)

---

## 🚀 **Ready to Upgrade?**

JobRunr v7.5.0 brings you better framework support, smarter error prevention, and broader database compatibility.

Whether you're a solo dev or running an enterprise-grade system, this release makes your background jobs more reliable and your development experience more seamless.

Have feedback, questions, or want to share how you're using JobRunr? Join the conversation in the [JobRunr Community](https://github.com/jobrunr/jobrunr/discussions)!

Let’s keep building. 💪
