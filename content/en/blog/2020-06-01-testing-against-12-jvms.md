---
title: "Testing JobRunr against 12 different JVM's"
summary: "A hands-on tutorial on how JobRunr is tested against 12 different JVM's using TestContainers."
feature_image: /blog/balloons.webp
date: 2020-06-01T11:12:23+02:00
author: "Ronald Dehuysser"
tags:
  - blog
  - tutorial
---
Since JobRunr uses bytecode analysis to perform it's job (pun intended), I thought it was important to have a test where different job lambda's are compiled and executed on each different JVM instance.

To do so, I first created the following test which has unit tests with different ways of enqueueing background jobs using JobRunr:

<figure style="width: 100%; max-width: 100%">

```java
package org.jobrunr.tests.e2e;

import org.jobrunr.configuration.JobRunr;
import org.jobrunr.jobs.lambdas.JobLambda;
import org.jobrunr.scheduling.BackgroundJob;
import org.jobrunr.storage.SimpleStorageProvider;
import org.jobrunr.tests.e2e.services.TestService;
import org.jobrunr.utils.mapper.gson.GsonJsonMapper;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.UUID;
import java.util.concurrent.TimeUnit;

import static net.javacrumbs.jsonunit.assertj.JsonAssertions.assertThatJson;
import static org.awaitility.Awaitility.await;
import static org.jobrunr.tests.fromhost.HttpClient.getJson;

public class E2EJDKTest {

    private TestService testService;

    @BeforeEach
    public void startJobRunr() {
        testService = new TestService();

        JobRunr
                .configure()
                .useStorageProvider(new SimpleStorageProvider().withJsonMapper(new GsonJsonMapper()))
                .useJobActivator(this::jobActivator)
                .useDashboard()
                .useDefaultBackgroundJobServer()
                .initialize();
    }

    @AfterEach
    public void stopJobRunr() {
        JobRunr
                .destroy();
    }

    @Test
    void usingLambdaWithIoCLookupUsingInstance() {
        BackgroundJob.enqueue(() -> testService.doWork(UUID.randomUUID()));

        await()
                .atMost(30, TimeUnit.SECONDS)
                .untilAsserted(() -> assertThatJson(getSucceededJobs()).inPath("$.items[0].jobHistory[2].state").asString().contains("SUCCEEDED"));
    }

    @Test
    void usingLambdaWithIoCLookupWithoutInstance() {
        BackgroundJob.<TestService>enqueue(x -> x.doWork(UUID.randomUUID()));

        await()
                .atMost(30, TimeUnit.SECONDS)
                .untilAsserted(() -> assertThatJson(getSucceededJobs()).inPath("$.items[0].jobHistory[2].state").asString().contains("SUCCEEDED"));
    }

    @Test
    void usingMethodReference() {
        BackgroundJob.enqueue((JobLambda)testService::doWork);

        await()
                .atMost(30, TimeUnit.SECONDS)
                .untilAsserted(() -> assertThatJson(getSucceededJobs()).inPath("$.items[0].jobHistory[2].state").asString().contains("SUCCEEDED"));
    }

    @Test
    void usingMethodReferenceWithoutInstance() {
        BackgroundJob.<TestService>enqueue(TestService::doWork);

        await()
                .atMost(30, TimeUnit.SECONDS)
                .untilAsserted(() -> assertThatJson(getSucceededJobs()).inPath("$.items[0].jobHistory[2].state").asString().contains("SUCCEEDED"));
    }

    private String getSucceededJobs() {
        return getJson("http://localhost:8000/api/jobs/default/succeeded");
    }

    private <T> T jobActivator(Class<T> clazz) {
        return (T) testService;
    }
}
```
<figcaption>The test enqueues a job and then queries the rest API to see whether the job succeeded</figcaption>
</figure>

To run this test against 12 different JVM's, I then used TestContainers:

<figure style="width: 100%; max-width: 100%">

```java
package org.jobrunr.tests.fromhost;

import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.wait.strategy.Wait;
import org.testcontainers.images.builder.ImageFromDockerfile;
import org.testcontainers.utility.MountableFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.stream.Stream;

import static java.nio.file.Files.exists;

public class BuildAndTestContainer extends GenericContainer<BuildAndTestContainer> {

    public BuildAndTestContainer(String fromDockerImage) {
        super(new ImageFromDockerfile()
                .withDockerfileFromBuilder(builder ->
                        builder
                                .from(fromDockerImage)
                                .workDir("/app/jobrunr")
                                .env("JDK_TEST", "true")
                ));
        if (exists(Paths.get("/drone"))) {
            this
                    .withFileSystemBind(Paths.get("/tmp/jobrunr/cache/gradle-wrapper").toString(), "/root/.gradle/wrapper/dists");
        } else {
            this
                    .withFileSystemBind(Paths.get(System.getProperty("user.home"), ".gradle", "wrapper", "dists").toString(), "/root/.gradle/wrapper/dists");
        }

        this
                .withCopyFileToContainer(MountableFile.forHostPath(Paths.get(".")), "/app/jobrunr")
                .withCommand("./gradlew", "build")
                .waitingFor(Wait.forLogMessage(".*BUILD SUCCESSFUL.*", 1));
    }
}
```
</figure>

