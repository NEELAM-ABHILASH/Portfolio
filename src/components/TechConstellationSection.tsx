import { Fragment, useEffect, useRef, useState } from "react";
import { iconSrc, practices, skillGroups, tech, type SkillGroupId } from "../data/portfolio";
import { useGsap } from "../hooks/useGsap";
import { gsap, isFinePointer, MQ, prefersReducedMotion } from "../lib/motion";
import { SectionHeading } from "./fx/SectionHeading";

type Filter = SkillGroupId | "all";

const PITCH =
  "I'm currently looking to join a cross-functional team that ships clean, scalable code and builds products developers are proud of".split(
    " ",
  );

/** Evenly spread points on a unit sphere (Fibonacci lattice). */
function fibonacci(n: number) {
  const pts: [number, number, number][] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const th = golden * i;
    pts.push([Math.cos(th) * r, y, Math.sin(th) * r]);
  }
  return pts;
}

function OrbGlyph() {
  return (
    <svg className="sk-core-glyph" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path
        d="M14 12 L28 24 L14 36 L18 24 L14 12 M28 12 L34 18 L28 24 M22 30 L34 36"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    </svg>
  );
}

/**
 * Technical skills as a living 3D sphere: drag (or move the pointer) to spin
 * it, pick a group to pull those technologies forward. Positions are
 * projected in JS each frame and written straight to the DOM.
 */
