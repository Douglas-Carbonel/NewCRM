# Como usar sapb1-connect

A lib **sapb1-connect** oferece três tipos de conexão: **HANA**, **SQL Server** e **Service Layer**. Abaixo o foco é na **Service Layer** (igual ao que você já usa com axios).

- **Repositório:** https://github.com/eduardofiorini/sapb1-connect  
- **Licença:** MIT  

---

## 1. Instalação

```bash
npm install sapb1-connect
```

---

## 2. Configuração da Service Layer

```js
const config = {
    HOSTNAME: "seu-servidor",      // ex: "10.8.0.22" ou "sap.empresa.com"
    PORT: "50000",
    VERSION: "v1",                 // v1 (OData 3) ou v2 (OData 4)
    COMPANY: "SBODEMOBR_DEV",      // nome do banco da empresa
};
```

Com variáveis de ambiente:

```js
const config = {
    HOSTNAME: process.env.SAP_HOST || "10.8.0.22",
    PORT: process.env.SAP_PORT || "50000",
    VERSION: process.env.SAP_VERSION || "v1",
    COMPANY: process.env.SAP_COMPANY || "SBODEMOBR_DEV",
};
```

---

## 3. Login (obter sessão)

Primeiro você faz login para obter o token/sessão. Depois usa o mesmo objeto `sl` para as requisições.

```js
const { ServiceLayer } = require("sapb1-connect");
const sl = new ServiceLayer(config);

async function login() {
    try {
        const session = await sl.token("usuario", "senha");
        console.log("Sessão iniciada:", session);
    } catch (error) {
        console.error(error);
    }
}
```

Em produção, use variáveis de ambiente para usuário e senha:

```js
await sl.token(process.env.SAP_USER, process.env.SAP_PASSWORD);
```

---

## 4. Requisições à Service Layer

Depois do `token()`, use `sl.request(método, path, body?)` para GET, POST, PATCH e DELETE.

### GET – listar ou buscar um registro

```js
// Listar todos os Business Partners (clientes/fornecedores)
const data = await sl.request("GET", "BusinessPartners");

// Com filtro OData (ex.: só clientes)
const clientes = await sl.request("GET", "BusinessPartners?$filter=CardType eq 'cCustomer'");

// Com $select e $top
const resumo = await sl.request("GET", "BusinessPartners?$select=CardCode,CardName&$top=20");

// Um único registro (chave entre parênteses)
const um = await sl.request("GET", "BusinessPartners('C001')");
```

### POST – criar

```js
const body = {
    CardCode: "C12345",
    CardName: "Novo Parceiro",
    CardType: "cCustomer",
};
const criado = await sl.request("POST", "BusinessPartners", body);
```

### PATCH – atualizar

```js
const body = { CardName: "Nome Atualizado" };
await sl.request("PATCH", "BusinessPartners('C12345')", body);
```

### DELETE – excluir

```js
await sl.request("DELETE", "BusinessPartners('C12345')");
```

---

## 5. Exemplo completo (Service Layer só)

```js
const { ServiceLayer } = require("sapb1-connect");

const config = {
    HOSTNAME: process.env.SAP_HOST || "10.8.0.22",
    PORT: process.env.SAP_PORT || "50000",
    VERSION: "v1",
    COMPANY: process.env.SAP_COMPANY || "SBODEMOBR_DEV",
};

const sl = new ServiceLayer(config);

async function main() {
    try {
        await sl.token(process.env.SAP_USER || "svargas", process.env.SAP_PASSWORD || "123456");

        const parceiros = await sl.request("GET", "BusinessPartners?$top=5");
        console.log(parceiros);
    } catch (error) {
        console.error(error);
    }
}

main();
```

---

## 6. Uso em uma rota Express (ex.: /clientes)

Você pode criar um serviço que usa **sapb1-connect** em vez do seu `sapService.js` atual:

```js
// services/sapb1ConnectService.js (exemplo)
const { ServiceLayer } = require("sapb1-connect");

const config = {
    HOSTNAME: process.env.SAP_HOST || "10.8.0.22",
    PORT: process.env.SAP_PORT || "50000",
    VERSION: "v1",
    COMPANY: process.env.SAP_COMPANY || "SBODEMOBR_DEV",
};

const sl = new ServiceLayer(config);
let loggedIn = false;

async function ensureLogin() {
    if (!loggedIn) {
        await sl.token(process.env.SAP_USER, process.env.SAP_PASSWORD);
        loggedIn = true;
    }
}

async function getBusinessPartners(queryString = "") {
    await ensureLogin();
    const path = queryString ? `BusinessPartners?${queryString}` : "BusinessPartners";
    return sl.request("GET", path);
}

module.exports = { sl, ensureLogin, getBusinessPartners };
```

No controller:

```js
const { getBusinessPartners } = require("../services/sapb1ConnectService");

async function listarClientes(req, res) {
    try {
        const query = req.query; // ex: $filter=CardType eq 'cCustomer'
        const qs = new URLSearchParams(query).toString();
        const data = await getBusinessPartners(qs);
        res.json(data);
    } catch (err) {
        res.status(err.response?.status || 500).json({ erro: err.message });
    }
}
```

---

## 7. HANA e SQL Server (opcional)

Se no futuro precisar acessar o banco direto (HANA ou SQL Server), a mesma lib oferece:

**HANA:**

```js
const { HanaDB } = require("sapb1-connect");
const hana = new HanaDB({ HOSTNAME, USERNAME, PASSWORD });
const result = await hana.query('SELECT * FROM "SBODEMOBR"."OUSR"');
```

**SQL Server:**

```js
const { SqlServerDB } = require("sapb1-connect");
const sql = new SqlServerDB({ HOSTNAME, USERNAME, PASSWORD, DATABASE });
const result = await sql.query("SELECT * FROM OUSR");
```

---

## 8. Observações

- **HTTPS / certificado:** O README não mostra opção para `rejectUnauthorized: false` ou CA. Se o seu B1 usar HTTPS com certificado autoassinado, pode ser necessário ver o código da lib no GitHub ou abrir uma issue.
- **Timeout:** A documentação da lib não cita timeout. Se precisar, você pode manter um wrapper com axios e timeout (como no seu `sapService.js`) ou pedir suporte na lib.
- **Sessão:** Depois de `token()`, a lib deve guardar os cookies (B1SESSION, ROUTEID) e enviá-los em `request()`. Em caso de 401, pode ser necessário chamar `token()` de novo (renovar sessão).

Para detalhes dos endpoints e entidades, use a [documentação oficial da Service Layer](https://help.sap.com/doc/056f69366b5345a386bb8149f1700c19/10.0/en-US/Service%20Layer%20API%20Reference.html).
