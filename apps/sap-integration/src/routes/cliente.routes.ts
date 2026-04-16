import { Router } from 'express';
import {
  listarClientes,
  buscarClientePorCodigo,
  buscarClientePorNome,
  buscarClienteCompleto,
  criarCliente,
} from '../controllers/cliente.controller';

const router = Router();

router.get('/', listarClientes);
router.post('/', criarCliente);
router.get('/nome/:nome', buscarClientePorNome);
router.get('/codigo/:codigo', buscarClientePorCodigo);
router.get('/codigo/:codigo/completo', buscarClienteCompleto);

export default router;
