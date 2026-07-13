import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { AdminHeader } from "./AdminHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type Post = {
  id: string; title: string; slug: string; excerpt: string | null;
  content: string | null; featured_image: string | null; category: string | null;
  tags: string[]; status: string; reading_time: number | null;
  seo_title: string | null; seo_description: string | null;
  published_at: string | null; scheduled_at: string | null; created_at: string;
};

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const readingTime = (s: string) => Math.max(1, Math.round((s?.split(/\s+/).length ?? 0) / 200));

export const BlogManager = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [active, setActive] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("blog_posts").select("*").order("created_at", { ascending: false });
    setPosts((data as Post[]) ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const newPost = () => {
    setActive({
      id: crypto.randomUUID(),
      title: "Untitled",
      slug: `draft-${Date.now()}`,
      excerpt: "", content: "", featured_image: "", category: "", tags: [],
      status: "draft", reading_time: 1, seo_title: "", seo_description: "",
      published_at: null, scheduled_at: null, created_at: new Date().toISOString(),
    } as Post);
  };

  const save = async () => {
    if (!active) return;
    setSaving(true);
    const isNew = !posts.find((p) => p.id === active.id);
    const record = {
      ...active,
      slug: active.slug || slugify(active.title),
      reading_time: readingTime(active.content ?? ""),
      published_at: active.status === "published" && !active.published_at ? new Date().toISOString() : active.published_at,
    };
    const { error } = isNew
      ? await supabase.from("blog_posts").insert(record).select().single()
      : await supabase.from("blog_posts").update(record).eq("id", active.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Post saved");
    load();
  };

  const del = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    await supabase.from("blog_posts").delete().eq("id", id);
    if (active?.id === id) setActive(null);
    load();
    toast.success("Deleted");
  };

  return (
    <div>
      <AdminHeader
        title="Blog"
        subtitle="Write, schedule, and publish posts."
        actions={<Button variant="hero" onClick={newPost}><Plus className="h-4 w-4" /> New post</Button>}
      />

      <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-4">
        <div className="glass rounded-2xl overflow-hidden">
          <div className="max-h-[70vh] overflow-y-auto divide-y divide-border">
            {loading && <div className="p-4 space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16" />)}</div>}
            {!loading && posts.length === 0 && (
              <div className="p-8 text-center text-sm text-muted-foreground">No posts yet. Click "New post".</div>
            )}
            {posts.map((p) => (
              <button
                key={p.id}
                onClick={() => setActive(p)}
                className={cn("w-full text-left p-4 hover:bg-muted/40", active?.id === p.id && "bg-muted/60")}
              >
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-[10px] mono uppercase px-2 py-0.5 rounded-full",
                    p.status === "published" ? "bg-primary/20 text-primary" :
                      p.status === "scheduled" ? "bg-secondary/30" : "bg-muted",
                  )}>{p.status}</span>
                  <span className="font-medium truncate">{p.title}</span>
                </div>
                <div className="text-xs text-muted-foreground truncate mt-1">/{p.slug}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          {!active ? (
            <div className="h-full min-h-[40vh] grid place-items-center text-muted-foreground">Select or create a post</div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 justify-end">
                <Button variant="ghost" onClick={() => del(active.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                <Button variant="hero" onClick={save} disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save
                </Button>
              </div>
              <Input placeholder="Post title" value={active.title} onChange={(e) => setActive({ ...active, title: e.target.value, slug: active.slug || slugify(e.target.value) })} className="text-2xl font-display font-bold h-14" />
              <div className="grid sm:grid-cols-2 gap-3">
                <Input placeholder="slug" value={active.slug} onChange={(e) => setActive({ ...active, slug: slugify(e.target.value) })} />
                <select value={active.status} onChange={(e) => setActive({ ...active, status: e.target.value })} className="h-10 bg-muted/50 rounded-md px-3 border border-border">
                  <option value="draft">Draft</option><option value="published">Published</option><option value="scheduled">Scheduled</option>
                </select>
              </div>
              <Input placeholder="Featured image URL" value={active.featured_image ?? ""} onChange={(e) => setActive({ ...active, featured_image: e.target.value })} />
              <Textarea placeholder="Excerpt" rows={2} value={active.excerpt ?? ""} onChange={(e) => setActive({ ...active, excerpt: e.target.value })} />
              <div className="grid sm:grid-cols-2 gap-3">
                <Input placeholder="Category" value={active.category ?? ""} onChange={(e) => setActive({ ...active, category: e.target.value })} />
                <Input placeholder="Tags (comma separated)" value={(active.tags ?? []).join(", ")} onChange={(e) => setActive({ ...active, tags: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} />
              </div>
              <Textarea placeholder="Write in markdown…" rows={18} value={active.content ?? ""} onChange={(e) => setActive({ ...active, content: e.target.value })} className="font-mono text-sm" />
              <div className="text-xs text-muted-foreground">~{readingTime(active.content ?? "")} min read</div>
              <div className="border-t border-border pt-3 space-y-2">
                <div className="text-xs mono uppercase text-muted-foreground">SEO</div>
                <Input placeholder="SEO title" value={active.seo_title ?? ""} onChange={(e) => setActive({ ...active, seo_title: e.target.value })} />
                <Textarea placeholder="SEO description" rows={2} value={active.seo_description ?? ""} onChange={(e) => setActive({ ...active, seo_description: e.target.value })} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
