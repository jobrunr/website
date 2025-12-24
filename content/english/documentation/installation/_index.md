---
title: "Installation"
subtitle: "Installation in your application is simple as JobRunr is published on Maven Central"
keywords: ["jobrunr instalation", "maven central", "jobrunr via maven", "spring framework", "sql databases", "spring boot", "java spring boot", "java spring", "spring boot versions", "java springboot", "java springboot"]
date: 2020-04-30T11:12:23+02:00
layout: "documentation"
menu: 
  sidebar:
    identifier: installation
    weight: 5
---

> __Important__: all your servers must run the same version of your code! If your webapp server has a newer version with a method signature that is not compatible with the server that processes your background jobs, a NoSuchMethod Exception will be thrown and job processing will fail!

## Requirements
JobRunr works with Java 8 and up - You can integrate it with Spring framework, use it in Tomcat or any other Java framework.

When you depend on JobRunr via Maven or Gradle, the following dependencies are required:
- JobRunr itself
- [ASM](https://asm.ow2.io/)
- A [JSON serialization library]({{< ref "documentation/serialization" >}}) (Jackson, Gson, JSON-B, or Kotlin Serialization)
- SLF4J

JobRunr is distributed as a standard java jar which is available on Maven Central. You can add these jars easily with either Maven or Gradle as follows:

### Maven
```xml
<dependency>
    <groupId>org.jobrunr</groupId>
    <artifactId>jobrunr</artifactId>
    <version>${jobrunr.version}</version>
</dependency>
<!-- Add a JSON library, you can use either Jackson, Gson,
 Yasson (JSON-B compatible) or Kotlin Serialization. -->
```

### Gradle
```groovy
implementation 'org.jobrunr:jobrunr:${jobrunr.version}'
// Add a JSON library, you can use either Jackson, Gson,
//  Yasson (JSON-B compatible) or Kotlin Serialization.
```

> For JSON serialization library installation and configuration, see the [Serialization documentation]({{< ref "documentation/serialization" >}}). JobRunr supports Jackson 2, Jackson 3, Gson, JSON-B, and Kotlin Serialization.