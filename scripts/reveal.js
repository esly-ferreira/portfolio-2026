document.addEventListener("DOMContentLoaded", () => {
  const groups = Array.from(document.querySelectorAll(".reveal-group"));
  if (!groups.length) return;

  groups.forEach((group) => {
    const items = Array.from(group.querySelectorAll(".reveal-item")).filter(
      (el) => el.closest(".reveal-group") === group
    );
    items.forEach((item, index) => {
      item.style.setProperty("--i", String(index));
    });
  });

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

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        groups.forEach((group) => io.observe(group));
      });
    });
  };

  waitForPageReady().then(startObserver);
});
