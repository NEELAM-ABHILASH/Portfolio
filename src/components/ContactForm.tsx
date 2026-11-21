import { useState, useId, useEffect } from "react";
import { AdminView } from "./AdminView";
import { useGsap } from "../hooks/useGsap";
import { gsap, MQ } from "../lib/motion";

/** Presentation only: the card opens like a portal out of the page's depth. */
function useContactMotion() {
  return useGsap<HTMLElement>((_, root) => {
    const mm = gsap.matchMedia();
    mm.add(MQ.motion, () => {
      const card = root.querySelector<HTMLElement>(".cf-card");
      const rings = root.querySelectorAll<HTMLElement>(".cf-portal-ring");
      gsap
        .timeline({
          scrollTrigger: {
            trigger: root,
            start: "top 75%",
            toggleActions: "play none none reverse",
          },
        })
        .fromTo(
          rings,
          { scale: 0, opacity: 0, rotation: -90 },
          {
            scale: 1,
            opacity: 1,
            rotation: 0,
            duration: 1.4,
            ease: "expo.out",
            stagger: 0.12,
          },
        )
        .fromTo(
          card,
          {
            scale: 0.55,
            z: -600,
            rotationX: 35,
            opacity: 0,
            clipPath: "circle(0% at 50% 50%)",
          },
          {
            scale: 1,
            z: 0,
            rotationX: 0,
            opacity: 1,
            clipPath: "circle(150% at 50% 50%)",
            duration: 1.4,
            ease: "expo.out",
            clearProps: "clipPath,transform",
          },
          0.15,
        )
        .from(
          root.querySelectorAll(".cf-header > *, .cf-field, .cf-actions"),
          {
            y: 34,
            opacity: 0,
            rotationX: -40,
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.05,
          },
          0.6,
        );
    });
    return () => mm.revert();
  });
}

interface FormState {
  name: string;
  location: string;
  currentRole: string;
  currentCompany: string;
  contact: string;
  suggestions: string;
}

interface FieldErrors {
  name?: string;
  location?: string;
  currentRole?: string;
  currentCompany?: string;
  contact?: string;
  suggestions?: string;
}

const EMPTY_FORM: FormState = {
  name: "",
  location: "",
  currentRole: "",
  currentCompany: "",
  contact: "",
  suggestions: "",
};

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidPhone(value: string): boolean {
  return /^[+]?[\d\s\-().]{7,20}$/.test(value);
}

function validateForm(fields: FormState): FieldErrors {
  const errors: FieldErrors = {};

  if (!fields.name.trim()) {
    errors.name = "Name is required.";
  } else if (fields.name.trim().length > 120) {
    errors.name = "Name must be 120 characters or fewer.";
  }

  if (!fields.location.trim()) {
    errors.location = "Location is required.";
  } else if (fields.location.trim().length > 200) {
    errors.location = "Location must be 200 characters or fewer.";
  }

  if (!fields.currentRole.trim()) {
    errors.currentRole = "Current role is required.";
  } else if (fields.currentRole.trim().length > 150) {
    errors.currentRole = "Role must be 150 characters or fewer.";
  }

  if (!fields.currentCompany.trim()) {
    errors.currentCompany = "Current company is required.";
  } else if (fields.currentCompany.trim().length > 150) {
    errors.currentCompany = "Company must be 150 characters or fewer.";
  }

  if (!fields.contact.trim()) {
    errors.contact = "Email or phone is required.";
  } else if (
    !isValidEmail(fields.contact.trim()) &&
    !isValidPhone(fields.contact.trim())
  ) {
    errors.contact = "Enter a valid email address or phone number.";
  }

  if (fields.suggestions.trim().length > 2000) {
    errors.suggestions = "Suggestions must be 2000 characters or fewer.";
  }

  return errors;
}

