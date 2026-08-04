document.addEventListener("DOMContentLoaded", () => {
  const root = document.querySelector("[data-fab]");
  if (!root) return;

  const trigger = root.querySelector(".fab-trigger");
  const panel = root.querySelector(".fab-panel");
  if (!trigger || !panel) return;

  const actions = Array.from(panel.querySelectorAll(".fab-action"));
  actions.forEach((action, index) => {
    action.style.setProperty("--i", String(index));
  });

  const setOpen = (open) => {
    root.classList.toggle("is-open", open);
    trigger.setAttribute("aria-expanded", open ? "true" : "false");
    panel.setAttribute("aria-hidden", open ? "false" : "true");
    trigger.setAttribute(
      "aria-label",
      open ? "Fechar opções de contato" : "Abrir opções de contato"
    );
  };

  setOpen(false);

  trigger.addEventListener("click", (event) => {
    event.stopPropagation();
    setOpen(!root.classList.contains("is-open"));
  });

  document.addEventListener("click", (event) => {
    if (!root.classList.contains("is-open")) return;
    if (root.contains(event.target)) return;
    setOpen(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (!root.classList.contains("is-open")) return;
    setOpen(false);
    trigger.focus();
  });

  panel.addEventListener("click", (event) => {
    const link = event.target.closest("a.fab-action");
    if (!link) return;
    setOpen(false);
  });
});
