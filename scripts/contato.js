document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#contato-form");
  if (!form) return;

  const status = form.querySelector(".form-status");

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const data = new FormData(form);
    const nome = String(data.get("nome") || "").trim();
    const email = String(data.get("email") || "").trim();
    const mensagem = String(data.get("mensagem") || "").trim();

    if (!nome || !email || !mensagem) {
      if (status) status.textContent = "Preencha todos os campos para continuar.";
      return;
    }

    const subject = encodeURIComponent(`Contato portfolio — ${nome}`);
    const body = encodeURIComponent(`${mensagem}\n\n— ${nome}\n${email}`);
    window.location.href = `mailto:esly@example.com?subject=${subject}&body=${body}`;

    if (status) {
      status.textContent = "Abrindo seu cliente de e-mail…";
    }
  });
});
