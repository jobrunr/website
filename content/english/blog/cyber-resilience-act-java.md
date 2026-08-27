---
title: "Cyber Resilience Act for Java Teams: Scope, Deadlines and a Readiness Checklist"
description: "Who the EU Cyber Resilience Act really covers, what changes on 11 September 2026, and what the obligations mean for a Java build pipeline."
keywords: ["cyber resilience act java", "cyber resilience act requirements", "cra compliance", "cra readiness", "cyber resilience act checklist", "cyber resilience act software", "eu cra requirements", "cyber resilience act scope", "cra deadline", "cra sbom requirements", "does the cyber resilience act apply to internal software", "cyber resilience act open source", "cyber resilience act vs nis2"]
images:
  - /blog/cyber-resilience-act-java.webp
image: /blog/cyber-resilience-act-java.webp
date: 2026-08-12T08:00:00+02:00
author: "Nicholas D'hondt"
draft: true
tags:
  - blog
  - compliance
  - cyber resilience act
  - sbom
---

*Last reviewed: 11 August 2026*

Mark your calendars: September 11, 2026, is when the EU Cyber Resilience Act's first "hard" obligations kick in. The big takeaway? You'll have a very tight window (24 to 72 hours) to report exploited vulnerabilities for products already in the wild.

But before you panic, here’s the nuance: If you're only building internal tools, you're likely exempt. The goal is to know where that line sits so you can focus your energy where it actually matters.

Since JobRunr has a commercial Pro edition, we’re officially "manufacturers" under this law. We’re doing our own homework to stay compliant, and we’re sharing our findings with you here.


> **The bottom line:** The Cyber Resilience Act focuses on **products with digital elements sold on the EU market**. If you're just building software for internal use, you’re **out of scope** because it isn't being "placed" on a market. 
> <br/><br/>
> However, the rules change the moment your code **becomes part of something you sell**, if you **make money from an open-source project**, or if you **build custom software for a client**. Even if your work is technically out of scope, keep in mind that your customers are still required to perform **due diligence on every component they ship** (Art. 13(5)). This means you’ll likely still have to deal with their security questionnaires.

One quick thing before we start: we’re engineers, not lawyers. This guide is meant to help you get ready from a technical standpoint, but we've linked the official articles and recitals for every point so your legal team can double-check the fine print.

## What the Cyber Resilience Act is, in three sentences

