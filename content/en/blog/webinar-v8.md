---
title: "JobRunr v8 Live-Coding Webinar & AMA"
summary: "Join us for a live-coding session where we'll talk about the new features of JobRunr v8. Learn how to use carbon-aware job scheduling, use workflow orchestration and more to build highly efficient and scalable Java applications."
date: 2025-06-13T12:24:16+02:00
author: "Nicholas D'hondt"
tags:
  - blog
  - meta
  - message-queue
  - job-scheduler
images:
  - "/blog/launch-webinar.webp" 
feature_image: "/blog/launch-webinar.webp" 
slug: "webinar-v8"
---
<style>
    /* General page styling */
    .webinar-page-content {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
    }

    /* Hidden H1 for SEO purposes */
    .seo-h1 {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
    }

    /* Hero Section - UPDATED for full-width background */
    .webinar-hero {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 3rem;
        align-items: start;
        background: linear-gradient(135deg, rgba(40, 220, 222, 0.2) 0%, rgba(111, 114, 229, 0.2) 100%);
        /* Replicate the full-width style from other sections */
        margin: 0 -100vw;
        padding: 4rem 100vw;
    }
    .webinar-hero .hero-text {
        padding-top: 1rem;
    }
    .webinar-hero .hero-form {
        background: #fff; /* UPDATED: Changed to white for better contrast */
        padding: 2.5rem;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.1);
    }
    .webinar-hero h1 {
        font-size: 3.2rem;
        margin-bottom: 1rem;
        line-height: 1.2;
    }
    .webinar-hero p {
        
    }

    /* "What You'll Learn" Section */
    .learn-section {
        background-color: #f7f9fa;
        margin: 0 -100vw;
        padding: 4rem 100vw;
    }
    .learn-section h2 {
        text-align: center;
        font-size: 2.5rem;
        margin-bottom: 3rem;
    }
    .learn-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 2rem;
        list-style: none;
        padding: 0;
    }
    .learn-card {
        background: #fff;
        padding: 2rem;
        border-radius: 10px;
        border-top: 4px solid transparent;
        box-shadow: 0 4px 15px rgba(0,0,0,0.05);
        transition: all 0.3s ease;
    }
    .learn-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 25px rgba(0,0,0,0.1);
        border-top-color: #6f72e5; /* Accent color on hover */
    }
    .learn-card-icon {
        font-size: 2rem;
        margin-bottom: 1rem;
        color: #6f72e5;
    }
    .learn-card h4 {
        margin-top: 0;
        font-size: 16px;
    }
    .learn-card p {
        color: #666;
        font-size: 16px;

    }
    
    /* Host Section */
    .host-section-wrapper {
        padding: 4rem 0;
    }
    .host-section-wrapper h2 {
        text-align: center;
        font-size: 2.5rem;
        margin-bottom: 3rem;
    }
    .host-section {
        display: flex;
        align-items: center;
        gap: 2rem;
        background: #f7f9fa;
        padding: 2rem;
        border-radius: 10px;
    }
    .host-section img {
        border-radius: 50%;
        width: 150px;
        height: 150px;
        object-fit: cover;
    }

    /* Testimonials Section */
    .testimonial-section {
        padding: 4rem 0;
    }
    .testimonial-section h2 {
        text-align: center;
        font-size: 2.5rem;
        margin-bottom: 3rem;
    }
    .testimonial-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
        gap: 2rem;
    }
    .testimonial-card {
        background: #fff;
        border: 1px solid #eee;
        border-left: 5px solid #6f72e5;
        padding: 2rem;
        border-radius: 8px;
        position: relative;
    }
    .testimonial-card:before {
        content: '“';
        font-family: Georgia, serif;
        font-size: 5rem;
        color: #3eb0ef;
        opacity: 0.2;
        position: absolute;
        top: -0.5rem;
        left: 1rem;
    }
    .testimonial-card blockquote {
        margin: 0;
        font-size: 16px;
        font-style: italic;
        border-left: 0;
        padding-left: 0;
        z-index: 1;
        position: relative;
    }
    .testimonial-card footer {
        margin-top: 1.5rem;
        font-size: 16px;
        font-weight: bold;
        text-align: right;
    }
    .testimonial-card footer span {
        font-weight: normal;
        color: #777;
        display: block;
    }

    /* WEBINAR AGENDA SECTION */
    .webinar-agenda-section {
        background-color: #f7f9fa;
        margin: 0 -100vw;
        padding: 4rem 100vw;
    }
    .webinar-agenda-section h2 {
        text-align: center;
        font-size: 2.5rem;
        margin-bottom: 3rem;
    }

    /* FINAL CTA */
    .final-cta {
        text-align: center;
        background-color: #f7f9fa;
        margin: 0 -100vw;
        padding: 4rem 100vw;
    }
    .final-cta .btn {
        font-size: 1.5rem;
        padding: 1rem 2rem;
    }

    /* Getting Started Section */
    .getting-started-section {
        padding: 4rem 0;
        border-top: 1px solid #eee;
    }
    .getting-started-section h2 {
        text-align: center;
        font-size: 2.5rem;
        margin: 0 auto 1rem auto;
        max-width: 650px;
    }
    .getting-started-section > p {
        text-align: center;
        font-size: 1.2rem;
        color: #555;
        margin: 0 auto 3rem auto;
        max-width: 650px;
    }
    .guides-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
        gap: 2rem;
    }
    .guide-link-card {
        display: flex;
        flex-direction: column;
        background: #fff;
        padding: 2rem;
        border: 1px solid #eee;
        border-radius: 10px;
        text-decoration: none;
        color: var(--darkgrey);
        box-shadow: 0 4px 15px rgba(0,0,0,0.05);
        transition: all 0.3s ease;
    }
    .guide-link-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 25px rgba(0,0,0,0.1);
        border-color: #6f72e5;
    }
    .guide-link-icon {
        font-size: 2rem;
        margin-bottom: 1rem;
        color: #6f72e5;
    }
    .guide-link-card h4 {
        margin-top: 0;
        font-size: 16px;
        color: var(--darkgrey);
        padding-bottom: 10px;
    }
    .guide-link-card p {
        flex-grow: 1;
        font-size: 14px;
        color: #666;
        margin-bottom: 0;
        line-height: 16px;
    }
        .getting-started-section .btn {
        background-color: black !important;
        color: white !important;
        margin-top: 15px;
        font-size: 14px;
    }

    /* Responsive adjustments */
    @media (max-width: 900px) {
        .webinar-hero, .learn-section, .webinar-agenda-section, .final-cta {
            /* On mobile, disable the full-width trick and use normal padding */
            margin: 0;
            padding: 2rem 1.5rem;
            border-radius: 0;
        }
        .webinar-hero {
            grid-template-columns: 1fr;
        }
        .hero-text {
            text-align: center;
        }
    }

    .post-full-header{
        display:none;
    }
    
    .post-full-image{
        display:none;
    }

    .hsfc-Form button {
        margin-top: -25px; 
    }

    .post-full-content li:first-child {
        margin-top: 10px;
    }



