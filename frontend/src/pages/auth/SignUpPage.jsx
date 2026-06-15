import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_URL } from "../../services/api";
import { getStoredTheme, storeTheme } from "../../utils/theme";

const authImage =
  "https://images.unsplash.com/photo-1649307035604-ab3c5e5c9e7a?auto=format&fit=crop&q=82&w=1600";

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d7b46a]";

async function readResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  return contentType.includes("application/json")
    ? response.json()
    : response.text();
}

function ArrowGlyph() {
  return (
    <span className="relative flex h-5 w-5 shrink-0 items-center justify-center transition duration-300 group-hover:translate-x-0.5">
      <span className="h-2 w-2 rotate-45 border-r-2 border-t-2 border-current" />
    </span>
  );
}

function Field({
  icon,
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
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
            "h-12 w-full rounded-lg border pl-11 pr-4 text-sm outline-none transition duration-300 placeholder:text-[#746b5e] focus:border-[#d7b46a]/60 focus:bg-[#d7b46a]/5 focus:ring-4 focus:ring-[#d7b46a]/10",
            isLight
              ? "border-slate-200 bg-white text-slate-900 focus:bg-slate-50"
              : "border-white/10 bg-white/[0.055] text-[#fbf4e7] focus:bg-white/[0.08]"
          ].join(" ")}
        />
      </div>
    </div>
  );
}

