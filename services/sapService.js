const axios = require("axios");
const https = require("https");
const config = require("../config.json");

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

// const SAP_URL = process.env.SAP_URL || "https://177.8.39.34:50000/b1s/v1";
// const SAP_URL = process.env.SAP_URL || "https://10.8.0.22:50000/b1s/v1";
const SAP_URL = config.SAP_URL;
const SAP_COMPANY = config.SAP_COMPANY;
const SAP_USER = process.env.SAP_USER || "svargas";
const SAP_PASSWORD = process.env.SAP_PASSWORD || "123456";

/** Timeout em ms para não travar se o SAP estiver inacessível (ex.: rede, firewall). */
const REQUEST_TIMEOUT_MS = Number(process.env.SAP_TIMEOUT_MS) || 15000;

let cookieSession = null;

async function loginSAP() {
  try {
    const response = await axios.post(
      `${SAP_URL}/Login`,
      {
        CompanyDB: SAP_COMPANY,
        UserName: SAP_USER,
        Password: SAP_PASSWORD,
      },
      {
        httpsAgent,
        timeout: REQUEST_TIMEOUT_MS,
      }
    );
    const setCookie = response.headers["set-cookie"];
    cookieSession = Array.isArray(setCookie) ? setCookie.join(";") : setCookie || "";
    return cookieSession;
  } catch (err) {
    const code = err.code || "";
    const status = err.response?.status;
    const sapMsg = err.response?.data?.error?.message?.value || err.response?.data?.error?.message;
    let msg = "Falha ao conectar na Service Layer.";
    if (code === "ECONNREFUSED") msg = "Conexão recusada. Servidor SAP acessível? Porta correta?";
    else if (code === "ETIMEDOUT" || code === "ECONNABORTED") msg = "Timeout. SAP não respondeu a tempo (rede/firewall?).";
    else if (code === "ENOTFOUND") msg = "Host não encontrado: " + (err.config?.url || SAP_URL);
    else if (status === 401) msg = "Login inválido (usuário/senha ou CompanyDB).";
    else if (status) msg = "Erro HTTP " + status + (sapMsg ? ": " + sapMsg : "");
    const e = new Error(msg);
    e.code = code;
    e.status = status;
    e.sapMessage = sapMsg;
    throw e;
  }
}

function getCookie() {
  return cookieSession;
}

function clearSession() {
  cookieSession = null;
}

async function getWithSession(url, options = {}) {
  if (!cookieSession) {
    await loginSAP();
  }

  const response = await axios.get(url, {
    ...options,
    headers: {
      ...options.headers,
      Cookie: cookieSession,
    },
    httpsAgent,
    timeout: options.timeout ?? REQUEST_TIMEOUT_MS,
  });

  return response;
}

module.exports = {
  SAP_URL,
  loginSAP,
  getCookie,
  clearSession,
  getWithSession,
  httpsAgent,
};
