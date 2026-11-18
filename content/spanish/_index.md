---
meta_title: "JobRunr - Scheduler distribuido de background jobs para Java"
title: "JobRunr - Scheduler distribuido de background jobs para Java"

# Banner
banner:
  title: "No vuelvas a perder un background job."
  description: "Una librería Java fácil de usar para background jobs persistentes.<br /> Funciona sobre tu base de datos actual. Open source y gratuita para uso comercial."
  image:
    bg_image: "/images/bg-pattern.png"
  button:
    get_started:
      enable: true
      label: "Empieza con JobRunr"
      link: "/es/get-started/"
    learn_more:
      enable: true
      label: "Prueba JobRunr Pro"
      link: "/es/pro/"
  examples:
    # NOTE: it's important that all dashboard images have the dimensions/aspect ratio
    - id: "fire-and-forget"
      filename: "Durable.java"
      title: "Ejecuta jobs al instante"
      description: "Los jobs fire-and-forget se ejecutan una sola vez, casi de inmediato. Perfectos para sacar del flujo principal las tareas no críticas."
      code: |
        BackgroundJob.enqueue(() -> processOrder(orderId, JobContext.Null));

        public void processOrder(UUID orderId, JobContext context) {
          context.runStepOnce("order-confirmation", () -> orderService.sendConfirmation(orderId));
          context.runStepOnce("warehouse-notification", () -> orderService.notifyWarehouse(orderId));
          context.runStepOnce("shipment-initiation", () -> orderService.initiateShipment(orderId));
        }
      language: "java"
      dashboard_image: "/dashboard/succeeded-jobs-oss.webp"
      dashboard_alt: "Dashboard de JobRunr mostrando el procesamiento de jobs encolados"
      dashboard_url: "localhost:8000/dashboard/jobs?state=SUCCEEDED"
    - id: "scheduled"
      filename: "Delayed.java"
      title: "Planifica jobs para más tarde"
      description: "Planifica jobs para que se ejecuten en un momento concreto. JobRunr garantiza la ejecución incluso tras reiniciar el servidor."
      code: |
        BackgroundJob.schedule(
          LocalDateTime.now().plusHours(24),
          () -> emailService.sendTips(email)
        );
      language: "java"
      dashboard_image: "/dashboard/scheduled-jobs-oss.webp"
      dashboard_alt: "Dashboard de JobRunr mostrando jobs planificados"
      dashboard_url: "localhost:8000/dashboard/jobs?state=SCHEDULED"
    - id: "recurring"
      filename: "Periodic.java"
      title: "Ejecuta jobs con una expresión `cron`"
      description: "Los jobs recurrentes se lanzan según una expresión `cron`. Ideales para informes diarios, tareas de limpieza o procesos nocturnos."
      code: |
        BackgroundJob.scheduleRecurrently(
          "0 0 * * *",
          () -> cleanupService.deleteOldRecords()
        );
      language: "java"
      dashboard_image: "/dashboard/recurring-jobs-oss.webp"
      dashboard_alt: "Dashboard de JobRunr mostrando jobs recurrentes planificados con expresiones `cron`"
      dashboard_url: "localhost:8000/dashboard/recurring-jobs"
    - id: "workflow"
      filename: "Workflow.java"
      title: "Encadena jobs en workflows"
      description: "Encadena jobs con JobRunr Pro: lanza un job de seguimiento si uno se completa con éxito y un fallback si falla."
      code: |
        BackgroundJob.enqueue(() -> orderService.process(orderId))
          .continueWith(
            () -> emailService.sendConfirmation(orderId), // si termina bien
            () -> alertService.notifyOrderFailure(orderId) // si falla
          )
          .continueWith(() -> packagingService.startPackaging(orderId))
          .continueWith(() -> shippingService.initiateShipment(orderId));
      language: "java"
      dashboard_image: "/dashboard/workflow-job-details.webp"
      dashboard_alt: "Dashboard de JobRunr Pro mostrando una cadena de jobs en un workflow"
      dashboard_url: "localhost:8000/dashboard/jobs/019e9951-dd37-715c-92e5-be775d9bf020"

