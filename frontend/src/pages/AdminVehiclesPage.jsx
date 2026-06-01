import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import { apiRequest } from "../services/api";

// const stats = [
//   ["Total Vehicle Types", "Live", "directions_car", "bg-blue-50 text-blue-600"],
//   ["Active Types", "From DB", "verified_user", "bg-orange-50 text-orange-700"],
//   [
//     "Unauthorized Entries",
//     "14",
//     "report_problem",
//     "bg-red-50 text-red-600",
//     "Today",
//   ],
// ];

function PageHeader() {
  return (
    <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        <h2 className="mb-1 font-['Geist'] text-2xl font-semibold leading-8 text-[#191b23]">
          Vehicle Management
        </h2>
        <p className="font-['Inter'] text-sm text-[#434655]">
          Manage vehicle types and parking access configuration.
        </p>
      </div>
    </div>
  );
}

function StatCard({ stat }) {
  const [label, value, icon, color, badge] = stat;

  return (
    <div className="flex items-center gap-4 rounded-xl border border-[#c3c6d7] bg-white p-6 shadow-sm">
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-full ${color}`}
      >
        <span className="material-symbols-outlined text-[28px]">{icon}</span>
      </div>

      <div>
        <p className="font-['Geist'] text-[11px] font-semibold uppercase tracking-wider text-[#434655]">
          {label}
        </p>
        <p className="font-['Geist'] text-2xl font-semibold leading-8 text-[#191b23]">
          {value}
          {badge && (
            <span className="ml-2 rounded bg-red-50 px-2 py-0.5 align-middle font-['Geist'] text-[11px] font-medium text-red-600">
              {badge}
            </span>
          )}
        </p>
      </div>
    </div>
  );
}

function StatsGrid({ totalVehicleTypes }) {
  const dynamicStats = [
    [
      "Total Vehicle Types",
      totalVehicleTypes,
      "directions_car",
      "bg-blue-50 text-blue-600",
    ],
    [
      "Active Types",
      totalVehicleTypes,
      "verified_user",
      "bg-orange-50 text-orange-700",
    ],
    [
      "Unauthorized Entries",
      "14",
      "report_problem",
      "bg-red-50 text-red-600",
      "Today",
    ],
  ];

  return (
    <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
      {dynamicStats.map((stat) => (
        <StatCard key={stat[0]} stat={stat} />
      ))}
    </div>
  );
}

function FilterBar({ keyword, setKeyword, total }) {
  return (
    <div className="flex flex-col justify-between gap-4 border-b border-[#c3c6d7] bg-white p-4 md:flex-row md:items-center">
      <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
        <div className="relative md:w-80">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-[#434655]">
            filter_list
          </span>
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            className="h-11 w-full rounded-lg border border-[#c3c6d7] bg-[#faf8ff] pl-10 pr-4 font-['Inter'] text-sm outline-none transition placeholder:text-[#737686] focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]"
            placeholder="Filter by vehicle type..."
          />
        </div>

        <button className="flex h-11 items-center justify-center gap-2 rounded-lg border border-[#c3c6d7] bg-[#faf8ff] px-5 font-['Geist'] text-[13px] font-medium text-[#191b23] transition hover:bg-[#ededf9]">
          Status
          <span className="material-symbols-outlined text-[18px]">
            expand_more
          </span>
        </button>
      </div>

      <div className="flex items-center justify-end gap-2">
        <span className="mr-2 font-['Geist'] text-[13px] font-medium text-[#434655]">
          Total: {total}
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
      <span className="material-symbols-outlined text-white/90">
        directions_car
      </span>
    </div>
  );
}

function VehicleTypeRow({ vehicleType }) {
  return (
    <tr className="transition hover:bg-[#faf8ff]">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <VehicleThumb className="from-slate-950 via-blue-900 to-cyan-400" />
          <div>
            <p className="font-['Geist'] text-[13px] font-medium text-[#191b23]">
              {vehicleType.typeName}
            </p>
            <p className="font-['Inter'] text-xs text-[#434655]">
              Vehicle type from database
            </p>
          </div>
        </div>
      </td>

      <td className="px-6 py-4 font-['Inter'] text-sm text-[#434655]">
        {vehicleType.description || "No description"}
      </td>

      <td className="px-6 py-4">
        <span className="rounded-full bg-[#dae2fd] px-3 py-1 font-['Geist'] text-[11px] font-semibold text-[#5c647a]">
          Vehicle Type
        </span>
      </td>

      <td className="px-6 py-4">
        <div className="flex items-center gap-2 text-[#943700]">
          <span className="h-2 w-2 rounded-full bg-[#943700]" />
          <span className="font-['Geist'] text-[13px] font-medium">Active</span>
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

function VehiclesTable({ vehicleTypes, loading, error, keyword, setKeyword }) {
  const filteredVehicleTypes = vehicleTypes.filter((type) => {
    const searchText =
      `${type.typeName || ""} ${type.description || ""}`.toLowerCase();
    return searchText.includes(keyword.toLowerCase());
  });

  return (
    <div className="overflow-hidden rounded-xl border border-[#c3c6d7] bg-white shadow-sm">
      <FilterBar
        keyword={keyword}
        setKeyword={setKeyword}
        total={filteredVehicleTypes.length}
      />

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead className="bg-[#f3f3fe]">
            <tr>
              {[
                "Vehicle Type",
                "Description",
                "Category",
                "Status",
                "Actions",
              ].map((heading) => (
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
            {loading && (
              <tr>
                <td
                  colSpan="5"
                  className="px-6 py-8 text-center font-['Inter'] text-sm text-[#434655]"
                >
                  Loading vehicle types...
                </td>
              </tr>
            )}

            {!loading && error && (
              <tr>
                <td
                  colSpan="5"
                  className="px-6 py-8 text-center font-['Inter'] text-sm text-red-600"
                >
                  {error}
                </td>
              </tr>
            )}

            {!loading &&
              !error &&
              filteredVehicleTypes.map((vehicleType) => (
                <VehicleTypeRow
                  key={vehicleType.id}
                  vehicleType={vehicleType}
                />
              ))}

            {!loading && !error && filteredVehicleTypes.length === 0 && (
              <tr>
                <td
                  colSpan="5"
                  className="px-6 py-8 text-center font-['Inter'] text-sm text-[#737686]"
                >
                  No vehicle types found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-[#c3c6d7] bg-[#f3f3fe]/40 px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="font-['Inter'] text-sm text-[#434655]">
            Rows per page:
          </span>
          <select className="border-none bg-transparent font-['Geist'] text-[13px] text-[#191b23] outline-none focus:ring-0">
            <option>10</option>
            <option>20</option>
            <option>50</option>
          </select>
        </div>

        <div className="font-['Inter'] text-sm text-[#434655]">
          Showing {filteredVehicleTypes.length} of {vehicleTypes.length}
        </div>
      </div>
    </div>
  );
}

export default function AdminVehiclesPage() {
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    const fetchVehicleTypes = async () => {
      try {
        setLoading(true);
        setError("");

        const result = await apiRequest("/api/vehicle-types");
        setVehicleTypes(result.data || []);
      } catch (error) {
        setError(error.message || "Cannot load vehicle types");
      } finally {
        setLoading(false);
      }
    };

    fetchVehicleTypes();
  }, []);

  const headerAction = (
    <button className="flex items-center gap-2 rounded-xl bg-[#004ac6] px-5 py-2.5 font-['Geist'] text-[13px] font-medium text-white shadow-md shadow-blue-900/20 transition hover:bg-[#2563eb] active:scale-95">
      <span className="material-symbols-outlined text-xl">add</span>
      Add Vehicle Type
    </button>
  );

  return (
    <AdminLayout
      activeLabel="Vehicles"
      headerAction={headerAction}
      searchPlaceholder="Search vehicle types..."
    >
      <PageHeader />
      <StatsGrid totalVehicleTypes={vehicleTypes.length} />
      <VehiclesTable
        vehicleTypes={vehicleTypes}
        loading={loading}
        error={error}
        keyword={keyword}
        setKeyword={setKeyword}
      />
    </AdminLayout>
  );
}
