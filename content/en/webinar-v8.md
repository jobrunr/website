---
title: "JobRunr v8 Live-Coding Webinar & AMA"
summary: "Join us for an exclusive live-coding session where we'll explore the groundbreaking features of JobRunr v8. Learn how to leverage virtual threads, carbon-aware job scheduling, and more to build highly efficient and scalable Java applications."
skip_meta: true
date: 2024-07-15T10:00:00+02:00
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

    /* Hero Section */
    .webinar-hero {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 3rem;
        align-items: start; /* Align items to the start of the grid area */
        padding: 4rem 0;
    }
    .webinar-hero .hero-text {
        padding-top: 1rem;
    }
    .webinar-hero .hero-form {
        background: #f5f5f5;
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
        border-top-color: #3eb0ef; /* Accent color on hover */
    }
    .learn-card-icon {
        font-size: 2rem;
        margin-bottom: 1rem;
        color: #3eb0ef;
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
        background: #f5f5f5;
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
        border-left: 5px solid #3eb0ef;
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

    /* Other Sections */
    .webinar-section {
        padding: 4rem 0;
    }

    /* WEBINAR AGENDA SECTION - now with background color */
    .webinar-agenda-section {
        background-color: #f7f9fa;
        margin: 0 -100vw;
        padding: 4rem 100vw;
    }

    .webinar-agenda-section h2, .webinar-section h2 {
        text-align: center;
        font-size: 2.5rem;
        margin-bottom: 3rem;
    }
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

    /* Responsive adjustments */
    @media (max-width: 900px) {
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
            <p><strong>Unlock modern background job processing & carbon-aware scheduling in Java</strong> 
            <br/><br/>Modern Java applications need more than just threads and timers to scale, they need efficient, resilient job scheduling. That’s exactly what JobRunr v8 brings to the table.
<br><br/>Join us for a live coding session with Ronald Dehuysser, creator of JobRunr, as we walk through the newest features in v8. 

</p>
            <p><strong>Date:</strong> July 9, 2026<br><strong>Time:</strong> 12:30 PM CEST / 6:30 AM ET / 4:00 PM IST</p>
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
                <p>Schedule jobs when energy is cleanest. It’s good for performance, and even better for your carbon footprint.</p>
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
                        <li>Implementing Virtual Threads for a sample use case.</li>
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
                <blockquote>Notifications like hospital bed availability can’t wait 20 minutes in an emergency. With JobRunr, we deliver those updates in seconds, making a real difference for our clients.</blockquote>
                <footer>
                    Scott
                    <span>Software Engineer at Juvare</span>
                </footer>
            </div>
        </div>
    </div>
    <div class="final-cta">
        <h2>Ready to Supercharge Your Java Applications?</h2>
        <p>Join thousands of Java developers who are already leveling up their background job processing with JobRunr.</p>
        <a href="#" class="btn btn-black btn-lg" style="text-decoration: none;">Register for the Webinar</a>
    </div>
</div>