import { getDeviceTier, gsap, rand } from "../../lib/motion";

/**
 * "Dissolve and reassemble" for real DOM text.
 *
 * 1. Every word inside `elements` is redrawn onto an offscreen canvas at its
 *    exact on-screen position (same font, size, spacing, colour).
 * 2. That canvas is sampled into a grid of small particles.
 * 3. The DOM text is hidden and the particles take its place, burst outward
 *    in pseudo-3D, then flow back along curved paths and lock into the text.
 * 4. The real text fades back in and the particle layer fades out.
 *
 * Returns a cancel function. `onDone` fires once the real text is back.
 */

type Particle = {
  tx: number; // target (the text pixel), viewport px at start
  ty: number;
  ox: number; // burst-out position
  oy: number;
  qx: number; // bezier control point for the return path
  qy: number;
  z: number; // pseudo depth −1…1
  d1: number; // burst delay
  d2: number; // return delay
};

const BREAK_AT = 0.12;
const BREAK_DUR = 0.8;
const RETURN_AT = 1.15;
const RETURN_DUR = 1.05;
const REVEAL_AT = 2.55;
const REVEAL_DUR = 0.45;

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const clamp01 = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t);

function isTransparent(color: string) {
  return color === "transparent" || /rgba\(.*,\s*0\)$/.test(color);
}

/** Draw every word of every text node under `el` at its on-screen position. */
function rasterize(ctx: CanvasRenderingContext2D, el: HTMLElement) {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  let node: Node | null;
  while ((node = walker.nextNode())) {
    const text = node as Text;
    const parent = text.parentElement;
    if (!parent || !text.data.trim() || parent.closest(".visually-hidden")) continue;
    const cs = getComputedStyle(parent);
    if (cs.visibility === "hidden" || cs.display === "none") continue;

    ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing =
      cs.letterSpacing === "normal" ? "0px" : cs.letterSpacing;
    ctx.textBaseline = "middle";
    const upper = cs.textTransform === "uppercase";
    const strokeW = parseFloat(cs.getPropertyValue("-webkit-text-stroke-width")) || 0;
    const clear = isTransparent(cs.color) || isTransparent(cs.getPropertyValue("-webkit-text-fill-color"));

    const re = /\S+/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text.data))) {
      range.setStart(text, m.index);
      range.setEnd(text, m.index + m[0].length);
      const r = range.getClientRects()[0];
      if (!r || r.width === 0) continue;
      const word = upper ? m[0].toUpperCase() : m[0];
      const measured = ctx.measureText(word).width;
      ctx.save();
      ctx.translate(r.left, r.top + r.height / 2);
      if (measured > 0) ctx.scale(r.width / measured, 1);
      if (clear) {
        // gradient text (background-clip) — recreate a matching gradient
        const g = ctx.createLinearGradient(0, -r.height / 2, measured, r.height / 2);
        g.addColorStop(0, "#ffffff");
        g.addColorStop(0.55, "#d8b4fe");
        g.addColorStop(1, "#93c5fd");
        ctx.fillStyle = g;
        ctx.strokeStyle = g;
      } else {
        ctx.fillStyle = cs.color;
        ctx.strokeStyle = cs.color;
      }
      if (clear && strokeW > 0) {
        ctx.lineWidth = Math.max(2.5, strokeW * 2);
        ctx.strokeText(word, 0, 0);
      } else {
        ctx.fillText(word, 0, 0);
      }
      ctx.restore();
    }
  }
}

