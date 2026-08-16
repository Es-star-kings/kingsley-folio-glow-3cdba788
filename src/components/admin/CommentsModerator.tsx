import { useEffect, useState } from "react";
import { Check, EyeOff, Trash2, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Row = {
  id: string;
  post_id: string;
  parent_id: string | null;
  author_name: string;
  author_email: string | null;
  content: string;
  approved: boolean;
  created_at: string;
  blog_posts?: { title: string; slug: string } | null;
};

export const CommentsModerator = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [filter, setFilter] = useState<"all" | "approved" | "hidden">("all");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("blog_comments")
      .select("*, blog_posts(title, slug)")
      .order("created_at", { ascending: false });
    setRows((data as Row[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const setApproved = async (id: string, approved: boolean) => {
    const { error } = await supabase.from("blog_comments").update({ approved }).eq("id", id);
    if (error) return toast.error("Update failed");
    setRows((r) => r.map((x) => (x.id === id ? { ...x, approved } : x)));
    toast.success(approved ? "Comment published" : "Comment hidden");
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("blog_comments").delete().eq("id", id);
    if (error) return toast.error("Delete failed");
    setRows((r) => r.filter((x) => x.id !== id));
    toast.success("Comment deleted");
  };

  const visible = rows.filter((r) =>
    filter === "all" ? true : filter === "approved" ? r.approved : !r.approved,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Blog comments</h1>
          <p className="text-sm text-muted-foreground">Moderate discussion on your articles.</p>
        </div>
        <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <TabsList>
            <TabsTrigger value="all">All ({rows.length})</TabsTrigger>
            <TabsTrigger value="approved">Live ({rows.filter((r) => r.approved).length})</TabsTrigger>
            <TabsTrigger value="hidden">Hidden ({rows.filter((r) => !r.approved).length})</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {!loading && visible.length === 0 && (
        <div className="glass grid place-items-center rounded-3xl border border-border p-12 text-center">
          <MessageCircle className="mb-3 h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No comments here yet.</p>
        </div>
      )}

      <div className="space-y-3">
        {visible.map((c) => (
          <div key={c.id} className="glass rounded-2xl border border-border p-4">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{c.author_name}</span>
              {c.author_email && <span className="mono">{c.author_email}</span>}
              <span className="mono">{new Date(c.created_at).toLocaleString()}</span>
              {c.parent_id && <span className="rounded-full bg-muted px-2 py-0.5">reply</span>}
              {!c.approved && <span className="rounded-full bg-destructive/15 px-2 py-0.5 text-destructive">hidden</span>}
            </div>
            {c.blog_posts && (
              <div className="mono mt-1 text-[11px] text-primary">on “{c.blog_posts.title}”</div>
            )}
            <p className="mt-3 whitespace-pre-wrap text-sm">{c.content}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {c.approved ? (
                <Button size="sm" variant="outline" onClick={() => setApproved(c.id, false)}>
                  <EyeOff className="h-4 w-4" /> Hide
                </Button>
              ) : (
                <Button size="sm" variant="neon" onClick={() => setApproved(c.id, true)}>
                  <Check className="h-4 w-4" /> Publish
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={() => remove(c.id)}>
                <Trash2 className="h-4 w-4" /> Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
