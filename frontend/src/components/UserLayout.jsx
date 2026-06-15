import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState, useMemo } from "react";
import FeedbackNotifications from "./FeedbackNotifications";
import { apiRequest } from "../services/api";
import CustomSelect from "./CustomSelect";
import { getStoredTheme, storeTheme } from "../utils/theme";

const navItems = [
  {
    icon: "space_dashboard",
    label: "Dashboard",
    path: "/user-dashboard",
  },
  {
    icon: "event_available",
    label: "Reserve Spot",
    path: "/user-bookings",
  },
  {
    icon: "history",
    label: "History",
    path: "/user-booking-history",
  },
  {
    icon: "confirmation_number",
    label: "Sessions",
    path: "/user-parking-sessions",
  },
  {
    icon: "forum",
    label: "Feedback",
    path: "/user-feedback",
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

function SidebarNav({ onNavigate }) {
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
            onClick={onNavigate}
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

function Sidebar({ mobile = false, open = false, onClose, buildings = [], selectedBuildingId = "", onBuildingChange }) {
  return (
    <aside
      className={[
        "fixed left-0 top-0 z-[60] h-dvh w-[280px] flex-col overflow-hidden border-r border-slate-200 bg-white py-5 shadow-2xl transition-transform duration-300 lg:w-[260px] lg:shadow-none dark:border-white/10 dark:bg-[#11100c]",
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
          className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-[#fbf4e7]"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>
      )}
      <Brand />

      {buildings.length > 0 && (
        <div className="relative z-20 mt-5 px-4">
          <div className="relative flex flex-col gap-1.5 rounded-2xl border border-slate-200 bg-slate-50/50 p-3 shadow-inner dark:border-white/10 dark:bg-white/5">
            <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-[#b9af9d]">
              <span className="material-symbols-outlined text-[16px] text-slate-400 dark:text-[#b9af9d]">apartment</span>
              Active Building
            </label>
            <CustomSelect
              options={buildings.map(b => ({ value: b.id, label: b.name }))}
              value={selectedBuildingId}
              onChange={onBuildingChange}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-black text-slate-800 shadow-sm transition hover:border-blue-300 dark:border-white/10 dark:bg-white/5 dark:text-[#fbf4e7]"
              popupClassName="w-56 left-0 mt-2"
            />
          </div>
        </div>
      )}

      <SidebarNav onNavigate={mobile ? onClose : undefined} />
    </aside>
  );
}

function Header({ theme, onToggleTheme, onToggleMenu, onLogout, buildings = [], selectedBuildingId = "" }) {
  const user = getStoredUser();
  const { name, email } = getUserDisplay(user);
  const isDark = theme === "dark";
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const activeBuilding = useMemo(() => {
    return buildings.find(b => b.id === selectedBuildingId);
  }, [buildings, selectedBuildingId]);

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
    <header className="fixed right-0 top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/90 px-4 shadow-sm backdrop-blur-xl sm:px-6 lg:w-[calc(100%-260px)] lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onToggleMenu}
          aria-label="Open menu"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm lg:hidden"
        >
          <span className="material-symbols-outlined text-2xl">menu</span>
        </button>
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
        {activeBuilding && (
          <div className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-sm font-black text-slate-800 shadow-sm transition hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-[#fbf4e7]">
            <span className="material-symbols-outlined text-[20px] text-blue-600 dark:text-blue-400">apartment</span>
            <span className="truncate max-w-[100px] xs:max-w-[140px] sm:max-w-[200px] md:max-w-[280px] tracking-tight">{activeBuilding.name}</span>
          </div>
        )}

        <FeedbackNotifications audience="user" />

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
            className="flex h-11 items-center gap-3 rounded-xl border border-slate-200 bg-white px-2 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 sm:px-3"
          >
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-blue-600 text-xs font-black text-white">
              {getInitials(name)}
            </div>
            <p className="hidden max-w-[150px] truncate text-sm font-black text-slate-950 sm:block">
              {name}
            </p>
            <span className={`material-symbols-outlined hidden text-lg text-slate-400 transition sm:inline-flex ${profileOpen ? "rotate-180" : ""}`}>
              expand_more
            </span>
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-[calc(100%+0.75rem)] w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl shadow-slate-900/15">
              <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-600 text-xs font-black text-white">
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
                  User
                </span>
              </div>
              <button
                type="button"
                onClick={onLogout}
                className="mt-1 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-red-50 text-sm font-black text-red-600 ring-1 ring-red-100 transition hover:bg-red-100"
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

export default function UserLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState(() => getStoredTheme("light"));
  const isDark = theme === "dark";

  const [buildings, setBuildings] = useState([]);
  const [selectedBuildingId, setSelectedBuildingId] = useState("");

  useEffect(() => {
    let isMounted = true;
    const fetchBuildings = async () => {
      try {
        const res = await apiRequest("buildings");
        if (!isMounted) return;
        const list = res.data || [];
        setBuildings(list);
        if (list.length > 0) {
          const stored = localStorage.getItem("activeSystemBuildingId");
          const found = list.find((b) => b.id === stored);
          const initialId = found ? found.id : list[0].id;
          setSelectedBuildingId(initialId);
          localStorage.setItem("activeSystemBuildingId", initialId);
          // Dispatch initial event
          window.dispatchEvent(new CustomEvent("systemBuildingChanged", { detail: initialId }));
        }
      } catch (error) {
        console.error("Failed to fetch buildings", error);
      }
    };
    fetchBuildings();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleBuildingChange = (e) => {
    const val = e && e.target ? e.target.value : e;
    setSelectedBuildingId(val);
    localStorage.setItem("activeSystemBuildingId", val);
    window.dispatchEvent(new CustomEvent("systemBuildingChanged", { detail: val }));
  };

  const handleToggleTheme = () => {
    setTheme((current) => {
      const nextTheme = current === "dark" ? "light" : "dark";
      storeTheme(nextTheme);
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
      <Sidebar
        buildings={buildings}
        selectedBuildingId={selectedBuildingId}
        onBuildingChange={handleBuildingChange}
      />
      <Sidebar
        mobile
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        buildings={buildings}
        selectedBuildingId={selectedBuildingId}
        onBuildingChange={handleBuildingChange}
      />
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
        onToggleMenu={() => setMenuOpen((current) => !current)}
        onLogout={handleLogout}
        buildings={buildings}
        selectedBuildingId={selectedBuildingId}
      />

      <main className="min-h-screen pt-16 lg:ml-[260px]">
        <div key={location.pathname} className="app-page-stage mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
