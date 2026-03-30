import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Package, Key, Code, Zap, Star, Check, ExternalLink, Rocket, Shield, Cpu, X } from "lucide-react";
import { SectionTitle } from "@/components/SectionTitle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch } from "@/integrations/api/client";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { GalleryLightbox, orderedGalleryUrls } from "@/components/GalleryLightbox";
import { DEFAULT_PRODUCT_CATEGORIES } from "@/types/category";

import heroBanner from "@/assets/store-hero-banner.jpg";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  original_price: number | null;
  categories: string[];
  features: string[];
  popular: boolean;
  image_url: string | null;
  gallery_urls?: string[] | null;
  active: boolean;
}

const categoryIcons: Record<string, any> = {
  license: Key,
  system: Package,
  template: Code
};

export default function Loja() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [galleryLightbox, setGalleryLightbox] = useState<{ urls: string[]; index: number } | null>(null);
  const { settings } = useSiteSettings();
  const productCats = settings.product_categories?.length
    ? settings.product_categories
    : DEFAULT_PRODUCT_CATEGORIES;

  const categoryLabel = (slug: string) => productCats.find((c) => c.slug === slug)?.label ?? slug;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await apiFetch<Product[]>("/api/products");
        setProducts(data);
      } catch (error) {
        console.error("Erro ao carregar produtos:", error);
      }
      setLoading(false);
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    if (activeCategory === "all") return;
    const cats = settings.product_categories?.length ? settings.product_categories : DEFAULT_PRODUCT_CATEGORIES;
    if (!cats.some((c) => c.slug === activeCategory)) setActiveCategory("all");
  }, [settings.product_categories, activeCategory]);

  const filteredProducts = activeCategory === "all" 
    ? products 
    : products.filter((p) => (p.categories ?? []).includes(activeCategory));
  const stripHtml = (value: string) => value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

  const galleryForProduct = (p: Product) =>
    (p.gallery_urls ?? []).filter((u) => u && u !== p.image_url);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const buildWhatsAppUrl = (product: Product) => {
    const phone = settings.whatsapp_number || "5511999999999";
    const message = [
      "Olá! Quero adquirir um produto da loja.",
      "",
      `Produto: ${product.name}`,
      `Valor: ${formatPrice(product.price)}`,
    ].join("\n");

    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
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
        <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full mb-8">
          <TabsList className="flex h-auto min-h-11 w-full max-w-3xl mx-auto flex-wrap justify-center gap-1 bg-card/50 border border-border p-1">
            <TabsTrigger
              value="all"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Todos
            </TabsTrigger>
            {productCats.map((c) => (
              <TabsTrigger
                key={c.slug}
                value={c.slug}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {c.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Products Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-card/50 border-border overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardHeader><Skeleton className="h-6 w-3/4" /><Skeleton className="h-4 w-full mt-2" /></CardHeader>
                <CardContent><Skeleton className="h-20 w-full" /></CardContent>
                <CardFooter><Skeleton className="h-10 w-full" /></CardFooter>
              </Card>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nenhum produto encontrado</h3>
            <p className="text-muted-foreground">Não há produtos disponíveis nesta categoria no momento.</p>
          </div>
        ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product, index) => {
            const firstCategory = product.categories?.[0] ?? "system";
            const CategoryIcon = categoryIcons[firstCategory];
            
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
                  <button
                    type="button"
                    className="relative h-48 w-full overflow-hidden cursor-zoom-in border-0 bg-transparent p-0 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card rounded-t-xl"
                    onClick={() => setSelectedProduct(product)}
                  >
                    <img 
                      src={product.image_url || "/placeholder.svg"} 
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
                    <div className="absolute bottom-4 left-4 pointer-events-none">
                      <Badge variant="outline" className="bg-card/80 backdrop-blur-sm text-xs">
                        <CategoryIcon className="w-3 h-3 mr-1" />
                        {(product.categories ?? []).map((slug) => categoryLabel(slug)).join(", ")}
                      </Badge>
                    </div>
                  </button>
                  
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                      {product.name}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      {stripHtml(product.description)}
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
                      {product.original_price && (
                        <span className="text-sm text-muted-foreground line-through">
                          {formatPrice(product.original_price)}
                        </span>
                      )}
                      <span className="text-2xl font-bold text-primary">
                        {formatPrice(product.price)}
                      </span>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full border-primary/40"
                      onClick={() => setSelectedProduct(product)}
                    >
                      Ver galeria e detalhes
                    </Button>
                    
                    <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                      <a href={buildWhatsAppUrl(product)} target="_blank" rel="noopener noreferrer">
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Adquirir Agora
                      </a>
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            );
          })}
        </div>
        )}

        <AnimatePresence>
          {selectedProduct && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setGalleryLightbox(null);
                setSelectedProduct(null);
              }}
              className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-card border border-border rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="relative">
                  {selectedProduct.image_url ? (
                    <button
                      type="button"
                      className="block w-full cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-t-2xl"
                      onClick={(e) => {
                        e.stopPropagation();
                        const urls = orderedGalleryUrls(selectedProduct.image_url, selectedProduct.gallery_urls);
                        if (urls.length) setGalleryLightbox({ urls, index: 0 });
                      }}
                    >
                      <img
                        src={selectedProduct.image_url}
                        alt={selectedProduct.name}
                        className="w-full h-56 object-cover rounded-t-2xl"
                      />
                    </button>
                  ) : (
                    <div className="w-full h-56 bg-muted flex items-center justify-center rounded-t-2xl">
                      <Package className="w-16 h-16 text-muted-foreground" />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setGalleryLightbox(null);
                      setSelectedProduct(null);
                    }}
                    className="absolute top-4 right-4 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center text-foreground hover:text-primary transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="p-6 md:p-8 space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">{selectedProduct.name}</h2>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {(selectedProduct.categories ?? []).map((category) => {
                        const CategoryIcon = categoryIcons[category] ?? Package;
                        return (
                          <Badge key={category} variant="outline" className="gap-1">
                            <CategoryIcon className="w-3 h-3" />
                            {categoryLabel(category)}
                          </Badge>
                        );
                      })}
                    </div>
                    <div
                      className="text-muted-foreground prose prose-invert max-w-none text-sm md:text-base"
                      dangerouslySetInnerHTML={{ __html: selectedProduct.description }}
                    />
                  </div>

                  {galleryForProduct(selectedProduct).length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3 text-foreground">Galeria</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {galleryForProduct(selectedProduct).map((url) => {
                          const urls = orderedGalleryUrls(selectedProduct.image_url, selectedProduct.gallery_urls);
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

                  <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-border">
                    {selectedProduct.original_price && (
                      <span className="text-sm text-muted-foreground line-through">
                        {formatPrice(selectedProduct.original_price)}
                      </span>
                    )}
                    <span className="text-2xl font-bold text-primary">{formatPrice(selectedProduct.price)}</span>
                  </div>

                  <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                    <a href={buildWhatsAppUrl(selectedProduct)} target="_blank" rel="noopener noreferrer">
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Adquirir Agora
                    </a>
                  </Button>
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
          title={selectedProduct?.name ?? "Galeria"}
        />

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
