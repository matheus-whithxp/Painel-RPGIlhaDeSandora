/* ---------------------------
   Estado inicial / elementos
--------------------------- */
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

/* ---------------------------
   SONS (vida) - arquivos na raiz
--------------------------- */
const somDano = new Audio("dano_sofrido.mp3");
const somMorte = new Audio("morte.mp3");
somDano.volume = 0.4;
somMorte.volume = 0.6;

/* ---------------------------
   Timers de debounce (1s)
--------------------------- */
let timerVida = null;
let timerSanidade = null;

/* ---------------------------
   Utils
--------------------------- */
function toIntSafe(v, fallback = 0) {
  const n = parseInt(v);
  return isNaN(n) ? fallback : n;
}

/* ---------------------------
   Visual update (regras mantidas)
--------------------------- */
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
    // estado zerado
    barraEl.classList.add("zerado");
    textoEl.classList.add("texto-zerado");
    separadorEl.classList.add("separador-zerado");
  } else {
    // crítico somente ≤5 e >0
    if (atual <= 5 && atual > 0) {
      barraEl.classList.add("critico");
      textoEl.classList.add("critico");
    }
  }
}

/* ---------------------------
   VIBRAÇÃO helper
--------------------------- */
function tentarVibrar(ms = 40) {
  if ("vibrate" in navigator) {
    try {
      navigator.vibrate(ms);
    } catch (e) {
      // ignorar falhas
    }
  }
}

/* ---------------------------
   Agendar ações após 1s (anti-spam)
   - Vida: som (dano ou morte) + vibração (somente se houve redução)
   - Sanidade: vibração (somente se houve redução)
--------------------------- */
function agendarVida(novoValor, valorAntes) {
  clearTimeout(timerVida);
  // só agendamos se houve redução (dano)
  if (!(novoValor < valorAntes)) {
    return;
  }

  timerVida = setTimeout(() => {
    // se foi 1 -> 0: morte
    if (novoValor === 0 && valorAntes === 1) {
      somMorte.currentTime = 0;
      somMorte.play().catch(()=>{});
      tentarVibrar(60);
    } else if (novoValor > 0) {
      // dano comum
      somDano.currentTime = 0;
      somDano.play().catch(()=>{});
      tentarVibrar(40);
    } else {
      // caso direto 2->0: trata como dano (não morte), conforme regra definida
      somDano.currentTime = 0;
      somDano.play().catch(()=>{});
      tentarVibrar(40);
    }
    timerVida = null;
  }, 1000);
}

function agendarSanidade(novoValor, valorAntes) {
  clearTimeout(timerSanidade);
  // só vibra se houve redução
  if (!(novoValor < valorAntes)) {
    return;
  }

  timerSanidade = setTimeout(() => {
    tentarVibrar(40);
    timerSanidade = null;
  }, 1000);
}

/* ---------------------------
   Alterar valores (mantendo regras)
--------------------------- */
function alterarValor(tipo, delta) {
  if (tipo === "vida") {
    const max = Math.max(1, toIntSafe(vidaMaxInput.value, 100));
    const antes = vidaAtual;
    const novo = Math.max(0, Math.min(vidaAtual + delta, max));

    if (novo !== antes) {
      // agendar som+vibração apenas quando reduzir
      agendarVida(novo, antes);
    }

    vidaAtual = novo;
    atualizarBarraVisual(vidaAtual, max, vidaBar, vidaAtualSpan);
  } else {
    const max = Math.max(1, toIntSafe(sanidadeMaxInput.value, 100));
    const antes = sanidadeAtual;
    const novo = Math.max(0, Math.min(sanidadeAtual + delta, max));

    if (novo !== antes) {
      // agendar vibração apenas quando reduzir
      agendarSanidade(novo, antes);
    }

    sanidadeAtual = novo;
    atualizarBarraVisual(sanidadeAtual, max, sanidadeBar, sanidadeAtualSpan);
  }
  salvarEstado();
}

/* ---------------------------
   Eventos
--------------------------- */
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

/* ---------------------------
   LocalStorage (mantém comportamento)
--------------------------- */
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
  if (!salvo) {
    // inicializa visuais com valores atuais
    atualizarBarraVisual(vidaAtual, toIntSafe(vidaMaxInput.value, 100), vidaBar, vidaAtualSpan);
    atualizarBarraVisual(sanidadeAtual, toIntSafe(sanidadeMaxInput.value, 100), sanidadeBar, sanidadeAtualSpan);
    return;
  }

  try {
    const estado = JSON.parse(salvo);

    vidaAtual = estado.vidaAtual ?? vidaAtual;
    sanidadeAtual = estado.sanidadeAtual ?? sanidadeAtual;

    vidaMaxInput.value = estado.vidaMax ?? vidaMaxInput.value;
    sanidadeMaxInput.value = estado.sanidadeMax ?? sanidadeMaxInput.value;

    atualizarBarraVisual(vidaAtual, vidaMaxInput.value, vidaBar, vidaAtualSpan);
    atualizarBarraVisual(sanidadeAtual, sanidadeMaxInput.value, sanidadeBar, sanidadeAtualSpan);
  } catch (e) {
    console.error("Falha ao carregar estado salvo:", e);
  }
}

/* ---------------------------
   Inicialização
--------------------------- */
carregarEstado();
