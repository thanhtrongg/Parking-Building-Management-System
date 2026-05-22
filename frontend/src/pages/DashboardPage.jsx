import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";

const sessions = [
  ["30A-123.45", "Car • S-1029", "B1-A12", "08:15 AM", "Active"],
  ["29C-987.65", "Truck • S-1028", "Floor 1-B05", "08:02 AM", "Active"],
  ["51F-555.22", "Car • S-1027", "B2-C10", "07:45 AM", "Completed"],
  ["14B-111.99", "Bike • S-1026", "Floor 2-A01", "07:30 AM", "Paid"],
];

const metrics = [
  {
    title: "Available / Total",
    value: "120",
    suffix: "/ 500",
    icon: "local_parking",
    iconClass: "bg-blue-100 text-blue-600",
    progress: 24,
  },
  {
    title: "Occupied Slots",
    value: "330",
    icon: "directions_car",
    iconClass: "bg-red-100 text-red-600",
    trend: "↗ +12% vs last hour",
    trendClass: "text-red-700",
  },
  {
    title: "Today Revenue",
    value: "8.5M",
    suffix: "VND",
    icon: "payments",
    iconClass: "bg-green-100 text-green-600",
    trend: "↗ +5% vs yesterday",
    trendClass: "text-green-700",
  },
  {
    title: "Other Status",
    icon: "build",
    iconClass: "bg-red-50 text-red-700",
    rows: [
      ["Reserved", "30"],
      ["Maintenance", "20"],
    ],
  },
];

function DashboardHeader({ onViewSlots }) {
  return (
    <section className="mb-7 rounded-2xl border border-[#c3c6d7] bg-[#faf8ff] px-7 py-6 shadow-sm">
      <div className="flex flex-col justify-between gap-6 xl:flex-row xl:items-center">
        <div className="max-w-3xl">
          <div className="mb-2 flex flex-wrap items-center gap-3">
            <h1 className="font-['Geist'] text-2xl font-bold leading-8 text-[#080b13]">
              Parking Operations Dashboard
            </h1>
            <span className="inline-flex items-center gap-2 rounded-full bg-red-100 px-3 py-1.5 font-['Geist'] text-xs font-semibold text-red-800">
              <span className="h-1.5 w-1.5 rounded-full bg-red-600" />
              Live System
            </span>
          </div>
          <p className="max-w-2xl font-['Inter'] text-base leading-6 text-[#2f3340]">
            Monitor parking capacity, active sessions, and today's revenue in real time.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={onViewSlots}
            className="flex h-14 min-w-36 items-center justify-center gap-4 rounded-xl border border-[#c3c6d7] bg-white/60 px-4 font-['Inter'] text-sm font-medium text-[#080b13] shadow-sm transition hover:bg-white"
          >
            <span className="material-symbols-outlined text-xl">visibility</span>
            <span className="leading-5">
              View
              <br />
              Slots
            </span>
          </button>
          <button className="flex h-14 min-w-36 items-center justify-center gap-4 rounded-xl border border-[#c3c6d7] bg-white/60 px-4 font-['Inter'] text-sm font-medium text-[#080b13] shadow-sm transition hover:bg-white">
            <span className="material-symbols-outlined text-xl">directions_car</span>
            <span className="leading-5">
              Process
              <br />
              Exit
            </span>
          </button>
          <button className="flex h-14 min-w-36 items-center justify-center gap-4 rounded-xl bg-[#064fe4] px-4 font-['Inter'] text-sm font-bold text-white shadow-md shadow-blue-900/20 transition hover:brightness-110 active:scale-95">
            <span
              className="material-symbols-outlined text-xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              add_circle
            </span>
            <span className="leading-5">
              New
              <br />
              Entry
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}

function MetricCard({ metric }) {
  return (
    <div className="flex min-h-[150px] flex-col rounded-2xl border border-[#c3c6d7] bg-[#faf8ff] p-5 shadow-sm">
      <div className="mb-5 flex items-start justify-between">
        <p className="font-['Geist'] text-base font-medium text-[#191b23]">{metric.title}</p>
        <span
          className={`material-symbols-outlined rounded-xl p-2.5 text-2xl ${metric.iconClass}`}
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {metric.icon}
        </span>
      </div>

      {metric.rows ? (
        <div className="mt-auto space-y-2 font-['Inter'] text-sm text-[#191b23]">
          {metric.rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between">
              <span>{label}</span>
              <span>{value}</span>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="flex items-end gap-3">
            <h2 className="font-['Geist'] text-4xl font-bold leading-none text-[#080b13]">
              {metric.value}
            </h2>
            {metric.suffix && (
              <span className="mb-1 font-['Inter'] text-base text-[#434655]">{metric.suffix}</span>
            )}
          </div>

          {metric.progress && (
            <div className="mt-auto h-1.5 rounded-full bg-[#dedfeb]">
              <div
                className="h-full rounded-full bg-[#064fe4]"
                style={{ width: `${metric.progress}%` }}
              />
            </div>
          )}

          {metric.trend && (
            <p className={`mt-auto font-['Geist'] text-sm font-semibold ${metric.trendClass}`}>
              {metric.trend}
            </p>
          )}
        </>
      )}
    </div>
  );
}

function MetricsGrid() {
  return (
    <section className="mb-7 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <MetricCard key={metric.title} metric={metric} />
      ))}
    </section>
  );
}

