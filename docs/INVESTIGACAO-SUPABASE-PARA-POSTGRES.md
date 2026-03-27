# Investigacao: Trocar Supabase por PostgreSQL

## Objetivo
Mapear exatamente o que esta acoplado ao Supabase no repositorio atual para permitir uma migracao completa para **PostgreSQL “puro”** (sem Supabase Auth/PostgREST/RLS/Storage).

Ao final desta investigacao, teremos clareza sobre:
- o que existe no banco hoje (tabelas, funcoes, triggers, policies, storage)
- quais fluxos do site dependem disso (login, portifolio, loja, contatos, admin, uploads)
- o que precisa ser reimplementado (modelagem, migrações, autenticação, endpoints, armazenamento de imagens)

## Escopo do repositorio (estado atual)
O front-end usa `@supabase/supabase-js` direto no browser.

Arquitetura atual (importante para a troca):
- Credenciais/URL do Supabase vem via `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`
- Consultas e inserts sao feitos no browser com `supabase.from(...).select/insert/update/delete`
- Autenticação do Admin (login/logout/session) usa `supabase.auth.*`
- Upload de imagens usa `supabase.storage.from(bucket).upload()` e retorna `publicUrl`
- As politicas de acesso sao garantidas por **RLS no Supabase** (o frontend assume que “pode” por causa das policies)

## Pontos de dependência no codigo
### Arquivos principais
- `src/integrations/supabase/client.ts`
  - cria o client `createClient(...)` usando `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`
- `src/hooks/useAuth.tsx`
  - controla `session/user` com `supabase.auth.onAuthStateChange` e `supabase.auth.getSession()`
  - autentica Admin com `supabase.auth.signInWithPassword(...)`
  - logout com `supabase.auth.signOut()`
  - determina `isAdmin` consultando `public.user_roles` (admin) via `supabase.from("user_roles").select("role")...`
- Páginas publicas:
  - `src/pages/Contato.tsx`
    - envia dados para `contact_submissions` e `budget_submissions` via `.insert(...)`
  - `src/pages/Portfolio.tsx`
    - carrega `portfolio_items` via `.select("*").order(...)`
    - filtra por categoria no front (apos receber)
  - `src/pages/Loja.tsx`
    - carrega `products` via `.select("*").eq("active", true).order(...)`
- Páginas/fluxos admin:
  - `src/pages/AdminLogin.tsx`
    - chama `signIn` do `useAuth` (Supabase Auth)
  - `src/pages/AdminDashboard.tsx`
    - carrega e faz CRUD em:
      - `contact_submissions` (select/delete)
      - `budget_submissions` (select/delete)
      - `portfolio_items` (select/insert/update/delete)
      - `products` (select/insert/update/delete)
- Upload de imagens admin:
  - `src/components/admin/ImageUpload.tsx`
    - faz upload em `supabase.storage.from(bucket).upload(...)`
    - usa `getPublicUrl(...)` e grava o resultado em `image_url` nas tabelas

### Resultado rapido: onde o Supabase aparece
- Apenas as areas acima fazem chamadas `supabase.*`
- Nao ha “outra” camada backend hoje (alem de `server/health.mjs`), entao a troca por Postgres provavelmente exige criar endpoints/backend para:
  - proteger dados sensiveis (credenciais)
  - implementar autenticação e autorizacao
  - substituir RLS e policies do Supabase por regras no app/backend

## O que existe no Supabase (modelo de dados)
As tabelas/objetos atuais estao documentados pelas migrações em `supabase/migrations/*.sql`.

### Enum
- `public.app_role` = `admin | moderator | user`

### Tabelas publicas utilizadas pelo site
- `public.contact_submissions`
  - campos: `id`, `name`, `email`, `phone`, `message`, `created_at`
  - default: `id = gen_random_uuid()`, `created_at = now()`
- `public.budget_submissions`
  - campos: `id`, `name`, `email`, `phone`, `company`, `project_type`, `deadline`, `budget_range`, `description`, `created_at`
  - default: `id = gen_random_uuid()`, `created_at = now()`
- `public.portfolio_items`
  - campos: `id`, `title`, `description`, `category`, `image_url`, `technologies` (TEXT[]), `link`, `featured`, `created_at`, `updated_at`
  - default: `id = gen_random_uuid()`, `technologies = '{}'`, `featured = false`, `created_at/updated_at = now()`
- `public.products`
  - campos: `id`, `name`, `description`, `price` (NUMERIC(10,2)), `original_price` (NUMERIC(10,2)), `category` (CHECK), `features` (TEXT[]), `image_url`, `popular`, `active`, `created_at`, `updated_at`
  - defaults: `features='{}'`, `popular=false`, `active=true`, `created_at/updated_at=now()`
- `public.user_roles`
  - campos: `id`, `user_id` (FK -> `auth.users(id)`), `role` (app_role)
  - serve para habilitar Admin com base na conta do Supabase Auth

