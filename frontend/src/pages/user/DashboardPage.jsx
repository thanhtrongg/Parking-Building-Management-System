import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const navItems = [
  ["dashboard", "Dashboard", "/user-dashboard"],
  ["event_available", "My Bookings", "/user-bookings"],
  ["settings", "Settings", "/user-settings"],
];

const stats = [
  ["Active Booking", "1", "timer", "bg-[#dbe1ff] text-[#00174b]", "text-[#004ac6]"],
  ["Parking Hours", "12.5", "schedule", "bg-[#dae2fd] text-[#131b2e]", "text-[#191b23]"],
  ["Monthly Spending", "$45.00", "payments", "bg-[#ffdbcd] text-[#360f00]", "text-[#191b23]"],
  ["Reward Points", "120", "stars", "bg-[#e7e7f3] text-[#004ac6]", "text-[#191b23]"],
];

const bookings = [
  ["Oct 24, 2023", "A-102", "2h 15m", "$8.00", "Completed"],
  ["Oct 22, 2023", "C-44", "1h 05m", "$4.50", "Completed"],
  ["Oct 19, 2023", "B-21", "4h 30m", "$16.00", "Completed"],
];

const nearbySlots = [
  ["Slot B-15", "Level 2", "Available", "$3.50", true],
  ["Slot A-04", "Level 1", "Occupied", "$4.00", false],
  ["Slot C-10", "Level 3", "Available", "$2.50", true],
];

function formatTime(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds].map((value) => String(value).padStart(2, "0")).join(":");
}

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
        <p className="font-['Geist'] text-[11px] font-semibold uppercase tracking-wider text-[#bec6e0]">
          Enterprise Suite
        </p>
      </div>
    </div>
  );
}

