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

 ### Make the Job Lambda as small as possible
 
JobRunr needs to analyze your job using ASM and reflection. The more instructions you put inside the Job lambda, the slower the enqueueing / scheduling will be.

So, instead of doing this:
 
```java
BackgroundJob.enqueue(reportService -> reportService.generateReport(
    dtoConversionService.toDto(
        new ReportRequest(Instant.now(), reportService.getPreviousReport())
    )
);
```
 
Consider doing this:
 
```java
ReportRequestDto reportRequestDto =  dtoConversionService.toDto(new ReportRequest(Instant.now(), reportService.getPreviousReport()));
BackgroundJob.enqueue(() -> reportService.generateReport(reportRequestDto));
```
 <br>

> Making the arguments to your job as simple as possible will allow caching of job details. This means that enqueueing jobs (e.g. via web requests) will finish a lot faster.

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
<br/>

### Do not catch Throwable!
If your background job method catches `java.lang.Exception` or `java.lang.Throwable` and this exception is not rethrown, JobRunr is off-course not aware that something went wrong and thinks the job finished successfully. 

> Never catch `Exception` or `Throwable` - JobRunr will take care of it for you!



So, never do this:
 
```java
public void sendWelcomeEmail(Long userId) {
    try {
        User user = userRepository.getUserById(userId);
        emailService.Send(user.getEmailAddress(), "Hello!");
    } catch (Throwable t) { // the exception is catched and JobRunr does not know that something went wrong!
        t.printStackTrace();
    }
}
```

Instead, do this:
```java
public void sendWelcomeEmail(Long userId) throws Exception {
    User user = userRepository.getUserById(userId);
    emailService.Send(user.getEmailAddress(), "Hello!");
}
```

If you'd like to log in case of an `Exception` or `Throwable`, you should do it as follows:
```java
public void sendWelcomeEmail(Long userId) throws Exception {
    try {
        User user = userRepository.getUserById(userId);
        emailService.Send(user.getEmailAddress(), "Hello!");
    } catch (Exception e) { // the exception is catched and re-thrown allowing JobRunr to reschedule it.
        logger.error("Error running job", e);
        throw e;
    }
}
```