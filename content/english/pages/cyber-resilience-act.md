---
title: "JobRunr and the EU Cyber Resilience Act"
meta_title: "JobRunr and the EU Cyber Resilience Act | Due Diligence"
description: "Is JobRunr CRA compliant? JobRunr BV is an open-source steward for JobRunr OSS and a manufacturer for JobRunr Pro under Regulation (EU) 2024/2847. Here is our scoping, our disclosure policy, our supported versions and what we provide for your due diligence file."
keywords: ["is jobrunr cra compliant", "jobrunr cyber resilience act", "jobrunr sbom", "jobrunr security policy", "jobrunr vulnerability disclosure", "jobrunr dora", "cra component due diligence"]
draft: true
#
# ---------------------------------------------------------------------------
# INTERNAL NOTE (YAML comments, never rendered).
#
# SBOM and support-window copy corrected 2026-08-12 per Nicholas: JobRunr Pro
# ships an SBOM with every release. JobRunr OSS remains latest-only and has no
# SBOM on Maven Central (verified against 8.8.1). The page states that split
# openly.
#
# Support-window policy decided 2026-08-18 per Nicholas: SECURITY.md keeps the
# Pro table as is (LATEST + 7.5.x) and gains a note that a Pro customer who
# cannot upgrade to a supported version can contact JobRunr Support for a
# backported security fix. This page is worded to match that.
#
# TWO THINGS TO CLOSE BEFORE draft: false
#
#   1. Push the updated SECURITY.md to github.com/jobrunr/jobrunr (draft
#      agreed 2026-08-18) so the linked policy matches this page.
#
#   2. ART. 14 REPORTING PATH unverified. The "Reporting" section says the
#      filing path is part of our readiness work. Confirm ENISA Single Reporting
#      Platform access and a named owner before 11 September 2026, or soften
#      that sentence.
# ---------------------------------------------------------------------------
---

_Last reviewed: 18 August 2026_

## Is JobRunr affected by the Cyber Resilience Act?

Yes, and we have already done the scoping. JobRunr BV holds two roles under Regulation (EU) 2024/2847, one for each edition of the Java background job framework:

- **For JobRunr OSS, we are an open-source software steward.** JobRunr BV provides sustained support for the development of the free edition, which is the definition in Article 3(14). Stewards fall under the lighter regime of Article 24: no CE marking and no administrative fines, but a documented security policy, cooperation with market surveillance authorities and the Article 14 reporting obligations still apply, and we meet them.
- **For JobRunr Pro, we are a manufacturer.** Pro is monetized, and monetization is what makes a project commercial activity under the regulation (Recitals 15 and 18). That puts the full manufacturer obligations of Article 13 and Annex I on us for the Pro edition.

Either way we are not a bystander: whichever edition you run, JobRunr BV is the party answering for it.


## Where the boundary sits, honestly

If you ship a product with JobRunr inside it, you are the manufacturer of that product. We cannot absorb that, and any vendor claiming otherwise is describing something the regulation does not allow. Article 13(5) puts due diligence on the components you integrate squarely on you.

What we can do is make our row in your file a solved problem. Under Article 13(5) **you have to show that every third-party component in your build is maintained, has a disclosure route, and has a known support position.** That is the work we have done on our side so you do not have to chase us for it.

## The five questions, answered

These are the questions your procurement team should be sending to every component vendor. Here are our answers.

