import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import FeedbackNotifications from "./FeedbackNotifications";

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
    exact: true,
    roles: ["ADMIN", "MANAGER", "STAFF"],
  },
  {
    icon: "door_open",
    label: "Check-in / Check-out",
    path: "/parking-sessions/create",
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
    icon: "qr_code_scanner",
    label: "QR Check-in",
    path: "/qr-check-in",
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
    icon: "forum",
    label: "Feedbacks",
    path: "/feedbacks",
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

function SidebarNav({ onNavigate }) {
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
            (!item.exact && location.pathname.startsWith(`${item.path}/`));

          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onNavigate}
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

function Sidebar({ mobile = false, open = false, onClose }) {
  return (
    <aside
      className={[
        "fixed left-0 top-0 z-[60] h-dvh w-[280px] flex-col overflow-hidden border-r border-slate-200 bg-white py-4 shadow-2xl transition-transform duration-300 lg:w-[260px] lg:shadow-none",
        mobile
          ? `flex lg:hidden ${open ? "translate-x-0" : "-translate-x-full"}`
          : "hidden lg:flex",
      ].join(" ")}
    >
      {mobile && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>
      )}
      <Brand />
      <SidebarNav onNavigate={mobile ? onClose : undefined} />
    </aside>
  );
}

function Header({ theme, onToggleTheme, onLogout, onToggleMenu }) {
  const user = useMemo(() => getStoredUser(), []);
  const { name, email, role } = getUserDisplay(user);
  const isDark = theme === "dark";
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <header className="fixed right-0 top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/90 px-4 shadow-sm backdrop-blur-xl sm:px-6 lg:w-[calc(100%-260px)] lg:justify-end lg:px-8">
      <div className="flex items-center gap-3 lg:hidden">
        <button
          type="button"
          onClick={onToggleMenu}
          aria-label="Open menu"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm"
        >
          <span className="material-symbols-outlined text-2xl">menu</span>
        </button>
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
        <FeedbackNotifications audience="system" />

        <button
          type="button"
          onClick={onToggleTheme}
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
        >
          <span className="material-symbols-outlined text-[21px] leading-none">
            {isDark ? "light_mode" : "dark_mode"}
          </span>
        </button>

        <div ref={profileRef} className="relative">
          <button
            type="button"
            onClick={() => setProfileOpen((current) => !current)}
            aria-expanded={profileOpen}
            aria-label="Open account menu"
            className="flex h-11 min-w-0 items-center gap-3 rounded-xl border border-slate-200 bg-white px-2 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 sm:px-3"
          >
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-blue-600 text-xs font-black text-white">
              {getInitials(name)}
            </div>

            <p className="hidden max-w-[120px] truncate text-sm font-black text-slate-950 sm:block lg:max-w-[160px]">
              {name}
            </p>
            <span className={`material-symbols-outlined hidden text-lg text-slate-400 transition sm:inline-flex ${profileOpen ? "rotate-180" : ""}`}>
              expand_more
            </span>
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-[calc(100%+0.75rem)] w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl shadow-slate-900/15">
              <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-600 text-xs font-black text-white shadow-md shadow-blue-200">
                  {getInitials(name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-black text-slate-950">{name}</p>
                  <p className="truncate text-xs font-medium text-slate-500">{email}</p>
                </div>
              </div>

              <div className="mt-2 flex items-center justify-between rounded-xl px-3 py-2.5">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Role</span>
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-black uppercase text-emerald-700 ring-1 ring-emerald-100">
                  {role}
                </span>
              </div>

              <button
                type="button"
                onClick={onLogout}
                className="mt-1 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-red-50 text-sm font-black text-red-600 ring-1 ring-red-100 transition hover:bg-red-100 active:scale-[0.98]"
              >
                <span className="material-symbols-outlined text-xl">logout</span>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("systemTheme") || "light";
    } catch {
      return "light";
    }
  });
  const isDark = theme === "dark";

  const handleToggleTheme = () => {
    setTheme((current) => {
      const nextTheme = current === "dark" ? "light" : "dark";
      localStorage.setItem("systemTheme", nextTheme);
      return nextTheme;
    });
  };

  useEffect(() => {
    document.documentElement.classList.toggle("system-dark", isDark);
    document.documentElement.classList.toggle("system-light", !isDark);

    return () => {
      document.documentElement.classList.remove("system-dark", "system-light");
    };
  }, [isDark]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    const closeOnDesktop = () => {
      if (window.innerWidth >= 1024) setMenuOpen(false);
    };
    window.addEventListener("resize", closeOnDesktop);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("resize", closeOnDesktop);
    };
  }, [menuOpen]);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/", { replace: true });
  };

  return (
    <div
      className={[
        "app-shell min-h-screen overflow-x-clip bg-slate-50 font-['Inter'] font-medium text-slate-900",
        isDark ? "system-dark" : "system-light",
      ].join(" ")}
    >
      <div className="app-ambient app-ambient-one" aria-hidden="true" />
      <div className="app-ambient app-ambient-two" aria-hidden="true" />
      <div className="app-grid-glow" aria-hidden="true" />
      <Sidebar />
      <Sidebar mobile open={menuOpen} onClose={() => setMenuOpen(false)} />
      {menuOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 z-[55] bg-slate-950/45 backdrop-blur-sm lg:hidden"
        />
      )}
      <Header
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onLogout={handleLogout}
        onToggleMenu={() => setMenuOpen((current) => !current)}
      />

      <main className="min-h-screen pt-16 lg:ml-[260px]">
        <div key={location.pathname} className="app-page-stage p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
