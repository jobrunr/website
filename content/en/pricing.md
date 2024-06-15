---
title: "JobRunr Pro"
translationKey: "jobrunr-pro"
summary: "Save months of development time with [JobRunr Pro](/en/documentation/pro/ 'If you would develop the features of the Pro edition yourself, it would have an estimated cost of around 119.400 $\n(190 days of development at a rate of 600$). ') so you can handle the most difficult background job workflow challenges."
skip_meta: true
date: 2020-08-27T11:12:23+02:00
menu: 
  main: 
    identifier: pricing
    weight: 3
---

<script type="text/javascript">
    fetch('https://ipapi.co/currency/')
        .then(resp => resp.text())
        .then(data => {
            if(data === 'EUR') {
                const currencyHolders = document.getElementsByClassName('currency-holder');
                for (let i = 0; i < currencyHolders.length; i++) {
                    currencyHolders[i].innerHTML = "€";
                }
            }
        });
</script>

Deliver exceptional experiences to your customers thanks to advanced [JobRunr Pro Dashboard]({{< ref "jobrunr-pro-dashboard.md" >}}) that gives instant insights into your business processes. Empower your engineers using [developer]({{< ref "priority-queues.md" >}})-[friendly]({{< ref "batches.md" >}}) [API's]({{< ref "job-chaining.md" >}}) resulting in [cost reductions](https://www.omnicalculator.com/finance/build-or-buy?c=USD&v=overhead:25!perc,employees:1.5,gross:5500!mos,annual_cost:7950!yrs,hours:1!yrs,days_maint:2!mos) and faster time to market.

<div style="text-align: center; margin: -2rem 0 3rem 0;">
    {{< trial-button >}}
    <a href="/en/contact/" class="btn btn-black btn-lg" style="display: inline-block; margin: 2rem 0 0 0rem; height: 45px;">
        <span>Contact us!</span>
    </a>
</div>

<div class="plan-container">

<div class="plan plan-open">

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
<br><br><br><br><br>

### Licensing
- [JobRunr under LGPL 3.0]({{< ref "licensing/info.md" >}})
- Commercial use <a class="tooltip" data-title="Did you know that Hibernate is also using LGPL?"><img width="16" height="16" src="/question-mark.svg" style="margin: 0 0 -2px 0; width: 16px"/></a>
<br><br><br>

### Community support
- [Stack Overflow Tag](https://stackoverflow.com/questions/ask?tags=java%20jobrunr)
- GitHub Discussions

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
- Credit Card / PayPal 
- Invoice

<div class="buy">

<strong style='color: #3eb0ef;text-decoration: none;'>14.950,00 <span class="currency-holder">$</span></strong>
_per PRD cluster / year <a class="tooltip" data-title="A production cluster is one application running JobRunr Pro with multiple background job servers processing jobs."><img width="16" height="16" src="/question-mark.svg" style="margin: 0 0 -2px 0; width: 16px"/></a><br/>(excl. VAT)_

<a class="button" onclick="gtag('event', 'click_buy_pro', {'event_category': 'ecommerce', 'event_label' : 'plan_business' });" href="/en/get-jobrunr-pro">BUY NOW</a>

<div class="eco-friendly">

We care about our planet:
_[your subscription includes <br/>250 planted trees / year]({{< ref "about.md#eco-friendly-software" >}})_
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
<br><br><br><br>

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
- Credit Card / PayPal 
- Invoice

<div class="buy">

_unlimited clusters,<br/>unlimited installations,<br/>priority feature development_

<a class="button" onclick="gtag('event', 'click_buy_pro', {'event_category': 'ecommerce', 'event_label' : 'plan_platinum' });" href="/en/get-jobrunr-pro">CONTACT SALES</a>

<div class="eco-friendly">

We care about our planet:
_[your subscription includes <br/>a lot of planted trees / year]({{< ref "about.md#eco-friendly-software" >}})_
</div>
</div>
</div>

</div>

<br>

<h3>Why get a Pro license?</h3>

Open Source software is great, why should you pay money for JobRunr Pro Business or Enterprise license when you can build it yourself? Well, the actual question is: "is your business building infrastructure or *user functionality*"? How many days or weeks will it take your team to piece together similar functionality? How long will they spend fixing bugs in production? Paying money for good infrastructure means you have more time to focus on user-facing features. To find out whether it's worth building something like JobRunr yourself, take a look at this [build-vs-buy calculator](https://www.omnicalculator.com/finance/build-or-buy?c=USD&v=overhead:25!perc,employees:1.5,gross:5500!mos,annual_cost:7950!yrs,hours:1!yrs,days_maint:2!mos).

JobRunr Pro has lots of **really valuable, well-documented, well-tested** features. You can reproduce some of this functionality with 3rd party open source libraries but:

- Will they be supported years from now?
- Will they work with newer versions of Java, Spring Boot or Quarkus?
- Will they get a steady stream of updates to fix bugs? What about security fixes?
- How many days or weeks will it take you to integrate everything together and test it?

All of the JobRunr Pro and Enterprise functionality is designed to integrate and work well together. You can spend days or weeks integrating various OSS gems or you can take a Pro license for more features and be up & running in minutes.



<h3>Our preferred reseller</h3>
<a href="https://www.softwareone.com/en" target="_blank" rel="noreferrer" style="box-shadow: none; margin-right: auto;"><img width="200px" src="https://sc102-prod-cd.azurewebsites.net/-/media/images/logos/softwareone-logo-blk.svg?iar=0&hash=6A277FF39328B4D79A071F4A9F95F301"/></a>
<small style="margin-right: auto;"><a href="mailto:hello@jobrunr.io" target="_blank" rel="noreferrer">Let us know</a> if you need to get a contact from any of the above resellers, or if you want to work with a different reseller.</small>
<br/><br/>

<h3>Startup or Non Profit?</h3>

Do you want a [Royalty-Free license]({{< ref "licensing/royalty-free-eula.md" >}}) where you may redistribute JobRunr as part of your own products? Are you a freelancer, a startup or a non-profit organization with limited budgets? [Contact us]({{< ref "contact" >}}) and let's see what we can work out.

**Important note for our valued existing customers**: Your current pricing will remain unchanged and locked in as a token of our appreciation for your loyalty and support 🙏. Rest assured, you will continue to enjoy the same great service at the original price you signed up for.