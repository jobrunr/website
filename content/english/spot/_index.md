---
title: "JobRunr Spot | Burst workers for Java job queues at spot prices"
description: "JobRunr Spot boots your app on the cheapest AWS spot instance when your job queue backs up, then gives the machine back. Measured: 62 to 69% below on-demand, zero jobs lost in chaos testing. Private beta open."
keywords: ["spot instances java", "aws spot background jobs", "java autoscaling job queue", "spot instance job processing"]
layout: "spot"
sitemap:
  priority: 0.8
  changeFreq: weekly

hero:
  badge: "Private beta on AWS. First measured results are in."
  title_start: "Burst workers for your job queue,"
  title_highlight: "at spot prices, in your own AWS account."
  description: "When jobs start waiting, JobRunr Spot boots your app on the cheapest spot instance AWS has, drains the backlog, and gives the machine back. Your existing servers keep running like today. In our measured runs, 2.5 hours of backlog was gone in 8 minutes for $0.002."

button:
  primary:
    enable: true
    label: "Join the waitlist"
    link: "#waitlist"
  secondary:
    enable: true
    label: "Read the measured results"
    link: "/en/blog/cost-aware-spot-scaling-first-results/"

proof_section:
  stats:
    - value: "62 to 69%"
      label: "below on-demand, measured on live price pairs for the same instance"
    - value: "0 of 40"
      label: "jobs lost when we killed a spot node mid-run"
    - value: "80 seconds"
      label: "from queue backlog to extra capacity processing jobs"
    - value: "$0.002"
      label: "to drain 2.5 hours of backlog"
  caption: "All numbers from our measured test day: 270 jobs, 4 experiments, one deliberately killed node."
  caption_link_label: "Read the full write-up."
  caption_link: "/en/blog/cost-aware-spot-scaling-first-results/"

how_it_works:
  id: "how-it-works"
  title: "Spot is cheap. Capturing the saving is hard."
  description: "AWS sells spare capacity at up to 90% off, yet almost nobody uses it for background jobs. Configure it once and JobRunr does the hard part, while your existing servers keep running like today."
  filename: "JobRunrConfiguration.java"
  highlights:
    - "<strong>Spot prices move constantly:</strong> the broker tracks them live and picks the cheapest match across your regions. We measured a 9x spread for the same spec."
    - "<strong>Reclaims are a non-event:</strong> we killed a node mid-run, 17 jobs re-queued in 11 seconds, zero lost."
    - "<strong>Your queue is the scaling signal, not CPU:</strong> extra capacity was processing jobs 64 to 80 seconds after the queue backed up."
    - "<strong>No Terraform changes:</strong> no launch templates, no custom metrics. The spot worker is your existing Docker image."
    - "<strong>Runs in your own AWS account:</strong> your data, your VPC. We're the broker, not the host."
    - "<strong>Verifiable savings:</strong> the dashboard tracks your spot cost against the same instance on-demand, live."
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
  screenshot:
    src: "blog/cost-aware-dashboard-servers.png"
    alt: "JobRunr dashboard servers view showing spot instances with an Amount saved column"
    caption: "The dashboard during our test day: every spot node reports its live cost next to what the same hours would have cost on-demand."

chaos_section:
  title: "We killed a live node to prove the failover."
  paragraphs:
    - "During a 40-job burst we terminated the spot instance while it was processing 17 jobs. No drain, no warning. That is harsher than a real reclaim, which gives you two minutes notice. Eleven seconds later, all 17 jobs were back in the queue. The cluster provisioned a replacement and all 40 jobs finished. Zero lost."
    - "There is no magic here, and that is the point. JobRunr runs jobs at least once with automatic retries, whether a worker dies from a spot reclaim, a deploy, or a kernel panic. The one rule that stays yours is that jobs on spot must be safe to re-run."
  link_label: "Read the full chaos test"
  link: "/en/blog/cost-aware-spot-scaling-first-results/#the-part-everyone-worries-about-we-killed-the-node-mid-run"

honest_fit_section:
  title: "When you don't need this"
  description: "Spot is not for every queue, and pretending otherwise would cost us your trust. Four honest reasons to skip the waitlist."
  items:
    - title: "You need sub-minute pickup at all times"
      description: "A spot node takes about a minute to appear. If that minute hurts, keep one spot worker as a permanent floor with <code>andSpotInstanceAmount(1, N)</code>, still at the spot discount, and burst the rest."
    - title: "Your jobs can't be re-run"
      description: "Keep them on your stable servers and set retries to 0. Spot is for retriable work, which is the same discipline Lambda and every retry-based system already asks of you."

calculator_section:
  id: "calculator"
  title: "What would Spot save you?"
  description: "If Spot is not a fit for your queue, the calculator says so."
  footnote: "Price pairs from the 10,448 live spot prices we collected on our test day. The t3.small and t3.2xlarge pairs are measured, the sizes in between are interpolated. Your workload will differ, which is exactly what the beta is for."
  footnote_link_label: "See the measured math"
  footnote_link: "/en/blog/cost-aware-spot-scaling-first-results/"