function PasswordField({ label, value, show, onToggle, onChange, isLight = false }) {
  return (
    <div>
      <label className={["mb-2 block text-sm font-semibold", isLight ? "text-slate-700" : "text-[#efe4cf]"].join(" ")}>
        {label}
      </label>
      <div className="relative">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[20px] text-[#9b917f]">
          lock
        </span>
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Enter your password"
          required
          className={[
            "h-12 w-full rounded-lg border pl-11 pr-12 text-sm outline-none transition duration-300 placeholder:text-[#746b5e] focus:border-[#d7b46a]/60 focus:bg-[#d7b46a]/5 focus:ring-4 focus:ring-[#d7b46a]/10",
            isLight
              ? "border-slate-200 bg-white text-slate-900 focus:bg-slate-50"
              : "border-white/10 bg-white/[0.055] text-[#fbf4e7] focus:bg-white/[0.08]"
          ].join(" ")}
        />
        <button
          type="button"
          onClick={onToggle}
          className={["absolute right-4 top-1/2 -translate-y-1/2 transition", isLight ? "text-[#9b917f] hover:text-slate-700" : "text-[#9b917f] hover:text-[#f7efe0]"].join(" ")}
        >
          <span className="material-symbols-outlined text-[21px]">
            {show ? "visibility_off" : "visibility"}
          </span>
        </button>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    phone: "",
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [theme, setTheme] = useState(() => getStoredTheme("light"));
  const isLight = theme === "light";

  const handleToggleTheme = () => {
    setTheme((current) => {
      const nextTheme = current === "light" ? "dark" : "light";
      storeTheme(nextTheme);
      return nextTheme;
    });
  };

  useEffect(() => {
    document.documentElement.classList.toggle("landing-light", isLight);
    document.documentElement.classList.toggle("landing-dark", !isLight);

    return () => {
      document.documentElement.classList.remove("landing-light", "landing-dark");
    };
  }, [isLight]);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          password: form.password,
          phone: form.phone.trim(),
        }),
      });

      const result = await readResponse(response);

      if (!response.ok) {
        setError(typeof result === "string" ? result : result.message);
        return;
      }

      setSuccess("Account created successfully. Redirecting to login...");
      window.setTimeout(() => navigate("/login", { replace: true }), 900);
    } catch (submitError) {
      console.error("Sign up error:", submitError);
      setError("Cannot connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={[
      "auth-page relative min-h-[100dvh] overflow-hidden px-4 py-6 font-['Satoshi','Plus_Jakarta_Sans',system-ui,sans-serif] md:px-8 transition-colors duration-300",
      isLight ? "bg-[#fcfaf6] text-slate-900 landing-light" : "bg-[#070705] text-[#fbf4e7] landing-dark"
    ].join(" ")}>
      <div className="pointer-events-none fixed inset-0 opacity-[0.035] [background-image:radial-gradient(circle_at_1px_1px,#ffffff_1px,transparent_0)] [background-size:24px_24px]" />

      <header className="auth-header relative z-10 mx-auto flex max-w-6xl items-center justify-between">
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
            to="/login"
            className={["hidden rounded-lg px-4 py-2.5 text-xs font-semibold ring-1 transition duration-300 md:inline-flex", isLight ? "bg-slate-100 text-slate-700 ring-slate-200 hover:bg-slate-200 hover:text-slate-950 hover:-translate-y-0.5 hover:shadow-sm" : "border border-transparent bg-white/[0.055] text-[#ddd4c4] ring-white/12 hover:bg-[#d7b46a]/15 hover:text-[#d7b46a] hover:-translate-y-0.5 hover:border-[#d7b46a]/45 hover:shadow-md"].join(" ")}
          >
            Sign in
          </Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto grid min-h-[calc(100dvh-5rem)] max-w-6xl items-center gap-8 py-10 lg:grid-cols-[0.95fr_1.05fr]">
        <section className={["rounded-2xl p-1 ring-1", isLight ? "bg-slate-100 ring-slate-200" : "bg-white/[0.04] ring-white/10"].join(" ")}>
          <div className={["rounded-[calc(1rem-0.25rem)] p-6 sm:p-8 md:p-10", isLight ? "bg-white" : "bg-[#11100c]"].join(" ")}>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#d7b46a]">
              Guest access
            </p>
            <h1 className={["mt-4 text-3xl font-bold leading-tight tracking-[-0.025em] md:text-4xl", isLight ? "text-slate-900" : "text-[#fbf4e7]"].join(" ")}>
              Create your account.
            </h1>
            <p className={["mt-4 max-w-md text-sm leading-7", isLight ? "text-slate-500" : "text-[#b9af9d]"].join(" ")}>
              Register as a user to reserve parking, manage booking history, and
              track payment records.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              {error ? (
                <div className="rounded-lg border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
              ) : null}
              {success ? (
                <div className="rounded-lg border border-emerald-400/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                  {success}
                </div>
              ) : null}

              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  icon="call"
                  label="Phone number"
                  value={form.phone}
                  onChange={(value) => updateField("phone", value)}
                  placeholder="0912345678"
                  required
                  isLight={isLight}
                />

                <Field
                  icon="badge"
                  label="Full name"
                  value={form.fullName}
                  onChange={(value) => updateField("fullName", value)}
                  placeholder="Nguyen Van A"
                  required
                  isLight={isLight}
                />
              </div>

              <Field
                icon="mail"
                label="Email"
                type="email"
                value={form.email}
                onChange={(value) => updateField("email", value)}
                placeholder="user@example.com"
                required
                isLight={isLight}
              />

              <div className="grid gap-5 sm:grid-cols-2">
                <PasswordField
                  label="Password"
                  value={form.password}
                  show={showPassword}
                  onToggle={() => setShowPassword((value) => !value)}
                  onChange={(value) => updateField("password", value)}
                  isLight={isLight}
                />

                <Field
                  icon="lock"
                  label="Confirm password"
                  type={showPassword ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={(value) => updateField("confirmPassword", value)}
                  placeholder="Repeat password"
                  required
                  isLight={isLight}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`group flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#d7b46a] px-5 text-sm font-bold text-[#11100d] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#f0d89c] hover:font-black hover:shadow-lg hover:shadow-[#d7b46a]/30 active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 ${focusRing}`}
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#11100d]/30 border-t-[#11100d]" />
                    Creating account
                  </>
                ) : (
                  <>
                    Sign up
                    <ArrowGlyph />
                  </>
                )}
              </button>
            </form>

            <p className={["mt-6 text-center text-sm", isLight ? "text-slate-400" : "text-[#9b917f]"].join(" ")}>
              Already have an account?{" "}
              <Link
                to="/login"
                className="rounded-md px-2 py-1 font-semibold text-[#d7b46a] transition-all duration-300 hover:bg-[#d7b46a]/15 hover:text-[#f0d89c] hover:underline hover:underline-offset-4"
              >
                Sign in
              </Link>
            </p>
          </div>
        </section>

        <section className="hidden lg:block">
          <div className={[
            "rounded-2xl p-1 ring-1",
            isLight ? "bg-slate-100 ring-slate-200/60" : "bg-white/[0.035] ring-white/10"
          ].join(" ")}>
            <div className={["auth-image-panel relative min-h-[36rem] overflow-hidden rounded-[calc(1rem-0.25rem)]", isLight ? "bg-slate-50" : "bg-[#100f0b]"].join(" ")}>
              <img
                src={authImage}
                alt="Urban parking building ramp at night"
                className={["absolute inset-0 h-full w-full object-cover saturate-[0.78]", isLight ? "opacity-90" : "opacity-62"].join(" ")}
              />
              <div className={[
                "auth-image-overlay absolute inset-0",
                isLight
                  ? "bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(252,250,246,0.38))]"
                  : "bg-[linear-gradient(180deg,rgba(6,6,5,0.12),rgba(6,6,5,0.86))]"
              ].join(" ")} />
              <div className="auth-image-content absolute inset-x-0 bottom-0 p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#d7b46a]">
                  Reservation-ready
                </p>
                <h2 className={["mt-4 max-w-xl text-4xl font-bold leading-tight tracking-[-0.025em]", isLight ? "text-slate-900" : "text-[#fbf4e7]"].join(" ")}>
                  Reserve a slot with a clear record.
                </h2>
                <p className={["mt-6 max-w-md text-base leading-8", isLight ? "text-slate-600" : "text-[#c7beae]"].join(" ")}>
                  Create an account, reserve a slot, and keep the full parking
                  record connected from arrival to payment.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
