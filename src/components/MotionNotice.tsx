import { useState } from "react";
import { MOTION_OVERRIDE, OS_REDUCED, setMotionOverride } from "../lib/motion";

/**
 * Shown only when the operating system requests reduced motion and the
 * visitor hasn't chosen yet — explains why the 3D experience is paused and
 * offers to turn it on.
 */
export function MotionNotice() {
  const [open, setOpen] = useState(OS_REDUCED && MOTION_OVERRIDE === null);
  if (!open) return null;

  return (
    <div className="motion-notice" role="region" aria-label="Animation settings">
      <p>
        <strong>3D animations are paused</strong> because your device has &ldquo;reduce motion&rdquo; turned on.
      </p>
      <div className="motion-notice-actions">
        <button type="button" className="motion-notice-on" onClick={() => setMotionOverride("on")}>
          Turn on 3D
        </button>
        <button
          type="button"
          className="motion-notice-off"
          onClick={() => {
            setOpen(false);
            setMotionOverride("off");
          }}
        >
          Keep it calm
        </button>
      </div>
    </div>
  );
}
