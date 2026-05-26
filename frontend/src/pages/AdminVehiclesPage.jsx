import AdminLayout from "../components/AdminLayout";

const stats = [
  ["Total Registered", "1,284", "directions_car", "bg-blue-50 text-blue-600"],
  ["Active Permits", "1,102", "verified_user", "bg-orange-50 text-orange-700"],
  ["Unauthorized Entries", "14", "report_problem", "bg-red-50 text-red-600", "Today"],
];

const vehicles = [
  {
    plate: "ABC-1234",
    detail: "Tesla Model 3 • Pearl White",
    owner: "Jonathan Harker",
    permit: "Monthly Resident",
    permitClass: "bg-[#dae2fd] text-[#5c647a]",
    status: "Active",
    statusClass: "text-[#943700]",
    dotClass: "bg-[#943700]",
    thumbClass: "from-slate-700 via-slate-300 to-blue-200",
  },
  {
    plate: "XYZ-9876",
    detail: "BMW X5 • Sophisto Grey",
    owner: "Elena Belova",
    permit: "VIP Executive",
    permitClass: "bg-blue-50 text-[#004ac6]",
    status: "Active",
    statusClass: "text-[#943700]",
    dotClass: "bg-[#943700]",
    thumbClass: "from-slate-950 via-slate-700 to-cyan-200",
  },
  {
    plate: "KDL-4421",
    detail: "Audi A4 • Floret Silver",
    owner: "Marcus Thorne",
    permit: "Visitor",
    permitClass: "bg-[#e7e7f3] text-[#434655]",
    status: "Expired",
    statusClass: "text-[#737686]",
    dotClass: "bg-[#737686]",
    thumbClass: "from-zinc-800 via-zinc-400 to-stone-100",
  },
  {
    plate: "MNO-3329",
    detail: "Honda Civic • Aegean Blue",
    owner: "Sarah Connor",
    permit: "Contractor",
    permitClass: "bg-[#dae2fd] text-[#5c647a]",
    status: "Pending",
    statusClass: "text-[#004ac6]",
    dotClass: "bg-[#004ac6] animate-pulse",
    thumbClass: "from-slate-950 via-blue-900 to-cyan-400",
  },
];

function PageHeader() {
  return (
    <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        <h2 className="mb-1 font-['Geist'] text-2xl font-semibold leading-8 text-[#191b23]">
          Vehicle Management
        </h2>
        <p className="font-['Inter'] text-sm text-[#434655]">
          Manage registered vehicles and their parking access.
        </p>
      </div>
    </div>
  );
}

function StatCard({ stat }) {
  const [label, value, icon, color, badge] = stat;

  return (
    <div className="flex items-center gap-4 rounded-xl border border-[#c3c6d7] bg-white p-6 shadow-sm">
      <div className={`flex h-12 w-12 items-center justify-center rounded-full ${color}`}>
        <span className="material-symbols-outlined text-[28px]">{icon}</span>
      </div>
      <div>
        <p className="font-['Geist'] text-[11px] font-semibold uppercase tracking-wider text-[#434655]">
          {label}
        </p>
        <p className="font-['Geist'] text-2xl font-semibold leading-8 text-[#191b23]">
          {value}
          {badge && (
            <span className="ml-2 rounded bg-red-50 px-2 py-0.5 align-middle font-['Geist'] text-[11px] font-medium text-red-200">
              {badge}
            </span>
          )}
        </p>
      </div>
    </div>
  );
}

function StatsGrid() {
  return (
    <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
      {stats.map((stat) => (
        <StatCard key={stat[0]} stat={stat} />
      ))}
    </div>
  );
}

