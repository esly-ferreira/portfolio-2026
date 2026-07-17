(async function initSpline() {
  const viewer = document.querySelector(".hero-foto spline-viewer");
  if (!viewer) return;

  const SPLINE_SRC =
    "https://unpkg.com/@splinetool/viewer@1.12.98/build/spline-viewer.js";
  const STYLE_ID = "hide-spline-logo";
  const isCoarse = () =>
    window.matchMedia("(max-width: 900px)").matches ||
    window.matchMedia("(pointer: coarse)").matches;

  let started = false;
  let app = null;

  const loadViewerScript = () => {
    if (window.customElements?.get("spline-viewer")) {
      return Promise.resolve();
    }
    if (document.querySelector('script[data-spline-viewer]')) {
      return customElements.whenDefined("spline-viewer");
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.type = "module";
      script.src = SPLINE_SRC;
      script.dataset.splineViewer = "1";
      script.onload = () =>
        customElements.whenDefined("spline-viewer").then(resolve).catch(reject);
      script.onerror = reject;
      document.body.appendChild(script);
    });
  };

  const injectLogoStyle = (root) => {
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
      }
    `;
    root.appendChild(style);
  };

  const hideLogo = () => {
    const root = viewer.shadowRoot;
    if (!root) return false;
    injectLogoStyle(root);
    const logo = root.querySelector("#logo");
    if (!logo) return false;
    logo.style.setProperty("display", "none", "important");
    logo.setAttribute("aria-hidden", "true");
    logo.removeAttribute("href");
    logo.tabIndex = -1;
    return true;
  };

  const syncViewerSize = () => {
    const host = viewer.parentElement;
    if (!host) return;

    if (!window.matchMedia("(max-width: 900px)").matches) {
      viewer.style.removeProperty("width");
      viewer.style.removeProperty("height");
      return;
    }

    const styles = getComputedStyle(host);
    const w = styles.getPropertyValue("--spline-size-w").trim() || "380px";
    const h = styles.getPropertyValue("--spline-size-h").trim() || "440px";
    viewer.style.width = w;
    viewer.style.height = h;
  };

  const findApp = () =>
    viewer.spline ||
    viewer.application ||
    viewer._application ||
    viewer.shadowRoot?.querySelector("canvas")?.__spline ||
    null;

  const setMobileQuality = () => {
    if (!isCoarse()) return;
    app = findApp() || app;
    try {
      if (app?.setPixelRatio) {
        app.setPixelRatio(Math.min(1.25, window.devicePixelRatio || 1));
      }
    } catch {
      /* ignore */
    }

    const canvas = viewer.shadowRoot?.querySelector("canvas");
    if (canvas) {
      canvas.style.imageRendering = "auto";
    }
  };

  const setPlaying = (play) => {
    app = findApp() || app;
    try {
      if (play) {
        app?.play?.();
        app?.start?.();
        viewer.play?.();
      } else {
        app?.stop?.();
        app?.pause?.();
        viewer.pause?.();
      }
    } catch {
      /* ignore */
    }
  };

  const setupVisibilityControl = () => {
    if (!("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = Boolean(entry?.isIntersecting);
        setPlaying(visible);
        if (visible) {
          hideLogo();
          syncViewerSize();
        }
      },
      { root: null, rootMargin: "80px 0px", threshold: 0.05 }
    );

    observer.observe(viewer.parentElement || viewer);
  };

  const setupLogoWatch = () => {
    hideLogo();

    const root = viewer.shadowRoot;
    if (!root || !("MutationObserver" in window)) return;

    let tries = 0;
    const observer = new MutationObserver(() => {
      hideLogo();
      if (hideLogo() || ++tries > 40) observer.disconnect();
    });

    observer.observe(root, { childList: true, subtree: true });
    window.setTimeout(() => observer.disconnect(), 8000);
  };

  const setupSizeWatch = () => {
    syncViewerSize();

    let resizeTimer = 0;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(syncViewerSize, 150);
    };

    window.addEventListener("resize", onResize, { passive: true });

    if ("ResizeObserver" in window && viewer.parentElement) {
      const ro = new ResizeObserver(onResize);
      ro.observe(viewer.parentElement);
    }
  };

  const start = async () => {
    if (started) return;
    started = true;

    try {
      await loadViewerScript();
      await customElements.whenDefined("spline-viewer");
    } catch {
      return;
    }

    setupSizeWatch();
    setupLogoWatch();
    setupVisibilityControl();

    viewer.addEventListener(
      "load-complete",
      () => {
        hideLogo();
        setMobileQuality();
        syncViewerSize();
        app = findApp();
      },
      { once: true }
    );

    // Se já carregou antes do listener
    window.setTimeout(() => {
      hideLogo();
      setMobileQuality();
      syncViewerSize();
    }, 500);
  };

  const whenIdle = (fn, timeout) => {
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(fn, { timeout });
    } else {
      window.setTimeout(fn, Math.min(timeout, 1200));
    }
  };

  const whenReady = (fn) => {
    if (document.body.classList.contains("is-ready")) {
      fn();
      return;
    }

    const obs = new MutationObserver(() => {
      if (document.body.classList.contains("is-ready")) {
        obs.disconnect();
        fn();
      }
    });
    obs.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    window.setTimeout(fn, 2500);
  };

  // Celular: atrasa o WebGL para liberar a UI; desktop: após o loader
  if (isCoarse()) {
    const kick = () => whenIdle(() => start(), 2800);
    whenReady(kick);
    document
      .querySelector(".hero-foto")
      ?.addEventListener("pointerdown", () => start(), { once: true });
  } else {
    whenReady(() => whenIdle(() => start(), 1200));
  }
})();
