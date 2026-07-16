document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".header");
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector("#menu-principal");
  const backdrop = document.querySelector(".menu-backdrop");

  if (!header || !toggle || !nav) return;

  const links = nav.querySelectorAll("a");

  const setOpen = (open) => {
    header.classList.toggle("is-open", open);
    document.body.classList.toggle("menu-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    if (backdrop) backdrop.setAttribute("aria-hidden", open ? "false" : "true");
  };

  const close = () => setOpen(false);
  const open = () => setOpen(true);
  const toggleMenu = () => {
    if (header.classList.contains("is-open")) close();
    else open();
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
});
