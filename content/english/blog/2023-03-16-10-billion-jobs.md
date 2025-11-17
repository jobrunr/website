---
title: "JobRunr Has Processed more than 10 Billion Jobs Successfully in Less Than a Year"
description: "A Testament to Its Power and Flexibility"
image: /blog/2023-03-16-10-billion-jobs.png
date: 2023-03-16T09:12:23+02:00
author: "Ronald Dehuysser"
tags:
  - blog
  - meta
---
{{< trial-button >}}

<div style="text-align: center;margin: -2em 0 2em;">
<small style="font-size: 70%;"><a href='https://www.freepik.com/vectors/cartoon-astronaut'>Cartoon astronaut vector created by catalyststuff - www.freepik.com</a></small>
</div>

<style type="text/css">
    .post-full-content img {display: inline-block; margin: 0 auto}
</style>

### We're so proud!
As a proud developer of JobRunr (🙏 and of course thank you to all the different contributors 🙏), I am thrilled to announce that our open-source SDK has processed more than **10 billion jobs successfully** in less than a year! This remarkable achievement is a testament to the power, flexibility, and battle-tested reliability of JobRunr. 

### But, how do you know this?
But before we dive into the impressive numbers, let's discuss the motivations behind JobRunr's anonymous usage data collection. Since the release of JobRunr 5.1, we have started capturing anonymous usage data. While it may seem like an invasion of privacy, the only reason for this is marketing. We hope that by sharing these impressive usage statistics, users will not only appreciate the work that goes into maintaining and improving JobRunr as an open-source library (and all the support we provide with it) but also are encouraged to upgrade to the Pro version, supporting the continued development of this fantastic tool 🙌.
> P.s.: we only get the following info JobRunr version, database type, amount of succeeded jobs, minimum amount of background job servers and maximum amount of background job servers.

### Now, let's take a closer look at the numbers:

- JobRunr has processed a whopping **10,036,109,118** jobs 🚀 since May 6th, 2022 up til March 16th 2023.
A single JobRunr Pro customer executed an astounding 8,526,634,486 of these jobs (almost **85%**) using Amazon RDS Postgres. 😲
- Clear is that _Postgres_ is the king 👑 of databases with over 1,323 active installs, followed by _MongoDB_ with 416 installs, _MariaDB_ with 401 installs, _MySQL_ with 340 installs, _H2_ with 277 installs, _Oracle_ with 144 installs, _Microsoft SQL Server_ with 137 installs, _Redis_ using Lettuce with 62 installs, _Redis_ using Jedis with 54 installs, and a few users with custom database implementations.
- Furthermore, the most used JobRunr versions and their respective number of installs are as follows:
  - 5.1.4: 578 installs
  - 5.3.1: 525 installs
  - 5.1.7: 452 installs
  - 5.3.3: 381 installs
  - 5.3.0: 290 installs
  - 5.1.6: 286 installs
  - 5.1.3: 252 installs
  - 5.1.0: 210 installs
  - 5.1.2: 202 installs
  - 5.3.2: 202 installs
  - 6.0.0: 191 installs
  - and the list goes on for quite a bit
- In terms of Background Job Server Nodes 🖥️, 3,325 installs have only one node running most of the time. However, 793 installs have two nodes, 171 have three nodes, 98 have four nodes, 26 have six nodes, 20 have five nodes, and there are even a cluster with more than 24 nodes.

### There is more!
While the numbers mentioned above are already impressive, it's important to note that they likely underestimate the total number of jobs processed by JobRunr. There are still more than 29% of users running JobRunr versions 0.9.7 to 4.x.x, and 121 users are still downloading the prereleases of JobRunr before version 1.0. This information was obtained through [Maven Central](https://central.sonatype.com/artifact/org.jobrunr/jobrunr/6.1.1). These earlier versions do not capture anonymous usage data, so we cannot account for the jobs processed by these users. Given this fact, it is safe to assume that the true number of jobs processed by JobRunr is even higher than the 10 billion milestone.

## Conclusion
These figures clearly demonstrate that JobRunr is battle-tested 🏆 and has proven its worth across various configurations and environments. We kindly invite users to explore the benefits of upgrading to [JobRunr Pro]({{< ref "documentation/pro/_index.md" >}}), as it offers enhanced features that can will increase your development productivity and help you with a faster time to market. By upgrading, you also contribute to the continued development of this robust, adaptable, and dependable job scheduling platform, enabling us to maintain and improve it for all users.

<div style="display: flex; justify-content: center;">
    <a href="/en/pricing" class="btn btn-black btn-lg" style="display: inline-block; height: 45px; margin-right: 1rem;">
        get JobRunr Pro now
    </a>
</div>