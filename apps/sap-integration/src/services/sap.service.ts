import axios, { AxiosRequestConfig } from 'axios';
import https from 'https';
import { config } from '../config';
import { SapQueryOptions } from '../types/sap.types';

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

let cookieSession: string | null = null;
let storedCredentials: { username: string; password: string } | null = null;

class SapServiceError extends Error {
  public readonly code?: string;
  public readonly status?: number;
  public readonly sapMessage?: string;

  constructor(message: string, code?: string, status?: number, sapMessage?: string) {
    super(message);
    this.name = 'SapServiceError';
    this.code = code;
    this.status = status;
    this.sapMessage = sapMessage;
  }
}

async function performLogin(username: string, password: string): Promise<string> {
  try {
    const response = await axios.post(
      `${config.sap.url}/Login`,
      {
        CompanyDB: config.sap.company,
        UserName: username,
        Password: password,
      },
      {
        httpsAgent,
        timeout: config.sap.timeoutMs,
      }
    );

    const setCookie = response.headers['set-cookie'];
    const cookies = Array.isArray(setCookie) ? setCookie : setCookie ? [setCookie] : [];
    cookieSession = cookies
      .map((c) => c.split(';')[0].trim())
      .filter(Boolean)
      .join('; ');

    return cookieSession;
  } catch (err: unknown) {
    const error = err as { code?: string; response?: { status: number; data?: unknown } };
    const code = error.code ?? '';
    const status = error.response?.status;
    const sapData = error.response?.data as { error?: { message?: { value?: string } | string } } | undefined;
    const sapMsg =
      (typeof sapData?.error?.message === 'object'
        ? sapData?.error?.message?.value
        : sapData?.error?.message) ?? undefined;

    let msg = 'Falha ao conectar na Service Layer.';
    if (code === 'ECONNREFUSED') msg = 'Conexão recusada. Servidor SAP acessível?';
    else if (code === 'ETIMEDOUT' || code === 'ECONNABORTED') msg = 'Timeout. SAP não respondeu a tempo.';
    else if (code === 'ENOTFOUND') msg = `Host não encontrado: ${config.sap.url}`;
    else if (status === 401) msg = 'Login inválido (usuário/senha ou CompanyDB).';
    else if (status) msg = `Erro HTTP ${status}${sapMsg ? `: ${sapMsg}` : ''}`;

    throw new SapServiceError(msg, code, status, sapMsg);
  }
}

async function loginWithCredentials(username: string, password: string): Promise<string> {
  storedCredentials = { username, password };
  return performLogin(username, password);
}

async function loginSAP(): Promise<string> {
  const username = storedCredentials?.username ?? config.sap.user;
  const password = storedCredentials?.password ?? config.sap.password;

  if (!username || !password) {
    throw new SapServiceError(
      'Credenciais SAP não configuradas. Faça login na plataforma.',
      'NO_CREDENTIALS',
      401
    );
  }

  return performLogin(username, password);
}

function getCookie(): string | null {
  return cookieSession;
}

function clearSession(): void {
  cookieSession = null;
}

function clearAll(): void {
  cookieSession = null;
  storedCredentials = null;
}

async function getWithSession<T>(url: string, options: AxiosRequestConfig = {}): Promise<T> {
  if (!cookieSession) {
    await loginSAP();
  }

  try {
    const response = await axios.get<T>(url, {
      ...options,
      headers: {
        ...options.headers,
        Cookie: cookieSession!,
      },
      httpsAgent,
      timeout: options.timeout ?? config.sap.timeoutMs,
    });
    return response.data;
  } catch (err: unknown) {
    const e = err as { response?: { status?: number; data?: unknown } };
    if (e.response?.status === 401) {
      cookieSession = null;
      await loginSAP();
      const retry = await axios.get<T>(url, {
        ...options,
        headers: { ...options.headers, Cookie: cookieSession! },
        httpsAgent,
        timeout: options.timeout ?? config.sap.timeoutMs,
      });
      return retry.data;
    }
    console.error(`[SAP] Error ${e.response?.status}:`, JSON.stringify(e.response?.data));
    throw err;
  }
}

function buildODataUrl(endpoint: string, opts: SapQueryOptions = {}): string {
  const params: string[] = [];
  if (opts.select) params.push(`$select=${opts.select}`);
  if (opts.filter) params.push(`$filter=${opts.filter}`);
  if (opts.orderby) params.push(`$orderby=${opts.orderby}`);
  if (opts.top !== undefined) params.push(`$top=${opts.top}`);
  if (opts.skip !== undefined) params.push(`$skip=${opts.skip}`);

  const query = params.length ? `?${params.join('&')}` : '';
  return `${config.sap.url}/${endpoint}${query}`;
}

export const sapService = {
  url: config.sap.url,
  loginSAP,
  loginWithCredentials,
  getCookie,
  clearSession,
  clearAll,
  getWithSession,
  buildODataUrl,
};
