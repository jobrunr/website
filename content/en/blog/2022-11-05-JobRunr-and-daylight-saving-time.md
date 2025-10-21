---
title: "Oooh, the irony"
summary: "A crime scene investigation on what went wrong with JobRunr when Daylight Saving Time ended."
feature_image: /blog/2022-11-05-jobrunr-dst.png
date: 2022-11-05T09:12:23+02:00
author: "Ronald Dehuysser"
tags:
  - blog
  - meta
---
{{< trial-button >}}

<div style="text-align: center;margin: -2em 0 2em;">
<small style="font-size: 70%;"><a href='https://www.freepik.com/vectors/cartoon-astronaut'>Cartoon astronaut vector created by catalyststuff - www.freepik.com</a></small>
</div>

## What is this blog post about?
Beginning of October, I wrote a blog post about how JobRunr handles Jobs and DST - if you want, you can still read that [blog post here]({{< ref "./2022-10-05-JobRunr-and-daylight-saving-time.md" >}}). 
> TLDR; it goes about how you don't need to worry about your scheduled jobs when using JobRunr.

In this blog post, I want to go deeper and find out the root cause on why JobRunr stopped processing jobs when DST ended. Or how to save a java 8 `Instant` via JDBC to your SQL Database. Or how to save a `java.sql.Timestamp` in UTC format. Or how Intellij code completion saved my ass by chance by proposing a solution no-where to be found on the internet...

And this blog post is also about me saying sorry 😢.


{{< img src="/blog/2022-11-05-irony.gif" >}}


