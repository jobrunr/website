---
title: "Task schedulers en Java: alternativas modernas a Quartz Scheduler"
description: "¿Buscas una alternativa a Quartz Scheduler en Java? Compara JobRunr, db-scheduler, ShedLock, Kestra y Temporal en API, almacenamiento, monitorización y mantenimiento."
images:
- /blog/modern-alternatives-to-quartz.png
image: /blog/modern-alternatives-to-quartz.png
date: 2024-10-31T16:00:00+02:00
lastmod: 2026-11-16T10:00:00+01:00
author: "Ismaila Abdoulahi"
tags:
  - blog
---
<div style="text-align: center;margin: -2em 0 2em;">
<small style="font-size: 70%;">Imagen basada en <a href='https://www.freepik.com/vectors/cartoon-astronaut'>cartoon astronaut vector created by catalyststuff - www.freepik.com</a></small>
</div>

Durante mucho tiempo, Quartz, también conocido como Quartz Scheduler, fue el único task scheduler open source viable en Java. De hecho, el FAQ oficial de Quartz todavía afirma que "[no se conocen proyectos open source competidores](https://www.quartz-scheduler.org/documentation/quartz-2.5.x/faq.html)". En este artículo repasamos varias **alternativas a Quartz Scheduler que ofrecen un conjunto de funciones parecido y son más fáciles y agradables de usar**.

> ¿Solo te interesa JobRunr frente a Quartz? Lee nuestro [benchmark de JobRunr frente a Quartz sobre Postgres](/en/blog/quartz-vs-jobrunr/) para ver las cifras cara a cara, y [cómo pasar de Quartz a JobRunr](/en/blog/2023-02-20-moving-from-quartz-scheduler-to-jobrunr/) para una migración paso a paso.

## Quartz Scheduler: ¿qué tan bueno es en realidad?

Igual que sus alternativas, **Quartz Scheduler se puede integrar en casi cualquier aplicación Java para programar y procesar cualquier tarea implementada en Java**. En sus décadas de existencia, Quartz ha evolucionado hasta convertirse en un framework con muchas funciones: persistir el estado de las tareas, gestionar misfires y volver a disparar tareas fallidas, definir planificaciones complejas, priorizar tareas, lograr procesamiento distribuido y más.

Que Quartz lleve tanto tiempo entre nosotros tiene dos grandes ventajas: **la librería está probada en batalla y tiene una comunidad grande**, lo que facilita encontrar ayuda. Todo esto junto la convierte en la librería de planificación de jobs más popular en Java. A pesar de todos estos puntos fuertes, **elegir Quartz ya no es tan obvio por algunos problemas muy visibles**.

### Limitaciones de Quartz

#### A Quartz se le notan los años

