---
title: "JobRunr Spot | Run background jobs on spot, save 60 to 80%"
description: "JobRunr Spot runs your background jobs on the cheapest spot instances across AWS and Google Cloud. Save 60 to 80% on your cloud bill. CPU and GPU both supported, starting with CPU. Launching September 2026. Join the private beta waitlist."
layout: "spot"
sitemap:
  priority: 0.1
  changeFreq: never

hero:
  badge: "Launching September 2026 · Private beta"
  title_start: "Background jobs on spot, in your own cloud."
  title_highlight: "60 to 80% off your cloud bill."
  description: "JobRunr Spot finds the cheapest spot instance in your own AWS and Google Cloud accounts, dispatches your job there, and re-runs it if the instance gets killed."

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
    - title: "Preemptions break your jobs"
      description: "You move a batch job to spot. It gets preempted three times. You miss your SLA. You move it back to on-demand. Spot only works if something else handles the failover for you."
    - title: "Your jobs know they can wait. Your infrastructure doesn't."
      description: "A nightly report can wait until 3 AM, when spot is cheapest. A user-facing PDF needs to run now. Neither of those signals lives anywhere your spot manager can read. So you either run everything as if it were urgent, or you build the deadline logic yourself."
    - title: "Even when you find cheaper capacity, you can't use it"
      description: "The cheapest spot right now might be a different region, a different AZ, or a different instance family. Your Terraform pins all three. By the time you redeploy to capture the saving, the price has already moved."

how_it_works:
  id: "how-it-works"
  title: "One method. Same JobRunr API you already use."
  description: "Tell JobRunr Spot when you need the result and what you're willing to pay. We watch spot pricing across AWS and Google Cloud, run your job when it fits, and re-dispatch if the instance gets preempted. The API mirrors the carbon-aware jobs API you may already know from JobRunr Pro."
  filename: "ReportService.java"
  highlights:
    - "<strong>Set a deadline:</strong> we pick the cheapest moment to run inside your window"
    - "<strong>Runs in your own AWS and GCP accounts:</strong> your data, your VPC, your existing cloud setup. We're just the broker."
    - "<strong>CPU and GPU both supported:</strong> starting with CPU in the September release"
    - "<strong>Automatic failover:</strong> spot instance preempted? Re-dispatched on the next cheapest match"
    - "<strong>One outbound WebSocket:</strong> no firewall changes, no webhook setup"
  code: |
    <span style="color:#546e7a">// Run a PDF report sometime in the next 4 hours,</span>
    <span style="color:#546e7a">// on the cheapest spot CPU we can find across AWS and Google Cloud</span>
    <span style="color:#c792ea">BackgroundJob</span>.<span style="color:#82aaff">schedule</span>(
        <span style="color:#c792ea">CostAware</span>.<span style="color:#82aaff">between</span>(now, now.<span style="color:#82aaff">plus</span>(<span style="color:#f78c6c">4</span>, <span style="color:#c792ea">HOURS</span>)).<span style="color:#82aaff">on</span>(<span style="color:#c792ea">CPU</span>),
        () -> reportService.<span style="color:#82aaff">generatePdf</span>(reportId));

    <span style="color:#546e7a">// GPU works the same way:</span>
    <span style="color:#c792ea">BackgroundJob</span>.<span style="color:#82aaff">schedule</span>(
        <span style="color:#c792ea">CostAware</span>.<span style="color:#82aaff">between</span>(now, now.<span style="color:#82aaff">plus</span>(<span style="color:#f78c6c">6</span>, <span style="color:#c792ea">HOURS</span>)).<span style="color:#82aaff">on</span>(<span style="color:#c792ea">GPU</span>, <span style="color:#a5d6ad">"A100"</span>),
        () -> myService.<span style="color:#82aaff">runInference</span>(input));
  caption: "This shows the shape of the API. Final method names may change based on what design partners tell us. Inspired by the carbon-aware jobs API in JobRunr Pro."

email_section:
  id: "waitlist"
  title: "Be one of the first 25 design partners"
  description: "We're picking a small group of teams to shape the product before the September launch. You'll have direct input on the API, the pricing, and which providers we add next. No commitment, no spam, easy to opt out."
  button_label: "Join the waitlist"
  form_note: "We'll reach out before the private beta opens. No spam, ever."
  success_title: "You're on the list."
  success_message: "We'll be in touch before the private beta opens. In the meantime, check out the External Jobs feature in JobRunr v8.5.0. It's the foundation everything here is built on."
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
      description: "Preemptions killed your throughput. You missed an SLA. You quietly moved back to on-demand. We handle the failover so spot actually works."
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
      description: "Same API, same dashboard, same limit-order pricing. You'll pass GPU and the model you need (A100, H100, L4) instead of CPU. If your team is already thinking about AI workloads, tell us in the waitlist follow-up and we'll keep you in the loop on GPU access specifically."
    - title: "Will it work with the JobRunr OSS version?"
      description: "Yes. JobRunr Spot connects to your existing JobRunr or JobRunr Pro instance over a single outbound WebSocket. You don't change how you define jobs. The spot features are opt-in per job."
    - title: "How will pricing work?"
      description: "You pay AWS and Google Cloud directly for the compute, just like today. You keep the full 60 to 80 percent spot saving. JobRunr Spot charges a flat platform fee for the orchestration: webhook relay, multi-provider broker, failover, cost optimization, dashboard. Free tier covers small workloads. Pro and Enterprise tiers add higher limits, dedicated infrastructure, and SLAs. Final numbers come out of the design partner conversations."
    - title: "Is this replacing JobRunr Pro?"
      description: "No. JobRunr Pro keeps doing what it does inside your app: priority queues, batches, workflows, multi-cluster dashboard. JobRunr Spot handles what needs to happen outside your app: the public webhook, the multi-provider broker, the cost optimization."
    - title: "What if I'm not sure my use case fits?"
      description: "Sign up anyway and tell us in the follow-up email. We'd rather hear about a use case we hadn't thought of than miss a design partner who would have been a great fit."
---
