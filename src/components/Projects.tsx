import type { CSSProperties, MouseEvent } from "react";
import { projects, type Project } from "../data/portfolio";
import { useGsap } from "../hooks/useGsap";
import { burst, gsap, MQ, ScrollTrigger, scrollToHash } from "../lib/motion";
import { SectionHeading } from "./fx/SectionHeading";
import { TiltCard } from "./fx/TiltCard";

const depth = (d: number) => ({ "--depth": d }) as CSSProperties;

function UemPreview() {
  const devices = ["Android", "iOS", "macOS", "Linux", "ChromeOS"];
  const policies = ["Passcode policy", "Wi-Fi profile", "App allow-list"];
  return (
    <div className="pv pv-uem" aria-hidden="true">
      <div className="pv-bar">
        <i />
        <i />
        <i />
        <span>uem / devices</span>
      </div>
      <div className="pv-body">
        <div className="pv-side">
          <b />
          <b />
          <b />
          <b />
        </div>
        <div className="pv-main">
          <div className="pv-devices">
            {devices.map((d, i) => (
              <div key={d} className="pv-device" style={{ "--i": i } as CSSProperties}>
                <span className="pv-dot" />
                {d}
              </div>
            ))}
          </div>
          <div className="pv-policies">
            {policies.map((p, i) => (
              <div key={p} className="pv-policy" style={{ "--i": i } as CSSProperties}>
                <span>{p}</span>
                <span className="pv-toggle" />
              </div>
            ))}
          </div>
          <div className="pv-lock">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="5" y="11" width="14" height="10" rx="2" />
              <path d="M8 11V8a4 4 0 0 1 8 0v3" />
            </svg>
            RSA
          </div>
        </div>
      </div>
    </div>
  );
}

function PortfolioPreview() {
  return (
    <div className="pv pv-form" aria-hidden="true">
      <div className="pv-bar">
        <i />
        <i />
        <i />
        <span>/api/form</span>
      </div>
      <div className="pv-body pv-body--form">
        <div className="pv-fields">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="pv-field" style={{ "--i": i } as CSSProperties}>
              <span />
            </div>
          ))}
          <div className="pv-submit">
            <span>Submit</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path d="M5 12l5 5L20 7" />
            </svg>
          </div>
        </div>
        <div className="pv-stack">
          <span>Express</span>
          <span>Rate limit</span>
          <span>MongoDB</span>
        </div>
      </div>
    </div>
  );
}

function ProjectCard({ p }: { p: Project }) {
  const onLink = (e: MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!href.startsWith("#")) return;
    e.preventDefault();
    burst(e.clientX, e.clientY);
    scrollToHash(href);
  };
  return (
    <TiltCard className={`pj-card pj-card--${p.id}`} max={7}>
      <div className="pj-info">
        <div className="pj-top tilt-layer" style={depth(30)}>
          <span className="pj-index">{p.index}</span>
          <span className="pj-context">{p.context}</span>
        </div>
        <h3 className="pj-title tilt-layer" style={depth(60)}>
          {p.title}
        </h3>
        <p className="pj-summary tilt-layer" style={depth(35)}>
          {p.summary}
        </p>
        <ul className="pj-points tilt-layer" style={depth(25)}>
          {p.points.map((pt) => (
            <li key={pt}>{pt}</li>
          ))}
        </ul>
        <ul className="pj-stack tilt-layer" style={depth(45)} aria-label="Tech stack">
          {p.stack.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
        {p.link && (
          <a className="pj-link tilt-layer" style={depth(70)} href={p.link.href} onClick={(e) => onLink(e, p.link!.href)}>
            {p.link.label}
            <span aria-hidden="true">→</span>
          </a>
        )}
      </div>
      <div className="pj-preview tilt-layer" style={depth(90)}>
        {p.id === "uem" ? <UemPreview /> : <PortfolioPreview />}
      </div>
    </TiltCard>
  );
}

export function Projects() {
  const ref = useGsap<HTMLElement>((_, root) => {
    const slots = root.querySelectorAll<HTMLElement>(".pj-slot");

    // Previews only animate while on screen (saves work off-screen, and on touch
    // devices this is what "plays" them since there's no hover).
    slots.forEach((slot) => {
      ScrollTrigger.create({
        trigger: slot,
        start: "top 85%",
        end: "bottom 15%",
        toggleClass: { targets: slot, className: "is-live" },
      });
    });

    const mm = gsap.matchMedia();
    mm.add(MQ.motion, () => {
      slots.forEach((slot, i) => {
        const dir = i % 2 ? 1 : -1;
        // Enter: card flips up out of the depth of the page, scrubbed by scroll.
        gsap.fromTo(
          slot,
          { rotationX: 48, rotationY: 18 * dir, z: -520, y: 180, opacity: 0 },
          {
            rotationX: 0,
            rotationY: 0,
            z: 0,
            y: 0,
            opacity: 1,
            ease: "power2.out",
            scrollTrigger: { trigger: slot, start: "top bottom", end: "top 40%", scrub: 0.8 },
          },
        );
        // Exit: it tips away and recedes as you move past.
        gsap.fromTo(
          slot,
          { rotationX: 0, z: 0, opacity: 1 },
          {
            rotationX: -22,
            z: -260,
            opacity: 0.25,
            ease: "none",
            immediateRender: false,
            scrollTrigger: { trigger: slot, start: "bottom 45%", end: "bottom top", scrub: 0.8 },
          },
        );
      });
    });
    return () => mm.revert();
  });

  return (
    <section id="projects" ref={ref} className="pj" data-section="projects" aria-labelledby="pj-title">
      <div className="pf-container">
        <SectionHeading index="03" eyebrow="Selected work" title="Things I've built" id="pj-title" />
        <div className="pj-list">
          {projects.map((p) => (
            <div key={p.id} className="pj-slot">
              <ProjectCard p={p} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
