---
meta_title: "Start using JobRunr Pro"
title: "Start using JobRunr Pro"
description: "Tell us where to send your JobRunr Pro license and answer five quick questions so we send the right one."

step1:
  heading: "Start using JobRunr Pro"
  lead: "Tell us where to send your license and we will get it ready."
  email_label: "Business email"
  email_hint: "Corporate domains are pre-approved."
  company_label: "Company name"
  submit: "Get my license"
  divider: "or"
  github_label: "Continue with GitHub"

step2:
  heading: "Our team is preparing your JobRunr Pro license."
  lead: "To make sure we send the right one, five quick questions."
  submit: "Send answers"
  skip: "I would rather answer these by email"
  questions:
    - name: "usage_type"
      type: "radio"
      label: "Do you plan to integrate JobRunr into software you develop, or will you be reselling JobRunr's services to other end clients?"
      options:
        - value: "integrate"
          label: "We integrate JobRunr into software we develop"
        - value: "resell"
          label: "We resell JobRunr's services to end clients"
    - name: "jvm_stack"
      type: "select"
      label: "What is the JVM language and framework that you will be using?"
      # Two selects, one numbered question, so the count still matches "five quick questions".
      fields:
        - name: "jvm_language"
          label: "Language"
          options:
            - value: "Java"
            - value: "Kotlin"
            - value: "Scala"
            - value: "Groovy"
            - value: "Other"
        - name: "framework"
          label: "Framework"
          options:
            - value: "Spring Boot"
            - value: "Quarkus"
            - value: "Micronaut"
            - value: "Plain Java"
            - value: "Other"
    - name: "pro_features"
      type: "checkbox"
      label: "Which features of JobRunr Pro are most relevant to your project?"
      other_field: "pro_features_other"
      other_placeholder: "Something else? Tell us here"
      options:
        - value: "Multi-tenant support (dynamic queues)"
        - value: "Advanced dashboard"
        - value: "Rate limiting"
        - value: "Batches and workflows"
        - value: "Priority queues"
        - value: "SSO and compliance"
        - value: "Other"
    - name: "used_before"
      type: "radio"
      label: "Have you used JobRunr before?"
      extra_field: "heard_from"
      extra_label: "Where did you hear about JobRunr?"
      options:
        - value: "yes"
          label: "Yes"
        - value: "no"
          label: "No"
    - name: "project_count"
      type: "select"
      label: "In how many projects will you be using JobRunr Pro?"
      options:
        - value: "1"
        - value: "2 to 5"
        - value: "6 to 10"
        - value: "More than 10"

step3:
  heading: "Thanks, this looks really good."
  body: "Our team is preparing your license and you can expect it in your inbox very soon. While you wait, see JobRunr Pro at work."
  cta_label: "Take the guided tour"
  cta_link: "https://finance.demo.jobrunr.io/tour"
  trust_label: "Read our security and compliance documentation"
---
