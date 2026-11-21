import { useEffect, useRef } from "react";
import { gsap, isFinePointer, prefersReducedMotion } from "../lib/motion";

const INTERACTIVE = "a, button, input, textarea, select, label, [role='button'], .hero-name, .sk-stage";

/** A soft ring that trails the pointer and swells over interactive things. Mouse only. */
export function CursorAura() {
  const ring = useRef<HTMLDivElement | null>(null);
  const dot = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const r = ring.current;
    const d = dot.current;
    if (!r || !d || !isFinePointer() || prefersReducedMotion()) return;
    document.documentElement.classList.add("has-aura");
    const rx = gsap.quickTo(r, "x", { duration: 0.45, ease: "power3.out" });
    const ry = gsap.quickTo(r, "y", { duration: 0.45, ease: "power3.out" });
    const dx = gsap.quickTo(d, "x", { duration: 0.08 });
    const dy = gsap.quickTo(d, "y", { duration: 0.08 });
    const onMove = (e: PointerEvent) => {
      rx(e.clientX);
      ry(e.clientY);
      dx(e.clientX);
      dy(e.clientY);
      r.classList.add("is-on");
      d.classList.add("is-on");
      const t = e.target as Element | null;
      const hot = !!t?.closest?.(INTERACTIVE);
      r.classList.toggle("is-hot", hot);
    };
    const onLeave = () => {
      r.classList.remove("is-on");
      d.classList.remove("is-on");
    };
    const onDown = () => r.classList.add("is-down");
    const onUp = () => r.classList.remove("is-down");
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    return () => {
      document.documentElement.classList.remove("has-aura");
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  return (
    <>
      <div ref={ring} className="aura-ring" aria-hidden="true" />
      <div ref={dot} className="aura-dot" aria-hidden="true" />
    </>
  );
}
