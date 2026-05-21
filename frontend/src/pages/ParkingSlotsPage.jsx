import { useState } from "react";

const ACTIVE_NAV_LABEL = "Parking Slots";

const navItems = [
  ["dashboard", "Dashboard"],
  ["local_parking", "Parking Slots"],
  ["directions_car", "Vehicles"],
  ["event_available", "Reservations"],
  ["payments", "Payments"],
  ["group", "Users"],
];

const levels = ["Level 1", "Level 2", "Level 3"];

const stats = [
  ["Available", "42", "check_circle", "text-green-600", "bg-green-50"],
  ["Occupied", "68", "directions_car", "text-blue-600", "bg-blue-50"],
  ["Reserved", "10", "event", "text-amber-600", "bg-amber-50"],
  ["Total Slots", "120", "grid_view", "text-[#434655]", "bg-[#ededf9]"],
];

const slots = [
  { id: "A-101", status: "available", info: "Level 1 • Sector A" },
  { id: "A-102", status: "occupied", info: "LNT-8892", sub: "Since 10:45 AM" },
  { id: "A-103", status: "reserved", info: "John Doe", sub: "Arriving 02:00 PM" },
  { id: "A-104", status: "available", info: "Level 1 • Sector A" },
  { id: "A-105", status: "occupied", info: "XYZ-1234", sub: "Since 08:30 AM" },
  { id: "A-106", status: "available", info: "Level 1 • Sector A" },
  { id: "A-107", status: "occupied", info: "ABC-9900" },
  { id: "A-108", status: "available", info: "Level 1 • Sector A" },
  { id: "A-109", status: "reserved", info: "VIP Guest" },
  { id: "A-110", status: "occupied", info: "K-29381" },
  { id: "A-111", status: "available", info: "Level 1 • Sector A" },
  { id: "A-112", status: "occupied", info: "T-1122" },
];

const statusStyles = {
  available: {
    badge: "bg-green-100 text-green-700",
    circle: "bg-green-50",
    icon: "power_settings_new",
    iconColor: "text-gray-400",
    actionIcon: "videocam",
  },
  occupied: {
    badge: "bg-blue-100 text-blue-700",
    circle: "bg-blue-50",
    icon: "directions_car",
    iconColor: "text-blue-600",
    actionIcon: "info",
  },
  reserved: {
    badge: "bg-amber-100 text-amber-700",
    circle: "bg-amber-50",
    icon: "lock",
    iconColor: "text-amber-500",
    actionIcon: "calendar_today",
  },
};

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

