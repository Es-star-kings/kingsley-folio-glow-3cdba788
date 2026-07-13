import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Briefcase, Eye, FileText, Inbox as InboxIcon, MessageSquare, Sparkles,
  Star, TrendingUp, Users, Zap
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AdminHeader } from "./AdminHeader";
import { Skeleton } from "@/components/ui/skeleton";

type Stats = {
  visitorsTotal: number;
  visitorsToday: number;
  projects: number;
  featured: number;
  skills: number;
  blogPosts: number;
  testimonials: number;
  unreadMessages: number;
  resumeDownloads: number;
};

const StatCard = ({ icon: Icon, label, value, hint, tone = "primary" }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    className="glass rounded-2xl p-5 relative overflow-hidden group"
  >
    <div className={`absolute -top-8 -right-8 h-24 w-24 rounded-full opacity-20 blur-2xl bg-${tone}`} />
    <div className="flex items-center justify-between mb-3">
      <div className="text-xs mono uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="h-8 w-8 rounded-lg bg-gradient-primary grid place-items-center text-primary-foreground">
        <Icon className="h-4 w-4" />
      </div>
    </div>
    <div className="font-display text-3xl font-bold">{value}</div>
    {hint && <div className="text-xs text-muted-foreground mt-1">{hint}</div>}
  </motion.div>
);

export const Overview = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentMessages, setRecentMessages] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const [pvTotal, pvToday, projAll, projFeat, skillsC, blogC, testiC, msgUnread, resumes, msgs, logs] = await Promise.all([
        supabase.from("page_views").select("id", { count: "exact", head: true }),
        supabase.from("page_views").select("id", { count: "exact", head: true }).gte("created_at", startOfDay.toISOString()),
        supabase.from("projects").select("id", { count: "exact", head: true }),
        supabase.from("projects").select("id", { count: "exact", head: true }).eq("featured", true),
        supabase.from("skills").select("id", { count: "exact", head: true }),
        supabase.from("blog_posts").select("id", { count: "exact", head: true }),
        supabase.from("testimonials").select("id", { count: "exact", head: true }),
        supabase.from("contact_messages").select("id", { count: "exact", head: true }).eq("status", "unread").eq("archived", false),
        supabase.from("resumes").select("downloads"),
        supabase.from("contact_messages").select("*").eq("archived", false).order("created_at", { ascending: false }).limit(5),
        supabase.from("activity_logs").select("*").order("created_at", { ascending: false }).limit(6),
      ]);
      setStats({
        visitorsTotal: pvTotal.count ?? 0,
        visitorsToday: pvToday.count ?? 0,
        projects: projAll.count ?? 0,
        featured: projFeat.count ?? 0,
        skills: skillsC.count ?? 0,
        blogPosts: blogC.count ?? 0,
        testimonials: testiC.count ?? 0,
        unreadMessages: msgUnread.count ?? 0,
        resumeDownloads: (resumes.data ?? []).reduce((s, r) => s + (r.downloads ?? 0), 0),
      });
      setRecentMessages(msgs.data ?? []);
      setRecentActivity(logs.data ?? []);
    })();
  }, []);

  return (
    <div>
      <AdminHeader title="Overview" subtitle="A live snapshot of your portfolio." />

      {!stats ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Eye} label="Total visitors" value={stats.visitorsTotal.toLocaleString()} hint="All-time page views" />
          <StatCard icon={TrendingUp} label="Visitors today" value={stats.visitorsToday.toLocaleString()} hint="Since midnight" />
          <StatCard icon={Briefcase} label="Projects" value={stats.projects} hint={`${stats.featured} featured`} />
          <StatCard icon={Zap} label="Skills" value={stats.skills} />
          <StatCard icon={FileText} label="Blog posts" value={stats.blogPosts} />
          <StatCard icon={Star} label="Testimonials" value={stats.testimonials} />
          <StatCard icon={InboxIcon} label="Unread messages" value={stats.unreadMessages} />
          <StatCard icon={Users} label="Resume downloads" value={stats.resumeDownloads} />
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-4 mt-8">
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold flex items-center gap-2"><MessageSquare className="h-4 w-4" /> Recent messages</h2>
            <NavLink to="/admin/inbox" className="text-xs mono text-primary hover:underline">View all →</NavLink>
          </div>
          {recentMessages.length === 0 && <p className="text-sm text-muted-foreground">No messages yet.</p>}
          <ul className="space-y-3">
            {recentMessages.map((m) => (
              <li key={m.id} className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-medium truncate">{m.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{m.message}</div>
                </div>
                <div className="text-xs mono text-muted-foreground shrink-0">{new Date(m.created_at).toLocaleDateString()}</div>
              </li>
            ))}
          </ul>
        </div>

        <div className="glass rounded-2xl p-6">
          <h2 className="font-display text-lg font-semibold flex items-center gap-2 mb-4"><Sparkles className="h-4 w-4" /> Quick actions</h2>
          <div className="grid grid-cols-2 gap-2">
            <NavLink to="/admin/content" className="glass rounded-xl p-4 hover:shadow-neon transition-all">
              <div className="font-semibold text-sm">Edit content</div>
              <div className="text-xs text-muted-foreground">Projects, skills, hero…</div>
            </NavLink>
            <NavLink to="/admin/blog" className="glass rounded-xl p-4 hover:shadow-neon transition-all">
              <div className="font-semibold text-sm">Write a post</div>
              <div className="text-xs text-muted-foreground">Blog CMS</div>
            </NavLink>
            <NavLink to="/admin/media" className="glass rounded-xl p-4 hover:shadow-neon transition-all">
              <div className="font-semibold text-sm">Upload media</div>
              <div className="text-xs text-muted-foreground">Images, PDFs</div>
            </NavLink>
            <NavLink to="/admin/ai" className="glass rounded-xl p-4 hover:shadow-neon transition-all">
              <div className="font-semibold text-sm">AI Assistant</div>
              <div className="text-xs text-muted-foreground">Draft &amp; improve copy</div>
            </NavLink>
          </div>
          {recentActivity.length > 0 && (
            <div className="mt-6">
              <div className="text-xs mono uppercase text-muted-foreground mb-2">Recent activity</div>
              <ul className="space-y-1.5">
                {recentActivity.map((a) => (
                  <li key={a.id} className="text-xs text-muted-foreground">
                    <span className="text-foreground">{a.action}</span> {a.entity && `· ${a.entity}`} — {new Date(a.created_at).toLocaleString()}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
