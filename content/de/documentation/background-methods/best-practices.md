---
title: "Empfohlene Vorgehensweise"
subtitle: "Diese Tipps helfen Ihnen dabei, die Hintergrundverarbeitung reibungslos und effizient zu gestalten."
date: 2020-04-30T11:12:23+02:00
layout: "documentation"
menu: 
  main: 
    identifier: best-practices
    parent: 'background-methods'
    weight: 75
---
### Machen Sie Jobargumente klein und einfach

Methodenaufrufe (d. H. Ein Job) werden während des Erstellungsprozesses des Hintergrundjobs serialisiert. Argumente werden mithilfe der JobMapper-Klasse in Json-Zeichenfolgen konvertiert. Wenn Sie komplexe Entitäten und / oder große Objekte haben; Bei Arrays ist es besser, sie in einer Datenbank abzulegen und dann nur ihre Identität an den Hintergrundjob zu übergeben.

Also, anstatt dies zu tun:

```java
public void backgroundMethod(Entity entity) {}
```

Überlegen Sie Folgendes:

```java
public void backgroundMethod(long entityId) {}
```
<br>

### Machen Sie Ihre Hintergrundmethoden Wiedereintrittbar
[Wiedereintrittbar](https://en.wikipedia.org/wiki/Reentrant_(subroutine)) bedeutet, dass eine Methode während ihrer Ausführung unterbrochen und dann wieder sicher aufgerufen werden kann. Die Unterbrechung kann durch viele verschiedene Dinge verursacht werden (d. H. Ausnahmen, Herunterfahren des Servers), und JobRunr versucht mehrmals, die Verarbeitung zu wiederholen, bis der Job erfolgreich war.

Sie können viele Probleme haben, wenn Sie Ihre Jobs nicht darauf vorbereiten, wieder einzutreten. Wenn Sie beispielsweise einen Hintergrundjob zum Senden von E-Mails verwenden und ein Fehler bei Ihrem SMTP-Dienst auftritt, können Sie mit mehreren E-Mails enden, die an den Adressaten gesendet werden.

Anstatt dies zu tun:

```java
public void sendWelcomeEmail(Long userId) {
    User user = userRepository.getUserById(userId);
    emailService.Send(user.getEmailAddress(), "Hallo!");
}
```

Überlegen Sie Folgendes:

```java
public void sendWelcomeEmail(Long userId) {
    User user = userRepository.getUserById (userId);

    if (user.IsWelcomeEmailNotSent()) {
        emailService.Send(user.getEmailAddress(), "Hallo!");
        user.setWelcomeEmailSent(true);
        userRepository.save(user);
    }
}
```