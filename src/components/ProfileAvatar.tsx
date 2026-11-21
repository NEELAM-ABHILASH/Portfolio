import type { CSSProperties } from "react";
import profilePhoto from "../assets/Profile.png";
import { profile } from "../data/portfolio";

const depth = (d: number) => ({ "--depth": d }) as CSSProperties;

/**
 * Portrait as a layered 3D card (used inside a TiltCard):
 *  - a blurred glow plate floating behind the photo,
 *  - the photo filling a tall rounded rectangle, with a holographic sheen
 *    and HUD corner brackets,
 *  - two orbit rings that pass *through* the photo plane — the front arc
 *    sweeps over the photo, the back arc goes behind it,
 *  - badges floating at different depths.
 * The whole stack sways gently on its own so the depth reads on touch screens too.
 */
export function ProfileAvatar() {
  return (
    <div className="avatar">
      <div className="avatar-plate tilt-layer" style={depth(-70)} aria-hidden="true" />

      <div className="avatar-frame tilt-layer" style={depth(10)} data-frag-item>
        <img
          src={profilePhoto}
          alt={`${profile.firstName} ${profile.lastName}`}
          loading="eager"
          fetchPriority="high"
        />
        <span className="avatar-shade" aria-hidden="true" />
        <span className="avatar-sheen" aria-hidden="true" />
        <span className="avatar-corners" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </span>
        <span className="avatar-caption" aria-hidden="true">
          <span className="avatar-caption-name">
            {profile.firstName} {profile.lastName}
          </span>
          <span className="avatar-caption-role">{profile.role}</span>
        </span>
      </div>

      <div className="avatar-orbit avatar-orbit--a" aria-hidden="true">
        <span />
      </div>
      <div className="avatar-orbit avatar-orbit--b" aria-hidden="true">
        <span />
      </div>

      <span className="avatar-badge avatar-badge--tl tilt-layer" style={depth(90)} data-frag-item>
        <strong>3+</strong> yrs React
      </span>
      <span className="avatar-badge avatar-badge--br tilt-layer" style={depth(75)} data-frag-item>
        UEM · 5 platforms
      </span>
      <span
        className="avatar-badge avatar-badge--r tilt-layer"
        style={depth(110)}
        data-frag-item
        aria-hidden="true"
      >
        {"</>"}
      </span>
    </div>
  );
}
