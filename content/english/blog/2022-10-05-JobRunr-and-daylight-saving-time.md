---
title: "JobRunr and Daylight Saving Time"
description: "Let's dig deeper on the impact of Daylight Saving Time and scheduled JobRunr Jobs"
image: /blog/2022-10-05-jobrunr-dst.png
date: 2022-10-05T09:12:23+02:00
author: "Ronald Dehuysser"
tags:
  - blog
  - meta
---
{{< trial-button >}}

<div style="text-align: center;margin: -2em 0 2em;">
<small style="font-size: 70%;"><a href='https://www.freepik.com/vectors/cartoon-astronaut'>Cartoon astronaut vector created by catalyststuff - www.freepik.com</a></small>
</div>

## What is Daylight Saving Time
At the end of this month, on the 30th of October at 3am, Daylight Saving Time (DST) will end only to start again on the 26th of March 2023 at 2am. And there is actually some good news in that (at least for parents): we will have an extra hour of sleep at the end of this month!

DST, also known as Summer Time, involves resetting clocks forward one hour during the summer and back an hour during the winter months. The intention is to extend daylight hours so that people can enjoy outdoor activities longer before sunset. Another benefit of DST is that it helps to reduce energy usage by reducing peak demand for electricity. While most people know what Daylight Saving Time is, not everyone understands how it impacts their scheduled jobs in JobRunr. That’s why we’ve compiled this blog post to help you understand what DST means for your scheduled jobs, and how you can prevent any disruptions from occurring during this period of time.

## Scheduled Jobs and the Impact of DST
The majority of online businesses rely on scheduled jobs to perform important operations that help to keep their business running smoothly. One of the most common tasks for which businesses use scheduled jobs is to send email campaigns. Other types of recurring scheduled jobs include updating data records in a database, sending reports to team members, and uploading images/videos to an online location like a website or social media page. Typically, all of these types of scheduled jobs are impacted by DST because the timing of the occurrence changes depending on whether it is summer or winter. But the good news is that JobRunr manages the impact of DST so that they don’t have any on your business.

## Long live Java 8 Instant!
Java 8, released in 2014, introduced some great improvements to Java Date & Time API. It added support for the `LocalDateTime`, `OffsetDateTime`, `ZonedDateTime` and the Java `Instant`. An `Instant` is nothing more than instantaneous point representation on the time-line. To achieve this, the `Instant` class stores a long representing epoch-seconds and an int representing nanosecond-of-second. And, the big benefit is that a Java 8 `Instant` is agnostic to Daylight Saving Time!

## The advantage of using JobRunr for scheduling Jobs
When you schedule a job using JobRunr, you have several options to schedule that job: you can use a Java 8 `Instant`, a `LocalDateTime`, an `OffsetDateTime` or a `ZonedDateTime`. 

### Using a Java 8 Instant
When you use the `Instant`, things are simple: the Job is scheduled at a certain instant. The JobRunr Background Job Server uses the `pollIntervalInSeconds` (by default 15 seconds) to poll for scheduled jobs and fetch all scheduled jobs where the scheduled `Instant` of the saved job is smaller than `Instant.now()` of the Background Job Server. These scheduled jobs are then enqueued and will be processed as soon as possible.

### Using a `LocalDateTime`, an `OffsetDateTime` or a `ZonedDateTime`
When you use something else than a Java 8 `Instant`, JobRunr will convert your `LocalDateTime`, `OffsetDateTime` or `ZonedDateTime` to a Java 8 `Instant` when __the job is created__. This eases the impact of DST as internally only Java 8 `Instant`'s are used.

### A concrete example
The Java code below is a unit test that you can adapt to your timezone to find out when jobs will actually be scheduled.

