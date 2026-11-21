import { experience } from "../data/portfolio";
import { useGsap } from "../hooks/useGsap";
import { gsap, MQ, rand } from "../lib/motion";
import { FragmentReveal } from "./fx/FragmentReveal";
import { SectionHeading } from "./fx/SectionHeading";

export function WorkExperience() {
  const ref = useGsap<HTMLElement>((_, root) => {
    const $ = (sel: string) => root.querySelector<HTMLElement>(sel);
    const $$ = (sel: string) => root.querySelectorAll<HTMLElement>(sel);
    const mm = gsap.matchMedia();
    mm.add(MQ.motion, () => {
      // The timeline beam charges as you read down the role.
      gsap.fromTo(
        $$(".xp-beam-fill"),
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: { trigger: $(".xp-timeline"), start: "top 70%", end: "bottom 60%", scrub: 0.4 },
        },
      );
      gsap.from($$(".xp-node"), {
        scale: 0,
        duration: 0.8,
        ease: "back.out(3)",
        scrollTrigger: { trigger: $(".xp-timeline"), start: "top 80%", toggleActions: "play none none reverse" },
      });

      // Highlight panels swing open like doors in 3D.
      gsap.fromTo(
        $$(".xp-highlight"),
        { rotationY: -95, opacity: 0, transformOrigin: "0% 50%", z: -80 },
        {
          rotationY: 0,
          opacity: 1,
          z: 0,
          duration: 1.1,
          ease: "expo.out",
          stagger: 0.12,
          scrollTrigger: { trigger: $(".xp-highlights"), start: "top 85%", toggleActions: "play none none reverse" },
        },
      );

      // Skill tags are thrown in from all directions and land in place.
      gsap.fromTo(
        $$(".xp-tag"),
        {
          x: () => rand(-160, 160),
          y: () => rand(-80, 120),
          z: () => rand(-300, 200),
          rotation: () => rand(-60, 60),
          rotationX: () => rand(-90, 90),
          opacity: 0,
          scale: 0.4,
        },
        {
          x: 0,
          y: 0,
          z: 0,
          rotation: 0,
          rotationX: 0,
          opacity: 1,
          scale: 1,
          duration: 1,
          ease: "expo.out",
          stagger: { amount: 0.4, from: "random" },
          scrollTrigger: { trigger: $(".xp-skills"), start: "top 88%", toggleActions: "play none none reverse" },
        },
      );
    });
    return () => mm.revert();
  });

  return (
    <section id="experience" ref={ref} className="xp" data-section="experience" aria-labelledby="xp-title">
      <div className="pf-container">
        <SectionHeading index="02" eyebrow="Work experience" title="Where I build" id="xp-title" />

        <div className="xp-grid">
          <div className="xp-timeline">
            <div className="xp-beam" aria-hidden="true">
              <span className="xp-beam-fill" />
            </div>
            <span className="xp-node" aria-hidden="true" />

            <FragmentReveal className="xp-card" skinClassName="skin-glass" cols={7} rows={5}>
              <div className="xp-card-head" data-frag-item>
                <h3 className="xp-role">{experience.role}</h3>
                <span className="xp-badge">{experience.duration}</span>
              </div>
              <p className="xp-company" data-frag-item>
                {experience.company} &mdash; {experience.location}
              </p>
              <p className="xp-body" data-frag-item>
                Built and maintained a <strong>Unified Endpoint Management (UEM)</strong> platform,
                delivering scalable device management across Android, iOS, macOS, Linux, and ChromeOS.
              </p>
              <p className="xp-body" data-frag-item>
                Led features including <strong>device enrollment, policy management,</strong> and{" "}
                <strong>role-based access control</strong>. Integrated REST APIs, managed state with Redux /
                Context API, and implemented RSA-based encryption for secure data flows.
              </p>
              <p className="xp-body xp-body--last" data-frag-item>
                Focused on clean, maintainable code, performance improvements, and effective collaboration
                with cross-functional teams. Currently expanding expertise in full-stack and mobile
                application development.
              </p>
            </FragmentReveal>
          </div>

          <aside className="xp-aside" aria-label="Highlights and core skills">
            <ul className="xp-highlights">
              {experience.highlights.map((h, i) => (
                <li key={h.label} className="xp-highlight">
                  <span className="xp-hex" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>
                    <span className="xp-highlight-label">{h.label}</span>
                    <span className="xp-highlight-sub">{h.sub}</span>
                  </span>
                </li>
              ))}
            </ul>

            <div className="xp-skills">
              <h3 className="xp-skills-heading">Core Skills</h3>
              <ul className="xp-tags">
                {experience.coreSkills.map((s) => (
                  <li key={s} className="xp-tag">
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
