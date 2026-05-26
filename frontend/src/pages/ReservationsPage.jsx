import AdminLayout from "../components/AdminLayout";

const stats = [
  {
    label: "Today's Arrivals",
    value: "124",
    detail: "12% increase from yesterday",
    icon: "login",
    iconClass: "bg-[#dbe1ff] text-[#004ac6]",
    valueClass: "text-[#191b23]",
    detailClass: "text-[#004ac6]",
    detailIcon: "trending_up",
  },
  {
    label: "Active Stays",
    value: "482",
    detail: "82% Capacity utilized",
    icon: "directions_car",
    iconClass: "bg-[#dae2fd] text-[#5c647a]",
    valueClass: "text-[#191b23]",
    detailClass: "text-[#434655]",
  },
  {
    label: "Upcoming Cancellations",
    value: "8",
    detail: "Next 24 hours",
    icon: "event_busy",
    iconClass: "bg-[#ffdad6] text-[#ba1a1a]",
    valueClass: "text-[#ba1a1a]",
    detailClass: "text-[#434655]",
  },
];

const reservations = [
  {
    id: "#PM-88219",
    user: "Jonathan Wick",
    vehicle: "ABC-1234 • Mustang",
    date: "Oct 26, 2023",
    time: "09:00 AM - 05:00 PM",
    slot: "L2-B04",
    status: "Confirmed",
    statusClass: "bg-green-100 text-green-800",
    dotClass: "bg-green-600",
    payment: "Paid",
    paymentClass: "bg-blue-50 text-blue-700",
  },
  {
    id: "#PM-88220",
    user: "Sarah Connor",
    vehicle: "SUV-9988 • Range Rover",
    date: "Oct 26, 2023",
    time: "10:30 AM - 02:00 PM",
    slot: "L1-A12",
    status: "Checked-in",
    statusClass: "bg-amber-100 text-amber-800",
    dotClass: "bg-amber-600",
    payment: "Paid",
    paymentClass: "bg-blue-50 text-blue-700",
  },
  {
    id: "#PM-88221",
    user: "Thomas Anderson",
    vehicle: "NEO-0101 • Tesla S",
    date: "Oct 26, 2023",
    time: "11:00 AM - 06:00 PM",
    slot: "L3-C02",
    status: "Cancelled",
    statusClass: "bg-slate-100 text-slate-500 opacity-70",
    dotClass: "bg-slate-400",
    payment: "Refunded",
    paymentClass: "bg-red-50 text-red-600",
  },
];

function PageHeader() {
  return (
    <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        <h2 className="mb-1 font-['Geist'] text-4xl font-bold leading-[44px] text-[#191b23]">
          Reservation Management
        </h2>
        <p className="font-['Inter'] text-base text-[#434655]">
          View and manage upcoming parking bookings.
        </p>
      </div>
    </div>
  );
}

function StatCard({ stat }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-[#c3c6d7] bg-white p-6 shadow-sm">
      <div>
        <p className="mb-2 font-['Geist'] text-[11px] font-semibold uppercase tracking-wider text-[#434655]">
          {stat.label}
        </p>
        <h3 className={`font-['Geist'] text-2xl font-semibold leading-8 ${stat.valueClass}`}>
          {stat.value}
        </h3>
        <p
          className={`mt-2 flex items-center gap-1 font-['Geist'] text-[11px] font-semibold ${stat.detailClass}`}
        >
          {stat.detailIcon && (
            <span className="material-symbols-outlined text-base">{stat.detailIcon}</span>
          )}
          {stat.detail}
        </p>
      </div>
      <div className={`flex h-12 w-12 items-center justify-center rounded-full ${stat.iconClass}`}>
        <span className="material-symbols-outlined">{stat.icon}</span>
      </div>
    </div>
  );
}

function StatsGrid() {
  return (
    <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
      {stats.map((stat) => (
        <StatCard key={stat.label} stat={stat} />
      ))}
    </div>
  );
}

