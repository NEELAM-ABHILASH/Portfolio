import { lazy, Suspense, useState } from "react";
import { hasWebGL, markSceneReady, prefersReducedMotion } from "../lib/motion";

// three.js lives in its own chunk so the page shell paints first.
const ParticleScene = lazy(() => import("./three/ParticleScene"));

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

  return (
    <div className="backdrop" aria-hidden="true">
      <div className="backdrop-aurora" />
      <div className="backdrop-grid" />
      {use3D && (
        <Suspense fallback={null}>
          <ParticleScene />
        </Suspense>
      )}
      <div className="backdrop-vignette" />
      <div className="backdrop-grain" />
    </div>
  );
}
