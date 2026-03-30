/**
 * API Etapa 2:
 * - Auth admin via JWT em cookie HttpOnly
 * - Rotas publicas (contato/orcamento/portfolio/produtos)
 * - Rotas admin (CRUD)
 * - Upload de imagem em filesystem local
 */
import fs from "fs";
import path from "path";
import process from "process";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import multer from "multer";
import pg from "pg";

const { Pool } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

const IS_PROD = process.env.NODE_ENV === "production";

/** Alinhado a docker-compose.yml (postgres:16, porta host 5435) */
const DEFAULT_LOCAL_DATABASE_URL =
  "postgresql://postgres:postgres@127.0.0.1:5435/agenciadev";
/** Somente desenvolvimento; em producao defina JWT_SECRET no ambiente */
const DEFAULT_DEV_JWT_SECRET = "agenciadev-local-dev-jwt-secret-min-16";

const PORT = Number(process.env.PORT ?? process.env.API_PORT ?? 3005);
const HOST = process.env.HOST ?? "0.0.0.0";
const DATABASE_URL =
  process.env.DATABASE_URL ?? (!IS_PROD ? DEFAULT_LOCAL_DATABASE_URL : undefined);
const JWT_SECRET =
  process.env.JWT_SECRET ?? (!IS_PROD ? DEFAULT_DEV_JWT_SECRET : undefined);
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? "7d";
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN ?? "http://localhost:9090";
const UPLOAD_BASE_DIR = process.env.UPLOAD_DIR ?? path.join(projectRoot, "uploads");
const PRODUCT_IMAGE_DIR = path.join(UPLOAD_BASE_DIR, "product-images");

if (!DATABASE_URL) {
  console.error("[api] Defina DATABASE_URL.");
  process.exit(1);
}
if (!JWT_SECRET || JWT_SECRET.length < 16) {
  console.error("[api] Defina JWT_SECRET com pelo menos 16 caracteres.");
  process.exit(1);
}

if (!IS_PROD && !process.env.DATABASE_URL) {
  console.info("[api] DATABASE_URL nao definida; usando Postgres local (127.0.0.1:5435/agenciadev).");
}

fs.mkdirSync(PRODUCT_IMAGE_DIR, { recursive: true });

const pool = new Pool({ connectionString: DATABASE_URL });
const app = express();

app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    credentials: true,
  })
);
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());
app.use("/uploads", express.static(UPLOAD_BASE_DIR));

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, PRODUCT_IMAGE_DIR),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname || "").toLowerCase();
      cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Apenas imagens sao permitidas"));
  },
});

function setAuthCookie(res, token) {
  res.cookie("access_token", token, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

function clearAuthCookie(res) {
  res.clearCookie("access_token", {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: "lax",
    path: "/",
  });
}

function authRequired(req, res, next) {
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json({ error: "unauthorized" });
  try {
    req.auth = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "invalid_token" });
  }
}

async function adminRequired(req, res, next) {
  const userId = req.auth?.sub;
  if (!userId) return res.status(401).json({ error: "unauthorized" });
  try {
    const result = await pool.query(
      "SELECT 1 FROM user_roles WHERE user_id = $1 AND role = 'admin' LIMIT 1",
      [userId]
    );
    if (result.rowCount === 0) return res.status(403).json({ error: "forbidden" });
    next();
  } catch (error) {
    return res.status(500).json({ error: "admin_check_failed", detail: error.message });
  }
}

function requireFields(payload, required) {
  return required.filter((k) => !payload?.[k]);
}

function normalizeCategories(payload) {
  if (Array.isArray(payload?.categories)) {
    return payload.categories.map((v) => String(v).trim()).filter(Boolean);
  }
  if (typeof payload?.category === "string" && payload.category.trim()) {
    return [payload.category.trim()];
  }
  return [];
}

/** URLs de imagens extras (galeria); máx. 30 entradas */
function normalizeGalleryUrls(payload) {
  const raw = payload?.gallery_urls;
  if (!Array.isArray(raw)) return [];
  return raw
    .map((u) => (typeof u === "string" ? u.trim() : ""))
    .filter(Boolean)
    .slice(0, 30);
}

