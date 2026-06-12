import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import UserLayout from "../../components/UserLayout";
import { apiRequest } from "../../services/api";
import useAutoRefresh from "../../hooks/useAutoRefresh";

const quickActions = [
  ["add_circle", "New Booking", "/user-bookings"],
  ["receipt_long", "View History", "/user-booking-history"],
  ["confirmation_number", "Parking Sessions", "/user-parking-sessions"],
  ["manage_accounts", "Update Profile", "/user-settings"],
];

function getStoredUser() {
  try {
    const rawUser = localStorage.getItem("user");
    return rawUser ? JSON.parse(rawUser) : null;
  } catch {
    return null;
  }
}

function formatDateTime(value) {
  if (!value) return "N/A";

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function normalizeBookings(value) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  return [];
}

function isUpcoming(booking) {
  const status = String(booking.status || "").toUpperCase();
  return ["CONFIRMED", "CHECKED_IN"].includes(status);
}

function StatusBadge({ status }) {
  const styles = {
    CONFIRMED: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    CHECKED_IN: "bg-blue-50 text-blue-700 ring-blue-100",
    CANCELLED: "bg-red-50 text-red-700 ring-red-100",
    COMPLETED: "bg-slate-100 text-slate-700 ring-slate-200",
  };
  const normalizedStatus = String(status || "CONFIRMED").toUpperCase();

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-black uppercase ring-1 ${
        styles[normalizedStatus] || styles.COMPLETED
      }`}
    >
      {normalizedStatus}
    </span>
  );
}

function PageHero({ nextBooking }) {
  const user = getStoredUser();
  const displayName = user?.fullName || user?.email || "Parking user";

  return (
    <section className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1fr_320px] lg:p-8">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-black text-blue-700 ring-1 ring-blue-100">
            <span className="material-symbols-outlined text-base">
              local_parking
            </span>
            Parking User
          </div>
          <h1 className="mt-5 max-w-2xl font-['Geist'] text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            Welcome back, {displayName}.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
            Track upcoming reservations, check the latest booking status, and
            jump into common actions quickly.
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

        <div className="rounded-2xl border border-amber-200 bg-[#fffaf0] p-5 text-slate-950 shadow-sm shadow-amber-900/10">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">
            Next Booking
          </p>
          {nextBooking ? (
            <>
              <p className="mt-4 text-2xl font-black text-slate-950">
                {nextBooking.parkingSlot?.slotName || "Unassigned"}
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-600">
                {nextBooking.parkingSlot?.zone?.zoneName || "No zone"}
              </p>
              <div className="mt-5 space-y-3 text-sm text-slate-700">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">
                    schedule
                  </span>
                  {formatDateTime(nextBooking.startTime)}
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">
                    directions_car
                  </span>
                  {nextBooking.vehicleType?.typeName || "Vehicle"}
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">
                    payments
                  </span>
                  Pay when you checkout
                </div>
              </div>
            </>
          ) : (
            <div className="mt-8 rounded-2xl border border-amber-200 bg-[#f7ecd5] p-4 text-sm font-semibold leading-6 text-slate-600">
              No upcoming booking yet.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function SummaryGrid({ bookings }) {
  const upcomingCount = bookings.filter(isUpcoming).length;
  const latestStatus = bookings[0]?.status || "None";

  const cards = [
    {
      label: "Total Bookings",
      value: bookings.length,
      icon: "event_available",
      tone: "bg-blue-50 text-blue-700 ring-blue-100",
    },
    {
      label: "Upcoming",
      value: upcomingCount,
      icon: "calendar_month",
      tone: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    },
    {
      label: "Latest Status",
      value: latestStatus,
      icon: "verified",
      tone: "bg-amber-50 text-amber-700 ring-amber-100",
    },
  ];

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
      {cards.map((card) => (
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
            <div
              className={`grid h-12 w-12 place-items-center rounded-2xl ring-1 ${card.tone}`}
            >
              <span className="material-symbols-outlined text-[24px]">
                {card.icon}
              </span>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function UpcomingBookings({ bookings }) {
  const upcomingBookings = bookings.filter(isUpcoming).slice(0, 3);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <h2 className="font-['Geist'] text-lg font-black text-slate-950">
          Upcoming Bookings
        </h2>
        <Link
          to="/user-booking-history"
          className="text-sm font-black text-blue-600"
        >
          View all
        </Link>
      </div>

      {upcomingBookings.length === 0 ? (
        <div className="px-5 py-10 text-center text-sm font-semibold text-slate-500">
          No upcoming bookings.
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {upcomingBookings.map((booking) => (
            <div
              key={booking.id}
              className="grid gap-4 px-5 py-4 md:grid-cols-[1fr_auto] md:items-center"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-black text-slate-950">
                    {booking.id?.slice(0, 8)}
                  </p>
                  <StatusBadge status={booking.status} />
                </div>
                <p className="mt-2 text-sm font-semibold text-slate-700">
                  {booking.parkingSlot?.zone?.zoneName || "No zone"} - Slot{" "}
                  {booking.parkingSlot?.slotName || "Unassigned"}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {booking.vehicleType?.typeName || "Vehicle"} - Arrive at{" "}
                  {formatDateTime(booking.startTime)}
                </p>
              </div>
              <Link
                to="/user-booking-history"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:bg-slate-50"
              >
                <span className="material-symbols-outlined text-[20px]">
                  visibility
                </span>
                Details
              </Link>
            </div>
          ))}
        </div>
      )}
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
              <span className="material-symbols-outlined text-[21px]">
                {icon}
              </span>
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
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadBookings() {
      try {
        setLoading(true);
        setError("");
        const result = await apiRequest("/api/reservations");

        if (!ignore) {
          setBookings(normalizeBookings(result));
        }
      } catch (loadError) {
        if (!ignore) {
          setError(loadError.message || "Cannot load dashboard data");
          setBookings([]);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadBookings();

    return () => {
      ignore = true;
    };
  }, []);

  useAutoRefresh(async () => {
    const result = await apiRequest("/api/reservations");
    setBookings(normalizeBookings(result));
  });

  const sortedBookings = useMemo(() => {
    return [...bookings].sort((a, b) => {
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
  }, [bookings]);

  const nextBooking = useMemo(() => {
    return sortedBookings
      .filter(isUpcoming)
      .sort((a, b) => new Date(a.startTime || 0) - new Date(b.startTime || 0))[0];
  }, [sortedBookings]);

  return (
    <UserLayout>
      <PageHero nextBooking={nextBooking} />

      {loading ? (
        <div className="mb-6 h-36 animate-pulse rounded-2xl bg-slate-100" />
      ) : error ? (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
          {error}
        </div>
      ) : (
        <SummaryGrid bookings={sortedBookings} />
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <UpcomingBookings bookings={sortedBookings} />
        <QuickActions />
      </div>
    </UserLayout>
  );
}
