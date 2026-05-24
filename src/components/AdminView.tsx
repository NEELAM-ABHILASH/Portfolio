import { useState } from "react";

interface Entry {
  _id: string;
  name: string;
  location: string;
  currentRole: string;
  currentCompany: string;
  contact: string;
  suggestions: string;
  createdAt: string;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function AdminView() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [touched, setTouched] = useState(false);

  const passwordError =
    touched && password.trim() === "" ? "Password is required." : "";

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    setTouched(true);
    if (password.trim() === "") return;

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL ?? ""}/api/admin/view`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const json = await res.json();

      if (res.ok && json.success) {
        setEntries(json.data);
        setStatus("success");
        setPassword("");
        setTouched(false);
      } else {
        setStatus("error");
        setErrorMsg(json.message || "Access denied.");
      }
    } catch {
      setStatus("error");
      setErrorMsg("Network error. Please check your connection.");
    }
  }

  return (
    <section className="av-section">
      <div className="pf-container">
        <div className="av-card">
          {/* — Header — */}
          <div className="av-header">
            <span className="av-eyebrow">Admin Access</span>
            <h2 className="av-title">View Submissions</h2>
            <p className="av-subtitle">
              Enter the admin password to view all submitted form data.
            </p>
          </div>

          {/* — Password form — */}
          <form onSubmit={handleSubmit} noValidate className="av-form">
            <div className="av-input-row">
              <div className="av-field">
                <label htmlFor="av-password" className="av-label">
                  Admin Password
                </label>
                <div className="av-input-wrap">
                  <input
                    id="av-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (status === "error") {
                        setStatus("idle");
                        setErrorMsg("");
                      }
                    }}
                    onBlur={() => setTouched(true)}
                    className={`av-input${passwordError || status === "error" ? " av-input--error" : ""}`}
                    placeholder="Enter admin password"
                    autoComplete="current-password"
                    aria-describedby={passwordError ? "av-pw-err" : undefined}
                    aria-invalid={!!passwordError || status === "error"}
                  />
                  <button
                    type="button"
                    className="av-eye-btn"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <svg
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06l-1.745-1.745a10.029 10.029 0 003.3-4.38 1.651 1.651 0 000-1.185A10.004 10.004 0 009.999 3a9.956 9.956 0 00-4.744 1.194L3.28 2.22zM7.752 6.69l1.092 1.092a2.5 2.5 0 013.374 3.373l1.091 1.092a4 4 0 00-5.557-5.557z"
                          clipRule="evenodd"
                        />
                        <path d="M10.748 13.93l2.523 2.523a10.003 10.003 0 01-8.516-1.168l1.338-1.338a8.003 8.003 0 006.655-.017zM4.222 9.005l1.472 1.473A4.012 4.012 0 005.5 12a4.5 4.5 0 004.5 4.5c.568 0 1.112-.105 1.614-.295l1.19 1.19A8 8 0 014.222 9.005z" />
                      </svg>
                    ) : (
                      <svg
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                        <path
                          fillRule="evenodd"
                          d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>
                </div>
                {passwordError && (
                  <span id="av-pw-err" className="av-field-error" role="alert">
                    {passwordError}
                  </span>
                )}
                {status === "error" && errorMsg && (
                  <span className="av-field-error" role="alert">
                    {errorMsg}
                  </span>
                )}
              </div>

              <button
                type="submit"
                className="av-submit"
                disabled={status === "loading"}
                aria-busy={status === "loading"}
              >
                {status === "loading" ? (
                  <>
                    <span className="av-spinner" aria-hidden="true" />{" "}
                    Verifying…
                  </>
                ) : (
                  <>
                    <svg
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                      className="av-submit-icon"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Unlock
                  </>
                )}
              </button>
            </div>
          </form>

          {/* — Data table — */}
          {status === "success" && (
            <div
              className="av-table-wrap"
              role="region"
              aria-label="Submitted form entries"
            >
              <div className="av-table-meta">
                <span className="av-table-count">
                  {entries.length} submission{entries.length !== 1 ? "s" : ""}
                </span>
                <button
                  type="button"
                  className="av-clear-btn"
                  onClick={() => {
                    setEntries([]);
                    setStatus("idle");
                  }}
                >
                  Hide data
                </button>
              </div>

              {entries.length === 0 ? (
                <p className="av-empty">No submissions yet.</p>
              ) : (
                <div className="av-scroll">
                  <table className="av-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>Location</th>
                        <th>Role</th>
                        <th>Company</th>
                        <th>Contact</th>
                        <th>Suggestions</th>
                        <th>Submitted</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entries.map((entry, i) => (
                        <tr key={entry._id}>
                          <td className="av-td-num">{i + 1}</td>
                          <td>{entry.name}</td>
                          <td>{entry.location}</td>
                          <td>{entry.currentRole}</td>
                          <td>{entry.currentCompany}</td>
                          <td>
                            <a
                              href={
                                entry.contact.includes("@")
                                  ? `mailto:${entry.contact}`
                                  : `tel:${entry.contact}`
                              }
                              className="av-contact-link"
                            >
                              {entry.contact}
                            </a>
                          </td>
                          <td className="av-td-suggestions">
                            {entry.suggestions || (
                              <span className="av-none">—</span>
                            )}
                          </td>
                          <td className="av-td-date">
                            {formatDate(entry.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
