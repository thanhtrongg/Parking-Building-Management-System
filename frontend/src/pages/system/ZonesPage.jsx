import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { apiRequest } from "../../services/api";
import CustomSelect from "../../components/CustomSelect";

// Theme map for vehicle types to display corresponding icons/colors on Cards
const vehicleThemes = {
  "CAR": {
    gradient: "from-sky-500 via-blue-600 to-indigo-700",
    soft: "bg-sky-50 text-sky-700 border-sky-100",
    icon: "directions_car",
  },
  "MOTORBIKE": {
    gradient: "from-orange-500 via-amber-500 to-yellow-400",
    soft: "bg-orange-50 text-orange-700 border-orange-100",
    icon: "two_wheeler",
  },
  "BICYCLE": {
    gradient: "from-emerald-500 via-green-500 to-lime-400",
    soft: "bg-emerald-50 text-emerald-700 border-emerald-100",
    icon: "directions_bike",
  },
  "ELECTRIC_VEHICLE": {
    gradient: "from-cyan-500 via-blue-500 to-violet-600",
    soft: "bg-cyan-50 text-cyan-700 border-cyan-100",
    icon: "ev_station",
  },
  "LIGHT_TRUCK": {
    gradient: "from-slate-700 via-zinc-700 to-gray-500",
    soft: "bg-slate-50 text-slate-700 border-slate-200",
    icon: "local_shipping",
  },
};

const defaultTheme = {
  gradient: "from-slate-800 via-blue-800 to-cyan-600",
  soft: "bg-slate-50 text-slate-700 border-slate-200",
  icon: "grid_view",
};

const getVehicleTheme = (typeName = "") => {
  const norm = String(typeName).trim().toUpperCase().replace(/\s+/g, "_");
  return vehicleThemes[norm] || defaultTheme;
};

