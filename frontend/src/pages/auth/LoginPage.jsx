import { useState } from "react";
import { Link } from "react-router-dom";

const REMEMBER_ME_DAYS = 30;
const DEFAULT_SESSION_DAYS = 1;

function getExpiryTimestamp(rememberMe) {
  const days = rememberMe ? REMEMBER_ME_DAYS : DEFAULT_SESSION_DAYS;
  return Date.now() + days * 24 * 60 * 60 * 1000;
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("admin@gmail.com");
  const [password, setPassword] = useState("123456");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1";

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
    } catch (error) {
      console.error("Login error:", error);
      setError("Cannot connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#eef2f7] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-5xl bg-white rounded-[26px] shadow-[0_25px_70px_rgba(15,23,42,0.16)] overflow-hidden grid grid-cols-1 lg:grid-cols-2">
        {/* Left panel */}
        <div className="hidden lg:flex flex-col justify-between bg-[#0f1f3a] text-white p-10 min-h-155 relative overflow-hidden">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-400/20 blur-3xl" />
          <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-cyan-300/20 blur-3xl" />

          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center text-[#0f1f3a] font-bold text-2xl">
                P
              </div>

              <div>
                <h1 className="text-xl font-bold leading-none">ParkHub</h1>
                <p className="text-sm text-slate-300 mt-1">
                  Parking Management
                </p>
              </div>
            </div>

            <div className="mt-20">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/10 px-4 py-2 text-sm text-slate-200">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                System is online
              </div>

              <h2 className="mt-7 text-4xl font-bold leading-tight tracking-tight">
                Manage your parking building with confidence.
              </h2>

              <p className="mt-5 text-slate-300 leading-7 max-w-md">
                Monitor parking slots, reservations, vehicles, payments and
                daily staff operations from one dashboard.
              </p>
            </div>
          </div>

          <div className="relative z-10 grid grid-cols-3 gap-4">
            <div className="rounded-2xl bg-white/10 border border-white/10 p-4">
              <p className="text-2xl font-bold">120+</p>
              <p className="text-xs text-slate-300 mt-1">Slots</p>
            </div>

            <div className="rounded-2xl bg-white/10 border border-white/10 p-4">
              <p className="text-2xl font-bold">24/7</p>
              <p className="text-xs text-slate-300 mt-1">Service</p>
            </div>

            <div className="rounded-2xl bg-white/10 border border-white/10 p-4">
              <p className="text-2xl font-bold">Fast</p>
              <p className="text-xs text-slate-300 mt-1">Check-in</p>
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="min-h-155 flex items-center justify-center px-6 py-10 sm:px-12">
          <div className="w-full max-w-md">
            <div className="lg:hidden mb-8 flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-[#0f1f3a] flex items-center justify-center text-white font-bold text-2xl">
                P
              </div>

              <div>
                <h1 className="text-xl font-bold text-slate-900">ParkHub</h1>
                <p className="text-sm text-slate-500">Parking Management</p>
              </div>
            </div>

            <div className="mb-8">
              <p className="text-sm font-semibold text-blue-600 tracking-[0.16em] uppercase">
                Welcome back
              </p>

              <h2 className="mt-3 text-3xl font-bold text-slate-950">
                Sign in to your account
              </h2>

              <p className="mt-3 text-sm text-slate-500">
                Enter your account information to continue.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Email address
                </label>

                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[20px] text-slate-400">
                    mail
                  </span>

                  <input
                    type="email"
                    placeholder="admin@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-13 rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm text-slate-800 outline-none transition focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Password
                  </label>

                  <button
                    type="button"
                    className="text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    Forgot password?
                  </button>
                </div>

                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[20px] text-slate-400">
                    lock
                  </span>

                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-13 rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-12 text-sm text-slate-800 outline-none transition focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    <span className="material-symbols-outlined text-[21px]">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                  <input
                    id="remember"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  Remember me
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-13 rounded-2xl bg-[#0f1f3a] text-white font-semibold shadow-lg shadow-slate-900/20 transition hover:bg-[#182f58] hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <span className="material-symbols-outlined text-[20px]">
                      arrow_forward
                    </span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-800">
                Test account
              </p>
              <p className="mt-1 text-sm text-slate-500">
                admin@gmail.com / 123456
              </p>
            </div>

            <p className="mt-6 text-center text-sm text-slate-500">
              Do not have an account?{" "}
              <Link
                to="/signup"
                className="font-semibold text-blue-600 hover:text-blue-700"
              >
                Sign up
              </Link>
            </p>

            <p className="mt-8 text-center text-xs text-slate-400">
              © 2026 Parking Building Management System
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
