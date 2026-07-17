document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#contato-form");
  if (!form) return;

  const status = form.querySelector(".form-status");
  const telefoneInput = form.querySelector("#telefone");

  const onlyDigits = (value) => String(value || "").replace(/\D/g, "").slice(0, 11);

  const formatPhone = (value) => {
    const digits = onlyDigits(value);
    const len = digits.length;

    if (len === 0) return "";
    if (len < 3) return `(${digits}`;
    if (len < 8) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  if (telefoneInput) {
    telefoneInput.addEventListener("input", () => {
      telefoneInput.value = formatPhone(telefoneInput.value);
    });

    telefoneInput.addEventListener("paste", (event) => {
      event.preventDefault();
      const pasted = event.clipboardData?.getData("text") || "";
      telefoneInput.value = formatPhone(pasted);
    });
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const data = new FormData(form);
    const nome = String(data.get("nome") || "").trim();
    const email = String(data.get("email") || "").trim();
    const telefone = String(data.get("telefone") || "").trim();
    const mensagem = String(data.get("mensagem") || "").trim();
    const telefoneDigits = onlyDigits(telefone);

    if (!nome || !email || !telefone || !mensagem) {
      if (status) status.textContent = "Preencha todos os campos para continuar.";
      return;
    }

    if (telefoneDigits.length !== 11) {
      if (status) {
        status.textContent = "Informe um telefone válido no formato (00) 00000-0000.";
      }
      telefoneInput?.focus();
      return;
    }

    const subject = encodeURIComponent(`Contato portfolio — ${nome}`);
    const body = encodeURIComponent(
      `${mensagem}\n\n— ${nome}\n${email}\n${telefone}`
    );
    window.location.href = `mailto:esly@example.com?subject=${subject}&body=${body}`;

    if (status) {
      status.textContent = "Abrindo seu cliente de e-mail…";
    }
  });
});
