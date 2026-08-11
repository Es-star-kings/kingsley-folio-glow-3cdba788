import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  BarChart3, FileText, Image as ImageIcon, Inbox, LayoutDashboard,
  LogOut, Palette, PenTool, Search, Settings2, Sparkles, User, Home
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const nav = [
  { to: "/admin", end: true, label: "Overview", icon: LayoutDashboard },
  { to: "/admin/content", label: "Content", icon: PenTool },
  { to: "/admin/inbox", label: "Inbox", icon: Inbox },
  { to: "/admin/blog", label: "Blog", icon: FileText },
  { to: "/admin/media", label: "Media", icon: ImageIcon },
  { to: "/admin/resumes", label: "Resumes", icon: User },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin/ai", label: "AI Assistant", icon: Sparkles },
  { to: "/admin/theme", label: "Theme", icon: Palette },
  { to: "/admin/seo", label: "SEO", icon: Search },
  { to: "/admin/settings", label: "Settings", icon: Settings2 },

];

export const AdminShell = () => {
  const navigate = useNavigate();
  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate("/auth", { replace: true });
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-border bg-card/40 backdrop-blur-xl">
        <div className="p-6 border-b border-border">
          <div className="font-display text-lg font-bold text-gradient">Kingsley CMS</div>
          <div className="text-xs mono text-muted-foreground mt-1">Portfolio Studio</div>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all",
                  isActive
                    ? "bg-gradient-primary text-primary-foreground shadow-neon"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                )
              }
            >
              <n.icon className="h-4 w-4" />
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-border space-y-1">
          <NavLink
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-muted/60 hover:text-foreground"
          >
            <Home className="h-4 w-4" /> View site
          </NavLink>
          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-muted/60 hover:text-destructive"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0">
        {/* Mobile top nav */}
        <div className="lg:hidden sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="font-display font-bold text-gradient">Kingsley CMS</div>
            <div className="flex items-center gap-1">
              <Button size="sm" variant="ghost" asChild><NavLink to="/">Site</NavLink></Button>
              <Button size="sm" variant="ghost" onClick={signOut}><LogOut className="h-4 w-4" /></Button>
            </div>
          </div>
          <div className="flex gap-1 px-2 pb-2 overflow-x-auto">
            {nav.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                className={({ isActive }) =>
                  cn(
                    "shrink-0 px-3 py-1.5 rounded-full text-xs mono transition-all border",
                    isActive
                      ? "bg-gradient-primary text-primary-foreground border-transparent"
                      : "glass border-border text-muted-foreground",
                  )
                }
              >
                {n.label}
              </NavLink>
            ))}
          </div>
        </div>

        <main className="p-4 sm:p-6 lg:p-10 max-w-7xl">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
