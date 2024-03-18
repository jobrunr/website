---
version: "pro"
title: "Job Result"
subtitle: "Do you need to get the result of a job? This is now easier than ever with JobRunr JobResults"
keywords: ["enqueue", "background job", "fire and forget", "enqueue jobs in bulk", "job result", "jobresults", "return jobs", "result jobs"]
date: 2020-09-16T11:12:23+02:00
layout: "documentation"
menu: 
  main: 
    identifier: results
    parent: 'jobrunr-pro'
    weight: 26
---
{{< trial-button >}}

If your job returns a result, JobRunr serializes it and stores it via the `StorageProvider` in the database of your choice.

You can then fetch the result of that job using the id of the job.
<figure>

```java

void startWeatherPrediction(UUID cityId) {
    Observation observation = observationService.getLatestObservation(cityId); // the original observation
    BackgroundJob.enqueue(myId, () -> weatherService.predictWeather(cityId, observation));
}

WeatherPrediction getWeatherPrediction(UUID cityId) {
    JobResultWithBackOffInfo jobResult = BackgroundJob.getJobResult(jobId);
    if(jobResult.isAvailable()) return jobResult.getResult();
    throw new BackOffException(Instant.now().plus(jobResult.backoffPeriod()));
}


```
<figcaption>This fetches the result of the job if it is available. If it is not yet available, JobRunr gives an estimate on when it will be available and prevent unnecessary load on the database.</figcaption>
</figure>

## How to return jobs from your Jobs?
### Returning jobs from Java 8 lambda's
<figure>

```java

WeatherPrediction predictWeather(UUID cityId) {
    // take input and do some heavy calculations
    // then, just return the result
    return new WeatherPredication(result);
}

```
<figcaption>As with any method, just return the result - JobRunr will serialize it so it is available from any server.</figcaption>
</figure>

### Returning jobs from JobRequest
<figure>

```java

public class WeatherPredictionRequest implements JobRequest {

    private UUID cityId;

    public WeatherPredictionRequest(UUID cityId) {
        this.cityId = cityId;
    }

    public UUID getCityId() {
        return cityId;
    }

    @Override
    public Class<WeatherPredictionRequestHandler> getJobRequestHandler() {
        return WeatherPredictionRequestHandler.class;
    }

}

public class WeatherPredictionRequestHandler implements JobResultRequestHandler<WeatherPredictionRequest> {

    @Override
    public WeatherPredication runAndReturn(WeatherPredictionRequest jobRequest) throws Exception {
        // take input and do some heavy calculations
        // then, just return the result
        return new WeatherPredication(result);
    }
}

```
<figcaption>For a JobRequest, just use the JobRequestHandler and return the result in the runAndReturn method.</figcaption>
</figure>

> __Important:__ a Job can only have one result. When a `SUCCEEDED` job with a Job Result is retried, only the last result is kept.

{{< trial-button >}}