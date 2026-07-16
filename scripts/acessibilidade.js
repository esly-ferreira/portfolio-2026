document.addEventListener("DOMContentLoaded", () => {
  const STORAGE_KEY = "portfolio-a11y";
  const defaults = {
    fontSize: "md",
    contrast: false,
    reduceMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  };

  const scales = { sm: 0.9, md: 1, lg: 1.15 };

  const load = () => {
    try {
      return { ...defaults, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") };
    } catch {
      return { ...defaults };
    }
  };

  let state = load();

  const root = document.documentElement;

  const apply = () => {
    root.style.setProperty("--a11y-font-scale", String(scales[state.fontSize] || 1));
    root.classList.toggle("a11y-contrast", Boolean(state.contrast));
    root.classList.toggle("a11y-reduce-motion", Boolean(state.reduceMotion));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    syncUI();
  };

  const widget = document.createElement("div");
  widget.className = "a11y-widget";
  widget.innerHTML = `
    <button
      type="button"
      class="a11y-toggle"
      aria-expanded="false"
      aria-controls="a11y-panel"
      aria-label="Abrir opções de acessibilidade"
    >
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="4.5" r="2.25" fill="currentColor"/>
        <path d="M8.5 9.5h7l-1.2 3.2 1.9 6.3h-2.2l-1.4-4.6h-.2l-1.4 4.6H8.8l1.9-6.3L8.5 9.5Z" fill="currentColor"/>
        <path d="M7 10.25h10" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>
      </svg>
    </button>
    <div class="a11y-panel" id="a11y-panel" role="dialog" aria-label="Acessibilidade" hidden>
      <p class="a11y-panel-title">Acessibilidade</p>

      <div class="a11y-group">
        <span class="a11y-group-label" id="a11y-font-label">Tamanho da fonte</span>
        <div class="a11y-font-options" role="group" aria-labelledby="a11y-font-label">
          <button type="button" class="a11y-font-sm" data-font="sm" aria-pressed="false">A</button>
          <button type="button" class="a11y-font-md" data-font="md" aria-pressed="false">A</button>
          <button type="button" class="a11y-font-lg" data-font="lg" aria-pressed="false">A</button>
        </div>
      </div>

      <div class="a11y-group">
        <button type="button" class="a11y-switch" data-a11y="contrast" aria-pressed="false">
          <span>Alto contraste</span>
          <span class="a11y-switch-track" aria-hidden="true"></span>
        </button>
      </div>

      <div class="a11y-group">
        <button type="button" class="a11y-switch" data-a11y="reduceMotion" aria-pressed="false">
          <span>Reduzir animações</span>
          <span class="a11y-switch-track" aria-hidden="true"></span>
        </button>
      </div>

      <button type="button" class="a11y-reset">Voltar ao padrão</button>
    </div>
  `;

  document.body.appendChild(widget);

  const toggle = widget.querySelector(".a11y-toggle");
  const panel = widget.querySelector("#a11y-panel");
  const fontButtons = widget.querySelectorAll("[data-font]");
  const contrastBtn = widget.querySelector('[data-a11y="contrast"]');
  const motionBtn = widget.querySelector('[data-a11y="reduceMotion"]');
  const resetBtn = widget.querySelector(".a11y-reset");

  const fontLabels = { sm: "Pequeno", md: "Médio", lg: "Grande" };

  function syncUI() {
    fontButtons.forEach((btn) => {
      const active = btn.dataset.font === state.fontSize;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
      btn.setAttribute(
        "aria-label",
        `Fonte ${fontLabels[btn.dataset.font]}${active ? " (ativo)" : ""}`
      );
    });

    contrastBtn.setAttribute("aria-pressed", state.contrast ? "true" : "false");
    motionBtn.setAttribute("aria-pressed", state.reduceMotion ? "true" : "false");
  }

  const setOpen = (open) => {
    panel.hidden = !open;
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute(
      "aria-label",
      open ? "Fechar opções de acessibilidade" : "Abrir opções de acessibilidade"
    );
  };

  toggle.addEventListener("click", () => {
    setOpen(panel.hidden);
  });

  fontButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      state.fontSize = btn.dataset.font;
      apply();
    });
  });

  contrastBtn.addEventListener("click", () => {
    state.contrast = !state.contrast;
    apply();
  });

  motionBtn.addEventListener("click", () => {
    state.reduceMotion = !state.reduceMotion;
    apply();
  });

  resetBtn.addEventListener("click", () => {
    state = {
      fontSize: "md",
      contrast: false,
      reduceMotion: false,
    };
    apply();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !panel.hidden) {
      setOpen(false);
      toggle.focus();
    }
  });

  document.addEventListener("pointerdown", (event) => {
    if (!panel.hidden && !widget.contains(event.target)) {
      setOpen(false);
    }
  });

  apply();
});
