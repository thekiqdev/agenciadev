import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ExternalLink, Github, X } from "lucide-react";
import { SectionTitle } from "@/components/SectionTitle";

type Category = "todos" | "sistemas" | "plataformas" | "saas" | "sites";

interface Project {
  id: number;
  title: string;
  description: string;
  longDescription: string;
  category: Category;
  image: string;
  tech: string[];
  challenges: string[];
  results: string[];
  liveUrl?: string;
  githubUrl?: string;
}

const projects: Project[] = [
  {
    id: 1,
    title: "Plataforma E-commerce Multi-vendor",
    description: "Marketplace completo conectando vendedores e compradores com sistema de pagamentos integrado.",
    longDescription: "Desenvolvemos uma plataforma de e-commerce multi-vendor completa, permitindo que múltiplos vendedores cadastrem seus produtos e gerenciem suas vendas de forma independente.",
    category: "plataformas",
    image: "https://images.unsplash.com/photo-1661956602116-aa6865609028?w=800&h=600&fit=crop",
    tech: ["React", "Node.js", "PostgreSQL", "Stripe", "AWS"],
    challenges: [
      "Gerenciamento de múltiplos vendedores",
      "Sistema de split de pagamentos",
      "Escalabilidade para alto tráfego",
    ],
    results: [
      "+500 vendedores cadastrados",
      "R$ 2M+ em transações processadas",
      "99.9% de uptime",
    ],
    liveUrl: "#",
  },
  {
    id: 2,
    title: "Sistema de Gestão Empresarial",
    description: "ERP completo para gestão de vendas, estoque, financeiro e recursos humanos.",
    longDescription: "Sistema integrado de gestão empresarial desenvolvido sob medida para atender às necessidades específicas de uma rede de varejo com múltiplas filiais.",
    category: "sistemas",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop",
    tech: ["TypeScript", "React", "Express", "MongoDB", "Docker"],
    challenges: [
      "Sincronização em tempo real entre filiais",
      "Relatórios gerenciais complexos",
      "Integração com sistemas legados",
    ],
    results: [
      "40% redução em tempo de processos",
      "Economia de R$ 150k/ano",
      "Zero downtime em 2 anos",
    ],
  },
  {
    id: 3,
    title: "SaaS de Analytics e BI",
    description: "Plataforma de business intelligence com dashboards interativos e insights automáticos.",
    longDescription: "Solução SaaS para análise de dados empresariais, oferecendo dashboards personalizáveis, relatórios automáticos e integração com múltiplas fontes de dados.",
    category: "saas",
    image: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=600&fit=crop",
    tech: ["Next.js", "Python", "Prisma", "Redis", "Stripe"],
    challenges: [
      "Processamento de grandes volumes de dados",
      "Visualizações em tempo real",
      "Multi-tenancy seguro",
    ],
    results: [
      "200+ empresas assinantes",
      "MRR de R$ 80k+",
      "NPS de 72",
    ],
    liveUrl: "#",
  },
  {
    id: 4,
    title: "Portal Institucional Corporativo",
    description: "Website moderno com CMS integrado e otimização avançada de SEO.",
    longDescription: "Portal institucional para uma grande empresa do setor financeiro, com áreas de notícias, blog, página de carreiras e sistema de leads.",
    category: "sites",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop",
    tech: ["React", "Strapi", "Tailwind CSS", "Vercel"],
    challenges: [
      "Performance otimizada",
      "Acessibilidade WCAG 2.1",
      "SEO técnico avançado",
    ],
    results: [
      "300% aumento em tráfego orgânico",
      "Lighthouse score 98+",
      "+2000 leads/mês",
    ],
    liveUrl: "#",
  },
  {
    id: 5,
    title: "Sistema de Agendamento Online",
    description: "Plataforma de agendamentos para clínicas com integração de pagamentos e lembretes.",
    longDescription: "Sistema completo de agendamento online para rede de clínicas médicas, com gestão de horários, prontuário digital e telemedicina.",
    category: "sistemas",
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=600&fit=crop",
    tech: ["Vue.js", "Laravel", "MySQL", "Twilio", "AWS"],
    challenges: [
      "Conformidade com LGPD",
      "Integração com planos de saúde",
      "Funcionalidades de telemedicina",
    ],
    results: [
      "50k+ agendamentos/mês",
      "60% redução em no-show",
      "15 clínicas atendidas",
    ],
  },
  {
    id: 6,
    title: "Plataforma de Cursos EAD",
    description: "LMS completo com videoaulas, exercícios interativos e certificação automática.",
    longDescription: "Plataforma de ensino a distância desenvolvida para uma edtech, oferecendo experiência de aprendizado gamificada e certificação reconhecida.",
    category: "plataformas",
    image: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=800&h=600&fit=crop",
    tech: ["React", "Node.js", "PostgreSQL", "Mux", "Hotmart"],
    challenges: [
      "Streaming de vídeo otimizado",
      "Sistema de gamificação",
      "Integrações com gateways de pagamento",
    ],
    results: [
      "25k+ alunos matriculados",
      "Taxa de conclusão de 78%",
      "R$ 500k em vendas de cursos",
    ],
    liveUrl: "#",
  },
];

