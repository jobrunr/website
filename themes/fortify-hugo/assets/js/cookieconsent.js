window.addEventListener("load", () => {
  const spanish = (document.documentElement.lang || "").toLowerCase().startsWith("es");
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
    "content": spanish ? {
      "message": "Este sitio web utiliza cookies para ofrecerte la mejor experiencia.",
      "dismiss": "¡Entendido!",
      "link": "Más información sobre las cookies"
    } : {
      "link": "Learn more about cookies"
    }
  });
});