export function ContactForm() {
  const uid = useId();
  const id = (field: string) => `${uid}-${field}`;
  const sectionRef = useContactMotion();

  const [adminOpen, setAdminOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [touched, setTouched] = useState<
    Partial<Record<keyof FormState, boolean>>
  >({});
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [serverMessage, setServerMessage] = useState("");

  useEffect(() => {
    if (status !== "success" && status !== "error") return;
    const t = window.setTimeout(() => setStatus("idle"), 4000);
    return () => window.clearTimeout(t);
  }, [status]);

  function handleChange(e: { target: { name: string; value: string } }) {
    const { name, value } = e.target;
    const updated = { ...form, [name]: value };
    setForm(updated);
    if (touched[name as keyof FormState]) {
      const errs = validateForm(updated);
      setFieldErrors((prev) => ({
        ...prev,
        [name]: errs[name as keyof FieldErrors],
      }));
    }
  }

  function handleBlur(e: { target: { name: string } }) {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const errs = validateForm(form);
    setFieldErrors((prev) => ({
      ...prev,
      [name]: errs[name as keyof FieldErrors],
    }));
  }

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    const allTouched = Object.fromEntries(
      Object.keys(form).map((k) => [k, true]),
    ) as Record<keyof FormState, boolean>;
    setTouched(allTouched);
    const errs = validateForm(form);
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setStatus("submitting");
    setServerMessage("");

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL ?? ""}/api/form`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setStatus("success");
        setForm(EMPTY_FORM);
        setTouched({});
        setFieldErrors({});
      } else if (
        res.status === 409 ||
        (json.errors ?? []).some((e: { path: string }) => e.path === "contact")
      ) {
        // Duplicate contact — surface the error directly under the field
        const msg =
          json.errors?.find((e: { path: string }) => e.path === "contact")
            ?.msg ??
          json.message ??
          "This email or phone number has already been submitted.";
        setFieldErrors((prev) => ({ ...prev, contact: msg }));
        setTouched((prev) => ({ ...prev, contact: true }));
        setStatus("idle");
      } else {
        setStatus("error");
        setServerMessage(
          json.message || "Submission failed. Please try again.",
        );
      }
    } catch {
      setStatus("error");
      setServerMessage(
        "Network error. Please check your connection and try again.",
      );
    }
  }

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="cf-section"
      data-section="contact"
    >
      <div className="cf-portal" aria-hidden="true">
        <span className="cf-portal-ring cf-portal-ring--a" />
        <span className="cf-portal-ring cf-portal-ring--b" />
        <span className="cf-portal-ring cf-portal-ring--c" />
      </div>

      <div className="pf-container">
        <div className="cf-card">
          {/* — Section header — */}
          <div className="cf-header">
            <span className="cf-eyebrow">Get in Touch</span>
            <h2 className="cf-title">Let&apos;s Connect</h2>
            <p className="cf-subtitle">
              Fill in your details below and I&rsquo;ll get back to you as soon
              as possible.
            </p>
          </div>

          {/* — Success banner — */}
          {status === "success" && (
            <div
              className="cf-alert cf-alert--success"
              role="alert"
              aria-live="polite"
            >
              <svg
                className="cf-alert-icon"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Message received! I&rsquo;ll be in touch soon.</span>
            </div>
          )}

          {/* — Error banner — */}
          {status === "error" && serverMessage && (
            <div
              className="cf-alert cf-alert--error"
              role="alert"
              aria-live="polite"
            >
              <svg
                className="cf-alert-icon"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{serverMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="cf-form">
            {/* — Row 1: Name + Location — */}
            <div className="cf-row">
              <div className="cf-field">
                <label htmlFor={id("name")} className="cf-label">
                  Name{" "}
                  <span className="cf-required" aria-hidden="true">
                    *
                  </span>
                </label>
                <input
                  id={id("name")}
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`cf-input${fieldErrors.name ? " cf-input--error" : ""}`}
                  placeholder="Your full name"
                  autoComplete="name"
                  aria-required="true"
                  aria-describedby={
                    fieldErrors.name ? id("name-err") : undefined
                  }
                  aria-invalid={!!fieldErrors.name}
                />
                {fieldErrors.name && (
                  <span
                    id={id("name-err")}
                    className="cf-field-error"
                    role="alert"
                  >
                    {fieldErrors.name}
                  </span>
                )}
              </div>

              <div className="cf-field">
                <label htmlFor={id("location")} className="cf-label">
                  Location{" "}
                  <span className="cf-required" aria-hidden="true">
                    *
                  </span>
                </label>
                <input
                  id={id("location")}
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`cf-input${fieldErrors.location ? " cf-input--error" : ""}`}
                  placeholder="City, Country"
                  autoComplete="address-level2"
                  aria-required="true"
                  aria-describedby={
                    fieldErrors.location ? id("location-err") : undefined
                  }
                  aria-invalid={!!fieldErrors.location}
                />
                {fieldErrors.location && (
                  <span
                    id={id("location-err")}
                    className="cf-field-error"
                    role="alert"
                  >
                    {fieldErrors.location}
                  </span>
                )}
              </div>
            </div>

            {/* — Row 2: Current Role + Current Company — */}
            <div className="cf-row">
              <div className="cf-field">
                <label htmlFor={id("currentRole")} className="cf-label">
                  Current Role{" "}
                  <span className="cf-required" aria-hidden="true">
                    *
                  </span>
                </label>
                <input
                  id={id("currentRole")}
                  type="text"
                  name="currentRole"
                  value={form.currentRole}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`cf-input${fieldErrors.currentRole ? " cf-input--error" : ""}`}
                  placeholder="e.g. Senior Frontend Developer"
                  autoComplete="organization-title"
                  aria-required="true"
                  aria-describedby={
                    fieldErrors.currentRole ? id("role-err") : undefined
                  }
                  aria-invalid={!!fieldErrors.currentRole}
                />
                {fieldErrors.currentRole && (
                  <span
                    id={id("role-err")}
                    className="cf-field-error"
                    role="alert"
                  >
                    {fieldErrors.currentRole}
                  </span>
                )}
              </div>

              <div className="cf-field">
                <label htmlFor={id("currentCompany")} className="cf-label">
                  Current Company{" "}
                  <span className="cf-required" aria-hidden="true">
                    *
                  </span>
                </label>
                <input
                  id={id("currentCompany")}
                  type="text"
                  name="currentCompany"
                  value={form.currentCompany}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`cf-input${fieldErrors.currentCompany ? " cf-input--error" : ""}`}
                  placeholder="e.g. Acme Corp"
                  autoComplete="organization"
                  aria-required="true"
                  aria-describedby={
                    fieldErrors.currentCompany ? id("company-err") : undefined
                  }
                  aria-invalid={!!fieldErrors.currentCompany}
                />
                {fieldErrors.currentCompany && (
                  <span
                    id={id("company-err")}
                    className="cf-field-error"
                    role="alert"
                  >
                    {fieldErrors.currentCompany}
                  </span>
                )}
              </div>
            </div>

            {/* — Row 3: Email or Phone (full width) — */}
            <div className="cf-row cf-row--full">
              <div className="cf-field">
                <label htmlFor={id("contact")} className="cf-label">
                  Email or Phone{" "}
                  <span className="cf-required" aria-hidden="true">
                    *
                  </span>
                </label>
                <input
                  id={id("contact")}
                  type="text"
                  name="contact"
                  value={form.contact}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`cf-input${fieldErrors.contact ? " cf-input--error" : ""}`}
                  placeholder="you@example.com or +1 555 000 0000"
                  autoComplete="email"
                  aria-required="true"
                  aria-describedby={
                    fieldErrors.contact ? id("contact-err") : undefined
                  }
                  aria-invalid={!!fieldErrors.contact}
                />
                {fieldErrors.contact && (
                  <span
                    id={id("contact-err")}
                    className="cf-field-error"
                    role="alert"
                  >
                    {fieldErrors.contact}
                  </span>
                )}
              </div>
            </div>

            {/* — Row 4: Suggestions (full width) — */}
            <div className="cf-row cf-row--full">
              <div className="cf-field">
                <label htmlFor={id("suggestions")} className="cf-label">
                  Suggestions or Areas to Improve
                  <span className="cf-optional"> (optional)</span>
                </label>
                <textarea
                  id={id("suggestions")}
                  name="suggestions"
                  value={form.suggestions}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`cf-textarea${fieldErrors.suggestions ? " cf-input--error" : ""}`}
                  placeholder="Share any feedback, suggestions, or areas you'd like me to improve…"
                  rows={5}
                  aria-describedby={
                    fieldErrors.suggestions
                      ? id("suggestions-err")
                      : id("suggestions-hint")
                  }
                  aria-invalid={!!fieldErrors.suggestions}
                />
                {fieldErrors.suggestions ? (
                  <span
                    id={id("suggestions-err")}
                    className="cf-field-error"
                    role="alert"
                  >
                    {fieldErrors.suggestions}
                  </span>
                ) : (
                  <span id={id("suggestions-hint")} className="cf-hint">
                    {form.suggestions.length} / 2000 characters
                  </span>
                )}
              </div>
            </div>

            {/* — Submit row + Admin Access toggle — */}
            <div className="cf-actions">
              <button
                type="button"
                className={`cf-admin-toggle${adminOpen ? " cf-admin-toggle--active" : ""}`}
                onClick={() => setAdminOpen((v) => !v)}
                aria-expanded={adminOpen}
              >
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                  className="cf-admin-toggle-icon"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z"
                    clipRule="evenodd"
                  />
                </svg>
                {adminOpen ? "Disable Admin Access" : "Admin Access"}
              </button>

              <button
                type="submit"
                className="cf-submit"
                disabled={status === "submitting"}
                aria-busy={status === "submitting"}
              >
                {status === "submitting" ? (
                  <>
                    <span className="cf-spinner" aria-hidden="true" />
                    Sending…
                  </>
                ) : (
                  <>
                    Send Message
                    <svg
                      className="cf-submit-icon"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* — Admin panel — rendered outside cf-card, below the section — */}
      {adminOpen && <AdminView />}
    </section>
  );
}
