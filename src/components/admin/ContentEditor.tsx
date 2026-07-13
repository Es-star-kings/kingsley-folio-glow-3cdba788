import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Plus, Save, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { usePortfolio } from "@/context/PortfolioContext";
import { AdminHeader } from "./AdminHeader";
import { Skeleton } from "@/components/ui/skeleton";

type Row = Record<string, any>;

const Card = ({ children, onRemove }: { children: React.ReactNode; onRemove?: () => void }) => (
  <div className="glass rounded-2xl p-5 space-y-3 relative">
    {onRemove && (
      <button onClick={onRemove} className="absolute top-3 right-3 text-muted-foreground hover:text-destructive" aria-label="Remove">
        <Trash2 className="h-4 w-4" />
      </button>
    )}
    {children}
  </div>
);

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <label className="text-xs mono uppercase tracking-wider text-muted-foreground">{label}</label>
    {children}
  </div>
);

export const ContentEditor = () => {
  const { refresh } = usePortfolio();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState<Row>({ personal: {}, about: {} });
  const [projects, setProjects] = useState<Row[]>([]);
  const [skills, setSkills] = useState<Row[]>([]);
  const [experiences, setExperiences] = useState<Row[]>([]);
  const [services, setServices] = useState<Row[]>([]);
  const [testimonials, setTestimonials] = useState<Row[]>([]);
  const [deletedIds, setDeletedIds] = useState<Record<string, string[]>>({
    projects: [], skills: [], experiences: [], services: [], testimonials: [],
  });

  const load = async () => {
    setLoading(true);
    const [s, p, sk, e, sv, t] = await Promise.all([
      supabase.from("settings").select("*").eq("id", 1).maybeSingle(),
      supabase.from("projects").select("*").order("sort_order").order("created_at"),
      supabase.from("skills").select("*").order("sort_order").order("created_at"),
      supabase.from("experiences").select("*").order("sort_order").order("created_at"),
      supabase.from("services").select("*").order("sort_order").order("created_at"),
      supabase.from("testimonials").select("*").order("sort_order").order("created_at"),
    ]);
    setSettings(s.data ?? { personal: {}, about: {} });
    setProjects(p.data ?? []);
    setSkills(sk.data ?? []);
    setExperiences(e.data ?? []);
    setServices(sv.data ?? []);
    setTestimonials(t.data ?? []);
    setDeletedIds({ projects: [], skills: [], experiences: [], services: [], testimonials: [] });
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const setPersonal = (k: string, v: any) =>
    setSettings((s) => ({ ...s, personal: { ...s.personal, [k]: v } }));
  const setAbout = (k: string, v: any) =>
    setSettings((s) => ({ ...s, about: { ...s.about, [k]: v } }));

  const upsertRows = async (table: string, rows: Row[], deleted: string[], stripLocal = true) => {
    if (deleted.length) await supabase.from(table as any).delete().in("id", deleted);
    const toInsert = rows.filter((r) => r._new).map((r) => {
      const clone = { ...r };
      delete clone._new;
      delete clone.id;
      return clone;
    });
    const toUpdate = rows.filter((r) => !r._new && r.id).map((r) => {
      const clone = { ...r };
      if (stripLocal) delete clone._new;
      return clone;
    });
    if (toInsert.length) {
      const { error } = await supabase.from(table as any).insert(toInsert);
      if (error) throw error;
    }
    if (toUpdate.length) {
      const { error } = await supabase.from(table as any).upsert(toUpdate);
      if (error) throw error;
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      const { error: se } = await supabase.from("settings").upsert({
        id: 1,
        personal: settings.personal,
        about: settings.about,
        theme: settings.theme ?? {},
        seo: settings.seo ?? {},
        navigation: settings.navigation ?? {},
        integrations: settings.integrations ?? {},
      });
      if (se) throw se;
      await upsertRows("projects", projects, deletedIds.projects);
      await upsertRows("skills", skills, deletedIds.skills);
      await upsertRows("experiences", experiences, deletedIds.experiences);
      await upsertRows("services", services, deletedIds.services);
      await upsertRows("testimonials", testimonials, deletedIds.testimonials);

      await supabase.from("activity_logs").insert({ action: "content.saved", entity: "cms" });
      toast.success("Saved — live on your site");
      await load();
      await refresh();
    } catch (err: any) {
      toast.error(err.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const remove = (table: keyof typeof deletedIds, id: string, isNew?: boolean) => {
    if (!isNew) setDeletedIds((d) => ({ ...d, [table]: [...d[table], id] }));
  };

  if (loading) {
    return (
      <div>
        <AdminHeader title="Content" subtitle="Every section of your public site." />
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  const p = settings.personal ?? {};
  const a = settings.about ?? {};

  return (
    <div>
      <AdminHeader
        title="Content"
        subtitle="All content that appears on your public portfolio."
        actions={
          <Button onClick={save} disabled={saving} variant="hero">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save all changes
          </Button>
        }
      />

      <Tabs defaultValue="hero" className="w-full">
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="hero">Hero &amp; Profile</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="experience">Experience</TabsTrigger>
          <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
        </TabsList>

        <TabsContent value="hero" className="mt-6 grid sm:grid-cols-2 gap-4">
          <Field label="Display name"><Input value={p.name ?? ""} onChange={(e) => setPersonal("name", e.target.value)} /></Field>
          <Field label="Full name"><Input value={p.fullName ?? ""} onChange={(e) => setPersonal("fullName", e.target.value)} /></Field>
          <Field label="Professional title"><Input value={p.title ?? ""} onChange={(e) => setPersonal("title", e.target.value)} /></Field>
          <Field label="Location"><Input value={p.location ?? ""} onChange={(e) => setPersonal("location", e.target.value)} /></Field>
          <div className="sm:col-span-2"><Field label="Tagline"><Textarea rows={2} value={p.tagline ?? ""} onChange={(e) => setPersonal("tagline", e.target.value)} /></Field></div>
          <Field label="Profile picture URL"><Input value={p.avatar ?? ""} onChange={(e) => setPersonal("avatar", e.target.value)} placeholder="/uploads/..." /></Field>
          <Field label="CV / Resume URL"><Input value={p.cvUrl ?? ""} onChange={(e) => setPersonal("cvUrl", e.target.value)} /></Field>
          <Field label="Email"><Input type="email" value={p.email ?? ""} onChange={(e) => setPersonal("email", e.target.value)} /></Field>
          <Field label="WhatsApp URL"><Input value={p.whatsapp ?? ""} onChange={(e) => setPersonal("whatsapp", e.target.value)} /></Field>
          <Field label="GitHub URL"><Input value={p.github ?? ""} onChange={(e) => setPersonal("github", e.target.value)} /></Field>
          <Field label="LinkedIn URL"><Input value={p.linkedin ?? ""} onChange={(e) => setPersonal("linkedin", e.target.value)} /></Field>
          <Field label="Years experience"><Input type="number" value={p.yearsExperience ?? 0} onChange={(e) => setPersonal("yearsExperience", Number(e.target.value))} /></Field>
          <Field label="Projects shipped"><Input type="number" value={p.projectsShipped ?? 0} onChange={(e) => setPersonal("projectsShipped", Number(e.target.value))} /></Field>
          <Field label="Happy clients"><Input type="number" value={p.happyClients ?? 0} onChange={(e) => setPersonal("happyClients", Number(e.target.value))} /></Field>
          <Field label="Availability"><Input value={p.availability ?? ""} onChange={(e) => setPersonal("availability", e.target.value)} placeholder="Available for freelance" /></Field>
          <Field label="Current company"><Input value={p.currentCompany ?? ""} onChange={(e) => setPersonal("currentCompany", e.target.value)} /></Field>
        </TabsContent>

        <TabsContent value="about" className="mt-6 space-y-4">
          <Field label="Summary"><Textarea rows={5} value={a.summary ?? ""} onChange={(e) => setAbout("summary", e.target.value)} /></Field>
          <Field label="Mission"><Textarea rows={2} value={a.mission ?? ""} onChange={(e) => setAbout("mission", e.target.value)} /></Field>
          <Field label="Vision"><Textarea rows={2} value={a.vision ?? ""} onChange={(e) => setAbout("vision", e.target.value)} /></Field>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs mono uppercase text-muted-foreground">Highlights</label>
              <Button size="sm" variant="ghost" onClick={() => setAbout("highlights", [...(a.highlights ?? []), ""])}><Plus className="h-4 w-4" /> Add</Button>
            </div>
            {(a.highlights ?? []).map((h: string, i: number) => (
              <div key={i} className="flex gap-2">
                <Input value={h} onChange={(e) => setAbout("highlights", (a.highlights ?? []).map((x: string, ix: number) => ix === i ? e.target.value : x))} />
                <Button size="icon" variant="ghost" onClick={() => setAbout("highlights", (a.highlights ?? []).filter((_: any, ix: number) => ix !== i))}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="skills" className="mt-6 space-y-4">
          <Button variant="neon" size="sm" onClick={() => setSkills((r) => [...r, { id: crypto.randomUUID(), _new: true, name: "", level: 80, category: "Frontend", sort_order: r.length, featured: false }])}>
            <Plus className="h-4 w-4" /> Add skill
          </Button>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {skills.map((s, i) => (
              <Card key={s.id} onRemove={() => { remove("skills", s.id, s._new); setSkills((r) => r.filter((_, ix) => ix !== i)); }}>
                <Field label="Name"><Input value={s.name} onChange={(e) => setSkills((r) => r.map((x, ix) => ix === i ? { ...x, name: e.target.value } : x))} /></Field>
                <Field label="Category"><Input value={s.category ?? ""} onChange={(e) => setSkills((r) => r.map((x, ix) => ix === i ? { ...x, category: e.target.value } : x))} placeholder="Frontend, Backend, Design…" /></Field>
                <Field label={`Level (${s.level}%)`}><Input type="range" min={0} max={100} value={s.level} onChange={(e) => setSkills((r) => r.map((x, ix) => ix === i ? { ...x, level: Number(e.target.value) } : x))} /></Field>
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Years"><Input type="number" value={s.years ?? 0} onChange={(e) => setSkills((r) => r.map((x, ix) => ix === i ? { ...x, years: Number(e.target.value) } : x))} /></Field>
                  <Field label="Order"><Input type="number" value={s.sort_order ?? 0} onChange={(e) => setSkills((r) => r.map((x, ix) => ix === i ? { ...x, sort_order: Number(e.target.value) } : x))} /></Field>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="projects" className="mt-6 space-y-4">
          <Button variant="neon" size="sm" onClick={() => setProjects((r) => [...r, { id: crypto.randomUUID(), _new: true, title: "", description: "", tech: [], tags: [], gallery: [], status: "published", featured: false, sort_order: r.length }])}>
            <Plus className="h-4 w-4" /> Add project
          </Button>
          <div className="grid lg:grid-cols-2 gap-4">
            {projects.map((pr, i) => (
              <Card key={pr.id} onRemove={() => { remove("projects", pr.id, pr._new); setProjects((r) => r.filter((_, ix) => ix !== i)); }}>
                <Field label="Title"><Input value={pr.title} onChange={(e) => setProjects((r) => r.map((x, ix) => ix === i ? { ...x, title: e.target.value } : x))} /></Field>
                <Field label="Slug"><Input value={pr.slug ?? ""} onChange={(e) => setProjects((r) => r.map((x, ix) => ix === i ? { ...x, slug: e.target.value } : x))} /></Field>
                <Field label="Short description"><Textarea rows={2} value={pr.description ?? ""} onChange={(e) => setProjects((r) => r.map((x, ix) => ix === i ? { ...x, description: e.target.value } : x))} /></Field>
                <Field label="Long description / case study"><Textarea rows={3} value={pr.long_description ?? ""} onChange={(e) => setProjects((r) => r.map((x, ix) => ix === i ? { ...x, long_description: e.target.value } : x))} /></Field>
                <Field label="Thumbnail URL"><Input value={pr.thumbnail ?? ""} onChange={(e) => setProjects((r) => r.map((x, ix) => ix === i ? { ...x, thumbnail: e.target.value } : x))} /></Field>
                <Field label="Tech (comma separated)"><Input value={(pr.tech ?? []).join(", ")} onChange={(e) => setProjects((r) => r.map((x, ix) => ix === i ? { ...x, tech: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) } : x))} /></Field>
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Live demo URL"><Input value={pr.demo_url ?? ""} onChange={(e) => setProjects((r) => r.map((x, ix) => ix === i ? { ...x, demo_url: e.target.value } : x))} /></Field>
                  <Field label="GitHub URL"><Input value={pr.github_url ?? ""} onChange={(e) => setProjects((r) => r.map((x, ix) => ix === i ? { ...x, github_url: e.target.value } : x))} /></Field>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Client"><Input value={pr.client_name ?? ""} onChange={(e) => setProjects((r) => r.map((x, ix) => ix === i ? { ...x, client_name: e.target.value } : x))} /></Field>
                  <Field label="Category"><Input value={pr.category ?? ""} onChange={(e) => setProjects((r) => r.map((x, ix) => ix === i ? { ...x, category: e.target.value } : x))} /></Field>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={!!pr.featured} onChange={(e) => setProjects((r) => r.map((x, ix) => ix === i ? { ...x, featured: e.target.checked } : x))} />
                    <Star className="h-3 w-3" /> Featured
                  </label>
                  <select
                    value={pr.status ?? "published"}
                    onChange={(e) => setProjects((r) => r.map((x, ix) => ix === i ? { ...x, status: e.target.value } : x))}
                    className="text-sm bg-muted/50 rounded-md px-2 py-1 border border-border"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="services" className="mt-6 space-y-4">
          <Button variant="neon" size="sm" onClick={() => setServices((r) => [...r, { id: crypto.randomUUID(), _new: true, title: "", description: "", icon: "Code2", features: [], sort_order: r.length }])}>
            <Plus className="h-4 w-4" /> Add service
          </Button>
          <div className="grid sm:grid-cols-2 gap-4">
            {services.map((sv, i) => (
              <Card key={sv.id} onRemove={() => { remove("services", sv.id, sv._new); setServices((r) => r.filter((_, ix) => ix !== i)); }}>
                <Field label="Icon (Code2, Rocket, LayoutDashboard, Gauge, Plug, Paintbrush)"><Input value={sv.icon ?? ""} onChange={(e) => setServices((r) => r.map((x, ix) => ix === i ? { ...x, icon: e.target.value } : x))} /></Field>
                <Field label="Title"><Input value={sv.title} onChange={(e) => setServices((r) => r.map((x, ix) => ix === i ? { ...x, title: e.target.value } : x))} /></Field>
                <Field label="Description"><Textarea rows={3} value={sv.description ?? ""} onChange={(e) => setServices((r) => r.map((x, ix) => ix === i ? { ...x, description: e.target.value } : x))} /></Field>
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Price"><Input value={sv.price ?? ""} onChange={(e) => setServices((r) => r.map((x, ix) => ix === i ? { ...x, price: e.target.value } : x))} /></Field>
                  <Field label="Delivery time"><Input value={sv.delivery_time ?? ""} onChange={(e) => setServices((r) => r.map((x, ix) => ix === i ? { ...x, delivery_time: e.target.value } : x))} /></Field>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="experience" className="mt-6 space-y-4">
          <Button variant="neon" size="sm" onClick={() => setExperiences((r) => [...r, { id: crypto.randomUUID(), _new: true, role: "", company: "", kind: "job", tech: [], sort_order: r.length }])}>
            <Plus className="h-4 w-4" /> Add role
          </Button>
          <div className="grid lg:grid-cols-2 gap-4">
            {experiences.map((ex, i) => (
              <Card key={ex.id} onRemove={() => { remove("experiences", ex.id, ex._new); setExperiences((r) => r.filter((_, ix) => ix !== i)); }}>
                <Field label="Role"><Input value={ex.role} onChange={(e) => setExperiences((r) => r.map((x, ix) => ix === i ? { ...x, role: e.target.value } : x))} /></Field>
                <Field label="Company"><Input value={ex.company} onChange={(e) => setExperiences((r) => r.map((x, ix) => ix === i ? { ...x, company: e.target.value } : x))} /></Field>
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Kind">
                    <select value={ex.kind ?? "job"} onChange={(e) => setExperiences((r) => r.map((x, ix) => ix === i ? { ...x, kind: e.target.value } : x))} className="w-full h-10 bg-muted/50 rounded-md px-3 border border-border">
                      <option value="job">Job</option><option value="freelance">Freelance</option><option value="internship">Internship</option>
                      <option value="education">Education</option><option value="certification">Certification</option><option value="award">Award</option>
                    </select>
                  </Field>
                  <Field label="Period"><Input value={ex.period ?? ""} onChange={(e) => setExperiences((r) => r.map((x, ix) => ix === i ? { ...x, period: e.target.value } : x))} placeholder="2023 — Present" /></Field>
                </div>
                <Field label="Description"><Textarea rows={3} value={ex.description ?? ""} onChange={(e) => setExperiences((r) => r.map((x, ix) => ix === i ? { ...x, description: e.target.value } : x))} /></Field>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="testimonials" className="mt-6 space-y-4">
          <Button variant="neon" size="sm" onClick={() => setTestimonials((r) => [...r, { id: crypto.randomUUID(), _new: true, name: "", role: "", quote: "", rating: 5, approved: true, sort_order: r.length }])}>
            <Plus className="h-4 w-4" /> Add testimonial
          </Button>
          <div className="grid lg:grid-cols-2 gap-4">
            {testimonials.map((t, i) => (
              <Card key={t.id} onRemove={() => { remove("testimonials", t.id, t._new); setTestimonials((r) => r.filter((_, ix) => ix !== i)); }}>
                <Field label="Quote"><Textarea rows={3} value={t.quote} onChange={(e) => setTestimonials((r) => r.map((x, ix) => ix === i ? { ...x, quote: e.target.value } : x))} /></Field>
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Name"><Input value={t.name} onChange={(e) => setTestimonials((r) => r.map((x, ix) => ix === i ? { ...x, name: e.target.value } : x))} /></Field>
                  <Field label="Role"><Input value={t.role ?? ""} onChange={(e) => setTestimonials((r) => r.map((x, ix) => ix === i ? { ...x, role: e.target.value } : x))} /></Field>
                </div>
                <div className="grid grid-cols-3 gap-2 items-end">
                  <Field label="Company"><Input value={t.company ?? ""} onChange={(e) => setTestimonials((r) => r.map((x, ix) => ix === i ? { ...x, company: e.target.value } : x))} /></Field>
                  <Field label="Rating"><Input type="number" min={1} max={5} value={t.rating ?? 5} onChange={(e) => setTestimonials((r) => r.map((x, ix) => ix === i ? { ...x, rating: Number(e.target.value) } : x))} /></Field>
                  <label className="flex items-center gap-2 text-sm h-10">
                    <input type="checkbox" checked={!!t.approved} onChange={(e) => setTestimonials((r) => r.map((x, ix) => ix === i ? { ...x, approved: e.target.checked } : x))} />
                    Approved
                  </label>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
