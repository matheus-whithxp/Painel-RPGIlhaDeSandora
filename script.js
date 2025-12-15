// --- 1. CONFIGURAÇÃO E SELEÇÃO DE ELEMENTOS ---

// Chave para salvar no navegador
const STORAGE_KEY = "rpg_painel_dados";

// Elementos da Vida
const vidaBar = document.getElementById("vida-barra");
const vidaAtualSpan = document.getElementById("vida-atual");
const vidaMaxInput = document.getElementById("vida-max-input");
const vidaTextoContainer = document.getElementById("vida-texto-container"); // Novo ID adicionado no HTML
const vidaMaisBtn = document.getElementById("vida-mais");
const vidaMenosBtn = document.getElementById("vida-menos");

// Elementos da Sanidade
const sanidadeBar = document.getElementById("sanidade-barra");
const sanidadeAtualSpan = document.getElementById("sanidade-atual");
const sanidadeMaxInput = document.getElementById("sanidade-max-input");
const sanidadeTextoContainer = document.getElementById("sanidade-texto-container"); // Novo ID adicionado no HTML
const sanidadeMaisBtn = document.getElementById("sanidade-mais");
const sanidadeMenosBtn = document.getElementById("sanidade-menos");

// Variáveis de estado
let vidaAtual = 100;
let sanidadeAtual = 100;

// --- 2. FUNÇÕES AUXILIARES ---

// Retorna número seguro
function toIntSafe(v, fallback = 0) {
  const n = parseInt(v);
  return isNaN(n) ? fallback : n;
}

// Salva o estado atual no localStorage
function salvarDados() {
  const dados = {
    vida: vidaAtual,
    vidaMax: vidaMaxInput.value,
    sanidade: sanidadeAtual,
    sanidadeMax: sanidadeMaxInput.value
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
}

// Carrega dados salvos ou usa padrão 100
function carregarDados() {
  const salvos = localStorage.getItem(STORAGE_KEY);
  if (salvos) {
    const dados = JSON.parse(salvos);
    vidaAtual = toIntSafe(dados.vida, 100);
    vidaMaxInput.value = toIntSafe(dados.vidaMax, 100);
    sanidadeAtual = toIntSafe(dados.sanidade, 100);
    sanidadeMaxInput.value = toIntSafe(dados.sanidadeMax, 100);
  }
}

// --- 3. LÓGICA DE ATUALIZAÇÃO VISUAL ---

function atualizarBarraVisual(atual, maxInput, barraEl, spanEl, textoContainerEl) {
  const max = Math.max(1, toIntSafe(maxInput.value, 1));
  
  // 1. Atualiza largura da barra
  const porcent = Math.max(0, Math.min(100, (atual / max) * 100));
  barraEl.style.width = porcent + "%";
  
  // 2. Atualiza número
  spanEl.innerText = atual;

  // 3. Lógica de Estados (Crítico e Zerado)
  
  // Reset de classes
  barraEl.classList.remove("piscar", "zerado");
  textoContainerEl.classList.remove("zerado-texto");

  if (atual === 0) {
    // Estado ZERADO: Barra preta, texto opaco, sem piscar
    barraEl.classList.add("zerado");
    textoContainerEl.classList.add("zerado-texto");
  } 
  else if (atual <= 5) {
    // Estado CRÍTICO: Piscar
    barraEl.classList.add("piscar");
  }
}

// Função centralizada para atualizar tudo e salvar
function atualizarInterface() {
  atualizarBarraVisual(vidaAtual, vidaMaxInput, vidaBar, vidaAtualSpan, vidaTextoContainer);
  atualizarBarraVisual(sanidadeAtual, sanidadeMaxInput, sanidadeBar, sanidadeAtualSpan, sanidadeTextoContainer);
  salvarDados();
}

// --- 4. FUNÇÕES DE INTERAÇÃO ---

function alterarValor(tipo, delta) {
  if (tipo === "vida") {
    const max = toIntSafe(vidaMaxInput.value, 100);
    vidaAtual = Math.max(0, Math.min(vidaAtual + delta, max));
  } else {
    const max = toIntSafe(sanidadeMaxInput.value, 100);
    sanidadeAtual = Math.max(0, Math.min(sanidadeAtual + delta, max));
  }
  atualizarInterface();
}

// --- 5. LISTENERS (EVENTOS) ---

// Botões Vida
vidaMaisBtn.addEventListener("click", () => alterarValor("vida", 1));
vidaMenosBtn.addEventListener("click", () => alterarValor("vida", -1));

// Botões Sanidade
sanidadeMaisBtn.addEventListener("click", () => alterarValor("sanidade", 1));
sanidadeMenosBtn.addEventListener("click", () => alterarValor("sanidade", -1));

// Inputs de Máximo (quando altera o valor máximo digitando)
vidaMaxInput.addEventListener("input", () => {
  let max = Math.max(1, toIntSafe(vidaMaxInput.value, 1));
  // Ajusta se o atual ficou maior que o novo máximo
  if (vidaAtual > max) vidaAtual = max;
  atualizarInterface();
});

sanidadeMaxInput.addEventListener("input", () => {
  let max = Math.max(1, toIntSafe(sanidadeMaxInput.value, 1));
  if (sanidadeAtual > max) sanidadeAtual = max;
  atualizarInterface();
});

// --- 6. INICIALIZAÇÃO ---
// Roda ao abrir a página
carregarDados();     // Puxa do localStorage
atualizarInterface(); // Aplica visual
