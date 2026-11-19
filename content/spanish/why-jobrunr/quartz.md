---
meta_title: "JobRunr vs Quartz Scheduler | Scheduler de jobs moderno para Java"
title: "La alternativa a Quartz para equipos Java modernos"
description: "¿Buscas una alternativa a Quartz Scheduler? Compara JobRunr y Quartz punto por punto, con cifras reales de benchmark, una tabla de funcionalidades honesta, los pasos de migración y los precios de ambos."

hero:
  badge: "Quartz vs JobRunr"
  title: "La alternativa a Quartz para equipos Java modernos"
  subtitle: "JobRunr ejecuta los background jobs de tu aplicación Java sobre la base de datos que ya tienes. Obtienes un dashboard de verdad, reintentos automáticos y mucho más rendimiento. Y como los dos schedulers funcionan en paralelo, puedes migrar job a job."
  cta_primary:
    label: "Empieza gratis"
    link: "get-started/"
  cta_secondary:
    label: "Haz el tour guiado"
    link: "https://finance.demo.jobrunr.io/tour"
    external: true
  note: "JobRunr OSS es gratis para siempre, también para empresas."

stats:
  - value: "18x"
    text: "más jobs por segundo que Quartz en nuestro benchmark público, sobre la misma base de datos Postgres"
    url: "/en/blog/quartz-vs-jobrunr/"
  - value: "5 tablas"
    text: "es todo lo que JobRunr añade a tu base de datos, mientras que Quartz crea 11"
  - value: "1 dashboard"
    text: "integrado en JobRunr, que muestra cada job y cada servidor en tiempo real, mientras que Quartz no incluye ninguno"

code_compare:
  title: "El mismo job, escrito dos veces"
  text: "Este es el ejemplo de inicio rápido de Quartz junto a su equivalente en JobRunr. Quartz te pide una clase Job, un JobDetail, un JobDataMap y un Trigger. JobRunr te pide una lambda."
  left:
    label: "Quartz"
    language: "java"
    code: |
      public class WelcomeMailJob implements Job {
          @Override
          public void execute(JobExecutionContext ctx)
                  throws JobExecutionException {
              String userId = ctx.getMergedJobDataMap()
                  .getString("userId");
              new MailService().sendWelcomeMail(userId);
          }
      }

      Scheduler scheduler =
          StdSchedulerFactory.getDefaultScheduler();

      JobDetail job = newJob(WelcomeMailJob.class)
          .withIdentity("welcome-mail", "mails")
          .storeDurably()
          .build();
      scheduler.addJob(job, true);

      JobDataMap data = new JobDataMap();
      data.put("userId", userId);

      scheduler.triggerJob(job.getKey(), data);
      scheduler.start();
  right:
    label: "JobRunr"
    language: "java"
    code: |
      // ejecútalo ahora
      BackgroundJob.enqueue(
          () -> mailService.sendWelcomeMail(userId));

      // o ejecútalo mañana
      BackgroundJob.schedule(now().plus(1, DAYS),
          () -> mailService.sendReminder(userId));

      // o ejecútalo cada mañana a las 8
      BackgroundJob.scheduleRecurrently("0 8 * * *",
          () -> reportService.generateDailyReport());
  footer: "Cualquier clase existente o bean de Spring, Quarkus o Micronaut sirve como job. No hay ninguna interfaz que implementar ni ningún JobDataMap que rellenar a mano, porque JobRunr serializa la lambda y sus argumentos por ti."

dashboard:
  title: "¿Buscas una UI para Quartz Scheduler? No existe."
  paragraphs:
    - "Busca una UI para Quartz Scheduler y acabarás en un laberinto de proyectos de la comunidad medio abandonados. Quartz no incluye ninguna interfaz, así que la mayoría de los equipos terminan consultando las tablas QRTZ_ a mano para averiguar qué jobs se ejecutaron y cuáles desaparecieron."
    - "JobRunr trae un dashboard de serie. Ves en tiempo real cada job encolado, planificado, completado y fallido, y cuando algo se rompe tienes el stack trace completo y puedes volver a encolar el job con un clic."
  image: "/documentation/jobs-enqueued.webp"
  image_alt: "El dashboard de JobRunr mostrando un resumen de los jobs encolados"
  link:
    label: "Explora el dashboard"
    url: "/en/documentation/background-methods/dashboard/"

