---
title: "Best practices"
subtitle: "These tips will help you keep background processing running smoothly and efficiently"
date: 2020-04-30T11:12:23+02:00
layout: "documentation"
menu: 
  main: 
    identifier: best-practices
    parent: 'background-methods'
    weight: 75
---
 ### Make job arguments small and simple
 
Method invocations (i.e. a job) are serialized during the creation process of the background job. Arguments are converted into Json strings using the `JobMapper` class. If you have complex entities and/or large objects; including arrays, it is better to place them into a database, and then pass only their identities to the background job.

So, instead of doing this:
 
```java
public void backgroundMethod(Entity entity) { }
```
 
Consider doing this:
 
```java
public void backgroundMethod(long entityId) { }
```
 <br>

### Make your background methods re-entrant
[Re-entrancy](https://en.wikipedia.org/wiki/Reentrant_(subroutine)) means that a method can be interrupted in the middle of its execution and then be safely called again. The interruption can be caused by many different things (i.e. exceptions, server shut-down), and JobRunr will attempt to retry processing many times until the job succeeded.

You may have many problems, if you don't prepare your jobs to be reentrant. For example, if you are using an email sending background job and experience an error with your SMTP service, you can end with multiple emails sent to the addressee.

Instead of doing this:
 
```java
 public void sendWelcomeEmail(Long userId) {
	User user = userRepository.getUserById(userId);
    emailService.Send(user.getEmailAddress(), "Hello!");
}
```

Consider doing this:

```java
public void sendWelcomeEmail(Long userId) {
	User user = userRepository.getUserById(userId);
    
	if (user.IsWelcomeEmailNotSent()) {
    	emailService.Send(user.getEmailAddress(), "Hello!");
        user.setWelcomeEmailSent(true);
        userRepository.save(user);
    }
}
```