Quartz Scheduler tiene varios problemas que lo hacen una opción menos obvia, sobre todo cuando **[hay varias alternativas realmente buenas](#modern-alternatives-to-quartz-scheduler)**.

La edad de Quartz, aunque es una ventaja, también es una desventaja, porque **la API y la arquitectura de Quartz también se están quedando viejas**. La API de Quartz se puede considerar verbosa para los estándares actuales: cada tarea necesita una clase `Job`, un `JobDetail` y un `Trigger` antes de poder ejecutarse. Puede que no parezca gran cosa, pero para una librería o un lenguaje es importante seguir siendo atractivo para la siguiente generación de desarrolladores. La menor verbosidad es uno de los factores principales de la popularidad de Kotlin, y el propio Java avanza hacia [ser más amigable para principiantes](https://www.infoq.com/news/2024/05/jep477-implicit-classes-main/).

Otro sitio donde a Quartz se le notan los años es su arquitectura. Cuando se usa un RDBMS, **el scheduler requiere crear 11 tablas**, lo que probablemente es excesivo para la mayoría de aplicaciones, donde la lógica de negocio real necesita menos tablas.

Hemos escrito un artículo que [explica por qué algunas personas pasan de Quartz a JobRunr y cómo hacerlo.](/en/blog/2023-02-20-moving-from-quartz-scheduler-to-jobrunr/). Ese artículo **da una idea de lo complejo y verboso que resulta usar Quartz**.

#### Rinde peor que las alternativas modernas

Comparado con alternativas más modernas, **de Quartz se reporta un rendimiento significativamente menor**. Este problema de rendimiento puede deberse al uso de row level locks y a la complejidad de la configuración, que hace que Quartz Scheduler sea más difícil de afinar.

Lo medimos nosotros mismos: en el mismo hardware y con la misma base de datos Postgres, Quartz procesó 145 jobs por segundo mientras que JobRunr Pro procesó 2.732 jobs por segundo, unas 18 veces más. La configuración, el código y los datos en bruto están en nuestro [benchmark de JobRunr frente a Quartz](/en/blog/quartz-vs-jobrunr/).

#### Sin monitorización integrada

A Quartz Scheduler **le falta un dashboard o una UI intuitiva para seguir y monitorizar jobs**. Tampoco ofrece una forma de conectarse con herramientas de monitorización externas como [Grafana](https://grafana.com/) o [Jaeger](https://www.jaegertracing.io/). Los usuarios de Quartz no pueden monitorizar activamente el sistema para anticiparse a problemas como los fallos de jobs.

El endpoint `quartz` de Spring Boot Actuator lista jobs y triggers como JSON, pero eso sigue sin ser una vista de qué se ejecutó, qué falló y por qué.

#### La planificación distribuida es opt-in

Quartz puede gestionar las tareas de forma distribuida, pero esta función es opt-in: necesitas el job store JDBC con `org.quartz.jobStore.isClustered=true` en cada nodo. Ahora que herramientas como [Kubernetes](https://kubernetes.io/) permiten levantar un pod bajo demanda, una función así no debería ser un añadido de última hora, sino el comportamiento por defecto.

#### Mantenimiento esporádico

Quartz pasó cinco años sin una versión estable, desde la 2.3.2 en octubre de 2019 hasta la 2.4.0 en noviembre de 2024. Mientras el desarrollo estaba parado, **el ecosistema a su alrededor no dejó de evolucionar**, y los usuarios se quedaron atascados en el namespace `javax` mientras el resto del mundo Java se pasaba a `jakarta`. Quartz publica ahora dos líneas de versiones, la 2.4.x para Java 8 y `javax` y la 2.5.x para `jakarta` y Java 11, pero el ritmo es lento, con unas pocas versiones de corrección de bugs al año.

Los usuarios de Quartz tampoco **pueden usar las funciones más recientes de Java, como los virtual threads**, que pueden beneficiar al procesamiento de jobs en segundo plano, por ejemplo para aumentar el throughput. El [issue de GitHub que pide soporte para virtual threads](https://github.com/quartz-scheduler/quartz/issues/1090) sigue abierto, y la rama principal [primero tendría que pasar de Java 11 a Java 21](https://github.com/quartz-scheduler/quartz/issues/1443).

> Quartz pertenece a IBM, y el cambio de propietario trajo un repunte de actividad, con la comunidad ayudando a resolver problemas importantes como la migración a `jakarta`. Todavía no está claro qué significa esto para el futuro de Quartz a largo plazo.
>

## Alternativas modernas a Quartz Scheduler {#modern-alternatives-to-quartz-scheduler}

Si buscas una alternativa a Quartz para tu aplicación Java, hay **varios schedulers open source modernos que ofrecen funciones parecidas,** APIs más cómodas para el desarrollador y un soporte más robusto para entornos distribuidos y en la nube.

Distinguimos dos tipos de schedulers:

- La primera clase son las [librerías Java de planificación de jobs](#alternatives-to-quartz-in-java). Igual que Quartz, **se pueden incluir en cualquier aplicación Java**. Viven dentro de tu aplicación.
- La segunda clase son los [motores de workflows](#other-job-scheduling-tools), que se dirigen a un público más amplio. Son **servicios independientes con los que tu aplicación tendrá que comunicarse**.

Aquí va un resumen rápido antes de entrar en cada uno:

| | Tipo | Almacenamiento | UI de monitorización | Licencia |
|---|---|---|---|---|
| **Quartz** | Librería Java | 11 tablas en tu RDBMS, o en memoria | Ninguna integrada | Apache 2.0 |
| **JobRunr** | Librería Java | Tu base de datos SQL o MongoDB, o en memoria | Dashboard integrado | LGPL v3 (Pro es comercial) |
| **db-scheduler** | Librería Java | Una tabla en tu base de datos relacional | Complemento de la comunidad ([db-scheduler-ui](https://github.com/bekk/db-scheduler-ui)) | Apache 2.0 |
| **Spring `@Scheduled` + ShedLock** | Lock para tareas programadas en memoria | Un registro de lock (JDBC, MongoDB, Redis, ...) | Ninguna | Apache 2.0 |
| **Kestra** | Plataforma de workflows independiente | El backend propio de Kestra | UI integrada | Apache 2.0 (Enterprise es comercial) |
| **Temporal** | Motor de workflows independiente | La persistencia propia de Temporal | Web UI integrada | MIT (servidor), Apache 2.0 (Java SDK) |

### Alternativas a Quartz en Java {#alternatives-to-quartz-in-java}

Hay dos grandes alternativas a Quartz para programar jobs en Java: [JobRunr](#jobrunr) y [db-scheduler](#db-scheduler). Se pueden añadir como dependencia a cualquier aplicación Java. Si solo necesitas evitar que una tarea `@Scheduled` de Spring se ejecute en todos los nodos a la vez, un lock como [ShedLock](https://github.com/lukas-krecan/ShedLock) es una opción más ligera, sin estado de jobs, reintentos ni dashboard. Nuestra [guía de cron jobs en Java](/en/blog/java-cron-jobs-guide/) compara `@Scheduled`, Quartz y JobRunr para tareas recurrentes.

Estas librerías mantienen al mínimo el número de dependencias de terceros, lo que ofrece mejores garantías de seguridad. Están disponibles como jars Java estándar en Maven Central.

#### JobRunr

[JobRunr](https://github.com/jobrunr/jobrunr) es una librería Java moderna, open source y mantenida de forma activa, diseñada para el procesamiento de jobs en segundo plano. JobRunr ofrece una **API fácil de usar que simplifica la planificación de jobs**. A diferencia de Quartz, JobRunr se diseñó pensando en aplicaciones cloud-native y soporta la planificación distribuida de jobs.

JobRunr busca ser **cómodo para el desarrollador** con una API simple, flexible y directa, reintentos automáticos cuando algo falla y una integración fluida con tu infraestructura existente. De hecho, lo único que necesitas para crear un job en segundo plano es una lambda de Java. JobRunr también soporta las principales bases de datos SQL y bases de datos NoSQL populares.

Una función de JobRunr que ni Quartz ni db-scheduler ofrecen de serie es un dashboard. Gracias al dashboard integrado, es **fácil monitorizar el sistema** para ver por qué falló un job o para realizar acciones como volver a encolar o eliminar un job.

Usada por líderes del sector, que confían en ella, la versión open source de **JobRunr ofrece las funciones esenciales que necesitas para programar tareas en Java**. Puedes esperar funciones parecidas a las de Quartz Scheduler, pero mucho más fáciles de usar. El equipo de JobRunr también desarrolla y mantiene JobRunr Pro, que ofrece funciones de nivel Enterprise y hace de JobRunr Pro la mejor librería de planificación de jobs en Java.

Algunas cosas que no encontrarás en Quartz:

- **Virtual threads.** En JDK 21 y posteriores, JobRunr ejecuta tus jobs en [virtual threads](/en/documentation/configuration/virtual-threads/) por defecto, lo que da un throughput significativamente mayor en jobs limitados por E/S. Nuestro post sobre [opciones de threading para jobs en Java](/en/blog/java-job-threading-options/) explica cuándo ayudan y cuándo perjudican.
- **Jobs durables.** Envuelve cada paso de un job en `jobContext.runStepOnce("charge-card", () -> ...)` y un reintento se salta todos los pasos que ya se completaron, de modo que un servidor de correo que falla no le cobra dos veces al cliente. Mantén [idempotente](/en/blog/idempotence-in-java-job-scheduling/) el efecto secundario dentro de un paso, y lee la [guía de durable executions](/en/guides/advanced/durable-executions/) para los detalles.
- **Un Chart del historial del job.** El dashboard dibuja cada intento de un job, hasta los pasos durables individuales, para que veas qué paso falló y qué pasos se saltaron en el reintento.
- **Starters para Spring Boot 3 y 4, Quarkus y Micronaut**, así que JobRunr sigue las actualizaciones de framework que ya ibas a hacer de todos modos.

[Empieza con JobRunr](/en/documentation/5-minute-intro/) | [Mira cómo se compara JobRunr con Quartz](/en/blog/quartz-vs-jobrunr/) | [Pasa de Quartz a JobRunr](/en/blog/2023-02-20-moving-from-quartz-scheduler-to-jobrunr/) | [Mira a Ronald presentar JobRunr en Spring I/O 2022](https://www.youtube.com/watch?v=2KFeeFuM9og)

<figure>
<img src="/documentation/jobs-enqueued.webp" class="kg-image" style="height: 400px">
<figcaption>Un Dashboard de monitorización listo para usar que ofrece JobRunr</figcaption>
</figure>

#### DB Scheduler

Otra buena alternativa a Quartz es [db-scheduler](https://github.com/kagkarlsson/db-scheduler). La librería se diseñó en origen para ser **una alternativa más simple a Quartz**. Este diseño reduce a una el número de tablas necesarias (una única tabla `scheduled_tasks`, frente a las 11 tablas de Quartz) y ofrece una API mucho más simple.

Igual que JobRunr, db-scheduler es **distribuido por defecto** y garantiza que el mismo job no se ejecutará de forma concurrente. Esta garantía se consigue usando la misma base de datos centralizada; en el caso de db-scheduler, hace falta una base de datos relacional.

DB Scheduler **ofrece todas las funciones esenciales para programar jobs en segundo plano**: puede gestionar jobs fire-and-forget, además de jobs programados (o aplazados) y recurrentes. La librería ofrece algo de monitorización sencilla a través de Micrometer. También puede reintentar automáticamente una tarea si falla, con back-off exponencial configurado mediante un `FailureHandler`.

La librería está bien mantenida y va ganando funciones para igualar las capacidades de Quartz Scheduler, sin la complejidad extra. Requiere Java 17 o posterior e incluye un starter para Spring Boot. El proyecto en sí no tiene dashboard, pero [db-scheduler-ui](https://github.com/bekk/db-scheduler-ui), creado por la comunidad, te da una UI de administración básica que añades por separado.

### Otras herramientas de planificación de jobs {#other-job-scheduling-tools}

Hay varias alternativas a Quartz para la planificación de jobs que se dirigen a un público más amplio; probablemente no podríamos listarlas todas aunque quisiéramos. Estas alternativas vienen como servicios independientes, a menudo llamados **motores de workflows**, que se comunican con tu aplicación.

Usar estas herramientas significa que **tendrás que acostumbrarte a la terminología que emplean**. En particular, tendrás que aceptar que toda tarea, incluso la más simple, debe definirse como un workflow.

Aquí presentamos brevemente dos de estos motores de workflows que funcionan bien con aplicaciones Java: [Kestra](#kestra) y [Temporal](#temporal).

#### Kestra

[Kestra](https://kestra.io/) es una **plataforma open source de automatización de workflows que facilita la planificación de jobs**. El motor está escrito en Java, pero las tareas pueden ejecutarse en cualquier lenguaje de programación. Kestra es una gran **alternativa low-code a Quartz**: los workflows se declaran en YAML en lugar de montarse en código, y un catálogo de plugins con más de 2.400 integraciones te permite leer de cualquier base de datos, almacenamiento en la nube o API, y ejecutar scripts en cualquier lenguaje.

Kestra **ofrece una UI para escribir o configurar workflows**. Esta UI también sirve para monitorizar el sistema y seguir los cambios de estado de los workflows.

Kestra también tiene todas las **funciones esenciales para la planificación de jobs**: sistema distribuido fiable, reintentos, ejecuciones aplazadas y recurrentes. Además, puede disparar workflows a partir de **eventos** y no solo del tiempo, como un fichero que llega a un object storage, un mensaje en una cola o un webhook. Eso, junto con la capacidad de orquestar trabajo **fuera de la JVM**, es el motivo principal para recurrir a un motor de workflows en lugar de a un scheduler dentro de la aplicación. La edición open source tiene licencia Apache 2.0; SSO, RBAC y multi-tenancy forman parte de la edición comercial Enterprise.

#### Temporal

[Temporal](https://temporal.io/) es un **motor de workflows open source diseñado para hacer las aplicaciones más resilientes**. El motor está escrito en Go y se puede conectar con tu aplicación Java mediante el [Java SDK](https://github.com/temporalio/sdk-java) que proporciona.

De forma muy parecida a soluciones puramente Java como JobRunr o Quartz, Temporal ofrece las funciones esenciales que **ayudan a los desarrolladores a centrarse en la lógica de negocio** en lugar de preocuparse por los mecanismos complejos que hay detrás de un scheduler resiliente y distribuido.

Además de ofrecer funciones como reintentos, escalabilidad y ejecuciones aplazadas y recurrentes, Temporal también ofrece una interfaz de usuario que **te permite monitorizar la ejecución de los workflows** para detectar tareas fallidas.

Temporal brilla en workflows de larga duración que esperan días a un temporizador o a una aprobación humana. El precio es un clúster aparte que hay que operar y un modelo de programación con sus propias reglas. Si tu trabajo durable cabe en un solo job con unos pocos pasos, `runStepOnce` en JobRunr te da la misma garantía a nivel de paso sin esa infraestructura extra.

## Conclusión

Durante mucho tiempo no hubo una alternativa real a Quartz para la planificación de jobs en Java. Ya no es así: hay varias herramientas modernas a disposición de los desarrolladores. Son más simples de usar y aportan las piezas esenciales para lograr una planificación fiable y distribuida.

Puede que busques una librería de planificación de tareas persistente que se integre sin fricción en una aplicación Java. En ese caso, te recomendamos encarecidamente que pruebes nuestra solución, JobRunr. DB Scheduler es otra opción que puede darte resultados satisfactorios. Si lo único que necesitas es evitar que una tarea `@Scheduled` de Spring se ejecute en todos los nodos, ShedLock es el paso más pequeño.

También puedes echar un vistazo a motores de workflows como Kestra o Temporal. Son especialmente útiles si tus tareas están escritas en distintos lenguajes de programación, se disparan con eventos externos a tu aplicación o se ejecutan como workflows de larga duración.

Quartz sigue manteniéndose, así que quedarse con él es una opción válida para una aplicación estable que hoy funciona. Para código nuevo, o cuando te topes con sus límites en monitorización, throughput o virtual threads, merece la pena comparar.

Con estas herramientas tan diversas a su disposición, los desarrolladores Java pueden elegir ahora la que mejor responda a sus necesidades, en lugar de depender de una única opción. Si JobRunr está en tu lista de candidatos, lee a continuación la [guía de migración de Quartz a JobRunr](/en/blog/2023-02-20-moving-from-quartz-scheduler-to-jobrunr/).
