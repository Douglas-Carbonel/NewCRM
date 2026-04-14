const express = require("express");
const clientesRouter = require("./routes/cliente");

const app = express();
app.use(express.json());

// Rotas
app.get("/", (req, res) => res.json({ ok: true, mensagem: "API rodando" }));
// Rotas de clientes
app.use("/clientes", clientesRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`API rodando na porta ${PORT}`);
});
