---
title: "Deployment"
subtitle: "JobRunr ships inside your application - here is what to think about when you take it to production."
description: "What to configure and watch out for when deploying a JobRunr application: processing topology, storage, clustering, graceful shutdown, rolling deploys and observability."
keywords: ["deployment", "production", "kubernetes", "docker", "cluster", "rolling deploy", "scaling", "high availability", "deploy java application", "background job server"]
date: 2026-08-10T10:00:00+02:00
lastmod: 2026-09-21T10:00:00+02:00
layout: "documentation"
menu:
  sidebar:
    identifier: deployment
    name: Deployment
    weight: 60
sitemap:
  priority: 0.8
  changeFreq: monthly
---

JobRunr is embedded within your application, so deploying it is simply a matter of deploying your JVM app. Rather than duplicating the documentation of your build tools or orchestrators, this guide focuses specifically on the best practices for running JobRunr in production.

> [!NOTE]
> To keep things simple, we've used properties notation for the configuration items on this page. You can find more details and other available formats on the [configuration page]({{< ref "documentation/configuration" >}}).

> [!PRO]
> This article is written for both JobRunr OSS and JobRunr Pro users. The latter group should also take into consideration the notes with the same formatting as this note.

## Storage

JobRunr requires a database to operate. You can choose from several [built-in storage options]({{< ref "documentation/storage" >}}). Regardless of your choice, ensure your database is appropriately scaled to meet your workload requirements, as JobRunr's performance is limited by the underlying database. Additionally, there are a few key considerations to keep in mind when configuring your database for JobRunr.

### Point JobRunr at the primary node

JobRunr must read from the same node it writes to. A read replica, a MongoDB secondary or an Aurora/DocumentDB reader endpoint will hand it stale data. Failing to meet this requirement will lead to various issues (e.g., different servers may start executing the same job). See [Storage]({{< ref "documentation/storage" >}}) for the details.

### Size your connection pool for the extra load

This shouldn't be overlooked. There are applications where JobRunr compete for the same connections as the rest of the application (e.g., your web requests or jobs hitting the same database). If the connection pool is under high contention, job processing will slow down. It may also prevent JobRunr's maintenance tasks from running (including servers coordination, job scheduling, ...). General recommendations applicable wether you're using JobRunr or not:

1. Avoid long running transactions or keep their number as small as possible (e.g., with rate-limiting).
2. Avoid `@Transactional`, though convenient, it makes it too easy to overlook long running transactions.

Would providing JobRunr with its own datasource help? Maybe. But be aware that this setting does not change the datasource used by your jobs. Additionally, ensure that your database is configured to handle the maximum number of concurrent connections required by your workload.

### Match retention to your throughput

By default, succeeded jobs move to the `DELETED` state after 36 hours and are permanently deleted 72 hours later:

```properties
jobrunr.jobs.delete-succeeded-jobs-after=36h
jobrunr.jobs.permanently-delete-deleted-jobs-after=72h
```

These defaults are comfortable for moderate volumes. If you process a lot of jobs, shorten them - otherwise `jobrunr_jobs` grows faster than housekeeping drains it, and both your database and your dashboard slow down. Conversely, if you need a longer audit trail for a specific kind of job, extend them. You may also use a custom archiving table or database, e.g., with the help of a `JobFilter`.

> [!PRO]
> When retention needs to differ per job type - a noisy 5-minute check that can be deleted almost immediately, an important nightly job you want to keep - JobRunr Pro's [custom delete policy]({{< ref "documentation/pro/custom-delete-policy" >}}) can help with this.

### Optimize batch sizes for JobRunr maintenance tasks

JobRunr processes jobs in bulk to maximize efficiency. These batch sizes are configurable; for example, you can use `jobrunr.background-job-server.scheduled-jobs-request-size` to determine how many scheduled jobs are moved to the enqueued state in a single operation.

You should tune these values based on your infrastructure: increase them for high-performance databases to improve throughput, or lower them for more limited environments. If you are unsure, **we recommend keeping the default settings until performance testing suggests otherwise**.

> [!NOTE]
> Be mindful of your database's constraints. For instance, MySQL may throw a `Packet for query is too large` exception if batch sizes are set too high without a corresponding increase in the database's max_allowed_packet configuration.

## Instance Roles & Deployment Topologies

From JobRunr's perspective, a server can fulfill three primary roles: a **scheduler** for creating jobs, a **worker node** for processing jobs and maintenance tasks, and a **web node** for monitoring via the dashboard. In practice, a single server can "wear multiple hats"—for instance, in a simple deployment, one server performs all three roles simultaneously.

