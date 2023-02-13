---
title: "Buy vs Build in open-source"
summary: "I would love your input on how to convince your management in the buy vs build decision?"
feature_image: /blog/2022-12-06-JobRunr-in-the-news.png
date: 2023-06-12T09:12:23+02:00
author: "Ronald Dehuysser"
tags:
  - blog
  - meta
---
{{< trial-button >}}

<div style="text-align: center;margin: -2em 0 2em;">
<small style="font-size: 70%;"><a href='https://www.freepik.com/vectors/cartoon-astronaut'>Cartoon astronaut vector created by catalyststuff - www.freepik.com</a></small>
</div>

## Buy vs Build - an important decisions in software development
When it comes to building software, one of the most important decisions a company must make is whether to buy or build a solution for the current problem at hand. In the blog post today, I want to write about how I see developers struggle with management on this topic resulting in a longer time to market and a solution which is way more expensive.


> TLDR; Building a solution for distributed job scheduling takes a lot of time and resources, even if there is an open-source basis from which you can start. On top of that, it introduces the risk of new bugs and issues and may create extra headaches and strain for open-source developers. 

Let me tell you a short story...

## 🤬 Oh no, a new bug report in Github
Each time a bug report is created in JobRunr, my heart still skips a beat - it means someone has troubles with the code we have written. Although JobRunr is only 2 years old, has processed over 9 500 000 000 jobs (yes - that's billion) in less than a year, and is covered with over 5000 tests, I still not dare to say it is bug free (imposter syndrome maybe).

Some time ago, a new bug report was created and it was a strange one as I've seen quite some bugs in this 2 years.

As I want to find the root cause of all the bugs in JobRunr, I offered to have a call with the developers and during this call, I quickly found out that they changed some JobRunr internals and abused some API's to make JobRunr fit in their software architecture but ... this caused 2 bugs of which one was thus reported via Github.

## Developers vs (middle-)management
During the call they mentioned that they already asked their managers to get a JobRunr Pro license as it offered quite some features they needed but the manager decided against it as it would increase the operational costs of the project. Instead, these very talented developers were tasked to adapt the JobRunr open-source version and reimplement the features they needed (note that this is a publicly traded company with a revenue greater than the amount of jobs that JobRunr processed in 2022 😂).


## The Risk of DIY
Reimplementing a distributed background job scheduler like JobRunr can be a major distraction for any company and requires a significant investment in resources, including software engineers, developers, and testers. On top of that and perhaps more importantly so, it takes away the focus on the core business which may result in a slower time to market. 

During the discussion, the developers admitted that reimplementing these Pro features has already costed way more in time and payroll on their side than a JobRunr Pro license (and, I dare to take the bet that it may be even more expensive than the first year license only). The decision also caused 2 bugs for them (I think/hope I was able to give them workarounds so they are at least not stuck for the moment) and some missed heartbeats on my side.

## The benefits of Buy
In contrast, buying a solution like JobRunr as it has been tested and proven in a variety of different industries. This means that a company can have confidence in the reliability and stability of the solution, and can focus on using it to achieve their business goals.

Overall, the decision to buy JobRunr Pro rather than build is a smart one. Not only does it save time and money, but it also allows the company to focus on their core competencies and achieve their goals faster.

## How do we want to approach open-source?
To conclude, I'm really curious on your input on this article:
- would you still build it yourself?
- would you buy?

I know that we as a Java community are spoiled - almost all frameworks and libraries out there are free. Yet, you probably get paid as a developer (and can do a lot of fun stuff with that money). Why do we still see open-source as free? 
Not supporting open-source software (ranging from PR's, Github Sponsors by your company or even a Pro license) result in risks for the complete Java ecosystem: libraries and frameworks may result in not being maintained anymore.

Feel free to email your feedback (both in favor of buying and building - I won't bite) to [me](mailto:ronald@jobrunr.io) and I may create a follow-up blog post with some of the responses.

## A big thank you
I do want to give a big thank you (like the biggest 🙏 🙌 🎉) to all my pro customers. They make sure that JobRunr development can continue!

