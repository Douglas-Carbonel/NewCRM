import { Router, Request, Response } from 'express';
import clienteRoutes from './cliente.routes';
import { sapService } from '../services/sap.service';
import { limparCache } from '../controllers/cliente.controller';
import { testHanaConnection } from '../services/hana.service';

const router = Router();

router.get('/health', async (_req, res) => {
  const hana = await testHanaConnection().catch(() => false);
  res.json({
    ok: true,
    service: 'sap-integration',
    timestamp: new Date().toISOString(),
    hana: hana ? 'connected' : 'disconnected',
  });
});

router.post('/auth/login', async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body as { username?: string; password?: string };

  if (!username?.trim() || !password?.trim()) {
    res.status(400).json({ erro: 'Usuário e senha são obrigatórios.' });
    return;
  }

  try {
    await sapService.loginWithCredentials(username.trim(), password.trim());
    res.json({ ok: true, user: username.trim() });
  } catch (err: unknown) {
    const error = err as { status?: number; message?: string };
    const status = error.status === 401 ? 401 : 502;
    res.status(status).json({ erro: error.message ?? 'Falha ao autenticar no SAP.' });
  }
});

router.post('/auth/logout', (_req: Request, res: Response): void => {
  sapService.clearAll();
  res.json({ ok: true });
});

router.post('/cache/clear', limparCache);

router.use('/clientes', clienteRoutes);

export default router;
