---
title: "JobRunr Spot | Run background jobs on spot, save 60 to 80%"
description: "JobRunr Spot runs your background jobs on the cheapest spot instances across AWS and Google Cloud. Save 60 to 80% on your cloud bill. CPU and GPU both supported, starting with CPU. Launching September 2026. Join the private beta waitlist."
layout: "spot"
sitemap:
  priority: 0.8
  changeFreq: weekly

hero:
  badge: "Private beta live now on AWS"
  title_start: "Background jobs on spot, in your own cloud."
  title_highlight: "60 to 80% off your cloud bill."
  description: "JobRunr Spot watches your job queue and boots your app on the cheapest spot instance in your own cloud account when jobs start waiting. If the instance gets reclaimed, your cluster picks the jobs back up."

button:
  primary:
    enable: true
    label: "Join the waitlist"
    link: "#waitlist"
  secondary:
    enable: true
    label: "See how it works"
    link: "#how-it-works"

challenges_section:
  title: "Spot is cheap. Capturing the saving is hard."
  description: "AWS and Google Cloud spot instances are 60 to 80 percent cheaper than on-demand. Most teams leave that money on the table because using spot well takes more work than it's worth."
  items:
    - title: "Spot prices change by the minute"
      description: "The same instance can be four times cheaper in another region, or half the price an hour from now. Tracking that across AWS and Google Cloud is a full-time job. So most teams give up and pay on-demand."
    - title: "Sudden shutdowns break your jobs"
      description: "You move a batch job to spot. It gets killed three times. You miss your SLA. You move it back to on-demand. Spot only works if something else handles the failover for you."
    - title: "Your autoscaler watches CPU, not your job queue"
      description: "By the time CPU metrics trigger a scale-up, your jobs have already been waiting. What you actually want is extra capacity the moment the queue backs up, torn down the moment it drains. Teaching a generic autoscaler to react to job latency means custom metrics and glue code nobody wants to maintain."
    - title: "Even when you find cheaper capacity, you can't use it"
      description: "The cheapest spot right now might be a different region, a different AZ, or a different instance family. Your Terraform pins all three. By the time you redeploy to capture the saving, the price has already moved."

how_it_works:
  id: "how-it-works"
  title: "Configure it once. JobRunr scales itself onto spot."
  description: "Give JobRunr Spot your cloud credentials and the Docker image of your app. It watches its own job queue: when jobs start waiting longer than the latency you set, it boots your image on the cheapest spot instance that matches your hardware requirements. That worker joins your cluster and processes jobs like any other node, and it all shuts down again once the queue is quiet."
  filename: "JobRunrConfiguration.java"
  highlights:
    - "<strong>Your queue is the scaling signal:</strong> capacity appears when jobs start waiting and disappears when the queue drains. No custom CloudWatch metrics, no launch templates."
    - "<strong>Runs in your own cloud account:</strong> your data, your VPC, your existing cloud setup. AWS today, Google Cloud next. We're just the broker."
    - "<strong>Cheapest match across regions:</strong> the broker compares spot prices across the regions you allow and picks the cheapest instance that fits your hardware requirements"
    - "<strong>Automatic failover:</strong> spot instance reclaimed mid-job? Your cluster notices the dead worker and the remaining nodes pick its jobs back up"
    - "<strong>Verifiable savings:</strong> the dashboard tracks what your spot instances cost against what the same hours would have cost on-demand"
  code: |
    <span style="color:#546e7a">// Configure once: JobRunr boots your Docker image on the</span>
    <span style="color:#546e7a">// cheapest spot instance whenever your job queue backs up</span>
    <span style="color:#c792ea">JobRunr</span>.<span style="color:#82aaff">configure</span>()
        .<span style="color:#82aaff">useStorageProvider</span>(storageProvider)
        .<span style="color:#82aaff">useCostAware</span>(<span style="color:#82aaff">usingStandardCostAwareConfiguration</span>(
                <span style="color:#c792ea">new</span> <span style="color:#c792ea">CostAwareAwsEC2ProviderConfiguration</span>(accessKeyId, secretAccessKey, accountRegion, registryReaderRole),
                <span style="color:#a5d6ad">"url-to-your-docker-image"</span>)
            .<span style="color:#82aaff">andUsingRegions</span>(<span style="color:#c792ea">new</span> <span style="color:#c792ea">String</span>[]{<span style="color:#a5d6ad">"eu-north-1"</span>, <span style="color:#a5d6ad">"eu-west-1"</span>})
            .<span style="color:#82aaff">andSpotInstanceAmount</span>(<span style="color:#f78c6c">1</span>, <span style="color:#f78c6c">5</span>)
            .<span style="color:#82aaff">andScaleUpLatency</span>(<span style="color:#c792ea">Duration</span>.<span style="color:#82aaff">ofMinutes</span>(<span style="color:#f78c6c">1</span>)))
        .<span style="color:#82aaff">initialize</span>();
  caption: "This shows the shape of the configuration API. Final method names may change based on what design partners tell us."

