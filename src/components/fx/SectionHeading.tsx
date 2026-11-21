import { useGsap } from "../../hooks/useGsap";
import { gsap, MQ } from "../../lib/motion";
import { SplitText } from "./SplitText";

type Props = {
  index: string;
  eyebrow: string;
  title: string;
  id?: string;
  align?: "left" | "center";
};

/**
 * Shared section title: an indexed eyebrow whose rule draws itself, and a
 * title whose letters flip up out of the page in 3D.
 */
export function SectionHeading({ index, eyebrow, title, id, align = "left" }: Props) {
  const ref = useGsap<HTMLDivElement>((_, root) => {
    const mm = gsap.matchMedia();
    mm.add(MQ.motion, () => {
      gsap
        .timeline({
          scrollTrigger: { trigger: root, start: "top 86%", toggleActions: "play none none reverse" },
        })
        .from(root.querySelector(".sh-rule"), { scaleX: 0, duration: 0.9, ease: "expo.out" })
        .from(root.querySelectorAll(".sh-eyebrow > *"), { y: 16, opacity: 0, duration: 0.6, stagger: 0.08 }, 0.1)
        .from(
          root.querySelectorAll(".sh-title .sp-c"),
          {
            yPercent: 90,
            z: -160,
            rotationX: -100,
            opacity: 0,
            duration: 1,
            ease: "expo.out",
            stagger: 0.018,
          },
          0.15,
        );
    });
    return () => mm.revert();
  });

  return (
    <div ref={ref} className={`sh sh--${align}`}>
      <p className="sh-eyebrow">
        <span className="sh-index">{index}</span>
        <span className="sh-rule" aria-hidden="true" />
        <span>{eyebrow}</span>
      </p>
      <SplitText as="h2" className="sh-title" text={title} id={id} />
    </div>
  );
}
