// ======= valores iniciais =======
let vidaAtual = 100;
let sanidadeAtual = 100;

// ======= elementos =======
const vidaBar = document.getElementById("vida-barra");
const sanBar = document.getElementById("sanidade-barra");

const vidaAtualSpan = document.getElementById("vida-atual");
const sanAtualSpan = document.getElementById("sanidade-atual");

const vidaMaxInput = document.getElementById("vida-max-input");
const sanMaxInput = document.getElementById("sanidade-max-input");

const vidaMaisBtn = document.getElementById("vida-mais");
const vidaMenosBtn = document.getElementById("vida-menos");
const sanMaisBtn = document.getElementById("sanidade-mais");
const sanMenosBtn = document.getElementById("sanidade-menos");

// util
function toIntSafe(v, fallback = 0) {
  const n = parseInt(v);
  return isNaN(n) ? fallback : n;
}

// Atualiza a barra visual e aplica classes corretas
function atualizarBarraVisual(atual, max, barraEl, atualSpan) {
  const safeMax = Math.max(1, toIntSafe(max, 1));
  atual = Math.max(0, toIntSafe(atual, 0));

  // porcentagem
  const porcent = Math.max(0, Math.min(100, (atual / safeMax) * 100));
  barraEl.style.width = porcent + "%";
  atualSpan.innerText = atual;

  // texto container e separador (achamos o nó pai .barra-texto)
  const barraTexto = barraEl.parentElement.querySelector(".barra-texto");
  const separadorImg = barraTexto.querySelector(".separador");

  // limpa classes
  barraEl.classList.remove("critico-barra", "zerado-barra");
  barraTexto.classList.remove("critico-texto", "texto-zerado");
  if (separadorImg) separadorImg.classList.remove("separador-zerado");

  // regras: zerado -> exatamente 0
  if (atual === 0) {
    // barra preta, texto/icone escurecidos, sem piscar
    barraEl.classList.add("zerado-barra");
    barraTexto.classList.add("texto-zerado");
    if (separadorImg) separadorImg.classList.add("separador-zerado");
  } else if (atual <= 5) {
    // Critico quando APARTIR DE 5 PARA BAIXO (<=5) e >0
    barraEl.classList.add("critico-barra");
    barraTexto.classList.add("critico-texto");
  }
}

// alterar valor atual (somente atual, 1 por clique)
function alterarValor(tipo, delta) {
  if (tipo === "vida") {
    const max = Math.max(1, toIntSafe(vidaMaxInput.value, 1));
    vidaAtual = Math.max(0, Math.min(vidaAtual + delta, max));
    atualizarBarraVisual(vidaAtual, max, vidaBar, vidaAtualSpan);
  } else {
    const max = Math.max(1, toIntSafe(sanMaxInput.value, 1));
    sanidadeAtual = Math.max(0, Math.min(sanidadeAtual + delta, max));
    atualizarBarraVisual(sanidadeAtual, max, sanBar, sanAtualSpan);
  }
  salvarEstado();
}

// listeners botões
vidaMaisBtn.addEventListener("click", () => alterarValor("vida", 1));
vidaMenosBtn.addEventListener("click", () => alterarValor("vida", -1));
sanMaisBtn.addEventListener("click", () => alterarValor("sanidade", 1));
sanMenosBtn.addEventListener("click", () => alterarValor("sanidade", -1));

// quando o máximo é alterado – normaliza e atualiza
vidaMaxInput.addEventListener("input", () => {
  let max = Math.max(1, toIntSafe(vidaMaxInput.value, 1));
  vidaMaxInput.value = max;
  if (vidaAtual > max) vidaAtual = max;
  atualizarBarraVisual(vidaAtual, max, vidaBar, vidaAtualSpan);
  salvarEstado();
});

sanMaxInput.addEventListener("input", () => {
  let max = Math.max(1, toIntSafe(sanMaxInput.value, 1));
  sanMaxInput.value = max;
  if (sanidadeAtual > max) sanidadeAtual = max;
  atualizarBarraVisual(sanidadeAtual, max, sanBar, sanAtualSpan);
  salvarEstado();
});

// ========== salvar / carregar estado (localStorage) ==========
function salvarEstado() {
  const estado = {
    vidaAtual,
    vidaMax: vidaMaxInput.value,
    sanidadeAtual,
    sanidadeMax: sanMaxInput.value
  };
  try {
    localStorage.setItem("painelRPG", JSON.stringify(estado));
  } catch (e) {
    // se localStorage estiver bloqueado, apenas ignore
    console.warn("Não foi possível salvar estado:", e);
  }
}

function carregarEstado() {
  try {
    const salvo = localStorage.getItem("painelRPG");
    if (!salvo) return;
    const estado = JSON.parse(salvo);

    vidaAtual = toIntSafe(estado.vidaAtual, vidaAtual);
    sanidadeAtual = toIntSafe(estado.sanidadeAtual, sanidadeAtual);

    vidaMaxInput.value = toIntSafe(estado.vidaMax, vidaMaxInput.value);
    sanMaxInput.value = toIntSafe(estado.sanidadeMax, sanMaxInput.value);

    atualizarBarraVisual(vidaAtual, vidaMaxInput.value, vidaBar, vidaAtualSpan);
    atualizarBarraVisual(sanidadeAtual, sanMaxInput.value, sanBar, sanAtualSpan);
  } catch (e) {
    console.warn("Erro ao carregar estado:", e);
  }
}

// inicialização
carregarEstado();
// caso não tenha nada salvo, atualiza com defaults
atualizarBarraVisual(vidaAtual, vidaMaxInput.value, vidaBar, vidaAtualSpan);
atualizarBarraVisual(sanidadeAtual, sanMaxInput.value, sanBar, sanAtualSpan);
