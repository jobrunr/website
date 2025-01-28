---
title: "Why is Idempotence Important in Java Job Scheduling?"
summary: "Understanding the critical role of idempotence in ensuring reliable and fault-tolerant background job scheduling in modern distributed systems."
images:
- /blog/FeaturedImage-Idempotence.webp
feature_image: /blog/FeaturedImage-Idempotence.webp
date: 2025-01-17T16:00:00+02:00
author: "Nicholas D'hondt"
tags:
  - blog
  - job scheduling
  - idempotence
---
<div style="text-align: center;margin: -2em 0 2em;">
<small style="font-size: 70%;">Image based on <a href='https://www.freepik.com/vectors/cartoon-astronaut'>cartoon astronaut vector created by catalyststuff - www.freepik.com</a></small>
</div>

In modern Java web and enterprise applications, background jobs have become an integral part of the system architecture. These jobs handle tasks that are time-intensive or unnecessary to execute in real-time, such as generating reports, processing large data sets, sending scheduled emails, or cleaning up old records. The advantage of background jobs is that they allow the main application to provide quick feedback to users while deferring heavier operations.

However, background jobs are not immune to failures. Distributed systems often encounter issues like network failures, server crashes, or transient database errors. In these situations, job schedulers like JobRunr aim to ensure reliability by retrying failed jobs. While retries are crucial, they can lead to unintended side effects if the jobs are not designed properly. This is where **idempotence** plays a critical role.

---

## What is Idempotence?

In mathematics, an operation is idempotent if applying it multiple times has the same effect as applying it once. For example, in programming, the absolute value function (`abs`) is idempotent because applying it repeatedly yields the same result:

```
abs(abs(abs(-10))) == abs(-10) // Result is always 10
```

Idempotence in background jobs means that executing a job multiple times will not alter the system's state beyond the initial execution. This property ensures consistency and prevents unintended consequences when jobs are retried or executed more than once.

## Why is Idempotence Important in Job Scheduling?

In any sufficiently complex system, failures and retries are inevitable. Here are some scenarios that highlight the importance of idempotence:

1. **Retrying Failed Jobs**: Suppose a job to process an order fails due to a temporary database outage. The scheduler retries the job, but without idempotence, the system might duplicate the order.
2. **Duplicate Executions**: Jobs might accidentally be executed more than once due to human errors, bugs, or unexpected system behaviors. Non-idempotent jobs could lead to issues like overbilling customers or sending duplicate notifications.
3. **Interacting with Unreliable Systems**: When jobs interact with external APIs or systems, they might fail mid-execution, leaving the system in an inconsistent state. With idempotence, you can confidently retry jobs without worrying about compounding the error.

Without idempotence, retries or duplicate executions could result in errors, duplicate data, or inconsistent states. By designing idempotent jobs, you make your system resilient and easier to maintain.


### Example of Non-Idempotent Behavior

Imagine a job that processes a payment:
<figure style="width: 100%;">

```java
public void processOrder(Long userId, Long orderId) {
    // Charge the customer
    User user = userService.getUser(userId);
    Order order = orderService.getOrder(orderId);
    
    // if emailService throws exception, the job will be retried and we will charge the user twice!
    paymentService.charge(orderId, order.getTotalAmount()); 
    emailService.send(user.getEmail(), renderOrder(orderId));
}
```

</figure>


If this job runs multiple times, the customer might be charged multiple times for the same order, leading to serious issues. Now let’s explore how to make such jobs idempotent.


## Re-entrancy: A Companion to Idempotence

While idempotence ensures that a job produces the same result no matter how many times it is executed, re-entrancy ensures that the job can safely resume or restart after an interruption. Re-entrant jobs can handle retries, crashes, or system restarts without causing data corruption or inconsistency. Together, idempotence and re-entrancy form the foundation for reliable and fault-tolerant background jobs, as they address both correctness and resilience in the face of failures.

---

## Best Practices for Idempotent and Re-entrant Jobs in JobRunr

### 1. Avoid Catching Throwable or Suppressing Exceptions

JobRunr relies on exceptions to identify failed jobs and reschedule them. Catching and suppressing exceptions prevents JobRunr from detecting errors.

### Example:

<br/>

**Avoid:**
<figure style="width: 100%;">

```java
public void processOrder(Long userId, Long orderId) {
    try {
        User user = userService.getUser(userId);
        Order order = orderService.getOrder(orderId);
        externalPaymentApi.charge(orderId, order.getTotalAmount());
        emailService.send(user.getEmail(), renderOrder(orderId));
    } catch(Exception e) {
        e.printStackTrace();
    }
}
```

</figure>

**Prefer:**

<figure style="width: 100%;">

```java
public void processOrder(Long userId, Long orderId) throws Exception { 
    // see the Exception in the signature
    User user = userService.getUser(userId);
    Order order = orderService.getOrder(orderId);
    externalPaymentApi.charge(orderId, order.getTotalAmount());
    emailService.send(user.getEmail(), renderOrder(orderId));
}
```