export function TechConstellationSection() {
  const [filter, setFilter] = useState<Filter>("all");
  const filterRef = useRef<Filter>("all");
  const stageRef = useRef<HTMLDivElement | null>(null);
  const spread = useRef({ v: prefersReducedMotion() ? 1 : 0 });

  useEffect(() => {
    filterRef.current = filter;
  }, [filter]);

  // Sphere simulation.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const items = Array.from(stage.querySelectorAll<HTMLElement>(".sk-item"));
    const base = fibonacci(items.length);
    const boost = items.map(() => 1);
    const reduce = prefersReducedMotion();
    let rotX = -0.25;
    let rotY = 0.4;
    let vx = 0;
    let vy = reduce ? 0 : 0.004;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let hoverX = 0;
    let hoverY = 0;
    let hovering = false;
    let raf = 0;
    let visible = false;

    const frame = () => {
      const R = Math.min(stage.clientWidth, 560) * 0.36;
      if (!dragging && !reduce) {
        const tvy = hovering ? hoverX * 0.012 : 0.0035;
        const tvx = hovering ? -hoverY * 0.008 : 0;
        vy += (tvy - vy) * 0.04;
        vx += (tvx - vx) * 0.04;
      }
      rotY += vy;
      rotX = Math.max(-1.1, Math.min(1.1, rotX + vx));
      const cy = Math.cos(rotY);
      const sy = Math.sin(rotY);
      const cx = Math.cos(rotX);
      const sx = Math.sin(rotX);
      const f = filterRef.current;
      const s0 = spread.current.v;
      items.forEach((el, i) => {
        const inGroup = f === "all" || el.dataset.group === f;
        boost[i] += ((inGroup ? (f === "all" ? 1 : 1.12) : 0.55) - boost[i]) * 0.1;
        const [bx, by, bz] = base[i];
        // rotate around Y then X
        const x1 = bx * cy + bz * sy;
        const z1 = -bx * sy + bz * cy;
        const y2 = by * cx - z1 * sx;
        const z2 = by * sx + z1 * cx;
        const r = R * boost[i] * s0;
        const x = x1 * r;
        const y = y2 * r;
        const z = z2 * r;
        const P = R * 2.6 || 1;
        const s = P / (P - z);
        const depthN = (z2 + 1) / 2; // 0 back … 1 front
        el.style.transform = `translate3d(${(x * s).toFixed(1)}px, ${(y * s).toFixed(1)}px, 0) scale(${(
          s *
          (inGroup ? 1 : 0.8)
        ).toFixed(3)})`;
        el.style.opacity = String(((0.25 + depthN * 0.75) * (inGroup ? 1 : 0.35) * Math.min(1, s0 * 1.4)).toFixed(3));
        el.style.zIndex = String(Math.round(depthN * 100));
        el.classList.toggle("is-front", depthN > 0.62 && inGroup);
      });
      if (visible && !reduce) raf = requestAnimationFrame(frame);
      else raf = 0;
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(frame);
    });
    io.observe(stage);
    frame();

    const onDown = (e: PointerEvent) => {
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      stage.setPointerCapture(e.pointerId);
      stage.classList.add("is-dragging");
    };
    const onMove = (e: PointerEvent) => {
      const r = stage.getBoundingClientRect();
      hoverX = ((e.clientX - r.left) / r.width) * 2 - 1;
      hoverY = ((e.clientY - r.top) / r.height) * 2 - 1;
      if (!dragging) return;
      vy = (e.clientX - lastX) * 0.004;
      vx = -(e.clientY - lastY) * 0.003;
      lastX = e.clientX;
      lastY = e.clientY;
      if (reduce) frame();
    };
    const onUp = (e: PointerEvent) => {
      dragging = false;
      stage.classList.remove("is-dragging");
      if (stage.hasPointerCapture(e.pointerId)) stage.releasePointerCapture(e.pointerId);
    };
    const onEnter = () => (hovering = isFinePointer());
    const onLeave = () => (hovering = false);
    stage.addEventListener("pointerdown", onDown);
    stage.addEventListener("pointermove", onMove);
    stage.addEventListener("pointerup", onUp);
    stage.addEventListener("pointercancel", onUp);
    stage.addEventListener("pointerenter", onEnter);
    stage.addEventListener("pointerleave", onLeave);
    window.addEventListener("resize", frame);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      stage.removeEventListener("pointerdown", onDown);
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerup", onUp);
      stage.removeEventListener("pointercancel", onUp);
      stage.removeEventListener("pointerenter", onEnter);
      stage.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", frame);
    };
  }, []);

  // In reduced-motion mode re-project once when the filter changes.
  useEffect(() => {
    if (prefersReducedMotion()) window.dispatchEvent(new Event("resize"));
  }, [filter]);

  const ref = useGsap<HTMLElement>((_, root) => {
    const mm = gsap.matchMedia();
    mm.add(MQ.motion, () => {
      const stage = root.querySelector<HTMLElement>(".sk-stage");
      // The sphere condenses out of a single point when it scrolls into view.
      gsap.fromTo(
        spread.current,
        { v: 0 },
        {
          v: 1,
          duration: 1.8,
          ease: "expo.out",
          scrollTrigger: { trigger: stage, start: "top 80%", toggleActions: "play none none reverse" },
        },
      );
      gsap.from(root.querySelectorAll(".sk-core, .sk-ring"), {
        scale: 0,
        opacity: 0,
        duration: 1.2,
        ease: "back.out(1.6)",
        stagger: 0.1,
        scrollTrigger: { trigger: stage, start: "top 80%", toggleActions: "play none none reverse" },
      });
      gsap.from(root.querySelectorAll(".sk-pitch .sp-w"), {
        yPercent: 100,
        rotationX: -70,
        opacity: 0,
        duration: 0.9,
        ease: "expo.out",
        stagger: 0.04,
        scrollTrigger: { trigger: root.querySelector(".sk-pitch"), start: "top 88%", toggleActions: "play none none reverse" },
      });
      gsap.from(root.querySelectorAll(".sk-filter, .sk-practice"), {
        y: 30,
        opacity: 0,
        rotationX: -50,
        duration: 0.8,
        stagger: 0.05,
        scrollTrigger: { trigger: root.querySelector(".sk-controls"), start: "top 92%", toggleActions: "play none none reverse" },
      });
    });
    return () => mm.revert();
  });

  const activeGroup = skillGroups.find((g) => g.id === filter);

  return (
    <section id="skills" ref={ref} className="sk" data-section="skills" aria-labelledby="sk-title">
      <div className="pf-container">
        <SectionHeading index="04" eyebrow="Technical skills" title="My toolkit, in orbit" id="sk-title" />

        <p className="sk-pitch">
          {PITCH.map((w, i) => (
            <Fragment key={i}>
              <span className={`sp-w${w === "cross-functional" ? " sk-gradient" : ""}`}>{w}</span>
              {i < PITCH.length - 1 ? " " : null}
            </Fragment>
          ))}
        </p>

        <div className="sk-layout">
          <div ref={stageRef} className="sk-stage" role="img" aria-label="Interactive sphere of technologies. Drag to rotate.">
            <span className="sk-ring sk-ring--a" aria-hidden="true" />
            <span className="sk-ring sk-ring--b" aria-hidden="true" />
            <span className="sk-ring sk-ring--c" aria-hidden="true" />
            <div className="sk-core" aria-hidden="true">
              <OrbGlyph />
            </div>
            <ul className="sk-items" aria-hidden="true">
              {tech.map((t) => (
                <li key={t.slug} className="sk-item" data-group={t.group}>
                  <span className="sk-icon">
                    <img src={iconSrc(t.slug)} alt="" width={40} height={40} loading="lazy" decoding="async" draggable={false} />
                  </span>
                  <span className="sk-label">{t.label}</span>
                </li>
              ))}
            </ul>
            <span className="sk-hint" aria-hidden="true">
              Drag to spin
            </span>
          </div>

          <div className="sk-controls">
            <div className="sk-filters" role="group" aria-label="Filter skills by area">
              <button
                type="button"
                className={`sk-filter${filter === "all" ? " is-active" : ""}`}
                aria-pressed={filter === "all"}
                onClick={() => setFilter("all")}
              >
                All
                <span className="sk-count">{tech.length}</span>
              </button>
              {skillGroups.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  className={`sk-filter${filter === g.id ? " is-active" : ""}`}
                  aria-pressed={filter === g.id}
                  onClick={() => setFilter(g.id)}
                >
                  {g.title}
                  <span className="sk-count">{tech.filter((t) => t.group === g.id).length}</span>
                </button>
              ))}
            </div>

            <div className="sk-detail" aria-live="polite">
              <p className="sk-blurb">
                {activeGroup ? activeGroup.blurb : "Everything I reach for, across the stack."}
              </p>
              <ul className="sk-list">
                {tech
                  .filter((t) => filter === "all" || t.group === filter)
                  .map((t) => (
                    <li key={t.slug}>
                      <img src={iconSrc(t.slug)} alt="" width={18} height={18} loading="lazy" />
                      {t.label}
                    </li>
                  ))}
              </ul>
            </div>

            <div className="sk-practices">
              <h3 className="sk-practices-title">Practices</h3>
              <ul>
                {practices.map((p) => (
                  <li key={p} className="sk-practice">
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