```java
@Test
void testDST() {
    System.out.println("From summer to winter time");
    ZonedDateTime zonedDateTime1 = ZonedDateTime.of(2022, 10, 30, 1, 0, 0, 0, ZoneId.of("Europe/Brussels"));
    System.out.println(zonedDateTime1 + " / " + zonedDateTime1.toInstant());

    ZonedDateTime zonedDateTime2 = ZonedDateTime.of(2022, 10, 30, 2, 0, 0, 0, ZoneId.of("Europe/Brussels"));
    System.out.println(zonedDateTime2 + " / " + zonedDateTime2.toInstant());

    ZonedDateTime zonedDateTime3 = ZonedDateTime.of(2022, 10, 30, 2, 30, 0, 0, ZoneId.of("Europe/Brussels"));
    System.out.println(zonedDateTime3 + " / " + zonedDateTime3.toInstant());

    ZonedDateTime zonedDateTime4 = ZonedDateTime.of(2022, 10, 30, 3, 0, 0, 0, ZoneId.of("Europe/Brussels"));
    System.out.println(zonedDateTime4 + " / " + zonedDateTime4.toInstant());

    ZonedDateTime zonedDateTime5 = ZonedDateTime.of(2022, 10, 30, 4, 0, 0, 0, ZoneId.of("Europe/Brussels"));
    System.out.println(zonedDateTime5 + " / " + zonedDateTime5.toInstant());


    System.out.println("From winter to summer time");
    ZonedDateTime zonedDateTime6 = ZonedDateTime.of(2023, 3, 26, 1, 0, 0, 0, ZoneId.of("Europe/Brussels"));
    System.out.println(zonedDateTime6 + " / " + zonedDateTime6.toInstant());

    ZonedDateTime zonedDateTime7 = ZonedDateTime.of(2023, 3, 26, 2, 0, 0, 0, ZoneId.of("Europe/Brussels"));
    System.out.println(zonedDateTime7 + " / " + zonedDateTime7.toInstant());

    ZonedDateTime zonedDateTime8 = ZonedDateTime.of(2023, 3, 26, 2, 30, 0, 0, ZoneId.of("Europe/Brussels"));
    System.out.println(zonedDateTime8 + " / " + zonedDateTime8.toInstant());

    ZonedDateTime zonedDateTime9 = ZonedDateTime.of(2023, 3, 26, 3, 0, 0, 0, ZoneId.of("Europe/Brussels"));
    System.out.println(zonedDateTime9 + " / " + zonedDateTime9.toInstant());

    ZonedDateTime zonedDateTime10 = ZonedDateTime.of(2023, 3, 26, 4, 0, 0, 0, ZoneId.of("Europe/Brussels"));
    System.out.println(zonedDateTime10 + " / " + zonedDateTime10.toInstant());
}
```

The output below of the test shows you when the actual job will run (using the Java 8 `Instant`):
```
From summer to winter time
2022-10-30T01:00+02:00[Europe/Brussels] / 2022-10-29T23:00:00Z
2022-10-30T02:00+02:00[Europe/Brussels] / 2022-10-30T00:00:00Z
2022-10-30T02:30+02:00[Europe/Brussels] / 2022-10-30T00:30:00Z
2022-10-30T03:00+01:00[Europe/Brussels] / 2022-10-30T02:00:00Z
2022-10-30T04:00+01:00[Europe/Brussels] / 2022-10-30T03:00:00Z
From winter to summer time
2023-03-26T01:00+01:00[Europe/Brussels] / 2023-03-26T00:00:00Z
2023-03-26T03:00+02:00[Europe/Brussels] / 2023-03-26T01:00:00Z
2023-03-26T03:30+02:00[Europe/Brussels] / 2023-03-26T01:30:00Z
2023-03-26T03:00+02:00[Europe/Brussels] / 2023-03-26T01:00:00Z
2023-03-26T04:00+02:00[Europe/Brussels] / 2023-03-26T02:00:00Z
```


## Conclusion
If you are using JobRunr, you do not need to be afraid of DST - all your scheduled jobs will run! All you need to know is that some scheduled jobs may be impacted because of the change during the time change of DST and will run at most one hour earlier or later.

So, just relax and enjoy that hour of extra sleep 😴.