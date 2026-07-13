import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminHeader } from "./AdminHeader";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";

type Row = { path: string; referrer: string | null; device: string | null; browser: string | null; os: string | null; created_at: string };

const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--accent))", "#a78bfa", "#22d3ee", "#f59e0b"];

const Chart = ({ title, children }: any) => (
  <div className="glass rounded-2xl p-5">
    <div className="text-sm mono uppercase tracking-wider text-muted-foreground mb-4">{title}</div>
    <div className="h-64">{children}</div>
  </div>
);

const groupCount = (rows: Row[], key: keyof Row) => {
  const m = new Map<string, number>();
  rows.forEach((r) => {
    const v = ((r[key] as string) || "unknown").toString();
    m.set(v, (m.get(v) ?? 0) + 1);
  });
  return [...m.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
};

export const Analytics = () => {
  const [rows, setRows] = useState<Row[] | null>(null);

  useEffect(() => {
    (async () => {
      const since = new Date(); since.setDate(since.getDate() - 30);
      const { data } = await supabase.from("page_views")
        .select("path,referrer,device,browser,os,created_at")
        .gte("created_at", since.toISOString())
        .order("created_at");
      setRows((data as Row[]) ?? []);
    })();
  }, []);

  const daily = useMemo(() => {
    if (!rows) return [];
    const m = new Map<string, number>();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      m.set(d.toISOString().slice(0, 10), 0);
    }
    rows.forEach((r) => {
      const k = r.created_at.slice(0, 10);
      if (m.has(k)) m.set(k, (m.get(k) ?? 0) + 1);
    });
    return [...m.entries()].map(([date, views]) => ({ date: date.slice(5), views }));
  }, [rows]);

  if (!rows) {
    return (
      <div>
        <AdminHeader title="Analytics" subtitle="Last 30 days." />
        <div className="grid md:grid-cols-2 gap-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-72 rounded-2xl" />)}</div>
      </div>
    );
  }

  return (
    <div>
      <AdminHeader title="Analytics" subtitle={`${rows.length.toLocaleString()} page views in the last 30 days.`} />

      <div className="grid gap-4">
        <Chart title="Visitors (30 days)">
          <ResponsiveContainer>
            <AreaChart data={daily}>
              <defs>
                <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
              <Area type="monotone" dataKey="views" stroke="hsl(var(--primary))" fill="url(#g)" />
            </AreaChart>
          </ResponsiveContainer>
        </Chart>

        <div className="grid md:grid-cols-2 gap-4">
          <Chart title="Top pages">
            <ResponsiveContainer>
              <BarChart data={groupCount(rows, "path").slice(0, 6)}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Chart>

          {(["device", "browser", "os"] as const).map((k) => (
            <Chart key={k} title={`By ${k}`}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={groupCount(rows, k).slice(0, 6)} dataKey="value" nameKey="name" outerRadius={90} label>
                    {groupCount(rows, k).slice(0, 6).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </Chart>
          ))}
        </div>
      </div>
    </div>
  );
};
