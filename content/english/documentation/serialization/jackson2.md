---
title: "Jackson 2"
description: "Using Jackson 2.x for JSON serialization in JobRunr"
layout: "documentation"
menu:
  sidebar:
    parent: serialization
---

Jackson 2 is a, if not the most, widely-used JSON serialization library in the Java ecosystem and is fully supported by JobRunr through the `JacksonJsonMapper` implementation.

> We encourage you to [use Jackson 3 which is fully supported by JobRunr]({{< ref "jackson3.md" >}}) (in v8.3.0 or later). See also ["Why upgrade to Jackson 3.0?"](https://cowtowncoder.medium.com/why-upgrade-to-jackson-3-0-94c30e797bf2) from the authors of Jackson.

## Installation

Add Jackson 2 to your project dependencies, below are examples for Maven and Gradle, configuration for other build tools can be found on Maven Central: https://central.sonatype.com/artifact/com.fasterxml.jackson.core/jackson-databind.

> If you're using a framework, please consult its documentation. Frameworks often provide modules that auto-configure JSON serialization for you. For example, if you're using Spring Boot 3's `spring-boot-starter-web`, Jackson 2 is already provided.

{{< codetabs category="dependency" >}}
{{< codetab label="Maven" >}}
```xml
<dependency>
  <groupId>com.fasterxml.jackson.core</groupId>
  <artifactId>jackson-databind</artifactId>
  <version><!-- latest version --></version>
</dependency>
```
{{< /codetab >}}

{{< codetab label="Gradle" >}}
```groovy
implementation 'com.fasterxml.jackson.core:jackson-databind' // version omitted, use latest
```
{{< /codetab >}}
{{< /codetabs >}}

## Usage

JobRunr automatically detects Jackson 2 on your classpath and uses it for serialization. When multiple JSON libraries are available, Jackson 2 has the third-highest priority in the [detection hierarchy]({{< ref "documentation/serialization#how-it-works" >}}) (after Kotlinx Serialization and Jackson 3).

If auto-detection doesn't work, you can manually configure it:

{{< codetabs category="framework" >}}
{{< codetab label="Fluent API" >}}
```java
JobRunr.configure()
  .useJsonMapper(new JacksonJsonMapper())
  //...
  .initialize();
```
{{< /codetab >}}

{{< codetab label="Micronaut" >}}
```java
import org.jobrunr.utils.mapper.JsonMapper;

@Singleton
public JsonMapper jsonMapper() {
  return new JacksonJsonMapper();
}
```
{{< /codetab >}}

{{< codetab label="Quarkus" >}}
```java
import org.jobrunr.utils.mapper.JsonMapper;

@Produces
public JsonMapper jsonMapper() {
  return new JacksonJsonMapper();
}
```
{{< /codetab >}}

{{< codetab label="Spring" >}}
```java
import org.jobrunr.utils.mapper.JsonMapper;

@Bean
public JsonMapper jsonMapper() {
  return new JacksonJsonMapper();
}
```
{{< /codetab >}}
{{< /codetabs >}}

## Custom Jackson 2 configuration

You can customize the Jackson 2 configuration by creating your own instance of `JacksonJsonMapper` and providing it to JobRunr. This is useful when you need to register additional Jackson modules or customize the `ObjectMapper` settings.

> Before proceeding, note that if you customize the configuration, JobRunr may overwrite your changes. You are responsible for verifying through testing that everything behaves as expected.

The `JacksonJsonMapper` class offers several constructors for different configuration needs.

### Adapting Jackson 2's configuration

You might need to customize Jackson 2's configuration to add support for specific needs, for example:
- **Jackson modules** - Register modules for Kotlin data classes, Scala types, Java 8 date/time, or other custom modules
- **Custom serializers** - Add serializers/deserializers for domain-specific value objects or types not natively supported by Jackson
- **Custom Jackson configuration** - Enable or disable some Jackson configuration required for your application to function

You can do so by passing a configured `ObjectMapper` to the constructor of `JacksonJsonMapper`:

```java
var objectMapper = new ObjectMapper()
  .registerModule(new JavaTimeModule())
  .registerModule(new MyCustomModule());

var jsonMapper = new JacksonJsonMapper(objectMapper);
```

### Module auto-discovery

By default, `Jackson2JsonMapper` automatically discovers and registers modules found on the classpath through Java's `ServiceLoader` mechanism. This is convenient but can sometimes lead to unexpected behavior if unwanted modules are present.

You can disable auto-discovery as follows:

```java
var jsonMapper = new JacksonJsonMapper(false);

// or, if you also need a custom ObjectMapper
var jsonMapper = new JacksonJsonMapper(objectMapper, false);
```

### Polymorphic type deserialization with Jackson 2

Unlike Jackson 3, JobRunr's `JacksonJsonMapper` automatically handles polymorphic type deserialization using Jackson's `LaissezFaireSubTypeValidator`. This means you can use abstract classes, interfaces, and collections with generic types in your job parameters without additional configuration.

That being said, polymorphic types should probably be considered as a last resort. It's possible to avoid them by making some design choices, similar to those discussed in the [Jackson 3 documentation]({{< ref "documentation/serialization/jackson3#exploring-alternatives-to-additional-polymorphic-type-validation" >}}). These design choices improve not only security but also maintainability and performance.

> **Security consideration**: The `LaissezFaireSubTypeValidator` allows deserialization for all subtypes, without validation, which is convenient but requires careful handling of user inputs.
