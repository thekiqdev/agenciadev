/**
 * Etapa 6: verifica bootstrap de admin.
 *
 * Uso:
 *   DATABASE_URL=postgresql://... ADMIN_EMAIL=admin@site.com npm run verify:admin
 */
import process from "process";
import pg from "pg";

const { Client } = pg;

const databaseUrl = process.env.DATABASE_URL;
const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();

if (!databaseUrl) {
  console.error("Defina DATABASE_URL.");
  process.exit(1);
}
if (!adminEmail) {
  console.error("Defina ADMIN_EMAIL.");
  process.exit(1);
}

const client = new Client({ connectionString: databaseUrl });
await client.connect();

try {
  const userRes = await client.query(
    `
      SELECT id, email, is_active, created_at, last_login_at
      FROM users
      WHERE email = $1
      LIMIT 1
    `,
    [adminEmail]
  );

  if (userRes.rowCount === 0) {
    console.error(`Admin nao encontrado: ${adminEmail}`);
    process.exitCode = 1;
  } else {
    const user = userRes.rows[0];
    const roleRes = await client.query(
      `
        SELECT role
        FROM user_roles
        WHERE user_id = $1
      `,
      [user.id]
    );
    const roles = roleRes.rows.map((r) => r.role);
    const isAdmin = roles.includes("admin");

    if (!user.is_active) {
      console.error(`Usuario encontrado mas inativo: ${user.email}`);
      process.exitCode = 1;
    } else if (!isAdmin) {
      console.error(`Usuario encontrado sem role admin: ${user.email}`);
      process.exitCode = 1;
    } else {
      console.log("Bootstrap admin validado com sucesso.");
      console.log(
        JSON.stringify(
          {
            email: user.email,
            isActive: user.is_active,
            roles,
            createdAt: user.created_at,
            lastLoginAt: user.last_login_at,
          },
          null,
          2
        )
      );
    }
  }
} catch (error) {
  console.error("Falha ao verificar admin:", error.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
