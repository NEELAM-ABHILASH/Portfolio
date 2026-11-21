import { useEffect, useLayoutEffect } from "react";
import { About } from "./components/About";
import { ContactForm } from "./components/ContactForm";
import { CursorAura } from "./components/CursorAura";
import { Education } from "./components/Education";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { Preloader } from "./components/Preloader";
import { Projects } from "./components/Projects";
import { SceneBackdrop } from "./components/SceneBackdrop";
import { TechConstellationSection } from "./components/TechConstellationSection";
import { WorkExperience } from "./components/WorkExperience";
import { gsap, initSmoothScroll, MQ, onIntro, ScrollTrigger } from "./lib/motion";
import { MotionNotice } from "./components/MotionNotice";
import "./styles/forms.css";
import "./portfolio.css";

/**
 * Sections that get the shared "recede into depth" exit as you scroll past them.
 * (#about is excluded on purpose: it contains a pinned element, and any
 * transform/perspective on its ancestors would break position: fixed.)
 */
const RECEDING = ["experience", "skills", "education"];

function useSectionExits() {
  useLayoutEffect(() => {
    const mm = gsap.matchMedia();
    mm.add(MQ.motion, () => {
      RECEDING.forEach((id) => {
        const section = document.getElementById(id);
        const inner = section?.querySelector<HTMLElement>(":scope > .pf-container");
        if (!section || !inner) return;
        gsap.fromTo(
          inner,
          { z: 0, rotationX: 0, opacity: 1 },
          {
            z: -220,
            rotationX: 9,
            opacity: 0.12,
            transformOrigin: "50% 100%",
            ease: "none",
            immediateRender: false,
            scrollTrigger: { trigger: section, start: "bottom 40%", end: "bottom top", scrub: 0.6 },
          },
        );
      });
    });
    return () => mm.revert();
  }, []);
}

function App() {
  useEffect(() => {
    const stop = initSmoothScroll();
    // Don't let ScrollTrigger restore a remembered position on refresh.
    ScrollTrigger.clearScrollMemory("manual");

    // Layout settles as fonts and images arrive — keep trigger positions honest.
    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh);
    window.addEventListener("load", refresh);

    const off = onIntro(() => {
      window.setTimeout(() => ScrollTrigger.refresh(), 400);
    });
    return () => {
      off();
      stop();
      window.removeEventListener("load", refresh);
    };
  }, []);

  useSectionExits();

  return (
    <div className="app-root">
      <a className="skip-link" href="#about">
        Skip to content
      </a>
      <SceneBackdrop />
      <Preloader />
      <CursorAura />
      <Header />
      <MotionNotice />

      <main className="pf-main">
        <Hero />
        <About />
        <WorkExperience />
        <Projects />
        <TechConstellationSection />
        <Education />
        <ContactForm />
      </main>
      <Footer />
    </div>
  );
}

export default App;
