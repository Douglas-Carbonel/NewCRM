import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config';
import router from './routes';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';

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
});

export default app;
