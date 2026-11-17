---
title: "JobRunr Security Advisories"
meta_title: "JobRunr Security Advisories: CVEs, Affected Versions and Fixes | JobRunr"
description: "Every published security advisory for JobRunr and JobRunr Pro: severity, CVE identifier, affected versions and the release that fixes it. Plus which versions still receive security fixes and how to report a vulnerability."
keywords: ["jobrunr security advisories", "jobrunr cve", "jobrunr vulnerability", "jobrunr security fixes", "jobrunr supported versions", "jobrunr extended support", "report jobrunr vulnerability"]
date: 2026-11-17
# Stays draft until the first advisory is published on GitHub. Go-live order is in the advisory file.
draft: false

intro: "This page lists every published security advisory for JobRunr and JobRunr Pro, with the affected versions and the release that contains the fix."

extended_support:
  banner: "Running a JobRunr version that no longer gets security fixes? Extended Support keeps it patched."
  title: "Security fixes for the version you run today"
  text: "Security fixes land on the supported versions only. If your production system runs an older JobRunr version and cannot move yet, Extended Support gives you the same security fixes, backported to your version. It is available for JobRunr 6 and later, whether you run the open source edition or JobRunr Pro."
  points:
    - "Security fixes and critical bug fixes, backported to the major version you run"
    - "A direct email when an advisory affects your version, so you do not depend on a scanner to find out"
    - "Help from the people who build JobRunr when you decide to upgrade"
  button_label: "Ask about Extended Support"
  button_link: "/contact/"

reporting:
  title: "Reporting a vulnerability"
  text: "Email [hello@jobrunr.io](mailto:hello@jobrunr.io) or use [private vulnerability reporting](https://github.com/jobrunr/jobrunr/security/advisories/new) on the JobRunr GitHub repository. Please do not open a public issue. We answer within one business day and keep you updated until the fix is released. The full process is in our [security policy](https://github.com/jobrunr/jobrunr/security/policy)."

advisories_section:
  title: "Published advisories"
  empty: "No advisories have been published yet."

versions_section:
  title: "Which versions receive security fixes"
  text: "A security fix is free for every supported version and ships as a patch release, so taking a fix never forces a feature upgrade."
  rows:
    - edition: "JobRunr OSS"
      supported: "The latest release"
      older: "Upgrade for free, or take Extended Support (JobRunr 6 and later)"
    - edition: "JobRunr Pro"
      supported: "The latest release and 8.8.x"
      older: "Contact JobRunr Support for a backport, or take Extended Support (JobRunr 6 and later)"

follow_section:
  title: "Stay informed"
  items:
    - "Subscribe to the [RSS feed](index.xml) of this page."
    - "Watch [security advisories on GitHub](https://github.com/jobrunr/jobrunr/security/advisories). Dependabot, Snyk, Sonatype and Aikido pick up the same data."
    - "JobRunr Pro customers get an email on the registered technical contact when an advisory affects their version."
---
