---
title: "Testing"
description: "You've just integrated JobRunr into your application. Here's how to test your integration and make sure everything is working as expected."
date: 2026-10-06T10:00:00+02:00
lastmod: 2026-10-06T10:00:00+02:00
layout: "documentation"
menu:
  sidebar:
    identifier: testing
    name: Testing
    weight: 55
sitemap:
  priority: 0.8
  changeFreq: monthly
---

Testing is a key part of JobRunr. The library itself is thoroughly tested, so you can focus on testing your own code. JobRunr is lightweight, and because you write your jobs in the JVM language or framework of your choice, testing them is often just like testing any other service in your application.

The examples below reuse the newsletter service from the [Getting started]({{< ref "documentation/getting-started/java" >}}), available as a complete project at [jobrunr-examples/java-app](https://github.com/jobrunr/jobrunr-examples/tree/main/java-app). They use plain Java without a framework. If you use Spring Boot, Quarkus or Micronaut, also read [Framework-specific test setup](#framework-specific-test-setup).

## Testing your JobRunr integration

Before writing tests, it helps to know what JobRunr already tests and what you need to test yourself.

JobRunr’s own test suite covers its APIs, including persistence, retrieval, processing, and failure handling. This ensures that when you hand a job to JobRunr, it is persisted, retrieved and processed correctly, with failures handled as expected. You can therefore focus your tests on the code and integration points specific to your application.

In practice, this means testing that your job methods produce the expected results and that your application creates the right jobs with the expected arguments, schedules, and state. You should also verify that your JobRunr setup is correctly wired together, e.g., you want to make sure that you've configured the correct database.

## Testing your job methods

Most of your tests should live at this level. A job method is just a regular method: instantiate the service, provide its collaborators, call the method, and assert the result. There’s no need to involve any JobRunr machinery.

```java
class EmailServiceTest {

    private final EmailService emailService = new EmailService();
    
    @Test
    void sendConfirmation() {
        String output = captureOutput(() -> emailService.sendConfirmation("alice@example.com"));

        assertThat(output).isEqualTo("Confirmation email sent to alice@example.com");
    }
}
```

The same applies to a JobRequestHandler: call run(request) directly. With this we know that once JobRunr calls the method, then the result will be as expected. Also note that the test is focused in testing the business logic. There are a few exceptions where we can't help but involve JobRunr in the test as we'll see next.

> You may be wondering what `captureOutput` is for. In the getting started for Java, we're printing with `System.out`, `captureOutput` helps in capturing the message. It's out of scope for this example so we're not showing the code. Also, typically, you'd assert that a `MailClient` handled the email.

## The JobRunr test fixtures

A quick introduction of the **test fixtures**. Several helpers on this page come from JobRunr's test fixtures, published alongside the library under the `test-fixtures` classifier. They give you:

- **Assertions** - `JobRunrAssertions` easing assertions several JobRunr components: `Job`, `RecurringJob`, `JobDetail`, `BackgroundJobServer`, ... `JobRunrAssertions` is an extension of `Assertions` from [assertj](https://assertj.github.io/doc/).
- **Builders** - `JobTestBuilder`, `JobDetailsTestBuilder`, and `RecurringJobTestBuilder` to build jobs in any state without going through the scheduler.
- **Server helpers** - `MockThreadLocalJobContext` and `LogAllStateChangesFilter`.
- **Abstract test classes** - `JobRunrDashboardWebServerTest`, `StorageProviderTest`, `AbstractJsonMapperTest`, ...

Add them to as test dependencies:

{{< codetabs category="dependency" label="Build tool" >}}
{{< codetab label="Maven" >}}
```xml
<dependency>
  <groupId>org.jobrunr</groupId>
  <artifactId>jobrunr</artifactId>
  <version>{{< param "JobRunrVersion" >}}</version>
  <classifier>test-fixtures</classifier>
  <scope>test</scope>
</dependency>
```
{{< /codetab >}}
{{< codetab label="Gradle" >}}
```groovy
testImplementation 'org.jobrunr:jobrunr:{{< param "JobRunrVersion" >}}:test-fixtures'
```
{{< /codetab >}}
{{< /codetabs >}}

> [!PRO]
> In JobRunr Pro, use `jobrunr-pro` instead of `jobrunr`.

## Testing methods with a `JobContext` parameter

Some jobs use `JobContext` to interact with JobRunr while they are running. For example, to log messages to the dashboard, track progress, add custom metadata, or access information about the current job.

To test jobs that use a `JobContext`, use `MockThreadLocalJobContext` from JobRunr's test fixtures. It provides a mock `JobContext` that you can use in your test, regardless of whether your job receives the `JobContext` as a parameter or obtains it through `ThreadLocalJobContext`.

When enqueueing a job that takes a `JobContext` parameter, you'd use `JobContext.Null` as the placeholder. Don't use `JobContext.Null` when testing the job itself, as calling methods on it will result in a `NullPointerException`.

For the sake of demonstration, let's modify the `sendWeeklyDigest` on our `EmailService` from the getting started example to require a `JobContext`:

```java
public void sendWeeklyDigest(JobContext jobContext) {
    JobDashboardProgressBar progressBar = jobContext.progressBar(100);

    IO.println("Weekly digest sent to all subscribers");

    progressBar.setProgress(100);
}
```

If you're not yet familiar with the progress bar, take some time to [read the documentation]({{< ref "documentation/background-methods/logging-progress" >}}).

As mentioned earlier, calling `emailService.sendWeeklyDigest(JobContext.Null)` directly will result in a `NullPointerException`. Instead, we set up a job context for the test and pass that context to the method:

```java
@Test
void sendWeeklyDigest() throws Exception {
    try(var ignored = new MockThreadLocalJobContext()) {
        MockThreadLocalJobContext.setUpJobContextForJob( {{< conum 1 >}}
            JobTestBuilder.aJobInProgress().build() {{< conum 2 >}}
        );

        String output = captureOutput(() -> emailService.sendWeeklyDigest(
            ThreadLocalJobContext.getJobContext() {{< conum 3 >}}
        ));

        assertThat(output).isEqualTo("Weekly digest sent to all subscribers");
    }
}
```

{{< conum-legend >}}
1. We call `setUpJobContextForJob` to create and initialize a context for the given job.
2. We use `JobTestBuilder`, from test-fixtures, to create a Job. This is sufficient in most cases, but your method may access the job's metadata (for example, to check its signature or label). In that case, the builder allows you to preset the required information.
3. We retrieve and pass the context we just set up.
{{< /conum-legend >}}


The `try`-with-resources block clears the thread-local afterwards, so context does not leak between tests.

## Testing that your code creates jobs

Earlier, we focused on testing the job method itself and verifying that it produces the expected result. Another essential step is to ensure that jobs are registered correctly. Going back to our newsletter example, we can verify that a job is created after calling the `subscribe` endpoint as follows:

```java
import static org.jobrunr.JobRunrAssertions.assertThat;

@Test
void subscribeEndpointEnqueuesConfirmationEmail() throws Exception {
    String email = "alice@example.com";

    HttpResponse<String> response = post("/subscribe?email=" + email);

    assertThat(response.statusCode()).isEqualTo(202);
    Job job = JobRunr.getStorageProvider().getJobById(jobIdFrom(response)); {{< conum 1 >}}
    assertThat(job)
            .hasJobDetails(EmailService.class, "sendConfirmation", email); {{< conum 2 >}}
}
```

This is an integrated test, we hit the endpoint and expect that a job is saved in the database.

{{< conum-legend >}}
1. We get a job from the `StorageProvider` the application is using. Here, we use the `id` returned by the endpoint to query it.
1. We then assert that the job is correctly configured, by checking that it has the expected class, method name and parameter. We could assert on other fields such as the job's name, labels or state.
{{< /conum-legend >}}

> [!TIP]
> For deterministic job creation tests, disable the `BackgroundJobServer`, especially when you need to assert the current state. If you're using the Fluent API to configure JobRunr, you'll need to adjust your setup accordingly. If you've integrated JobRunr with a JVM framework, you can typically achieve this by disabling the `BackgroundJobServer` auto-configuration, for example, through configuration properties. In that case, also inject the `StorageProvider` instead of using `JobRunr.getStorageProvider()`, see [Framework-specific test setup](#framework-specific-test-setup).

## Testing argument and result serialization

JobRunr persists jobs as JSON, so every argument must also be serializable and deserializable. Consequently, a custom type that cannot be deserialized fails in production with a `JobParameterNotDeserializableException`, it's better to catch these error at test time.

In the previous section, we did exactly that for the simple `String` parameter. You can apply the same strategy to more complex types by providing an instance of the type instead of a string.

If you prefer to write a unit test for this case, you can use the test fixtures: 

```java
@Test
void welcomeEmailArgumentIsSerializable() {
    // First we need a `JobMapper`
    // `createJsonMapper()` gives the default JsonMapper, if you're not using the default, change it
    var jobMapper = new JobMapper(JsonMapperFactory.createJsonMapper());
    Job job = JobTestBuilder.aJob()
        .withJobDetails(JobDetailsTestBuilder.jobDetails()
            .withClassName(EmailService.class)
            .withMethodName("sendWelcome")
            .withJobParameter(new User("jane@acme.com", "Jane")))
        .build();

    var serialized = jobMapper.serializeJob(job);
    Job deserialized = jobMapper.deserializeJob(serialized);

    assertThat(deserialized)
        .hasJobDetails(EmailService.class, "sendWelcome", new User("jane@acme.com", "Jane"));
}
```

Hopefully, the code above is no longer mysterious. We test the serialization by setting up an actual job and providing it with the arguments we care about. If the test passes, we know that `JsonMapper` can successfully serialize and deserialize the `User`.

> [!TIP]
> There are times when you add or remove fields from a job's parameters and your local tests continue to pass, only for production to fail because of serialization issues. This can be surprising and difficult to diagnose. You can avoid this by adopting snapshot testing. Save the JSON string produced when serializing the parameter as the snapshot, then compare it with the JSON string produced by the test when it serializes the object. If the two strings differ, the test should fail.

When you're using `runStepOnce` with a result or saving information in the job metadata (the `runStepOnce` result is saved there too), you also want to make sure they are serializable.

```java
@Test
void jobWithCustomMetadataIsSerializable() {
    var jobMapper = new JobMapper(JsonMapperFactory.createJsonMapper());
    Job job = JobTestBuilder.aJob()
        .withMetadata("user", new User("jane@acme.com", "Jane"))
        .build();

    var serialized = jobMapper.serializeJob(job);
    Job deserialized = jobMapper.deserializeJob(serialized);

    assertThat(deserialized).hasMetadata("user", new User("jane@acme.com", "Jane"));
}
```

In JobRunr Pro, a job whose method returns a non `void` result, also needs to make sure the return type is serializable.

```java
@Test
void jobWithResultIsSerializable() {
    var jobMapper = new JobMapper(JsonMapperFactory.createJsonMapper());
    Job job = JobTestBuilder.aJob()
        .withJobResult(new User("jane@acme.com", "Jane"))
        .build();

    var serialized = jobMapper.serializeJob(job);
    Job deserialized = jobMapper.deserializeJob(serialized);

    assertThat(deserialized.getResult()).isEqualTo(new User("jane@acme.com", "Jane"));
}
```

## Testing a custom `JobFilter`

A `JobFilter` is a plain class ([available in jobrunr and jobrunr-pro]({{< ref "documentation/pro/job-filters" >}})), so you test it like any other. Build a job in the state you care about and call the filter method directly.

```java
@Test
void auditFilterRecordsWhenAJobSucceeds() {
    var filter = new AuditJobFilter();
    Job job = JobTestBuilder.aSucceededJob().build();

    filter.onProcessingSucceeded(job);

    // TODO verify that the auditing logic was executed
}
```

## Running a job end-to-end in a test

Sometimes you want to test a job end-to-end, which includes letting JobRunr execute it to completion. Earlier, we verified that we're correctly enqueueing the subscription confirmation email. With a slight change, we can ensure that it runs to completion.

```java
@Test
void jobRunrSendsEmailConfirmationOnSubscription() throws Exception {
    var storageProvider = JobRunr.getStorageProvider();
    String email = "alice@example.com";

    HttpResponse<String> response = post("/subscribe?email=" + email);

    assertThat(response.statusCode()).isEqualTo(202);
    var jobId = jobIdFrom(response);
    Awaitility.await().atMost(10, TimeUnit.SECONDS).until(
        () -> storageProvider.getJobById(jobId).hasState(StateName.SUCCEEDED)
    );
}
```

The above test assumes that a `BackgroundJobServer` is running and that we have added [Awaitility](https://github.com/awaitility/awaitility) as a test dependency. You could do without Awaitility but it saves you time. In a framework application, inject the `StorageProvider` instead of using `JobRunr.getStorageProvider()`, see [Framework-specific test setup](#framework-specific-test-setup).

Running jobs end-to-end in tests can be slow. One obvious reason is the job execution time, the test must wait for it to finish. The second reason is how JobRunr operates: it polls the database at regular intervals to find new jobs. Even if your method is instant, the test waits for the next poll. You can configure this but there is a lower bound.

If you find your test suite too costly, consider these strategies to speed it up:

- **Use in-memory storage**: `InMemoryStorageProvider` is the fastest option as it eliminates external database overhead. It also allows for a much lower poll interval (down to 200ms), though when configured via properties, the minimum is 1 second.
- **Configure the poll interval**: If you must use a production-like database, be aware that most reject poll intervals below 5 seconds. However, JobRunr Pro users utilizing H2 can lower this to the same values as in-memory storage.
- **Abstract your storage provider**: Write your tests so they support any `StorageProvider`. This allows you to run a fast in-memory suite on every commit and a more realistic suite (e.g., against PostgreSQL via Testcontainers) only before deploying.
- **Offload to staging**: For the slowest parts of your application, instead of simulating them in every test run, rely on a live staging environment for final verification.

> [!WARNING]
> If you truncate the [JobRunr tables]({{< ref "documentation/storage#what-jobrunr-creates-in-your-database" >}}) between tests, keep the `succeeded-jobs-counter` entry in `jobrunr_metadata`, as well as the `licenseKey` entry if you use JobRunr Pro.

## Framework-specific test setup

If you're using an official framework integration, JobRunr provides auto-configuration and exposes the relevant components as beans. Instead of retrieving these components from the static `JobRunr` or `JobRunrPro` context, you should inject them into your tests.

A good example is the `StorageProvider`, which we previously retrieved by calling `JobRunr.getStorageProvider()`. However, the static context holds a single instance for the whole JVM, while a test framework may start several application contexts. When tests run in parallel, the last context to start overrides the `StorageProvider` of the others, so a test can end up reading another context's jobs. Therefore, it is best to use dependency injection (DI) instead.

Another advantage is that framework integrations make it easy to disable specific features for individual tests. For example, you can enable job processing only for tests that require it, with a short poll interval, as shown below.

{{< codetabs category="framework" >}}
{{< codetab label="Spring Boot" >}}
```java
@SpringBootTest(properties = {
    "jobrunr.database.type=mem",
    "jobrunr.background-job-server.enabled=true",
    "jobrunr.background-job-server.poll-interval-in-seconds=1"
})
class SubscriptionServiceTest {

    @Autowired
    StorageProvider storageProvider;

    // ...
}
```
{{< /codetab >}}

{{< codetab label="Quarkus" >}}
```java
@QuarkusTest
@TestProfile(SubscriptionServiceTest.SubscriptionServiceTestProfile.class)
class SubscriptionServiceTest {

    @Inject
    StorageProvider storageProvider;

    public static class SubscriptionServiceTestProfile implements QuarkusTestProfile {

        @Override
        public Map<String, String> getConfigOverrides() {
            return Map.of(
                "quarkus.jobrunr.database.type", "mem",
                "quarkus.jobrunr.background-job-server.enabled", "true",
                "quarkus.jobrunr.background-job-server.poll-interval", "1"
            );
        }
    }
}
```

Quarkus restarts the application for each distinct test profile, so group tests that share a profile.
{{< /codetab >}}

{{< codetab label="Micronaut" >}}
```java
@MicronautTest
@Property(name = "jobrunr.database.type", value = "mem")
@Property(name = "jobrunr.background-job-server.enabled", value = "true")
@Property(name = "jobrunr.background-job-server.poll-interval-in-seconds", value = "1")
class SubscriptionServiceTest {

    @Inject
    StorageProvider storageProvider;
}
```
{{< /codetab >}}
{{< /codetabs >}}

For job creation tests, set `background-job-server.enabled` to `false` so jobs stay in their initial state while you assert on them.

For complete, runnable test setups, see the example projects for [Spring Boot](https://github.com/jobrunr/jobrunr-examples/tree/main/spring-app), [Quarkus](https://github.com/jobrunr/jobrunr-examples/tree/main/quarkus-app) and [Micronaut](https://github.com/jobrunr/jobrunr-examples/tree/main/micronaut-app).

## Regression testing with `JobRegressionGuard` {.pro}

`JobDetails` - class name, method name, parameter types - are persisted in the database. Rename a method, change a parameter, or delete a job class and any job that is still scheduled or recurring will fail with a `JobNotFoundException`. To catch this, we need regression testing.

`JobRegressionGuard` turns that into a build-time check. It queries a running dashboard and asserts that every distinct job in storage still exists in your codebase:

```java
@Test
void currentCodebaseCanStillRunProductionJobs() {
    var jobRegressionGuard = new JobRegressionGuard();
    jobRegressionGuard.validateJobs("https://staging.acme.com/dashboard");
}
```

Run it against a dashboard web server that's serving production like jobs (your production or staging instances). See [CI/CD & Job Migrations]({{< ref "documentation/pro/migrations" >}}) for the full setup, including authenticated dashboards and the migration API that lets you rewrite existing jobs instead of only failing the build.

## Test fixtures reference

__Soon available on javadoc.io__
