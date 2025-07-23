---
title: "JobRunr Pro"
summary: "Upgrade to JobRunr Pro for serious workflows, real-time precision, and enterprise reliability. Scale your background jobs without limits."
date: 2025-07-22T22:30:00+02:00
author: "The JobRunr Team"
tags:
  - pro
  - pricing
  - job-scheduler
  - enterprise
feature_image: "/blog/jobrunr-logo-white-pro.webp" 
slug: "pro"
---
<style>
    /* General page styling from webinar-v8.md */
    .pro-page-content {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
    }

    /* Full-width section base from webinar-v8.md */
    .full-width-section {
        margin: 0 -100vw;
        padding: 5rem 100vw;
    }
    .full-width-section h2 {
        text-align: center;
        font-size: 2.5rem;
        margin-bottom: 3rem;
    }

    .post-template .site-main{
      padding-bottom: 0 !important;
    }

    .post-full-content{
      padding-bottom: 0;
    }

    /* Hero Section - Adapted from .webinar-hero */
    .pro-hero {
        padding: 6rem 1.5rem;
        text-align: center;
        /*background: linear-gradient(rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.85)), url('/publication-cover.webp') center/cover no-repeat;*/
        background-color: #090A0B;
        color: #fff;
    }
    .pro-hero img { 
        width: 240px; 
        margin-bottom: 2rem; 
    }
    .pro-hero h1 {
        font-size: 3.2rem;
        font-weight: 800;
        margin: 0 auto 1rem auto;
        max-width: 800px;
        color: #fff;
        line-height: 1.2;
    }
    .pro-hero p {
        font-size: 1.6rem;
        color: #ced4da;
        margin: 0 auto 2.5rem auto;
        max-width: 650px;
    }
    .pro-hero .cta {
        display: inline-block;
        margin: 0.5rem;
        padding: 1rem 2rem;
        font-weight: 600;
        color: #fff;
        background-color: #5CB85B;
        border-radius: 8px;
        text-decoration: none;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        box-shadow: none;
        font-size: 1.1rem;
    }

    .pro-hero .btn {
      font-size: 1.3rem;
    }

     .pro-hero .btn:hover {
        transform: translateY(-3px);
        box-shadow: 0 4px 20px rgba(0,0,0,0.25);
        color: #fff;
    }
    .pro-hero .cta.secondary {
        background-color: #7531B1;
    }
    .pro-hero .cta:hover {
        transform: translateY(-3px);
        box-shadow: 0 4px 20px rgba(0,0,0,0.25);
        color: #fff;
    }

    /* Feature Section - Reusing .learn-section styles directly */

    .why-section{
    font-size: 1.6rem;
    line-height: 2.4rem;
    }

    .why-section .guide-card-title {
      font-size: 1.8rem;
      text-align: left;
    }
    .why-section p {
      padding-top: 5px;
      padding-bottom: 10px;
    }

    .why-section .guide-card {
      gap: 5px;
    }


    .learn-section {
        background-color: #f7f9fa;
        padding-top: 25px;
    }
    
    .post-full-content a {
      box-shadow: none;
    }
    .learn-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 2rem;
        list-style: none;
        padding: 0;
        max-width: 1200px;
        margin: 0 auto;
    }
    .learn-card {
        background: #fff;
        padding: 2rem;
        border-radius: 10px;
        border-top: 4px solid #6f72e5; /* Main accent color */
        box-shadow: 0 4px 15px rgba(0,0,0,0.05);
        transition: all 0.3s ease;
    }
    .learn-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 25px rgba(0,0,0,0.1);
    }
    .learn-card h3 {
        margin-top: 0;
        font-size: 1.25rem;
    }
    .learn-card p {
        color: #666;
        font-size: 1rem;
        line-height: 1.6;
    }
    
    /* Testimonials Section - Reusing .testimonial-section styles directly */
    .testimonial-section {
        padding: 5rem 1rem;
    }
    .testimonial-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
        gap: 2rem;
        max-width: 1200px;
        margin: 0 auto;
    }
    .testimonial-card {
        background: #fff;
        border: 1px solid #eee;
        border-left: 5px solid #754cbf; /* Testimonial accent color */
        padding: 2rem;
        border-radius: 8px;
        position: relative;
    }
    .testimonial-card:before {
        content: '“';
        font-family: Georgia, serif;
        font-size: 5rem;
        color: #754cbf;
        opacity: 0.15;
        position: absolute;
        top: -0.5rem;
        left: 1rem;
    }
    .testimonial-card blockquote {
        margin: 0;
        font-size: 1.6rem;
        line-height: 2rem;
        font-style: italic;
        border-left: 0;
        padding-left: 0;
        padding-top: 15px;
        z-index: 1;
        position: relative;
    }
    .testimonial-card footer {
        font-size: 1.6rem;
        font-weight: bold;
        text-align: right;
        line-height: 2rem;
        padding-top: 10px;
    }
    .testimonial-card footer a {
        font-weight: normal;
        color: #754cbf !important;
        display: block;
        text-decoration: none;
        box-shadow: none;
    }
    .testimonial-card footer a:hover { text-decoration: underline; }

    /* NEW Pricing Section - Styled to match the webinar page's aesthetic */
    .pricing-section {
        background-color: #f7f9fa;
        font-size: 1.6rem;
        line-height: 2rem;
        padding-bottom: 0;
    }

    .pricing-section h3{
      font-size: 2rem;
    }

    div.plan-business a.button, div.plan-business h2{
          background-color: #754cbf;
    }

    div.plan-enterprise a.button, div.plan-enterprise h2 {
      background-color: #7EACDD;
    }
    .pricing-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
        gap: 2rem;
        max-width: 1200px;
        margin: 0 auto;
        align-items: stretch;
    }
    .pricing-card {
        background: #fff;
        padding: 2.5rem;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.05);
        display: flex;
        flex-direction: column;
        border: 1px solid #e9ecef;
    }
    .pricing-card.highlight {
        border-top: 4px solid #7531B1;
    }
    .pricing-card h3 {
        font-size: 1.75rem;
        margin-top: 0;
    }
    .pricing-card .tagline {
        color: #666;
        margin-bottom: 2rem;
        min-height: 40px;
    }
    .pricing-card ul {
        list-style: none;
        padding: 0;
        margin: 0 0 2rem;
        flex-grow: 1;
    }
    .pricing-card ul li {
        position: relative;
        padding-left: 28px;
        margin-bottom: 1rem;
    }
    .pricing-card ul li::before {
        content: '✔';
        position: absolute;
        left: 0;
        color: #5CB85B;
    }
    .pricing-card .details, .pricing-card .price {
        font-size: 0.9rem;
        color: #777;
        margin-bottom: 1rem;
    }
    .pricing-card .price {
        font-size: 1.2rem;
        font-weight: bold;
        color: #333;
    }
    .pricing-card .cta-button {
        display: block;
        width: 100%;
        text-align: center;
        padding: 1rem;
        font-size: 1.1rem;
        font-weight: 600;
        border-radius: 8px;
        text-decoration: none;
        background-color: #000;
        color: #fff;
        margin-top: auto;
        box-shadow: none;
        transition: background-color 0.2s ease;
    }
    .pricing-card .cta-button:hover { background-color: #333; color: #fff; }

    /* Final CTA - Reusing .final-cta styles directly */
    .final-cta {
        text-align: center;
        background-color: #0f172a;
    }
    .final-cta h2 { color: #fff; }
    .final-cta p {
        font-size: 1.2rem;
        color: #adb5bd;
        margin: 0 auto 2rem auto;
        max-width: 650px;
    }
    .final-cta .btn {
        font-size: 1.2rem;
        padding: 1rem 2rem;
        text-decoration: none;
        background-color: white !important;
        color: #black !important;
        box-shadow: none;
        border-radius: 8px;
        font-weight: 600;
        border: none;
        margin-top: 10px;
        display:inline-block;
    }

    /* Simple FAQ section without full-width background */
    .faq-section {
        max-width: 800px;
        margin: 5rem auto;
        padding: 0 1.5rem;
    }
     .faq-section h2 {
        text-align: center;
        font-size: 2.5rem;
        margin-bottom: 3rem;
    }
    .faq-item {
        border-bottom: 1px solid #eee;
        padding: 1.5rem 0;
    }
 
    .faq-item ul{
      margin-top: 10px;
    }

    .faq-item li{
          color: #666;
    line-height: 2rem;
    font-size: 1.6rem;
    }
     .faq-item:first-of-type { border-top: 1px solid #eee; }
    
    .faq-item h3 
    { 
          line-height: 2rem;
    font-size: 1.6rem;s
    }

    .faq-item p { 
    margin: 0;
    color: #666;
    line-height: 2rem;
    font-size: 1.6rem;
      }

    /* Hide default theme elements */
    .post-full-header, .post-full-image { display:none; }

    .post-full-header + img {
      display:none;
    }
</style>
<div class="pro-page-content">
    <header class="pro-hero full-width-section">
      <img src="/blog/jobrunr-logo-white-pro.webp" alt="JobRunr Logo">
      <h1>Scale background jobs without limits</h1>
      <p>Upgrade to JobRunr Pro for serious workflows, real-time precision, and enterprise reliability.</p>
      <div style="display: flex; justify-content: center;">
                            <a href="#pricing" class="btn btn-black btn-purple" style="display: inline-block; margin-right: 1rem;">
                                Compare Pro versions
                            </a>
                        </div>
    </header>
    <section class="learn-section full-width-section">
      <h2>Why Teams Upgrade to Pro</h2>
<div class="guides why-section">
  <a class="guide-card" href="/en/documentation/pro/">
    <header class="guide-card-header">
      <h2 class="guide-card-title">From 100 to Unlimited Jobs</h2>
    </header>
    <section class="guide-card-summary">
      <p>Go beyond OSS limits with unlimited recurring jobs, perfect for growing workloads in scale-ups and enterprises. No need to manually track job caps ever again.</p>
    </section>
    <footer class="guide-card-footer">
      <div class="guide-card-tag">Pro Business</div>
      <div class="guide-card-tag">Pro Enterprise</div>
    </footer>
  </a>

  <a class="guide-card" href="/en/documentation/pro/priority-queues/">
    <header class="guide-card-header">
      <h2 class="guide-card-title">Priority & Dynamic Queues</h2>
    </header>
    <section class="guide-card-summary">
      <p>Handle time-sensitive operations with up to 5 priority queues (unlimited for Pro Enterprise) and dynamic routing. Perfect for critical processes and smarter load distribution.</p>
    </section>
    <footer class="guide-card-footer">
      <div class="guide-card-tag">Pro Business</div>
      <div class="guide-card-tag">Pro Enterprise</div>
    </footer>
  </a>

  <a class="guide-card" href="/en/documentation/pro/job-chaining/">
    <header class="guide-card-header">
      <h2 class="guide-card-title">Advanced Job Workflows</h2>
    </header>
    <section class="guide-card-summary">
      <p>Create complex business logic using job chaining, atomic batches, and smart failure handling. Build resilient systems that scale with your needs.</p>
    </section>
    <footer class="guide-card-footer">
      <div class="guide-card-tag">Pro Business</div>
      <div class="guide-card-tag">Pro Enterprise</div>
    </footer>
  </a>

  <a class="guide-card" href="/en/documentation/pro/observability/">
    <header class="guide-card-header">
      <h2 class="guide-card-title">Observability & Monitoring</h2>
    </header>
    <section class="guide-card-summary">
      <p>Integrates with Prometheus, Grafana, and more. Get actionable insights into job performance, failures, and throughput across your clusters.</p>
    </section>
    <footer class="guide-card-footer">
      <div class="guide-card-tag">Pro Business</div>
      <div class="guide-card-tag">Pro Enterprise</div>
    </footer>
  </a>
  <a class="guide-card" href="/en/documentation/pro/">
    <header class="guide-card-header">
      <h2 class="guide-card-title">Single Sign-On (SSO)</h2>
    </header>
    <section class="guide-card-summary">
      <p>Enable secure access with SSO integration. Perfect for enterprises that want centralized user management and simplified login workflows.</p>
    </section>
    <footer class="guide-card-footer">
      <div class="guide-card-tag">Pro Enterprise</div>
    </footer>
  </a>

  <a class="guide-card" href="/en/documentation/pro/">
    <header class="guide-card-header">
      <h2 class="guide-card-title">GDPR & HIPAA Compliant</h2>
    </header>
    <section class="guide-card-summary">
      <p>JobRunr Pro Enterprise offers secure job processing with GDPR and HIPAA compliance support. Ensure your workflows meet privacy and regulatory standards.</p>
    </section>
    <footer class="guide-card-footer">
      <div class="guide-card-tag">Pro Enterprise</div>
    </footer>
  </a>
</div>
    </section>
    <section class="testimonial-section full-width-section">
      <h2>How others are using JobRunr Pro</h2>
      <div class="testimonial-grid">
        <div class="testimonial-card">
          <blockquote>We slashed infra costs and scaled to 25,000+ leases nightly.</blockquote>
          <footer>Prophia<a href="/use-case/jobrunr-pro-prophia/">Read the full case →</a></footer>
        </div>
        <div class="testimonial-card">
          <blockquote>20% dev productivity boost, and our first-line support now solves 80% of job issues.</blockquote>
          <footer>Tracer.ai<a href="/use-case/jobrunr-pro-web-crawling-and-sentiment-analysis/">Read the full case →</a></footer>
        </div>
        <div class="testimonial-card">
          <blockquote>We use JobRunr to orchestrate key processes in our logistics workflows across Europe.</blockquote>
          <footer>Decathlon<a href="/use-case/jobrunr-pro-decathlon/">Read the full case →</a></footer>
        </div>
      </div>
    </section> 
    <section class="pricing-section full-width-section" id="pricing">
        <h2>Pricing Plans</h2>
        <div class="plan-container">

<div class="plan plan-open" >

## OSS
<div class="no-margin">

_free for everyone,<br>including all companies_
</div>

### Features
JobRunr OSS with:
- Up to [100 recurring jobs]({{< ref "documentation/background-methods/recurring-jobs.md" >}}) (depends on DB)
- [Simple dashboard]({{< ref "documentation/background-methods/dashboard.md" >}})
- [Enqueueing of jobs]({{< ref "documentation/background-methods/enqueueing-jobs.md" >}})
- [Scheduling of jobs]({{< ref "documentation/background-methods/scheduling-jobs.md" >}})
- [Automatic retry handling]({{< ref "documentation/background-methods/dealing-with-exceptions.md" >}})
- [Carbon-aware job scheduling]({{< ref "guides/intro/how-to-reduce-carbon-impact-with-carbon-aware-jobs/" >}})
<br><br><br><br><br>

### Licensing
- [JobRunr under LGPL 3.0]({{< ref "licensing/info.md" >}})
- Commercial use <a class="tooltip" data-title="Did you know that Hibernate is also using LGPL?"><img width="16" height="16" src="/question-mark.svg" style="margin: 0 0 -2px 0; width: 16px"/></a>
<br><br><br>

### Community support
- [Stack Overflow Tag](https://stackoverflow.com/questions/ask?tags=java%20jobrunr)
- [GitHub Discussions](https://github.com/jobrunr/jobrunr/discussions)

<span style="display: block; height: 125px"></span>

<div class="buy">

__free__
_always and forever_
<br>

<a class="button" target="_blank" href="https://search.maven.org/artifact/org.jobrunr/jobrunr">DOWNLOAD</a>
</div>
</div>

<div class="plan plan-business">

## Business
<div class="no-margin">

_streamline your workflows<br>and background jobs_
</div>

### Features
Everything in JobRunr OSS plus:
- Up to [5000 recurring jobs]({{< ref "documentation/background-methods/recurring-jobs.md" >}})
- [Enhanced dashboard]({{< ref "documentation/pro/jobrunr-pro-dashboard.md" >}})
- [Transaction plugin]({{< ref "documentation/pro/transactions.md" >}})
- [Priority queues]({{< ref "documentation/pro/priority-queues.md" >}})
- [Workflow management]({{< ref "documentation/pro/job-chaining.md" >}})
- [Real-time scheduling]({{< ref "documentation/pro/real-time-scheduling.md" >}})   
- [Batches]({{< ref "documentation/pro/batches.md" >}})
- [And much more...]({{< ref "documentation/pro/_index.md" >}})
<br><br>

### Licensing
- [Standard EULA]({{< ref "licensing/standard-eula.md" >}})
- Annual license
- Access to private Maven repository
- Access to source code

### Priority support
- [Email / HelpDesk](mailto:hello@jobrunr.io)
- Technical support
- Priority handling for bugs

### Purchasing
- Credit Card  

<div class="buy">

_one prod cluster,<br/>priority support<br/><br/>_
 <strong style='color: #3eb0ef;text-decoration: none;'>9.000,00 <span class="currency-holder">€</span></strong>
_per PRD cluster / year <a class="tooltip" data-title="A production cluster is one application running JobRunr Pro with multiple background job servers processing jobs."><img width="16" height="16" src="/question-mark.svg" style="margin: 0 0 -2px 0; width: 16px"/></a>_
_or_
 <strong style='color: #3eb0ef;text-decoration: none;font-size:1.25em;'>850,00 <span class="currency-holder">€</span></strong>
_per PRD cluster / month <a class="tooltip" data-title="A production cluster is one application running JobRunr Pro with multiple background job servers processing jobs."><img width="16" height="16" src="/question-mark.svg" style="margin: 0 0 -2px 0; width: 16px"/></a>_
_(excl. VAT)_ 

<a class="button" onclick="gtag('event', 'click_buy_pro', {'event_category': 'ecommerce', 'event_label' : 'plan_platinum' });" href="/en/get-jobrunr-pro-business">GET STARTED</a>


<!-- <a class="button" onclick="gtag('event', 'click_buy_pro', {'event_category': 'ecommerce', 'event_label' : 'plan_business' });" href="/en/get-jobrunr-pro-business">BUY NOW</a> -->

<div class="eco-friendly">

We care about our planet:
_[your subscription includes <br/>400 planted trees / year]({{< ref "about.md#eco-friendly-software" >}})_
</div>
</div>
</div>

<div class="plan plan-enterprise" style="width: 100%">

## Enterprise
<div class="no-margin">

_our most powerful offering<br>with security and much more_
</div>

### Features
Everything in Business plus:
- Enterprise hardened <a class="tooltip" data-title="Enterprise hardened releases are designed for production environments where the least amount of disruption is the goal. Each release goes through a stress test in addition to a full suite of unit/functional/full-system tests. CPU, memory and performance benchmarks are compared to previous releases for regressions. Additionally, extra external security auditing is performed for maximum security."><img width="16" height="16" src="/question-mark.svg" style="margin: 0 0 -2px 0; width: 16px"/></a>
- [Dashboard SSO]({{< ref "documentation/pro/jobrunr-pro-dashboard.md#restrict-access-using-openid-authentication" >}}) <a class="tooltip" data-title="Allow your engineers and developers connect to the dashboard with Single Sign On thanks to our OpenId integration"><img width="16" height="16" src="/question-mark.svg" style="margin: 0 0 -2px 0; width: 16px"/></a>
- [GDPR / HIPAA compliant dashboard]({{< ref "documentation/pro/jobrunr-pro-dashboard.md#gdpr-compliant-dashboard" >}})
- <a href="{{< ref "blog/2023-06-06-jobrunr-pro-panic-button/" >}}">Panic Button (1 / year)</a> <a href="{{< ref "blog/2023-06-06-jobrunr-pro-panic-button/" >}}" class="tooltip" data-title="The panic button allows to notify me instantaneously, Ronald Dehuysser, in case of a production incident."><img width="16" height="16" src="/question-mark.svg" style="margin: 0 0 -2px 0; width: 16px"/></a>
- [Unlimited recurring jobs]({{< ref "documentation/background-methods/recurring-jobs.md" >}})
- Unlimited clusters
- [SBOM](https://www.cisa.gov/sbom) included
<br><br><br>

### Licensing
- [Standard EULA]({{< ref "licensing/standard-eula.md" >}})
- Annual license
- Access to private Maven repository
- Access to source code

### Priority support
- [Email / HelpDesk](mailto:hello@jobrunr.io)
- Technical support
- Escalation support via phone and video call for critical technical issues
- Priority handling for bugs

### Purchasing
- Credit Card 
- Invoice
- Flexible support for custom procurement processes as needed

<div class="buy">

_unlimited clusters,<br/>unlimited installations,<br/>priority feature development_

<a class="button" onclick="gtag('event', 'click_buy_pro', {'event_category': 'ecommerce', 'event_label' : 'plan_platinum' });" href="/en/get-jobrunr-pro-enterprise">CONTACT SALES</a>

<div class="eco-friendly">

We care about our planet:
_[your subscription includes <br/>a lot of planted trees / year]({{< ref "about.md#eco-friendly-software" >}})_
</div>
</div>
</div>

</div>
<section class="faq-section">
  <h2>Common Questions</h2>

  <div class="faq-item">
    <h3>Can I migrate from OSS to Pro easily?</h3>
    <p>Yes, just update your Maven dependency, enter your license, and you’re done.</p>
  </div>

  <div class="faq-item">
    <h3>What frameworks are supported?</h3>
    <p>Spring Boot, Micronaut, and Quarkus via our @Transactional plugin.</p>
  </div>

  <div class="faq-item">
    <h3>Is JobRunr Pro production-ready for regulated environments?</h3>
    <p>Yes, with audit trails, SSO, and compliance with GDPR and HIPAA.</p>
  </div>
  <div class="faq-item">
    <h3>Why upgrade to JobRunr Pro?</h3>
    <p>Tired of building background job infrastructure from scratch? JobRunr Pro helps you skip the heavy lifting so your team can focus on what really matters, shipping features your users love.<br/><br/>
    <p>With powerful tooling like the Pro Dashboard and developer-friendly APIs, you’ll gain deep visibility into your workflows, reduce operational hassle, and ship faster. It’s all about making your engineers happier and your product more reliable, all while saving time and costs.</p>
  </div>

  <div class="faq-item">
    <h3>How to convince your boss?</h3>
    <p>We prepared an email with 5 good reasons to convince your boss to purchase a JobRunr Pro License!
    <br/><br/>
    <a href="/en/convince-your-boss/">Get the email</a></p>
  </div>

  <div class="faq-item">
    <h3>Why get a Pro license?</h3>
    <p>Open Source software is great, so why pay for JobRunr Pro Business or Enterprise? The actual question is: "Is your business building infrastructure or user functionality"? How many days or weeks will it take your team to piece together similar functionality? Paying for good infrastructure means you have more time to focus on user-facing features.<br/> <br/>
    JobRunr Pro comes with well-documented, well-tested features. <br/><br/>You could reproduce some with other libraries, but:</p>
    <ul>
      <li>Will they be supported years from now?</li>
      <li>Will they work with newer versions of Java, Spring Boot or Quarkus?</li>
      <li>Will they get regular updates and security fixes?</li>
      <li>How much time will integration and testing take?</li>
    </ul>
    <p>All Pro and Enterprise features are made to work together. You can either stitch OSS tools yourself or go Pro and be production-ready in minutes.</p>
  </div>

  <div class="faq-item">
    <h3>Preferred reseller?</h3>
    <p>Let us know if you want an introduction to a reseller or prefer working with one of your own.</p>
  </div>

  <div class="faq-item">
    <h3>Startup or Non Profit?</h3>
    <p>Are you a freelancer, startup, or non-profit? Do you want a royalty-free license to redistribute JobRunr as part of your own product? Reach out, we’re happy to find a plan that works for your needs.</p>
  </div>

  <div class="faq-item">
    <h3>Existing customer?</h3>
    <p>Your current pricing stays locked in, our way of saying thanks for your support 🙏</p>
  </div>


</section>
    <section class="final-cta full-width-section">
      <h2>Ready to Build with Confidence?</h2>
      <p>Go from prototype to production with job scheduling that scales as fast as you do.</p>
      <a href="#pricing" class="btn">Request your Quote</a>
    </section>
</div>