function EmptyState({ onAdd }) {
  return (
    <div className="rounded-[28px] border border-dashed border-slate-300 bg-white/80 px-6 py-14 text-center shadow-sm backdrop-blur">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
        <span className="material-symbols-outlined text-4xl">garage</span>
      </div>
      <h3 className="mt-5 font-['Geist'] text-xl font-semibold text-slate-950">
        No parking zones found
      </h3>
      <p className="mx-auto mt-2 max-w-md font-['Inter'] text-sm leading-6 text-slate-500">
        Create the first parking zone to manage layouts, capacities, and assign
        vehicle types.
      </p>
      <button
        onClick={onAdd}
        className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 font-['Inter'] text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:-translate-y-0.5 hover:bg-blue-700 active:translate-y-0"
      >
        <span className="material-symbols-outlined text-xl">add</span>
        Add Parking Zone
      </button>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="h-64 animate-pulse rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="h-24 rounded-3xl bg-slate-100" />
          <div className="mt-5 h-5 w-1/2 rounded-full bg-slate-100" />
          <div className="mt-3 h-4 w-4/5 rounded-full bg-slate-100" />
          <div className="mt-6 h-10 rounded-2xl bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

function PageHero({ total, filteredTotal, onAdd }) {
  return (
    <div className="relative mb-7 overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-white via-blue-50/80 to-sky-50 p-6 shadow-sm ring-1 ring-white md:p-8">
      <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-blue-200/60 blur-3xl" />
      <div className="absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-cyan-200/50 blur-3xl" />
      <div className="absolute -bottom-16 left-10 h-40 w-40 rounded-full bg-indigo-100/70 blur-3xl" />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/80 px-3 py-1.5 font-['Inter'] text-xs font-black uppercase tracking-[0.18em] text-blue-600 shadow-sm">
            <span className="material-symbols-outlined text-base">garage</span>
            Zone Configuration
          </div>

          <h2 className="mt-5 max-w-3xl font-['Geist'] text-3xl font-black tracking-tight text-slate-950 md:text-4xl">
            Parking Zone Management
          </h2>

          <p className="mt-3 max-w-2xl font-['Inter'] text-sm leading-6 text-slate-500">
            Organize parking areas by zone, capacity, and vehicle type. Create,
            update, and manage each parking zone with a clean CRUD dashboard.
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            <span className="rounded-full border border-blue-100 bg-white/80 px-3 py-1.5 text-xs font-bold text-blue-700 shadow-sm">
              {total} Total Zones
            </span>
            <span className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
              {filteredTotal} Showing
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="grid grid-cols-2 gap-3"></div>

          <button
            onClick={onAdd}
            className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 font-['Inter'] text-sm font-black text-white shadow-lg shadow-blue-600/25 transition hover:-translate-y-0.5 hover:bg-blue-700 active:translate-y-0"
          >
            <span className="material-symbols-outlined text-xl">add</span>
            Add Zone
          </button>
        </div>
      </div>
    </div>
  );
}

function FilterBar({ keyword, onKeywordChange, sortBy, onSortChange, total }) {
  return (
    <div className="relative z-20 mb-6 rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex-1 lg:max-w-xl">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            search
          </span>

          <input
            value={keyword}
            onChange={(event) => onKeywordChange(event.target.value)}
            placeholder="Search by zone name or vehicle type..."
            className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 font-['Inter'] text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/5 dark:text-[#fbf4e7] dark:focus:bg-[#070705] dark:focus:border-blue-500"
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <CustomSelect
            options={[
              { value: "name-asc", label: "Zone Name A-Z" },
              { value: "name-desc", label: "Zone Name Z-A" },
              { value: "capacity-desc", label: "Capacity High to Low" },
              { value: "capacity-asc", label: "Capacity Low to High" }
            ]}
            value={sortBy}
            onChange={onSortChange}
            className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 font-['Inter'] text-sm font-bold text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/5 dark:text-[#fbf4e7] dark:focus:bg-[#070705] min-w-[210px]"
            popupClassName="w-56 mt-1.5"
          />

          <div className="inline-flex h-12 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 px-4 font-['Inter'] text-sm text-blue-700">
            <span className="font-black">{total}</span>
            <span className="ml-1 font-semibold">results</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ZoneCard({ zone, onEdit, onDelete }) {
  const theme = getVehicleTheme(zone.vehicleTypeName);

  return (
    <article className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/70">
      <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-blue-100/60 blur-2xl transition group-hover:bg-blue-200/70" />

      <div className="relative flex items-center gap-4">
        <div
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br ${theme.gradient} text-white shadow-md`}
        >
          <span className="material-symbols-outlined text-2xl">
            {theme.icon}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="truncate font-['Geist'] text-lg font-black tracking-tight text-slate-950">
            {zone.zoneName}
          </h3>

          <span
            className={`mt-1 inline-flex rounded-full border px-2.5 py-1 text-[11px] font-black ${theme.soft}`}
          >
            {zone.vehicleTypeName || "Unassigned"}
          </span>
        </div>
      </div>

      <div className="relative mt-5 grid grid-cols-2 gap-3 rounded-3xl bg-slate-50 p-3 ring-1 ring-slate-100">
        <div>
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
            Total Capacity
          </p>
          <p className="mt-1 font-['Geist'] text-base font-black text-slate-900">
            {zone.totalCapacity} slots
          </p>
        </div>

        <div>
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
            Zone ID
          </p>
          <p className="mt-1 truncate text-xs font-semibold text-slate-500">
            #{zone.id?.slice(-6) || zone.id}
          </p>
        </div>
      </div>

      <div className="relative mt-5 flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
        <button
          onClick={() => onEdit(zone)}
          className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 font-['Inter'] text-xs font-black text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
        >
          <span className="material-symbols-outlined text-base">edit</span>
          Edit
        </button>

        <button
          onClick={() => onDelete(zone)}
          className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-red-50 px-4 font-['Inter'] text-xs font-black text-red-600 ring-1 ring-red-100 transition hover:bg-red-100"
        >
          <span className="material-symbols-outlined text-base">delete</span>
          Delete
        </button>
      </div>
    </article>
  );
}

function ZoneFormModal({
  mode,
  initialData,
  vehicleTypes,
  submitting,
  onClose,
  onSubmit,
}) {
  const [form, setForm] = useState(() => ({
    zoneName: initialData?.zoneName || initialData?.zone_name || "",
    vehicleTypeId: initialData?.vehicleTypeId || initialData?.vehicle_type_id || "",
    totalCapacity: initialData?.totalCapacity || initialData?.total_capacity || 10,
  }));

  const isEdit = mode === "edit";

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({
      zoneName: form.zoneName.trim(),
      vehicleTypeId: form.vehicleTypeId,
      totalCapacity: Number(form.totalCapacity || 0),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl shadow-slate-950/30 dark:bg-[#11100c] dark:border dark:border-white/10">
        <div className="relative overflow-hidden border-b border-blue-100 bg-gradient-to-br from-white via-blue-50 to-sky-50 px-6 py-6 dark:from-[#070705] dark:via-[#11100c] dark:to-[#1a1914] dark:border-white/5">
          <div className="absolute -right-12 -top-16 h-40 w-40 rounded-full bg-blue-200/60 blur-2xl" />

          <div className="relative flex items-start justify-between gap-4">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/25">
                <span className="material-symbols-outlined text-3xl">
                  {isEdit ? "edit" : "add"}
                </span>
              </div>

              <h3 className="mt-4 font-['Geist'] text-2xl font-black text-slate-950 dark:text-[#fbf4e7]">
                {isEdit ? "Edit Parking Zone" : "Add Parking Zone"}
              </h3>

              <p className="mt-1 font-['Inter'] text-sm text-slate-500 dark:text-[#b9af9d]">
                {isEdit
                  ? "Update capacity and vehicle categories allowed in this zone."
                  : "Create a new physical zoning boundary for parking structures."}
              </p>
            </div>

            <button
              onClick={onClose}
              disabled={submitting}
              className="rounded-2xl bg-white p-2 text-slate-500 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white/5 dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/10"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          <div>
            <label className="mb-2 block font-['Inter'] text-sm font-semibold text-slate-700 dark:text-[#b9af9d]">
              Zone name <span className="text-red-500">*</span>
            </label>
            <input
              value={form.zoneName}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, zoneName: event.target.value }))
              }
              placeholder="Example: Zone A, Block B..."
              className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 font-['Inter'] text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/5 dark:text-[#fbf4e7] dark:focus:bg-[#070705] dark:focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-2 block font-['Inter'] text-sm font-semibold text-slate-700 dark:text-[#b9af9d]">
              Allowed Vehicle Type <span className="text-red-500">*</span>
            </label>
            <CustomSelect
              options={[
                { value: "", label: "-- Choose a Vehicle Category --" },
                ...vehicleTypes.map((type) => ({ value: type.id, label: type.typeName }))
              ]}
              value={form.vehicleTypeId}
              onChange={(val) => setForm((p) => ({ ...p, vehicleTypeId: val }))}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 font-['Inter'] text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/5 dark:text-[#fbf4e7] dark:focus:bg-[#070705]"
            />
          </div>

          <div>
            <label className="mb-2 block font-['Inter'] text-sm font-semibold text-slate-700">
              Total Capacity slots <span className="text-red-500">*</span>
            </label>
            <input
              required
              type="number"
              min="1"
              value={form.totalCapacity}
              onChange={(e) =>
                setForm((p) => ({ ...p, totalCapacity: e.target.value }))
              }
              placeholder="Example: 50"
              className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 font-['Inter'] text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-2xl border border-slate-200 px-5 py-3 font-['Inter'] text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 font-['Inter'] text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              )}
              {submitting
                ? "Saving..."
                : isEdit
                  ? "Update Zone"
                  : "Create Zone"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteModal({ zone, deleting, onClose, onConfirm }) {
  if (!zone) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl shadow-slate-950/30">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
          <span className="material-symbols-outlined text-3xl">delete</span>
        </div>
        <h3 className="mt-5 font-['Geist'] text-2xl font-bold text-slate-950">
          Delete parking zone?
        </h3>
        <p className="mt-2 font-['Inter'] text-sm leading-6 text-slate-500">
          Are you sure you want to delete zone{" "}
          <span className="font-semibold text-slate-900">
            "{zone.zoneName}"
          </span>
          ? This will fail if any slots within this zone are tied to active
          reservations or operations.
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={deleting}
            className="rounded-2xl border border-slate-200 px-5 py-3 font-['Inter'] text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="inline-flex items-center gap-2 rounded-2xl bg-red-600 px-5 py-3 font-['Inter'] text-sm font-semibold text-white shadow-lg shadow-red-600/25 transition hover:bg-red-700 disabled:opacity-50"
          >
            {deleting && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            )}
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Alert({ alert, onClose }) {
  if (!alert.message) return null;
  const isError = alert.type === "error";

  return (
    <div
      className={`mb-5 flex items-start justify-between gap-4 rounded-2xl border px-4 py-3 font-['Inter'] text-sm shadow-sm ${
        isError
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-emerald-200 bg-emerald-50 text-emerald-700"
      }`}
    >
      <div className="flex items-start gap-2">
        <span className="material-symbols-outlined text-xl">
          {isError ? "error" : "check_circle"}
        </span>
        <span className="leading-6">{alert.message}</span>
      </div>
      <button
        onClick={onClose}
        className="rounded-lg p-1 transition hover:bg-black/5"
      >
        <span className="material-symbols-outlined text-lg">close</span>
      </button>
    </div>
  );
}

export default function ZonesPage() {
  const [zones, setZones] = useState([]);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeBuildingId, setActiveBuildingId] = useState(() => localStorage.getItem("activeSystemBuildingId") || "");

  // Filters & Sorting state
  const [keyword, setKeyword] = useState("");
  const [sortBy, setSortBy] = useState("name-asc");

  // Modals control state
  const [modalMode, setModalMode] = useState(null); // 'create' | 'edit' | null
  const [selectedZone, setSelectedZone] = useState(null);
  const [deleteZone, setDeleteZone] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });

  useEffect(() => {
    const handleBuildingChange = (e) => {
      setActiveBuildingId(e.detail);
    };
    window.addEventListener("systemBuildingChanged", handleBuildingChange);
    return () => {
      window.removeEventListener("systemBuildingChanged", handleBuildingChange);
    };
  }, []);

  // Hàm gọi API nạp dữ liệu đồng thời từ server
  const fetchZonesData = async () => {
    const [zonesRes, vehicleTypesRes] = await Promise.all([
      apiRequest("/api/zones"),
      apiRequest("/api/vehicle-types"),
    ]);

    const zonesData = zonesRes.data || [];
    const vTypesData = vehicleTypesRes.data || [];

    const enrichedZones = zonesData.map((zone) => {
      const foundType = vTypesData.find(
        (type) => type.id === zone.vehicleTypeId,
      );

      return {
        ...zone,
        vehicleTypeName: foundType ? foundType.typeName : "Unknown",
      };
    });

    return {
      enrichedZones,
      vTypesData,
    };
  };

  const loadData = async () => {
    try {
      const { enrichedZones, vTypesData } = await fetchZonesData();

      setZones(enrichedZones);
      setVehicleTypes(vTypesData);
      setError("");
    } catch (err) {
      setError(err.message || "Cannot synchronize component database data.");
    }
  };

  useEffect(() => {
    let ignore = false;

    async function loadInitialData() {
      try {
        const { enrichedZones, vTypesData } = await fetchZonesData();

        if (ignore) return;

        setZones(enrichedZones);
        setVehicleTypes(vTypesData);
        setError("");
      } catch (err) {
        if (ignore) return;

        setError(err.message || "Cannot synchronize component database data.");
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

  const buildingZones = useMemo(() => {
    if (!activeBuildingId) return zones;
    return zones.filter((z) => z.buildingId === activeBuildingId);
  }, [zones, activeBuildingId]);

  // Xử lý bộ lọc tìm kiếm và sắp xếp client-side
  const filteredZones = useMemo(() => {
    let result = [...buildingZones];

    if (keyword.trim()) {
      const lowTerm = keyword.toLowerCase();
      result = result.filter(
        (z) =>
          z.zoneName.toLowerCase().includes(lowTerm) ||
          (z.vehicleTypeName &&
            z.vehicleTypeName.toLowerCase().includes(lowTerm)),
      );
    }

    result.sort((a, b) => {
      if (sortBy === "name-asc") return a.zoneName.localeCompare(b.zoneName);
      if (sortBy === "name-desc") return b.zoneName.localeCompare(a.zoneName);
      if (sortBy === "capacity-desc") return b.totalCapacity - a.totalCapacity;
      if (sortBy === "capacity-asc") return a.totalCapacity - b.totalCapacity;
      return 0;
    });

    return result;
  }, [buildingZones, keyword, sortBy]);

  // Các hàm đóng mở Modal Form
  const openCreateModal = () => {
    setSelectedZone(null);
    setModalMode("create");
  };

  const openEditModal = (zone) => {
    setSelectedZone(zone);
    setModalMode("edit");
  };

  const closeFormModal = () => {
    setModalMode(null);
    setSelectedZone(null);
  };

  // Hành động submit: Xử lý cả Create (POST) & Update (PUT)
  const handleFormSubmit = async (formData) => {
    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        buildingId: selectedZone?.buildingId || activeBuildingId,
      };
      if (modalMode === "create") {
        await apiRequest("/api/zones", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setAlert({
          type: "success",
          message: `Successfully created zone "${formData.zoneName}".`,
        });
      } else if (modalMode === "edit") {
        await apiRequest(`/api/zones/${selectedZone.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        setAlert({
          type: "success",
          message: `Successfully updated zone "${formData.zoneName}".`,
        });
      }
      closeFormModal();
      await loadData();
    } catch (err) {
      setAlert({
        type: "error",
        message: err.message || "Failed to save zone changes.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Hành động confirm Xóa dữ liệu (DELETE)
  const handleConfirmDelete = async () => {
    if (!deleteZone) return;
    try {
      setDeleting(true);
      await apiRequest(`/api/zones/${deleteZone.id}`, {
        method: "DELETE",
      });
      setAlert({
        type: "success",
        message: `Successfully deleted zone "${deleteZone.zoneName}".`,
      });
      setDeleteZone(null);
      await loadData();
    } catch (err) {
      setAlert({
        type: "error",
        message: err.message || "Failed to delete target zone.",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AdminLayout>
      <PageHero
        total={buildingZones.length}
        filteredTotal={filteredZones.length}
        onAdd={openCreateModal}
      />

      <Alert
        alert={alert}
        onClose={() => setAlert({ type: "", message: "" })}
      />

      <FilterBar
        keyword={keyword}
        onKeywordChange={setKeyword}
        sortBy={sortBy}
        onSortChange={setSortBy}
        total={filteredZones.length}
      />

      {loading ? (
        <LoadingState />
      ) : error ? (
        <div className="rounded-[28px] border border-red-200 bg-red-50 px-6 py-10 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600">
            <span className="material-symbols-outlined text-3xl">error</span>
          </div>
          <h3 className="mt-4 font-['Geist'] text-lg font-semibold text-red-800">
            Cannot load parking zones
          </h3>
          <p className="mt-2 font-['Inter'] text-sm text-red-600">{error}</p>
        </div>
      ) : filteredZones.length === 0 ? (
        <EmptyState onAdd={openCreateModal} />
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredZones.map((zone) => (
            <ZoneCard
              key={zone.id}
              zone={zone}
              onEdit={openEditModal}
              onDelete={setDeleteZone}
            />
          ))}
        </div>
      )}

      {modalMode && (
        <ZoneFormModal
          key={`${modalMode}-${selectedZone?.id || "new"}`}
          mode={modalMode}
          initialData={selectedZone}
          vehicleTypes={vehicleTypes}
          submitting={submitting}
          onClose={closeFormModal}
          onSubmit={handleFormSubmit}
        />
      )}

      {deleteZone && (
        <DeleteModal
          zone={deleteZone}
          deleting={deleting}
          onClose={() => {
            if (!deleting) setDeleteZone(null);
          }}
          onConfirm={handleConfirmDelete}
        />
      )}
    </AdminLayout>
  );
}
