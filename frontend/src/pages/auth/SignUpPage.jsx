import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

async function readResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  return contentType.includes("application/json")
    ? response.json()
    : response.text();
}

export default function SignUpPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    username: "",
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username.trim(),
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          password: form.password,
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
    <div className="flex min-h-screen w-full items-center justify-center bg-[#eef2f7] px-4 py-8">
      <div className="grid w-full max-w-5xl grid-cols-1 overflow-hidden rounded-[26px] bg-white shadow-[0_25px_70px_rgba(15,23,42,0.16)] lg:grid-cols-2">
        <div className="hidden min-h-[660px] flex-col justify-between bg-[#0f1f3a] p-10 text-white lg:flex">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl font-bold text-[#0f1f3a]">
                P
              </div>
              <div>
                <h1 className="text-xl font-bold leading-none">ParkHub</h1>
                <p className="mt-1 text-sm text-slate-300">
                  Parking Management
                </p>
              </div>
            </div>

            <div className="mt-20">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-slate-200">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Secure access
              </div>
              <h2 className="mt-7 text-4xl font-bold leading-tight tracking-tight">
                Create an account for parking operations.
              </h2>
              <p className="mt-5 max-w-md leading-7 text-slate-300">
                Register a customer account and start using the parking
                management system.
              </p>
            </div>
          </div>
        </div>

        <div className="flex min-h-[660px] items-center justify-center px-6 py-10 sm:px-12">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-600">
                Get started
              </p>
              <h2 className="mt-3 text-3xl font-bold text-slate-950">
                Create your account
              </h2>
              <p className="mt-3 text-sm text-slate-500">
                Use a username, email, and password to register.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}
              {success && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {success}
                </div>
              )}

              <Field
                icon="person"
                label="Username"
                value={form.username}
                onChange={(value) => updateField("username", value)}
                placeholder="customer01"
                required
              />

              <Field
                icon="badge"
                label="Full name"
                value={form.fullName}
                onChange={(value) => updateField("fullName", value)}
                placeholder="Nguyen Van A"
                required
              />

              <Field
                icon="mail"
                label="Email"
                type="email"
                value={form.email}
                onChange={(value) => updateField("email", value)}
                placeholder="admin@test.com"
                required
              />

              <PasswordField
                label="Password"
                value={form.password}
                show={showPassword}
                onToggle={() => setShowPassword((value) => !value)}
                onChange={(value) => updateField("password", value)}
              />

              <Field
                icon="lock"
                label="Confirm password"
                type={showPassword ? "text" : "password"}
                value={form.confirmPassword}
                onChange={(value) => updateField("confirmPassword", value)}
                placeholder="Repeat your password"
                required
              />

              <button
                type="submit"
                disabled={loading}
                className="flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-[#0f1f3a] font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:-translate-y-0.5 hover:bg-[#182f58] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Sign up
                    <span className="material-symbols-outlined text-[20px]">
                      arrow_forward
                    </span>
                  </>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-blue-600 hover:text-blue-700"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
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
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>
      <div className="relative">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[20px] text-slate-400">
          {icon}
        </span>
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          required={required}
          className="h-[52px] w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
        />
      </div>
    </div>
  );
}

function PasswordField({ label, value, show, onToggle, onChange }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>
      <div className="relative">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[20px] text-slate-400">
          lock
        </span>
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Enter your password"
          required
          className="h-[52px] w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-12 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
        >
          <span className="material-symbols-outlined text-[21px]">
            {show ? "visibility_off" : "visibility"}
          </span>
        </button>
      </div>
    </div>
  );
}
