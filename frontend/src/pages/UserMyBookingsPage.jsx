import { Link } from "react-router-dom";

const navItems = [
  ["dashboard", "Dashboard", "/user-dashboard"],
  ["event_available", "My Bookings", "/user-bookings"],
  ["settings", "Settings", "#"],
];

const upcomingReservations = [
  {
    title: "North Campus Hub",
    slotId: "B-124",
    date: "Oct 24, 2023",
    time: "08:00 AM - 05:00 PM",
    status: "Active",
  },
  {
    title: "East Gate Plaza",
    slotId: "A-089",
    date: "Oct 26, 2023",
    time: "10:00 AM - 02:00 PM",
    status: "Upcoming",
  },
];

const historyRows = [
  ["Oct 20, 2023", "Library West Garage", "C-45", "4h 30m", "$12.50", "Completed"],
  ["Oct 18, 2023", "North Campus Hub", "B-201", "8h 00m", "$22.00", "Completed"],
  ["Oct 15, 2023", "South Science Wing", "S-12", "2h 15m", "$6.50", "Cancelled"],
  ["Oct 12, 2023", "East Gate Plaza", "A-012", "5h 00m", "$15.00", "Completed"],
];

function Brand() {
  return (
    <div className="mb-10 flex items-center gap-3 px-6">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#2563eb] text-3xl font-medium text-white shadow-lg shadow-blue-950/20">
        P
      </div>
      <div>
        <h1 className="font-['Geist'] text-xl font-bold leading-none text-[#2563eb]">
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
    <aside className="fixed left-0 top-0 z-50 flex h-full w-[260px] flex-col bg-[#2e3039] py-6">
      <Brand />

      <nav className="flex-1 space-y-2 px-4">
        {navItems.map(([icon, label, path]) => {
          const isActive = label === "My Bookings";
          const className = `flex items-center gap-3 rounded-lg px-4 py-3 font-['Geist'] text-[13px] font-medium transition active:scale-95 ${
            isActive
              ? "border-l-4 border-[#2563eb] bg-white/20 text-[#2563eb]"
              : "text-[#bec6e0] hover:bg-white/10 hover:text-[#dbe1ff]"
          }`;

          if (path === "#") {
            return (
              <a key={label} href="#" className={className}>
                <span className="material-symbols-outlined">{icon}</span>
                <span>{label}</span>
              </a>
            );
          }

          return (
            <Link key={label} to={path} className={className}>
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

      <div className="mx-4 mt-auto">
        <div className="rounded-xl border border-[#c3c6d7] bg-[#f3f3fe] p-4 shadow-sm">
          <h4 className="mb-2 font-['Geist'] text-[13px] font-bold text-[#191b23]">Support</h4>
          <p className="mb-3 font-['Inter'] text-xs leading-5 text-[#434655]">
            Need assistance with your parking spot?
          </p>
          <a
            className="flex items-center gap-1 font-['Geist'] text-[11px] font-semibold text-[#004ac6] hover:underline"
            href="#"
          >
            Contact Help Desk
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </a>
        </div>
      </div>
    </aside>
  );
}

function Topbar() {
  return (
    <header className="fixed right-0 top-0 z-40 flex h-16 w-[calc(100%-260px)] items-center justify-between border-b border-[#c3c6d7] bg-[#faf8ff] px-8 shadow-sm">
      <div className="relative w-full max-w-[420px]">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#737686]">
          search
        </span>
        <input
          className="h-12 w-full rounded-full border border-[#c3c6d7] bg-[#f3f3fe] pl-10 pr-4 font-['Inter'] text-sm text-[#191b23] outline-none transition placeholder:text-[#737686] focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20"
          placeholder="Search bookings, locations..."
        />
      </div>

      <div className="flex items-center gap-6">
        <button className="relative rounded-full p-2 transition hover:bg-[#f3f3fe]">
          <span className="material-symbols-outlined text-[#434655]">notifications</span>
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#ba1a1a] ring-2 ring-[#faf8ff]" />
        </button>

        <div className="flex items-center gap-3 border-l border-[#c3c6d7] pl-4">
          <div className="text-right">
            <p className="font-['Geist'] text-[13px] font-bold text-[#191b23]">John Doe</p>
            <p className="text-[11px] text-[#434655]">Student ID: #29401</p>
          </div>
          <img
            className="h-9 w-9 rounded-full border border-[#c3c6d7] object-cover"
            src="https://i.pravatar.cc/100?img=12"
            alt="John Doe profile"
          />
        </div>
      </div>
    </header>
  );
}

function PageHeader() {
  return (
    <div className="mb-8 flex items-end justify-between gap-6">
      <div>
        <h2 className="mb-2 font-['Geist'] text-4xl font-bold leading-[44px] text-[#191b23]">
          My Bookings
        </h2>
        <p className="font-['Inter'] text-base text-[#434655]">
          Manage your active reservations and review history
        </p>
      </div>

      <button className="flex items-center gap-2 rounded-lg bg-[#004ac6] px-6 py-3 font-['Geist'] text-[13px] font-medium text-white shadow-md transition hover:bg-[#2563eb] active:scale-95">
        <span className="material-symbols-outlined">add</span>
        New Booking
      </button>
    </div>
  );
}

function ReservationCard({ reservation }) {
  const isActive = reservation.status === "Active";

  return (
    <div className="rounded-xl border border-[#c3c6d7] bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="mb-5 flex items-start justify-between">
        <div className="rounded-lg bg-[#dae2fd] p-2">
          <span
            className="material-symbols-outlined text-[#004ac6]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            location_on
          </span>
        </div>
        <span
          className={`rounded-full px-3 py-1 font-['Geist'] text-xs font-bold uppercase ${
            isActive
              ? "bg-[#ffdbcd] text-[#7d2d00]"
              : "bg-[#e7e7f3] text-[#434655]"
          }`}
        >
          {reservation.status}
        </span>
      </div>

      <h4 className="mb-1 font-['Geist'] text-xl font-semibold text-[#191b23]">
        {reservation.title}
      </h4>
      <p className="mb-5 font-['Geist'] text-[13px] font-medium text-[#004ac6]">
        Slot ID: {reservation.slotId}
      </p>

      <div className="mb-6 space-y-2 border-t border-[#c3c6d7] pt-4 font-['Inter'] text-sm text-[#434655]">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-lg">calendar_today</span>
          <span>{reservation.date}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-lg">schedule</span>
          <span>{reservation.time}</span>
        </div>
      </div>

      <button className="w-full rounded-lg border border-[#ba1a1a] py-2.5 font-['Geist'] text-[13px] font-medium text-[#ba1a1a] transition hover:bg-red-50">
        Cancel Booking
      </button>
    </div>
  );
}

function AddSpotCard() {
  return (
    <button className="flex min-h-[302px] flex-col items-center justify-center rounded-xl border border-dashed border-[#c3c6d7] bg-[#f3f3fe] p-6 text-center opacity-80 transition hover:opacity-100">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
        <span className="material-symbols-outlined text-[#737686]">add_circle</span>
      </div>
      <p className="font-['Geist'] text-[13px] font-medium text-[#434655]">Need another spot?</p>
      <p className="text-xs text-[#737686]">Browse available slots on campus</p>
    </button>
  );
}

function UpcomingReservations() {
  return (
    <section className="mb-12">
      <h3 className="mb-6 font-['Geist'] text-xl font-semibold text-[#191b23]">
        Upcoming Reservations
      </h3>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {upcomingReservations.map((reservation) => (
          <ReservationCard key={reservation.slotId} reservation={reservation} />
        ))}
        <AddSpotCard />
      </div>
    </section>
  );
}

function StatusChip({ status }) {
  const isCancelled = status === "Cancelled";

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
        isCancelled ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
      }`}
    >
      {status}
    </span>
  );
}

function BookingHistory() {
  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <h3 className="font-['Geist'] text-xl font-semibold text-[#191b23]">Booking History</h3>
        <button className="flex items-center gap-1 font-['Geist'] text-[13px] font-medium text-[#004ac6] hover:underline">
          View Full Report
          <span className="material-symbols-outlined text-base">open_in_new</span>
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-[#c3c6d7] bg-white shadow-sm">
        <table className="w-full border-collapse text-left">
          <thead className="border-b border-[#c3c6d7] bg-[#f3f3fe]">
            <tr>
              {["Date", "Location", "Duration", "Amount", "Status"].map((heading) => (
                <th
                  key={heading}
                  className={`px-6 py-4 font-['Geist'] text-[11px] font-semibold uppercase text-[#434655] ${
                    heading === "Status" ? "text-right" : ""
                  }`}
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#c3c6d7]">
            {historyRows.map(([date, location, slot, duration, amount, status]) => (
              <tr key={`${date}-${slot}`} className="transition hover:bg-[#f3f3fe]">
                <td className="px-6 py-4 font-['Inter'] text-sm text-[#191b23]">{date}</td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-['Inter'] text-sm font-medium text-[#191b23]">
                      {location}
                    </span>
                    <span className="text-xs text-[#434655]">Slot: {slot}</span>
                  </div>
                </td>
                <td className="px-6 py-4 font-['Inter'] text-sm text-[#191b23]">{duration}</td>
                <td className="px-6 py-4 font-['Inter'] text-sm text-[#191b23]">{amount}</td>
                <td className="px-6 py-4 text-right">
                  <StatusChip status={status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex items-center justify-between border-t border-[#c3c6d7] bg-[#f3f3fe] px-6 py-4">
          <p className="text-xs text-[#434655]">Showing 4 of 24 bookings</p>
          <div className="flex gap-2">
            <button className="rounded-lg border border-[#c3c6d7] bg-white px-3 py-1 text-[#434655] transition hover:bg-[#faf8ff]">
              Previous
            </button>
            <button className="rounded-lg border border-[#c3c6d7] bg-white px-3 py-1 text-[#434655] transition hover:bg-[#faf8ff]">
              Next
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function UserMyBookingsPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] font-['Inter'] text-[#191b23]">
      <Sidebar />
      <Topbar />

      <main className="ml-[260px] min-h-screen pt-16">
        <div className="mx-auto max-w-7xl px-8 py-10">
          <PageHeader />
          <UpcomingReservations />
          <BookingHistory />
        </div>
      </main>
    </div>
  );
}
