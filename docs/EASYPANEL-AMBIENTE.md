# Easypanel - Modelo de Ambiente

Este arquivo mostra os valores que voce deve preencher na aba **Ambiente** de cada servico no Easypanel.

## 1) Servico PostgreSQL

Se usar o banco gerenciado pelo proprio Easypanel, ele normalmente gera:

- host interno
- porta
- database
- user
- password

Com isso, monte a `DATABASE_URL` para a API:

```text
postgresql://USER:PASSWORD@HOST:PORT/DATABASE
```

---

## 2) Servico API (Node)

Comando de start:

```bash
npm run api
```

Variaveis de ambiente (obrigatorias/recomendadas):

```env
NODE_ENV=production
PORT=3005

DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE

JWT_SECRET=COLOQUE_UMA_CHAVE_LONGA_E_FORTE_AQUI
JWT_EXPIRES_IN=7d

FRONTEND_ORIGIN=https://SEU_DOMINIO.com

UPLOAD_DIR=/app/uploads
UPLOAD_PUBLIC_BASE_URL=https://SEU_DOMINIO.com
```

Notas:

- `FRONTEND_ORIGIN` deve ser a URL final do site (sem barra final).
- `UPLOAD_PUBLIC_BASE_URL` deve apontar para o mesmo dominio publico para montar URLs `/uploads/...`.
- Garanta volume persistente para `UPLOAD_DIR` (nao efemero).

---

## 3) Servico Frontend (Vite build + estatico)

O frontend atual usa chamadas relativas para API (`/api/...`) e uploads (`/uploads/...`).
Por isso, o ideal e servir tudo no mesmo dominio com roteamento por path.

Build:

```bash
npm ci
npm run build
```

Publicar a pasta `dist/`.

Se o seu setup de front exigir variaveis no build, voce pode definir:

```env
# Opcional (hoje nao obrigatorio no codigo):
VITE_API_BASE_URL=
```

---

## 4) Roteamento recomendado (mesmo dominio)

- `/` e SPA -> frontend (`dist`)
- `/api/*` -> API Node
- `/uploads/*` -> API Node

Esse modelo evita problemas com cookie `HttpOnly` e CORS.

---

## 5) Comandos pos-deploy (uma vez)

Com `DATABASE_URL` ja configurada no servico API:

```bash
npm run migrate
```

Criar admin inicial:

```bash
ADMIN_EMAIL=seu@email.com ADMIN_PASSWORD='SuaSenhaForte123!' npm run seed:admin
```

Validar admin:

```bash
ADMIN_EMAIL=seu@email.com npm run verify:admin
```
