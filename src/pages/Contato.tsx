import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Mail, Phone, MapPin, Clock, Send, Calendar, MessageCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AnimatedCard } from "@/components/AnimatedCard";
import { SectionTitle } from "@/components/SectionTitle";
import { supabase } from "@/integrations/supabase/client";
const contactSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(100, "Nome muito longo"),
  email: z.string().email("Email inválido").max(255, "Email muito longo"),
  phone: z.string().optional(),
  message: z.string().min(10, "Mensagem deve ter pelo menos 10 caracteres").max(2000, "Mensagem muito longa")
});
const budgetSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(100, "Nome muito longo"),
  email: z.string().email("Email inválido").max(255, "Email muito longo"),
  phone: z.string().optional(),
  company: z.string().optional(),
  projectType: z.string().min(1, "Selecione o tipo de projeto"),
  budget: z.string().min(1, "Selecione o range de investimento"),
  deadline: z.string().optional(),
  description: z.string().min(20, "Descreva seu projeto com mais detalhes").max(5000, "Descrição muito longa")
});
type ContactFormData = z.infer<typeof contactSchema>;
type BudgetFormData = z.infer<typeof budgetSchema>;
const projectTypes = ["Sistema de Gestão", "Plataforma Digital", "Solução SaaS", "Site Institucional", "Landing Page", "E-commerce", "Aplicativo Web", "Manutenção/Suporte", "Outro"];
const budgetRanges = ["Até R$ 10.000", "R$ 10.000 - R$ 30.000", "R$ 30.000 - R$ 50.000", "R$ 50.000 - R$ 100.000", "Acima de R$ 100.000", "A definir"];
const contactInfo = [{
  icon: Mail,
  title: "E-mail",
  value: "contato@nexusdev.com.br",
  link: "mailto:contato@nexusdev.com.br"
}, {
  icon: Phone,
  title: "Telefone",
  value: "(11) 99999-9999",
  link: "tel:+5511999999999"
}, {
  icon: MapPin,
  title: "Localização",
  value: "São Paulo, SP - Brasil"
}, {
  icon: Clock,
  title: "Horário",
  value: "Seg - Sex: 9h às 18h"
}];
const Contato = () => {
  const [activeTab, setActiveTab] = useState<"contact" | "budget">("contact");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const contactForm = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema)
  });
  const budgetForm = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema)
  });
  const onContactSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      const {
        error
      } = await supabase.from("contact_submissions").insert({
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        message: data.message
      });
      if (error) throw error;
      toast.success("Mensagem enviada com sucesso! Entraremos em contato em breve.");
      contactForm.reset();
    } catch (error) {
      console.error("Error submitting contact form:", error);
      toast.error("Erro ao enviar mensagem. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };
  const onBudgetSubmit = async (data: BudgetFormData) => {
    setIsSubmitting(true);
    try {
      const {
        error
      } = await supabase.from("budget_submissions").insert({
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        company: data.company || null,
        project_type: data.projectType,
        budget_range: data.budget,
        deadline: data.deadline || null,
        description: data.description
      });
      if (error) throw error;
      toast.success("Solicitação de orçamento enviada! Nossa equipe analisará seu projeto.");
      budgetForm.reset();
    } catch (error) {
      console.error("Error submitting budget form:", error);
      toast.error("Erro ao enviar solicitação. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };
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
              Entre em <span className="text-gradient">Contato</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Estamos prontos para ouvir sua ideia e transformá-la em realidade. 
              Escolha a melhor forma de entrar em contato conosco.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {contactInfo.map((info, index) => <motion.div key={info.title} initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: index * 0.1
          }}>
                {info.link ? <a href={info.link} className="block p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors duration-300 text-center">
                    <info.icon className="w-6 h-6 text-primary mx-auto mb-2" />
                    <h3 className="font-medium text-foreground text-sm mb-1">{info.title}</h3>
                    <p className="text-muted-foreground text-xs">{info.value}</p>
                  </a> : <div className="block p-4 rounded-xl border border-border bg-card text-center">
                    <info.icon className="w-6 h-6 text-primary mx-auto mb-2" />
                    <h3 className="font-medium text-foreground text-sm mb-1">{info.title}</h3>
                    <p className="text-muted-foreground text-xs">{info.value}</p>
                  </div>}
              </motion.div>)}
          </div>
        </div>
      </section>

      {/* Forms Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Tabs */}
            <div className="flex justify-center gap-4 mb-8">
              <button onClick={() => setActiveTab("contact")} className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 ${activeTab === "contact" ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:text-foreground"}`}>
                <MessageCircle size={18} />
                Contato Simples
              </button>
              <button onClick={() => setActiveTab("budget")} className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 ${activeTab === "budget" ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:text-foreground"}`}>
                <Send size={18} />
                Solicitar Orçamento
              </button>
            </div>

            {/* Contact Form */}
            {activeTab === "contact" && <motion.div initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.4
          }}>
                <AnimatedCard>
                  <form onSubmit={contactForm.handleSubmit(onContactSubmit)} className="p-6 md:p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="contact-name">Nome *</Label>
                        <Input id="contact-name" placeholder="Seu nome completo" {...contactForm.register("name")} className="bg-muted border-border" />
                        {contactForm.formState.errors.name && <p className="text-sm text-destructive">{contactForm.formState.errors.name.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contact-email">E-mail *</Label>
                        <Input id="contact-email" type="email" placeholder="seu@email.com" {...contactForm.register("email")} className="bg-muted border-border" />
                        {contactForm.formState.errors.email && <p className="text-sm text-destructive">{contactForm.formState.errors.email.message}</p>}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contact-phone">Telefone (opcional)</Label>
                      <Input id="contact-phone" placeholder="(11) 99999-9999" {...contactForm.register("phone")} className="bg-muted border-border" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contact-message">Mensagem *</Label>
                      <Textarea id="contact-message" placeholder="Como podemos ajudar?" rows={5} {...contactForm.register("message")} className="bg-muted border-border resize-none" />
                      {contactForm.formState.errors.message && <p className="text-sm text-destructive">{contactForm.formState.errors.message.message}</p>}
                    </div>

                    <Button type="submit" disabled={isSubmitting} className="w-full cyber-button">
                      <span className="text-secondary-foreground">{isSubmitting ? "Enviando..." : "Enviar Mensagem"}</span>
                    </Button>
                  </form>
                </AnimatedCard>
              </motion.div>}

            {/* Budget Form */}
            {activeTab === "budget" && <motion.div initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.4
          }}>
                <AnimatedCard>
                  <form onSubmit={budgetForm.handleSubmit(onBudgetSubmit)} className="p-6 md:p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="budget-name">Nome *</Label>
                        <Input id="budget-name" placeholder="Seu nome completo" {...budgetForm.register("name")} className="bg-muted border-border" />
                        {budgetForm.formState.errors.name && <p className="text-sm text-destructive">{budgetForm.formState.errors.name.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="budget-email">E-mail *</Label>
                        <Input id="budget-email" type="email" placeholder="seu@email.com" {...budgetForm.register("email")} className="bg-muted border-border" />
                        {budgetForm.formState.errors.email && <p className="text-sm text-destructive">{budgetForm.formState.errors.email.message}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="budget-phone">Telefone</Label>
                        <Input id="budget-phone" placeholder="(11) 99999-9999" {...budgetForm.register("phone")} className="bg-muted border-border" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="budget-company">Empresa</Label>
                        <Input id="budget-company" placeholder="Nome da empresa" {...budgetForm.register("company")} className="bg-muted border-border" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="budget-type">Tipo de Projeto *</Label>
                        <select id="budget-type" {...budgetForm.register("projectType")} className="w-full h-10 px-3 rounded-md bg-muted border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                          <option value="">Selecione...</option>
                          {projectTypes.map(type => <option key={type} value={type}>{type}</option>)}
                        </select>
                        {budgetForm.formState.errors.projectType && <p className="text-sm text-destructive">{budgetForm.formState.errors.projectType.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="budget-range">Investimento Estimado *</Label>
                        <select id="budget-range" {...budgetForm.register("budget")} className="w-full h-10 px-3 rounded-md bg-muted border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                          <option value="">Selecione...</option>
                          {budgetRanges.map(range => <option key={range} value={range}>{range}</option>)}
                        </select>
                        {budgetForm.formState.errors.budget && <p className="text-sm text-destructive">{budgetForm.formState.errors.budget.message}</p>}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="budget-deadline">Prazo Desejado</Label>
                      <Input id="budget-deadline" placeholder="Ex: 3 meses, Janeiro/2025..." {...budgetForm.register("deadline")} className="bg-muted border-border" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="budget-description">Descrição do Projeto *</Label>
                      <Textarea id="budget-description" placeholder="Descreva seu projeto, objetivos, funcionalidades desejadas..." rows={6} {...budgetForm.register("description")} className="bg-muted border-border resize-none" />
                      {budgetForm.formState.errors.description && <p className="text-sm text-destructive">{budgetForm.formState.errors.description.message}</p>}
                    </div>

                    <Button type="submit" disabled={isSubmitting} className="w-full cyber-button">
                      <span>{isSubmitting ? "Enviando..." : "Solicitar Orçamento"}</span>
                    </Button>
                  </form>
                </AnimatedCard>
              </motion.div>}
          </div>
        </div>
      </section>

      {/* Schedule Meeting Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }}>
              <Calendar className="w-12 h-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">
                Prefere uma Reunião?
              </h2>
              <p className="text-muted-foreground mb-6">
                Agende uma videochamada gratuita para discutir seu projeto em detalhes 
                com nossa equipe. Escolha o melhor horário para você.
              </p>
              <a href="https://calendly.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary transition-all duration-300 font-medium">
                <Calendar size={18} />
                Agendar Reunião
              </a>
            </motion.div>
          </div>
        </div>
      </section>
    </div>;
};
export default Contato;