### Funcoes e triggers
- `public.has_role(_user_id, _role)`:
  - consulta `public.user_roles` para retornar boolean
- Trigger de `updated_at`
  - existe uma funcao `public.update_updated_at_column()`
  - triggers para atualizar `updated_at` em `public.portfolio_items` e `public.products`

### Policies (RLS) e comportamento de acesso (resumo)
O site depende dessas policies para permitir acesso do frontend:

1. Public submissions:
  - `contact_submissions`: permite `INSERT` por qualquer um (policy “Anyone can submit contact form”)
  - `budget_submissions`: permite `INSERT` por qualquer um (policy “Anyone can submit budget form”)

2. Leitura publica:
  - `portfolio_items`: permite `SELECT` por qualquer um (policy “Anyone can view portfolio items”)
  - `products`: permite `SELECT` por qualquer um apenas quando `active = true`

3. Admin:
  - `user_roles`: policies usam `public.has_role(auth.uid(), 'admin')`
  - admin pode `SELECT` e `DELETE` em `contact_submissions` e `budget_submissions`
  - admin pode `INSERT/UPDATE/DELETE` em `portfolio_items` e `products`

### Storage (upload de imagens)
O Supabase Storage cria e protege bucket:
- `storage.buckets` (bucket `product-images`, public=true)
- Policies em `storage.objects`:
  - Public: permite `SELECT` para servir imagens publicamente
  - Admin: permite `INSERT/UPDATE/DELETE` apenas para admin autenticado (via `public.has_role(auth.uid(), 'admin')`)

Impacto:
- `ImageUpload.tsx` grava URLs publicas e assume que o storage servira via URL estavel.

## Fluxos do site afetados na troca (lista completa)
### 1) Login Admin
- Hoje depende de `supabase.auth.*`
- Regras:
  - autentica por email/senha
  - depois valida admin via `user_roles` (role=admin)

Para Postgres:
- sera necessario substituir o modelo de autenticação:
  - criar tabela(s) de users e sessions OU integrar outro provider (JWT/Cognito/etc.)
  - implementar checagem de admin no backend (na pratica: substituir RLS/`has_role`)

### 2) Dashboard Admin (CRUD)
- Depende de `.from(...).select/delete/insert/update`
- Regras:
  - visualiza tudo
  - cria/atualiza itens de portifolio e produtos
  - deleta registros de contatos/orcamentos/itens

Para Postgres:
- transformar isso em endpoints (ex.: `/api/admin/...`) com autorizacao server-side

### 3) Contatos / Orçamentos (publico)
- Depende de inserts em:
  - `contact_submissions`
  - `budget_submissions`

Para Postgres:
- criar endpoints publicos (sem login) com validacao de payload e inserts
- garantir que nao exista acesso de leitura/escrita indevida

### 4) Portifolio (publico)
- Depende de select de `portfolio_items`
- Filtra por categoria no front, mas ordena no query

Para Postgres:
- implementar endpoint publico de listagem (com ordenacao e opcional filtro)

### 5) Loja (publico)
- Depende de select de `products` com `active = true`
- Ordena por `popular` e `created_at`

Para Postgres:
- implementar endpoint publico de listagem de produtos ativos

### 6) Upload e imagem (admin)
- Depende de Storage:
  - upload e retorno de URL publica

Para Postgres:
- definir estrategia de armazenamento fisico:
  - (A) servir arquivos via filesystem no servidor (ex.: `/uploads/*`)
  - (B) object storage compatível com S3 (MinIO/S3) + URLs
  - (C) outro provider
- criar endpoints para upload e depois gravar `image_url` no Postgres

## O que deve ser decidido na proxima etapa (para criar o plano por etapas)
Antes de “escrever o plano final”, precisamos fechar pelo menos:
- Qual estratégia de autenticação?
  - (1) autenticação propria (tabela users + bcrypt + JWT)
  - (2) provider externo (Auth0, Keycloak, etc.)
- Como as politicas de acesso serão aplicadas?
  - (1) backend com checks (recomendado para substituir RLS)
  - (2) RLS Postgres via regras e roles (mais complexo, e exige adaptar autenticação)
- Onde as imagens ficarão?
  - (1) filesystem
  - (2) S3/MinIO
  - (3) outra opcao
- O que fazer com os dados existentes?
  - manter migração “a partir do Supabase atual” (export/transform) ou “zerar” e recriar?

## Checklist: evidencias que serao usadas no plano
- Confirmar todas as tabelas usadas: `contact_submissions`, `budget_submissions`, `portfolio_items`, `products`, `user_roles` + enum `app_role` + `has_role`
- Confirmar todos os fluxos no front que chamam Supabase: `useAuth`, `Contato`, `Portfolio`, `Loja`, `AdminDashboard`, `ImageUpload`
- Confirmar que `supabase/storage` é a unica dependência para imagens
- Definir endpoints novos e remover `supabase` do client-side (ou ao menos substituir por uma camada backend)

