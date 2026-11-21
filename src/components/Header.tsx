import { useEffect, useLayoutEffect, useRef, useState, type MouseEvent } from "react";
import { profile, sections, socials } from "../data/portfolio";
import { gsap, pauseScroll, prefersReducedMotion, REDUCED, scrollToHash, setMotionOverride } from "../lib/motion";

function MotionToggle() {
  return (
    <button
      type="button"
      className={`motion-toggle${REDUCED ? "" : " is-on"}`}
      aria-pressed={!REDUCED}
      title={REDUCED ? "Turn 3D animations on" : "Turn 3D animations off"}
      onClick={() => setMotionOverride(REDUCED ? "on" : "off")}
    >
      <span className="motion-toggle-track" aria-hidden="true">
        <span className="motion-toggle-knob" />
      </span>
      <span className="motion-toggle-label">3D</span>
    </button>
  );
}
import { SignatureLogo } from "./SignatureLogo";

const NAV = sections.filter((s) => s.id !== "home");

export function Header() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [active, setActive] = useState<string>("home");
  const headerRef = useRef<HTMLElement | null>(null);
  const progressRef = useRef<HTMLSpanElement | null>(null);
  const pillRef = useRef<HTMLSpanElement | null>(null);
  const navRef = useRef<HTMLUListElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const toggleRef = useRef<HTMLButtonElement | null>(null);

  // Scroll state: progress bar, glass background once scrolled, active section.
  // The header itself stays fixed and visible at all times.
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (progressRef.current) {
        progressRef.current.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
      }
      headerRef.current?.classList.toggle("is-scrolled", y > 30);
      const mid = window.innerHeight * 0.45;
      let current: string = sections[0].id;
      for (const s of sections) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top <= mid) current = s.id;
      }
      setActive((prev) => (prev === current ? prev : current));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // Slide the active pill under the current link.
  useLayoutEffect(() => {
    const pill = pillRef.current;
    const nav = navRef.current;
    if (!pill || !nav) return;
    const place = () => {
      const link = nav.querySelector<HTMLElement>(`a[href="#${active}"]`);
      if (!link) {
        pill.style.opacity = "0";
        return;
      }
      pill.style.opacity = "1";
      pill.style.width = `${link.offsetWidth}px`;
      pill.style.transform = `translateX(${link.offsetLeft}px)`;
    };
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [active]);

  // Mobile menu open/close choreography.
  useEffect(() => {
    const menu = menuRef.current;
    if (!menu) return;
    if (!isNavOpen) return;
    const root = document.documentElement;
    // Pauses the WebGL backdrop (it's fully covered) — see ParticleScene.
    root.classList.add("menu-open");
    // Lock scrolling WITHOUT toggling overflow on <html>: on phones that can
    // make the address bar re-appear, resizing the viewport and re-laying out
    // the page behind the menu (seen as the background "blinking").
    pauseScroll(true);
    const menuScrollable = () => menu.scrollHeight > menu.clientHeight + 1;
    const blockScroll = (e: Event) => {
      if (!menuScrollable()) e.preventDefault();
    };
    menu.addEventListener("touchmove", blockScroll, { passive: false });
    menu.addEventListener("wheel", blockScroll, { passive: false });
    // Keep keyboard focus inside the open menu — applied after the first
    // animation frame so the style recalc doesn't delay the opening.
    const behind = document.querySelectorAll<HTMLElement>(".pf-main, .ft, .site-nav");
    const inertRaf = requestAnimationFrame(() => behind.forEach((el) => (el.inert = true)));
    const links = menu.querySelectorAll<HTMLElement>(".mm-link");
    const reduce = prefersReducedMotion();
    const ctx = gsap.context(() => {
      if (!reduce) {
        gsap.fromTo(
          links,
          { rotationX: -90, y: 60, opacity: 0, transformOrigin: "50% 100%" },
          { rotationX: 0, y: 0, opacity: 1, duration: 0.8, ease: "expo.out", stagger: 0.06, delay: 0.15 },
        );
        gsap.fromTo(".mm-foot", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, delay: 0.5 });
      }
    }, menu);
    links[0]?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsNavOpen(false);
        toggleRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      menu.removeEventListener("touchmove", blockScroll);
      menu.removeEventListener("wheel", blockScroll);
      cancelAnimationFrame(inertRaf);
      behind.forEach((el) => (el.inert = false));
      root.classList.remove("menu-open");
      ctx.revert();
      pauseScroll(false);
    };
  }, [isNavOpen]);

  const go = (e: MouseEvent<HTMLAnchorElement>, hash: string) => {
    e.preventDefault();
    setIsNavOpen(false);
    // let the menu release scroll before travelling
    requestAnimationFrame(() => scrollToHash(hash));
  };

  return (
    <header ref={headerRef} className="site-header">
      <span className="site-progress" aria-hidden="true">
        <span ref={progressRef} />
      </span>
      <div className="pf-container site-header-inner">
        <SignatureLogo onClick={(e) => go(e, "#home")} />

        <nav className="site-nav" aria-label="Primary">
          <span ref={pillRef} className="site-nav-pill" aria-hidden="true" />
          <ul ref={navRef}>
            {NAV.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className={`site-nav-link${active === s.id ? " is-active" : ""}`}
                  aria-current={active === s.id ? "location" : undefined}
                  onClick={(e) => go(e, `#${s.id}`)}
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="site-header-tools">
        <MotionToggle />
        <button
          ref={toggleRef}
          className={`menu-toggle${isNavOpen ? " is-open" : ""}`}
          type="button"
          aria-controls="mobileMenu"
          aria-expanded={isNavOpen}
          aria-label={isNavOpen ? "Close navigation" : "Open navigation"}
          onClick={() => setIsNavOpen((prev) => !prev)}
        >
          <span />
          <span />
        </button>
        </div>
      </div>

      <div
        id="mobileMenu"
        ref={menuRef}
        className={`mobile-menu${isNavOpen ? " is-open" : ""}`}
        aria-hidden={!isNavOpen}
        inert={!isNavOpen}
      >
        <nav className="mm-nav" aria-label="Mobile">
          <ul className="mm-list">
            {sections.map((s, i) => (
              <li key={s.id} className="mm-item">
                <a
                  href={`#${s.id}`}
                  className={`mm-link${active === s.id ? " is-active" : ""}`}
                  aria-current={active === s.id ? "location" : undefined}
                  onClick={(e) => go(e, `#${s.id}`)}
                >
                  <span className="mm-index" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="mm-label">{s.label}</span>
                  <span className="mm-arrow" aria-hidden="true">
                    →
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mm-foot">
          <p className="mm-tagline">
            {profile.city} · {profile.role}
          </p>
          <ul className="mm-socials" aria-label="Social media links">
            {socials.map((s) => (
              <li key={s.label}>
                <a
                  className="orb-link"
                  href={s.href}
                  target={s.href.startsWith("mailto:") ? undefined : "_blank"}
                  rel="noopener noreferrer"
                  aria-label={s.label === "Email" ? "Send an email" : `Visit ${s.label} profile`}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d={s.path} />
                  </svg>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </header>
  );
}
