import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Code2, Layers, Cloud, Globe, Wrench, 
  CheckCircle, ArrowRight, Zap, Shield, Users, Rocket 
} from "lucide-react";
import { SectionTitle } from "@/components/SectionTitle";
import { AnimatedCard } from "@/components/AnimatedCard";

const services = [
  {
    icon: Code2,
    title: "Desenvolvimento de Sistemas",
    description: "Criamos sistemas robustos e personalizados para automatizar processos, aumentar a produtividade e otimizar a gestão do seu negócio.",
    features: [
      "Sistemas de gestão empresarial (ERP)",
      "Automação de processos internos",
      "Integrações com APIs externas",
      "Dashboards e relatórios em tempo real",
      "Aplicações web responsivas",
    ],
    color: "cyan" as const,
  },
  {
    icon: Layers,
    title: "Plataformas Digitais",
    description: "Desenvolvemos plataformas completas que conectam usuários, parceiros e clientes em um ecossistema digital integrado.",
    features: [
      "Marketplaces e e-commerces",
      "Plataformas de cursos online (EAD)",
      "Portais corporativos",
      "Redes sociais nichadas",
      "Plataformas de agendamento",
    ],
    color: "purple" as const,
  },
  {
    icon: Cloud,
    title: "Soluções SaaS",
    description: "Criamos produtos SaaS escaláveis com arquitetura moderna, pronta para crescer junto com seu negócio.",
    features: [
      "Arquitetura multi-tenant",
      "Sistema de assinaturas e pagamentos",
      "APIs RESTful bem documentadas",
      "Escalabilidade automática",
      "Monitoramento e analytics",
    ],
    color: "green" as const,
  },
  {
    icon: Globe,
    title: "Criação de Sites",
    description: "Desenvolvemos websites institucionais e landing pages com design moderno, SEO otimizado e alta performance.",
    features: [
      "Sites institucionais responsivos",
      "Landing pages de alta conversão",
      "Blogs e portais de conteúdo",
      "Otimização para SEO",
      "Integração com Google Analytics",
    ],
    color: "cyan" as const,
  },
  {
    icon: Wrench,
    title: "Manutenção e Suporte",
    description: "Oferecemos suporte contínuo para garantir que seus sistemas estejam sempre atualizados, seguros e funcionando perfeitamente.",
    features: [
      "Monitoramento 24/7",
      "Atualizações de segurança",
      "Correção de bugs prioritária",
      "Backup automático",
      "Suporte técnico dedicado",
    ],
    color: "purple" as const,
  },
];

const benefits = [
  {
    icon: Zap,
    title: "Desenvolvimento Ágil",
    description: "Metodologias ágeis para entregas rápidas e iterativas",
  },
  {
    icon: Shield,
    title: "Segurança Avançada",
    description: "Práticas de segurança em todas as etapas do desenvolvimento",
  },
  {
    icon: Users,
    title: "Equipe Especializada",
    description: "Profissionais experientes em diversas tecnologias",
  },
  {
    icon: Rocket,
    title: "Tecnologia de Ponta",
    description: "Utilizamos as ferramentas e frameworks mais modernos",
  },
];

const Servicos = () => {
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
              Nossos <span className="text-gradient">Serviços</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Soluções digitais completas para impulsionar seu negócio. 
              Do planejamento à execução, entregamos tecnologia que gera resultados.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="space-y-16">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-8 items-center ${
                  index % 2 === 1 ? "lg:flex-row-reverse" : ""
                }`}
              >
                <div className={index % 2 === 1 ? "lg:order-2" : ""}>
                  <div className={`w-16 h-16 rounded-2xl bg-neon-${service.color}/10 flex items-center justify-center mb-6`}>
                    <service.icon className={`w-8 h-8 text-neon-${service.color}`} />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                    {service.title}
                  </h2>
                  <p className="text-muted-foreground text-lg mb-6">
                    {service.description}
                  </p>
                  <Link
                    to="/contato"
                    className="inline-flex items-center gap-2 text-primary hover:gap-3 transition-all duration-300 font-medium"
                  >
                    Solicitar orçamento <ArrowRight size={18} />
                  </Link>
                </div>

                <AnimatedCard 
                  className={index % 2 === 1 ? "lg:order-1" : ""} 
                  glowColor={service.color}
                >
                  <div className="p-6 md:p-8">
                    <h3 className="text-lg font-semibold mb-4 text-foreground">
                      O que incluímos:
                    </h3>
                    <ul className="space-y-3">
                      {service.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3">
                          <CheckCircle className={`w-5 h-5 text-neon-${service.color} mt-0.5 flex-shrink-0`} />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </AnimatedCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <SectionTitle
            title="Por que nos escolher"
            subtitle="Diferenciais que fazem a diferença no resultado do seu projeto"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-6 rounded-xl border border-border bg-card hover:border-primary/30 transition-colors duration-300"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">
                  {benefit.title}
                </h3>
                <p className="text-muted-foreground text-sm">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

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
              Vamos construir algo <span className="text-gradient">incrível</span> juntos?
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Entre em contato para discutir seu projeto. Oferecemos consultoria 
              gratuita para entender suas necessidades.
            </p>
            <Link to="/contato" className="cyber-button text-lg inline-block">
              <span>Solicitar Orçamento</span>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Servicos;
