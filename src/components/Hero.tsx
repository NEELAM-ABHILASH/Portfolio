import { useId } from "react";
import { ProfileAvatar } from "./ProfileAvatar";
import { TypingRole } from "./TypingRole";

/** Curves toward the greeting; stroke uses animated gradient + flowing dash (see portfolio.css). */
function HeroArrow({ markerId, gradId }: { markerId: string; gradId: string }) {
  return (
    <svg
      className="hero-arrow-svg"
      viewBox="0 0 200 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id={gradId}
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1="0"
          x2="280"
          y2="0"
        >
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="42%" stopColor="#00aeef" />
          <stop offset="100%" stopColor="#0054a6" />
          <animateTransform
            attributeName="gradientTransform"
            type="translate"
            from="-100 0"
            to="160 0"
            dur="2.8s"
            repeatCount="indefinite"
          />
        </linearGradient>
        <marker
          id={markerId}
          markerWidth="9"
          markerHeight="9"
          refX="7"
          refY="4.5"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,0 L9,4.5 L0,9 z" fill="#e8fbff" />
        </marker>
      </defs>
      <path
        className="hero-arrow-path hero-arrow-path-glow"
        d="M 14 62 C 38 62 58 44 88 32 C 118 20 148 14 186 10"
        pathLength="1"
        stroke={`url(#${gradId})`}
        strokeWidth="2.35"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.38"
      />
      <path
        className="hero-arrow-path hero-arrow-path-core"
        d="M 14 62 C 38 62 58 44 88 32 C 118 20 148 14 186 10"
        pathLength="1"
        stroke={`url(#${gradId})`}
        strokeWidth="1.65"
        strokeLinecap="round"
        fill="none"
        markerEnd={`url(#${markerId})`}
      />
    </svg>
  );
}

function AccentRing() {
  return (
    <svg
      className="cover-ring-svg"
      viewBox="0 0 200 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <ellipse
        cx="100"
        cy="38"
        rx="92"
        ry="28"
        fill="none"
        stroke="rgba(255,255,255,0.92)"
        strokeWidth="2.25"
        strokeLinecap="round"
        transform="rotate(-2 100 38)"
      />
    </svg>
  );
}

export function Hero() {
  //   const uid = useId();
  //   const safe = uid.replace(/:/g, "");
  //   const arrowMarkerId = `hero-arrow-m-${safe}`;
  //   const arrowGradId = `hero-arrow-g-${safe}`;

  return (
    <section id="home" className="hero-section">
      <div className="pf-container pt-4 pt-lg-5">
        <div className="row hero-grid">
          <div className="col-12 col-lg-5 order-1 order-lg-1">
            <div className="hero-visual">
              <div className="hero-arrow-wrap animate-hero-arrow">
                {/* <HeroArrow markerId={arrowMarkerId} gradId={arrowGradId} /> */}
              </div>
              <div className="animate-profile-avatar">
                <ProfileAvatar />
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-7 order-2 order-lg-2">
            <div className="hero-copy">
              <p className="hello-line mb-0 animate-hello">
                Hello! I Am <span className="name-accent">Abhilash Neelam</span>
              </p>

              <div className="caret-wrap mt-1">
                <span className="caret-down" aria-hidden="true" />
              </div>

              <div className="headline-block animate-headline">
                <p className="headline-prefix">How I build</p>
                <h1 className="headline-main">
                  <span className="d-block">Pragmatic engineering,</span>
                  <span className="headline-line2 cover-line">
                    <span>interfaces people</span>{" "}
                    <span className="cover-wrap">
                      <AccentRing />
                      <span className="cover-word">trust</span>
                    </span>
                    <span>.</span>
                  </span>
                </h1>
              </div>

              <p className="headline-sub">
                Performance, accessibility, and maintainable React—balanced for
                users, teams, and the long run.
              </p>

              <div className="role-block animate-role-block">
                <TypingRole />
              </div>

              <p className="employment-line animate-employment">
                Currently, I&apos;m a React Developer at{" "}
                <span className="employment-company">
                  {/* <span className="company-dot" aria-hidden="true" /> */}
                  Tectoro Consulting Private Limited
                </span>
                , Hyderabad.
              </p>

              <p
                className="about-text mb-0 animate-about intro-about"
                id="about"
              >
                A passionate React Developer with 2+ years of experience. I
                build meaningful, dependable digital products that balance user
                needs with business goals.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
