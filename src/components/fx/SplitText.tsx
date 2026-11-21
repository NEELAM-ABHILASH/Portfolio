import { createElement, type ElementType } from "react";

type Props = {
  text: string;
  /** "chars" wraps every letter (inside word groups); "words" wraps words only. */
  by?: "chars" | "words";
  as?: ElementType;
  className?: string;
  id?: string;
};

/**
 * Splits text into animatable spans while keeping it readable to assistive
 * tech: the real string lives in a visually-hidden span, the pieces are
 * aria-hidden. Pieces get `.sp-w` (word) and `.sp-c` (char) classes.
 */
export function SplitText({ text, by = "chars", as = "span", className, id }: Props) {
  const words = text.split(" ");
  return createElement(
    as,
    { className: `split ${className ?? ""}`.trim(), id },
    <span className="visually-hidden">{text}</span>,
    <span className="split-inner" aria-hidden="true">
      {words.map((word, wi) => (
        <span key={wi}>
          <span className="sp-w">
            {by === "chars"
              ? Array.from(word).map((ch, ci) => (
                  <span key={ci} className="sp-c">
                    {ch}
                  </span>
                ))
              : word}
          </span>
          {wi < words.length - 1 ? " " : null}
        </span>
      ))}
    </span>,
  );
}
