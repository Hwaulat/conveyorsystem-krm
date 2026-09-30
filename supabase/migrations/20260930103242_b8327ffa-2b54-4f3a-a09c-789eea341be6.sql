CREATE TYPE public.app_role AS ENUM ('admin', 'supervisor', 'operator', 'viewer');
CREATE TYPE public.scan_event_type AS ENUM ('ARRIVE', 'START', 'FINISH');
CREATE TYPE public.scan_source AS ENUM ('manual', 'barcode', 'rfid', 'import', 'correction');

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY,
  display_name text NOT NULL DEFAULT 'Plant User',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated users view profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "users create own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL DEFAULT 'viewer',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('admin','supervisor','operator'))
$$;
GRANT EXECUTE ON FUNCTION public.is_staff(uuid) TO authenticated;

CREATE POLICY "users view own role" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins create roles" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins update roles" ON public.user_roles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins delete roles" ON public.user_roles FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.areas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  sequence integer NOT NULL UNIQUE CHECK (sequence > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.areas TO authenticated;
GRANT ALL ON public.areas TO service_role;
ALTER TABLE public.areas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated view areas" ON public.areas FOR SELECT TO authenticated USING (true);
CREATE POLICY "supervisors maintain areas" ON public.areas FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'supervisor')) WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'supervisor'));
CREATE TRIGGER areas_updated_at BEFORE UPDATE ON public.areas FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.stations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  area_id uuid NOT NULL REFERENCES public.areas(id) ON DELETE CASCADE,
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  sequence integer NOT NULL CHECK (sequence > 0),
  scan_events_used public.scan_event_type[] NOT NULL DEFAULT ARRAY['ARRIVE','START','FINISH']::public.scan_event_type[],
  target_seconds integer NOT NULL DEFAULT 900 CHECK (target_seconds > 0),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(area_id, sequence)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.stations TO authenticated;
GRANT ALL ON public.stations TO service_role;
ALTER TABLE public.stations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated view stations" ON public.stations FOR SELECT TO authenticated USING (true);
CREATE POLICY "supervisors maintain stations" ON public.stations FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'supervisor')) WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'supervisor'));
CREATE TRIGGER stations_updated_at BEFORE UPDATE ON public.stations FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.cabins (
  serial_number text PRIMARY KEY,
  color_code text NOT NULL,
  color_name text NOT NULL,
  model text NOT NULL,
  lot_number text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cabins TO authenticated;
GRANT ALL ON public.cabins TO service_role;
ALTER TABLE public.cabins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated view cabins" ON public.cabins FOR SELECT TO authenticated USING (true);
CREATE POLICY "staff maintain cabins" ON public.cabins FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER cabins_updated_at BEFORE UPDATE ON public.cabins FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.scanners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  station_id uuid NOT NULL REFERENCES public.stations(id) ON DELETE CASCADE,
  name text NOT NULL,
  token_hash text NOT NULL UNIQUE,
  is_active boolean NOT NULL DEFAULT true,
  last_seen_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.scanners TO authenticated;
GRANT ALL ON public.scanners TO service_role;
ALTER TABLE public.scanners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "supervisors view scanners" ON public.scanners FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'supervisor'));
CREATE POLICY "admins maintain scanners" ON public.scanners FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER scanners_updated_at BEFORE UPDATE ON public.scanners FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.scan_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_key text UNIQUE,
  serial_number text NOT NULL REFERENCES public.cabins(serial_number),
  station_id uuid NOT NULL REFERENCES public.stations(id),
  event_type public.scan_event_type NOT NULL,
  scanned_at timestamptz NOT NULL DEFAULT now(),
  source public.scan_source NOT NULL DEFAULT 'manual',
  recorded_by uuid,
  corrected_by uuid,
  correction_reason text,
  original_event_id uuid REFERENCES public.scan_events(id),
  is_void boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK ((source <> 'correction') OR (corrected_by IS NOT NULL AND length(trim(correction_reason)) >= 5))
);
GRANT SELECT, INSERT, UPDATE ON public.scan_events TO authenticated;
GRANT ALL ON public.scan_events TO service_role;
ALTER TABLE public.scan_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated view scan events" ON public.scan_events FOR SELECT TO authenticated USING (true);
CREATE POLICY "staff record scans" ON public.scan_events FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()) AND (recorded_by IS NULL OR recorded_by = auth.uid()));
CREATE POLICY "supervisors correct scans" ON public.scan_events FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'supervisor')) WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'supervisor'));
CREATE INDEX scan_events_serial_time_idx ON public.scan_events(serial_number, scanned_at DESC);
CREATE INDEX scan_events_station_time_idx ON public.scan_events(station_id, scanned_at DESC);

CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text NOT NULL,
  reason text,
  changes jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated view audit logs" ON public.audit_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "staff create audit logs" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()) AND (actor_id IS NULL OR actor_id = auth.uid()));

