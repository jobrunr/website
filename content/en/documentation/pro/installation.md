---
version: "pro"
title: "Installation"
subtitle: "Getting Started With JobRunr Pro"
date: 2025-10-23T11:40:00+02:00
layout: "documentation"
menu: 
  main: 
    identifier: install
    parent: 'jobrunr-pro'
    weight: 1
---

## Getting the JobRunr Pro Artifact

### Private Maven Repository

For a more resilient and secure supply chain, we highly recommend the use of a local/private Maven Repository to cache the downloaded artifacts from our private repo.

Several tools are available to help in setting one up: Sonatype Nexus, JFrog or Reposilite are a few we can name. For more information on how to set this up, see our guide on [caching Maven artifacts with a local repository](/en/guides/advanced/caching-maven-artifacts/).

### Artifact ids

In the below Maven or Gradle usage example you may want to replace the Spring Boot 3 Starter artifact by one that fits your stack better. Here are the different artifact ids you can choose from:

*   Vanilla: `jobrunr-pro`
*   Micronaut: `jobrunr-pro-micronaut-feature`
*   Quarkus: `quarkus-jobrunr-pro`
*   Spring Boot 2: `jobrunr-pro-spring-boot-2-starter`
*   Spring Boot 3: `jobrunr-pro-spring-boot-3-starter`

Note for Kotlin Exposed Transaction support you want to include a Kotlin support artifact: see the [Transaction plugin documentation](/en/documentation/pro/transactions/) for more details.

### Usage with Maven

<script>
document.addEventListener('DOMContentLoaded', () => {
    const queryParams = new URLSearchParams(document.location.search)
    const article = document.querySelector("article section")

    if(queryParams.get("version")) {
        article.innerHTML = article.innerHTML.replaceAll("${jobrunr.version}", queryParams.get("version"))
    }
    if(queryParams.get("username")) {
        article.innerHTML = article.innerHTML.replaceAll("${jobrunrProAccess.userName}", queryParams.get("username"))
    }
    if(queryParams.get("password")) {
        article.innerHTML = article.innerHTML.replaceAll("${jobrunrProAccess.password}", queryParams.get("password"))
    }
});
</script>

To use JobRunr Pro, just use the following Maven coordinates:

```xml
<repositories>
    <repository>
        <id>JobRunrPro</id>
        <url>https://repo.jobrunr.io/private-releases</url>
    </repository>
</repositories>
  
<dependency>
    <groupId>org.jobrunr</groupId>
    <artifactId>jobrunr-pro-spring-boot-3-starter</artifactId>
    <version>${jobrunr.version}</version>
</dependency>
```

Then, add your provided Maven repository credentials in the Maven settings.xml:

```xml
<settings>
    <servers>
        <server>
            <id>JobRunrPro</id>
            <username>${jobrunrProAccess.userName}</username>
            <password>${jobrunrProAccess.password}</password>
        </server>
    </servers>
</settings>
```


### Usage with Gradle

If you are using Gradle instead, add the below to your `build.gradle` file.

```groovy
repositories {
  mavenCentral()
  maven {
    url "https://repo.jobrunr.io/private-releases"
    credentials {
      username "${jobrunrProAccess.userName}"
      password "${jobrunrProAccess.password}"
    }
  }
}

dependencies {
  implementation 'org.jobrunr:jobrunr-pro-spring-boot-3-starter:${jobrunr.version}'
}
```

Instead of setting the credentials in your build file and to avoid checking in this information, you can configure these in the root `gradle.properties` file by setting the `mavenUser` and `mavenPass` properties.

## Installing the JobRunr Pro License key

Your license file sent to you will be active until the end of your current subscription period. You can monitor the license for expiration from the [JobRunr Pro Dashboard](/en/documentation/pro/jobrunr-pro-dashboard/) and the health actuator of Spring Boot / Quarkus / Micronaut and Micrometer metrics. See [JobRunr Pro's Observability](/en/documentation/pro/observability/) documentation for more info.

The license is saved in the database and you can apply it in any of the following ways:

* An environment variable called `JOBRUNR_PRO_LICENSE` which is equal to the contents of the license key.
* Save the license key to your `src/main/resources` folder (don't forget to **ignore this file** in your source control system!)
* Upload the contents of the license key via the dashboard
* Set the license contents via a property in case you are using a framework like Spring Boot by setting `jobrunr.license-key` equal to the contents of the license key.