</figure>

If a job fails and an exception is thrown, then the exception is logged via your logging framework and on top of that, the exception and stacktrace will be visible in the JobRunr dashboard.

### 2. Make Methods Re-entrant

Re-entrancy means a method can safely resume or retry execution after being interrupted by errors or system restarts. Without re-entrancy, retries may lead to inconsistent states or duplicate actions.


### Example:

<br/>

**Avoid:**

<figure style="width: 100%;">

```java
public void processOrder(Long userId, Long orderId) {
    // Charge the customer
    User user = userService.getUser(userId);
    Order order = orderService.getOrder(orderId);
    externalStripeApi.charge(orderId, order.getTotalAmount());
    emailService.send(user.getEmail(), renderOrder(orderId));
}
```

</figure>

**Prefer:**

<figure style="width: 100%;">

```java
public void processOrder(Long userId, Long orderId) {
    // Charge the customer
    User user = userService.getUser(userId);
    Order order = orderService.getOrder(orderId);
    
    if (externalStripeApi.hasNotChargedFor(orderId)) {
        externalStripeApi.charge(orderId, order.getTotalAmount());
    }
    // not necessary as if we get here, the only that can still go wrong but will be retried is sending the email
    emailService.send(user.getEmail(), renderOrder(orderId));
}
```

</figure>

<!--<img src="/blog/idempotence-diagram.svg">-->