function StatusChip({ status }) {
  const className =
    status === "Paid"
      ? "bg-green-100 text-green-700"
      : status === "Completed"
      ? "bg-slate-100 text-slate-700"
      : "bg-blue-100 text-blue-700";

  return (
    <span className={`rounded-full px-3 py-1 font-['Geist'] text-[11px] font-semibold ${className}`}>
      {status}
    </span>
  );
}

function RecentSessions() {
  return (
    <section className="col-span-2 overflow-hidden rounded-xl border border-[#c3c6d7] bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-[#c3c6d7] px-5 py-4">
        <h2 className="font-['Geist'] text-xl font-semibold text-[#191b23]">Recent Sessions</h2>
        <button className="font-['Inter'] text-sm font-semibold text-[#2563eb]">View All</button>
      </div>

      <table className="w-full text-left font-['Inter'] text-sm">
        <thead className="bg-[#f3f3fe] font-['Geist'] text-[11px] uppercase tracking-wider text-[#434655]">
          <tr>
            <th className="p-4">Plate / Code</th>
            <th className="p-4">Slot</th>
            <th className="p-4">Entry</th>
            <th className="p-4">Status</th>
          </tr>
        </thead>

        <tbody>
          {sessions.map(([plate, code, slot, entry, status]) => (
            <tr key={plate} className="border-t border-[#c3c6d7]/50 transition hover:bg-[#f3f3fe]">
              <td className="p-4">
                <p className="font-semibold text-[#191b23]">{plate}</p>
                <p className="text-sm text-[#737686]">{code}</p>
              </td>
              <td className="p-4 text-[#434655]">{slot}</td>
              <td className="p-4 text-[#434655]">{entry}</td>
              <td className="p-4">
                <StatusChip status={status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function Incidents() {
  return (
    <section className="rounded-xl border border-[#c3c6d7] bg-white shadow-sm">
      <div className="border-b border-[#c3c6d7] px-5 py-4">
        <h2 className="font-['Geist'] text-xl font-semibold text-[#191b23]">Incidents</h2>
      </div>

      <div className="space-y-5 p-5">
        <div className="flex gap-3 border-b border-[#c3c6d7]/50 pb-5">
          <span className="material-symbols-outlined h-10 w-10 rounded-full bg-amber-50 p-2 text-amber-600">
            warning
          </span>
          <div>
            <h3 className="font-['Geist'] font-semibold text-[#191b23]">Barrier Malfunction</h3>
            <p className="font-['Inter'] text-sm text-[#737686]">Exit Gate B • Reported by Guard</p>
            <p className="mt-2 font-['Inter'] text-sm text-[#434655]">
              10 mins ago{" "}
              <span className="rounded-full bg-red-100 px-2 py-1 font-['Geist'] text-[11px] font-semibold text-red-700">
                Open
              </span>
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <span className="material-symbols-outlined h-10 w-10 rounded-full bg-blue-50 p-2 text-blue-600">
            info
          </span>
          <div>
            <h3 className="font-['Geist'] font-semibold text-[#191b23]">Wrong Plate Scan</h3>
            <p className="font-['Inter'] text-sm text-[#737686]">Entry A • S-1015</p>
            <p className="mt-2 font-['Inter'] text-sm text-[#434655]">
              1 hour ago{" "}
              <span className="rounded-full bg-slate-100 px-2 py-1 font-['Geist'] text-[11px] font-semibold text-slate-700">
                Resolved
              </span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();

  return (
    <AdminLayout activeLabel="Dashboard">
      <DashboardHeader onViewSlots={() => navigate("/parking-slots")} />
      <MetricsGrid />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <RecentSessions />
        <Incidents />
      </div>
    </AdminLayout>
  );
}
