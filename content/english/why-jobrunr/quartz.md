---
meta_title: "JobRunr vs Quartz Scheduler | Modern Java Job Scheduler"
title: "The Quartz alternative for modern Java teams"
description: "Looking for a Quartz Scheduler alternative? Compare JobRunr and Quartz side by side, with real benchmark numbers, an honest feature table, migration steps and pricing for both."

hero:
  badge: "Quartz vs JobRunr"
  title: "The Quartz alternative for modern Java teams"
  subtitle: "JobRunr runs your Java background jobs on the database you already have. You get a real dashboard, automatic retries and a lot more throughput. And because both schedulers run side by side, you can migrate one job at a time."
  cta_primary:
    label: "Start for free"
    link: "get-started/"
  cta_secondary:
    label: "Take the guided tour"
    link: "https://finance.demo.jobrunr.io/tour"
    external: true
  note: "JobRunr OSS is free forever, for companies too."

stats:
  - value: "18x"
    text: "more jobs per second than Quartz in our public benchmark, on the same Postgres database"
    url: "/en/blog/quartz-vs-jobrunr/"
  - value: "5 tables"
    text: "is all JobRunr adds to your database, where Quartz creates 11"
  - value: "1 dashboard"
    text: "built into JobRunr, showing every job and server in real time, where Quartz ships none"

code_compare:
  title: "The same job, written twice"
  text: "This is the Quartz quick-start example next to its JobRunr equivalent. Quartz asks for a Job class, a JobDetail, a JobDataMap and a Trigger. JobRunr asks for a lambda."
  left:
    label: "Quartz"
    language: "java"
    code: |
      public class WelcomeMailJob implements Job {
          @Override
          public void execute(JobExecutionContext ctx)
                  throws JobExecutionException {
              String userId = ctx.getMergedJobDataMap()
                  .getString("userId");
              new MailService().sendWelcomeMail(userId);
          }
      }

      Scheduler scheduler =
          StdSchedulerFactory.getDefaultScheduler();

      JobDetail job = newJob(WelcomeMailJob.class)
          .withIdentity("welcome-mail", "mails")
          .storeDurably()
          .build();
      scheduler.addJob(job, true);

      JobDataMap data = new JobDataMap();
      data.put("userId", userId);

      scheduler.triggerJob(job.getKey(), data);
      scheduler.start();
  right:
    label: "JobRunr"
    language: "java"
    code: |
      // run it now
      BackgroundJob.enqueue(
          () -> mailService.sendWelcomeMail(userId));

      // or run it tomorrow
      BackgroundJob.schedule(now().plus(1, DAYS),
          () -> mailService.sendReminder(userId));

      // or run it every morning at 8
      BackgroundJob.scheduleRecurrently("0 8 * * *",
          () -> reportService.generateDailyReport());
  footer: "Any existing class or Spring, Quarkus or Micronaut bean works as a job. There is no interface to implement and no JobDataMap to fill by hand, since JobRunr serializes the lambda and its arguments for you."

dashboard:
  title: "Looking for a Quartz scheduler UI? There isn't one."
  paragraphs:
    - "Search for a Quartz scheduler UI and you land in a maze of half-abandoned community projects. Quartz itself ships no interface at all, so most teams end up querying the QRTZ_ tables by hand to work out which jobs ran and which ones vanished."
    - "JobRunr comes with a dashboard out of the box. You see every enqueued, scheduled, succeeded and failed job in real time, and when something breaks you get the full stack trace and can requeue the job with one click."
  image: "/documentation/jobs-enqueued.webp"
  image_alt: "The JobRunr dashboard showing an overview of enqueued jobs"
  link:
    label: "Explore the dashboard"
    url: "/en/documentation/background-methods/dashboard/"

