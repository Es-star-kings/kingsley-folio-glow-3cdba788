import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Copy, Loader2, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { AdminHeader } from "./AdminHeader";
import { Skeleton } from "@/components/ui/skeleton";

type Asset = {
  id: string; name: string; url: string; storage_path: string | null;
  mime_type: string | null; size_bytes: number | null; created_at: string;
};

export const MediaLibrary = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("media_assets").select("*").order("created_at", { ascending: false });
    setAssets((data as Asset[]) ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      for (const file of Array.from(files)) {
        const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
        const { error: upErr } = await supabase.storage.from("media").upload(path, file, { upsert: false });
        if (upErr) throw upErr;
        const { data: urlData } = await supabase.storage.from("media").createSignedUrl(path, 60 * 60 * 24 * 365 * 5);
        const publicUrl = urlData?.signedUrl ?? "";
        const { error: dbErr } = await supabase.from("media_assets").insert({
          name: file.name, url: publicUrl, storage_path: path,
          mime_type: file.type, size_bytes: file.size, uploaded_by: userData.user?.id ?? null,
        });
        if (dbErr) throw dbErr;
      }
      toast.success("Uploaded");
      load();
    } catch (e: any) {
      toast.error(e.message ?? "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const del = async (a: Asset) => {
    if (!confirm(`Delete ${a.name}?`)) return;
    if (a.storage_path) await supabase.storage.from("media").remove([a.storage_path]);
    await supabase.from("media_assets").delete().eq("id", a.id);
    setAssets((r) => r.filter((x) => x.id !== a.id));
    toast.success("Deleted");
  };

  const copy = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("URL copied");
  };

  const totalSize = assets.reduce((s, a) => s + (a.size_bytes ?? 0), 0);

  return (
    <div>
      <AdminHeader
        title="Media library"
        subtitle={`${assets.length} files · ${(totalSize / 1024 / 1024).toFixed(1)} MB`}
        actions={
          <>
            <input ref={fileRef} type="file" multiple className="hidden" onChange={(e) => upload(e.target.files)} />
            <Button variant="hero" onClick={() => fileRef.current?.click()} disabled={uploading}>
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Upload
            </Button>
          </>
        }
      />

      {loading ? (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {[...Array(8)].map((_, i) => <Skeleton key={i} className="aspect-square rounded-2xl" />)}
        </div>
      ) : assets.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center text-muted-foreground">
          No media yet. Upload images, PDFs, or videos.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {assets.map((a) => {
            const isImage = a.mime_type?.startsWith("image/");
            return (
              <div key={a.id} className="glass rounded-2xl overflow-hidden group">
                <div className="aspect-square bg-muted grid place-items-center overflow-hidden">
                  {isImage ? (
                    <img src={a.url} alt={a.name} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="text-xs mono text-muted-foreground">{a.mime_type ?? "file"}</div>
                  )}
                </div>
                <div className="p-3">
                  <div className="text-xs truncate font-medium">{a.name}</div>
                  <div className="text-[10px] text-muted-foreground mono">{((a.size_bytes ?? 0) / 1024).toFixed(1)} KB</div>
                  <div className="flex gap-1 mt-2">
                    <Button size="sm" variant="ghost" onClick={() => copy(a.url)} className="flex-1"><Copy className="h-3 w-3" /> URL</Button>
                    <Button size="sm" variant="ghost" onClick={() => del(a)} className="hover:text-destructive"><Trash2 className="h-3 w-3" /></Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
