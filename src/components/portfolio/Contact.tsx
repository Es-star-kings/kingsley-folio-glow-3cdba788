import { useState } from "react";
import { motion } from "framer-motion";
import { z } from "zod";
import { Github, Mail, MapPin, MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { usePortfolio } from "@/context/PortfolioContext";
import { SectionHeading } from "./SectionHeading";

const schema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  message: z.string().trim().min(10, "Tell me a bit more").max(1500),
});

export const Contact = () => {
  const { personal } = usePortfolio();
  const contacts = [
    { icon: Mail, label: "Email", value: personal.email, href: `mailto:${personal.email}` },
    { icon: MessageCircle, label: "WhatsApp", value: "Chat with me", href: personal.whatsapp },
    { icon: Github, label: "GitHub", value: "View my code", href: personal.github },
  ].filter((c) => !!c.href);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const result = schema.safeParse({
      name: fd.get("name"),
      email: fd.get("email"),
      message: fd.get("message"),
    });
    if (!result.success) {
      toast.error(result.error.issues[0].message);
      return;
    }
    setLoading(true);
    const { supabase } = await import("@/integrations/supabase/client");
    const { error } = await supabase.from("contact_messages").insert({
      name: result.data.name,
      email: result.data.email,
      message: result.data.message,
    });
    setLoading(false);
    if (error) {
      toast.error("Couldn't send — try again in a moment");
      return;
    }
    toast.success("Message sent! I'll get back to you within 24 hours.");
    form.reset();
  };

  return (
    <section id="contact" className="py-16 sm:py-24 lg:py-32 relative">
      <div aria-hidden className="absolute -z-10 left-0 top-1/3 h-96 w-96 bg-secondary/20 blur-3xl rounded-full" />
      <div className="container">
        <SectionHeading
          eyebrow="Contact"
          title="Let's build something great"
          description="Have a project, a role, or an idea you want to explore? Drop me a message."
          center
        />

        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-8 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <div className="glass rounded-3xl p-6 flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-gradient-primary grid place-items-center text-primary-foreground shrink-0">
                <MapPin className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs mono text-muted-foreground uppercase tracking-wider">Based in</div>
                <div className="font-display font-semibold">{personal.location}</div>
                <div className="text-sm text-muted-foreground mt-1">Available worldwide · remote-first</div>
              </div>
            </div>

            {contacts.map((c) => (
              <a
                key={c.label}
                href={c.href}
                className="group glass rounded-2xl p-5 flex items-center gap-4 hover:shadow-neon transition-all"
              >
                <div className="h-10 w-10 rounded-xl bg-muted grid place-items-center group-hover:bg-gradient-primary group-hover:text-primary-foreground transition-all">
                  <c.icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="text-xs mono text-muted-foreground uppercase tracking-wider">{c.label}</div>
                  <div className="font-medium">{c.value}</div>
                </div>
              </a>
            ))}
          </motion.div>

          <motion.form
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            onSubmit={onSubmit}
            className="glass rounded-3xl p-6 sm:p-8 space-y-4"
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-xs mono uppercase tracking-wider text-muted-foreground">Name</label>
                <Input id="name" name="name" placeholder="Your name" required maxLength={100} className="bg-muted/40 border-border" />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-xs mono uppercase tracking-wider text-muted-foreground">Email</label>
                <Input id="email" name="email" type="email" placeholder="you@company.com" required maxLength={255} className="bg-muted/40 border-border" />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="message" className="text-xs mono uppercase tracking-wider text-muted-foreground">Message</label>
              <Textarea id="message" name="message" placeholder="Tell me about your project, timeline, and budget..." required maxLength={1500} rows={6} className="bg-muted/40 border-border resize-none" />
            </div>
            <Button type="submit" variant="hero" size="lg" disabled={loading} className="w-full">
              {loading ? "Sending..." : <>Send message <Send className="h-4 w-4" /></>}
            </Button>
          </motion.form>
        </div>
      </div>
    </section>
  );
};