</style>

<div class="webinar-page-content">
    <div class="webinar-hero">
        <div class="hero-text">
            <h1>Master JobRunr v8: A Live-Coding Webinar</h1>
            <p><strong>Unlock carbon-aware background job scheduling in Java</strong> 
            <br/><br/>Modern Java applications need more than just threads and timers to scale, they need efficient,  and easy to use job scheduling. That’s exactly what JobRunr v8 brings to the table.
<br><br/>Join us for a live coding session with Ronald Dehuysser, creator of JobRunr, as we walk through the newest features in v8. 

</p>
            <p><strong>Date:</strong> Wednesday July 9, 2026<br><br>
            <strong>Timeslot 1:</strong> 12:30 PM CEST / 6:30 AM ET / 4:00 PM IST
            <strong>Timeslot 2:</strong> 6:00 PM CEST / 12:00 PM EDT / 9:00 AM PDT
            </p>
        </div>
        <div class="hero-form" id="hero-form">
            <h3 style="text-align: center; margin-top: 0;">Reserve Your Spot Now!</h3>
            <script charset="utf-8" type="text/javascript" src="//js-eu1.hsforms.net/forms/embed/v2.js"></script>
<script>
  hbspt.forms.create({
    region: "eu1",
    portalId: "145458105",
    formId: "a541ba81-7132-40ca-bb3d-c6280937e030"});
