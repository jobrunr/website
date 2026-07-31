---
title: "JobRunr JUG Fund | Pizza's on us"
description: "JobRunr covers food and drinks for Java User Group meetups. Apply for €150 toward pizza and drinks at your next JUG event, no sales pitch attached."
layout: "jug"

hero:
  badge: "JobRunr JUG Fund"
  title_start: "Pizza's on"
  title_highlight: "JobRunr"
  description: "You run a Java User Group. We build a background job scheduler for Java. Communities like yours are where we came from, so let us cover the food and drinks at your next meetup."

button:
  primary:
    enable: true
    label: "Apply for sponsorship"
    link: "#apply"
  secondary:
    enable: true
    label: "What's the catch?"
    link: "#the-deal"

tiers_section:
  id: "the-deal"
  title: "Two ways to do it"
  description: "Pick the tier that fits your meetup. Both are paid out after the event, straight to the account that paid for the pizza."
  tiers:
    - name: "Pizza sponsor"
      amount: "€150"
      tagline: "Food and drinks for your meetup. Your agenda stays 100% yours."
      items:
        - "€150 toward food and drinks"
        - "We ship a box of stickers and swag for the table"
        - "Our ready-made sponsor slide for your intro deck"
        - "Zero speaking slots for us. Really."
    - name: "Pizza + lightning talk"
      amount: "€250"
      featured: true
      badge: "Most fun"
      tagline: "Everything in the pizza tier, plus a 10-minute lightning talk by one of your own members. Never by us."
      items:
        - "Everything in the pizza tier"
        - "A member tells their own JobRunr production story..."
        - "...or presents our ready-made 10-minute talk in a box"
        - "Speaker gets first pick of the swag box"

return_section:
  title: "What we ask in return"
  description: "Deliberately light. JUGs run on volunteers and goodwill, and the fastest way to ruin that is a sponsor with demands."
  asks:
    - "Our logo with \"food and drinks sponsored by JobRunr\" on your event page"
    - "Our sponsor slide on screen during your intro (20 seconds, we send it ready-made)"
    - "One post from your JUG account on LinkedIn or X, tagging JobRunr, with a photo from the event"
    - "Stickers on the table. That's genuinely it."
  no_asks:
    - "No sales pitch, not from you and not from us"
    - "No JobRunr employees on your stage"
    - "No attendee lists, emails, or lead scanning"
    - "No say in your agenda or speaker lineup"

talk_section:
  title: "The lightning talk, two flavours"
  description: "For the €250 tier, one of <strong>your own members</strong> gives a 10-minute lightning talk. They choose the flavour:"
  flavours:
    - title: "Their story"
      description: "A member who runs JobRunr in production tells it like it is. What they built, what broke, what they'd do differently. War stories beat marketing every time."
    - title: "Talk in a box"
      description: "Our ready-made 10-minute talk: slides, speaker notes, and a runnable demo repo. One run-through and any member can present it. Ends with a live demo of a few thousand jobs draining on the dashboard."
  code_title: "The kind of code the talk shows"
  filename: "MyService.java"
  code: |
    <span style="color:#546e7a">// Enqueue a fire-and-forget background job</span>
    <span style="color:#c792ea">BackgroundJob</span>.<span style="color:#82aaff">enqueue</span>(() -> myService.<span style="color:#82aaff">doWork</span>());

    <span style="color:#546e7a">// Schedule it for later</span>
    <span style="color:#c792ea">BackgroundJob</span>.<span style="color:#82aaff">schedule</span>(<span style="color:#c792ea">Instant</span>.now().plus(
        <span style="color:#c792ea">Duration</span>.<span style="color:#82aaff">ofHours</span>(<span style="color:#f78c6c">5</span>)),
        () -> myService.<span style="color:#82aaff">doWork</span>());

    <span style="color:#546e7a">// Or make it recurring</span>
    <span style="color:#c792ea">BackgroundJob</span>.<span style="color:#82aaff">scheduleRecurrently</span>(<span style="color:#a5d6ad">"my-recurring-job"</span>,
        <span style="color:#c792ea">Cron</span>.<span style="color:#82aaff">daily</span>(),
        () -> myService.<span style="color:#82aaff">generateReport</span>());
  caption: "Runs on the database your attendees already have. No Redis, no brokers, no extra infrastructure."

apply_section:
  id: "apply"
  title: "Apply for your meetup"
  description: "Takes two minutes. We reply within a few days, and payment follows after the event once you send the photo and the post link."
  button_label: "Send application"
  form_note: "We only use this to organize the sponsorship. No newsletters, no follow-up sequences."
  success_title: "Application received! 🍕"
  success_message: "Thanks for organizing for the Java community. We'll get back to you within a few days from nicholas@jobrunr.io."
  package_items:
    - "Paid after the event, IBAN or PayPal"
    - "Sponsor slide and swag box shipped upfront"
    - "Talk in a box materials if you picked that tier"
    - "A real human reply, not an automation"

social_proof:
  title: "The scheduler your members already know from work"
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
  title: "Questions organizers ask"
  subtitle: "FAQ"
  description: "The fine print, without the fine print."
  list:
    - title: "Who can apply?"
      description: "Any established Java User Group or Java-focused meetup with a public event page (Meetup.com, Luma, your own site) and at least one past event. We ask for a minimum of 15 expected attendees, and each JUG can get sponsored twice per calendar year."
    - title: "Do we have to pitch JobRunr at our meetup?"
      description: "No. Nobody has to say anything about JobRunr, and we'd honestly rather you didn't force it. The sponsor slide during your intro and a \"pizza's on JobRunr tonight\" from the host is all the airtime we want. If your members like what they see on the slide, they know how to use a QR code."
    - title: "What exactly is in the talk in a box?"
      description: "A ready-made 10-minute lightning talk called \"Background jobs in Java in 10 minutes\": slides, speaker notes, and a runnable demo repo. It shows real code and ends with a live dashboard demo processing a few thousand jobs. No pricing slides, no product pitch, just code."
    - title: "How does payment work?"
      description: "You apply before the event, we confirm the sponsorship, you order the pizza. After the event you send us a photo and the link to your JUG's social post, and we transfer €150 or €250 to your IBAN or PayPal."
    - title: "Why is JobRunr doing this?"
      description: "JobRunr is an open source project that grew up in the Java community: JUG talks, conference hallways, and developers recommending it to each other. Sponsoring pizza at JUGs is us putting money back into the rooms where that happens. And yes, we hope some of your members get curious about JobRunr. That's the whole trade, and we think it's a fair one."
    - title: "Can JobRunr send a speaker instead?"
      description: "That's deliberately not part of this program. Vendor talks change the vibe of a community meetup, so the lightning talk slot is reserved for your own members. If your JUG separately wants a deep-dive talk about background job architecture some day, reach out and we'll talk, but it's never a condition for the pizza."
---
