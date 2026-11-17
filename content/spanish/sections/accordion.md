---
# Our Customers
subtitle: "FAQ"
title: "Preguntas frecuentes"
description: "¿Tienes dudas? Encuentra respuestas sobre la migración a Pro, los frameworks compatibles, la seguridad y cómo JobRunr te ayuda a escalar."

# FAQ List
list:
  - title: "¿Por qué debería nuestro equipo pasarse a JobRunr Pro?"
    description: "JobRunr Pro es para equipos que necesitan ahorrar tiempo y escalar. Dejas de construir y mantener herramientas internas frágiles y obtienes funcionalidades listas para producción, como colas de prioridad, workflows y un dashboard multiclúster. Ahorras tiempo de desarrollo y cuentas con soporte experto, para que puedas centrarte en crear funcionalidades para tus usuarios y no en la infraestructura."
    active: true
  - title: "¿Qué significa 'un clúster de producción' por licencia?"
    description: "Una licencia de JobRunr Pro Business cubre un clúster de producción. Definimos un clúster como cualquier grupo de aplicaciones, servidores o microservicios que se conectan a una única base de datos de JobRunr en producción. La licencia te permite usar JobRunr gratis en entornos de desarrollo ilimitados (dev, test, staging). También puedes ejecutar tu aplicación en un número ilimitado de servidores o nodos. Mientras se conecten a esa única base de datos de producción, todo cuenta como un solo clúster. Por ejemplo, todos los microservicios de tu 'Sistema de pagos' estarían cubiertos por una licencia si comparten base de datos. Si tienes un 'Sistema CRM' aparte que usa otra base de datos de producción, necesitarías una segunda licencia. Puedes leer todos los detalles en nuestra [página de licencias](/en/understanding-your-license) (en inglés)."
  - title: "¿Es fácil migrar de la versión OSS a Pro?"
    description: "Sí. Es un simple reemplazo. Actualiza tu dependencia de Maven o Gradle, añade tu clave de licencia y listo en cuestión de minutos. Lo diseñamos así expresamente para eliminar cualquier fricción o incertidumbre."
  - title: "¿Qué frameworks soporta JobRunr?"
    description: "JobRunr se integra de forma nativa con Spring Boot, Micronaut y Quarkus. Nuestro plugin @Transactional garantiza que tus jobs se crean de forma fiable dentro de tus transacciones de base de datos existentes."
  - title: "¿Está JobRunr Pro preparado para entornos enterprise o regulados?"
    description: "Sí. Pro está pensado para eso. Incluye funcionalidades como SSO para acceder al dashboard, registros de auditoría y soporte para ayudarte a cumplir tus requisitos de GDPR e HIPAA."
  - title: "¿Cómo convenzo a mi responsable de comprar Pro?"
    description: "Podemos ayudarte. Hemos preparado un email con 5 razones claras que presentan Pro como una inversión que ahorra tiempo de desarrollo, reduce costes de infraestructura y disminuye el riesgo en producción. [Aquí tienes la plantilla del email](/en/convince-your-boss) (en inglés)."
  - title: "Somos una startup o una organización sin ánimo de lucro. ¿Hay precios especiales?"
    description: "Sí. El precio para startups es de 1.200 € al año mientras sigas cumpliendo los requisitos, es decir, menos de 10 personas y menos de 1 M€ de facturación anual, y puedes solicitarlo directamente desde la [página de precios](/es/pricing). También ofrecemos planes especiales para freelancers y organizaciones sin ánimo de lucro, y licencias libres de royalties si quieres redistribuir JobRunr. Escríbenos y encontraremos un plan que te encaje."
  - title: "Ya somos clientes. ¿Cambia nuestro precio?"
    description: "No. Tu precio actual queda bloqueado. Es nuestra forma de darte las gracias por tu apoyo desde el principio."
# don't create a separate page
build:
  render: "never"
---
