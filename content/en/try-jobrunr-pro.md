---
title: "JobRunr Pro Trial"
translationKey: "jobrunr-pro-trial"
summary: "Start your free 14‑day trial of JobRunr Pro.<br/>Fill in the form below and we'll get in touch to get you started!<br/>"
skip_meta: true
date: 2022-03-15T11:12:23+02:00
menu:
  main:
    identifier: trial
    weight: 15
draft: false
---

<style>
  .post-full-header {
    margin: 40px 0 48px;
    padding: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    display: none;
  }

  .post-full-title {
    font-size: 45px;
    text-align: center;
    font-weight: 500;
  }

  .payload-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 40px;
    font-size: 16px;
  }

  .copy .copy-title,
  .copy .copy-subtitle {
    margin-bottom: 12px;
    font-weight: 600;
  }

  .copy .copy-title {
    font-size: 20px;
  }

  .copy .copy-subtitle {
    font-size: 18px;
  }

  .form-container {
    background-color: #F5F5F5;
    padding: 24px;
    border-radius: 8px;
  }
  .form-container h2{
    text-align: center;
  }

  .form-container p{
        line-height: 20px;
  }

  /* Trial‑form tweaks */
  #trial-form {
    font-size: 90%;
  }
  #trial-form dl {
    margin: 0 0 1em;
  }
  #trial-form dl input[type="text"] {
    width: 60%;
  }
  @media only screen and (max-width: 1140px) {
    #like-a-pro {
      display: none;
    }
    .payload-container {
      display: block;
    }
  }

  .trusted-by {
    margin-top: 40px;
    width: 100%;
  }

  .trusted-by .trusted-by-title {
    text-align: center;
    font-size: 18px;
  }

  .trusted-by .companies {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
  }

  .trusted-by .companies img {
    height: 25px;
    max-width: 160px;
  }
</style>

<h1>Ready to try out JobRunr Pro?</h1>
<div class="payload-container request-trial-page">
  <!-- Left: Trial messaging -->
  <section class="copy">
    <article>
      <h3 class="copy-title">Start your free 14‑day trial of JobRunr Pro!</h3>
      <p>Fill in the form and we’ll reach out to get you up and running with all Pro features.</p>
    </article>
    <article>
      <h4 class="copy-subtitle">What you’ll get in your trial:</h4>
      <ul>
        <li><strong>Full Pro features:</strong> Priority queues, batch processing and advanced dashboards.</li>
        <li><strong>Scale stress‑free:</strong> Run up to 5,000 recurring jobs without lifting a finger.</li>
        <li><strong>Visibility & control:</strong> Real-time scheduling, advanced metrics, and full dashboard observability and filters.</li>
        <li><strong>Limited support:</strong> Trial‑only access to our dev team for tips and troubleshooting.</li>
      </ul>
      <footer class="trusted-by">
        <h3 class="trusted-by-title">Join industry leaders who trust JobRunr</h3>
        <div class="companies">
          <img src="/logos/Capgemini-logo.webp" alt="Capgemini" />
          <img src="/logos/Amazon-logo.webp" alt="Amazon" />
          <img src="/logos/intuit-logo.svg" alt="Intuit" />
          <img src="/logos/Thoughtworks-logo.webp" alt="ThoughtWorks" />
        </div>
      </footer>
    </article>
  </section>

  <!-- Right: Trial form -->
  <section class="form-container">
    <div id="trial-form">
      <form novalidate="">
        <h2 style="margin: 0 0 .5em;">Request your free trial now</h2>
        <br />
        <dl>
          <dt style="text-align: right"><label for="firstName">First name* </label></dt>
          <dd><input type="text" id="firstName" name="firstName" /></dd>
        </dl>
        <dl>
          <dt style="text-align: right"><label for="lastName">Last name* </label></dt>
          <dd><input type="text" id="lastName" name="lastName" /></dd>
        </dl>
        <dl>
          <dt style="text-align: right"><label for="email">Email* </label></dt>
          <dd><input type="text" id="email" name="email" /></dd>
        </dl>
        <dl>
          <dt style="text-align: right"><label for="linkedIn">LinkedIn URL* </label></dt>
          <dd><input type="text" id="linkedIn" name="linkedIn" /></dd>
        </dl>
        <dl>
          <dt style="text-align: right"><label for="company">Company* </label></dt>
          <dd><input type="text" id="company" name="company" /></dd>
        </dl>
        <dl id="trial-form-error" style="display: none">
          <dt style="text-align: right">&nbsp;</dt>
          <dd><div class="response" style="color:red;">All fields are required</div></dd>
        </dl>
        <dl>
          <dd>
            <input
              id="submit-btn"
              class="btn-try-jobrunr-form"
              type="button"
              value="Request a free trial"
              onclick="submitForm();"
            />
          </dd>
        </dl>
      </form>
      <p>After you submit your trial request, our team will reach out within 48 hours to learn about your needs and make sure JobRunr Pro is the right fit for your company.</p>
    </div>
    <div id="mce-responses" class="clear">
      <div id="trial-error-response" class="response" style="display:none; color:red;">
        There was an error processing your request. Please try again later.
      </div>
      <div id="trial-success-response" class="response" style="display:none;">
        Thank you! We'll get in touch to discuss your JobRunr Pro trial request.
      </div>
    </div>
  </section>
</div>

<script type="text/javascript">
  document.addEventListener("DOMContentLoaded", function() {
    document.getElementById('firstName').focus();
  });

  function submitForm() {
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('email').value.trim();
    const linkedIn = document.getElementById('linkedIn').value.trim();
    const company = document.getElementById('company').value.trim();
    const validLinkedIn =
      linkedIn.startsWith('https://linkedin') ||
      linkedIn.startsWith('https://www.linkedin') ||
      linkedIn.startsWith('linkedin.com');
    const errorEl = document.getElementById('trial-form-error');

    if (!firstName || !lastName || !email || !company || !email.includes('@') || !validLinkedIn) {
      errorEl.style.display = 'block';
      return false;
    }
    errorEl.style.display = 'none';

    // disable inputs
    ['firstName','lastName','email','linkedIn','company','submit-btn'].forEach(id => {
      document.getElementById(id).disabled = true;
    });

    const trialData = { firstName, lastName, email, linkedIn, company };
    fetch('https://hooks.zapier.com/hooks/catch/21269987/u2fk7ul/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      mode: 'no-cors',
      body: JSON.stringify(trialData)
    })
      .then(() => {
        document.getElementById('trial-form').style.display = 'none';
        document.getElementById('trial-success-response').style.display = 'block';
      })
      .catch(() => {
        document.getElementById('trial-form').style.display = 'none';
        document.getElementById('trial-error-response').style.display = 'block';
      });

    return false;
  }
</script>
