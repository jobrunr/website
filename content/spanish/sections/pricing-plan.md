---
# Pricing
#
# NOTE: the home page renders these cards too, via themes/fortify-hugo/layouts/index.html.
# Any copy or CTA change here changes the home page as well. Review both after editing.
#
# `tip:` on a list item renders a tooltip on the pricing page. It exists because Clarity showed
# visitors clicking these lines expecting them to explain themselves.
#
# `url:` turns a list item into a dashed-underline link to the page that documents it.
basic_plan:
  title: "OSS"
  description: "Gratis para todo el mundo, también para empresas."
  currency: ""
  monthly_price: "Gratis"
  yearly_price: "Gratis"
  billed_monthly: "ahora y siempre"
  billed_yearly: "ahora y siempre"
  list:
    - item: "Hasta 100 jobs recurrentes"
      url: "documentation/background-methods/recurring-jobs/"
      tip: "El límite práctico depende de tu base de datos. A partir de unos 100 jobs recurrentes, la mayoría de las instalaciones empiezan a notarlo."
    - item: "Dashboard sencillo"
      url: "documentation/background-methods/dashboard/"
    - item: "Encolado y planificación de jobs"
      url: "documentation/background-methods/enqueueing-jobs/"
    - item: "Reintentos automáticos"
      url: "documentation/background-methods/dealing-with-exceptions/"
    - item: "Planificación de jobs carbon aware"
      url: "documentation/background-methods/carbon-aware-jobs/"
    - item: "Licencia LGPL 3.0"
      url: "licensing/lgpl/"
    - item: "Soporte de la comunidad (Stack Overflow, GitHub)"
      url: "https://github.com/jobrunr/jobrunr/discussions"
  button:
    enable: true
    label: "Empieza ahora"
    link: "get-started/"
  currency_usd: ""
  monthly_price_usd: "Gratis"

premium_plan:
  title: "Pro Business"
  description: "Simplifica tus workflows y background jobs."
  recommended: "El más popular"
  currency: "€"
  monthly_price: "850"
  yearly_price: "9000"
  billed_monthly: "por clúster de PRD / mes"
  billed_yearly: "por clúster de PRD / año"
  billed_monthly_tip: "Un clúster de producción incluye todas las aplicaciones, servidores o microservicios que se conectan a una misma base de datos de JobRunr en producción. Los entornos de dev, test y staging son gratis e ilimitados."
  billed_yearly_tip: "Un clúster de producción incluye todas las aplicaciones, servidores o microservicios que se conectan a una misma base de datos de JobRunr en producción. Los entornos de dev, test y staging son gratis e ilimitados."
  list:
    - item: "Todo lo de JobRunr OSS y además:"
    - item: "Hasta 5000 jobs recurrentes"
      url: "documentation/background-methods/recurring-jobs/"
      tip: "Cinco mil jobs recurrentes en un clúster, sin los límites de base de datos con los que te encuentras en OSS."
    - item: "Dashboard mejorado"
      url: "documentation/pro/jobrunr-pro-dashboard/"
    - item: "Plugin de transacciones"
      url: "documentation/pro/transactions/"
    - item: "Colas de prioridad"
      url: "documentation/pro/priority-queues/"
    - item: "Gestión de workflows (batches y encadenamiento)"
      url: "documentation/pro/job-chaining/"
    - item: "Planificación en tiempo real"
      url: "documentation/pro/real-time-scheduling/"
    - item: "Soporte prioritario por email / HelpDesk"
      url: "contact/"
  button:
    enable: true
    label: "Empieza a usar JobRunr Pro ahora"
    link: "start-jobrunr-pro/"
    link2: "/en/get-jobrunr-pro-business"
  currency_usd: "$"
  monthly_price_usd: "950"
  yearly_price_usd: "10000"

enterprise_plan:
  title: "Pro Enterprise"
  description: "Pensado para cargas críticas a gran escala. Incluye clústeres de PRD ilimitados."
  currency: ""
  monthly_price: "A medida"
  yearly_price: "A medida"
  list:
    - item: "Todo lo de JobRunr Business y además:"
    - item: "Jobs recurrentes ilimitados"
      url: "documentation/background-methods/recurring-jobs/"
    - item: "Clústeres y microservicios ilimitados"
      url: "understanding-your-license/"
    - item: "Dashboard multiclúster"
      url: "documentation/pro/jobrunr-pro-multi-dashboard/"
    - item: "Métricas de autoescalado para Kubernetes"
      url: "guides/advanced/k8s-autoscaling/"
    - item: "1 Panic Button / año"
      url: "blog/2023-06-06-jobrunr-pro-panic-button/"
    - item: "Soporte para procesos de compra a medida"
      url: "get-jobrunr-pro-enterprise/"
    - item: "Prioridad en las peticiones de nuevas funcionalidades"
      url: "get-jobrunr-pro-enterprise/"
  button:
    enable: true
    label: "Habla con un experto de JobRunr"
    link: "get-jobrunr-pro-enterprise/"
  currency_usd: ""
  monthly_price_usd: "A medida"
# don't create a separate page
build:
  render: "never"
---
