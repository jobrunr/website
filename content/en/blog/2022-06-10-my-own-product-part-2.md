---
title: "Launching a developer product - part 2"
summary: "Jeeeejj! I have a 1000 stars in GitHub!"
feature_image: /blog/2022-06-10-my-own-product-part2.png
date: 2022-06-10T11:12:23+02:00
author: "Ronald Dehuysser"
tags:
  - blog
  - meta
---
This is the story about [**JobRunr**](https://www.jobrunr.io/en/), a distributed background job processing framework for Java and [**JobRunr Pro**]({{< ref "documentation/pro/_index.md" >}}) a drop-in replacement which adds extra features like Queues, Atomic batches, job chaining and more.

You can read [part 1 here]({{< ref "./2020-09-04-my-own-product.md" >}}). Part 2 comes almost 2 years later (rather 950 GitHub stars later). What a crazy ride it has been!

### Some history
So, on the 4th of September 2020, I blogged for the first time how it was to start a freemium developer product in the Java world. Back then, I hadn't sold a single Pro license and although I had some users liking my product, I started of with only 19 unique downloads per month. That same week saw also the release of JobRunr 1.0.0 with the `jobrunr-spring-boot-starter` integration.

As I could not live forever without any income, I took on another contracting role but In my spare time (mostly evenings, weekends and holidays), I kept on working on JobRunr. Below you will find the journey from September 2020 until today.

### October 2020
October 2020 saw the first contribution of a Spring Core Contributor, [Stéphane Nicoll](https://github.com/snicoll) (how cool is that!) and in release v1.1.0 I made some improvements when Jobs are not found anymore due to refactoring in your code. As of then, a message is shown in the dashboard if one of your scheduled jobs does not exist in your code.

### November 2020 - my first customer!
Then, in November 2020 it finally happened: I was contacted by KomaK with the request to add support for DocumentDB and it resulted in my first sold license. Thanks, [KomaK](https://www.komak.fr/) for the trust! It resulted in the first 25 trees being planted.

### January 2021 - JobRunr featured on Oracle Blog!
In January 2021, a tutorial on how to use JobRunr was featured in Oracle Java Magazine, the Java resource for developers worldwide. I quickly found out how warm and welcoming the Java community is and I want to take this opportunity to thank [Alan Zeichick](https://twitter.com/zeichick), the editor in chief of Oracle Java Magazine. Colleagues who knew I was working on JobRunr, reached out and told me about the Oracle article - it was fun to see and gather all the feedback.

### February 2021 - the release called Made In Germany
As I had some concurrency issues that were hard to track down, I added a [feature in JobRunr](../2021-02-07-v1.3/) that automatically suggests to create a Github issue in case such a concurrency issue happened. It allowed me to track down these [difficult and nasty bugs](https://github.com/jobrunr/jobrunr/issues?q=is%3Aissue+%22Severe+JobRunr+Exception%22) and it helped me to improve JobRunr even more.

### April 2021 until July 2021 - a lot of releases!
In April 2021 I released JobRunr 2.0.0 - it was a breaking release as I added support for Kotlin and the argument order when creating jobs changed. JobRunr 3.x was released and I added the option to search for Jobs in the JobRunr Pro dashboard.

But I noticed something changing: the amount of downloads from JobRunr kept on rising month after month and I had 2800 unique downloads in July 2021!
<figure>
<img src="/blog/2022-06-10-my-own-product-part2-unique-downloads-july2021.png" />
<figcaption>2800 unique downloads of JobRunr in July 2021!</figcaption>
</figure>

### August 2021 - my second customer!
Only 10 months (🤣) after my first customer, I was contacted by [ECG inc](https://www.ecg.co/) and they were also interested in a JobRunr Pro license. It was an easy sell as they needed a specific JobRunr Pro feature and it resulted in another [75 planted trees](https://teamtrees.org/search?q=ecg).

### September 2021 - JobRunr 4.0.0, the biggest release since JobRunr 1.0.0
During my holidays (COVID was still a thing and travel was still a hassle), I continued to work on JobRunr and JobRunr Pro and it resulted in one of the best releases. A lot of improvements were done:
- **Job Analysis Performance Mode**: thanks to some smart caching, Job Analysis is now faster than ever
- **JobRequest and JobRequestHandler**: this release introduced the JobRequest and JobRequesthandler. It was a new way to create jobs using the command / commandhandler pattern (meaning you can use objects instead of lambda’s to create background jobs). I added it after feedback from users on Reddit.
- **Integration with other frameworks**: the Spring Boot Integration was improved and support for Micronaut and Quarkus was added.

### September until December 2021 - small & incremental improvements
From September 2021 I worked less on JobRunr as I took on a new role as the CTO of a startup, [Ventory](https://www.ventory.io). However, the usage of JobRunr kept on growing and [Josh Long aka starbuxman](https://twitter.com/starbuxman) wrote about JobRunr in his weekly newsletter '[This week in Spring!](https://spring.io/blog/2021/10/05/this-week-in-spring-october-5th-2021)'. It didn't take long before I was invited for his great podcast series - [a Bootiful Podcast](https://spring.io/blog/2021/12/16/a-bootiful-podcast-ronald-dehuysser-creator-of-the-distributed-job-scheduler-jobrunr). And that same night, we started pairing and added Spring Native support to JobRunr. Again this showed me how warm and welcoming the whole [Spring Boot](https://twitter.com/springboot) and [Java](https://twitter.com/java) community is!

### January until May 2022 - JobRunr 5.0.0
After working hours, I continued making improvements to both JobRunr and JobRunr Pro and March 2022 saw the release of [JobRunr and JobRunr Pro 5.0.0](../2022-03-30-jobrunr-v5.0.0). Some highly anticipated features were added to JobRunr Pro like a [Spring Boot Transaction]({{< ref "transactions.md" >}}) plugin, instant job processing, [updating of jobs]({{< ref "replace-jobs.md" >}}) and an [improved dashboard]({{< ref "jobrunr-pro-dashboard.md">}}). 
More companies reached out and I was able to sell 6 more licenses. As [I care about our planet]({{< ref "about.md#eco-friendly-software" >}}), this resulted in [950 new trees](https://teamtrees.org/search?q=JobRunr) being planted!

### May 2022 - Spring.io!
The crazy ride continued and I was invited to speak at [Spring.io Barcelona](https://2022.springio.net/sessions/backgroundjobenqueue-systemoutprintlnthis-is-all-you-need-for-distributed-background-jobs) before an audience of 250 people. I had a blast presenting JobRunr and I also received a lot of nice feedback. Mental note: if you will do live coding on stage, do practice with `presenter mode` in Intellij :-). 

### Where are we in June 2022
On June 10, I received 1000 GitHub stars!
<figure>
<img src="/blog/2022-06-10-my-own-product-part2-github-stars.png" />
<figcaption>1000 GitHub stars JobRunr in June 2022!</figcaption>
</figure>

If I compare my Google analytics from 2020 to 2022, there also definitely an increase:
<figure>
<img src="/blog/2022-06-10-my-own-product-part2-google-analytics.png" />
<figcaption>The google analytics for the <a href="https://www.jobrunr.io/">jobrunr.io</a> website.</figcaption>
</figure>

And the unique downloads via Maven Central has also boomed:
<figure>
<img src="/blog/2022-06-10-my-own-product-part2-unique-downloads-growth.png" />
<figcaption>The growth of JobRunr over the last 12 months.</figcaption>
</figure>

JobRunr tends to work well for long projects as JobRunr 1.x is about 10% of the unique downloads today:
<figure>
<img src="/blog/2022-06-10-my-own-product-part2-unique-downloads-may2022.png" />
<figcaption>JobRunr downloads in May 2022</figcaption>
</figure>

### Going forward
<img src="/blog/2022-06-10-my-own-product-part2-bus-factor.png" style="margin: 1.5em 1.5em 1.5em 0"/>


As the project is growing, it's time to do some governance. I don't want to be a project where the bus factor is 1. That's why I have recently onboarded [Renaud Bernon](https://github.com/RenaudBernon), another great developer who will be maintaining JobRunr and JobRunr Pro together with me. Welcome [Renaud](https://github.com/RenaudBernon)!



### Last but not least... 
I would like to thank all the JobRunr Pro customers and amazing people that helped on JobRunr - without them, JobRunr would not be the product it is now.

Thanks [Renaud](https://twitter.com/RenaudBernon), for embarking on this adventure together with me!<br/>
Thanks [Josh](https://twitter.com/starbuxman), for pairing with me with during christmas holidays!<br/>
Thanks [Sergi](https://twitter.com/sergialmar), for giving me the opportunity to speak on [Spring.io](https://2022.springio.net)!<br/>
Thanks [Michael](https://twitter.com/mpredli), for following the JobRunr repo so dilligent and writing about JobRunr on each minor release.<br/>
Thanks [Alan](https://twitter.com/zeichick), for having articles about JobRunr in [@OracleJavaMag](https://twitter.com/Oraclejavamag).<br/>
Thanks [Eugen](https://www.baeldung.com/java-jobrunr-spring) and [Yong](https://mkyong.com/spring-boot/spring-boot-jobrunr-examples/) for publising the articles about JobRunr.<br/>
Thanks [Carson](https://github.com/1cg), for pairing with me and searching for the Redis support in JobRunr.<br/>
Thanks [Graham](https://github.com/biggms8x8) and [Bilal](https://github.com/BilalKamran), for searching for that one difficult issue together with me!<br/>
Thanks [Sazzadul](https://github.com/sazzad16), for helping me with the Redis integration!<br/>
Thanks [Dat](https://github.com/datnguyen293), [Pat](https://github.com/patkujawa-wf) and [David](https://github.com/dmurphy-ambra), for believing in the product and your awesome feedback.<br/>


__And off-course all the contributors:__<br>
Thanks [Eddú](https://github.com/eddumelendez), for the help with the awesome TestContainers!<br/>
Thanks [Gilberto](https://github.com/gilberto-p-matos), for the great discussion and PR you created.<br/>
Thanks [Dawie](https://github.com/dawiemalan), for adding support for interval in the `@Recurring` annotation.<br/>
Thanks [Pixnbit](https://github.com/pixnbit), for helping with the transactions in Micronaut.<br/>
Thanks [Kevin](https://github.com/kfowler), for adding support for multiple datasources.<br/>
Thanks [Jeremy](https://github.com/jeremylong), for helping with the docs.<br/>
Thanks [Sunyoung](https://github.com/shinsunyoung), for helping with internationalization in the Dashboard.<br/>
Thanks [Daniela](https://github.com/daniela-tumbraegel), for adding support for interval in recurring jobs! This was some great work!<br/>
Thanks [Alexander](https://github.com/angry-cellophane), for making the exceptions more readable.<br/>
Thanks [Anatolijs](https://github.com/sa1nt), for supporting `table-prefixes` in MongoDB.<br/>
Thanks [Pei-Tang](https://github.com/tang), for all your help with recurring jobs.<br/>
Thanks [Neil](https://github.com/neildeng), for helping with the table name prefixes.<br/>
Thanks [Benoît](https://github.com/benallard), for your help with the logging.<br/>
Thanks [Damien](https://github.com/dtrouillet), to make the dashbord secure.<br/>
Thanks [Manfred](https://github.com/hankem), for improving the [ArchUnit](https://github.com/TNG/ArchUnit) tests.<br/>
Thanks [Ivan](https://github.com/metlaivan), for fixing one of the tests!<br/>
Thanks [Jakub](https://github.com/jakub-hirnsal), for improving the Mongo integration!<br/>
Thanks [Krisztián](https://github.com/thorasine), for improving the Readme.<br/>
Thanks [Stéphane](https://github.com/snicoll), for improving the Spring Fluent API example.<br/>
Thanks [Daniell](https://github.com/daniiell3), for making the dashboard port configurable.<br/>
Thanks [Ziad](https://github.com/hatahet), for cleaning up some of the code.<br/>

And I'm sure I've forgotten some people too, so also a big thank you for everybody that helped but that I forgot for some reason! Feel free to reach out and I'll make sure I will add you to this list.

Thanks again,<br/>
Ronald