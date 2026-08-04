window.addEventListener("load", () => {
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
});