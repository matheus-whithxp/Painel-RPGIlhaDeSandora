/* =========================
   Configurações / estado
========================= */

// vibração (ms)
const VIB_DANO = 120;   // mais forte para mobile quando dano
const VIB_MORTE = 250;  // vibração mais longa na morte (1->0)
const VIB_SANIDADE = 120;

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

/* som (apenas dano de vida) */
const somDano = new Audio("dano_sofrido.mp3");
somDano.volume = 0.4;

/* timers debounce */
let timerVida = null;
let timerSanidade = null;

/* =========================
   Utils
========================= */
function toIntSafe(v, fallback = 0) {
  const n = parseInt(v);
  return isNaN(n) ? fallback : n;
}

function tentarVibrar(ms) {
  if ("vibrate" in navigator) {
    try { navigator.vibrate(ms); } catch (e) { /* ignore */ }
  }
}

/* =========================
   Atualização visual (regras estritas)
   - critico: apenas quando atual <= 5 && > 0
   - zerado: quando 0
========================= */
function atualizarBarraVisual(atual, max, barraEl, spanEl) {
  const safeMax = Math.max(1, toIntSafe(max, 1));
  const porcent = Math.max(0, Math.min(100, (atual / safeMax) * 100));

  barraEl.style.width = porcent + "%";
  spanEl.innerText = atual;

  const textoEl = barraEl.parentElement.querySelector(".barra-texto");
  const separadorEl = textoEl.querySelector(".separador");

  // limpar classes
  barraEl.classList.remove("critico", "zerado");
  textoEl.classList.remove("critico", "texto-zerado");
  separadorEl.classList.remove("separador-zerado");

  if (atual === 0) {
    // estado zerado: sem piscar, texto/esvaecido
    barraEl.classList.add("zerado");
    textoEl.classList.add("texto-zerado");
    separadorEl.classList.add("separador-zerado");
  } else if (atual <= 5 && atual > 0) {
    // critico: somente 5,4,3,2,1
    barraEl.classList.add("critico");
    textoEl.classList.add("critico");
  }
}

/* =========================
   Agendamento pós-clique (1s) - anti-spam
   - Vida: som (dano) + vibração; morte = vibração mais forte (sem som)
   - Sanidade: vibração apenas
========================= */

function agendarVida(novo, antes) {
  clearTimeout(timerVida);
  if (novo >= antes) return; // só se reduziu

  timerVida = setTimeout(() => {
    // Se foi 1 -> 0: morte (sem som, vibração longa)
    if (antes === 1 && novo === 0) {
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
  if (novo >= antes) return; // só se reduziu

  timerSanidade = setTimeout(() => {
    tentarVibrar(VIB_SANIDADE);
    timerSanidade = null;
  }, 1000);
}

/* =========================
   Alterar valor (mantendo todas regras)
========================= */
function alterarValor(tipo, delta) {
  if (tipo === "vida") {
    const max = Math.max(1, toIntSafe(vidaMaxInput.value, 100));
    const antes = vidaAtual;
    const novo = Math.max(0, Math.min(vidaAtual + delta, max));

    if (novo !== antes) {
      agendarVida(novo, antes);
    }

    vidaAtual = novo;
    atualizarBarraVisual(vidaAtual, max, vidaBar, vidaAtualSpan);

  } else { // sanidade
    const max = Math.max(1, toIntSafe(sanidadeMaxInput.value, 100));
    const antes = sanidadeAtual;
    const novo = Math.max(0, Math.min(sanidadeAtual + delta, max));

    if (novo !== antes) {
      agendarSanidade(novo, antes);
    }

    sanidadeAtual = novo;
    atualizarBarraVisual(sanidadeAtual, max, sanidadeBar, sanidadeAtualSpan);
  }

  salvarEstado();
}

/* =========================
   Eventos
========================= */
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
   LocalStorage — salva e carrega (garante restauração ao reabrir)
========================= */
function salvarEstado() {
  const estado = {
    vidaAtual: Number(vidaAtual),
    vidaMax: Number(toIntSafe(vidaMaxInput.value, 100)),
    sanidadeAtual: Number(sanidadeAtual),
    sanidadeMax: Number(toIntSafe(sanidadeMaxInput.value, 100))
  };
  localStorage.setItem("painelRPG", JSON.stringify(estado));
}

function carregarEstado() {
  const salvo = localStorage.getItem("painelRPG");
  if (!salvo) {
    // inicializa visuais com valores atuais/inputs
    atualizarBarraVisual(vidaAtual, toIntSafe(vidaMaxInput.value, 100), vidaBar, vidaAtualSpan);
    atualizarBarraVisual(sanidadeAtual, toIntSafe(sanidadeMaxInput.value, 100), sanidadeBar, sanidadeAtualSpan);
    return;
  }

  try {
    const e = JSON.parse(salvo);
    vidaAtual = Number(e.vidaAtual ?? vidaAtual);
    sanidadeAtual = Number(e.sanidadeAtual ?? sanidadeAtual);

    vidaMaxInput.value = Number(e.vidaMax ?? toIntSafe(vidaMaxInput.value, 100));
    sanidadeMaxInput.value = Number(e.sanidadeMax ?? toIntSafe(sanidadeMaxInput.value, 100));

    atualizarBarraVisual(vidaAtual, vidaMaxInput.value, vidaBar, vidaAtualSpan);
    atualizarBarraVisual(sanidadeAtual, sanidadeMaxInput.value, sanidadeBar, sanidadeAtualSpan);
  } catch (err) {
    console.error("Erro ao carregar estado:", err);
  }
}

/* =========================
   Init
========================= */
carregarEstado();
