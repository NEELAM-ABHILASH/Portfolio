import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);
gsap.defaults({ ease: "power3.out", duration: 1 });

export { gsap, ScrollTrigger };

/* ───────────────────────── Motion preference ─────────────────────────
 * The OS "reduce motion" setting is the default, but visitors can override
 * it with the 3D toggle in the header (stored in localStorage). Many Windows
 * machines report "reduce" simply because "Animation effects" is switched off.
 */

const MOTION_KEY = "pf-motion";
export type MotionOverride = "on" | "off" | null;

function readOverride(): MotionOverride {
  try {
    const v = window.localStorage.getItem(MOTION_KEY);
    return v === "on" || v === "off" ? v : null;
  } catch {
    return null;
  }
}

/** True when the operating system asks for reduced motion. */
export const OS_REDUCED =
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
export const MOTION_OVERRIDE: MotionOverride = typeof window !== "undefined" ? readOverride() : null;
/** The effective decision for this page load. */
export const REDUCED = MOTION_OVERRIDE ? MOTION_OVERRIDE === "off" : OS_REDUCED;

if (typeof document !== "undefined") {
  document.documentElement.classList.toggle("reduce-motion", REDUCED);
}

/** Save the visitor's choice and reload so every animation is set up consistently. */
export function setMotionOverride(value: "on" | "off") {
  try {
    window.localStorage.setItem(MOTION_KEY, value);
  } catch {
    /* storage blocked — the choice just won't persist */
  }
  window.location.reload();
}

// Always-true / always-false queries, so gsap.matchMedia follows REDUCED.
const MQ_TRUE = "(min-width: 0px)";
const MQ_FALSE = "(min-width: 100000px)";

/** Media query strings shared by every gsap.matchMedia() call. */
export const MQ = {
  motion: REDUCED ? MQ_FALSE : MQ_TRUE,
  reduced: REDUCED ? MQ_TRUE : MQ_FALSE,
  desktop: "(min-width: 992px)",
  fine: "(hover: hover) and (pointer: fine)",
} as const;

export function prefersReducedMotion(): boolean {
  return REDUCED;
}

export function isFinePointer(): boolean {
  return typeof window !== "undefined" && window.matchMedia(MQ.fine).matches;
}

export type DeviceTier = "high" | "mid" | "low";

/** Rough GPU/CPU budget so the particle scene can scale itself down. */
export function getDeviceTier(): DeviceTier {
  const nav = navigator as Navigator & { deviceMemory?: number };
  const cores = nav.hardwareConcurrency ?? 4;
  const mem = nav.deviceMemory ?? 8;
  const small = Math.min(window.innerWidth, window.innerHeight) < 600;
  if (cores <= 2 || mem <= 2) return "low";
  if (small || cores <= 4 || mem <= 4) return "mid";
  return "high";
}

export function hasWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/* ───────────────────────── Smooth scroll ───────────────────────── */

let lenis: Lenis | null = null;

export function initSmoothScroll(): () => void {
  if (prefersReducedMotion()) return () => {};
  lenis = new Lenis({ duration: 1.15, smoothWheel: true, wheelMultiplier: 0.9 });
  lenis.on("scroll", ScrollTrigger.update);
  const tick = (time: number) => lenis?.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);
  document.documentElement.classList.add("has-smooth-scroll");
  return () => {
    gsap.ticker.remove(tick);
    lenis?.destroy();
    lenis = null;
    document.documentElement.classList.remove("has-smooth-scroll");
  };
}

export function stopScroll(stop: boolean) {
  if (lenis) {
    if (stop) lenis.stop();
    else lenis.start();
  }
  document.documentElement.classList.toggle("scroll-locked", stop);
}

/** Scroll to an in-page anchor, honouring the fixed header and reduced motion. */
export function scrollToHash(hash: string) {
  const el = document.querySelector<HTMLElement>(hash);
  if (!el) return;
  const offset = hash === "#home" ? 0 : -72;
  if (lenis) {
    lenis.scrollTo(el, { offset, duration: 1.6 });
  } else {
    const top = el.getBoundingClientRect().top + window.scrollY + offset;
    window.scrollTo({ top, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  }
  // Move focus for keyboard and screen-reader users without a second jump.
  if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
  el.focus({ preventScroll: true });
}

/* ───────────────────────── Intro bus ───────────────────────── */

type Listener = () => void;
const introListeners = new Set<Listener>();
let introFired = false;

/** Fired once when the preloader lifts — scene and hero assemble on this cue. */
export function onIntro(fn: Listener): () => void {
  if (introFired) {
    fn();
    return () => {};
  }
  introListeners.add(fn);
  return () => introListeners.delete(fn);
}

export function fireIntro() {
  if (introFired) return;
  introFired = true;
  const listeners = [...introListeners];
  introListeners.clear();
  // Dispatch on a fresh task: fireIntro is usually called from inside the
  // preloader's GSAP timeline, and tweens created synchronously there would
  // be recorded into the preloader's gsap.context — and reverted when it unmounts.
  window.setTimeout(() => listeners.forEach((fn) => fn()), 0);
}

export const rand = (min: number, max: number) => min + Math.random() * (max - min);

/* ───────────────────────── Scene readiness ───────────────────────── */

let sceneReadyResolve: (() => void) | null = null;
const sceneReady = new Promise<void>((res) => {
  sceneReadyResolve = res;
});

/** Called by the 3D backdrop once its first frame is on screen (or it gave up). */
export function markSceneReady() {
  sceneReadyResolve?.();
  sceneReadyResolve = null;
}

/** Resolves when the scene is ready, or after `timeoutMs` — whichever is first. */
export function whenSceneReady(timeoutMs: number): Promise<void> {
  return Promise.race([
    sceneReady,
    new Promise<void>((res) => window.setTimeout(res, timeoutMs)),
  ]);
}

/* ───────────────────────── Click burst ───────────────────────── */

const BURST_COLORS = ["#a855f7", "#60a5fa", "#f0abfc", "#22d3ee", "#ffffff"];

/** Small DOM particle explosion at a viewport point (used by buttons/links). */
export function burst(x: number, y: number, count = 16) {
  if (prefersReducedMotion()) return;
  const layer = document.createElement("div");
  layer.className = "fx-burst";
  layer.setAttribute("aria-hidden", "true");
  document.body.appendChild(layer);
  for (let i = 0; i < count; i++) {
    const p = document.createElement("span");
    const size = rand(3, 7);
    p.style.cssText = `left:${x}px;top:${y}px;width:${size}px;height:${size}px;background:${
      BURST_COLORS[i % BURST_COLORS.length]
    }`;
    layer.appendChild(p);
    const angle = (i / count) * Math.PI * 2 + rand(-0.3, 0.3);
    const dist = rand(40, 110);
    gsap.fromTo(
      p,
      { x: 0, y: 0, z: 0, scale: 1, opacity: 1 },
      {
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        z: rand(-80, 120),
        rotation: rand(-180, 180),
        scale: 0,
        opacity: 0,
        duration: rand(0.6, 1),
        ease: "expo.out",
      },
    );
  }
  window.setTimeout(() => layer.remove(), 1100);
}