#How it Works
how_it_works:
  subtitle: "Pasa de scripts frágiles a workflows resilientes"
  title: "Planifica jobs con métodos Java sencillos"
  description: "Añade JobRunr con tu herramienta de build favorita, como Maven o Gradle, y empieza a planificar jobs en minutos."
  features:
    - title: "Jobs fire-and-forget"
      description: "Ejecuta jobs una sola vez y casi de inmediato. Perfectos para sacar del flujo principal las tareas no críticas."
      icon: "fa-solid fa-rocket" 
      link: "/en/documentation/background-methods/enqueueing-jobs/"
    - title: "Jobs planificados y diferidos"
      description: "Ejecuta jobs una vez en un momento concreto. JobRunr garantiza la ejecución incluso tras un reinicio."
      icon: "fa-solid fa-clock" 
      link: "/en/documentation/background-methods/scheduling-jobs/"
    - title: "Jobs CRON recurrentes"
      description: "Los jobs se lanzan cada vez que se dispara el trigger CRON que definas. Ideales para informes diarios o tareas de limpieza."
      icon: "fa-solid fa-repeat" 
      link: "/en/documentation/background-methods/recurring-jobs/"
    - title: "Jobs carbon aware"
      description: "Usa el procesamiento de jobs carbon aware para reducir la huella de carbono de tus servidores."
      icon: "fa-solid fa-leaf"
      link: "/en/documentation/configuration/carbon-aware/"
    - title: "Colas (Pro)"
      description: "Asegúrate de que tus jobs más críticos se ejecuten primero. Evita que las tareas de baja prioridad bloqueen a los jobs de alta prioridad."
      icon: "fa-solid fa-list-ol"
      link: "/en/documentation/pro/priority-queues/"
    - title: "Batches (Pro)"
      description: "Crea un conjunto de background jobs de forma atómica y recibe un aviso en cuanto termine todo el batch."
      icon: "fa-solid fa-layer-group"
      link: "/en/documentation/pro/batches/"
    - title: "Workflows (Pro)"
      description: "Encadena jobs en workflows claros y secuenciales, de modo que cada paso solo se ejecute cuando el anterior se haya completado con éxito."
      icon: "fa-solid fa-diagram-project"
      link: "/en/documentation/pro/job-chaining/"
    - title: "Jobs externos (Pro)"
      description: "Haz seguimiento del trabajo que termina fuera de tu JVM, como una inferencia en GPU o una aprobación humana, y márcalo como completado desde cualquier lugar."
      icon: "fa-solid fa-satellite-dish"
      link: "/en/guides/advanced/external-jobs/"



# Pricing
pricing:
  title: "Encuentra el plan adecuado para ti"
  subtitle: "Precios y planes"
  description: "Empieza gratis con la versión open source o consigue funcionalidades avanzadas como colas de prioridad, <br /> batches y gestión de workflows con JobRunr Pro."

# Customers Review
customer_reviews:
  title: "Con la confianza de desarrolladores de todo el mundo"
  subtitle: "Más de 1 millón de descargas al mes"
  description: "No lo decimos solo nosotros. Esto es lo que opinan de JobRunr algunos líderes del sector"

# JobRunr for AI
jobrunr_for_ai:
  badge: "JobRunr para IA"
  title: "Ejecuta en segundo plano tus cargas de trabajo de IA en Java"
  description: "La generación de embeddings, la sincronización de RAG y los pipelines de ML se ejecutan de forma fiable en segundo plano, sobre tu base de datos actual. Funciona con Spring AI, LangChain4j y cualquier LLM."
  tags:
    - "Sincronización de embeddings para RAG"
    - "Embeddings fire-and-forget"
    - "Planificación de agentes de IA"
  button:
    enable: true
    label: "Descubre JobRunr para IA"
    link: "/en/ai/"

# JobRunr Spot CTA banner
spot_cta:
  enable: true
  badge: "Beta privada en AWS"
  title: "Workers bajo demanda para tu cola de jobs, a precios spot."
  description: "Cuando se acumulan jobs en la cola, JobRunr arranca workers en tu propia cuenta de AWS entre un 62 y un 69% por debajo del precio on-demand, según nuestras mediciones. Tus servidores actuales siguen funcionando como hasta ahora."
  button:
    label: "Únete a la beta privada"
    link: "/en/spot/"
---
