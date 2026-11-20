---
title: "JobRunr: ¿el mejor scheduler para Java?"
description: "Qué hace un job scheduler en Java, cómo elegir uno (ScheduledExecutorService, @Scheduled, Quartz, JobRunr) y un tutorial paso a paso con Spring Boot 4 y JobRunr."
image: /blog/job-scheduler.webp
date: 2025-03-05T09:12:23+02:00
lastmod: 2026-11-16T10:00:00+01:00
author: "Ronald Dehuysser"
tags:
  - blog
  - meta
images: ["/blog/meme-job-schedueler2.webp"]

---
{{< trial-button >}}

## ¿Qué es un job scheduler en Java?

En Java, un scheduler es una herramienta que permite ejecutar tareas o jobs en un momento dado, a intervalos o cuando se cumple una condición. Con un scheduler puedes automatizar de forma fiable tareas como el envío masivo de correos, el procesamiento de documentos e imágenes (por ejemplo, el análisis de imágenes médicas o los [chatbots RAG]({{< ref path="/blog/Simplified-RAG-Workflows-in-Java.md" lang="en" >}})), la [gestión de pedidos](https://foojay.io/today/getting-started-with-jobrunr-a-powerful-task-scheduler-in-ja/), la gestión de notificaciones, la generación de informes [y mucho más]({{< ref path="/use-case" lang="en" >}}). Puede simplificar los flujos de trabajo y aumentar la productividad gracias a mecanismos de reintento que reducen los errores y la intervención manual.

Los job schedulers encajan de forma natural con el procesamiento batch, pero en realidad sirven para cualquier tarea que se pueda aplazar (por ejemplo, un correo de confirmación de registro). Usarlos te da más control sobre los recursos de cómputo, evita sobrecargas del sistema y mantiene los costes bajo control.

Por sus ventajas y capacidades, los job schedulers resultan muy útiles en sectores muy distintos, como la sanidad, las finanzas y el comercio electrónico. Son especialmente importantes en aplicaciones donde la automatización de cargas de trabajo es crítica para el negocio.

> Usar un buen job scheduler reduce mucho la carga de los equipos, que pueden centrarse en innovar en lugar de en mantener sistemas.

## ¿Qué hace bueno a un scheduler?

Un buen job scheduler es una herramienta que permite a los desarrolladores automatizar y gestionar tareas de forma transparente y sencilla, sin renunciar a la fiabilidad ni a la escalabilidad. Estas son las características clave que, en nuestra opinión, debería tener un buen scheduler:

- **Funciones esenciales de planificación:** un scheduler debería poder *gestionar la planificación puntual* (para tareas fire-and-forget o aplazadas) y la *planificación recurrente* (por ejemplo, para cron jobs). En circunstancias normales, el scheduler también debería garantizar que, una vez registrada, *una tarea se ejecute una sola vez*, de modo que la misma tarea nunca se ejecute en paralelo.
- **Pensado para desarrolladores:** las herramientas no deberían estorbar a la hora de resolver los problemas reales del negocio ni frenar la productividad. Por eso un job scheduler debería ser *fácil de usar*, con una *API simple y directa*, y fácil de *integrar en aplicaciones existentes*. Además, el scheduler debería tener una *arquitectura extensible*.
- **Tolerancia a fallos:** los schedulers deberían tener mecanismos para *gestionar errores*, y *el reintento automático de jobs debería venir integrado en el sistema* para garantizar que las tareas terminen con éxito incluso en condiciones imprevisibles (por ejemplo, un fallo de red, un apagado inesperado del sistema, etc.). La tolerancia a fallos *aumenta la productividad* de forma indirecta, porque los desarrolladores ya no tienen que vigilar el sistema de cerca ni relanzar a mano los procesos fallidos. Esta característica tan importante *suele faltar o estar incompleta en los schedulers más simples*. En los jobs que hacen varias cosas seguidas, un reintento tampoco debería repetir los pasos que ya terminaron bien. Eso es lo que te dan los *jobs durables*, por ejemplo con `runStepOnce` en JobRunr.
- **Procesamiento distribuido:** repartir el procesamiento de tareas entre varios servidores es imprescindible en sistemas que nunca deberían caerse (y que por tanto requieren alta disponibilidad) o cuando una sola máquina no puede con la carga esperada.
- **Monitorización en tiempo real:** los sistemas de procesamiento asíncrono de jobs son opacos: a menudo *no sabemos cuándo empieza o termina una tarea*. Sin monitorización en tiempo real que *dé visibilidad sobre la ejecución de las tareas*, un fallo puede pasar desapercibido durante días. El scheduler debería facilitar la detección de problemas y su resolución proactiva.
- **Fiabilidad:** un job scheduler debería estar *bien probado* y *mantenido de forma activa* para evolucionar con las necesidades de los usuarios y corregir bugs críticos. Además, una herramienta de planificación de jobs debería mantener *al mínimo el número de dependencias de terceros*, para ofrecer *mejores garantías de seguridad*.

En resumen, un buen scheduler es fácil de usar, fiable y está diseñado para responder a las exigencias de las aplicaciones modernas. Con estas características, permite a los equipos automatizar flujos de trabajo con facilidad, sin perder estabilidad ni escalabilidad.

JobRunr cumple todos estos requisitos, lo que lo convierte en la opción ideal para los equipos que quieren mejorar la automatización de sus cargas de trabajo y aumentar la productividad.

> Por supuesto, un scheduler puede tener más funciones que las de esta lista, como [colas de prioridad]({{< ref path="/documentation/pro/priority-queues" lang="en" >}}), [multi-tenancy]({{< ref path="/documentation/pro/dynamic-queues" lang="en" >}}), [rate limiting]({{< ref path="/documentation/pro/rate-limiters" lang="en" >}}), etc., y eso lo hace todavía mejor, siempre que no lo vuelvan más complejo.

## Cómo elegir el mejor job scheduler para Java {#choosing-the-best-java-job-scheduler}

En Java hay muchos frameworks para planificar jobs: los que vienen de serie, `java.util.Timer` con `TimerTask` y `java.util.concurrent.ScheduledExecutorService`, funciones de framework como `@Scheduled` de Spring, o [job schedulers de terceros]({{< ref "/blog/2024-10-31-task-schedulers-java-modern-alternatives-to-quartz">}}) como JobRunr, db-scheduler y Quartz.

Cuál es el adecuado depende menos del gusto que de dos preguntas: ¿tiene que sobrevivir un job a un reinicio? ¿Y cuántas instancias de tu aplicación se ejecutan a la vez? Así quedan las opciones:

| Opción | Los jobs sobreviven a un reinicio | Seguro con varias instancias | Reintentos | Monitorización |
|---|---|---|---|---|
| `Timer` / `ScheduledExecutorService` | No, viven en memoria | No, cada instancia los ejecuta | Los escribes tú | Ninguna |
| Spring `@Scheduled` | No | No, cada instancia los ejecuta | No | Ninguna |
| Spring `@Scheduled` + ShedLock | No | Sí, un lock lo limita a una instancia a la vez | No | Ninguna |
| Quartz | Sí, con el job store JDBC | Sí, una vez activado el clustering | Manuales, lanzando una `JobExecutionException` que vuelve a disparar el job | Ninguna integrada |
| db-scheduler | Sí, una tabla en la base de datos | Sí | Sí, mediante un failure handler | Complemento de la comunidad |
| JobRunr | Sí, en tu base de datos SQL o en MongoDB | Sí, por defecto | Sí, automáticos y con backoff exponencial | Dashboard integrado |

De esa tabla salen algunas reglas prácticas:

- **¿Una sola instancia y nada importante que perder?** `ScheduledExecutorService` forma parte del JDK y va bien para refrescar una caché o para un heartbeat. Si usas Spring, `@Scheduled` es la misma idea con una anotación.
- **¿Tareas recurrentes en varias instancias?** Necesitas un lock (ShedLock) o un scheduler que se coordine a través de una base de datos. Nuestra [guía de cron jobs en Java]({{< ref path="/blog/java-cron-jobs-guide.md" lang="en" >}}) compara `ScheduledExecutorService`, `@Scheduled`, Quartz y JobRunr para trabajo recurrente, con una chuleta de expresiones cron.
- **¿Jobs que tienen que completarse aunque un pod se caiga a mitad?** Necesitas persistencia y reintentos, es decir, una librería como JobRunr, db-scheduler o Quartz. Nuestra guía sobre [planificación distribuida de jobs en Java]({{< ref path="/blog/distributed-job-scheduling-java.md" lang="en" >}}) explica qué falla con los locks caseros en base de datos, las colas de mensajes y los CronJobs de Kubernetes, y cuántos workers necesitas.
- **¿Trabajo que abarca varios servicios o lenguajes, o que espera semanas a una persona?** Entonces un motor de workflows como Temporal o Kestra encaja mejor que un scheduler dentro de la aplicación.
- **¿Ya usas Quartz?** Sigue funcionando y se mantiene, pero echa un vistazo a nuestra [comparativa de alternativas a Quartz]({{< ref "/blog/2024-10-31-task-schedulers-java-modern-alternatives-to-quartz">}}) y al [benchmark de JobRunr frente a Quartz]({{< ref path="/blog/quartz-vs-jobrunr.md" lang="en" >}}) antes de empezar código nuevo con él.

Elegir el mejor scheduler puede acabar siendo una cuestión de preferencias personales. Aun así, **JobRunr destaca frente a su competencia** porque ofrece varias ventajas sobre los frameworks tradicionales:

- una API fluida realmente sencilla que te permite encolar o planificar tareas Java con una sola línea de código o mediante la anotación `@Recurring`
- un dashboard integrado en el job scheduler que te muestra el estado de cada job
- ejecución distribuida de jobs entre distintas instancias de la JVM
- integración con varios frameworks, entre ellos Spring Boot, Micronaut y Quarkus
- jobs durables: envuelve los pasos de un job en `runStepOnce` y un reintento continúa en el paso que falló
- virtual threads por defecto en JDK 21 y posteriores, para más rendimiento en jobs limitados por E/S

**Querido y usado por desarrolladores de todos los ámbitos**, JobRunr combina funciones modernas, ligeras y fáciles de usar con capacidades de nivel empresarial, y aporta fiabilidad, seguridad y soporte para despliegues de producción a gran escala. En comparación, frameworks como Quartz resultan realmente pesados y complejos.


## ¿Qué tipos de planificación de jobs existen?

Cuando se trata de planificar jobs en Java, hay tres tipos principales de planificación a tener en cuenta: la ejecución directa, la ejecución diferida y la ejecución recurrente mediante una [expresión cron](https://www.jobrunr.io/en/blog/2021-11-10-java-cron-job/).

- **Ejecución directa (también llamada fire-and-forget)**: este tipo de planificación se usa cuando quieres que un job se ejecute ~~inmediatamente~~ lo antes posible (porque la ejecución es asíncrona y puede que ya haya otras tareas en la cola o en proceso). Por eso es ideal para tareas puntuales o para repartir la carga entre varios servidores. JobRunr permite crear un job de una sola ejecución con la función `enqueue` de la clase `BackgroundJob` o de la clase `JobScheduler`.
{{< codeblock >}}
```java
BackgroundJob.enqueue(() -> System.out.println("This will run asap and perhaps even on another server"));
```
{{< /codeblock >}}

- **Ejecución diferida (o planificada para el futuro)**: este tipo de planificación te permite planificar una tarea para que se ejecute en un momento concreto del futuro. Es útil para tareas que tienen que ejecutarse a una hora determinada, como enviar recordatorios o lanzar informes. Para ello puedes usar el método `schedule` de JobRunr:
{{< codeblock >}}
```java
BackgroundJob.schedule(Instant.now().plus(5, DAYS), () -> System.out.println("This will run 5 days from now!"));
```
{{< /codeblock >}}

- **Ejecución recurrente mediante una expresión cron**: este tipo de planificación permite que un job se ejecute de forma repetida a intervalos fijos, por ejemplo cada día, cada semana o cada mes. Para verlo todo sobre expresiones cron, zonas horarias y jobs recurrentes en un clúster, consulta nuestra [guía de cron jobs en Java]({{< ref path="/blog/java-cron-jobs-guide.md" lang="en" >}}).
{{< codeblock >}}
```java
BackgroundJob.scheduleRecurrently("*/5 * * * *", () -> System.out.println("This will be printed every 5 minutes!"));
```
{{< /codeblock >}}

## Guía para implementar la planificación de jobs en Java con JobRunr
Empezar con la planificación de jobs en Java es sencillo y rápido: puedes tenerlo funcionando en solo 5 minutos. En este ejemplo usaremos el _JobRunr Spring Boot Starter_ para añadir rápidamente la planificación de jobs en segundo plano a tu _aplicación Spring Boot_.

### 1. Añade la dependencia de JobRunr a tu proyecto
Con la herramienta de build que prefieras, añade la dependencia del scheduler JobRunr a tu proyecto Spring Boot. Para ello, añade el artefacto `jobrunr-spring-boot-4-starter` (en Spring Boot 3, usa `jobrunr-spring-boot-3-starter`). En esta guía usaremos Maven, así que necesitamos declarar lo siguiente en nuestro `pom.xml`:

{{< codeblock >}}
```xml
<dependency>
	<groupId>org.jobrunr</groupId>
	<artifactId>jobrunr-spring-boot-4-starter</artifactId>
	<version>9.0.3</version>
</dependency>
```
{{< /codeblock >}}

> JobRunr guarda tus jobs como JSON. En una aplicación web, Spring Boot ya trae Jackson y JobRunr lo detecta automáticamente. Si tu aplicación **no** es una aplicación web, añade tú una librería JSON (consulta la [documentación de serialización]({{< ref path="documentation/serialization" lang="en" >}})).

### 2. Asegúrate de tener un StorageProvider
JobRunr necesita guardar tus jobs en una base de datos SQL o NoSQL mediante un `StorageProvider`, lo que hace que la planificación de jobs sea independiente del ciclo de vida de la aplicación. Gracias al `jobrunr-spring-boot-4-starter`, JobRunr intentará usar automáticamente tu `DataSource` existente. En este ejemplo usaremos la base de datos H2. Para ello, añade también la dependencia de H2 a tu `pom.xml`, junto con `spring-boot-starter-jdbc` para que Spring Boot cree el `DataSource` por ti (sáltatelo si ya usas Spring Data JPA o JDBC).

{{< codeblock >}}
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-jdbc</artifactId>
</dependency>
<dependency>
    <groupId>com.h2database</groupId>
    <artifactId>h2</artifactId>
</dependency>
```
{{< /codeblock >}}

> H2 es solo una de las muchas bases de datos que soporta JobRunr: [descubre más aquí]({{< ref path="documentation/storage" lang="en" >}}).

### 3. Configura JobRunr con el application.properties de Spring
Para configurar JobRunr puedes aprovechar el fichero `application.properties` de Spring Boot. En este ejemplo activaremos todas las funciones de JobRunr, incluido el procesamiento de jobs en sí y la interfaz web del scheduler (para la monitorización).

{{< codeblock >}}
```properties
jobrunr.background-job-server.enabled=true
jobrunr.dashboard.enabled=true
```
{{< /codeblock >}}

Las dos son `false` por defecto, para que tu aplicación web no empiece a procesar jobs por accidente. El resto de propiedades, como el número de reintentos, están en la [referencia de configuración del Spring Boot Starter]({{< ref path="documentation/configuration/spring" lang="en" >}}).

### 4. Empieza a crear jobs con la API de planificación de JobRunr
#### Crea un job fire-and-forget:
Ahora que tenemos las dependencias listas, podemos crear jobs fire-and-forget fácilmente con el método `enqueue`:

{{< codeblock title="Encolar jobs en segundo plano con el bean `JobScheduler`" >}}
```java
@Autowired
private JobScheduler jobScheduler;
 
jobScheduler.enqueue(() -> myService.doWork());
```
{{< /codeblock >}}

Esta línea se encarga de que la lambda, con su tipo, método y argumentos, se serialice como JSON en un almacenamiento persistente (un RDBMS como Oracle, Postgres, MySQL y MariaDB, o una base de datos NoSQL).

Un pool dedicado de worker threads, que se ejecuta en todos los BackgroundJobServers, ejecutará después esos background jobs encolados lo antes posible, en orden first-in-first-out. JobRunr garantiza la **ejecución de tu job por un único worker** mediante optimistic locking. En JDK 21 y posteriores, estos workers son [virtual threads]({{< ref path="documentation/configuration/virtual-threads" lang="en" >}}) por defecto.

#### Planifica un job para el futuro:
También podemos planificar jobs para el futuro con el método `schedule`:

{{< codeblock title="Programar un job en el futuro con el Job Scheduler de JobRunr" >}}
```java
@Autowired
private JobScheduler jobScheduler;
 
jobScheduler.schedule(Instant.now().plus(8, ChronoUnit.HOURS), () -> myService.doWork());
```
{{< /codeblock >}}

#### Planifica un job recurrente con una expresión cron:
Si queremos jobs recurrentes, tenemos que usar el método `scheduleRecurrently`:

{{< codeblock title="Programar un job recurrente con una expresión cron" >}}
```java
@Autowired
private JobScheduler jobScheduler;
 
jobScheduler.scheduleRecurrently(Cron.daily(), () -> myService.doWork());
```
{{< /codeblock >}}

En una aplicación Spring Boot también puedes poner la anotación `@Recurring` en un método de un bean de Spring. JobRunr la encuentra al arrancar y registra el job recurrente por ti, lo que la convierte en un reemplazo directo de `@Scheduled`:

{{< codeblock title="Programar un job recurrente con la anotación `@Recurring`" >}}
```java
@Service
public class ReportService {

    @Recurring(id = "daily-report", cron = "0 6 * * *")
    @Job(name = "Daily report")
    public void generateDailyReport() {
        // ...
    }
}
```
{{< /codeblock >}}

#### Haz durable un job de varios pasos:
Los jobs reales suelen hacer varias cosas seguidas. Si falla el último paso, un reintento normal vuelve a ejecutar el método entero desde el principio. Con `runStepOnce`, cada paso completado queda registrado y un reintento se salta los pasos que ya terminaron bien. Esto es lo que llamamos un job durable:

{{< codeblock title="Un job durable con `runStepOnce`" >}}
```java
@Job(name = "Fulfil order %0", retries = 5)
public void fulfilOrder(String orderId, JobContext jobContext) {
    jobContext.runStepOnce("charge-payment", () -> paymentGateway.charge(orderId));
    jobContext.runStepOnce("reserve-stock", () -> inventoryService.reserve(orderId));
    jobContext.runStepOnce("send-confirmation", () -> emailService.sendConfirmation(orderId));
}

// encólalo, JobRunr inyecta el JobContext real en tiempo de ejecución
jobScheduler.enqueue(() -> orderService.fulfilOrder(orderId, JobContext.Null));
```
{{< /codeblock >}}

Un paso completado nunca vuelve a ejecutarse, pero un paso que está en ejecución en el momento en que muere la JVM sí puede hacerlo, así que un efecto secundario como un pago debería seguir siendo [idempotente]({{< ref path="blog/Idempotence-in-java-job-scheduling.md" lang="en" >}}). La [guía de ejecuciones durables]({{< ref path="guides/advanced/durable-executions.md" lang="en" >}}) cubre los detalles.

### 5. Abre la interfaz web y mira cómo van tus jobs
![](/documentation/jobs-enqueued.webp "Una vista general de todos los jobs encolados")

El [dashboard]({{< ref path="/documentation/background-methods/dashboard" lang="en" >}}) ofrece una vista general de todos los jobs encolados, y de los demás estados, para que puedas seguir el estado de cada job y asegurarte de que se ejecutan de forma fiable. Por defecto se ejecuta en el puerto 8000, así que abre `http://localhost:8000` cuando tu aplicación esté arrancada.

Abre un job y cambia la vista de su historial a Chart para ver cada intento del job en una línea de tiempo, incluidos los pasos individuales de un job durable, y así ver de un vistazo qué paso falló y qué pasos se saltó el reintento.

## Conclusión
JobRunr es probablemente la mejor opción como scheduler en cualquier proyecto Java. Con sus funciones modernas y su API sencilla, puedes crear jobs puntuales de forma rápida y fácil, y planificar jobs para que se ejecuten a una hora concreta o tras un intervalo determinado.

Las capacidades de nivel empresarial de JobRunr aportan fiabilidad, seguridad y soporte para despliegues de producción a gran escala, lo que lo convierte en la opción ideal para cualquier necesidad de planificación en Java. Además, si adquieres una [licencia de JobRunr Pro]({{< ref "pro.md" >}}), cuentas con un soporte excelente.

¿Quieres profundizar? Lee la [guía de cron jobs en Java]({{< ref path="/blog/java-cron-jobs-guide.md" lang="en" >}}) para tareas recurrentes, [planificación distribuida de jobs en Java]({{< ref path="/blog/distributed-job-scheduling-java.md" lang="en" >}}) para ejecutar jobs en varias instancias, y nuestro [repaso de alternativas a Quartz]({{< ref "/blog/2024-10-31-task-schedulers-java-modern-alternatives-to-quartz">}}) si estás comparando librerías.

---

## FAQ

### 1. ¿Qué es la planificación de jobs en Java y por qué es esencial?

La planificación de jobs en Java automatiza la ejecución de tareas en momentos o intervalos concretos, lo que reduce la necesidad de intervención manual y mejora la eficiencia. La planificación garantiza que los jobs en segundo plano se ejecuten de forma ordenada, evita la sobrecarga del sistema y gestiona workflows complejos, todo ello crucial en aplicaciones de alto rendimiento.

### 2. ¿Cuál es el mejor job scheduler para Java?

Depende de a qué tenga que sobrevivir un job. Para tareas en memoria en una sola instancia, basta con `ScheduledExecutorService` del JDK o `@Scheduled` de Spring. En cuanto los jobs tienen que sobrevivir a reinicios, ejecutarse de forma segura en varias instancias y reintentarse si fallan, necesitas un scheduler persistente como JobRunr, db-scheduler o Quartz. JobRunr añade a eso un dashboard integrado, jobs durables con `runStepOnce` y una API de una sola línea. Consulta [Cómo elegir el mejor job scheduler para Java](#choosing-the-best-java-job-scheduler) más arriba.

### 3. ¿Cómo gestiona la automatización de tareas el job scheduler para Java de JobRunr?

El job scheduler para Java de JobRunr se integra fácilmente con frameworks populares como Spring Boot, y te permite encolar tareas, planificar jobs para que se ejecuten en el futuro o configurar tareas recurrentes con expresiones cron. Su dashboard ofrece monitorización en tiempo real, lo que simplifica la gestión y el seguimiento del rendimiento de los jobs en segundo plano.

Los workers de JobRunr, si están activados, consultan la base de datos con regularidad en busca de jobs nuevos enviados a través de la API `JobScheduler`. Cuando encuentra un job, el worker que lo ha recogido empieza a ejecutarlo.

### 4. ¿Qué tipos de planificación de jobs soporta JobRunr?

JobRunr soporta tres tipos principales de planificación de jobs:
* **Ejecución directa (también llamada fire-and-forget)** para tareas inmediatas.
* **Ejecución diferida (o planificada para el futuro)** para tareas que deben ejecutarse más adelante.
*	**Ejecución recurrente con expresiones cron o intervalos fijos** para jobs periódicos o repetitivos, como tareas diarias o semanales.

### 5. ¿Puede JobRunr ejecutar tareas en varios servidores con planificación distribuida de jobs?

Sí, la planificación distribuida de jobs de JobRunr permite que las tareas se ejecuten en varias instancias de la JVM, lo que mejora la escalabilidad y hace posible una gestión eficiente de las tareas en entornos con varios servidores. Cada instancia que tiene activado el background job server recoge trabajo de la base de datos compartida, y un job solo lo procesa una de ellas. Nuestra guía sobre [planificación distribuida de jobs en Java]({{< ref path="/blog/distributed-job-scheduling-java.md" lang="en" >}}) entra en los detalles.

### 6. ¿Cómo ayuda el dashboard del job scheduler de JobRunr a monitorizar las tareas?

La interfaz web de JobRunr ofrece una vista completa del estado de cada job, con el historial de ejecuciones y los errores que hayan aparecido. Así a los equipos les resulta más fácil monitorizar el rendimiento de los jobs, diagnosticar problemas y optimizar el uso de recursos. El Chart del historial del job muestra cada intento y cada paso durable de un job en una línea de tiempo.

### 7. ¿Qué es una expresión cron y cómo se usa para jobs recurrentes?

Una expresión cron es una sintaxis que define intervalos para la planificación de jobs recurrentes, como tareas diarias, semanales o mensuales. JobRunr te permite usar expresiones cron para tareas repetitivas, lo que facilita automatizar procesos continuos como generar informes o enviar recordatorios. La [guía de cron jobs en Java]({{< ref path="/blog/java-cron-jobs-guide.md" lang="en" >}}) incluye una chuleta con las expresiones más habituales.

### 8. ¿Sigue siendo Quartz un buen job scheduler para Java?

Quartz funciona y se mantiene, y la versión 2.5 funciona con el namespace `jakarta` y Java 11. Pero sigue siendo verboso, necesita 11 tablas en la base de datos y no tiene dashboard integrado ni soporte para virtual threads. Nuestro [repaso de alternativas a Quartz]({{< ref "/blog/2024-10-31-task-schedulers-java-modern-alternatives-to-quartz">}}) lo compara con JobRunr, db-scheduler, ShedLock, Kestra y Temporal.

<div style="display:none;">

![](/blog//meme-job-schedueler2.webp "Vista general de la arquitectura de JobRunr para ejecutar workflows RAG")

</div>
