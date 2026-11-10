-- Abilolo V2 Schema Migration: Social Likes, Item Comments, and Community Discussion Threads

-- 1. Item Likes Table
CREATE TABLE IF NOT EXISTS public.item_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, item_id)
);

-- 2. Item Public Comments / Q&A Table
CREATE TABLE IF NOT EXISTS public.item_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL DEFAULT '子育てユーザー',
  author_avatar TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Community Post Likes Table
CREATE TABLE IF NOT EXISTS public.post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, post_id)
);

-- 4. Community Post Comments Table
CREATE TABLE IF NOT EXISTS public.post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL DEFAULT '子育てユーザー',
  author_avatar TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Enable Realtime Replication for comments and likes
ALTER PUBLICATION supabase_realtime ADD TABLE public.item_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.post_comments;

-- 6. Indexes for Fast Social Queries
CREATE INDEX IF NOT EXISTS idx_item_likes_item_id ON public.item_likes(item_id);
CREATE INDEX IF NOT EXISTS idx_item_likes_user_id ON public.item_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_item_comments_item_id ON public.item_comments(item_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON public.post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON public.post_comments(post_id);

-- 7. Row Level Security Policies
ALTER TABLE public.item_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.item_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

-- Public can view likes and comments
CREATE POLICY "Item likes are viewable by everyone" ON public.item_likes FOR SELECT USING (true);
CREATE POLICY "Item comments are viewable by everyone" ON public.item_comments FOR SELECT USING (true);
CREATE POLICY "Post likes are viewable by everyone" ON public.post_likes FOR SELECT USING (true);
CREATE POLICY "Post comments are viewable by everyone" ON public.post_comments FOR SELECT USING (true);

-- Authenticated / Guest users can insert
CREATE POLICY "Users can insert/delete their item likes" ON public.item_likes FOR ALL USING (true);
CREATE POLICY "Users can insert item comments" ON public.item_comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can insert/delete their post likes" ON public.post_likes FOR ALL USING (true);
CREATE POLICY "Users can insert post comments" ON public.post_comments FOR INSERT WITH CHECK (true);
