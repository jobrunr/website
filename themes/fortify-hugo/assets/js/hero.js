(function () {
  "use strict";

  function show(panels, attr, id) {
    panels.forEach((p) => p.classList.toggle("hidden", p.dataset[attr] !== id));
  }

  function initHero() {
    const tablist = document.querySelector(".hero-editor__tabs");
    if (!tablist) return;

    const tabs = Array.from(tablist.querySelectorAll('[role="tab"]'));
    if (tabs.length === 0) return;

    const codePanels = document.querySelectorAll(".hero-editor__panel");
    const dashboardPanels = document.querySelectorAll(".hero-browser__panel");
    const address = document.querySelector("[data-hero-address]");

    function select(tab, moveFocus) {
      tabs.forEach((t) => {
        const active = t === tab;
        t.setAttribute("aria-selected", active ? "true" : "false");
        t.tabIndex = active ? 0 : -1;
      });
      show(codePanels, "codePanel", tab.dataset.fileTab);
      show(dashboardPanels, "dashboardPanel", tab.dataset.fileTab);
      if (address && tab.dataset.address) address.textContent = tab.dataset.address;
      if (moveFocus) tab.focus();
    }

    tablist.addEventListener("click", (e) => {
      const tab = e.target.closest('[role="tab"]');
      if (tab) select(tab);
    });

    // Browser nav arrows step through the examples (wrapping).
    document.querySelectorAll(".hero-browser__nav [data-nav]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const i = tabs.findIndex((t) => t.getAttribute("aria-selected") === "true");
        const last = tabs.length - 1;
        const next = (i < 0 ? 0 : i) + (btn.dataset.nav === "next" ? 1 : -1);
        select(tabs[next < 0 ? last : next > last ? 0 : next]);
      });
    });

    tablist.addEventListener("keydown", (e) => {
      const i = tabs.indexOf(e.target);
      if (i === -1) return;

      const last = tabs.length - 1;
      let target;
      switch (e.key) {
        case "ArrowRight": target = tabs[i === last ? 0 : i + 1]; break;
        case "ArrowLeft": target = tabs[i === 0 ? last : i - 1]; break;
        case "Home": target = tabs[0]; break;
        case "End": target = tabs[last]; break;
        default: return;
      }
      e.preventDefault();
      e.stopPropagation();
      select(target, true);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initHero);
  } else {
    initHero();
  }
})();
