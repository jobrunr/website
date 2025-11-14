---
title: "You're All Set!"
summary: "Thank you for registering for the JobRunr v8 Live-Coding Webinar. We look forward to seeing you there!"
skip_meta: true
slug: "webinar-v8-thank-you"
---
<style>
    /* Hide the default header and footer for this lite page */
    .post-full-header, .site-footer, .post-full-image {
        display: none;
    }

    /* Apply a full-screen gradient background */
    body {
        background: linear-gradient(135deg, rgba(40, 220, 222, 0.2) 0%, rgba(111, 114, 229, 0.2) 100%);
    }

    /* Center the content vertically and horizontally */
    .thank-you-wrapper {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 80vh; /* Use viewport height to center */
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
    }

    /* Style the main content box */
    .thank-you-container {
        text-align: center;
        background: #fff;
        padding: 3rem 4rem;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        max-width: 600px;
        width: 90%;
    }

    .thank-you-container h1 {
        font-size: 2.8rem;
        color: #333;
        margin-top: 0;
        margin-bottom: 1rem;
    }

    .thank-you-container p {
        font-size: 1.1rem;
        color: #555;
        line-height: 1.6;
    }

    /* Countdown Timer Style */
    .countdown-timer {
        font-size: 3.5rem;
        font-weight: bold;
        color: #6f72e5; /* Use brand accent color */
        margin: 1.5rem 0;
        line-height: 1;
    }

    .redirect-message {
        font-size: 0.9rem;
        color: #888;
        margin-bottom: 2rem;
    }

    /* Button Style (re-using from main page) */
    .btn {
        text-decoration: none;
        display: inline-block;
        font-size: 1.1rem;
        padding: 0.8rem 1.5rem;
        border-radius: 5px;
        transition: all 0.3s ease;
        font-weight: bold;
    }
    .btn-black {
        background-color: black !important;
        color: white !important;
    }
</style>

<div class="thank-you-wrapper">
    <div class="thank-you-container">
        <h1>You're all set!</h1>
        <p>Thanks for registering for the JobRunr v8 Live-Coding Webinar. You'll receive a confirmation email with your calendar invite shortly.</p>
        <p class="redirect-message" style="margin-top: 2rem;">Returning to the previous page in...</p>
        <div id="countdown" class="countdown-timer">10</div>
        <a href="https://www.jobrunr.io/en/blog/webinar-v8/" class="btn btn-black">Go Back Now</a>
    </div>
</div>

<script>
    (function() {
        var countdownElement = document.getElementById('countdown');
        var seconds = 10;
        var redirectUrl = 'https://www.jobrunr.io/en/blog/webinar-v8/';

        var interval = setInterval(function() {
            seconds--;
            countdownElement.textContent = seconds;
            if (seconds <= 0) {
                clearInterval(interval);
                window.location.href = redirectUrl;
            }
        }, 1000);
    })();
</script>