function FilterBar() {
  return (
    <div className="flex flex-col justify-between gap-4 border-b border-[#c3c6d7] bg-white p-4 md:flex-row md:items-center">
      <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
        <div className="relative md:w-80">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-[#434655]">
            filter_list
          </span>
          <input
            className="h-11 w-full rounded-lg border border-[#c3c6d7] bg-[#faf8ff] pl-10 pr-4 font-['Inter'] text-sm outline-none transition placeholder:text-[#737686] focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]"
            placeholder="Filter by keyword..."
          />
        </div>

        {["Status", "Permit Type"].map((label) => (
          <button
            key={label}
            className="flex h-11 items-center justify-center gap-2 rounded-lg border border-[#c3c6d7] bg-[#faf8ff] px-5 font-['Geist'] text-[13px] font-medium text-[#191b23] transition hover:bg-[#ededf9]"
          >
            {label}
            <span className="material-symbols-outlined text-[18px]">expand_more</span>
          </button>
        ))}
      </div>

      <div className="flex items-center justify-end gap-2">
        <span className="mr-2 font-['Geist'] text-[13px] font-medium text-[#434655]">
          Showing 1-10 of 1,284
        </span>
        <button className="rounded-lg p-2 text-[#434655] transition hover:bg-[#ededf9]">
          <span className="material-symbols-outlined">download</span>
        </button>
        <button className="rounded-lg p-2 text-[#434655] transition hover:bg-[#ededf9]">
          <span className="material-symbols-outlined">print</span>
        </button>
      </div>
    </div>
  );
}

function VehicleThumb({ className }) {
  return (
    <div
      className={`flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br ${className}`}
    >
      <span className="material-symbols-outlined text-white/90">directions_car</span>
    </div>
  );
}

function VehicleRow({ vehicle }) {
  return (
    <tr className="transition hover:bg-[#faf8ff]">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <VehicleThumb className={vehicle.thumbClass} />
          <div>
            <p className="font-['Geist'] text-[13px] font-medium text-[#191b23]">{vehicle.plate}</p>
            <p className="font-['Inter'] text-xs text-[#434655]">{vehicle.detail}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 font-['Inter'] text-sm text-[#434655]">{vehicle.owner}</td>
      <td className="px-6 py-4">
        <span
          className={`rounded-full px-3 py-1 font-['Geist'] text-[11px] font-semibold ${vehicle.permitClass}`}
        >
          {vehicle.permit}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className={`flex items-center gap-2 ${vehicle.statusClass}`}>
          <span className={`h-2 w-2 rounded-full ${vehicle.dotClass}`} />
          <span className="font-['Geist'] text-[13px] font-medium">{vehicle.status}</span>
        </div>
      </td>
      <td className="px-6 py-4 text-right">
        <button className="rounded-lg p-1.5 text-[#737686] transition hover:bg-[#ededf9]">
          <span className="material-symbols-outlined">edit</span>
        </button>
        <button className="ml-1 rounded-lg p-1.5 text-[#ba1a1a] transition hover:bg-[#ffdad6]">
          <span className="material-symbols-outlined">delete</span>
        </button>
      </td>
    </tr>
  );
}

function VehiclesTable() {
  return (
    <div className="overflow-hidden rounded-xl border border-[#c3c6d7] bg-white shadow-sm">
      <FilterBar />

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead className="bg-[#f3f3fe]">
            <tr>
              {["Vehicle", "Owner", "Permit Type", "Status", "Actions"].map((heading) => (
                <th
                  key={heading}
                  className={`px-6 py-4 font-['Geist'] text-[11px] font-semibold uppercase tracking-wider text-[#434655] ${
                    heading === "Actions" ? "text-right" : ""
                  }`}
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#c3c6d7]">
            {vehicles.map((vehicle) => (
              <VehicleRow key={vehicle.plate} vehicle={vehicle} />
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-[#c3c6d7] bg-[#f3f3fe]/40 px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="font-['Inter'] text-sm text-[#434655]">Rows per page:</span>
          <select className="border-none bg-transparent font-['Geist'] text-[13px] text-[#191b23] outline-none focus:ring-0">
            <option>10</option>
            <option>20</option>
            <option>50</option>
          </select>
        </div>

        <div className="flex items-center gap-1">
          <button disabled className="rounded-lg p-2 opacity-30">
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          {[1, 2, 3].map((page) => (
            <button
              key={page}
              className={`flex h-8 w-8 items-center justify-center rounded-lg font-['Geist'] text-[13px] ${
                page === 1 ? "bg-[#004ac6] text-white" : "text-[#191b23] hover:bg-[#ededf9]"
              }`}
            >
              {page}
            </button>
          ))}
          <span className="px-2">...</span>
          <button className="flex h-8 w-8 items-center justify-center rounded-lg font-['Geist'] text-[13px] hover:bg-[#ededf9]">
            129
          </button>
          <button className="rounded-lg p-2 hover:bg-[#ededf9]">
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminVehiclesPage() {
  const headerAction = (
    <button className="flex items-center gap-2 rounded-xl bg-[#004ac6] px-5 py-2.5 font-['Geist'] text-[13px] font-medium text-white shadow-md shadow-blue-900/20 transition hover:bg-[#2563eb] active:scale-95">
      <span className="material-symbols-outlined text-xl">add</span>
      Add Vehicle
    </button>
  );

  return (
    <AdminLayout
      activeLabel="Vehicles"
      headerAction={headerAction}
      searchPlaceholder="Search plates, owners, or permits..."
    >
      <PageHeader />
      <StatsGrid />
      <VehiclesTable />
    </AdminLayout>
  );
}
