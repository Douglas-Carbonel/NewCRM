const express = require("express");
const clienteController = require("../../controllers/cliente");

const router = express.Router();

// Rotas de clientes
router.get("/", clienteController.listarClientes) // Listar todos os clientes

router.get("/nome/:nome", clienteController.buscarClientePorNome) // Buscar cliente por nome (like)

router.get("/codigo/:codigo", clienteController.buscarCliente) // Buscar cliente por código

module.exports = router; // Exportar as rotas