The Cyber Resilience Act (Regulation (EU) 2024/2847) is the first EU-wide law setting mandatory cybersecurity requirements for products sold within the European Union. Unlike older laws that focused only on hardware, this one explicitly includes software. This means a Java library, a commercial Spring Boot app, and a firmware image all fall under the same rules ([European Commission overview](https://digital-strategy.ec.europa.eu/en/policies/cyber-resilience-act)). For manufacturers, the stakes are high: non-compliance can lead to fines of up to 15 million euro or 2.5% of your worldwide annual turnover (Art. 64).

Structurally, it’s designed more like product safety law than GDPR. It focuses on "responsible manufacturers," essential requirements (Annex I), technical documentation, and conformity assessments, which, for the vast majority of software, you can handle via a self-assessment.

## The CRA timeline every Java team should have in their calendar

There are three dates you need to keep on your radar: the regulation entered into force on 10 December 2024, reporting obligations kick in on 11 September 2026, and the full suite of requirements applies from 11 December 2027. 

| Date | What happens |
| :--- | :--- |
| 10 Dec 2024 | The Cyber Resilience Act officially entered into force. Obligations begin to phase in. |
| 11 Jun 2026 | Rules for conformity assessment bodies begin to apply. |
| **11 Sep 2026** | **Article 14 reporting obligations begin.** You'll need to report actively exploited vulnerabilities and severe incidents: early warning within 24 hours, full notification within 72 hours, and a final report within 14 days (vulnerabilities) or one month (incidents) via ENISA's Single Reporting Platform. **Note: This applies to products already on the market.** |
| 11 Dec 2027 | Full application. This includes Annex I essential requirements, conformity assessments, CE marking, and technical documentation. |

September is the "make or break" date because the responsibility attaches to your *installed base*, not just your future roadmap. A product you shipped in 2023 and haven't touched since is suddenly in scope on that Friday. Since 24 hours is way too short to build a response process from scratch during an active incident, you need to be ready now. You can find more on the [European Commission's reporting page](https://digital-strategy.ec.europa.eu/en/policies/cra-reporting) regarding the platform and notification paths.

## Does the Cyber Resilience Act apply to you? Five questions

Work through these in order. Most Java teams stop at question one or two.

<figure>
{{< svg "assets/blog/cyber-resilience-act-scope-decision-tree.svg" >}}
<figcaption>The CRA scope decision tree: five questions from "do you sell software in the EU?" to "is it custom software for one client?", and where each answer lands you.</figcaption>
</figure>

**1. Do you sell or distribute software in the EU, either on its own or as part of a larger product?**

If the answer is no, the CRA doesn't apply to you directly. You can skip ahead to the "due diligence" section, as the regulation still reaches you indirectly through your customers. If yes, keep going.

**2. Is the software exclusively for your own internal use?**

If so, you’re out of scope. Software that your team builds and runs solely for your own operations is never "placed on the market," which is the core trigger for this regulation. 

**3. Is it a SaaS (Software as a Service) that you host?**

In most cases, this is out of scope. SaaS is generally the territory of NIS2 (and DORA for financial entities). There is one specific exception to watch out for: "remote data processing solutions" that are integral to a product's core function. These are pulled into the scope along with the product itself (Art. 3(2)). For example, if an on-premise product "phones home" to your API and breaks without it, that API is considered part of the product. 

**4. Is it open source with no paid components involved?**

If you aren't charging anything, you're out of scope. Non-monetized open-source development isn't considered a "commercial activity." However, any form of monetization pulls you into the "manufacturer" category with all its obligations. Commercial activity includes paid tiers, paid support, hosted versions, paid extras on a free core, ad revenue, data monetization, or even donations that exceed your development costs (Recitals 15 and 18). 

*Note: Open-source stewards and foundations providing sustained support for projects they don't sell get a lighter regime. They don't need CE marking and aren't subject to administrative fines (Art. 24).* The [Commission's open source page](https://digital-strategy.ec.europa.eu/en/policies/cra-open-source) and the [OpenSSF brief guide](https://best.openssf.org/CRA-Brief-Guide-for-OSS-Developers.html) are excellent resources to read in full.

**5. Is it custom software built for a single client?**

This is in scope. Providing custom software to a client commercially counts as placing it on the market, even if only one person ever runs it. While tailor-made software allows for some contractual flexibility regarding "secure-by-default" configurations and how updates are delivered, the obligations still exist.


## The obligations, translated to a Java build pipeline

If you are a manufacturer, the essential requirements in Annex I and the manufacturer duties in Article 13 come down to a short list of concrete engineering work. None of it is exotic. Most well-run Java teams have done part of it already without writing it down.

**Ship without known exploitable vulnerabilities, with a secure default configuration** (Annex I Part I). Wire a dependency scan into the build and let it fail the build when something exploitable shows up. A nightly report nobody opens changes nothing. The same goes for defaults: put the secure values in the `application.properties` you ship, so the customer never needs a hardening appendix to get there.

**Test and review the security of the product regularly** (Annex I Part II(3)). A dependency scan covers the components you pull in, not the code you write yourself. For that, the usual evidence is a penetration test by someone outside the team, on a fixed cadence, with a record of what was found and when it was fixed. The regulation says "regular" and leaves the cadence to you. JobRunr goes through a white hat penetration test every year, and that report is what we hand over when a customer's security questionnaire asks for it.

**Provide a software bill of materials** in a commonly used machine-readable format, covering at least the top-level dependencies (Annex I Part II(1)). Have the Maven or Gradle build emit a CycloneDX or SPDX SBOM on every release and attach it as a release artifact next to the jar, so the file exists before anyone asks for it. 

**Address vulnerabilities without delay, backed by a coordinated vulnerability disclosure policy** (Annex I Part II), which in practice means a monitored security address, a written triage path with target response times, and a public advisory channel. GitHub security advisories on the repository will do for the channel, as long as somebody reads the inbox behind the address.

**Deliver security updates free of charge and, where technically feasible, separately from feature updates** (Art. 13(8), Recital 60). Patch releases on maintained branches. A customer takes the fix without taking your next minor version.

**Handle vulnerabilities for a support period of at least five years** (Art. 13(8)). Publish a support window per major version, and check that CI can still build and test the oldest branch you promise to patch. [JobRunr Pro](/en/pro/) does this by backporting security fixes to the versions customers are running.

**Report actively exploited vulnerabilities and severe incidents within 24 and 72 hours** (Art. 14). That needs a named owner, an out-of-hours path, and ENISA Single Reporting Platform access arranged in advance. Then one rehearsal before September.

Nearly every requirement on that list resolves to an artifact (the SBOM, the advisory, the support statement, the technical documentation), and the CRA rewards teams who can produce that evidence on demand. Build the pipeline so it emits those artifacts on its own, and December 2027 turns into a documentation exercise.

> Do you think you are ready? Fill in the  [Cyber Resilience Act readiness checklist for Java teams](/en/cyber-resilience-act-checklist/).

## What about the dependencies in your software?

Most Java teams will feel the Cyber Resilience Act (CRA) from the outside in. Article 13(5) forces manufacturers to do the heavy lifting on third-party components, including open source, to ensure they don't break the product's security. It also mandates that if you find a bug in a component, you have to report it back to the maintainers.

This pushes the supply chain conversation upstream. Suddenly, your choices become someone else's responsibility. You should send these five questions to every vendor and answer them for every major open source dependency in your build:

1. Do you provide a machine-readable SBOM for every release? If so, what format?
2. Is there a monitored security contact and a clear policy for coordinated vulnerability disclosure?
3. What is the specific support window for our current version, and what happens when it expires?
4. Are security fixes issued independently of feature releases? Are they free?
5. Who is the manufacturer of record for this component under the CRA?

If a component can't answer question three, you are about to inherit its maintenance. This is true whether the code comes from a commercial vendor, a solo GitHub project, or that one colleague who moved on in 2022.

We answer our own questions in public. JobRunr, our Java background job framework, includes an SBOM with every Pro release. We publish a security policy that includes a coordinated disclosure contact and a one-business-day response commitment. We backport security fixes to the versions our customers actually run instead of forcing a full upgrade. We also undergo annual penetration testing and offer a DORA agreement for financial services. You can find the specifics for both our open source and Pro editions on [our Cyber Resilience Act page](/en/cyber-resilience-act/).



## CRA, NIS2 or DORA: which one actually matters?

These three are often tossed around in board meetings as if they are the same thing, but they regulate different pieces of the puzzle. Put simply: the CRA covers the products you sell, NIS2 covers how essential entities run their own systems, and DORA is the rulebook for the finance sector that is already in effect.

**The Cyber Resilience Act** targets products with digital elements sold in the EU. It cares about whether the software you ship is secure by design, properly documented, and consistently patched. If your business model doesn't involve selling software, you aren't the primary target here.

**NIS2** focuses on the organization itself. It applies to essential and important sectors like energy, transport, health, and public administration. It demands that these entities manage cybersecurity risk across their entire operation, including their supply chain and the software they use internally. This is why a company can be completely exempt from the CRA but still be held accountable for how it manages its internal scheduler.

**DORA** is the heavy hitter for finance. It became active on 17 January 2025, so it's the one you have to deal with right now. It governs ICT risk management, incident reporting, and third-party oversight for banks and insurers. It specifically reaches into the operational software used internally. If your team works in finance, our [finance page](/en/finance/) explains how JobRunr helps meet these DORA obligations. 

## FAQ

#### Does the Cyber Resilience Act apply to internal software?

It does not. The CRA covers products with digital elements "made available on the market." Software that your team builds and runs only for your own operations isn't placed on a market. This boundary shifts the moment that software ships inside a product you sell, is supplied to a client for money, or becomes a monetized open source project.

#### Does the CRA apply to SaaS?

Usually not. Software as a service is regulated as a service under NIS2 and DORA in the financial sector. One exception is "remote data processing solutions" that are integral to a product's core function. These are pulled into scope along with the product they support (Art. 3(2)).

#### Who is affected by the Cyber Resilience Act?

The act targets manufacturers, importers, and distributors of products with digital elements sold on the EU market during commercial activity. This includes software-only products and monetized open source projects. It does not include purely internal software or non-monetized open source development.

#### When does the Cyber Resilience Act take effect?

It entered into force on 10 December 2024. The reporting obligations under Article 14 begin on 11 September 2026. Full application, including Annex I requirements, conformity assessments, and CE marking, kicks in on 11 December 2027.

#### What does a CRA-compliant SBOM require?

You need a software bill of materials in a machine-readable format that covers at least the top-level dependencies of the product (Annex I Part II(1)). You must make it available to market surveillance authorities on request, but you don't have to make it public. The regulation doesn't mandate a specific format, though CycloneDX and SPDX are the standard choices.

#### What are the penalties under the CRA?

Breaching the Annex I essential requirements or the manufacturer obligations in Articles 13 and 14 can cost up to 15 million euro or 2.5% of worldwide annual turnover. Other obligations carry fines up to 10 million euro or 2%, and providing misleading information can cost up to 5 million euro or 1% (Art. 64). Open source stewards and non-commercial open source developers are exempt from these administrative fines.

#### Does the CRA apply to open-source software?

Non-monetized open source development isn't a commercial activity, so it stays outside the regulation. However, monetization in almost any form, like paid tiers, paid support, hosted versions, extras, or donations exceeding development costs, makes you a manufacturer with full obligations (Recitals 15 and 18). Open source stewards, such as foundations, follow a lighter regime with no CE marking and no administrative fines (Art. 24).

#### Is JobRunr affected by the CRA?

Yes. Because JobRunr is open source with a commercial Pro edition, it is considered monetized. This means it is a product with digital elements placed on the EU market. We've documented our compliance, including an SBOM for every Pro release, backported security fixes for older versions and annual penetration testing, on [our Cyber Resilience Act page](/en/cyber-resilience-act/).

## Scope first, panic never

Compliance experts have spent two years warning Java teams that the Cyber Resilience Act is coming for their codebase. For the majority of those teams, it isn't. The act is targeting the products they sell, the open source they monetize, and the evidence their customers must now collect for every component in a build.

Knowing this makes readiness much more manageable than the headlines suggest. Be honest about your scope first, then start producing the necessary artifacts: an SBOM, a disclosure policy, a support window, a recent penetration test report, and a reporting path with a specific owner.

Here are three ways to move forward based on your role. If you need a structured to-do list, the [readiness checklist](/en/cyber-resilience-act-checklist/) provides ten items in order. If you are currently filling out a due diligence questionnaire, [what JobRunr provides under the Cyber Resilience Act](/en/cyber-resilience-act/) is already formatted for you to attach to your file.