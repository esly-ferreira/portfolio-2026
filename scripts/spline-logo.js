(async function initSpline() {
  const viewer = document.querySelector(".hero-foto spline-viewer");
  if (!viewer) return;

  const SPLINE_SRC =
    "https://unpkg.com/@splinetool/viewer@1.12.98/build/spline-viewer.js";
  const STYLE_ID = "hide-spline-logo";
  const isTabletOrBelow = () =>
    window.matchMedia("(max-width: 900px)").matches;
  const isMobile = () =>
    isTabletOrBelow() ||
    window.matchMedia("(pointer: coarse)").matches ||
    navigator.maxTouchPoints > 1;

  let started = false;
  let app = null;
  let playing = false;

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
    style.textContent = `#logo{display:none!important;pointer-events:none!important}`;
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
    const h = styles.getPropertyValue("--spline-size-h").trim() || "380px";
    viewer.style.width = w;
    viewer.style.height = h;
  };

  const findApp = () =>
    viewer.spline ||
    viewer.application ||
    viewer._application ||
    null;

  const applyQuality = () => {
    app = findApp() || app;
    const dpr = isMobile()
      ? 1
      : Math.min(1.5, window.devicePixelRatio || 1);

    try {
      app?.setPixelRatio?.(dpr);
    } catch {
      /* ignore */
    }

    const canvas = viewer.shadowRoot?.querySelector("canvas");
    if (!canvas) return;

    // Força canvas mais leve no mobile
    if (isMobile()) {
      const rect = canvas.getBoundingClientRect();
      const w = Math.max(1, Math.round(rect.width));
      const h = Math.max(1, Math.round(rect.height));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    }
  };

  const setPlaying = (play) => {
    if (play === playing && app) return;
    playing = play;
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
        const visible =
          Boolean(entry?.isIntersecting) &&
          (entry.intersectionRatio ?? 0) > 0.12;
        setPlaying(visible);
        if (visible) {
          hideLogo();
          applyQuality();
          syncViewerSize();
        }
      },
      { root: null, rootMargin: "0px", threshold: [0, 0.12, 0.35] }
    );

    observer.observe(viewer.parentElement || viewer);

    document.addEventListener(
      "visibilitychange",
      () => {
        if (document.hidden) setPlaying(false);
      },
      { passive: true }
    );
  };

  const setupLogoWatch = () => {
    hideLogo();
    const root = viewer.shadowRoot;
    if (!root || !("MutationObserver" in window)) return;

    let tries = 0;
    const observer = new MutationObserver(() => {
      if (hideLogo() || ++tries > 20) observer.disconnect();
    });
    observer.observe(root, { childList: true, subtree: true });
    window.setTimeout(() => observer.disconnect(), 4000);
  };

  const setupSizeWatch = () => {
    syncViewerSize();
    let resizeTimer = 0;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        syncViewerSize();
        applyQuality();
      }, 200);
    };
    window.addEventListener("resize", onResize, { passive: true });
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
        applyQuality();
        syncViewerSize();
        app = findApp();
        // No mobile, render só enquanto a aba/hero estão ativos
        if (isMobile() && document.hidden) setPlaying(false);
      },
      { once: true }
    );

    window.setTimeout(() => {
      hideLogo();
      applyQuality();
      syncViewerSize();
    }, 400);
  };

  // Tablet e celular: não carrega o Spline (economia de performance)
  if (isTabletOrBelow()) return;

  start();
})();
