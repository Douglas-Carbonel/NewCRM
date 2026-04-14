export default {
  routes: [
    {
      method: 'GET',
      path: '/crm/clientes',
      handler: 'crm.listarClientes',
      config: {
        policies: [],
        middlewares: [],
        auth: { scope: ['api::crm.crm'] },
      },
    },
    {
      method: 'GET',
      path: '/crm/clientes/busca',
      handler: 'crm.buscarClientesPorNome',
      config: {
        policies: [],
        middlewares: [],
        auth: { scope: ['api::crm.crm'] },
      },
    },
    {
      method: 'GET',
      path: '/crm/clientes/:cardCode',
      handler: 'crm.buscarClientePorCodigo',
      config: {
        policies: [],
        middlewares: [],
        auth: { scope: ['api::crm.crm'] },
      },
    },
    {
      method: 'GET',
      path: '/crm/clientes/:cardCode/visao-completa',
      handler: 'crm.visaoCompletaCliente',
      config: {
        policies: [],
        middlewares: [],
        auth: { scope: ['api::crm.crm'] },
      },
    },
    {
      method: 'POST',
      path: '/crm/clientes/:cardCode/notas',
      handler: 'crm.criarNota',
      config: {
        policies: [],
        middlewares: [],
        auth: { scope: ['api::crm.crm'] },
      },
    },
    {
      method: 'GET',
      path: '/crm/dashboard/resumo',
      handler: 'crm.resumoDashboard',
      config: {
        policies: [],
        middlewares: [],
        auth: { scope: ['api::crm.crm'] },
      },
    },
  ],
};