const DEFAULT_PORTFOLIO_CATEGORIES = [
  { slug: "sistemas", label: "Sistemas" },
  { slug: "plataformas", label: "Plataformas" },
  { slug: "saas", label: "SaaS" },
  { slug: "sites", label: "Sites" },
];

const DEFAULT_PRODUCT_CATEGORIES = [
  { slug: "system", label: "Sistema" },
  { slug: "license", label: "Licença" },
  { slug: "template", label: "Template" },
];

function normalizeCategoryCatalog(list) {
  if (!Array.isArray(list)) return null;
  const out = [];
  const seen = new Set();
  for (const item of list) {
    if (!item || typeof item !== "object") continue;
    let slug = String(item.slug ?? "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "");
    const label = String(item.label ?? "").trim();
    if (!slug || !label) continue;
    if (seen.has(slug)) continue;
    seen.add(slug);
    out.push({ slug, label });
  }
  return out.length ? out : null;
}

function mapCategoryJsonb(value) {
  if (value == null) return null;
  let raw = value;
  if (typeof value === "string") {
    try {
      raw = JSON.parse(value);
    } catch {
      return null;
    }
  }
  if (!Array.isArray(raw)) return null;
  return normalizeCategoryCatalog(raw);
}

function mapSiteSettingsRow(row) {
  if (!row) {
    return {
      site_name: "Agencia Dev",
      seo_description: "",
      whatsapp_number: "",
      portfolio_categories: DEFAULT_PORTFOLIO_CATEGORIES,
      product_categories: DEFAULT_PRODUCT_CATEGORIES,
      updated_at: null,
    };
  }
  let pc;
  let pr;
  try {
    pc = mapCategoryJsonb(row.portfolio_categories) ?? DEFAULT_PORTFOLIO_CATEGORIES;
  } catch {
    pc = DEFAULT_PORTFOLIO_CATEGORIES;
  }
  try {
    pr = mapCategoryJsonb(row.product_categories) ?? DEFAULT_PRODUCT_CATEGORIES;
  } catch {
    pr = DEFAULT_PRODUCT_CATEGORIES;
  }
  return {
    site_name: row.site_name,
    seo_description: row.seo_description,
    whatsapp_number: row.whatsapp_number,
    portfolio_categories: pc,
    product_categories: pr,
    updated_at: row.updated_at,
  };
}

app.get(["/health", "/api/health"], (_req, res) => {
  res.json({ status: "ok", service: "agenciadev-api", port: PORT, time: new Date().toISOString() });
});

// Auth
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) return res.status(400).json({ error: "email_and_password_required" });

  try {
    const userResult = await pool.query(
      "SELECT id, email, password_hash, is_active FROM users WHERE email = $1 LIMIT 1",
      [String(email).toLowerCase().trim()]
    );
    const user = userResult.rows[0];
    if (!user || !user.is_active) return res.status(401).json({ error: "invalid_credentials" });

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) return res.status(401).json({ error: "invalid_credentials" });

    await pool.query("UPDATE users SET last_login_at = now() WHERE id = $1", [user.id]);

    const roleResult = await pool.query(
      "SELECT role FROM user_roles WHERE user_id = $1 ORDER BY role ASC",
      [user.id]
    );
    const roles = roleResult.rows.map((r) => r.role);
    const token = jwt.sign({ sub: user.id, email: user.email, roles }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });
    setAuthCookie(res, token);
    return res.json({ ok: true, user: { id: user.id, email: user.email, roles } });
  } catch (error) {
    return res.status(500).json({ error: "login_failed", detail: error.message });
  }
});

