-- Galeria de imagens adicionais (além da imagem de destaque) em portfólio e produtos

BEGIN;

ALTER TABLE portfolio_items
  ADD COLUMN IF NOT EXISTS gallery_urls TEXT[] NOT NULL DEFAULT '{}';

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS gallery_urls TEXT[] NOT NULL DEFAULT '{}';

COMMIT;
