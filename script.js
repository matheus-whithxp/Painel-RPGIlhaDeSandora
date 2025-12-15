let vidaAtual = 100;
let sanidadeAtual = 100;

const vidaBar = document.getElementById("vida-barra");
const sanidadeBar = document.getElementById("sanidade-barra");

const vidaAtualSpan = document.getElementById("vida-atual");
const sanidadeAtualSpan = document.getElementById("sanidade-atual");

const vidaMaxInput = document.getElementById("vida-max-input");
const sanidadeMaxInput = document.getElementById("sanidade-max-input");

const vidaMaisBtn = document.getElementById("vida-mais");
const vidaMenosBtn = document.getElementById("vida-menos");
const sanidadeMaisBtn = document.getElementById("sanidade-mais");
const sanidadeMenosBtn = document.getElementById("sanidade-menos");

function toIntSafe(v, fallback = 0) {
  const n = parseInt(v);
  return isNaN(n) ? fallback : n;
}

function atualizarBarraVisual(atual, max, barraEl, spanEl) {
  const safeMax = Math.max(1, toIntSafe(max, 1));
  const porcent = Math.max(0, Math.min(100, (atual / safeMax) * 100));

  barraEl.style.width = porcent + "%";
  spanEl.innerText = atual;

  const textoEl = barraEl.parentElement.querySelector(".barra-texto");
  const separadorEl = textoEl.querySelector(".separador");

  if (atual === 0) {
    barraEl.classList.remove("critico");
    barraEl.classList.add("zerado");
    textoEl.classList.add("texto-zerado");
    separadorEl.classList.add("separador-zerado");
  } else {
    barraEl.classList.remove("zerado");
    textoEl.classList.remove("texto-zerado");
    separadorEl.classList.remove("separador-zerado");

    if (atual < 5) {
      barraEl.classList.add("critico");
      textoEl.classList.add("critico");
    } else {
      barraEl.classList.remove("critico");
      textoEl.classList.remove("critico");
    }
  }
}

function alterarValor(tipo, delta) {
  if (tipo === "vida") {
    const max = Math.max(1, toIntSafe(vidaMaxInput.value, 100));
    vidaAtual = Math.max(0, Math.min(vidaAtual + delta, max));
    atualizarBarraVisual(vidaAtual, max, vidaBar, vidaAtualSpan);
  } else {
    const max = Math.max(1, toIntSafe(sanidadeMaxInput.value, 100));
    sanidadeAtual = Math.max(0, Math.min(sanidadeAtual + delta, max));
    atualizarBarraVisual(sanidadeAtual, max, sanidadeBar, sanidadeAtualSpan);
  }
  salvarEstado();
}

vidaMaisBtn.addEventListener("click", () => alterarValor("vida", 1));
vidaMenosBtn.addEventListener("click", () => alterarValor("vida", -1));
sanidadeMaisBtn.addEventListener("click", () => alterarValor("sanidade", 1));
sanidadeMenosBtn.addEventListener("click", () => alterarValor("sanidade", -1));

vidaMaxInput.addEventListener("input", () => {
  let max = Math.max(1, toIntSafe(vidaMaxInput.value, 1));
  vidaMaxInput.value = max;
  if (vidaAtual > max) vidaAtual = max;
  atualizarBarraVisual(vidaAtual, max, vidaBar, vidaAtualSpan);
  salvarEstado();
});

sanidadeMaxInput.addEventListener("input", () => {
  let max = Math.max(1, toIntSafe(sanidadeMaxInput.value, 1));
  sanidadeMaxInput.value = max;
  if (sanidadeAtual > max) sanidadeAtual = max;
  atualizarBarraVisual(sanidadeAtual, max, sanidadeBar, sanidadeAtualSpan);
  salvarEstado();
});

/* =========================
   SALVAR / CARREGAR ESTADO
========================= */

function salvarEstado() {
  const estado = {
    vidaAtual,
    vidaMax: vidaMaxInput.value,
    sanidadeAtual,
    sanidadeMax: sanidadeMaxInput.value
  };
  localStorage.setItem("painelRPG", JSON.stringify(estado));
}

function carregarEstado() {
  const salvo = localStorage.getItem("painelRPG");
  if (!salvo) return;

  const estado = JSON.parse(salvo);

  vidaAtual = estado.vidaAtual ?? vidaAtual;
  sanidadeAtual = estado.sanidadeAtual ?? sanidadeAtual;

  vidaMaxInput.value = estado.vidaMax ?? vidaMaxInput.value;
  sanidadeMaxInput.value = estado.sanidadeMax ?? sanidadeMaxInput.value;

  atualizarBarraVisual(
    vidaAtual,
    vidaMaxInput.value,
    vidaBar,
    vidaAtualSpan
  );

  atualizarBarraVisual(
    sanidadeAtual,
    sanidadeMaxInput.value,
    sanidadeBar,
    sanidadeAtualSpan
  );
}

carregarEstado();
