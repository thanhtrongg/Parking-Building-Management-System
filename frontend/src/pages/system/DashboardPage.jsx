import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";

const API_ROOT = import.meta.env.VITE_API_URL || "http://localhost:5000";
const API_BASE_URL = API_ROOT.endsWith("/api") ? API_ROOT : `${API_ROOT}/api`;

function getAuthHeaders() {
  const token = localStorage.getItem("accessToken");

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function fetchApi(path) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${path}`);
  }

  const result = await response.json();
  return result?.data || [];
}

function formatCurrency(value) {
  const number = Number(value || 0);

  if (number >= 1000000) {
    return `${(number / 1000000).toFixed(1)}M`;
  }

  if (number >= 1000) {
    return `${(number / 1000).toFixed(0)}K`;
  }

  return number.toLocaleString("vi-VN");
}

function getTodayLabel() {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "2-digit",
  }).format(new Date());
}

function getStoredUser() {
  try {
    const rawUser = localStorage.getItem("user");
    return rawUser ? JSON.parse(rawUser) : null;
  } catch {
    return null;
  }
}

function getDisplayName() {
  const user = getStoredUser();

  return (
    user?.fullName ||
    user?.full_name ||
    user?.name ||
    user?.username ||
    user?.email ||
    "System Admin"
  );
}

function isToday(dateValue) {
  if (!dateValue) return false;

  const date = new Date(dateValue);
  const today = new Date();

  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

function normalizeArray(value) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.items)) return value.items;
  return [];
}

function StatCard({
  title,
  value,
  suffix,
  description,
  icon,
  accent = "blue",
  progress,
}) {
  const accentClass = {
    blue: "bg-blue-50 text-blue-600 ring-blue-100",
    emerald: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    amber: "bg-amber-50 text-amber-600 ring-amber-100",
    rose: "bg-rose-50 text-rose-600 ring-rose-100",
    violet: "bg-violet-50 text-violet-600 ring-violet-100",
  }[accent];

  const progressClass = {
    blue: "bg-blue-600",
    emerald: "bg-emerald-600",
    amber: "bg-amber-500",
    rose: "bg-rose-500",
    violet: "bg-violet-600",
  }[accent];

  return (
    <article className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/80">
      <div className="mb-5 flex items-start justify-between">
        <div>
          <p className="text-sm font-bold text-slate-500">{title}</p>
          <div className="mt-3 flex items-end gap-2">
            <h3 className="text-4xl font-black tracking-tight text-slate-950">
              {value}
            </h3>
            {suffix && (
              <span className="mb-1 text-sm font-bold text-slate-400">
                {suffix}
              </span>
            )}
          </div>
        </div>

        <span
          className={[
            "material-symbols-outlined grid h-12 w-12 place-items-center rounded-2xl text-[25px] leading-none ring-1",
            accentClass,
          ].join(" ")}
          style={{ fontVariationSettings: "'FILL' 1, 'wght' 500, 'opsz' 24" }}
        >
          {icon}
        </span>
      </div>

      <p className="text-sm font-medium leading-6 text-slate-500">
        {description}
      </p>

      {typeof progress === "number" && (
        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between text-xs font-bold text-slate-400">
            <span>Usage</span>
            <span>{Math.min(progress, 100)}%</span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full ${progressClass}`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>
      )}
    </article>
  );
}

function QuickAction({ icon, title, description, onClick, primary }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "group flex min-h-[104px] items-center gap-4 rounded-3xl border p-5 text-left transition active:scale-[0.98]",
        primary
          ? "border-blue-600 bg-blue-600 text-white shadow-xl shadow-blue-200 hover:bg-blue-700"
          : "border-slate-200 bg-white text-slate-900 shadow-sm hover:-translate-y-1 hover:border-blue-100 hover:bg-blue-50 hover:shadow-xl hover:shadow-slate-200/80",
      ].join(" ")}
    >
      <span
        className={[
          "material-symbols-outlined grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-[25px] leading-none",
          primary
            ? "bg-white/15 text-white"
            : "bg-slate-100 text-slate-600 group-hover:bg-white group-hover:text-blue-600",
        ].join(" ")}
        style={{ fontVariationSettings: "'FILL' 1, 'wght' 500, 'opsz' 24" }}
      >
        {icon}
      </span>

      <span>
        <span className="block text-sm font-black">{title}</span>
        <span
          className={[
            "mt-1 block text-xs font-semibold leading-5",
            primary ? "text-blue-100" : "text-slate-500",
          ].join(" ")}
        >
          {description}
        </span>
      </span>
    </button>
  );
}

