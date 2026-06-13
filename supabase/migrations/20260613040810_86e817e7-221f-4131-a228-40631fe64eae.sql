DROP POLICY IF EXISTS "Published posts are public" ON public.blog_posts;

CREATE POLICY "Published posts are public"
ON public.blog_posts
FOR SELECT
TO anon, authenticated
USING (published = true);

CREATE POLICY "Admins can view all blog posts"
ON public.blog_posts
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;