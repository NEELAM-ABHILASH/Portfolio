import { useLayoutEffect, useRef, type DependencyList, type RefObject } from "react";
import { gsap } from "../lib/motion";

/**
 * Runs GSAP setup code inside a gsap.context scoped to `scope`, and reverts
 * every tween / ScrollTrigger it created on unmount (StrictMode-safe).
 */
export function useGsap<T extends HTMLElement>(
  setup: (ctx: gsap.Context, scope: T) => void | (() => void),
  deps: DependencyList = [],
): RefObject<T | null> {
  const scope = useRef<T | null>(null);
  const setupRef = useRef(setup);
  useLayoutEffect(() => {
    setupRef.current = setup;
  });

  useLayoutEffect(() => {
    const el = scope.current;
    if (!el) return;
    let extraCleanup: void | (() => void);
    const ctx = gsap.context((self) => {
      extraCleanup = setupRef.current(self, el);
    }, el);
    return () => {
      if (typeof extraCleanup === "function") extraCleanup();
      ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return scope;
}
