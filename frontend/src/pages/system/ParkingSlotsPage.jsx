import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { apiRequest } from "../../services/api";

const SLOT_STATUSES = ["AVAILABLE", "OCCUPIED", "RESERVED", "MAINTENANCE"];

const statusConfig = {
  AVAILABLE: {
    label: "Available",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
    icon: "check_circle",
  },
  OCCUPIED: {
    label: "Occupied",
    className: "border-blue-200 bg-blue-50 text-blue-700",
    dot: "bg-blue-500",
    icon: "directions_car",
  },
  RESERVED: {
    label: "Reserved",
    className: "border-amber-200 bg-amber-50 text-amber-700",
    dot: "bg-amber-500",
    icon: "event_available",
  },
  MAINTENANCE: {
    label: "Maintenance",
    className: "border-rose-200 bg-rose-50 text-rose-700",
    dot: "bg-rose-500",
    icon: "build",
  },
};

function getSlotNumber(slot) {
  return slot?.slotCode || slot?.slotNumber || slot?.slotName || slot?.slot_name || "";
}

function getZoneId(slot, zones = []) {
  if (slot?.zoneId || slot?.zone_id) {
    return slot.zoneId || slot.zone_id;
  }
  if (slot?.zone && zones.length > 0) {
    const found = zones.find(z => (z.zoneName || z.zone_name) === slot.zone);
    if (found) return found.id;
  }
  return "";
}

function getDistance(slot) {
  return slot?.distanceToGate ?? slot?.distance_to_gate ?? 0;
}

function getStatusMeta(status) {
  return (
    statusConfig[status] || {
      label: status || "Unknown",
      className: "border-slate-200 bg-slate-50 text-slate-700",
      dot: "bg-slate-400",
      icon: "help",
    }
  );
}

function getStoredUser() {
  try {
    const rawUser = localStorage.getItem("user");
    return rawUser ? JSON.parse(rawUser) : null;
  } catch {
    return null;
  }
}

function normalizeRole(role) {
  return String(role || "")
    .trim()
    .toUpperCase();
}

function getUserRole() {
  const user = getStoredUser();
  return normalizeRole(user?.role || localStorage.getItem("role"));
}

