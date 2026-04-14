import { strapiClient } from './api';
import { ClienteListResponse, ClienteCompleto, CrmNota } from '../types/cliente.types';

export const clienteService = {
  async listar(params?: { top?: number; skip?: number }): Promise<ClienteListResponse> {
    const query = new URLSearchParams();
    if (params?.top) query.set('top', String(params.top));
    if (params?.skip) query.set('skip', String(params.skip));
    const qs = query.toString();
    const { data } = await strapiClient.get<ClienteListResponse>(
      `/api/crm/clientes${qs ? `?${qs}` : ''}`
    );
    return data;
  },

  async buscarPorCodigo(cardCode: string): Promise<ClienteCompleto['cliente']> {
    const { data } = await strapiClient.get(`/api/crm/clientes/${encodeURIComponent(cardCode)}`);
    return data;
  },

  async buscarPorNome(nome: string): Promise<ClienteListResponse> {
    const { data } = await strapiClient.get<ClienteListResponse>(
      `/api/crm/clientes/busca?nome=${encodeURIComponent(nome)}`
    );
    return data;
  },

  async visaoCompleta(cardCode: string): Promise<ClienteCompleto> {
    const { data } = await strapiClient.get<ClienteCompleto>(
      `/api/crm/clientes/${encodeURIComponent(cardCode)}/visao-completa`
    );
    return data;
  },

  async criarNota(
    cardCode: string,
    payload: { title: string; content: string; type?: string }
  ): Promise<CrmNota> {
    const { data } = await strapiClient.post<CrmNota>(
      `/api/crm/clientes/${encodeURIComponent(cardCode)}/notas`,
      payload
    );
    return data;
  },
};
