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
images:
  - "/blog/jobrunr-pro-og-image.png" 
feature_image: "/blog/jobrunr-pro-og-image.png" 
slug: "pro"
menu: 
  main: 
    identifier: pricing
    weight: 3
aliases:
  - ./pricing
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
@media (min-width: 501px) and (max-width: 700px) {
  .full-width-section {
    margin: 0 -10vw;
    padding: 5rem 10vw;
  }
}

@media (max-width: 500px) {
  .full-width-section {
    margin: 0 -5vw;
    padding: 5rem 5vw;
  }
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
    .why-section .guide-card {
  border: 1px solid #e9ecef;
  border-bottom: none;
  border-radius: 12px;
  background: #fff;
  position: relative;
  overflow: hidden;
}


   /* For all guide cards */
.why-section .guide-card {
  position: relative;
  transition: box-shadow 0.25s;
  overflow: hidden;
}

/* Hide footer in collapsed state for hidden cards */
.hidden-feature .card-footer-hidden {
  max-height: 0;
  opacity: 0;
  transition: max-height 0.5s, opacity 0.4s;
  overflow: hidden;
  pointer-events: none;
}

/* When expanded: show footer smoothly */
.hidden-feature.show-feature .card-footer-hidden {
  max-height: 200px;
  opacity: 1;
  transition: max-height 0.5s, opacity 0.4s 0.2s;
  pointer-events: all;
}

/* Hide the hidden-feature cards completely until expanded */
.hidden-feature:not(.show-feature) {
  display: none;
}
.hidden-feature {
  opacity: 0;
  height: 0;
  margin: 0;
  padding: 0;
  pointer-events: none;
  overflow: hidden;
  transition: all 0.4s ease;
}
.hidden-feature.show-feature {
  opacity: 1;
  height: auto;
  margin: 1rem 0;
  padding: 2rem;
  pointer-events: auto;
  overflow: visible;
}
/* Fade summary effect */
.fade-summary {
  position: relative;
  /* Hide overflow for fade effect */
  overflow: hidden;
  /* Animate height & opacity */
  max-height: 4.7em; /* Enough for 2 lines + fade */
  opacity: 1;
  transition: max-height 0.5s cubic-bezier(0.55, 0, 0.1, 1), opacity 0.5s;
  will-change: max-height, opacity;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  text-overflow: ellipsis;
}

/* Only clamp and fade if not expanded */
.hidden-feature .fade-summary {
  opacity: 1;
  max-height: 4.7em; /* about 2 lines */
  -webkit-line-clamp: 2;
  transition: max-height 0.5s cubic-bezier(0.55, 0, 0.1, 1), opacity 0.5s;
}

/* Add the fade overlay gradient */
.hidden-feature .fade-summary::after {
  content: "";
  pointer-events: none;
  display: block;
  position: absolute;
  left: -1px;
  right: -1px;
  bottom: -20px;
  height: 5.5em;
  background: linear-gradient(
    to bottom,
    rgba(255,255,255,0) 25%,
    #f7f9fa 90%
  );
  border-radius: 0 0 13px 13px;
  transition: opacity 0.4s;
  opacity: 1;
  z-index: 3;
}

/* Expanded: show all text and remove fade */
.hidden-feature.show-feature .fade-summary {
  max-height: 200px; /* big enough for most summaries */
  opacity: 1;
  -webkit-line-clamp: unset;
  display: block;
  transition: max-height 0.7s cubic-bezier(0.7,0,0.3,1), opacity 0.5s;
}
.hidden-feature.show-feature .fade-summary::after {
  opacity: 0;
  transition: opacity 0.3s;
}

/* Make card "expand" transition smoother */
.hidden-feature {
  transition: box-shadow 0.4s, background 0.2s;
}

/* Make the button a little animated */
#see-more-pro-features {
 background: #744cbf !important;
    border-color: #090a0b !important;
    color: #fff !important;
    font-weight: 700;
  border: none;
  border-radius: 4px;
  margin-top: 16px;
  transition: background 0.18s;
}
#see-more-pro-features:hover {
  background: #5CB85B;
  color: #fff;
}
.hidden-feature .fade-summary::after {
  content: "";
  pointer-events: none;
  display: block;
  position: absolute;
  left: 0;
  right: 0;
  bottom: -12px;  /* Let the gradient extend past the card bottom */
  height: 3.5em;   /* Start fade higher: increase the height */
  /* Fade from transparent to full card bg color (over border) */
  background: linear-gradient(
    to bottom,
    rgba(255,255,255,0) 30%,
    rgba(247,249,250,0.98) 80%,
    rgba(247,249,250,1) 100%
  );
  border-radius: 0 0 12px 12px;  /* Match card's border-radius, so it overlays */
  transition: opacity 0.4s;
  opacity: 1;
  z-index: 2;
}

