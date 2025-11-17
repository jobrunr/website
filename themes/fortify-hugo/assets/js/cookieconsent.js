window.addEventListener("load", (event) => {
  setTimeout(() => {
    // cookieconsent can be blocked in which case this crashes.
    window.cookieconsent?.initialise({
      "palette": {
        "popup": {
          "background": "#000"
        },
        "button": {
          "background": "transparent",
          "border": "#fff",
          "text": "#fff"
        }
      },
      "content": {
        "link": "Learn more about cookies"
      }
    });
  }, 5000);
});

var links = document.querySelectorAll('a');
for (var i = 0; i < links.length; i++) {
  if (links[i].hostname != window.location.hostname) {
    links[i].target = '_blank';
    links[i].rel = 'noopener';
  }
}