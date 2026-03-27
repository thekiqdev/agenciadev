BEGIN;

ALTER TABLE portfolio_items
  ADD COLUMN IF NOT EXISTS categories TEXT[] NOT NULL DEFAULT '{}';

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'portfolio_items' AND column_name = 'category'
  ) THEN
    EXECUTE '
      UPDATE portfolio_items
      SET categories = CASE
        WHEN category IS NULL OR btrim(category) = '''' THEN ''{}''
        ELSE ARRAY[category]
      END
      WHERE categories = ''{}''
    ';
  END IF;
END
$$;

ALTER TABLE portfolio_items
  DROP COLUMN IF EXISTS category;

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS categories TEXT[] NOT NULL DEFAULT '{}';

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'category'
  ) THEN
    EXECUTE '
      UPDATE products
      SET categories = CASE
        WHEN category IS NULL OR btrim(category) = '''' THEN ''{}''
        ELSE ARRAY[category]
      END
      WHERE categories = ''{}''
    ';
  END IF;
END
$$;

ALTER TABLE products
  DROP COLUMN IF EXISTS category;

COMMIT;