comparison:
  title: "JobRunr vs Quartz, funcionalidad por funcionalidad"
  text: "Quartz se ha ganado dos décadas de confianza y sigue siendo mejor en calendarios laborales. Aquí tienes el resto, cara a cara."
  jobrunr_label: "JobRunr"
  competitor_label: "Quartz"
  rows:
    - feature: "Crear un job"
      jobrunr: "Una lambda de Java 8"
      competitor: "Una clase Job, un JobDetail y un Trigger"
    - feature: "Dashboard"
      jobrunr: "Integrado, para cada job y cada servidor"
      competitor: "Ninguno, solo proyectos de la comunidad"
    - feature: "Reintentos automáticos"
      jobrunr: "10 reintentos con backoff inteligente, de serie"
      competitor: "Lógica de reintentos que tienes que escribir tú"
    - feature: "Clustering"
      jobrunr: "Activado por defecto, los servidores se coordinan a través de tu base de datos"
      competitor: "Opcional, requiere configuración adicional"
    - feature: "Tablas en la base de datos"
      jobrunr: "5"
      competitor: "11"
    - feature: "Rendimiento en nuestro benchmark público"
      jobrunr: "2.732 jobs por segundo"
      competitor: "145 jobs por segundo"
      url: "/en/blog/quartz-vs-jobrunr/"
    - feature: "Virtual threads"
      jobrunr: "Soportados de serie en JDK 21+"
      competitor: "Pools de platform threads"
    - feature: "Integraciones con frameworks"
      jobrunr: "Integraciones oficiales para Spring Boot, Quarkus y Micronaut"
      competitor: "Starter de Spring Boot"
    - feature: "Calendarios laborales"
      jobrunr: "Cron con zonas horarias, las reglas de días laborables viven en el código de tu job"
      competitor: "Calendarios de festivos y fiscales integrados"
    - feature: "Licencia"
      jobrunr: "LGPL 3.0, gratis para uso comercial"
      competitor: "Apache 2.0, gratis"
    - feature: "Opción comercial"
      jobrunr: "JobRunr Pro añade colas de prioridad, workflows y soporte"
      competitor: "Sin edición comercial ni contrato de soporte"
      url: "/es/pricing/"
    - feature: "Mantenimiento"
      jobrunr: "Desarrollo activo por parte de un equipo dedicado"
      competitor: "Activo de nuevo desde que IBM adquirió el proyecto"

benchmark:
  title: "De dónde sale el 18x"
  paragraphs:
    - "Encolamos 500.000 jobs en el mismo servidor dedicado de Hetzner y la misma base de datos Postgres 18, una vez con Quartz y otra con JobRunr Pro, con pools de threads y de conexiones idénticos. Quartz procesó 145 jobs por segundo. JobRunr Pro procesó 2.732."
    - "Quartz coordina su clúster mediante bloqueos de fila en una tabla aparte, QRTZ_LOCKS, así que cada job necesita más viajes de ida y vuelta a la base de datos. El equipo de ingeniería de eBay documentó este mismo cuello de botella bajo carga elevada. JobRunr toma el bloqueo dentro de la propia consulta de lectura, usando FOR UPDATE SKIP LOCKED en Postgres, de modo que tu base de datos dedica su tiempo a procesar jobs en lugar de gestionar bloqueos."
    - "Para ser justos con Quartz, el benchmark usa jobs que terminan al instante, que es el peor caso para la sobrecarga del scheduler. Si tus jobs tardan medio segundo cada uno, la diferencia se reduce porque tu propio código pasa a ser el cuello de botella. La carga extra que Quartz añade a la base de datos con cada job se mantiene en ambos casos."
  numbers:
    - label: "Quartz"
      value: "145"
      unit: "jobs por segundo"
    - label: "JobRunr Pro"
      value: "2.732"
      unit: "jobs por segundo"
  links:
    - label: "Lee el benchmark completo"
      url: "/en/blog/quartz-vs-jobrunr/"
    - label: "Ejecútalo tú mismo en GitHub"
      url: "https://github.com/jobrunr/jobrunr-performance-test"
      external: true

