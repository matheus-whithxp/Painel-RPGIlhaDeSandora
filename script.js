const somDano = new Audio("dano_sofrido.mp3");
somDano.volume = 0.4;

const VIB_DANO = 120;
const VIB_SANIDADE = 120;
const VIB_MORTE = 250;

let vidaAtual = 100;
let sanidadeAtual = 100;

let timerVida = null;
let timerSanidade = null;

let holdTimeout = null;
let holdInterval = null;

/* ======================== */

function vibrar(ms) {
  if ("vibrate" in navigator) navigator.vibrate(ms);
}

function atualizar(atual, max, barra, texto) {
  const porcent = Math.max(0, Math.min(100, (atual / max) * 100));
  barra.style.width = porcent + "%";
  texto.innerText = atual;

  barra.classList.remove("critico", "zerado");
  texto.parentElement.classList.remove("critico", "texto-zerado");

  if (atual === 0) {
    barra.classList.add("zerado");
    texto.parentElement.classList.add("texto-zerado");
  } else if (atual <= 5) {
    barra.classList.add("critico");
    texto.parentElement.classList.add("critico");
  }
}

/* ======================== */

function agendarVida(novo, antes) {
  clearTimeout(timerVida);
  if (novo >= antes) return;

  timerVida = setTimeout(() => {
    if (antes === 1 && novo === 0) {
      vibrar(VIB_MORTE);
    } else {
      somDano.currentTime = 0;
      somDano.play().catch(()=>{});
      vibrar(VIB_DANO);
    }
  }, 1000);
}

function agendarSanidade(novo, antes) {
  clearTimeout(timerSanidade);
  if (novo >= antes) return;

  timerSanidade = setTimeout(() => vibrar(VIB_SANIDADE), 1000);
}

/* ======================== */

function alterar(tipo, delta) {
  if (tipo === "vida") {
    const max = +vidaMaxInput.value;
    const antes = vidaAtual;
    vidaAtual = Math.max(0, Math.min(vidaAtual + delta, max));
    agendarVida(vidaAtual, antes);
    atualizar(vidaAtual, max, vidaBarra, vidaAtualSpan);
  } else {
    const max = +sanidadeMaxInput.value;
    const antes = sanidadeAtual;
    sanidadeAtual = Math.max(0, Math.min(sanidadeAtual + delta, max));
    agendarSanidade(sanidadeAtual, antes);
    atualizar(sanidadeAtual, max, sanidadeBarra, sanidadeAtualSpan);
  }
  salvar();
}

/* ======================== */
/* SEGURAR BOTÃO */

function iniciarHold(tipo, delta) {
  holdTimeout = setTimeout(() => {
    holdInterval = setInterval(() => alterar(tipo, delta), 120);
  }, 300);
}

function pararHold() {
  clearTimeout(holdTimeout);
  clearInterval(holdInterval);
}

/* ======================== */
/* DOM */

const vidaBarra = document.getElementById("vida-barra");
const sanidadeBarra = document.getElementById("sanidade-barra");
const vidaAtualSpan = document.getElementById("vida-atual");
const sanidadeAtualSpan = document.getElementById("sanidade-atual");
const vidaMaxInput = document.getElementById("vida-max-input");
const sanidadeMaxInput = document.getElementById("sanidade-max-input");

function bind(botao, tipo, delta) {
  botao.addEventListener("mousedown", () => iniciarHold(tipo, delta));
  botao.addEventListener("touchstart", () => iniciarHold(tipo, delta));
  botao.addEventListener("mouseup", pararHold);
  botao.addEventListener("mouseleave", pararHold);
  botao.addEventListener("touchend", pararHold);
  botao.addEventListener("click", () => alterar(tipo, delta));
}

bind(document.getElementById("vida-menos"), "vida", -1);
bind(document.getElementById("vida-mais"), "vida", 1);
bind(document.getElementById("sanidade-menos"), "sanidade", -1);
bind(document.getElementById("sanidade-mais"), "sanidade", 1);

/* ======================== */
/* STORAGE */

function salvar() {
  localStorage.setItem("painelRPG", JSON.stringify({
    vidaAtual, sanidadeAtual,
    vidaMax: vidaMaxInput.value,
    sanidadeMax: sanidadeMaxInput.value
  }));
}

function carregar() {
  const s = JSON.parse(localStorage.getItem("painelRPG"));
  if (!s) return;
  vidaAtual = s.vidaAtual;
  sanidadeAtual = s.sanidadeAtual;
  vidaMaxInput.value = s.vidaMax;
  sanidadeMaxInput.value = s.sanidadeMax;
}

carregar();
atualizar(vidaAtual, vidaMaxInput.value, vidaBarra, vidaAtualSpan);
atualizar(sanidadeAtual, sanidadeMaxInput.value, sanidadeBarra, sanidadeAtualSpan);
