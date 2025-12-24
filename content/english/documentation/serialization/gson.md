---
title: "Gson"
subtitle: "Using Google's Gson for JSON serialization in JobRunr"
layout: "documentation"
menu:
  sidebar:
    parent: serialization
---

Gson, Google's JSON library, is known for its simplicity and zero-dependency design. It handles most serialization needs out of the box without requiring extensive configuration. JobRunr supports Gson through the `GsonJsonMapper` implementation.

> Gson is in maintenance mode, meaning that it may not see any new features.

## Installation

Add Gson to your project dependencies. Configuration for other build tools can be found on Maven Central: https://central.sonatype.com/artifact/com.google.code.gson/gson.

### Maven
```xml
<dependency>
  <groupId>com.google.code.gson</groupId>
  <artifactId>gson</artifactId>
  <version><!-- latest version --></version>
</dependency>
```

### Gradle
```groovy
implementation 'com.google.code.gson:gson' // version omitted, use latest
```

## Usage

JobRunr automatically detects Gson on your classpath and uses it for serialization. When multiple JSON libraries are available, Gson has the fourth-highest priority in the [detection hierarchy]({{< ref "documentation/serialization#how-it-works" >}}).

If auto-detection doesn't work, you can manually configure it:

```java
JobRunr.configure()
  .useJsonMapper(new GsonJsonMapper())
  //...
  .initialize();
```

Or when using a supported framework, define a `JsonMapper` bean. Example for Spring (can easily be adapted for other frameworks):

```java
import org.jobrunr.utils.mapper.JsonMapper;

@Bean
public JsonMapper jsonMapper() {
    return new GsonJsonMapper();
}
```

## Custom Gson configuration

Customize Gson by creating your own `GsonJsonMapper` instance. The class offers three constructors depending on your needs.

> Before proceeding, note that JobRunr may overwrite your custom configuration. Verify through testing that everything behaves as expected.

### Using GsonBuilder

Pass a configured `GsonBuilder` to customize serialization behavior:

```java
var gsonBuilder = new GsonBuilder()
  .registerTypeAdapter(MyCustomType.class, new MyCustomTypeAdapter());

var jsonMapper = new GsonJsonMapper(gsonBuilder);
```

### Using a pre-configured Gson instance

If you already have a `Gson` instance configured elsewhere in your application, you can reuse it:

```java
Gson gson = // ... your existing Gson instance
var jsonMapper = new GsonJsonMapper(gson);
```

> Using this may prevent JobRunr from functioning properly. Prefer the builder or option or make sure that your `Gson` instance has all the configuration required by JobRunr.