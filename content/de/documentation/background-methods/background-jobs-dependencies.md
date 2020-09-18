---
title: "Hintergrundjob Abhängigkeiten"
subtitle: "Verwenden Sie einen beliebigen IoC-Container, um Abhängigkeiten in Ihre Hintergrund-Job-Service-Klassen einzufügen."
date: 2020-04-30T11:12:23+02:00
layout: "documentation"
menu: 
  main: 
    identifier: background-job-dependencies
    parent: 'background-methods'
    weight: 50
---
In fast jedem Job möchten Sie andere Klassen Ihrer Anwendung verwenden, um andere Arbeiten auszuführen und Ihren Code sauber und einfach zu halten. Ein Beispiel:

<figure>

```java
@Component
public class MailService {
    
    private EmailRenderer emailRenderer;
    private UserRepository userRepository;
    private Environment environment;
    
    public MailService(EmailRenderer emailRenderer, UserRepository userRepository, Environment environment) {
        this.emailRenderer = emailRenderer;
        this.userRepository = userRepository;
        this.environment = environment;
    }
    
    public void sendMail(UUID userId, String templateId) {
    	User user = userRepository.getById(userId);
        String htmlEmail = emailRenderer.renderEmail(user, templateId);
        sendMail(user.getEmailAddress(), htmlEmail);
    }
    
    private void sendMail(String to, String htmlContent) {
    	Session session = Session.getInstance(prop, null);
    	Message message = new MimeMessage(session);
      message.setFrom(new InternetAddress(env.getProperty("mail.from")));
      message.setRecipients(
        Message.RecipientType.TO, InternetAddress.parse(to));
      message.setSubject(env.getProperty("mail.subject"));

      MimeBodyPart mimeBodyPart = new MimeBodyPart();
      mimeBodyPart.setContent(htmlContent, "text/html");
      Multipart multipart = new MimeMultipart();
      multipart.addBodyPart(mimeBodyPart);
      message.setContent(multipart);
      Transport.send(message);
    }
    
    private Properties getSmtpProperties() {
    	Properties prop = new Properties();
        prop.put("mail.smtp.host", env.getProperty("smtp.host"));
        prop.put("mail.smtp.port", "25");
        return prop;
    }
    
}
```
<figcaption> Ein Beispiel für einen Hintergrundjob mit drei Abhängigkeiten </figcaption>
</figure>
Nennen wir diese Klassen Abhängigkeiten. Wie übergebe ich diese Abhängigkeiten an Methoden, die im Hintergrund aufgerufen werden?

JobRunr unterstützt die folgenden Muster, um Abhängigkeiten in Hintergrund-Jobdienste einzufügen:
- Lösen Sie den vollständig verdrahteten und einsatzbereiten Hintergrundjobdienst über einen [IoC-Container] (https://en.wikipedia.org/wiki/Inversion_of_control). Dies ist die bevorzugte Methode und wird unten gezeigt
- Manuelle Abhängigkeitsinstanziierung durch den neuen Operator
- [Servicestandort] (http://en.wikipedia.org/wiki/Service_locator_pattern)
- [Abstrakte Fabriken] (http://en.wikipedia.org/wiki/Abstract_factory_pattern) oder [Bauherren] (http://en.wikipedia.org/wiki/Builder_pattern)
- [Singletons](http://en.wikipedia.org/wiki/Singleton_pattern)

## IoC containers
JobRunr unterstützt alle IoC-Container über eine einfache Abstraktionsschicht - den JobActivator. Der JobActivator ist eine Java 8-Funktionsschnittstelle und bietet JobRunr eine Abstraktion über alle Arten von IoC-Containern, einschließlich [Spring Framework] (https://github.com/spring-projects/spring-framework) und [Guice] (https://github.com/google/guice).

Die Schnittstelle ist wie folgt:

```java
@FunctionalInterface
public interface JobActivator {

    <T> T activateJob(Class<T> type);

}
```

Wenn ein bestimmter Hintergrundjob ausgeführt werden muss, versucht JobRunr, die eigentliche Dienstinstanz über den `JobActivator` aufzulösen. Auf diese Weise kann JobRunr eine vollständig Service-Bean auflösen, die bereit ist, die Hintergrundmethode aufzurufen.

Die Verwendung eines JobActivator ist mit einer einfachen Spring-Konfiguration einfach:

```java
@Bean
public BackgroundJobServer backgroundJobServer(StorageProvider storageProvider, JobActivator jobActivator) {
    BackgroundJobServer backgroundJobServer = new BackgroundJobServer(storageProvider, jobActivator);
    backgroundJobServer.start();
    return backgroundJobServer;
}

@Bean
public JobActivator jobActivator(ApplicationContext applicationContext) {
	return applicationContext::getBean;
}
```

Der JobActivator ist nichts anderes als ein einfacher Methodenverweis auf die `ApplicationContext::getBean`-Methode.