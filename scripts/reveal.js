document.addEventListener("DOMContentLoaded", () => {
  const groups = Array.from(document.querySelectorAll(".reveal-group"));
  if (!groups.length) return;

  const reduceMotion = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    document.documentElement.classList.contains("a11y-reduce-motion");

  const showAll = () => {
    groups.forEach((group) => group.classList.add("is-inview"));
  };

  const waitForPageReady = () =>
    new Promise((resolve) => {
      if (document.body.classList.contains("is-ready")) {
        resolve();
        return;
      }

      // Sem loader nesta página
      if (!document.getElementById("page-loader")) {
        document.body.classList.add("is-ready");
        resolve();
        return;
      }

      const observer = new MutationObserver(() => {
        if (document.body.classList.contains("is-ready")) {
          observer.disconnect();
          resolve();
        }
      });

      observer.observe(document.body, {
        attributes: true,
        attributeFilter: ["class"],
      });
    });

  const startObserver = () => {
    if (reduceMotion() || !("IntersectionObserver" in window)) {
      showAll();
      return;
    }

    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-inview");
          obs.unobserve(entry.target);
        });
      },
      {
        root: null,
        threshold: 0.08,
        rootMargin: "0px 0px -6% 0px",
      }
    );

    // Garante um frame com opacity:0 antes de observar (evita “pulo” sem transição)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        groups.forEach((group) => io.observe(group));
      });
    });
  };

  waitForPageReady().then(startObserver);
});
