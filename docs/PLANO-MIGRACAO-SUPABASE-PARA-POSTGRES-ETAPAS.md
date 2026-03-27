# Plano de Migracao (Supabase -> PostgreSQL)

## Decisoes (validadas)
- Autenticacao admin: `JWT + bcrypt` no **PostgreSQL**
- Imagens: armazenar na **VPS via filesystem** (ex.: `/var/www/agenciadev/uploads/...`)
- Migracao de dados: importar o conteudo atual (tabelas publicas e registros) que hoje esta no Supabase para o Postgres novo

## Visao da Arquitetura Alvo
- Frontend (Vite/React):
  - deixa de usar `@supabase/supabase-js`
  - passa a chamar endpoints do backend para:
    - dados publicos (portifolio, loja, contatos/orcamentos)
    - autenticar admin e consumir CRUD admin
    - upload de imagem (admin)
  - guarda o JWT em cookie `HttpOnly` (backend seta/renova o token)
  - nas rotas privadas, nao envia header `Authorization`; o navegador envia o cookie quando usamos `credentials: "include"`

- Backend (Node, no mesmo espaco do `server/`):
  - valida JWT
  - aplica autorizacao (admin) com base em roles no Postgres
  - faz CRUD no Postgres
  - recebe upload e grava no filesystem
  - entrega imagens via express static ou reverse proxy (Nginx/Easypanel)

- Banco (PostgreSQL):
  - tabelas de dominio equivalentes as atuais (contatos, orcamentos, portifolio, products)
  - tabelas de autenticacao (users, roles / user_roles)
  - constraints e triggers equivalentes (ex.: `updated_at`)

## Principais Mudancas (o que vai “sumir” do Supabase)
- Supabase Auth:
  - substituido por `users` + `bcrypt` + `JWT`
  - `supabase.auth.*` sera removido do frontend
- RLS/Policies:
  - substituidas por autorizacao no backend (server-side)
- Supabase Storage:
  - substituido por filesystem na VPS + rota estaticas

## Etapa 0 — Preparacao e alinhamento (antes de codar)
1. Confirmar o “contrato de dados” atual:
   - quais telas voce considera parte do escopo: `login admin`, `AdminDashboard`, `Contato`, `Portifolio`, `Loja`
   - confirmar se existe alguma outra pagina/componentes que dependem de Supabase (rodar busca por `supabase.` no repositorio)
2. Definir URLs novas de imagem:
   - como sera montado `image_url` (ex.: `https://seu-dominio.com/uploads/product-images/<arquivo>`)
3. Confirmar como vai ser a administracao inicial:
   - como criar ao menos 1 admin com senha (ver nota em “Etapa 5” sobre migracao de senha)

## Etapa 1 — Modelagem do banco PostgreSQL (schema)
Objetivo: criar um schema equivalente ao atual do Supabase (para as tabelas usadas pelo site) e adicionar autenticao admin por JWT.

1. Criar tabelas de dominio (equivalentes ao Supabase):
   - `contact_submissions`
   - `budget_submissions`
   - `portfolio_items`
   - `products`
2. Criar autenticao e roles:
   - `users` (id, email unico, password_hash, created_at, etc.)
   - `roles` ou `user_roles` (para representar `admin | moderator | user`)
   - manter `has_role(user_id, role)` como funcao, se quiserem reaproveitar a logica (opcional)
3. Criar triggers:
   - `updated_at` para `portfolio_items` e `products`
4. Criar indices/constraints minimos:
   - indices por `created_at` (para order desc)
   - indice para `products(active, popular)` se necessario

Entregavel desta etapa:
- SQL de `schema` versionado (migrações) para PostgreSQL puro

## Etapa 2 — Backend: endpoints e regras (substituir Supabase)
Objetivo: fornecer endpoints que reproduzam o que hoje esta sendo feito via `supabase.from(...).select/insert/update/delete`.

1. Rotas publicas (sem JWT):
   - `POST /api/contact-submissions`
     - valida payload (name, email, phone, message)
     - insere em `contact_submissions`
   - `POST /api/budget-submissions`
     - valida payload (name, email, phone, company, project_type, deadline, budget_range, description)
     - insere em `budget_submissions`
   - `GET /api/portfolio-items`
     - lista itens (ordenacao por `featured` desc e `created_at` desc, se aplicavel)
   - `GET /api/products`
     - lista produtos `active=true` (ordenacao por `popular` desc e `created_at` desc)

2. Rotas privadas (JWT, apenas admin):
   - `POST /api/auth/login`
     - valida email + password (bcrypt)
     - emite JWT em cookie `HttpOnly` (ex.: `Set-Cookie: access_token=...; HttpOnly; Secure; SameSite=Lax; Path=/`)
   - `GET /api/auth/me`
     - retorna `{ isAdmin, email, userId }` (ajuda o frontend a decidir)
   - `GET /api/admin/dashboard`
     - retorna os conjuntos necessarios (contacts/budgets/portfolio/products) ou endpoints separados
   - CRUD:
     - `DELETE /api/admin/contact-submissions/:id`
     - `DELETE /api/admin/budget-submissions/:id`
     - `POST|PUT /api/admin/portfolio-items`
     - `DELETE /api/admin/portfolio-items/:id`
     - `POST|PUT /api/admin/products`
     - `DELETE /api/admin/products/:id`

3. Upload de imagem (admin):
   - `POST /api/admin/upload-image`
     - recebe `multipart/form-data`
     - salva em filesystem (ex.: `/uploads/product-images/<fileName>`)
     - retorna `image_url`

