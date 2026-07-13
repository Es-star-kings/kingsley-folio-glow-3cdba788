import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { AdminHeader } from "./AdminHeader";

export const SettingsEditor = () => {
  const [settings, setSettings] = useState<any>({ seo: {}, integrations: {}, navigation: {} });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from("settings").select("*").eq("id", 1).maybeSingle().then(({ data }) => setSettings(data ?? { seo: {}, integrations: {}, navigation: {} }));
  }, []);

  const setSeo = (k: string, v: any) => setSettings((s: any) => ({ ...s, seo: { ...(s.seo ?? {}), [k]: v } }));
  const setInt = (k: string, v: any) => setSettings((s: any) => ({ ...s, integrations: { ...(s.integrations ?? {}), [k]: v } }));

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from("settings").update({
      seo: settings.seo, integrations: settings.integrations, navigation: settings.navigation,
    }).eq("id", 1);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Settings saved");
  };

  const F = ({ label, children }: any) => (
    <div className="space-y-1.5"><label className="text-xs mono uppercase text-muted-foreground">{label}</label>{children}</div>
  );

  return (
    <div>
      <AdminHeader title="Settings" subtitle="SEO, integrations, and general site settings." actions={
        <Button variant="hero" onClick={save} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save</Button>
      } />

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="glass rounded-2xl p-6 space-y-3">
          <h2 className="font-display font-semibold text-lg">SEO</h2>
          <F label="Site title"><Input value={settings.seo?.title ?? ""} onChange={(e) => setSeo("title", e.target.value)} /></F>
          <F label="Meta description"><Textarea rows={2} value={settings.seo?.description ?? ""} onChange={(e) => setSeo("description", e.target.value)} /></F>
          <F label="Keywords (comma separated)"><Input value={settings.seo?.keywords ?? ""} onChange={(e) => setSeo("keywords", e.target.value)} /></F>
          <F label="OG image URL"><Input value={settings.seo?.og_image ?? ""} onChange={(e) => setSeo("og_image", e.target.value)} /></F>
          <F label="Canonical URL"><Input value={settings.seo?.canonical ?? ""} onChange={(e) => setSeo("canonical", e.target.value)} /></F>
        </div>
        <div className="glass rounded-2xl p-6 space-y-3">
          <h2 className="font-display font-semibold text-lg">Integrations</h2>
          <p className="text-xs text-muted-foreground">API keys should be stored as backend secrets — these fields hold public IDs only.</p>
          <F label="Google Analytics ID"><Input value={settings.integrations?.ga_id ?? ""} onChange={(e) => setInt("ga_id", e.target.value)} placeholder="G-XXXXXXX" /></F>
          <F label="Calendly URL"><Input value={settings.integrations?.calendly ?? ""} onChange={(e) => setInt("calendly", e.target.value)} /></F>
          <F label="Search Console verification"><Input value={settings.integrations?.gsc ?? ""} onChange={(e) => setInt("gsc", e.target.value)} /></F>
        </div>
      </div>
    </div>
  );
};
