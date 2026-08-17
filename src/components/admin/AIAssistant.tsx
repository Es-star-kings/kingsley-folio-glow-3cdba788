import { useState } from "react";
import { toast } from "sonner";
import { Copy, Loader2, PenLine, Send, Sparkles, Wand2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { AdminHeader } from "./AdminHeader";
import { cn } from "@/lib/utils";

const PRESETS = [
  { id: "project", label: "Project description", prompt: "Write a compelling, benefit-focused project description (80-120 words) for this project:" },
  { id: "bio", label: "Improve bio", prompt: "Improve this developer bio — keep it under 60 words, make it confident and specific:" },
  { id: "blog", label: "Blog post outline", prompt: "Draft a technical blog post outline with intro, 4-6 sections, and conclusion, on the topic:" },
  { id: "seo", label: "SEO meta", prompt: "Write an SEO title (<60 chars) and meta description (<160 chars) for this page:" },
  { id: "skill", label: "Skill description", prompt: "Write a one-line professional description for this skill (max 20 words):" },
  { id: "email", label: "Client email", prompt: "Draft a polite, professional email based on this context:" },
  { id: "proposal", label: "Client proposal", prompt: "Write a short client proposal (scope, deliverables, timeline, price placeholder) for:" },
  { id: "social", label: "Social post", prompt: "Write 3 short X posts (<280 chars each) about:" },
];

const TONES = ["Practical & technical", "Friendly & conversational", "Opinionated & bold", "Beginner-friendly"];
const LENGTHS = [
  { id: "short", label: "Short (~600 words)" },
  { id: "medium", label: "Medium (~1,000 words)" },
  { id: "long", label: "Deep dive (~1,800 words)" },
];

type GeneratedPost = {
  title: string; slug: string; excerpt: string; content: string;
  category: string; tags: string[]; seo_title: string; seo_description: string;
};

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const readingTime = (s: string) => Math.max(1, Math.round((s?.split(/\s+/).length ?? 0) / 200));

export const AIAssistant = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"copy" | "post">("post");

  // copy mode
  const [preset, setPreset] = useState(PRESETS[0]);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  // blog mode
  const [topic, setTopic] = useState("");
  const [audience, setAudience] = useState("");
  const [tone, setTone] = useState(TONES[0]);
  const [length, setLength] = useState(LENGTHS[1].id);
  const [keywords, setKeywords] = useState("");
  const [notes, setNotes] = useState("");
  const [writing, setWriting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [post, setPost] = useState<GeneratedPost | null>(null);

  const generate = async () => {
    if (!input.trim()) return toast.error("Add some context");
    setLoading(true);
    setOutput("");
    try {
      const { data, error } = await supabase.functions.invoke("ai-assist", {
        body: { prompt: `${preset.prompt}\n\n${input}` },
      });
      if (error) throw error;
      setOutput(data?.text ?? "");
    } catch (e: any) {
      toast.error(e.message ?? "AI request failed");
    } finally {
      setLoading(false);
    }
  };

  const writePost = async () => {
    if (!topic.trim()) return toast.error("What should the post be about?");
    setWriting(true);
    setPost(null);
    const wordTarget = length === "short" ? 600 : length === "long" ? 1800 : 1000;
    const prompt = [
      `Write a complete blog post about: ${topic.trim()}`,
      audience.trim() && `Target reader: ${audience.trim()}`,
      `Tone: ${tone}`,
      `Target length: about ${wordTarget} words`,
      keywords.trim() && `Naturally include these keywords: ${keywords.trim()}`,
      notes.trim() && `Extra instructions: ${notes.trim()}`,
    ].filter(Boolean).join("\n");

    try {
      const { data, error } = await supabase.functions.invoke("ai-assist", { body: { mode: "blog", prompt } });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const p = data?.post as GeneratedPost;
      if (!p?.title || !p?.content) throw new Error("AI returned an empty post");
      setPost({
        ...p,
        slug: slugify(p.slug || p.title),
        tags: Array.isArray(p.tags) ? p.tags : [],
      });
      toast.success("Draft written — review it below");
    } catch (e: any) {
      toast.error(e.message ?? "Could not write the post");
    } finally {
      setWriting(false);
    }
  };

  const savePost = async (status: "draft" | "published") => {
    if (!post) return;
    setSaving(true);
    const { error } = await supabase.from("blog_posts").insert({
      title: post.title,
      slug: `${post.slug}-${Date.now().toString(36).slice(-4)}`,
      excerpt: post.excerpt,
      content: post.content,
      category: post.category,
      tags: post.tags,
      seo_title: post.seo_title,
      seo_description: post.seo_description,
      reading_time: readingTime(post.content),
      status,
      published_at: status === "published" ? new Date().toISOString() : null,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(status === "published" ? "Post published" : "Saved as draft");
    navigate("/admin/blog");
  };

  return (
    <div>
      <AdminHeader
        title="AI Assistant"
        subtitle="Write a full blog post from a single brief, or draft and rewrite portfolio copy."
      />

      <div className="flex gap-2 mb-5">
        {([["post", "Blog post writer", PenLine], ["copy", "Copy assistant", Sparkles]] as const).map(([id, label, Icon]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              "px-4 py-2 rounded-full text-xs mono border transition-all inline-flex items-center gap-2",
              tab === id ? "bg-gradient-primary text-primary-foreground border-transparent" : "glass border-border text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="h-3.5 w-3.5" /> {label}
          </button>
        ))}
      </div>

      {tab === "post" ? (
        <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-4">
          <div className="glass rounded-2xl p-5 space-y-4">
            <div>
              <div className="text-xs mono uppercase text-muted-foreground mb-2">What should it be about? *</div>
              <Textarea rows={3} value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. How I cut a React app's bundle size in half" />
            </div>
            <div>
              <div className="text-xs mono uppercase text-muted-foreground mb-2">Who is it for?</div>
              <Input value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="e.g. junior React developers" />
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <div className="text-xs mono uppercase text-muted-foreground mb-2">Tone</div>
                <select value={tone} onChange={(e) => setTone(e.target.value)} className="w-full h-10 bg-muted/50 rounded-md px-3 border border-border text-sm">
                  {TONES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <div className="text-xs mono uppercase text-muted-foreground mb-2">Length</div>
                <select value={length} onChange={(e) => setLength(e.target.value)} className="w-full h-10 bg-muted/50 rounded-md px-3 border border-border text-sm">
                  {LENGTHS.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
                </select>
              </div>
            </div>
            <div>
              <div className="text-xs mono uppercase text-muted-foreground mb-2">Keywords (optional)</div>
              <Input value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="react, performance, vite" />
            </div>
            <div>
              <div className="text-xs mono uppercase text-muted-foreground mb-2">Anything else? (optional)</div>
              <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Include a code example, mention my own project, end with a CTA…" />
            </div>
            <Button variant="hero" onClick={writePost} disabled={writing} className="w-full">
              {writing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
              {post ? "Rewrite post" : "Write the post"}
            </Button>
          </div>

          <div className="glass rounded-2xl p-5 min-h-[320px]">
            {writing && <div className="grid place-items-center h-full text-muted-foreground gap-3"><Loader2 className="h-6 w-6 animate-spin" /><span className="text-sm">Writing your post…</span></div>}
            {!writing && !post && <div className="grid place-items-center h-full text-muted-foreground text-sm text-center px-6">Fill the brief and I'll write a full post — title, excerpt, markdown body, tags and SEO — ready to save to your blog.</div>}
            {!writing && post && (
              <div className="space-y-3">
                <Input value={post.title} onChange={(e) => setPost({ ...post, title: e.target.value })} className="text-lg font-display font-bold h-12" />
                <Input value={post.slug} onChange={(e) => setPost({ ...post, slug: slugify(e.target.value) })} placeholder="slug" />
                <Textarea rows={2} value={post.excerpt} onChange={(e) => setPost({ ...post, excerpt: e.target.value })} placeholder="Excerpt" />
                <div className="grid sm:grid-cols-2 gap-3">
                  <Input value={post.category} onChange={(e) => setPost({ ...post, category: e.target.value })} placeholder="Category" />
                  <Input value={post.tags.join(", ")} onChange={(e) => setPost({ ...post, tags: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} placeholder="Tags" />
                </div>
                <Textarea rows={14} value={post.content} onChange={(e) => setPost({ ...post, content: e.target.value })} className="font-mono text-xs" />
                <div className="text-xs text-muted-foreground">~{readingTime(post.content)} min read</div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="hero" onClick={() => savePost("draft")} disabled={saving}>
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <PenLine className="h-4 w-4" />} Save as draft
                  </Button>
                  <Button variant="outline" onClick={() => savePost("published")} disabled={saving}>
                    <Send className="h-4 w-4" /> Publish now
                  </Button>
                  <Button variant="ghost" onClick={() => { navigator.clipboard.writeText(post.content); toast.success("Copied"); }}>
                    <Copy className="h-4 w-4" /> Copy
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-4">
          <div className="glass rounded-2xl p-5 space-y-4">
            <div>
              <div className="text-xs mono uppercase text-muted-foreground mb-2">Task</div>
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPreset(p)}
                    className={`px-3 py-1.5 rounded-full text-xs mono border transition-all ${
                      preset.id === p.id
                        ? "bg-gradient-primary text-primary-foreground border-transparent"
                        : "glass border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs mono uppercase text-muted-foreground mb-2">Context / raw input</div>
              <Textarea rows={10} value={input} onChange={(e) => setInput(e.target.value)} placeholder="Paste text or describe what you want…" />
            </div>
            <Button variant="hero" onClick={generate} disabled={loading} className="w-full">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Generate
            </Button>
          </div>

          <div className="glass rounded-2xl p-5 min-h-[300px] relative">
            {output && (
              <Button size="sm" variant="ghost" onClick={() => { navigator.clipboard.writeText(output); toast.success("Copied"); }} className="absolute top-3 right-3">
                <Copy className="h-4 w-4" /> Copy
              </Button>
            )}
            {loading && <div className="grid place-items-center h-full text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin" /></div>}
            {!loading && !output && <div className="grid place-items-center h-full text-muted-foreground text-sm">Output will appear here.</div>}
            {output && <div className="whitespace-pre-wrap text-sm leading-relaxed pt-8">{output}</div>}
          </div>
        </div>
      )}
    </div>
  );
};
