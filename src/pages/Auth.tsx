import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

const schema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(6, "At least 6 characters").max(72),
});

const Auth = () => {
  const nav = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">("signin");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    document.title = "Admin sign-in — Kingsley";
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) nav("/admin", { replace: true });
    });
  }, [nav]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "forgot") {
      const emailOk = z.string().email().safeParse(email);
      if (!emailOk.success) return toast.error("Enter a valid email");
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      setLoading(false);
      if (error) return toast.error(error.message);
      toast.success("Reset link sent — check your inbox");
      setMode("signin");
      return;
    }

    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setLoading(true);
    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/admin` },
      });
      setLoading(false);
      if (error) return toast.error(error.message);
      toast.success("Account created. Signing you in…");
      nav("/admin", { replace: true });
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) return toast.error(error.message);
      nav("/admin", { replace: true });
    }
  };

  return (
    <div className="min-h-screen grid place-items-center px-4 relative overflow-hidden">
      <div aria-hidden className="absolute -z-10 inset-0 grid-pattern opacity-30" />
      <div aria-hidden className="absolute -z-10 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-[40rem] bg-primary/20 blur-3xl rounded-full" />

      <form onSubmit={submit} className="glass rounded-3xl p-8 w-full max-w-md space-y-5">
        <div>
          <h1 className="font-display text-3xl font-bold">
            {mode === "signup" ? "Create admin" : mode === "forgot" ? "Reset password" : "Admin sign-in"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === "forgot"
              ? "We'll email you a reset link."
              : "Access the portfolio CMS."}
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-xs mono uppercase tracking-wider text-muted-foreground">Email</label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus autoComplete="email" />
        </div>

        {mode !== "forgot" && (
          <div className="space-y-2">
            <label className="text-xs mono uppercase tracking-wider text-muted-foreground">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
            />
          </div>
        )}

        <Button type="submit" variant="hero" className="w-full" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {mode === "signup" ? "Create account" : mode === "forgot" ? "Send reset link" : "Sign in"}
        </Button>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          {mode === "signin" ? (
            <>
              <button type="button" onClick={() => setMode("signup")} className="hover:text-foreground">
                Create account
              </button>
              <button type="button" onClick={() => setMode("forgot")} className="hover:text-foreground">
                Forgot password?
              </button>
            </>
          ) : (
            <button type="button" onClick={() => setMode("signin")} className="hover:text-foreground">
              ← Back to sign in
            </button>
          )}
        </div>

        <Link to="/" className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground pt-2">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to site
        </Link>
      </form>
    </div>
  );
};

export default Auth;
