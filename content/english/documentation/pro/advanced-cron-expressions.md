---
version: "pro"
title: "Advanced CRON expressions"
subtitle: "The advanced CRON expression parser of JobRunr Pro supports your most difficult scheduling requirements."
keywords: ["cron", "cron expression", "cron job expression", "cron job scheduling", "cron format", "cron examples", "cron examples", "a cron job", "cron expression example", "cron schedule expressions", "cron exp"]
date: 2020-08-27T11:12:23+02:00
layout: "documentation"
menu: 
  sidebar:
    identifier: advanced-cron-expressions
    parent: 'jobrunr-pro'
    weight: 16
---
{{< trial-button >}}

JobRunr Pro has support for more difficult CRON expressions. 

See some examples below:

<figure>

```java
BackgroundJob.scheduleRecurrently(Cron.firstDayOfTheMonth(10, 30), () -> System.out.println("First day of the month!")); 
```
<figcaption>This will run at 10:30 am on the first day of the month.</figcaption>
</figure>

<figure>

```java
BackgroundJob.scheduleRecurrently(Cron.firstBusinessDayOfTheMonth(10, 30), () -> System.out.println("First business day of the month!")); 
```
<figcaption>This will run at 10:30 am on the first business day of the month, even if the first day of the month is a Saturday or a Sunday</figcaption>
</figure>

<figure>

```java
BackgroundJob.scheduleRecurrently(Cron.lastDayOfTheMonth(10), () -> System.out.println("Last day of the month!")); 
```
<figcaption>This will run at 10:00 am on the last day of the month</figcaption>
</figure>

<figure>

```java
BackgroundJob.scheduleRecurrently(Cron.lastBusinessDayOfTheMonth(10, 30), () -> System.out.println("Last business day of the month!")); 
```
<figcaption>This will run at 10:30 am on the last business day of the month, even if the last day of the month is a Saturday or Sunday</figcaption>
</figure>


### Advanced CRON example
You can also create some more fancier CRON expressions like:
<figure>

```java
BackgroundJob.scheduleRecurrently("0 0 LW-3 * *", () -> System.out.println("Three days before the last business day of the month!")); 
```
<figcaption>This will run at midnight three days before the last business day of the month</figcaption>
</figure>

