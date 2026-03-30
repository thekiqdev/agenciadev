BEGIN;

ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS portfolio_categories JSONB NOT NULL DEFAULT '[
    {"slug":"sistemas","label":"Sistemas"},
    {"slug":"plataformas","label":"Plataformas"},
    {"slug":"saas","label":"SaaS"},
    {"slug":"sites","label":"Sites"}
  ]'::jsonb,
  ADD COLUMN IF NOT EXISTS product_categories JSONB NOT NULL DEFAULT '[
    {"slug":"system","label":"Sistema"},
    {"slug":"license","label":"Licença"},
    {"slug":"template","label":"Template"}
  ]'::jsonb;

COMMIT;
