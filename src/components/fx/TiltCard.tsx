import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { isFinePointer, prefersReducedMotion } from "../../lib/motion";

type Props = {
  children: ReactNode;
  className?: string;
  /** Maximum tilt in degrees. */
  max?: number;
  style?: CSSProperties;
};

/**
 * Pointer-driven 3D tilt with a moving glare. Writes CSS variables straight
 * to the element inside rAF, so hovering never re-renders React.
 * Children can opt into depth with `style={{"--depth": 40}}` + `.tilt-layer`.
 */
export function TiltCard({ children, className, max = 10, style }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !isFinePointer() || prefersReducedMotion()) return;
    let raf = 0;
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;
    let gx = 50;
    let gy = 50;
    let hovering = false;

    const loop = () => {
      cx += (tx - cx) * 0.12;
      cy += (ty - cy) * 0.12;
      el.style.setProperty("--rx", `${cy.toFixed(2)}deg`);
      el.style.setProperty("--ry", `${cx.toFixed(2)}deg`);
      el.style.setProperty("--gx", `${gx}%`);
      el.style.setProperty("--gy", `${gy}%`);
      if (hovering || Math.abs(cx) > 0.02 || Math.abs(cy) > 0.02) {
        raf = requestAnimationFrame(loop);
      } else {
        raf = 0;
      }
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(loop);
    };

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      tx = (px - 0.5) * 2 * max;
      ty = -(py - 0.5) * 2 * max;
      gx = Math.round(px * 100);
      gy = Math.round(py * 100);
      kick();
    };
    const onEnter = () => {
      hovering = true;
      el.classList.add("is-tilting");
      kick();
    };
    const onLeave = () => {
      hovering = false;
      tx = 0;
      ty = 0;
      el.classList.remove("is-tilting");
      kick();
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [max]);

  return (
    <div ref={ref} className={`tilt ${className ?? ""}`} style={style}>
      {children}
      <span className="tilt-glare" aria-hidden="true" />
    </div>
  );
}
