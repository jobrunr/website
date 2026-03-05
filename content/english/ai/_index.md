---
title: "JobRunr for AI | Build Better Java AI Applications"
description: "JobRunr handles the hard parts of AI infrastructure so you can focus on building intelligent features. Background embedding sync, distributed ML pipelines, agent scheduling, and more."
subtitle: "AI Solutions"
layout: "ai"
sitemap:
  priority: 0.9
  changeFreq: weekly

hero:
  badge: "Works with Spring AI, LangChain4j, and any LLM"
  title_start: "Your AI models are smart."
  title_highlight: "Your scheduling infrastructure should be too."
  description: "Every Java AI app hits the same wall: embedding generation is slow, ML pipelines crash mid-run, and LLM calls timeout under load. You end up writing more scheduling code than AI logic. <br/><br/>JobRunr fixes that. One dependency, your existing database, and your AI workloads run reliably in the background."

button:
  get_started:
    enable: true
    label: "See the code"
    link: "#ai-patterns"
  learn_more:
    enable: true
    label: "RAG Tutorial"
    link: "/en/blog/efficient-job-scheduling-for-rag/"

quote_section:
  text: "Tasks like training large language models and updating embeddings often slow things down when handled synchronously. These challenges naturally aligned with what JobRunr does best: managing long-running tasks in the background."
  author: "Ronald Dehuysser"
  role: "CTO & Co-founder, JobRunr"

challenges_section:
  title: "AI in Java is hard for the wrong reasons"
  description: "Frameworks like Spring AI and LangChain4j make LLM integration straightforward. The hard part is everything around it."
  items:
    - title: "Embedding generation blocks your app"
      description: "Computing vectors for thousands of documents takes time. Run it synchronously and your users wait. Run it in a thread pool and you lose work on restarts."
    - title: "Pipelines fail silently"
      description: "A network glitch during an LLM API call loses an hour of processing. Without automatic retries and monitoring, failures go unnoticed until someone complains."
    - title: "Scale is unpredictable"
      description: "Your RAG system works with 100 documents. What about 10 million? Distributing AI workloads across multiple servers shouldn't require a rewrite."
    - title: "No visibility into what's running"
      description: "When your embedding sync job fails at 3 AM, how long before anyone notices? Log files and hope is not a monitoring strategy."

