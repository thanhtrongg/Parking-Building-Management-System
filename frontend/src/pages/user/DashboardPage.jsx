import { Link } from "react-router-dom";
import UserLayout from "../../components/UserLayout";

const summaryCards = [
  {
    label: "Total Bookings",
    value: "12",
    icon: "event_available",
    tone: "bg-blue-50 text-blue-700 ring-blue-100",
  },
  {
    label: "Upcoming",
    value: "2",
    icon: "calendar_month",
    tone: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  },
  {
    label: "Latest Status",
    value: "Confirmed",
    icon: "verified",
    tone: "bg-amber-50 text-amber-700 ring-amber-100",
  },
];

const upcomingBookings = [
  {
    code: "BK-1024",
    location: "North Tower Parking",
    slot: "B2-14",
    vehicleType: "Car",
    startTime: "08:00, Jun 08",
    endTime: "17:30, Jun 08",
    status: "CONFIRMED",
  },
  {
    code: "BK-1027",
    location: "East Wing Garage",
    slot: "A1-08",
    vehicleType: "Motorbike",
    startTime: "09:15, Jun 10",
    endTime: "12:00, Jun 10",
    status: "PENDING",
  },
];

const quickActions = [
  ["add_circle", "New Booking", "/user-bookings"],
  ["receipt_long", "View History", "/user-bookings"],
  ["manage_accounts", "Update Profile", "/user-settings"],
];

function StatusBadge({ status }) {
  const styles = {
    CONFIRMED: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    PENDING: "bg-amber-50 text-amber-700 ring-amber-100",
    CANCELLED: "bg-red-50 text-red-700 ring-red-100",
    COMPLETED: "bg-slate-100 text-slate-700 ring-slate-200",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-black uppercase ring-1 ${
        styles[status] || styles.COMPLETED
      }`}
    >
      {status}
    </span>
  );
}

function PageHero() {
  return (
    <section className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1fr_320px] lg:p-8">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-black text-blue-700 ring-1 ring-blue-100">
            <span className="material-symbols-outlined text-base">local_parking</span>
            Parking User
          </div>
          <h1 className="mt-5 max-w-2xl font-['Geist'] text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            Your parking day, organized clearly.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
            Track upcoming reservations, check the latest booking status, and jump into common actions quickly.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/user-bookings"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-black text-white shadow-md shadow-blue-200 transition hover:bg-blue-700"
            >
              <span className="material-symbols-outlined text-[20px] leading-none">
                add_circle
              </span>
              Book a Slot
            </Link>
            <Link
              to="/user-settings"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <span className="material-symbols-outlined text-[20px] leading-none">
                settings
              </span>
              Account Settings
            </Link>
          </div>
        </div>

        <div className="rounded-2xl bg-slate-950 p-5 text-white">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
            Next Booking
          </p>
          <p className="mt-4 text-2xl font-black">B2-14</p>
          <p className="mt-1 text-sm font-semibold text-slate-300">
            North Tower Parking
          </p>
          <div className="mt-5 space-y-3 text-sm text-slate-200">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">schedule</span>
              08:00 - 17:30
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">directions_car</span>
              Car reservation
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SummaryGrid() {
  return (
    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
      {summaryCards.map((card) => (
        <article
          key={card.label}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                {card.label}
              </p>
              <p className="mt-2 text-3xl font-black text-slate-950">
                {card.value}
              </p>
            </div>
            <div className={`grid h-12 w-12 place-items-center rounded-2xl ring-1 ${card.tone}`}>
              <span className="material-symbols-outlined text-[24px]">{card.icon}</span>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function UpcomingBookings() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <h2 className="font-['Geist'] text-lg font-black text-slate-950">
          Upcoming Bookings
        </h2>
        <Link to="/user-bookings" className="text-sm font-black text-blue-600">
          View all
        </Link>
      </div>
      <div className="divide-y divide-slate-100">
        {upcomingBookings.map((booking) => (
          <div
            key={booking.code}
            className="grid gap-4 px-5 py-4 md:grid-cols-[1fr_auto] md:items-center"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-black text-slate-950">{booking.code}</p>
                <StatusBadge status={booking.status} />
              </div>
              <p className="mt-2 text-sm font-semibold text-slate-700">
                {booking.location} - Slot {booking.slot}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {booking.vehicleType} · {booking.startTime} to {booking.endTime}
              </p>
            </div>
            <button className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:bg-slate-50">
              <span className="material-symbols-outlined text-[20px]">visibility</span>
              Details
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

function QuickActions() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="font-['Geist'] text-lg font-black text-slate-950">
        Quick Actions
      </h2>
      <div className="mt-4 grid gap-3">
        {quickActions.map(([icon, label, path]) => (
          <Link
            key={label}
            to={path}
            className="flex h-12 items-center justify-between rounded-xl bg-slate-50 px-4 text-sm font-black text-slate-700 ring-1 ring-slate-100 transition hover:bg-blue-50 hover:text-blue-700 hover:ring-blue-100"
          >
            <span className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[21px]">{icon}</span>
              {label}
            </span>
            <span className="material-symbols-outlined text-[20px]">
              chevron_right
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default function UserDashboardPage() {
  return (
    <UserLayout>
      <PageHero />
      <SummaryGrid />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <UpcomingBookings />
        <QuickActions />
      </div>
    </UserLayout>
  );
}
