import type { MouseEvent } from "react";
import { profile, socials } from "../data/portfolio";
import { useGsap } from "../hooks/useGsap";
import { burst, gsap, isFinePointer, MQ, onIntro, rand, scrollToHash } from "../lib/motion";
import { FragmentReveal } from "./fx/FragmentReveal";
import { Magnetic } from "./fx/Magnetic";
import { SplitText } from "./fx/SplitText";
import { TiltCard } from "./fx/TiltCard";
import { ProfileAvatar } from "./ProfileAvatar";
import { TypingRole } from "./TypingRole";
import { dissolveText } from "./fx/textParticles";

function AccentRing() {
  return (
    <svg className="hero-ring" viewBox="0 0 200 72" fill="none" aria-hidden="true">
      <ellipse
        cx="100"
        cy="38"
        rx="92"
        ry="28"
        stroke="url(#heroRingGrad)"
        strokeWidth="2.25"
        strokeLinecap="round"
        transform="rotate(-2 100 38)"
        pathLength={1}
      />
      <defs>
        <linearGradient id="heroRingGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#c084fc" />
          <stop offset="100%" stopColor="#60a5fa" />
        </linearGradient>
      </defs>
    </svg>
  );
}

const jump = (e: MouseEvent<HTMLAnchorElement>, hash: string) => {
  e.preventDefault();
  burst(e.clientX, e.clientY);
  scrollToHash(hash);
};

