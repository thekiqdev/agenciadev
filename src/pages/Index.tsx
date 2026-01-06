import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Code2, Layers, Cloud, Globe, Wrench, ChevronRight } from "lucide-react";
import { GlitchText } from "@/components/GlitchText";
import { AnimatedCard } from "@/components/AnimatedCard";
import { SectionTitle } from "@/components/SectionTitle";
import { ParticleBackground } from "@/components/ParticleBackground";

const services = [
  {
    icon: Code2,
    title: "Sistemas",
    description: "Desenvolvimento de sistemas robustos e escaláveis para automatizar processos e aumentar a eficiência.",
    color: "cyan" as const,
  },
  {
    icon: Layers,
    title: "Plataformas",
    description: "Criação de plataformas digitais completas para conectar usuários e gerar valor.",
    color: "purple" as const,
  },
  {
    icon: Cloud,
    title: "SaaS",
    description: "Soluções de software como serviço com arquitetura moderna e escalabilidade infinita.",
    color: "green" as const,
  },
  {
    icon: Globe,
    title: "Sites",
    description: "Websites institucionais e landing pages com design impactante e performance otimizada.",
    color: "cyan" as const,
  },
  {
    icon: Wrench,
    title: "Manutenção",
    description: "Suporte contínuo, atualizações e melhorias para manter seus sistemas sempre funcionando.",
    color: "purple" as const,
  },
];

const portfolioHighlights = [
  {
    title: "Plataforma E-commerce",
    category: "Plataforma",
    image: "https://images.unsplash.com/photo-1661956602116-aa6865609028?w=600&h=400&fit=crop",
    tech: ["React", "Node.js", "PostgreSQL"],
  },
  {
    title: "Sistema de Gestão",
    category: "Sistema",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop",
    tech: ["TypeScript", "AWS", "Docker"],
  },
  {
    title: "App SaaS Analytics",
    category: "SaaS",
    image: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&h=400&fit=crop",
    tech: ["Next.js", "Prisma", "Stripe"],
  },
];

const stats = [
  { value: "50+", label: "Projetos Entregues" },
  { value: "30+", label: "Clientes Satisfeitos" },
  { value: "5+", label: "Anos de Experiência" },
  { value: "99%", label: "Taxa de Satisfação" },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <ParticleBackground />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20">
        <div className="absolute inset-0 bg-grid-animated opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-5xl mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-6"
            >
              <span className="inline-block px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium uppercase tracking-wider">
                Agência de Desenvolvimento
              </span>
            </motion.div>

            <GlitchText
              text="TRANSFORMAMOS IDEIAS EM REALIDADE DIGITAL"
              className="text-4xl md:text-5xl lg:text-7xl font-bold mb-6 text-foreground leading-tight"
            />

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-lg md:text-xl text-muted-foreground mb-10 max-w-3xl mx-auto"
            >
              Desenvolvemos sistemas, plataformas e soluções SaaS com tecnologia de ponta. 
              Nossa equipe transforma sua visão em produtos digitais que geram resultados.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link to="/contato" className="cyber-button text-lg">
                <span>Iniciar Projeto</span>
              </Link>
              <Link
                to="/portfolio"
                className="px-8 py-4 rounded-lg border border-border bg-card hover:bg-muted transition-all duration-300 flex items-center justify-center gap-2 font-medium hover:border-primary/50"
              >
                Ver Portfólio
                <ArrowRight size={20} />
              </Link>
            </motion.div>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.5 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-6 h-10 rounded-full border-2 border-primary/50 flex justify-center p-2"
            >
              <motion.div className="w-1 h-2 bg-primary rounded-full" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-6 rounded-xl border border-border bg-card/50 backdrop-blur-sm"
              >
                <div className="text-4xl md:text-5xl font-bold text-gradient mb-2">
                  {stat.value}
                </div>
                <div className="text-muted-foreground text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <SectionTitle
            title="Nossos Serviços"
            subtitle="Soluções completas para transformar seu negócio digitalmente"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <AnimatedCard key={service.title} delay={index * 0.1} glowColor={service.color}>
                <div className="p-6">
                  <div className={`w-14 h-14 rounded-xl bg-neon-${service.color}/10 flex items-center justify-center mb-4`}>
                    <service.icon className={`w-7 h-7 text-neon-${service.color}`} />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-foreground">{service.title}</h3>
                  <p className="text-muted-foreground mb-4">{service.description}</p>
                  <Link
                    to="/servicos"
                    className="inline-flex items-center gap-2 text-primary hover:gap-3 transition-all duration-300 font-medium text-sm"
                  >
                    Saiba mais <ChevronRight size={16} />
                  </Link>
                </div>
              </AnimatedCard>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Link
              to="/servicos"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary transition-all duration-300 font-medium"
            >
              Ver todos os serviços
              <ArrowRight size={18} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Portfolio Highlight Section */}
      <section className="py-20 relative bg-muted/30">
        <div className="container mx-auto px-4">
          <SectionTitle
            title="Projetos em Destaque"
            subtitle="Conheça alguns dos nossos trabalhos mais recentes"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolioHighlights.map((project, index) => (
              <motion.div
                key={project.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative overflow-hidden rounded-xl border border-border bg-card"
              >
                <div className="aspect-video overflow-hidden">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="p-6">
                  <span className="text-xs font-medium text-primary uppercase tracking-wider">
                    {project.category}
                  </span>
                  <h3 className="text-xl font-bold mt-2 mb-3 text-foreground group-hover:text-primary transition-colors">
                    {project.title}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {project.tech.map((tech) => (
                      <span
                        key={tech}
                        className="px-2 py-1 text-xs rounded-md bg-muted text-muted-foreground"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Link
              to="/portfolio"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary transition-all duration-300 font-medium"
            >
              Ver portfólio completo
              <ArrowRight size={18} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card via-card to-primary/5 p-8 md:p-12 lg:p-16 text-center"
          >
            <div className="absolute inset-0 bg-grid opacity-20" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                Pronto para <span className="text-gradient">transformar</span> sua ideia?
              </h2>
              <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
                Entre em contato conosco e descubra como podemos ajudar a construir a 
                solução digital perfeita para o seu negócio.
              </p>
              <Link to="/contato" className="cyber-button text-lg inline-block">
                <span>Fale Conosco</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Index;
