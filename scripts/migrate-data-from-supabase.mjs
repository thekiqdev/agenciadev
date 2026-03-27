/**
 * Etapa 4 (inicio): migracao de dados do Supabase para Postgres local/VPS.
 *
 * Requisitos:
 * - DATABASE_URL=postgresql://...
 * - SUPABASE_URL=https://<project>.supabase.co
 * - SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
 *
 * Uso:
 *   npm run migrate:data
 *
 * Opcional:
 * - MIGRATION_BATCH_SIZE=500
 * - DRY_RUN=true (somente leitura, sem gravar no Postgres)
 */
import process from "process";
import pg from "pg";
import { createClient } from "@supabase/supabase-js";

const { Client } = pg;

const DATABASE_URL = process.env.DATABASE_URL;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BATCH_SIZE = Number(process.env.MIGRATION_BATCH_SIZE ?? 500);
const DRY_RUN = String(process.env.DRY_RUN ?? "").toLowerCase() === "true";

if (!DATABASE_URL) {
  console.error("Defina DATABASE_URL.");
  process.exit(1);
}
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}
if (!Number.isInteger(BATCH_SIZE) || BATCH_SIZE < 1 || BATCH_SIZE > 5000) {
  console.error("MIGRATION_BATCH_SIZE deve ser inteiro entre 1 e 5000.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const pgClient = new Client({ connectionString: DATABASE_URL });

const TABLES = [
  {
    source: "contact_submissions",
    target: "contact_submissions",
    columns: ["id", "name", "email", "phone", "message", "created_at"],
  },
  {
    source: "budget_submissions",
    target: "budget_submissions",
    columns: [
      "id",
      "name",
      "email",
      "phone",
      "company",
      "project_type",
      "deadline",
      "budget_range",
      "description",
      "created_at",
    ],
  },
  {
    source: "portfolio_items",
    target: "portfolio_items",
    columns: [
      "id",
      "title",
      "description",
      "categories",
      "image_url",
      "technologies",
      "link",
      "featured",
      "created_at",
      "updated_at",
    ],
  },
  {
    source: "products",
    target: "products",
    columns: [
      "id",
      "name",
      "description",
      "price",
      "original_price",
      "categories",
      "features",
      "image_url",
      "popular",
      "active",
      "created_at",
      "updated_at",
    ],
  },
];

function buildUpsertQuery(table, columns) {
  const quotedColumns = columns.map((c) => `"${c}"`);
  const valuesPlaceholders = columns.map((_, i) => `$${i + 1}`).join(", ");
  const updateColumns = columns
    .filter((c) => c !== "id")
    .map((c) => `"${c}" = EXCLUDED."${c}"`)
    .join(", ");

  return `
    INSERT INTO "${table}" (${quotedColumns.join(", ")})
    VALUES (${valuesPlaceholders})
    ON CONFLICT ("id")
    DO UPDATE SET ${updateColumns}
  `;
}

async function readBatch(source, columns, from, to) {
  const sourceColumns = [...columns];
  if (sourceColumns.includes("categories")) {
    sourceColumns[sourceColumns.indexOf("categories")] = "category";
  }
  const { data, error } = await supabase
    .from(source)
    .select(sourceColumns.join(","))
    .order("created_at", { ascending: true })
    .range(from, to);

  if (error) throw new Error(`[${source}] leitura falhou: ${error.message}`);
  return (data ?? []).map((row) => {
    if ("category" in row && !("categories" in row)) {
      const category = typeof row.category === "string" ? row.category.trim() : "";
      const { category: _removed, ...rest } = row;
      return { ...rest, categories: category ? [category] : [] };
    }
    return row;
  });
}

async function writeBatch(target, columns, rows) {
  if (rows.length === 0 || DRY_RUN) return;
  const query = buildUpsertQuery(target, columns);
  for (const row of rows) {
    const values = columns.map((c) => row[c] ?? null);
    await pgClient.query(query, values);
  }
}

async function migrateTable(def) {
  let offset = 0;
  let migrated = 0;

  while (true) {
    const rows = await readBatch(def.source, def.columns, offset, offset + BATCH_SIZE - 1);
    if (rows.length === 0) break;

    await writeBatch(def.target, def.columns, rows);
    migrated += rows.length;
    offset += rows.length;

    console.log(`[${def.source}] lote ${rows.length} (total ${migrated})`);
  }

  console.log(`[${def.source}] finalizado: ${migrated} registro(s).`);
}

await pgClient.connect();
try {
  if (!DRY_RUN) await pgClient.query("BEGIN");

  for (const tableDef of TABLES) {
    await migrateTable(tableDef);
  }

  if (!DRY_RUN) await pgClient.query("COMMIT");
  console.log(DRY_RUN ? "DRY_RUN concluido." : "Migracao de dados concluida com sucesso.");
} catch (error) {
  if (!DRY_RUN) {
    await pgClient.query("ROLLBACK");
  }
  console.error("Falha na migracao de dados:", error.message);
  process.exitCode = 1;
} finally {
  await pgClient.end();
}
