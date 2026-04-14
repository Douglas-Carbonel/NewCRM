import { Router } from 'express';
import clienteRoutes from './cliente.routes';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'sap-integration', timestamp: new Date().toISOString() });
});

router.use('/clientes', clienteRoutes);

export default router;
