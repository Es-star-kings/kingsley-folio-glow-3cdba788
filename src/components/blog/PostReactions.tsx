import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { getVisitorId } from "@/lib/visitor";
import { cn } from "@/lib/utils";

const REACTIONS = [
  { key: "like", emoji: "👍", label: "Helpful" },
  { key: "love", emoji: "❤️", label: "Love it" },
  { key: "fire", emoji: "🔥", label: "Fire" },
  { key: "clap", emoji: "👏", label: "Applause" },
] as const;

export const PostReactions = ({ postId }: { postId: string }) => {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [mine, setMine] = useState<Set<string>>(new Set());
  const visitor = getVisitorId();

  const load = async () => {
    const { data } = await supabase
      .from("blog_reactions")
      .select("reaction, session_id")
      .eq("post_id", postId);
    const next: Record<string, number> = {};
    const own = new Set<string>();
    (data ?? []).forEach((r) => {
      next[r.reaction] = (next[r.reaction] ?? 0) + 1;
      if (r.session_id === visitor) own.add(r.reaction);
    });
    setCounts(next);
    setMine(own);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  const toggle = async (reaction: string) => {
    const has = mine.has(reaction);
    // optimistic
    setMine((prev) => {
      const n = new Set(prev);
      has ? n.delete(reaction) : n.add(reaction);
      return n;
    });
    setCounts((prev) => ({ ...prev, [reaction]: Math.max(0, (prev[reaction] ?? 0) + (has ? -1 : 1)) }));

    if (has) {
      await supabase
        .from("blog_reactions")
        .delete()
        .eq("post_id", postId)
        .eq("reaction", reaction)
        .eq("session_id", visitor);
    } else {
      await supabase
        .from("blog_reactions")
        .insert({ post_id: postId, reaction, session_id: visitor });
    }
    load();
  };

  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
      {REACTIONS.map((r) => {
        const active = mine.has(r.key);
        return (
          <motion.button
            key={r.key}
            type="button"
            whileTap={{ scale: 0.9 }}
            onClick={() => toggle(r.key)}
            aria-pressed={active}
            aria-label={`${r.label} (${counts[r.key] ?? 0})`}
            className={cn(
              "glass inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm transition-colors",
              active
                ? "border-primary/60 text-primary shadow-[0_0_20px_hsl(var(--primary)/0.25)]"
                : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            <span className="text-base leading-none">{r.emoji}</span>
            <span className="mono text-xs">{counts[r.key] ?? 0}</span>
          </motion.button>
        );
      })}
    </div>
  );
};
