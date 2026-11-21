import { useEffect, useState } from "react";
import { profile } from "../data/portfolio";
import { onIntro, prefersReducedMotion } from "../lib/motion";

const ROLE = profile.role;
const TYPING_MS = 85;
const PAUSE_MS = 3200;
const DELETE_MS = 42;
const LOOP_GAP_MS = 500;
/**
 * Starts once the hero text has finished dissolving and reassembling (~1.4s + ~3s).
 * With motion off there is no dissolve, so it starts almost straight away.
 */
const START_AFTER_INTRO_MS = prefersReducedMotion() ? 400 : 4500;

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

    const off = onIntro(() => schedule(tick, START_AFTER_INTRO_MS));
    return () => {
      cancelled = true;
      off();
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <p className="role-heading mb-0">
      <span className="visually-hidden">Role: {ROLE}</span>
      <span aria-hidden="true">
        <span className="role-prefix">I&apos;m a </span>
        <span className="role-typed">{displayed}</span>
        <span className="role-cursor">|</span>
      </span>
    </p>
  );
}
