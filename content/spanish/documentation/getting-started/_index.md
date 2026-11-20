---
title: "Primeros pasos"
description: "Guías de inicio rápido para añadir background jobs a cualquier aplicación de la JVM."
keywords: ["primeros pasos", "inicio rápido", "java", "spring boot", "quarkus", "micronaut", "kotlin", "configuración"]
date: 2026-06-16T00:00:00+02:00
layout: "documentation"
menu:
  sidebar:
    identifier: getting-started
    name: Primeros pasos
    weight: 5
sitemap:
  priority: 0.9
  changeFreq: monthly
---

Estas guías de inicio rápido te enseñan a añadir background jobs a tu aplicación de la JVM. Elige tu stack y lo tendrás funcionando en menos de 5 minutos.

## Lenguajes

<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
  <a href='{{< ref path="documentation/getting-started/java" lang="en" >}}' class="doc-card">
    <div class="w-10 h-10 shrink-0">{{< svg "assets/images/tech-logos/java.svg" >}}</div>
    <h3 class="doc-card__title m-0">Java</h3>
  </a>
  <a href='{{< ref path="documentation/getting-started/kotlin" lang="en" >}}' class="doc-card">
    <div class="w-10 h-10 shrink-0">{{< svg "assets/images/tech-logos/kotlin.svg" >}}</div>
    <h3 class="doc-card__title m-0">Kotlin</h3>
  </a>
</div>

> ¿Tu lenguaje no aparece en la lista? Consulta la [guía para otros stacks de la JVM]({{< ref path="documentation/getting-started/other#scheduling-jobs-in-jvm-languages-other-than-java-and-kotlin-using-jobrunr" lang="en" >}}) para ver cómo integrar JobRunr en Scala, Groovy y otros lenguajes.

## Frameworks

<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
  <a href='{{< ref path="documentation/getting-started/spring" lang="en" >}}' class="doc-card">
    <div class="w-10 h-10 shrink-0">{{< svg "assets/images/tech-logos/spring.svg" >}}</div>
    <h3 class="doc-card__title m-0">Spring Boot</h3>
  </a>
  <a href='{{< ref path="documentation/getting-started/quarkus" lang="en" >}}' class="doc-card">
    <div class="w-10 h-10 shrink-0">{{< svg "assets/images/tech-logos/quarkus.svg" >}}</div>
    <h3 class="doc-card__title m-0">Quarkus</h3>
  </a>
  <a href='{{< ref path="documentation/getting-started/micronaut" lang="en" >}}' class="doc-card">
    <div class="w-10 h-10 shrink-0">{{< svg "assets/images/tech-logos/micronaut.svg" >}}</div>
    <h3 class="doc-card__title m-0">Micronaut</h3>
  </a>
</div>

> ¿Tu framework no aparece en la lista? Consulta la [guía para otros stacks de la JVM]({{< ref path="documentation/getting-started/other#integrating-jobrunr-in-other-jvm-frameworks" lang="en" >}}) para ver cómo integrar JobRunr en Grails, Play, Open Liberty y otros frameworks.