| Setting | Default | Description |
| :--- | :--- | :--- |
| `jobrunr.job-scheduler.enabled` | `true` | Allows the instance to **create jobs** (enqueue, schedule, or create recurring jobs). |
| `jobrunr.background-job-server.enabled` | `false` | Allows the instance to **process jobs** and perform maintenance. |
| `jobrunr.dashboard.enabled` | `false` | **Monitor jobs** with the built-in [dashboard]({{< ref "documentation/background-methods/dashboard" >}}) web server. |

JobRunr’s flexible configuration supports various deployment topologies. You can scale workers independently by setting `jobrunr.background-job-server.enabled=true` in a dedicated deployment, or toggle features based on the environment—such as enabling the dashboard in development but disabling it in production.

A few concrete examples:

**A single deployment.**  If you are running a single production instance of your application, you only need one deployment with scheduling, processing, and (optionally) the dashboard enabled.

**Web deployment and worker deployment.** The same artifact deployed twice with different configuration: your web deployment creates jobs and serves the dashboard, a separate worker deployment processes them. This is what you want when job processing and web traffic have different scaling profiles, or when jobs are heavy enough that you do not want them competing with request handling. The [Kubernetes autoscaling guide]({{< ref "guides/advanced/k8s-autoscaling" >}}) builds exactly this setup.

**A dedicated dashboard deployment.** This could be useful when your application is deployed to in the cloud but you want to keep the dashboard in an internal network.

> [!NOTE]
> You can use `jobrunr.background-job-server.name` to set the name this a worker deployment shows under in the dashboard. Setting it to something meaningful—such as the pod name or deployment name—makes a cluster of servers much easier to reason about.

> [!CAUTION]
> Avoid starting more than one `BackgroundJobServer` within the same JVM instance. Scale out by running more instances, not by starting more servers in one process.

### Running with no processing instances

It is possible to run with zero active background job servers—for example, when implementing 'scale-to-zero' architectures, though there are a few caveats to consider. To start with the positive: your jobs will continue to be created and stored in the database. Processing will automatically resume as soon as an instance with the background job server enabled is started.

The caveats, when there is no background job servers, recurring jobs are no longer scheduled, scheduled jobs are not enqueued, old jobs are not deleted, ... This is because these operations are maintenance tasks handled by the elected master background job server. We recommend to keep at least one background job server instance.

## Scaling out

Clustering JobRunr is not a separate mode you turn on. **Run another instance of your application with the background job server enabled and it joins the cluster**, announces itself and starts picking up work.

One server is elected master - the longest-running one - and takes on the housekeeping: scheduling recurring jobs, enqueueing scheduled jobs, recovering orphans, deleting old jobs. Every server sends a heartbeat every 15 seconds (by default); when one stops, it is removed. If the master stops, the next-longest-running server takes over.

> [!TIP]
> On Kubernetes, keep your first instance running and scale the others up and down.

### When more nodes help - and when they don't

Adding nodes helps when you want **high availability** (a node can die without work stopping), **high throughput** (e.g., by spreading CPU-bound work across machines).

It does not help - and can make things worse - when your jobs all contend for the same finite resource:

- Jobs that hit the database will fight each other for connections, and a heavy aggregation on one node can slow every other node down.
- Jobs calling a rate-limited third-party API will not go faster; they will just fail faster.
- Every additional node adds another poller querying the storage provider, adding to the load the database must carry.

If the bottleneck is downstream rather than in your application, tune the worker count on the nodes you already have before adding more. JobRunr Pro also offers [rate limiters]({{< ref "documentation/pro/rate-limiters" >}}) and [mutexes]({{< ref "documentation/pro/mutexes" >}}) to bound concurrency across the whole cluster rather than per node.

Nodes do not have to be identical: give each one a different `jobrunr.background-job-server.worker-count`, and use [server tags]({{< ref "documentation/pro/server-tags" >}}) in JobRunr Pro to pin specific jobs to specific machines.

For autoscaling based on actual queue depth and worker usage rather than CPU, see the [Kubernetes autoscaling guide]({{< ref "guides/advanced/k8s-autoscaling" >}}).

## Sizing a worker node

Properly sizing your worker nodes ensures that you maximize your hardware capability without overwhelming your database or the machines themselves.

### Worker Count

The `jobrunr.background-job-server.worker-count` property determines how many jobs one instance runs in parallel. By default, this is set to the number of available processors multiplied by 8 (or 16 if using virtual threads), as JobRunr assumes most workloads are I/O-bound.

If your jobs are strictly CPU-bound (e.g., heavy computation, image processing), consider lowering this value to match your core count to avoid excessive context switching. Conversely, if your jobs are heavily I/O-bound and you are using [virtual threads]({{< ref "documentation/configuration/virtual-threads" >}}) (available in JobRunr 7+ on JDK 21+), you can increase the worker count to handle thousands of concurrent jobs on a single node.

