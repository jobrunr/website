---
title: What is JobRunr, and why should you use it?
description: Learn about what JobRunr can do for you and how it can improve your daily development workflow.
weight: 10  
tags:
    - JobRunr
    - Job scheduling
hideFrameworkSelector: true
---
For Java developers struggling with asynchronous task execution—from __sending emails in bulk__ to crunching numbers or __processing large files__, JobRunr offers a compelling solution. This developer-centric introduction dives into JobRunr, an [open-source Java library](https://github.com/jobrunr/jobrunr) that significantly simplifies background job processing. We'll explore its core features, how it integrates into Java projects, and why it could be a game-changer for your development workflow.

## Dive Into JobRunr

**JobRunr:** An open-source marvel that eases background task execution in Java apps. It leverages Java 8 lambda expressions, method references, or JobRequests for job scheduling and even supports CRON expressions for complex timing needs. With JobRunr, managing a vast number of background jobs becomes streamlined, ensuring high reliability with minimal performance hit.

## Core Features for Developers

- Ease of Use: JobRunr's API is a breath of fresh air—simple and straightforward. It's designed for quick setup and minimal fuss, letting you focus more on your application logic and less on boilerplate.
- Distributed Processing: Scale is not an issue. JobRunr supports job distribution across a cluster, allowing your applications to grow without a hitch.
- Fault Tolerance: Built-in fault tolerance means if a server bites the dust while processing a job, JobRunr retries the job on another server. This ensures your critical jobs are resilient to system failures.
- Real-Time Monitoring: The JobRunr dashboard is a window into your jobs' souls. It offers real-time insights into job queues and server statuses, making monitoring a breeze.
- Concurrency and Throttling: JobRunr is built with concurrency in mind. It runs multiple jobs simultaneously, efficiently utilizing system resources.
- Rich Documentation: New to JobRunr? No worries. The comprehensive documentation covers everything from setup to advanced features, easing the learning curve.


## Why JobRunr Rocks for Developers

- Simplify Background Tasks: JobRunr turns the complex chore of managing background tasks into a straightforward task, saving you time and headaches.
- Scalability: As your application's demands grow, JobRunr grows with it, thanks to its distributed processing capabilities.
- Boost Application Performance: Offloading tasks to the background frees up the main application thread, smoothing out user experiences and enhancing performance.
- Developer Efficiency: JobRunr's ease of use translates to faster development times. You spend less time wrestling with background job systems and more time coding.
- Cost-Effective: Being open-source, JobRunr offers commercial-grade functionality without the commercial-grade price tag. And if you need more, JobRunr Pro adds extra features and premium support.


## Getting Started with JobRunr

Integrating JobRunr into your Java projects is straightforward:

1. Add the Dependencies: Include JobRunr in your project via Maven, Gradle, etc, and don't forget a compatible JSON marshaller. See [the installation instructions docs](/en/documentation/installation/) for examples. 
2. Configuration: Set up JobRunr using its [Fluent Java API](/en/documentation/configuration/fluent/) or through integrations with frameworks like Spring Boot, Quarkus, or Micronaut. See the [Configuration docs](/en/documentation/configuration/) for examples.
3. Scheduling Jobs: Leverage JobRunr's API to schedule jobs, set up recurring tasks, or trigger jobs at specific times. See the [background methods docs](/en/documentation/background-methods/) for examples.
4. Monitoring: Keep tabs on your background jobs with the JobRunr dashboard, monitoring performance and status at a glance. See the [logging & dashboard docs](/en/documentation/background-methods/logging-progress/) for examples.


## Conclusion

JobRunr stands as a potent, developer-friendly tool for tackling the complexities of modern application requirements. Its blend of simplicity, scalability, and robustness positions it as an invaluable asset for developers looking to incorporate efficient, reliable background job processing into their Java applications. Explore JobRunr, delve into its features, and discover its potential to streamline your development process and boost application performance. **Happy coding!**


## Further Reading

- The [JobRunr Documentation page](/en/documentation/)
- [How to move from Quartz scheduling to JobRunr](/en/blog/2023-02-20-moving-from-quartz-scheduler-to-jobrunr/)
- The [JobRunr GitHub repositories](https://github.com/jobrunr) showcasing examples with Spring Boot, Micronaut, the Fluent API, ...
