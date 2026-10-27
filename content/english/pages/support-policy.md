---
title: "JobRunr support policy: supported versions, security fixes and end of life"
meta_title: "JobRunr Support Policy: Supported Versions and End of Life | JobRunr"
description: "Which JobRunr versions receive bug and security fixes, for how long, what end of life means for your team, and how Extended Support keeps an older JobRunr Pro version patched."
keywords: ["jobrunr supported versions", "jobrunr end of life", "jobrunr support policy", "jobrunr security fixes", "jobrunr extended support", "jobrunr eol", "jobrunr lts"]
date: 2026-10-27
draft: true
---

_Last reviewed: 27 October 2026. This policy applies from that date. JobRunr 9 is the current release line._

## The short version

- **JobRunr OSS** supports one major version: the current one. Bug fixes, security fixes and new features land on the latest release line of that major. The day a new major ships, the previous major is end of life.
- **JobRunr Pro** receives the same on the latest release line. The previous major stays in maintenance for twelve months after a new major ships: security fixes and critical bug fixes, backported, included in your subscription.
- **Extended Support** can be bought for JobRunr 6 and later, whether you run the open source edition or Pro. It keeps your major patched for as long as you need it, until five years after its first release or longer by agreement.
- Security fixes are released as patch versions, separate from feature releases. Taking a security fix never forces you into a feature upgrade.
- Upgrading JobRunr OSS is always free. Every major version has a [migration guide](/en/guides/migration/).

## The lifecycle of a JobRunr major version

JobRunr ships a new major version about once a year. Each major moves through the phases below. The dates for every version are in the table further down.

| Phase | What you get | JobRunr OSS | JobRunr Pro |
|---|---|---|---|
| **Active** | New features, bug fixes and security fixes, released as minor and patch versions on the latest release line | The current major | The current major |
| **Maintenance** | Security fixes and critical bug fixes, backported to the last minor of that major. No new features | Not available. Only the current major is supported | 12 months after the next major ships, included in the subscription |
| **Extended Support** | Security fixes and critical bug fixes, backported, plus upgrade assistance when you decide to move. Paid, per year, for JobRunr 6 and later | Available. The day a new major ships, this is the way to keep the previous major patched | Available after Maintenance ends. Until five years after the major's first release, or longer by agreement |
| **End of life** | No fixes of any kind. Dependency scanners will flag known vulnerabilities in these versions | The day the next major ships, unless you take Extended Support | 12 months after the next major ships, unless you take Extended Support |

Within a major version, only the **latest minor** receives fixes. If you run 8.5.x, the fix lands in 8.8.x; upgrading between minors of the same major is designed to be a version bump.

## Supported versions today

| Version | First release | Latest release | JobRunr OSS | JobRunr Pro |
|---|---|---|---|---|
| **9.x** | 30 Sep 2026 | 9.0.2 (Oct 2026) | Active | Active |
| **8.x** | 7 Jul 2025 | 8.8.2 (21 Aug 2026) | End of life, Extended Support available until Jul 2030 | Maintenance until 30 Sep 2027, Extended Support available until Jul 2030 |
| **7.x** | 9 Apr 2024 | 7.5.3 (23 Jun 2025) | End of life, Extended Support available until Apr 2029 | End of life, Extended Support available until Apr 2029 |
| **6.x** | 29 Jan 2023 | 6.3.5 (20 Feb 2024) | End of life, Extended Support available until Jan 2028 | End of life, Extended Support available until Jan 2028 |
| **5.x** | 30 Mar 2022 | 5.3.3 (4 Jan 2023) | End of life | End of life |
| **4.x and earlier** | | 4.0.10 (7 Mar 2022) | End of life | End of life |

Extended Support can be bought for JobRunr 6 and later, for either edition. JobRunr 5 and earlier cannot be patched any more: upgrade is the only route.

JobRunr 9 is the last open source major that runs on Java 8. If Java 8 is what keeps you on an older line, JobRunr Pro keeps Java 8 support beyond v9, so a Java upgrade and a JobRunr upgrade do not have to happen in the same project.

## What end of life means for you

An end-of-life version keeps working. Nothing in JobRunr stops or expires. What changes is that nobody is patching it:

- A vulnerability found in a newer version is not checked against, or fixed in, the end-of-life version.
- Security scanners such as Dependabot, Snyk, Sonatype and Aikido flag JobRunr versions with [published advisories](https://github.com/jobrunr/jobrunr/security/advisories). Your security team will see those findings, and "upgrade" is the only answer we can give.
- Newer Java, Spring Boot, Quarkus, Micronaut and database driver versions are not tested against it.

You have two ways out, and both are fine with us:

1. **Upgrade.** The [migration guides](/en/guides/migration/) cover every major version step by step: [Upgrade to v8](/en/guides/migration/v8/) and [Upgrade to v9](/en/guides/migration/v9/). Most applications only need the version bump and a review of the breaking changes. JobRunr Pro customers can ask JobRunr Support to plan the upgrade with them.
2. **Extended Support.** If a production system cannot move yet, because of a release freeze, a Java constraint or a modernisation that is already planned for later, Extended Support keeps your major patched until you are ready. It is available for JobRunr 6 and later, open source or Pro. [Contact us](/en/contact/) and tell us which version you run and why it has to stay.

## How to find your version

- The JobRunr dashboard shows the running version in the footer of every page ("Processed … jobs with ♥ using JobRunr 9.0.2").
- In your build file, look for the `org.jobrunr` dependency and its version: `jobrunr`, `jobrunr-pro` or one of the Spring Boot, Quarkus or Micronaut starters.

## Security fixes and advisories

Security fixes are free of charge for every supported version and ship as patch releases, separate from feature releases. When we release a security fix we publish, at the same time:

- a [GitHub Security Advisory](https://github.com/jobrunr/jobrunr/security/advisories) with a CVE identifier where applicable, listing the affected versions, the severity and the fixed version;
- the same information in the release notes of the fixed version;
- a direct email to the registered technical contacts of JobRunr Pro customers whose version is affected.

To report a vulnerability, email [hello@jobrunr.io](mailto:hello@jobrunr.io) or use GitHub's private vulnerability reporting on the JobRunr repository. Please do not open a public issue. We acknowledge every report within one business day. The full disclosure process is in our [security policy](https://github.com/jobrunr/jobrunr/security/policy).

## The EU Cyber Resilience Act

JobRunr BV is the manufacturer of JobRunr Pro and the open-source software steward of JobRunr OSS under Regulation (EU) 2024/2847. The support windows on this page are the support periods we declare for each edition. [What we provide for your due diligence file](/en/cyber-resilience-act/) covers the SBOM, the disclosure policy and the reporting path.

## Changes to this policy

For JobRunr OSS, the end of life of a major is the release date of the next major, which we announce with its release candidate. For JobRunr Pro, we announce the end of Maintenance or Extended Support for a release line at least six months in advance, on this page, in the release notes and by email to affected customers. Shortening a window that is already published never applies to versions you are running under a current subscription.
