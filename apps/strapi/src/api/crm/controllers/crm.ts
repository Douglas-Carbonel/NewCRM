import { Context } from 'koa';

export default {
  async listarClientes(ctx: Context) {
    try {
      const { user } = ctx.state;
      if (!user) return ctx.unauthorized('Autenticação necessária.');

      const { top, skip } = ctx.query as { top?: string; skip?: string };
      const crmService = strapi.service('api::crm.crm') as {
        listarClientes: (params?: { top?: number; skip?: number }) => Promise<unknown>;
      };

      const data = await crmService.listarClientes({
        top: top ? Number(top) : 50,
        skip: skip ? Number(skip) : 0,
      });

      ctx.body = data;
    } catch (err: unknown) {
      const error = err as { response?: { status?: number; data?: unknown }; message?: string };
      const status = error.response?.status ?? 500;
      ctx.status = status;
      ctx.body = {
        erro: 'Erro ao buscar clientes no SAP.',
        detalhe: error.message,
      };
    }
  },

  async buscarClientePorCodigo(ctx: Context) {
    try {
      const { user } = ctx.state;
      if (!user) return ctx.unauthorized('Autenticação necessária.');

      const { cardCode } = ctx.params;
      const crmService = strapi.service('api::crm.crm') as {
        buscarClientePorCodigo: (cardCode: string) => Promise<unknown>;
      };

      const data = await crmService.buscarClientePorCodigo(cardCode);
      ctx.body = data;
    } catch (err: unknown) {
      const error = err as { response?: { status?: number } };
      ctx.status = error.response?.status ?? 500;
      ctx.body = { erro: 'Cliente não encontrado.' };
    }
  },

  async buscarClientesPorNome(ctx: Context) {
    try {
      const { user } = ctx.state;
      if (!user) return ctx.unauthorized('Autenticação necessária.');

      const { nome } = ctx.query as { nome?: string };
      if (!nome?.trim()) {
        ctx.status = 400;
        ctx.body = { erro: 'Parâmetro "nome" é obrigatório.' };
        return;
      }

      const crmService = strapi.service('api::crm.crm') as {
        buscarClientesPorNome: (nome: string) => Promise<unknown>;
      };

      const data = await crmService.buscarClientesPorNome(nome.trim());
      ctx.body = data;
    } catch (err: unknown) {
      ctx.status = 500;
      ctx.body = { erro: 'Erro ao buscar clientes por nome.' };
    }
  },

  async visaoCompletaCliente(ctx: Context) {
    try {
      const { user } = ctx.state;
      if (!user) return ctx.unauthorized('Autenticação necessária.');

      const { cardCode } = ctx.params;
      const crmService = strapi.service('api::crm.crm') as {
        visaoCompletaCliente: (cardCode: string) => Promise<unknown>;
      };

      const [sapData, notas, tarefas, historico] = await Promise.allSettled([
        crmService.visaoCompletaCliente(cardCode),
        strapi.entityService.findMany('api::crm-note.crm-note', {
          filters: { cardCode },
          sort: { createdAt: 'desc' },
          limit: 10,
        }),
        strapi.entityService.findMany('api::crm-task.crm-task', {
          filters: { cardCode, status: { $ne: 'cancelled' } },
          sort: { dueDate: 'asc' },
          limit: 10,
        }),
        strapi.entityService.findMany('api::crm-contact-history.crm-contact-history', {
          filters: { cardCode },
          sort: { contactDate: 'desc' },
          limit: 10,
        }),
      ]);

      ctx.body = {
        sap: sapData.status === 'fulfilled' ? sapData.value : null,
        notas: notas.status === 'fulfilled' ? notas.value : [],
        tarefas: tarefas.status === 'fulfilled' ? tarefas.value : [],
        historico: historico.status === 'fulfilled' ? historico.value : [],
      };
    } catch (err: unknown) {
      ctx.status = 500;
      ctx.body = { erro: 'Erro ao buscar visão completa do cliente.' };
    }
  },

  async criarNota(ctx: Context) {
    try {
      const { user } = ctx.state;
      if (!user) return ctx.unauthorized('Autenticação necessária.');

      const { cardCode } = ctx.params;
      const body = ctx.request.body as { title?: string; content?: string; type?: string };

      if (!body.title || !body.content) {
        ctx.status = 400;
        ctx.body = { erro: 'Campos "title" e "content" são obrigatórios.' };
        return;
      }

      const nota = await strapi.entityService.create('api::crm-note.crm-note', {
        data: {
          title: body.title,
          content: body.content,
          cardCode,
          type: body.type ?? 'note',
          authorId: user.id,
        },
      });

      ctx.status = 201;
      ctx.body = nota;
    } catch (err: unknown) {
      ctx.status = 500;
      ctx.body = { erro: 'Erro ao criar nota.' };
    }
  },

  async resumoDashboard(ctx: Context) {
    try {
      const { user } = ctx.state;
      if (!user) return ctx.unauthorized('Autenticação necessária.');

      const [totalNotas, totalTarefas, tarefasPendentes, notificacoesNaoLidas] =
        await Promise.all([
          strapi.entityService.count('api::crm-note.crm-note', {}),
          strapi.entityService.count('api::crm-task.crm-task', {}),
          strapi.entityService.count('api::crm-task.crm-task', {
            filters: { status: 'open' },
          }),
          strapi.entityService.count('api::crm-notification.crm-notification', {
            filters: { userId: user.id, read: false },
          }),
        ]);

      ctx.body = {
        resumo: {
          totalNotas,
          totalTarefas,
          tarefasPendentes,
          notificacoesNaoLidas,
        },
        geradoEm: new Date().toISOString(),
      };
    } catch (err: unknown) {
      ctx.status = 500;
      ctx.body = { erro: 'Erro ao gerar resumo do dashboard.' };
    }
  },
};
