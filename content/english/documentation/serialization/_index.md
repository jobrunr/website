---
title: "Serialization"
description: "JobRunr supports multiple JSON serialization libraries - choose the one that fits your stack"
layout: "documentation"
menu:
  sidebar:
    identifier: serialization
    weight: 11
---

JobRunr relies on JSON serialization to persist background jobs to your chosen `StorageProvider`. When you enqueue or schedule a job, JobRunr serializes the job details - including the method signature, parameters, and metadata - into JSON format. This serialized data is then stored in your database and later deserialized when the job is ready to be executed.

## Supported JSON libraries

JobRunr supports the following JSON serialization libraries out of the box:

- **[Jackson 2](jackson2)** - Jackson version 2.x
- **[Jackson 3](jackson3)** - Jackson version 3.x
- **[Gson](gson)** - Google's JSON library
- **[JSON-B](jsonb)** - Jakarta EE standard for JSON binding
- **[Kotlin Serialization](kotlinx-serialization)** - Kotlin's multi-platform serialization library

> You must include at least one of these libraries as a dependency in your project. JobRunr will automatically detect which library is available on the classpath and use it for serialization.

## How it works

JobRunr automatically detects which JSON library you have on your classpath and configures itself accordingly. If you have multiple libraries available, you can also configure a custom `JsonMapper` to control which one is used. The order of preference is as follows:

1. Kotlin Serialization
2. Jackson 3
3. Jackson 2
4. Gson
5. JSON-B

When you create a background job, JobRunr serializes the class and method to be executed, all method parameters and their types, and job metadata like name, labels, and retry configuration. This serialized JSON is stored in your `StorageProvider` and later used to recreate and execute the job on a background server.

## Custom `JsonMapper` implementation

If the built-in JSON libraries don't meet your needs, or if you need specific serialization configuration, you can provide your own `JsonMapper` implementation. This is useful when you need custom serializers, specific module configurations, or want to use a different JSON library altogether.

To create a custom `JsonMapper`, implement the `org.jobrunr.utils.mapper.JsonMapper` interface and configure JobRunr to use your implementation through the configuration API for your framework. You can take inspiration from the existing `JsonMapper` implementations in JobRunr's codebase, such as `JacksonJsonMapper`, `GsonJsonMapper`, or `JsonBJsonMapper`.

### Testing your custom implementation

Custom `JsonMapper` implementations must be thoroughly tested to ensure compatibility with JobRunr's serialization requirements. You should extend the following test classes from JobRunr's test suite:

1. `AbstractJsonMapperTest` - Tests basic JSON serialization and deserialization functionality
2. `JobMapperTest` - Tests job-specific serialization including lambdas and job parameters
3. `JobRunrDashboardWebServerTest` - Tests dashboard-related JSON serialization

For full confidence in your implementation, also extend:

4. `InMemoryStorageProviderTest` - Comprehensive integration tests with the storage layer

JobRunr's testing is quite extensive and some tests are there for legacy reasons, feel free to disable test cases that are not relevant to your use case.

> Testing is critical when implementing a custom `JsonMapper`. JobRunr's serialization requirements are complex, and incomplete testing can lead to job execution failures in production.


## Important considerations

- **Simple arguments** - Job parameters are serialized and stored in your database. Large JSON payloads also increase database load and add unnecessary serialization overhead. Pass IDs instead of entire entities to minimize storage overhead.
- **Interoperability** - Test extensively when switching to another `JsonMapper`, JobRunr does not guarantee interoperability.
- **Code consistency** - All servers must run the same code version. Method signature changes between deploys may cause job execution to fail.