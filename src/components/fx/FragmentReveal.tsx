import { useMemo, type CSSProperties, type ReactNode } from "react";
import { useGsap } from "../../hooks/useGsap";
import { gsap, MQ, onIntro, rand, ScrollTrigger } from "../../lib/motion";

type Props = {
  children: ReactNode;
  className?: string;
  /** Extra class for the card "skin" (background, border, glow). */
  skinClassName?: string;
  cols?: number;
  rows?: number;
  /** "scroll": assemble when scrolled into view. "intro": assemble on the intro cue. */
  mode?: "scroll" | "intro";
  delay?: number;
  style?: CSSProperties;
};

/**
 * A card that arrives as a cloud of 3D shards, snaps together into its
 * surface, and then lets its content rise in. Scrolling back above it
 * shatters it again. Without motion it is just a normal card.
 *
 * Children marked with `data-frag-item` are staggered in after assembly.
 */
export function FragmentReveal({
  children,
  className,
  skinClassName,
  cols = 6,
  rows = 4,
  mode = "scroll",
  delay = 0,
  style,
}: Props) {
  const shards = useMemo(() => {
    const out: CSSProperties[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        out.push({
          left: `${(c * 100) / cols}%`,
          top: `${(r * 100) / rows}%`,
          width: `calc(${100 / cols}% + 1px)`,
          height: `calc(${100 / rows}% + 1px)`,
          backgroundSize: `${cols * 100}% ${rows * 100}%`,
          backgroundPosition: `${cols > 1 ? (c / (cols - 1)) * 100 : 0}% ${
            rows > 1 ? (r / (rows - 1)) * 100 : 0
          }%`,
        });
      }
    }
    return out;
  }, [cols, rows]);

  const ref = useGsap<HTMLDivElement>((_, root) => {
    const mm = gsap.matchMedia();
    mm.add(MQ.motion, () => {
      const shardEls = root.querySelectorAll<HTMLElement>(":scope > .frag-shards > .frag-shard");
      const skin = root.querySelector<HTMLElement>(":scope > .frag-skin");
      const content = root.querySelector<HTMLElement>(":scope > .frag-content");
      const items = root.querySelectorAll<HTMLElement>(":scope > .frag-content [data-frag-item]");

      const tl = gsap.timeline({ paused: true, delay });
      tl.fromTo(
        shardEls,
        {
          x: () => rand(-280, 280),
          y: () => rand(-200, 200),
          z: () => rand(-520, 320),
          rotationX: () => rand(-200, 200),
          rotationY: () => rand(-200, 200),
          rotationZ: () => rand(-90, 90),
          scale: () => rand(0.15, 0.6),
          opacity: 0,
        },
        {
          x: 0,
          y: 0,
          z: 0,
          rotationX: 0,
          rotationY: 0,
          rotationZ: 0,
          scale: 1,
          opacity: 1,
          duration: 1.15,
          ease: "expo.out",
          stagger: { amount: 0.5, from: "random" },
        },
      )
        .fromTo(skin, { opacity: 0 }, { opacity: 1, duration: 0.45, ease: "power2.out" }, "-=0.45")
        .to(shardEls, { opacity: 0, duration: 0.5, stagger: { amount: 0.25, from: "center" } }, "<")
        // opacity (not visibility) so the text stays in the accessibility tree
        .fromTo(content, { opacity: 0 }, { opacity: 1, duration: 0.01 }, "<-0.1");
      if (items.length) {
        tl.fromTo(
          items,
          { y: 28, opacity: 0, rotationX: -30, transformOrigin: "50% 100%" },
          {
            y: 0,
            opacity: 1,
            rotationX: 0,
            duration: 0.8,
            stagger: 0.07,
            ease: "power3.out",
            // hand transforms back to CSS (tilt depth layers rely on it)
            clearProps: "transform",
          },
          "<",
        );
      }

      if (mode === "intro") {
        return onIntro(() => tl.play());
      }
      ScrollTrigger.create({
        trigger: root,
        start: "top 88%",
        onEnter: () => tl.play(),
        onLeaveBack: () => tl.reverse(),
      });
    });
    return () => mm.revert();
  });

  return (
    <div ref={ref} className={`frag ${className ?? ""}`} style={style}>
      <div className={`frag-skin ${skinClassName ?? ""}`} aria-hidden="true" />
      <div className="frag-shards" aria-hidden="true">
        {shards.map((s, i) => (
          <span key={i} className={`frag-shard ${skinClassName ?? ""}`} style={s} />
        ))}
      </div>
      <div className="frag-content">{children}</div>
    </div>
  );
}
