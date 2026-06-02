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
  selectedType,
  setSelectedType,
  selectedZone,
  setSelectedZone,
  zones,
  vehicleTypes,
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

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="h-11 rounded-xl border border-[#d7d9e4] bg-[#f8f9fc] px-4 text-sm outline-none transition focus:border-[#2563eb]"
          >
            <option value="ALL">All Types</option>
            {vehicleTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
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

function SlotsTable({ slots, loading, error, onView, onEdit }) {
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
                "Slot",
                "Zone",
                "Vehicle Type",
                "Status",
                "Vehicle",
                "Distance",
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
                  <StatusBadge status={slot.status} />
                </td>

                <td className="px-6 py-4 text-sm text-[#374151]">
                  {slot.currentVehicle || "-"}
                </td>

                <td className="px-6 py-4 text-sm text-[#374151]">
                  {slot.distanceToGate ?? 0} m
                </td>

                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onView(slot)}
                      className="rounded-lg p-2 text-[#6b7280] transition hover:bg-[#f3f4f8] hover:text-[#2563eb]"
                      title="View details"
                    >
                      <span className="material-symbols-outlined">
                        visibility
                      </span>
                    </button>
                    <button
                      onClick={() => onEdit(slot)}
                      className="rounded-lg p-2 text-[#6b7280] transition hover:bg-[#f3f4f8] hover:text-[#2563eb]"
                      title="Edit slot"
                    >
                      <span className="material-symbols-outlined">edit</span>
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

function FieldLabel({ children }) {
  return (
    <label className="font-['Geist'] text-[13px] font-semibold text-[#434655]">
      {children}
    </label>
  );
}

function SlotDetailsModal({ slot, onClose }) {
  const detailRows = [
    ["Slot Name", slot.slotName],
    ["Zone", slot.zoneName || "N/A"],
    ["Vehicle Type", slot.vehicleTypeName || "N/A"],
    ["Status", getStatusMeta(slot.status).label],
    ["Distance to Gate", `${slot.distanceToGate ?? 0} m`],
    ["Current Vehicle", slot.currentVehicle || "-"],
    ["Entry Time", slot.entryTime || "-"],
    ["Session Status", slot.sessionStatus || "-"],
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#eceef5] px-6 py-5">
          <h3 className="font-['Geist'] text-xl font-semibold text-[#191b23]">
            Slot Details
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-[#6b7280] hover:bg-[#f3f4f8]"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="space-y-3 p-6">
          {detailRows.map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4">
              <p className="font-['Geist'] text-[13px] font-semibold text-[#737686]">
                {label}
              </p>
              <p className="text-right font-['Inter'] text-sm font-medium text-[#191b23]">
                {value}
              </p>
            </div>
          ))}
        </div>

        <div className="flex justify-end border-t border-[#eceef5] px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-xl bg-[#2563eb] px-5 py-2.5 text-sm font-medium text-white transition hover:brightness-110"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function SlotFormModal({ mode, slot, zones, vehicleTypes, onClose, onSubmit }) {
  const [form, setForm] = useState(() => ({
    slotName: slot?.slotName || "",
    zoneName: slot?.zoneName || "",
    vehicleTypeName: slot?.vehicleTypeName || "",
    status: slot?.status || "AVAILABLE",
    distanceToGate: slot?.distanceToGate ?? "",
  }));

  const title = mode === "edit" ? "Edit Slot" : "Add New Slot";
  const submitLabel = mode === "edit" ? "Save" : "Create";

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#eceef5] px-6 py-5">
          <h3 className="font-['Geist'] text-xl font-semibold text-[#191b23]">
            {title}
          </h3>
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
            onSubmit({
              ...slot,
              ...form,
              distanceToGate: Number(form.distanceToGate || 0),
            });
          }}
        >
          <div className="space-y-2">
            <FieldLabel>Slot Name</FieldLabel>
            <input
              value={form.slotName}
              onChange={(e) => updateField("slotName", e.target.value)}
              className="h-11 w-full rounded-xl border border-[#d7d9e4] px-4 text-sm outline-none focus:border-[#2563eb]"
              placeholder="Slot name"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <FieldLabel>Zone</FieldLabel>
              {zones.length > 0 ? (
                <select
                  value={form.zoneName}
                  onChange={(e) => updateField("zoneName", e.target.value)}
                  className="h-11 w-full rounded-xl border border-[#d7d9e4] px-4 text-sm outline-none focus:border-[#2563eb]"
                  required
                >
                  <option value="">Select zone</option>
                  {zones.map((zone) => (
                    <option key={zone} value={zone}>
                      {zone}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  value={form.zoneName}
                  onChange={(e) => updateField("zoneName", e.target.value)}
                  className="h-11 w-full rounded-xl border border-[#d7d9e4] px-4 text-sm outline-none focus:border-[#2563eb]"
                  placeholder="Zone"
                  required
                />
              )}
            </div>

            <div className="space-y-2">
              <FieldLabel>Type</FieldLabel>
              {vehicleTypes.length > 0 ? (
                <select
                  value={form.vehicleTypeName}
                  onChange={(e) =>
                    updateField("vehicleTypeName", e.target.value)
                  }
                  className="h-11 w-full rounded-xl border border-[#d7d9e4] px-4 text-sm outline-none focus:border-[#2563eb]"
                  required
                >
                  <option value="">Select type</option>
                  {vehicleTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  value={form.vehicleTypeName}
                  onChange={(e) =>
                    updateField("vehicleTypeName", e.target.value)
                  }
                  className="h-11 w-full rounded-xl border border-[#d7d9e4] px-4 text-sm outline-none focus:border-[#2563eb]"
                  placeholder="Vehicle type"
                  required
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <FieldLabel>Status</FieldLabel>
              <select
                value={form.status}
                onChange={(e) => updateField("status", e.target.value)}
                className="h-11 w-full rounded-xl border border-[#d7d9e4] px-4 text-sm outline-none focus:border-[#2563eb]"
              >
                <option value="AVAILABLE">AVAILABLE</option>
                <option value="OCCUPIED">OCCUPIED</option>
                <option value="RESERVED">RESERVED</option>
                <option value="MAINTENANCE">MAINTENANCE</option>
              </select>
            </div>

            <div className="space-y-2">
              <FieldLabel>Distance to Gate</FieldLabel>
              <div className="flex items-center gap-2">
                <input
                  value={form.distanceToGate}
                  onChange={(e) =>
                    updateField("distanceToGate", e.target.value)
                  }
                  className="h-11 w-full rounded-xl border border-[#d7d9e4] px-4 text-sm outline-none focus:border-[#2563eb]"
                  min="0"
                  placeholder="25"
                  type="number"
                />
                <span className="font-['Geist'] text-sm font-semibold text-[#737686]">
                  m
                </span>
              </div>
            </div>
          </div>

          {mode === "edit" && slot?.status === "OCCUPIED" && (
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-700">
              This slot has an active vehicle session. Status changes only
              update the current view until the API supports write operations.
            </div>
          )}

          {mode === "create" && zones.length === 0 && (
            <div className="rounded-xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-700">
              Load parking slot data first so zone and type options are
              available.
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[#d7d9e4] px-5 py-2.5 text-sm font-medium text-[#374151] transition hover:bg-[#f8f9fc]"
            >
              Cancel
            </button>
            <button className="rounded-xl bg-[#2563eb] px-5 py-2.5 text-sm font-medium text-white transition hover:brightness-110">
              {submitLabel}
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
  const [selectedType, setSelectedType] = useState("ALL");
  const [selectedZone, setSelectedZone] = useState("ALL");
  const [modalMode, setModalMode] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);

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

  const vehicleTypes = useMemo(() => {
    const typeNames = parkingSlots
      .map((slot) => slot.vehicleTypeName)
      .filter(Boolean);
    return [...new Set(typeNames)];
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

      const matchesType =
        selectedType === "ALL" || slot.vehicleTypeName === selectedType;

      return matchesKeyword && matchesStatus && matchesZone && matchesType;
    });
  }, [parkingSlots, keyword, selectedStatus, selectedZone, selectedType]);

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
    setSelectedType("ALL");
    setSelectedZone("ALL");
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedSlot(null);
  };

  const openViewModal = (slot) => {
    setSelectedSlot(slot);
    setModalMode("view");
  };

  const openEditModal = (slot) => {
    setSelectedSlot(slot);
    setModalMode("edit");
  };

  const openCreateModal = () => {
    setSelectedSlot(null);
    setModalMode("create");
  };

  const handleCreateSlot = (slotData) => {
    const newSlot = {
      ...slotData,
      id: `local-${Date.now()}`,
      currentVehicle: slotData.status === "OCCUPIED" ? "51A-12345" : "-",
      entryTime: slotData.status === "OCCUPIED" ? "08:30 AM" : "-",
      sessionStatus: slotData.status === "OCCUPIED" ? "ACTIVE" : "-",
    };

    setParkingSlots((current) => [newSlot, ...current]);
    closeModal();
  };

  const handleUpdateSlot = (slotData) => {
    setParkingSlots((current) =>
      current.map((slot) =>
        slot.id === slotData.id ? { ...slot, ...slotData } : slot,
      ),
    );
    closeModal();
  };

  const headerAction = (
    <button
      onClick={openCreateModal}
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
          selectedType={selectedType}
          setSelectedType={setSelectedType}
          selectedZone={selectedZone}
          setSelectedZone={setSelectedZone}
          zones={zones}
          vehicleTypes={vehicleTypes}
          filteredCount={filteredSlots.length}
          onResetFilters={resetFilters}
        />
      </div>

      <SlotsTable
        slots={filteredSlots}
        loading={loading}
        error={error}
        onView={openViewModal}
        onEdit={openEditModal}
      />

      {modalMode === "view" && selectedSlot && (
        <SlotDetailsModal slot={selectedSlot} onClose={closeModal} />
      )}

      {modalMode === "edit" && selectedSlot && (
        <SlotFormModal
          mode="edit"
          slot={selectedSlot}
          zones={zones}
          vehicleTypes={vehicleTypes}
          onClose={closeModal}
          onSubmit={handleUpdateSlot}
        />
      )}

      {modalMode === "create" && (
        <SlotFormModal
          mode="create"
          zones={zones}
          vehicleTypes={vehicleTypes}
          onClose={closeModal}
          onSubmit={handleCreateSlot}
        />
      )}
    </AdminLayout>
  );
}
