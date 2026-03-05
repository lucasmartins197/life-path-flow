
-- Community Stories
CREATE TABLE public.community_stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  photo_url text,
  video_url text,
  journey_moment text DEFAULT 'reflexao',
  support_count integer NOT NULL DEFAULT 0,
  comment_count integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  is_flagged boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.community_stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view published stories"
  ON public.community_stories FOR SELECT TO authenticated
  USING (is_published = true AND is_flagged = false);

CREATE POLICY "Users can insert own stories"
  ON public.community_stories FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stories"
  ON public.community_stories FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own stories"
  ON public.community_stories FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Story Supports (like "apoiar")
CREATE TABLE public.story_supports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id uuid NOT NULL REFERENCES public.community_stories(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(story_id, user_id)
);

ALTER TABLE public.story_supports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view supports"
  ON public.story_supports FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert own supports"
  ON public.story_supports FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own supports"
  ON public.story_supports FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Story Comments
CREATE TABLE public.story_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id uuid NOT NULL REFERENCES public.community_stories(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  is_flagged boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.story_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view comments"
  ON public.story_comments FOR SELECT TO authenticated
  USING (is_flagged = false);

CREATE POLICY "Users can insert own comments"
  ON public.story_comments FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON public.story_comments FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- User Connections
CREATE TABLE public.user_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  addressee_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(requester_id, addressee_id)
);

ALTER TABLE public.user_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own connections"
  ON public.user_connections FOR SELECT TO authenticated
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

CREATE POLICY "Users can insert connection requests"
  ON public.user_connections FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update connections they're part of"
  ON public.user_connections FOR UPDATE TO authenticated
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- Community Messages
CREATE TABLE public.community_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  message_type text NOT NULL DEFAULT 'text',
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.community_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own messages"
  ON public.community_messages FOR SELECT TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages"
  ON public.community_messages FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = sender_id);

-- Community rules acceptance
CREATE TABLE public.community_rules_acceptance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  accepted_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.community_rules_acceptance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own acceptance"
  ON public.community_rules_acceptance FOR ALL TO authenticated
  USING (auth.uid() = user_id);

-- Enable realtime for stories and comments
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_stories;
ALTER PUBLICATION supabase_realtime ADD TABLE public.story_comments;
