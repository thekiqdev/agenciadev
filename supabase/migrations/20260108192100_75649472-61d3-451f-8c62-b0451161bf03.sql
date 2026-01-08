-- Políticas admin para contact_submissions
CREATE POLICY "Admins can view contact submissions" 
ON public.contact_submissions 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete contact submissions" 
ON public.contact_submissions 
FOR DELETE 
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Políticas admin para budget_submissions
CREATE POLICY "Admins can view budget submissions" 
ON public.budget_submissions 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete budget submissions" 
ON public.budget_submissions 
FOR DELETE 
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Políticas admin para portfolio_items
CREATE POLICY "Admins can insert portfolio items" 
ON public.portfolio_items 
FOR INSERT 
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update portfolio items" 
ON public.portfolio_items 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete portfolio items" 
ON public.portfolio_items 
FOR DELETE 
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_portfolio_items_updated_at
BEFORE UPDATE ON public.portfolio_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();