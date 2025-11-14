---
title: "Do you really need Microservices?"
description: "Rethinking Microservices with Modular Monoliths"
image: /blog/2024-05-20-jobrunr-message-queue.png
date: 2024-05-20T09:00:00+02:00
author: "Ronald Dehuysser"
tags:
  - blog
  - meta
---
{{< trial-button >}}

<div style="text-align: center;margin: -2em 0 2em;">
<small style="font-size: 70%;"><a href='https://www.freepik.com/vectors/cartoon-astronaut'></a></small>
</div>

<style type="text/css">
    .post-full-content img {display: inline-block; margin: 0 auto}
</style>

In the world of software development, microservices were once the de facto standard for building scalable and efficient systems. Traditionally, message queueing systems like [RabbitMQ](https://www.rabbitmq.com/) and [Apache Kafka](https://kafka.apache.org/) have been used to keep these different microservices in sync, ensuring reliability and maintaining system performance. However, these systems also introduce complexity and development overhead.

Recently, the idea of monolithic, modular systems has regained popularity. As technology evolves, so do the alternatives for building scalable applications. One such powerful alternative is JobRunr, a distributed background job processing framework for Java. In this blog post, we'll explore how JobRunr can serve as an effective tool for scaling your application without the extra complexity.

### The Microservices Challenge

Microservices architecture offers several benefits, including:

1. **Scalability**: Individual services can be scaled independently based on demand.
2. **Flexibility**: Teams can develop, deploy, and maintain services independently.
3. **Resilience**: Failure in one service doesn't necessarily impact the entire system.

However, microservices also come with significant challenges:

1. **Deployment Complexity**: Managing and deploying multiple services requires sophisticated orchestration tools and strategies.
2. **Duplicated Code**: Common functionalities and entities are often duplicated across services, leading to maintenance challenges and slow development cycles.
3. **Dependency Management**: Keeping transitive dependencies in sync across multiple services can be complex and error-prone.
4. **Inter-service Communication**: Ensuring reliable and low-latency communication between services adds complexity and potential points of failure.
5. **Operational Overhead**: Monitoring, logging, and debugging across multiple services can be significantly more complex than in a monolithic application.

### The Case for Modular Monoliths

A modular monolith architecture offers an alternative approach that mitigates some of these challenges. In a modular monolith, the application is designed in a modular way but deployed as a single unit. This approach provides several advantages:

1. **Simpler Deployment**: Deploying a single application reduces the complexity of deployment and orchestration.
2. **Reduced Code Duplication**: Common functionalities are centralized, reducing the amount of duplicated code across the application.
3. **Easier Dependency Management**: With a single application, managing dependencies becomes simpler and more straightforward.
4. **Enhanced Performance**: Internal function calls within a monolith are faster than inter-service communication in a microservices architecture.
5. **Unified Monitoring and Logging**: Monitoring and debugging a single application is simpler compared to managing multiple services.

The modular monolith approach is gaining traction within the Java community, particularly promoted by the [Spring team](https://spring.io/) at Broadcom through [Spring Modulith](https://spring.io/projects/spring-modulith). This initiative encourages building well-structured monolithic applications with modularity in mind.

### When to Use ~~Micro~~services vs. Modular Monoliths

Choosing between microservices and a modular monolith depends on several factors, including team structure (who doesn't know [Conway's law](https://en.wikipedia.org/wiki/Conway%27s_law)), project requirements, and technological diversity.

**When to Use ~~Micro~~services:**

1. **Multiple Teams**: If your organization has multiple teams working on different parts of the application, microservices allow each team to develop, deploy, and maintain their service independently.
2. **Different Technology Stacks**: When different parts of your application require different technology stacks, microservices enable you to use the best tools for each specific task.

**When to Use Modular Monoliths:**

1. **Single or Small Teams**: For projects maintained by a single team or small teams, a modular monolith simplifies development and deployment.
2. **Consistency in Technology**: When your application can be built using a single technology stack, a modular monolith reduces complexity and overhead.
3. **Simplified Operations**: A monolithic architecture simplifies monitoring, logging, and debugging, making operations more straightforward and less error-prone.

A key principle is that one team should ideally maintain at most one microservice to avoid interdependencies and ensure clear ownership.

### JobRunr: Scaling Without Complexity

JobRunr offers a powerful solution for background job processing that fits perfectly within a modular monolith architecture. Here's why JobRunr stands out:

1. **Simplicity and Integration**: JobRunr integrates seamlessly into your existing Java applications. It doesn't require a separate message broker or additional infrastructure, making setup and maintenance straightforward. You can define jobs as plain Java methods and schedule them with minimal configuration.
2. **Distributed Processing**: JobRunr supports distributed processing, allowing you to run jobs across multiple nodes. This ensures high availability and fault tolerance, as jobs can be redistributed if a node fails.
3. **Persistent Storage**: JobRunr uses your existing database for job storage, which means you don't need to manage a separate message queue system. This approach simplifies architecture and reduces overhead. It also ensures that jobs are persisted and can be retried in case of failure.
4. **Scheduling and Prioritization**: JobRunr excels in scheduling and prioritizing jobs. You can define recurring jobs, delayed jobs, and prioritize tasks based on their importance. This level of control is often more intuitive and flexible than traditional message queueing systems.
5. **Failure Handling**: JobRunr includes robust failure handling with a smart retry policy enabled by default. If a job fails due to an external service being down, JobRunr will automatically retry it using an exponential backoff strategy. This ensures that transient issues are handled gracefully, and only persistent failures will require your attention.
6. **Monitoring and Analytics**: JobRunr offers an out-of-the-box dashboard, allowing you to monitor all your background jobs and quickly identify any issues that may arise. This comprehensive view helps you maintain system reliability and optimize performance with ease.
7. **Cloud-Native Solution**: JobRunr is designed to be cloud-native, enabling seamless integration with cloud environments and leveraging cloud infrastructure for scalability and resilience.

### Scaling with JobRunr on Kubernetes

With JobRunr on Kubernetes (k8s), you can still scale your application effectively by increasing the number of pods running your application. This allows you to handle increased load and improve fault tolerance without the complexity of managing multiple microservices. By scaling the number of pods, you ensure that your background jobs are processed efficiently, leveraging Kubernetes' orchestration capabilities to maintain high availability and performance.

### Modular Monoliths with JobRunr: A Winning Combination

Combining the simplicity of a modular monolith with the power of JobRunr provides a robust and scalable solution for modern Java applications. This approach allows you to:

- **Streamline Deployment**: With a single application to deploy, your deployment process becomes simpler and more reliable.
- **Optimize Performance**: Reduce the latency associated with inter-service communication and leverage efficient background job processing.
- **Maintain Code Quality**: Centralize common functionalities and reduce duplicated code, making your codebase easier to manage and maintain.
- **Simplify Operations**: Benefit from unified monitoring and logging, making it easier to track and debug issues.
- **Scale Seamlessly**: Utilize Kubernetes to scale your application by increasing the number of pods, ensuring efficient job processing, high availability and high throughput.

### Conclusion

While microservices and message queueing systems like RabbitMQ and Apache Kafka have their place in the software development ecosystem, JobRunr offers a powerful and simpler alternative for Java developers. By leveraging JobRunr within a modular monolith architecture, you can achieve scalable and efficient background job processing without the added complexity of managing multiple services.

If you're looking to simplify your architecture and are curious about the benefits JobRunr Pro can bring to your projects, now is the perfect time to explore what JobRunr has to offer. Happy coding!

---

By considering JobRunr and a modular monolith approach, you can unlock new efficiencies and capabilities in your Java applications. Whether you're a seasoned developer or new to background job processing, JobRunr provides the tools and flexibility to take your projects to the next level.

