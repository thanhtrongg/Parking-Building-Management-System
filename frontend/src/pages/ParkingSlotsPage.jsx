import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import { apiRequest } from "../services/api";

const statusConfig = {
  AVAILABLE: {
    label: "Available",
    className: "bg-green-100 text-green-700 border-green-200",
    dot: "bg-green-500",
    icon: "check_circle",
  },
  OCCUPIED: {
    label: "Occupied",
    className: "bg-blue-100 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
    icon: "directions_car",
  },
  RESERVED: {
    label: "Reserved",
    className: "bg-amber-100 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
    icon: "event_available",
  },
  MAINTENANCE: {
    label: "Maintenance",
    className: "bg-red-100 text-red-700 border-red-200",
    dot: "bg-red-500",
    icon: "build",
  },
};

function getStatusMeta(status) {
  return (
    statusConfig[status] || {
      label: status || "Unknown",
      className: "bg-slate-100 text-slate-700 border-slate-200",
      dot: "bg-slate-400",
      icon: "help",
    }
  );
}

function getFloorLabel(zoneName = "") {
  if (zoneName.includes("Tầng hầm A")) return "Basement A";
  if (zoneName.includes("Tầng hầm B")) return "Basement B";
  return "Other";
}

function SummaryCard({
  title,
  value,
  icon,
  iconWrapClass = "bg-slate-100",
  iconClass = "text-slate-700",
}) {
  return (
    <div className="rounded-2xl border border-[#d7d9e4] bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-['Geist'] text-[11px] font-semibold uppercase tracking-wider text-[#6b7280]">
            {title}
          </p>
          <h3 className="mt-2 font-['Geist'] text-3xl font-bold text-[#191b23]">
            {value}
          </h3>
        </div>

        <div
          className={`flex h-12 w-12 items-center justify-center rounded-full ${iconWrapClass}`}
        >
          <span className={`material-symbols-outlined ${iconClass}`}>
            {icon}
          </span>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const meta = getStatusMeta(status);

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${meta.className}`}
    >
      <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
}

function ZoneChips({ zones, selectedZone, setSelectedZone }) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => setSelectedZone("ALL")}
        className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
          selectedZone === "ALL"
            ? "border-[#2563eb] bg-[#2563eb] text-white"
            : "border-[#d7d9e4] bg-white text-[#374151] hover:bg-[#f8f9fc]"
        }`}
      >
        All Zones
      </button>

      {zones.map((zone) => (
        <button
          key={zone}
          onClick={() => setSelectedZone(zone)}
          className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
            selectedZone === zone
              ? "border-[#2563eb] bg-[#2563eb] text-white"
              : "border-[#d7d9e4] bg-white text-[#374151] hover:bg-[#f8f9fc]"
          }`}
        >
          {zone}
        </button>
      ))}
    </div>
  );
}

function FilterToolbar({
  keyword,
  setKeyword,
  selectedStatus,
  setSelectedStatus,
  selectedZone,
  setSelectedZone,
  zones,
  filteredCount,
  onResetFilters,
}) {
  return (
    <div className="rounded-2xl border border-[#d7d9e4] bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-[#eceef5] p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex w-full flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative w-full lg:max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]">
              search
            </span>
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search slot name, zone, vehicle type..."
              className="h-11 w-full rounded-xl border border-[#d7d9e4] bg-[#f8f9fc] pl-11 pr-4 text-sm outline-none transition focus:border-[#2563eb] focus:bg-white"
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-11 rounded-xl border border-[#d7d9e4] bg-[#f8f9fc] px-4 text-sm outline-none transition focus:border-[#2563eb]"
          >
            <option value="ALL">All Status</option>
            <option value="AVAILABLE">Available</option>
            <option value="OCCUPIED">Occupied</option>
            <option value="RESERVED">Reserved</option>
            <option value="MAINTENANCE">Maintenance</option>
          </select>

          <button
            onClick={onResetFilters}
            className="h-11 rounded-xl border border-[#d7d9e4] bg-white px-4 text-sm font-medium text-[#374151] transition hover:bg-[#f8f9fc]"
          >
            Reset Filters
          </button>
        </div>

        <div className="flex items-center justify-between gap-3 lg:justify-end">
          <p className="text-sm text-[#6b7280]">
            Showing{" "}
            <span className="font-semibold text-[#191b23]">
              {filteredCount}
            </span>{" "}
            slots
          </p>

          <div className="flex items-center gap-1">
            <button className="rounded-lg p-2 text-[#6b7280] transition hover:bg-[#f3f4f8]">
              <span className="material-symbols-outlined">download</span>
            </button>
            <button className="rounded-lg p-2 text-[#6b7280] transition hover:bg-[#f3f4f8]">
              <span className="material-symbols-outlined">print</span>
            </button>
          </div>
        </div>
      </div>

      <div className="p-4">
        <ZoneChips
          zones={zones}
          selectedZone={selectedZone}
          setSelectedZone={setSelectedZone}
        />
      </div>
    </div>
  );
}

function SlotsTable({ slots, loading, error }) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-[#d7d9e4] bg-white p-10 text-center text-sm text-[#6b7280] shadow-sm">
        Loading parking slots...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-10 text-center text-sm text-red-600 shadow-sm">
        {error}
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="rounded-2xl border border-[#d7d9e4] bg-white p-10 text-center text-sm text-[#6b7280] shadow-sm">
        No parking slots found.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[#d7d9e4] bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead className="bg-[#f7f8fc]">
            <tr>
              {[
                "Slot ID",
                "Zone",
                "Vehicle Type",
                "Floor",
                "Distance to Gate",
                "Status",
                "Actions",
              ].map((heading) => (
                <th
                  key={heading}
                  className={`px-6 py-4 text-left font-['Geist'] text-[11px] font-semibold uppercase tracking-wider text-[#6b7280] ${
                    heading === "Actions" ? "text-right" : ""
                  }`}
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-[#eceef5]">
            {slots.map((slot) => (
              <tr key={slot.id} className="transition hover:bg-[#fafbff]">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef3ff]">
                      <span className="material-symbols-outlined text-[#2563eb]">
                        local_parking
                      </span>
                    </div>
                    <div>
                      <p className="font-['Geist'] text-sm font-semibold text-[#191b23]">
                        {slot.slotName}
                      </p>
                      <p className="text-xs text-[#6b7280]">Slot identifier</p>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <p className="max-w-[240px] text-sm font-medium text-[#191b23]">
                    {slot.zoneName || "N/A"}
                  </p>
                </td>

                <td className="px-6 py-4 text-sm text-[#374151]">
                  {slot.vehicleTypeName || "N/A"}
                </td>

                <td className="px-6 py-4 text-sm text-[#374151]">
                  {getFloorLabel(slot.zoneName)}
                </td>

                <td className="px-6 py-4 text-sm text-[#374151]">
                  {slot.distanceToGate ?? 0} m
                </td>

                <td className="px-6 py-4">
                  <StatusBadge status={slot.status} />
                </td>

                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-1">
                    <button className="rounded-lg p-2 text-[#6b7280] transition hover:bg-[#f3f4f8]">
                      <span className="material-symbols-outlined">
                        visibility
                      </span>
                    </button>
                    <button className="rounded-lg p-2 text-[#6b7280] transition hover:bg-[#f3f4f8]">
                      <span className="material-symbols-outlined">edit</span>
                    </button>
                    <button className="rounded-lg p-2 text-red-500 transition hover:bg-red-50">
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AddSlotModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#eceef5] px-6 py-5">
          <div>
            <h3 className="font-['Geist'] text-xl font-semibold text-[#191b23]">
              Add New Parking Slot
            </h3>
            <p className="mt-1 text-sm text-[#6b7280]">
              This form is currently UI-only for demo.
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-[#6b7280] hover:bg-[#f3f4f8]"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form
          className="space-y-4 p-6"
          onSubmit={(e) => {
            e.preventDefault();
            onClose();
          }}
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <input
              className="h-11 rounded-xl border border-[#d7d9e4] px-4 text-sm outline-none focus:border-[#2563eb]"
              placeholder="Slot name"
              required
            />
            <select className="h-11 rounded-xl border border-[#d7d9e4] px-4 text-sm outline-none focus:border-[#2563eb]">
              <option>AVAILABLE</option>
              <option>OCCUPIED</option>
              <option>RESERVED</option>
              <option>MAINTENANCE</option>
            </select>
          </div>

          <textarea
            rows="4"
            className="w-full rounded-xl border border-[#d7d9e4] px-4 py-3 text-sm outline-none focus:border-[#2563eb]"
            placeholder="Description"
          />

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[#d7d9e4] px-5 py-2.5 text-sm font-medium text-[#374151] transition hover:bg-[#f8f9fc]"
            >
              Cancel
            </button>
            <button className="rounded-xl bg-[#2563eb] px-5 py-2.5 text-sm font-medium text-white transition hover:brightness-110">
              Create Slot
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ParkingSlotsPage() {
  const [parkingSlots, setParkingSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [keyword, setKeyword] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedZone, setSelectedZone] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchParkingSlots = async () => {
      try {
        setLoading(true);
        setError("");

        const result = await apiRequest("/api/parking-slots");
        setParkingSlots(result.data || []);
      } catch (error) {
        setError(error.message || "Cannot load parking slots");
      } finally {
        setLoading(false);
      }
    };

    fetchParkingSlots();
  }, []);

  const zones = useMemo(() => {
    const zoneNames = parkingSlots.map((slot) => slot.zoneName).filter(Boolean);
    return [...new Set(zoneNames)];
  }, [parkingSlots]);

  const filteredSlots = useMemo(() => {
    return parkingSlots.filter((slot) => {
      const matchesKeyword =
        `${slot.slotName || ""} ${slot.zoneName || ""} ${slot.vehicleTypeName || ""}`
          .toLowerCase()
          .includes(keyword.toLowerCase());

      const matchesStatus =
        selectedStatus === "ALL" || slot.status === selectedStatus;

      const matchesZone =
        selectedZone === "ALL" || slot.zoneName === selectedZone;

      return matchesKeyword && matchesStatus && matchesZone;
    });
  }, [parkingSlots, keyword, selectedStatus, selectedZone]);

  const summary = useMemo(() => {
    const countByStatus = (status) =>
      parkingSlots.filter((slot) => slot.status === status).length;

    return {
      total: parkingSlots.length,
      available: countByStatus("AVAILABLE"),
      occupied: countByStatus("OCCUPIED"),
      reserved: countByStatus("RESERVED"),
      maintenance: countByStatus("MAINTENANCE"),
    };
  }, [parkingSlots]);

  const resetFilters = () => {
    setKeyword("");
    setSelectedStatus("ALL");
    setSelectedZone("ALL");
  };

  const headerAction = (
    <button
      onClick={() => setIsModalOpen(true)}
      className="flex items-center gap-2 rounded-xl bg-[#2563eb] px-4 py-2.5 text-sm font-medium text-white shadow-md shadow-blue-900/20 transition hover:brightness-110 active:scale-95"
    >
      <span className="material-symbols-outlined text-lg">add</span>
      Add Slot
    </button>
  );

  return (
    <AdminLayout
      activeLabel="Parking Slots"
      headerAction={headerAction}
      searchPlaceholder="Search slot name, zone, vehicle type..."
    >
      <div className="mb-8">
        <h2 className="font-['Geist'] text-3xl font-semibold text-[#191b23]">
          Parking Slot Management
        </h2>
        <p className="mt-2 max-w-3xl text-sm text-[#6b7280]">
          Manage parking slots more easily with a clear table view, fast
          filters, and real-time status tracking by zone and vehicle type.
        </p>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        <SummaryCard
          title="Total Slots"
          value={summary.total}
          icon="grid_view"
          iconWrapClass="bg-slate-100"
          iconClass="text-slate-700"
        />
        <SummaryCard
          title="Available"
          value={summary.available}
          icon="check_circle"
          iconWrapClass="bg-green-50"
          iconClass="text-green-600"
        />
        <SummaryCard
          title="Occupied"
          value={summary.occupied}
          icon="directions_car"
          iconWrapClass="bg-blue-50"
          iconClass="text-blue-600"
        />
        <SummaryCard
          title="Reserved"
          value={summary.reserved}
          icon="event_available"
          iconWrapClass="bg-amber-50"
          iconClass="text-amber-600"
        />
        <SummaryCard
          title="Maintenance"
          value={summary.maintenance}
          icon="build"
          iconWrapClass="bg-red-50"
          iconClass="text-red-600"
        />
      </div>

      <div className="mb-6">
        <FilterToolbar
          keyword={keyword}
          setKeyword={setKeyword}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          selectedZone={selectedZone}
          setSelectedZone={setSelectedZone}
          zones={zones}
          filteredCount={filteredSlots.length}
          onResetFilters={resetFilters}
        />
      </div>

      <SlotsTable slots={filteredSlots} loading={loading} error={error} />

      {isModalOpen && <AddSlotModal onClose={() => setIsModalOpen(false)} />}
    </AdminLayout>
  );
}