| Question | JobRunr |
| :--- | :--- |
| Do you publish a machine-readable SBOM per release? | Yes for JobRunr Pro. Every Pro release ships with an SBOM you can fold straight into your own bill of materials |
| Do you have a coordinated vulnerability disclosure policy and a monitored contact? | Yes. Our [security policy](https://github.com/jobrunr/jobrunr/security/policy) is published, reports go to hello@jobrunr.io, and we answer within **one business day** and keep you updated through to resolution |
| What is the support window for the version you are on? | For Pro, the supported versions listed in our [security policy](https://github.com/jobrunr/jobrunr/security/policy). If you cannot upgrade to one of them, contact JobRunr Support and we provide a backported security fix. We do not force an upgrade to get a security fix |
| Are security fixes free and separate from feature releases? | Yes. Security fixes are free for Pro and are shipped as security releases rather than bundled into the next feature release, backported on request to the version you are on |
| Who is the manufacturer of record for this component? | JobRunr BV: manufacturer for JobRunr Pro, open-source software steward for JobRunr OSS.|

## What we already have in place

**An SBOM with every JobRunr Pro release.** You do not have to reverse engineer our dependency tree or take our word for what is in the jar. Every Pro release ships a machine-readable bill of materials that drops into yours.

**A support window that does not force a migration.** For JobRunr Pro we ship security fixes for the supported versions listed in our [security policy](https://github.com/jobrunr/jobrunr/security/policy). If your team cannot upgrade to a supported version, contact JobRunr Support and we provide a backported security fix for the version you are on. That matters more than a number of years: the point of Article 13(8) is that you can take a security fix without being forced into a migration, and that is exactly how we operate.

**A real disclosure route with a stated response time.** Report a vulnerability to hello@jobrunr.io and you get an answer within one business day, with updates as we investigate. The policy is public on [GitHub](https://github.com/jobrunr/jobrunr/security/policy), so you can cite it rather than take our word for it.

**Annual penetration testing.** JobRunr is subjected to white hat penetration testing every year, which is the kind of evidence that satisfies the secure development questions in Annex I Part I.

**A development lifecycle built for this.** Secure development practices are part of how JobRunr Pro is built, and they were in place before the CRA required them.

**No new data surface for you to explain.** JobRunr is a library that runs inside your own JVM. It needs no internet access to work and sends no data to external services. For a due diligence reviewer, that removes an entire category of questions about sub-processors, data residency and third-party transfer.

**A DORA agreement for financial services.** JobRunr Pro Enterprise includes a Digital Operational Resilience Act agreement and vendor due diligence packs. If DORA is your actual obligation rather than the CRA, start on the [finance page](/en/finance/).

## Open source and Pro, stated plainly

The SBOM and the backported security fixes above are part of JobRunr Pro. JobRunr OSS receives security updates on the latest version, which is the normal open source position and is published in the same policy.

That distinction matters for one specific reader. If you ship JobRunr inside a product you sell, Article 13(5) puts component due diligence on you, and Pro is the edition that hands you the artifacts to discharge it: the SBOM, the backports, the support window, and a named manufacturer of record. If JobRunr only runs internally, none of that is a CRA obligation for you at all, and we would rather say so than sell you something you do not need.

If anything here is blocking a due diligence exchange right now, email hello@jobrunr.io and we will answer with specifics.

## Reporting, from 11 September 2026

From 11 September 2026, Article 14 requires manufacturers to send an early warning about an actively exploited vulnerability within 24 hours and a notification within 72 hours, through ENISA's Single Reporting Platform. That obligation applies to products already on the market, which includes every JobRunr version in the field.

Our disclosure route already runs on a one business day answer, and the Article 14 filing path is part of our own readiness work for that date. If you find something in JobRunr, hello@jobrunr.io is the address, and speed on our side is the point.

## What this looks like on your side

If you are filling in a CRA or DORA questionnaire and JobRunr is in your build, you can attach this page, cite the [security policy](https://github.com/jobrunr/jobrunr/security/policy), and name JobRunr BV as the manufacturer of record. For the wider question of whether the CRA even applies to what you are building, our [Cyber Resilience Act guide for Java teams](/en/blog/cyber-resilience-act-java/) has the scope decision tree and the deadlines.

This page is an engineering and procurement reference, not legal advice. Every claim carries its article or recital so your counsel can check it against [the regulation](https://eur-lex.europa.eu/eli/reg/2024/2847/oj/eng).
