import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

const ResetPassword = () => {
  const nav = useNavigate();
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    document.title = "Reset password — Kingsley";
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.length < 6) return toast.error("At least 6 characters");
    if (pw !== confirm) return toast.error("Passwords don't match");
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Password updated");
    nav("/admin", { replace: true });
  };

  return (
    <div className="min-h-screen grid place-items-center px-4">
      <form onSubmit={submit} className="glass rounded-3xl p-8 w-full max-w-md space-y-5">
        <h1 className="font-display text-2xl font-bold">Choose a new password</h1>
        {!ready && (
          <p className="text-sm text-muted-foreground">
            Open the reset link from your email to continue.
          </p>
        )}
        <div className="space-y-2">
          <label className="text-xs mono uppercase tracking-wider text-muted-foreground">New password</label>
          <Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} disabled={!ready} />
        </div>
        <div className="space-y-2">
          <label className="text-xs mono uppercase tracking-wider text-muted-foreground">Confirm</label>
          <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} disabled={!ready} />
        </div>
        <Button type="submit" variant="hero" className="w-full" disabled={!ready || loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Update password
        </Button>
      </form>
    </div>
  );
};

export default ResetPassword;
