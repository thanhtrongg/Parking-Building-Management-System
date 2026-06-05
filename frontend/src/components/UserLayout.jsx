import { NavLink, useNavigate } from "react-router-dom";
import { useMemo } from "react";

const navItems = [
  {
    icon: "space_dashboard",
    label: "Dashboard",
    path: "/user-dashboard",
  },
  {
    icon: "event_available",
    label: "My Bookings",
    path: "/user-bookings",
  },
  {
    icon: "settings",
    label: "Settings",
    path: "/user-settings",
  },
];

function getStoredUser() {
  try {
    const rawUser = localStorage.getItem("user");
    return rawUser ? JSON.parse(rawUser) : null;
  } catch {
    return null;
  }
}

function getUserDisplay(user) {
  const name =
    user?.fullName ||
    user?.full_name ||
    user?.name ||
    user?.username ||
    user?.email ||
    "Parking User";

  return {
    name,
    email: user?.email || "user@parkmaster.local",
  };
}

function getInitials(name) {
  return (
    name
      ?.split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase())
      .join("") || "PU"
  );
}

function Brand() {
  return (
    <div className="px-4">
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-3 shadow-sm">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-blue-600 text-lg font-black text-white shadow-md shadow-blue-200">
          P
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-base font-black tracking-tight text-slate-950">
            ParkMaster
          </h1>
          <p className="truncate text-xs font-semibold text-slate-500">
            User Portal
          </p>
        </div>
      </div>
    </div>
  );
}

function SidebarNav() {
  return (
    <nav className="mt-7 flex-1 px-3">
      <p className="mb-3 px-3 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
        Parking
      </p>

      <div className="space-y-1.5">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              [
                "group relative flex h-12 items-center gap-3 rounded-2xl px-3 text-sm font-bold transition-all duration-200",
                isActive
                  ? "bg-blue-50 text-blue-700 ring-1 ring-blue-100"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
              ].join(" ")
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-blue-600" />
                )}

                <span
                  className={[
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition",
                    isActive
                      ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                      : "bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-blue-600",
                  ].join(" ")}
                >
                  <span
                    className="material-symbols-outlined text-[22px] leading-none"
                    style={{
                      fontVariationSettings: isActive
                        ? "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 24"
                        : "'FILL' 0, 'wght' 500, 'GRAD' 0, 'opsz' 24",
                    }}
                  >
                    {item.icon}
                  </span>
                </span>

                <span className="min-w-0 flex-1 truncate">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

function UserCard({ onLogout }) {
  const user = useMemo(() => getStoredUser(), []);
  const { name, email } = getUserDisplay(user);

  return (
    <div className="px-4 pb-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-blue-600 text-xs font-black text-white shadow-md shadow-blue-200">
            {getInitials(name)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-black text-slate-950">{name}</p>
            <p className="truncate text-xs font-medium text-slate-500">
              {email}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-red-50 text-sm font-black text-red-600 ring-1 ring-red-100 transition hover:bg-red-100 active:scale-[0.98]"
        >
          <span className="material-symbols-outlined text-[20px] leading-none">
            logout
          </span>
          Logout
        </button>
      </div>
    </div>
  );
}

function Sidebar({ onLogout }) {
  return (
    <aside className="fixed left-0 top-0 z-50 hidden h-screen w-[260px] flex-col border-r border-slate-200 bg-white py-5 lg:flex">
      <Brand />
      <SidebarNav />
      <UserCard onLogout={onLogout} />
    </aside>
  );
}

function Header() {
  const user = useMemo(() => getStoredUser(), []);
  const { name } = getUserDisplay(user);

  return (
    <header className="fixed right-0 top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/90 px-4 shadow-sm backdrop-blur-xl sm:px-6 lg:w-[calc(100%-260px)] lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-600 text-sm font-black text-white lg:hidden">
          P
        </div>
        <div className="hidden min-w-0 sm:block">
          <p className="truncate text-sm font-black text-slate-950">
            Parking User Portal
          </p>
          <p className="truncate text-xs font-semibold text-slate-500">
            Manage reservations and account details
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          className="relative grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
        >
          <span className="material-symbols-outlined text-[21px] leading-none">
            notifications
          </span>
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>

        <div className="flex h-11 items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 shadow-sm">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-blue-600 text-xs font-black text-white">
            {getInitials(name)}
          </div>
          <p className="hidden max-w-[150px] truncate text-sm font-black text-slate-950 sm:block">
            {name}
          </p>
        </div>
      </div>
    </header>
  );
}

function MobileNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 px-2 py-2 shadow-[0_-10px_30px_rgba(15,23,42,0.12)] backdrop-blur-xl lg:hidden">
      <div className="mx-auto flex max-w-3xl items-center justify-around gap-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              [
                "flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl px-2 py-2 text-[10px] font-black transition",
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-950",
              ].join(" ")
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className="material-symbols-outlined text-[22px] leading-none"
                  style={{
                    fontVariationSettings: isActive
                      ? "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 24"
                      : "'FILL' 0, 'wght' 500, 'GRAD' 0, 'opsz' 24",
                  }}
                >
                  {item.icon}
                </span>
                <span className="w-full truncate text-center">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export default function UserLayout({ children }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-['Inter'] text-slate-900">
      <Sidebar onLogout={handleLogout} />
      <Header />

      <main className="min-h-screen pt-16 lg:ml-[260px]">
        <div className="mx-auto max-w-7xl p-4 pb-28 sm:p-6 sm:pb-28 lg:p-8">
          {children}
        </div>
      </main>

      <MobileNav />
    </div>
  );
}
