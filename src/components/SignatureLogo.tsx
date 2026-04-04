import { useId } from "react";

export function SignatureLogo() {
  const ringGradId = `sig-ring-${useId().replace(/:/g, "")}`;

  return (
    <a
      className="navbar-brand signature-brand mb-0"
      href="#home"
      aria-label="Abhilash — Home"
    >
      <span className="signature-brand-inner">
        <span className="signature-stack">
          <span className="signature-ring-wrap" aria-hidden="true">
            <svg
              className="signature-ring-svg"
              viewBox="0 0 220 90"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <linearGradient
                  id={ringGradId}
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="rgba(0, 84, 166, 0.55)" />
                  <stop offset="50%" stopColor="rgba(0, 174, 239, 0.35)" />
                  <stop offset="100%" stopColor="rgba(255, 255, 255, 0.25)" />
                </linearGradient>
              </defs>
              <ellipse
                cx="110"
                cy="42"
                rx="102"
                ry="36"
                fill="none"
                stroke={`url(#${ringGradId})`}
                strokeWidth="0.9"
                transform="rotate(-3 110 42)"
              />
            </svg>
          </span>

          <span className="signature-script">Abhilash</span>

          <span className="signature-underline" aria-hidden="true">
            <span className="signature-underline-line" />
            <span className="signature-underline-dots">
              <span />
              <span />
            </span>
          </span>

          <span className="signature-caps">Neelam</span>
        </span>
      </span>
    </a>
  );
}