/* For dark mode or other card backgrounds, adjust the color in rgba accordingly */

.hidden-feature.show-feature .fade-summary::after {
  opacity: 0;
  transition: opacity 0.3s;
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
    div.plan{
      background-color:white;
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
        background-color: #090a0b;
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
     /*.faq-item:first-of-type { border-top: 1px solid #eee; }*/
     .faq-item:last-of-type { border-bottom:none; }
    
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
    .btn-purple{
      background: #744cbf !important;
      color: #fff !important;
      font-weight: 700;
      border: none;
      border-radius: 4px;
    }
</style>
<div class="pro-page-content">
    <header class="pro-hero full-width-section">
      <img src="/blog/jobrunr-logo-white-pro.webp" alt="JobRunr Logo">
      <h1>Turn a Critical Task Into a Competitive Advantage.</h1>
      <p>With JobRunr Pro's proven scalability and enterprise features, you can free your team from maintaining <br/>fragile, in-house job schedulers and focus on what truly matters.</p>
      <div style="display: flex; justify-content: center;">
                            <a href="/en/try-jobrunr-pro/" class="btn btn-black btn-purple" style="display: inline-block; margin-right: 1rem;">
                              Try JobRunr Pro for free
                            </a>
      </div>
      <div style="justify-content: center; padding-top: 5px; font-size: 15px;">
                                <i>No credit card required</i>
                            </div>
    </header>
   <section class="learn-section full-width-section">
  <h2>Why Teams Upgrade to Pro</h2>
  <div class="guides why-section" id="why-pro-features">
    <!-- Top 4 cards, always expanded -->
    <a class="guide-card" href="/en/documentation/pro/">
      <header class="guide-card-header">
        <h2 class="guide-card-title">Unlock Unlimited Scale</h2>
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
        <h2 class="guide-card-title">Ensure Critical Tasks Never Wait</h2>
      </header>
      <section class="guide-card-summary">
        <p>Handle time-sensitive operations with up to 5 priority queues and implement load balancing or multi-tenant apps with dynamic queues. Perfect for critical processes and smarter load distribution.</p>
      </section>
      <footer class="guide-card-footer">
        <div class="guide-card-tag">Pro Business</div>
        <div class="guide-card-tag">Pro Enterprise</div>
      </footer>
    </a>
    <a class="guide-card" href="/en/documentation/pro/job-chaining/">
      <header class="guide-card-header">
        <h2 class="guide-card-title">Automate Complex Business Logic </h2>
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
        <h2 class="guide-card-title">Gain Complete Oversight & Control</h2>
      </header>
      <section class="guide-card-summary">
        <p>Integrates with Prometheus, Grafana, and more. Get actionable insights into job performance, failures, and throughput across your clusters.</p>
      </section>
      <footer class="guide-card-footer">
        <div class="guide-card-tag">Pro Business</div>
        <div class="guide-card-tag">Pro Enterprise</div>
      </footer>
    </a>
    <!-- Last 2 cards, only show preview + fade unless expanded -->
    <a class="guide-card hidden-feature" href="/en/documentation/pro/jobrunr-pro-dashboard/#restrict-access-using-single-sign-on-authentication">
      <header class="guide-card-header">
        <h2 class="guide-card-title">Streamline Security and Access</h2>
      </header>
      <section class="guide-card-summary fade-summary">
        <p>Enable secure access with SSO integration. Perfect for enterprises that want centralized user management and simplified login workflows.</p>
      </section>
      <footer class="guide-card-footer card-footer-hidden">
        <div class="guide-card-tag">Pro Enterprise</div>
      </footer>
    </a>
    <a class="guide-card hidden-feature" href="/en/documentation/pro/">
      <header class="guide-card-header">
        <h2 class="guide-card-title">Secure Your Compliance and Your Data</h2>
      </header>
      <section class="guide-card-summary fade-summary">
        <p>JobRunr Pro Enterprise offers secure job processing with GDPR and HIPAA compliance support. Ensure your workflows meet privacy and regulatory standards.</p>
      </section>
      <footer class="guide-card-footer card-footer-hidden">
        <div class="guide-card-tag">Pro Enterprise</div>
      </footer>
    </a>
    <a class="guide-card hidden-feature" href="/en/documentation/pro/jobrunr-pro-dashboard/#multi-cluster-dashboard">
  <header class="guide-card-header">
    <h2 class="guide-card-title">Manage All Clusters from One Dashboard</h2>
  </header>
  <section class="guide-card-summary">
    <p>Get real-time visibility across all clusters in one single view. Whether you’re running jobs in the EU, US, or beyond, you’ll monitor everything from one central dashboard.</p>
  </section>
  <footer class="guide-card-footer card-footer-hidden">
    <div class="guide-card-tag">Pro Business</div>
    <div class="guide-card-tag">Pro Enterprise</div>
  </footer>
</a>

<a class="guide-card hidden-feature" href="/en/documentation/pro/rate-limiters/">
  <header class="guide-card-header">
    <h2 class="guide-card-title">Protect External Services from Overload</h2>
  </header>
  <section class="guide-card-summary">
    <p>Prevent costly downtime and service fees by putting a cap on how many times your background jobs access external APIs. Maintain a predictable, stable environment for your most critical workflows without risking service interruptions.</p>
  </section>
  <footer class="guide-card-footer card-footer-hidden">
    <div class="guide-card-tag">Pro Business</div>
    <div class="guide-card-tag">Pro Enterprise</div>
  </footer>
</a>
  </div>
  <div style="text-align:center; margin-top: 2rem;">
    <button id="see-more-pro-features" class="btn btn-purple" style="padding:0.7rem 2rem;font-size:1.2rem;">Discover more features</button>
  </div>
</section>
    <section class="testimonial-section full-width-section">
      <h2>How others are using JobRunr Pro</h2>
      <div class="testimonial-grid">
        <div class="testimonial-card">
          <blockquote>We slashed infra costs and scaled to 25,000+ leases nightly.</blockquote>
          <footer>Prophia<a href="/en/use-case/jobrunr-pro-prophia/">Read the full case →</a></footer>
        </div>
        <div class="testimonial-card">
          <blockquote>20% dev productivity boost, and our first-line support now solves 80% of job issues.</blockquote>
          <footer>Tracer.ai<a href="/en/use-case/jobrunr-pro-web-crawling-and-sentiment-analysis/">Read the full case →</a></footer>
        </div>
        <div class="testimonial-card">
          <blockquote>We use JobRunr to orchestrate key processes in our logistics workflows across Europe.</blockquote>
          <footer>Decathlon<a href="/en/use-case/jobrunr-pro-decathlon/">Read the full case →</a></footer>
        </div>
      </div>
    </section> 
    <section class= "full-width-section" style="background-color: #090A0B; padding: 3rem 1.5rem; text-align: center;">
      <h3 style="color: #fff; font-size: 2rem; margin-bottom: 1rem;">Ready to make the business case for JobRunr Pro?</h3>
      <p style="color: #adb5bd; font-size: 1.2rem; margin: 0 auto 1.5rem auto; max-width: 800px;">We've created a simple guide to help you get approval, complete with a detailed cost analysis and a customizable email template.</p>
      <a href="/en/convince-your-boss/" class="btn btn-black btn-purple" style="padding:0.7rem 2rem;font-size:1.2rem;">Convince your manager</a>
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

<span style="display: block; height: 175px"></span>

<div class="buy">

__free__
_always and forever_
<br>

<a class="button" target="_blank" href="https://search.maven.org/artifact/org.jobrunr/jobrunr">DOWNLOAD</a>
<br/><br/>
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
 <strong style='color: black;text-decoration: none;font-size:1.25em;'>850 <span class="currency-holder">Euro</span></strong>
_per PRD cluster / month <a class="tooltip" data-title="A production cluster is one application running JobRunr Pro with multiple background job servers processing jobs."><img width="16" height="16" src="/question-mark.svg" style="margin: 0 0 -2px 0; width: 16px"/></a>_
_(excl. VAT)_ 
_or_
 <strong style='color: black;text-decoration: none; font-size:1.25em;'>9.000,00 <span class="currency-holder">Euro</span></strong>
_per PRD cluster / year <a class="tooltip" data-title="A production cluster is one application running JobRunr Pro with multiple background job servers processing jobs."><img width="16" height="16" src="/question-mark.svg" style="margin: 0 0 -2px 0; width: 16px"/></a>_


<a class="button" href="/en/try-jobrunr-pro/">START A FREE TRIAL</a>
<br/><a href="/en/get-jobrunr-pro-business"><span style="text-decoration: underline;">Get JobRunr Pro Business</span> </a>

<!-- <a class="button" onclick="gtag('event', 'click_buy_pro', {'event_category': 'ecommerce', 'event_label' : 'plan_business' });" href="/en/get-jobrunr-pro-business">BUY NOW</a> -->
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
- [Multi-Cluster Dashboard](/en/documentation/pro/jobrunr-pro-multi-dashboard/)
- <a href="{{< ref "blog/2023-06-06-jobrunr-pro-panic-button/" >}}">Panic Button (1 / year)</a> <a href="{{< ref "blog/2023-06-06-jobrunr-pro-panic-button/" >}}" class="tooltip" data-title="The panic button allows to notify me instantaneously, Ronald Dehuysser, in case of a production incident."><img width="16" height="16" src="/question-mark.svg" style="margin: 0 0 -2px 0; width: 16px"/></a>
- [Unlimited recurring jobs]({{< ref "documentation/background-methods/recurring-jobs.md" >}})
- Unlimited clusters
- [SBOM](https://www.cisa.gov/sbom) included
<br><br>

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
<span style="display: block; height: 15px"></span>

<div class="buy">

_unlimited clusters,<br/>unlimited installations,<br/>priority feature development_
<br/>
<a class="button" onclick="gtag('event', 'click_buy_pro', {'event_category': 'ecommerce', 'event_label' : 'plan_platinum' });" href="/en/get-jobrunr-pro-enterprise">CONTACT SALES</a>
<br /><br/>

</div>
</div>

</div>
</section>
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
    <a href="/en/convince-your-boss/" style="text-decoration: underline;">Get the email</a></p>
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
      <a href="/en/try-jobrunr-pro/" class="btn">START YOUR FREE TRIAL</a>
    </section>
</div>
<div style="display: none;">

![](/blog/jobrunr-logo-white-pro.webp "logo")


</div>
<script>
document.getElementById('see-more-pro-features').addEventListener('click', function () {
  const isExpanded = this.getAttribute('aria-expanded') === 'true';
  const hiddenCards = document.querySelectorAll('.hidden-feature');
  hiddenCards.forEach(card => {
    card.classList.toggle('show-feature', !isExpanded);
  });
  this.setAttribute('aria-expanded', !isExpanded);
  this.textContent = !isExpanded ? 'Show less' : 'Discover more features';
});
</script>
<script type="text/javascript">
    // Function to update the pricing in the Business plan section
    function updatePricingToUSD() {
        // Find the specific pricing container for the Business plan
        const businessPlanDiv = document.querySelector('.plan-business .buy');
        if (businessPlanDiv) {
            // Find all elements with class 'currency-holder' and replace the content with '$'
            const currencyHolders = businessPlanDiv.querySelectorAll('.currency-holder');
            for (let i = 0; i < currencyHolders.length; i++) {
                currencyHolders[i].innerHTML = "dollars";
            }
            // Update the monthly price text
            let monthlyPriceStrong = businessPlanDiv.querySelector('strong:nth-of-type(1)');
            if (monthlyPriceStrong) {
                // Change '850' to '999'
                monthlyPriceStrong.innerHTML = monthlyPriceStrong.innerHTML.replace('850', '999');
            }
            // Update the yearly price text
            let yearlyPriceStrong = businessPlanDiv.querySelector('strong:nth-of-type(2)');
            if (yearlyPriceStrong) {
                // Change '9.000,00' to '10.500,00' and replace the comma with a dot for US formatting
                yearlyPriceStrong.innerHTML = yearlyPriceStrong.innerHTML
                    .replace('9.000,00', '10.500')
                    .replace(',', '.');
            }
        }
    }
    // Fetch the currency from the IP geolocation API
    fetch('https://ipapi.co/currency/')
        .then(resp => {
            // Check if the response is successful (HTTP 200)
            if (!resp.ok) {
                console.error('Failed to fetch currency from geolocation API.');
                return ''; // Return empty string to prevent update
            }
            return resp.text();
        })
        .then(data => {
            // Check if the returned currency is USD
            if (data && data.trim() === 'USD') {
                //console.log('Currency detected as USD. Updating pricing to $.');
                updatePricingToUSD();
            } else {
                //console.log('Currency is not USD (detected: ' + data + '). Keeping standard pricing.');
            }
        })
        .catch(error => {
            console.error('An error occurred during location check:', error);
            // Default pricing (Euro) will be shown if the API fails
        });
</script>