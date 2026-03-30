export type CategoryEntry = { slug: string; label: string };

export const DEFAULT_PORTFOLIO_CATEGORIES: CategoryEntry[] = [
  { slug: "sistemas", label: "Sistemas" },
  { slug: "plataformas", label: "Plataformas" },
  { slug: "saas", label: "SaaS" },
  { slug: "sites", label: "Sites" },
];

export const DEFAULT_PRODUCT_CATEGORIES: CategoryEntry[] = [
  { slug: "system", label: "Sistema" },
  { slug: "license", label: "Licença" },
  { slug: "template", label: "Template" },
];
