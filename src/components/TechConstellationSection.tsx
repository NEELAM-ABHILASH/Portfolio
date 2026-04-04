import { useId } from "react";

const TECH_TOP: { label: string; slug: string }[] = [
  { label: "HTML5", slug: "html5" },
  { label: "CSS3", slug: "css3" },
  { label: "Bootstrap", slug: "bootstrap" },
  { label: "JavaScript", slug: "javascript" },
  { label: "TypeScript", slug: "typescript" },
  { label: "React", slug: "react" },
];

const TECH_BOTTOM: { label: string; slug: string }[] = [
  { label: "Node.js", slug: "nodedotjs" },
  { label: "Java", slug: "openjdk" },
  { label: "SQL", slug: "mysql" },
  { label: "Flutter", slug: "flutter" },
  { label: "Dart", slug: "dart" },
];

/** One path per icon — converge toward orb (viewBox 400×220) */
const CONNECTOR_PATHS = [
  "M 32 14 Q 72 92 200 172",
  "M 76 14 Q 108 98 200 172",
  "M 120 14 Q 142 104 200 172",
  "M 164 14 Q 172 110 200 172",
  "M 200 14 Q 200 112 200 172",
  "M 236 14 Q 228 110 200 172",
  "M 280 14 Q 258 104 200 172",
  "M 48 52 Q 96 118 200 172",
  "M 112 52 Q 138 124 200 172",
  "M 176 52 Q 188 128 200 172",
  "M 224 52 Q 212 128 200 172",
  "M 288 52 Q 262 124 200 172",
  "M 352 52 Q 304 118 200 172",
];

// Use Devicons CDN for icons not in Simple Icons or that render broken
const DEVICON_URLS: Record<string, string> = {
  css3:    "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg",
  html5:   "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg",
  openjdk: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg",
  mysql:   "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg",
  flutter: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flutter/flutter-original.svg",
  dart:    "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/dart/dart-original.svg",
};

const SIMPLEICON_COLORS: Record<string, string> = {
  nextdotjs: "ffffff",
  bootstrap:  "7952B3",
};

function iconSrc(slug: string): string {
  if (DEVICON_URLS[slug]) return DEVICON_URLS[slug];
  const color = SIMPLEICON_COLORS[slug];
  return color
    ? `https://cdn.simpleicons.org/${slug}/${color}`
    : `https://cdn.simpleicons.org/${slug}`;
}

function OrbGlyph() {
  return (
    <svg
      className="tc-orb-glyph"
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M14 12 L28 24 L14 36 L18 24 L14 12 M28 12 L34 18 L28 24 M22 30 L34 36"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    </svg>
  );
}

