---
title: "Credits"
subtitle: "JobRunr stands on the shoulders of giants — here's who made it possible."
date: 2020-04-30T11:12:23+02:00
lastmod: 2026-03-31T00:00:00+02:00
layout: "documentation"
menu:
  sidebar:
    identifier: credits
    name: Credits
    weight: 110
---

## Backend

### Hangfire — by Sergey Odinokov
JobRunr started as a port of [Hangfire](https://www.hangfire.io) from .NET to Java. Sergey's design proved that transparent background job processing with persistence and a built-in dashboard was achievable — our dashboard is highly inspired by Hangfire's.<br>
[License: LGPL v3](https://github.com/HangfireIO/Hangfire/blob/master/LICENSE.md)

### ASM
[ASM](https://asm.ow2.io/) reads the bytecode of the lambda you pass to `BackgroundJob.enqueue()` to extract the target class, method, and arguments, which are then serialized to JSON and stored in the `StorageProvider`.<br>
[License: BSD](https://asm.ow2.io/license.html)

### JavaCron — by Ahmed AlSahaf
[JavaCron](https://github.com/asahaf/javacron) is the foundation for cron scheduling in JobRunr — a well-tested and reliable cron parser for the JVM.<br>
[License: MIT](https://github.com/asahaf/javacron/blob/master/LICENSE)

## Dashboard

### React — by Meta
The JobRunr dashboard is built on [React](https://react.dev).<br>
[License: MIT](https://github.com/facebook/react/blob/main/LICENSE)

### MUI & MUI X
[MUI](https://mui.com) provides the component library; [MUI X](https://mui.com/x/) contributes the data grid and date/time pickers used in the dashboard.<br>
[License: MIT](https://github.com/mui/material-ui/blob/master/LICENSE)

### cRonstrue — by Brady Holt
[cRonstrue](https://github.com/bradymholt/cRonstrue) translates cron expressions into human-readable text on the Recurring Jobs page.<br>
[License: MIT](https://github.com/bradymholt/cRonstrue/blob/master/LICENSE)

### react-timeago — by Naman Goel
[react-timeago](https://github.com/nmn/react-timeago) renders live relative timestamps ("3 minutes ago") throughout the dashboard without any manual refresh logic.<br>
[License: MIT](https://github.com/nmn/react-timeago/blob/master/LICENSE)

### react-syntax-highlighter
[react-syntax-highlighter](https://github.com/react-syntax-highlighter/react-syntax-highlighter) powers syntax-highlighted stack traces in the job detail view.<br>
[License: MIT](https://github.com/react-syntax-highlighter/react-syntax-highlighter/blob/master/LICENSE)
