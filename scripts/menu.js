document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".header");
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector("#menu-principal");
  const backdrop = document.querySelector(".menu-backdrop");

  if (!header || !toggle || !nav) return;

  const links = nav.querySelectorAll("a");
  const HIDE_AFTER = 120;
  const DELTA = 12;
  let lastY = window.scrollY || document.documentElement.scrollTop || 0;
  let hidden = false;

  const setOpen = (open) => {
    header.classList.toggle("is-open", open);
    document.body.classList.toggle("menu-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    if (backdrop) backdrop.setAttribute("aria-hidden", open ? "false" : "true");
    if (open) {
      hidden = false;
      header.classList.remove("is-hidden");
    }
  };

  const close = () => setOpen(false);
  const open = () => setOpen(true);
  const toggleMenu = () => {
    if (header.classList.contains("is-open")) close();
    else open();
  };

  const updateHeaderVisibility = () => {
    const y = window.scrollY || document.documentElement.scrollTop || 0;
    const delta = y - lastY;

    if (header.classList.contains("is-open")) {
      hidden = false;
    } else if (y <= HIDE_AFTER) {
      hidden = false;
    } else if (delta > DELTA) {
      hidden = true;
    } else if (delta < -DELTA) {
      hidden = false;
    }

    header.classList.toggle("is-hidden", hidden);
    lastY = y;
  };

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      updateHeaderVisibility();
      ticking = false;
    });
  };

  toggle.addEventListener("click", toggleMenu);

  if (backdrop) {
    backdrop.addEventListener("click", close);
  }

  links.forEach((link) => {
    link.addEventListener("click", close);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") close();
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 900) close();
  });

  window.addEventListener("scroll", onScroll, { passive: true });
  updateHeaderVisibility();
});
