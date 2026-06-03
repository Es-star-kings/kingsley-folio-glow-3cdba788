import { Navbar } from "@/components/portfolio/Navbar";
import { Hero } from "@/components/portfolio/Hero";
import { About } from "@/components/portfolio/About";
import { Skills } from "@/components/portfolio/Skills";
import { Projects } from "@/components/portfolio/Projects";
import { Services } from "@/components/portfolio/Services";
import { Experience } from "@/components/portfolio/Experience";
import { Testimonials } from "@/components/portfolio/Testimonials";
import { Contact } from "@/components/portfolio/Contact";
import { Footer } from "@/components/portfolio/Footer";
import { Loader } from "@/components/portfolio/Loader";
import { useEffect } from "react";

const Index = () => {
  useEffect(() => {
    const data = {
      "@context": "https://schema.org",
      "@type": "Person",
      name: "Kingsley Okafor",
      jobTitle: "Frontend Developer",
      url: typeof window !== "undefined" ? window.location.origin : "",
      knowsAbout: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Frontend Development"],
      address: { "@type": "PostalAddress", addressLocality: "Lagos", addressCountry: "NG" },
    };
    const s = document.createElement("script");
    s.type = "application/ld+json";
    s.text = JSON.stringify(data);
    document.head.appendChild(s);
    return () => { document.head.removeChild(s); };
  }, []);

  return (
    <>
      <Loader />
      <Navbar />
      <main>
        <Hero />
        <About />
        <Skills />
        <Projects />
        <Services />
        <Experience />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
    </>
  );
};

export default Index;
