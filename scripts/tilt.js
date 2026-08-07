document.addEventListener("DOMContentLoaded", () => {
  if (typeof window.VanillaTilt === "undefined") return;

  const root = document.documentElement;
  const elements = Array.from(document.querySelectorAll("[data-tilt]"));
  if (!elements.length) return;

  const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const fineHoverQuery = window.matchMedia("(hover: hover) and (pointer: fine)");

  const isEnabled = () =>
    fineHoverQuery.matches &&
    !reduceMotionQuery.matches &&
    !root.classList.contains("a11y-reduce-motion");

  const enable = (el) => {
    if (el.vanillaTilt) return;
    window.VanillaTilt.init(el);
  };

  const disable = (el) => {
    if (el.vanillaTilt) {
      el.vanillaTilt.destroy();
    }
    // sem isso, um novo brilho é empilhado a cada reativação
    el.querySelectorAll(":scope > .js-tilt-glare").forEach((glare) => glare.remove());
    el.style.transform = "";
    el.style.transition = "";
    el.style.willChange = "";
  };

  const sync = () => {
    const enabled = isEnabled();
    elements.forEach((el) => (enabled ? enable(el) : disable(el)));
  };

  sync();

  reduceMotionQuery.addEventListener("change", sync);
  fineHoverQuery.addEventListener("change", sync);
  new MutationObserver(sync).observe(root, { attributeFilter: ["class"] });
});