<svg aria-roledescription="sequence" role="graphics-document document" viewBox="-50 -10 881 364" style="max-width: 100%;" xmlns="http://www.w3.org/2000/svg" width="100%" id="graph-div" height="100%" xmlns:xlink="http://www.w3.org/1999/xlink"><g><rect class="actor actor-bottom" ry="3" rx="3" name="EmailService" height="65" width="150" stroke="#666" fill="#eaeaea" y="278" x="631"></rect><text style="text-anchor: middle; font-size: 16px; font-weight: 400;" class="actor actor-box" alignment-baseline="central" dominant-baseline="central" y="310.5" x="706"><tspan dy="0" x="706">EmailService</tspan></text></g><g><rect class="actor actor-bottom" ry="3" rx="3" name="StockService" height="65" width="150" stroke="#666" fill="#eaeaea" y="278" x="431"></rect><text style="text-anchor: middle; font-size: 16px; font-weight: 400;" class="actor actor-box" alignment-baseline="central" dominant-baseline="central" y="310.5" x="506"><tspan dy="0" x="506">StockService</tspan></text></g><g><rect class="actor actor-bottom" ry="3" rx="3" name="PaymentApi" height="65" width="150" stroke="#666" fill="#eaeaea" y="278" x="231"></rect><text style="text-anchor: middle; font-size: 16px; font-weight: 400;" class="actor actor-box" alignment-baseline="central" dominant-baseline="central" y="310.5" x="306"><tspan dy="0" x="306">PaymentApi</tspan></text></g><g><rect class="actor actor-bottom" ry="3" rx="3" name="JobRunr" height="65" width="150" stroke="#666" fill="#eaeaea" y="278" x="0"></rect><text style="text-anchor: middle; font-size: 16px; font-weight: 400;" class="actor actor-box" alignment-baseline="central" dominant-baseline="central" y="310.5" x="75"><tspan dy="0" x="75">JobRunr</tspan></text></g><g><line name="EmailService" stroke="#999" stroke-width="0.5px" class="actor-line 200" y2="278" x2="706" y1="65" x1="706" id="actor19"></line><g id="root-19"><rect class="actor actor-top" ry="3" rx="3" name="EmailService" height="65" width="150" stroke="#666" fill="#eaeaea" y="0" x="631"></rect><text style="text-anchor: middle; font-size: 16px; font-weight: 400;" class="actor actor-box" alignment-baseline="central" dominant-baseline="central" y="32.5" x="706"><tspan dy="0" x="706">EmailService</tspan></text></g></g><g><line name="StockService" stroke="#999" stroke-width="0.5px" class="actor-line 200" y2="278" x2="506" y1="65" x1="506" id="actor18"></line><g id="root-18"><rect class="actor actor-top" ry="3" rx="3" name="StockService" height="65" width="150" stroke="#666" fill="#eaeaea" y="0" x="431"></rect><text style="text-anchor: middle; font-size: 16px; font-weight: 400;" class="actor actor-box" alignment-baseline="central" dominant-baseline="central" y="32.5" x="506"><tspan dy="0" x="506">StockService</tspan></text></g></g><g><line name="PaymentApi" stroke="#999" stroke-width="0.5px" class="actor-line 200" y2="278" x2="306" y1="65" x1="306" id="actor17"></line><g id="root-17"><rect class="actor actor-top" ry="3" rx="3" name="PaymentApi" height="65" width="150" stroke="#666" fill="#eaeaea" y="0" x="231"></rect><text style="text-anchor: middle; font-size: 16px; font-weight: 400;" class="actor actor-box" alignment-baseline="central" dominant-baseline="central" y="32.5" x="306"><tspan dy="0" x="306">PaymentApi</tspan></text></g></g><g><line name="JobRunr" stroke="#999" stroke-width="0.5px" class="actor-line 200" y2="278" x2="75" y1="65" x1="75" id="actor16"></line><g id="root-16"><rect class="actor actor-top" ry="3" rx="3" name="JobRunr" height="65" width="150" stroke="#666" fill="#eaeaea" y="0" x="0"></rect><text style="text-anchor: middle; font-size: 16px; font-weight: 400;" class="actor actor-box" alignment-baseline="central" dominant-baseline="central" y="32.5" x="75"><tspan dy="0" x="75">JobRunr</tspan></text></g></g><style>#graph-div{font-family:"trebuchet ms",verdana,arial,sans-serif;font-size:16px;fill:#ccc;}#graph-div .error-icon{fill:#a44141;}#graph-div .error-text{fill:#ddd;stroke:#ddd;}#graph-div .edge-thickness-normal{stroke-width:1px;}#graph-div .edge-thickness-thick{stroke-width:3.5px;}#graph-div .edge-pattern-solid{stroke-dasharray:0;}#graph-div .edge-thickness-invisible{stroke-width:0;fill:none;}#graph-div .edge-pattern-dashed{stroke-dasharray:3;}#graph-div .edge-pattern-dotted{stroke-dasharray:2;}#graph-div .marker{fill:lightgrey;stroke:lightgrey;}#graph-div .marker.cross{stroke:lightgrey;}#graph-div svg{font-family:"trebuchet ms",verdana,arial,sans-serif;font-size:16px;}#graph-div p{margin:0;}#graph-div .actor{stroke:#ccc;fill:#1f2020;}#graph-div text.actor&gt;tspan{fill:lightgrey;stroke:none;}#graph-div .actor-line{stroke:#ccc;}#graph-div .messageLine0{stroke-width:1.5;stroke-dasharray:none;stroke:lightgrey;}#graph-div .messageLine1{stroke-width:1.5;stroke-dasharray:2,2;stroke:lightgrey;}#graph-div #arrowhead path{fill:lightgrey;stroke:lightgrey;}#graph-div .sequenceNumber{fill:black;}#graph-div #sequencenumber{fill:lightgrey;}#graph-div #crosshead path{fill:lightgrey;stroke:lightgrey;}#graph-div .messageText{fill:lightgrey;stroke:none;}#graph-div .labelBox{stroke:#ccc;fill:#1f2020;}#graph-div .labelText,#graph-div .labelText&gt;tspan{fill:lightgrey;stroke:none;}#graph-div .loopText,#graph-div .loopText&gt;tspan{fill:lightgrey;stroke:none;}#graph-div .loopLine{stroke-width:2px;stroke-dasharray:2,2;stroke:#ccc;fill:#ccc;}#graph-div .note{stroke:hsl(180, 0%, 18.3529411765%);fill:hsl(180, 1.5873015873%, 28.3529411765%);}#graph-div .noteText,#graph-div .noteText&gt;tspan{fill:rgb(183.8476190475, 181.5523809523, 181.5523809523);stroke:none;}#graph-div .activation0{fill:hsl(180, 1.5873015873%, 28.3529411765%);stroke:#ccc;}#graph-div .activation1{fill:hsl(180, 1.5873015873%, 28.3529411765%);stroke:#ccc;}#graph-div .activation2{fill:hsl(180, 1.5873015873%, 28.3529411765%);stroke:#ccc;}#graph-div .actorPopupMenu{position:absolute;}#graph-div .actorPopupMenuPanel{position:absolute;fill:#1f2020;box-shadow:0px 8px 16px 0px rgba(0,0,0,0.2);filter:drop-shadow(3px 5px 2px rgb(0 0 0 / 0.4));}#graph-div .actor-man line{stroke:#ccc;fill:#1f2020;}#graph-div .actor-man circle,#graph-div line{stroke:#ccc;fill:#1f2020;stroke-width:2px;}#graph-div :root{--mermaid-font-family:"trebuchet ms",verdana,arial,sans-serif;}</style><g></g><defs><symbol height="24" width="24" id="computer"><path d="M2 2v13h20v-13h-20zm18 11h-16v-9h16v9zm-10.228 6l.466-1h3.524l.467 1h-4.457zm14.228 3h-24l2-6h2.104l-1.33 4h18.45l-1.297-4h2.073l2 6zm-5-10h-14v-7h14v7z" transform="scale(.5)"></path></symbol></defs><defs><symbol clip-rule="evenodd" fill-rule="evenodd" id="database"><path d="M12.258.001l.256.004.255.005.253.008.251.01.249.012.247.015.246.016.242.019.241.02.239.023.236.024.233.027.231.028.229.031.225.032.223.034.22.036.217.038.214.04.211.041.208.043.205.045.201.046.198.048.194.05.191.051.187.053.183.054.18.056.175.057.172.059.168.06.163.061.16.063.155.064.15.066.074.033.073.033.071.034.07.034.069.035.068.035.067.035.066.035.064.036.064.036.062.036.06.036.06.037.058.037.058.037.055.038.055.038.053.038.052.038.051.039.05.039.048.039.047.039.045.04.044.04.043.04.041.04.04.041.039.041.037.041.036.041.034.041.033.042.032.042.03.042.029.042.027.042.026.043.024.043.023.043.021.043.02.043.018.044.017.043.015.044.013.044.012.044.011.045.009.044.007.045.006.045.004.045.002.045.001.045v17l-.001.045-.002.045-.004.045-.006.045-.007.045-.009.044-.011.045-.012.044-.013.044-.015.044-.017.043-.018.044-.02.043-.021.043-.023.043-.024.043-.026.043-.027.042-.029.042-.03.042-.032.042-.033.042-.034.041-.036.041-.037.041-.039.041-.04.041-.041.04-.043.04-.044.04-.045.04-.047.039-.048.039-.05.039-.051.039-.052.038-.053.038-.055.038-.055.038-.058.037-.058.037-.06.037-.06.036-.062.036-.064.036-.064.036-.066.035-.067.035-.068.035-.069.035-.07.034-.071.034-.073.033-.074.033-.15.066-.155.064-.16.063-.163.061-.168.06-.172.059-.175.057-.18.056-.183.054-.187.053-.191.051-.194.05-.198.048-.201.046-.205.045-.208.043-.211.041-.214.04-.217.038-.22.036-.223.034-.225.032-.229.031-.231.028-.233.027-.236.024-.239.023-.241.02-.242.019-.246.016-.247.015-.249.012-.251.01-.253.008-.255.005-.256.004-.258.001-.258-.001-.256-.004-.255-.005-.253-.008-.251-.01-.249-.012-.247-.015-.245-.016-.243-.019-.241-.02-.238-.023-.236-.024-.234-.027-.231-.028-.228-.031-.226-.032-.223-.034-.22-.036-.217-.038-.214-.04-.211-.041-.208-.043-.204-.045-.201-.046-.198-.048-.195-.05-.19-.051-.187-.053-.184-.054-.179-.056-.176-.057-.172-.059-.167-.06-.164-.061-.159-.063-.155-.064-.151-.066-.074-.033-.072-.033-.072-.034-.07-.034-.069-.035-.068-.035-.067-.035-.066-.035-.064-.036-.063-.036-.062-.036-.061-.036-.06-.037-.058-.037-.057-.037-.056-.038-.055-.038-.053-.038-.052-.038-.051-.039-.049-.039-.049-.039-.046-.039-.046-.04-.044-.04-.043-.04-.041-.04-.04-.041-.039-.041-.037-.041-.036-.041-.034-.041-.033-.042-.032-.042-.03-.042-.029-.042-.027-.042-.026-.043-.024-.043-.023-.043-.021-.043-.02-.043-.018-.044-.017-.043-.015-.044-.013-.044-.012-.044-.011-.045-.009-.044-.007-.045-.006-.045-.004-.045-.002-.045-.001-.045v-17l.001-.045.002-.045.004-.045.006-.045.007-.045.009-.044.011-.045.012-.044.013-.044.015-.044.017-.043.018-.044.02-.043.021-.043.023-.043.024-.043.026-.043.027-.042.029-.042.03-.042.032-.042.033-.042.034-.041.036-.041.037-.041.039-.041.04-.041.041-.04.043-.04.044-.04.046-.04.046-.039.049-.039.049-.039.051-.039.052-.038.053-.038.055-.038.056-.038.057-.037.058-.037.06-.037.061-.036.062-.036.063-.036.064-.036.066-.035.067-.035.068-.035.069-.035.07-.034.072-.034.072-.033.074-.033.151-.066.155-.064.159-.063.164-.061.167-.06.172-.059.176-.057.179-.056.184-.054.187-.053.19-.051.195-.05.198-.048.201-.046.204-.045.208-.043.211-.041.214-.04.217-.038.22-.036.223-.034.226-.032.228-.031.231-.028.234-.027.236-.024.238-.023.241-.02.243-.019.245-.016.247-.015.249-.012.251-.01.253-.008.255-.005.256-.004.258-.001.258.001zm-9.258 20.499v.01l.001.021.003.021.004.022.005.021.006.022.007.022.009.023.01.022.011.023.012.023.013.023.015.023.016.024.017.023.018.024.019.024.021.024.022.025.023.024.024.025.052.049.056.05.061.051.066.051.07.051.075.051.079.052.084.052.088.052.092.052.097.052.102.051.105.052.11.052.114.051.119.051.123.051.127.05.131.05.135.05.139.048.144.049.147.047.152.047.155.047.16.045.163.045.167.043.171.043.176.041.178.041.183.039.187.039.19.037.194.035.197.035.202.033.204.031.209.03.212.029.216.027.219.025.222.024.226.021.23.02.233.018.236.016.24.015.243.012.246.01.249.008.253.005.256.004.259.001.26-.001.257-.004.254-.005.25-.008.247-.011.244-.012.241-.014.237-.016.233-.018.231-.021.226-.021.224-.024.22-.026.216-.027.212-.028.21-.031.205-.031.202-.034.198-.034.194-.036.191-.037.187-.039.183-.04.179-.04.175-.042.172-.043.168-.044.163-.045.16-.046.155-.046.152-.047.148-.048.143-.049.139-.049.136-.05.131-.05.126-.05.123-.051.118-.052.114-.051.11-.052.106-.052.101-.052.096-.052.092-.052.088-.053.083-.051.079-.052.074-.052.07-.051.065-.051.06-.051.056-.05.051-.05.023-.024.023-.025.021-.024.02-.024.019-.024.018-.024.017-.024.015-.023.014-.024.013-.023.012-.023.01-.023.01-.022.008-.022.006-.022.006-.022.004-.022.004-.021.001-.021.001-.021v-4.127l-.077.055-.08.053-.083.054-.085.053-.087.052-.09.052-.093.051-.095.05-.097.05-.1.049-.102.049-.105.048-.106.047-.109.047-.111.046-.114.045-.115.045-.118.044-.12.043-.122.042-.124.042-.126.041-.128.04-.13.04-.132.038-.134.038-.135.037-.138.037-.139.035-.142.035-.143.034-.144.033-.147.032-.148.031-.15.03-.151.03-.153.029-.154.027-.156.027-.158.026-.159.025-.161.024-.162.023-.163.022-.165.021-.166.02-.167.019-.169.018-.169.017-.171.016-.173.015-.173.014-.175.013-.175.012-.177.011-.178.01-.179.008-.179.008-.181.006-.182.005-.182.004-.184.003-.184.002h-.37l-.184-.002-.184-.003-.182-.004-.182-.005-.181-.006-.179-.008-.179-.008-.178-.01-.176-.011-.176-.012-.175-.013-.173-.014-.172-.015-.171-.016-.17-.017-.169-.018-.167-.019-.166-.02-.165-.021-.163-.022-.162-.023-.161-.024-.159-.025-.157-.026-.156-.027-.155-.027-.153-.029-.151-.03-.15-.03-.148-.031-.146-.032-.145-.033-.143-.034-.141-.035-.14-.035-.137-.037-.136-.037-.134-.038-.132-.038-.13-.04-.128-.04-.126-.041-.124-.042-.122-.042-.12-.044-.117-.043-.116-.045-.113-.045-.112-.046-.109-.047-.106-.047-.105-.048-.102-.049-.1-.049-.097-.05-.095-.05-.093-.052-.09-.051-.087-.052-.085-.053-.083-.054-.08-.054-.077-.054v4.127zm0-5.654v.011l.001.021.003.021.004.021.005.022.006.022.007.022.009.022.01.022.011.023.012.023.013.023.015.024.016.023.017.024.018.024.019.024.021.024.022.024.023.025.024.024.052.05.056.05.061.05.066.051.07.051.075.052.079.051.084.052.088.052.092.052.097.052.102.052.105.052.11.051.114.051.119.052.123.05.127.051.131.05.135.049.139.049.144.048.147.048.152.047.155.046.16.045.163.045.167.044.171.042.176.042.178.04.183.04.187.038.19.037.194.036.197.034.202.033.204.032.209.03.212.028.216.027.219.025.222.024.226.022.23.02.233.018.236.016.24.014.243.012.246.01.249.008.253.006.256.003.259.001.26-.001.257-.003.254-.006.25-.008.247-.01.244-.012.241-.015.237-.016.233-.018.231-.02.226-.022.224-.024.22-.025.216-.027.212-.029.21-.03.205-.032.202-.033.198-.035.194-.036.191-.037.187-.039.183-.039.179-.041.175-.042.172-.043.168-.044.163-.045.16-.045.155-.047.152-.047.148-.048.143-.048.139-.05.136-.049.131-.05.126-.051.123-.051.118-.051.114-.052.11-.052.106-.052.101-.052.096-.052.092-.052.088-.052.083-.052.079-.052.074-.051.07-.052.065-.051.06-.05.056-.051.051-.049.023-.025.023-.024.021-.025.02-.024.019-.024.018-.024.017-.024.015-.023.014-.023.013-.024.012-.022.01-.023.01-.023.008-.022.006-.022.006-.022.004-.021.004-.022.001-.021.001-.021v-4.139l-.077.054-.08.054-.083.054-.085.052-.087.053-.09.051-.093.051-.095.051-.097.05-.1.049-.102.049-.105.048-.106.047-.109.047-.111.046-.114.045-.115.044-.118.044-.12.044-.122.042-.124.042-.126.041-.128.04-.13.039-.132.039-.134.038-.135.037-.138.036-.139.036-.142.035-.143.033-.144.033-.147.033-.148.031-.15.03-.151.03-.153.028-.154.028-.156.027-.158.026-.159.025-.161.024-.162.023-.163.022-.165.021-.166.02-.167.019-.169.018-.169.017-.171.016-.173.015-.173.014-.175.013-.175.012-.177.011-.178.009-.179.009-.179.007-.181.007-.182.005-.182.004-.184.003-.184.002h-.37l-.184-.002-.184-.003-.182-.004-.182-.005-.181-.007-.179-.007-.179-.009-.178-.009-.176-.011-.176-.012-.175-.013-.173-.014-.172-.015-.171-.016-.17-.017-.169-.018-.167-.019-.166-.02-.165-.021-.163-.022-.162-.023-.161-.024-.159-.025-.157-.026-.156-.027-.155-.028-.153-.028-.151-.03-.15-.03-.148-.031-.146-.033-.145-.033-.143-.033-.141-.035-.14-.036-.137-.036-.136-.037-.134-.038-.132-.039-.13-.039-.128-.04-.126-.041-.124-.042-.122-.043-.12-.043-.117-.044-.116-.044-.113-.046-.112-.046-.109-.046-.106-.047-.105-.048-.102-.049-.1-.049-.097-.05-.095-.051-.093-.051-.09-.051-.087-.053-.085-.052-.083-.054-.08-.054-.077-.054v4.139zm0-5.666v.011l.001.02.003.022.004.021.005.022.006.021.007.022.009.023.01.022.011.023.012.023.013.023.015.023.016.024.017.024.018.023.019.024.021.025.022.024.023.024.024.025.052.05.056.05.061.05.066.051.07.051.075.052.079.051.084.052.088.052.092.052.097.052.102.052.105.051.11.052.114.051.119.051.123.051.127.05.131.05.135.05.139.049.144.048.147.048.152.047.155.046.16.045.163.045.167.043.171.043.176.042.178.04.183.04.187.038.19.037.194.036.197.034.202.033.204.032.209.03.212.028.216.027.219.025.222.024.226.021.23.02.233.018.236.017.24.014.243.012.246.01.249.008.253.006.256.003.259.001.26-.001.257-.003.254-.006.25-.008.247-.01.244-.013.241-.014.237-.016.233-.018.231-.02.226-.022.224-.024.22-.025.216-.027.212-.029.21-.03.205-.032.202-.033.198-.035.194-.036.191-.037.187-.039.183-.039.179-.041.175-.042.172-.043.168-.044.163-.045.16-.045.155-.047.152-.047.148-.048.143-.049.139-.049.136-.049.131-.051.126-.05.123-.051.118-.052.114-.051.11-.052.106-.052.101-.052.096-.052.092-.052.088-.052.083-.052.079-.052.074-.052.07-.051.065-.051.06-.051.056-.05.051-.049.023-.025.023-.025.021-.024.02-.024.019-.024.018-.024.017-.024.015-.023.014-.024.013-.023.012-.023.01-.022.01-.023.008-.022.006-.022.006-.022.004-.022.004-.021.001-.021.001-.021v-4.153l-.077.054-.08.054-.083.053-.085.053-.087.053-.09.051-.093.051-.095.051-.097.05-.1.049-.102.048-.105.048-.106.048-.109.046-.111.046-.114.046-.115.044-.118.044-.12.043-.122.043-.124.042-.126.041-.128.04-.13.039-.132.039-.134.038-.135.037-.138.036-.139.036-.142.034-.143.034-.144.033-.147.032-.148.032-.15.03-.151.03-.153.028-.154.028-.156.027-.158.026-.159.024-.161.024-.162.023-.163.023-.165.021-.166.02-.167.019-.169.018-.169.017-.171.016-.173.015-.173.014-.175.013-.175.012-.177.01-.178.01-.179.009-.179.007-.181.006-.182.006-.182.004-.184.003-.184.001-.185.001-.185-.001-.184-.001-.184-.003-.182-.004-.182-.006-.181-.006-.179-.007-.179-.009-.178-.01-.176-.01-.176-.012-.175-.013-.173-.014-.172-.015-.171-.016-.17-.017-.169-.018-.167-.019-.166-.02-.165-.021-.163-.023-.162-.023-.161-.024-.159-.024-.157-.026-.156-.027-.155-.028-.153-.028-.151-.03-.15-.03-.148-.032-.146-.032-.145-.033-.143-.034-.141-.034-.14-.036-.137-.036-.136-.037-.134-.038-.132-.039-.13-.039-.128-.041-.126-.041-.124-.041-.122-.043-.12-.043-.117-.044-.116-.044-.113-.046-.112-.046-.109-.046-.106-.048-.105-.048-.102-.048-.1-.05-.097-.049-.095-.051-.093-.051-.09-.052-.087-.052-.085-.053-.083-.053-.08-.054-.077-.054v4.153zm8.74-8.179l-.257.004-.254.005-.25.008-.247.011-.244.012-.241.014-.237.016-.233.018-.231.021-.226.022-.224.023-.22.026-.216.027-.212.028-.21.031-.205.032-.202.033-.198.034-.194.036-.191.038-.187.038-.183.04-.179.041-.175.042-.172.043-.168.043-.163.045-.16.046-.155.046-.152.048-.148.048-.143.048-.139.049-.136.05-.131.05-.126.051-.123.051-.118.051-.114.052-.11.052-.106.052-.101.052-.096.052-.092.052-.088.052-.083.052-.079.052-.074.051-.07.052-.065.051-.06.05-.056.05-.051.05-.023.025-.023.024-.021.024-.02.025-.019.024-.018.024-.017.023-.015.024-.014.023-.013.023-.012.023-.01.023-.01.022-.008.022-.006.023-.006.021-.004.022-.004.021-.001.021-.001.021.001.021.001.021.004.021.004.022.006.021.006.023.008.022.01.022.01.023.012.023.013.023.014.023.015.024.017.023.018.024.019.024.02.025.021.024.023.024.023.025.051.05.056.05.06.05.065.051.07.052.074.051.079.052.083.052.088.052.092.052.096.052.101.052.106.052.11.052.114.052.118.051.123.051.126.051.131.05.136.05.139.049.143.048.148.048.152.048.155.046.16.046.163.045.168.043.172.043.175.042.179.041.183.04.187.038.191.038.194.036.198.034.202.033.205.032.21.031.212.028.216.027.22.026.224.023.226.022.231.021.233.018.237.016.241.014.244.012.247.011.25.008.254.005.257.004.26.001.26-.001.257-.004.254-.005.25-.008.247-.011.244-.012.241-.014.237-.016.233-.018.231-.021.226-.022.224-.023.22-.026.216-.027.212-.028.21-.031.205-.032.202-.033.198-.034.194-.036.191-.038.187-.038.183-.04.179-.041.175-.042.172-.043.168-.043.163-.045.16-.046.155-.046.152-.048.148-.048.143-.048.139-.049.136-.05.131-.05.126-.051.123-.051.118-.051.114-.052.11-.052.106-.052.101-.052.096-.052.092-.052.088-.052.083-.052.079-.052.074-.051.07-.052.065-.051.06-.05.056-.05.051-.05.023-.025.023-.024.021-.024.02-.025.019-.024.018-.024.017-.023.015-.024.014-.023.013-.023.012-.023.01-.023.01-.022.008-.022.006-.023.006-.021.004-.022.004-.021.001-.021.001-.021-.001-.021-.001-.021-.004-.021-.004-.022-.006-.021-.006-.023-.008-.022-.01-.022-.01-.023-.012-.023-.013-.023-.014-.023-.015-.024-.017-.023-.018-.024-.019-.024-.02-.025-.021-.024-.023-.024-.023-.025-.051-.05-.056-.05-.06-.05-.065-.051-.07-.052-.074-.051-.079-.052-.083-.052-.088-.052-.092-.052-.096-.052-.101-.052-.106-.052-.11-.052-.114-.052-.118-.051-.123-.051-.126-.051-.131-.05-.136-.05-.139-.049-.143-.048-.148-.048-.152-.048-.155-.046-.16-.046-.163-.045-.168-.043-.172-.043-.175-.042-.179-.041-.183-.04-.187-.038-.191-.038-.194-.036-.198-.034-.202-.033-.205-.032-.21-.031-.212-.028-.216-.027-.22-.026-.224-.023-.226-.022-.231-.021-.233-.018-.237-.016-.241-.014-.244-.012-.247-.011-.25-.008-.254-.005-.257-.004-.26-.001-.26.001z" transform="scale(.5)"></path></symbol></defs><defs><symbol height="24" width="24" id="clock"><path d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm5.848 12.459c.202.038.202.333.001.372-1.907.361-6.045 1.111-6.547 1.111-.719 0-1.301-.582-1.301-1.301 0-.512.77-5.447 1.125-7.445.034-.192.312-.181.343.014l.985 6.238 5.394 1.011z" transform="scale(.5)"></path></symbol></defs><defs><marker orient="auto-start-reverse" markerHeight="12" markerWidth="12" markerUnits="userSpaceOnUse" refY="5" refX="7.9" id="arrowhead"><path d="M -1 0 L 10 5 L 0 10 z"></path></marker></defs><defs><marker refY="4.5" refX="4" orient="auto" markerHeight="8" markerWidth="15" id="crosshead"><path style="stroke-dasharray: 0, 0;" d="M 1,2 L 6,7 M 6,2 L 1,7" stroke-width="1pt" stroke="#000000" fill="none"></path></marker></defs><defs><marker orient="auto" markerHeight="28" markerWidth="20" refY="7" refX="15.5" id="filled-head"><path d="M 18,7 L9,13 L14,7 L9,1 Z"></path></marker></defs><defs><marker orient="auto" markerHeight="40" markerWidth="60" refY="15" refX="15" id="sequencenumber"><circle r="6" cy="15" cx="15"></circle></marker></defs><g><rect class="note" height="39" width="281" stroke="#666" fill="#EDF2AE" y="123" x="50"></rect><text style="font-size: 16px; font-weight: 400;" dy="1em" class="noteText" alignment-baseline="middle" dominant-baseline="middle" text-anchor="middle" y="128" x="191"><tspan x="191">no transaction over http, use metadata</tspan></text></g><text style="font-size: 16px; font-weight: 400;" dy="1em" class="messageText" alignment-baseline="middle" dominant-baseline="middle" text-anchor="middle" y="80" x="191">charge(orderId) // http</text><line style="stroke-dasharray: 3, 3; fill: none;" marker-end="url(#arrowhead)" marker-start="url(#arrowhead)" stroke="none" stroke-width="2" class="messageLine1" y2="113" x2="302" y1="113" x1="79"></line><text style="font-size: 16px; font-weight: 400;" dy="1em" class="messageText" alignment-baseline="middle" dominant-baseline="middle" text-anchor="middle" y="177" x="291">updateStock(orderId) // database</text><line style="fill: none;" marker-end="url(#arrowhead)" marker-start="url(#arrowhead)" stroke="none" stroke-width="2" class="messageLine0" y2="210" x2="502" y1="210" x1="79"></line><text style="font-size: 16px; font-weight: 400;" dy="1em" class="messageText" alignment-baseline="middle" dominant-baseline="middle" text-anchor="middle" y="225" x="391">send(emailAddress, renderedHtml) // smtp</text><line style="fill: none;" marker-end="url(#arrowhead)" marker-start="url(#arrowhead)" stroke="none" stroke-width="2" class="messageLine0" y2="258" x2="702" y1="258" x1="79"></line></svg>


