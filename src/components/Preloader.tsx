import { useLayoutEffect, useRef, useState } from "react";
import { profile } from "../data/portfolio";
import {
  fireIntro,
  getDeviceTier,
  gsap,
  prefersReducedMotion,
  rand,
  stopScroll,
  whenSceneReady,
} from "../lib/motion";
import { SplitText } from "./fx/SplitText";

/** How long the opening sequence plays before the exit starts (the exit adds ~1.45s → ~5.5s total). */
const HOLD_MS = 4050;
/**
 * Never wait longer than this for the WebGL scene. If it isn't ready yet it
 * simply fades in (and still bursts) on its own once loaded.
 */
const MAX_WAIT_MS = 4300;
const STAGES = ["Initialising particles", "Calibrating depth", "Assembling interface", "Ready"];
const GLYPHS = "!<>-_\\/[]{}=+*^?#01ABCDEF";
const TAU = Math.PI * 2;

type VortexMode = "warp" | "converge" | "focus" | "burst";

/**
 * 2D-canvas particle field in four acts:
 *  warp     — hyperspace: particles shoot out of the centre as light streaks,
 *  converge — the field flattens into a tilted disc (reads as 3D) and spirals in,
 *  focus    — it tightens hard around the name,
 *  burst    — it blows outward over the page as the loader opens.
 * Trails fade to transparent, so the burst stays visible over the revealed site.
 */
function startVortex(canvas: HTMLCanvasElement, count: number, lite = false) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return { setMode: (m: VortexMode) => void m, stop: () => {} };
  // Soft particles don't need full retina resolution; a smaller backing store
  // is much cheaper to clear and redraw every frame (phones: 1.25x).
  const dpr = Math.min(window.devicePixelRatio || 1, lite ? 1.25 : 1.5);
  let w = 0;
  let h = 0;
  let coreY = 0.5; // vertical centre of the composition (CSS --core-y)
  let portrait = false;
  const resize = () => {
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const host = canvas.parentElement;
    const v = host ? parseFloat(getComputedStyle(host).getPropertyValue("--core-y")) : NaN;
    coreY = Number.isFinite(v) ? v / 100 : 0.5;
    portrait = h > w * 1.15;
  };
  resize();
  window.addEventListener("resize", resize);

  const colors = ["#a855f7", "#60a5fa", "#f0abfc", "#22d3ee", "#e9e5ff"];
  // On tall phones the field is kept tighter, so the warp reads as a burst from
  // the core and the vortex settles into a ring hugging the reticle instead of
  // drifting along the bottom of the screen.
  const ps = Array.from({ length: count }, () => ({
    a: rand(0, TAU),
    r: rand(0, 0.04), // everything starts at the centre for the warp
    far: portrait ? rand(0.85, 1.5) : rand(1.3, 2.4), // where the warp flings it
    tr: portrait ? rand(0.32, 0.64) : rand(0.55, 1.05),
    va: rand(0.006, 0.016),
    vr: 0,
    s: rand(0.6, 2.1),
    c: colors[Math.floor(Math.random() * colors.length)],
    px: NaN,
    py: NaN,
  }));

  let mode: VortexMode = "warp";
  let flat = 1; // 1 = full-screen radial (warp), 0.34 = tilted disc
  let fade = 1;
  let raf = 0;
  const tick = () => {
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = mode === "warp" ? "rgba(0,0,0,0.32)" : "rgba(0,0,0,0.22)";
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = "lighter";
    const cx = w / 2;
    const cy = h * coreY;
    // size the disc from the larger screen dimension so tall phones get a full vortex
    const base = Math.min(Math.max(w, h * 0.8) * 0.5, 680);
    const discFlat = portrait ? 0.42 : 0.34;
    flat += ((mode === "warp" ? 1 : discFlat) - flat) * 0.06;
    if (mode === "burst") fade = Math.max(0, fade - 0.012);
    for (const p of ps) {
      if (mode === "warp") {
        p.r += (p.far - p.r) * 0.085 + 0.003;
        p.a += p.va * 0.3;
      } else if (mode === "converge") {
        p.r += (p.tr - p.r) * (portrait ? 0.05 : 0.028);
        p.a += p.va * (1 + Math.max(0, p.r - p.tr) * 3);
      } else if (mode === "focus") {
        p.r += (p.tr * 0.42 - p.r) * 0.05;
        p.a += p.va * 2.2;
      } else {
        p.vr += 0.0016 + p.s * 0.0009;
        p.r += p.vr;
        p.a += p.va * 0.5;
      }
      const depth = (Math.sin(p.a) + 1) / 2; // 0 = far side of the disc, 1 = near
      const x = cx + Math.cos(p.a) * p.r * base;
      const y = cy + Math.sin(p.a) * p.r * base * flat;
      const size = p.s * (0.55 + depth * 1.1);
      const alpha = (mode === "warp" ? 0.9 : 0.2 + depth * 0.8) * fade;
      if (mode === "warp" && !Number.isNaN(p.px)) {
        // light streak from the previous position
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = p.c;
        ctx.lineWidth = Math.max(1, size * 0.8);
        ctx.beginPath();
        ctx.moveTo(p.px, p.py);
        ctx.lineTo(x, y);
        ctx.stroke();
      } else {
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.c;
        if (lite) {
          // squares are far cheaper than arcs and look the same at this size
          ctx.fillRect(x - size, y - size, size * 2, size * 2);
        } else {
          ctx.beginPath();
          ctx.arc(x, y, size, 0, TAU);
          ctx.fill();
        }
      }
      p.px = x;
      p.py = y;
    }
    ctx.globalAlpha = 1;
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);

  return {
    setMode(m: VortexMode) {
      mode = m;
      if (m === "burst") ps.forEach((p) => (p.vr = rand(0.004, 0.03)));
    },
    stop() {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    },
  };
}

