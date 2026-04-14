import { sapClient } from './api';
import { ClienteListResponse, ClienteCompleto } from '../types/cliente.types';

export const clienteService = {
  async listar(params?: { top?: number; skip?: number }): Promise<ClienteListResponse> {
    const query = new URLSearchParams();
    if (params?.top) query.set('top', String(params.top));
    if (params?.skip) query.set('skip', String(params.skip));
    const qs = query.toString();
    const { data } = await sapClient.get<ClienteListResponse>(
      `/clientes${qs ? `?${qs}` : ''}`
    );
    return data;
  },

  async buscarPorCodigo(cardCode: string): Promise<ClienteCompleto['cliente']> {
    const { data } = await sapClient.get(
      `/clientes/codigo/${encodeURIComponent(cardCode)}`
    );
    return data;
  },

  async buscarPorNome(nome: string): Promise<ClienteListResponse> {
    const { data } = await sapClient.get<ClienteListResponse>(
      `/clientes/nome/${encodeURIComponent(nome)}`
    );
    return data;
  },

  async visaoCompleta(cardCode: string): Promise<ClienteCompleto> {
    const { data } = await sapClient.get<ClienteCompleto>(
      `/clientes/codigo/${encodeURIComponent(cardCode)}/completo`
    );
    return data;
  },
};