function StatusBadge({ status }) {
  const meta = getStatusMeta(status);

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold ${meta.className}`}
    >
      <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
}

function StatCard({ title, value, icon, subtitle }) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-white/70 bg-white/85 p-5 shadow-sm ring-1 ring-slate-100 backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/70">
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-blue-100/60 blur-2xl transition group-hover:bg-blue-200/70" />

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
            {title}
          </p>
          <h3 className="mt-3 text-3xl font-black text-slate-950">{value}</h3>
          <p className="mt-1 text-xs font-medium text-slate-500">{subtitle}</p>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-300">
          <span className="material-symbols-outlined">{icon}</span>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ canManage, onCreate }) {
  return (
    <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white/80 p-12 text-center shadow-sm">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-50 text-blue-600">
        <span className="material-symbols-outlined text-3xl">
          local_parking
        </span>
      </div>

      <h3 className="mt-5 text-xl font-black text-slate-950">
        No parking slots found
      </h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
        Try changing your filters or create a new parking slot for this parking
        building.
      </p>

      {canManage && (
        <button
          onClick={onCreate}
          className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition hover:-translate-y-0.5 hover:bg-blue-700"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          Add First Slot
        </button>
      )}
    </div>
  );
}

function SlotFormModal({ mode, slot, zones, saving, onClose, onSubmit }) {
  const [form, setForm] = useState({
    slotCode: slot?.slotCode || "",
    zoneId: getZoneId(slot, zones),
    status: slot?.status || "AVAILABLE",
    distanceToGate: getDistance(slot),
  });

  const isEdit = mode === "edit";

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    onSubmit({
      slotCode: form.slotCode.trim(),
      zoneId: form.zoneId,
      status: form.status,
      distanceToGate: Number(form.distanceToGate || 0),
    });
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-md">
      <div className="w-full max-w-xl overflow-hidden rounded-[2rem] bg-white shadow-2xl shadow-slate-950/20">
        <div className="relative overflow-hidden border-b border-slate-100 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 px-6 py-6 text-white">
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-blue-500/30 blur-3xl" />

          <div className="relative flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-200">
                Parking Slot
              </p>
              <h3 className="mt-2 text-2xl font-black">
                {isEdit ? "Edit Slot" : "Create New Slot"}
              </h3>
              <p className="mt-1 text-sm text-slate-300">
                Connect slot data with zone, status and gate distance.
              </p>
            </div>

            <button
              onClick={onClose}
              type="button"
              className="rounded-2xl p-2 text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        <form className="space-y-5 p-6" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">
              Slot Code
            </label>
            <input
              value={form.slotCode}
              onChange={(event) =>
                updateField("slotCode", event.target.value)
              }
              placeholder="Example: A-D1-001"
              className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">
              Parking Zone
            </label>
            <select
              value={form.zoneId}
              onChange={(event) => updateField("zoneId", event.target.value)}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
              required
            >
              <option value="">Select zone</option>
              {zones.map((zone) => (
                <option key={zone.id} value={zone.id}>
                  {zone.zoneName || zone.zone_name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Status
              </label>
              <select
                value={form.status}
                onChange={(event) => updateField("status", event.target.value)}
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
              >
                {SLOT_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Distance To Gate
              </label>
              <div className="flex items-center gap-2">
                <input
                  value={form.distanceToGate}
                  onChange={(event) =>
                    updateField("distanceToGate", event.target.value)
                  }
                  type="number"
                  min="0"
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
                <span className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-black text-slate-500">
                  m
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving && (
                <span className="material-symbols-outlined animate-spin text-lg">
                  progress_activity
                </span>
              )}
              {isEdit ? "Save Changes" : "Create Slot"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ParkingSlotsPage() {
  const [parkingSlots, setParkingSlots] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const [keyword, setKeyword] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedZone, setSelectedZone] = useState("ALL");

  const [modalMode, setModalMode] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const role = getUserRole();
  const canManage = ["ADMIN", "MANAGER"].includes(role);

  useEffect(() => {
    let ignore = false;

    async function loadInitialData() {
      try {
        const [slotResult, zoneResult] = await Promise.all([
          apiRequest("/api/parking-slots"),
          apiRequest("/api/zones"),
        ]);

        if (ignore) return;

        setParkingSlots(slotResult.data || []);
        setZones(zoneResult.data || []);
        setError("");
      } catch (err) {
        if (ignore) return;

        setError(err.message || "Cannot load parking slot data");
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadInitialData();

    return () => {
      ignore = true;
    };
  }, []);

  const fetchData = async () => {
    try {
      setError("");

      const [slotResult, zoneResult] = await Promise.all([
        apiRequest("/api/parking-slots"),
        apiRequest("/api/zones"),
      ]);

      setParkingSlots(slotResult.data || []);
      setZones(zoneResult.data || []);
    } catch (err) {
      setError(err.message || "Cannot refresh parking slot data");
    }
  };

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

  const filteredSlots = useMemo(() => {
    return parkingSlots.filter((slot) => {
      const slotNumber = getSlotNumber(slot);
      const zoneName = slot.zone || "";
      const vehicleTypeName = slot.vehicleType || "";

      const matchesKeyword = `${slotNumber} ${zoneName} ${vehicleTypeName}`
        .toLowerCase()
        .includes(keyword.toLowerCase());

      const matchesStatus =
        selectedStatus === "ALL" || slot.status === selectedStatus;

      const matchesZone =
        selectedZone === "ALL" || getZoneId(slot, zones) === selectedZone;

      return matchesKeyword && matchesStatus && matchesZone;
    });
  }, [parkingSlots, keyword, selectedStatus, selectedZone, zones]);

  const showToast = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2500);
  };

  const openCreateModal = () => {
    if (!canManage) return;

    setSelectedSlot(null);
    setModalMode("create");
  };

  const openEditModal = (slot) => {
    if (!canManage) return;

    setSelectedSlot(slot);
    setModalMode("edit");
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedSlot(null);
  };

  const handleSubmitSlot = async (payload) => {
    if (!canManage) return;

    try {
      setSaving(true);

      if (modalMode === "create") {
        await apiRequest("/api/parking-slots", {
          method: "POST",
          body: JSON.stringify(payload),
        });

        showToast("Create parking slot successfully");
      }

      if (modalMode === "edit") {
        await apiRequest(`/api/parking-slots/${selectedSlot.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });

        showToast("Update parking slot successfully");
      }

      closeModal();
      await fetchData();
    } catch (err) {
      alert(err.message || "Save parking slot failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSlot = async (slot) => {
    if (!canManage) return;

    const slotNumber = getSlotNumber(slot);

    const confirmed = window.confirm(
      `Are you sure you want to delete slot "${slotNumber}"?`,
    );

    if (!confirmed) return;

    try {
      setDeletingId(slot.id);

      await apiRequest(`/api/parking-slots/${slot.id}`, {
        method: "DELETE",
      });

      showToast("Delete parking slot successfully");
      await fetchData();
    } catch (err) {
      alert(err.message || "Delete parking slot failed");
    } finally {
      setDeletingId(null);
    }
  };

  const resetFilters = () => {
    setKeyword("");
    setSelectedStatus("ALL");
    setSelectedZone("ALL");
  };

  const headerAction = canManage ? (
    <button
      onClick={openCreateModal}
      className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-blue-600/25 transition hover:-translate-y-0.5 hover:bg-blue-700 active:scale-95"
    >
      <span className="material-symbols-outlined text-lg">add</span>
      Add Slot
    </button>
  ) : null;

  return (
    <AdminLayout activeLabel="Parking Slots" headerAction={headerAction}>
      <div className="mb-8 overflow-hidden rounded-[2rem] border border-blue-100 bg-gradient-to-br from-white via-blue-50/80 to-sky-50 p-6 shadow-sm ring-1 ring-white">
        <div className="relative">
          <div className="absolute -right-10 -top-16 h-40 w-40 rounded-full bg-blue-200/60 blur-3xl" />
          <div className="absolute bottom-0 right-32 h-24 w-24 rounded-full bg-cyan-200/60 blur-2xl" />
          <div className="absolute -bottom-14 left-20 h-28 w-28 rounded-full bg-indigo-100/70 blur-3xl" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/80 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-blue-600 shadow-sm">
                <span className="material-symbols-outlined text-[16px]">
                  local_parking
                </span>
                Parking Operations
              </div>

              <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 md:text-4xl">
                Parking Slot Management
              </h2>

              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
                Manage parking slots with a modern CRUD dashboard. Create new
                slots, update zone/status, monitor availability, and keep the
                parking building organized.
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                  {summary.available} Available
                </span>
                <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                  {summary.occupied} Occupied
                </span>
                <span className="rounded-full border border-amber-100 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                  {summary.reserved} Reserved
                </span>
                <span className="rounded-full border border-rose-100 bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700">
                  {summary.maintenance} Maintenance
                </span>
              </div>
            </div>

            {canManage && (
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={openCreateModal}
                  className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-600/25 transition hover:-translate-y-0.5 hover:bg-blue-700 active:scale-95"
                >
                  <span className="material-symbols-outlined text-lg">add</span>
                  New Slot
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {toast && (
        <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700 shadow-sm">
          {toast}
        </div>
      )}

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard
          title="Total Slots"
          value={summary.total}
          icon="grid_view"
          subtitle="All managed slots"
        />
        <StatCard
          title="Available"
          value={summary.available}
          icon="check_circle"
          subtitle="Ready for parking"
        />
        <StatCard
          title="Occupied"
          value={summary.occupied}
          icon="directions_car"
          subtitle="Currently in use"
        />
        <StatCard
          title="Reserved"
          value={summary.reserved}
          icon="event_available"
          subtitle="Booked by users"
        />
        <StatCard
          title="Maintenance"
          value={summary.maintenance}
          icon="build"
          subtitle="Need attention"
        />
      </div>

      <div className="mb-6 rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-sm ring-1 ring-slate-100 backdrop-blur-xl">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_220px_260px_auto]">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              search
            </span>
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Search slot number, zone, vehicle type..."
              className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(event) => setSelectedStatus(event.target.value)}
            className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
          >
            <option value="ALL">All Status</option>
            {SLOT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          <select
            value={selectedZone}
            onChange={(event) => setSelectedZone(event.target.value)}
            className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
          >
            <option value="ALL">All Zones</option>
            {zones.map((zone) => (
              <option key={zone.id} value={zone.id}>
                {zone.zoneName || zone.zone_name}
              </option>
            ))}
          </select>

          <button
            onClick={resetFilters}
            className="h-12 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-600 transition hover:bg-slate-50"
          >
            Reset
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-medium text-slate-500">
            Showing{" "}
            <span className="font-black text-slate-950">
              {filteredSlots.length}
            </span>{" "}
            of{" "}
            <span className="font-black text-slate-950">
              {parkingSlots.length}
            </span>{" "}
            slots
          </p>

          <div className="flex flex-wrap gap-2">
            {SLOT_STATUSES.map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`rounded-full border px-3 py-1.5 text-xs font-black transition ${
                  selectedStatus === status
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-slate-200 bg-white text-slate-500 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                }`}
              >
                {getStatusMeta(status).label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="rounded-[2rem] border border-white/70 bg-white/85 p-12 text-center shadow-sm ring-1 ring-slate-100 backdrop-blur-xl">
          <span className="material-symbols-outlined animate-spin text-4xl text-blue-600">
            progress_activity
          </span>
          <p className="mt-4 text-sm font-bold text-slate-500">
            Loading parking slots...
          </p>
        </div>
      ) : error ? (
        <div className="rounded-[2rem] border border-rose-200 bg-rose-50 p-12 text-center text-sm font-bold text-rose-700">
          {error}
        </div>
      ) : filteredSlots.length === 0 ? (
        <EmptyState canManage={canManage} onCreate={openCreateModal} />
      ) : (
        <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/90 shadow-sm ring-1 ring-slate-100 backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80">
                  <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                    Slot
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                    Zone
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                    Vehicle Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                    Distance
                  </th>
                  {canManage && (
                    <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredSlots.map((slot) => {
                  const slotNumber = getSlotNumber(slot);
                  const zoneName = slot.zone || "N/A";
                  const distance = getDistance(slot);

                  return (
                    <tr
                      key={slot.id}
                      className="group transition hover:bg-blue-50/40"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
                            <span className="material-symbols-outlined">
                              local_parking
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-950">
                              {slotNumber}
                            </p>
                            <p className="mt-0.5 max-w-[160px] truncate text-xs font-medium text-slate-400">
                              {slot.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <p className="max-w-[240px] text-sm font-bold text-slate-800">
                          {zoneName}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                          {slot.vehicleType || "N/A"}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <StatusBadge status={slot.status} />
                      </td>

                      <td className="px-6 py-4">
                        <p className="text-sm font-black text-slate-800">
                          {distance} m
                        </p>
                      </td>

                      {canManage && (
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditModal(slot)}
                              className="rounded-2xl p-2.5 text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
                              title="Edit"
                            >
                              <span className="material-symbols-outlined text-[20px]">
                                edit
                              </span>
                            </button>

                            <button
                              onClick={() => handleDeleteSlot(slot)}
                              disabled={deletingId === slot.id}
                              className="rounded-2xl p-2.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
                              title="Delete"
                            >
                              <span
                                className={`material-symbols-outlined text-[20px] ${
                                  deletingId === slot.id ? "animate-spin" : ""
                                }`}
                              >
                                {deletingId === slot.id
                                  ? "progress_activity"
                                  : "delete"}
                              </span>
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {canManage && (modalMode === "create" || modalMode === "edit") && (
        <SlotFormModal
          mode={modalMode}
          slot={selectedSlot}
          zones={zones}
          saving={saving}
          onClose={closeModal}
          onSubmit={handleSubmitSlot}
        />
      )}
    </AdminLayout>
  );
}