INSERT INTO public.areas (id,name,sequence) VALUES
('10000000-0000-0000-0000-000000000001','PTED',1),('10000000-0000-0000-0000-000000000002','Sanding',2),('10000000-0000-0000-0000-000000000003','Sealing',3),('10000000-0000-0000-0000-000000000004','Topcoat',4),('10000000-0000-0000-0000-000000000005','Touch-up',5);

INSERT INTO public.stations (id,area_id,code,name,sequence,target_seconds) VALUES
('20000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','PT-01','Pre-treatment 1',1,1080),('20000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000001','PT-02','Pre-treatment 2',2,1080),('20000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000001','PT-03','E-coat',3,1080),('20000000-0000-0000-0000-000000000004','10000000-0000-0000-0000-000000000001','PT-04','Oven',4,1080),
('20000000-0000-0000-0000-000000000005','10000000-0000-0000-0000-000000000002','SD-01','Sanding 1',1,840),('20000000-0000-0000-0000-000000000006','10000000-0000-0000-0000-000000000002','SD-02','Sanding 2',2,840),('20000000-0000-0000-0000-000000000007','10000000-0000-0000-0000-000000000002','SD-03','Dust removal',3,840),('20000000-0000-0000-0000-000000000008','10000000-0000-0000-0000-000000000002','SD-04','Inspection',4,840),
('20000000-0000-0000-0000-000000000009','10000000-0000-0000-0000-000000000003','SL-01','Sealer prep',1,1320),('20000000-0000-0000-0000-000000000010','10000000-0000-0000-0000-000000000003','SL-02','Interior seal',2,1320),('20000000-0000-0000-0000-000000000011','10000000-0000-0000-0000-000000000003','SL-03','Exterior seal',3,1320),('20000000-0000-0000-0000-000000000012','10000000-0000-0000-0000-000000000003','SL-04','Sealer oven',4,1320),
('20000000-0000-0000-0000-000000000013','10000000-0000-0000-0000-000000000004','TC-01','Primer',1,1680),('20000000-0000-0000-0000-000000000014','10000000-0000-0000-0000-000000000004','TC-02','Basecoat',2,1680),('20000000-0000-0000-0000-000000000015','10000000-0000-0000-0000-000000000004','TC-03','Clearcoat',3,1680),('20000000-0000-0000-0000-000000000016','10000000-0000-0000-0000-000000000004','TC-04','Flash-off',4,1680),('20000000-0000-0000-0000-000000000017','10000000-0000-0000-0000-000000000004','TC-05','Topcoat oven',5,1680),
('20000000-0000-0000-0000-000000000018','10000000-0000-0000-0000-000000000005','TU-01','Inspection',1,720),('20000000-0000-0000-0000-000000000019','10000000-0000-0000-0000-000000000005','TU-02','Touch-up',2,720),('20000000-0000-0000-0000-000000000020','10000000-0000-0000-0000-000000000005','TU-03','Final release',3,720);

INSERT INTO public.cabins(serial_number,color_code,color_name,model,lot_number) VALUES
('CAB-240930-1847','WHT-01','Arctic White','FMX','L2409-18'),('CAB-240930-1852','BLU-12','Ocean Blue','FH16','L2409-18'),('CAB-240930-1861','GRY-07','Graphite','FM','L2409-19'),('CAB-240930-1864','RED-04','Signal Red','FMX','L2409-19');

INSERT INTO public.scan_events(event_key,serial_number,station_id,event_type,scanned_at,source) VALUES
('demo-1847-arrive','CAB-240930-1847','20000000-0000-0000-0000-000000000011','ARRIVE',now()-interval '35 minutes','import'),('demo-1847-start','CAB-240930-1847','20000000-0000-0000-0000-000000000011','START',now()-interval '32 minutes','import'),
('demo-1852-arrive','CAB-240930-1852','20000000-0000-0000-0000-000000000014','ARRIVE',now()-interval '10 minutes','import'),('demo-1852-start','CAB-240930-1852','20000000-0000-0000-0000-000000000014','START',now()-interval '9 minutes','import'),
('demo-1861-arrive','CAB-240930-1861','20000000-0000-0000-0000-000000000008','ARRIVE',now()-interval '7 minutes','import'),
('demo-1864-arrive','CAB-240930-1864','20000000-0000-0000-0000-000000000003','ARRIVE',now()-interval '5 minutes','import'),('demo-1864-start','CAB-240930-1864','20000000-0000-0000-0000-000000000003','START',now()-interval '4 minutes','import');

ALTER PUBLICATION supabase_realtime ADD TABLE public.areas;
ALTER PUBLICATION supabase_realtime ADD TABLE public.stations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.cabins;
ALTER PUBLICATION supabase_realtime ADD TABLE public.scan_events;