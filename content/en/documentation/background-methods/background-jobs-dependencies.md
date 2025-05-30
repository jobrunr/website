---
title: "Background job dependencies"
subtitle: "Use any IoC container to inject dependencies into your background job service classes."
keywords: ["tldr", "ioc container", "inject dependencies", "dependencies", "dependencies", "dependency in java", "dependency injection example"]
date: 2020-04-30T11:12:23+02:00
layout: "documentation"
menu: 
  main: 
    identifier: background-job-dependencies
    parent: 'background-methods'
    weight: 50
---
## TLDR;
If you are using either the [JobRunr Spring Boot Starter]({{<ref "../configuration/spring/_index.md">}}), [Micronaut Integration]({{<ref "../configuration/micronaut/_index.md">}}) or [Quarkus Extension]({{<ref "../configuration/quarkus/_index.md">}}), you can just have beans or services injected into your background job (e.g. the service class that you are calling) and `JobRequestHandler`.


## How to deal with dependencies on other beans and/or services?
In almost every job you’ll want to use other classes of your application to perform different work and keep your code clean and simple. An example:

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
<figcaption>An example of a background job (mailService.sendMail()) with three dependencies</figcaption>
</figure>
Let’s call these classes as dependencies. How to pass these dependencies to methods that will be called in background?

JobRunr supports the following patterns to inject dependencies intro background job services:
- Resolve the fully wired and ready to use background job service via an [IoC container](https://en.wikipedia.org/wiki/Inversion_of_control) - this is the preferred method and is shown below
- Manual dependency instantiation through the new operator
- [Service location](http://en.wikipedia.org/wiki/Service_locator_pattern)
- [Abstract factories](http://en.wikipedia.org/wiki/Abstract_factory_pattern) or [builders](http://en.wikipedia.org/wiki/Builder_pattern)
- [Singletons](http://en.wikipedia.org/wiki/Singleton_pattern)

## IoC containers
JobRunr supports all IoC containers via a simple abstraction layer - the `JobActivator`. The JobActivator is a Java 8 Functional Interface and gives JobRunr an abstraction over all kinds of IoC containers, including [Spring Framework](https://github.com/spring-projects/spring-framework), [Micronaut](https://micronaut.io/), [Quarkus ARC dependency injection](https://quarkus.io/guides/cdi-reference) and [Guice](https://github.com/google/guice).

The interface is as follows:

```java
@FunctionalInterface
public interface JobActivator {

    <T> T activateJob(Class<T> type);

}
```

When a certain background job needs to be executed, JobRunr will try to resolve the actual service instance via the `JobActivator`. This allows JobRunr to resolve a fully wired service bean that is ready to invoke its background method.

The `JobActivator` is automatically created by the [JobRunr Spring Boot Starter]({{<ref "../configuration/spring/_index.md">}}), the [Micronaut Integration]({{<ref "../configuration/micronaut/_index.md">}}) and the [Quarkus Extension]({{<ref "../configuration/quarkus/_index.md">}}) - there is no need for you to create it normally.


If you do need to create it manually, this can be done as follows (a Spring framework example):

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

The `JobActivator` is nothing more than a simple method reference to the `ApplicationContext::getBean` method.