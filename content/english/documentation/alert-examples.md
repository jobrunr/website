---
title: "Alert Examples"
subtitle: "GitHub-style alerts for documentation"
date: 2025-12-30T00:00:00+00:00
layout: "documentation"
draft: true
---

## Base Blockquote

This is a regular markdown blockquote for general notes and comments:

> This is a standard blockquote using markdown syntax. It should have clean, documentation-appropriate styling with reasonable text size and padding.

## GitHub-Style Alert Examples

### Note Alert

> [!NOTE]
> This is an informational alert. Use this for general information that users should be aware of.

### Tip Alert

> [!TIP]
> Making the arguments to your job as simple as possible will allow caching of job details. This means that enqueueing jobs will finish a lot faster.

### Important Alert

> [!IMPORTANT]
> All your servers must run the same version of your code! If your webapp server has a newer version with a method signature that is not compatible with the server that processes your background jobs, a NoSuchMethod Exception will be thrown and job processing will fail!

### Warning Alert

> [!WARNING]
> Be careful when modifying configuration files. Invalid settings may prevent the application from starting.

### Caution Alert

> [!CAUTION]
> Running this command will permanently delete all job data from the database. This action cannot be undone. Make sure you have a backup before proceeding.

### Pro Alert (Custom)

> [!PRO]
> Do you want to create jobs that automatically participate in the transactions managed by Spring? Then checkout [JobRunr Pro](https://www.jobrunr.io/en/pro/)!

## Custom Titles

> [!NOTE] Important Version Info
> All your servers must run the same version of your code!

## Multiple Paragraphs

> [!TIP]
> This is a tip with multiple paragraphs.
>
> The second paragraph should maintain proper spacing and the last paragraph should not have extra bottom margin.
>
> This is the final paragraph.


> [!TIP] This is a callout!