comparison:
  title: "JobRunr vs Quartz, feature by feature"
  text: "Quartz has earned two decades of trust and it still wins on business calendars. The rest, side by side."
  jobrunr_label: "JobRunr"
  competitor_label: "Quartz"
  rows:
    - feature: "Creating a job"
      jobrunr: "A Java 8 lambda"
      competitor: "A Job class, a JobDetail and a Trigger"
    - feature: "Dashboard"
      jobrunr: "Built in, for every job and server"
      competitor: "None, community projects only"
    - feature: "Automatic retries"
      jobrunr: "10 retries with smart back-off, out of the box"
      competitor: "Refire logic you write yourself"
    - feature: "Clustering"
      jobrunr: "On by default, servers coordinate through your database"
      competitor: "Opt-in, needs extra configuration"
    - feature: "Database tables"
      jobrunr: "5"
      competitor: "11"
    - feature: "Throughput in our public benchmark"
      jobrunr: "2,732 jobs per second"
      competitor: "145 jobs per second"
      url: "/en/blog/quartz-vs-jobrunr/"
    - feature: "Virtual threads"
      jobrunr: "Supported out of the box on JDK 21+"
      competitor: "Platform thread pools"
    - feature: "Framework integrations"
      jobrunr: "Official Spring Boot, Quarkus and Micronaut integrations"
      competitor: "Spring Boot starter"
    - feature: "Business calendars"
      jobrunr: "Cron with time zones, business-day rules live in your job code"
      competitor: "Holiday and fiscal calendars built in"
    - feature: "License"
      jobrunr: "LGPL 3.0, free for commercial use"
      competitor: "Apache 2.0, free"
    - feature: "Commercial option"
      jobrunr: "JobRunr Pro adds priority queues, workflows and support"
      competitor: "No commercial edition or support contract"
      url: "/en/pricing/"
    - feature: "Maintenance"
      jobrunr: "Actively developed by a dedicated team"
      competitor: "Active again since IBM acquired the project"

benchmark:
  title: "Where the 18x comes from"
  paragraphs:
    - "We enqueued 500,000 jobs on the same dedicated Hetzner server and the same Postgres 18 database, once with Quartz and once with JobRunr Pro, using identical thread pools and connection pools. Quartz processed 145 jobs per second. JobRunr Pro processed 2,732."
    - "Quartz coordinates its cluster through row locks on a separate QRTZ_LOCKS table, so every job costs extra database round trips. eBay's engineering team documented this exact bottleneck under heavy load. JobRunr takes the lock inside the fetch query itself, using FOR UPDATE SKIP LOCKED on Postgres, so your database spends its time processing jobs instead of managing locks."
    - "To be fair to Quartz, the benchmark uses jobs that finish instantly, which is the worst case for scheduler overhead. If your jobs take half a second each, the gap shrinks because your own code becomes the bottleneck. The extra database load Quartz adds to every job stays either way."
  numbers:
    - label: "Quartz"
      value: "145"
      unit: "jobs per second"
    - label: "JobRunr Pro"
      value: "2,732"
      unit: "jobs per second"
  links:
    - label: "Read the full benchmark"
      url: "/en/blog/quartz-vs-jobrunr/"
    - label: "Run it yourself on GitHub"
      url: "https://github.com/jobrunr/jobrunr-performance-test"
      external: true

proof:
  quote: "Decathlon processes 50 million scans a day on JobRunr."
  link:
    label: "Read the Decathlon story"
    url: "/en/use-case/jobrunr-pro-decathlon/"

choose:
  left:
    title: "Keep Quartz when"
    items:
      - "You maintain a legacy system in low-change mode, where any migration carries more risk than the pain it removes."
      - "You built years of custom listeners and plugins around Quartz internals and they still serve you well."
  right:
    title: "Move to JobRunr when"
    items:
      - "You want to see your jobs. The dashboard alone is the reason many teams switch."
      - "Your database feels the scheduler load, or you process enough jobs that throughput matters."
      - "You run distributed workloads on Kubernetes or in the cloud and want clustering without configuration."
      - "You are tired of writing Job classes and want to enqueue a lambda and move on."

migration:
  title: "Migrate one job at a time"
  text: "JobRunr and Quartz share no tables and no threads, so they run happily side by side in the same application. Most teams move their jobs over gradually and retire Quartz once the last trigger has fired."
  steps:
    - title: "Add the dependency"
      text: "Add jobrunr or the starter for your framework to your build. JobRunr creates its five tables on startup and stays out of Quartz's way."
    - title: "Move a job"
      text: "Pick one Job class and replace it with a lambda or a JobRequestHandler. Keep the Quartz version around until you trust the new one."
    - title: "Retire Quartz"
      text: "When the last trigger has fired, remove the dependency and drop the 11 QRTZ_ tables from your database."
  links:
    - label: "Follow the step-by-step migration guide"
      url: "/en/blog/2023-02-20-moving-from-quartz-scheduler-to-jobrunr/"
    - label: "See a working example on GitHub"
      url: "https://github.com/jobrunr/quartz-to-jobrunr"
      external: true

