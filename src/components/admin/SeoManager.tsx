import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Download, Image as ImageIcon, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { AdminHeader } from "./AdminHeader";
import type { SeoPage } from "@/components/Seo";

const seoTable = () => (supabase as any).from("seo_pages");

const blank = (path = "/"): SeoPage => ({
  path,
  label: "",
  title: "",
  description: "",
  keywords: "",
  og_image: "",
  noindex: false,
  changefreq: "monthly",
  priority: "0.7",
});

const Field = ({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <label className="text-xs mono uppercase text-muted-foreground">{label}</label>
    {children}
    {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
  </div>
);

export const SeoManager = () => {
  const [pages, setPages] = useState<SeoPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingPath, setSavingPath] = useState<string | null>(null);
  const [ogTitle, setOgTitle] = useState("Kingsley — Frontend Developer");
  const [ogSubtitle, setOgSubtitle] = useState("React · Next.js · TypeScript");
  const [ogBusy, setOgBusy] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await seoTable().select("*").order("path");
    setLoading(false);
    if (error) return toast.error(error.message);
    setPages((data as SeoPage[]) ?? []);
  };

  useEffect(() => {
    load();
  }, []);

  const patch = (i: number, k: keyof SeoPage, v: any) =>
    setPages((p) => p.map((row, idx) => (idx === i ? { ...row, [k]: v } : row)));

  const save = async (page: SeoPage) => {
    if (!page.path.startsWith("/")) return toast.error("Path must start with /");
    setSavingPath(page.path);
    const { error } = await seoTable().upsert(
      {
        ...(page.id ? { id: page.id } : {}),
        path: page.path,
        label: page.label ?? "",
        title: page.title ?? "",
        description: page.description ?? "",
        keywords: page.keywords ?? "",
        og_image: page.og_image || null,
        noindex: !!page.noindex,
        changefreq: page.changefreq ?? "monthly",
        priority: page.priority ?? "0.7",
      },
      { onConflict: "path" },
    );
    setSavingPath(null);
    if (error) return toast.error(error.message);
    toast.success(`Saved SEO for ${page.path}`);
    load();
  };

  const remove = async (page: SeoPage) => {
    if (!page.id) return setPages((p) => p.filter((r) => r !== page));
    const { error } = await seoTable().delete().eq("id", page.id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    load();
  };

  /** Draw a 1200×630 branded social card on a canvas. */
  const drawOg = () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const W = 1200, H = 630;
    canvas.width = W;
    canvas.height = H;

    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, "#0b0a14");
    bg.addColorStop(1, "#141029");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    const glowA = ctx.createRadialGradient(180, 120, 0, 180, 120, 460);
    glowA.addColorStop(0, "rgba(139,92,246,0.55)");
    glowA.addColorStop(1, "rgba(139,92,246,0)");
    ctx.fillStyle = glowA;
    ctx.fillRect(0, 0, W, H);

    const glowB = ctx.createRadialGradient(1020, 540, 0, 1020, 540, 460);
    glowB.addColorStop(0, "rgba(56,189,248,0.45)");
    glowB.addColorStop(1, "rgba(56,189,248,0)");
    ctx.fillStyle = glowB;
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.lineWidth = 2;
    ctx.strokeRect(40, 40, W - 80, H - 80);

    ctx.fillStyle = "rgba(255,255,255,0.65)";
    ctx.font = "500 26px monospace";
    ctx.fillText("kingsley-folio-glow.lovable.app", 90, 130);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 74px sans-serif";
    const words = (ogTitle || "").split(" ");
    let line = "";
    let y = 280;
    for (const w of words) {
      const test = line ? `${line} ${w}` : w;
      if (ctx.measureText(test).width > W - 200) {
        ctx.fillText(line, 90, y);
        y += 88;
        line = w;
      } else line = test;
    }
    ctx.fillText(line, 90, y);

    const grad = ctx.createLinearGradient(90, 0, 700, 0);
    grad.addColorStop(0, "#a78bfa");
    grad.addColorStop(1, "#38bdf8");
    ctx.fillStyle = grad;
    ctx.font = "500 34px sans-serif";
    ctx.fillText(ogSubtitle || "", 90, y + 80);

    ctx.fillStyle = grad;
    ctx.fillRect(90, H - 140, 160, 8);

    return canvas;
  };

  const downloadOg = () => {
    const canvas = drawOg();
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = "og-image.png";
    a.click();
  };

  const uploadOg = async () => {
    const canvas = drawOg();
    if (!canvas) return;
    setOgBusy(true);
    try {
      const blob: Blob | null = await new Promise((res) => canvas.toBlob(res, "image/png"));
      if (!blob) throw new Error("Could not render image");
      const name = `og-${Date.now()}.png`;
      const key = `og/${name}`;
      const { error } = await supabase.storage.from("media").upload(key, blob, {
        contentType: "image/png",
        upsert: true,
      });
      if (error) throw error;
      const publicUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/og-image?key=${encodeURIComponent(key)}`;
      await navigator.clipboard?.writeText(publicUrl).catch(() => {});
      toast.success("Social image uploaded — URL copied to clipboard");
      setPages((p) => p.map((row) => (row.path === "/" ? { ...row, og_image: publicUrl } : row)));
    } catch (e: any) {
      toast.error(e.message ?? "Upload failed");
    } finally {
      setOgBusy(false);
    }
  };

  return (
    <div>
      <AdminHeader
        title="SEO Manager"
        subtitle="Per-page titles, descriptions, indexing rules and social preview images."
        actions={
          <Button variant="hero" onClick={() => setPages((p) => [...p, blank("/new-path")])}>
            <Plus className="h-4 w-4" /> Add page
          </Button>
        }
      />

      {/* OG image generator */}
      <div className="glass rounded-2xl p-6 mb-6 space-y-4">
        <h2 className="font-display font-semibold text-lg flex items-center gap-2">
          <ImageIcon className="h-4 w-4 text-primary" /> Social preview generator
        </h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Headline"><Input value={ogTitle} onChange={(e) => setOgTitle(e.target.value)} /></Field>
          <Field label="Subline"><Input value={ogSubtitle} onChange={(e) => setOgSubtitle(e.target.value)} /></Field>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => drawOg()}>Preview</Button>
          <Button variant="outline" onClick={downloadOg}><Download className="h-4 w-4" /> Download PNG</Button>
          <Button variant="hero" onClick={uploadOg} disabled={ogBusy}>
            {ogBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />} Upload & use for home
          </Button>
        </div>
        <canvas ref={canvasRef} className="w-full max-w-xl rounded-xl border border-border" />
      </div>

      {/* Page list */}
      {loading ? (
        <div className="glass rounded-2xl p-10 grid place-items-center">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      ) : pages.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center text-muted-foreground text-sm">
          No pages configured yet — add one to override its meta tags.
        </div>
      ) : (
        <div className="space-y-4">
          {pages.map((page, i) => (
            <div key={page.id ?? `new-${i}`} className="glass rounded-2xl p-6 space-y-3">
              <div className="grid sm:grid-cols-3 gap-3">
                <Field label="Path" hint="e.g. / or /blog"><Input value={page.path} onChange={(e) => patch(i, "path", e.target.value)} /></Field>
                <Field label="Label"><Input value={page.label ?? ""} onChange={(e) => patch(i, "label", e.target.value)} /></Field>
                <Field label="Keywords"><Input value={page.keywords ?? ""} onChange={(e) => patch(i, "keywords", e.target.value)} /></Field>
              </div>
              <Field label={`Title (${(page.title ?? "").length}/60)`}>
                <Input value={page.title ?? ""} onChange={(e) => patch(i, "title", e.target.value)} />
              </Field>
              <Field label={`Meta description (${(page.description ?? "").length}/160)`}>
                <Textarea rows={2} value={page.description ?? ""} onChange={(e) => patch(i, "description", e.target.value)} />
              </Field>
              <div className="grid sm:grid-cols-3 gap-3">
                <Field label="OG image URL"><Input value={page.og_image ?? ""} onChange={(e) => patch(i, "og_image", e.target.value)} /></Field>
                <Field label="Change frequency"><Input value={page.changefreq ?? ""} onChange={(e) => patch(i, "changefreq", e.target.value)} /></Field>
                <Field label="Priority"><Input value={page.priority ?? ""} onChange={(e) => patch(i, "priority", e.target.value)} /></Field>
              </div>
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-sm">
                  <Switch checked={!!page.noindex} onCheckedChange={(v) => patch(i, "noindex", v)} />
                  <span className="text-muted-foreground">Hide from search engines (noindex)</span>
                </label>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => remove(page)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button variant="hero" size="sm" onClick={() => save(page)} disabled={savingPath === page.path}>
                    {savingPath === page.path ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
