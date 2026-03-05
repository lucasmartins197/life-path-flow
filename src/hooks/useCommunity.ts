import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface CommunityStory {
  id: string;
  user_id: string;
  title: string;
  content: string;
  photo_url: string | null;
  video_url: string | null;
  journey_moment: string | null;
  support_count: number;
  comment_count: number;
  created_at: string;
  author_name?: string;
  author_avatar?: string;
  has_supported?: boolean;
}

export interface StoryComment {
  id: string;
  story_id: string;
  user_id: string;
  content: string;
  created_at: string;
  author_name?: string;
  author_avatar?: string;
}

export function useCommunity() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stories, setStories] = useState<CommunityStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasAcceptedRules, setHasAcceptedRules] = useState<boolean | null>(null);

  const checkRulesAcceptance = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("community_rules_acceptance")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();
    setHasAcceptedRules(!!data);
  }, [user]);

  const acceptRules = async () => {
    if (!user) return;
    await supabase
      .from("community_rules_acceptance")
      .insert({ user_id: user.id });
    setHasAcceptedRules(true);
  };

  const fetchStories = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: storiesData, error } = await supabase
        .from("community_stories")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      if (storiesData && storiesData.length > 0) {
        const userIds = [...new Set(storiesData.map((s) => s.user_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name, avatar_url")
          .in("user_id", userIds);

        const { data: supports } = await supabase
          .from("story_supports")
          .select("story_id")
          .eq("user_id", user.id);

        const supportedIds = new Set(supports?.map((s) => s.story_id) || []);
        const profileMap = new Map(
          profiles?.map((p) => [p.user_id, p]) || []
        );

        const enriched: CommunityStory[] = storiesData.map((s) => {
          const profile = profileMap.get(s.user_id);
          return {
            ...s,
            author_name: profile?.full_name || "Anônimo",
            author_avatar: profile?.avatar_url || undefined,
            has_supported: supportedIds.has(s.id),
          };
        });
        setStories(enriched);
      } else {
        setStories([]);
      }
    } catch (err) {
      console.error("Error fetching stories:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createStory = async (data: {
    title: string;
    content: string;
    journey_moment?: string;
    photo_url?: string;
    video_url?: string;
  }) => {
    if (!user) return;
    const { error } = await supabase.from("community_stories").insert({
      user_id: user.id,
      title: data.title,
      content: data.content,
      journey_moment: data.journey_moment || "reflexao",
      photo_url: data.photo_url || null,
      video_url: data.video_url || null,
    });
    if (error) {
      toast({ title: "Erro ao publicar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "História publicada", description: "Obrigado por compartilhar." });
      fetchStories();
    }
  };

  const toggleSupport = async (storyId: string, currentlySupported: boolean) => {
    if (!user) return;
    if (currentlySupported) {
      await supabase
        .from("story_supports")
        .delete()
        .eq("story_id", storyId)
        .eq("user_id", user.id);
    } else {
      await supabase
        .from("story_supports")
        .insert({ story_id: storyId, user_id: user.id });
    }
    setStories((prev) =>
      prev.map((s) =>
        s.id === storyId
          ? {
              ...s,
              has_supported: !currentlySupported,
              support_count: s.support_count + (currentlySupported ? -1 : 1),
            }
          : s
      )
    );
    if (!currentlySupported) {
      toast({ title: "Você não está sozinho.", description: "Seu apoio foi registrado." });
    }
  };

  const fetchComments = async (storyId: string): Promise<StoryComment[]> => {
    const { data: comments } = await supabase
      .from("story_comments")
      .select("*")
      .eq("story_id", storyId)
      .order("created_at", { ascending: true });

    if (!comments || comments.length === 0) return [];

    const userIds = [...new Set(comments.map((c) => c.user_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, full_name, avatar_url")
      .in("user_id", userIds);

    const profileMap = new Map(profiles?.map((p) => [p.user_id, p]) || []);

    return comments.map((c) => {
      const profile = profileMap.get(c.user_id);
      return {
        ...c,
        author_name: profile?.full_name || "Anônimo",
        author_avatar: profile?.avatar_url || undefined,
      };
    });
  };

  const addComment = async (storyId: string, content: string) => {
    if (!user) return;
    const { error } = await supabase.from("story_comments").insert({
      story_id: storyId,
      user_id: user.id,
      content,
    });
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      setStories((prev) =>
        prev.map((s) =>
          s.id === storyId ? { ...s, comment_count: s.comment_count + 1 } : s
        )
      );
    }
  };

  useEffect(() => {
    checkRulesAcceptance();
    fetchStories();
  }, [checkRulesAcceptance, fetchStories]);

  return {
    stories,
    loading,
    hasAcceptedRules,
    acceptRules,
    createStory,
    toggleSupport,
    fetchComments,
    addComment,
    refreshStories: fetchStories,
  };
}