/** Scrambled glyphs that resolve left-to-right into `text`. */
function decodeText(el: HTMLElement, text: string, durationMs: number) {
  const start = performance.now();
  const id = window.setInterval(() => {
    const t = Math.min(1, (performance.now() - start) / durationMs);
    const settled = Math.floor(t * text.length);
    el.textContent = Array.from(text)
      .map((ch, i) => (i < settled || ch === " " ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]))
      .join("");
    if (t >= 1) window.clearInterval(id);
  }, 45);
  return () => window.clearInterval(id);
}

/**
 * Cinematic boot sequence (~5.5s):
 *  0.0s  big-bang flash + hyperspace warp streaks
 *  0.2s  gyroscope rings, grid tunnel, progress reticle, wireframe cube
 *  0.35s name condenses out of scattered 3D glyphs (RGB glitch at 2.05s)
 *  1.4s  role line decodes from scrambled characters
 *  2.5s  light wave through the name → 2.8s vortex tightens, shockwave + lens flare
 *  3.0s  every glyph flips a full turn in 3D (second glitch at 3.7s)
 *  4.05s exit: flash, glyphs explode toward the camera, the stage zooms past,
 *        panels split and the particles burst over the page.
 * Skippable; skipped entirely when motion is reduced.
 */
export function Preloader() {
  const [done, setDone] = useState(() => prefersReducedMotion());
  const root = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    if (done) {
      fireIntro();
      return;
    }
    const el = root.current;
    if (!el) return;
    stopScroll(true);
    let exiting = false;
    let disposed = false;
    const counter = { v: 0 };
    const num = el.querySelector<HTMLElement>(".pre-count");
    const label = el.querySelector<HTMLElement>(".pre-label");
    const bar = el.querySelector<HTMLElement>(".pre-bar span");
    const role = el.querySelector<HTMLElement>(".pre-role");
    const canvas = el.querySelector<HTMLCanvasElement>(".pre-canvas");
    const chars = el.querySelectorAll<HTMLElement>(".pre-name .sp-c");
    const rings = el.querySelectorAll<HTMLElement>(".pre-ring");
    const hudArcs = el.querySelectorAll<SVGCircleElement>(".pre-hud-progress, .pre-hud-glow");
    const tier = getDeviceTier();
    // Phones / touch tablets: same choreography, lighter rendering — no
    // filter-based effects (blur / drop-shadow are the most expensive things a
    // mobile GPU can be asked to animate), no full-screen white flashes or
    // flare (they read as the screen "blinking"), fewer and cheaper particles,
    // and tighter distances so nothing flies far off a narrow screen.
    const compact = window.matchMedia("(max-width: 767.98px), (pointer: coarse)").matches;
    const spread = compact ? 0.55 : 1;
    const vortex = canvas
      ? startVortex(canvas, compact ? 260 : tier === "high" ? 700 : tier === "mid" ? 420 : 220, compact)
      : { setMode: () => {}, stop: () => {} };
    let stopDecode = () => {};

    const paint = () => {
      const v = Math.round(counter.v);
      if (num) num.textContent = String(v).padStart(3, "0");
      if (bar) bar.style.transform = `scaleX(${counter.v / 100})`;
      hudArcs.forEach((arc) => (arc.style.strokeDashoffset = String(100 - counter.v)));
      if (label) label.textContent = STAGES[v >= 100 ? 3 : v >= 62 ? 2 : v >= 30 ? 1 : 0];
    };

    // RGB-split glitch burst on the name (transform-only jitter on phones)
    const glitch = compact
      ? {
          keyframes: [
            { x: -6, skewX: 12, duration: 0.05 },
            { x: 5, skewX: -8, duration: 0.05 },
            { x: -2, skewX: 4, duration: 0.04 },
            { x: 0, skewX: 0, duration: 0.07 },
          ],
        }
      : {
          keyframes: [
            { x: -9, skewX: 14, filter: "drop-shadow(-6px 0 #ff2e88) drop-shadow(6px 0 #22d3ee)", duration: 0.05 },
            { x: 7, skewX: -10, filter: "drop-shadow(5px 0 #ff2e88) drop-shadow(-5px 0 #22d3ee)", duration: 0.05 },
            { x: -4, skewX: 5, filter: "drop-shadow(-3px 0 #ff2e88) drop-shadow(3px 0 #22d3ee)", duration: 0.04 },
            { x: 0, skewX: 0, filter: "drop-shadow(0px 0 #ff2e88) drop-shadow(0px 0 #22d3ee)", duration: 0.07 },
          ],
          clearProps: "filter",
        };

    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      // big-bang flash as the warp fires, then the field settles into the vortex
      tl.fromTo(".pre-flash", { opacity: 0.95, scale: 0.4 }, { opacity: 0, scale: 1.6, duration: 0.9, ease: "power2.out" }, 0)
        .call(() => vortex.setMode("converge"), [], 0.9)
        .fromTo(
          rings,
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, duration: 1.4, ease: "expo.out", stagger: 0.14 },
          0.15,
        )
        .fromTo(".pre-grid", { opacity: 0 }, { opacity: 1, duration: 1.4, ease: "power2.out" }, 0.3)
        .fromTo(
          ".pre-hud",
          { scale: 0.4, opacity: 0, rotation: -120 },
          { scale: 1, opacity: 1, rotation: 0, duration: 1.4, ease: "expo.out" },
          0.35,
        )
        .fromTo(
          ".pre-cube-wrap",
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 0.75, duration: 1.3, ease: "back.out(1.6)" },
          0.6,
        )
        .from(".pre-kicker", { opacity: 0, y: 14, letterSpacing: "0.8em", duration: 1.2 }, 0.2)
        .fromTo(
          chars,
          {
            x: () => rand(-420, 420) * spread,
            y: () => rand(-260, 260) * spread,
            z: () => rand(-900, 300) * spread,
            rotationX: () => rand(-220, 220),
            rotationY: () => rand(-220, 220),
            opacity: 0,
            ...(compact ? {} : { filter: "blur(8px)" }),
          },
          {
            x: 0,
            y: 0,
            z: 0,
            rotationX: 0,
            rotationY: 0,
            opacity: 1,
            ...(compact ? {} : { filter: "blur(0px)" }),
            duration: 1.7,
            ease: "expo.out",
            stagger: { amount: 0.7, from: "random" },
          },
          0.35,
        )
        .from(".pre-meta", { opacity: 0, y: 12, duration: 0.7, stagger: 0.1 }, 0.5)
        .call(() => {
          if (role) stopDecode = decodeText(role, profile.role, 1200);
        }, [], 1.4)
        .fromTo(".pre-role", { opacity: 0 }, { opacity: 1, duration: 0.3 }, 1.4)
        .to(rings, { rotation: "+=140", duration: 2.2, ease: "power2.inOut", stagger: 0.06 }, 1.2)
        .to(".pre-name", glitch, 2.05)
        // light wave travelling through the name
        .to(
          chars,
          {
            keyframes: [
              { y: -10, color: "#ffffff", textShadow: "0 0 24px #f0abfc, 0 0 60px #a855f7", duration: 0.18 },
              { y: 0, color: "#ddd6fe", textShadow: "0 0 30px rgba(168,85,247,0.55)", duration: 0.5 },
            ],
            stagger: 0.04,
          },
          2.5,
        )
        .call(() => vortex.setMode("focus"), [], 2.8)
        .fromTo(
          ".pre-shock--a",
          { scale: 0.15, opacity: 0.9 },
          { scale: 3.2, opacity: 0, duration: 1.3, ease: "expo.out" },
          2.8,
        )
        // anamorphic lens flare snaps across the screen with the shockwave
        .fromTo(".pre-flare", { scaleX: 0, opacity: 0 }, { scaleX: 1, opacity: 1, duration: 0.35, ease: "expo.out" }, 2.8)
        .to(".pre-flare", { opacity: 0, duration: 0.7, ease: "power2.in" }, 3.2)
        .to(".pre-name", glitch, 3.7)
        // each glyph flips a full turn in 3D, rippling outward from the centre
        .to(
          chars,
          {
            rotationX: "+=360",
            duration: 0.9,
            ease: "power3.inOut",
            stagger: { each: 0.04, from: "center" },
          },
          3.0, // finishes (~4.2s) just before the exit explodes the glyphs
        );
    }, el);

    const fill = gsap.to(counter, {
      v: 92,
      duration: HOLD_MS / 1000,
      ease: "power1.inOut",
      onUpdate: paint,
    });

    const exit = () => {
      if (exiting || disposed) return;
      exiting = true;
      fill.kill();
      ctx.add(() => {
        gsap
          .timeline({
            onComplete: () => {
              stopScroll(false);
              setDone(true);
            },
          })
          .to(counter, { v: 100, duration: 0.25, ease: "power1.out", onUpdate: paint })
          .add(() => {
            vortex.setMode("burst");
            fireIntro();
          })
          .fromTo(
            ".pre-shock--b",
            { scale: 0.2, opacity: 1 },
            { scale: 5, opacity: 0, duration: 1.1, ease: "expo.out" },
            "<",
          )
          .to(
            chars,
            {
              x: () => rand(-600, 600) * spread,
              y: () => rand(-360, 360) * spread,
              z: () => rand(400, 1100) * spread,
              rotationX: () => rand(-220, 220),
              rotationY: () => rand(-220, 220),
              opacity: 0,
              duration: 0.85,
              ease: "power3.in",
              stagger: { amount: 0.16, from: "center" },
            },
            "<",
          )
          .to(rings, { scale: compact ? 1.6 : 2.6, opacity: 0, duration: 0.9, ease: "power3.in", stagger: 0.05 }, "<")
          .to(".pre-meta, .pre-role, .pre-kicker", { opacity: 0, duration: 0.3 }, "<")
          // fly-through: the flash pops, the stage, reticle and cube rush past the camera
          .set(".pre-flash", { opacity: 0, scale: 0.6 }, "<")
          .to(
            ".pre-flash",
            {
              keyframes: [
                { opacity: 0.6, scale: 0.9, duration: 0.1 },
                { opacity: 0, scale: 1.4, duration: 0.4 },
              ],
            },
            "<",
          )
          .to(".pre-stage", { scale: compact ? 1.2 : 1.5, duration: 0.9, ease: "power3.in" }, "<")
          .to(".pre-hud", { scale: compact ? 1.5 : 2.2, opacity: 0, rotation: 90, duration: 0.7, ease: "power3.in" }, "<")
          .to(".pre-cube-wrap", { scale: compact ? 1.8 : 2.8, opacity: 0, rotationZ: 45, duration: 0.6, ease: "power3.in" }, "<")
          .to(".pre-grid", { opacity: 0, duration: 0.6 }, "<0.2")
          .to(".pre-panel--top", { yPercent: -100, duration: 0.9, ease: "expo.inOut" }, "<0.3")
          .to(".pre-panel--bottom", { yPercent: 100, duration: 0.9, ease: "expo.inOut" }, "<")
          .to(".pre-canvas", { opacity: 0, duration: 0.5 }, "<0.2");
      });
    };

    const start = performance.now();
    whenSceneReady(MAX_WAIT_MS).then(() => {
      window.setTimeout(exit, Math.max(0, HOLD_MS - (performance.now() - start)));
    });
    const skip = (e: KeyboardEvent | PointerEvent) => {
      if (e instanceof KeyboardEvent && !["Enter", " ", "Escape"].includes(e.key)) return;
      exit();
    };
    window.addEventListener("keydown", skip);
    el.addEventListener("pointerdown", skip);

    return () => {
      disposed = true;
      window.removeEventListener("keydown", skip);
      el.removeEventListener("pointerdown", skip);
      fill.kill();
      stopDecode();
      vortex.stop();
      ctx.revert();
      stopScroll(false);
    };
  }, [done]);

  if (done) return null;

  return (
    <div ref={root} className="preloader" role="status" aria-label={`Loading ${profile.firstName} ${profile.lastName}'s portfolio`}>
      {/* grid ceiling/floor ride on the panels, so they split away with them */}
      <div className="pre-panel pre-panel--top">
        <span className="pre-grid pre-grid--ceiling" aria-hidden="true" />
      </div>
      <div className="pre-panel pre-panel--bottom">
        <span className="pre-grid pre-grid--floor" aria-hidden="true" />
      </div>
      <canvas className="pre-canvas" aria-hidden="true" />
      <div className="pre-gyro" aria-hidden="true">
        <span className="pre-ring pre-ring--a" />
        <span className="pre-ring pre-ring--b" />
        <span className="pre-ring pre-ring--c" />
      </div>
      {/* The tick ring spins as its own layer (transform only); only the small
          progress arc repaints as the counter moves. */}
      <div className="pre-hud" aria-hidden="true">
        <svg className="pre-hud-ticks" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="84" pathLength={100} />
        </svg>
        <svg className="pre-hud-main" viewBox="0 0 200 200">
          <circle className="pre-hud-track" cx="100" cy="100" r="92" />
          <circle className="pre-hud-glow" cx="100" cy="100" r="92" pathLength={100} />
          <circle className="pre-hud-progress" cx="100" cy="100" r="92" pathLength={100} />
        </svg>
      </div>
      <div className="pre-cube-wrap" aria-hidden="true">
        <div className="pre-cube">
          <span className="pre-face pre-face--f" />
          <span className="pre-face pre-face--b" />
          <span className="pre-face pre-face--r" />
          <span className="pre-face pre-face--l" />
          <span className="pre-face pre-face--t" />
          <span className="pre-face pre-face--d" />
        </div>
      </div>
      <span className="pre-shock pre-shock--a" aria-hidden="true" />
      <span className="pre-shock pre-shock--b" aria-hidden="true" />
      <span className="pre-flare" aria-hidden="true" />
      <span className="pre-scan" aria-hidden="true" />
      <span className="pre-flash" aria-hidden="true" />

      <div className="pre-stage" aria-hidden="true">
        <p className="pre-kicker">Portfolio</p>
        <SplitText as="p" className="pre-name" text={`${profile.firstName} ${profile.lastName}`} />
        <p className="pre-role">&nbsp;</p>
      </div>

      {/* progress readout lives at the bottom, clear of the reticle */}
      <div className="pre-footer" aria-hidden="true">
        <div className="pre-meta">
          <span className="pre-label">{STAGES[0]}</span>
          <span className="pre-count">000</span>
        </div>
        <div className="pre-bar pre-meta">
          <span />
        </div>
        <p className="pre-skip pre-meta">Press Enter or tap to skip</p>
      </div>
    </div>
  );
}
