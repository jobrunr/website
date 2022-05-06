---
title: "JobRunr Pro Trial"
translationKey: "jobrunr-pro-trial"
summary: "Are you interested in a trial of JobRunr Pro? Fill in the form below and we will send you all the necessary information to get started!"
skip_meta: true
date: 2022-03-15T11:12:23+02:00
menu:
main:
identifier: trial
weight: 15
---

<style>
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
    }
</style>

<script type="text/javascript">
    document.addEventListener("DOMContentLoaded", function(event) {
        document.getElementById('firstName').focus();
    });

    function submitForm() {
        gtag('event', 'get_pro_trial', {'event_category': 'ecommerce', 'event_label' : 'request_trial' });
        const firstNameField = document.getElementById('firstName');
        const lastNameField = document.getElementById('lastName');
        const emailField = document.getElementById('email');
        const linkedInField = document.getElementById('linkedIn');
        const companyField = document.getElementById('company');

        const firstName = firstNameField.value;
        const lastName = lastNameField.value;
        const email = emailField.value;
        const linkedIn = linkedInField.value;
        const company = companyField.value;
        
        if(!firstName || !lastName || !email || !company || !email.includes('@') || !(linkedIn.startsWith('https://linkedin') || linkedIn.startsWith('https://www.linkedin'))) {
            document.getElementById('trial-form-error').style.display = 'block';
        } else {
            document.getElementById('trial-form-error').style.display = 'none';
            
            firstNameField.disabled = true;
            lastNameField.disabled = true;
            emailField.disabled = true;
            linkedInField.disabled = true;
            companyField.disabled = true;
            document.getElementById('submit-btn').disabled = true;
            const trialData = {
                firstName: firstName,
                lastName: lastName,
                email: email,
                linkedIn: linkedIn,
                company: company
            };
            fetch('https://api.jobrunr.io/api/request-trial', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(trialData)})
                .then(resp => {
                    if(resp.status === 200) {
                        document.getElementById('trial-form').style.display = 'none';
                        document.getElementById('trial-success-response').style.display = 'block';
                    } else {
                        document.getElementById('trial-form').style.display = 'none';
                        document.getElementById('trial-error-response').style.display = 'block';
                }
                })
                .catch(error => {
                    document.getElementById('trial-form').style.display = 'none';
                    document.getElementById('trial-error-response').style.display = 'block';
                });
        }
        return false;
    }

</script>

<div style="display: flex; column-gap: 100px;">
    <div style="flex: 0.8; background: #f5f5f5; padding: 3rem; border: #f5f5f5; border-radius: 10px; margin-bottom: 5rem;">
        <div id="trial-form">
            <form novalidate="">
                <h2 style="margin: 0 0 .5em;">Start your free trial now</h2>
                <p style="margin-bottom: 0">
                    Use JobRunr Pro for free during 14 days.<br />(No risk. No credit card required.)<br/>
                </p>
                <br />
                <div>
                    <dl>
                        <dt style="text-align: right"><label for="firstName">First name </label></dt> 
                        <dd><input type="text" value="" name="firstName" class="" id="firstName" /></dd>
                    </dl>
                    <dl>
                        <dt style="text-align: right"><label for="lastName">Last name </label></dt> 
                        <dd><input type="text" value="" name="lastName" class="" id="lastName" /></dd>
                    </dl>
                    <dl>
                        <dt style="text-align: right"><label for="email">Email </label></dt> 
                        <dd><input type="text" value="" name="email" class="" id="email" /></dd>
                    </dl>
                    <dl>
                        <dt style="text-align: right"><label for="linkedIn">LinkedIn url</label></dt> 
                        <dd><input type="text" value="" name="linkedIn" class="" id="linkedIn" /></dd>
                    </dl>
                    <dl>
                        <dt style="text-align: right"><label for="company">Company</label></dt> 
                        <dd><input type="text" value="" name="company" class="" id="company" /></dd>
                    </dl>
                    <dl id="trial-form-error" style="display: none">
                        <dt style="text-align: right">&nbsp;</dt> 
                        <dd>
                            <div class="response" style="color:red;">All fields are required.</div>
                        </dd>
                    </dl>
                    <dl>
                        <dt style="text-align: right">&nbsp;</dt> 
                        <dd>
                            <input id="submit-btn" type="button" value="Submit" onclick="submitForm();" />
                        </dd>
                    </dl>
                </div>
            </form>
        </div>
        <div id="mce-responses" class="clear">
            <div class="response" id="trial-error-response" style="display:none; color:red;">Error submitting your request for a trial. Please try again later.</div>
            <div class="response" id="trial-success-response" style="display:none">Thanks for requesting a trial. I will get back to you as soon as possible.</div>
        </div> 
    </div>
    <div id="like-a-pro" style="flex: 1;">
        <h2 style="margin: 1em 0 .5em 0;">Run all your Java jobs, like a Pro.</h2>
        <figure style="margin: 0em 0 1.5em 0">
            <img src="/try-jobrunr-pro.png" class="kg-image" style="max-height: 450px; border-radius: 10px">
            <figcaption>Use JobRunr Pro to launch millions of jobs and make your<br>development life hassle-free!</figcaption>
        </figure>
    </div>
</div>