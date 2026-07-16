document.addEventListener("DOMContentLoaded", () => {
  const groups = document.querySelectorAll(".reveal-group");
  if (!groups.length) return;

  const reduceMotion =
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    document.documentElement.classList.contains("a11y-reduce-motion");

  if (reduceMotion || !("IntersectionObserver" in window)) {
    groups.forEach((group) => group.classList.add("is-inview"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-inview");
        obs.unobserve(entry.target);
      });
    },
    {
      root: null,
      threshold: 0.12,
      rootMargin: "0px 0px -8% 0px",
    }
  );

  groups.forEach((group) => observer.observe(group));
});
