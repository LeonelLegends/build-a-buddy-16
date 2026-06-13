
-- Promote earliest admin to master if no master exists
DO $$
DECLARE
  first_admin uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'master') THEN
    SELECT ur.user_id INTO first_admin
      FROM public.user_roles ur
      JOIN auth.users u ON u.id = ur.user_id
     WHERE ur.role = 'admin'
     ORDER BY u.created_at ASC
     LIMIT 1;
    IF first_admin IS NOT NULL THEN
      INSERT INTO public.user_roles (user_id, role)
        VALUES (first_admin, 'master')
        ON CONFLICT (user_id, role) DO NOTHING;
    END IF;
  END IF;
END $$;

-- Helper: any admin or master counts as having admin access
CREATE OR REPLACE FUNCTION public.has_admin_access(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('admin','master')
  )
$$;
