---
title: "Credits"
subtitle: "JobRunr is build on the shoulders of some giants and I want to give them credit where credit is due."
date: 2020-04-30T11:12:23+02:00
layout: "documentation"
---

### [Hangfire](https://www.hangfire.io) by Sergey Odinokov
JobRunr is a port of Hangfire in .NET to Java and could not have exist without Hangfire being a great example.<br>
[License: LGPL v3](https://github.com/HangfireIO/Hangfire/blob/master/LICENSE.md)


### [ASM](https://asm.ow2.io/)
ASM is used to read the byte code of the provided lambda and find the correct `class` `method` and `arguments` of the job to process in the background. These are then serialized to Json and stored in a `StorageProvider`.<br>
[License: BSD](https://asm.ow2.io/license.html)


### [JavaCron](https://github.com/asahaf/javacron) by Ahmed AlSahaf
JavaCron was used as the basis for the Cron scheduling in JobRunr. It is a great and well-tested Cron parser.<br>
[License: MIT](https://github.com/asahaf/javacron/blob/master/LICENSE)


### [cRonstrue](https://github.com/bradymholt/cRonstrue) by Brady Holt
cRonstrue is a Javascript library and transforms a Cron expression into Human Readable format. It is used in the frontend on the Recurring Jobs page.<br>
[License: MIT](https://github.com/bradymholt/cRonstrue/blob/master/LICENSE)