/* =========================
   ESTADO
========================= */

let vidaAtual = 100;
let vidaMax = 100;

let sanidadeAtual = 100;
let sanidadeMax = 100;

/* timers de inatividade */
let vidaFeedbackTimer = null;
let sanidadeFeedbackTimer = null;

/* =========================
   ELEMENTOS
========================= */

const vidaBarra = document.getElementById("vida-barra");
const vidaAtualSpan = document.getElementById("vida-atual");
const vidaMaxInput = document.getElementById("vida-max-input");

const sanidadeBarra = document.getElementById("sanidade-barra");
const sanidadeAtualSpan = document.getElementById("sanidade-atual");
const sanidadeMaxInput = document.getElementById("sanidade-max-input");

/* botões */
const vidaMais = document.getElementById("vida-mais");
const vidaMenos = document.getElementById("vida-menos");

const sanidadeMais = document.getElementById("sanidade-mais");
const sanidadeMenos = document.getElementById("sanidade-menos");

/* =========================
   FEEDBACK (som / vibração)
========================= */

function feedbackDano() {
  // vibração (mobile)
  if (navigator.vibrate) {
    navigator.vibrate(40);
  }

  // som (se quiser ativar depois)
  // const audio = new Audio("dano.mp3");
  // audio.volume = 0.4;
  // audio.play();
}

/* =========================
   DEBOUNCE DE FEEDBACK
========================= */

function agendarFeedbackVida() {
  if (vidaFeedbackTimer) {
    clearTimeout(vidaFeedbackTimer);
  }

  vidaFeedbackTimer = setTimeout(() => {
    feedbackDano();
    vidaFeedbackTimer = null;
  }, 2000);
}

function agendarFeedbackSanidade() {
  if (sanidadeFeedbackTimer) {
    clearTimeout(sanidadeFeedbackTimer);
  }

  sanidadeFeedbackTimer = setTimeout(() => {
    feedbackDano();
    sanidadeFeedbackTimer = null;
  }, 2000);
}

/* =========================
   ATUALIZAÇÕES VISUAIS
========================= */

function atualizarVida() {
  vidaAtual = Math.max(0, Math.min(vidaAtual, vidaMax));
  const porcentagem = (vidaAtual / vidaMax) * 100;

  vidaBarra.style.width = `${porcentagem}%`;
  vidaAtualSpan.textContent = vidaAtual;

  vidaBarra.classList.remove("critico", "zerado");
  vidaAtualSpan.classList.remove("texto-zerado");

  if (vidaAtual === 0) {
    vidaBarra.classList.add("zerado");
    vidaAtualSpan.classList.add("texto-zerado");
  } else if (porcentagem <= 25) {
    vidaBarra.classList.add("critico");
  }
}

function atualizarSanidade() {
  sanidadeAtual = Math.max(0, Math.min(sanidadeAtual, sanidadeMax));
  const porcentagem = (sanidadeAtual / sanidadeMax) * 100;

  sanidadeBarra.style.width = `${porcentagem}%`;
  sanidadeAtualSpan.textContent = sanidadeAtual;

  sanidadeBarra.classList.remove("critico", "zerado");
  sanidadeAtualSpan.classList.remove("texto-zerado");

  if (sanidadeAtual === 0) {
    sanidadeBarra.classList.add("zerado");
    sanidadeAtualSpan.classList.add("texto-zerado");
  } else if (porcentagem <= 25) {
    sanidadeBarra.classList.add("critico");
  }
}

/* =========================
   EVENTOS — VIDA
========================= */

vidaMais.addEventListener("click", () => {
  vidaAtual++;
  atualizarVida();
});

vidaMenos.addEventListener("click", () => {
  vidaAtual--;
  atualizarVida();
  agendarFeedbackVida();
});

vidaMaxInput.addEventListener("change", () => {
  vidaMax = Math.max(1, Number(vidaMaxInput.value));
  vidaAtual = Math.min(vidaAtual, vidaMax);
  atualizarVida();
});

/* =========================
   EVENTOS — SANIDADE
========================= */

sanidadeMais.addEventListener("click", () => {
  sanidadeAtual++;
  atualizarSanidade();
});

sanidadeMenos.addEventListener("click", () => {
  sanidadeAtual--;
  atualizarSanidade();
  agendarFeedbackSanidade();
});

sanidadeMaxInput.addEventListener("change", () => {
  sanidadeMax = Math.max(1, Number(sanidadeMaxInput.value));
  sanidadeAtual = Math.min(sanidadeAtual, sanidadeMax);
  atualizarSanidade();
});

/* =========================
   INIT
========================= */

atualizarVida();
atualizarSanidade();
