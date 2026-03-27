/**
 * Etapa 1.1: cria/atualiza usuario admin inicial.
 *
 * Uso:
 *   DATABASE_URL=postgresql://... ADMIN_EMAIL=admin@site.com ADMIN_PASSWORD='SenhaForte123!' npm run seed:admin
 *
 * Comportamento:
 * - cria usuario se nao existir
 * - se existir, atualiza password_hash/is_active
 * - garante role admin em user_roles
 */
import pg from "pg";
import bcrypt from "bcryptjs";

const { Client } = pg;

const databaseUrl = process.env.DATABASE_URL;
const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;
const rounds = Number(process.env.BCRYPT_ROUNDS ?? 12);

if (!databaseUrl) {
  console.error("Defina DATABASE_URL.");
  process.exit(1);
}

if (!email || !password) {
  console.error("Defina ADMIN_EMAIL e ADMIN_PASSWORD.");
  process.exit(1);
}

if (password.length < 8) {
  console.error("ADMIN_PASSWORD deve ter no minimo 8 caracteres.");
  process.exit(1);
}

if (!Number.isInteger(rounds) || rounds < 10 || rounds > 15) {
  console.error("BCRYPT_ROUNDS deve ser inteiro entre 10 e 15.");
  process.exit(1);
}

const client = new Client({ connectionString: databaseUrl });
await client.connect();

try {
  await client.query("BEGIN");

  const passwordHash = await bcrypt.hash(password, rounds);

  const userResult = await client.query(
    `
      INSERT INTO users (email, password_hash, is_active)
      VALUES ($1, $2, true)
      ON CONFLICT (email)
      DO UPDATE SET
        password_hash = EXCLUDED.password_hash,
        is_active = true,
        updated_at = now()
      RETURNING id, email
    `,
    [email, passwordHash]
  );

  const user = userResult.rows[0];

  await client.query(
    `
      INSERT INTO user_roles (user_id, role)
      VALUES ($1, 'admin')
      ON CONFLICT (user_id, role) DO NOTHING
    `,
    [user.id]
  );

  await client.query("COMMIT");
  console.log(`Admin pronto: ${user.email}`);
} catch (error) {
  await client.query("ROLLBACK");
  console.error("Falha ao criar admin:", error.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