If your external API doesn’t offer a built-in method to verify whether a transaction has already occurred, you can leverage JobRunr's Job Context to track the transaction's status. By saving metadata within the Job Context, you can implement custom safeguards against duplication.

However, it’s important to acknowledge a rare edge case: if JobRunr experiences a crash immediately after calling the external API but before updating the Job Context, there could be a potential for inconsistency. While this scenario is highly unlikely, understanding this limitation is key to planning for maximum fault tolerance.

**Option with Job Context:**

<figure style="width: 100%;">

```java
public void processOrder(Long userId, Long orderId, JobContext jobContext) {
    // Charge the customer
    User user = userService.getUser(userId);
    Order order = orderService.getOrder(orderId);
    
    Map<String, Object> metadata = jobContext.getMetadata();
    if (!metadata.containsKey("order-charged")) {
        // e.g. if your externalPaymentApi does not support idempotency checks
        externalPaymentApi.charge(orderId, order.getTotalAmount());
        jobContext.saveMetadata("order-charged", true);
    }

    if (!metadata.containsKey("stock-updated")) {
        // e.g. if your stockService does not support idempotency checks
        stockService.updateStock(orderId);
        jobContext.saveMetadata("stock-updated", true);
    }

    // no guard necessary as if we get here, the only that can still go wrong but will be retried is sending the email
    emailService.send(user.getEmail(), renderOrder(orderId));
}
```

