import UserLayout from "../../components/UserLayout";

const bookings = [
  {
    code: "BK-1024",
    building: "North Tower",
    area: "Basement 2",
    slot: "B2-14",
    vehicleType: "Car",
    startTime: "08:00, Jun 08",
    endTime: "17:30, Jun 08",
    status: "CONFIRMED",
  },
  {
    code: "BK-1027",
    building: "East Wing",
    area: "Level 1",
    slot: "A1-08",
    vehicleType: "Motorbike",
    startTime: "09:15, Jun 10",
    endTime: "12:00, Jun 10",
    status: "PENDING",
  },
  {
    code: "BK-0988",
    building: "South Gate",
    area: "Outdoor Zone",
    slot: "S-22",
    vehicleType: "Car",
    startTime: "07:30, May 28",
    endTime: "18:00, May 28",
    status: "COMPLETED",
  },
  {
    code: "BK-0971",
    building: "North Tower",
    area: "Basement 1",
    slot: "B1-05",
    vehicleType: "Car",
    startTime: "13:00, May 21",
    endTime: "16:00, May 21",
    status: "CANCELLED",
  },
];

const statusStyles = {
  PENDING: "bg-amber-50 text-amber-700 ring-amber-100",
  CONFIRMED: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  CANCELLED: "bg-red-50 text-red-700 ring-red-100",
  COMPLETED: "bg-slate-100 text-slate-700 ring-slate-200",
};

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-black uppercase ring-1 ${
        statusStyles[status] || statusStyles.PENDING
      }`}
    >
      {status}
    </span>
  );
}

function PageHeader() {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <h1 className="font-['Geist'] text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
          My Bookings
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Review reservations, parking location, vehicle type, schedule, and current status.
        </p>
      </div>
      <button className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-black text-white shadow-md shadow-blue-200 transition hover:bg-blue-700">
        <span className="material-symbols-outlined text-[20px]">add_circle</span>
        New Booking
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center shadow-sm">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-blue-50 text-blue-600">
        <span className="material-symbols-outlined text-[34px]">event_busy</span>
      </div>
      <h2 className="mt-5 font-['Geist'] text-xl font-black text-slate-950">
        No bookings yet
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        Your reservations will appear here after you book a parking slot.
      </p>
    </div>
  );
}

function BookingCard({ booking }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-['Geist'] text-lg font-black text-slate-950">
              {booking.code}
            </h2>
            <StatusBadge status={booking.status} />
          </div>
          <p className="mt-2 text-sm font-semibold text-slate-700">
            {booking.building} · {booking.area}
          </p>
        </div>
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
          <span className="material-symbols-outlined text-[24px]">
            local_parking
          </span>
        </div>
      </div>

      <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
        <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-100">
          <p className="text-xs font-black uppercase tracking-wider text-slate-400">
            Slot
          </p>
          <p className="mt-1 font-black text-slate-950">{booking.slot}</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-100">
          <p className="text-xs font-black uppercase tracking-wider text-slate-400">
            Vehicle
          </p>
          <p className="mt-1 font-black text-slate-950">{booking.vehicleType}</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-100">
          <p className="text-xs font-black uppercase tracking-wider text-slate-400">
            Start
          </p>
          <p className="mt-1 font-black text-slate-950">{booking.startTime}</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-100">
          <p className="text-xs font-black uppercase tracking-wider text-slate-400">
            End
          </p>
          <p className="mt-1 font-black text-slate-950">{booking.endTime}</p>
        </div>
      </div>
    </article>
  );
}

export default function UserMyBookingsPage() {
  return (
    <UserLayout>
      <PageHeader />

      {bookings.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          {bookings.map((booking) => (
            <BookingCard key={booking.code} booking={booking} />
          ))}
        </div>
      )}
    </UserLayout>
  );
}
