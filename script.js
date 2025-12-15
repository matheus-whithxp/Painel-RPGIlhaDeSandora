// --- CONFIGURAÇÃO ---
const STORAGE_KEY = "rpg_painel_v3";

// Elementos Vida
const vidaBar = document.getElementById("vida-barra");
const vidaAtualSpan = document.getElementById("vida-atual");
const vidaMaxInput = document.getElementById("vida-max-input");
const vidaTextoContainer = document.getElementById("vida-texto-container");
const vidaMaisBtn = document.getElementById("vida-mais");
const vidaMenosBtn = document.getElementById("vida-menos");

// Elementos Sanidade
const sanidadeBar = document.getElementById("sanidade-barra");
const sanidadeAtualSpan = document.getElementById("sanidade-atual");
const sanidadeMaxInput = document.getElementById("sanidade-max-input");
const sanidadeTextoContainer = document.getElementById("sanidade-texto-container");
const sanidadeMaisBtn = document.getElementById("sanidade-mais");
const sanidadeMenosBtn = document.getElementById("sanidade-menos");

let vidaAtual = 0;
let sanidadeAtual = 0;

// --- FUNÇÕES UTILITÁRIAS ---

function toIntSafe(v) {
  const n = parseInt(v);
  return isNaN(n) ? 0 : n;
}

function salvarDados() {
  const dados = {
    vida: vidaAtual,
    vidaMax: vidaMaxInput.value,
    sanidade: sanidadeAtual,
    sanidadeMax: sanidadeMaxInput.value
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
}

function carregarDados() {
  const salvos = localStorage.getItem(STORAGE_KEY);
  if (salvos) {
    const dados = JSON.parse(salvos);
    vidaAtual = toIntSafe(dados.vida);
    vidaMaxInput.value = toIntSafe(dados.vidaMax);
    sanidadeAtual = toIntSafe(dados.sanidade);
    sanidadeMaxInput.value = toIntSafe(dados.sanidadeMax);
  }
}

// --- ATUALIZAÇÃO VISUAL ---

function atualizarBarraVisual(atual, maxInput, barraEl, spanEl, textoContainerEl) {
  const max = Math.max(1, toIntSafe(maxInput.value));
  
  // Calcula porcentagem da largura
  const porcent = Math.max(0, Math.min(100, (atual / max) * 100));
  barraEl.style.width = porcent + "%";
  
  // Atualiza texto numérico
  spanEl.innerText = atual;

  // Lógica de Classes (Piscar/Zerado)
  barraEl.classList.remove("piscar", "zerado");
  textoContainerEl.classList.remove("zerado-texto");

  if (atual === 0) {
    barraEl.classList.add("zerado");
    textoContainerEl.classList.add("zerado-texto");
  } 
  else if (atual <= 5) {
    barraEl.classList.add("piscar");
  }
}

function atualizarInterface() {
  atualizarBarraVisual(vidaAtual, vidaMaxInput, vidaBar, vidaAtualSpan, vidaTextoContainer);
  atualizarBarraVisual(sanidadeAtual, sanidadeMaxInput, sanidadeBar, sanidadeAtualSpan, sanidadeTextoContainer);
  salvarDados();
}

function alterarValor(tipo, delta) {
  if (tipo === "vida") {
    const max = toIntSafe(vidaMaxInput.value);
    vidaAtual = Math.max(0, Math.min(vidaAtual + delta, max));
  } else {
    const max = toIntSafe(sanidadeMaxInput.value);
    sanidadeAtual = Math.max(0, Math.min(sanidadeAtual + delta, max));
  }
  atualizarInterface();
}

// --- EVENTOS ---

// Botões Vida
vidaMaisBtn.addEventListener("click", () => alterarValor("vida", 1));
vidaMenosBtn.addEventListener("click", () => alterarValor("vida", -1));

// Botões Sanidade
sanidadeMaisBtn.addEventListener("click", () => alterarValor("sanidade", 1));
sanidadeMenosBtn.addEventListener("click", () => alterarValor("sanidade", -1));

// Alteração manual do Máximo
vidaMaxInput.addEventListener("input", () => {
  let max = Math.max(1, toIntSafe(vidaMaxInput.value));
  if (vidaAtual > max) vidaAtual = max;
  atualizarInterface();
});

sanidadeMaxInput.addEventListener("input", () => {
  let max = Math.max(1, toIntSafe(sanidadeMaxInput.value));
  if (sanidadeAtual > max) sanidadeAtual = max;
  atualizarInterface();
});

// Inicialização
carregarDados();
atualizarInterface();
