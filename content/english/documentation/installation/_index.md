---
title: "Installation"
subtitle: "Installation in your application is simple as JobRunr is published on Maven Central"
keywords: ["jobrunr instalation", "maven central", "jobrunr via maven", "spring framework", "sql databases", "spring boot", "java spring boot", "java spring", "spring boot versions", "java springboot", "java springboot"]
date: 2020-04-30T11:12:23+02:00
layout: "documentation"
menu: 
  main: 
    identifier: installation
    parent: 'documentation'
    weight: 5
---

> __Important__: all your servers must run the same version of your code! If your webapp server has a newer version with a method signature that is not compatible with the server that processes your background jobs, a NoSuchMethod Exception will be thrown and job processing will fail!

## Requirements
JobRunr works with Java 8 and up - You can integrate it with Spring framework, use it in Tomcat or any other web framework.


When you depend on JobRunr via Maven or Gradle, the following dependencies are required:
- JobRunr itself
- [ASM](https://asm.ow2.io/)
- Either [Jackson](https://github.com/FasterXML/jackson) (and Jackson's [JavaTimeModule](https://github.com/FasterXML/jackson-modules-java8)), [GSON](https://github.com/google/gson) or a [Json-B](http://json-b.net/) compatible implementation (do not forget to add them as they are marked as optional)
- SLF4J

JobRunr is distributed as a standard java jar which is available on Maven Central. You can add these jars easily with either Maven or Gradle as follows:

### Maven
As JobRunr is available in Maven Central, all you need to do is add the dependency:

```xml
<dependency> 
    <groupId>org.jobrunr</groupId> 
    <artifactId>jobrunr</artifactId> 
    <version>${jobrunr.version}</version> 
</dependency>
<!-- you can use either Jackson, Gson or Yasson (Json-B compatible). 
     Only choose one of the 3 dependencies below -->
<dependency>
    <groupId>com.fasterxml.jackson.core</groupId>
    <artifactId>jackson-databind</artifactId>
    <version>2.11.0</version>
</dependency>
<dependency>
    <groupId>com.google.code.gson</groupId>
    <artifactId>gson</artifactId>
    <version>2.8.6</version>
</dependency>
<dependency>
    <groupId>org.eclipse</groupId>
    <artifactId>yasson</artifactId>
    <version>1.0.8</version>
</dependency>
```

### Gradle
Just add the dependency to JobRunr and either Jackson or Gson:

```java
implementation 'org.jobrunr:jobrunr:${jobrunr.version}'
// you can use either Jackson, Gson or Yasson (Json-B compatible). 
// only choose one of the 3 dependencies below
implementation 'com.fasterxml.jackson.core:jackson-databind:2.11.0'
implementation 'com.google.code.gson:gson:2.8.6'
implementation 'org.eclipse:yasson:1.0.8'
```

## JobRunr Pro

For specific instructions on how to get started with JobRunr Pro such as configuring the license key, please see the [JobRunr Pro installation documentation](/en/documentation/pro/installation/).