email_section:
  id: "waitlist"
  title: "Be one of the first 100 design partners"
  description: "We're picking a small group of teams to shape the product before the September launch. You'll run it on your own AWS account, on your own workload, and you get direct input on the API, the pricing, and which providers we add next."
  button_label: "Join the waitlist"
  workload_placeholder: "Optional: what does your queue look like? One sentence is enough."
  form_note: "We'll reach out before the private beta opens. No spam, ever."
  success_title: "You're on the list."
  success_message: "We'll be in touch before the private beta opens. In the meantime, the best preparation is making your jobs safe to re-run: spot instances can disappear mid-job, and JobRunr simply runs the job again on another worker. Know another Java team burning money on AWS? Forward this page. Teams that bring a second team skip the line when we pick the 100 design partners."
  package_items:
    - "Early access before the September public release"
    - "Direct input on the API, pricing, and provider roadmap"
    - "Free use of the JobRunr Spot platform for the first 90 days"
    - "1:1 onboarding call with the founding team"

audience_section:
  title: "If any of this sounds like you, the waitlist is the right place"
  description: "JobRunr Spot is for the teams already feeling the cost."
  items:
    - title: "You already run JobRunr"
      description: "You have the cluster and the jobs. Trying Spot is a config block and a Docker image, not a migration. Your OSS or Pro setup stays exactly as it is."
    - title: "Java teams with bursty batch work on AWS"
      description: "PDF generation, ETL, report rendering, imports, transcoding. You're paying on-demand for capacity you only need in bursts."
    - title: "Teams who tried spot and got burned"
      description: "Sudden shutdowns killed your throughput. You missed an SLA. You quietly moved back to on-demand. We killed a node mid-run to prove the failover. Zero jobs lost."

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
    - title: "Why not just add another cheap VPS as a second worker?"
      description: "For steady near-24/7 load, that's genuinely fine and we say so. The measured math: on AWS there is no break-even, a spot worker attached 24/7 still costs 62% less than the same on-demand instance. Against the cheapest external VPS the crossover is about 18 attached hours per day, and below that spot wins on price while also scaling past one machine, patching itself, and sitting network-close to your job storage. Full math in the [results post](/en/blog/cost-aware-spot-scaling-first-results/)."
    - title: "What happens when AWS reclaims an instance mid-job?"
      description: "A real reclaim gives you two minutes notice. Our chaos test gave none: we terminated a spot node while it was processing 17 jobs, and 11 seconds later all 17 were back in the queue. The cluster provisioned a replacement and all 40 jobs in the burst finished, zero lost. JobRunr runs jobs at least once with automatic retries, whether a worker dies from a reclaim, a deploy, or a kernel panic. [Read the full chaos test](/en/blog/cost-aware-spot-scaling-first-results/#the-part-everyone-worries-about-we-killed-the-node-mid-run)."
    - title: "Which jobs should not run on spot?"
      description: "Jobs that can't be re-run. The one rule that stays yours is that jobs on spot must be safe to re-run. Keep non-retriable work on your stable servers and set retries to 0, and with JobRunr Pro you can pin it there with server tags. Imports, PDF runs, ETL, reports and transcoding are exactly what spot is for."
    - title: "How fast does capacity appear?"
      description: "64 to 80 seconds from queue breach to processing, measured across 6 provisionings. If sub-minute pickup matters, keep a warm floor of one spot worker with `andSpotInstanceAmount(1, N)`, still at the spot discount, and burst the rest."
    - title: "Where does my compute actually run? Does my data leave my cloud?"
      description: "Your jobs run in your own AWS account. You connect it once with a service role, and JobRunr Spot dispatches work into your environment. The data stays in your VPC, your security and compliance posture doesn't change, and you keep your existing cloud relationships and discounts. We're the broker, not the host."
    - title: "Which providers will be supported?"
      description: "AWS today in the private beta. Google Cloud is next, with full multi-region and multi-AZ spot routing on both. We picked these two because they cover most of the Java workloads in production today. Azure and the GPU-specialist clouds (CoreWeave, RunPod, Lambda Labs) follow once the broker is stable."
    - title: "Is CPU the only thing supported at launch?"
      description: "Yes, but only because we want to ship something stable. GPU brokering is the very next milestone, on the same API and dashboard. Most Java workloads are CPU-bound (PDF, ETL, reporting, transcoding), so starting there gives the most teams an immediate win."
    - title: "What about the GPU side?"
      description: "Same configuration, same dashboard. You'll specify the GPU and the model you need (A100, H100, L4) in your hardware requirements instead of CPU only; GPU memory is already a configuration option. If your team is already thinking about AI workloads, tell us in the waitlist follow-up and we'll keep you in the loop on GPU access specifically."
    - title: "Will it work with the JobRunr OSS version?"
      description: "Yes. It's configuration, not a rewrite. You point JobRunr Spot at your cloud account and the Docker image of your app, and the spot workers join your existing JobRunr cluster like any other node. You don't change how you define jobs."
    - title: "How will pricing work?"
      description: "You pay AWS directly for the compute, and the spot saving stays with you: in our measured runs, 62 to 69% below on-demand for the same instance. Our own pricing on top of that is still open. A flat platform fee, a small percentage of spot spend, tiered usage: we're not locked into any model yet. That's one of the things we want to figure out together with design partners, so we land on something that actually works for the teams using it."
    - title: "Is this replacing JobRunr Pro?"
      description: "No. JobRunr Pro keeps doing what it does inside your app: priority queues, batches, workflows, multi-cluster dashboard. JobRunr Spot handles what happens outside your app: watching spot prices, booting and retiring instances in your cloud account, and reporting what you actually saved."
    - title: "What if I'm not sure my use case fits?"
      description: "Sign up anyway and tell us in the follow-up email. We'd rather hear about a use case we hadn't thought of than miss a design partner who would have been a great fit."
---
