import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config';
import router from './routes';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';
import { sapService } from './services/sap.service';

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));
app.use(express.json());

app.use('/api', router);

app.get('/', (_req, res) => {
  res.json({ ok: true, service: 'SAP Integration Service', version: '1.0.0' });
});

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(config.port, '0.0.0.0', () => {
  console.log(`[SAP Integration] Rodando na porta ${config.port} (${config.nodeEnv})`);

  // Keep-alive: mantém a sessão SAP ativa com um ping leve a cada 8 minutos.
  // Evita o re-login de ~4-5s que ocorre quando a sessão expira entre acessos.
  const PING_INTERVAL_MS = 8 * 60 * 1000; // 8 min (sessão SAP expira em ~10-30 min)

  setInterval(async () => {
    try {
      await sapService.getWithSession(`${sapService.url}/CompanyService/GetAdminInfo`);
      console.log('[SAP] Keep-alive: sessão renovada.');
    } catch {
      // Se falhar (ex: sessão expirou), o próximo request vai fazer login automático
      console.warn('[SAP] Keep-alive falhou — sessão será renovada no próximo acesso.');
    }
  }, PING_INTERVAL_MS);
});

export default app;
