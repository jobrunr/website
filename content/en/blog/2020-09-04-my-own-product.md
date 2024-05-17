---
title: "Launching a developer product - how hard is it?"
summary: "Is it worthwhile to start a freemium product for developers in the Java eco-system?"
feature_image: /blog/2020-09-04-my-own-product.webp
date: 2020-09-04T11:12:23+02:00
author: "Ronald Dehuysser"
tags:
  - blog
  - meta
---
This is the story about [**JobRunr**]({{< ref "../_index.md" >}}), a distributed background job processing framework for Java and [**JobRunr Pro**]({{< ref "documentation/pro/_index.md" >}}) a drop-in replacement which adds extra features like Queues, Atomic batches, job chaining and more.

## Some history
In February 2020, right before the whole COVID-19 mess started, I decided it was time to try something new in my career - developing my own product. Since 2009, I always worked as a freelance consultant on different software projects but never developed a real product for end customers. Most of my projects where business applications making life easier for employees of different companies.

When I initially started my career (somewhere in 2004), I found that open-source world was mostly only happening in Java - the complete .NET world was still in it's infancy and there did not exist a lot of open-source projects for C#. And due to my job choices at that moment, I continued developing in the Java and Android world.

Fast forward to 2015 where I worked as a freelance consultant and did some pre-sales for a customer of [Cegeka](https://www.cegeka.com) that really wanted to have it's software developed in C#. Since I provided the estimates for this project, I also wanted to work on it as I did not want to be the guy who just gave some (way to optimistic) estimates and then moved along. No, I wanted to see whether the numbers I gave also worked out.

As I only developed in Java like languages until 2015 and the customer insisted on Microsoft products, it was time to learn some C# and the whole eco-system of the .NET world. And wauw, did that change since 2004. They did not only have a lot more IoC frameworks - 11 in .NET vs 3 or 4 in Java (the famous ones are Spring and Guice), there were some frameworks like [MediatR](https://github.com/jbogard/MediatR) and [Hangfire](https://www.hangfire.io/) with which I really fell in love and that did not exist in the Java world. As soon as I understood the advantage of these frameworks, I always told my colleague's that I would port them to Java someday.

## Fast-forward to 2019/2020
I was consulting on a Java project where the developers again made their own Java version of Hangfire (but without retries and monitoring) and I thought about the promise I made to port Hangfire to Java. Initially, I didn't think it was possible as a lambda in .NET can be easily analysed as an Expression which is not possible in Java. But, thanks to some digging and learning the inner-bits of the JVM bytecode, I found [ASM](https://asm.ow2.io/) which allowed me to analyse a Java 8 lambda and find all the necessary information to create the Java version of Hangfire. I then contacted [Sergei Odinokov](https://twitter.com/odinserj), the creator of Hangfire to ask him if it was ok to do so and luckily enough I quickly got his blessing and some excellent tips too.<br>
So, in February 2020 I started on my adventure to create the Java port of Hangfire and developed it using all the best practices I learned over the years (with some breaks due to working from home and having kids of course). I often thought that I made a big mistake to give up my work as a freelance developer - I was sure that with the current Corona recession, I would have a lot of trouble to find a new job. We have some savings but this is not something I can do for years. Nevertheless, there was no immediate way back so the only way is forward.

## First release in April 2020
On April 8th, I released the first beta on JCenter for other people to test - **_Hello JobRunr!_** And, after some posts on [LinkedIn](https://www.linkedin.com/pulse/java-batch-processing-made-easy-ronald-dehuysser/) about the first release, I started to receive feedback and some small bugs which I was able to fix quickly. Soon, some new [feature requests](https://github.com/jobrunr/jobrunr/issues/22) came in and since I really liked the business model that Sergei used for Hangfire I thought about doing the same. But, the Java world is a totally different beast than the .NET world - the Java open-source eco-system is so large with all kind of great products that developers aren't used to pay for a library, **_me myself included_**. But, no risk - no fun, let's just try it and see what happens!

## May 2020
### creating a community
Since users have questions that are not always bugs or feature requests, I looked into tools for this purpose. As [Gitter](https://gitter.im/jobrunr/community) is available by default for each GitHub repository, I ended up choosing it and reached out to some people that had questions. While some contact worked out nicely (I supported a really large number of users through it - *4 in total* 🙂), I still have my doubts about Gitter - I think the barrier is quite big and my guess is that Discourse would be a better option.<br>
On the website, I also explicitly mention [StackOverflow with a custom tag](https://stackoverflow.com/questions/ask?tags=java%20jobrunr) but up to today, all questions came in via GitHub issues. I get actively notified about questions on JobRunr on StackOverflow but for some unknown reason, it is not working today.

### the Google Ads attempt
Since I'd loved to get the word out about JobRunr, I used some free Google Ads credit and monitored the visitors on the website. The number of visitors increased significantly but for some reason, the ads where mostly only shown to Indian visitors and it did not have a big effect on the amount of JobRunr users. Even after changing the regional settings for my ads, nothing really happened and I did not notice an increase in the amount of users for JobRunr (there were no extra questions in Gitter nor any new bugs or feature requests on GitHub). Since I did not want to spend any money on Google Ads, I stopped the Google Ads campaign.

<figure>
{{< img src="/blog/2020-09-04-my-own-product-google-analytics.webp" >}}
<figcaption>The google analytics for the <a href="https://www.jobrunr.io/">jobrunr.io</a> website.</figcaption>
</figure>


### the first release on Maven Central and a post on Reddit
Since I received positive feedback from some users using it, I decided it was time to release it on Maven Central and as I heard that other dev's had good experience with blogging on Reddit, I wrote a [post about JobRunr in the Java community](https://www.reddit.com/r/java/comments/gs4l50/jobrunr_available_in_maven_central/) - and wauw, I received some wonderful feedback, traffic to the website peaked (see the peak in the google analytics image right before June) and the [GitHub stars](https://github.com/jobrunr/jobrunr/stargazers) jumped from 20 something to over 50.
When publishing a Jar on Maven Central, you can also see some basic statistics and I quickly saw that I reached about 19 users (19 unique ip's) with JobRunr.

<div style="display: flex; padding: 5px;">

<figure style="margin: 5px;">
{{< img src="/blog/2020-09-04-oss-stats-05-2020.webp" >}}
<figcaption>19 unique downloads of JobRunr v0.9.7</figcaption>
</figure>

<figure style="margin: 5px;">
{{< img src="/blog/2020-09-04-oss-stats-06-2020.webp" >}}
<figcaption>62 unique downloads of JobRunr in total<br>v0.9.7 = 26; v0.9.8 = 16; v0.9.9 = 14; <br>v0.9.10 = 11; v0.9.11 = 20</figcaption>
</figure>

<figure style="margin: 5px;">
{{< img src="/blog/2020-09-04-oss-stats-07-2020.webp" >}}
<figcaption>110 unique download of JobRunr in total<br>v0.9.7 = 17; v0.9.8 = 20; v0.9.9 = 25; <br>v0.9.10 = 21; v0.9.11 = 52; v0.9.12 = 17; v0.9.13 = 10</figcaption>
</figure>
</div>
<small>these numbers don't add up as some users upgraded making the total less than the sum of all values</small>
<br>
<br>

## June, July and August 2020
I continued improving JobRunr and added support for all kinds of SQL and NoSQL databases. I blogged about how to use it with [Kubernetes]({{< ref "2020-05-06-jobrunr-kubrnetes-terraform.md" >}}) and how I took (testing seriously)[2020-06-01-testing-against-12-jvms]. I tried to get the word out using [Reddit](https://www.reddit.com/r/java/comments/h8ymvd/jobrunr_v098_available_in_maven_central/), LinkedIn and Twitter and saw a small but steady increase of happy users. I also continued to work on the Pro version of JobRunr adding extra features which I loved myself in the past and which were requested by end-users.
The number of visitors always increased when I blogged about JobRunr on either [DZone](https://dzone.com/articles/jobrunr-project-loom-and-virtual-threads) or [Medium](https://medium.com/@ronald.dehuysser/a-hands-on-tutorial-on-how-to-test-against-12-different-jvms-using-testcontainers-by-google-bcb2ceaeaa69) but on a typical day, I have about 5 to 15 unique visitors. The number of unique downloads of JobRunr also continues to rise according to the Maven Central statistics.

## Where are we in September 2020
Currently, I feel quite confident that there are no major bugs present anymore in JobRunr. I did thorough testing (unit, integration and end-to-end with Cypress.io and I also test JobRunr against 12 different JVM's.) I still want to add support for [ElasticSearch](https://www.elastic.co/), which allows me to support the top 9 most used databases with JobRunr, including Oracle, DB2, SQL Server, MySql, MariaDB and also NoSQL databases like MongoDB and Redis. 

So, September will see the release of JobRunr v1.0 and I just updated the site with information about the [Pro version]({{< ref "documentation/pro/_index.md" >}}).


## Some lingering questions
Currently, there are quite some questions lingering in my mind:
- **_do I imagine that the market for JobRunr is bigger than it really is?_** <br>
  I think that any larger java application could benefit from using JobRunr - the moment there is some heavy processing (like generating a document, firing of a web-hook which might fail, ...), I really think there is an added advantage for JobRunr. It is that reason why I was so happy with Hangfire. There are already a lot of distributed real-time streaming products like [Apache Hadoop](https://hadoop.apache.org/), [Apache Kafka](https://kafka.apache.org/) and [Apache Spark](https://spark.apache.org/) but in my eyes, JobRunr tries to solve a different problem and I still see a market share for it.
- **_are there perhaps already too many alternatives present?_** <br>
  I came quite late to the distributed background job processing party - there is already [Quartz](http://www.quartz-scheduler.org/), [Spring @scheduled](https://spring.io/guides/gs/scheduling-tasks/), [Spring Batch](https://spring.io/projects/spring-batch) and [db-scheduler](https://github.com/kagkarlsson/db-scheduler). Yet, I think JobRunr still adds a lot of value as, in my eyes, it so easy to use, to setup and the dashboard gives easy insights for both developers and perhaps even business users. But, developers go with the libraries they know and since each of these libraries already have a well-established community so it will be difficult to convince them to use JobRunr.
- **_is JobRunr known by enough developers?_** <br>
  this is something I struggle with: I write blog posts about JobRunr for [Reddit](https://www.reddit.com/user/rdehuyss/posts/), [DZone](https://dzone.com/users/912925/rdehuyss.html), [Medium](https://medium.com/@ronald.dehuysser) and [Jaxenter](https://jaxenter.com/jobrunr-jvm-172830.html) - all my preferred resources to stay up-to-date on the latest in tech. Still, I think I only reached about a couple of 1000 developers (if it is even that many) while there are [9,007,346 java developers](https://www.google.com/search?q=how+many+java+developers) and for the moment, I don't have a clue on how to reach these other developers.
- **_do developers and companies want to pay for freemium software?_** <br>
  this might also be a problem - we all got used to excellent software libraries without paying for it - it's part of the open-source movement which I of course like. I could also perhaps setup some consulting around JobRunr but I don't think that will make me a living either.
- **_does the Pro version add enough value for the money? Is the annual licensing a good choice?_** <br>
  this is something I do not know for the moment and since I did not get any feedback on licensing yet (neither positive nor negative) it is something that only time will tell. I do think that the different features of JobRunr Pro like [Queues]({{< ref "documentation/pro/priority-queues.md" >}}), [Batches]({{< ref "documentation/pro/batches.md" >}}) and [Job Chaining]({{< ref "documentation/pro/job-chaining.md" >}}) add a lot of value. And, if I compare it to the time spent developing these features combined with my rate as a freelance developer, I think the price is more than reasonable.



## Preliminary conclusion
My gut feeling says it will be difficult to make a living out of JobRunr. To be completely open, I of course did not sell any license up until now. I do know there is interest of one company for the Pro version but the management still needs to be convinced. 

What it did do however is perhaps worth more - I learned a lot of new and cool stuff:
- [React](https://reactjs.org/) which is used by the frontend, 
- [Drone.io](https://drone.io/) which is a Docker based CI/CD platform I use for JobRunr
- [Hugo CMS](https://gohugo.io) which is used for the website 

And, on top of that, several people contacted me with job opportunities (some of which really interesting) and it's good to know that I can fall back on something in these economical difficult times. 

_Now my question to you: what do you think?_