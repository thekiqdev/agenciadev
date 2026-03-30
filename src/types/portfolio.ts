export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  categories: string[];
  image_url: string | null;
  gallery_urls?: string[] | null;
  technologies: string[] | null;
  link: string | null;
  featured: boolean | null;
  created_at: string;
}
