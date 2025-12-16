/* =========================
   Configurações / estado
========================= */

const VIB_DANO = 120;
const VIB_SANIDADE = 120;
const VIB_MORTE = 250;

const somDano = new Audio("dano_sofrido.mp3");
somDano.volume = 0.4;

let vidaAtual = 100;
let sanidadeAtual = 100;

/* timers debounce (1s) */
let timerVida = null;
let timerSanidade = null;

/* hold (segurar) trackers — por botão id */
const holdTimeouts = {};
const holdIntervals = {};

/* =========================
   DOM
========================= */

const vidaBarInner = document.getElementById("vida-barra");
const sanidadeBarInner = document.getElementById("sanidade-barra");

const vidaAtualSpan = document.getElementById("vida-atual");
const sanidadeAtualSpan = document.getElementById("sanidade-atual");

const vidaMaxInput = document.getElementById("vida-max-input");
const sanidadeMaxInput = document.getElementById("sanidade-max-input");

const vidaMaisBtn = document.getElementById("vida-mais");
const vidaMenosBtn = document.getElementById("vida-menos");
const sanidadeMaisBtn = document.getElementById("sanidade-mais");
const sanidadeMenosBtn = document.getElementById("sanidade-menos");

/* container (barra-externa) - para interação por toque/arraste */
const vidaContainer = vidaBarInner.parentElement;
const sanidadeContainer = sanidadeBarInner.parentElement;

/* =========================
   Utils
========================= */

function toIntSafe(v, fallback = 0) {
  const n = parseInt(v);
  return isNaN(n) ? fallback : n;
}

function salvarEstado() {
  const estado = {
    vidaAtual: Number(vidaAtual),
    vidaMax: Number(toIntSafe(vidaMaxInput.value, 100)),
    sanidadeAtual: Number(sanidadeAtual),
    sanidadeMax: Number(toIntSafe(sanidadeMaxInput.value, 100))
  };
  localStorage.setItem("painelRPG", JSON.stringify(estado));
}

function tentarVibrar(ms) {
  if ("vibrate" in navigator) {
    try { navigator.vibrate(ms); } catch (e) { /* ignore */ }
  }
}

/* =========================
   Atualização visual (regras estritas)
   - crítico: apenas quando atual <= 5 && > 0
   - zerado: quando 0
========================= */

function atualizarBarraVisual(atual, max, barraInnerEl, spanEl) {
  const safeMax = Math.max(1, toIntSafe(max, 1));
  const porcent = Math.max(0, Math.min(100, (atual / safeMax) * 100));

  barraInnerEl.style.width = porcent + "%";
  spanEl.innerText = atual;

  const textoEl = barraInnerEl.parentElement.querySelector(".barra-texto");
  const separadorEl = textoEl.querySelector(".separador");

  barraInnerEl.classList.remove("critico", "zerado");
  textoEl.classList.remove("critico", "texto-zerado");
  separadorEl.classList.remove("separador-zerado");

  if (atual === 0) {
    barraInnerEl.classList.add("zerado");
    textoEl.classList.add("texto-zerado");
    separadorEl.classList.add("separador-zerado");
  } else if (atual <= 5 && atual > 0) {
    barraInnerEl.classList.add("critico");
    textoEl.classList.add("critico");
  }
}

/* =========================
   Debounce pós-clique (1s)
   - vida: som + vibração (ou vibração forte se 1->0)
   - sanidade: vibração
========================= */

function agendarVida(novo, antes) {
  clearTimeout(timerVida);
  if (novo >= antes) return;
  timerVida = setTimeout(() => {
    if (antes === 1 && novo === 0) {
      // morte: sem som, vibração mais forte
      tentarVibrar(VIB_MORTE);
    } else {
      // dano normal: som + vibração
      somDano.currentTime = 0;
      somDano.play().catch(()=>{});
      tentarVibrar(VIB_DANO);
    }
    timerVida = null;
  }, 1000);
}

