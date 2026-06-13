
REVOKE EXECUTE ON FUNCTION public.has_admin_access(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_admin_access(uuid) TO authenticated, service_role;
