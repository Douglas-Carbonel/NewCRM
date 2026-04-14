#!/usr/bin/env node
/**
 * Script de diagnóstico da conexão com a SAP B1 Service Layer.
 * Rode: node scripts/testar-conexao-sap.js
 *
 * Mostra em qual passo falha: rede, HTTPS, login ou requisição com sessão.
 */

const https = require("https");
const http = require("http");
const axios = require("axios");

const SAP_URL = process.env.SAP_URL || "https://10.8.0.22:50000/b1s/v1";
const SAP_COMPANY = process.env.SAP_COMPANY || "SBODEMOBR_DEV";
const SAP_USER = process.env.SAP_USER || "svargas";
const SAP_PASSWORD = process.env.SAP_PASSWORD || "123456";
const TIMEOUT_MS = Number(process.env.SAP_TIMEOUT_MS) || 12000;

// Extrai host e porta da URL
const urlObj = new URL(SAP_URL);
const host = urlObj.hostname;
const port = parseInt(urlObj.port || "443", 10);
const isHttps = urlObj.protocol === "https:";

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

function log(step, msg, ok = true) {
  const icon = ok ? "✓" : "✗";
  console.log(`  ${icon} ${step}: ${msg}`);
}

async function passo1_tcp() {
  console.log("\n1. Teste de rede (TCP na porta " + port + ")...");
  return new Promise((resolve, reject) => {
    const socket = require("net").connect(
      { host, port, timeout: 5000 },
      () => {
        log("TCP", "Porta aberta, servidor alcançável");
        socket.destroy();
        resolve();
      }
    );
    socket.on("error", (err) => {
      log("TCP", err.message || "Conexão recusada / timeout / host inacessível", false);
      reject(err);
    });
    socket.on("timeout", () => {
      socket.destroy();
      log("TCP", "Timeout (firewall ou SAP não está rodando?)", false);
      reject(new Error("Timeout"));
    });
  });
}

async function passo2_https() {
  console.log("\n2. Teste HTTPS (GET na raiz da Service Layer)...");
  try {
    const res = await axios.get(SAP_URL, {
      httpsAgent,
      timeout: TIMEOUT_MS,
      validateStatus: () => true,
    });
    if (res.status === 200) {
      log("HTTPS", "Resposta 200 – Service Layer respondeu (pode exigir login para ver conteúdo)");
      return;
    }
    if (res.status === 401) {
      log("HTTPS", "Resposta 401 – Servidor exige login (esperado, conexão HTTPS OK)");
      return;
    }
    log("HTTPS", `Resposta ${res.status} – ${JSON.stringify(res.data).slice(0, 100)}`, false);
  } catch (err) {
    if (err.code === "ECONNREFUSED") {
      log("HTTPS", "Conexão recusada – nada escutando na porta " + port, false);
    } else if (err.code === "ETIMEDOUT" || err.code === "ECONNABORTED") {
      log("HTTPS", "Timeout – servidor não respondeu em " + TIMEOUT_MS + " ms", false);
    } else if (err.code === "ENOTFOUND") {
      log("HTTPS", "Host não encontrado: " + host, false);
    } else {
      log("HTTPS", (err.code || err.message) + " – " + (err.message || ""), false);
    }
    throw err;
  }
}

async function passo3_login() {
  console.log("\n3. Teste de LOGIN (POST /Login)...");
  try {
    const res = await axios.post(
      `${SAP_URL}/Login`,
      {
        CompanyDB: SAP_COMPANY,
        UserName: SAP_USER,
        Password: SAP_PASSWORD,
      },
      {
        httpsAgent,
        timeout: TIMEOUT_MS,
        validateStatus: () => true,
      }
    );

    if (res.status === 200) {
      const cookie = res.headers["set-cookie"];
      log("Login", "Sucesso – sessão obtida (B1SESSION + ROUTEID)");
      if (cookie) log("Login", "Cookies recebidos: " + (Array.isArray(cookie) ? cookie.length + " itens" : "1 item"));
      return cookie;
    }

    log("Login", "Falha – " + res.status, false);
    const body = res.data;
    if (body && body.error && body.error.message) {
      const msg = typeof body.error.message === "string" ? body.error.message : body.error.message.value;
      console.log("     Mensagem SAP:", msg);
    } else {
      console.log("     Resposta:", JSON.stringify(body).slice(0, 300));
    }
    throw new Error("Login falhou: " + res.status);
  } catch (err) {
    if (err.response) throw err;
    if (err.code === "ECONNREFUSED") log("Login", "Conexão recusada", false);
    else if (err.code === "ETIMEDOUT" || err.code === "ECONNABORTED") log("Login", "Timeout", false);
    else log("Login", err.message || String(err), false);
    throw err;
  }
}

async function passo4_get_com_sessao(cookieStr) {
  console.log("\n4. Teste GET com sessão (BusinessPartners)...");
  const setCookie = Array.isArray(cookieStr) ? cookieStr.join(";") : cookieStr || "";
  try {
    const res = await axios.get(`${SAP_URL}/BusinessPartners`, {
      headers: { Cookie: setCookie },
      httpsAgent,
      timeout: TIMEOUT_MS,
    });
    log("GET", "Sucesso – " + (res.data && res.data.value ? res.data.value.length + " registros" : "dados recebidos"));
    return res.data;
  } catch (err) {
    if (err.response) {
      log("GET", "Erro HTTP " + err.response.status, false);
      if (err.response.status === 401) {
        console.log("     Sessão inválida ou expirada (cookie não aceito).");
      }
      if (err.response.data) console.log("     Resposta:", JSON.stringify(err.response.data).slice(0, 200));
    } else {
      log("GET", err.code || err.message, false);
    }
    throw err;
  }
}

async function main() {
  console.log("=== Diagnóstico de conexão SAP B1 Service Layer ===");
  console.log("URL base:", SAP_URL);
  console.log("Company:", SAP_COMPANY);
  console.log("User:", SAP_USER);
  console.log("Timeout:", TIMEOUT_MS, "ms");

  try {
    await passo1_tcp();
  } catch (e) {
    console.log("\n>>> Problema na rede. Verifique:");
    console.log("    - SAP Service Layer está rodando nesse servidor/porta?");
    console.log("    - Firewall permite saída para " + host + ":" + port + "?");
    console.log("    - Você está na mesma rede/VPN do servidor SAP?");
    process.exit(1);
  }

  try {
    await passo2_https();
  } catch (e) {
    console.log("\n>>> Problema em HTTPS. Host/porta OK mas requisição falhou.");
    process.exit(2);
  }

  let cookieStr;
  try {
    cookieStr = await passo3_login();
  } catch (e) {
    console.log("\n>>> Problema no LOGIN. Verifique:");
    console.log("    - CompanyDB (banco) está correto?");
    console.log("    - Usuário e senha válidos no SAP B1?");
    console.log("    - Serviço de licença/SLD do B1 está ok?");
    process.exit(3);
  }

  try {
    await passo4_get_com_sessao(cookieStr);
  } catch (e) {
    console.log("\n>>> Rede e login OK, mas GET com sessão falhou (cookie ou permissão).");
    process.exit(4);
  }

  console.log("\n=== Todos os passos OK. A conexão do seu código deveria funcionar. ===\n");
}

main();
