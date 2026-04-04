import { useEffect, useState } from "react";

const ROLE = "React Developer";
const TYPING_MS = 85;
const PAUSE_MS = 3200;
const DELETE_MS = 42;
const LOOP_GAP_MS = 500;

export function TypingRole() {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout>;
    let index = 0;
    let mode: "forward" | "backward" = "forward";

    const schedule = (fn: () => void, ms: number) => {
      timeoutId = setTimeout(() => {
        if (!cancelled) fn();
      }, ms);
    };

    const tick = () => {
      if (cancelled) return;
      if (mode === "forward") {
        if (index < ROLE.length) {
          index += 1;
          setDisplayed(ROLE.slice(0, index));
          schedule(tick, TYPING_MS);
        } else {
          schedule(() => {
            if (cancelled) return;
            mode = "backward";
            tick();
          }, PAUSE_MS);
        }
      } else {
        if (index > 0) {
          index -= 1;
          setDisplayed(ROLE.slice(0, index));
          schedule(tick, DELETE_MS);
        } else {
          mode = "forward";
          schedule(tick, LOOP_GAP_MS);
        }
      }
    };

    schedule(tick, 2200);
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <h2 className="role-heading mb-0" aria-live="polite">
      <span className="visually-hidden">Role: </span>
      <span className="role-prefix">I&apos;m a </span>
      <span className="role-typed">{displayed}</span>
      <span className="role-cursor" aria-hidden="true">
        |
      </span>
    </h2>
  );
}