proof:
  quote: "Decathlon procesa 50 millones de escaneos al día con JobRunr."
  link:
    label: "Lee el caso de Decathlon"
    url: "/en/use-case/jobrunr-pro-decathlon/"

choose:
  left:
    title: "Quédate con Quartz cuando"
    items:
      - "Mantienes un sistema legacy que apenas cambia, donde migrar supone más riesgo que las molestias que te ahorra."
      - "Has construido durante años listeners y plugins a medida alrededor de los internals de Quartz y te siguen funcionando bien."
  right:
    title: "Pásate a JobRunr cuando"
    items:
      - "Quieres ver tus jobs. El dashboard por sí solo es el motivo por el que muchos equipos cambian."
      - "Tu base de datos nota la carga del scheduler, o procesas suficientes jobs como para que el rendimiento importe."
      - "Ejecutas cargas de trabajo distribuidas en Kubernetes o en la nube y quieres clustering sin configuración."
      - "Estás cansado de escribir clases Job y quieres encolar una lambda y seguir con lo tuyo."

migration:
  title: "Migra job a job"
  text: "JobRunr y Quartz no comparten tablas ni threads, así que conviven sin problemas en la misma aplicación. La mayoría de los equipos trasladan sus jobs poco a poco y retiran Quartz cuando se ha disparado el último trigger."
  steps:
    - title: "Añade la dependencia"
      text: "Añade jobrunr o el starter de tu framework a tu build. JobRunr crea sus cinco tablas al arrancar y no interfiere con Quartz."
    - title: "Migra un job"
      text: "Elige una clase Job y sustitúyela por una lambda o un JobRequestHandler. Conserva la versión de Quartz hasta que confíes en la nueva."
    - title: "Retira Quartz"
      text: "Cuando se haya disparado el último trigger, elimina la dependencia y borra las 11 tablas QRTZ_ de tu base de datos."
  links:
    - label: "Sigue la guía de migración paso a paso"
      url: "/en/blog/2023-02-20-moving-from-quartz-scheduler-to-jobrunr/"
    - label: "Mira un ejemplo funcional en GitHub"
      url: "https://github.com/jobrunr/quartz-to-jobrunr"
      external: true

pricing:
  title: "Lo que cuesta cada uno"
  text: "Sin sorpresas por ninguna de las dos partes."
  competitor_card:
    title: "Quartz"
    text: "Gratis bajo Apache 2.0. Todo lo que lo rodea lo construyes y lo mantienes tú, lo que en la práctica significa una UI propia, tu propia lógica de reintentos, tus propias alertas y el tiempo de desarrollo que consume todo eso."
  jobrunr_card:
    title: "JobRunr"
    text: "JobRunr OSS es gratis para siempre bajo LGPL 3.0, también para empresas. JobRunr Pro cuesta 850 € al mes por clúster de producción, o 9.000 € al año. Las startups con menos de 10 personas pueden solicitar el plan de 1.200 € al año."
    link:
      label: "Consulta todos los precios"
      url: "/es/pricing/"

