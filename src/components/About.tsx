import { profile, stats } from "../data/portfolio";
import { useGsap } from "../hooks/useGsap";
import { gsap, MQ } from "../lib/motion";
import { SectionHeading } from "./fx/SectionHeading";
import { TiltCard } from "./fx/TiltCard";

const STATEMENT = `${profile.about} ${profile.headlineSub}`;

export function About() {
  const ref = useGsap<HTMLElement>((_, root) => {
    const mm = gsap.matchMedia();
    const words = root.querySelectorAll<HTMLElement>(".about-statement .aw");
    const chips = root.querySelectorAll<HTMLElement>(".about-chips li");
    const stage = root.querySelector<HTMLElement>(".about-stage");

    // Desktop: the statement pins while each word lights up in turn.
    mm.add(`${MQ.motion} and ${MQ.desktop}`, () => {
      gsap
        .timeline({
          scrollTrigger: {
            trigger: stage,
            start: "center 52%",
            end: "+=110%",
            pin: true,
            scrub: 0.6,
            anticipatePin: 1,
          },
        })
        .fromTo(words, { opacity: 0.12, z: -40, rotationX: 40 }, { opacity: 1, z: 0, rotationX: 0, stagger: 0.12, ease: "none" })
        .fromTo(
          chips,
          { opacity: 0, y: 40, rotationY: -70, z: -120 },
          { opacity: 1, y: 0, rotationY: 0, z: 0, stagger: 0.25, ease: "power2.out" },
          ">-0.6",
        );
    });

    // Small screens: same illumination, driven by scroll without pinning.
    mm.add(`${MQ.motion} and (max-width: 991.98px)`, () => {
      gsap.fromTo(
        words,
        { opacity: 0.15 },
        {
          opacity: 1,
          stagger: 0.1,
          ease: "none",
          scrollTrigger: { trigger: stage, start: "top 80%", end: "bottom 55%", scrub: 0.5 },
        },
      );
      gsap.from(chips, {
        opacity: 0,
        y: 24,
        stagger: 0.08,
        scrollTrigger: { trigger: root.querySelector(".about-chips"), start: "top 90%" },
      });
    });

    // Stat monoliths rise out of the floor, counters roll.
    mm.add(MQ.motion, () => {
      const tiles = root.querySelectorAll<HTMLElement>(".stat-slot");
      gsap.fromTo(
        tiles,
        { opacity: 0, y: 120, z: -300, rotationX: 55 },
        {
          opacity: 1,
          y: 0,
          z: 0,
          rotationX: 0,
          duration: 1.3,
          ease: "expo.out",
          stagger: 0.14,
          scrollTrigger: {
            trigger: root.querySelector(".about-stats"),
            start: "top 88%",
            toggleActions: "play none none reverse",
          },
        },
      );
      root.querySelectorAll<HTMLElement>("[data-count]").forEach((el) => {
        const target = Number(el.dataset.count);
        const o = { v: 0 };
        gsap.to(o, {
          v: target,
          duration: 1.6,
          ease: "power3.out",
          onUpdate: () => (el.textContent = String(Math.round(o.v))),
          scrollTrigger: { trigger: el, start: "top 92%", toggleActions: "play none none reset" },
        });
      });
    });
    return () => mm.revert();
  });

  return (
    <section id="about" ref={ref} className="about" data-section="about" aria-labelledby="about-title">
      <div className="pf-container">
        <SectionHeading index="01" eyebrow="About me" title="Meaningful, dependable products" id="about-title" />

        <div className="about-stage">
          <p className="about-statement">
            {STATEMENT.split(" ").map((w, i) => (
              <span key={i} className="aw">
                {w}{" "}
              </span>
            ))}
          </p>
          <ul className="about-chips" aria-label="Quick facts">
            <li>
              <span className="chip-k">Based in</span> {profile.city}
            </li>
            <li>
              <span className="chip-k">Working at</span> {profile.company}
            </li>
            <li>
              <span className="chip-k">Focus</span> Performance · Accessibility · Maintainability
            </li>
          </ul>
        </div>

        <div className="about-stats">
          {stats.map((s) => (
            <div key={s.label} className="stat-slot">
            <TiltCard className="stat" max={14}>
              <span className="stat-value tilt-layer">
                {s.value !== undefined ? (
                  <>
                    <span data-count={s.value}>{s.value}</span>
                    {s.suffix}
                  </>
                ) : (
                  s.text
                )}
              </span>
              <span className="stat-label tilt-layer">{s.label}</span>
              <span className="stat-sub tilt-layer">{s.sub}</span>
            </TiltCard>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
