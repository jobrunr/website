---
title: "Kredit"
subtitle: "JobRunr baut auf den Schultern einiger Giganten auf und ich möchte ihnen Kredit geben, wo Kredit fällig ist."
date: 2020-04-30T11:12:23+02:00
layout: "documentation"
---

### [Hangfire](https://www.hangfire.io) durch Sergey Odinokov
JobRunr ist eine Portierung von Hangfire in .NET nach Java und hätte ohne Hangfire als hervorragendes Beispiel nicht existieren können.<br>
[License: LGPL v3](https://github.com/HangfireIO/Hangfire/blob/master/LICENSE.md)


### [ASM](https://asm.ow2.io/)
ASM wird verwendet, um den Bytecode des bereitgestellten Lambda zu lesen und die richtige Klasse, Methode und Argumente des zu verarbeitenden Jobs im Hintergrund zu finden. Diese werden dann in Json serialisiert und in einem `StorageProvider` gespeichert.<br>
[License: BSD](https://asm.ow2.io/license.html)


### [JavaCron](https://github.com/asahaf/javacron) durch Ahmed AlSahaf
JavaCron wurde als Grundlage für die Cron-Planung in JobRunr verwendet. Es ist ein großartiger und bewährter Cron-Parser.<br>
[License: MIT](https://github.com/asahaf/javacron/blob/master/LICENSE)


### [cRonstrue](https://github.com/bradymholt/cRonstrue) durch Brady Holt
cRonstrue ist eine Javascript-Bibliothek und wandelt einen Cron-Ausdruck in ein lesbares Format um. Es wird im Frontend auf der Seite Wiederkehrende Jobs verwendet.<br>
[License: MIT](https://github.com/bradymholt/cRonstrue/blob/master/LICENSE)