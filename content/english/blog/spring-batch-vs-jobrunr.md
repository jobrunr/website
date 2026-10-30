---
title: "Spring Batch vs. JobRunr: Choosing the Right Tool for Your Java Background Jobs"
description: "Spring Batch 6 or JobRunr? An honest comparison of chunk processing, scaling, restarts and dashboards, plus a 10 million row CSV import benchmark on Spring Boot 4."
image: "/blog/spring-batch-vs-jobrunr.webp"
date: 2025-09-29T00:00:00+02:00
lastmod: 2026-10-29T10:00:00+01:00
sort_by_lastmod: true
author: "Nicholas D'hondt"
keywords: ["spring batch", "spring batch vs jobrunr", "spring batch alternatives", "spring batch 6", "spring batch dashboard", "is spring batch still relevant"]
tags:
  - blog
  - job scheduling
  - spring batch
---

From traditional mainframe batch jobs in banking to modern cloud-native microservices, Java developers face the same challenge: how to process work reliably in the background. Whether it's generating a report, processing a massive file, or sending thousands of emails, you need to move that work into the background. But when you start looking for a solution, the landscape can be confusing. Do you need a heavyweight, industrial-strength framework, or a lightweight, simple library?

> Already know both solutions and want to see how they compare in the 10 Million Row Challenge? **[Click here to skip to the good stuff](#see-it-in-action-the-10-million-row-challenge)**.


We’ve all been there. You have a job to do, and you need the right tool. In the Java world, two popular but very different options are Spring Batch and JobRunr.

This post will break down the differences between them. We’re not here to tell you one is better than the other. We’re here to give you a clear, honest comparison so you can choose the right tool for your specific project.

### **What is Spring Batch? The Framework for Reliable, Scalable Batch Processing**

Spring Batch is a mature, robust framework designed for large-scale batch processing that is often used as part of mainframe offloading projects, where organizations want to replicate or replace nightly COBOL batch jobs with a Java-based framework. 

Think of Spring Batch as the go-to solution for heavy-duty, data-intensive tasks like ETL (Extract, Transform, Load) pipelines, data migration, and complex financial calculations. It's deeply integrated into the Spring ecosystem and provides a highly structured, opinionated way to build your jobs.

The core concepts in Spring Batch are the `Job` and the `Step`.

* A **Job** is the entire batch process.  
* A **Step** is a distinct phase within that job.

The most common way to build a step is with chunk-oriented processing. This involves three key components.

1. **ItemReader:** Reads data from a source, like a CSV file or a database table.  
2. **ItemProcessor:** Transforms the data according to your business logic.  
3. **ItemWriter:** Writes the processed data to a destination.

All of this is managed by a central `JobRepository`, which tracks the status, history, and state of every job execution. This repository is the foundation of Spring Batch’s greatest strengths. It ensures incredible **transactional integrity** and **restartability**. If a job fails halfway through processing a million records, you can restart it from exactly where it left off without corrupting your data.

Here’s a simplified look at what configuring a Spring Batch job feels like in a Spring Boot application.

```java
@Configuration
public class BatchConfig {

    @Bean
    public Step processFileStep(JobRepository jobRepository, PlatformTransactionManager transactionManager,
                                FlatFileItemReader<Person> reader, PersonItemProcessor processor, JdbcBatchItemWriter<Person> writer) {
        return new StepBuilder("processFileStep", jobRepository)
               .<Person, Person>chunk(10) // Process 10 items per chunk
               .transactionManager(transactionManager)
               .reader(reader)
               .processor(processor)
               .writer(writer)
               .build();
    }

    @Bean
    public Job importUserJob(JobRepository jobRepository, Step processFileStep, JobCompletionNotificationListener listener) {
        return new JobBuilder("importUserJob", jobRepository)
               .listener(listener)
               .start(processFileStep)
               .build();
    }
}
```

You then start it with `jobOperator.start(importUserJob, jobParameters)`. As you can see, it's declarative and powerful, but it also requires a good amount of boilerplate and a solid understanding of its architecture.

Spring Batch can keep that `JobRepository` in a relational database or in MongoDB, and it can also run without one in a resourceless, in-memory mode. In Spring Boot 4 the plain `spring-boot-starter-batch` gives you the in-memory mode, so use `spring-boot-starter-batch-jdbc` when you want execution history and restarts backed by your database.

### **When Should You Use Spring Batch?**

Spring Batch shines when your work is one large, data-centric pipeline and you want the framework to own every read, write and commit.

You should choose it when:

* You are building **complex, multi-step ETL pipelines** that move and transform large volumes of data.  
* Your job is **one long chunk-oriented step over a big file or table**, and you want the framework to commit its progress in the same transaction as the data, so a restart continues from the exact chunk where it stopped.
* You want **skip and retry rules per item declared in configuration**, for example "skip at most 100 malformed lines, retry deadlock exceptions three times".
* You want to reuse a large library of ready-made **readers and writers** for flat files, XML, JSON, JDBC, JPA, MongoDB and Kafka instead of writing that code yourself.
* Your team already has jobs built on **Spring Batch's model** (`Job`, `Step`, step scopes) and knows it well. That is about the batch model, not about Spring itself: JobRunr has a [Spring Boot starter](/en/documentation/configuration/spring/) and fits into a Spring application just as naturally.

### **What is JobRunr? The Library for Simplicity and Distribution**

JobRunr takes a fundamentally different approach. It's a lightweight library, not a framework. Its goal is to make it incredibly simple to run any background job in a distributed and reliable way. You don't need to learn a complex architecture. If you can write a Java method or a lambda, you can convert it to a background job. 

For teams modernizing mainframe batch workloads, JobRunr can be a stepping stone: you can take jobs that once ran in a mainframe environment and distribute them easily in the cloud without heavyweight infrastructure, which keeps operational costs down.

The architecture is storage-centric. You point JobRunr to your existing database (like Postgres, SQL Server, Oracle, or others), and it uses that as its central coordination point.

1. You enqueue a job using a simple API call.  
2. JobRunr serializes the method call and its arguments and saves it to your database.  
3. One or more `BackgroundJobServer` instances (which can be running on different machines) poll the database, pick up the job, and execute it.

This design makes JobRunr **distributed by default**. Need to scale up your processing power? Just spin up another instance of your application. There's no need for external messaging middleware like Kafka or RabbitMQ.

Here’s how you’d run a task in the background with JobRunr.

```java

@RestController
public class MyController {

    @Autowired
    private MyService myService;

    @PostMapping("/generate-report")
    public void generateReport(String reportId) {
        // Enqueue the job with a lambda. It's that simple.
        BackgroundJob.enqueue(() -> myService.createAndEmailReport(reportId));
    }
}

@Service
public class MyService {
    // This is a plain Java method. No special interfaces needed.
    public void createAndEmailReport(String reportId) {
        // ... your business logic here ...
    }
}
```

The difference is clear. There's almost no boilerplate. You focus on your business logic, and JobRunr handles the scheduling, retries, and distribution. It also comes with a built-in [dashboard](/en/documentation/background-methods/dashboard/) where you see every job's history in real time, as a timeline or as a chart of every attempt, down to the individual steps of a durable job. [JobRunr Pro](/en/pro/) adds Job Analytics on top.

### **When Should You Use JobRunr?**

JobRunr is the ideal choice when your primary goal is developer velocity and operational simplicity. You should choose it when:

* You need to **offload long-running tasks** from the main thread in a web application or microservice (e.g., processing an image upload, calling a slow third-party API).  
* Your tasks are more general-purpose background jobs, like **sending notifications, generating reports, or syncing data periodically**.  
* You run **batch jobs** like end-of-day reporting, nightly imports or invoice runs. Schedule them as recurring jobs and split the work into many smaller jobs that run in parallel over all your instances. With [JobRunr Pro batches](/en/documentation/pro/batches/), those jobs are created atomically and a continuation runs once all of them have finished.
* You want a solution that is **distributed by default** and fits naturally into a modern, cloud-native architecture like Kubernetes.  
* You want multi-step jobs that survive a crash: **durable jobs** with `jobContext.runStepOnce(...)` skip the steps that already completed on a retry. Keep each step [idempotent](/en/blog/idempotence-in-java-job-scheduling/).
* You value a **minimal learning curve** and want to get started in minutes, not days.  
* You wish to **monitor** how your background jobs are performing

### **A Head-to-Head Comparison**

| Feature | Spring Batch | JobRunr |
| :---- | :---- | :---- |
| **Paradigm** | Batch framework with its own model (`Job`, `Step`, chunks, readers and writers) | Lightweight library: any Java method or lambda becomes a job |
| **Core Use Case** | Complex ETL, file and data pipelines | General-purpose background jobs, scheduled and recurring work |
| **Scheduling** | Not built in: you start jobs with `JobOperator` from `@Scheduled`, cron, a Kubernetes CronJob or Spring Cloud Task | Built in: fire-and-forget, delayed and recurring (CRON) jobs |
| **Distribution** | Multi-threaded steps and partitioning in one JVM. Across machines: remote partitioning or chunking, which needs a messaging channel such as JMS or AMQP | Distributed by default: every instance that points at the same database picks up jobs, no broker needed |
| **Failure Handling** | Restart from the last committed chunk, skip and retry policies per item | Automatic retries with exponential back-off (10 by default), durable jobs with `runStepOnce` |
| **Monitoring** | Execution history in the `JobRepository`, Micrometer metrics. No UI included | Built-in real-time dashboard plus Micrometer metrics |
| **Learning Curve** | Steeper (scopes, `JobRepository`, chunk transactions) | Minimal |
| **Code Required** | More (reader, processor, writer, step and job beans) | Low (single line of code) |

**What about a Spring Batch dashboard?** Spring Batch records every job and step execution in the `JobRepository` tables and can publish Micrometer metrics. That is solid observability, but you bring the dashboard yourself, typically Grafana on top of the metrics. Spring Batch Admin reached end of life in 2017, and Spring Cloud Data Flow is [no longer maintained as open source](https://spring.io/blog/2025/04/21/spring-cloud-data-flow-commercial). So the honest answer is: build one on the metrics, or pay for one. JobRunr ships its dashboard in the same jar, and also exposes [Micrometer metrics](/en/documentation/configuration/metrics/) if you prefer Grafana.

### **Is Spring Batch Still Relevant?**

Yes. Spring Batch is actively maintained and is still the reference for chunk-oriented processing in Java: readers, processors and writers, per-item skip and retry rules, and restarts from the last committed chunk. If your work fits that model, it is a solid choice. If your work is many independent jobs, triggered by your application or on a schedule and spread over the instances you already run, JobRunr is the more natural fit.

And you can combine them. Nothing stops you from starting a Spring Batch job from a JobRunr recurring job, so JobRunr handles the scheduling, the distribution and the dashboard, while Spring Batch handles the chunked import with its restart semantics.

Looking at Spring Batch alternatives instead? Quartz is a scheduler rather than a batch framework (we compared it in [JobRunr vs. Quartz](/en/blog/quartz-vs-jobrunr/)), and for batch style work in JobRunr, see [Java batch processing with JobRunr](/en/blog/2023-04-11-java-batch-processing/) and [batches](/en/documentation/pro/batches/) in JobRunr Pro.

### **ETL with Spring Batch and JobRunr**

Originally, it was never JobRunr’s focus to do ETL type of jobs but we’re curious about feedback from our community. To see whether there is any interest in it, we implemented a simple ETL job with both Spring Batch and JobRunr where we load a CSV file into a database.

```java
@Component
public class PersonMigrationTask extends JobRunrEtlTask<String, String, Person> {

    private static final Logger LOGGER = LoggerFactory.getLogger(PersonMigrationTask.class);

    private final NamedParameterJdbcTemplate namedParameterJdbcTemplate;
    private final ObjectReader csvReader;

    public PersonMigrationTask(NamedParameterJdbcTemplate namedParameterJdbcTemplate) {
        this.namedParameterJdbcTemplate = namedParameterJdbcTemplate;
        this.csvReader = new CsvMapper()
                .readerFor(Person.class)
                .with(CsvSchema.builder()
                        .addColumn("firstName")
                        .addColumn("lastName")
                        .build());
    }

    @Override
    protected FiniteStream<String> extract() throws Exception {
        String personFileToImport = getContext();
        return FiniteStream.usingStreamCount(() -> Files.lines(Path.of(personFileToImport)));
    }

    @Override
    protected Person transform(String csvLine) throws Exception {
        Person person = csvReader.readValue(csvLine);
        final Person transformedPerson = person.transform();
        LOGGER.info("Converting ({}) into ({})", person, transformedPerson);
        return transformedPerson;
    }

    @Override
    protected void load(List<Person> toSave) {
        String sql = "INSERT INTO people (first_name, last_name) VALUES (:firstName, :lastName)";
        SqlParameterSource[] batch = SqlParameterSourceUtils.createBatch(toSave.toArray());
        namedParameterJdbcTemplate.batchUpdate(sql, batch);
    }

    @Override
    protected void onEnd() {
        LOGGER.info("!!! JOB FINISHED! Time to verify the results");
        Integer count = namedParameterJdbcTemplate.getJdbcTemplate().queryForObject("select count(*) FROM people", Integer.class);
        LOGGER.info("Found {} person records in the database", count);
    }
}
```

In this example, we created an abstract class `JobRunrEtlTask` that leverages the JobRunr `JobContext` to support restartability: after every chunk of 100 rows it stores how far it got in the job metadata, so a retry skips the rows it already imported. If you provide a `FiniteStream`, the Job will also automatically show progress in the dashboard. When your job consists of a handful of distinct steps, durable jobs with `jobContext.runStepOnce(...)` are the better fit.

### **Handling Multi-Step Workflows: Spring Batch Jobs vs. JobRunr Batches**

One of the most powerful features of Spring Batch is orchestrating complex workflows using its `Job` and `Step` architecture. But what if you need that organization without the framework's overhead? This is where JobRunr's batch functionality comes in. 

[JobRunr Pro](/en/pro/) offers [**batches**](/en/documentation/pro/batches/) and [**job chaining**](/en/documentation/pro/job-chaining/), letting you group multiple jobs into a single unit that you can monitor from the dashboard. This replicates Spring Batch's core concept in a lightweight, lambda-based style.

#### **Spring Batch: A Multi-Step Job**

With Spring Batch, you define each step as a bean and then chain them together in your Job configuration to define the flow.

```java
@Configuration
public class SpringBatchWorkflow {

    // Assume stepOne and stepTwo are defined as @Bean methods
    
    @Bean
    public Job multiStepJob(JobRepository jobRepository, Step stepOne, Step stepTwo) {
        return new JobBuilder("multiStepJob", jobRepository)
               .start(stepOne)
               .next(stepTwo)
               .build();
    }
}
```

#### **JobRunr Pro: Batching and Workflow**

With JobRunr, you create an initial job by enqueueing your plain Java methods directly inside it. The workflow is defined right in your code, not in a separate Configuration.java class.

```java
@Service
public class JobRunrWorkflowService {
    
    public void runMultiStepProcess() {
        BackgroundJob
            .<FileProcessor>enqueue(x -> x.process("input.csv"))
            .<CleanupService>continueWith(x -> x.cleanUp());
    }
}
```

The result is the same. It's a two-step process. But the approach is different. Spring Batch uses declarative configuration, while JobRunr lets you orchestrate the workflow directly in your code, keeping your logic in simple methods.

If both steps live inside one job, durable jobs in JobRunr OSS are the lighter option: wrap each step in `jobContext.runStepOnce("step-name", () -> ...)` and a retry skips the steps that already completed. Read more in the [durable executions guide](/en/guides/advanced/durable-executions/).

<span id="the-good-stuf"></span>
### See It in Action: The 10 Million Row Challenge

Theory is one thing, but how do these two stack up in a real-world data processing scenario? We’ve created a [demo project on GitHub](https://github.com/jobrunr/spring-batch-vs-jobrunr) that implements the same ETL job, reading a CSV file, uppercasing every name and inserting the rows into Postgres, using both Spring Batch and JobRunr.

We put them to the test with a 10 million row file:

* **Machine:** MacBook Pro with an Apple M4 Pro and 48GB of RAM.
* **Versions:** Java 25, Spring Boot 4.1.2, Spring Batch 6.0.6 with a JDBC `JobRepository`, JobRunr 9.0.3, PostgreSQL 17 in Docker.
* **The job:** single threaded on both sides, chunks of 100 rows, JDBC batch inserts, every converted row logged at `INFO`. Every run starts with a fresh database and JVM, and we checked that all 10,000,000 rows were imported.

| MacBook M4 Pro (48GB RAM) | Spring Batch 6.0.6 | JobRunr 9.0.3 |
| :--- | :--- | :--- |
| Run 1 | 4m 02s | 3m 13s |
| Run 2 | 4m 34s | 3m 22s |
| Run 3 | 4m 38s | 3m 21s |
| **Median** | 4m 34s | **3m 21s** |

JobRunr finished the import about 27% faster. Put differently, Spring Batch needed 1.36 times as long.

Where does the difference come from? After every chunk, Spring Batch updates the step execution and its execution context in the `JobRepository`, in the same transaction as the inserts. For 10 million rows that is 100,000 commits with two extra updates each. That bookkeeping is what lets Spring Batch restart from the last committed chunk. The JobRunr demo keeps its progress in the job metadata instead, which costs far fewer writes, but it is not in the same transaction as the inserts.

We invite you to clone the repository, run the demo yourself, and explore the code side-by-side. The README explains how to repeat the benchmark with the same script we used. Your feedback is valuable, so [let us know](mailto:hello@jobrunr.io) if you think ETL features like these should be a core part of JobRunr.

Check out the [demo project on GitHub](https://github.com/jobrunr/spring-batch-vs-jobrunr).

### **Key Takeaways**

So, which one is right for you? The answer truly is, "it depends."

Choose **Spring Batch** when your problem is a large, complex, data-centric batch process that demands fine-grained transactional control over every chunk. It is a powerful and proven tool for mission-critical data processing. Budget for the dashboard yourself.

Choose **JobRunr** when you need a simple, fast, and modern way to run any background task in a distributed environment. It prioritizes monitoring using the built-in dashboard, developer happiness and operational simplicity, allowing you to build scalable and responsive applications with ease.

We built JobRunr because we believe that background processing shouldn't be a major architectural challenge. It should be a simple tool that lets you focus on what matters.

Ready to see for yourself? 
Check out our [documentation](https://www.jobrunr.io/en/documentation/) to get started in just 5 minutes or [request a free JobRunr Pro trial](/en/try-jobrunr-pro/)!

We’d love to see what you build.
