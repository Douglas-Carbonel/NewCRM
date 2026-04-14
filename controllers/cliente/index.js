const sapService = require("../../services/sapService");

// Listar todos os clientes
async function listarClientes(req, res) {
  try {
    const response = await sapService.getWithSession(
      `${sapService.SAP_URL}/BusinessPartners`
    );
    res.json(response.data);
  } catch (err) {
    const status = err.status ?? err.response?.status;
    const data = err.response?.data;

    if (status === 401) {
      sapService.clearSession();
      return res.status(401).json({
        erro: "Sessão SAP expirada ou inválida. Tente novamente.",
        detalhe: data,
      });
    }

    const mensagemErro =
      err.message ||
      (data?.error?.message?.value ??
        data?.error?.message ??
        (typeof data === "object" ? undefined : data));
    res.status(status || 500).json({
      erro: mensagemErro || data || "Erro ao comunicar com a Service Layer.",
    });
  }
}

// Buscar cliente por código
async function buscarCliente(req, res) {
  try {
    const codigo = req.params.codigo;
    if (!codigo || typeof codigo !== "string" || codigo.trim() === "") {
      return res.status(400).json({ erro: "Código do cliente é obrigatório." });
    }
    if (/'/.test(codigo)) {
      return res
        .status(400)
        .json({ erro: "Código do cliente não pode conter aspas simples." });
    }

    const response = await sapService.getWithSession(
      `${sapService.SAP_URL}/BusinessPartners('${codigo.trim()}')`
    );
    res.json(response.data);
  } catch (err) {
    const status = err.status ?? err.response?.status;
    const data = err.response?.data;

    if (status === 401) {
      sapService.clearSession();
      return res.status(401).json({
        erro: "Sessão SAP expirada ou inválida. Tente novamente.",
        detalhe: data,
      });
    }
    if (status === 404) {
      return res.status(404).json({
        erro: "Cliente não encontrado.",
        detalhe: data?.error?.message?.value ?? data?.error?.message,
      });
    }

    const mensagemErro =
      err.message ||
      (data?.error?.message?.value ??
        data?.error?.message ??
        (typeof data === "object" ? undefined : data));
    res.status(status || 500).json({
      erro: mensagemErro || data || "Erro ao comunicar com a Service Layer.",
    });
  }
}

// Buscar cliente por nome (estilo doc: GET BusinessPartners?$select=&$filter=&$orderby=&$top=)
// Ex.: /clientes/nome/teq → like %teq% em CardName, case-insensitive
async function buscarClientePorNome(req, res) {
  try {
    const nome = req.params.nome;

    if (!nome || typeof nome !== "string" || nome.trim() === "") {
      return res.status(400).json({ erro: "Nome do cliente é obrigatório." });
    }

    const termo = nome.trim();

    const response = await sapService.getWithSession(
      `${sapService.SAP_URL}/BusinessPartners?$select=CardCode,CardName&$filter=contains(CardName,'${termo}')`
    );

    res.json(response.data);

  } catch (erro) {
    console.error("Erro ao buscar cliente por nome:", erro.message);
    res.status(500).json({ erro: "Erro ao buscar cliente." });
  }
}

module.exports = {
  listarClientes,
  buscarCliente,
  buscarClientePorNome,
};
