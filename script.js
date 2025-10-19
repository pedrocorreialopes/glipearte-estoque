// ========= CONFIGURAÇÃO DA PLANILHA =========
const API_URL = "https://script.google.com/macros/s/1EXfxQG0c7aGVvaDMWaPSqaLzSvCA6Avt8VXF0gBLcpiDNVd6M8DQvieI/exec";

// ========= DADOS INICIAIS (DO PDF) =========
const INITIAL_DATA = [
  { nome: "Trio de cilindros MDF", fornecedor: "Pedreira Decor", valor: 120.22, quantidade: 1 },
  { nome: "Inflador elétrico de balões", fornecedor: "Bazar Mking", valor: 79.48, quantidade: 1 },
  { nome: "Arco retangular 2,20 X 1,50m", fornecedor: "Donnacristal", valor: 150.89, quantidade: 2 },
  { nome: "Capa painel retangular interativa junina", fornecedor: "Ideal & Pistache Decor", valor: 76.90, quantidade: 1 },
  { nome: "Capa painel retangular interativa junina", fornecedor: "Ideal & Pistache Decor", valor: 68.90, quantidade: 1 },
  { nome: "Jogo de 10 borboletas parafuso", fornecedor: "Decor RK", valor: 18.00, quantidade: 1 },
  { nome: "Trio de caixas organizadoras 50l plásticas", fornecedor: "Eldorado Plásticos", valor: 133.00, quantidade: 1 },
  { nome: "Dupla de capas de caixote feno", fornecedor: "Tecidos Sublimados", valor: 86.37, quantidade: 1 },
  { nome: "capa de caixotes Girassol", fornecedor: "Tecidos Sublimados", valor: 42.07, quantidade: 1 },
  { nome: "Bola de isopor 100mm maciça com 10", fornecedor: "Kisoeps Suzano", valor: 26.90, quantidade: 1 },
  { nome: "Bola de isopor 150mm maciça 2 unidades", fornecedor: "Papelaria Recanto", valor: 43.90, quantidade: 1 },
  { nome: "Painel blackout 1,50m X 1,50m", fornecedor: "Grupo Rocket", valor: 39.85, quantidade: 1 },
  { nome: "Medidor de balões", fornecedor: "Paraíso do MDF", valor: 19.50, quantidade: 1 },
  { nome: "Painéis de festas Natal / Ano Novo", fornecedor: "KN Artes", valor: 112.33, quantidade: 1 },
  { nome: "Arco circular 1,20m X 1,20m", fornecedor: "Decorar e Festejar", valor: 150.13, quantidade: 1 }
];

// ========= CARREGAR DADOS LOCAl =========
let produtos = JSON.parse(localStorage.getItem("glipearte_produtos")) || INITIAL_DATA;
let fornecedores = JSON.parse(localStorage.getItem("glipearte_fornecedores")) || [];

function salvarDados() {
  localStorage.setItem("glipearte_produtos", JSON.stringify(produtos));
  localStorage.setItem("glipearte_fornecedores", JSON.stringify(fornecedores));
}

// ========= RENDERIZAR TABELA =========
function renderizarTabela(filtrados = produtos) {
  const tbody = document.querySelector("#tabelaEstoque tbody");
  tbody.innerHTML = "";
  let total = 0;
  filtrados.forEach((p, i) => {
    const tr = document.createElement("tr");
    const subtotal = p.valor * p.quantidade;
    total += subtotal;
    tr.innerHTML = `
      <td>${p.nome}</td>
      <td>${p.fornecedor}</td>
      <td>R$ ${p.valor.toFixed(2).replace(".", ",")}</td>
      <td>${p.quantidade}</td>
      <td>R$ ${subtotal.toFixed(2).replace(".", ",")}</td>
      <td>
        <button onclick="editarProduto(${i})">Editar</button>
        <button onclick="removerProduto(${i})">Remover</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
  document.getElementById("valorTotal").textContent = `R$ ${total.toFixed(2).replace(".", ",")}`;
}

// ========= FUNÇÕES DE SINCRONIZAÇÃO =========
async function carregarDaPlanilha() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    produtos = data.map(p => ({
      nome: p.nome,
      fornecedor: p.fornecedor,
      valor: parseFloat(p.valor),
      quantidade: parseInt(p.quantidade)
    }));
    salvarDados();
    renderizarTabela();
    alert("✅ Dados da planilha carregados com sucesso!");
  } catch (err) {
    alert("❌ Erro ao carregar da planilha: " + err.message);
  }
}

async function enviarParaPlanilha(produto) {
  try {
    await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify(produto),
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    console.warn("❌ Erro ao enviar para planilha:", err.message);
  }
}

// ========= MODAIS E FORMS =========
function abrirModal(tipo) {
  if (tipo === "produto") {
    atualizarSelectFornecedores();
    document.getElementById("modalProduto").showModal();
  } else {
    document.getElementById("modalFornecedor").showModal();
  }
}

function fecharModal(tipo) {
  document.getElementById(`modal${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`).close();
}

function atualizarSelectFornecedores() {
  const select = document.querySelector("#formProduto select[name=fornecedor]");
  select.innerHTML = "";
  fornecedores.forEach(f => {
    const opt = document.createElement("option");
    opt.value = f.nome;
    opt.textContent = f.nome;
    select.appendChild(opt);
  });
}

// ========= EVENTOS DE FORMULÁRIO =========
document.getElementById("formProduto").addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target).entries());
  const novoProduto = {
    nome: data.nome,
    fornecedor: data.fornecedor,
    valor: parseFloat(data.valor),
    quantidade: parseInt(data.quantidade)
  };
  produtos.push(novoProduto);
  salvarDados();
  renderizarTabela();
  await enviarParaPlanilha(novoProduto);
  e.target.reset();
  fecharModal("produto");
});

document.getElementById("formFornecedor").addEventListener("submit", (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target).entries());
  fornecedores.push({ nome: data.nome, contato: data.contato });
  salvarDados();
  e.target.reset();
  fecharModal("fornecedor");
});

// ========= OUTRAS FUNÇÕES =========
function filtrarTabela() {
  const termo = document.getElementById("filtroFornecedor").value.toLowerCase();
  const filtrados = produtos.filter(p => p.fornecedor.toLowerCase().includes(termo));
  renderizarTabela(filtrados);
}

function removerProduto(index) {
  if (confirm("Deseja remover este produto?")) {
    produtos.splice(index, 1);
    salvarDados();
    renderizarTabela();
  }
}

function editarProduto(index) {
  const p = produtos[index];
  const novoNome = prompt("Nome do produto:", p.nome);
  const novoValor = parseFloat(prompt("Valor unitário:", p.valor));
  const novaQuantidade = parseInt(prompt("Quantidade:", p.quantidade));
  if (novoNome && !isNaN(novoValor) && !isNaN(novaQuantidade)) {
    produtos[index] = { ...p, nome: novoNome, valor: novoValor, quantidade: novaQuantidade };
    salvarDados();
    renderizarTabela();
  }
}

function exportarCSV() {
  const csv = [
    ["Produto", "Fornecedor", "Valor Unitário", "Quantidade", "Total Investido"],
    ...produtos.map(p => [
      p.nome,
      p.fornecedor,
      p.valor.toFixed(2).replace(".", ","),
      p.quantidade,
      (p.valor * p.quantidade).toFixed(2).replace(".", ",")
    ])
  ].map(row => row.join(";")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "estoque_glipearte.csv";
  a.click();
}

// ========= INICIALIZAR =========
renderizarTabela();