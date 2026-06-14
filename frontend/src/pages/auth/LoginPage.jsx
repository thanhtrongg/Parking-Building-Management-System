import { useState } from "react";
import { Link } from "react-router-dom";
import { API_URL } from "../../services/api";

const REMEMBER_ME_DAYS = 30;
const DEFAULT_SESSION_DAYS = 1;

const authImage =
  "https://images.unsplash.com/photo-1566636137426-500b3b61dcaa?auto=format&fit=crop&q=82&w=1600";

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d7b46a]";

function getExpiryTimestamp(rememberMe) {
  const days = rememberMe ? REMEMBER_ME_DAYS : DEFAULT_SESSION_DAYS;
  return Date.now() + days * 24 * 60 * 60 * 1000;
}

function ArrowGlyph() {
  return (
    <span className="relative flex h-5 w-5 shrink-0 items-center justify-center transition duration-300 group-hover:translate-x-0.5">
      <span className="h-2 w-2 rotate-45 border-r-2 border-t-2 border-current" />
    </span>
  );
}

function AuthInput({
  label,
  icon,
  type = "text",
  value,
  onChange,
  placeholder,
  rightSlot,
  required = true,
  isLight = false,
}) {
  return (
    <div>
      <label className={["mb-2 block text-sm font-semibold", isLight ? "text-slate-700" : "text-[#efe4cf]"].join(" ")}>
        {label}
      </label>
      <div className="relative">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[20px] text-[#9b917f]">
          {icon}
        </span>
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          required={required}
          className={[
            "h-12 w-full rounded-lg border pl-11 pr-12 text-sm outline-none transition duration-300 placeholder:text-[#746b5e] focus:border-[#d7b46a]/60 focus:bg-[#d7b46a]/5 focus:ring-4 focus:ring-[#d7b46a]/10",
            isLight
              ? "border-slate-200 bg-white text-slate-900 focus:bg-slate-50"
              : "border-white/10 bg-white/[0.055] text-[#fbf4e7] focus:bg-white/[0.08]"
          ].join(" ")}
        />
        {rightSlot}
      </div>
    </div>
  );
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("systemTheme") || "light";
    } catch {
      return "light";
    }
  });
  const isLight = theme === "light";

  const handleToggleTheme = () => {
    setTheme((current) => {
      const nextTheme = current === "light" ? "dark" : "light";
      localStorage.setItem("systemTheme", nextTheme);
      localStorage.setItem("publicTheme", nextTheme);
      return nextTheme;
    });
  };


  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          rememberMe,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.message || "Login failed");
        return;
      }

      const user = result.data.user;
      if (user && user.role === "DRIVER") {
        user.role = "USER";
      }

      localStorage.setItem("accessToken", result.data.accessToken);
      localStorage.setItem("user", JSON.stringify(user));
      if (user && user.theme) {
        localStorage.setItem("systemTheme", user.theme);
        localStorage.setItem("publicTheme", user.theme);
      }
      localStorage.setItem("rememberMe", String(rememberMe));
      localStorage.setItem(
        "authExpiresAt",
        String(getExpiryTimestamp(rememberMe)),
      );

      const role = user ? user.role : "";

      if (role === "ADMIN" || role === "MANAGER" || role === "STAFF") {
        window.location.href = "/dashboard";
      } else if (role === "USER") {
        window.location.href = "/user-dashboard";
      } else {
        window.location.href = "/login";
      }
    } catch (loginError) {
      console.error("Login error:", loginError);
      setError("Cannot connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={[
      "relative min-h-[100dvh] overflow-hidden px-4 py-6 font-['Satoshi','Plus_Jakarta_Sans',system-ui,sans-serif] md:px-8 transition-colors duration-300",
      isLight ? "bg-[#fcfaf6] text-slate-900" : "bg-[#070705] text-[#fbf4e7]"
    ].join(" ")}>
      <div className="pointer-events-none fixed inset-0 opacity-[0.035] [background-image:radial-gradient(circle_at_1px_1px,#ffffff_1px,transparent_0)] [background-size:24px_24px]" />

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between">
        <Link to="/" className={`group flex items-center gap-3 rounded-full ${focusRing}`}>
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#d7b46a] text-sm font-black text-[#11100d] transition duration-300 group-hover:bg-[#e7c77f]">
            P
          </span>
          <span>
            <span className={["block text-sm font-semibold tracking-[0.12em]", isLight ? "text-slate-900" : "text-white"].join(" ")}>
              PARKMASTER
            </span>
            <span className="block text-[10px] tracking-[0.22em] text-[#d7b46a]/80">
              BUILDING SYSTEM
            </span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToggleTheme}
            aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
            className={["inline-flex h-10 w-10 items-center justify-center rounded-lg ring-1 transition duration-300", isLight ? "bg-slate-100 text-slate-700 ring-slate-200 hover:bg-slate-200" : "bg-white/[0.055] text-[#f7efe0] ring-white/10 hover:bg-white/[0.09]"].join(" ")}
          >
            <span className="material-symbols-outlined text-[20px] leading-none">
              {isLight ? "dark_mode" : "light_mode"}
            </span>
          </button>
          <Link
            to="/signup"
            className={["hidden rounded-lg px-4 py-2.5 text-xs font-medium ring-1 transition duration-300 md:inline-flex", isLight ? "bg-slate-100 text-slate-700 ring-slate-200 hover:bg-slate-200 hover:text-slate-900" : "bg-white/[0.055] text-[#ddd4c4] ring-white/12 hover:bg-white/[0.09] hover:text-white"].join(" ")}
          >
            Create account
          </Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto grid min-h-[calc(100dvh-5rem)] max-w-6xl items-center gap-8 py-10 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="hidden lg:block">
          <div className={[
            "rounded-2xl p-1 ring-1",
            isLight ? "bg-slate-100 ring-slate-200/60" : "bg-white/[0.035] ring-white/10"
          ].join(" ")}>
            <div className={["relative min-h-[36rem] overflow-hidden rounded-[calc(1rem-0.25rem)]", isLight ? "bg-slate-50" : "bg-[#100f0b]"].join(" ")}>
              <img
                src={authImage}
                alt="Underground parking garage with cinematic lighting"
                className={["absolute inset-0 h-full w-full object-cover saturate-[0.78]", isLight ? "opacity-90" : "opacity-62"].join(" ")}
              />
              <div className={[
                "absolute inset-0",
                isLight
                  ? "bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(252,250,246,0.38))]"
                  : "bg-[linear-gradient(180deg,rgba(6,6,5,0.12),rgba(6,6,5,0.86))]"
              ].join(" ")} />
              <div className="absolute inset-x-0 bottom-0 p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#d7b46a]">
                  Secure building access
                </p>
                <h1 className={["mt-4 max-w-xl text-4xl font-bold leading-tight tracking-[-0.025em]", isLight ? "text-slate-900" : "text-[#fbf4e7]"].join(" ")}>
                  Sign in to manage parking operations.
                </h1>
                <div className="mt-8 grid grid-cols-3 gap-3">
                  {["Slots", "Sessions", "Payments"].map((item) => (
                    <div
                      key={item}
                      className={[
                        "rounded-lg p-4 ring-1",
                        isLight ? "bg-white/85 ring-slate-200/60" : "bg-[#080806]/72 ring-white/10"
                      ].join(" ")}
                    >
                      <p className="text-xs font-medium tracking-[0.18em] text-[#d7b46a]/80">
                        {item.toUpperCase()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={["rounded-2xl p-1 ring-1", isLight ? "bg-slate-100 ring-slate-200" : "bg-white/[0.04] ring-white/10"].join(" ")}>
          <div className={["rounded-[calc(1rem-0.25rem)] p-6 sm:p-8 md:p-10", isLight ? "bg-white" : "bg-[#11100c]"].join(" ")}>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#d7b46a]">
              Welcome back
            </p>
            <h2 className={["mt-4 text-3xl font-bold leading-tight tracking-[-0.025em]", isLight ? "text-slate-900" : "text-[#fbf4e7]"].join(" ")}>
              Sign in to your account.
            </h2>
            <p className={["mt-4 max-w-md text-sm leading-7", isLight ? "text-slate-500" : "text-[#b9af9d]"].join(" ")}>
              Continue to reservations, slots, sessions, payments, and building
              operations.
            </p>

            <form onSubmit={handleLogin} className="mt-8 space-y-5">
              {error ? (
                <div className="rounded-lg border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
              ) : null}

              <AuthInput
                label="Email address"
                icon="mail"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="Enter your email"
                isLight={isLight}
              />

              <AuthInput
                label="Password"
                icon="lock"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={setPassword}
                placeholder="Enter your password"
                isLight={isLight}
                rightSlot={
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9b917f] transition hover:text-[#f7efe0]"
                  >
                    <span className="material-symbols-outlined text-[21px]">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                }
              />

              <div className="flex items-center justify-between">
                <label className={["flex cursor-pointer items-center gap-3 text-sm", isLight ? "text-slate-600" : "text-[#b9af9d]"].join(" ")}>
                  <input
                    id="remember"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                    className={["h-4 w-4 rounded accent-[#d7b46a]", isLight ? "border-slate-300 bg-slate-50" : "border-white/20 bg-white/[0.06]"].join(" ")}
                  />
                  Remember me
                </label>
                <button
                  type="button"
                  className="text-sm font-medium text-[#d7b46a] transition hover:text-[#f0d89c]"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`group flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#d7b46a] px-5 text-sm font-semibold text-[#11100d] transition duration-300 hover:bg-[#e7c77f] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 ${focusRing}`}
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#11100d]/30 border-t-[#11100d]" />
                    Signing in
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowGlyph />
                  </>
                )}
              </button>
            </form>

            <p className={["mt-6 text-center text-sm", isLight ? "text-slate-400" : "text-[#9b917f]"].join(" ")}>
              Do not have an account?{" "}
              <Link
                to="/signup"
                className="font-semibold text-[#d7b46a] transition hover:text-[#f0d89c]"
              >
                Sign up
              </Link>
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
