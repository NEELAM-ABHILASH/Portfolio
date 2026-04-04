import { ProfileAvatar } from "./ProfileAvatar";
import { TypingRole } from "./TypingRole";

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
