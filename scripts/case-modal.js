document.addEventListener("DOMContentLoaded", () => {
  const dialog = document.getElementById("case-modal");
  const body = dialog?.querySelector("[data-case-body]");
  if (!dialog || !body) return;

  let lastTrigger = null;

  const openCase = (id, trigger) => {
    const template = document.getElementById(`case-${id}`);
    if (!template) return;

    lastTrigger = trigger || null;
    body.replaceChildren(template.content.cloneNode(true));
    dialog.showModal();
    dialog.querySelector("[data-case-close]")?.focus();
  };

  const closeCase = () => {
    if (!dialog.open) return;
    dialog.close();
  };

  document.querySelectorAll("[data-case]").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      openCase(trigger.getAttribute("data-case"), trigger);
    });
  });

  dialog.querySelectorAll("[data-case-close]").forEach((btn) => {
    btn.addEventListener("click", closeCase);
  });

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) closeCase();
  });

  dialog.addEventListener("close", () => {
    body.replaceChildren();
    lastTrigger?.focus();
    lastTrigger = null;
  });
});