</script>
        </div>
    </div>
    <div class="learn-section">
        <h2>What You'll Learn</h2>
        <ul class="learn-grid">
            <li class="learn-card">
                <div class="learn-card-icon">🌍</div>
                <h4>Carbon-Aware Job Scheduling</h4>
                <p>Schedule jobs when energy is cleanest. It reduces your carbon footprint — without changing your infrastructure.</p>
            </li>
            <li class="learn-card">
                <div class="learn-card-icon">⚙️</div>
                <h4>Advanced Workflow Orchestration</h4>
                <p>Create robust pipelines with job chaining, job batches, and real-time triggers using the new orchestration layer.</p>
            </li>
            <li class="learn-card">
                <div class="learn-card-icon">📊</div>
                <h4>Enhanced Observability & Monitoring</h4>
                <p>See what's happening under the hood. Learn how JobRunr v8 integrates with tools like Prometheus and Grafana.</p>
            </li>
             <li class="learn-card">
                <div class="learn-card-icon">🚀</div>
                <h4>Virtual Threads for High Throughput</h4>
                <p>Harness the power of virtual threads to run I/O-heavy jobs at scale, without the usual thread overhead.</p>
            </li>
            <li class="learn-card">
                <div class="learn-card-icon">❓</div>
                <h4>Live AMA Session</h4>
                <p>Ask Ronald anything. Literally! From deep technical dives to the future roadmap, it’s all on the table.</p>
            </li>
            <li class="learn-card">
                <div class="learn-card-icon">🛠️</div>
                <h4>Migration Best Practices</h4>
                <p>Moving from a previous version or another scheduler? We’ll walk you through the cleanest way to transition.</p>
            </li>
        </ul>
    </div>
    <div class="host-section-wrapper">
        <h2>Meet Your Host</h2>
        <div class="host-section">
            <img src="https://media.licdn.com/dms/image/v2/D4E03AQECs4yAUeGrAw/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1670587266374?e=1756339200&v=beta&t=Zod_BeENAeCi-G8BTHRka1f7xbzU9NIVfK4Xce1zFww" alt="Ronald Dehuysser">
            <div>
                <h3>Ronald Dehuysser</h3>
                <p>With 20+ years of experience building Java systems, Ronald’s on a mission to make background processing fast, scalable, and developer-friendly. He's worked with distributed systems long before they were trendy and now spends his time coding, speaking, and helping teams ship better backend infrastructure.</p>
            </div>
        </div>
    </div>
<div class="webinar-agenda-section">
    <h2>Webinar Agenda</h2>
    <div style="display: flex; flex-wrap: wrap; gap: 3rem; align-items: flex-start;">
        <div style="flex: 1; min-width: 300px;">
            <ul>
                <li><strong>12:30 - 12:40 PM:</strong> Welcome & Introduction to JobRunr v8</li>
                <li><strong>12:40 - 1:15 PM:</strong> Live-Coding Session:
                    <ul>
                        <li>Integrate JobRunr in your project.</li>
                        <li>Setting up Carbon-Aware recurring jobs.</li>
                        <li>Building a complex workflow with job chaining and batches.</li>
                    </ul>
                </li>
                <li><strong>1:15 - 1:30 PM:</strong> Deep Dive into JobRunr Pro Features</li>
                <li><strong>1:30 - 1:45 PM:</strong> Live Q&A / Ask Me Anything (AMA)</li>
            </ul>
        </div>
        <div style="flex: 1; min-width: 200px; text-align: center;">
        <figure style="margin-top:0px">
    {{< img src="/blog/webinar8v.png" style="max-height:400px" >}}
        </figure>
        </div>
    </div>
</div>
    <div class="testimonial-section">
        <h2>Don't Just Take Our Word For It</h2>
        <div class="testimonial-grid">
            <div class="testimonial-card">
                <blockquote>Before JobRunr, we were using Spring Boot crons, and every time a server restarted, any ongoing job would just disappear. It wasn’t reliable, and scaling was expensive.</blockquote>
                <footer>
                    Brent Young
                    <span>Director of Engineering at Prophia</span>
                </footer>
            </div>
            <div class="testimonial-card">
                <blockquote>Notifications like hospital bed availability can’t wait 20 minutes in an emergency. With JobRunr Pro, we deliver those updates in seconds, making a real difference for our clients.</blockquote>
                <footer>
                    Paulius
                    <span>Software Engineer at Juvare</span>
                </footer>
            </div>
        </div>
    </div>
    <div class="final-cta">
        <h2>Ready to Supercharge Your Java Applications?</h2>
        <p>Join thousands of Java developers who are already leveling up their background job processing with JobRunr.</p>
        <a href="#hero-form" class="btn btn-black btn-lg" style="text-decoration: none;">Register for the Webinar</a>
    </div>
    <div class="getting-started-section">
        <h2>Want to get started with v8?</h2>
        <p>Do you want to already take v8 for a (beta)-testride? You can find all the info in our guides</p>
        <div class="guides-grid">
            <a href="https://www.jobrunr.io/en/guides/migration/v8/" class="guide-link-card">
                <span class="guide-link-icon">🛠️</span>
                <h4>v8 Migration Guide</h4>
                <p>Moving from a previous version or another scheduler? <br/>We’ll walk you through the cleanest way to transition.</p>
                <span class="btn" style="text-decoration: none;">Get started with v8 Beta</span>
            </a>
            <a href="https://www.jobrunr.io/en/guides/intro/how-to-reduce-carbon-impact-with-carbon-aware-jobs/" class="guide-link-card">
                <span class="guide-link-icon">🌍</span>
                <h4>Carbon-Aware Scheduling</h4>
                <p>Schedule jobs when energy is cleanest. It’s good for performance, and even better for your carbon footprint.</p>
                <span class="btn" style="text-decoration: none;">Explore carbon-aware scheduling</span>
            </a>
        </div>
    </div>
</div>