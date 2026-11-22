
import { useState } from "react";
import {
  ArrowRight, BookUser, Eye, EyeOff, LockKeyhole, Mail,
  ShieldCheck, UserRound, KeyRound, CheckCircle2
} from "lucide-react";
import api, { errorMessage } from "../api";

export default function Login({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signupCode, setSignupCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isSignup = mode === "signup";

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setError("");
    setPassword("");
    setSignupCode("");
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = isSignup ? "/auth/register" : "/auth/login";

      const payload = isSignup
        ? { name, email, password, signupCode }
        : { email, password };

      const { data } = await api.post(endpoint, payload);
      onLogin(data);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page login-page-new">
      <div className={`login-layout login-layout-new ${isSignup ? "is-signup" : "is-login"}`}>

        <section className="login-form-panel login-form-panel-new">

          <div className="login-brand login-brand-new">
            <div className="brand-mark">
              <BookUser size={23} />
            </div>
            <span>Contact Management <b>System</b></span>
          </div>

          <div className="login-card login-card-new" key={mode}>

            <div className="login-kicker">
              <span className="login-kicker-dot" />
              ADMINISTRATOR WORKSPACE
            </div>

            <h1>
              {isSignup
                ? <>Create your <em>account.</em></>
                : <>Welcome <em>back.</em></>}
            </h1>

            <p className="login-subtitle">
              {isSignup
                ? "Set up your administrator account and bring your contacts together in one organised workspace."
                : "Sign in to manage your contacts and keep every important connection close."}
            </p>

            {error && (
              <div className="form-alert" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={submit} className={isSignup ? "signup-form" : ""}>

  {isSignup && (
    <div className="field">
      <label htmlFor="admin-name">Full name</label>
      <div className="input-icon-wrap input-icon-wrap-new">
        <UserRound size={19} />
        <input
          id="admin-name"
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Your full name"
          autoComplete="name"
          minLength={2}
          maxLength={60}
          required
        />
      </div>
    </div>
  )}

  <div className="field">
    <label htmlFor="admin-email">Email address</label>
    <div className="input-icon-wrap input-icon-wrap-new">
      <Mail size={19} />
      <input
        id="admin-email"
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="you@example.com"
        autoComplete="email"
        required
      />
    </div>
  </div>

  <div className="field">
    <label htmlFor="admin-password">Password</label>
    <div className="input-icon-wrap input-icon-wrap-new">
      <LockKeyhole size={19} />
      <input
        id="admin-password"
        type={showPassword ? "text" : "password"}
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder={isSignup ? "8+ characters" : "Enter your password"}
        autoComplete={isSignup ? "new-password" : "current-password"}
        minLength={isSignup ? 8 : undefined}
        required
      />
      <button
        type="button"
        className="password-toggle"
        onClick={() => setShowPassword(!showPassword)}
        aria-label={showPassword ? "Hide password" : "Show password"}
      >
        {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
      </button>
    </div>
  </div>

  {isSignup && (
    <div className="field">
      <label htmlFor="signup-code">Access code</label>
      <div className="input-icon-wrap input-icon-wrap-new">
        <KeyRound size={19} />
        <input
          id="signup-code"
          type="password"
          value={signupCode}
          onChange={e => setSignupCode(e.target.value)}
          placeholder="Workspace code"
          autoComplete="off"
          required
        />
      </div>
    </div>
  )}

  {isSignup && (
    <p className="signup-hint">
      Ask your project manager for the workspace access code.
    </p>
  )}

  <button
    className="primary-button login-submit login-submit-new"
    disabled={loading}
  >
    {loading
      ? (isSignup ? "Creating account..." : "Signing in...")
      : (isSignup ? "Create administrator account" : "Sign in to your account")}
    <ArrowRight size={19} />
  </button>

</form>

            <div className="login-switch">
              {isSignup
                ? "Already have an account?"
                : "New to the workspace?"}

              <button
                type="button"
                onClick={() => switchMode(isSignup ? "login" : "signup")}
              >
                {isSignup ? "Sign in" : "Create an account"}
              </button>
            </div>

            <div className="login-security login-security-new">
              <ShieldCheck size={17} />
              Secure administrator {isSignup ? "registration" : "sign-in"}
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
              YOUR NETWORK, IN ONE PLACE
            </span>

            <h2>
              Good connections<br />
              make <em>great things</em><br />
              happen.
            </h2>

            <p>
              A clearer way to organise people, build stronger
              relationships, and stay on top of every conversation.
            </p>

            <div className="visual-feature">
              <div className="visual-feature-icon">
                <BookUser size={20} />
              </div>

              <div>
                <strong>Every contact matters</strong>
                <span>Keep your professional world organised.</span>
              </div>
            </div>

          </div>

          <div className="visual-caption">
            <span />
            Simple. Secure. Connected.
          </div>

        </aside>

      </div>
    </main>
  );
}
