/**
 * Aplica todos os arquivos .sql em postgres/migrations em ordem lexicográfica.
 * Uso na VPS / CI: DATABASE_URL=postgresql://... npm run migrate
 *
 * Local: carrega `.env` na raiz (se existir) e, em desenvolvimento, usa o mesmo
 * Postgres do docker-compose (porta host 5435) quando DATABASE_URL não estiver definida.
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
const projectRoot = path.resolve(__dirname, "..");

function loadEnvFromDotenv() {
  const envPath = path.join(projectRoot, ".env");
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, "utf8");
  for (const line of content.split(/\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

loadEnvFromDotenv();

const IS_PROD = process.env.NODE_ENV === "production";
const DEFAULT_LOCAL_DATABASE_URL =
  "postgresql://postgres:postgres@127.0.0.1:5435/agenciadev";

const migrationsDir = process.env.MIGRATIONS_DIR
  ? path.resolve(process.cwd(), process.env.MIGRATIONS_DIR)
  : path.join(projectRoot, "postgres", "migrations");

let databaseUrl = process.env.DATABASE_URL?.trim();
if (!databaseUrl && !IS_PROD) {
  databaseUrl = DEFAULT_LOCAL_DATABASE_URL;
  console.info(
    "[migrate] DATABASE_URL não definida; usando Postgres local (127.0.0.1:5435/agenciadev). Copie .env.example para .env para personalizar."
  );
}

if (!databaseUrl) {
  console.error(
    "Defina DATABASE_URL (ex.: postgresql://user:pass@host:5432/dbname) ou crie .env com DATABASE_URL."
  );
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
