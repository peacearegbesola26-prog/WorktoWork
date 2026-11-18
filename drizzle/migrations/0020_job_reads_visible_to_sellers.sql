DROP POLICY IF EXISTS buyer_only ON public.jobs;
CREATE POLICY buyer_only_insert ON public.jobs AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK (public.is_buyer());
CREATE POLICY buyer_only_update ON public.jobs AS RESTRICTIVE FOR UPDATE TO authenticated USING (public.is_buyer()) WITH CHECK (public.is_buyer());
CREATE POLICY buyer_only_delete ON public.jobs AS RESTRICTIVE FOR DELETE TO authenticated USING (public.is_buyer());