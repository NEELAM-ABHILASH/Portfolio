import { useEffect, useRef } from "react";
import * as THREE from "three";
import { sections } from "../../data/portfolio";
import {
  getDeviceTier,
  gsap,
  markSceneReady,
  onIntro,
  ScrollTrigger,
  type DeviceTier,
} from "../../lib/motion";
import { OFFSETS_X, scatter, SHAPES, TINTS } from "./shapes";

const BUDGET: Record<DeviceTier, { count: number; dpr: number; extras: boolean }> = {
  high: { count: 9000, dpr: 1.75, extras: true },
  mid: { count: 5000, dpr: 1.5, extras: true },
  low: { count: 2200, dpr: 1, extras: false },
};

const PALETTE = [
  new THREE.Color("#a855f7"),
  new THREE.Color("#60a5fa"),
  new THREE.Color("#f0abfc"),
  new THREE.Color("#e9e5ff"),
];

const vertex = /* glsl */ `
  attribute vec3 aFrom;
  attribute vec3 aTo;
  attribute vec3 aScatter;
  attribute vec3 aColor;
  attribute float aSeed;
  uniform float uMix;
  uniform float uIntro;
  uniform float uTime;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform float uWave;
  uniform vec3 uMouse;
  uniform float uMouseForce;
  uniform vec3 uTint;
  varying vec3 vColor;
  varying float vAlpha;

  float ease(float t) { return t * t * (3.0 - 2.0 * t); }

  void main() {
    // Morph: each particle leaves on its own schedule, so shapes "flow".
    float t = ease(clamp(uMix * 1.6 - aSeed * 0.6, 0.0, 1.0));
    vec3 target = mix(aFrom, aTo, t);
    float transit = sin(t * 3.14159);
    target += normalize(aScatter) * transit * (0.5 + aSeed * 0.9);

    // Intro: singularity -> burst outward -> assemble into the formation.
    float b = clamp(uIntro * 1.15 - aSeed * 0.15, 0.0, 1.0);
    vec3 burst = aScatter * (1.0 - pow(1.0 - b, 4.0));
    float a = clamp((uIntro - 1.0) * 1.4 - aSeed * 0.4, 0.0, 1.0);
    a = 1.0 - pow(1.0 - a, 3.0);
    vec3 pos = mix(burst, target, a);

    // Living drift + a gentle wave on the contact field.
    pos += vec3(
      sin(uTime * 0.7 + aSeed * 41.0),
      cos(uTime * 0.6 + aSeed * 29.0),
      sin(uTime * 0.5 + aSeed * 17.0)
    ) * 0.035;
    pos.y += sin(pos.x * 1.3 + uTime * 1.2) * 0.18 * uWave;

    vec4 world = modelMatrix * vec4(pos, 1.0);
    vec2 d = world.xy - uMouse.xy;
    float dist = length(d);
    float f = (1.0 - smoothstep(0.0, 1.4, dist)) * uMouseForce;
    world.xy += normalize(d + 1e-4) * f * 0.55;
    world.z += f * 0.6;

    vec4 mv = viewMatrix * world;
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * (0.45 + aSeed * 0.9) * uPixelRatio / -mv.z;

    vColor = mix(aColor, uTint, 0.38) + f * 0.35;
    vAlpha = (0.35 + aSeed * 0.65) * smoothstep(0.0, 0.15, uIntro);
  }
`;

const fragment = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    a *= a;
    gl_FragColor = vec4(vColor, a * vAlpha);
  }
