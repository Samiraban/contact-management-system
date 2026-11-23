
import { useState } from "react";
import {
  ArrowRight,
  BookUser,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck
} from "lucide-react";

import api, { errorMessage } from "../api";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await api.post("/auth/login", {
        email,
        password
      });

      onLogin(data);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page login-page-new">
      <div className="login-layout login-layout-new is-login">

        <section className="login-form-panel login-form-panel-new">

          <div className="login-brand login-brand-new">
            <div className="brand-mark">
              <BookUser size={22} />
            </div>

            <span>
              Contact Management <b>System</b>
            </span>
          </div>

          <div className="login-card login-card-new">

            <div className="login-kicker">
              <span className="login-kicker-dot" />
              ADMINISTRATOR ACCESS
            </div>

            <h1>
              Sign <em>in.</em>
            </h1>

            <p className="login-subtitle">
              Sign in with your administrator credentials to continue.
            </p>

            {error && (
              <div className="form-alert" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={submit}>

              <div className="field">
                <label htmlFor="admin-email">
                  Email address
                </label>

                <div className="input-icon-wrap input-icon-wrap-new">
                  <Mail size={18} />

                  <input
                    id="admin-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="field">
                <label htmlFor="admin-password">
                  Password
                </label>

                <div className="input-icon-wrap input-icon-wrap-new">
                  <LockKeyhole size={18} />

                  <input
                    id="admin-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword
                      ? <EyeOff size={18} />
                      : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="primary-button login-submit login-submit-new"
                disabled={loading}
              >
                <span>
                  {loading ? "Signing in..." : "Sign in"}
                </span>

                <ArrowRight size={18} />
              </button>

            </form>

            <div className="login-security login-security-new">
              <ShieldCheck size={16} />
              Administrator access
            </div>

          </div>

          <div className="login-bottom-note">
            © {new Date().getFullYear()} Contact Management System
          </div>

        </section>

        <aside className="login-visual-panel">

          <div className="visual-overlay-shape visual-shape-one" />
          <div className="visual-overlay-shape visual-shape-two" />

          <div className="visual-content">

            <span className="visual-tag">
              CONTACT DIRECTORY
            </span>

            <h2>
              Your contacts.<br />
              <em>One workspace.</em>
            </h2>

            <p>
              Keep contact details, company information and
              important records organised in one place.
            </p>

            <div className="visual-feature">

              <div className="visual-feature-icon">
                <BookUser size={19} />
              </div>

              <div>
                <strong>Contact records</strong>

                <span>
                  Add, update and manage your directory.
                </span>
              </div>

            </div>

          </div>

          <div className="visual-caption">
            <span />
            Contact Management System
          </div>

        </aside>

      </div>
    </main>
  );
}
