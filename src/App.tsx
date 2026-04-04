import { useEffect, useState } from "react";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { TechConstellationSection } from "./components/TechConstellationSection";
import { WorkExperience } from "./components/WorkExperience";
import { ContactForm } from "./components/ContactForm";
import "./portfolio.css";

const INTRO_MS = 3000;

function App() {
  const [introBoot, setIntroBoot] = useState(true);

  useEffect(() => {
    const t = window.setTimeout(() => setIntroBoot(false), INTRO_MS);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div
      className={`app-root d-flex flex-column min-vh-100${introBoot ? " intro-boot" : ""}`}
    >
      <Header />

      <main className="flex-grow-1 pf-main-content">
        <Hero />
        <WorkExperience />
        <TechConstellationSection />
        <ContactForm />
      </main>
      <footer className="pf-footer py-4 border-top intro-footer">
        <div className="pf-container text-center pf-footer-text small">
          © {new Date().getFullYear()} Abhilash Neelam
        </div>
      </footer>
    </div>
  );
}

export default App;
