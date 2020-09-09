---
title: "Passing arguments"
subtitle: "Pass arguments to background jobs - just like any other normal method invocation."
date: 2020-04-30T11:12:23+02:00
layout: "documentation"
menu: 
  main: 
    identifier: passing-arguments
    parent: 'background-methods'
    weight: 40
---
JobRunr supports the passing of arguments to background jobs - just like any other normal method invocation. These arguments can be any of type `java.lang` or even custom objects.

> Take the following into account if you are using custom objects:<br>
> - it must be possible to serialize and deserialize them via either Jackson or Gson
> - forsee a default no-argument constructor (it can be private) - this helps Jackson and Gson to deserialize it

<figure>

```java
Mail mail = new Mail("from", "to", "subject", "message");
BackgroundJob.enqueue(() -> mailService.send(mail));
```
<figcaption>Since the Mail class can be serialized with Jackson and Gson, it can be passed as an argument to a background job</figcaption>
</figure>

Since arguments are serialized, consider their values carefully as they can blow up your `StorageProvider`. Most of the time it is more efficient to store concrete values in an application database and pass only their identifiers to your background jobs.

Remember that background jobs may be processed days or weeks after they were enqueued. If you use data that is subject to change in your arguments, it may become stale – database records may be deleted, the text of an article may be changed, etc. Plan for these changes and design your background jobs accordingly.