app.get("/api/auth/me", authRequired, async (req, res) => {
  const userId = req.auth?.sub;
  try {
    const result = await pool.query(
      `
        SELECT u.id, u.email, u.is_active,
          EXISTS (
            SELECT 1 FROM user_roles ur
            WHERE ur.user_id = u.id AND ur.role = 'admin'
          ) AS is_admin
        FROM users u
        WHERE u.id = $1
        LIMIT 1
      `,
      [userId]
    );
    if (result.rowCount === 0) return res.status(401).json({ error: "unauthorized" });
    const row = result.rows[0];
    return res.json({ userId: row.id, email: row.email, isAdmin: row.is_admin });
  } catch (error) {
    return res.status(500).json({ error: "me_failed", detail: error.message });
  }
});

app.post("/api/auth/logout", (_req, res) => {
  clearAuthCookie(res);
  return res.json({ ok: true });
});

// Public routes
app.post("/api/contact-submissions", async (req, res) => {
  const missing = requireFields(req.body, ["name", "email", "message"]);
  if (missing.length) return res.status(400).json({ error: "missing_fields", fields: missing });

  const { name, email, phone = null, message } = req.body;
  try {
    await pool.query(
      `
      INSERT INTO contact_submissions (name, email, phone, message)
      VALUES ($1, $2, $3, $4)
      `,
      [name, email, phone, message]
    );
    return res.status(201).json({ ok: true });
  } catch (error) {
    return res.status(500).json({ error: "create_contact_failed", detail: error.message });
  }
});

app.post("/api/budget-submissions", async (req, res) => {
  const missing = requireFields(req.body, ["name", "email", "project_type", "description"]);
  if (missing.length) return res.status(400).json({ error: "missing_fields", fields: missing });

  const {
    name,
    email,
    phone = null,
    company = null,
    project_type,
    deadline = null,
    budget_range = null,
    description,
  } = req.body;

  try {
    await pool.query(
      `
      INSERT INTO budget_submissions
      (name, email, phone, company, project_type, deadline, budget_range, description)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `,
      [name, email, phone, company, project_type, deadline, budget_range, description]
    );
    return res.status(201).json({ ok: true });
  } catch (error) {
    return res.status(500).json({ error: "create_budget_failed", detail: error.message });
  }
});

app.get("/api/portfolio-items", async (_req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM portfolio_items ORDER BY featured DESC, created_at DESC"
    );
    return res.json(result.rows);
  } catch (error) {
    return res.status(500).json({ error: "list_portfolio_failed", detail: error.message });
  }
});

app.get("/api/products", async (_req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM products WHERE active = true ORDER BY popular DESC, created_at DESC"
    );
    return res.json(result.rows);
  } catch (error) {
    return res.status(500).json({ error: "list_products_failed", detail: error.message });
  }
});

