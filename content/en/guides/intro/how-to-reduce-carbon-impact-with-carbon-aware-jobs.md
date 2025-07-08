---
title: How To Reduce Your Carbon Impact With Carbon Aware Jobs
description: In this guide, we explore how to schedule (recurring) jobs to optimize the CO2 footprint of your server.
weight: 26 
tags:
    - Carbon Aware
    - CO2 footprint job processing
    - Job scheduling
---

In this guide, we explore how to schedule (recurring) jobs to optimize the CO2 footprint of your server. If you haven't yet familiarized yourself with basic concepts of JobRunr such as scheduling a one-off job and a recurring job using a cron expression, take a look at the [Create and schedule jobs with JobRunr using only a Java lambda](/en/guides/intro/java-lambda/) guide first before delving into this one that assumes basic job scheduling knowledge. 

## The Use Case

Suppose we need to run a job each day that calculates invoice information before sending out the generated PDF file via an email service. Our customers do not immediately need this email but we want it to be delivered at most 24 hours after triggering an action.

Let's examine what needs to be done in order to achieve this: 

1. [Configure JobRunr to be Carbon Aware](#configuring-jobrunr-to-be-carbon-aware)
2. [Add a Carbon Aware margin to your (recurring) jobs](#adding-a-carbon-aware-marin)
3. [Monitor Carbon Aware jobs in the dashboard](#inspecting-carbon-aware-jobs-in-the-dashboard)

## Configuring JobRunr To Be Carbon Aware

As described in the [Carbon Aware Configuration documentation](/en/documentation/configuration/carbon-aware/), the feature needs to be turned on by setting a few configuration properties. This depends on your preference for the Fluent API or your favourite app framework (click on the buttons on the top right to select your style).
{{< framework type="fluent-api" >}}
For the Fluent API, add `andCarbonAwareJobProcessingConfiguration()` to configure the settings:

{{< codeblock >}}
```java
JobRunr
    .configure()
    // ...
    .useBackgroundJobServer(usingStandardBackgroundJobServerConfiguration()
            .andCarbonAwareJobProcessingConfiguration(
                usingStandardCarbonAwareJobProcessingConfiguration()
                    .andAreaCode("BE")
                    // ....
            ))
    // ...
```
{{</ codeblock >}}

{{< /framework >}}
{{< framework type="spring-boot" label="Spring">}}
For Spring, configure the properties in `application.properties`:

```
jobrunr.background-job-server.carbon-aware-job-processing.enabled=true
jobrunr.background-job-server.carbon-aware-job-processing.area-code=BE
jobrunr.background-job-server.carbon-aware-job-processing.api-client-connect-timeout=500
```

{{< /framework >}}
{{< framework type="quarkus" label="Quarkus">}}
For Quarkus, configure the properties in `application.properties`:

```
quarkus.jobrunr.background-job-server.carbon-aware-job-processing.enabled=true
quarkus.jobrunr.background-job-server.carbon-aware-job-processing.area-code=BE
quarkus.jobrunr.background-job-server.carbon-aware-job-processing.api-client-connect-timeout=500
```

{{< /framework >}}
{{< framework type="micronaut" label="Micronaut">}}
For Micronaut, configure the properties in `application.yml`:

```yml
jobrunr:
    background-job-server:
        carbon-aware-job-processing:
            enabled: true
            area-code: "BE"
            api-client-connect-timeout: 500
```

{{< /framework >}}

See the [Carbon Aware Configuration documentation](/en/documentation/configuration/carbon-aware/) for all possible configuration properties and their default values. But which ones are essential? There are only two properties required to get the carbon aware feature up and running correctly:

1. Enable the feature---by setting `enabled` to true or relying on the `usingStandardCarbonAwareJobProcessingConfiguration()` for the Fluent API that implicitly enables it. 
2. Provide an area code---a [ISO 3166-2](https://en.wikipedia.org/wiki/ISO_3166-2) area code (e.g. "BE", "IT-NO", "US-CA") of the data centre where JobRunr processes jobs in order to have more accurate carbon emission forecasts. 

For our job to trigger at its optimal CO2 time---during the early morning at `7 AM`---we need to make sure our region is correctly set. Otherwise JobRunr may wrongly optimize the job when solar panels produce the most energy in Norway, while for example our data centre is located in the southern part of Italy. 

> If you do not specify an area code, the Carbon Intensity API will try to determine the area of the JobRunr cluster callee IP based on the geolocation, which obviously can be wrong if set behind a VPN.

> **Note**: Please make sure that the firewall allows the JobRunr server to reach the Carbon Intensity API by default located `api.jobrunr.io`. If not, JobRunr will fall back to scheduling the job at the fallback time.

## Add a Carbon Aware margin to your (recurring) jobs

With JobRunr, a normal recurring job is trivial to implement:

{{< codeblock title="Here we assume pdfGenService is an object available to this scope. If you're using a framework, you'd _inject_ this service." >}}
```java
jobScheduler.scheduleRecurrently("my-id", "0 2 * * *", pdfGenService->generateAndMail())
```
{{</ codeblock >}}

The cron string `0 2 * * *` will make sure the service gets called every day at `2 AM`. For this use case, we trigger it at night to avoid overloading the server during working hours, but we don't really care _when_ during the night this one is processed: as long as it's done before our business opens at `9 AM` everything is all good.

This means we can **add slack** to the specified cron string: Instead of using `0 2 * * *`, we use `0 2 * * * [PT1H/PT7H]` to some margin before/after in the [ISO 8601 duration standard](https://en.wikipedia.org/wiki/ISO_8601). In this case, we say: _run this job preferably at 2 AM, but one hour earlier and 7 hours later is also fine_. In other words: run between `1 AM` and `9 AM`.

In order to achieve this, we change the above cron string of `scheduleRecurrently()`:

{{< codeblock title="The cron string with the added carbon aware margin." >}}
```java
jobScheduler.scheduleRecurrently("my-id", "0 2 * * * [PT1H/PT7H]", pdfGenService->generateAndMail())
```
{{</ codeblock >}}

It's really that simple! For more control, other APIs are available to provide the margin. A few examples illustrate this:

{{< codeblock title="Different possibilities of scheduling a job carbon aware." >}}
```java
// Specifying the margin in the cron string
jobScheduler.scheduleRecurrently("my-id", "0 2 * * * [PT1H/PT7H]", pdfGenService->generateAndMail())
// Specifying a margin using CarbonAware.dailyBetween() that generates the string for you
jobScheduler.scheduleRecurrently("my-id", CarbonAware.dailyBetween(1, 9), pdfGenService->generateAndMail())
// Specifying a margin using Duration instances
jobScheduler.scheduleRecurrently("my-id", CarbonAware.using("0 2 * * *", Duration.ofHours(1), Duration.ofHours(7)), pdfGenService->generateAndMail())
```
{{</ codeblock >}}

Scheduling one-time fire-and-forget jobs with added slack is also possible by specifying the margin using the new `CarbonAwarePeriod` class:

{{< codeblock title="Scheduling a carbon aware job using CarbonAwarePeriod." >}}
```java
jobScheduler.schedule(CarbonAwarePeriod.between(Instant.now(), Instant.now().plus(5, HOURS)), 
  pdfGenService->generateAndMail());
```
{{</ codeblock >}}

More possibilities and examples are described in the [Carbon Aware Jobs documentation](/en/documentation/background-methods/carbon-aware-jobs/). Next, let's investigate how scheduling a Carbon Aware job works behind the scenes.


## How Carbon Aware Job Scheduling works

So when exactly is that job going to be triggered if we add a margin? **When the Carbon Aware API says the CO2 footprint will be the lowest**. This is possible by consulting external energy data providers such as [ENTSO-E](https://www.entsoe.eu/) for the European Union that returns actual energy pricing information for the coming days. 

Let's take a step back and look at the concept of carbon aware job scheduling with the help of a schematic:

![](/documentation/carbon-schematic.png "A carbon aware job timeline.")

In our example, the concepts from the schematic can be mapped as follows:

- The preferred time---your usual schedule when the job should be processed. That'll be `2 AM` in this example.
- The carbon aware margin _\[before, after\]_---This is the margin that is added to the cron schedule between brackets: `[PT1H/PT7H]`; with _before_ being `1 AM` and _after_ being `9 AM`.
- The carbon optimal time---this is a moment in the margin JobRunr selects as the optimal time when the CO2 footprint is the lowest. For example, in this schematic, this is after `2 AM`---say `7 AM`.

Suppose the sun is coming up in the early morning and `7 AM` is the peak moment at which solar panels provide a lot of energy before the clouds swoop in just as we start opening our business. During the night, solar energy is not available, hence the chance of relying on CO2-heavy energy is bigger. That could be a reason why in our case, `7 AM` is picked instead of a time _before_ the preferred time `1 AM`.


## Monitoring Carbon Aware Jobs In The Dashboard

You can track the history of your job in the JobRunr Dashboard:

![](/documentation/carbon-aware-job-scheduled-to-minimize-carbon-impact.png "An example carbon aware daily recurring job with a margin between 4 PM and 8 PM, with the local time being 3 PM. The job was scheduled at 4 PM to minimize carbon impact.")

The specified carbon aware margin can be inspected by clicking on the pending job. In the example screenshot above, it states _Job is awaiting optimal low carbon execution window between 56 minutes from now and 5 hours from now_, a state the job was put in 21 seconds ago. Then, the carbon aware task decided to schedule the job an hour from now, which is the beginning of the carbon aware margin. In our use case, we will see the job to be scheduled at `4 PM`.

Instead of immediately scheduling the job at the preferred time, the job will be created in a special initial pending state[^propending], as visible in the state diagram below. After the Carbon Aware part of JobRunr determines the optimal time for this particular job, it will be promoted to the scheduled state; ready to be picked up by the background job processor.

[^propending]: In JobRunr Pro, the pending state is also used for rate limiting.

![](/guides/carbon-states.png "A job state diagram depicting the states from the (carbon aware) pending starting state to the ending state (either succeeded or failed).")


### What Happens When Things Go Wrong

JobRunr is dependent on external data providers for determining the optimal CO2 time to reduce the carbon footprint. As such, there are many cases in which things do not go as expected. A few examples:

- The data provider does not provide energy intensity data for our specified interval
- The data provider is down
- The area code is not recognized by the data provider
- ...

No worries: JobRunr guarantees **your scheduled job will still be executed in a timely manner**! Remember the fallback time from the schematic at the beginning of this guide---the original preferred time? In case something goes wrong, the job will be scheduled at the original time. In our use case, that is `2 AM`. See the [important remarks in the docs](/en/documentation/background-methods/carbon-aware-jobs/#-important-remarks) for more information on how JobRunr handles all edge cases. Again, the dashboard is your friend here: it will show the exact _reason_ why a particular job was scheduled the way it was.  

## Conclusion

In this guide, we have uncovered how to add slack to a recurring job to minimize the carbon footprint of your job processing server. By relying on the Carbon Aware feature, you are actively contributing to improving the ecological state of the world---thank you! 🌲

To learn more about carbon aware job processing, please visit the following pages:

- Docs: [Configuration: Carbon Aware API](/en/documentation/configuration/carbon-aware/)
- Docs: [Scheduling: Carbon Aware Jobs](/en/documentation/background-methods/carbon-aware-jobs/)
- Blog: Initial announcement: [Introducing Carbon Aware Jobs in JobRunr](/en/blog/2024-03-21-carbon-aware-job-scheduling/)
