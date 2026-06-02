import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useMemo } from "react";

const navItems = [
  {
    icon: "space_dashboard",
    label: "Dashboard",
    path: "/dashboard",
  },
  {
    icon: "local_parking",
    label: "Parking Slots",
    path: "/parking-slots",
  },
  {
    icon: "directions_car",
    label: "Vehicles",
    path: "/admin-vehicles",
  },
  {
    icon: "event_available",
    label: "Reservations",
    path: "/reservations",
  },
  {
    icon: "payments",
    label: "Payments",
    path: "/payments",
  },
  {
    icon: "group",
    label: "Users",
    path: "/admin-users",
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

function getInitials(name = "System Admin") {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");

  return initials || "SA";
}

function getUserDisplay(user) {
  const name =
    user?.fullName ||
    user?.full_name ||
    user?.name ||
    user?.username ||
    user?.email ||
    "System Admin";

  const email = user?.email || "admin@gmail.com";
  const role = user?.role || "ADMIN";

  return { name, email, role };
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
            Management System
          </p>
        </div>
      </div>
    </div>
  );
}

function SidebarNav() {
  const location = useLocation();

  return (
    <nav className="mt-7 flex-1 px-3">
      <p className="mb-3 px-3 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
        Main Menu
      </p>

      <div className="space-y-1.5">
        {navItems.map((item) => {
          const isActive =
            location.pathname === item.path ||
            location.pathname.startsWith(`${item.path}/`);

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={[
                "group relative flex h-12 items-center gap-3 rounded-2xl px-3 text-sm font-bold transition-all duration-200",
                isActive
                  ? "bg-blue-50 text-blue-700 ring-1 ring-blue-100"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
              ].join(" ")}
            >
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
                  className="material-symbols-outlined block select-none text-center text-[22px] leading-[1]"
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

              {isActive && (
                <span className="flex h-6 w-6 shrink-0 items-center justify-center">
                  <span className="material-symbols-outlined block select-none text-[20px] leading-[1] text-blue-500">
                    chevron_right
                  </span>
                </span>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

function UserProfile({ onLogout }) {
  const user = useMemo(() => getStoredUser(), []);
  const { name, email, role } = getUserDisplay(user);

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

        <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 ring-1 ring-slate-100">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
            Role
          </span>
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-black uppercase text-emerald-700 ring-1 ring-emerald-100">
            {role}
          </span>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-red-50 text-sm font-black text-red-600 ring-1 ring-red-100 transition hover:bg-red-100 active:scale-[0.98]"
        >
          <span className="material-symbols-outlined grid h-5 w-5 place-items-center text-[20px] leading-none">
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
    <aside className="fixed left-0 top-0 z-50 flex h-screen w-[260px] flex-col border-r border-slate-200 bg-white py-5">
      <Brand />
      <SidebarNav />
      <UserProfile onLogout={onLogout} />
    </aside>
  );
}

function Header() {
  const user = useMemo(() => getStoredUser(), []);
  const { name } = getUserDisplay(user);

  return (
    <header className="fixed right-0 top-0 z-40 flex h-16 w-[calc(100%-260px)] items-center justify-end border-b border-slate-200 bg-white/90 px-8 shadow-sm backdrop-blur-xl">
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

        <button
          type="button"
          className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
        >
          <span className="material-symbols-outlined text-[21px] leading-none">
            settings
          </span>
        </button>

        <div className="flex h-11 items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 shadow-sm">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-blue-600 text-xs font-black text-white">
            {getInitials(name)}
          </div>

          <div className="min-w-0">
            <p className="max-w-[160px] truncate text-sm font-black text-slate-950">
              {name}
            </p>
            <p className="text-xs font-semibold text-emerald-600">Online</p>
          </div>
        </div>
      </div>
    </header>
  );
}

export default function AdminLayout({ children }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-['Inter'] text-slate-900">
      <Sidebar onLogout={handleLogout} />
      <Header />

      <main className="ml-[260px] min-h-screen pt-16">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