app.get("/api/settings", async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT site_name, seo_description, whatsapp_number, portfolio_categories, product_categories, updated_at
       FROM site_settings WHERE id = 1 LIMIT 1`
    );
    return res.json(mapSiteSettingsRow(result.rows[0]));
  } catch (error) {
    return res.status(500).json({ error: "settings_failed", detail: error.message });
  }
});

// Admin routes
app.get("/api/admin/dashboard", authRequired, adminRequired, async (_req, res) => {
  try {
    const [contacts, budgets, portfolio, products] = await Promise.all([
      pool.query("SELECT * FROM contact_submissions ORDER BY created_at DESC"),
      pool.query("SELECT * FROM budget_submissions ORDER BY created_at DESC"),
      pool.query("SELECT * FROM portfolio_items ORDER BY created_at DESC"),
      pool.query("SELECT * FROM products ORDER BY created_at DESC"),
    ]);
    return res.json({
      contacts: contacts.rows,
      budgets: budgets.rows,
      portfolio: portfolio.rows,
      products: products.rows,
    });
  } catch (error) {
    return res.status(500).json({ error: "dashboard_failed", detail: error.message });
  }
});

app.delete("/api/admin/contact-submissions/:id", authRequired, adminRequired, async (req, res) => {
  try {
    await pool.query("DELETE FROM contact_submissions WHERE id = $1", [req.params.id]);
    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ error: "delete_contact_failed", detail: error.message });
  }
});

app.delete("/api/admin/budget-submissions/:id", authRequired, adminRequired, async (req, res) => {
  try {
    await pool.query("DELETE FROM budget_submissions WHERE id = $1", [req.params.id]);
    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ error: "delete_budget_failed", detail: error.message });
  }
});

app.post("/api/admin/portfolio-items", authRequired, adminRequired, async (req, res) => {
  const missing = requireFields(req.body, ["title", "description"]);
  if (missing.length) return res.status(400).json({ error: "missing_fields", fields: missing });
  const {
    title,
    description,
    image_url = null,
    technologies = [],
    link = null,
    featured = false,
  } = req.body;
  const categories = normalizeCategories(req.body);
  const gallery_urls = normalizeGalleryUrls(req.body);
  if (categories.length === 0) {
    return res.status(400).json({ error: "missing_fields", fields: ["categories"] });
  }
  try {
    const result = await pool.query(
      `
      INSERT INTO portfolio_items
      (title, description, categories, image_url, gallery_urls, technologies, link, featured)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
      `,
      [title, description, categories, image_url, gallery_urls, technologies, link, featured]
    );
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ error: "create_portfolio_failed", detail: error.message });
  }
});

app.put("/api/admin/portfolio-items/:id", authRequired, adminRequired, async (req, res) => {
  const {
    title,
    description,
    image_url = null,
    technologies = [],
    link = null,
    featured = false,
  } = req.body;
  const categories = normalizeCategories(req.body);
  const gallery_urls = normalizeGalleryUrls(req.body);
  if (categories.length === 0) {
    return res.status(400).json({ error: "missing_fields", fields: ["categories"] });
  }
  try {
    const result = await pool.query(
      `
      UPDATE portfolio_items
      SET title = $2, description = $3, categories = $4, image_url = $5, gallery_urls = $6,
          technologies = $7, link = $8, featured = $9
      WHERE id = $1
      RETURNING *
      `,
      [req.params.id, title, description, categories, image_url, gallery_urls, technologies, link, featured]
    );
    return res.json(result.rows[0] ?? null);
  } catch (error) {
    return res.status(500).json({ error: "update_portfolio_failed", detail: error.message });
  }
});

app.delete("/api/admin/portfolio-items/:id", authRequired, adminRequired, async (req, res) => {
  try {
    await pool.query("DELETE FROM portfolio_items WHERE id = $1", [req.params.id]);
    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ error: "delete_portfolio_failed", detail: error.message });
  }
});

app.post("/api/admin/products", authRequired, adminRequired, async (req, res) => {
  const missing = requireFields(req.body, ["name", "description", "price"]);
  if (missing.length) return res.status(400).json({ error: "missing_fields", fields: missing });
  const {
    name,
    description,
    price,
    original_price = null,
    features = [],
    image_url = null,
    popular = false,
    active = true,
  } = req.body;
  const categories = normalizeCategories(req.body);
  const gallery_urls = normalizeGalleryUrls(req.body);
  if (categories.length === 0) {
    return res.status(400).json({ error: "missing_fields", fields: ["categories"] });
  }
  try {
    const result = await pool.query(
      `
      INSERT INTO products
      (name, description, price, original_price, categories, features, image_url, gallery_urls, popular, active)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
      `,
      [name, description, price, original_price, categories, features, image_url, gallery_urls, popular, active]
    );
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ error: "create_product_failed", detail: error.message });
  }
});

app.put("/api/admin/products/:id", authRequired, adminRequired, async (req, res) => {
  const {
    name,
    description,
    price,
    original_price = null,
    features = [],
    image_url = null,
    popular = false,
    active = true,
  } = req.body;
  const categories = normalizeCategories(req.body);
  const gallery_urls = normalizeGalleryUrls(req.body);
  if (categories.length === 0) {
    return res.status(400).json({ error: "missing_fields", fields: ["categories"] });
  }
  try {
    const result = await pool.query(
      `
      UPDATE products
      SET name = $2, description = $3, price = $4, original_price = $5, categories = $6,
          features = $7, image_url = $8, gallery_urls = $9, popular = $10, active = $11
      WHERE id = $1
      RETURNING *
      `,
      [req.params.id, name, description, price, original_price, categories, features, image_url, gallery_urls, popular, active]
    );
    return res.json(result.rows[0] ?? null);
  } catch (error) {
    return res.status(500).json({ error: "update_product_failed", detail: error.message });
  }
});

app.delete("/api/admin/products/:id", authRequired, adminRequired, async (req, res) => {
  try {
    await pool.query("DELETE FROM products WHERE id = $1", [req.params.id]);
    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ error: "delete_product_failed", detail: error.message });
  }
});

app.get("/api/admin/settings", authRequired, adminRequired, async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT site_name, seo_description, whatsapp_number, portfolio_categories, product_categories, updated_at
       FROM site_settings WHERE id = 1 LIMIT 1`
    );
    return res.json(mapSiteSettingsRow(result.rows[0]));
  } catch (error) {
    return res.status(500).json({ error: "admin_settings_failed", detail: error.message });
  }
});

