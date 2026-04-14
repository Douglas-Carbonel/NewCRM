import { Request, Response } from 'express';
import { sapService } from '../services/sap.service';
import { SapBusinessPartner, SapODataResponse } from '../types/sap.types';

function handleSapError(err: unknown, res: Response): void {
  const error = err as {
    status?: number;
    response?: { status?: number; data?: unknown };
    message?: string;
    code?: string;
  };

  const status = error.status ?? error.response?.status;
  const data = error.response?.data as { error?: { message?: { value?: string } | string } } | undefined;

  if (status === 401) {
    sapService.clearSession();
    res.status(401).json({
      erro: 'Sessão SAP expirada ou inválida. Tente novamente.',
      detalhe: data,
    });
    return;
  }

  if (status === 404) {
    res.status(404).json({ erro: 'Registro não encontrado no SAP.' });
    return;
  }

  const sapMsg =
    typeof data?.error?.message === 'object'
      ? data?.error?.message?.value
      : data?.error?.message;

  res.status(status ?? 500).json({
    erro: error.message ?? sapMsg ?? 'Erro ao comunicar com a Service Layer.',
  });
}

export async function listarClientes(req: Request, res: Response): Promise<void> {
  try {
    const { top = '50', skip = '0', select } = req.query as Record<string, string>;

    const url = sapService.buildODataUrl('BusinessPartners', {
      select: select ?? 'CardCode,CardName,CardType,Phone1,Phone2,Cellular,EmailAddress,ContactPerson,City,Country,Currency,FederalTaxID,CurrentAccountBalance,OpenOrdersBalance',
      filter: "CardType eq 'C'",
      top: Number(top),
      skip: Number(skip),
    });

    const data = await sapService.getWithSession<SapODataResponse<SapBusinessPartner>>(url);
    res.json(data);
  } catch (err) {
    handleSapError(err, res);
  }
}

export async function buscarClientePorCodigo(req: Request, res: Response): Promise<void> {
  try {
    const { codigo } = req.params;

    if (!codigo?.trim()) {
      res.status(400).json({ erro: 'Código do cliente é obrigatório.' });
      return;
    }

    const url = `${sapService.url}/BusinessPartners('${encodeURIComponent(codigo.trim())}')`;
    const data = await sapService.getWithSession<SapBusinessPartner>(url);
    res.json(data);
  } catch (err) {
    handleSapError(err, res);
  }
}

export async function buscarClientePorNome(req: Request, res: Response): Promise<void> {
  try {
    const { nome } = req.params;

    if (!nome?.trim()) {
      res.status(400).json({ erro: 'Nome do cliente é obrigatório.' });
      return;
    }

    const termo = nome.trim();
    const url = sapService.buildODataUrl('BusinessPartners', {
      select: 'CardCode,CardName,CardType,Phone1,EmailAddress,ContactPerson,City',
      filter: `CardType eq 'C' and contains(CardName,'${termo}')`,
      top: 50,
    });

    const data = await sapService.getWithSession<SapODataResponse<SapBusinessPartner>>(url);
    res.json(data);
  } catch (err) {
    handleSapError(err, res);
  }
}

export async function buscarClienteCompleto(req: Request, res: Response): Promise<void> {
  try {
    const { codigo } = req.params;

    if (!codigo?.trim()) {
      res.status(400).json({ erro: 'Código do cliente é obrigatório.' });
      return;
    }

    const cardCode = encodeURIComponent(codigo.trim());
    const [clienteData, ordensData] = await Promise.allSettled([
      sapService.getWithSession<SapBusinessPartner>(`${sapService.url}/BusinessPartners('${cardCode}')`),
      sapService.getWithSession(`${sapService.url}/Orders?$select=DocNum,DocDate,DocTotal,DocStatus&$filter=CardCode eq '${codigo.trim()}'&$top=10&$orderby=DocDate desc`),
    ]);

    const cliente = clienteData.status === 'fulfilled' ? clienteData.value : null;
    const ordens = ordensData.status === 'fulfilled' ? (ordensData.value as { value: unknown[] }).value ?? [] : [];

    if (!cliente) {
      res.status(404).json({ erro: 'Cliente não encontrado no SAP.' });
      return;
    }

    res.json({ cliente, ordens });
  } catch (err) {
    handleSapError(err, res);
  }
}