export function dissolveText(elements: HTMLElement[], onDone?: () => void): () => void {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  if (!elements.length || vw === 0) {
    onDone?.();
    return () => {};
  }

  // ── 1. rasterise the text into an offscreen canvas (1 css px per canvas px)
  const off = document.createElement("canvas");
  off.width = vw;
  off.height = vh;
  const octx = off.getContext("2d", { willReadFrequently: true });
  if (!octx) {
    onDone?.();
    return () => {};
  }
  elements.forEach((el) => rasterize(octx, el));

  // ── 2. sample into particles, bucketed by colour so drawing stays cheap
  const tier = getDeviceTier();
  const step = tier === "low" ? 4 : vw < 768 ? 2 : 3;
  const cap = tier === "high" ? 11000 : tier === "mid" ? 7000 : 3500;
  const data = octx.getImageData(0, 0, vw, vh).data;
  const buckets = new Map<string, Particle[]>();
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  const raw: { x: number; y: number; key: string }[] = [];
  for (let y = 0; y < vh; y += step) {
    for (let x = 0; x < vw; x += step) {
      const i = (y * vw + x) * 4;
      if (data[i + 3] < 110) continue;
      // quantise colour so a few dozen fillStyle changes cover everything
      const q = (v: number) => Math.min(255, Math.round(v / 24) * 24);
      raw.push({ x, y, key: `rgb(${q(data[i])},${q(data[i + 1])},${q(data[i + 2])})` });
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  if (!raw.length) {
    onDone?.();
    return () => {};
  }
  const keep = raw.length > cap ? cap / raw.length : 1;
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const spanX = Math.max(1, maxX - minX);
  const spanY = Math.max(1, maxY - minY);
  // On phones the hero text sits under the portrait: keep the burst compact and
  // stop particles drifting up over the photo.
  const compact = vw < 768;
  const reach = compact ? 0.45 : 1;
  const ceiling = compact ? minY - 24 : -Infinity;
  for (const s of raw) {
    if (keep < 1 && Math.random() > keep) continue;
    const dx = s.x - cx;
    const dy = s.y - cy;
    const len = Math.hypot(dx, dy) || 1;
    const ang = Math.atan2(dy, dx) + rand(-0.9, 0.9);
    const dist = rand(70, 340) * (0.6 + (len / Math.max(spanX, spanY)) * 0.8) * reach;
    const ox = s.x + Math.cos(ang) * dist;
    const oy = Math.max(ceiling, s.y + Math.sin(ang) * dist - rand(0, 60) * reach);
    // control point swings sideways so the return path curls
    const mx = (ox + s.x) / 2;
    const my = (oy + s.y) / 2;
    const swirl = rand(-1, 1) * 140 * reach;
    const p: Particle = {
      tx: s.x,
      ty: s.y,
      ox,
      oy,
      qx: mx - (oy - s.y) * 0.25 + swirl,
      qy: Math.max(ceiling, my + (ox - s.x) * 0.25),
      z: rand(-1, 1),
      d1: ((s.x - minX) / spanX) * 0.3 + rand(0, 0.06),
      d2: ((s.y - minY) / spanY) * 0.22 + rand(0, 0.28),
    };
    const list = buckets.get(s.key);
    if (list) list.push(p);
    else buckets.set(s.key, [p]);
  }

  // ── 3. on-screen particle layer
  const canvas = document.createElement("canvas");
  canvas.className = "fx-text-particles";
  canvas.setAttribute("aria-hidden", "true");
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(vw * dpr);
  canvas.height = Math.round(vh * dpr);
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    canvas.remove();
    onDone?.();
    return () => {};
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const scroll0 = window.scrollY;
  const base = Math.max(1.4, step * 0.72);
  const start = performance.now();
  let raf = 0;
  let hidden = false;
  let revealed = false;
  let cancelled = false;

  const restoreText = (animate: boolean) => {
    if (animate) gsap.to(elements, { opacity: 1, duration: REVEAL_DUR, ease: "power2.out", clearProps: "opacity" });
    else elements.forEach((el) => (el.style.opacity = ""));
  };

  const frame = () => {
    const t = (performance.now() - start) / 1000;
    if (!hidden && t >= BREAK_AT * 0.5) {
      elements.forEach((el) => (el.style.opacity = "0"));
      hidden = true;
    }
    if (!revealed && t >= REVEAL_AT) {
      revealed = true;
      restoreText(true);
      gsap.to(canvas, { opacity: 0, duration: REVEAL_DUR + 0.1, ease: "power1.in" });
    }
    ctx.clearRect(0, 0, vw, vh);
    const dy = scroll0 - window.scrollY;
    for (const [color, list] of buckets) {
      ctx.fillStyle = color;
      for (const p of list) {
        let x: number;
        let y: number;
        let z: number;
        const bt = clamp01((t - BREAK_AT - p.d1) / BREAK_DUR);
        const rs = Math.max(RETURN_AT + p.d2, BREAK_AT + p.d1 + BREAK_DUR * 0.85);
        const rt = clamp01((t - rs) / RETURN_DUR);
        if (rt > 0) {
          const k = easeInOutCubic(rt);
          const u = 1 - k;
          x = u * u * p.ox + 2 * u * k * p.qx + k * k * p.tx;
          y = u * u * p.oy + 2 * u * k * p.qy + k * k * p.ty;
          z = p.z * (1 - k);
        } else {
          const k = easeOutCubic(bt);
          x = p.tx + (p.ox - p.tx) * k;
          y = p.ty + (p.oy - p.ty) * k;
          z = p.z * k;
        }
        // pseudo-perspective: nearer particles drift outward and grow
        const persp = 1 + z * 0.22;
        const px = cx + (x - cx) * persp;
        const py = cy + (y - cy) * persp + dy;
        const size = base * (1 + z * 0.9);
        if (size <= 0.2) continue;
        ctx.fillRect(px - size / 2, py - size / 2, size, size);
      }
    }
    if (t < REVEAL_AT + REVEAL_DUR + 0.15 && !cancelled) {
      raf = requestAnimationFrame(frame);
    } else {
      canvas.remove();
      if (!cancelled) onDone?.();
    }
  };
  raf = requestAnimationFrame(frame);

  return () => {
    cancelled = true;
    cancelAnimationFrame(raf);
    gsap.killTweensOf(canvas);
    gsap.killTweensOf(elements);
    canvas.remove();
    restoreText(false);
  };
}