function agendarSanidade(novo, antes) {
  clearTimeout(timerSanidade);
  if (novo >= antes) return;
  timerSanidade = setTimeout(() => {
    tentarVibrar(VIB_SANIDADE);
    timerSanidade = null;
  }, 1000);
}

/* =========================
   Alterar valor (1 em 1 ou via drag)
   - mantém regras, salva estado
========================= */

function alterarValor(tipo, delta) {
  if (tipo === "vida") {
    const max = Math.max(1, toIntSafe(vidaMaxInput.value, 100));
    const antes = vidaAtual;
    const novo = Math.max(0, Math.min(vidaAtual + delta, max));
    if (novo !== antes) agendarVida(novo, antes);
    vidaAtual = novo;
    atualizarBarraVisual(vidaAtual, max, vidaBarInner, vidaAtualSpan);
  } else {
    const max = Math.max(1, toIntSafe(sanidadeMaxInput.value, 100));
    const antes = sanidadeAtual;
    const novo = Math.max(0, Math.min(sanidadeAtual + delta, max));
    if (novo !== antes) agendarSanidade(novo, antes);
    sanidadeAtual = novo;
    atualizarBarraVisual(sanidadeAtual, max, sanidadeBarInner, sanidadeAtualSpan);
  }
  salvarEstado();
}

/* =========================
   Hold (segurar botão) — usa pointer events
   - after 300ms starts repeating every 120ms
========================= */

function startHold(buttonId, tipo, delta) {
  stopHold(buttonId);
  holdTimeouts[buttonId] = setTimeout(() => {
    holdIntervals[buttonId] = setInterval(() => {
      alterarValor(tipo, delta);
    }, 120);
  }, 300);
}

function stopHold(buttonId) {
  if (holdTimeouts[buttonId]) {
    clearTimeout(holdTimeouts[buttonId]);
    holdTimeouts[buttonId] = null;
  }
  if (holdIntervals[buttonId]) {
    clearInterval(holdIntervals[buttonId]);
    holdIntervals[buttonId] = null;
  }
}

/* bind botão com pointer events e click */
function bindButton(el, buttonId, tipo, delta) {
  el.addEventListener("pointerdown", (e) => {
    // keep focus behavior but start hold
    startHold(buttonId, tipo, delta);
  });
  el.addEventListener("pointerup", (e) => stopHold(buttonId));
  el.addEventListener("pointercancel", () => stopHold(buttonId));
  el.addEventListener("pointerleave", () => stopHold(buttonId));
  el.addEventListener("click", (e) => {
    // click altera 1 em 1
    alterarValor(tipo, delta);
  });
}

/* =========================
   Interação direta na barra (click / drag)
   - pointerdown -> set value (and capture)
   - pointermove (while captured) -> update value
   - pointerup -> release
========================= */