### Poll Interval

The `jobrunr.background-job-server.poll-interval-in-seconds` property (default `15`) controls how often each server checks the database for new work.

It is a common misconception that lowering the poll interval increases throughput. In reality, it only reduces the maximum latency before a job is picked up. Because JobRunr workers drain the available queue before waiting for the next poll interval, lowering this value is often unnecessary for processing throughput. The primary adverse effect of a low poll interval is increased load on your database, as every node in your cluster will poll more frequently.

> [!IMPORTANT]
> For JobRunr OSS users, there is a critical relationship between the poll interval and recurring jobs: the poll interval must be **shorter** than the interval of your most frequent recurring job. If a recurring job is scheduled to run every 10 seconds but the poll interval is 15 seconds, JobRunr may launch multiple instances of that job at once to \"catch up\" when the poll finally happens.

> [!PRO]
> JobRunr Pro provides [real-time job scheduling]({{< ref "documentation/pro/real-time-scheduling" >}}) and [instant job processing]({{< ref "documentation/pro/instant-job-processing" >}}), which virtually eliminates queue latency and removes the need to lower the poll interval for responsiveness.

## Graceful shutdown and orphan jobs

Every deploy interrupts whatever your instances were processing. Understanding this helps in picking the right strategy for rolling updates, autoscaling, crash recovery...

When an instance shuts down, assuming gracefully, not abruptly, JobRunr stops accepting new work and waits for running jobs to finish. How long it waits is configurable:

```properties
jobrunr.background-job-server.interrupt-jobs-await-duration-on-stop=10s
```

After that duration the remaining job threads are interrupted. Jobs that do not finish are picked up and retried by another server - nothing is lost, but the work done so far is repeated. Two consequences:

### Write jobs that tolerate being run twice

A job that is interrupted halfway and retried elsewhere will re-execute from the start. This is the practical reason behind the [re-entrancy advice]({{< ref "documentation/background-methods/best-practices#make-your-background-methods-re-entrant" >}}) in our best practices: it is not a theoretical concern, it happens on every deploy.

### Give your orchestrator at least as much grace as JobRunr needs

If Kubernetes kills the pod before JobRunr has finished waiting, the setting does nothing. Set `terminationGracePeriodSeconds` to be equal to or larger than `interrupt-jobs-await-duration-on-stop`, and size both against your longest-running job:

```yaml
spec:
  template:
    spec:
      terminationGracePeriodSeconds: 5400
```

```properties
jobrunr.background-job-server.interrupt-jobs-await-duration-on-stop=90m
```

## Rolling deploys and code changes

Jobs are **serialized method references stored in your database**. A job created last week by the previous version of your code will be executed by whatever version happens to pick it up - and during a rolling deploy, two versions of your application are running against the same job table at the same time. That makes some ordinary refactorings unsafe to deploy.

### Renaming, moving or changing the signature of a job method

This breaks every pending job that points at it. The safe pattern is to keep the old method around for one release (making it package-private is enough in JobRunr Pro) so in-flight jobs can still be resolved, and remove it in the next. Jobs for which JobRunr cannot find a suitable method to execute are automatically moved to the `FAILED` state and not retried.

### Changing a job argument class

This breaks deserialization of payloads that are already persisted - adding a required field, renaming one, changing a type. This is the deployment-level reason to [keep job arguments small and simple]({{< ref "documentation/background-methods/best-practices#make-job-arguments-small-and-simple" >}}): a job that takes an entity id survives refactorings that a job taking a full DTO does not.

> [!NOTE]
In particular, the default `JacksonJsonMapper` (or `Jackson3JsonMapper`) configuration does not allow unknown properties deserialization. This can cause problems when different versions of your application are running in production. For example, if you add a new field to job arguments, older deployments will fail to deserialize jobs containing that field because of the setting mentioned above. Disable this setting if you're comfortable with older deployments processing jobs that contain newly added fields.

### Aligning JobRunr versions across the cluster

This is the ideal, your servers should all share the same code, but not a hard requirement - plenty of releases contain no schema changes, and running mixed versions across them is fine. Check the release notes before a rolling upgrade that crosses a release with database migrations.

> [!PRO]
> JobRunr Pro turns this from a review-time worry into a build-time check. The [`JobRegressionGuard`]({{< ref "documentation/pro/migrations" >}}) fails your build when a refactoring would break jobs that exist in staging or production, and the job migrations API lets you rewrite already-scheduled jobs to match your new code.

## Observability

Background job processing is often a 'black box.' JobRunr provides the visibility you need to manage it. Make sure to enable the observability features to monitor your system effectively.

### Dashboard