</figure>

Re-entrancy ensures that retries don’t cause duplicate emails or inconsistent states.

## How JobRunr is Designed to Enhance Reliability

JobRunr is built to ensure the reliability of background job processing with features that support fault tolerance, observability, and advanced workflows. Below are some of the key features, both free and Pro, that help enhance reliability.

### Dealing with Exceptions and Retries

JobRunr automatically retries failed jobs with exponential back-off, a feature included in the free version. For more complex scenarios, [JobRunr Pro](https://www.jobrunr.io/en/documentation/pro/) offers custom retry policies, allowing developers to fine-tune retry behavior to match specific requirements. These retry mechanisms ensure that transient errors are handled seamlessly.

### Observability

Observability is critical for identifying issues in job execution. [JobRunr Pro](https://www.jobrunr.io/en/documentation/pro/) integrates with tools like Jaeger, New Relic, and Honeycomb, providing developers with real-time insights into metrics such as failure rates, job durations, and retry counts. These insights help ensure that idempotence and re-entrancy function as expected.

### Job Timeouts

In cases where jobs hang indefinitely, [JobRunr Pro](https://www.jobrunr.io/en/documentation/pro/) provides the ability to define job timeouts. This feature ensures that long-running jobs are automatically canceled after a specified duration, freeing up system resources and allowing retries to proceed safely.

### Job Chaining

For workflows requiring sequential execution, [JobRunr Pro](https://www.jobrunr.io/en/documentation/pro/) supports job chaining. This ensures that dependent tasks execute only after preceding tasks succeed, maintaining data consistency and workflow integrity.

---

## Conclusion

Idempotence and re-entrancy are vital for ensuring robust and reliable background jobs in JobRunr. By simplifying arguments, ensuring re-entrant behavior, and allowing exceptions to propagate, you can design background jobs that are efficient, fault-tolerant, and scalable.

Additionally, [JobRunr Pro](https://www.jobrunr.io/en/documentation/pro/) enhances reliability with features like custom retry policies, job timeouts, and observability tools.