function StatusPill({ status }) {
  const value = String(status || "Unknown").toLowerCase();

  const className =
    value.includes("paid") || value.includes("completed")
      ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
      : value.includes("active")
        ? "bg-blue-50 text-blue-700 ring-blue-100"
        : value.includes("reserved")
          ? "bg-amber-50 text-amber-700 ring-amber-100"
          : "bg-slate-50 text-slate-600 ring-slate-100";

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${className}`}
    >
      {status || "Unknown"}
    </span>
  );
}

function EmptyState({ icon, title, description }) {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50/60 p-8 text-center">
      <span className="material-symbols-outlined mb-3 text-4xl text-slate-300">
        {icon}
      </span>
      <h3 className="text-sm font-black text-slate-700">{title}</h3>
      <p className="mt-1 max-w-sm text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function DashboardHero({ name, onNewEntry, onViewSlots }) {
  return (
    <section className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-white p-7 shadow-sm">
      <div className="absolute right-0 top-0 h-44 w-44 rounded-bl-[80px] bg-blue-50" />
      <div className="absolute bottom-0 right-32 h-28 w-28 rounded-full bg-cyan-50" />

      <div className="relative flex flex-col justify-between gap-7 xl:flex-row xl:items-center">
        <div className="max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-black text-blue-700 ring-1 ring-blue-100">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Live Parking Operations
          </div>

          <h1 className="text-4xl font-black tracking-tight text-slate-950">
            Welcome back, {name}
          </h1>

          <p className="mt-3 max-w-2xl text-base font-medium leading-7 text-slate-500">
            Here is a clean overview of today&apos;s parking activity, slot
            usage, reservations, payments, and operating status.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onNewEntry}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 text-sm font-black text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-[21px] leading-none">
                add_circle
              </span>
              New Parking Entry
            </button>

            <button
              type="button"
              onClick={onViewSlots}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-[21px] leading-none">
                local_parking
              </span>
              View Slots
            </button>
          </div>
        </div>

        <div className="grid w-full max-w-md grid-cols-2 gap-3">
          <div className="rounded-3xl bg-slate-950 p-5 text-white shadow-xl shadow-slate-200">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Today
            </p>
            <p className="mt-3 text-2xl font-black">{getTodayLabel()}</p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              System
            </p>
            <p className="mt-3 text-2xl font-black text-emerald-600">Online</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function RecentSessions({ sessions }) {
  const recentSessions = sessions.slice(0, 5);

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
        <div>
          <h2 className="text-lg font-black text-slate-950">Recent Sessions</h2>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Latest vehicle activities in the parking building
          </p>
        </div>

        <button className="rounded-xl bg-slate-50 px-4 py-2 text-sm font-black text-blue-600 transition hover:bg-blue-50">
          View All
        </button>
      </div>

      {recentSessions.length === 0 ? (
        <div className="p-5">
          <EmptyState
            icon="receipt_long"
            title="No recent sessions"
            description="When parking sessions are created, the latest activities will appear here."
          />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-6 py-4 font-black">Vehicle / Code</th>
                <th className="px-6 py-4 font-black">Slot</th>
                <th className="px-6 py-4 font-black">Entry Time</th>
                <th className="px-6 py-4 font-black">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {recentSessions.map((session, index) => {
                const plate =
                  session.plateNumber ||
                  session.plate_number ||
                  session.vehiclePlate ||
                  session.vehicle_plate ||
                  `Vehicle #${index + 1}`;

                const code =
                  session.sessionCode ||
                  session.session_code ||
                  session.code ||
                  session.id ||
                  "N/A";

                const slot =
                  session.slotCode ||
                  session.slot_code ||
                  session.parkingSlot?.slotName ||
                  session.parking_slot?.slot_name ||
                  session.parkingSlot?.slotCode ||
                  session.parking_slot?.slot_code ||
                  "Unassigned";

                const entry =
                  session.entryTime ||
                  session.entry_time ||
                  session.createdAt ||
                  session.created_at;

                const status = session.status || "Active";

                return (
                  <tr
                    key={`${code}-${index}`}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-6 py-4">
                      <p className="font-black text-slate-900">{plate}</p>
                      <p className="mt-1 max-w-[220px] truncate text-xs font-medium text-slate-400">
                        {code}
                      </p>
                    </td>

                    <td className="px-6 py-4 font-bold text-slate-600">
                      {slot}
                    </td>

                    <td className="px-6 py-4 font-medium text-slate-500">
                      {entry ? new Date(entry).toLocaleString("vi-VN") : "N/A"}
                    </td>

                    <td className="px-6 py-4">
                      <StatusPill status={status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function ActivityPanel({ reservations, payments }) {
  const pendingReservations = reservations.filter((item) => {
    const status = String(item.status || "").toLowerCase();
    return status.includes("pending") || status.includes("reserved");
  }).length;

  const successfulPayments = payments.filter((item) => {
    const status = String(item.status || "").toLowerCase();
    return status.includes("paid") || status.includes("success");
  }).length;

  const items = [
    {
      icon: "event_available",
      title: "Pending reservations",
      value: pendingReservations,
      description: "Reservations waiting for confirmation or arrival.",
      className: "bg-amber-50 text-amber-600",
    },
    {
      icon: "payments",
      title: "Successful payments",
      value: successfulPayments,
      description: "Payments marked as paid or successful.",
      className: "bg-emerald-50 text-emerald-600",
    },
    {
      icon: "support_agent",
      title: "Staff attention",
      value: "0",
      description: "No urgent system incident detected from dashboard.",
      className: "bg-blue-50 text-blue-600",
    },
  ];

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-black text-slate-950">Operation Focus</h2>
        <p className="mt-1 text-sm font-medium text-slate-500">
          Important items your team should watch today
        </p>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.title}
            className="flex gap-4 rounded-2xl border border-slate-100 bg-slate-50/60 p-4"
          >
            <span
              className={[
                "material-symbols-outlined grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-[23px] leading-none",
                item.className,
              ].join(" ")}
            >
              {item.icon}
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <h3 className="truncate text-sm font-black text-slate-900">
                  {item.title}
                </h3>
                <span className="text-lg font-black text-slate-950">
                  {item.value}
                </span>
              </div>

              <p className="mt-1 text-sm font-medium leading-6 text-slate-500">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function DashboardSkeleton() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="h-72 animate-pulse rounded-[32px] bg-slate-100" />
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-52 animate-pulse rounded-3xl bg-slate-100"
            />
          ))}
        </div>
        <div className="h-96 animate-pulse rounded-3xl bg-slate-100" />
      </div>
    </AdminLayout>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState({
    parkingSlots: [],
    reservations: [],
    payments: [],
    vehicleTypes: [],
    parkingSessions: [],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    async function loadDashboardData() {
      try {
        const [
          parkingSlotsResult,
          reservationsResult,
          paymentsResult,
          vehicleTypesResult,
          sessionsResult,
        ] = await Promise.allSettled([
          fetchApi("/parking-slots"),
          fetchApi("/reservations"),
          fetchApi("/payments"),
          fetchApi("/vehicle-types"),
          fetchApi("/parking-sessions"),
        ]);

        if (ignore) return;

        setDashboardData({
          parkingSlots:
            parkingSlotsResult.status === "fulfilled"
              ? normalizeArray(parkingSlotsResult.value)
              : [],
          reservations:
            reservationsResult.status === "fulfilled"
              ? normalizeArray(reservationsResult.value)
              : [],
          payments:
            paymentsResult.status === "fulfilled"
              ? normalizeArray(paymentsResult.value)
              : [],
          vehicleTypes:
            vehicleTypesResult.status === "fulfilled"
              ? normalizeArray(vehicleTypesResult.value)
              : [],
          parkingSessions:
            sessionsResult.status === "fulfilled"
              ? normalizeArray(sessionsResult.value)
              : [],
        });
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadDashboardData();

    return () => {
      ignore = true;
    };
  }, []);

  const summary = useMemo(() => {
    const parkingSlots = dashboardData.parkingSlots;
    const reservations = dashboardData.reservations;
    const payments = dashboardData.payments;
    const vehicleTypes = dashboardData.vehicleTypes;
    const sessions = dashboardData.parkingSessions;

    const totalSlots = parkingSlots.length;

    const occupiedSlots = parkingSlots.filter((slot) => {
      const status = String(slot.status || slot.slotStatus || "").toLowerCase();
      return status.includes("occupied") || status.includes("using");
    }).length;

    const availableSlots = parkingSlots.filter((slot) => {
      const status = String(slot.status || slot.slotStatus || "").toLowerCase();
      return status.includes("available") || status.includes("empty");
    }).length;

    const todayPayments = payments.filter((payment) =>
      isToday(payment.createdAt || payment.created_at || payment.paymentDate),
    );

    const todayRevenue = todayPayments.reduce((total, payment) => {
      return (
        total +
        Number(
          payment.amount || payment.totalAmount || payment.total_amount || 0,
        )
      );
    }, 0);

    const activeSessions = sessions.filter((session) => {
      const status = String(session.status || "").toLowerCase();
      return status.includes("active") || status.includes("parking");
    }).length;

    const reservedToday = reservations.filter((reservation) => {
      const status = String(reservation.status || "").toLowerCase();
      return status.includes("pending") || status.includes("reserved");
    }).length;

    const occupancyRate =
      totalSlots > 0 ? Math.round((occupiedSlots / totalSlots) * 100) : 0;

    return {
      totalSlots,
      occupiedSlots,
      availableSlots,
      todayRevenue,
      activeSessions,
      reservedToday,
      vehicleTypeCount: vehicleTypes.length,
      occupancyRate,
    };
  }, [dashboardData]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <AdminLayout>
      <div className="space-y-7">
        <DashboardHero
          name={getDisplayName()}
          onNewEntry={() => navigate("/parking-sessions")}
          onViewSlots={() => navigate("/parking-slots")}
        />

        <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Available Slots"
            value={summary.availableSlots}
            suffix={`/ ${summary.totalSlots}`}
            description="Slots ready for incoming vehicles right now."
            icon="local_parking"
            accent="blue"
            progress={
              summary.totalSlots > 0
                ? Math.round(
                    (summary.availableSlots / summary.totalSlots) * 100,
                  )
                : 0
            }
          />

          <StatCard
            title="Occupied Slots"
            value={summary.occupiedSlots}
            suffix={`/ ${summary.totalSlots}`}
            description="Slots currently being used by parking sessions."
            icon="directions_car"
            accent="rose"
            progress={summary.occupancyRate}
          />

          <StatCard
            title="Today Revenue"
            value={formatCurrency(summary.todayRevenue)}
            suffix="VND"
            description="Revenue calculated from today's successful payments."
            icon="payments"
            accent="emerald"
          />

          <StatCard
            title="Vehicle Types"
            value={summary.vehicleTypeCount}
            description="Supported vehicle categories configured by admin."
            icon="category"
            accent="violet"
          />
        </section>

        <section className="grid grid-cols-1 gap-5 xl:grid-cols-4">
          <QuickAction
            icon="add_circle"
            title="Create Entry"
            description="Start a new parking session for a vehicle."
            primary
            onClick={() => navigate("/parking-sessions")}
          />

          <QuickAction
            icon="event_available"
            title="Reservations"
            description={`${summary.reservedToday} reservations need attention.`}
            onClick={() => navigate("/reservations")}
          />

          <QuickAction
            icon="payments"
            title="Payments"
            description="Review payment records and transaction status."
            onClick={() => navigate("/payments")}
          />

          <QuickAction
            icon="directions_car"
            title="Vehicle Types"
            description="Manage vehicle categories and rules."
            onClick={() => navigate("/admin-vehicles")}
          />
        </section>

        <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <RecentSessions sessions={dashboardData.parkingSessions} />
          </div>

          <ActivityPanel
            reservations={dashboardData.reservations}
            payments={dashboardData.payments}
          />
        </section>
      </div>
    </AdminLayout>
  );
}
