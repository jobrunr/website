---
title: "Cyber Resilience Act readiness checklist for Java teams"
meta_title: "Cyber Resilience Act Readiness Checklist for Java Teams | JobRunr"
description: "A ten-point CRA readiness checklist for Java teams: seven items if you place software on the EU market, three if you never do. Every item cites the article of Regulation (EU) 2024/2847 it comes from."
keywords: ["cyber resilience act checklist", "cra readiness checklist", "cra compliance checklist", "cyber resilience act requirements", "cra sbom requirements", "cyber resilience act java", "cra deadline"]
date: 2026-08-18
draft: true
---

_Last reviewed: 18 August 2026_

This checklist is part of our [Cyber Resilience Act guide for Java teams](/en/blog/cyber-resilience-act/), which explains who the regulation reaches, the key dates, and what the obligations look like in a Java build pipeline. If you haven't figured out your scope yet, start there. Every item below assumes you already know which side of the line you fall on.

Readiness depends entirely on where you land. The first list is for teams placing software on the EU market. The second is for everyone else, because being "out of scope" does not mean you have nothing to do.

## If you ship software commercially (you are a manufacturer)

1. **Write down your scope decision and who owns it.** Record which products you place on the EU market and identify the manufacturer of record for each. Everything else depends on this answer, and it is the first thing anyone will ask for.
2. **Generate a machine-readable SBOM on every release.** This must cover at minimum your top-level dependencies (Annex I Part II(1)). Use CycloneDX or SPDX, as these are the formats most downstream tools recognize. The SBOM doesn't have to be public, but it must be available to market surveillance authorities when they ask. 
3. **Publish a coordinated vulnerability disclosure policy.** You need a security contact, a person who actually checks the messages, and a documented triage path with clear response times.
4. **State a support period of at least five years per major version** (Art. 13(8)). You also need to confirm your CI can still build the oldest branch you promise to patch.
5. **Separate security updates from feature updates.** This lets a customer take a fix without being forced to adopt your next major release (Art. 13(8), Recital 60).
6. **Arrange ENISA Single Reporting Platform access.** Rehearse the 24-hour reporting path before you actually need it (Art. 14). Decide now who handles the filing at 11:00 PM on a Saturday.
7. **Collect due diligence evidence for every third-party component you ship** (Art. 13(5)). You need the SBOM, disclosure policy, support window, and one named owner for each component.

## Even if you never place a product on the EU market

8. **Answer the SBOM question anyway.** Procurement teams will ask because Article 13(5) makes it their job. A prepared answer is more useful than a correct argument about scope.
9. **Inventory the components in your build that have no CVE feed, no SBOM entry, and no maintainer outside your team.** This list is your actual risk register, whether the CRA applies or not.
10. **Check if NIS2 or DORA covers you instead.** For financial entities, DORA has been active since 17 January 2025. It reaches internal operational software, including the schedulers the CRA leaves alone.

## If you can only do three before 11 September

Focus on items one, three, and six: know which products are yours, give a researcher a way to report a finding, and know who files that report and how. The rest has until December 2027, and most of it is release automation you were going to build eventually anyway.

For item seven, if JobRunr is in your build, [what we provide under the Cyber Resilience Act](/en/cyber-resilience-act/) is ready to be attached to your due diligence file. We have split the details by open source and Pro edition.

This page is an engineering reference, not legal advice. Each item includes its article or recital so your counsel can check it against [the regulation](https://eur-lex.europa.eu/eli/reg/2024/2847/oj/eng).