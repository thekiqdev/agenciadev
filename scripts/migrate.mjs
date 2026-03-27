/**
 * Aplica todos os arquivos .sql em postgres/migrations em ordem lexicográfica.
 * Uso na VPS / CI: DATABASE_URL=postgresql://... npm run migrate
 *
 * Opcional:
 * - MIGRATIONS_DIR=./alguma/pasta/sql npm run migrate
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const { Client } = pg;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = process.env.MIGRATIONS_DIR
  ? path.resolve(process.cwd(), process.env.MIGRATIONS_DIR)
  : path.join(__dirname, "..", "postgres", "migrations");

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl || !String(databaseUrl).trim()) {
  console.error("Defina DATABASE_URL (ex.: postgresql://user:pass@host:5432/dbname)");
  process.exit(1);
}

const client = new Client({ connectionString: databaseUrl });

const files = fs
  .readdirSync(migrationsDir)
  .filter((f) => f.endsWith(".sql"))
  .sort();

if (files.length === 0) {
  console.error(`Nenhum arquivo .sql encontrado em ${migrationsDir}`);
  process.exit(1);
}

await client.connect();
try {
  for (const file of files) {
    const full = path.join(migrationsDir, file);
    const sql = fs.readFileSync(full, "utf8");
    console.log(`→ ${file}`);
    await client.query(sql);
  }
  console.log("Migrações aplicadas com sucesso.");
} catch (err) {
  console.error("Erro ao aplicar migrações:", err.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
