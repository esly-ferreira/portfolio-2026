document.addEventListener("DOMContentLoaded", () => {
  const botoes = document.querySelectorAll(".filtro-btn");
  const cards = document.querySelectorAll("#projetos-grid .projeto-card");
  const vazio = document.querySelector("#projetos-vazio");

  if (!botoes.length || !cards.length) return;

  botoes.forEach((botao) => {
    botao.addEventListener("click", () => {
      const filtro = botao.dataset.filtro;

      botoes.forEach((b) => {
        b.classList.toggle("is-active", b === botao);
        b.setAttribute("aria-selected", b === botao ? "true" : "false");
      });

      let visiveis = 0;

      cards.forEach((card) => {
        const categoria = card.dataset.categoria;
        const mostrar = filtro === "todos" || categoria === filtro;
        card.hidden = !mostrar;
        if (mostrar) visiveis += 1;
      });

      if (vazio) vazio.hidden = visiveis > 0;
    });
  });
});