code_section:
  title: "AI patterns that just work"
  description: "Real code examples showing how Java developers use JobRunr to build reliable AI applications."
  examples:
    - title: "RAG Embedding Sync"
      filename: "EmbeddingService.java"
      description: "Keep your vector database in sync with your knowledge base. A recurring job scans for changes and enqueues embedding updates. Workers process them in parallel. Failed jobs retry automatically."
      highlights:
        - "<strong>Automatic retries</strong> with exponential backoff when LLM APIs fail"
        - "<strong>Parallel processing</strong> across configurable worker pools"
        - "<strong>Recurring schedule</strong> keeps embeddings fresh without manual triggers"
      links:
        - label: "Full RAG tutorial"
          url: "/en/blog/efficient-job-scheduling-for-rag/"
        - label: "GitHub example"
          url: "https://github.com/jobrunr/example-rag"
      code: |
        <span style="color:#7c8da6">@Recurring</span>(id = <span style="color:#a5d6ad">"embedding-sync"</span>, cron = <span style="color:#a5d6ad">"0 * * * *"</span>)
        <span style="color:#7c8da6">@Job</span>(name = <span style="color:#a5d6ad">"Sync embeddings with knowledge base"</span>)
        <span style="color:#c792ea">public void</span> <span style="color:#82aaff">syncEmbeddings</span>() {
            List&lt;Document&gt; changed = documentRepo
                .findModifiedSince(lastSync);

            jobScheduler.<span style="color:#82aaff">enqueue</span>(changed.stream(),
                doc -&gt; embeddingManager
                    .updateEmbedding(doc.getId()));
        }

        <span style="color:#7c8da6">@Job</span>(name = <span style="color:#a5d6ad">"Update embedding for document %0"</span>)
        <span style="color:#c792ea">public void</span> <span style="color:#82aaff">updateEmbedding</span>(UUID documentId) {
            Document doc = documentRepo.findById(documentId);
            vectorStore.delete(doc.getId());
            List&lt;float[]&gt; embeddings = aiModel.embed(doc.getContent());
            vectorStore.save(doc.getId(), embeddings);
        }
    - title: "Responsive Vector Search"
      filename: "TicketService.java"
      description: "Offload heavy embedding computation to the background so your API stays responsive. When a support ticket is resolved, its embedding is computed asynchronously. New tickets instantly find similar resolved ones."
      highlights:
        - "<strong>Fire-and-forget</strong> embedding computation on ticket resolution"
        - "<strong>API responds immediately</strong> while JobRunr handles the heavy lifting"
        - "<strong>Works with</strong> Oracle AI Vector Search, pgvector, any vector DB"
      links:
        - label: "Semantic Search tutorial"
          url: "/en/blog/semantic-search-engine-oracle-jobrunr-spring/"
        - label: "GitHub example"
          url: "https://github.com/rdehuyss/demo-oracle-ai-jobrunr"
      code: |
        <span style="color:#c792ea">public</span> Ticket <span style="color:#82aaff">closeTicket</span>(UUID ticketId, String resolution) {
            Ticket ticket = ticketRepository
                .findById(ticketId).orElseThrow();
            ticket.close(resolution);
            ticketRepository.save(ticket);

            <span style="color:#546e7a">// Embedding computation happens in the background</span>
            jobScheduler.<span style="color:#82aaff">enqueue</span>(
                () -&gt; computeAndStoreEmbedding(ticketId));

            <span style="color:#c792ea">return</span> ticket; <span style="color:#546e7a">// API responds immediately</span>
        }

        <span style="color:#7c8da6">@Job</span>(name = <span style="color:#a5d6ad">"Compute embedding for ticket %0"</span>)
        <span style="color:#c792ea">public void</span> <span style="color:#82aaff">computeAndStoreEmbedding</span>(UUID ticketId) {
            Ticket ticket = ticketRepository
                .findById(ticketId).orElseThrow();
            <span style="color:#c792ea">double</span>[] embedding = embeddingModel
                .embed(ticket.getContent());
            ticketRepository.updateEmbedding(ticketId, embedding);
        }
    - title: "AI Agent Scheduling"
      filename: "AgentSchedulingTool.java"
      description: "AI agents need to schedule tasks, run periodic jobs, and survive application restarts. AgentRunr, an open-source Java AI agent runtime, uses JobRunr as its scheduling backbone."
      highlights:
        - "<strong>Agents self-schedule</strong> work through tool calls"
        - "<strong>Persistent tasks</strong> survive application restarts"
        - "<strong>Full visibility</strong> via the JobRunr dashboard"
      links:
        - label: "AgentRunr on GitHub"
          url: "https://github.com/iNicholasBE/AgentRunr"
      code: |
        <span style="color:#546e7a">// AI agents can schedule their own tasks via tool calls</span>
        <span style="color:#7c8da6">@Tool</span>(<span style="color:#a5d6ad">"Schedule a recurring task for the agent"</span>)
        <span style="color:#c792ea">public</span> String <span style="color:#82aaff">scheduleTask</span>(
                String cronExpression,
                String taskDescription) {

            jobScheduler.<span style="color:#82aaff">scheduleRecurrently</span>(
                taskDescription.hashCode() + <span style="color:#a5d6ad">""</span>,
                cronExpression,
                () -&gt; agentService
                    .executeTask(taskDescription));

            <span style="color:#c792ea">return</span> <span style="color:#a5d6ad">"Task scheduled: "</span> + taskDescription;
        }

