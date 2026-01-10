import { useState } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Package, Key, Code, Zap, Star, Check, ExternalLink, Rocket, Shield, Cpu } from "lucide-react";
import { SectionTitle } from "@/components/SectionTitle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Import images
import heroBanner from "@/assets/store-hero-banner.jpg";
import productErp from "@/assets/product-erp.jpg";
import productEcommerce from "@/assets/product-ecommerce.jpg";
import productSaas from "@/assets/product-saas.jpg";
import productLanding from "@/assets/product-landing.jpg";
import productDashboard from "@/assets/product-dashboard.jpg";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: "license" | "system" | "template";
  features: string[];
  popular?: boolean;
  image: string;
}

const products: Product[] = [
  {
    id: "1",
    name: "Sistema de Gestão Empresarial",
    description: "ERP completo para pequenas e médias empresas com módulos de vendas, estoque, financeiro e RH.",
    price: 2997,
    originalPrice: 4997,
    category: "system",
    features: [
      "Dashboard completo",
      "Gestão de estoque",
      "Controle financeiro",
      "Relatórios avançados",
      "Suporte por 6 meses",
      "Atualizações inclusas"
    ],
    popular: true,
    image: productErp
  },
  {
    id: "2",
    name: "E-commerce Pro",
    description: "Plataforma de e-commerce pronta para uso com integração de pagamentos e gestão de pedidos.",
    price: 1997,
    originalPrice: 2997,
    category: "system",
    features: [
      "Catálogo de produtos",
      "Carrinho de compras",
      "Integração Stripe/PagSeguro",
      "Painel administrativo",
      "Sistema de cupons",
      "Multi-idiomas"
    ],
    image: productEcommerce
  },
  {
    id: "3",
    name: "Licença SaaS Starter",
    description: "Licença para usar nossa infraestrutura SaaS com até 100 usuários ativos.",
    price: 297,
    category: "license",
    features: [
      "Até 100 usuários",
      "10GB de armazenamento",
      "API ilimitada",
      "SSL incluído",
      "Backups diários"
    ],
    image: productSaas
  },
  {
    id: "4",
    name: "Licença SaaS Business",
    description: "Licença empresarial para usar nossa infraestrutura SaaS com usuários ilimitados.",
    price: 997,
    originalPrice: 1497,
    category: "license",
    features: [
      "Usuários ilimitados",
      "100GB de armazenamento",
      "API ilimitada",
      "SSL incluído",
      "Backups em tempo real",
      "Suporte prioritário"
    ],
    popular: true,
    image: productSaas
  },
  {
    id: "5",
    name: "Template Landing Page",
    description: "Template profissional para landing pages com alta conversão e design moderno.",
    price: 197,
    category: "template",
    features: [
      "Design responsivo",
      "Animações suaves",
      "SEO otimizado",
      "Fácil customização",
      "Documentação completa"
    ],
    image: productLanding
  },
  {
    id: "6",
    name: "Template Dashboard Admin",
    description: "Template completo de painel administrativo com componentes prontos para uso.",
    price: 397,
    originalPrice: 597,
    category: "template",
    features: [
      "50+ componentes",
      "Gráficos interativos",
      "Tema dark/light",
      "Tabelas avançadas",
      "Formulários prontos",
      "Código limpo"
    ],
    image: productDashboard
  }
];

const categoryIcons = {
  license: Key,
  system: Package,
  template: Code
};

const categoryLabels = {
  license: "Licença",
  system: "Sistema",
  template: "Template"
};