accordion:
  subtitle: "FAQ"
  title: "Preguntas que nos hacen los usuarios de Quartz"
  description: "Lo que los equipos quieren saber antes de cambiar, sin rodeos comerciales."
  list:
    - title: "¿Cuánto tarda una migración de Quartz a JobRunr?"
      description: "En la mayoría de las aplicaciones, el primer job se ejecuta en JobRunr en una tarde. Una migración completa depende de cuántas clases Job tengas, pero no hace falta migrarlo todo de golpe porque los dos schedulers funcionan en paralelo. Los equipos suelen migrar unos cuantos jobs por sprint y eliminan Quartz cuando ya no queda ninguno. La [guía de migración](/en/blog/2023-02-20-moving-from-quartz-scheduler-to-jobrunr/) recorre cada paso con código."
    - title: "¿Pueden JobRunr y Quartz ejecutarse en la misma aplicación?"
      description: "Sí. Usan tablas separadas y no comparten estado, así que no hay conflictos. Así es como migra la mayoría de los equipos: trasladan los jobs poco a poco mientras Quartz sigue ejecutando el resto."
    - title: "¿De verdad JobRunr es gratis para uso comercial?"
      description: "Sí. JobRunr OSS se distribuye bajo la licencia LGPL 3.0 y es gratis para todo el mundo, incluidas empresas de cualquier tamaño. [JobRunr Pro](/es/pro/) es la versión de pago, que añade colas de prioridad, workflows, un dashboard mejorado y soporte prioritario."
    - title: "¿Funciona JobRunr con Spring Boot, Quarkus y Micronaut?"
      description: "Sí, hay integraciones oficiales para los tres. Incluso puedes añadir JobRunr directamente desde start.spring.io o code.quarkus.io. La configuración se hace a través de las propiedades habituales de tu aplicación."
    - title: "¿Qué bases de datos soporta JobRunr?"
      description: "Todas las principales bases de datos SQL, incluidas Postgres, MySQL, MariaDB, Oracle y SQL Server, además de MongoDB en el lado NoSQL. JobRunr reutiliza el datasource que tu aplicación ya tiene. La lista completa está en la [documentación de almacenamiento](/en/documentation/storage/)."
    - title: "¿Necesito Redis o un message broker?"
      description: "No. Tu base de datos es la única infraestructura que JobRunr necesita, exactamente igual que Quartz en ese aspecto. No hay ningún broker que instalar, monitorizar ni pagar."
    - title: "¿Qué pasa cuando un job falla?"
      description: "JobRunr lo reintenta automáticamente, hasta 10 veces con una política de backoff inteligente. Si el job sigue fallando, ves el stack trace completo en el dashboard y puedes volver a encolarlo o eliminarlo con un clic. Con Quartz, el comportamiento de los reintentos es algo que escribes y mantienes tú."
    - title: "¿Cómo gestiona JobRunr el clustering y varios servidores?"
      description: "Cada servidor que arranca JobRunr se registra en la base de datos y los servidores se coordinan a partir de ahí. No hay nada que configurar: escalas arrancando más instancias. Quartz también puede funcionar en clúster, pero es opcional y depende del esquema de bloqueo de filas que, según nuestro benchmark, se convierte en el cuello de botella bajo carga."
    - title: "¿Cuánto cuesta JobRunr Pro?"
      description: "850 € al mes por clúster de producción, o 9.000 € al año. Un clúster de producción es el conjunto de aplicaciones o microservicios que se conectan a una misma base de datos de JobRunr en producción, y los entornos de desarrollo, test y staging son gratis. Las startups que cumplan los requisitos pueden solicitar el plan de 1.200 € al año. Todos los detalles están en la [página de precios](/es/pricing/)."
    - title: "¿Quartz sigue manteniéndose?"
      description: "Sí. Tras unos años con poca actividad entre 2019 y 2023, la adquisición por parte de IBM trajo nueva actividad y la comunidad ha ido cerrando issues que llevaban mucho tiempo abiertos. Los equipos que aun así se pasan a JobRunr lo hacen por motivos de arquitectura. El esquema de 11 tablas, la contención en la tabla de bloqueos y la ausencia de dashboard son decisiones de diseño que una nueva versión no cambia."
---