function Sidebar({ onLogout }) {
  return (
    <aside className="fixed left-0 top-0 z-50 flex h-full w-[260px] flex-col border-r border-[#c3c6d7] bg-[#2e3039] py-6">
      <Brand />

      <nav className="flex-1 space-y-1 px-4">
        {navItems.map(([icon, label, path], index) => {
          const isActive = index === 0;

          return (
            <a
              key={label}
              href={path}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 font-['Geist'] text-[13px] font-medium transition active:scale-95 ${
                isActive
                  ? "border-l-4 border-[#dbe1ff] bg-white/10 text-[#dbe1ff]"
                  : "text-[#bec6e0] hover:bg-white/10 hover:text-[#dbe1ff]"
              }`}
            >
              <span className="material-symbols-outlined">{icon}</span>
              <span>{label}</span>
            </a>
          );
        })}
      </nav>

      <div className="px-4">
        <div className="rounded-xl bg-white/10 p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="font-['Geist'] text-[11px] font-semibold uppercase text-[#bec6e0]">
              Balance
            </span>
            <span className="font-['Geist'] text-[13px] font-bold text-[#dbe1ff]">$25.00</span>
          </div>
          <button className="mb-3 w-full rounded-lg bg-[#004ac6] py-2 font-['Geist'] text-[13px] font-medium text-white shadow-sm transition hover:bg-[#2563eb]">
            Add Funds
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 py-2 font-['Geist'] text-[13px] font-medium text-[#bec6e0] transition hover:border-red-400/30 hover:bg-red-500/10 hover:text-red-100"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}

function Topbar() {
  return (
    <header className="fixed right-0 top-0 z-40 flex h-16 w-[calc(100%-260px)] items-center justify-between border-b border-[#c3c6d7] bg-[#faf8ff] px-8 shadow-sm">
      <div className="flex h-12 w-full max-w-[480px] items-center rounded-full bg-[#f3f3fe] px-4">
        <span className="material-symbols-outlined mr-2 text-xl text-[#737686]">search</span>
        <input
          className="w-full border-none bg-transparent font-['Geist'] text-[13px] text-[#191b23] outline-none placeholder:text-[#737686] focus:ring-0"
          placeholder="Search facilities, slots, or history..."
        />
      </div>

      <div className="flex items-center gap-6">
        <button className="relative rounded-full p-2 transition hover:bg-[#f3f3fe]">
          <span className="material-symbols-outlined text-[#434655]">notifications</span>
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#ba1a1a] ring-2 ring-[#faf8ff]" />
        </button>

        <div className="flex items-center gap-3 border-l border-[#c3c6d7] pl-4">
          <div className="text-right">
            <p className="font-['Geist'] text-[13px] font-bold text-[#191b23]">
              Welcome back, John
            </p>
            <p className="text-[11px] text-[#737686]">Student ID: #88219</p>
          </div>
          <img
            className="h-9 w-9 rounded-full border-2 border-[#2563eb] object-cover shadow-sm"
            src="https://i.pravatar.cc/100?img=12"
            alt="User profile"
          />
        </div>
      </div>
    </header>
  );
}

function WelcomeBanner() {
  return (
    <section className="relative mb-6 overflow-hidden rounded-xl bg-[#2563eb] p-8 shadow-sm">
      <div className="relative z-10 max-w-2xl">
        <h2 className="mb-2 font-['Geist'] text-4xl font-bold leading-[44px] text-white">
          Welcome back, John.
        </h2>
        <p className="mb-6 font-['Inter'] text-base leading-6 text-white/90">
          You have one active session at the{" "}
          <span className="font-bold underline">North Campus Parking Hub</span>.
        </p>
        <button className="flex items-center gap-2 rounded-xl bg-white px-8 py-3 font-['Geist'] text-[13px] font-bold text-[#004ac6] shadow-lg transition hover:bg-[#faf8ff] active:scale-95">
          <span className="material-symbols-outlined text-lg">add_circle</span>
          Book Slot
        </button>
      </div>

      <div className="pointer-events-none absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-white/25 to-transparent" />
      <span className="material-symbols-outlined pointer-events-none absolute right-16 top-1/2 hidden -translate-y-1/2 text-[140px] text-white/10 lg:block">
        directions_car
      </span>
    </section>
  );
}

function StatCard({ stat }) {
  const [label, value, icon, iconClass, valueClass] = stat;

  return (
    <div className="rounded-xl border border-[#c3c6d7] bg-white p-5 shadow-sm transition hover:shadow-md">
      <p className="mb-2 font-['Geist'] text-[11px] font-semibold uppercase text-[#737686]">
        {label}
      </p>
      <div className="flex items-end justify-between">
        <h3 className={`font-['Geist'] text-4xl font-bold leading-none ${valueClass}`}>{value}</h3>
        <div className={`rounded-lg p-2 ${iconClass}`}>
          <span
            className="material-symbols-outlined"
            style={icon === "stars" ? { fontVariationSettings: "'FILL' 1" } : undefined}
          >
            {icon}
          </span>
        </div>
      </div>
    </div>
  );
}

function StatsGrid() {
  return (
    <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <StatCard key={stat[0]} stat={stat} />
      ))}
    </div>
  );
}

function CurrentSession() {
  const [seconds, setSeconds] = useState(2 * 3600 + 14 * 60 + 48);
  const elapsedTime = useMemo(() => formatTime(seconds), [seconds]);

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setSeconds((current) => current + 1);
    }, 1000);

    return () => window.clearInterval(timerId);
  }, []);

  return (
    <section className="flex flex-col overflow-hidden rounded-xl border border-[#c3c6d7] bg-white shadow-sm">
      <div className="border-b border-[#c3c6d7] bg-[#f3f3fe]/40 p-5">
        <h3 className="flex items-center gap-2 font-['Geist'] text-xl font-semibold text-[#191b23]">
          <span
            className="material-symbols-outlined text-[#004ac6]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            room_service
          </span>
          Current Session
        </h3>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center space-y-6 p-8 text-center">
        <div>
          <p className="font-['Geist'] text-[13px] font-medium uppercase text-[#737686]">
            Location
          </p>
          <p className="font-['Geist'] text-2xl font-bold leading-8 text-[#191b23]">
            North Campus - Level 2, Slot B-12
          </p>
        </div>

        <div className="rounded-2xl border border-[#c3c6d7] bg-[#ededf9] px-10 py-4">
          <p className="mb-1 font-['Geist'] text-[11px] font-semibold text-[#737686]">
            Elapsed Time
          </p>
          <p className="font-['Geist'] text-[42px] leading-none tracking-tight text-[#2563eb] tabular-nums">
            {elapsedTime}
          </p>
        </div>

        <div className="grid w-full grid-cols-2 gap-4 text-left">
          <div className="rounded-lg bg-[#f3f3fe] p-3">
            <p className="text-[11px] uppercase text-[#737686]">Entry</p>
            <p className="font-['Geist'] text-[13px] font-bold text-[#191b23]">09:30 AM</p>
          </div>
          <div className="rounded-lg bg-[#f3f3fe] p-3">
            <p className="text-[11px] uppercase text-[#737686]">Est. Cost</p>
            <p className="font-['Geist'] text-[13px] font-bold text-[#943700]">$6.75</p>
          </div>
        </div>

        <button className="w-full rounded-xl bg-[#ba1a1a] py-4 font-['Geist'] text-[13px] font-bold text-white shadow-md transition hover:brightness-95 active:scale-95">
          End Session
        </button>
      </div>
    </section>
  );
}

function RecentBookings() {
  return (
    <section className="overflow-hidden rounded-xl border border-[#c3c6d7] bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-[#c3c6d7] px-6 py-4">
        <h3 className="font-['Geist'] text-xl font-semibold text-[#191b23]">Recent Bookings</h3>
        <button className="font-['Geist'] text-[13px] font-medium text-[#004ac6] hover:underline">
          View All
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-[#f3f3fe]">
              {["Date", "Slot", "Duration", "Payment", "Status"].map((heading) => (
                <th
                  key={heading}
                  className="px-6 py-3 font-['Geist'] text-[11px] font-semibold uppercase text-[#737686]"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#c3c6d7]">
            {bookings.map(([date, slot, duration, payment, status]) => (
              <tr key={slot} className="transition hover:bg-[#f3f3fe]">
                <td className="px-6 py-4 font-['Inter'] text-sm text-[#191b23]">{date}</td>
                <td className="px-6 py-4 font-['Geist'] text-[13px] font-bold text-[#191b23]">
                  {slot}
                </td>
                <td className="px-6 py-4 font-['Inter'] text-sm text-[#737686]">{duration}</td>
                <td className="px-6 py-4 font-['Geist'] text-[13px] font-bold text-[#191b23]">
                  {payment}
                </td>
                <td className="px-6 py-4">
                  <span className="rounded-full bg-green-100 px-3 py-1 font-['Geist'] text-[11px] font-bold uppercase tracking-tight text-green-700">
                    {status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function SlotAvailabilityCard({ slot }) {
  const [name, level, status, price, isAvailable] = slot;

  return (
    <div
      className={`flex flex-col gap-4 rounded-xl border border-[#c3c6d7] bg-white p-5 shadow-sm ${
        isAvailable ? "" : "opacity-70"
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="font-['Geist'] text-[13px] font-bold text-[#191b23]">{name}</p>
          <p className="text-[11px] uppercase text-[#737686]">{level}</p>
        </div>
        <span
          className={`rounded-lg px-2 py-1 font-['Geist'] text-[10px] font-bold uppercase ${
            isAvailable ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
          }`}
        >
          {status}
        </span>
      </div>

      <div className="mt-2 flex items-center justify-between">
        <span
          className={`font-['Geist'] text-2xl font-semibold ${
            isAvailable ? "text-[#191b23]" : "text-[#737686]"
          }`}
        >
          {price}
          <span className="font-['Inter'] text-sm font-normal text-[#737686]">/hr</span>
        </span>

        {isAvailable ? (
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2563eb] text-white shadow-sm transition hover:scale-110">
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        ) : (
          <span className="text-xs italic text-[#737686]">Opens in 12m</span>
        )}
      </div>
    </div>
  );
}

function NearbyAvailability() {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-['Geist'] text-xl font-semibold text-[#191b23]">Nearby Availability</h3>
        <div className="flex items-center gap-2 text-[#737686]">
          <span className="material-symbols-outlined text-sm">location_on</span>
          <span className="font-['Geist'] text-[11px] font-semibold">North Campus Hub</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {nearbySlots.map((slot) => (
          <SlotAvailabilityCard key={slot[0]} slot={slot} />
        ))}
      </div>
    </section>
  );
}

export default function UserDashboardPage() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#faf8ff] font-['Inter'] text-[#191b23]">
      <Sidebar onLogout={handleLogout} />
      <Topbar />

      <main className="ml-[260px] min-h-screen bg-[#f8fafc] pt-16">
        <div className="space-y-6 p-8">
          <WelcomeBanner />
          <StatsGrid />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <CurrentSession />
            </div>

            <div className="space-y-6 lg:col-span-2">
              <RecentBookings />
              <NearbyAvailability />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
