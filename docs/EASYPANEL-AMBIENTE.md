# Easypanel — Docker, dois serviços e variáveis de ambiente

## Dois serviços (recomendado)

Sim: no Easypanel costuma-se criar **dois apps** a partir do mesmo repositório:

| Serviço | Função | Dockerfile | Porta interna |
|--------|--------|------------|----------------|
| **API** | Node (Express + uploads) | `docker/Dockerfile.api` | `3005` |
| **Web** | Build Vite + Nginx (SPA + proxy `/api` e `/uploads`) | `docker/Dockerfile.web` | `80` |

O **domínio público** deve apontar para o serviço **Web**. O Nginx da imagem web encaminha `/api/*` e `/uploads/*` para a API usando a URL interna `API_INTERNAL_URL` (rede Docker do Easypanel).

Alternativa: um único serviço com proxy manual no painel; este repositório cobre o modelo **API + Web** com dois Dockerfiles.

---

## Build no Easypanel

- **Contexto (build context):** raiz do repositório (`.`).
- **API:** Dockerfile `docker/Dockerfile.api`.
- **Web:** Dockerfile `docker/Dockerfile.web`.

Comandos locais equivalentes:

```bash
docker build -f docker/Dockerfile.api -t agenciadev-api .
docker build -f docker/Dockerfile.web -t agenciadev-web .
```

---

## 1) PostgreSQL (Easypanel ou externo)

Monte a `DATABASE_URL` da API:

```text
postgresql://USER:PASSWORD@HOST:PORT/DATABASE
```

---

## 2) Serviço API — variáveis (colar em **Ambiente**)

```env
NODE_ENV=production
PORT=3005

DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE

JWT_SECRET=COLOQUE_UMA_CHAVE_LONGA_E_FORTE_AQUI
JWT_EXPIRES_IN=7d

FRONTEND_ORIGIN=https://SEU_DOMINIO_PUBLICO.com

UPLOAD_DIR=/srv/agenciadev-api/uploads
UPLOAD_PUBLIC_BASE_URL=https://SEU_DOMINIO_PUBLICO.com
```

- `FRONTEND_ORIGIN`: URL final do site (sem barra no final), igual ao domínio do serviço Web.
- `UPLOAD_PUBLIC_BASE_URL`: mesmo domínio público, para links `/uploads/...` no HTML.
- **Volume persistente** montado em `/srv/agenciadev-api/uploads` (senão imagens somem ao recriar o container). Não monte volume na raiz `/app` nem sobre `/srv/agenciadev-api` inteiro.
- As dependências de produção ficam na imagem em `/opt/agenciadev-api-image/node_modules` e o arranque cria um symlink em `/srv/agenciadev-api/node_modules` — não é necessário (nem recomendado) correr `npm install` no volume.

Comando de start: já definido no Dockerfile (`node server/health.mjs`).

---

## 3) Serviço Web — variáveis (colar em **Ambiente**)

Alinhe com o **nome interno** do serviço da API no Easypanel (hostname na rede Docker).

```env
API_INTERNAL_URL=http://NOME_DO_SERVICO_API_NO_EASYPANEL:3005
```

Exemplo: se o serviço da API se chama `agenciadev-api`, use:

```env
API_INTERNAL_URL=http://agenciadev-api:3005
```

O Dockerfile já define o padrão `http://agenciadev-api:3005`; ajuste se o nome do seu serviço for outro.

Não é necessário `VITE_*` para o build atual (chamadas relativas a `/api`).

---

## 4) Roteamento público

- Tráfego do domínio → container **Web** (porta exposta pelo painel, ex. 443 → 80).
- `/` → arquivos estáticos; `/api/` e `/uploads/` → proxy interno para a API via `API_INTERNAL_URL`.

Assim cookie `HttpOnly` e CORS permanecem coerentes com `FRONTEND_ORIGIN`.

---

## 5) Pós-deploy (uma vez), na API

Com `DATABASE_URL` já no ambiente do container da API:

```bash
npm run migrate
```

(Execute via console/one-shot do Easypanel no container da API; a imagem inclui `scripts/migrate.mjs` e `postgres/migrations/`.)

Admin inicial:

```bash
ADMIN_EMAIL=seu@email.com ADMIN_PASSWORD='SuaSenhaForte123!' npm run seed:admin
```

Validar admin:

```bash
ADMIN_EMAIL=seu@email.com npm run verify:admin
```

Os três comandos usam os scripts já copiados na imagem da API (`migrate`, `seed:admin`, `verify:admin` no `package.json`).

---

## Resumo rápido — o que colar onde

**API (Ambiente):** `NODE_ENV`, `PORT`, `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `FRONTEND_ORIGIN`, `UPLOAD_DIR`, `UPLOAD_PUBLIC_BASE_URL` + volume `/srv/agenciadev-api/uploads`.

**Web (Ambiente):** `API_INTERNAL_URL` apontando para `http://<nome-servico-api>:3005`.
