---
title: "Jackson 3"
description: "Using Jackson 3.x for JSON serialization in JobRunr"
layout: "documentation"
menu:
  sidebar:
    parent: serialization
---

Jackson 3 is the latest major version of the widely-used Jackson library and is fully supported by JobRunr through the `Jackson3JsonMapper` implementation.

## Requirements

Jackson 3 supports is available in JobRunr 8.3.0 or later. It requires **JDK 17 or higher**. This is a requirement from Jackson 3 itself, not a JobRunr limitation.

> [!NOTE]
> JobRunr's Jackson 3 support is distributed as a multi-release JAR, allowing it to provide Java 17-specific functionality while maintaining compatibility with older Java versions for other JSON mappers.

## Installation

You can find out how to install Jackson 3 for your preferred build tool over on Maven Central: https://central.sonatype.com/artifact/tools.jackson.core/jackson-databind. Below are snippets for Maven and Gradle.

> [!NOTE]
> If you're using a framework, please consult its documentation. Frameworks often provide modules that auto-configure JSON serialization for you. For example, if you're using Spring Boot 4's `spring-boot-starter-web`, Jackson 3 is already provided.

{{< codetabs category="dependency" >}}
{{< codetab label="Maven" >}}
```xml
<dependency>
  <groupId>tools.jackson.core</groupId>
  <artifactId>jackson-databind</artifactId>
  <version><!-- latest version --></version>
</dependency>
```
{{< /codetab >}}

{{< codetab label="Gradle" >}}
```groovy
implementation("tools.jackson.core:jackson-databind") // version is missing, try to always specify the latest version
```
{{< /codetab >}}
{{< /codetabs >}}

## Usage

JobRunr automatically detects Jackson 3 on your classpath and uses it for serialization. When multiple JSON libraries are available, Jackson 3 has the second-highest priority in the [detection hierarchy]({{< ref "documentation/serialization#how-it-works" >}}) (after Kotlin Serialization).

If auto-detection doesn't work, you can manually configure it:

{{< codetabs category="framework" >}}
{{< codetab label="Fluent API" >}}
```java
JobRunr.configure()
  .useJsonMapper(new Jackson3JsonMapper())
  //...
  .initialize();
```
{{< /codetab >}}

{{< codetab label="Micronaut" >}}
```java
import org.jobrunr.utils.mapper.JsonMapper;

@Singleton
public JsonMapper jsonMapper() {
  return new Jackson3JsonMapper();
}
```
{{< /codetab >}}

{{< codetab label="Quarkus" >}}
```java
import org.jobrunr.utils.mapper.JsonMapper;

@Produces
public JsonMapper jsonMapper() {
  return new Jackson3JsonMapper();
}
```
{{< /codetab >}}

{{< codetab label="Spring" >}}
```java
import org.jobrunr.utils.mapper.JsonMapper;

@Bean
public JsonMapper jsonMapper() {
  return new Jackson3JsonMapper();
}
```
{{< /codetab >}}
{{< /codetabs >}}

## Custom Jackson 3 configuration

You can customize the Jackson 3 configuration by creating your own instance of `Jackson3JsonMapper` and providing it to JobRunr. This is useful when you need to register additional Jackson modules for special types or allow additional polymorphic deserialization.

> [!IMPORTANT]
> Before proceeding, note that if you customize the configuration, JobRunr may overwrite your changes. You are responsible for verifying through testing that everything behaves as expected.

The `Jackson3JsonMapper` class offers several constructors for different configuration needs.

### Adapting Jackson 3's configuration

You might need to customize Jackson 3's configuration to add support for specific needs, for example:
- **Jackson modules** - Register modules for Kotlin data classes, Scala types, or other custom modules
- **Custom serializers** - Add serializers/deserializers for domain-specific value objects or types not natively supported by Jackson
- **Custom Jackson configuration** - Enable or disable some Jackson configuration required for your application to function

You can do so by passing a `tools.jackson.databind.json.JsonMapper.Builder` to the constructor of `Jackson3JsonMapper`:

```java
var jsonMapperBuilder = tools.jackson.databind.json.JsonMapper.builder()
  .addModule(new KotlinModule.Builder().build())
  .addModule(new MyCustomModule());

var jsonMapper = new Jackson3JsonMapper(jsonMapperBuilder);
```

### Allowing polymorphic type deserialization with Jackson 3

> Available since JobRunr 8.4.0.

By default, Jackson 3 restricts polymorphic type deserialization for security reasons. You need to explicitly allow it when your job parameters use abstract types or interfaces, including java collections. That being said this should probably be considered as a last resort, it's possible to avoid it by making some design choices, [more on this below]({{< ref "#exploring-alternatives-to-additional-polymorphic-type-validation" >}}). 

Without proper configuration, Jackson 3 will throw an `InvalidTypeIdException` when trying to deserialize these types.

```java
var typeValidatorBuilder = BasicPolymorphicTypeValidator.builder()
  .allowIfSubType(AbstractNotification.class)
  .allowIfSubType(AbstractCommand.class);

var jsonMapper = new Jackson3JsonMapper(typeValidatorBuilder);
```

#### Exploring alternatives to additional polymorphic type validation

In many cases you can design your application to avoid additional polymorphic type validation altogether. Consider these approaches before adding custom type validators:

##### Keep job arguments simple

Avoid passing entire entities or complex domain objects as job parameters. While convenient, this practice creates several problems:
- Large JSON payloads increase database storage and I/O overhead
- Serialization and deserialization add processing time to every job
- Changes to entity structure can make the parameters non deserializable and prevent jobs from running

Instead, pass only the minimal data needed - typically just an identifier and fetch the full entity when at execution time.

```java
// Avoid this
BackgroundJob.enqueue(() -> orderService.processOrder(orderEntity));

// Prefer this
BackgroundJob.enqueue(() -> orderService.processOrder(orderId));
```

##### Use concrete types instead of abstract ones

When POJOs are necessary as job parameters, design them to avoid polymorphism. Jackson 3 only requires type validation when there's ambiguity about which concrete type to deserialize. You can eliminate this ambiguity by:

**Keeping fields simple** - Use primitives, `String`, or standard Java types (`UUID`, `Instant`) whenever possible. These types serialize and deserialize without any type validation.

**Declaring concrete implementations** - When complex fields are needed, use concrete classes instead of interfaces or abstract classes. For example, use `CustomerCreatedEvent` instead of `Event`.

**Avoiding collections when possible** - Collections are unbounded and make it easy to inadvertently serialize thousands of elements, impacting performance and storage. If you must use collections:
- Declare with concrete types, e.g., `ArrayList` instead of `List`, `HashMap` instead of `Map`
- Consider using arrays for better type safety and bounded size, e.g., `MyEntity[]` instead of `ArrayList<MyEntity>`

Be aware that elements within collections may still require type validation, even when they are concrete types.

### Custom Jackson's `JsonMapper` and polymorphic type validator

For complete control, you can combine both custom modules and polymorphic type validation:

```java
var jsonMapper = new Jackson3JsonMapper(jsonMapperBuilder, typeValidatorBuilder);
```

Details on the two parameters are discussed earlier in the article.
