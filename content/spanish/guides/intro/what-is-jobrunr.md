---
title: "¿Qué es JobRunr y por qué deberías usarlo?"
description: Descubre qué puede hacer JobRunr por ti y cómo puede mejorar tu flujo de desarrollo diario.
weight: 10  
tags:
    - JobRunr
    - Job scheduling
hideFrameworkSelector: true
---
Para los desarrolladores Java que se pelean con la ejecución de tareas asíncronas, desde __enviar emails de forma masiva__ hasta hacer cálculos intensivos o __procesar archivos grandes__, JobRunr ofrece una solución muy sólida. Esta introducción pensada para desarrolladores se adentra en JobRunr, una [librería Java open source](https://github.com/jobrunr/jobrunr) que simplifica considerablemente el procesamiento de jobs en segundo plano. Veremos sus funcionalidades principales, cómo se integra en proyectos Java y por qué podría cambiar por completo tu flujo de desarrollo.

## Adéntrate en JobRunr

**JobRunr:** una maravilla open source que facilita la ejecución de tareas en segundo plano en aplicaciones Java. Aprovecha las expresiones lambda de Java 8, las referencias a métodos o los JobRequests para planificar jobs, e incluso soporta expresiones CRON para necesidades de planificación complejas. Con JobRunr, gestionar un gran número de jobs en segundo plano se vuelve más ágil, con alta fiabilidad y un impacto mínimo en el rendimiento.

## Funcionalidades principales para desarrolladores

- Facilidad de uso: la API de JobRunr es un soplo de aire fresco, simple y directa. Está diseñada para una puesta en marcha rápida y sin complicaciones, de modo que puedas centrarte más en la lógica de tu aplicación y menos en el boilerplate.
- Procesamiento distribuido: escalar no es un problema. JobRunr soporta la distribución de jobs en un clúster, lo que permite que tus aplicaciones crezcan sin contratiempos.
- Tolerancia a fallos: la tolerancia a fallos integrada significa que, si un servidor se cae mientras procesa un job, JobRunr reintenta el job en otro servidor. Así, tus jobs críticos resisten los fallos del sistema.
- Monitorización en tiempo real: el dashboard de JobRunr te deja ver al detalle lo que pasa con tus jobs. Ofrece información en tiempo real sobre las colas de jobs y el estado de los servidores, lo que hace que monitorizar sea muy fácil.
- Concurrencia y throttling: JobRunr está diseñado pensando en la concurrencia. Ejecuta varios jobs a la vez y aprovecha los recursos del sistema de forma eficiente.
- Documentación completa: ¿eres nuevo en JobRunr? No te preocupes. La documentación cubre todo, desde la configuración inicial hasta las funcionalidades avanzadas, y suaviza la curva de aprendizaje.


## Por qué a los desarrolladores les encanta JobRunr

- Simplifica las tareas en segundo plano: JobRunr convierte la compleja labor de gestionar tareas en segundo plano en algo sencillo, y te ahorra tiempo y dolores de cabeza.
- Escalabilidad: a medida que crecen las exigencias de tu aplicación, JobRunr crece con ella gracias a sus capacidades de procesamiento distribuido.
- Mejora el rendimiento de la aplicación: delegar tareas al segundo plano libera el thread principal de la aplicación, lo que hace más fluida la experiencia de usuario y mejora el rendimiento.
- Eficiencia para el desarrollador: la facilidad de uso de JobRunr se traduce en tiempos de desarrollo más cortos. Pasas menos tiempo peleándote con sistemas de jobs en segundo plano y más tiempo programando.
- Rentable: al ser open source, JobRunr ofrece funcionalidad de nivel comercial sin el precio de un producto comercial. Y si necesitas más, JobRunr Pro añade funcionalidades extra y soporte premium.


## Primeros pasos con JobRunr

Integrar JobRunr en tus proyectos Java es sencillo:

1. Añade las dependencias: incluye JobRunr en tu proyecto con Maven, Gradle, etc., y no te olvides de una librería JSON compatible. Consulta [las instrucciones de instalación](/en/documentation/installation/) para ver ejemplos. 
2. Configuración: configura JobRunr con su [Fluent Java API](/en/documentation/configuration/fluent/) o mediante las integraciones con frameworks como Spring Boot, Quarkus o Micronaut. Consulta la [documentación de configuración](/en/documentation/configuration/) para ver ejemplos.
3. Planifica jobs: usa la API de JobRunr para planificar jobs, configurar tareas recurrentes o lanzar jobs en momentos concretos. Consulta la [documentación de background methods](/en/documentation/background-methods/) para ver ejemplos.
4. Monitorización: sigue de cerca tus jobs en segundo plano con el dashboard de JobRunr, que te muestra el rendimiento y el estado de un vistazo. Consulta la [documentación de logging y dashboard](/en/documentation/background-methods/logging-progress/) para ver ejemplos.


## Conclusión

JobRunr es una herramienta potente y pensada para desarrolladores para afrontar la complejidad de los requisitos de las aplicaciones modernas. Su combinación de simplicidad, escalabilidad y robustez lo convierte en un recurso muy valioso para los desarrolladores que quieren incorporar un procesamiento de jobs en segundo plano eficiente y fiable a sus aplicaciones Java. Explora JobRunr, profundiza en sus funcionalidades y descubre su potencial para agilizar tu proceso de desarrollo y mejorar el rendimiento de tu aplicación. **¡A programar!**


## Lecturas adicionales

- La [página de documentación de JobRunr](/es/documentation/)
- [Cómo pasar de Quartz Scheduler a JobRunr](/en/blog/2023-02-20-moving-from-quartz-scheduler-to-jobrunr/)
- Los [repositorios de JobRunr en GitHub](https://github.com/jobrunr), con ejemplos para Spring Boot, Micronaut, la Fluent API y más
