---
title: "Carbon Aware API"
keywords: ["JobRunr Configuration"]
subtitle: "Use the Carbon Aware API to optimize the carbon footprint when scheduling (recurring) jobs."
date: 2025-06-13T09:15:00+02:00
layout: "documentation"
beta: true
menu: 
  main: 
    parent: 'configuration'
    weight: 21
---

The Carbon Aware API is a unique JobRunr feature that enables the scheduling of (recurring) jobs at the optimal carbon time: when the energy prices are at their lowest. This is made possible by integrating with external energy **data providers** such as the [ENTSO-E](https://www.entsoe.eu/) services for the European Union that provide actual energy data for the coming day(s). 

By adding a margin to the schedule of your jobs, JobRunr will execute them when the lowest amount of CO2 is being generated. A few examples:

```java
// Schedule a daily job between 14pm and 18pm
jobScheduler.scheduleRecurrently("id-1", CarbonAware.dailyBetween(14, 18), x -> x.doWork())
// Schedule a daily job between 13pm and 19pm
jobScheduler.scheduleRecurrently("id-2", "0 16 * * * [PT3H/PT3H]", x->doWork())
```

These recurring jobs will create jobs in the `AWAITING` state (see _Pending Jobs_ in the Dashboard), ready to be `SCHEDULED` at the optimal time. JobRunr guarantees that all jobs will be executed within the margin; even if there is no data available or the margin is too small.

> **More examples and details** on how to schedule carbon aware jobs can be found in the [Background methods: Carbon aware jobs](/en/documentation/background-methods/carbon-aware-jobs) section.

## Architectural overview

For jobs to be scheduled carbon aware, JobRunr needs to fetch carbon information from the _JobRunr Carbon Intensity API_ that acts as a buffer between JobRunr and ENTSO-E or any other future data provider. The API is hosted at `api.jobrunr.io/carbon-intensity` and is configurable in the [Pro Version](/en/documentation/pro/). 

> **Note**: Currently, we only support the carbon aware feature for data centres within the European Union.

Once it has carbon intensity data, you can add slack to a certain job schedule by providing a margin. JobRunr will then optimize that job within the specified margin based on the carbon intensity data. 

Below is a schematic overview of how this works:

![](/documentation/carbon-aware-context.png "The Carbon Aware API Context Diagram.")

## Configuration

To enable the Carbon Aware API, inject a `CarbonAwareJobProcessingConfiguration` into the background server configuration:

```java
JobRunr
    .configure()
    // ...
    .useBackgroundJobServer(usingStandardBackgroundJobServerConfiguration()
            .andCarbonAwaitingJobsRequestSize(1000)
            .andCarbonAwareJobProcessingConfiguration(
                usingStandardCarbonAwareJobProcessingConfiguration()
                    .andAreaCode("BE")
                    // ....
            ))
    // ...
```

> __Config remark:__ If you do not specify any carbon aware processing config, thus not enabling the carbon aware feature, but do schedule jobs with carbon aware margins, the jobs will still be scheduled at their usual time without taking the margins into account.

The awaiting jobs request size allows to set the maximum number of carbon aware jobs to update from awaiting to scheduled state per database round-trip. If not set, it will default to `1000`.

The processing config allows you to specify a few key parmeters including your area code so that the correct energy data is being taken into account. 

Of course, you can configure the Carbon Aware API with your favourite app framework such as [Spring](/en/documentation/configuration/spring/):

```
jobrunr.background-job-server.carbon-aware-job-processing.enabled=true
jobrunr.background-job-server.carbon-aware-job-processing.area-code=BE
jobrunr.background-job-server.carbon-aware-job-processing.api-client-connect-timeout=5000
```

On the carbon aware job processing configuration class, the following parameters can be configured:

- `enabled`---Enables the Carbon Aware feature. The `usingStandardCarbonAwareJobProcessingConfiguration()` Fluent API enables this by default. Without it, pending jobs will still be scheduled at their preferred time, without taking the margin into consideration.
- `areaCode`---Allows to set the [ISO 3166-2](https://en.wikipedia.org/wiki/ISO_3166-2) areaCode of your datacenter (the area where your application is hosted; e.g. "BE", "US-CA", "IT-NO") in order to have more accurate carbon emissions forecasts. Unless specified, the forecast may be from any dataProvider that supports the areaCode. If you _do not_ specify an area code, the Carbon Intensity API will try to determine the area of the JobRunr cluster callee based on IP. 
- `dataProvider`---Allows to set your preferred carbon intensity forecast dataProvider (e.g. "ENTSO-E", "Azure", ...). If you _do not_ specify a data provider, the first region matching the area code will be returned. For now, the only supported provider is "ENTSO-E".
- `externalCode`---Allows to set the code of an area as defined by your specified dataProvider in order to have more accurate carbon emissions forecasts (e.g. "IT-North").
- `externalIdentifier`---Allows to set the identifier of an area as defined by your specified dataProvider in order to have more accurate carbon emissions forecasts (e.g. "10Y1001A1001A73I"). 
- `apiClientConnectTimeout`---Allows to set the connect timeout for the API client (defaults to 3 seconds).
- `apiClientReadTimeout`---Allows to set the read timeout for the API client (defaults to 3 seconds).
- `apiClientRetriesOnException`---Configures the API client amount of retries when the call throws an exception (defaults to 3).
- {{< label version="professional" >}}JobRunr Pro{{< /label >}} `andCarbonIntensityApiUrl`---Allows to set a custom Carbon Intensity API URL to create your own implementation. The area code, data provider, external code, and external provider settings will be passed in as a request parameter.

> __Data provider remark:__ You can only set either `areaCode`, `externalCode`, or `externalIdentifier` as region keys. A `dataProvider` is required in conjunction with the `externalCode`. 

Once you have the Carbon Aware API configured, it is time to take a look at how to enhance your jobs with the carbon aware margin: see [Carbon aware jobs](/en/documentation/background-methods/carbon-aware-jobs/) in the docs.
