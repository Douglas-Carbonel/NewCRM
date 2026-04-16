import { Request, Response } from 'express';
import { sapService } from '../services/sap.service';
import { cache, TTL } from '../services/cache.service';
import { SapBusinessPartner, SapODataResponse } from '../types/sap.types';

// Deduplicação: evita múltiplos requests simultâneos ao SAP para o mesmo recurso
const detalheInFlight = new Map<string, Promise<SapBusinessPartner>>();
const completoInFlight = new Map<string, Promise<{ cliente: SapBusinessPartner; ordens: unknown[] }>>();

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
    res.status(401).json({ erro: 'Sessão SAP expirada. Faça login novamente.' });
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
    const cacheKey = `clientes:list:v2:${top}:${skip}:${select ?? ''}`;

    const cached = cache.get<SapODataResponse<SapBusinessPartner>>(cacheKey);
    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      res.json(cached);
      return;
    }

    const topNum = Math.max(1, Number(top) || 50);
    const url = sapService.buildODataUrl('BusinessPartners', {
      select: select ?? 'CardCode,CardName,CardType,Phone1,Phone2,Cellular,EmailAddress,ContactPerson,City,Country,Currency,FederalTaxID,CurrentAccountBalance,OpenOrdersBalance',
      filter: "CardType eq 'C'",
      top: topNum,
      skip: Number(skip),
    });

    const data = await sapService.getWithSession<SapODataResponse<SapBusinessPartner>>(url, {
      headers: {
        Prefer: `odata.maxpagesize=${topNum}`,
      },
    });
    cache.set(cacheKey, data, TTL.CLIENTES_LIST);
    res.setHeader('X-Cache', 'MISS');
    res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=60');
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

    const cardCode = codigo.trim();
    const cacheKey = `clientes:codigo:${cardCode}`;
    const cached = cache.get<SapBusinessPartner>(cacheKey);
    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      res.json(cached);
      return;
    }

    // Deduplica requests simultâneos para o mesmo código
    let promise = detalheInFlight.get(cardCode);
    if (!promise) {
      const url = `${sapService.url}/BusinessPartners('${encodeURIComponent(cardCode)}')`;
      promise = sapService.getWithSession<SapBusinessPartner>(url).then((data) => {
        cache.set(cacheKey, data, TTL.CLIENTE_DETAIL);
        detalheInFlight.delete(cardCode);
        return data;
      }).catch((err) => {
        detalheInFlight.delete(cardCode);
        throw err;
      });
      detalheInFlight.set(cardCode, promise);
    }

    const data = await promise;
    res.setHeader('X-Cache', 'MISS');
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
    const cacheKey = `clientes:nome:${termo.toLowerCase()}`;
    const cached = cache.get<SapODataResponse<SapBusinessPartner>>(cacheKey);
    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      res.json(cached);
      return;
    }

    const nomeTop = 50;
    const url = sapService.buildODataUrl('BusinessPartners', {
      select: 'CardCode,CardName,CardType,Phone1,EmailAddress,ContactPerson,City',
      filter: `CardType eq 'C' and contains(CardName,'${termo}')`,
      top: nomeTop,
    });

    const data = await sapService.getWithSession<SapODataResponse<SapBusinessPartner>>(url, {
      headers: {
        Prefer: `odata.maxpagesize=${nomeTop}`,
      },
    });
    cache.set(cacheKey, data, TTL.BUSCA_NOME);
    res.setHeader('X-Cache', 'MISS');
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

    const cardCode = codigo.trim();
    const cacheKey = `clientes:completo:${cardCode}`;
    const cached = cache.get<{ cliente: SapBusinessPartner; ordens: unknown[] }>(cacheKey);
    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      res.json(cached);
      return;
    }

    // Deduplica requests simultâneos para o mesmo código
    let promise = completoInFlight.get(cardCode);
    if (!promise) {
      const encodedCode = encodeURIComponent(cardCode);
      promise = Promise.allSettled([
        sapService.getWithSession<SapBusinessPartner>(`${sapService.url}/BusinessPartners('${encodedCode}')`),
        sapService.getWithSession(`${sapService.url}/Orders?$select=DocNum,DocDate,DocTotal,DocumentStatus&$filter=CardCode eq '${cardCode}'&$top=10&$orderby=DocDate desc`),
      ]).then(([clienteData, ordensData]) => {
        const cliente = clienteData.status === 'fulfilled' ? clienteData.value : null;
        const ordens = ordensData.status === 'fulfilled' ? (ordensData.value as { value: unknown[] }).value ?? [] : [];

        if (!cliente) throw Object.assign(new Error('Cliente não encontrado no SAP.'), { status: 404 });

        const result = { cliente, ordens };
        cache.set(cacheKey, result, TTL.CLIENTE_COMPLETE);
        completoInFlight.delete(cardCode);
        return result;
      }).catch((err) => {
        completoInFlight.delete(cardCode);
        throw err;
      });
      completoInFlight.set(cardCode, promise);
    }

    const result = await promise;
    res.setHeader('X-Cache', 'MISS');
    res.json(result);
  } catch (err) {
    handleSapError(err, res);
  }
}

export async function limparCache(_req: Request, res: Response): Promise<void> {
  const count = cache.invalidate('clientes:');
  res.json({ ok: true, invalidated: count });
}

export async function criarCliente(req: Request, res: Response): Promise<void> {
  try {
    const body = req.body as Record<string, unknown>;

    const CardCode = (body.CardCode as string | undefined)?.trim();
    const CardName = (body.CardName as string | undefined)?.trim();

    if (!CardCode) {
      res.status(400).json({ erro: 'CardCode é obrigatório.' });
      return;
    }
    if (!CardName) {
      res.status(400).json({ erro: 'CardName é obrigatório.' });
      return;
    }

    // Campos de endereço não existem no raiz do BusinessPartner no SAP —
    // devem ser enviados dentro de BPAddresses
    const Street = body.Street as string | undefined;
    const ZipCode = body.ZipCode as string | undefined;
    const City = body.City as string | undefined;

    // Monta payload sem campos inválidos no raiz
    const { Street: _s, ZipCode: _z, City: _c, ...rest } = body;
    void _s; void _z; void _c;

    const payload: Record<string, unknown> = {
      CardType: 'C',
      ...rest,
      CardCode,
      CardName,
    };

    // Adiciona endereços em BPAddresses apenas se fornecidos
    if (Street || ZipCode || City) {
      const address = {
        Street: Street ?? '',
        ZipCode: ZipCode ?? '',
        City: City ?? '',
        Country: 'BR',
      };
      payload['BPAddresses'] = [
        { ...address, AddressName: 'Cobranca', AddressType: 'bo_BillTo' },
        { ...address, AddressName: 'Entrega',  AddressType: 'bo_ShipTo'  },
      ];
    }

    const url = `${sapService.url}/BusinessPartners`;
    const data = await sapService.postWithSession<SapBusinessPartner>(url, payload);

    cache.invalidate('clientes:list:');

    res.status(201).json(data);
  } catch (err) {
    handleSapError(err, res);
  }
}
