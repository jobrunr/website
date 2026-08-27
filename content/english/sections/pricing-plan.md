---
# Pricing
#
# NOTE: the home page renders these cards too, via themes/fortify-hugo/layouts/index.html.
# Any copy or CTA change here changes the home page as well. Review both after editing.
#
# `tip:` on a list item renders a tooltip on the pricing page. It exists because Clarity showed
# visitors clicking these lines expecting them to explain themselves.
basic_plan:
  title: "OSS"
  description: "Free for everyone, including all companies."
  currency: ""
  monthly_price: "Free"
  yearly_price: "Free"
  billed_monthly: "always and forever"
  billed_yearly: "always and forever"
  list:
    - item: "Up to 100 recurring jobs"
      tip: "The practical ceiling depends on your database. Around 100 recurring jobs is where most setups start to feel it."
    - item: "Simple dashboard"
    - item: "Enqueueing & Scheduling of jobs"
    - item: "Automatic retry handling"
    - item: "Carbon aware job scheduling"
    - item: "LGPL 3.0 License"
    - item: "Community support (Stack Overflow, GitHub)"
  button:
    enable: true
    label: "Get started"
    link: "get-started/"
  currency_usd: ""
  monthly_price_usd: "Free"

premium_plan:
  title: "Business"
  description: "Streamline your workflows and background jobs."
  recommended: "Most popular"
  currency: "€"
  monthly_price: "850"
  yearly_price: "9000"
  billed_monthly: "per PRD cluster / month"
  billed_yearly: "per PRD cluster / year"
  billed_monthly_tip: "A production cluster is every application, server or microservice that talks to one JobRunr database in production. Dev, test and staging are free and unlimited."
  billed_yearly_tip: "A production cluster is every application, server or microservice that talks to one JobRunr database in production. Dev, test and staging are free and unlimited."
  list:
    - item: "Everything in JobRunr OSS plus:"
    - item: "Up to 5000 recurring jobs"
      tip: "Five thousand recurring jobs on one cluster, without the database limits you hit on OSS."
    - item: "Enhanced dashboard"
    - item: "Transaction plugin"
    - item: "Priority queues"
    - item: "Workflow management (Batches & Chaining)"
    - item: "Realtime scheduling"
    - item: "Priority Email / HelpDesk support"
  button:
    enable: true
    label: "Start using JobRunr Pro now"
    link: "start-jobrunr-pro/"
    link2: "/en/get-jobrunr-pro-business"
  currency_usd: "$"
  monthly_price_usd: "950"
  yearly_price_usd: "10000"

enterprise_plan:
  title: "Enterprise"
  description: "Built for critical scale. Includes unlimited PRD clusters."
  currency: ""
  monthly_price: "Custom"
  yearly_price: "Custom"
  list:
    - item: "Everything in JobRunr Business plus:"
    - item: "Unlimited recurring jobs"
    - item: "Unlimited clusters & microservices"
    - item: "Multicluster dashboard"
    - item: "Kubernetes autoscaling metrics"
    - item: "1 Panic Button / year"
    - item: "Custom procurement support"
    - item: "Priority feature requests"
  button:
    enable: true
    label: "Talk to a JobRunr expert"
    link: "get-jobrunr-pro-enterprise/"
  currency_usd: ""
  monthly_price_usd: "Custom"
# don't create a separate page
build:
  render: "never"
---