const categories = [
  { id: "todos", label: "Todos" },
  { id: "sistemas", label: "Sistemas" },
  { id: "plataformas", label: "Plataformas" },
  { id: "saas", label: "SaaS" },
  { id: "sites", label: "Sites" },
];

const Portfolio = () => {
  const [activeCategory, setActiveCategory] = useState<Category>("todos");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const filteredProjects = projects.filter(
    (project) => activeCategory === "todos" || project.category === activeCategory
  );

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
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <span className="text-xs font-medium text-primary uppercase tracking-wider">
                      {project.category}
                    </span>
                    <h3 className="text-xl font-bold mt-2 mb-2 text-foreground group-hover:text-primary transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-muted-foreground text-sm line-clamp-2">
                      {project.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {project.tech.slice(0, 3).map((tech) => (
                        <span
                          key={tech}
                          className="px-2 py-1 text-xs rounded-md bg-muted text-muted-foreground"
                        >
                          {tech}
                        </span>
                      ))}
                      {project.tech.length > 3 && (
                        <span className="px-2 py-1 text-xs rounded-md bg-muted text-muted-foreground">
                          +{project.tech.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* Project Modal */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedProject(null)}
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
                <img
                  src={selectedProject.image}
                  alt={selectedProject.title}
                  className="w-full h-64 object-cover rounded-t-2xl"
                />
                <button
                  onClick={() => setSelectedProject(null)}
                  className="absolute top-4 right-4 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center text-foreground hover:text-primary transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 md:p-8">
                <span className="text-xs font-medium text-primary uppercase tracking-wider">
                  {selectedProject.category}
                </span>
                <h2 className="text-2xl md:text-3xl font-bold mt-2 mb-4 text-foreground">
                  {selectedProject.title}
                </h2>
                <p className="text-muted-foreground mb-6">
                  {selectedProject.longDescription}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-foreground">Desafios</h3>
                    <ul className="space-y-2">
                      {selectedProject.challenges.map((challenge) => (
                        <li key={challenge} className="flex items-start gap-2 text-muted-foreground text-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                          {challenge}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-foreground">Resultados</h3>
                    <ul className="space-y-2">
                      {selectedProject.results.map((result) => (
                        <li key={result} className="flex items-start gap-2 text-muted-foreground text-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2" />
                          {result}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3 text-foreground">Tecnologias</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.tech.map((tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1.5 text-sm rounded-lg bg-muted text-muted-foreground"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-4">
                  {selectedProject.liveUrl && (
                    <a
                      href={selectedProject.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
                    >
                      <ExternalLink size={18} />
                      Ver Projeto
                    </a>
                  )}
                  {selectedProject.githubUrl && (
                    <a
                      href={selectedProject.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card text-foreground font-medium hover:border-primary/50 transition-colors"
                    >
                      <Github size={18} />
                      Ver Código
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