`;

/**
 * Fixed full-viewport WebGL layer: one particle field that bursts into
 * existence on the intro cue and morphs into a new formation per section,
 * plus floating wireframe solids and a far starfield for depth.
 */
export default function ParticleScene() {
  const host = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const tier = getDeviceTier();
    const budget = BUDGET[tier];
    const N = budget.count;
    const isSmall = () => window.innerWidth < 992;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: false,
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch {
      el.classList.add("is-failed");
      markSceneReady();
      return;
    }
    let dpr = Math.min(window.devicePixelRatio || 1, budget.dpr);
    renderer.setPixelRatio(dpr);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 8);

    /* ── Particles ── */
    const shapes = SHAPES.map((g) => g(N));
    const geo = new THREE.BufferGeometry();
    const from = new Float32Array(shapes[0]);
    const to = new Float32Array(shapes[1]);
    const colors = new Float32Array(N * 3);
    const seeds = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      const roll = Math.random();
      const c = roll < 0.45 ? PALETTE[0] : roll < 0.75 ? PALETTE[1] : roll < 0.9 ? PALETTE[2] : PALETTE[3];
      colors.set([c.r, c.g, c.b], i * 3);
      seeds[i] = Math.random();
    }
    const fromAttr = new THREE.BufferAttribute(from, 3);
    const toAttr = new THREE.BufferAttribute(to, 3);
    fromAttr.setUsage(THREE.DynamicDrawUsage);
    toAttr.setUsage(THREE.DynamicDrawUsage);
    geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(shapes[0]), 3));
    geo.setAttribute("aFrom", fromAttr);
    geo.setAttribute("aTo", toAttr);
    geo.setAttribute("aScatter", new THREE.BufferAttribute(scatter(N), 3));
    geo.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
    geo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 20);

    const uniforms = {
      uMix: { value: 0 },
      uIntro: { value: 0 },
      uTime: { value: 0 },
      uSize: { value: tier === "low" ? 34 : 30 },
      uPixelRatio: { value: dpr },
      uWave: { value: 0 },
      uMouse: { value: new THREE.Vector3(99, 99, 0) },
      uMouseForce: { value: 0 },
      uTint: { value: new THREE.Color(...TINTS[0]) },
    };
    const mat = new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const points = new THREE.Points(geo, mat);
    const formation = new THREE.Group();
    formation.add(points);
    scene.add(formation);

    /* ── Starfield ── */
    const starGeo = new THREE.BufferGeometry();
    const starCount = tier === "low" ? 300 : 900;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPos.set(
        [(Math.random() - 0.5) * 40, (Math.random() - 0.5) * 26, -6 - Math.random() * 18],
        i * 3,
      );
    }
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
      size: 0.05,
      color: 0xc4b5fd,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
    });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    /* ── Floating wireframe solids ── */
    const solids: { obj: THREE.LineSegments; base: THREE.Vector3; depth: number; spin: number }[] = [];
    const disposables: { dispose(): void }[] = [geo, mat, starGeo, starMat];
    if (budget.extras) {
      const defs: [THREE.BufferGeometry, number, [number, number, number], number][] = [
        [new THREE.IcosahedronGeometry(0.9, 0), 0xa855f7, [-5.2, 2.2, -2.5], 1.4],
        [new THREE.TorusGeometry(0.75, 0.22, 8, 24), 0x60a5fa, [5.6, -1.8, -3.5], 1.0],
        [new THREE.OctahedronGeometry(0.6, 0), 0xf0abfc, [-4.4, -3.0, -1.2], 1.9],
        [new THREE.DodecahedronGeometry(0.55, 0), 0x22d3ee, [4.4, 3.1, -1.8], 1.6],
      ];
      defs.forEach(([g, color, pos, depth], i) => {
        const edges = new THREE.EdgesGeometry(g);
        const m = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.28 });
        const obj = new THREE.LineSegments(edges, m);
        obj.position.set(...pos);
        scene.add(obj);
        solids.push({ obj, base: new THREE.Vector3(...pos), depth, spin: 0.15 + i * 0.05 });
        disposables.push(g, edges, m);
      });
    }

    /* ── Scroll → section progress ── */
    let tops: number[] = [];
    const measure = () => {
      tops = sections.map(({ id }) => {
        const s = document.getElementById(id);
        return s ? s.getBoundingClientRect().top + window.scrollY : 0;
      });
    };
    measure();
    ScrollTrigger.addEventListener("refresh", measure);

    const sectionProgress = () => {
      const anchor = window.scrollY + window.innerHeight * 0.55;
      const last = tops.length - 1;
      for (let i = last; i >= 0; i--) {
        if (anchor >= tops[i]) {
          if (i === last) return last;
          const span = Math.max(1, tops[i + 1] - tops[i]);
          const local = (anchor - tops[i]) / span;
          const m = Math.min(1, Math.max(0, (local - 0.6) / 0.4));
          return i + m * m * (3 - 2 * m);
        }
      }
      return 0;
    };

    /* ── Pointer ── */
    const pointer = { x: 0, y: 0, active: 0 };
    let lastMove = 0;
    const onPointer = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
      lastMove = performance.now();
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    /* ── Resize ── */
    let resizeT = 0;
    const onResize = () => {
      window.clearTimeout(resizeT);
      resizeT = window.setTimeout(() => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        measure();
      }, 120);
    };
    window.addEventListener("resize", onResize);

    /* ── Intro ── */
    const offIntro = onIntro(() => {
      gsap.to(uniforms.uIntro, { value: 1, duration: 0.9, ease: "power4.out" });
      gsap.to(uniforms.uIntro, { value: 2, duration: 2.4, ease: "power2.inOut", delay: 0.55 });
    });

    /* ── Loop ── */
    let pairA = -1;
    let pSmooth = sectionProgress();
    const tint = new THREE.Color();
    const tintNext = new THREE.Color();
    let spin = 0;
    let lastScroll = window.scrollY;
    let frames = 0;
    let acc = 0;
    let degraded = false;
    let lost = false;
    let first = true;
    const timer = new THREE.Timer();

    const render = () => {
      if (lost) return;
      timer.update();
      const dt = Math.min(timer.getDelta(), 0.05);
      const time = timer.getElapsed();

      // adaptive quality: if we can't hold ~40fps, shed pixels then particles
      if (!degraded) {
        acc += dt;
        frames++;
        if (frames === 120) {
          if (acc / frames > 1 / 40) {
            if (dpr > 1) {
              dpr = 1;
              renderer.setPixelRatio(dpr);
              uniforms.uPixelRatio.value = dpr;
            } else {
              geo.setDrawRange(0, Math.floor(N * 0.55));
              degraded = true;
            }
          }
          frames = 0;
          acc = 0;
        }
      }

      const p = sectionProgress();
      pSmooth += (p - pSmooth) * Math.min(1, dt * 4);
      const last = SHAPES.length - 1;
      const a = Math.min(Math.floor(pSmooth), last);
      if (a !== pairA) {
        pairA = a;
        from.set(shapes[a]);
        to.set(shapes[Math.min(a + 1, last)]);
        fromAttr.needsUpdate = true;
        toAttr.needsUpdate = true;
      }
      const mix = a >= last ? 0 : pSmooth - a;
      uniforms.uMix.value = mix;
      uniforms.uTime.value = time;
      uniforms.uWave.value = Math.max(0, pSmooth - (last - 1));

      tint.setRGB(...TINTS[a]);
      tintNext.setRGB(...TINTS[Math.min(a + 1, last)]);
      uniforms.uTint.value.copy(tint).lerp(tintNext, mix);

      // scroll velocity adds spin
      const sy = window.scrollY;
      const vel = (sy - lastScroll) / Math.max(dt, 0.001);
      lastScroll = sy;
      spin += (Math.max(-3, Math.min(3, vel * 0.0012)) - spin) * 0.08;

      const small = isSmall();
      const ox = small ? 0 : OFFSETS_X[a] + (OFFSETS_X[Math.min(a + 1, last)] - OFFSETS_X[a]) * mix;
      formation.position.x += (ox - formation.position.x) * 0.06;
      formation.position.y = small ? 0.6 : 0;
      const sc = small ? 0.72 : 1;
      formation.scale.setScalar(sc);
      formation.rotation.y += dt * (0.08 + spin * 0.25);
      formation.rotation.x += (pointer.y * 0.25 - formation.rotation.x) * 0.04;

      // camera breathes back between sections, follows the pointer
      const transit = Math.sin(mix * Math.PI);
      camera.position.z += (8 + transit * 1.6 - camera.position.z) * 0.06;
      camera.position.x += (pointer.x * 0.6 - camera.position.x) * 0.04;
      camera.position.y += (pointer.y * 0.4 - camera.position.y) * 0.04;
      camera.lookAt(formation.position.x * 0.35, 0, 0);

      const idle = performance.now() - lastMove > 1600;
      pointer.active += ((idle ? 0 : 1) - pointer.active) * 0.06;
      const halfH = Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;
      uniforms.uMouse.value.set(pointer.x * halfH * camera.aspect, pointer.y * halfH, 0);
      uniforms.uMouseForce.value = pointer.active;

      stars.position.x = -camera.position.x * 0.6;
      stars.position.y = -camera.position.y * 0.6 + pSmooth * 0.35;

      solids.forEach((s, i) => {
        s.obj.rotation.x += dt * s.spin;
        s.obj.rotation.y += dt * s.spin * 0.8;
        let y = s.base.y + Math.sin(time * 0.4 + i) * 0.3 + pSmooth * s.depth;
        y = ((((y + 7) % 14) + 14) % 14) - 7;
        s.obj.position.y = y;
        s.obj.position.x = s.base.x * (small ? 0.65 : 1) - pointer.x * 0.25 * s.depth;
      });

      renderer.render(scene, camera);
      if (first) {
        first = false;
        el.classList.add("is-ready");
        markSceneReady();
      }
    };
    gsap.ticker.add(render);

    const canvas = renderer.domElement;
    const onLost = (e: Event) => {
      e.preventDefault();
      lost = true;
      el.classList.add("is-failed");
    };
    canvas.addEventListener("webglcontextlost", onLost);

    return () => {
      gsap.ticker.remove(render);
      offIntro();
      ScrollTrigger.removeEventListener("refresh", measure);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("resize", onResize);
      window.clearTimeout(resizeT);
      canvas.removeEventListener("webglcontextlost", onLost);
      gsap.killTweensOf(uniforms.uIntro);
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      canvas.remove();
    };
  }, []);

  return <div ref={host} className="scene-canvas" aria-hidden="true" />;
}
