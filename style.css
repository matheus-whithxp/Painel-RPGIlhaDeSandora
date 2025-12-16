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

/* Sons (funcionam PC + mobile) */
const somDano = new Audio("dano_sofrido.mp3");
const somMorte = new Audio("morte.mp3");

let timerVida = null;
let timerSanidade = null;

function toIntSafe(v, fallback = 0) {
  const n = parseInt(v);
  return isNaN(n) ? fallback : n;
}

function vibrar(ms) {
  if ("vibrate" in navigator) {
    navigator.vibrate(ms);
  }
}

function atualizarBarraVisual(atual, max, barraEl, spanEl) {
  const safeMax = Math.max(1, toIntSafe(max, 1));
  const porcent = Math.max(0, Math.min(100, (atual / safeMax) * 100));

  barraEl.style.width = porcent + "%";
  spanEl.innerText = atual;

  const textoEl = barraEl.parentElement.querySelector(".barra-texto");
  const separadorEl = textoEl.querySelector(".separador");

  barraEl.classList.remove("critico", "zerado");
  textoEl.classList.remove("critico", "texto-zerado");
  separadorEl.classList.remove("separador-zerado");

  if (atual === 0) {
    barraEl.classList.add("zerado");
    textoEl.classList.add("texto-zerado");
    separadorEl.classList.add("separador-zerado");
  } else if (atual <= 5) {
    barraEl.classList.add("critico");
    textoEl.classList.add("critico");
  }
}

/* VIDA */
function agendarVida(novo, antes) {
  clearTimeout(timerVida);
  if (novo >= antes) return;

  timerVida = setTimeout(() => {
    if (novo === 0 && antes === 1) {
      somMorte.currentTime = 0;
      somMorte.play();
      vibrar(60);
    } else {
      somDano.currentTime = 0;
      somDano.play();
      vibrar(40);
    }
  }, 1000);
}

/* SANIDADE */
function agendarSanidade(novo, antes) {
  clearTimeout(timerSanidade);
  if (novo >= antes) return;

  timerSanidade = setTimeout(() => {
    vibrar(40);
  }, 1000);
}

function alterarValor(tipo, delta) {
  if (tipo === "vida") {
    const max = Math.max(1, toIntSafe(vidaMaxInput.value, 100));
    const antes = vidaAtual;
    const novo = Math.max(0, Math.min(vidaAtual + delta, max));

    agendarVida(novo, antes);
    vidaAtual = novo;

    atualizarBarraVisual(vidaAtual, max, vidaBar, vidaAtualSpan);
  } else {
    const max = Math.max(1, toIntSafe(sanidadeMaxInput.value, 100));
    const antes = sanidadeAtual;
    const novo = Math.max(0, Math.min(sanidadeAtual + delta, max));

    agendarSanidade(novo, antes);
    sanidadeAtual = novo;

    atualizarBarraVisual(sanidadeAtual, max, sanidadeBar, sanidadeAtualSpan);
  }

  salvarEstado();
}

/* Eventos */
vidaMaisBtn.onclick = () => alterarValor("vida", 1);
vidaMenosBtn.onclick = () => alterarValor("vida", -1);
sanidadeMaisBtn.onclick = () => alterarValor("sanidade", 1);
sanidadeMenosBtn.onclick = () => alterarValor("sanidade", -1);

/* LocalStorage */
function salvarEstado() {
  localStorage.setItem("painelRPG", JSON.stringify({
    vidaAtual,
    vidaMax: vidaMaxInput.value,
    sanidadeAtual,
    sanidadeMax: sanidadeMaxInput.value
  }));
}

function carregarEstado() {
  const salvo = localStorage.getItem("painelRPG");
  if (!salvo) return;

  const e = JSON.parse(salvo);
  vidaAtual = e.vidaAtual ?? vidaAtual;
  sanidadeAtual = e.sanidadeAtual ?? sanidadeAtual;
  vidaMaxInput.value = e.vidaMax ?? vidaMaxInput.value;
  sanidadeMaxInput.value = e.sanidadeMax ?? sanidadeMaxInput.value;

  atualizarBarraVisual(vidaAtual, vidaMaxInput.value, vidaBar, vidaAtualSpan);
  atualizarBarraVisual(sanidadeAtual, sanidadeMaxInput.value, sanidadeBar, sanidadeAtualSpan);
}

carregarEstado();
