import { useEffect, useMemo, useState } from "react";
import { MessageCircle, Reply, Send } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Comment = {
  id: string;
  parent_id: string | null;
  author_name: string;
  content: string;
  created_at: string;
};

const schema = z.object({
  author_name: z.string().trim().min(2, "Name is too short").max(80, "Name is too long"),
  author_email: z.string().trim().email("Enter a valid email").max(255).or(z.literal("")),
  content: z.string().trim().min(2, "Say a little more").max(3000, "Comment is too long"),
});

const timeAgo = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
};

const initials = (name: string) =>
  name.trim().split(/\s+/).slice(0, 2).map((s) => s[0]?.toUpperCase()).join("");

export const PostComments = ({ postId }: { postId: string }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [form, setForm] = useState({ author_name: "", author_email: "", content: "" });
  const [sending, setSending] = useState(false);

  const load = async () => {
    const { data } = await supabase
      .from("blog_comments")
      .select("id, parent_id, author_name, content, created_at")
      .eq("post_id", postId)
      .eq("approved", true)
      .order("created_at", { ascending: true });
    setComments((data as Comment[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  const threads = useMemo(() => {
    const roots = comments.filter((c) => !c.parent_id);
    return roots.map((root) => ({
      root,
      replies: comments.filter((c) => c.parent_id === root.id),
    }));
  }, [comments]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setSending(true);
    const { error } = await supabase.from("blog_comments").insert({
      post_id: postId,
      parent_id: replyTo,
      author_name: parsed.data.author_name,
      author_email: parsed.data.author_email || null,
      content: parsed.data.content,
    });
    setSending(false);
    if (error) {
      toast.error("Couldn't post your comment. Please try again.");
      return;
    }
    toast.success(replyTo ? "Reply posted" : "Comment posted");
    setForm((f) => ({ ...f, content: "" }));
    setReplyTo(null);
    load();
  };

  const Bubble = ({ c, nested = false }: { c: Comment; nested?: boolean }) => (
    <div className={nested ? "ml-6 sm:ml-12" : ""}>
      <div className="glass rounded-2xl border border-border p-4">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
            {initials(c.author_name) || "?"}
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-medium">{c.author_name}</div>
            <div className="mono text-[11px] text-muted-foreground">{timeAgo(c.created_at)}</div>
          </div>
        </div>
        <p className="mt-3 whitespace-pre-wrap break-words text-sm text-muted-foreground">{c.content}</p>
        {!nested && (
          <button
            type="button"
            onClick={() => {
              setReplyTo(c.id);
              document.getElementById("comment-form")?.scrollIntoView({ behavior: "smooth", block: "center" });
            }}
            className="mt-3 inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
          >
            <Reply className="h-3.5 w-3.5" /> Reply
          </button>
        )}
      </div>
    </div>
  );

  return (
    <section className="mt-14 border-t border-border pt-10" aria-label="Comments">
      <h2 className="font-display flex items-center gap-2 text-xl font-bold sm:text-2xl">
        <MessageCircle className="h-5 w-5 text-primary" />
        Discussion
        <span className="mono text-sm text-muted-foreground">({comments.length})</span>
      </h2>

      <div className="mt-6 space-y-4">
        {loading && <p className="text-sm text-muted-foreground">Loading comments…</p>}
        {!loading && threads.length === 0 && (
          <p className="text-sm text-muted-foreground">No comments yet — start the conversation.</p>
        )}
        {threads.map(({ root, replies }) => (
          <div key={root.id} className="space-y-3">
            <Bubble c={root} />
            {replies.map((r) => (
              <Bubble key={r.id} c={r} nested />
            ))}
          </div>
        ))}
      </div>

      <form id="comment-form" onSubmit={submit} className="glass mt-8 space-y-4 rounded-3xl border border-border p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-display text-base font-semibold">
            {replyTo ? "Write a reply" : "Leave a comment"}
          </h3>
          {replyTo && (
            <Button type="button" variant="ghost" size="sm" onClick={() => setReplyTo(null)}>
              Cancel reply
            </Button>
          )}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            placeholder="Your name"
            value={form.author_name}
            maxLength={80}
            onChange={(e) => setForm({ ...form, author_name: e.target.value })}
          />
          <Input
            type="email"
            placeholder="Email (optional, never shown)"
            value={form.author_email}
            maxLength={255}
            onChange={(e) => setForm({ ...form, author_email: e.target.value })}
          />
        </div>
        <Textarea
          rows={4}
          placeholder="Share your thoughts…"
          value={form.content}
          maxLength={3000}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
        />
        <Button type="submit" variant="neon" disabled={sending}>
          <Send className="h-4 w-4" /> {sending ? "Posting…" : replyTo ? "Post reply" : "Post comment"}
        </Button>
      </form>
    </section>
  );
};
