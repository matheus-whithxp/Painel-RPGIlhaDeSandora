let vidaAtual = 100;
let sanidadeAtual = 100;

// variáveis para armazenar os máximos atuais (numéricos)
let vidaMax = 100;
let sanidadeMax = 100;

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

  // Limpar classes críticas/zerado por segurança antes de aplicar
  barraEl.classList.remove("critico", "zerado");
  textoEl.classList.remove("critico", "texto-zerado");
  separadorEl.classList.remove("separador-zerado");

  if (atual === 0) {
    // estado zerado: sem piscar, aparência esvanecida
    barraEl.classList.add("zerado");
    textoEl.classList.add("texto-zerado");
    separadorEl.classList.add("separador-zerado");
  } else {
    // estado > 0: verificar crítico (≤5 && >0)
    if (atual <= 5 && atual > 0) {
      barraEl.classList.add("critico");
      textoEl.classList.add("critico");
    } else {
      // normal — nada a mais
      // classes já removidas acima
    }
  }
}

function alterarValor(tipo, delta) {
  if (tipo === "vida") {
    const max = Math.max(1, toIntSafe(vidaMax, 100));
    vidaAtual = Math.max(0, Math.min(vidaAtual + delta, max));
    atualizarBarraVisual(vidaAtual, max, vidaBar, vidaAtualSpan);
  } else {
    const max = Math.max(1, toIntSafe(sanidadeMax, 100));
    sanidadeAtual = Math.max(0, Math.min(sanidadeAtual + delta, max));
    atualizarBarraVisual(sanidadeAtual, max, sanidadeBar, sanidadeAtualSpan);
  }
  salvarEstado();
}

vidaMaisBtn.addEventListener("click", () => alterarValor("vida", 1));
vidaMenosBtn.addEventListener("click", () => alterarValor("vida", -1));
sanidadeMaisBtn.addEventListener("click", () => alterarValor("sanidade", 1));
sanidadeMenosBtn.addEventListener("click", () => alterarValor("sanidade", -1));

/* Quando o máximo muda, ajustamos o valor atual proporcionalmente para manter a mesma % */
vidaMaxInput.addEventListener("input", () => {
  const novoMax = Math.max(1, toIntSafe(vidaMaxInput.value, 1));
  // prev percentage based on vidaMax (variável numérica)
  const prevMax = Math.max(1, toIntSafe(vidaMax, 1));
  if (novoMax !== prevMax) {
    // calcula proporcional: mantém a mesma % (arredonda)
    const proporcao = vidaAtual / prevMax;
    vidaAtual = Math.round(proporcao * novoMax);
    vidaAtual = Math.max(0, Math.min(vidaAtual, novoMax));
    vidaMax = novoMax;
    vidaMaxInput.value = novoMax;
    atualizarBarraVisual(vidaAtual, vidaMax, vidaBar, vidaAtualSpan);
    salvarEstado();
  } else {
    vidaMaxInput.value = novoMax;
  }
});

sanidadeMaxInput.addEventListener("input", () => {
  const novoMax = Math.max(1, toIntSafe(sanidadeMaxInput.value, 1));
  const prevMax = Math.max(1, toIntSafe(sanidadeMax, 1));
  if (novoMax !== prevMax) {
    const proporcao = sanidadeAtual / prevMax;
    sanidadeAtual = Math.round(proporcao * novoMax);
    sanidadeAtual = Math.max(0, Math.min(sanidadeAtual, novoMax));
    sanidadeMax = novoMax;
    sanidadeMaxInput.value = novoMax;
    atualizarBarraVisual(sanidadeAtual, sanidadeMax, sanidadeBar, sanidadeAtualSpan);
    salvarEstado();
  } else {
    sanidadeMaxInput.value = novoMax;
  }
});

/* =========================
   SALVAR / CARREGAR ESTADO
========================= */

function salvarEstado() {
  const estado = {
    vidaAtual: toIntSafe(vidaAtual, 100),
    vidaMax: toIntSafe(vidaMax, toIntSafe(vidaMaxInput.value, 100)),
    sanidadeAtual: toIntSafe(sanidadeAtual, 100),
    sanidadeMax: toIntSafe(sanidadeMax, toIntSafe(sanidadeMaxInput.value, 100))
  };
  localStorage.setItem("painelRPG", JSON.stringify(estado));
}

function carregarEstado() {
  const salvo = localStorage.getItem("painelRPG");
  if (!salvo) {
    // inicializa variáveis numéricas conforme inputs iniciais
    vidaMax = Math.max(1, toIntSafe(vidaMaxInput.value, 100));
    sanidadeMax = Math.max(1, toIntSafe(sanidadeMaxInput.value, 100));
    atualizarBarraVisual(vidaAtual, vidaMax, vidaBar, vidaAtualSpan);
    atualizarBarraVisual(sanidadeAtual, sanidadeMax, sanidadeBar, sanidadeAtualSpan);
    return;
  }

  try {
    const estado = JSON.parse(salvo);

    vidaAtual = toIntSafe(estado.vidaAtual, vidaAtual);
    sanidadeAtual = toIntSafe(estado.sanidadeAtual, sanidadeAtual);

    vidaMax = Math.max(1, toIntSafe(estado.vidaMax, toIntSafe(vidaMaxInput.value, 100)));
    sanidadeMax = Math.max(1, toIntSafe(estado.sanidadeMax, toIntSafe(sanidadeMaxInput.value, 100)));

    // garantir limites
    vidaAtual = Math.max(0, Math.min(vidaAtual, vidaMax));
    sanidadeAtual = Math.max(0, Math.min(sanidadeAtual, sanidadeMax));

    vidaMaxInput.value = vidaMax;
    sanidadeMaxInput.value = sanidadeMax;

    atualizarBarraVisual(vidaAtual, vidaMax, vidaBar, vidaAtualSpan);
    atualizarBarraVisual(sanidadeAtual, sanidadeMax, sanidadeBar, sanidadeAtualSpan);
  } catch (e) {
    console.error("Falha ao carregar estado salvo:", e);
  }
}

carregarEstado();