export default function Loja() {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const filteredProducts = activeCategory === "all" 
    ? products 
    : products.filter(p => p.category === activeCategory);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  return (
    <div className="min-h-screen pt-20 pb-16">
      {/* Hero Banner Section */}
      <section className="relative w-full h-[500px] md:h-[600px] overflow-hidden mb-16">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src={heroBanner} 
            alt="Soluções Digitais" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/60 via-transparent to-background/60" />
        </div>

        {/* Animated Grid Overlay */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(hsl(var(--primary) / 0.3) 1px, transparent 1px),
                              linear-gradient(90deg, hsl(var(--primary) / 0.3) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }} />
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-center items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/40 backdrop-blur-sm mb-6"
            >
              <Cpu className="w-4 h-4 text-primary animate-pulse" />
              <span className="text-sm text-primary font-medium">Tecnologia de Ponta</span>
            </motion.div>

            {/* Title */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="text-foreground">Soluções </span>
              <span className="text-gradient">Digitais</span>
              <br />
              <span className="text-foreground">para seu </span>
              <span className="text-gradient">Negócio</span>
            </h1>

            {/* Description */}
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Sistemas prontos, licenças de software e templates profissionais 
              desenvolvidos com as melhores tecnologias do mercado.
            </p>

            {/* Feature Pills */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap justify-center gap-4 mb-8"
            >
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/50 border border-border backdrop-blur-sm">
                <Rocket className="w-4 h-4 text-primary" />
                <span className="text-sm text-foreground">Deploy Instantâneo</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/50 border border-border backdrop-blur-sm">
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-sm text-foreground">100% Seguro</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/50 border border-border backdrop-blur-sm">
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-sm text-foreground">Alta Performance</span>
              </div>
            </motion.div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg">
                <ShoppingCart className="w-5 h-5 mr-2" />
                Ver Produtos
              </Button>
            </motion.div>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-6 h-10 rounded-full border-2 border-primary/50 flex items-start justify-center p-2"
            >
              <motion.div className="w-1.5 h-1.5 rounded-full bg-primary" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Products Section */}
      <section className="container mx-auto px-4">
        <SectionTitle
          title="Catálogo Digital"
          subtitle="Explore nossa seleção de produtos digitais prontos para impulsionar seu negócio."
        />

        {/* Category Tabs */}
        <Tabs defaultValue="all" className="w-full mb-8" onValueChange={setActiveCategory}>
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-4 bg-card/50 border border-border">
            <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Todos
            </TabsTrigger>
            <TabsTrigger value="system" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Sistemas
            </TabsTrigger>
            <TabsTrigger value="license" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Licenças
            </TabsTrigger>
            <TabsTrigger value="template" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Templates
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Products Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product, index) => {
            const CategoryIcon = categoryIcons[product.category];
            
            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`relative h-full flex flex-col bg-card/50 border-border hover:border-primary/50 transition-all duration-300 group overflow-hidden ${product.popular ? 'ring-2 ring-primary/50' : ''}`}>
                  {product.popular && (
                    <div className="absolute top-4 right-4 z-20">
                      <Badge className="bg-primary text-primary-foreground px-3 py-1">
                        <Star className="w-3 h-3 mr-1" />
                        Popular
                      </Badge>
                    </div>
                  )}
                  
                  {/* Product Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
                    <div className="absolute bottom-4 left-4">
                      <Badge variant="outline" className="bg-card/80 backdrop-blur-sm text-xs">
                        <CategoryIcon className="w-3 h-3 mr-1" />
                        {categoryLabels[product.category]}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                      {product.name}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      {product.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="flex-1">
                    <ul className="space-y-2">
                      {product.features.slice(0, 4).map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Check className="w-4 h-4 text-primary flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                      {product.features.length > 4 && (
                        <li className="text-sm text-primary">
                          +{product.features.length - 4} recursos
                        </li>
                      )}
                    </ul>
                  </CardContent>
                  
                  <CardFooter className="flex flex-col gap-4 pt-4 border-t border-border">
                    <div className="flex items-center gap-2 w-full">
                      {product.originalPrice && (
                        <span className="text-sm text-muted-foreground line-through">
                          {formatPrice(product.originalPrice)}
                        </span>
                      )}
                      <span className="text-2xl font-bold text-primary">
                        {formatPrice(product.price)}
                      </span>
                    </div>
                    
                    <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Adquirir Agora
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="p-8 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border border-primary/20">
            <Zap className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Precisa de uma solução personalizada?</h3>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Desenvolvemos sistemas sob medida para atender às necessidades específicas do seu negócio.
            </p>
            <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
              <a href="/contato">
                Solicitar Orçamento
                <ExternalLink className="w-4 h-4 ml-2" />
              </a>
            </Button>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
