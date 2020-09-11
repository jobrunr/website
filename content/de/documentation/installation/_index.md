---
title: "Installation"
subtitle: "Die Installation in Ihrer Anwendung ist einfach, da JobRunr in Maven Central veröffentlicht wird"
date: 2020-04-30T11:12:23+02:00
layout: "documentation"
menu: 
  main: 
    identifier: installation
    parent: 'documentation'
    weight: 5
---

> __Wichtig__: Auf allen Servern muss dieselbe Version Ihres Codes ausgeführt werden! Wenn Ihr Webapp-Server eine neuere Version mit einer anderen Methodensignatur hat, die nicht mit dem Server kompatibel ist, der Ihre Hintergrundjobs verarbeitet, wird eine NoSuchMethod-Ausnahme ausgelöst und die Jobverarbeitung schlägt fehl!

## Bedarf
JobRunr funktioniert mit Java 8 und höher - Sie können es in das Spring Framework integrieren, in Tomcat oder einem anderen Web Framework verwenden.


Wenn Sie über Maven oder Gradle von JobRunr abhängig sind, sind die folgenden Abhängigkeiten erforderlich:
- JobRunr selbst
- [ASM](https://asm.ow2.io/)
- Entweder [Jackson](https://github.com/FasterXML/jackson) (und Jacksons [JavaTimeModule](https://github.com/FasterXML/jackson-modules-java8)), [GSON](https://github.com/google/gson) oder eine [Json-B](http://json-b.net/) kompatible Implementierung (vergessen Sie nicht, sie hinzuzufügen, da sie als optional markiert sind).
- SLF4J

JobRunr wird als Standard-Java-JAR vertrieben, das in Maven Central verfügbar ist. Sie können diese jars einfach mit Maven oder Gradle wie folgt hinzufügen:

### Maven
Da JobRunr in Maven Central verfügbar ist, müssen Sie lediglich die Abhängigkeit hinzufügen:


```xml
<dependency> 
    <groupId>org.jobrunr</groupId> 
    <artifactId>jobrunr</artifactId> 
    <version>${jobrunr.version}</version> 
</dependency>
<!-- Sie können entweder Jackson, Gson oder Yasson (Json-B-kompatibel) verwenden.
     wähle nur eine der 3 Abhängigkeiten unten -->
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
Fügen Sie einfach die Abhängigkeit zu JobRunr und entweder Jackson oder Gson hinzu:


```java
implementation 'org.jobrunr:jobrunr:${jobrunr.version}'
// Sie können entweder Jackson, Gson oder Yasson (Json-B-kompatibel) verwenden.
// wähle nur eine der 3 Abhängigkeiten unten
implementation 'com.fasterxml.jackson.core:jackson-databind:2.11.0'
implementation 'com.google.code.gson:gson:2.8.6'
implementation 'org.eclipse:yasson:1.0.8'

```