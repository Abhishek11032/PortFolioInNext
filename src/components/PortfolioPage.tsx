import AboutSection from "@/components/sections/AboutSection";
import ContactSection from "@/components/sections/ContactSection";
import EducationSection from "@/components/sections/EducationSection";
import ExperienceSection from "@/components/sections/ExperienceSection";
import HeroSection from "@/components/sections/HeroSection";
import ProjectsSection from "@/components/sections/ProjectsSection";
import SkillsSection from "@/components/sections/SkillsSection";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";

export default function PortfolioPage() {
  return (
    <div className="min-h-screen bg-ink text-cream">
      <a href="#main-content" className="sr-only z-50 rounded-lg bg-cyan px-4 py-3 font-semibold text-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4">Skip to content</a>
      <Navbar />
      <main id="main-content">
        <HeroSection />
        <AboutSection />
        <SkillsSection />
        <ProjectsSection />
        <ExperienceSection />
        <EducationSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