4. Entrega de imagens:
   - expor `/uploads/*` para servir as imagens gravadas

Entregavel desta etapa:
- Backend funcionando localmente com as mesmas funcionalidades das rotas atuais do Supabase

## Etapa 3 — Frontend: substituir Supabase por API client
Objetivo: remover dependência de `supabase` do browser.

1. Substituir `src/integrations/supabase/*`:
   - trocar por `src/integrations/api/client.ts` (fetch/axios)
2. Reescrever `src/hooks/useAuth.tsx`:
   - trocar `supabase.auth.*` por:
     - `POST /api/auth/login`
     - `GET /api/auth/me` (para recuperar isAdmin)
   - trocar checagem via `user_roles` diretamente por retorno do backend
   - garantir que todas as chamadas para rotas privadas usem `credentials: "include"` (para enviar o cookie `HttpOnly`)
3. Atualizar paginas:
   - `Contato.tsx`:
     - trocar `supabase.from(...).insert` por `POST /api/contact-submissions` e `POST /api/budget-submissions`
   - `Portfolio.tsx`:
     - trocar `supabase.from("portfolio_items").select...` por `GET /api/portfolio-items`
   - `Loja.tsx`:
     - trocar `supabase.from("products")...` por `GET /api/products`
   - `AdminDashboard.tsx`:
     - trocar todo CRUD para endpoints `/api/admin/...`
   - `ImageUpload.tsx`:
     - trocar `supabase.storage...upload/getPublicUrl` por `POST /api/admin/upload-image`
4. Validar UX:
   - loading states e mensagens de erro (mantendo `toast`/`sonner`)

Entregavel desta etapa:
- Frontend completo sem `@supabase/supabase-js` (ou com supabase completamente removido)

## Etapa 4 — Migração do conteudo (Supabase -> Postgres)
Objetivo: fazer o “povoamento” do novo Postgres com dados do Supabase.

1. Copiar dados das tabelas publicas:
   - `contact_submissions`
   - `budget_submissions`
   - `portfolio_items`
   - `products`
2. Export/Import:
   - estrategia sugerida:
     - exportar do Supabase (select/CSV/JSON via script)
     - importar no Postgres (batch insert com `COPY` ou inserts transacionais)
3. Atualizar `image_url`:
   - apos migrar imagens (Etapa 5), reescrever `image_url` para apontar para a nova base no filesystem

Entregavel desta etapa:
- Banco com dados equivalentes ao Supabase (com `image_url` correto para a VPS)

## Etapa 5 — Migração de imagens (Supabase Storage -> filesystem)
Objetivo: baixar todos os objetos do bucket `product-images` e subir para a pasta local na VPS.

1. Descobrir objetos existentes:
   - listar objetos `bucket_id = product-images`
2. Baixar:
   - se os objetos sao publicos (policy de SELECT para bucket), pode baixar via URL publica do Supabase
3. Salvar no filesystem:
   - escolher path deterministico (ex.: `uploads/product-images/<object_name>`)
4. Atualizar `image_url`:
   - trocar o URL anterior do Supabase pelo novo URL local servido pela VPS

Entregavel desta etapa:
- Pasta `/uploads/...` na VPS preenchida e `image_url` consistente

## Etapa 6 — Autenticacao admin inicial (nota importante sobre senhas)
Ponto critico: no Supabase Auth, **nao e possivel recuperar senhas hash** via API comum.

Entao, para JWT/bcrypt no Postgres:
1. Voce tera que criar um admin bootstrap no novo banco:
   - criar `users` com `password_hash` (bcrypt) usando uma senha nova
2. Para admins existentes do Supabase:
   - normalmente sera necessario resetar senha manualmente (ou recriar contas) no novo sistema

Entregavel desta etapa:
- Admin login testado com ao menos 1 conta

## Etapa 7 — Testes de integracao (local -> staging)
Objetivo: garantir que nao houve regressao nas telas principais.

1. Public:
   - `/contato` envia contato e budget e persiste no Postgres
   - `/portfolio` renderiza itens e filtros no front
   - `/loja` renderiza produtos ativos e categorias
2. Admin:
   - `/admindev/login` entra e `isAdmin` libera dashboard
   - CRUD:
     - excluir contatos/orcamentos
     - inserir/atualizar/deletar items do portifolio e produtos
   - upload:
     - subir imagem, gravar `image_url`, e visualizar no portifolio/produtos

Entregavel desta etapa:
- Checklist de testes concluido (e logs de falhas, se houver)

## Etapa 8 — Cutover (colocar online)
1. Preparar variaveis de ambiente:
   - Postgres connection string no backend
   - path/base URL de imagens
2. Subir backend + frontend build e servir imagens
3. Validar:
   - rotas publicas e admin funcional
4. Monitorar:
   - logs de falhas em endpoints de form/CRUD/upload

## Entregaveis gerais (para organizar o trabalho)
- Migrações/SQL do schema Postgres (Etapa 1)
- Backend com endpoints (Etapa 2)
- Frontend substituido por API (Etapa 3)
- Scripts de migração (Etapas 4 e 5)
- Processo de bootstrap de admin (Etapa 6)
- Checklist/testes (Etapa 7)

## Proxima acao recomendada
Como proximo passo, devemos transformar esta doc em tarefas concretas no codigo:
1. Criar schema do Postgres (Etapa 1) e primeira versao das migrações
2. Em paralelo, desenhar os endpoints do backend (Etapa 2) com contratos de request/response

