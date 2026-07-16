(async function hideSplineLogo() {
  try {
    await customElements.whenDefined("spline-viewer");
  } catch {
    return;
  }

  const viewer = document.querySelector(".hero-foto spline-viewer");
  if (!viewer) return;

  const STYLE_ID = "hide-spline-logo";

  const injectStyle = (root) => {
    if (!root || root.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      #logo {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
        width: 0 !important;
        height: 0 !important;
        overflow: hidden !important;
        position: absolute !important;
        inset: auto !important;
      }
    `;
    root.appendChild(style);
  };

  const hideLogo = () => {
    const root = viewer.shadowRoot;
    if (!root) return false;

    injectStyle(root);

    const logo = root.querySelector("#logo");
    if (!logo) return false;

    logo.style.setProperty("display", "none", "important");
    logo.setAttribute("aria-hidden", "true");
    logo.removeAttribute("href");
    logo.tabIndex = -1;
    return true;
  };

  const lockLogoDisplay = () => {
    const logo = viewer.shadowRoot?.querySelector("#logo");
    if (!logo || logo.dataset.logoLocked === "1") return;

    logo.dataset.logoLocked = "1";
    const style = logo.style;
    const originalSetProperty = style.setProperty.bind(style);

    style.setProperty = (name, value, priority) => {
      if (String(name).toLowerCase() === "display") {
        return originalSetProperty("display", "none", "important");
      }
      return originalSetProperty(name, value, priority);
    };

    try {
      Object.defineProperty(style, "display", {
        configurable: true,
        get() {
          return "none";
        },
        set() {
          originalSetProperty("display", "none", "important");
        },
      });
    } catch {
      /* ignore if browser blocks */
    }
  };

  const apply = () => {
    hideLogo();
    lockLogoDisplay();
  };

  apply();

  const observer = new MutationObserver(apply);
  observer.observe(viewer, { childList: true, subtree: true, attributes: true });

  if (viewer.shadowRoot) {
    observer.observe(viewer.shadowRoot, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["style", "class"],
    });
  }

  viewer.addEventListener("load-complete", apply);
  viewer.addEventListener("load", apply);

  const started = Date.now();
  const timer = setInterval(() => {
    apply();
    if (Date.now() - started > 15000) clearInterval(timer);
  }, 100);
})();
