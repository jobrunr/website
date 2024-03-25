---
title: "JobRunr 7 Webinar"
summary: "Celebrate the new release together with us!"
translationKey: "webinar"
skip_meta: true
date: 2024-03-22T11:12:23+02:00
---
Join us in our second webinar ever where we will discuss:
- **What's new in JobRunr Version 7**: an in-depth tour of new features, giving you more performance than ever. We will not focus on technical details only - we will also zoom in and how you and your organization will benefit.
- **Our roadmap**: we listened very actively to our customers and this helped us define the roadmap for v8. Your input also helps us!
- **Questions / Remarks**: we have some time during the webinar to answer your questions. If we haven't got enough time to treat all of them, we will do so in our next blog.


<style>
    #subscription-form {
        font-size: 90%;
    }
    #subscription-form dl {
        margin: 0 0 1em;
    }
    #subscription-form dl input[type="text"] {
        width: 50%;
    }
</style>

<script type="text/javascript">
    function submitForm() {
        const firstNameField = document.getElementById('firstName');
        const lastNameField = document.getElementById('lastName');
        const emailField = document.getElementById('email');
        const companyField = document.getElementById('company');

        const firstName = firstNameField.value;
        const lastName = lastNameField.value;
        const email = emailField.value;
        const company = companyField.value;
		const webinarSlot = document.querySelector('input[name="webinarSlot"]:checked').value
        
        if(!firstName || !lastName || !email || !company || !email.includes('@') || !webinarSlot) {
            document.getElementById('subscription-form-error').style.display = 'block';
        } else {
            document.getElementById('subscription-form-error').style.display = 'none';
            
            firstNameField.disabled = true;
            lastNameField.disabled = true;
            emailField.disabled = true;
            companyField.disabled = true;
            document.getElementById('submit-btn').disabled = true;
            fetch('https://admin.jobrunr.io/api/forms/webinar', {
				method: 'POST',
				headers: {'Content-Type': 'application/x-www-form-urlencoded'}, 
				body: new URLSearchParams({
					'firstName': firstName,
					'lastName': lastName,
					'email': email,
					'company': company,
					'createdAt': new Date().toISOString(),
					'webinarSlot': webinarSlot
				})
			})
			.then(resp => {
				if(resp.status === 200 || resp.status === 204) {
					document.getElementById('subscription-form').style.display = 'none';
					document.getElementById('subscription-success-response').style.display = 'block';
				} else {
					document.getElementById('subscription-form').style.display = 'none';
					document.getElementById('subscription-error-response').style.display = 'block';
				}
			})
			.catch(error => {
				document.getElementById('subscription-form').style.display = 'none';
				document.getElementById('subscription-error-response').style.display = 'block';
			});
        }
        return false;
    }
</script>


<div style="display: flex; justify-content: center;">
    <div style="background: #f5f5f5; padding: 3rem; border: #f5f5f5; border-radius: 10px; margin-bottom: 5rem; width: 850px">
        <div id="subscription-form">
            <form novalidate="">
                <h2 style="margin: 0 0 .5em;">Subscribe to the JobRunr v7 webinar</h2>
                <p style="margin-bottom: 0">
                    Choose your preferred time slot below and reserve your spot!<br/>
                </p>
				<img src="/2024-03-22-jobrunr-webinar-slots.png" alt="Choose your session" width="100%"/>
                <br />
                <div style="margin-left: 100px">
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
                        <dt style="text-align: right"><label for="company">Company</label></dt> 
                        <dd><input type="text" value="" name="company" class="" id="company" /></dd>
                    </dl>
					<dl>
                        <dt style="text-align: right"><label for="session">Session</label></dt> 
                        <dd>
							<input type="radio" name="webinarSlot" value="1" />&nbsp;&nbsp;Session 1 <span style="display: inline-block; width: 50px"></span>
							<input type="radio" name="webinarSlot" value="2" />&nbsp;&nbsp;Session 2
						</dd>
                    </dl>
                    <dl id="subscription-form-error" style="display: none">
                        <dt style="text-align: right">&nbsp;</dt> 
                        <dd>
                            <div class="response" style="color:red;">All fields are required.</div>
                        </dd>
                    </dl>
                    <dl>
                        <dt style="text-align: right">&nbsp;</dt> 
                        <dd>
                            <input id="submit-btn" type="button" value="Submit" onclick="submitForm();" style="width:100px"/>
                        </dd>
                    </dl>
                </div>
            </form>
        </div>
        <div id="mce-responses" class="clear">
            <div class="response" id="subscription-error-response" style="display:none; color:red;">Error submitting your reservation for the webinar. Please try again later.</div>
            <div class="response" id="subscription-success-response" style="display:none">Thank you for subscribing to our webinar, we will send out a calendar invite a couple of days before the webinar.</div>
        </div> 
    </div>
    
</div>