-- Create products table for the digital store
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  original_price NUMERIC(10,2),
  category TEXT NOT NULL CHECK (category IN ('license', 'system', 'template')),
  features TEXT[] NOT NULL DEFAULT '{}',
  image_url TEXT,
  popular BOOLEAN NOT NULL DEFAULT false,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (products should be visible to everyone)
CREATE POLICY "Products are viewable by everyone" 
ON public.products 
FOR SELECT 
USING (active = true);

-- Create policy for admin full access
CREATE POLICY "Admins can manage products" 
ON public.products 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();