export function Hero() {
  const ref = useGsap<HTMLElement>((_, root) => {
    const mm = gsap.matchMedia();
    mm.add(MQ.motion, () => {
      const chars = root.querySelectorAll<HTMLElement>(".hero-name .sp-c");
      const ring = root.querySelector<SVGEllipseElement>(".hero-ring ellipse");
      const socialsEls = root.querySelectorAll<HTMLElement>(".hero-socials li");
      // Every text-bearing element on the first screen takes part in the dissolve.
      const textEls = Array.from(root.querySelectorAll<HTMLElement>("[data-ptext]"));
      let ready = false;
      let cancelDissolve = () => {};
      let dissolveTimer = 0;

      gsap.set(socialsEls, { scale: 0, rotation: -120, opacity: 0 });
      if (ring) gsap.set(ring, { strokeDasharray: 1, strokeDashoffset: 1 });

      const off = onIntro(() => {
        // Social orbs pop in while the loader's panels open…
        gsap.to(socialsEls, {
          scale: 1,
          rotation: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.07,
          ease: "back.out(2)",
          delay: 0.6,
        });
        // …then, once the text is on screen, it breaks into particles and realigns.
        dissolveTimer = window.setTimeout(() => {
          document.fonts.ready.then(() => {
            cancelDissolve = dissolveText(textEls, () => {
              ready = true;
              if (ring) gsap.to(ring, { strokeDashoffset: 0, duration: 1.2, ease: "power2.inOut" });
            });
          });
        }, 1400);
      });

      // Pointer wave over the name: glyphs near the cursor lift toward you.
      const name = root.querySelector<HTMLElement>(".hero-name");
      const onMove = (e: PointerEvent) => {
        if (!ready) return;
        chars.forEach((c) => {
          const r = c.getBoundingClientRect();
          const dx = e.clientX - (r.left + r.width / 2);
          const dy = e.clientY - (r.top + r.height / 2);
          const d = Math.hypot(dx, dy);
          const f = Math.max(0, 1 - d / 180);
          gsap.to(c, {
            z: f * 90,
            y: -f * 14,
            rotationY: (dx / 180) * -25 * f,
            rotationX: (dy / 180) * 25 * f,
            color: f > 0.55 ? "#e9d5ff" : "",
            duration: 0.5,
            overwrite: "auto",
          });
        });
      };
      const onLeave = () => {
        if (!ready) return;
        gsap.to(chars, { z: 0, y: 0, rotationX: 0, rotationY: 0, color: "", duration: 0.8, ease: "elastic.out(1, 0.5)" });
      };
      // Click: the name shatters into fragments and pulls itself back together.
      const onClick = (e: globalThis.MouseEvent) => {
        if (!ready) return;
        ready = false;
        burst(e.clientX, e.clientY, 22);
        gsap
          .timeline({ onComplete: () => (ready = true) })
          .to(chars, {
            x: () => rand(-260, 260),
            y: () => rand(-180, 180),
            z: () => rand(-200, 600),
            rotationX: () => rand(-360, 360),
            rotationY: () => rand(-360, 360),
            opacity: 0.25,
            duration: 0.6,
            ease: "power3.out",
            stagger: { amount: 0.12, from: "random" },
          })
          .to(chars, {
            x: 0,
            y: 0,
            z: 0,
            rotationX: 0,
            rotationY: 0,
            opacity: 1,
            color: "",
            duration: 1.2,
            ease: "expo.inOut",
            stagger: { amount: 0.3, from: "edges" },
          });
      };
      if (name && isFinePointer()) {
        name.addEventListener("pointermove", onMove);
        name.addEventListener("pointerleave", onLeave);
      }
      name?.addEventListener("click", onClick);

      // Exit: the hero recedes into depth as the next section arrives.
      gsap
        .timeline({
          scrollTrigger: { trigger: root, start: "top top", end: "bottom top", scrub: 0.6 },
        })
        .to(root.querySelector(".hero-copy"), { y: -140, z: -260, rotationX: 16, opacity: 0, ease: "none" }, 0)
        .to(root.querySelector(".hero-visual"), { y: -80, z: -420, rotationY: -28, opacity: 0, ease: "none" }, 0)
        .to(root.querySelector(".hero-scroll"), { opacity: 0, ease: "none", duration: 0.2 }, 0);

      return () => {
        off();
        window.clearTimeout(dissolveTimer);
        cancelDissolve();
        name?.removeEventListener("pointermove", onMove);
        name?.removeEventListener("pointerleave", onLeave);
        name?.removeEventListener("click", onClick);
      };
    });
    return () => mm.revert();
  });

  return (
    <section id="home" ref={ref} className="hero" data-section="home">
      <div className="pf-container hero-grid">
        <div className="hero-copy">
          <p className="hero-chip">
            <span className="hero-chip-dot" aria-hidden="true" />
            <span data-ptext>
              {profile.city} · {profile.role}
            </span>
          </p>
          <p className="hero-hello" data-ptext>
            {profile.greeting}
          </p>
          <h1 className="hero-name" data-ptext>
            <SplitText className="hero-name-line" text={profile.firstName} />
            <SplitText className="hero-name-line hero-name-line--outline" text={profile.lastName} />
          </h1>

          <div className="hero-role" data-ptext>
            <TypingRole />
          </div>

          <div className="hero-statement">
            <p className="hero-prefix" data-ptext>
              {profile.headlinePrefix}
            </p>
            <p className="hero-headline" data-ptext>
              <span className="hl-line">
                <span className="hl-word">Pragmatic</span> <span className="hl-word">engineering,</span>
              </span>{" "}
              <span className="hl-line">
                <span className="hl-word">interfaces</span> <span className="hl-word">people</span>{" "}
                <span className="hl-word hl-trust">
                  <AccentRing />
                  trust
                </span>
                <span className="hl-word">.</span>
              </span>
            </p>
          </div>

          <p className="hero-sub" data-ptext>
            {profile.headlineSub}
          </p>

          <p className="hero-employment" data-ptext>
            Currently, I&apos;m a {profile.role} at{" "}
            <span className="hero-company">{profile.company}</span>, {profile.city}.
          </p>

          <div className="hero-actions">
            <Magnetic>
              <a className="btn-3d btn-3d--primary" href="#projects" onClick={(e) => jump(e, "#projects")}>
                <span className="btn-3d-face" data-ptext>
                  View my work
                </span>
                <span className="btn-3d-shine" aria-hidden="true" />
              </a>
            </Magnetic>
            <Magnetic>
              <a className="btn-3d" href="#contact" onClick={(e) => jump(e, "#contact")}>
                <span className="btn-3d-face" data-ptext>
                  Let&apos;s connect
                </span>
              </a>
            </Magnetic>
          </div>

          <ul className="hero-socials" aria-label="Social media links">
            {socials.map((s) => (
              <li key={s.label}>
                <Magnetic strength={0.5}>
                  <a
                    className="orb-link"
                    href={s.href}
                    target={s.href.startsWith("mailto:") ? undefined : "_blank"}
                    rel="noopener noreferrer"
                    aria-label={s.label === "Email" ? "Send an email" : `Visit ${s.label} profile`}
                    onPointerDown={(e) => burst(e.clientX, e.clientY, 12)}
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d={s.path} />
                    </svg>
                  </a>
                </Magnetic>
              </li>
            ))}
          </ul>
        </div>

        <div className="hero-visual">
          <TiltCard className="hero-portrait" max={12}>
            <FragmentReveal mode="intro" delay={0.5} cols={5} rows={6} className="hero-portrait-card" skinClassName="skin-portrait">
              <ProfileAvatar />
            </FragmentReveal>
          </TiltCard>
        </div>
      </div>

      <a className="hero-scroll" href="#about" onClick={(e) => jump(e, "#about")} aria-label="Scroll to About">
        <span className="hero-scroll-mouse" aria-hidden="true">
          <span />
        </span>
        <span className="hero-scroll-label">Scroll to explore</span>
      </a>
    </section>
  );
}