use_cases_section:
  title: "Production AI workloads powered by JobRunr"
  description: "How companies use JobRunr to run AI and ML in production."
  cases:
    - title: "RAG Embedding Synchronization"
      description: "Keep vector databases in sync with constantly changing knowledge bases. JobRunr manages recurring scans, parallel embedding updates, and automatic retries when LLM APIs fail."
      solution_points:
        - "<strong>Spring AI + pgvector</strong> integration with background embedding sync"
        - "<strong>Parallel processing</strong> across configurable workers"
        - "<strong>Automatic retries</strong> with exponential backoff"
      link:
        label: "Full RAG tutorial"
        url: "/en/blog/efficient-job-scheduling-for-rag/"
    - title: "Semantic Search with Vector Embeddings"
      description: "Build responsive search by computing embeddings in background jobs. API calls return instantly while JobRunr handles the heavy vector computation asynchronously."
      solution_points:
        - "<strong>Oracle AI Vector Search</strong> with ONNX model integration"
        - "<strong>Fire-and-forget</strong> embedding generation on data changes"
        - "<strong>Cosine similarity search</strong> for intelligent ticket matching"
      link:
        label: "Semantic Search tutorial"
        url: "/en/blog/semantic-search-engine-oracle-jobrunr-spring/"
    - title: "Medical Image Analysis (ML Pipelines)"
      description: "A med-tech company distributes image analysis across multiple servers using JobRunr Pro, achieving 10x throughput improvement while keeping patient data on-premise."
      solution_points:
        - "<strong>Batch processing</strong> for parallel image classification"
        - "<strong>10x throughput</strong> improvement via distributed processing"
        - "<strong>Data stays on-premise</strong> with no external service dependencies"
      link:
        label: "Read the case study"
        url: "/en/use-case/jobrunr-pro-image-analysis/"
    - title: "NLP at Scale: Sentiment Analysis"
      description: "Process thousands of web pages through NLP models with parallel execution and fault tolerance. JobRunr distributes crawling jobs and retries failed requests automatically."
      solution_points:
        - "<strong>Parallel web crawling</strong> across multiple workers"
        - "<strong>Real-time monitoring</strong> of analysis progress via dashboard"
        - "<strong>Automatic retry</strong> for transient network failures"
      link:
        label: "Read the case study"
        url: "/en/use-case/jobrunr-pro-web-crawling-and-sentiment-analysis/"

stack_section:
  title: "Works with your existing Java AI stack"
  description: "No new infrastructure. Just add the dependency and start scheduling AI workloads."
  categories:
    - title: "AI Frameworks"
      items:
        - "Spring AI"
        - "LangChain4j"
        - "Deep Java Library (DJL)"
    - title: "LLM Providers"
      items:
        - "OpenAI / Azure OpenAI"
        - "Anthropic (Claude)"
        - "Mistral / Ollama (local)"
    - title: "Vector Databases"
      items:
        - "pgvector (PostgreSQL)"
        - "Oracle AI Vector Search"
        - "Qdrant / Weaviate / Pinecone"
    - title: "Java Frameworks"
      items:
        - "Spring Boot 3"
        - "Quarkus"
        - "Micronaut / Plain Java"
    - title: "JobRunr Storage"
      items:
        - "PostgreSQL / MySQL / MariaDB"
        - "Oracle / SQL Server"
        - "MongoDB"
    - title: "Build Tools"
      items:
        - "Maven"
        - "Gradle"
        - "Any JVM build tool"

comparison_table:
  title: "With and without JobRunr"
  headers: ["Challenge", "Without JobRunr", "With JobRunr"]
  rows:
    - challenge: "Embedding sync"
      without: "Cron scripts, manual retries, no visibility"
      with_jobrunr: "@Recurring + automatic retries + dashboard"
    - challenge: "LLM API failures"
      without: "Silent failures, lost work"
      with_jobrunr: "Automatic retry with exponential backoff"
    - challenge: "Scaling to N servers"
      without: "Rewrite your scheduler"
      with_jobrunr: "Add instances, same database, done"
    - challenge: "Pipeline monitoring"
      without: "Log files and hope"
      with_jobrunr: "Real-time dashboard with full job history"
    - challenge: "Long-running ML tasks"
      without: "Request timeouts, angry users"
      with_jobrunr: "Fire-and-forget background processing"

