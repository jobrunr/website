---
title: "Understanding Your JobRunr Pro Business License"
description: "A clear explanation of our licensing model for production environments."
date: 2025-11-12
---

We want our licensing to be simple and fair. You may have seen our license is for **one production cluster**. We get questions on what this means in practice.

This page explains exactly what one cluster is and what your license covers.

The short answer is: **A Pro Business license covers all your applications that connect to one production JobRunr database.**

A **JobRunr Pro Enterprise license** on the other hand is truly **unlimited**. You can use it with as many clusters or databases as you want.

## What is a "Production Cluster"?

A production cluster is any group of applications, servers, or microservices that share **one single JobRunr database** in your live production environment.

This database is how JobRunr coordinates all the background jobs.

You can have many different applications or services connect to this one database. This is all considered one cluster.

For example:

* An **"E-commerce System"** that uses one production database is **one cluster**.
* An **"Internal HR System"** that uses a *separate* production database is a **second cluster**.

Even if they are run by the same company. These two systems would each need their own JobRunr Pro Business license.

## What Your License Includes

Your single cluster license includes:

* **Unlimited Non-Production Environments**
    You can use your license key in all development, testing, QA, and staging environments for free. We only license your single production database.

* **Unlimited Developers**
    We do not charge per seat. Your whole team is covered.

* **Unlimited Servers, Nodes, or Pods**
    We do not care how many instances you run. You can scale your application to hundreds of servers. If they connect to the same production database, it is still one cluster.

## Common Scenarios

Here are a few examples to make it even clearer.

### Scenario 1: The Microservice Architecture

* **Your Setup:** You have a large application built with multiple microservices. For example, a `payment-service`, a `fraud-detector`, and a `notification-service`.
* **Your License:** You need **one license**. As long as all these microservices connect to the *same* production JobRunr database, they are all part of the same cluster.

### Scenario 2: The Hybrid Cloud Scenario

* **Your Setup:** You run one application. Some servers are on-premise. You add more worker servers in the cloud like AWS or Azure to scale.
* **Your License:** You need **one license**. This is all one cluster connecting to one database, regardless of where the servers are.

### Scenario 3: Multiple Environments

* **Your Setup:** You have a development environment, a staging environment, and a production environment for your "E-commerce System".
* **Your License:** You need **one license**. We only charge for the production database. The dev and staging databases are free.

### Scenario 4: Separate Products

* **Your Setup:** You have two completely separate products.
    1.  An **"E-commerce Platform"** that uses its own production database.
    2.  An **"Internal HR Tool"** that uses a *different* production database.
* **Your License:** You need **two licenses**. These are two different clusters because they use two different production databases.

## Still Unsure?

Our goal is fair and simple pricing. We are not trying to trick you.

If you have a complex setup or just want to double-check, please [contact us]({{< ref "/contact.md" >}}). We are happy to help.