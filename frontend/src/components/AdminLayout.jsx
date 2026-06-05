import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useMemo } from "react";

const navItems = [
  {
    icon: "space_dashboard",
    label: "Dashboard",
    path: "/dashboard",
    roles: ["ADMIN", "MANAGER", "STAFF"],
  },
  {
    icon: "grid_view",
    label: "Parking Zones",
    path: "/admin-zones",
    roles: ["ADMIN", "MANAGER"],
  },
  {
    icon: "local_parking",
    label: "Parking Slots",
    path: "/parking-slots",
    roles: ["ADMIN", "MANAGER", "STAFF"],
  },
  {
    icon: "confirmation_number",
    label: "Parking Sessions",
    path: "/parking-sessions",
    roles: ["ADMIN", "MANAGER", "STAFF"],
  },
  {
    icon: "directions_car",
    label: "Vehicles",
    path: "/admin-vehicles",
    roles: ["ADMIN", "MANAGER"],
  },
  {
    icon: "event_available",
    label: "Reservations",
    path: "/reservations",
    roles: ["ADMIN", "MANAGER", "STAFF"],
  },
  {
    icon: "payments",
    label: "Payments",
    path: "/payments",
    roles: ["ADMIN", "MANAGER", "STAFF"],
  },
  {
    icon: "price_change",
    label: "Pricing Policies",
    path: "/pricing-policies",
    roles: ["ADMIN", "MANAGER", "STAFF"],
  },
  {
    icon: "group",
    label: "Users",
    path: "/admin-users",
    roles: ["ADMIN"],
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

function normalizeRole(role) {
  return String(role || "")
    .trim()
    .toUpperCase();
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
  const role = normalizeRole(user?.role || "ADMIN");

  return { name, email, role };
}

function getVisibleNavItems(role) {
  const normalizedRole = normalizeRole(role);

  return navItems.filter((item) => item.roles.includes(normalizedRole));
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
  const user = useMemo(() => getStoredUser(), []);
  const { role } = getUserDisplay(user);

  const visibleNavItems = useMemo(() => getVisibleNavItems(role), [role]);

  return (
    <nav className="mt-5 min-h-0 flex-1 overflow-y-auto px-3 pb-3">
      <p className="mb-3 px-3 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
        Main Menu
      </p>

      <div className="space-y-1.5">
        {visibleNavItems.map((item) => {
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
    <div className="shrink-0 px-4 pb-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm xl:p-4">
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

        <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 ring-1 ring-slate-100">
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
    <aside className="fixed left-0 top-0 z-50 hidden h-dvh w-[260px] flex-col overflow-hidden border-r border-slate-200 bg-white py-4 lg:flex">
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
    <header className="fixed right-0 top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/90 px-4 shadow-sm backdrop-blur-xl sm:px-6 lg:w-[calc(100%-260px)] lg:justify-end lg:px-8">
      <div className="flex items-center gap-3 lg:hidden">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-600 text-lg font-black text-white">
          P
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-black text-slate-950">
            ParkMaster
          </p>
          <p className="truncate text-[11px] font-semibold text-slate-500">
            Management
          </p>
        </div>
      </div>

      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <button
          type="button"
          className="relative grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
        >
          <span className="material-symbols-outlined text-[21px] leading-none">
            notifications
          </span>
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>

        <button
          type="button"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
        >
          <span className="material-symbols-outlined text-[21px] leading-none">
            settings
          </span>
        </button>

        <div className="flex h-11 min-w-0 items-center gap-3 rounded-xl border border-slate-200 bg-white px-2 shadow-sm sm:px-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-blue-600 text-xs font-black text-white">
            {getInitials(name)}
          </div>

          <div className="hidden min-w-0 sm:block">
            <p className="max-w-[120px] truncate text-sm font-black text-slate-950 lg:max-w-[160px]">
              {name}
            </p>
            <p className="text-xs font-semibold text-emerald-600">Online</p>
          </div>
        </div>
      </div>
    </header>
  );
}

function MobileNav() {
  const location = useLocation();
  const user = useMemo(() => getStoredUser(), []);
  const { role } = getUserDisplay(user);
  const visibleNavItems = useMemo(() => getVisibleNavItems(role), [role]);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 px-2 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] shadow-[0_-10px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl lg:hidden">
      <div className="mx-auto grid max-w-3xl grid-cols-4 gap-1">
        {visibleNavItems.map((item) => {
          const isActive =
            location.pathname === item.path ||
            location.pathname.startsWith(`${item.path}/`);

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={[
                "flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1.5 py-2 text-[10px] font-black transition",
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
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
              <span className="w-full truncate text-center leading-tight">
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

export default function AdminLayout({ children }) {
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
        <div className="p-4 pb-40 sm:p-6 sm:pb-40 lg:p-8">{children}</div>
      </main>
      <MobileNav />
    </div>
  );
}
