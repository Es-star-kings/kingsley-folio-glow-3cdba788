import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Archive, Mail, MailOpen, Search, Trash2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { AdminHeader } from "./AdminHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type Msg = {
  id: string; name: string; email: string; subject: string | null;
  message: string; status: string; archived: boolean; is_spam: boolean;
  labels: string[]; notes: string | null; created_at: string;
};

export const Inbox = () => {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [selected, setSelected] = useState<Msg | null>(null);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [showArchived, setShowArchived] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("contact_messages")
      .select("*")
      .eq("archived", showArchived)
      .order("created_at", { ascending: false });
    setMessages((data as Msg[]) ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, [showArchived]);

  const open = async (m: Msg) => {
    setSelected(m);
    if (m.status === "unread") {
      await supabase.from("contact_messages").update({ status: "read" }).eq("id", m.id);
      setMessages((rs) => rs.map((r) => r.id === m.id ? { ...r, status: "read" } : r));
    }
  };

  const archive = async (id: string) => {
    await supabase.from("contact_messages").update({ archived: true }).eq("id", id);
    setMessages((rs) => rs.filter((r) => r.id !== id));
    if (selected?.id === id) setSelected(null);
    toast.success("Archived");
  };
  const del = async (id: string) => {
    if (!confirm("Delete this message permanently?")) return;
    await supabase.from("contact_messages").delete().eq("id", id);
    setMessages((rs) => rs.filter((r) => r.id !== id));
    if (selected?.id === id) setSelected(null);
    toast.success("Deleted");
  };

  const exportCsv = () => {
    const rows = [["Date", "Name", "Email", "Message"]].concat(
      messages.map((m) => [new Date(m.created_at).toISOString(), m.name, m.email, m.message.replace(/\n/g, " ")]),
    );
    const csv = rows.map((r) => r.map((c) => `"${(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "messages.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = messages.filter((m) =>
    !q || [m.name, m.email, m.message, m.subject ?? ""].some((s) => s.toLowerCase().includes(q.toLowerCase())),
  );

  return (
    <div>
      <AdminHeader
        title="Inbox"
        subtitle="Contact form submissions from your portfolio."
        actions={
          <>
            <Button variant="ghost" size="sm" onClick={() => setShowArchived((v) => !v)}>
              {showArchived ? "Show inbox" : "Show archived"}
            </Button>
            <Button variant="ghost" size="sm" onClick={exportCsv}><Download className="h-4 w-4" /> Export CSV</Button>
          </>
        }
      />

      <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] gap-4">
        <div className="glass rounded-2xl overflow-hidden">
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
            </div>
          </div>
          <div className="max-h-[70vh] overflow-y-auto divide-y divide-border">
            {loading && [...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 m-3" />)}
            {!loading && filtered.length === 0 && (
              <div className="p-8 text-center text-sm text-muted-foreground">No messages.</div>
            )}
            {filtered.map((m) => (
              <button
                key={m.id}
                onClick={() => open(m)}
                className={cn(
                  "w-full text-left p-4 hover:bg-muted/40 transition-colors",
                  selected?.id === m.id && "bg-muted/60",
                )}
              >
                <div className="flex items-center gap-2">
                  {m.status === "unread" ? <Mail className="h-3.5 w-3.5 text-primary" /> : <MailOpen className="h-3.5 w-3.5 text-muted-foreground" />}
                  <div className={cn("font-medium truncate", m.status === "unread" && "font-semibold")}>{m.name}</div>
                  <div className="ml-auto text-xs text-muted-foreground shrink-0">{new Date(m.created_at).toLocaleDateString()}</div>
                </div>
                <div className="text-xs text-muted-foreground truncate mt-1">{m.email}</div>
                <div className="text-sm text-muted-foreground truncate mt-1">{m.message}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          {!selected ? (
            <div className="h-full min-h-[40vh] grid place-items-center text-muted-foreground">Select a message</div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-display text-2xl font-bold">{selected.name}</div>
                  <a href={`mailto:${selected.email}`} className="text-sm text-primary hover:underline">{selected.email}</a>
                  <div className="text-xs text-muted-foreground mt-1">{new Date(selected.created_at).toLocaleString()}</div>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => archive(selected.id)}><Archive className="h-4 w-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => del(selected.id)} className="hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
              <div className="whitespace-pre-wrap text-sm leading-relaxed border-t border-border pt-4">
                {selected.message}
              </div>
              <Button asChild variant="hero">
                <a href={`mailto:${selected.email}?subject=Re: your message&body=Hi ${selected.name},%0D%0A%0D%0A`}>Reply via email</a>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
