-- Abilolo V1 Schema Migration: Social Profile, Community Posts, Direct Chat, and Map Geolocation

-- 1. Extend Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT NOT NULL DEFAULT '子育てユーザー',
  avatar_url TEXT,
  bio TEXT DEFAULT '子ども用品を気持ちよく譲り合いたいママ/パパです。',
  neighborhood TEXT DEFAULT '東京都新宿区',
  prefecture TEXT DEFAULT '東京都',
  latitude DOUBLE PRECISION DEFAULT 35.6938,
  longitude DOUBLE PRECISION DEFAULT 139.7034,
  baby_stages TEXT[] DEFAULT ARRAY['0-6ヶ月', '1-2歳'],
  follower_count INT DEFAULT 0,
  following_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Follows Graph
CREATE TABLE IF NOT EXISTS public.follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(follower_id, following_id)
);

-- 3. Community Posts
CREATE TABLE IF NOT EXISTS public.community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL DEFAULT '子育てママ',
  author_avatar TEXT,
  author_neighborhood TEXT DEFAULT '東京都新宿区',
  category TEXT NOT NULL DEFAULT 'tip', -- 'tip', 'request', 'chat'
  content TEXT NOT NULL,
  image_urls TEXT[] DEFAULT ARRAY[]::TEXT[],
  neighborhood TEXT DEFAULT '東京都新宿区',
  latitude DOUBLE PRECISION DEFAULT 35.6938,
  longitude DOUBLE PRECISION DEFAULT 139.7034,
  likes INT DEFAULT 0,
  comment_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Chat Rooms & Participants
CREATE TABLE IF NOT EXISTS public.chat_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES public.items(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.chat_participants (
  room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  last_read_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (room_id, user_id)
);

-- 5. Chat Messages (Realtime enabled)
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_name TEXT NOT NULL DEFAULT 'ユーザー',
  sender_avatar TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Items Location Extension
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS neighborhood TEXT DEFAULT '東京都新宿区';
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION DEFAULT 35.6938;
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION DEFAULT 139.7034;
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS giver_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS giver_avatar TEXT;

-- Enable Supabase Realtime for chat messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_posts;

-- RLS Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert/update their own profile" ON public.profiles FOR ALL USING (auth.uid() = id);

CREATE POLICY "Community posts are viewable by everyone" ON public.community_posts FOR SELECT USING (true);
CREATE POLICY "Logged in users can insert community posts" ON public.community_posts FOR INSERT WITH CHECK (true);

CREATE POLICY "Chat participants can view their rooms" ON public.chat_rooms FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.chat_participants cp WHERE cp.room_id = id AND cp.user_id = auth.uid()));

CREATE POLICY "Chat participants can view and send messages" ON public.chat_messages FOR ALL
  USING (EXISTS (SELECT 1 FROM public.chat_participants cp WHERE cp.room_id = room_id AND cp.user_id = auth.uid()));
