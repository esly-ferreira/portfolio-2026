document.addEventListener("DOMContentLoaded", () => {
  const magnet = document.querySelector(".hero-pill-magnet");
  if (!magnet) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(pointer: fine)");

  const radius = 110;
  const strength = 0.32;
  let active = false;

  const reset = () => {
    active = false;
    magnet.classList.remove("is-magnetic");
    magnet.style.transform = "translate3d(0, 0, 0)";
  };

  const onMove = (event) => {
    if (reduceMotion.matches || !finePointer.matches) return;

    const rect = magnet.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = event.clientX - cx;
    const dy = event.clientY - cy;
    const distance = Math.hypot(dx, dy);

    if (distance < radius) {
      if (!active) {
        active = true;
        magnet.classList.add("is-magnetic");
      }
      const pull = 1 - distance / radius;
      const x = dx * strength * pull;
      const y = dy * strength * pull;
      magnet.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
      return;
    }

    if (active) reset();
  };

  window.addEventListener("pointermove", onMove, { passive: true });
  window.addEventListener("blur", reset);
  document.addEventListener("mouseleave", reset);

  reduceMotion.addEventListener("change", () => {
    if (reduceMotion.matches) reset();
  });
});
