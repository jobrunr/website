---
title: "Carbon Aware Processing"
keywords: ["JobRunr Configuration"]
subtitle: "Use Carbon Aware Job Processing to optimize the carbon footprint when scheduling (recurring) jobs."
date: 2025-06-13T09:15:00+02:00
layout: "documentation"
menu: 
  sidebar:
    parent: 'configuration'
    weight: 21
---

Carbon Aware Job Processing is a unique JobRunr feature that enables the scheduling of (recurring) jobs at the optimal carbon time; when the lowest amount of CO2 is being generated. This is made possible by integrating with external energy **data providers** such as the [ENTSO-E](https://www.entsoe.eu/) services for the European Union that provide actual energy data for the coming day(s). 

By adding a margin to the schedule of your jobs, JobRunr will execute them when the lowest amount of CO2 is being generated. A few examples:

```java
// Schedule a daily job between 14pm and 18pm
jobScheduler.scheduleRecurrently("id-1", CarbonAware.dailyBetween(14, 18), x -> x.doWork())
// Schedule a daily job between 13pm and 19pm
jobScheduler.scheduleRecurrently("id-2", "0 16 * * * [PT3H/PT3H]", x->doWork())
```

These recurring jobs will create jobs in the `AWAITING` state (see _Pending Jobs_ in the Dashboard), ready to be `SCHEDULED` at the optimal time. JobRunr guarantees that all jobs will be executed within the margin; even if there is no data available or the margin is too small.

> **More examples and details** on how to schedule carbon aware jobs can be found in the [Background methods: Carbon aware jobs]({{< ref "documentation/background-methods/carbon-aware-jobs" >}}) section.

## Architectural overview

For jobs to be scheduled carbon aware, JobRunr needs to fetch carbon information from the _JobRunr Carbon Intensity API_ that acts as a buffer between JobRunr and ENTSO-E or any other future data provider. The API is hosted at `api.jobrunr.io/carbon-intensity` and is configurable in [JobRunr Pro]({{< ref "documentation/pro" >}}). 

> **Note**: Please make sure that the firewall allows the JobRunr server to reach `api.jobrunr.io`. If not, JobRunr will fall back to regular scheduling. See [carbon aware jobs: important remarks]({{< ref "documentation/background-methods/carbon-aware-jobs/#-important-remarks" >}}).

> **Note**: Currently, we only support the carbon aware feature for data centres within the European Union.

Once it has carbon intensity data, you can add slack to a certain job schedule by providing a margin. JobRunr will then optimize that job within the specified margin based on the carbon intensity data. 

Below is a schematic overview of how this works:

![](/documentation/carbon-aware-context.png "The Carbon Aware API Context Diagram.")

## Configuration

To enable Carbon Aware Job Processing, inject a `CarbonAwareJobProcessingConfiguration` into the background server configuration:

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

The processing config allows you to specify a few key parmeters including your area code so that the correct energy data is being taken into account. If you have no idea which region to select, the Carbon Intensity API lists all supported areas at https://api.jobrunr.io/carbon-intensity/areas!

Of course, you can configure the Carbon Aware API with your favourite app framework such as [Spring]({{< ref "documentation/configuration/spring" >}}):

```
jobrunr.background-job-server.carbon-aware-job-processing.enabled=true
jobrunr.background-job-server.carbon-aware-job-processing.area-code=BE
jobrunr.background-job-server.carbon-aware-job-processing.api-client-connect-timeout=5000ms
jobrunr.background-job-server.carbon-aware-job-processing.poll-interval-in-minutes=5
```

On the carbon aware job processing configuration class, the following parameters can be configured:

- `enabled`---Enables the Carbon Aware feature. The `usingStandardCarbonAwareJobProcessingConfiguration()` Fluent API enables this by default. Without it, pending jobs will still be scheduled at their preferred time, without taking the margin into consideration.
- `areaCode`---Allows to set the [ISO 3166-2](https://en.wikipedia.org/wiki/ISO_3166-2) areaCode of your datacenter (the area where your application is hosted; e.g. "BE", "US-CA", "IT-NO") in order to have more accurate carbon emissions forecasts. Unless specified, the forecast may be from any dataProvider that supports the areaCode. If you _do not_ specify an area code, the Carbon Intensity API will try to determine the area of the JobRunr cluster callee based on IP. 
- `dataProvider`---Allows to set your preferred carbon intensity forecast dataProvider (e.g. "ENTSO-E", "Azure", ...). If you _do not_ specify a data provider, the first region matching the area code will be returned. For now, the only supported provider is "ENTSO-E". The Carbon Intensity API lists all supported data providers at https://api.jobrunr.io/carbon-intensity/providers. 
- `externalCode`---Allows to set the code of an area as defined by your specified dataProvider in order to have more accurate carbon emissions forecasts (e.g. "IT-North").
- `externalIdentifier`---Allows to set the identifier of an area as defined by your specified dataProvider in order to have more accurate carbon emissions forecasts (e.g. "10Y1001A1001A73I"). 
- `apiClientConnectTimeout`---Allows to set the connect timeout for the API client (defaults to 3 seconds).
- `apiClientReadTimeout`---Allows to set the read timeout for the API client (defaults to 3 seconds).
- `apiClientRetriesOnException`---Configures the API client amount of retries when the call throws an exception (defaults to 3).
- {{< badge version="professional" >}}JobRunr Pro{{< /badge >}} `andCarbonIntensityApiUrl`---Allows to set a custom Carbon Intensity API URL to create your own implementation. The area code, data provider, external code, and external provider settings will be passed in as a request parameter.
- `pollIntervalInMinutes`---Allows to configure how often Carbon Aware Awaiting jobs will be picked up and processed (defaults to 5 minutes).

> __Data provider remark:__ You can only set either `areaCode`, `externalCode`, or `externalIdentifier` as region keys. A `dataProvider` is required in conjunction with the `externalCode`. 

Once you have Carbon Aware Job Processing configured, it is time to take a look at how to enhance your jobs with the carbon aware margin: see [Carbon aware jobs]({{< ref "documentation/background-methods/carbon-aware-jobs" >}}) in the docs.

## Available Areas

The Carbon Intensity API provides carbon intensity forecasts through various data providers, each covering different geographical regions.

### 🚧 Data Providers

Below are the data providers integrated with the Carbon Intensity API:

<!-- <div id="providers-container" class="data-providers"></div> -->
🚧 Coming soon!

### 🚧 Areas

The following table lists all geographical areas currently supported by the Carbon Intensity API:

<!-- <div class="my-6">
    <div class="mb-4">
    <input type="text" id="areas-search" placeholder="Search areas..." class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
    </div>
    <div id="areas-table"></div>
</div> -->

<!-- <script type="text/javascript" src="https://unpkg.com/tabulator-tables@6.3.0/dist/js/tabulator.min.js"></script> -->

🚧 Coming soon!

<script>
// Data providers configuration
const providersData = [
  {
    name: 'ENTSO-E',
    displayName: 'European Network of Transmission System Operators for Electricity',
    description: 'ENTSO-E provides comprehensive electricity market data across Europe, including real-time generation mix and carbon intensity information for all EU member states.',
    updateFrequency: 'Daily',
    areaCount: 32
  }
  // More providers will be added here as they become available
];

function renderProviderCard(provider) {
  return `
    <article class="card">
        <div class="card__header">
            <div class="card__title__container">
                <h4 class="card__title">${provider.name}</h4>
                <span class="update-frequency">Update: ${provider.updateFrequency}</span>
            </div>
            <div class="card__subtitle">${provider.displayName}</div>
        </div>
        <p class="card__content">${provider.description}</p>
        <div class="card__footer">
            <a href="#available-areas" class="text-xs text-blue-600 hover:text-blue-800 hover:underline font-medium whitespace-nowrap">${provider.areaCount} areas →</a>
        </div>
    </article>
  `;
}

// Initial render
document.getElementById('providers-container').innerHTML = providersData.map(renderProviderCard).join('');


// Example data - this would be dynamically loaded from API
const data = [
  { displayName: 'Austria', areaCode: 'AT', externalCode: null, externalIdentifier: '10YAT-APG------L', timezone: 'Europe/Vienna', provider: 'ENTSO-E' },
  { displayName: 'Belgium', areaCode: 'BE', externalCode: null, externalIdentifier: '10YBE----------2', timezone: 'Europe/Brussels', provider: 'ENTSO-E' },
  { displayName: 'Bulgaria', areaCode: 'BG', externalCode: null, externalIdentifier: '10YCA-BULGARIA-R', timezone: 'Europe/Sofia', provider: 'ENTSO-E' },
  { displayName: 'Croatia', areaCode: 'HR', externalCode: null, externalIdentifier: '10YHR-HEP------M', timezone: 'Europe/Zagreb', provider: 'ENTSO-E' },
  { displayName: 'Czech Republic', areaCode: 'CZ', externalCode: null, externalIdentifier: '10YCZ-CEPS-----N', timezone: 'Europe/Prague', provider: 'ENTSO-E' },
  { displayName: 'Denmark - West', areaCode: 'DK', externalCode: 'DK-West', externalIdentifier: '10YDK-1--------W', timezone: 'Europe/Copenhagen', provider: 'ENTSO-E' },
  { displayName: 'Denmark - East', areaCode: 'DK', externalCode: 'DK-East', externalIdentifier: '10YDK-2--------M', timezone: 'Europe/Copenhagen', provider: 'ENTSO-E' },
  { displayName: 'Estonia', areaCode: 'EE', externalCode: null, externalIdentifier: '10Y1001A1001A39I', timezone: 'Europe/Tallinn', provider: 'ENTSO-E' },
  { displayName: 'Finland', areaCode: 'FI', externalCode: null, externalIdentifier: '10YFI-1--------U', timezone: 'Europe/Helsinki', provider: 'ENTSO-E' },
  { displayName: 'France', areaCode: 'FR', externalCode: null, externalIdentifier: '10YFR-RTE------C', timezone: 'Europe/Paris', provider: 'ENTSO-E' },
  { displayName: 'Germany', areaCode: 'DE', externalCode: null, externalIdentifier: '10Y1001A1001A83F', timezone: 'Europe/Berlin', provider: 'ENTSO-E' },
  { displayName: 'Greece', areaCode: 'GR', externalCode: null, externalIdentifier: '10YGR-HTSO-----Y', timezone: 'Europe/Athens', provider: 'ENTSO-E' },
  { displayName: 'Hungary', areaCode: 'HU', externalCode: null, externalIdentifier: '10YHU-MAVIR----U', timezone: 'Europe/Budapest', provider: 'ENTSO-E' },
  { displayName: 'Ireland', areaCode: 'IE', externalCode: null, externalIdentifier: '10YIE-1001A00010', timezone: 'Europe/Dublin', provider: 'ENTSO-E' },
  { displayName: 'Italy - North', areaCode: 'IT', externalCode: 'IT-North', externalIdentifier: '10Y1001A1001A73I', timezone: 'Europe/Rome', provider: 'ENTSO-E' },
  { displayName: 'Italy - Central North', areaCode: 'IT', externalCode: 'IT-CentralNorth', externalIdentifier: '10Y1001A1001A70O', timezone: 'Europe/Rome', provider: 'ENTSO-E' },
  { displayName: 'Italy - Central South', areaCode: 'IT', externalCode: 'IT-CentralSouth', externalIdentifier: '10Y1001A1001A71M', timezone: 'Europe/Rome', provider: 'ENTSO-E' },
  { displayName: 'Italy - South', areaCode: 'IT', externalCode: 'IT-South', externalIdentifier: '10Y1001A1001A788', timezone: 'Europe/Rome', provider: 'ENTSO-E' },
  { displayName: 'Latvia', areaCode: 'LV', externalCode: null, externalIdentifier: '10YLV-1001A00074', timezone: 'Europe/Riga', provider: 'ENTSO-E' },
  { displayName: 'Lithuania', areaCode: 'LT', externalCode: null, externalIdentifier: '10YLT-1001A0008Q', timezone: 'Europe/Vilnius', provider: 'ENTSO-E' },
  { displayName: 'Netherlands', areaCode: 'NL', externalCode: null, externalIdentifier: '10YNL----------L', timezone: 'Europe/Amsterdam', provider: 'ENTSO-E' },
  { displayName: 'Norway - South', areaCode: 'NO', externalCode: 'NO-South', externalIdentifier: '10YNO-2--------T', timezone: 'Europe/Oslo', provider: 'ENTSO-E' },
  { displayName: 'Norway - North', areaCode: 'NO', externalCode: 'NO-North', externalIdentifier: '10YNO-4--------9', timezone: 'Europe/Oslo', provider: 'ENTSO-E' },
  { displayName: 'Poland', areaCode: 'PL', externalCode: null, externalIdentifier: '10YPL-AREA-----S', timezone: 'Europe/Warsaw', provider: 'ENTSO-E' },
  { displayName: 'Portugal', areaCode: 'PT', externalCode: null, externalIdentifier: '10YPT-REN------W', timezone: 'Europe/Lisbon', provider: 'ENTSO-E' },
  { displayName: 'Romania', areaCode: 'RO', externalCode: null, externalIdentifier: '10YRO-TEL------P', timezone: 'Europe/Bucharest', provider: 'ENTSO-E' },
  { displayName: 'Slovakia', areaCode: 'SK', externalCode: null, externalIdentifier: '10YSK-SEPS-----K', timezone: 'Europe/Bratislava', provider: 'ENTSO-E' },
  { displayName: 'Slovenia', areaCode: 'SI', externalCode: null, externalIdentifier: '10YSI-ELES-----O', timezone: 'Europe/Ljubljana', provider: 'ENTSO-E' },
  { displayName: 'Spain', areaCode: 'ES', externalCode: null, externalIdentifier: '10YES-REE------0', timezone: 'Europe/Madrid', provider: 'ENTSO-E' },
  { displayName: 'Sweden - South', areaCode: 'SE', externalCode: 'SE-South', externalIdentifier: '10Y1001A1001A44P', timezone: 'Europe/Stockholm', provider: 'ENTSO-E' },
  { displayName: 'Sweden - North', areaCode: 'SE', externalCode: 'SE-North', externalIdentifier: '10Y1001A1001A45N', timezone: 'Europe/Stockholm', provider: 'ENTSO-E' },
  { displayName: 'Switzerland', areaCode: 'CH', externalCode: null, externalIdentifier: '10YCH-SWISSGRIDZ', timezone: 'Europe/Zurich', provider: 'ENTSO-E' }
];

// Initialize Tabulator
const table = new Tabulator("#areas-table", {
  data: data,
  height: 500,
  layout: "fitColumns",
  virtualDom: true,
  virtualDomBuffer: 300,
  rowHeight: 38,
  selectableRows: 1,
  columns: [
    { title: "Display Name", field: "displayName", sorter: "string", minWidth: 200 },
    { title: "Area Code", field: "areaCode", sorter: "string"},
    { title: "External Code", field: "externalCode", sorter: "string", formatter: (cell) => cell.getValue() || '-' },
    { title: "External Identifier", field: "externalIdentifier", sorter: "string", formatter: (cell) => cell.getValue() || '-' },
    { title: "Timezone", field: "timezone", sorter: "string" },
    { title: "Provider", field: "provider", sorter: "string" }
  ],
  placeholder: "No areas found",
  initialSort: [
    { column: "displayName", dir: "asc" }
  ]
});

// Global search functionality
document.getElementById("areas-search").addEventListener("keyup", function() {
  table.setFilter([
    [
      { field: "displayName", type: "like", value: this.value },
      { field: "areaCode", type: "like", value: this.value },
      { field: "externalCode", type: "like", value: this.value },
      { field: "externalIdentifier", type: "like", value: this.value },
      { field: "timezone", type: "like", value: this.value },
      { field: "provider", type: "like", value: this.value }
    ]
  ]);
});

table.on("rowSelectionChanged", function(data, rows){
  document.getElementById("selected-rows").innerHTML = data.length;
});
</script>