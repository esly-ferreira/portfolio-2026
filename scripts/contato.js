document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#contato-form");
  if (!form) return;

  const status = form.querySelector(".form-status");
  const submitBtn = form.querySelector('button[type="submit"]');
  const telefoneInput = form.querySelector("#telefone");
  const honeypotInput = form.querySelector("#contato-website");

  const FORM_LOADED_AT = Date.now();
  const MIN_SUBMIT_MS = 3000;
  const RATE_LIMIT_MS = 60_000;
  const RATE_LIMIT_KEY = "portfolio-contato-last-submit";
  const CONTACT_EMAIL = ["eslyferreira8990", "gmail.com"].join("@");
  const FORMSUBMIT_ENDPOINT = `https://formsubmit.co/ajax/${encodeURIComponent(CONTACT_EMAIL)}`;

  const onlyDigits = (value) => String(value || "").replace(/\D/g, "").slice(0, 11);

  const formatPhone = (value) => {
    const digits = onlyDigits(value);
    const len = digits.length;

    if (len === 0) return "";
    if (len < 3) return `(${digits}`;
    if (len < 8) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  const setStatus = (message) => {
    if (status) status.textContent = message;
  };

  const setSubmitting = (isSubmitting) => {
    if (!submitBtn) return;
    submitBtn.disabled = isSubmitting;
    submitBtn.setAttribute("aria-busy", String(isSubmitting));
  };

  const looksLikeSpam = ({ nome, email, mensagem }) => {
    const blob = `${nome} ${email} ${mensagem}`.toLowerCase();
    const urlCount = (mensagem.match(/https?:\/\/|www\./gi) || []).length;

    if (urlCount > 3) return true;

    const spamTerms = [
      "viagra",
      "casino",
      "lottery",
      "crypto pump",
      "seo service",
      "backlink",
    ];

    return spamTerms.some((term) => blob.includes(term));
  };

  const fakeSuccess = () => {
    setStatus("Mensagem enviada! Retorno em breve.");
    form.reset();
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

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const honeypot = String(honeypotInput?.value || "").trim();
    if (honeypot) {
      fakeSuccess();
      return;
    }

    if (Date.now() - FORM_LOADED_AT < MIN_SUBMIT_MS) {
      setStatus("Aguarde alguns segundos antes de enviar.");
      return;
    }

    const lastSubmit = Number(sessionStorage.getItem(RATE_LIMIT_KEY) || 0);
    if (lastSubmit && Date.now() - lastSubmit < RATE_LIMIT_MS) {
      setStatus("Aguarde um momento antes de enviar outra mensagem.");
      return;
    }

    const data = new FormData(form);
    const nome = String(data.get("nome") || "").trim();
    const email = String(data.get("email") || "").trim();
    const telefone = String(data.get("telefone") || "").trim();
    const mensagem = String(data.get("mensagem") || "").trim();
    const telefoneDigits = onlyDigits(telefone);

    if (!nome || !email || !telefone || !mensagem) {
      setStatus("Preencha todos os campos para continuar.");
      return;
    }

    if (nome.length < 2 || nome.length > 80) {
      setStatus("Informe um nome válido.");
      return;
    }

    if (mensagem.length < 10 || mensagem.length > 2000) {
      setStatus("A mensagem deve ter entre 10 e 2000 caracteres.");
      return;
    }

    if (telefoneDigits.length !== 11) {
      setStatus("Informe um telefone válido no formato (00) 00000-0000.");
      telefoneInput?.focus();
      return;
    }

    if (looksLikeSpam({ nome, email, mensagem })) {
      fakeSuccess();
      return;
    }

    setSubmitting(true);
    setStatus("Enviando mensagem…");

    try {
      const response = await fetch(FORMSUBMIT_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: nome,
          email,
          phone: telefone,
          message: mensagem,
          _subject: `Contato portfólio — ${nome}`,
          _template: "table",
          _captcha: "false",
        }),
      });

      if (!response.ok) {
        throw new Error("submit_failed");
      }

      sessionStorage.setItem(RATE_LIMIT_KEY, String(Date.now()));
      setStatus("Mensagem enviada! Retorno em breve.");
      form.reset();
    } catch {
      setStatus("Não foi possível enviar agora. Tente pelo WhatsApp.");
    } finally {
      setSubmitting(false);
    }
  });
});
