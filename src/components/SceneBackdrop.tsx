import { lazy, Suspense, useEffect, useState } from "react";
import { hasWebGL, markSceneReady, onIntro, prefersReducedMotion } from "../lib/motion";

// three.js lives in its own chunk so the page shell paints first.
const ParticleScene = lazy(() => import("./three/ParticleScene"));

/**
 * Phones and tablets: parsing three.js and building the scene is a few hundred
 * ms of main-thread work on a mobile CPU. Doing that while the preloader is
 * animating made it stutter, so on these devices the scene is mounted only
 * after the intro has finished (≈ preloader exit + hero text reassembly), when
 * the browser is idle. It fades in and bursts into place on its own.
 */
const DEFER_AFTER_INTRO_MS = 4700;

function shouldDefer() {
  return window.matchMedia("(max-width: 767.98px), (pointer: coarse)").matches;
}

/**
 * Page-wide background. Capable devices get the WebGL particle field;
 * reduced-motion or no-WebGL visitors get a static layered gradient.
 */
export function SceneBackdrop() {
  const [use3D] = useState(() => {
    const ok = !prefersReducedMotion() && hasWebGL();
    if (!ok) markSceneReady();
    return ok;
  });
  const [defer] = useState(() => use3D && shouldDefer());
  const [mounted, setMounted] = useState(() => use3D && !defer);

  useEffect(() => {
    if (!defer) return;
    // don't make the preloader wait for a scene that isn't coming yet
    markSceneReady();
    let timer = 0;
    let idle = 0;
    const off = onIntro(() => {
      timer = window.setTimeout(() => {
        const mount = () => setMounted(true);
        if ("requestIdleCallback" in window) idle = window.requestIdleCallback(mount, { timeout: 1500 });
        else mount();
      }, DEFER_AFTER_INTRO_MS);
    });
    return () => {
      off();
      window.clearTimeout(timer);
      if (idle && "cancelIdleCallback" in window) window.cancelIdleCallback(idle);
    };
  }, [defer]);

  return (
    <div className="backdrop" aria-hidden="true">
      <div className="backdrop-aurora" />
      <div className="backdrop-grid" />
      {mounted && (
        <Suspense fallback={null}>
          <ParticleScene />
        </Suspense>
      )}
      <div className="backdrop-vignette" />
      <div className="backdrop-grain" />
    </div>
  );
}
