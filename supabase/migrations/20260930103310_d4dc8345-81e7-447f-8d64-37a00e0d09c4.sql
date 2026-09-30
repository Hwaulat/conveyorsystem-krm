CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA private TO authenticated;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;
CREATE OR REPLACE FUNCTION private.is_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('admin','supervisor','operator'))
$$;
REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION private.is_staff(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION private.is_staff(uuid) TO authenticated;

DROP POLICY "users view own role" ON public.user_roles;
DROP POLICY "admins create roles" ON public.user_roles;
DROP POLICY "admins update roles" ON public.user_roles;
DROP POLICY "admins delete roles" ON public.user_roles;
CREATE POLICY "users view own role" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR private.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins create roles" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins update roles" ON public.user_roles FOR UPDATE TO authenticated USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins delete roles" ON public.user_roles FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'));

DROP POLICY "supervisors maintain areas" ON public.areas;
CREATE POLICY "supervisors maintain areas" ON public.areas FOR ALL TO authenticated USING (private.has_role(auth.uid(),'admin') OR private.has_role(auth.uid(),'supervisor')) WITH CHECK (private.has_role(auth.uid(),'admin') OR private.has_role(auth.uid(),'supervisor'));
DROP POLICY "supervisors maintain stations" ON public.stations;
CREATE POLICY "supervisors maintain stations" ON public.stations FOR ALL TO authenticated USING (private.has_role(auth.uid(),'admin') OR private.has_role(auth.uid(),'supervisor')) WITH CHECK (private.has_role(auth.uid(),'admin') OR private.has_role(auth.uid(),'supervisor'));
DROP POLICY "staff maintain cabins" ON public.cabins;
CREATE POLICY "staff maintain cabins" ON public.cabins FOR ALL TO authenticated USING (private.is_staff(auth.uid())) WITH CHECK (private.is_staff(auth.uid()));
DROP POLICY "supervisors view scanners" ON public.scanners;
DROP POLICY "admins maintain scanners" ON public.scanners;
CREATE POLICY "supervisors view scanners" ON public.scanners FOR SELECT TO authenticated USING (private.has_role(auth.uid(),'admin') OR private.has_role(auth.uid(),'supervisor'));
CREATE POLICY "admins maintain scanners" ON public.scanners FOR ALL TO authenticated USING (private.has_role(auth.uid(),'admin')) WITH CHECK (private.has_role(auth.uid(),'admin'));
DROP POLICY "staff record scans" ON public.scan_events;
DROP POLICY "supervisors correct scans" ON public.scan_events;
CREATE POLICY "staff record scans" ON public.scan_events FOR INSERT TO authenticated WITH CHECK (private.is_staff(auth.uid()) AND (recorded_by IS NULL OR recorded_by = auth.uid()));
CREATE POLICY "supervisors correct scans" ON public.scan_events FOR UPDATE TO authenticated USING (private.has_role(auth.uid(),'admin') OR private.has_role(auth.uid(),'supervisor')) WITH CHECK (private.has_role(auth.uid(),'admin') OR private.has_role(auth.uid(),'supervisor'));
DROP POLICY "staff create audit logs" ON public.audit_logs;
CREATE POLICY "staff create audit logs" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (private.is_staff(auth.uid()) AND (actor_id IS NULL OR actor_id = auth.uid()));

DROP FUNCTION public.has_role(uuid, public.app_role);
DROP FUNCTION public.is_staff(uuid);