export function TechConstellationSection() {
  const uid = useId().replace(/:/g, "");
  const lineGradId = `tc-line-${uid}`;
  const orbitGradId = `tc-orbit-${uid}`;

  return (
    <section className="tc-section intro-tech" aria-labelledby="tc-heading">
      <div className="pf-container tc-inner">
        <h2 id="tc-heading" className="tc-heading">
          I&apos;m currently looking to join a{" "}
          <span className="tc-heading-gradient">cross-functional</span> team
        </h2>
        <p className="tc-sub">
          that ships clean, scalable code and builds products developers are proud of
        </p>

        <div className="tc-cluster">
          <div className="tc-icon-rows">
            <ul className="tc-row tc-row--top">
              {TECH_TOP.map(({ label, slug }) => (
                <li key={slug}>
                  <div className="tc-icon-wrap" data-label={label}>
                    <img
                      className="tc-icon-img"
                      src={iconSrc(slug)}
                      alt={label}
                      width={44}
                      height={44}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                </li>
              ))}
            </ul>
            <ul className="tc-row tc-row--bottom">
              {TECH_BOTTOM.map(({ label, slug }) => (
                <li key={slug}>
                  <div className="tc-icon-wrap" data-label={label}>
                    <img
                      className="tc-icon-img"
                      src={iconSrc(slug)}
                      alt={label}
                      width={44}
                      height={44}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="tc-orb-stage">
            <svg
              className="tc-connectors-svg"
              viewBox="0 0 400 220"
              preserveAspectRatio="xMidYMax meet"
              aria-hidden="true"
            >
              <defs>
                <linearGradient
                  id={lineGradId}
                  x1="0%"
                  y1="0%"
                  x2="0%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="rgba(168, 85, 247, 0.06)" />
                  <stop offset="50%" stopColor="rgba(168, 85, 247, 0.32)" />
                  <stop offset="100%" stopColor="rgba(168, 85, 247, 0.5)" />
                </linearGradient>
              </defs>
              {CONNECTOR_PATHS.map((d, i) => (
                <path
                  key={i}
                  className="tc-connector-path"
                  d={d}
                  fill="none"
                  stroke={`url(#${lineGradId})`}
                  strokeWidth="0.7"
                  strokeLinecap="round"
                  pathLength="1"
                  style={{ animationDelay: `${i * 0.05}s` }}
                />
              ))}
            </svg>

            <div className="tc-orb-visual">
              <svg
                className="tc-orbits-svg"
                viewBox="0 0 320 220"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient
                    id={orbitGradId}
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop offset="0%" stopColor="rgba(168, 85, 247, 0.12)" />
                    <stop offset="50%" stopColor="rgba(168, 85, 247, 0.42)" />
                    <stop offset="100%" stopColor="rgba(168, 85, 247, 0.12)" />
                  </linearGradient>
                </defs>

                <g transform="translate(160, 118)">
                  <g>
                    <animateTransform
                      attributeName="transform"
                      type="rotate"
                      from="0 0 0"
                      to="360 0 0"
                      dur="52s"
                      repeatCount="indefinite"
                    />
                    <ellipse
                      className="tc-orbit-ring"
                      rx="118"
                      ry="34"
                      fill="none"
                      stroke={`url(#${orbitGradId})`}
                      strokeWidth="0.85"
                      strokeDasharray="3 6"
                    />
                    <circle
                      className="tc-orbit-dot"
                      cx="118"
                      cy="0"
                      r="2.5"
                      fill="rgba(168,85,247,0.5)"
                    />
                    <circle
                      className="tc-orbit-dot"
                      cx="-118"
                      cy="0"
                      r="2"
                      fill="rgba(129,140,248,0.38)"
                    />
                  </g>
                </g>

                <g transform="translate(160, 118)">
                  <g>
                    <animateTransform
                      attributeName="transform"
                      type="rotate"
                      from="360 0 0"
                      to="0 0 0"
                      dur="68s"
                      repeatCount="indefinite"
                    />
                    <ellipse
                      rx="138"
                      ry="42"
                      fill="none"
                      stroke="rgba(168, 85, 247, 0.2)"
                      strokeWidth="0.7"
                      strokeDasharray="2 5"
                    />
                    <circle
                      className="tc-orbit-dot"
                      cx="0"
                      cy="-42"
                      r="2"
                      fill="rgba(167,139,250,0.42)"
                    />
                  </g>
                </g>

                <g transform="translate(160, 118)">
                  <g>
                    <animateTransform
                      attributeName="transform"
                      type="rotate"
                      from="0 0 0"
                      to="360 0 0"
                      dur="88s"
                      repeatCount="indefinite"
                    />
                    <ellipse
                      rx="158"
                      ry="50"
                      fill="none"
                      stroke="rgba(168, 85, 247, 0.1)"
                      strokeWidth="0.55"
                      strokeDasharray="2 8"
                    />
                    <circle
                      className="tc-orbit-dot"
                      cx="-158"
                      cy="0"
                      r="1.8"
                      fill="rgba(168,85,247,0.32)"
                    />
                  </g>
                </g>
              </svg>

              <div className="tc-orb-core-wrap">
                <div className="tc-orb-halo" aria-hidden="true" />
                <div className="tc-orb-core">
                  <OrbGlyph />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
