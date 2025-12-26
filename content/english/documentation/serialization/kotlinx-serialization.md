---
title: "Kotlin Serialization"
description: "Using Kotlin's multiplatform serialization library with JobRunr"
layout: "documentation"
menu:
  sidebar:
    parent: serialization
---

[Kotlin Serialization](https://github.com/Kotlin/kotlinx.serialization) is Kotlin's official multiplatform serialization library, using compile-time code generation instead of runtime reflection. JobRunr supports Kotlin Serialization through the `KotlinxSerializationJsonMapper` implementation, available in the `jobrunr-kotlin-[VERSION]-support` packages (`[VERSION]` is to be replaced with a Kotlin version, e.g., `2.2`).

## Requirements

Kotlin Serialization support requires:
- **JobRunr 8.0 or later**
- **`jobrunr-kotlin-2.1-support` or later** (the version number indicates the Kotlin version supported by the package)

## Installation

Add both the Kotlin Serialization library and JobRunr's Kotlin support package to your project.

### Gradle (Kotlin DSL)
```kotlin
plugins {
  kotlin("plugin.serialization") version // ... specify your version
}

dependencies {
  // versions are omitted, use the latest versions
  implementation("org.jobrunr:jobrunr-kotlin-2.1-support) // replace 2.1 by the Kotlin version you're targeting
  implementation("org.jetbrains.kotlinx:kotlinx-serialization-json")
}
```

> Note: we have not tested versions lower than 1.8.0 of kotlinx-serialization-json.

## Usage

JobRunr automatically detects Kotlin Serialization on your classpath (checking for `kotlinx.serialization.json.Json` and `org.jobrunr.kotlin.utils.mapper.KotlinxSerializationJsonMapper`) and uses it for serialization. When multiple JSON libraries are available, Kotlin Serialization has the highest priority in the [detection hierarchy]({{< ref "documentation/serialization#how-it-works" >}}).

> Note: Pre JobRunr 8.4.0, unless you're using one of the framework starters, `KotlinxSerializationJsonMapper` is not configured by default.

If auto-detection doesn't work, you can manually configure it:

```kotlin
JobRunr.configure()
  .useJsonMapper(KotlinxSerializationJsonMapper())
  // ...
  .initialize()
```

Or when using a supported framework, define a `JsonMapper` bean. Example for Spring (can easily be adapted for other frameworks):

```kotlin
import org.jobrunr.utils.mapper.JsonMapper

@Bean
fun jsonMapper(): JsonMapper {
  return KotlinxSerializationJsonMapper()
}
```

## Custom Kotlin Serialization configuration

Customize Kotlin Serialization by creating your own `KotlinxSerializationJsonMapper` instance. The class offers three constructors depending on your needs.

> Before proceeding, note that JobRunr may overwrite your custom configuration. Verify through testing that everything behaves as expected.

### Using a custom SerializersModule

Pass a `SerializersModule` to register custom serializers for your domain types:

```kotlin
val customModule = SerializersModule {
  polymorphic(Notification::class) {
    subclass(EmailNotification::class)
    subclass(SmsNotification::class)
  }
}

val jsonMapper = KotlinxSerializationJsonMapper(customModule)
```

JobRunr combines your module with its own `jobRunrSerializersModule`, which includes serializers for Java types like `Duration`, `Instant`, and JobRunr-specific types.

### Using a pre-configured Json instance

If you need full control over the Json configuration:

```kotlin
val json = Json {
  isLenient = true

  this.serializersModule = customModule + jobRunrSerializersModule
}

val jsonMapper = KotlinxSerializationJsonMapper(json)
```

> Using a pre-configured `Json` instance bypasses JobRunr's default configuration. Ensure your configuration includes necessary settings like `classDiscriminator = "@class"` for proper polymorphic serialization and that `jobRunrSerializersModule` is set.
