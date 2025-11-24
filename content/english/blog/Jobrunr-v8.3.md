---
title: "JobRunr v8.3 ❤️ Spring Boot"
description: "We're proud to announce support for Spring Boot 4 and Jackson 3"
image: "/blog/jr-v-830.webp"
date: 2025-11-24T12:24:16+02:00
author: "Ronald Dehuysser"
tags:
  - blog
  - release
  - spring boot
  - spring
---

We are excited to announce the release of **JobRunr v8.3.0** (JobRunr Pro v8.3.0 will follow soon). This update adds support for Spring Boot 4 and Jackson 3 while still being compatible with Spring Boot 3 and Jackson 2.

## New Features
* **Spring Boot 4 & Jackson 3 Support**: We added support for the latest standards by means of a Multi-Release JAR (more info on this below) [PR #1415](https://github.com/jobrunr/jobrunr/pull/1415).
* **Revamped Dashboard Experience**: The dashboard has received a major upgrade. [PR #1420](https://github.com/jobrunr/jobrunr/pull/1420)

  * Dark Mode: Save your eyes (and battery) with our sleek new Dark Mode.

  * Control Center: A new settings hub allows you to easily select and manage your display preferences.

  * Responsive Design: We have improved the dashboard UI for smaller screens, making it easier than ever to monitor your jobs on the go.

<iframe width="100%" height="315" src="https://www.youtube.com/embed/uu0lpbxv8zg?si=eayi2073Ih-Ib8IS&autoplay=1&mute=1" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## Enhancements
* **Error Prone Integration**: We have enabled Error Prone to help catch programming mistakes earlier [PR 1439](https://github.com/jobrunr/jobrunr/pull/1439)


### Multi-Release Jar
This is the first version of JobRunr published as a Multi-Release JAR. This allows us to support Jackson 2 on Java 8 while seamlessly switching to Jackson 3 if you are running on Java 17 or later.

In a later phase, we also want to add support for the Java Class File API released in Java 24. This would allow us to drop the dependency on [ASM](https://asm.ow2.io/) entirely.


> **A Note on this Release Strategy**
><br/><br/>
>Because the move to a Multi-Release JAR is a significant architectural step, we are releasing v8.3.0 to our open-source community first. We have tested this extensively internally, but we know the open-source ecosystem covers a vast array of environments and edge cases.
><br/><br/>
>By releasing to the community now, we can gather real-world feedback and ensure the stability of this new architecture for the entire JobRunr ecosystem before rolling it out to Enterprise environments.

**Thank You to Our Contributors!**
A big shoutout to all the amazing contributors who helped make this release possible. We appreciate your efforts in helping JobRunr grow!


### **How to Upgrade**

Simply update your dependency version to `8.3` in Maven or Gradle and take your job processing to the next level!

Stay tuned for more updates, and don’t forget to share your feedback with us!


Full changelog available here:  
👉 [GitHub Release Notes 8.3.0](https://github.com/jobrunr/jobrunr/releases/tag/v8.3.0)