function setupBarDrag(containerEl, tipo) {
  let activePointerId = null;

  function calcularValorLocal(clientX, max) {
    const rect = containerEl.getBoundingClientRect();
    let x = clientX - rect.left;
    if (x < 0) x = 0;
    if (x > rect.width) x = rect.width;
    const pct = x / rect.width;
    // map to 0..max (inteiro)
    return Math.round(pct * max);
  }

  containerEl.addEventListener("pointerdown", (e) => {
    // iniciando arraste/ajuste
    activePointerId = e.pointerId;
    containerEl.setPointerCapture(activePointerId);

    if (tipo === "vida") {
      const max = Math.max(1, toIntSafe(vidaMaxInput.value, 100));
      const novo = calcularValorLocal(e.clientX, max);
      const antes = vidaAtual;
      if (novo !== antes) agendarVida(novo, antes);
      vidaAtual = novo;
      atualizarBarraVisual(vidaAtual, max, vidaBarInner, vidaAtualSpan);
      salvarEstado();
    } else {
      const max = Math.max(1, toIntSafe(sanidadeMaxInput.value, 100));
      const novo = calcularValorLocal(e.clientX, max);
      const antes = sanidadeAtual;
      if (novo !== antes) agendarSanidade(novo, antes);
      sanidadeAtual = novo;
      atualizarBarraVisual(sanidadeAtual, max, sanidadeBarInner, sanidadeAtualSpan);
      salvarEstado();
    }
  });

  containerEl.addEventListener("pointermove", (e) => {
    if (activePointerId !== e.pointerId) return;
    if (tipo === "vida") {
      const max = Math.max(1, toIntSafe(vidaMaxInput.value, 100));
      const novo = calcularValorLocal(e.clientX, max);
      const antes = vidaAtual;
      if (novo !== antes) agendarVida(novo, antes);
      vidaAtual = novo;
      atualizarBarraVisual(vidaAtual, max, vidaBarInner, vidaAtualSpan);
      salvarEstado();
    } else {
      const max = Math.max(1, toIntSafe(sanidadeMaxInput.value, 100));
      const novo = calcularValorLocal(e.clientX, max);
      const antes = sanidadeAtual;
      if (novo !== antes) agendarSanidade(novo, antes);
      sanidadeAtual = novo;
      atualizarBarraVisual(sanidadeAtual, max, sanidadeBarInner, sanidadeAtualSpan);
      salvarEstado();
    }
  });

  function release(e) {
    if (activePointerId !== e.pointerId) return;
    try { containerEl.releasePointerCapture(activePointerId); } catch (err) {}
    activePointerId = null;
  }

  containerEl.addEventListener("pointerup", release);
  containerEl.addEventListener("pointercancel", release);
}

/* =========================
   Eventos e binds
========================= */

bindButton(vidaMaisBtn, "vida-mais", "vida", 1);
bindButton(vidaMenosBtn, "vida-menos", "vida", -1);
bindButton(sanidadeMaisBtn, "sanidade-mais", "sanidade", 1);
bindButton(sanidadeMenosBtn, "sanidade-menos", "sanidade", -1);

setupBarDrag(vidaContainer, "vida");
setupBarDrag(sanidadeContainer, "sanidade");

/* max inputs */
vidaMaxInput.addEventListener("input", () => {
  const novoMax = Math.max(1, toIntSafe(vidaMaxInput.value, 1));
  vidaMaxInput.value = novoMax;
  if (vidaAtual > novoMax) vidaAtual = novoMax;
  atualizarBarraVisual(vidaAtual, novoMax, vidaBarInner, vidaAtualSpan);
  salvarEstado();
});

sanidadeMaxInput.addEventListener("input", () => {
  const novoMax = Math.max(1, toIntSafe(sanidadeMaxInput.value, 1));
  sanidadeMaxInput.value = novoMax;
  if (sanidadeAtual > novoMax) sanidadeAtual = novoMax;
  atualizarBarraVisual(sanidadeAtual, novoMax, sanidadeBarInner, sanidadeAtualSpan);
  salvarEstado();
});

/* =========================
   LocalStorage
========================= */

function carregarEstado() {
  const salvo = localStorage.getItem("painelRPG");
  if (!salvo) {
    atualizarBarraVisual(vidaAtual, toIntSafe(vidaMaxInput.value, 100), vidaBarInner, vidaAtualSpan);
    atualizarBarraVisual(sanidadeAtual, toIntSafe(sanidadeMaxInput.value, 100), sanidadeBarInner, sanidadeAtualSpan);
    return;
  }
  try {
    const e = JSON.parse(salvo);
    vidaAtual = Number(e.vidaAtual ?? vidaAtual);
    sanidadeAtual = Number(e.sanidadeAtual ?? sanidadeAtual);

    vidaMaxInput.value = Number(e.vidaMax ?? toIntSafe(vidaMaxInput.value, 100));
    sanidadeMaxInput.value = Number(e.sanidadeMax ?? toIntSafe(sanidadeMaxInput.value, 100));

    atualizarBarraVisual(vidaAtual, vidaMaxInput.value, vidaBarInner, vidaAtualSpan);
    atualizarBarraVisual(sanidadeAtual, sanidadeMaxInput.value, sanidadeBarInner, sanidadeAtualSpan);
  } catch (err) {
    console.error("Erro ao carregar estado:", err);
  }
}

carregarEstado();
