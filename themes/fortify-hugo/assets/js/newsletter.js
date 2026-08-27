// Set in partials/essentials/head.html from site.Params.n8n_webhook_url.
// No fallback on purpose: a fallback would silently defeat the development sandbox.
const NEWSLETTER_WEBHOOK = window.JR_N8N_WEBHOOK;

document.querySelectorAll('[data-newsletter]').forEach((wrapper) => {
  const field = (name) => wrapper.querySelector(`[data-newsletter-field="${name}"]`);
  const form = field('form');
  if (!form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const emailInput = field('email');
    const usernameInput = field('username');
    const submitButton = field('submit');
    const successMessage = field('success');
    const errorMessage = field('error');
    const submitLabel = submitButton.textContent;

    submitButton.disabled = true;
    submitButton.textContent = 'Sending...';
    emailInput.disabled = true;
    errorMessage.classList.add('hidden');

    fetch(NEWSLETTER_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailInput.value, username: usernameInput.value, form: 'newsletter' }),
    })
      .then((response) => {
        if (!response.ok) throw new Error('Submission failed.');
        form.classList.add('hidden');
        successMessage.classList.remove('hidden');
      })
      .catch((err) => {
        console.error('Newsletter submission error:', err);
        errorMessage.textContent = 'An error occurred. Please try again.';
        errorMessage.classList.remove('hidden');
        submitButton.disabled = false;
        submitButton.textContent = submitLabel;
        emailInput.disabled = false;
      });
  });
});
