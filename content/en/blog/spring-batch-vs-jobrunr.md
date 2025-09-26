---
title: "Spring Batch vs. JobRunr: Choosing the Right Tool for Your Java Background Jobs"
summary: "We compare Spring Batch and JobRunr to help you decide whether you need industrial-strength data processing or modern, simple task execution."
images:
  - /blog/springbatchvsjobrunr.webp
feature_image: /blog/springbatchvsjobrunr.webp
date: 2025-09-30T16:00:00+02:00
author: "Nicholas D'hondt"
tags:
  - blog
  - job scheduling
  - spring batch
---

From traditional mainframe batch jobs in banking to modern cloud-native microservices, Java developers face the same challenge: how to process work reliably in the background. Whether it's generating a report, processing a massive file, or sending thousands of emails, you need to move that work into the background. But when you start looking for a solution, the landscape can be confusing. Do you need a heavyweight, industrial-strength framework, or a lightweight, simple library?

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

Here’s a simplified look at what configuring a Spring Batch job feels like.

```java
@Configuration
@EnableBatchProcessing
public class BatchConfig {

    @Bean
    public Step processFileStep(JobRepository jobRepository, PlatformTransactionManager transactionManager,
                                FlatFileItemReader<Person> reader, PersonItemProcessor processor, JdbcBatchItemWriter<Person> writer) {
        return new StepBuilder("processFileStep", jobRepository)
               .<Person, Person>chunk(10, transactionManager) // Process 10 items per chunk
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

As you can see, it's declarative and powerful, but it also requires a good amount of boilerplate and a solid understanding of its architecture.

### **When Should You Use Spring Batch?**

Spring Batch shines when you need absolute control and a detailed audit trail. 

You should choose it when:

* You are building **complex, multi-step ETL pipelines** that move and transform large volumes of data.  
* You work in a **regulated industry** like finance or insurance, where auditable, restartable jobs are a hard requirement.  
* Your task is truly a "batch" process, like end-of-day reporting or migrating millions of user records from one system to another.  
* Your team is already deeply invested in the Spring ecosystem and can manage the learning curve.

### **What is JobRunr? The Library for Simplicity and Distribution**

JobRunr takes a fundamentally different approach. It's a lightweight library, not a framework. Its goal is to make it incredibly simple to run any background job in a distributed and reliable way. You don't need to learn a complex architecture. If you can write a Java method or a lambda, you can convert it to a background job. 

For teams modernizing mainframe batch workloads, JobRunr can be a stepping stone: you can take jobs that once ran in a mainframe environment and distribute them easily in the cloud without heavyweight infrastructure minimizing operational costs.

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

The difference is clear. There's almost no boilerplate. You focus on your business logic, and JobRunr handles the scheduling, retries, and distribution. It also comes with a beautiful built-in dashboard so you can see exactly what's happening with your jobs in real-time.

### **When Should You Use JobRunr?**

JobRunr is the ideal choice when your primary goal is developer velocity and operational simplicity. You should choose it when:

* You need to **offload long-running tasks** from the main thread in a web application or microservice (e.g., processing an image upload, calling a slow third-party API).  
* Your tasks are more general-purpose background jobs, like **sending notifications, generating reports, or syncing data periodically**.  
* You want a solution that is **distributed by default** and fits naturally into a modern, cloud-native architecture like Kubernetes.  
* You value a **minimal learning curve** and want to get started in minutes, not days.  
* You wish to **monitor** how your background jobs are performing

### **A Head-to-Head Comparison**

| Feature | Spring Batch | JobRunr |
| :---- | :---- | :---- |
| **Paradigm** | Heavyweight Framework | Lightweight Library |
| **Core Use Case** | Complex ETL & Data Pipelines | General-Purpose Background Jobs |
| **Distribution** | Requires explicit setup (e.g. Kafka) | Distributed by default (uses database) |
| **Learning Curve** | Steep | Minimal |
| **Code Required** | High (boilerplate & configuration) | Low (single line of code) |
| **Monitoring** | Requires external tools | Built-in real-time dashboard |

### 

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
        return FiniteStream.usingStreamCount(
() -> Files.lines(Path.of(personFileToImport)));
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

In this example, we created an abstract class `JobRunrEtlTask` that leverages the JobRunr `JobContext` to support restartability. If you provide a `FiniteStream`, the Job will also automatically show progress in the dashboard.

### **Handling Multi-Step Workflows: Spring Batch Jobs vs. JobRunr Batches**

One of the most powerful features of Spring Batch is orchestrating complex workflows using its `Job` and `Step` architecture. But what if you need that organization without the framework's overhead? This is where JobRunr's batch functionality comes in. 

[JobRunr Pro](/en/pro) offers **batches** and **job chaining**, letting you group multiple jobs into a single unit that you can monitor from the dashboard. This replicates Spring Batch's core concept in a lightweight, lambda-based style.

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

### **Key Takeaways**

So, which one is right for you? The answer truly is, "it depends."

Choose **Spring Batch** when your problem is a large, complex, data-centric batch process that demands fine-grained transactional control and deep auditability. It is a powerful and proven tool for mission-critical data processing.

Choose **JobRunr** when you need a simple, fast, and modern way to run any background task in a distributed environment. It prioritizes monitoring using the built-in dashboard, developer happiness and operational simplicity, allowing you to build scalable and responsive applications with ease.

We built JobRunr because we believe that background processing shouldn't be a major architectural challenge. It should be a simple tool that lets you focus on what matters.

Ready to see for yourself? Check out our [documentation](https://www.jobrunr.io/en/documentation/) to get started in just 5 minutes. We’d love to hear what you build.