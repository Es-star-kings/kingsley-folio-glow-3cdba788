import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Download, Loader2, Star, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { AdminHeader } from "./AdminHeader";

type Resume = {
  id: string; label: string; file_url: string; file_type: string | null;
  version: string | null; is_current: boolean; downloads: number; created_at: string;
};

export const ResumeManager = () => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [label, setLabel] = useState("Kingsley Okafor — CV");
  const [version, setVersion] = useState("v1");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    const { data } = await supabase.from("resumes").select("*").order("created_at", { ascending: false });
    setResumes((data as Resume[]) ?? []);
  };
  useEffect(() => { load(); }, []);

  const upload = async (file: File) => {
    setUploading(true);
    try {
      const path = `resumes/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const { error } = await supabase.storage.from("media").upload(path, file);
      if (error) throw error;
      const { data: urlData } = await supabase.storage.from("media").createSignedUrl(path, 60 * 60 * 24 * 365 * 5);
      await supabase.from("resumes").insert({
        label, file_url: urlData?.signedUrl ?? "", file_type: file.type,
        version, is_current: resumes.length === 0,
      });
      toast.success("Uploaded");
      load();
    } catch (e: any) {
      toast.error(e.message ?? "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const setCurrent = async (id: string) => {
    await supabase.from("resumes").update({ is_current: false }).neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("resumes").update({ is_current: true }).eq("id", id);
    load();
    toast.success("Current version updated");
  };

  const del = async (r: Resume) => {
    if (!confirm("Delete this resume?")) return;
    await supabase.from("resumes").delete().eq("id", r.id);
    load();
  };

  return (
    <div>
      <AdminHeader title="Resumes" subtitle="Upload versions and track downloads." />
      <div className="glass rounded-2xl p-6 space-y-3 mb-6">
        <div className="grid sm:grid-cols-2 gap-3">
          <Input placeholder="Label" value={label} onChange={(e) => setLabel(e.target.value)} />
          <Input placeholder="Version (v1, 2024-Q4…)" value={version} onChange={(e) => setVersion(e.target.value)} />
        </div>
        <input ref={fileRef} type="file" accept=".pdf,.docx,.doc" className="hidden" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
        <Button variant="hero" onClick={() => fileRef.current?.click()} disabled={uploading}>
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Upload PDF/DOCX
        </Button>
      </div>

      <div className="grid gap-3">
        {resumes.length === 0 && <div className="glass rounded-2xl p-8 text-center text-muted-foreground">No resumes uploaded.</div>}
        {resumes.map((r) => (
          <div key={r.id} className="glass rounded-2xl p-4 flex flex-wrap items-center gap-3">
            {r.is_current && <span className="text-[10px] mono uppercase bg-primary/20 text-primary px-2 py-0.5 rounded-full flex items-center gap-1"><Star className="h-3 w-3" /> Current</span>}
            <div className="flex-1 min-w-0">
              <div className="font-semibold truncate">{r.label} <span className="text-xs mono text-muted-foreground">{r.version}</span></div>
              <div className="text-xs text-muted-foreground">{r.downloads} downloads · {new Date(r.created_at).toLocaleDateString()}</div>
            </div>
            <Button asChild size="sm" variant="ghost"><a href={r.file_url} target="_blank" rel="noopener"><Download className="h-4 w-4" /></a></Button>
            {!r.is_current && <Button size="sm" variant="ghost" onClick={() => setCurrent(r.id)}>Make current</Button>}
            <Button size="sm" variant="ghost" onClick={() => del(r)} className="hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
          </div>
        ))}
      </div>
    </div>
  );
};
