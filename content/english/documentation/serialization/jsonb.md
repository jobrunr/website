---
title: "JSON-B"
description: "Using Jakarta JSON Binding for JSON serialization in JobRunr"
layout: "documentation"
menu:
  sidebar:
    parent: serialization
---

[JSON-B (Jakarta JSON Binding)](https://jakarta.ee/specifications/jsonb/) is the Jakarta EE standard for JSON serialization, providing a portable API across different implementations. JobRunr supports JSON-B through the `JsonbJsonMapper` implementation, tested against the [Yasson](https://eclipse-ee4j.github.io/yasson/) reference implementation.

## Installation

Add a JSON-B compatible serialization library to your project dependencies. Below is an example for Yasson.

{{< codetabs category="dependency" >}}
{{< codetab label="Maven" >}}
```xml
<dependency>
  <groupId>org.eclipse</groupId>
  <artifactId>yasson</artifactId>
  <version><!-- latest version --></version>
</dependency>
```
{{< /codetab >}}

{{< codetab label="Gradle" >}}
```groovy
implementation 'org.eclipse:yasson' // version omitted, use latest
```
{{< /codetab >}}
{{< /codetabs >}}

> [!NOTE]
> Other JSON-B implementations may work as well, but JobRunr's support is primarily tested against Yasson.

## Usage

JobRunr automatically detects JSON-B on your classpath and uses it for serialization. When multiple JSON libraries are available, JSON-B has the lowest priority in the [detection hierarchy]({{< ref "documentation/serialization#how-it-works" >}}).

If auto-detection doesn't work, you can manually configure it:

{{< codetabs category="framework" >}}
{{< codetab label="Fluent API" >}}
```java
JobRunr.configure()
  .useJsonMapper(new JsonbJsonMapper())
  //...
  .initialize();
```
{{< /codetab >}}

{{< codetab label="Micronaut" >}}
```java
import org.jobrunr.utils.mapper.JsonMapper;

@Singleton
public JsonMapper jsonMapper() {
  return new JsonbJsonMapper();
}
```
{{< /codetab >}}

{{< codetab label="Quarkus" >}}
```java
import org.jobrunr.utils.mapper.JsonMapper;

@Produces
public JsonMapper jsonMapper() {
  return new JsonbJsonMapper();
}
```
{{< /codetab >}}

{{< codetab label="Spring" >}}
```java
import org.jobrunr.utils.mapper.JsonMapper;

@Bean
public JsonMapper jsonMapper() {
  return new JsonbJsonMapper();
}
```
{{< /codetab >}}
{{< /codetabs >}}

## Custom JSON-B configuration

Customize JSON-B by creating your own `JsonbJsonMapper` instance with a configured `JsonbConfig`.

> [!IMPORTANT]
> Before proceeding, note that JobRunr may overwrite your custom configuration. Verify through testing that everything behaves as expected.

### Using JsonbConfig

Pass a configured `JsonbConfig` to customize serialization behavior:

```java
var jsonbConfig = new JsonbConfig()
  .withDeserializers(new MyCustomTypeDeserializer());

var jsonMapper = new JsonbJsonMapper(jsonbConfig);
```

When using a supported framework, overwrite JobRunr's `JsonMapper` bean. Example for Spring (can easily be adapted for other frameworks):

```java
import org.jobrunr.utils.mapper.JsonMapper;

@Bean
public JsonMapper jsonMapper() {
  var jsonbConfig = new JsonbConfig()
    .withDeserializers(new MyCustomTypeDeserializer());

  return new JsonbJsonMapper(jsonbConfig);
}
```
