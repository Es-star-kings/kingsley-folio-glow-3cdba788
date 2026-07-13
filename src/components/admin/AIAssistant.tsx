import { useState } from "react";
import { toast } from "sonner";
import { Copy, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { AdminHeader } from "./AdminHeader";

const PRESETS = [
  { id: "project", label: "Project description", prompt: "Write a compelling, benefit-focused project description (80-120 words) for this project:" },
  { id: "bio", label: "Improve bio", prompt: "Improve this developer bio — keep it under 60 words, make it confident and specific:" },
  { id: "blog", label: "Blog post outline", prompt: "Draft a technical blog post outline with intro, 4-6 sections, and conclusion, on the topic:" },
  { id: "seo", label: "SEO meta", prompt: "Write an SEO title (<60 chars) and meta description (<160 chars) for this page:" },
  { id: "skill", label: "Skill description", prompt: "Write a one-line professional description for this skill (max 20 words):" },
  { id: "email", label: "Client email", prompt: "Draft a polite, professional email based on this context:" },
  { id: "proposal", label: "Client proposal", prompt: "Write a short client proposal (scope, deliverables, timeline, price placeholder) for:" },
  { id: "social", label: "Social post", prompt: "Write 3 short LinkedIn/X posts (<280 chars each) about:" },
];

export const AIAssistant = () => {
  const [preset, setPreset] = useState(PRESETS[0]);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!input.trim()) return toast.error("Add some context");
    setLoading(true);
    setOutput("");
    try {
      const { data, error } = await supabase.functions.invoke("ai-assist", {
        body: { prompt: `${preset.prompt}\n\n${input}` },
      });
      if (error) throw error;
      setOutput(data?.text ?? "");
    } catch (e: any) {
      toast.error(e.message ?? "AI request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <AdminHeader
        title="AI Assistant"
        subtitle="Draft, improve, and rewrite portfolio copy with Lovable AI."
      />

      <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-4">
        <div className="glass rounded-2xl p-5 space-y-4">
          <div>
            <div className="text-xs mono uppercase text-muted-foreground mb-2">Task</div>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPreset(p)}
                  className={`px-3 py-1.5 rounded-full text-xs mono border transition-all ${
                    preset.id === p.id
                      ? "bg-gradient-primary text-primary-foreground border-transparent"
                      : "glass border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs mono uppercase text-muted-foreground mb-2">Context / raw input</div>
            <Textarea rows={10} value={input} onChange={(e) => setInput(e.target.value)} placeholder="Paste text or describe what you want…" />
          </div>
          <Button variant="hero" onClick={generate} disabled={loading} className="w-full">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Generate
          </Button>
        </div>

        <div className="glass rounded-2xl p-5 min-h-[300px] relative">
          {output && (
            <Button size="sm" variant="ghost" onClick={() => { navigator.clipboard.writeText(output); toast.success("Copied"); }} className="absolute top-3 right-3">
              <Copy className="h-4 w-4" /> Copy
            </Button>
          )}
          {loading && <div className="grid place-items-center h-full text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin" /></div>}
          {!loading && !output && <div className="grid place-items-center h-full text-muted-foreground text-sm">Output will appear here.</div>}
          {output && <div className="whitespace-pre-wrap text-sm leading-relaxed pt-8">{output}</div>}
        </div>
      </div>
    </div>
  );
};
