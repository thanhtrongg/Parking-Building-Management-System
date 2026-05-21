import { useState } from "react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex bg-[#faf8ff] overflow-hidden">
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#dbe1ff] items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage: "radial-gradient(#004ac6 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative z-10 max-w-xl px-12 text-center">
          <div className="mx-auto mb-10 h-72 w-72 rounded-[2rem] bg-white shadow-2xl flex items-center justify-center">
            <span className="material-symbols-outlined text-[140px] text-blue-600">
              local_parking
            </span>
          </div>

          <h1 className="text-4xl font-bold text-[#00174b] mb-4">
            The future of urban parking management.
          </h1>

          <p className="text-lg text-[#3f465c]">
            Streamline operations, optimize space utilization, and maximize revenue with
            ParkMaster Pro.
          </p>
        </div>

        <div className="absolute bottom-10 left-10 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute top-10 right-10 w-48 h-48 bg-indigo-300/30 rounded-full blur-3xl" />
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <div className="w-16 h-16 bg-white rounded-xl shadow-sm flex items-center justify-center border border-slate-200 mb-6">
              <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center text-white text-3xl font-semibold">
                P
              </div>
            </div>

            <h2 className="text-4xl font-bold text-slate-950 mb-2">
              Welcome back
            </h2>
            <p className="text-slate-500">
              Sign in to manage your parking building system.
            </p>
          </div>

          <form className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email address
              </label>
              <input
                type="email"
                placeholder="admin@parkmaster.com"
                className="w-full h-12 rounded-xl border border-slate-300 bg-white px-4 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Password
                </label>
                <button type="button" className="text-sm font-medium text-blue-600">
                  Forgot password?
                </button>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="w-full h-12 rounded-xl border border-slate-300 bg-white px-4 pr-12 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
                >
                  <span className="material-symbols-outlined">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="remember"
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-blue-600"
              />
              <label htmlFor="remember" className="text-sm text-slate-600">
                Remember me
              </label>
            </div>

            <button
              type="submit"
              className="w-full h-12 rounded-xl bg-blue-600 text-white font-semibold shadow-md shadow-blue-900/20 hover:bg-blue-700 transition"
            >
              Sign in
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500">
            Parking Building Management System
          </p>
        </div>
      </div>
    </div>
  );
}