app.put("/api/admin/settings/categories", authRequired, adminRequired, async (req, res) => {
  const { portfolio_categories, product_categories } = req.body ?? {};
  const pc = normalizeCategoryCatalog(portfolio_categories);
  const pr = normalizeCategoryCatalog(product_categories);
  if (!pc || !pr) {
    return res.status(400).json({
      error: "invalid_categories",
      detail: "Informe ao menos uma categoria válida (identificador e nome) em cada lista.",
    });
  }
  try {
    const result = await pool.query(
      `UPDATE site_settings
       SET portfolio_categories = $1::jsonb, product_categories = $2::jsonb
       WHERE id = 1
       RETURNING site_name, seo_description, whatsapp_number, portfolio_categories, product_categories, updated_at`,
      [JSON.stringify(pc), JSON.stringify(pr)]
    );
    return res.json(mapSiteSettingsRow(result.rows[0]));
  } catch (error) {
    return res.status(500).json({ error: "update_categories_failed", detail: error.message });
  }
});

app.put("/api/admin/settings", authRequired, adminRequired, async (req, res) => {
  const { site_name, seo_description, whatsapp_number } = req.body ?? {};
  if (!site_name || !seo_description || !whatsapp_number) {
    return res.status(400).json({
      error: "missing_fields",
      fields: ["site_name", "seo_description", "whatsapp_number"],
    });
  }

  try {
    const result = await pool.query(
      `
      INSERT INTO site_settings (id, site_name, seo_description, whatsapp_number)
      VALUES (1, $1, $2, $3)
      ON CONFLICT (id)
      DO UPDATE SET
        site_name = EXCLUDED.site_name,
        seo_description = EXCLUDED.seo_description,
        whatsapp_number = EXCLUDED.whatsapp_number
      RETURNING site_name, seo_description, whatsapp_number, portfolio_categories, product_categories, updated_at
      `,
      [site_name, seo_description, whatsapp_number]
    );
    return res.json(mapSiteSettingsRow(result.rows[0]));
  } catch (error) {
    return res.status(500).json({ error: "update_settings_failed", detail: error.message });
  }
});

app.post("/api/admin/upload-image", authRequired, adminRequired, upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "file_required" });
  const publicBase =
    process.env.UPLOAD_PUBLIC_BASE_URL ?? `${FRONTEND_ORIGIN.replace(":9090", `:${PORT}`)}`;
  const url = `${publicBase}/uploads/product-images/${req.file.filename}`;
  return res.status(201).json({ url, filename: req.file.filename });
});

app.use((err, _req, res, _next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: "upload_error", detail: err.message });
  }
  if (err) {
    return res.status(500).json({ error: "server_error", detail: err.message });
  }
  return res.status(500).json({ error: "unknown_error" });
});

const server = app.listen(PORT, HOST, () => {
  console.log(`[api] http://127.0.0.1:${PORT}/health`);
});
server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(
      `[api] Porta ${PORT} ja esta em uso (outra instancia da API?). Encerre esse processo ou defina PORT com outro valor no .env.`
    );
    console.error(`[api] Windows: netstat -ano | findstr :${PORT}`);
  } else {
    console.error("[api]", err);
  }
  process.exit(1);
});
