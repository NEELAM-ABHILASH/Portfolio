import { education } from "../data/portfolio";
import { useGsap } from "../hooks/useGsap";
import { gsap, MQ } from "../lib/motion";
import { FragmentReveal } from "./fx/FragmentReveal";
import { SectionHeading } from "./fx/SectionHeading";

function InitialsCube({ initials, level }: { initials: string; level: string }) {
  return (
    <div className="ed-cube-wrap" aria-hidden="true" data-frag-item>
      <div className="ed-cube">
        <span className="ed-face ed-face--front">{initials}</span>
        <span className="ed-face ed-face--back">{initials}</span>
        <span className="ed-face ed-face--right">{level.slice(0, 2).toUpperCase()}</span>
        <span className="ed-face ed-face--left">{"{ }"}</span>
        <span className="ed-face ed-face--top" />
        <span className="ed-face ed-face--bottom" />
      </div>
    </div>
  );
}

export function Education() {
  const ref = useGsap<HTMLElement>((_, root) => {
    const mm = gsap.matchMedia();
    mm.add(MQ.motion, () => {
      root.querySelectorAll<HTMLElement>(".ed-slot").forEach((slot, i) => {
        const dir = i % 2 ? 1 : -1;
        gsap.fromTo(
          slot,
          { rotationY: 38 * dir, x: 140 * dir, z: -260 },
          {
            rotationY: 0,
            x: 0,
            z: 0,
            ease: "power2.out",
            scrollTrigger: { trigger: slot, start: "top bottom", end: "top 50%", scrub: 0.8 },
          },
        );
      });
      gsap.fromTo(
        root.querySelector(".ed-path-fill"),
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: { trigger: root.querySelector(".ed-track"), start: "top 75%", end: "bottom 60%", scrub: 0.4 },
        },
      );
    });
    return () => mm.revert();
  });

  return (
    <section id="education" ref={ref} className="ed" data-section="education" aria-labelledby="ed-title">
      <div className="pf-container">
        <SectionHeading index="05" eyebrow="Education" title="Foundations" id="ed-title" />

        <div className="ed-track">
          <span className="ed-path" aria-hidden="true">
            <span className="ed-path-fill" />
          </span>
          <ol className="ed-list">
          {education.map((e) => (
            <li key={e.degree} className="ed-slot">
              <FragmentReveal className="ed-card" skinClassName="skin-warm" cols={6} rows={4}>
                <InitialsCube initials={e.initials} level={e.level} />
                <div className="ed-body">
                  <span className="ed-level" data-frag-item>
                    {e.level}
                  </span>
                  <h3 className="ed-degree" data-frag-item>
                    {e.degree}
                  </h3>
                  <p className="ed-institution" data-frag-item>
                    {e.institution} &mdash; {e.location}
                  </p>
                  <p className="ed-description" data-frag-item>
                    {e.description}
                  </p>
                </div>
              </FragmentReveal>
            </li>
          ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