The [dashboard]({{< ref "documentation/background-methods/dashboard" >}}) runs its own embedded web server on its own port (8000 by default), separate from your application's port - so it needs its own port mapping, service or ingress rule to be reachable.

Run it on one instance rather than on every worker, and **do not expose it publicly**: anyone who can reach it can read your jobs and perform destructive actions such as deleting jobs. When using JobRunr OSS, you can protect it with basic authentication:

```properties
jobrunr.dashboard.username=jobrunr
jobrunr.dashboard.password=${JOBRUNR_DASHBOARD_PASSWORD}
```

Basic auth is relatively weak. Since your dashboard is likely already behind a reverse proxy or API gateway (like Nginx, Traefik, ...), you may use their authentication mechanism. Most gateways can enforce mTLS, OAuth2/OIDC, or VPN restrictions.

Do not deploy an insecure dashboard. Keep it internal or start a local instance to check on your production cluster.

> [!PRO]
> The [JobRunr Pro dashboard]({{< ref "documentation/pro/jobrunr-pro-dashboard" >}}) can be embedded in your framework's own web server on a configurable context path - so it inherits your existing ingress and TLS - and supports SSO/OpenID Connect with role-based access control. See the [authentication guides]({{< ref "guides/authentication" >}}).

### Metrics

JobRunr exposes Micrometer metrics that can be consumed by various observability platforms. This can be useful for setting up alerts when things are not going as expected, e.g., a lot of jobs start failing.

You may configure JobRunr to expose two kinds of [metrics]({{< ref "documentation/configuration/metrics" >}}):

**Background job server metrics** (`jobrunr.background-job-server.metrics.enabled`, on by default in the Spring and Micronaut integrations) describe the instance itself: CPU, memory, worker pool size, heartbeats. These are per-node values - enable them everywhere.

**Job metrics** (`jobrunr.jobs.metrics.enabled`, off by default) report job counts by state. These are **cluster-wide** values, queried from the storage provider. Only enable them on one instance at a time, ideally the same instance serving the dashboard, to reduce the load on the database.

> [!PRO]
> JobRunr Pro adds per-execution job timings, [job execution tracing]({{< ref "guides/advanced/observability-tracing" >}}) and a metrics API for autoscaling. See [Observability]({{< ref "documentation/pro/observability" >}}).

### Logs

Make sure logs are collected as they will be very helpful when analyzing an incident.

### Health

The Spring Boot, Micronaut and Quarkus integrations contribute the background job server's health to your framework's health endpoint. This is worth keeping an eye on. Job processing may [stop if JobRunr encounters multiple unexpected exceptions consecutively]({{< ref "documentation/faq#jobrunr-stops-completely-if-the-sqlnosql-database-goes-down" >}}), for instance an unreachable database, when this happens the health endpoint will reflect this state.

> [!TIP]
> This endpoint is often used to restart pods in case the background job server stops. If this is how you use it, please make sure to later analyze each incident.

If you are not using one of the framework integrations, the Fluent API exposes the same information over JMX:

```java
JobRunr.configure()
    .useJmxExtensions()
    // ...
```

A third possibility for health monitoring is to use the web server's `/api/servers` REST endpoint, which returns the list of registered servers.

## Environment

### Same clock

Your servers must use a synchronized clock. Otherwise, the JVM will produce answers with gaps to time queries such as `Instant.now()` across your cluster. A consequence of this is that [your servers will kill each other](https://github.com/jobrunr/jobrunr/issues/312). Make sure whichever OS/container you're using is able to synchronize its clock with the rest of the world.

### Time zone

When a recurring job has no explicit `zoneId`, JobRunr uses the JVM's system default - which in a container is whatever the image and environment give it. That only affects cron expressions tied to a wall-clock time (`0 2 * * *` fires at a different moment depending on the zone). Fixed-interval recurring jobs and interval-style crons like "every 15 minutes" are unaffected. If you have wall-clock recurring jobs, provide an explicit `zoneId` when creating the recurring job.

### JobRunr Pro credentials

Please do not expose your JobRunr Pro credentials (private artifact repository access and license key), do not commit them to a public repository.

## Checklist

Before your first production deploy:

- [ ] `jobrunr.background-job-server.enabled=true` on the instances that should process jobs
- [ ] `jobrunr.dashboard.enabled=true` on one instance, behind authentication and not publicly reachable
- [ ] JobRunr points at your database's primary/writer node
- [ ] The runtime user can create the schema, or you create it yourself with `skip-create=true`
- [ ] Connection pool sized for the worker count
- [ ] Retention settings matched to your job volume
- [ ] `interrupt-jobs-await-duration-on-stop` set, and the orchestrator's grace period is at least as long
- [ ] Job metrics enabled on a single instance only
- [ ] The health endpoint is scraped and alerted on


