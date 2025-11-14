---
title: "Introducing Carbon-Aware Jobs in JobRunr"
description: "A Leap Towards Sustainable Computing"
image: /blog/2024-03-21-carbon-aware-job-scheduling.png
date: 2024-03-21T09:00:00+02:00
author: "Donata Petkevičiūtė"
tags:
  - blog
  - meta
---
{{< trial-button >}}

<div style="text-align: center;margin: -2em 0 2em;">
<small style="font-size: 70%;"><a href='https://www.freepik.com/vectors/cartoon-astronaut'>Cartoon astronaut vector created by catalyststuff - www.freepik.com</a></small>
</div>

<style type="text/css">
    .post-full-content img {display: inline-block; margin: 0 auto}
</style>


We are excited to share a new development at JobRunr: together with our partner [MindWave](https://www.mindwave.com/), we’re integrating carbon-aware job scheduling capabilities into our platform. This innovative feature, set to be added in JobRunr v8, marks a significant step forward in [our mission](/en/blog/2024-01-18-trees-planted/) to merge cutting-edge technology with environmental stewardship. With the introduction of carbon-aware jobs, JobRunr is pioneering a solution that optimizes job execution for ecological impact, specifically by leveraging periods of high renewable energy availability to minimize carbon footprint. This feature will be available in JobRunr OSS and JobRunr Pro.

As JobRunr is using Java, a robust and versatile programming language, utilized across all types of businesses, from governments to banks to public transport, it resulted in a widespread adoption of the distributed background job scheduler. Since JobRunr is now processing millions of jobs per day in diverse operational industries we can ensure that carbon-aware job scheduling will have a broad impact and result in a greener future.

## The Future of Job Scheduling
Carbon-aware jobs aim to revolutionize how tasks are scheduled by making the timing of executions dependent on the availability of renewable energy sources, such as solar and wind power. This means that jobs can be scheduled to run when the energy grid is greenest, minimizing reliance on fossil fuels and thereby reducing carbon emissions. Initially, this feature will be available exclusively for EU-based data centers using the public data provided by [ENTSO-E](https://www.entsoe.eu/), with plans to expand and incorporate electricity consumption data from major cloud providers like Azure, AWS, and GCP in later phases.

## Simple API, Big Impact
We've designed the API for creating and scheduling these jobs to be incredibly straightforward, ensuring that this powerful feature doesn't come at the cost of developer productivity. For example, scheduling an inventory update to run daily before 7 AM, but only when the carbon intensity is lowest, is as simple as:

```java
JobId jobId = BackgroundJob.scheduleRecurrently(CarbonAware.before(Cron.daily(7)), () -> inventoryService.updateInventory());
```

This ease of use means that integrating carbon-aware scheduling into your operations can be achieved with minimal effort, yet the benefits are substantial.

## Why It Matters
For businesses, the adoption of carbon-aware jobs offers numerous advantages beyond the significant environmental impact. By aligning job execution with times of low carbon intensity, companies can enjoy:
- **Reduced Carbon Footprint**: Directly contribute to a reduction in greenhouse gas emissions by leveraging renewable energy for computing tasks.
- **Cost Efficiency**: Potentially lower energy costs by operating when renewable energy is abundant and cheaper.
- **Enhanced Corporate Social Responsibility (CSR)**: Demonstrating a commitment to sustainability can bolster your brand's image and appeal to environmentally conscious consumers and partners.
- **Regulatory Compliance**: Stay ahead in regions where legislation around carbon emissions and sustainability is becoming increasingly strict.

## Real-World Applications
The potential applications for carbon-aware jobs are vast and varied. Here are just a few examples of how different sectors can benefit:
- **E-Commerce**: Schedule inventory updates or price adjustments to occur when environmental impact is minimized.
- **Banking**: Process bank statements and financial reconciliations at optimal times, ensuring operational efficiency while reducing carbon emissions.
- **Data Analytics**: Run large-scale data processing jobs, such as ETL tasks, analytics, and machine learning model training, during low carbon intensity periods for greener operations.
- **Content Delivery Networks (CDNs)**: Update or purge cached content in a carbon-efficient manner, balancing performance with environmental responsibility.

## Commitment to Climate and Innovation
Our commitment to innovation extends beyond mere functionality; it is a pledge to contribute positively to the climate. By aligning job scheduling with environmental sustainability, we offer businesses a powerful tool to reduce their carbon emissions significantly.

## Become a Part of the Journey Towards Sustainable Computing
As we embark on this development journey, we invite businesses and developers to prepare for a shift towards more sustainable computing practices. This initiative is not just about enhancing the functionality of JobRunr; it's about taking a significant step towards a future where digital operations contribute positively to our climate.

Stay tuned for more updates as we progress towards the launch of carbon-aware jobs in JobRunr, and join us in making a meaningful impact on the planet, one job at a time.

We want to thank our partner MindWave for providing us with a developer, free of charge, who is helping us with the implementation of this feature.

Best,<br>
Friends of developers<br>
The JobRunr Team together with MindWave