## When you write a blog post how things wont go wrong but do go wrong...
On Monday the 31th of October 2022, a Github issue was created: [Unrecoverable error on time change due to daylight saving timezone change](https://github.com/jobrunr/jobrunr/issues/598) by [@raffig](https://github.com/raffig). Not possible, I thought... probably again somebody using MySQL?

Personally, I did not notice the bug myself yet (and this week I found out why: because my containers restart automatically if the health check fails 😏). 

## First, back to the past
The [same issue](https://github.com/jobrunr/jobrunr/issues/248) was already reported last year but as I did not suffer any problems thanks to the container magic mentioned above, I did what any developer would do: head over to [google](https://www.google.com/search?q=mysql+dst) and open the [first stackoverflow post](https://stackoverflow.com/questions/1646171/mysql-datetime-fields-and-daylight-savings-time-how-do-i-reference-the-extra). What does it mention in the first answer?

> Neither the DATETIME nor the TIMESTAMP field types can accurately store data in a timezone that observes DST.

There it is, in writing! It even has **97 Upvotes** so it must be correct! But, let's not be too eager and let's also read the second answer:

> MySQL's date types are, frankly, broken and cannot store all times correctly unless your system is set to a constant offset timezone, like UTC or GMT-5. (I'm using MySQL 5.0.45)

**54 Upvotes!** That is even more proof!! Alright, problem solved - it must be related to MySQL. On top of that, JobRunr only relies on [Instants](https://docs.oracle.com/javase/8/docs/api/java/time/Instant.html) - the new date and time API that was added in Java 8. So, it must be really related to MySQL, no? Yes, I can safely [close the issue](https://github.com/jobrunr/jobrunr/issues/248#issuecomment-982072478). 


{{< img src="/blog/2022-11-05-what-a-mistake.gif" >}}


## So, what happened?
As this year more users had the same issue with different databases, it was time to do a crime scene investigation of what happened.

### But, a bit of background first!
JobRunr is a cloud-native Job Scheduler meaning that if a `BackgroundJobServer` goes down (due to a container crash, ...), it will be automatically removed from the list of `BackgroundJobServers`. This also makes sure that jobs that were being processed by the `BackgroundJobServer` that died, can be picked up by another `BackgroundJobServer`. 

To make all of this work, each `BackgroundJobServer` updates the `lastHeartbeat` column with a UTC timestamp every 15 seconds (the `pollIntervalInSeconds`) in the `jobrunr_backgroundjobservers` table and then performs a delete of all the `BackgroundJobServers` that have `lastHeartbeat` older than `Instant.now().minus(timeOutDuration)` where `timeOutDuration` is typically a minute (but depends on your `pollIntervalInSeconds`).

### Fast forward to Sunday October 30th at 2:59 am
So, I setup my machine to reproduce this and put the date to 2:59 on Sunday October 30th while having a JobRunr instance running. And look what happened:

{{< codeblock >}}

```java
02:00:57.024 [backgroundjob-zookeeper-pool-2-thread-1] INFO  org.jobrunr.server.ServerZooKeeper - Removed 1 server(s) that timed out
02:00:57.044 [backgroundjob-zookeeper-pool-2-thread-1] ERROR org.jobrunr.server.ServerZooKeeper - An unrecoverable error occurred. Shutting server down...
org.jobrunr.JobRunrException: JobRunr encountered a problematic exception. Please create a bug report (if possible, provide the code to reproduce this and the stacktrace)
	at org.jobrunr.JobRunrException.shouldNotHappenException(JobRunrException.java:33)
	at org.jobrunr.storage.sql.common.BackgroundJobServerTable.lambda$getLongestRunningBackgroundJobServerId$3(BackgroundJobServerTable.java:98)
	at java.base/java.util.Optional.orElseThrow(Optional.java:403)
	at org.jobrunr.storage.sql.common.BackgroundJobServerTable.getLongestRunningBackgroundJobServerId(BackgroundJobServerTable.java:98)
	at org.jobrunr.storage.sql.common.DefaultSqlStorageProvider.getLongestRunningBackgroundJobServerId(DefaultSqlStorageProvider.java:116)
	at org.jobrunr.storage.ThreadSafeStorageProvider.getLongestRunningBackgroundJobServerId(ThreadSafeStorageProvider.java:74)
	at org.jobrunr.server.ServerZooKeeper.determineIfCurrentBackgroundJobServerIsMaster(ServerZooKeeper.java:115)
	at org.jobrunr.server.ServerZooKeeper.signalBackgroundJobServerAliveAndDoZooKeeping(ServerZooKeeper.java:79)
	at org.jobrunr.server.ServerZooKeeper.run(ServerZooKeeper.java:49)
	at java.base/java.util.concurrent.Executors$RunnableAdapter.call(Executors.java:539)
	at java.base/java.util.concurrent.FutureTask.runAndReset(FutureTask.java:305)
	at java.base/java.util.concurrent.ScheduledThreadPoolExecutor$ScheduledFutureTask.run(ScheduledThreadPoolExecutor.java:305)
	at java.base/java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1136)
	at java.base/java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:635)
	at java.base/java.lang.Thread.run(Thread.java:833)
Caused by: java.lang.IllegalStateException: No servers available?!
```
{{</ codeblock >}}

Wait, what? why? That's not possible as the code is as follows:

{{< codeblock title="It first signals that the server is alive (so setting the lastHeartbeat to Instant.now()) and then immediately removes the old servers." >}}

```java
private void signalBackgroundJobServerAliveAndDoZooKeeping() {
    signalBackgroundJobServerAlive();
    deleteServersThatTimedOut();
    determineIfCurrentBackgroundJobServerIsMaster();
}
```
{{</ codeblock >}}

As I did not understand what was going on, I decided to add logging to the SQL statements and I immediately notice something is off (can you see it too?)...

{{< codeblock title="Why the 🤬 are these dates in the SQL statements not in UTC?!?!" >}}

```java
2022-10-30T00:59:46.363080Z [SQL] update jobrunr_backgroundjobservers SET lastHeartbeat = '2022-10-30 02:59:46.30802+02', systemFreeMemory = 1706557440, systemCpuLoad = 0.13283909524169757, processFreeMemory = 17146814960, processAllocatedMemory = 33054224, processCpuLoad = 0.13283909524169757 where id = '281091d6-37df-42aa-8fc3-0bc7dd45e13b'
2022-10-30T00:59:46.399345Z [SQL] delete from jobrunr_backgroundjobservers where lastHeartbeat < '2022-10-30 02:58:46.372111+02'
2022-10-30T01:00:01.483854Z [SQL] update jobrunr_backgroundjobservers SET lastHeartbeat = '2022-10-30 02:00:01.425121+01', systemFreeMemory = 1712275456, systemCpuLoad = 0.12628588975894364, processFreeMemory = 17141209232, processAllocatedMemory = 38659952, processCpuLoad = 0.12628588975894364 where id = '281091d6-37df-42aa-8fc3-0bc7dd45e13b'
2022-10-30T01:00:16.574843Z [SQL] update jobrunr_backgroundjobservers SET lastHeartbeat = '2022-10-30 02:00:16.528987+01', systemFreeMemory = 1686863872, systemCpuLoad = 0.12121212121212122, processFreeMemory = 17137283208, processAllocatedMemory = 42585976, processCpuLoad = 0.12121212121212122 where id = '281091d6-37df-42aa-8fc3-0bc7dd45e13b'
2022-10-30T01:00:31.669645Z [SQL] update jobrunr_backgroundjobservers SET lastHeartbeat = '2022-10-30 02:00:31.614193+01', systemFreeMemory = 1666220032, systemCpuLoad = 0.11909921064850643, processFreeMemory = 17155519160, processAllocatedMemory = 24350024, processCpuLoad = 0.11909921064850643 where id = '281091d6-37df-42aa-8fc3-0bc7dd45e13b'
2022-10-30T01:00:46.756569Z [SQL] update jobrunr_backgroundjobservers SET lastHeartbeat = '2022-10-30 02:00:46.711982+01', systemFreeMemory = 1688797184, systemCpuLoad = 0.1224362473680106, processFreeMemory = 17150370936, processAllocatedMemory = 29498248, processCpuLoad = 0.1224362473680106 where id = '281091d6-37df-42aa-8fc3-0bc7dd45e13b'
2022-10-30T01:00:46.794078Z [SQL} delete from jobrunr_backgroundjobservers where lastHeartbeat < '2022-10-30 02:59:46.763976+02'
02:00:46.797 [backgroundjob-zookeeper-pool-2-thread-1] INFO  org.jobrunr.server.ServerZooKeeper - Removed 1 server(s) that timed out
02:00:46.818 [backgroundjob-zookeeper-pool-2-thread-1] ERROR org.jobrunr.server.ServerZooKeeper - An unrecoverable error occurred. Shutting server down...
```
{{</ codeblock >}}

Back to the code: what happens when a [Java 8 Instant](https://docs.oracle.com/javase/8/docs/api/java/time/Instant.html) is transformed to an SQL statement?

{{< codeblock title="That looks correct to me, no?" >}}

```java
 preparedStatement.setTimestamp(i, Timestamp.from(instant));
```
{{</ codeblock >}}

That looks correct to me, no? Hmm, let's Google and Stackoverflow again!

<figure>
  {{< img src="/blog/2022-11-05-no-stackoverflow-for-you.png" >}}

  <figcaption>This is going to be fun...</figcaption>
</figure>

So, after resetting my pc's date and time correct again, I find the following [stackoverflow.com post](https://stackoverflow.com/a/54564844/1005124) (yes, again the first link from google) with the following info:

> java.sql.Timestamp is a terrible class, along with its sibling classes such as java.util.Date and Calendar/GregorianCalendar. Among its many design problems is is messy handling of time zones. Instead, use only the modern java.time classes.

Just for fun, I open the `java.sql.Timestamp` class:

<figure>
  {{< img src="/blog/2022-11-05-oooh-noooo.png" >}}

  <figcaption>java.sql.Timestamp extends java.util.Data? This is really going to be fun...</figcaption>
</figure>


Further down in the [stackoverflow.com post](https://stackoverflow.com/a/54564844/1005124), I read the following:

> You may exchange java.time objects directly with your database. Use a JDBC driver compliant with JDBC 4.2 or later. No need for strings, no need for java.sql.* classes.

## Let's fix this!
### Attempt 1 - the easy fix!

Alright, this is going to be an easy fix! I just need to change the code snippet from above to `preparedStatement.setObject(i, instant);`, run the tests and call it a day!

<figure>
  {{< img style="width:60%; margin: 0 auto;" src="/blog/2022-11-05-oooh-noooo-tests.png" >}}

  <figcaption>Perhaps the fix is not going to be so easy...</figcaption>
</figure>

Luckily, Postgres helps me:
{{< codeblock >}}

```java
org.postgresql.util.PSQLException: Can't infer the SQL type to use for an instance of java.time.Instant. Use setObject() with an explicit Types value to specify the type to use.
```
{{</ codeblock >}}

Allright, it is still going to be an easy fix. Let's change the code snippet to `preparedStatement.setObject(i, instant, Types.TIMESTAMP);`. Now these tests will be green! (Please scroll up until you see failing tests image again.)

Hhmm, this time Postgres tells me:

{{< codeblock title="hmmm, this does not make sense..." >}}

```java
org.postgresql.util.PSQLException: Bad value for type timestamp/date/time: 2022-11-05T17:05:52.581727Z
```
{{</ codeblock >}}


Let's try with `preparedStatement.setObject(i, instant, Types.TIMESTAMP_WITH_TIMEZONE);`. (Please scroll up again until you see failing tests image.)

{{< codeblock title="hmmm, this still does not make sense..." >}}

```java
org.postgresql.util.PSQLException: Cannot cast an instance of java.time.Instant to type Types.TIMESTAMP_WITH_TIMEZONE
```
{{</ codeblock >}}

The [stackoverflow.com post](https://stackoverflow.com/a/54564844/1005124) also has a nice picture explaining everything, let's review it again:

<figure>
  {{< img src="/blog/2022-11-05-jdbc-types.png" >}}

  <figcaption>java.sql.Timestamp extends java.util.Data? This is really going to be fun...</figcaption>
</figure>

I read all the [different](https://stackoverflow.com/a/22470650/1005124) [stackoverflow](https://stackoverflow.com/a/50668272/1005124) posts but none if works. They say that either the above should work (🤥) by passing `java.time.*` Objects or using the `Timestamp.from(instant)`.

<figure>
  {{< img src="/blog/2022-11-05-stackoverflow-has-no-answer.webp" >}}

  <figcaption>When Stackoverflow does not provide an answer...</figcaption>
</figure>

Finally, on the third google page with only Stackoverflow results, I read the [following comment](https://stackoverflow.com/questions/50986138/converting-java-sql-timestamp-to-instant-time#comment119913322_50987372):
> If your database datatype had been timestamp with timezone, you could have passed Instant.class to rs.getObject and have got an Instant immediately and would not have hat to convert. - **This is wrong.** The only supported java.time types are **LocalDate, LocalTime, LocalDateTime, OffsetTime, and OffsetDateTime**. Also, some DBs do not support LocalTime and OffsetTime.

And it links to the following [Stackoverflow post](https://stackoverflow.com/questions/19080655/how-to-convert-epoch-to-mysql-timestamp-in-java/67752047#67752047) which gives a clear overview how to map stuff:

| ANSI SQL                | Java SE 8      |
|-------------------------|----------------|
| DATE                    | LocalDate      |
| TIME                    | LocalTime      |
| TIMESTAMP               | LocalDateTime  |
| TIME WITH TIMEZONE      | OffsetTime     |
| TIMESTAMP WITH TIMEZONE | OffsetDateTime |

There is no standard way to save a `java.time.Instant` with a JDBC 4.2 compatible Driver (let's talk about missed opportunities). But as [Arvind Kumar](https://stackoverflow.com/users/10819573/arvind-kumar-avinash) puts it nicely, an Instant represents an instantaneous point on the timeline and is independent of a timezone i.e. it has a timezone offset of +00:00 hours. The recommended way to save a `java.time.Instant` is to use `java.time.OffsetDateTime`. Finally, a possible solution!

### Attempt 2 - Batman vs Robin
Originally, when I created JobRunr I used `TIMESTAMP(6)` for the `lastHeartbeat` - my idea back then is that I wouldn't need a TimeZone as all the jobs were using UTC Timestamps. Now, I needed to revisit that choice and create an SQL script that migrates all these columns of type `TIMESTAMP(6)` to `TIMESTAMP(6) WITH TIME ZONE`. Just to make sure that this approach would work, I changed the original script to this `TIMESTAMP(6) WITH TIME ZONE`, saved the `java.time.Instant` as an `java.time.OffsetDateTime` and altered my computers date back to Sunday October 30th at 2:59 am using Postgres as my choice of weapon. Yes, it works! No `BackgroundJobServer` is removed!

But - my gut feeling (Batman) did not like this approach my brain (Robin) proposed.

<figure>
  {{< img src="/blog/2022-11-05-batman.jpeg" >}}

  <figcaption>My gut feeling slapping my brain...</figcaption>
</figure>

As the `TIMESTAMP(6)` is part of the DB index changing it to a `TIMESTAMP(6) WITH TIME ZONE`, all the indexes would also need to be recreated and a customer already got into contact with me that these automated migrations fail for them as the readiness probe takes too long to return true. 
On top of that, the change has also quite some impact in other places (like for Scheduled Jobs, ... ).
Time to go back to the drawing board...

### Attempt 3 - LocalDateTime to the rescue!
I still don't agree that we need to save a TimeZone in the `TIMESTAMP(6) WITH TIME ZONE` to save a simple database Timestamp. What if ... we transform the `Instant` to a `LocalDateTime` in UTC Timezone? Wouldn't that work?

The code from above then become  `preparedStatement.setObject(i, LocalDateTime.ofInstant(instant, ZoneOffset.UTC));`

Jeeej! Only one failing test per database! And, if I go back in time to Sunday October 30th at 2:59 and test the original bug again all is well! The failing test is easily solved (I should then also fetch the `java.sql.Timestamp` as a `java.time.LocalDateTime` and transform it back to an `java.time.Instant`) and I start testing it for each database. There is light at the end of the tunnel!

<figure>
  {{< img src="/blog/2022-11-05-db2.jpeg" >}}

  <figcaption>Apparently, DB2 does not support JDBC 4.2</figcaption>
</figure>

JobRunr also supports DB2 (it's not used a lot but it is used) and apparently the DB2 JDBC driver does [not support](https://dba.stackexchange.com/questions/252631/support-for-jdbc-4-2) JDBC 4.2 - well, the standard was only made in 2014 (together with Java 8) and one cannot expect for all the drivers to be compliant after <span id="days-since-java8">3150</span> days, no? 

Well, bad luck for those DB2 people, no? Who uses DB2 anyways?

### A solution no-where to be found on the internet
Then, by sheer luck, I suddenly saw the following: 
<figure>
  {{< img src="/blog/2022-11-05-intellij-to-the-rescue.png" >}}

  <figcaption>Wait - what is that Calendar I can pass as an extra option?</figcaption>
</figure>

The Javadoc of the `java.sql.PreparedStatement` says the following:
> Sets the designated parameter to the given java.sql.Timestamp value, using the given Calendar object. The driver uses the Calendar object to construct an SQL TIMESTAMP value, which the driver then sends to the database. With a Calendar object, the driver can calculate the timestamp taking into account a custom timezone. If no Calendar object is specified, the driver uses the default timezone, which is that of the virtual machine running the application.

**This sentence is the actual root cause of the problem - the JDBC driver uses the default timezone of the virtual machine.** 

So, I changed the code snippet from above again to: `preparedStatement.setTimestamp(i, Timestamp.from((Instant) o), Calendar.getInstance(getTimeZone(ZoneOffset.UTC)));`

And hoooraay!! This [solution works](https://github.com/jobrunr/jobrunr/pull/601) for all databases (I have tested it for each and every supported JobRunr database by putting my PC's clock to Sunday October 30th at 2:59 am)!

###### But, you're still using java.sql.Timestamp?
To be honest, I don't know if this solution is the best solution as I still use the legacy `java.sql.Timestamp` and none of the `java.time.*` classes. But, with the current information that I have at hand, I do think it is the best possible solution. Feel free to [reach out](https://github.com/jobrunr/jobrunr/pull/601) if you have other idea's on this topic.

###### When will it be released?
As writing this blog post made me realize it will impact all the Scheduled Jobs, this will be part of JobRunr 6 which will be released somewhere at the end of the year.


## Conclusion
If you are using JobRunr, you do not need to be afraid **anymore** of DST - all your scheduled jobs will run! All you need to know is that some scheduled jobs may be impacted because of the change during the time change of DST and will run at most one hour earlier or later.

So, just relax and enjoy that hour of extra sleep 😴 **(at least next time)**.

> I sincerely want to apologize to all users who had troubles because of this. And to everybody who will have troubles when upgrading as it will also impact your Scheduled Jobs. And to MySQL.

<script type="text/javascript">
const date1 = new Date('3/18/2014');
const date2 = new Date();
const difference = date2.getTime() - date1.getTime();
const days = Math.ceil(difference / (1000 * 3600 * 24));
document.getElementById("days-since-java8").innerHTML = days + "";
</script>

###### Ps: for JetBrain developers
It would be fun to still have logging in the Run terminal if you put your PC's date & time in the past. Now, each time I wanted to test a possible solution, I had to restart Intellij as it apparently uses the logging DateTime to filter out logs? Or perhaps I miss a setting?