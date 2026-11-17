---
title: "Pásate a Pro antes de que tus apaños se conviertan en infraestructura."
subtitle: "¿JobRunr OSS se te queda pequeño?"
description: "Consigue visibilidad de nivel de producción, workflows, rate limiting, colas de prioridad y soporte, sin tener que construirlo todo tú mismo."
button:
    get_started:
      enable: true
      label: "Empieza a usar JobRunr Pro ahora"
      link: "start-jobrunr-pro/"
    learn_more:
      enable: true
      label: "Haz la visita guiada"
      link: "https://finance.demo.jobrunr.io/tour"
oss_to_pro_signals:
  title: "¿Cuándo conviene pasar de OSS a Pro?"
  lead: "Plantéate Pro cuando:"
  items:
    - item: "Tu equipo está construyendo dashboards propios alrededor de OSS"
    - item: "Los jobs fallidos se descubren a través de tickets de soporte"
    - item: "Necesitas rate limiting, mutexes o deduplicación"
    - item: "Distintas cargas de trabajo necesitan distintas prioridades"
    - item: "Varios servicios o equipos necesitan un único lugar para monitorizar los jobs"
    - item: "Los background jobs están ligados a ingresos, clientes o cumplimiento normativo"
  button:
    enable: true
    label: "Compara OSS y Pro"
    link: "pricing/#comparison-table"
features_intro:
  title: "5 razones por las que los equipos enterprise eligen JobRunr Pro"
first_feature:
  title: "1. Deja de enterarte de los jobs fallidos por tus clientes"
  image: "/images/pro-features/queues.webp"
  list:
    - item: "Usa hasta 5 colas de prioridad para procesar de inmediato jobs urgentes como pagos o notificaciones."
    - item: "Crea colas dinámicas para repartir la carga o separar los jobs de distintos tenants."
    - item: "Ejecuta jobs recurrentes ilimitados para gestionar cargas a gran escala sin toparte con un límite."
  button:
    enable: true
    label: "Descubre todas las funcionalidades de Pro"
    link: "pricing/#comparison-table"
second_feature:
  title: "2. Tu equipo no ha venido a construir un motor de workflows"
  description: "JobRunr Pro te permite crear workflows potentes, batches atómicos y cadenas de jobs para automatizar lógica de negocio compleja con una gestión inteligente de fallos."
  image: "/images/pro-features/jobrunr-pro-batch.webp"
  sub_feature:
    - title: "Encadenamiento de jobs"
      description: "Lanza automáticamente un nuevo job solo cuando termine un job anterior o un batch completo."
      icon: "fa-solid fa-link"
    - title: "Batches atómicos"
      description: "Agrupa miles de jobs en un único batch que termina bien o falla como un todo."
      icon: "fa-solid fa-boxes-stacked"

third_feature:
  title: "3. Un dashboard unificado para cada servicio, equipo y job"
  description: "Ve más allá de un único dashboard. JobRunr Pro te da una vista central de todos tus clústeres y un control preciso para proteger tus sistemas."
  image: "/images/pro-features/multi-cluster-dashboard-filter.gif"
  sub_feature:
    - title: "Dashboard multiclúster"
      description: "Monitoriza todos tus clústeres de JobRunr, ya estén en la UE, en EE. UU. o en staging, desde un único dashboard unificado."
      icon: "fa-solid fa-globe"
    - title: "Rate limiting en tiempo de ejecución"
      description: "Protege APIs y servicios externos fijando límites de frecuencia en jobs concretos para evitar sobrecargas."
      icon: "fa-solid fa-shield-halved"
forth_feature:
  title: "4. Deja que soporte reintente jobs sin meter a ingeniería en cada incidencia"
  video: "/documentation/jobrunr-pro-advanced-search.mp4"
  list:
    - item: "El dashboard de Pro da a tu equipo visibilidad completa con filtros avanzados, historial de jobs y reintentos con un solo clic."
    - item: "Cuando un job falla, tu equipo de soporte puede diagnosticarlo y reintentarlo por su cuenta. Sin necesidad de un desarrollador."
  button:
    enable: false
    label: ""
    link: ""
fifth_feature:
  title: "5. Mantén el procesamiento de jobs visible, trazable y listo para auditorías"
  image: "/images/pro-features/queues.webp"
  list:
    - item: "Protege tu dashboard con integración SSO para una gestión centralizada de usuarios."
    - item: "Cumple los estándares de seguridad enterprise y respalda tus necesidades de cumplimiento de GDPR e HIPAA."
    - item: "Tus datos nunca salen de tu infraestructura. JobRunr se ejecuta dentro de tu JVM sin dependencias externas."
  button:
    enable: true
    label: "Empieza a usar JobRunr Pro ahora"
    link: "start-jobrunr-pro/"

# don't create a separate page
build:
  render: "never"
---
