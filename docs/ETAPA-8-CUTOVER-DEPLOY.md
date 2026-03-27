# Etapa 8 — Cutover e deploy (VPS / Easypanel)

Este documento fecha o go-live: o que subir, em que ordem, variáveis obrigatórias e validação pós-deploy.

---

## Objetivo

Colocar em produção:

- **PostgreSQL** (gerenciado pelo painel ou container)
- **API Node** (`server/health.mjs`) — auth, CRUD admin, formulários públicos, uploads
- **Front estático** (build Vite em `dist/`)

O front chama rotas **relativas** (`/api/...`, `/uploads/...`). Em produção isso exige **mesmo domínio** (ou subdomínio com proxy unificado) para cookies `HttpOnly` e CORS funcionarem sem gambiarra.

---

## Arquitetura recomendada (um domínio)

Exemplo: `https://agenciadev.com.br`

| Caminho        | Destino                          |
|----------------|----------------------------------|
| `/` e SPA      | arquivos estáticos (`dist/`)     |
| `/api/*`       | processo Node da API             |
| `/uploads/*`   | mesmo processo Node (estático)   |

No **Easypanel** (ou Nginx na VPS), configure o reverse proxy para que **todas** essas rotas cheguem ao mesmo serviço Node **ou** use dois serviços com um **único ingress** que roteia por path (muitos painéis permitem “path prefix”).

**Alternativa:** dois subdomínios (`app.` e `api.`) exige ajuste no front (base URL da API) — hoje o projeto usa URLs relativas; prefira domínio único até implementar `VITE_API_BASE_URL` se necessário.

---

## Pré-requisitos

1. **DNS** apontando para a VPS (A/AAAA).
2. **HTTPS** (Let’s Encrypt no painel ou certificado gerenciado).
3. **Banco PostgreSQL** acessível pela API (`DATABASE_URL`).
4. Segredos fortes: `JWT_SECRET` (mínimo 16 caracteres; em produção use string longa aleatória).

---

## 1. Banco de dados (primeiro)

1. Crie o banco e usuário no painel ou via Docker.
2. Na máquina de deploy (ou CI), com `DATABASE_URL` de produção:

```bash
npm run migrate
```

3. Crie o admin inicial:

```bash
DATABASE_URL="postgresql://..." ADMIN_EMAIL="seu@email.com" ADMIN_PASSWORD="SenhaForte123!" npm run seed:admin
```

4. Valide:

```bash
DATABASE_URL="postgresql://..." ADMIN_EMAIL="seu@email.com" npm run verify:admin
```

---

## 2. Serviço da API (Node)

**Comando de execução:** `node server/health.mjs` (ou `npm run api` se o `package.json` estiver no contexto do build).

**Variáveis de ambiente (produção)**

| Variável | Obrigatório | Descrição |
|----------|-------------|-----------|
| `DATABASE_URL` | sim | Connection string PostgreSQL |
| `JWT_SECRET` | sim | Chave para assinar JWT (longa e secreta) |
| `JWT_EXPIRES_IN` | não | Padrão `7d` |
| `NODE_ENV` | sim | `production` (ativa cookie `Secure` no HTTPS) |
| `PORT` | não | Padrão `3005` (ou o que o painel injetar) |
| `FRONTEND_ORIGIN` | sim | URL pública exata do site, ex. `https://agenciadev.com.br` (CORS + coerência) |
| `UPLOAD_DIR` | não | Caminho absoluto na VPS para arquivos, ex. `/var/www/agenciadev/uploads` |
| `UPLOAD_PUBLIC_BASE_URL` | recomendado | URL base pública para links em `image_url`, ex. `https://agenciadev.com.br` (o servidor monta `/uploads/...`) |

**Persistência de uploads:** garanta que `UPLOAD_DIR` exista e seja gravável pelo usuário do processo Node; faça backup desta pasta junto com o banco.

---

## 3. Front estático (Vite)

1. Build:

```bash
npm ci
npm run build
```

2. Publique o conteúdo de `dist/` no serviço de arquivos estáticos **ou** sirva pelo mesmo Nginx que faz fallback para `index.html` (SPA).

**Importante:** o browser precisa conseguir acessar `https://seu-dominio.com/api/...` no **mesmo host** que serve o HTML. Se o front estiver só em CDN sem proxy para `/api`, os `fetch` relativos falham — por isso o modelo “um domínio + proxy” é o padrão aqui.

---

## 4. HTTPS e cookies

Com `NODE_ENV=production`, a API define cookie `HttpOnly` + `Secure`. Sem HTTPS válido, o login pode falhar no navegador.

`FRONTEND_ORIGIN` deve ser exatamente a origem do front (com `https://`, sem barra final desnecessária — use a mesma string que o navegador mostra).

---

## 5. Ordem sugerida no dia do cutover

1. Aplicar migrações e `seed:admin` / `verify:admin`.
2. Subir API com envs de produção e testar `GET /api/health` pela URL pública.
3. Publicar `dist/` e garantir proxy `/api` e `/uploads` → API.
4. Testar login em `/admindev/login` e uma ação admin (ex.: dashboard).
5. Testar formulário em `/contato` e listagens `/portfolio` e `/loja`.
6. Rodar smoke test automatizado apontando para a URL pública (ajuste `API_BASE_URL` e credenciais de teste):

```bash
set API_BASE_URL=https://seu-dominio.com
set TEST_ADMIN_EMAIL=...
set TEST_ADMIN_PASSWORD=...
npm run test:integration
```

---

## 6. Rollback (se algo der errado)

- Manter imagem/container anterior da API e versão anterior do `dist/` (tag Git).
- Banco: restore de snapshot feito **antes** do cutover se houver migração destrutiva (aqui as migrações são incrementais; o risco maior é dados novos após go-live).

---

## 7. Checklist rápido pós-deploy

- [ ] `https://.../api/health` retorna `status: ok`
- [ ] Login admin funciona e cookie é setado (aba Application → Cookies)
- [ ] Upload de imagem no admin gera URL acessível em `/uploads/...`
- [ ] Formulários de contato e orçamento gravam no Postgres
- [ ] Portfólio e loja carregam dados da API

---

*Documento alinhado ao fluxo atual: Postgres próprio, API Express em `server/health.mjs`, front sem Supabase.*
