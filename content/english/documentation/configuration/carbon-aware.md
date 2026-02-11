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

> More examples and details on how to schedule carbon aware jobs can be found in the [Background methods: Carbon aware jobs]({{< ref "documentation/background-methods/carbon-aware-jobs" >}}) section.

## Architectural overview

For jobs to be scheduled carbon aware, JobRunr needs to fetch carbon information from the _JobRunr Carbon Intensity API_ that acts as a buffer between JobRunr and ENTSO-E or any other future data provider. The API is hosted at `api.jobrunr.io/carbon-intensity` and is configurable in [JobRunr Pro]({{< ref "documentation/pro" >}}). 

> [!IMPORTANT]
> Please make sure that the firewall allows the JobRunr server to reach `api.jobrunr.io`. If not, JobRunr will fall back to regular scheduling. See [carbon aware jobs: important remarks]({{< ref "documentation/background-methods/carbon-aware-jobs/#-important-remarks" >}}).

Once it has carbon intensity data, you can add slack to a certain job schedule by providing a margin. JobRunr will then optimize that job within the specified margin based on the carbon intensity data. 

Below is a schematic overview of how this works:

![](/documentation/carbon-aware-context.png "The Carbon Aware API Context Diagram.")

## Available Areas

The Carbon Intensity API provides carbon intensity forecasts through various data providers, each covering different geographical regions.

### Data Providers

Below are the data providers integrated with the Carbon Intensity API:

<div id="providers-container" class="data-providers"></div>
<div id="providers-error-container"></div>

### Areas

The following table lists all geographical areas currently supported by the Carbon Intensity API:

<div class="my-6">
    <div class="mb-4">
    <input type="text" id="areas-search" placeholder="Search areas..." class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
    </div>
    <div id="areas-table"></div>
</div>

## Configuration

To enable Carbon Aware Job Processing, configure a `CarbonAwareJobProcessingConfiguration` with your area code so that the correct energy data is taken into account. If you're unsure which region to select, browse the [supported areas above](#areas).

> [!TIP]
> Selecting an area, by clicking on a row, in the [above list of supported areas]({{< ref "#areas" >}}) will automatically update the below configuration examples to your chosen area.

<div id="config-examples">
{{< codetabs category="config-style" >}}
{{< codetab label="Fluent API" >}}
```java
JobRunr
    .configure()
    // ...
    .useBackgroundJobServer(usingStandardBackgroundJobServerConfiguration()
            .andCarbonAwaitingJobsRequestSize(1000)
            .andCarbonAwareJobProcessingConfiguration(
                usingStandardCarbonAwareJobProcessingConfiguration()
                    .andAreaCode("BE")
                    .andDataProvider("ENTSO-E")
            ))
    // ...
```
{{< /codetab >}}

{{< codetab label="Properties" >}}
```properties
jobrunr.background-job-server.carbon-aware-job-processing.enabled=true
jobrunr.background-job-server.carbon-aware-job-processing.area-code=BE
jobrunr.background-job-server.carbon-aware-job-processing.data-provider=ENTSO-E
jobrunr.background-job-server.carbon-aware-job-processing.api-client-connect-timeout=5000ms
jobrunr.background-job-server.carbon-aware-job-processing.poll-interval-in-minutes=5
```
{{< /codetab >}}

{{< codetab label="YAML" >}}
```yaml
jobrunr:
  background-job-server:
    carbon-aware-job-processing:
      enabled: true
      area-code: BE
      data-provider: ENTSO-E
      api-client-connect-timeout: 5000ms
      poll-interval-in-minutes: 5
```
{{< /codetab >}}
{{< /codetabs >}}
</div>

> [!IMPORTANT]
> If you do not specify any carbon aware processing config, thus not enabling the carbon aware feature, but do schedule jobs with carbon aware margins, the jobs will still be scheduled at their usual time without taking the margins into account.

