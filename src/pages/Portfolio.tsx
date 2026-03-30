import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ExternalLink, X, FolderOpen } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch } from "@/integrations/api/client";
import { GalleryLightbox, orderedGalleryUrls } from "@/components/GalleryLightbox";

type Category = "todos" | "sistemas" | "plataformas" | "saas" | "sites";

interface PortfolioItem {
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

const categories = [
  { id: "todos", label: "Todos" },
  { id: "sistemas", label: "Sistemas" },
  { id: "plataformas", label: "Plataformas" },
  { id: "saas", label: "SaaS" },
  { id: "sites", label: "Sites" },
];

const Portfolio = () => {
  const [activeCategory, setActiveCategory] = useState<Category>("todos");
  const [selectedProject, setSelectedProject] = useState<PortfolioItem | null>(null);
  const [galleryLightbox, setGalleryLightbox] = useState<{ urls: string[]; index: number } | null>(null);
  const [projects, setProjects] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const data = await apiFetch<PortfolioItem[]>("/api/portfolio-items");
      setProjects(data || []);
    } catch (error) {
      console.error("Erro ao carregar portfólio:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(
    (project) => activeCategory === "todos" || (project.categories ?? []).includes(activeCategory)
  );
  const stripHtml = (value: string) => value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

  const galleryForModal = (project: PortfolioItem) =>
    (project.gallery_urls ?? []).filter((u) => u && u !== project.image_url);

  return (
    <div className="min-h-screen bg-background pt-24">
      {/* Hero */}
      <section className="py-16 relative">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Nosso <span className="text-gradient">Portfólio</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Conheça alguns dos projetos que desenvolvemos. Cada um representa 
              um desafio único que superamos com tecnologia e criatividade.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id as Category)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeCategory === category.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/50"
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="rounded-xl border border-border bg-card overflow-hidden">
                  <Skeleton className="aspect-video w-full" />
                  <div className="p-6 space-y-3">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-20">
              <FolderOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nenhum projeto encontrado</h3>
              <p className="text-muted-foreground">
                {activeCategory === "todos"
                  ? "Ainda não há projetos cadastrados no portfólio."
                  : "Não há projetos nesta categoria."}
              </p>
            </div>
          ) : (
            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredProjects.map((project) => (
                  <motion.div
                    key={project.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    onClick={() => setSelectedProject(project)}
                    className="group cursor-pointer relative overflow-hidden rounded-xl border border-border bg-card hover:border-primary/50 transition-all duration-300"
                  >
                    <div className="aspect-video overflow-hidden">
                      {project.image_url ? (
                        <img
                          src={project.image_url}
                          alt={project.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <FolderOpen className="w-12 h-12 text-muted-foreground" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-medium text-primary uppercase tracking-wider">
                          {(project.categories ?? []).join(", ")}
                        </span>
                        {project.featured && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-accent/20 text-accent">
                            Destaque
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-bold mb-2 text-foreground group-hover:text-primary transition-colors">
                        {project.title}
                      </h3>
                      <p className="text-muted-foreground text-sm line-clamp-2">
                        {stripHtml(project.description)}
                      </p>
                      {project.technologies && project.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                          {project.technologies.slice(0, 3).map((tech) => (
                            <span
                              key={tech}
                              className="px-2 py-1 text-xs rounded-md bg-muted text-muted-foreground"
                            >
                              {tech}
                            </span>
                          ))}
                          {project.technologies.length > 3 && (
                            <span className="px-2 py-1 text-xs rounded-md bg-muted text-muted-foreground">
                              +{project.technologies.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </section>

      {/* Project Modal */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setGalleryLightbox(null);
              setSelectedProject(null);
            }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="relative">
                {selectedProject.image_url ? (
                  <button
                    type="button"
                    className="block w-full cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-t-2xl"
                    onClick={(e) => {
                      e.stopPropagation();
                      const urls = orderedGalleryUrls(selectedProject.image_url, selectedProject.gallery_urls);
                      if (urls.length) setGalleryLightbox({ urls, index: 0 });
                    }}
                  >
                    <img
                      src={selectedProject.image_url}
                      alt={selectedProject.title}
                      className="w-full h-64 object-cover rounded-t-2xl"
                    />
                  </button>
                ) : (
                  <div className="w-full h-64 bg-muted flex items-center justify-center rounded-t-2xl">
                    <FolderOpen className="w-16 h-16 text-muted-foreground" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setGalleryLightbox(null);
                    setSelectedProject(null);
                  }}
                  className="absolute top-4 right-4 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center text-foreground hover:text-primary transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 md:p-8">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium text-primary uppercase tracking-wider">
                    {(selectedProject.categories ?? []).join(", ")}
                  </span>
                  {selectedProject.featured && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-accent/20 text-accent">
                      Destaque
                    </span>
                  )}
                </div>
                <h2 className="text-2xl md:text-3xl font-bold mt-2 mb-4 text-foreground">
                  {selectedProject.title}
                </h2>
                <div
                  className="text-muted-foreground mb-6 text-lg prose prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: selectedProject.description }}
                />

                {galleryForModal(selectedProject).length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-4 text-foreground">Galeria</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {galleryForModal(selectedProject).map((url) => {
                        const urls = orderedGalleryUrls(selectedProject.image_url, selectedProject.gallery_urls);
                        const idx = Math.max(0, urls.indexOf(url));
                        return (
                          <button
                            key={url}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setGalleryLightbox({ urls, index: idx });
                            }}
                            className="block aspect-video rounded-lg overflow-hidden border border-border bg-muted hover:border-primary/50 transition-colors text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                          >
                            <img src={url} alt="" className="w-full h-full object-cover" loading="lazy" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {selectedProject.technologies && selectedProject.technologies.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3 text-foreground">Tecnologias</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="px-3 py-1.5 text-sm rounded-lg bg-muted text-muted-foreground"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-4">
                  {selectedProject.link && (
                    <a
                      href={selectedProject.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
                    >
                      <ExternalLink size={18} />
                      Ver Projeto
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <GalleryLightbox
        open={galleryLightbox !== null}
        onOpenChange={(open) => {
          if (!open) setGalleryLightbox(null);
        }}
        images={galleryLightbox?.urls ?? []}
        initialIndex={galleryLightbox?.index ?? 0}
        title={selectedProject?.title ?? "Galeria"}
      />

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Quer ver seu projeto <span className="text-gradient">aqui</span>?
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Vamos conversar sobre como podemos transformar sua ideia em realidade.
            </p>
            <Link to="/contato" className="cyber-button text-lg inline-block">
              <span>Iniciar Projeto</span>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Portfolio;
