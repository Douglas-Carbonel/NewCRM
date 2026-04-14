const express = require("express");
const clientesRouter = require("./routes/cliente");

const app = express();
app.use(express.json());

// Rotas
app.get("/", (req, res) => res.json({ ok: true, mensagem: "API rodando" }));
// Rotas de clientes
app.use("/clientes", clientesRouter);

app.listen(3000, () => {
  console.log("API rodando na porta 3000");
});
