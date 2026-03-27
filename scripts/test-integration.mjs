import fs from "fs";
import path from "path";
import process from "process";

const API_BASE_URL = process.env.API_BASE_URL ?? "http://127.0.0.1:3005";
const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD;
const TEST_IMAGE_PATH =
  process.env.TEST_IMAGE_PATH ?? path.resolve(process.cwd(), "public", "placeholder.svg");

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error("Defina TEST_ADMIN_EMAIL e TEST_ADMIN_PASSWORD.");
  process.exit(1);
}

const checks = [];
const unique = Date.now().toString();
let cookie = "";
let createdPortfolioId = "";
let createdProductId = "";

async function requestJson(url, init = {}) {
  const headers = new Headers(init.headers ?? {});
  if (!headers.has("Content-Type") && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (cookie) headers.set("Cookie", cookie);

  const response = await fetch(`${API_BASE_URL}${url}`, { ...init, headers });
  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  return { response, data };
}

function addCheck(name, ok, details = "") {
  checks.push({ name, ok, details });
}

try {
  {
    const { response, data } = await requestJson("/api/health", { method: "GET" });
    addCheck("health", response.ok && data?.status === "ok", JSON.stringify(data));
  }

  {
    const { response, data } = await requestJson("/api/contact-submissions", {
      method: "POST",
      body: JSON.stringify({
        name: `Teste ${unique}`,
        email: `teste-${unique}@mail.com`,
        phone: null,
        message: "Mensagem de teste da etapa 7",
      }),
    });
    addCheck("public_contact_create", response.status === 201 && data?.ok === true, JSON.stringify(data));
  }

  {
    const { response, data } = await requestJson("/api/budget-submissions", {
      method: "POST",
      body: JSON.stringify({
        name: `Teste ${unique}`,
        email: `teste-${unique}@mail.com`,
        phone: null,
        company: "AgenciaDev",
        project_type: "Sistema de Gestão",
        deadline: "30 dias",
        budget_range: "Até R$ 10.000",
        description: "Descricao de teste para validar endpoint de orcamento",
      }),
    });
    addCheck("public_budget_create", response.status === 201 && data?.ok === true, JSON.stringify(data));
  }

  {
    const { response, data } = await requestJson("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
    });
    cookie = response.headers.get("set-cookie") ?? "";
    addCheck("auth_login", response.ok && data?.ok === true && cookie.length > 0, `cookie=${cookie.length > 0}`);
  }

  {
    const { response, data } = await requestJson("/api/auth/me", { method: "GET" });
    addCheck("auth_me", response.ok && data?.isAdmin === true, JSON.stringify(data));
  }

  {
    const { response, data } = await requestJson("/api/admin/dashboard", { method: "GET" });
    addCheck(
      "admin_dashboard",
      response.ok && Array.isArray(data?.contacts) && Array.isArray(data?.products),
      "colecoes recebidas"
    );
  }

  {
    const { response, data } = await requestJson("/api/admin/portfolio-items", {
      method: "POST",
      body: JSON.stringify({
        title: `Portfolio Teste ${unique}`,
        description: "Item criado para teste de integracao",
        categories: ["sites", "saas"],
        image_url: null,
        technologies: ["React", "Node.js"],
        link: null,
        featured: false,
      }),
    });
    createdPortfolioId = data?.id ?? "";
    addCheck("admin_portfolio_create", response.status === 201 && createdPortfolioId.length > 0, `id=${createdPortfolioId}`);
  }

  if (createdPortfolioId) {
    const { response, data } = await requestJson(`/api/admin/portfolio-items/${createdPortfolioId}`, {
      method: "PUT",
      body: JSON.stringify({
        title: `Portfolio Teste ${unique} Atualizado`,
        description: "Atualizacao de teste",
        categories: ["sites"],
        image_url: null,
        technologies: ["React", "PostgreSQL"],
        link: null,
        featured: true,
      }),
    });
    addCheck("admin_portfolio_update", response.ok && data?.featured === true, JSON.stringify(data));
  }

  if (createdPortfolioId) {
    const { response, data } = await requestJson(`/api/admin/portfolio-items/${createdPortfolioId}`, {
      method: "DELETE",
    });
    addCheck("admin_portfolio_delete", response.ok && data?.ok === true, JSON.stringify(data));
  }

  {
    const { response, data } = await requestJson("/api/admin/products", {
      method: "POST",
      body: JSON.stringify({
        name: `Produto Teste ${unique}`,
        description: "Produto criado para validacao da etapa 7",
        price: 99.9,
        original_price: 149.9,
        categories: ["system", "template"],
        features: ["Feature A", "Feature B"],
        image_url: null,
        popular: false,
        active: true,
      }),
    });
    createdProductId = data?.id ?? "";
    addCheck("admin_product_create", response.status === 201 && createdProductId.length > 0, `id=${createdProductId}`);
  }

  if (createdProductId) {
    const { response, data } = await requestJson(`/api/admin/products/${createdProductId}`, {
      method: "PUT",
      body: JSON.stringify({
        name: `Produto Teste ${unique} Atualizado`,
        description: "Atualizado",
        price: 89.9,
        original_price: 129.9,
        categories: ["system"],
        features: ["Feature A", "Feature B", "Feature C"],
        image_url: null,
        popular: true,
        active: true,
      }),
    });
    addCheck("admin_product_update", response.ok && data?.popular === true, JSON.stringify(data));
  }

  {
    const form = new FormData();
    const fileBuffer = await fs.promises.readFile(TEST_IMAGE_PATH);
    const ext = path.extname(TEST_IMAGE_PATH).toLowerCase();
    const mimeType =
      ext === ".svg"
        ? "image/svg+xml"
        : ext === ".png"
          ? "image/png"
          : ext === ".jpg" || ext === ".jpeg"
            ? "image/jpeg"
            : "image/*";
    const blob = new Blob([fileBuffer], { type: mimeType });
    form.append("file", blob, path.basename(TEST_IMAGE_PATH));
    form.append("bucket", "product-images");
    form.append("folder", "products");

    const uploadResponse = await fetch(`${API_BASE_URL}/api/admin/upload-image`, {
      method: "POST",
      headers: cookie ? { Cookie: cookie } : {},
      body: form,
    });
    const uploadData = await uploadResponse.json();
    addCheck("admin_upload_image", uploadResponse.status === 201 && Boolean(uploadData?.url), JSON.stringify(uploadData));
  }

  if (createdProductId) {
    const { response, data } = await requestJson(`/api/admin/products/${createdProductId}`, {
      method: "DELETE",
    });
    addCheck("admin_product_delete", response.ok && data?.ok === true, JSON.stringify(data));
  }
} catch (error) {
  addCheck("unexpected_error", false, error.message);
}

const failed = checks.filter((c) => !c.ok);
for (const c of checks) {
  console.log(`${c.ok ? "PASS" : "FAIL"} - ${c.name}${c.details ? ` | ${c.details}` : ""}`);
}

if (failed.length > 0) {
  console.error(`\nFalhas: ${failed.length}/${checks.length}`);
  process.exit(1);
}

console.log(`\nTodos os checks passaram: ${checks.length}/${checks.length}`);