function SidebarNav() {
  return (
    <nav className="flex-1 space-y-2">
      {navItems.map(([icon, label]) => {
        const isActive = label === ACTIVE_NAV_LABEL;

        return (
          <a
            key={label}
            href="#"
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 font-['Geist'] text-[13px] font-medium transition duration-200 active:scale-95 ${
              isActive
                ? "bg-[#2563eb] text-white shadow-lg shadow-blue-950/20"
                : "text-[#e1e2ed] hover:bg-white/10 hover:text-white"
            }`}
          >
            <span
              className="material-symbols-outlined"
              style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              {icon}
            </span>
            <span>{label}</span>
          </a>
        );
      })}
    </nav>
  );
}

function UserProfile() {
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
      </div>
    </div>
  );
}

function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-50 flex h-full w-[260px] flex-col bg-[#2e3039] py-6">
      <Brand />
      <div className="flex-1 px-3">
        <SidebarNav />
      </div>
      <UserProfile />
    </aside>
  );
}

function SearchBox() {
  return (
    <div className="relative w-full max-w-md">
      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#434655]">
        search
      </span>
      <input
        className="h-12 w-full rounded-xl border border-[#c3c6d7] bg-[#f3f3fe] pl-10 pr-4 font-['Inter'] text-sm text-[#191b23] outline-none transition focus:border-transparent focus:ring-2 focus:ring-[#2563eb]"
        placeholder="Search for slot ID or vehicle tag..."
      />
    </div>
  );
}

function Header({ onAddSlot }) {
  return (
    <header className="fixed right-0 top-0 z-40 flex h-16 w-[calc(100%-260px)] items-center justify-between border-b border-[#c3c6d7] bg-[#faf8ff] px-8 shadow-sm">
      <SearchBox />

      <div className="flex items-center gap-4">
        <button className="rounded-full p-2 text-[#434655] transition hover:bg-[#e7e7f3]">
          <span className="material-symbols-outlined">notifications</span>
        </button>

        <button className="rounded-full p-2 text-[#434655] transition hover:bg-[#e7e7f3]">
          <span className="material-symbols-outlined">settings</span>
        </button>

        <div className="mx-2 h-8 w-px bg-[#c3c6d7]" />

        <button
          onClick={onAddSlot}
          className="flex items-center gap-2 rounded-xl bg-[#2563eb] px-4 py-2 font-['Inter'] text-sm font-medium text-white shadow-md shadow-blue-900/20 transition hover:brightness-110 active:scale-95"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          Add Slot
        </button>
      </div>
    </header>
  );
}

function PageTitle() {
  return (
    <div>
      <h2 className="mb-1 font-['Geist'] text-2xl font-semibold leading-8 text-[#191b23]">
        Parking Slot Management
      </h2>
      <p className="font-['Inter'] text-base text-[#434655]">
        Real-time status of 120 slots across 3 levels.
      </p>
    </div>
  );
}

function LevelTabs() {
  return (
    <div className="flex items-center gap-1 rounded-xl border border-[#c3c6d7] bg-[#f3f3fe] p-1">
      {levels.map((level, index) => (
        <button
          key={level}
          className={`rounded-lg px-5 py-2 font-['Inter'] text-sm transition ${
            index === 0
              ? "bg-white font-semibold text-[#2563eb] shadow-sm"
              : "font-medium text-[#434655] hover:bg-white/50"
          }`}
        >
          {level}
        </button>
      ))}
    </div>
  );
}

function StatCard({ stat }) {
  const [label, value, icon, color, bg] = stat;

  return (
    <div className="flex items-center justify-between rounded-xl border border-[#c3c6d7] bg-white p-5 shadow-sm">
      <div>
        <p className="mb-1 font-['Geist'] text-[11px] font-semibold uppercase tracking-wider text-[#434655]">
          {label}
        </p>
        <h3 className="font-['Geist'] text-2xl font-bold text-[#191b23]">{value}</h3>
      </div>
      <div className={`flex h-12 w-12 items-center justify-center rounded-full ${bg}`}>
        <span
          className={`material-symbols-outlined ${color}`}
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {icon}
        </span>
      </div>
    </div>
  );
}

function StatsGrid() {
  return (
    <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-4">
      {stats.map((stat) => (
        <StatCard key={stat[0]} stat={stat} />
      ))}
    </div>
  );
}

function SlotCard({ slot }) {
  const style = statusStyles[slot.status];
  const [slotPrefix, slotNumber] = slot.id.split("-");

  return (
    <div className="group relative cursor-pointer overflow-hidden rounded-xl border border-[#c3c6d7] bg-white p-5 transition hover:border-blue-500/30 hover:shadow-xl">
      <div
        className={`absolute -right-12 -top-12 h-24 w-24 rounded-full opacity-50 transition-transform duration-500 group-hover:scale-150 ${style.circle}`}
      />

      <div className="relative z-10">
        <div className="mb-6 flex items-start justify-between gap-2">
          <h3 className="font-['Geist'] text-2xl font-bold leading-9 text-[#191b23]">
            {slotPrefix}-
            <br />
            {slotNumber}
          </h3>

          <span
            className={`rounded-md px-2 py-1 font-['Geist'] text-[10px] font-bold uppercase tracking-wide ${style.badge}`}
          >
            {slot.status}
          </span>
        </div>

        <div className="mb-5 min-h-10">
          <p className="font-['Inter'] text-sm font-medium text-[#191b23]">{slot.info}</p>
          {slot.sub && <p className="font-['Inter'] text-xs text-[#737686]">{slot.sub}</p>}
        </div>

        <div className="flex items-center justify-between border-t border-[#c3c6d7]/30 pt-4">
          <span
            className={`material-symbols-outlined ${style.iconColor} transition-colors group-hover:opacity-90`}
          >
            {style.icon}
          </span>
          <span className="material-symbols-outlined text-[#434655]/40 transition-colors group-hover:text-[#2563eb]">
            {style.actionIcon}
          </span>
        </div>
      </div>
    </div>
  );
}

function SlotsGrid() {
  return (
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {slots.map((slot) => (
        <SlotCard key={slot.id} slot={slot} />
      ))}
    </div>
  );
}

function AddSlotModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#c3c6d7] bg-[#f3f3fe] px-8 py-6">
          <div>
            <h3 className="font-['Geist'] text-xl font-semibold text-[#191b23]">
              Add New Parking Slot
            </h3>
            <p className="font-['Inter'] text-sm text-[#434655]">
              Register a new slot in the system.
            </p>
          </div>
          <button className="rounded-full p-2 text-[#434655] hover:bg-[#e7e7f3]" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form
          className="space-y-6 p-8"
          onSubmit={(e) => {
            e.preventDefault();
            onClose();
          }}
        >
          <div className="grid grid-cols-2 gap-4">
            <input
              className="rounded-xl border border-[#c3c6d7] p-3 font-['Inter'] outline-none focus:border-[#2563eb]"
              placeholder="Slot ID"
              required
            />
            <select className="rounded-xl border border-[#c3c6d7] p-3 font-['Inter'] outline-none focus:border-[#2563eb]">
              {levels.map((level) => (
                <option key={level}>{level}</option>
              ))}
            </select>
          </div>

          <textarea
            className="w-full rounded-xl border border-[#c3c6d7] p-3 font-['Inter'] outline-none focus:border-[#2563eb]"
            rows="4"
            placeholder="Description"
          />

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-[#c3c6d7] py-3 font-['Inter'] font-medium text-[#191b23]"
            >
              Cancel
            </button>
            <button className="flex-1 rounded-xl bg-[#2563eb] py-3 font-['Inter'] font-medium text-white">
              Create Slot
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ParkingSlotsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="min-h-screen bg-[#faf8ff] font-['Inter'] text-[#191b23]">
      <Sidebar />
      <Header onAddSlot={openModal} />

      <main className="ml-[260px] h-screen overflow-y-auto pt-16">
        <div className="p-8">
          <div className="mb-8 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <PageTitle />
            <LevelTabs />
          </div>

          <StatsGrid />
          <SlotsGrid />
        </div>
      </main>

      {isModalOpen && <AddSlotModal onClose={closeModal} />}
    </div>
  );
}
