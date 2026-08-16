CREATE TABLE public.blog_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES public.blog_comments(id) ON DELETE CASCADE,
  author_name text NOT NULL,
  author_email text,
  content text NOT NULL,
  approved boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.blog_comments TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blog_comments TO authenticated;
GRANT ALL ON public.blog_comments TO service_role;
ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "comments read" ON public.blog_comments FOR SELECT USING (approved OR public.is_admin());
CREATE POLICY "comments insert" ON public.blog_comments FOR INSERT WITH CHECK (char_length(content) BETWEEN 1 AND 3000 AND char_length(author_name) BETWEEN 1 AND 80);
CREATE POLICY "comments admin update" ON public.blog_comments FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "comments admin delete" ON public.blog_comments FOR DELETE TO authenticated USING (public.is_admin());
CREATE TRIGGER blog_comments_updated BEFORE UPDATE ON public.blog_comments FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE INDEX blog_comments_post_idx ON public.blog_comments(post_id, created_at);

CREATE TABLE public.blog_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  reaction text NOT NULL,
  session_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (post_id, reaction, session_id)
);
GRANT SELECT, INSERT, DELETE ON public.blog_reactions TO anon;
GRANT SELECT, INSERT, DELETE ON public.blog_reactions TO authenticated;
GRANT ALL ON public.blog_reactions TO service_role;
ALTER TABLE public.blog_reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reactions read" ON public.blog_reactions FOR SELECT USING (true);
CREATE POLICY "reactions insert" ON public.blog_reactions FOR INSERT WITH CHECK (reaction IN ('like','love','fire','clap') AND char_length(session_id) BETWEEN 8 AND 64);
CREATE POLICY "reactions delete" ON public.blog_reactions FOR DELETE USING (true);
CREATE INDEX blog_reactions_post_idx ON public.blog_reactions(post_id);