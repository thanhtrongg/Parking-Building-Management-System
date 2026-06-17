import { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import FeedbackNotifications from "../FeedbackNotifications";
import { getStoredTheme, storeTheme } from "../../utils/theme";

function getStoredUser() {
  try {
    const rawUser = localStorage.getItem("user");
    return rawUser ? JSON.parse(rawUser) : null;
  } catch {
    return null;
  }
}

function clearSession() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("role");
  localStorage.removeItem("rememberMe");
  localStorage.removeItem("authExpiresAt");
}

function getInitials(name, fallback = "PM") {
  const initials = String(name || "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");

  return initials || fallback;
}

function Brand({ title, subtitle }) {
  return (
    <div className="px-4">
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-3 shadow-sm">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-blue-600 text-lg font-black text-white shadow-md shadow-blue-200">
          P
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-base font-black tracking-tight text-slate-950">
            {title}
          </h1>
          <p className="truncate text-xs font-semibold text-slate-500">
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
}

function SidebarNav({ currentPath, items, menuLabel, onNavigate }) {
  return (
    <nav className="mt-5 min-h-0 flex-1 overflow-y-auto px-3 pb-3">
      <p className="mb-3 px-3 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
        {menuLabel}
      </p>

      <div className="space-y-1.5">
        {items.map((item) => {
          const isActive =
            currentPath === item.path ||
            (!item.exact && currentPath.startsWith(`${item.path}/`));

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

function Sidebar({
  brand,
  currentPath,
  items,
  menuLabel,
  mobile = false,
  open = false,
  onClose,
}) {
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

      <Brand title={brand.title} subtitle={brand.subtitle} />
      <SidebarNav
        currentPath={currentPath}
        items={items}
        menuLabel={menuLabel}
        onNavigate={mobile ? onClose : undefined}
      />
    </aside>
  );
}

function Header({
  feedbackAudience,
  header,
  onLogout,
  onToggleMenu,
  onToggleTheme,
  profile,
  theme,
}) {
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
    <header
      className={[
        "fixed right-0 top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/90 px-4 shadow-sm backdrop-blur-xl sm:px-6 lg:w-[calc(100%-260px)] lg:px-8",
        header.desktopInfo ? "" : "lg:justify-end",
      ].join(" ")}
    >
      <div className={`flex min-w-0 items-center gap-3 ${header.desktopInfo ? "" : "lg:hidden"}`}>
        <button
          type="button"
          onClick={onToggleMenu}
          aria-label="Open menu"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm lg:hidden"
        >
          <span className="material-symbols-outlined text-2xl">menu</span>
        </button>

        <div className={header.textVisibilityClassName}>
          <p className="truncate text-sm font-black text-slate-950">
            {header.title}
          </p>
          <p className="truncate text-[11px] font-semibold text-slate-500">
            {header.subtitle}
          </p>
        </div>
      </div>

      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <FeedbackNotifications audience={feedbackAudience} />

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
              {getInitials(profile.name, profile.initialsFallback)}
            </div>
            <p className="hidden max-w-[120px] truncate text-sm font-black text-slate-950 sm:block lg:max-w-[160px]">
              {profile.name}
            </p>
            <span className={`material-symbols-outlined hidden text-lg text-slate-400 transition sm:inline-flex ${profileOpen ? "rotate-180" : ""}`}>
              expand_more
            </span>
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-[calc(100%+0.75rem)] w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl shadow-slate-900/15">
              <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-600 text-xs font-black text-white shadow-md shadow-blue-200">
                  {getInitials(profile.name, profile.initialsFallback)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-black text-slate-950">
                    {profile.name}
                  </p>
                  <p className="truncate text-xs font-medium text-slate-500">
                    {profile.email}
                  </p>
                </div>
              </div>

              <div className="mt-2 flex items-center justify-between rounded-xl px-3 py-2.5">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                  Role
                </span>
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-black uppercase text-emerald-700 ring-1 ring-emerald-100">
                  {profile.roleLabel}
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

export default function AppShell({
  brand,
  children,
  contentClassName,
  feedbackAudience,
  header,
  menuLabel,
  navItems,
  resolveUserDisplay,
  resolveVisibleNavItems,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState(() => getStoredTheme("light"));
  const isDark = theme === "dark";

  const user = useMemo(() => getStoredUser(), []);
  const profile = useMemo(() => resolveUserDisplay(user), [resolveUserDisplay, user]);
  const visibleNavItems = useMemo(
    () => resolveVisibleNavItems(navItems, profile),
    [navItems, profile, resolveVisibleNavItems],
  );

  const handleToggleTheme = () => {
    setTheme((current) => {
      const nextTheme = current === "dark" ? "light" : "dark";
      storeTheme(nextTheme);
      return nextTheme;
    });
  };

  const handleLogout = () => {
    clearSession();
    navigate("/", { replace: true });
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
      if (window.innerWidth >= 1024) {
        setMenuOpen(false);
      }
    };

    window.addEventListener("resize", closeOnDesktop);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("resize", closeOnDesktop);
    };
  }, [menuOpen]);

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
        brand={brand}
        currentPath={location.pathname}
        items={visibleNavItems}
        menuLabel={menuLabel}
      />
      <Sidebar
        brand={brand}
        currentPath={location.pathname}
        items={visibleNavItems}
        menuLabel={menuLabel}
        mobile
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
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
        feedbackAudience={feedbackAudience}
        header={header}
        onLogout={handleLogout}
        onToggleMenu={() => setMenuOpen((current) => !current)}
        onToggleTheme={handleToggleTheme}
        profile={profile}
        theme={theme}
      />

      <main className="min-h-screen pt-16 lg:ml-[260px]">
        <div key={location.pathname} className={contentClassName}>
          {children}
        </div>
      </main>
    </div>
  );
}
