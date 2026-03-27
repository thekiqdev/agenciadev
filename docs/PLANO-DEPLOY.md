# Plano inicial — colocar o site online (agenciadev)

Este documento organiza portas, ambiente local, migrações e o caminho sugerido para deploy (ex.: **Easypanel** em VPS).

---

## Visão do stack

| Camada | Tecnologia | Porta local |
|--------|------------|-------------|
| Front (Vite + React) | `npm run dev` | **9090** |
| API mínima (health / futuras rotas) | `npm run api` | **3005** |
| PostgreSQL (Docker Compose) | `docker compose` | **5435** (host) → 5432 no container |

O app usa **Supabase** no browser (`VITE_SUPABASE_*`). A API em 3005 é um serviço auxiliar (health, proxy `/api` no Vite); **não substitui** o Supabase para auth/dados até você implementar isso.

---

## 1. Desenvolvimento local rápido (só front + API)

Sem subir o Postgres:

```bash
npm run dev:stack
```

- Site: `http://localhost:9090`
- Health da API: `http://localhost:3005/health` (o Vite repassa `/api/*` para `http://127.0.0.1:3005`)

Ou em dois terminais: `npm run dev` e `npm run api`.

---

## 2. Subir Postgres no Docker (porta 5435)

Evita conflito com PostgreSQL na **5432** (comum no Docker Desktop ou instalação local).

```bash
npm run docker:db
```

String de conexão típica (ajuste usuário/senha se mudar o `docker-compose.yml`):

```text
postgresql://postgres:postgres@127.0.0.1:5435/agenciadev
```

**Importante:** as migrações em `supabase/migrations/` foram escritas para **Postgres no modelo Supabase** (schemas `auth`, `storage`, funções como `auth.uid()`). Um Postgres “vazio” **não** aplica tudo sem Supabase self-hosted ou ajustes. Para desenvolvimento com dados reais, costuma-se usar **Supabase Cloud** (como no `.env` atual) ou `supabase` CLI com projeto linkado.

---

## 3. Migrações na VPS / CI (`npm run migrate`)

No servidor (ou pipeline), com Postgres já acessível (idealmente o mesmo “tipo” Supabase):

1. Defina `DATABASE_URL` com a connection string do Postgres de produção.
2. Execute:

```bash
npm run migrate
```

Isso aplica todos os `.sql` em `supabase/migrations/` em ordem. Em **Easypanel**, use a variável de ambiente do serviço ou um job one-shot com a mesma `DATABASE_URL` do Postgres que você anexar ao app.

Se o deploy for **apenas front estático** + **Supabase Cloud**, as migrações já podem estar aplicadas no projeto Supabase; use `migrate` quando você controlar o Postgres na VPS.

---

## 4. Script de inicialização local completo

Sobe o Postgres e depois Vite + API:

```bash
npm run start:local
```

Requer **Docker Desktop** (ou engine compatível) rodando.

---

## 5. Deploy sugerido (Easypanel + VPS)

Ordem sugerida:

1. **Domínio e DNS** apontando para a VPS.
2. **Easypanel**: criar app para o front (build `npm run build`, servir `dist/` com Nginx ou serviço estático).
3. **Variáveis de ambiente** no build/runtime: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` (e demais `VITE_*` necessários). Lembre-se: variáveis `VITE_*` são embutidas no bundle no momento do build.
4. **Supabase**: manter projeto cloud ou migrar para instância própria; configurar URLs autorizadas e RLS.
5. **HTTPS**: certificado (Let’s Encrypt) no painel ou reverse proxy.
6. **Backups**: política do Postgres / Supabase.

Portas **9090** e **3005** são convenção **local**. Em produção o front costuma ser **80/443**; a API auxiliar (3005) só entra se você publicar esse serviço atrás do painel ou de um reverse proxy.

---

## 6. Comandos úteis (referência)

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Só Vite na porta 9090 |
| `npm run api` | API health na 3005 |
| `npm run dev:stack` | Vite + API (sem Docker) |
| `npm run start:local` | Docker Postgres + Vite + API |
| `npm run docker:db` | Só Postgres (5435) |
| `npm run docker:db:down` | Para stack Docker do compose |
| `npm run migrate` | Aplica SQLs (requer `DATABASE_URL`) |
| `npm run build` | Build de produção |

---

## 7. Próximos passos típicos

- [ ] Confirmar se produção será **Supabase Cloud** ou **Postgres na VPS** (define onde rodar `migrate`).
- [ ] Ajustar variáveis `VITE_*` no pipeline Easypanel e testar login/contato após deploy.
- [ ] Revisar CORS e URLs permitidas no Supabase para o domínio final.
- [ ] Monitoramento e backups do banco.

---

*Última atualização: alinhado ao `docker-compose.yml`, `vite.config.ts` e scripts em `package.json`.*
