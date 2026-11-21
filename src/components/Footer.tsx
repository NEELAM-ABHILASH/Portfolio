import type { MouseEvent } from "react";
import { profile, sections, socials } from "../data/portfolio";
import { useGsap } from "../hooks/useGsap";
import { burst, gsap, MQ, scrollToHash } from "../lib/motion";
import { Magnetic } from "./fx/Magnetic";
import { SignatureLogo } from "./SignatureLogo";

export function Footer() {
  const ref = useGsap<HTMLElement>((_, root) => {
    const mm = gsap.matchMedia();
    mm.add(MQ.motion, () => {
      gsap.from(root.querySelectorAll(".ft-row > *"), {
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.08,
        scrollTrigger: { trigger: root, start: "top 90%", toggleActions: "play none none reverse" },
      });
      // The signature writes itself in, left to right, as the page ends.
      const sig = root.querySelector<HTMLElement>(".ft-signature");
      if (sig) {
        gsap
          .timeline({
            scrollTrigger: { trigger: sig, start: "top 95%", toggleActions: "play none none reverse" },
          })
          .fromTo(
            sig.querySelector(".signature-script"),
            { clipPath: "inset(-20% 100% -20% 0)" },
            { clipPath: "inset(-20% 0% -20% 0)", duration: 1.4, ease: "power2.inOut" },
          )
          .from(sig.querySelector(".signature-ring-wrap"), { opacity: 0, scale: 0.6, duration: 0.9 }, 0.2)
          .from(sig.querySelector(".signature-underline"), { scaleX: 0, transformOrigin: "0 50%", duration: 0.8 }, 0.7)
          .from(sig.querySelector(".signature-caps"), { opacity: 0, letterSpacing: "0.9em", duration: 0.8 }, 0.9);
      }
    });
    return () => mm.revert();
  });

  const toTop = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    burst(e.clientX, e.clientY);
    scrollToHash("#home");
  };
  const go = (e: MouseEvent<HTMLAnchorElement>, hash: string) => {
    e.preventDefault();
    scrollToHash(hash);
  };

  return (
    <footer ref={ref} className="ft">
      <div className="pf-container">
        <div className="ft-row">
          <nav className="ft-nav" aria-label="Footer">
            <ul>
              {sections.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} onClick={(e) => go(e, `#${s.id}`)}>
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <ul className="ft-socials" aria-label="Social media links">
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

          <Magnetic>
            <a className="ft-top" href="#home" onClick={toTop}>
              <span aria-hidden="true">↑</span> Back to top
            </a>
          </Magnetic>
        </div>

        <div className="ft-base">
          <div className="ft-signature">
            <SignatureLogo onClick={toTop} />
          </div>
          <span className="ft-copy">
            © {new Date().getFullYear()} {profile.firstName} {profile.lastName}
          </span>
        </div>
      </div>
    </footer>
  );
}