The awaiting jobs request size allows to set the maximum number of carbon aware jobs to update from awaiting to scheduled state per database round-trip. If not set, it will default to `1000`.

On the carbon aware job processing configuration class, the following parameters can be configured:

- `enabled`---Enables the Carbon Aware feature. The `usingStandardCarbonAwareJobProcessingConfiguration()` Fluent API enables this by default. Without it, pending jobs will still be scheduled at their preferred time, without taking the margin into consideration.
- `areaCode`---Allows to set the [ISO 3166-2](https://en.wikipedia.org/wiki/ISO_3166-2) areaCode of your datacenter (the area where your application is hosted; e.g. "BE", "US-CA", "IT-NO") in order to have more accurate carbon emissions forecasts. Unless specified, the forecast may be from any dataProvider that supports the areaCode. If you _do not_ specify an area code, the Carbon Intensity API will try to determine the area of the JobRunr cluster callee based on IP. [See above]({{< ref "#areas" >}}) for the list of supported areas.
- `dataProvider`---Allows to set your preferred carbon intensity forecast dataProvider (e.g. "ENTSO-E", "Azure", ...). If you _do not_ specify a data provider, the first region matching the area code will be returned. [See above]({{< ref "#data-providers" >}}) for the list of supported carbon intensity providers.
- `externalCode`---Allows to set the code of an area as defined by your specified dataProvider in order to have more accurate carbon emissions forecasts (e.g. "IT-North").
- `externalIdentifier`---Allows to set the identifier of an area as defined by your specified dataProvider in order to have more accurate carbon emissions forecasts (e.g. "10Y1001A1001A73I"). 
- `apiClientConnectTimeout`---Allows to set the connect timeout for the API client (defaults to 3 seconds).
- `apiClientReadTimeout`---Allows to set the read timeout for the API client (defaults to 3 seconds).
- `apiClientRetriesOnException`---Configures the API client amount of retries when the call throws an exception (defaults to 3).
- {{< badge version="professional" >}}JobRunr Pro{{< /badge >}} `andCarbonIntensityApiUrl`---Allows to set a custom Carbon Intensity API URL to create your own implementation. The area code, data provider, external code, and external provider settings will be passed in as a request parameter.
- `pollIntervalInMinutes`---Allows to configure how often Carbon Aware Awaiting jobs will be picked up and processed (defaults to 5 minutes).

> [!NOTE]
> You can only set either `areaCode`, `externalCode`, or `externalIdentifier` as region keys. A `dataProvider` is required in conjunction with the `externalCode` or `externalIdentifier`. 

Once you have Carbon Aware Job Processing configured, it is time to take a look at how to enhance your jobs with the carbon aware margin: see [Carbon aware jobs]({{< ref "documentation/background-methods/carbon-aware-jobs" >}}) in the docs.

<script type="text/javascript" src="https://unpkg.com/tabulator-tables@6.3.0/dist/js/tabulator.min.js"></script>

<script>
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
            <a href="#areas" onclick="filterByProvider('${provider.name}')" class="text-xs text-blue-600 hover:text-blue-800 hover:underline font-medium whitespace-nowrap">${provider.amountOfSupportedAreas} areas →</a>
        </div>
    </article>
  `;
}

fetch('https://api.jobrunr.io/carbon-intensity/data-providers')
  .then(response => response.json())
  .then(providers => {
    document.getElementById('providers-container').innerHTML = providers.map(renderProviderCard).join('');
  })
  .catch((error) => {
    document.getElementById('providers-error-container').innerHTML = `<div class="error-container"><i class="fa-solid fa-circle-exclamation"></i><p>Unable to load data providers. Cause: ${error.message}</p></div>`;
  });


let table;

fetch('https://api.jobrunr.io/carbon-intensity/areas')
  .then(response => response.json())
  .then(areas => {
    table = new Tabulator("#areas-table", {
      data: areas,
      height: 500,
      layout: "fitColumns",
      virtualDom: true,
      virtualDomBuffer: 300,
      rowHeight: 38,
      selectableRows: 1,
      columns: [
        { title: "Name", field: "displayName", sorter: "string", minWidth: 200, formatter: (cell) => {
          const mainArea = cell.getRow().getData().mainAreaDisplayName;
          if (mainArea) {
            return `<span class="flex items-center"><i class="fa-solid fa-circle area-alias" title="Alias of ${mainArea}"></i>${cell.getValue()}<span>`;
          }
          return cell.getValue();
        }},
        { title: "Code", field: "code", sorter: "string", width: 120 },
        { title: "External Code", field: "externalCode", sorter: "string", formatter: (cell) => cell.getValue() || '-' },
        { title: "External Identifier", field: "externalIdentifier", sorter: "string", formatter: (cell) => cell.getValue() || '-' },
        { title: "Timezone", field: "timezone", sorter: "string" },
        { title: "Provider", field: "dataProvider", sorter: "string" }
      ],
      placeholder: "No areas found",
      initialSort: [
        { column: "displayName", dir: "asc" }
      ]
    });

    table.on("rowSelected", function(row) {
      updateConfigExamples(row.getData());
    });
  })
  .catch((error) => {
    document.getElementById('areas-table').innerHTML = `<div class="error-container"><i class="fa-solid fa-circle-exclamation"></i><p>Unable to load areas. Cause: ${error.message}</p></div>`;
  });

function filterByProvider(providerName) {
  if (table) {
    document.getElementById('areas-search').value = providerName;
    table.setFilter('dataProvider', '=', providerName);
  }
}

document.getElementById("areas-search").addEventListener("keyup", function() {
    table?.setFilter([
      [
        { field: "displayName", type: "like", value: this.value },
        { field: "code", type: "like", value: this.value },
        { field: "externalCode", type: "like", value: this.value },
        { field: "externalIdentifier", type: "like", value: this.value },
        { field: "timezone", type: "like", value: this.value },
        { field: "dataProvider", type: "like", value: this.value },
        { field: "mainAreaDisplayName", type: "like", value: this.value }
      ]
    ]);
});

let currentAreaCode = 'BE';
let currentDataProvider = 'ENTSO-E';

function escapeRegex(str) {
  return str.replace(/-/g, '\\-');
}

function updateConfigExamples(area) {
  const container = document.getElementById('config-examples');
  if (!container) return;

  const oldCode = escapeRegex(currentAreaCode);
  const newCode = area.code;
  const oldProvider = escapeRegex(currentDataProvider);
  const newProvider = area.dataProvider;

  container.querySelectorAll('pre code').forEach(codeBlock => {
    let html = codeBlock.innerHTML;
    // Java: andAreaCode("XX") and andDataProvider("YY")
    html = html.replace(new RegExp(`(andAreaCode.*?")${oldCode}(")`), `$1${newCode}$2`);
    html = html.replace(new RegExp(`(andDataProvider.*?")${oldProvider}(")`), `$1${newProvider}$2`);
    // Properties: area-code=XX and data-provider=YY
    html = html.replace(new RegExp(`(area-code.*?=.*?)${oldCode}(\\s|<|$)`), `$1${newCode}$2`);
    html = html.replace(new RegExp(`(data-provider.*?=.*?)${oldProvider}(\\s|<|$)`), `$1${newProvider}$2`);
    // YAML: area-code: XX and data-provider: YY
    html = html.replace(new RegExp(`(area-code.*?:.*?>)${oldCode}(<)`), `$1${newCode}$2`);
    html = html.replace(new RegExp(`(data-provider.*?:.*?>)${oldProvider}(<)`), `$1${newProvider}$2`);
    codeBlock.innerHTML = html;
  });

  currentAreaCode = newCode;
  currentDataProvider = newProvider;
}
</script>
