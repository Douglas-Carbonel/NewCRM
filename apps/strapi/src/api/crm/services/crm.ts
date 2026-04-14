import axios from 'axios';

const SAP_SERVICE_URL = process.env.SAP_SERVICE_URL || 'http://localhost:3000';

const sapClient = axios.create({
  baseURL: SAP_SERVICE_URL,
  timeout: 20000,
});

export default () => ({
  async listarClientes(params?: { top?: number; skip?: number }) {
    const query = new URLSearchParams();
    if (params?.top) query.set('top', String(params.top));
    if (params?.skip) query.set('skip', String(params.skip));
    const qs = query.toString();
    const { data } = await sapClient.get(`/api/clientes${qs ? `?${qs}` : ''}`);
    return data;
  },

  async buscarClientePorCodigo(cardCode: string) {
    const { data } = await sapClient.get(`/api/clientes/codigo/${encodeURIComponent(cardCode)}`);
    return data;
  },

  async buscarClientesPorNome(nome: string) {
    const { data } = await sapClient.get(`/api/clientes/nome/${encodeURIComponent(nome)}`);
    return data;
  },

  async visaoCompletaCliente(cardCode: string) {
    const { data } = await sapClient.get(
      `/api/clientes/codigo/${encodeURIComponent(cardCode)}/completo`
    );
    return data;
  },
});
