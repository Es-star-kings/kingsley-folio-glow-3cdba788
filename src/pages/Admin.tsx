import { useState, useEffect, ReactNode } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Download, LogOut, Plus, RotateCcw, Save, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePortfolio } from "@/context/PortfolioContext";
import type {
  ExperienceItem,
  PortfolioData,
  Project,
  Service,
  Skill,
  Testimonial,
} from "@/data/portfolio";

const ADMIN_PASSWORD_KEY = "kingsley.portfolio.admin.pw";
const SESSION_KEY = "kingsley.portfolio.admin.session";

// ---------- Password gate ----------
const PasswordGate = ({ onUnlock }: { onUnlock: () => void }) => {
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const existing = localStorage.getItem(ADMIN_PASSWORD_KEY);
  const isSetup = !existing;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSetup) {
      if (pw.length < 4) return toast.error("Use at least 4 characters");
      if (pw !== confirm) return toast.error("Passwords don't match");
      localStorage.setItem(ADMIN_PASSWORD_KEY, pw);
      sessionStorage.setItem(SESSION_KEY, "1");
      toast.success("Admin password set");
      onUnlock();
    } else {
      if (pw === existing) {
        sessionStorage.setItem(SESSION_KEY, "1");
        onUnlock();
      } else {
        toast.error("Wrong password");
      }
    }
  };

  return (
    <div className="min-h-screen grid place-items-center px-4">
      <form onSubmit={submit} className="glass rounded-3xl p-8 w-full max-w-md space-y-5">
        <div>
          <h1 className="font-display text-2xl font-bold">
            {isSetup ? "Set admin password" : "Admin access"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isSetup
              ? "Pick a password to protect this editor. Stored only on this device."
              : "Enter the password to edit portfolio content."}
          </p>
        </div>
        <div className="space-y-2">
          <label className="text-xs mono uppercase tracking-wider text-muted-foreground">Password</label>
          <Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoFocus />
        </div>
        {isSetup && (
          <div className="space-y-2">
            <label className="text-xs mono uppercase tracking-wider text-muted-foreground">Confirm</label>
            <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </div>
        )}
        <Button type="submit" variant="hero" className="w-full">
          {isSetup ? "Set password & enter" : "Unlock editor"}
        </Button>
        <Link to="/" className="block text-center text-sm text-muted-foreground hover:text-foreground">
          ← Back to site
        </Link>
      </form>
    </div>
  );
};

// ---------- Helpers ----------
const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="space-y-1.5">
    <label className="text-xs mono uppercase tracking-wider text-muted-foreground">{label}</label>
    {children}
  </div>
);

const Card = ({ children, onRemove }: { children: ReactNode; onRemove?: () => void }) => (
  <div className="glass rounded-2xl p-5 space-y-3 relative">
    {onRemove && (
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onRemove}
        className="absolute top-3 right-3 text-muted-foreground hover:text-destructive"
        aria-label="Remove"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    )}
    {children}
  </div>
);

