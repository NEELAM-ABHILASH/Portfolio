const highlights = [
  { icon: "⬡", label: "React Developer", sub: "2 Years Experience" },
  { icon: "⬡", label: "UEM Platform", sub: "Android · iOS · macOS · Linux" },
  { icon: "⬡", label: "Full-Stack Growth", sub: "Mobile & Backend" },
];

const skills = [
  "Javascript",
  "Typescript",
  "React",
  "Redux / Context API",
  "REST API Integration",
  "RSA Encryption",
  "Performance Optimisation",
];

export function WorkExperience() {
  return (
    <section id="experience" className="we-section">
      {/* Subtle top separator */}
      <div className="we-separator" aria-hidden="true" />

      <div className="pf-container">
        {/* Section label */}
        <p className="we-eyebrow">Work Experience</p>

        <div className="we-grid">
          {/* ── Left: timeline card ── */}
          <div className="we-card">
            <div className="we-timeline-dot" aria-hidden="true" />
            <div className="we-card-head">
              <span className="we-role">React Developer</span>
              <span className="we-badge">2 yrs</span>
            </div>
            <p className="we-company">
              Tectoro Consulting Pvt. Ltd. &mdash; Hyderabad
            </p>

            <p className="we-body">
              Built and maintained a{" "}
              <strong>Unified Endpoint Management (UEM)</strong> platform,
              delivering scalable device management across Android, iOS, macOS,
              and Linux.
            </p>
            <p className="we-body">
              Led features including{" "}
              <strong>device enrollment, policy management,</strong> and{" "}
              <strong>role-based access control</strong>. Integrated REST APIs,
              managed state with Redux / Context API, and implemented RSA-based
              encryption for secure data flows.
            </p>
            <p className="we-body mb-0">
              Focused on clean, maintainable code, performance improvements, and
              effective collaboration with cross-functional teams. Currently
              expanding expertise in full-stack and mobile application
              development.
            </p>
          </div>

          {/* ── Right: highlights + skills ── */}
          <div className="we-aside">
            <div className="we-highlights">
              {highlights.map((h) => (
                <div key={h.label} className="we-highlight-item">
                  <span className="we-highlight-icon" aria-hidden="true">
                    {h.icon}
                  </span>
                  <div>
                    <p className="we-highlight-label">{h.label}</p>
                    <p className="we-highlight-sub">{h.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="we-skills">
              <p className="we-skills-heading">Core Skills</p>
              <div className="we-skill-tags">
                {skills.map((s) => (
                  <span key={s} className="we-skill-tag">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
