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
import { Seo } from "@/components/Seo";

const Index = () => {
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <>
      <Seo
        path="/"
        title="Kingsley — Frontend Developer Portfolio | React, Next.js, TypeScript"
        description="Kingsley is a Nigeria-based frontend developer building fast, accessible, and beautifully animated web experiences with React, Next.js, and TypeScript."
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Person",
          name: "Kingsley",
          jobTitle: "Frontend Developer",
          url: origin,
          knowsAbout: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Frontend Development"],
          address: { "@type": "PostalAddress", addressCountry: "NG" },
        }}
      />
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
