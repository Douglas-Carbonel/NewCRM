# Integração com SAP Business One Service Layer

Conhecimento extraído do manual oficial [Working with SAP Business One Service Layer](https://help.sap.com/doc/0d2533ad95ba4ad7a702e83570a21c32/9.3/en-US/Working_with_SAP_Business_One_Service_Layer.pdf) (9.1–9.3, SAP HANA).

---

## 1. Visão geral

- **Protocolo**: HTTP/HTTPS + **OData** (v3 e v4).
- **URL base**: `https://<servidor>:<porta>/b1s/v1` (OData 3) ou `.../b1s/v2` (OData 4).
- **Formato**: JSON nas requisições e respostas.

A Service Layer expõe objetos e serviços do SAP B1 via REST; a sua API Node.js atua como cliente dessa Service Layer.

---

## 2. Login e sessão (obrigatório)

### Login

```http
POST https://<servidor>:<porta>/b1s/v1/Login
Content-Type: application/json

{
  "CompanyDB": "<nome_do_banco>",
  "UserName": "<usuario>",
  "Password": "<senha>"
}
```

Resposta de sucesso (200):

- **Headers**: `Set-Cookie: B1SESSION=<id>; HttpOnly;` e `Set-Cookie: ROUTEID=.node0; path=/b1s`
- **Body**: `{ "SessionId": "<id>" }`

### Uso da sessão

- **Toda** requisição subsequente (exceto Login) **deve** enviar os dois cookies no header:
  - `B1SESSION`
  - `ROUTEID`
- Exemplo:

```http
GET /b1s/v1/BusinessPartners
Cookie: B1SESSION=<id>; ROUTEID=.node0
```

- Sem esses cookies → **401 Unauthorized** com mensagem `"Invalid session."`.

### Logout

```http
POST /b1s/v1/Logout
Cookie: B1SESSION=<id>; ROUTEID=.node0
```

Resposta: **204 No Content**.

Sua implementação em `sapService.js` já faz login, guarda `set-cookie` e repassa no `Cookie` em `getWithSession`; ao receber 401 o controller limpa a sessão. Está alinhado ao manual.

---

## 3. Operações CRUD (entidades)

| Operação | Método HTTP | Exemplo |
|----------|-------------|--------|
| Criar     | POST   | `POST /BusinessPartners` com body JSON |
| Ler       | GET    | `GET /BusinessPartners` ou `GET /BusinessPartners('C001')` |
| Atualizar | PATCH (recomendado) ou PUT | `PATCH /BusinessPartners('C001')` com body parcial |
| Excluir   | DELETE | `DELETE /BusinessPartners('C001')` |

- **Chave string**: usar aspas simples na URL, ex.: `BusinessPartners('C001')`.
- **Chave numérica**: sem aspas, ex.: `Orders(22)`.
- **PATCH**: altera só os campos enviados; **PUT** substitui e pode zerar o que não for enviado.

Sua API hoje usa apenas GET (listar Business Partners). Para integrar mais, basta adicionar funções no `sapService` que façam POST/PATCH/DELETE com o mesmo `Cookie` e `httpsAgent`.

---

## 4. Opções de consulta (OData)

Úteis para filtrar, paginar e ordenar na sua API:

| Opção     | Descrição        | Exemplo |
|-----------|------------------|--------|
| `$filter` | Filtro           | `?$filter=CardType eq 'cCustomer'` |
| `$select` | Campos desejados | `?$select=CardCode,CardName` |
| `$orderby`| Ordenação        | `?$orderby=CardName asc` |
| `$top`    | Limite de linhas | `?$top=20` |
| `$skip`   | Pular N linhas   | `?$skip=10` (paginação) |
| `$count`  | Contar           | `GET /BusinessPartners/$count` |

Exemplos úteis para clientes:

- Só clientes: `GET /BusinessPartners?$filter=CardType eq 'cCustomer'`
- Nome contém: `$filter=contains(CardName,'Silva')`
- Paginação: `?$top=20&$skip=0`

Você pode repassar `$filter`, `$top`, `$skip`, etc. da sua API para a URL do SAP (montando a query string em `sapService` ou no controller).

---

## 5. Entidades comuns (para expandir sua API)

- **BusinessPartners** – parceiros de negócio (clientes/fornecedores) – você já usa.
- **Orders** – pedidos de venda.
- **Invoices** – faturas.
- **Items** – itens/materiais.
- **Document** – documento genérico (tipos variados).

Metadata completa: `GET /b1s/v1/$metadata` (após login). Lista de conjuntos de entidades: `GET /b1s/v1/` (service document).

---

## 6. Actions (ações)

- **Bound**: ligadas a uma entidade, ex. fechar pedido:
  - `POST /Orders(22)/Close`
- **Global**: serviço geral, ex.:
  - `POST /OrdersService_Close` com body `{ "DocumentParams": { "DocEntry": 22 } }`

Para integrar ações na sua API, basta um POST com o mesmo cookie e body indicado na documentação ou no `$metadata`.

---

## 7. Batch (múltiplas operações em uma requisição)

- **URL**: `POST /b1s/v1/$batch`
- **Content-Type**: `multipart/mixed; boundary=<boundary>`
- Dentro podem vir várias requisições HTTP (GET/POST/PATCH/DELETE) e “change sets” (grupos atômicos).

Útil quando precisar criar/alterar vários registros em uma única chamada a partir da sua API.

---

## 8. Boas práticas para sua API Node

1. **Variáveis de ambiente**: usar `SAP_URL` (base da Service Layer), `SAP_COMPANY`, `SAP_USER`, `SAP_PASSWORD` – você já usa a maioria; vale deixar `SAP_URL` também configurável.
2. **Sessão**: manter um único login e repassar cookies em todas as chamadas (já feito); em 401, limpar sessão e permitir novo login (já feito no controller).
3. **HTTPS**: em desenvolvimento com certificado autoassinado, `rejectUnauthorized: false` é aceitável; em produção, preferir certificado válido.
4. **Timeout**: definir timeout nas chamadas axios para não travar se o SAP estiver lento ou inacessível.
5. **Logout**: em shutdown da aplicação ou troca de empresa/usuário, chamar `POST /Logout` e limpar os cookies.

---

## 9. Resumo do que sua API já faz (vs. manual)

| Item do manual        | Na sua API                          |
|-----------------------|-------------------------------------|
| POST /Login           | `loginSAP()` em `sapService.js`     |
| Cookie B1SESSION + ROUTEID | `getWithSession()` envia `Cookie`   |
| GET BusinessPartners  | `GET /clientes` → controller → `getWithSession(SAP_URL/BusinessPartners)` |
| 401 → limpar sessão   | `clientesController` chama `clearSession()` e retorna 401 |

Para “adquirir o conhecimento e integrar” a API: use este guia como referência ao adicionar novos endpoints (outras entidades, filtros, ações, batch) mantendo sempre login + cookies + tratamento de 401 como já está.
