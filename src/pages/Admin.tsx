import { Navigate, Route, Routes } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { AdminShell } from "@/components/admin/AdminShell";
import { Overview } from "@/components/admin/Overview";
import { ContentEditor } from "@/components/admin/ContentEditor";
import { Inbox } from "@/components/admin/Inbox";
import { BlogManager } from "@/components/admin/BlogManager";
import { MediaLibrary } from "@/components/admin/MediaLibrary";
import { ResumeManager } from "@/components/admin/ResumeManager";
import { Analytics } from "@/components/admin/Analytics";
import { AIAssistant } from "@/components/admin/AIAssistant";
import { ThemeEditor } from "@/components/admin/ThemeEditor";
import { SettingsEditor } from "@/components/admin/SettingsEditor";

const Admin = () => {
  const { loading, user, isAdmin } = useAuth();

  if (loading || (user && isAdmin === null)) {
    return (
      <div className="min-h-screen grid place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) {
    return (
      <div className="min-h-screen grid place-items-center px-4 text-center">
        <div className="glass rounded-3xl p-8 max-w-md space-y-3">
          <h1 className="font-display text-2xl font-bold">Not authorized</h1>
          <p className="text-muted-foreground text-sm">
            This account doesn't have admin access. Sign in with the admin email or ask an admin to grant you access.
          </p>
          <a href="/" className="text-primary hover:underline text-sm">← Back to site</a>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route element={<AdminShell />}>
        <Route index element={<Overview />} />
        <Route path="content" element={<ContentEditor />} />
        <Route path="inbox" element={<Inbox />} />
        <Route path="blog" element={<BlogManager />} />
        <Route path="media" element={<MediaLibrary />} />
        <Route path="resumes" element={<ResumeManager />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="ai" element={<AIAssistant />} />
        <Route path="theme" element={<ThemeEditor />} />
        <Route path="settings" element={<SettingsEditor />} />
      </Route>
    </Routes>
  );
};

export default Admin;
