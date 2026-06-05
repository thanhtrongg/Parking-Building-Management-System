import { Link } from "react-router-dom";

const navItems = [
  ["dashboard", "Dashboard", "/user-dashboard"],
  ["event_available", "My Bookings", "/user-bookings"],
  ["settings", "Settings", "/user-settings"],
];

const paymentMethods = [
  ["credit_card", "Visa ending in 4242", "Expires 12/26 • Default"],
  ["credit_card", "Mastercard ending in 8891", "Expires 05/25"],
];

function Brand() {
  return (
    <div className="mb-10 flex items-center gap-3 px-6">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#2563eb] text-3xl font-medium text-white shadow-lg shadow-blue-950/20">
        P
      </div>
      <div>
        <h1 className="font-['Geist'] text-xl font-bold leading-none text-[#dbe1ff]">
          ParkControl
        </h1>
        <p className="font-['Geist'] text-[11px] font-semibold text-[#bec6e0]">
          Enterprise Suite
        </p>
      </div>
    </div>
  );
}

function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-50 hidden h-dvh w-[260px] flex-col overflow-hidden bg-[#2e3039] py-4 lg:flex">
      <Brand />

      <nav className="min-h-0 flex-1 space-y-2 overflow-y-auto px-4 pb-3">
        {navItems.map(([icon, label, path]) => {
          const isActive = label === "Settings";

          return (
            <Link
              key={label}
              to={path}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 font-['Geist'] text-[13px] font-medium transition active:scale-95 ${
                isActive
                  ? "border-l-4 border-[#2563eb] bg-white/20 text-[#2563eb]"
                  : "text-[#bec6e0] hover:bg-white/10 hover:text-[#dbe1ff]"
              }`}
            >
              <span
                className="material-symbols-outlined"
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {icon}
              </span>
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="shrink-0 px-4">
        <div className="rounded-xl border border-white/10 bg-white/10 p-4">
          <div className="flex items-center gap-3">
            <img
              className="h-10 w-10 rounded-full object-cover"
              src="https://i.pravatar.cc/100?img=12"
              alt="John Doe"
            />
            <div className="overflow-hidden">
              <p className="truncate font-['Geist'] text-[13px] font-medium text-[#dbe1ff]">
                John Doe
              </p>
              <p className="text-[10px] uppercase tracking-wider text-[#bec6e0]">
                Premium Student
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function Topbar() {
  return (
    <header className="fixed right-0 top-0 z-40 flex h-16 w-full items-center justify-between gap-3 border-b border-[#c3c6d7] bg-[#faf8ff] px-4 shadow-sm sm:px-6 lg:w-[calc(100%-260px)] lg:px-8">
      <div className="flex min-w-0 items-center gap-3 lg:hidden">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#2563eb] text-2xl font-medium text-white">
          P
        </div>
      </div>

      <div className="relative hidden w-full max-w-md sm:block">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#737686]">
          search
        </span>
        <input
          className="h-12 w-full rounded-full border border-[#c3c6d7] bg-[#f3f3fe] pl-10 pr-4 font-['Inter'] text-sm text-[#191b23] outline-none transition placeholder:text-[#737686] focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20"
          placeholder="Search settings, bookings, or maps..."
        />
      </div>

      <div className="flex min-w-0 items-center gap-3 sm:gap-4">
        <button className="relative flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-[#f3f3fe]">
          <span className="material-symbols-outlined text-[#434655]">notifications</span>
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#ba1a1a] ring-2 ring-[#faf8ff]" />
        </button>
        <div className="h-8 w-px bg-[#c3c6d7]" />
        <div className="flex min-w-0 items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="font-['Geist'] text-[13px] font-medium text-[#191b23]">John Doe</p>
            <p className="text-[11px] text-[#737686]">#88219</p>
          </div>
          <img
            className="h-10 w-10 rounded-full border-2 border-[#2563eb] object-cover p-0.5"
            src="https://i.pravatar.cc/100?img=12"
            alt="John Doe"
          />
        </div>
      </div>
    </header>
  );
}

function PageHeader() {
  return (
    <div className="space-y-1">
      <h2 className="font-['Geist'] text-3xl font-bold leading-tight text-[#191b23] sm:text-4xl sm:leading-[44px]">
        Settings
      </h2>
      <p className="font-['Inter'] text-base text-[#434655]">
        Update your account information and customize your experience
      </p>
    </div>
  );
}

function TextField({ label, defaultValue, type = "text", readOnly = false }) {
  return (
    <div className="space-y-2">
      <label className="font-['Geist'] text-[13px] font-medium text-[#434655]">{label}</label>
      <input
        className={`w-full rounded-xl border border-[#c3c6d7] p-3 font-['Inter'] text-sm outline-none transition focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 ${
          readOnly ? "cursor-not-allowed bg-[#f3f3fe] text-[#737686]" : "bg-[#faf8ff] text-[#191b23]"
        }`}
        defaultValue={defaultValue}
        readOnly={readOnly}
        type={type}
      />
    </div>
  );
}

function ProfileCard() {
  return (
    <section className="rounded-xl border border-[#c3c6d7] bg-white p-6 shadow-sm md:col-span-8">
      <div className="mb-6 flex flex-col items-start gap-6 border-b border-[#c3c6d7] pb-6 md:flex-row md:items-center">
        <div className="relative">
          <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border-2 border-[#2563eb] bg-[#ededf9]">
            <img
              className="h-full w-full object-cover"
              src="https://i.pravatar.cc/200?img=12"
              alt="Profile"
            />
          </div>
          <button className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#004ac6] text-white shadow-lg transition hover:scale-110">
            <span className="material-symbols-outlined text-sm">edit</span>
          </button>
        </div>

        <div>
          <h3 className="font-['Geist'] text-xl font-semibold text-[#191b23]">Profile Picture</h3>
          <p className="mb-3 font-['Inter'] text-sm text-[#434655]">PNG, JPG or GIF. Max 2MB.</p>
          <div className="flex gap-2">
            <button className="rounded-lg bg-[#004ac6] px-4 py-2 font-['Geist'] text-[13px] font-medium text-white transition hover:bg-[#2563eb]">
              Upload New
            </button>
            <button className="rounded-lg border border-[#c3c6d7] bg-[#faf8ff] px-4 py-2 font-['Geist'] text-[13px] font-medium text-[#191b23] transition hover:bg-[#f3f3fe]">
              Remove
            </button>
          </div>
        </div>
      </div>

      <form className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <TextField label="Full Name" defaultValue="John Doe" />
          <TextField label="Email Address" defaultValue="john.doe@university.edu" type="email" />
          <TextField label="Student ID" defaultValue="#88219" readOnly />
          <TextField label="Phone Number" defaultValue="+1 (555) 000-0000" type="tel" />
        </div>

        <div className="flex justify-end pt-2">
          <button
            className="rounded-xl bg-[#004ac6] px-6 py-2.5 font-['Geist'] text-[13px] font-medium text-white shadow-sm transition hover:bg-[#2563eb] active:scale-95"
            type="submit"
          >
            Save Changes
          </button>
        </div>
      </form>
    </section>
  );
}

function LanguageCard() {
  return (
    <div className="rounded-xl border border-[#c3c6d7] bg-white p-6 shadow-sm">
      <h3 className="mb-4 flex items-center gap-2 font-['Geist'] text-xl font-semibold text-[#191b23]">
        <span className="material-symbols-outlined text-[#004ac6]">language</span>
        Language
      </h3>
      <div className="relative">
        <select className="w-full appearance-none rounded-xl border border-[#c3c6d7] bg-[#faf8ff] p-3 font-['Inter'] text-sm text-[#191b23] outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20">
          <option>English (US)</option>
          <option>Vietnamese (Tiếng Việt)</option>
        </select>
        <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#737686]">
          expand_more
        </span>
      </div>
    </div>
  );
}

function Toggle({ icon, label, checked = false }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-[#f3f3fe] p-3">
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-[#737686]">{icon}</span>
        <span className="font-['Inter'] text-sm text-[#191b23]">{label}</span>
      </div>
      <label className="relative inline-flex cursor-pointer items-center">
        <input className="peer sr-only" defaultChecked={checked} type="checkbox" />
        <div className="h-6 w-11 rounded-full bg-[#c3c6d7] after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#004ac6] peer-checked:after:translate-x-full peer-checked:after:border-white" />
      </label>
    </div>
  );
}

function PreferencesCards() {
  return (
    <section className="space-y-6 md:col-span-4">
      <LanguageCard />
      <div className="rounded-xl border border-[#c3c6d7] bg-white p-6 shadow-sm">
        <h3 className="mb-4 flex items-center gap-2 font-['Geist'] text-xl font-semibold text-[#191b23]">
          <span className="material-symbols-outlined text-[#004ac6]">notifications_active</span>
          Notifications
        </h3>
        <div className="space-y-4">
          <Toggle checked icon="mail" label="Email Alerts" />
          <Toggle icon="sms" label="SMS Alerts" />
        </div>
      </div>
    </section>
  );
}

function PaymentMethods() {
  return (
    <section className="rounded-xl border border-[#c3c6d7] bg-white p-6 shadow-sm md:col-span-12">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-['Geist'] text-xl font-semibold text-[#191b23]">
          <span className="material-symbols-outlined text-[#004ac6]">credit_card</span>
          Payment Methods
        </h3>
        <button className="flex items-center gap-2 rounded-xl border border-[#c3c6d7] px-4 py-2 font-['Geist'] text-[13px] font-medium text-[#191b23] transition hover:bg-[#f3f3fe]">
          <span className="material-symbols-outlined text-sm">add</span>
          Add New Payment Method
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {paymentMethods.map(([icon, title, description]) => (
          <div
            key={title}
            className="group flex items-center justify-between rounded-xl border border-[#c3c6d7] p-4 transition hover:border-[#2563eb]"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-8 w-12 items-center justify-center rounded bg-[#e7e7f3]">
                <span className="material-symbols-outlined text-[#004ac6]">{icon}</span>
              </div>
              <div>
                <p className="font-['Geist'] text-[13px] font-medium text-[#191b23]">{title}</p>
                <p className="text-[11px] text-[#737686]">{description}</p>
              </div>
            </div>
            <button className="flex h-8 w-8 items-center justify-center rounded-full opacity-0 transition hover:bg-[#ffdad6] hover:text-[#ba1a1a] group-hover:opacity-100">
              <span className="material-symbols-outlined text-sm">delete</span>
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

function DangerZone() {
  return (
    <section className="md:col-span-12">
      <div className="rounded-xl border border-[#ba1a1a]/20 bg-[#ffdad6]/20 p-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h3 className="mb-1 font-['Geist'] text-xl font-semibold text-[#ba1a1a]">
              Danger Zone
            </h3>
            <p className="font-['Inter'] text-sm text-[#434655]">
              Manage your account security and sessions
            </p>
          </div>
          <button className="flex items-center justify-center gap-2 rounded-xl bg-[#ba1a1a] px-6 py-2.5 font-['Geist'] text-[13px] font-medium text-white shadow-sm transition hover:brightness-110 active:scale-95">
            <span
              className="material-symbols-outlined text-sm"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              logout
            </span>
            Sign Out of All Devices
          </button>
        </div>
      </div>
    </section>
  );
}

function MobileNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#2e3039]/95 px-2 py-2 shadow-[0_-10px_30px_rgba(15,23,42,0.18)] backdrop-blur-xl lg:hidden">
      <div className="mx-auto flex max-w-3xl items-center justify-around gap-1">
        {navItems.map(([icon, label, path]) => {
          const isActive = label === "Settings";

          return (
            <Link
              key={label}
              to={path}
              className={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl px-2 py-2 text-[10px] font-black transition ${
                isActive
                  ? "bg-white/10 text-[#dbe1ff]"
                  : "text-[#bec6e0] hover:bg-white/10 hover:text-[#dbe1ff]"
              }`}
            >
              <span
                className="material-symbols-outlined text-[22px] leading-none"
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {icon}
              </span>
              <span className="w-full truncate text-center">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default function UserSettingsPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] font-['Inter'] text-[#191b23]">
      <Sidebar />
      <Topbar />

      <main className="min-h-screen pt-16 lg:ml-[260px]">
        <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 pb-28 sm:px-6 sm:pb-28 lg:px-8 lg:py-8">
          <PageHeader />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
            <ProfileCard />
            <PreferencesCards />
            <PaymentMethods />
            <DangerZone />
          </div>

          <div className="py-6 text-center">
            <p className="text-[11px] uppercase tracking-widest text-[#737686]">
              ParkControl Student Edition • Version 2.4.0
            </p>
          </div>
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