Here, a Docker image is build on the fly using a base image that can be passed along. A special environment variable called JDK_TEST is added and the gradle wrapper is mounted inside the docker image (which differs on my local system and the CI server). Next, the current gradle module is copied into the container and the `./gradlew build` command is run. Finally, the container waits for the log message 'BUILD SUCCESFUL' as it would otherwise stop immediately.

To run the `E2EJDKTest` within the different JVM instances, the following test is used:

<figure style="width: 100%; max-width: 100%">

```java
package org.jobrunr.tests.fromhost;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.DisabledIfEnvironmentVariable;

import java.time.Duration;

import static org.assertj.core.api.Assertions.assertThat;

// why: we create a build of the current gradle module inside docker container for each JDK
// we do not want to run this test within the docker container itself as it would otherwise run recursively
// once inside the docker build, the ENV variable JDK_TEST is set
// the end result is that only the tests inside org.jobrunr.tests.e2e must run (on the correct JDK) and not this test
@DisabledIfEnvironmentVariable(named = "JDK_TEST", matches = "true")
public class JdkTest {

    @Test
    public void jdk8OpenJdk() {
        assertThat(buildAndTestOnImage("adoptopenjdk:8-jdk-hotspot")).contains("BUILD SUCCESSFUL");
    }

    @Test
    public void jdk8OpenJ9() {
        assertThat(buildAndTestOnImage("adoptopenjdk:8-jdk-openj9")).contains("BUILD SUCCESSFUL");
    }

    @Test
    public void jdk8Zulu() {
        assertThat(buildAndTestOnImage("azul/zulu-openjdk:8")).contains("BUILD SUCCESSFUL");
    }

    @Test
    public void jdk8GraalVM() {
        assertThat(buildAndTestOnImage("oracle/graalvm-ce:20.1.0-java8")).contains("BUILD SUCCESSFUL");
    }

    @Test
    public void jdk8Ibm() {
        assertThat(buildAndTestOnImage("ibmcom/ibmjava:8-sdk-alpine")).contains("BUILD SUCCESSFUL");
    }

    @Test
    public void jdk11OpenJdk() {
        assertThat(buildAndTestOnImage("adoptopenjdk:11-jdk-hotspot")).contains("BUILD SUCCESSFUL");
    }

    @Test
    public void jdk11OpenJ9() {
        assertThat(buildAndTestOnImage("adoptopenjdk:11-jdk-openj9")).contains("BUILD SUCCESSFUL");
    }

    @Test
    public void jdk11Zulu() {
        assertThat(buildAndTestOnImage("azul/zulu-openjdk:11")).contains("BUILD SUCCESSFUL");
    }

    @Test
    public void jdk11GraalVM() {
        assertThat(buildAndTestOnImage("oracle/graalvm-ce:20.1.0-java11")).contains("BUILD SUCCESSFUL");
    }

    @Test
    public void jdk14OpenJdk() {
        assertThat(buildAndTestOnImage("adoptopenjdk:14-jdk-hotspot")).contains("BUILD SUCCESSFUL");
    }

    @Test
    public void jdk14OpenJ9() {
        assertThat(buildAndTestOnImage("adoptopenjdk:14-jdk-openj9")).contains("BUILD SUCCESSFUL");
    }

    @Test
    public void jdk14Zulu() {
        assertThat(buildAndTestOnImage("azul/zulu-openjdk:14")).contains("BUILD SUCCESSFUL");
    }

    private String buildAndTestOnImage(String dockerfile) {
        final BuildAndTestContainer buildAndTestContainer = new BuildAndTestContainer(dockerfile);
        buildAndTestContainer
                .withStartupTimeout(Duration.ofMinutes(10))
                .start();
        return buildAndTestContainer.getLogs();
    }
}
```
</figure>

So, for each different JVM, the source code is copied inside that JVM and then a build is done which runs the `E2EJDKTest`. This makes sure that the code is compiled and the tests are executed within that JVM. To confirm that all is well, the logs of the container are requested and using the excellent AssertJ library, an assertion is done to make sure the container logs contain 'BUILD SUCCESSFUL'.

And that's it!

### Learn more
I hope you enjoyed this tutorial and you can see that for JobRun quality and testing is taken seriously.

To learn more, check out these guides:

- [JobRunr - Java batch processing made easy...]({{< ref "2020-04-08-jobrunr-release.md" >}})
- [TestContainers - Implementing Integration Tests using TestContainers](https://dzone.com/articles/implementing-integration-tests-using-testcontainer).

If you liked this tutorial, feel free to [star us on GitHub](https://github.com/jobrunr/jobrunr/stargazers)!