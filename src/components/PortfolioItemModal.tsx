import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, X, FolderOpen } from "lucide-react";
import { GalleryLightbox, orderedGalleryUrls } from "@/components/GalleryLightbox";
import type { PortfolioItem } from "@/types/portfolio";

function galleryExtras(project: PortfolioItem) {
  return (project.gallery_urls ?? []).filter((u) => u && u !== project.image_url);
}

type PortfolioItemModalProps = {
  project: PortfolioItem | null;
  onClose: () => void;
};

export function PortfolioItemModal({ project, onClose }: PortfolioItemModalProps) {
  const [galleryLightbox, setGalleryLightbox] = useState<{ urls: string[]; index: number } | null>(null);

  const handleClose = () => {
    setGalleryLightbox(null);
    onClose();
  };

  return (
    <>
      <AnimatePresence>
        {project && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
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
                {project.image_url ? (
                  <button
                    type="button"
                    className="block w-full cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-t-2xl"
                    onClick={(e) => {
                      e.stopPropagation();
                      const urls = orderedGalleryUrls(project.image_url, project.gallery_urls);
                      if (urls.length) setGalleryLightbox({ urls, index: 0 });
                    }}
                  >
                    <img
                      src={project.image_url}
                      alt={project.title}
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
                  onClick={handleClose}
                  className="absolute top-4 right-4 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center text-foreground hover:text-primary transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 md:p-8">
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
                <h2 className="text-2xl md:text-3xl font-bold mt-2 mb-4 text-foreground">{project.title}</h2>
                <div
                  className="text-muted-foreground mb-6 text-lg prose prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: project.description }}
                />

                {galleryExtras(project).length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-4 text-foreground">Galeria</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {galleryExtras(project).map((url) => {
                        const urls = orderedGalleryUrls(project.image_url, project.gallery_urls);
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

                {project.technologies && project.technologies.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3 text-foreground">Tecnologias</h3>
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech) => (
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
                  {project.link && (
                    <a
                      href={project.link}
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
        title={project?.title ?? "Galeria"}
      />
    </>
  );
}