getting_started:
  title: "Get started in 5 minutes"
  description: "Add one dependency, two config lines, and schedule your first AI job."

accordion:
  title: "Common Questions"
  subtitle: "FAQ"
  description: "Answers for Java developers building AI applications with JobRunr."
  list:
    - title: "How does JobRunr help with RAG workflows?"
      description: "JobRunr automates the scheduling, execution, and retry of embedding generation jobs. Instead of computing embeddings synchronously (which blocks your app) or building a custom scheduler (which takes months), you schedule embedding jobs with one line of code. JobRunr handles parallelization, retries on LLM API failures, and gives you a dashboard to monitor everything."
    - title: "What AI frameworks does JobRunr work with?"
      description: "JobRunr works with any Java AI framework. It integrates naturally with Spring AI, LangChain4j, and Deep Java Library (DJL). Since JobRunr schedules plain Java methods, any code that calls an LLM API, generates embeddings, or runs inference can be scheduled as a background job."
    - title: "Can JobRunr handle vector database synchronization?"
      description: "Yes. JobRunr supports all major databases including PostgreSQL (with pgvector), Oracle (with AI Vector Search), and any other database you use for vector storage. The recurring job feature is ideal for keeping embeddings in sync with changing data sources."
    - title: "How does distributed processing work for ML pipelines?"
      description: "Connect multiple application instances to the same database and JobRunr automatically distributes jobs across all workers. No configuration changes needed. A med-tech company achieved 10x throughput improvement by simply adding more instances to their medical image analysis pipeline."
    - title: "Does JobRunr add infrastructure complexity?"
      description: "No. JobRunr uses your existing SQL database for storage. No Redis, no RabbitMQ, no Kafka, no additional infrastructure. Add the Maven or Gradle dependency, set two config properties, and you're running background AI jobs with a built-in dashboard."
    - title: "What is AgentRunr?"
      description: "AgentRunr is an open-source Java AI agent runtime that uses JobRunr as its scheduling backbone. It demonstrates how AI agents can self-schedule cron jobs, one-shot tasks, and recurring work through tool calls. JobRunr persists these tasks so they survive application restarts, and the dashboard provides full visibility into agent-scheduled work."
---

### Step 1: Add the dependency

{{< codetabs category="dependency" >}}
{{< codetab label="Maven" >}}
```xml
<dependency>
    <groupId>org.jobrunr</groupId>
    <artifactId>jobrunr-spring-boot-3-starter</artifactId>
    <version>8.1.0</version>
</dependency>
```
{{</ codetab >}}
{{< codetab label="Gradle" >}}
```groovy
implementation 'org.jobrunr:jobrunr-spring-boot-3-starter:8.1.0'
```
{{</ codetab >}}
{{</ codetabs >}}

### Step 2: Enable the background server and dashboard

{{< codeblock >}}
```properties
jobrunr.background-job-server.enabled=true
jobrunr.dashboard.enabled=true
```
{{</ codeblock >}}

### Step 3: Schedule your first AI job

{{< codeblock >}}
```java
@Service
public class EmbeddingService {

    private final JobScheduler jobScheduler;
    private final VectorStore vectorStore;
    private final EmbeddingModel embeddingModel;

    // Constructor injection...

    public void onDocumentCreated(UUID documentId) {
        jobScheduler.enqueue(() -> generateEmbedding(documentId));
    }

    @Job(name = "Generate embedding for %0")
    public void generateEmbedding(UUID documentId) {
        Document doc = documentRepo.findById(documentId);
        float[] embedding = embeddingModel.embed(doc.getContent());
        vectorStore.save(documentId, embedding);
    }
}
```
{{</ codeblock >}}

That's it. Your embedding generation now runs in the background, retries on failure, and shows up in the dashboard at `http://localhost:8000`.