pricing:
  title: "What each one costs"
  text: "No surprises on either side."
  competitor_card:
    title: "Quartz"
    text: "Free under Apache 2.0. You build and run everything around it yourself, which in practice means a homegrown UI, your own retry logic, your own alerting and the developer time all of that eats."
  jobrunr_card:
    title: "JobRunr"
    text: "JobRunr OSS is free forever under LGPL 3.0, for companies too. JobRunr Pro is €850 per production cluster per month, or €9,000 per year. Startups with fewer than 10 people can apply for the €1,200 per year plan."
    link:
      label: "See the full pricing"
      url: "/en/pricing/"

accordion:
  subtitle: "FAQ"
  title: "Questions Quartz users ask us"
  description: "The things teams want to know before they switch, answered without the sales filter."
  list:
    - title: "How long does a migration from Quartz to JobRunr take?"
      description: "For most applications the first job runs on JobRunr within an afternoon. A full migration depends on how many Job classes you have, but there is no big-bang moment because both schedulers run side by side. Teams usually move a few jobs per sprint and remove Quartz when the last one is gone. The [migration guide](/en/blog/2023-02-20-moving-from-quartz-scheduler-to-jobrunr/) walks through every step with code."
    - title: "Can JobRunr and Quartz run in the same application?"
      description: "Yes. They use separate tables and share no state, so nothing conflicts. This is how most teams migrate, moving jobs over gradually while Quartz keeps running the rest."
    - title: "Is JobRunr really free for commercial use?"
      description: "Yes. JobRunr OSS is licensed under LGPL 3.0 and is free for everyone, including companies of any size. [JobRunr Pro](/en/pro/) is the paid tier that adds priority queues, workflows, an enhanced dashboard and priority support."
    - title: "Does JobRunr work with Spring Boot, Quarkus and Micronaut?"
      description: "Yes, there are official integrations for all three. You can even add JobRunr straight from start.spring.io or code.quarkus.io. Configuration happens through your normal application properties."
    - title: "Which databases does JobRunr support?"
      description: "All major SQL databases, including Postgres, MySQL, MariaDB, Oracle and SQL Server, plus MongoDB on the NoSQL side. JobRunr reuses the datasource your application already has. The full list is in the [storage documentation](/en/documentation/storage/)."
    - title: "Do I need Redis or a message broker?"
      description: "No. Your database is the only infrastructure JobRunr needs, exactly like Quartz in that respect. There is no broker to install, monitor or pay for."
    - title: "What happens when a job fails?"
      description: "JobRunr retries it automatically, up to 10 times with a smart back-off policy. If the job keeps failing, you see the full stack trace in the dashboard and can requeue or delete it with one click. With Quartz, retry behaviour is something you write and maintain yourself."
    - title: "How does JobRunr handle clustering and multiple servers?"
      description: "Every server that starts JobRunr registers itself in the database and the servers coordinate from there. There is nothing to configure, you scale by starting more instances. Quartz can cluster too, but it is opt-in and depends on the row-locking scheme that our benchmark shows becoming the bottleneck under load."
    - title: "What does JobRunr Pro cost?"
      description: "€850 per production cluster per month, or €9,000 per year. A production cluster is every application or microservice talking to one JobRunr database in production, and dev, test and staging are free. Eligible startups can apply for €1,200 per year. All details are on the [pricing page](/en/pricing/)."
    - title: "Is Quartz still maintained?"
      description: "Yes. After a quiet stretch between 2019 and 2023, the IBM acquisition brought new activity and the community has been closing long-standing issues. Teams that still move to JobRunr do it for architectural reasons. The 11-table schema, the lock-table contention and the missing dashboard are design decisions that a new release does not change."
---