email_section:
  id: "waitlist"
  title: "Be one of the first 25 design partners"
  description: "We're picking a small group of teams to shape the product before the September launch. You'll have direct input on the API, the pricing, and which providers we add next. No commitment, no spam, easy to opt out."
  button_label: "Join the waitlist"
  form_note: "We'll reach out before the private beta opens. No spam, ever."
  success_title: "You're on the list."
  success_message: "We'll be in touch before the private beta opens. In the meantime, the best preparation is making your jobs safe to re-run: spot instances can disappear mid-job, and JobRunr simply runs the job again on another worker."
  package_items:
    - "Early access before the September public release"
    - "Direct input on the API, pricing, and provider roadmap"
    - "Free use of the JobRunr Spot platform for the first 90 days"
    - "1:1 onboarding call with the founding team"

audience_section:
  title: "If any of this sounds like you, the waitlist is the right place"
  description: "JobRunr Spot is for the teams already feeling the cost."
  items:
    - title: "Java teams running heavy batch work"
      description: "PDF generation, ETL, video transcoding, report rendering, image processing. You're paying on-demand and the bill grows every quarter."
    - title: "Teams who tried spot and got burned"
      description: "Sudden shutdowns killed your throughput. You missed an SLA. You quietly moved back to on-demand. We handle the failover so spot actually works."
    - title: "Teams planning to add AI workloads"
      description: "GPU brokering ships right after CPU. Capture the CPU savings now and the GPU savings later, with the same API and the same dashboard. No rewrite when you scale into inference."

social_proof:
  title: "From the team behind JobRunr. Trusted by"
  logos:
    - src: "images/brand-logo/adobe-logo.png"
      alt: "Adobe"
    - src: "images/brand-logo/JP-Morgan-Chase-logo.webp"
      alt: "JP Morgan Chase"
    - src: "images/brand-logo/Thoughtworks-logo.webp"
      alt: "Thoughtworks"
    - src: "images/brand-logo/Capgemini-logo.webp"
      alt: "Capgemini"
    - src: "images/brand-logo/intuit-logo.svg"
      alt: "Intuit"

accordion:
  title: "Questions before you sign up?"
  subtitle: "FAQ"
  description: "What we know so far. Some of this will change based on what design partners tell us."
  list:
    - title: "When does JobRunr Spot launch?"
      description: "The first public release ships in September 2026. The private beta opens earlier for design partners on the waitlist. You'll get access weeks before everyone else."
    - title: "Where does my compute actually run? Does my data leave my cloud?"
      description: "Your jobs run in your own AWS and Google Cloud accounts. You connect them once with a service role, and JobRunr Spot dispatches work into your environment. The data stays in your VPC, your security and compliance posture doesn't change, and you keep your existing cloud relationships and discounts. We're the broker, not the host."
    - title: "Which providers will be supported?"
      description: "AWS and Google Cloud at launch, with full multi-region and multi-AZ spot routing. We picked these two because they cover most of the Java workloads in production today. Azure and the GPU-specialist clouds (CoreWeave, RunPod, Lambda Labs) follow once the broker is stable."
    - title: "Is CPU the only thing supported at launch?"
      description: "Yes, but only because we want to ship something stable. GPU brokering is the very next milestone, on the same API and dashboard. Most Java workloads are CPU-bound (PDF, ETL, reporting, transcoding), so starting there gives the most teams an immediate win."
    - title: "What about the GPU side?"
      description: "Same configuration, same dashboard. You'll specify the GPU and the model you need (A100, H100, L4) in your hardware requirements instead of CPU only; GPU memory is already a configuration option. If your team is already thinking about AI workloads, tell us in the waitlist follow-up and we'll keep you in the loop on GPU access specifically."
    - title: "Will it work with the JobRunr OSS version?"
      description: "Yes. It's configuration, not a rewrite. You point JobRunr Spot at your cloud account and the Docker image of your app, and the spot workers join your existing JobRunr cluster like any other node. You don't change how you define jobs."
    - title: "How will pricing work?"
      description: "You pay AWS and Google Cloud directly for the compute, and the 60 to 80 percent spot saving stays with you. Our own pricing on top of that is still open. A flat platform fee, a small percentage of spot spend, tiered usage: we're not locked into any model yet. That's one of the things we want to figure out together with design partners, so we land on something that actually works for the teams using it."
    - title: "Is this replacing JobRunr Pro?"
      description: "No. JobRunr Pro keeps doing what it does inside your app: priority queues, batches, workflows, multi-cluster dashboard. JobRunr Spot handles what happens outside your app: watching spot prices, booting and retiring instances in your cloud account, and reporting what you actually saved."
    - title: "What if I'm not sure my use case fits?"
      description: "Sign up anyway and tell us in the follow-up email. We'd rather hear about a use case we hadn't thought of than miss a design partner who would have been a great fit."
---
