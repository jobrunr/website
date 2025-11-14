---
title: "Third Party Software Notices"
date: 2020-08-27T11:12:23+02:00
---

JobRunr products use software provided by third parties, including open source software. The following copyright statements and licenses apply to various components that are distributed with various JobRunr products. The JobRunr product that includes this file does not necessarily use all of the third party software components referred to below.

Licensee must fully agree and comply with these license terms or must not use these components. The third party license terms apply only to the respective software to which the license pertains, and the third party license terms do not apply to the JobRunr software.

In the event that we accidentally failed to list a required notice, please bring it to our attention by sending an email to hello@jobrunr.io.


### [ASM](https://asm.ow2.io/) by OW2 community 
ASM is imported as a transitive dependency and is used to read the byte code of the provided lambda and find the correct `class` `method` and `arguments` of the job to process in the background. These are then serialized to Json and stored in a `StorageProvider`.<br>
[License: BSD](https://asm.ow2.io/license.html)

### [SLF4J](https://www.slf4j.org/) by qos.ch
SLF4J is imported as a transitive dependency and is used for logging purposes.<br>
[License: MIT](https://www.slf4j.org/license.html)

### [JavaCron](https://github.com/asahaf/javacron) by Ahmed AlSahaf
JavaCron was used as the basis for the Cron scheduling in JobRunr. It is a great and well-tested Cron parser.<br>
[License: MIT](https://github.com/asahaf/javacron/blob/master/LICENSE)

### [React](https://github.com/facebook/react) by Facebook
JobRunr uses React to render the dashboard.<br>
[License: MIT](https://github.com/facebook/react/blob/main/LICENSE)

### [Material UI Community for React](https://mui.com/core/) by Material UI SAS
JobRunr uses Material UI community edition for all dashboard related widgets.<br>
[License: MIT](https://mui.com/pricing/)

### [cRonstrue](https://github.com/bradymholt/cRonstrue) by Brady Holt
cRonstrue is a Javascript library and transforms a Cron expression into Human Readable format. It is used in the frontend on the Recurring Jobs page.<br>
[License: MIT](https://github.com/bradymholt/cRonstrue/blob/master/LICENSE)