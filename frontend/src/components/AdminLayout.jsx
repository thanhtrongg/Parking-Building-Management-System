import { NavLink, useNavigate } from "react-router-dom";

const navItems = [
  ["dashboard", "Dashboard", "/dashboard"],
  ["local_parking", "Parking Slots", "/parking-slots"],
  ["directions_car", "Vehicles", "/admin-vehicles"],
  ["event_available", "Reservations", "/reservations"],
  ["payments", "Payments", "/payments"],
  ["group", "Users", "/admin-users"],
];

function Brand() {
  return (
    <div className="mb-10 flex items-center gap-3 px-6">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#2563eb] text-3xl font-medium text-white shadow-lg shadow-blue-950/20">
        P
      </div>
      <div>
        <h1 className="font-['Geist'] text-xl font-bold text-[#00174b]">ParkMaster Pro</h1>
        <p className="font-['Geist'] text-[11px] font-semibold text-[#e1e2ed]/70">
          Admin Console
        </p>
      </div>
    </div>
  );
}

function SidebarNav({ activeLabel }) {
  return (
    <nav className="flex-1 space-y-2">
      {navItems.map(([icon, label, path]) => {
        const isActive = label === activeLabel;
        const className = `flex items-center gap-3 rounded-lg px-3 py-2.5 font-['Geist'] text-[13px] font-medium transition duration-200 active:scale-95 ${
          isActive
            ? "bg-[#2563eb] text-white shadow-lg shadow-blue-950/20"
            : "text-[#e1e2ed] hover:bg-white/10 hover:text-white"
        }`;

        const content = (
          <>
            <span
              className="material-symbols-outlined"
              style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              {icon}
            </span>
            <span>{label}</span>
          </>
        );

        if (path === "#") {
          return (
            <a key={label} href="#" className={className}>
              {content}
            </a>
          );
        }

        return (
          <NavLink key={label} to={path} className={className}>
            {content}
          </NavLink>
        );
      })}
    </nav>
  );
}

function UserProfile({ onLogout }) {
  return (
    <div className="px-6 pt-6">
      <div className="border-t border-white/10 pt-6">
        <div className="flex items-center gap-3">
          <img
            className="h-10 w-10 rounded-full border border-[#c3c6d7] object-cover"
            src="https://i.pravatar.cc/100?img=12"
            alt="avatar"
          />
          <div>
            <p className="font-['Geist'] text-[13px] font-medium text-white">Alex Rivers</p>
            <p className="text-[10px] uppercase tracking-wider text-[#e1e2ed]">SUPER ADMIN</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-2.5 font-['Geist'] text-[13px] font-medium text-[#e1e2ed] transition hover:border-red-400/30 hover:bg-red-500/10 hover:text-red-100 active:scale-95"
        >
          <span className="material-symbols-outlined text-lg">logout</span>
          Logout
        </button>
      </div>
    </div>
  );
}

function Sidebar({ activeLabel, onLogout }) {
  return (
    <aside className="fixed left-0 top-0 z-50 flex h-full w-[260px] flex-col bg-[#2e3039] py-6">
      <Brand />
      <div className="flex-1 px-3">
        <SidebarNav activeLabel={activeLabel} />
      </div>
      <UserProfile onLogout={onLogout} />
    </aside>
  );
}

function SearchBox({ placeholder = "Search for slot ID or vehicle tag..." }) {
  return (
    <div className="relative w-full max-w-md">
      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#434655]">
        search
      </span>
      <input
        className="h-12 w-full rounded-xl border border-[#c3c6d7] bg-[#f3f3fe] pl-10 pr-4 font-['Inter'] text-sm text-[#191b23] outline-none transition focus:border-transparent focus:ring-2 focus:ring-[#2563eb]"
        placeholder={placeholder}
      />
    </div>
  );
}

function Header({ action, searchPlaceholder }) {
  return (
    <header className="fixed right-0 top-0 z-40 flex h-16 w-[calc(100%-260px)] items-center justify-between border-b border-[#c3c6d7] bg-[#faf8ff] px-8 shadow-sm">
      <SearchBox placeholder={searchPlaceholder} />

      <div className="flex items-center gap-4">
        <button className="rounded-full p-2 text-[#434655] transition hover:bg-[#e7e7f3]">
          <span className="material-symbols-outlined">notifications</span>
        </button>

        <button className="rounded-full p-2 text-[#434655] transition hover:bg-[#e7e7f3]">
          <span className="material-symbols-outlined">settings</span>
        </button>

        {action && (
          <>
            <div className="mx-2 h-8 w-px bg-[#c3c6d7]" />
            {action}
          </>
        )}
      </div>
    </header>
  );
}

export default function AdminLayout({ activeLabel, headerAction, searchPlaceholder, children }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#faf8ff] font-['Inter'] text-[#191b23]">
      <Sidebar activeLabel={activeLabel} onLogout={handleLogout} />
      <Header action={headerAction} searchPlaceholder={searchPlaceholder} />

      <main className="ml-[260px] h-screen overflow-y-auto pt-16">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
