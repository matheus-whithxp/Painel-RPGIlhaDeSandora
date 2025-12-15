// Chave do LocalStorage
const STORAGE_KEY = "rpg_painel_final";

// Seletores VIDA
const vidaBar = document.getElementById("vida-barra");
const vidaOverlay = document.getElementById("vida-overlay");
const vidaAtualSpan = document.getElementById("vida-atual");
const vidaMaxInput = document.getElementById("vida-max-input");
const vidaMais = document.getElementById("vida-mais");
const vidaMenos = document.getElementById("vida-menos");

// Seletores SANIDADE
const sanidadeBar = document.getElementById("sanidade-barra");
const sanidadeOverlay = document.getElementById("sanidade-overlay");
const sanidadeAtualSpan = document.getElementById("sanidade-atual");
const sanidadeMaxInput = document.getElementById("sanidade-max-input");
const sanidadeMais = document.getElementById("sanidade-mais");
const sanidadeMenos = document.getElementById("sanidade-menos");

// Variáveis de Estado
let vidaAtual = 0;
let sanidadeAtual = 0;

// --- FUNÇÕES ---

function toInt(v) {
  const n = parseInt(v);
  return isNaN(n) ? 0 : n;
}

function salvar() {
  const dados = {
    vAtual: vidaAtual,
    vMax: vidaMaxInput.value,
    sAtual: sanidadeAtual,
    sMax: sanidadeMaxInput.value
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
}

function carregar() {
  const dados = JSON.parse(localStorage.getItem(STORAGE_KEY));
  if (dados) {
    vidaAtual = toInt(dados.vAtual);
    vidaMaxInput.value = toInt(dados.vMax);
    sanidadeAtual = toInt(dados.sAtual);
    sanidadeMaxInput.value = toInt(dados.sMax);
  }
}

// Atualiza a visualização na tela
function renderizar(tipo) {
  let atual, maxInput, barra, overlay, span;

  if (tipo === "vida") {
    atual = vidaAtual;
    maxInput = vidaMaxInput;
    barra = vidaBar;
    overlay = vidaOverlay;
    span = vidaAtualSpan;
  } else {
    atual = sanidadeAtual;
    maxInput = sanidadeMaxInput;
    barra = sanidadeBar;
    overlay = sanidadeOverlay;
    span = sanidadeAtualSpan;
  }

  const max = Math.max(1, toInt(maxInput.value));
  
  // 1. Largura da barra
  const pct = Math.max(0, Math.min(100, (atual / max) * 100));
  barra.style.width = pct + "%";

  // 2. Texto
  span.innerText = atual;

  // 3. Efeitos Visuais (Crítico / Zerado)
  barra.classList.remove("piscar", "zerado-barra");
  overlay.classList.remove("zerado-texto");

  if (atual === 0) {
    // ZERADO (Preto e Opaco)
    barra.classList.add("zerado-barra");
    overlay.classList.add("zerado-texto");
  } else if (atual <= 5) {
    // CRÍTICO (Piscar)
    barra.classList.add("piscar");
  }
}

function atualizarTudo() {
  renderizar("vida");
  renderizar("sanidade");
  salvar();
}

function mudarValor(tipo, delta) {
  if (tipo === "vida") {
    const max = toInt(vidaMaxInput.value);
    vidaAtual = Math.max(0, Math.min(vidaAtual + delta, max));
  } else {
    const max = toInt(sanidadeMaxInput.value);
    sanidadeAtual = Math.max(0, Math.min(sanidadeAtual + delta, max));
  }
  atualizarTudo();
}

// --- LISTENERS ---

vidaMais.addEventListener("click", () => mudarValor("vida", 1));
vidaMenos.addEventListener("click", () => mudarValor("vida", -1));

sanidadeMais.addEventListener("click", () => mudarValor("sanidade", 1));
sanidadeMenos.addEventListener("click", () => mudarValor("sanidade", -1));

// Quando edita o valor máximo manualmente
vidaMaxInput.addEventListener("input", () => {
  const max = Math.max(1, toInt(vidaMaxInput.value));
  if (vidaAtual > max) vidaAtual = max;
  atualizarTudo();
});

sanidadeMaxInput.addEventListener("input", () => {
  const max = Math.max(1, toInt(sanidadeMaxInput.value));
  if (sanidadeAtual > max) sanidadeAtual = max;
  atualizarTudo();
});

// Inicialização
carregar();
atualizarTudo();
