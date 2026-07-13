import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, RotateCcw, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { AdminHeader } from "./AdminHeader";

type Theme = {
  primary?: string; secondary?: string; accent?: string;
  background?: string; radius?: string;
};

const DEFAULTS: Theme = { primary: "", secondary: "", accent: "", background: "", radius: "" };

export const ThemeEditor = () => {
  const [theme, setTheme] = useState<Theme>(DEFAULTS);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from("settings").select("theme").eq("id", 1).maybeSingle().then(({ data }) => {
      setTheme({ ...DEFAULTS, ...((data?.theme as Theme) ?? {}) });
    });
  }, []);

  useEffect(() => {
    // Live apply
    const root = document.documentElement;
    if (theme.primary) root.style.setProperty("--primary", theme.primary);
    if (theme.secondary) root.style.setProperty("--secondary", theme.secondary);
    if (theme.accent) root.style.setProperty("--accent", theme.accent);
    if (theme.background) root.style.setProperty("--background", theme.background);
    if (theme.radius) root.style.setProperty("--radius", theme.radius);
  }, [theme]);

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from("settings").update({ theme }).eq("id", 1);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Theme saved — live");
  };

  const reset = () => {
    ["--primary", "--secondary", "--accent", "--background", "--radius"].forEach((v) => document.documentElement.style.removeProperty(v));
    setTheme(DEFAULTS);
    toast.success("Reset to defaults (save to persist)");
  };

  const F = ({ k, label, placeholder }: { k: keyof Theme; label: string; placeholder: string }) => (
    <div className="space-y-1.5">
      <label className="text-xs mono uppercase text-muted-foreground">{label}</label>
      <Input value={theme[k] ?? ""} onChange={(e) => setTheme((t) => ({ ...t, [k]: e.target.value }))} placeholder={placeholder} />
    </div>
  );

  return (
    <div>
      <AdminHeader
        title="Theme"
        subtitle="Design tokens are HSL triplets like '250 90% 60%'. Changes preview live."
        actions={
          <>
            <Button variant="ghost" onClick={reset}><RotateCcw className="h-4 w-4" /> Reset</Button>
            <Button variant="hero" onClick={save} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save
            </Button>
          </>
        }
      />
      <div className="glass rounded-2xl p-6 grid sm:grid-cols-2 gap-4 max-w-2xl">
        <F k="primary" label="Primary" placeholder="250 90% 60%" />
        <F k="secondary" label="Secondary" placeholder="220 70% 50%" />
        <F k="accent" label="Accent" placeholder="290 90% 60%" />
        <F k="background" label="Background" placeholder="240 10% 4%" />
        <F k="radius" label="Radius" placeholder="1rem" />
      </div>
    </div>
  );
};
