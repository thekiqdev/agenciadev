import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Target, Eye, Heart, Users, Award, Clock, Rocket, Shield } from "lucide-react";
import { SectionTitle } from "@/components/SectionTitle";
import { AnimatedCard } from "@/components/AnimatedCard";
const timeline = [{
  year: "2019",
  title: "Início da Jornada",
  description: "Fundação da NexusDev com foco em desenvolvimento de sistemas personalizados."
}, {
  year: "2020",
  title: "Expansão de Serviços",
  description: "Ampliamos nosso portfólio para incluir plataformas digitais e soluções SaaS."
}, {
  year: "2021",
  title: "Crescimento da Equipe",
  description: "Dobramos a equipe e consolidamos parcerias estratégicas."
}, {
  year: "2022",
  title: "Reconhecimento",
  description: "Premiados como uma das melhores agências de desenvolvimento da região."
}, {
  year: "2023",
  title: "Inovação Contínua",
  description: "Investimento em IA e automação para entregar soluções mais inteligentes."
}, {
  year: "2024",
  title: "Nova Era",
  description: "Expansão nacional e lançamento de produtos próprios."
}];
const values = [{
  icon: Rocket,
  title: "Inovação",
  description: "Buscamos constantemente novas tecnologias e metodologias para entregar soluções de ponta."
}, {
  icon: Users,
  title: "Colaboração",
  description: "Trabalhamos lado a lado com nossos clientes, como verdadeiros parceiros de negócio."
}, {
  icon: Shield,
  title: "Qualidade",
  description: "Cada linha de código é escrita com cuidado, seguindo as melhores práticas do mercado."
}, {
  icon: Heart,
  title: "Paixão",
  description: "Amamos o que fazemos e isso se reflete em cada projeto que entregamos."
}];
const team = [{
  name: "Carlos Silva",
  role: "CEO & Fundador",
  image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face"
}, {
  name: "Ana Santos",
  role: "CTO",
  image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face"
}, {
  name: "Pedro Costa",
  role: "Lead Developer",
  image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face"
}, {
  name: "Maria Oliveira",
  role: "UX Designer",
  image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face"
}];
const stats = [{
  icon: Award,
  value: "50+",
  label: "Projetos Entregues"
}, {
  icon: Users,
  value: "30+",
  label: "Clientes Ativos"
}, {
  icon: Clock,
  value: "5+",
  label: "Anos de Mercado"
}, {
  icon: Rocket,
  value: "99%",
  label: "Satisfação"
}];
const Sobre = () => {
  return <div className="min-h-screen bg-background pt-24">
      {/* Hero */}
      <section className="py-16 relative">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div initial={{
          opacity: 0,
          y: 30
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.6
        }} className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Sobre a <span className="text-gradient">Agência Dev   </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Somos uma agência de desenvolvimento apaixonada por tecnologia. 
              Transformamos ideias complexas em soluções digitais elegantes e funcionais.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission, Vision, Values */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <AnimatedCard delay={0}>
              <div className="p-6 text-center">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Target className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">Missão</h3>
                <p className="text-muted-foreground">
                  Entregar soluções tecnológicas inovadoras que impulsionam o crescimento 
                  e a transformação digital dos nossos clientes.
                </p>
              </div>
            </AnimatedCard>

            <AnimatedCard delay={0.1} glowColor="purple">
              <div className="p-6 text-center">
                <div className="w-14 h-14 rounded-xl bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                  <Eye className="w-7 h-7 text-secondary" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">Visão</h3>
                <p className="text-muted-foreground">
                  Ser reconhecida como a principal referência em desenvolvimento de 
                  software no Brasil, sinônimo de qualidade e inovação.
                </p>
              </div>
            </AnimatedCard>

            <AnimatedCard delay={0.2} glowColor="green">
              <div className="p-6 text-center">
                <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-7 h-7 text-accent" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">Valores</h3>
                <p className="text-muted-foreground">
                  Inovação, colaboração, qualidade, transparência e compromisso com 
                  resultados guiam todas as nossas decisões.
                </p>
              </div>
            </AnimatedCard>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => <motion.div key={stat.label} initial={{
            opacity: 0,
            y: 30
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            delay: index * 0.1
          }} className="text-center p-6">
                <stat.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                <div className="text-4xl md:text-5xl font-bold text-gradient mb-2">
                  {stat.value}
                </div>
                <div className="text-muted-foreground text-sm">{stat.label}</div>
              </motion.div>)}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <SectionTitle title="Nossa História" subtitle="Uma jornada de inovação e crescimento contínuo" />

          <div className="relative max-w-3xl mx-auto">
            {/* Vertical Line */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-border md:-translate-x-1/2" />

            {timeline.map((item, index) => <motion.div key={item.year} initial={{
            opacity: 0,
            x: index % 2 === 0 ? -30 : 30
          }} whileInView={{
            opacity: 1,
            x: 0
          }} viewport={{
            once: true
          }} transition={{
            delay: index * 0.1
          }} className={`relative flex items-center mb-8 ${index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}>
                {/* Dot */}
                <div className="absolute left-4 md:left-1/2 w-4 h-4 rounded-full bg-primary md:-translate-x-1/2 z-10" />

                {/* Content */}
                <div className={`ml-12 md:ml-0 md:w-1/2 ${index % 2 === 0 ? "md:pr-12 md:text-right" : "md:pl-12"}`}>
                  <span className="text-primary font-bold text-lg">{item.year}</span>
                  <h3 className="text-xl font-bold text-foreground mt-1 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              </motion.div>)}
          </div>
        </div>
      </section>

      {/* Values Detailed */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <SectionTitle title="Nossos Valores" subtitle="Os princípios que guiam nossa atuação" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => <motion.div key={value.title} initial={{
            opacity: 0,
            y: 30
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            delay: index * 0.1
          }} className="p-6 rounded-xl border border-border bg-card text-center hover:border-primary/30 transition-colors duration-300">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-foreground">{value.title}</h3>
                <p className="text-muted-foreground text-sm">{value.description}</p>
              </motion.div>)}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <SectionTitle title="Nossa Equipe" subtitle="Profissionais apaixonados por tecnologia" />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {team.map((member, index) => <motion.div key={member.name} initial={{
            opacity: 0,
            scale: 0.9
          }} whileInView={{
            opacity: 1,
            scale: 1
          }} viewport={{
            once: true
          }} transition={{
            delay: index * 0.1
          }} className="group text-center">
                <div className="relative mb-4 overflow-hidden rounded-xl">
                  <img src={member.image} alt={member.name} className="w-full aspect-square object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <h3 className="font-bold text-foreground">{member.name}</h3>
                <p className="text-sm text-muted-foreground">{member.role}</p>
              </motion.div>)}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div initial={{
          opacity: 0,
          scale: 0.95
        }} whileInView={{
          opacity: 1,
          scale: 1
        }} viewport={{
          once: true
        }} className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Quer fazer parte da nossa <span className="text-gradient">história</span>?
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Entre em contato e vamos construir algo incrível juntos.
            </p>
            <Link to="/contato" className="cyber-button text-lg inline-block">
              <span>Fale Conosco</span>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>;
};
export default Sobre;