function ViewControls() {
  return (
    <div className="mb-6 overflow-hidden rounded-xl border border-[#c3c6d7] bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#c3c6d7] p-4">
        <div className="flex items-center rounded-lg bg-[#f3f3fe] p-1">
          <button className="flex items-center gap-2 rounded-md bg-white px-4 py-2 font-['Geist'] text-[13px] font-medium text-[#004ac6] shadow-sm">
            <span className="material-symbols-outlined">list</span>
            List View
          </button>
          <button className="flex items-center gap-2 rounded-md px-4 py-2 font-['Geist'] text-[13px] font-medium text-[#434655] transition hover:text-[#191b23]">
            <span className="material-symbols-outlined">calendar_view_week</span>
            Weekly Grid
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button className="flex items-center gap-2 rounded-lg border border-[#c3c6d7] bg-[#f3f3fe] px-4 py-2 font-['Geist'] text-[13px] text-[#191b23] transition hover:bg-[#ededf9]">
            <span className="material-symbols-outlined text-xl">calendar_today</span>
            Oct 24 - Oct 31, 2023
          </button>
          <button className="flex items-center gap-2 rounded-lg border border-[#c3c6d7] bg-[#f3f3fe] px-4 py-2 font-['Geist'] text-[13px] text-[#434655] transition hover:bg-[#ededf9]">
            <span className="material-symbols-outlined">filter_list</span>
            Filters
          </button>
          <button className="flex items-center gap-2 rounded-lg border border-[#c3c6d7] bg-[#f3f3fe] px-4 py-2 font-['Geist'] text-[13px] text-[#434655] transition hover:bg-[#ededf9]">
            <span className="material-symbols-outlined">file_download</span>
            Export
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 bg-[#faf8ff] px-4 py-3">
        <span className="font-['Geist'] text-[11px] font-medium text-[#434655]">Active Filters:</span>
        {["Status: Confirmed", "Building: North Wing"].map((filter) => (
          <span
            key={filter}
            className="inline-flex items-center gap-1 rounded-full bg-[#dbe1ff] px-3 py-1 font-['Geist'] text-[11px] font-medium text-[#00174b]"
          >
            {filter}
            <button className="material-symbols-outlined text-sm">close</button>
          </span>
        ))}
        <button className="ml-2 font-['Geist'] text-[11px] font-medium text-[#004ac6] hover:underline">
          Clear All
        </button>
      </div>
    </div>
  );
}

function StatusChip({ reservation }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 font-['Geist'] text-[11px] font-bold ${reservation.statusClass}`}
    >
      <span className={`h-2 w-2 rounded-full ${reservation.dotClass}`} />
      {reservation.status}
    </span>
  );
}

function ReservationRow({ reservation }) {
  return (
    <tr className="transition hover:bg-[#f3f3fe]">
      <td className="px-6 py-5 font-mono text-[13px] font-bold text-[#004ac6]">{reservation.id}</td>
      <td className="px-6 py-5">
        <div className="flex flex-col">
          <span className="font-['Inter'] text-base font-medium text-[#191b23]">
            {reservation.user}
          </span>
          <span className="font-['Geist'] text-[11px] text-[#434655]">{reservation.vehicle}</span>
        </div>
      </td>
      <td className="px-6 py-5">
        <div className="flex flex-col">
          <span className="font-['Geist'] text-[13px] text-[#191b23]">{reservation.date}</span>
          <span className="font-['Geist'] text-[11px] text-[#434655]">{reservation.time}</span>
        </div>
      </td>
      <td className="px-6 py-5">
        <span className="inline-flex items-center gap-1 rounded-lg bg-[#e7e7f3] px-3 py-2 font-['Geist'] text-[13px] font-medium text-[#191b23]">
          <span className="material-symbols-outlined text-base">location_on</span>
          {reservation.slot}
        </span>
      </td>
      <td className="px-6 py-5">
        <StatusChip reservation={reservation} />
      </td>
      <td className="px-6 py-5">
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 font-['Geist'] text-[11px] font-bold ${reservation.paymentClass}`}
        >
          {reservation.payment}
        </span>
      </td>
      <td className="px-6 py-5 text-right">
        <button className="material-symbols-outlined text-[#434655] transition hover:text-[#004ac6]">
          more_vert
        </button>
      </td>
    </tr>
  );
}

function ReservationsTable() {
  return (
    <div className="overflow-hidden rounded-xl border border-[#c3c6d7] bg-white shadow-sm">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-[#c3c6d7] bg-[#f3f3fe]">
            {["Reservation ID", "User / Vehicle", "Date & Time", "Slot", "Status", "Payment", "Actions"].map(
              (heading) => (
                <th
                  key={heading}
                  className={`px-6 py-4 font-['Geist'] text-[11px] font-semibold uppercase tracking-wide text-[#434655] ${
                    heading === "Actions" ? "text-right" : ""
                  }`}
                >
                  {heading}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#c3c6d7]">
          {reservations.map((reservation) => (
            <ReservationRow key={reservation.id} reservation={reservation} />
          ))}
        </tbody>
      </table>

      <div className="flex items-center justify-between border-t border-[#c3c6d7] bg-[#f3f3fe] px-6 py-4">
        <span className="font-['Geist'] text-[11px] font-medium text-[#434655]">
          Showing 1-10 of 482 reservations
        </span>
        <div className="flex items-center gap-2">
          <button disabled className="flex h-8 w-8 items-center justify-center rounded-lg opacity-30">
            <span className="material-symbols-outlined text-lg">chevron_left</span>
          </button>
          {[1, 2, 3].map((page) => (
            <button
              key={page}
              className={`flex h-8 w-8 items-center justify-center rounded-lg font-['Geist'] text-[11px] ${
                page === 1 ? "bg-[#004ac6] text-white" : "hover:bg-[#e7e7f3]"
              }`}
            >
              {page}
            </button>
          ))}
          <span className="px-1 font-['Geist'] text-[11px]">...</span>
          <button className="flex h-8 w-8 items-center justify-center rounded-lg font-['Geist'] text-[11px] hover:bg-[#e7e7f3]">
            48
          </button>
          <button className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-[#e7e7f3]">
            <span className="material-symbols-outlined text-lg">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ReservationsPage() {
  const headerAction = (
    <button className="flex items-center gap-2 rounded-xl bg-[#004ac6] px-5 py-2.5 font-['Geist'] text-[13px] font-medium text-white shadow-md shadow-blue-900/20 transition hover:bg-[#2563eb] active:scale-95">
      <span className="material-symbols-outlined">add_circle</span>
      New Reservation
    </button>
  );

  return (
    <AdminLayout
      activeLabel="Reservations"
      headerAction={headerAction}
      searchPlaceholder="Search reservations, users, or license plates..."
    >
      <PageHeader />
      <StatsGrid />
      <ViewControls />
      <ReservationsTable />
      <footer className="py-10 text-center opacity-50">
        <p className="font-['Geist'] text-[11px] text-[#434655]">
          © 2023 ParkMaster Pro. Enterprise Edition v4.2.0-stable.
        </p>
      </footer>
    </AdminLayout>
  );
}