// ---------- Editor ----------
const Editor = () => {
  const portfolio = usePortfolio();
  const [draft, setDraft] = useState<PortfolioData>({
    personal: portfolio.personal,
    about: portfolio.about,
    skills: portfolio.skills,
    projects: portfolio.projects,
    services: portfolio.services,
    experience: portfolio.experience,
    testimonials: portfolio.testimonials,
  });

  useEffect(() => {
    setDraft({
      personal: portfolio.personal,
      about: portfolio.about,
      skills: portfolio.skills,
      projects: portfolio.projects,
      services: portfolio.services,
      experience: portfolio.experience,
      testimonials: portfolio.testimonials,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = () => {
    portfolio.replace(draft);
    toast.success("Saved! Changes are live.");
  };

  const resetAll = () => {
    if (!confirm("Reset all portfolio content to defaults? This can't be undone.")) return;
    portfolio.reset();
    toast.success("Reset to defaults");
    setTimeout(() => window.location.reload(), 300);
  };

  const exportFile = () => {
    const blob = new Blob([JSON.stringify(draft, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "portfolio-data.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const importFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const ok = portfolio.importJSON(String(reader.result || ""));
      if (ok) {
        toast.success("Imported. Reloading…");
        setTimeout(() => window.location.reload(), 400);
      } else {
        toast.error("Invalid JSON file");
      }
    };
    reader.readAsText(file);
  };

  const logout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    window.location.reload();
  };

  // ----- generic updaters
  const setPersonal = <K extends keyof typeof draft.personal>(k: K, v: (typeof draft.personal)[K]) =>
    setDraft((d) => ({ ...d, personal: { ...d.personal, [k]: v } }));

  const updateList = <T,>(key: keyof PortfolioData, fn: (arr: T[]) => T[]) =>
    setDraft((d) => ({ ...d, [key]: fn(d[key] as unknown as T[]) }) as PortfolioData);

  return (
    <div className="min-h-screen pb-20">
      {/* Top bar */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-background/80 border-b border-border">
        <div className="container flex items-center justify-between py-4 gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5">
              <ArrowLeft className="h-4 w-4" /> View site
            </Link>
            <span className="font-display font-semibold">Portfolio editor</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <label className="inline-flex">
              <input
                type="file"
                accept="application/json"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) importFile(f);
                  e.target.value = "";
                }}
              />
              <span>
                <Button type="button" variant="ghost" size="sm" asChild>
                  <span className="cursor-pointer"><Upload className="h-4 w-4" /> Import</span>
                </Button>
              </span>
            </label>
            <Button type="button" variant="ghost" size="sm" onClick={exportFile}>
              <Download className="h-4 w-4" /> Export
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={resetAll}>
              <RotateCcw className="h-4 w-4" /> Reset
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4" /> Lock
            </Button>
            <Button type="button" variant="hero" size="sm" onClick={save}>
              <Save className="h-4 w-4" /> Save
            </Button>
          </div>
        </div>
      </div>

      <div className="container pt-8">
        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="flex flex-wrap h-auto gap-1">
            <TabsTrigger value="personal">Profile</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="experience">Experience</TabsTrigger>
            <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
          </TabsList>

          {/* PROFILE */}
          <TabsContent value="personal" className="mt-6 grid sm:grid-cols-2 gap-4">
            <Field label="Display name"><Input value={draft.personal.name} onChange={(e) => setPersonal("name", e.target.value)} /></Field>
            <Field label="Full name"><Input value={draft.personal.fullName} onChange={(e) => setPersonal("fullName", e.target.value)} /></Field>
            <Field label="Title"><Input value={draft.personal.title} onChange={(e) => setPersonal("title", e.target.value)} /></Field>
            <Field label="Location"><Input value={draft.personal.location} onChange={(e) => setPersonal("location", e.target.value)} /></Field>
            <Field label="Tagline"><Textarea rows={2} value={draft.personal.tagline} onChange={(e) => setPersonal("tagline", e.target.value)} /></Field>
            <Field label="CV URL"><Input value={draft.personal.cvUrl} onChange={(e) => setPersonal("cvUrl", e.target.value)} /></Field>
            <Field label="Email"><Input type="email" value={draft.personal.email} onChange={(e) => setPersonal("email", e.target.value)} /></Field>
            <Field label="WhatsApp URL"><Input value={draft.personal.whatsapp} onChange={(e) => setPersonal("whatsapp", e.target.value)} /></Field>
            <Field label="GitHub URL"><Input value={draft.personal.github} onChange={(e) => setPersonal("github", e.target.value)} /></Field>
            <Field label="LinkedIn URL"><Input value={draft.personal.linkedin} onChange={(e) => setPersonal("linkedin", e.target.value)} /></Field>
            <Field label="Years experience"><Input type="number" value={draft.personal.yearsExperience} onChange={(e) => setPersonal("yearsExperience", Number(e.target.value))} /></Field>
            <Field label="Projects shipped"><Input type="number" value={draft.personal.projectsShipped} onChange={(e) => setPersonal("projectsShipped", Number(e.target.value))} /></Field>
            <Field label="Happy clients"><Input type="number" value={draft.personal.happyClients} onChange={(e) => setPersonal("happyClients", Number(e.target.value))} /></Field>
          </TabsContent>

          {/* ABOUT */}
          <TabsContent value="about" className="mt-6 space-y-4">
            <Field label="Summary">
              <Textarea rows={5} value={draft.about.summary} onChange={(e) => setDraft((d) => ({ ...d, about: { ...d.about, summary: e.target.value } }))} />
            </Field>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs mono uppercase tracking-wider text-muted-foreground">Highlights</label>
                <Button type="button" variant="ghost" size="sm" onClick={() => setDraft((d) => ({ ...d, about: { ...d.about, highlights: [...d.about.highlights, ""] } }))}>
                  <Plus className="h-4 w-4" /> Add
                </Button>
              </div>
              {draft.about.highlights.map((h, i) => (
                <div key={i} className="flex gap-2">
                  <Input value={h} onChange={(e) => setDraft((d) => ({ ...d, about: { ...d.about, highlights: d.about.highlights.map((x, ix) => (ix === i ? e.target.value : x)) } }))} />
                  <Button type="button" variant="ghost" size="icon" onClick={() => setDraft((d) => ({ ...d, about: { ...d.about, highlights: d.about.highlights.filter((_, ix) => ix !== i) } }))}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* SKILLS */}
          <TabsContent value="skills" className="mt-6 space-y-4">
            <Button type="button" variant="neon" size="sm" onClick={() => updateList<Skill>("skills", (a) => [...a, { name: "", level: 80, category: "" }])}>
              <Plus className="h-4 w-4" /> Add skill
            </Button>
            <div className="grid sm:grid-cols-2 gap-4">
              {draft.skills.map((s, i) => (
                <Card key={i} onRemove={() => updateList<Skill>("skills", (a) => a.filter((_, ix) => ix !== i))}>
                  <Field label="Name"><Input value={s.name} onChange={(e) => updateList<Skill>("skills", (a) => a.map((x, ix) => (ix === i ? { ...x, name: e.target.value } : x)))} /></Field>
                  <Field label="Category"><Input value={s.category} onChange={(e) => updateList<Skill>("skills", (a) => a.map((x, ix) => (ix === i ? { ...x, category: e.target.value } : x)))} /></Field>
                  <Field label={`Level (${s.level}%)`}>
                    <Input type="range" min={0} max={100} value={s.level} onChange={(e) => updateList<Skill>("skills", (a) => a.map((x, ix) => (ix === i ? { ...x, level: Number(e.target.value) } : x)))} />
                  </Field>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* PROJECTS */}
          <TabsContent value="projects" className="mt-6 space-y-4">
            <Button type="button" variant="neon" size="sm" onClick={() => updateList<Project>("projects", (a) => [...a, { title: "", description: "", image: "", tech: [], demo: "#", github: "#" }])}>
              <Plus className="h-4 w-4" /> Add project
            </Button>
            <div className="grid lg:grid-cols-2 gap-4">
              {draft.projects.map((p, i) => (
                <Card key={i} onRemove={() => updateList<Project>("projects", (a) => a.filter((_, ix) => ix !== i))}>
                  <Field label="Title"><Input value={p.title} onChange={(e) => updateList<Project>("projects", (a) => a.map((x, ix) => (ix === i ? { ...x, title: e.target.value } : x)))} /></Field>
                  <Field label="Description"><Textarea rows={3} value={p.description} onChange={(e) => updateList<Project>("projects", (a) => a.map((x, ix) => (ix === i ? { ...x, description: e.target.value } : x)))} /></Field>
                  <Field label="Image URL"><Input value={p.image} onChange={(e) => updateList<Project>("projects", (a) => a.map((x, ix) => (ix === i ? { ...x, image: e.target.value } : x)))} /></Field>
                  <Field label="Tech (comma separated)">
                    <Input value={p.tech.join(", ")} onChange={(e) => updateList<Project>("projects", (a) => a.map((x, ix) => (ix === i ? { ...x, tech: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) } : x)))} />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Demo URL"><Input value={p.demo} onChange={(e) => updateList<Project>("projects", (a) => a.map((x, ix) => (ix === i ? { ...x, demo: e.target.value } : x)))} /></Field>
                    <Field label="GitHub URL"><Input value={p.github} onChange={(e) => updateList<Project>("projects", (a) => a.map((x, ix) => (ix === i ? { ...x, github: e.target.value } : x)))} /></Field>
                  </div>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={!!p.featured} onChange={(e) => updateList<Project>("projects", (a) => a.map((x, ix) => (ix === i ? { ...x, featured: e.target.checked } : x)))} />
                    Featured
                  </label>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* SERVICES */}
          <TabsContent value="services" className="mt-6 space-y-4">
            <Button type="button" variant="neon" size="sm" onClick={() => updateList<Service>("services", (a) => [...a, { icon: "Code2", title: "", description: "" }])}>
              <Plus className="h-4 w-4" /> Add service
            </Button>
            <div className="grid sm:grid-cols-2 gap-4">
              {draft.services.map((s, i) => (
                <Card key={i} onRemove={() => updateList<Service>("services", (a) => a.filter((_, ix) => ix !== i))}>
                  <Field label="Icon (Code2, Rocket, LayoutDashboard, Gauge, Plug, Paintbrush)">
                    <Input value={s.icon} onChange={(e) => updateList<Service>("services", (a) => a.map((x, ix) => (ix === i ? { ...x, icon: e.target.value } : x)))} />
                  </Field>
                  <Field label="Title"><Input value={s.title} onChange={(e) => updateList<Service>("services", (a) => a.map((x, ix) => (ix === i ? { ...x, title: e.target.value } : x)))} /></Field>
                  <Field label="Description"><Textarea rows={3} value={s.description} onChange={(e) => updateList<Service>("services", (a) => a.map((x, ix) => (ix === i ? { ...x, description: e.target.value } : x)))} /></Field>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* EXPERIENCE */}
          <TabsContent value="experience" className="mt-6 space-y-4">
            <Button type="button" variant="neon" size="sm" onClick={() => updateList<ExperienceItem>("experience", (a) => [...a, { role: "", company: "", period: "", description: "" }])}>
              <Plus className="h-4 w-4" /> Add role
            </Button>
            <div className="grid lg:grid-cols-2 gap-4">
              {draft.experience.map((e2, i) => (
                <Card key={i} onRemove={() => updateList<ExperienceItem>("experience", (a) => a.filter((_, ix) => ix !== i))}>
                  <Field label="Role"><Input value={e2.role} onChange={(e) => updateList<ExperienceItem>("experience", (a) => a.map((x, ix) => (ix === i ? { ...x, role: e.target.value } : x)))} /></Field>
                  <Field label="Company"><Input value={e2.company} onChange={(e) => updateList<ExperienceItem>("experience", (a) => a.map((x, ix) => (ix === i ? { ...x, company: e.target.value } : x)))} /></Field>
                  <Field label="Period"><Input value={e2.period} onChange={(e) => updateList<ExperienceItem>("experience", (a) => a.map((x, ix) => (ix === i ? { ...x, period: e.target.value } : x)))} /></Field>
                  <Field label="Description"><Textarea rows={3} value={e2.description} onChange={(e) => updateList<ExperienceItem>("experience", (a) => a.map((x, ix) => (ix === i ? { ...x, description: e.target.value } : x)))} /></Field>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* TESTIMONIALS */}
          <TabsContent value="testimonials" className="mt-6 space-y-4">
            <Button type="button" variant="neon" size="sm" onClick={() => updateList<Testimonial>("testimonials", (a) => [...a, { quote: "", name: "", role: "" }])}>
              <Plus className="h-4 w-4" /> Add testimonial
            </Button>
            <div className="grid lg:grid-cols-2 gap-4">
              {draft.testimonials.map((t, i) => (
                <Card key={i} onRemove={() => updateList<Testimonial>("testimonials", (a) => a.filter((_, ix) => ix !== i))}>
                  <Field label="Quote"><Textarea rows={3} value={t.quote} onChange={(e) => updateList<Testimonial>("testimonials", (a) => a.map((x, ix) => (ix === i ? { ...x, quote: e.target.value } : x)))} /></Field>
                  <Field label="Name"><Input value={t.name} onChange={(e) => updateList<Testimonial>("testimonials", (a) => a.map((x, ix) => (ix === i ? { ...x, name: e.target.value } : x)))} /></Field>
                  <Field label="Role"><Input value={t.role} onChange={(e) => updateList<Testimonial>("testimonials", (a) => a.map((x, ix) => (ix === i ? { ...x, role: e.target.value } : x)))} /></Field>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

const Admin = () => {
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem(SESSION_KEY) === "1");
  if (!unlocked) return <PasswordGate onUnlock={() => setUnlocked(true)} />;
  return <Editor />;
};

export default Admin;
