import { sapClient } from './api';
import { ClienteListResponse, ClienteCompleto } from '../types/cliente.types';

const listarInFlight = new Map<string, Promise<ClienteListResponse>>();

export const clienteService = {
  async listar(params?: { top?: number; skip?: number }): Promise<ClienteListResponse> {
    const key = `${params?.top ?? '50'}_${params?.skip ?? '0'}`;
    const existing = listarInFlight.get(key);
    if (existing) return existing;

    const promise = (async () => {
      const query = new URLSearchParams();
      if (params?.top) query.set('top', String(params.top));
      if (params?.skip) query.set('skip', String(params.skip));
      const qs = query.toString();
      try {
        const { data } = await sapClient.get<ClienteListResponse>(
          `/clientes${qs ? `?${qs}` : ''}`
        );
        return data;
      } finally {
        listarInFlight.delete(key);
      }
    })();

    listarInFlight.set(key, promise);
    return promise;
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
