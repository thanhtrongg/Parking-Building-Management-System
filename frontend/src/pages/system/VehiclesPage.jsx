import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { apiRequest } from "../../services/api";
import CustomSelect from "../../components/CustomSelect";

const vehicleThemes = {
  "Ô tô": {
    gradient: "from-sky-500 via-blue-600 to-indigo-700",
    soft: "bg-sky-50 text-sky-700 border-sky-100",
    icon: "directions_car",
  },
  "Xe máy": {
    gradient: "from-orange-500 via-amber-500 to-yellow-400",
    soft: "bg-orange-50 text-orange-700 border-orange-100",
    icon: "two_wheeler",
  },
  "Xe đạp": {
    gradient: "from-emerald-500 via-green-500 to-lime-400",
    soft: "bg-emerald-50 text-emerald-700 border-emerald-100",
    icon: "directions_bike",
  },
  "Xe điện": {
    gradient: "from-cyan-500 via-blue-500 to-violet-600",
    soft: "bg-cyan-50 text-cyan-700 border-cyan-100",
    icon: "ev_station",
  },
  "Xe máy điện": {
    gradient: "from-cyan-500 via-blue-500 to-violet-600",
    soft: "bg-cyan-50 text-cyan-700 border-cyan-100",
    icon: "electric_moped",
  },
  "Xe tải nhỏ": {
    gradient: "from-slate-700 via-zinc-700 to-gray-500",
    soft: "bg-slate-50 text-slate-700 border-slate-200",
    icon: "local_shipping",
  },
};

const defaultTheme = {
  gradient: "from-slate-800 via-blue-800 to-cyan-600",
  soft: "bg-slate-50 text-slate-700 border-slate-200",
  icon: "category",
};

const getVehicleTheme = (typeName = "") =>
  vehicleThemes[typeName] || defaultTheme;

function EmptyState({ onAdd }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-white/80 px-6 py-14 text-center shadow-sm backdrop-blur">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
        <span className="material-symbols-outlined text-4xl">category</span>
      </div>
      <h3 className="mt-5 font-['Geist'] text-xl font-semibold text-slate-950">
        No vehicle types found
      </h3>
      <p className="mx-auto mt-2 max-w-md font-['Inter'] text-sm leading-6 text-slate-500">
        Create the first vehicle type to connect it with zones, reservations,
        pricing policies, and parking sessions.
      </p>
      <button
        onClick={onAdd}
        className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 font-['Inter'] text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:-translate-y-0.5 hover:bg-blue-700 active:translate-y-0"
      >
        <span className="material-symbols-outlined text-xl">add</span>
        Add Vehicle Type
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
          className="h-72 animate-pulse rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="h-32 rounded-3xl bg-slate-100" />
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
            <span className="material-symbols-outlined text-base">
              directions_car
            </span>
            Vehicle Catalog
          </div>

          <h2 className="mt-5 max-w-3xl font-['Geist'] text-3xl font-black tracking-tight text-slate-950 md:text-4xl">
            Vehicle Type Management
          </h2>

          <p className="mt-3 max-w-2xl font-['Inter'] text-sm leading-6 text-slate-500">
            Manage vehicle categories used across parking zones, reservations,
            parking sessions, and pricing policies.
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            <span className="rounded-full border border-blue-100 bg-white/80 px-3 py-1.5 text-xs font-bold text-blue-700 shadow-sm">
              {total} Total Types
            </span>
            <span className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
              {filteredTotal} Showing
            </span>
          </div>
        </div>

        <button
          onClick={onAdd}
          className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 font-['Inter'] text-sm font-black text-white shadow-lg shadow-blue-600/25 transition hover:-translate-y-0.5 hover:bg-blue-700 active:translate-y-0"
        >
          <span className="material-symbols-outlined text-xl">add</span>
          Add Type
        </button>
      </div>
    </div>
  );
}

function FilterBar({ keyword, onKeywordChange, sortBy, onSortChange, total }) {
  return (
    <div className="mb-6 rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex-1 lg:max-w-xl">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            search
          </span>

          <input
            value={keyword}
            onChange={(event) => onKeywordChange(event.target.value)}
            placeholder="Search vehicle type name or description..."
            className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 font-['Inter'] text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <CustomSelect
            options={[
              { value: "name-asc", label: "Name A-Z" },
              { value: "name-desc", label: "Name Z-A" },
              { value: "newest", label: "Newest first" }
            ]}
            value={sortBy}
            onChange={onSortChange}
            className="h-12 min-w-[140px] rounded-2xl border border-slate-200 bg-slate-50 px-4 font-['Inter'] text-sm font-bold text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/5 dark:text-[#fbf4e7]"
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

function VehicleTypeCard({ vehicleType, onView, onEdit, onDelete }) {
  const theme = getVehicleTheme(vehicleType.typeName);

  return (
    <article className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/70">
      <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-blue-100/60 blur-2xl transition group-hover:bg-blue-200/70" />

      <div className="relative flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-linear-to-br ${theme.gradient} text-white shadow-lg transition group-hover:scale-105`}
          >
            <span className="material-symbols-outlined text-4xl">
              {theme.icon}
            </span>
          </div>

          <div className="min-w-0">
            <h3 className="truncate font-['Geist'] text-xl font-black text-slate-950">
              {vehicleType.typeName}
            </h3>

            <span
              className={`mt-2 inline-flex rounded-full border px-3 py-1 font-['Inter'] text-xs font-black ${theme.soft}`}
            >
              Active
            </span>
          </div>
        </div>

        <button
          onClick={() => onView(vehicleType)}
          className="rounded-2xl p-2 text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
          title="View details"
        >
          <span className="material-symbols-outlined text-xl">visibility</span>
        </button>
      </div>

      <p className="relative mt-5 line-clamp-2 min-h-10 font-['Inter'] text-sm leading-5 text-slate-500">
        {vehicleType.description || "No description yet."}
      </p>

      <div className="relative mt-5 rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-100">
        <p className="font-['Inter'] text-[10px] font-black uppercase tracking-wider text-slate-400">
          Record ID
        </p>
        <p className="mt-1 truncate font-['Inter'] text-sm font-bold text-slate-700">
          {vehicleType.id}
        </p>
      </div>

      <div className="relative mt-5 flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
        <button
          onClick={() => onEdit(vehicleType)}
          className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 font-['Inter'] text-xs font-black text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
        >
          <span className="material-symbols-outlined text-base">edit</span>
          Edit
        </button>

        <button
          onClick={() => onDelete(vehicleType)}
          className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-red-50 px-4 font-['Inter'] text-xs font-black text-red-600 ring-1 ring-red-100 transition hover:bg-red-100"
        >
          <span className="material-symbols-outlined text-base">delete</span>
          Delete
        </button>
      </div>
    </article>
  );
}

function VehicleTypeGrid({
  vehicleTypes,
  loading,
  error,
  onAdd,
  onView,
  onEdit,
  onDelete,
}) {
  if (loading) return <LoadingState />;

  if (error) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 px-6 py-10 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600">
          <span className="material-symbols-outlined text-3xl">error</span>
        </div>
        <h3 className="mt-4 font-['Geist'] text-lg font-semibold text-red-800">
          Cannot load vehicle types
        </h3>
        <p className="mt-2 font-['Inter'] text-sm text-red-600">{error}</p>
      </div>
    );
  }

  if (vehicleTypes.length === 0) return <EmptyState onAdd={onAdd} />;

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
      {vehicleTypes.map((vehicleType) => (
        <VehicleTypeCard
          key={vehicleType.id}
          vehicleType={vehicleType}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

function VehicleTypeFormModal({
  mode,
  initialData,
  submitting,
  onClose,
  onSubmit,
}) {
  const [form, setForm] = useState(() => ({
    typeName: initialData?.typeName || "",
    description: initialData?.description || "",
  }));

  const isEdit = mode === "edit";

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({
      typeName: form.typeName.trim(),
      description: form.description.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl shadow-slate-950/30">
        <div className="relative overflow-hidden border-b border-blue-100 bg-gradient-to-br from-white via-blue-50 to-sky-50 px-6 py-6">
          <div className="absolute -right-12 -top-16 h-40 w-40 rounded-full bg-blue-200/60 blur-2xl" />

          <div className="relative flex items-start justify-between gap-4">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/25">
                <span className="material-symbols-outlined text-3xl">
                  {isEdit ? "edit" : "add"}
                </span>
              </div>

              <h3 className="mt-4 font-['Geist'] text-2xl font-black text-slate-950">
                {isEdit ? "Edit Vehicle Type" : "Add Vehicle Type"}
              </h3>

              <p className="mt-1 font-['Inter'] text-sm text-slate-500">
                {isEdit
                  ? "Update the display name and description for this category."
                  : "Create a new vehicle category for parking operations."}
              </p>
            </div>

            <button
              onClick={onClose}
              disabled={submitting}
              className="rounded-2xl bg-white p-2 text-slate-500 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          <div>
            <label className="mb-2 block font-['Inter'] text-sm font-semibold text-slate-700">
              Vehicle type name <span className="text-red-500">*</span>
            </label>
            <input
              value={form.typeName}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, typeName: event.target.value }))
              }
              placeholder="Example: Xe máy điện"
              className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 font-['Inter'] text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          <div>
            <label className="mb-2 block font-['Inter'] text-sm font-semibold text-slate-700">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  description: event.target.value,
                }))
              }
              placeholder="Short description for this vehicle type..."
              rows={4}
              className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-['Inter'] text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-2xl border border-slate-200 px-5 py-3 font-['Inter'] text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 font-['Inter'] text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              )}
              {submitting
                ? "Saving..."
                : isEdit
                  ? "Update Type"
                  : "Create Type"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DetailModal({ vehicleType, onClose, onEdit }) {
  if (!vehicleType) return null;

  const theme = getVehicleTheme(vehicleType.typeName);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl shadow-slate-950/20">
        <div className="relative overflow-hidden border-b border-blue-100 bg-gradient-to-br from-white via-blue-50 to-sky-50 px-6 py-8">
          <div className="absolute -right-12 -top-16 h-40 w-40 rounded-full bg-blue-200/60 blur-2xl" />

          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-2xl bg-white p-2 text-slate-500 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50"
          >
            <span className="material-symbols-outlined">close</span>
          </button>

          <div className="relative flex flex-col items-center text-center">
            <div
              className={`flex h-24 w-24 items-center justify-center rounded-3xl bg-linear-to-br ${theme.gradient} text-white shadow-xl`}
            >
              <span className="material-symbols-outlined text-6xl">
                {theme.icon}
              </span>
            </div>

            <span
              className={`mt-5 inline-flex rounded-full border px-3 py-1 font-['Inter'] text-xs font-black ${theme.soft}`}
            >
              Active
            </span>

            <h3 className="mt-3 font-['Geist'] text-3xl font-black text-slate-950">
              {vehicleType.typeName}
            </h3>
          </div>
        </div>

        <div className="p-6">
          <p className="font-['Inter'] text-sm leading-6 text-slate-500">
            {vehicleType.description || "No description yet."}
          </p>

          <div className="mt-6 rounded-3xl border border-slate-100 bg-slate-50 p-4">
            <p className="font-['Inter'] text-xs font-black uppercase tracking-wide text-slate-400">
              Vehicle Type ID
            </p>
            <p className="mt-2 break-all font-['Inter'] text-sm font-bold text-slate-800">
              {vehicleType.id}
            </p>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="rounded-2xl border border-slate-200 px-5 py-3 font-['Inter'] text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              Close
            </button>

            <button
              onClick={() => onEdit(vehicleType)}
              className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 font-['Inter'] text-sm font-black text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700"
            >
              <span className="material-symbols-outlined text-xl">edit</span>
              Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DeleteModal({ vehicleType, deleting, onClose, onConfirm }) {
  if (!vehicleType) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl shadow-slate-950/30">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
          <span className="material-symbols-outlined text-3xl">delete</span>
        </div>
        <h3 className="mt-5 font-['Geist'] text-2xl font-bold text-slate-950">
          Delete vehicle type?
        </h3>
        <p className="mt-2 font-['Inter'] text-sm leading-6 text-slate-500">
          You are about to delete{" "}
          <span className="font-semibold text-slate-900">
            {vehicleType.typeName}
          </span>
          . Backend will block this action if the type is being used by zones,
          reservations, sessions, or pricing policies.
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={deleting}
            className="rounded-2xl border border-slate-200 px-5 py-3 font-['Inter'] text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="inline-flex items-center gap-2 rounded-2xl bg-red-600 px-5 py-3 font-['Inter'] text-sm font-semibold text-white shadow-lg shadow-red-600/25 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
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

export default function AdminVehiclesPage() {
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [keyword, setKeyword] = useState("");
  const [sortBy, setSortBy] = useState("name-asc");
  const [modalMode, setModalMode] = useState(null);
  const [selectedVehicleType, setSelectedVehicleType] = useState(null);
  const [viewVehicleType, setViewVehicleType] = useState(null);
  const [deleteVehicleType, setDeleteVehicleType] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });

  useEffect(() => {
    let ignore = false;

    const loadVehicleTypes = async () => {
      try {
        const result = await apiRequest("/api/vehicle-types");

        if (!ignore) {
          setVehicleTypes(result.data || []);
          setError("");
        }
      } catch (error) {
        if (!ignore) {
          setError(error.message || "Cannot load vehicle types");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadVehicleTypes();

    return () => {
      ignore = true;
    };
  }, []);

  const filteredVehicleTypes = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    const filtered = vehicleTypes.filter((type) => {
      const searchText =
        `${type.typeName || ""} ${type.description || ""}`.toLowerCase();
      return searchText.includes(normalizedKeyword);
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === "name-desc") {
        return (b.typeName || "").localeCompare(a.typeName || "", "vi");
      }

      if (sortBy === "newest") {
        return String(b.id || "").localeCompare(String(a.id || ""));
      }

      return (a.typeName || "").localeCompare(b.typeName || "", "vi");
    });
  }, [vehicleTypes, keyword, sortBy]);

  const openCreateModal = () => {
    setSelectedVehicleType(null);
    setModalMode("create");
  };

  const openEditModal = (vehicleType) => {
    setViewVehicleType(null);
    setSelectedVehicleType(vehicleType);
    setModalMode("edit");
  };

  const closeFormModal = () => {
    if (submitting) return;
    setModalMode(null);
    setSelectedVehicleType(null);
  };

  const showAlert = (type, message) => {
    setAlert({ type, message });
  };

  const handleSubmit = async (payload) => {
    if (!payload.typeName) {
      showAlert("error", "Vehicle type name is required");
      return;
    }

    try {
      setSubmitting(true);
      setAlert({ type: "", message: "" });

      if (modalMode === "edit" && selectedVehicleType?.id) {
        const result = await apiRequest(
          `/api/vehicle-types/${selectedVehicleType.id}`,
          {
            method: "PUT",
            body: JSON.stringify(payload),
          },
        );

        setVehicleTypes((prev) =>
          prev.map((item) =>
            item.id === selectedVehicleType.id ? result.data : item,
          ),
        );
        showAlert("success", "Update vehicle type successfully");
      } else {
        const result = await apiRequest("/api/vehicle-types", {
          method: "POST",
          body: JSON.stringify(payload),
        });

        setVehicleTypes((prev) => [...prev, result.data]);
        showAlert("success", "Create vehicle type successfully");
      }

      setModalMode(null);
      setSelectedVehicleType(null);
    } catch (error) {
      showAlert("error", error.message || "Cannot save vehicle type");
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteVehicleType?.id) return;

    try {
      setDeleting(true);
      setAlert({ type: "", message: "" });

      await apiRequest(`/api/vehicle-types/${deleteVehicleType.id}`, {
        method: "DELETE",
      });

      setVehicleTypes((prev) =>
        prev.filter((item) => item.id !== deleteVehicleType.id),
      );
      showAlert("success", "Delete vehicle type successfully");
      setDeleteVehicleType(null);
    } catch (error) {
      showAlert("error", error.message || "Cannot delete vehicle type");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AdminLayout activeLabel="Vehicles">
      <PageHero
        total={vehicleTypes.length}
        filteredTotal={filteredVehicleTypes.length}
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
        total={filteredVehicleTypes.length}
      />

      <VehicleTypeGrid
        vehicleTypes={filteredVehicleTypes}
        loading={loading}
        error={error}
        onAdd={openCreateModal}
        onView={setViewVehicleType}
        onEdit={openEditModal}
        onDelete={setDeleteVehicleType}
      />

      {modalMode && (
        <VehicleTypeFormModal
          key={`${modalMode}-${selectedVehicleType?.id || "new"}`}
          mode={modalMode}
          initialData={selectedVehicleType}
          submitting={submitting}
          onClose={closeFormModal}
          onSubmit={handleSubmit}
        />
      )}

      <DetailModal
        vehicleType={viewVehicleType}
        onClose={() => setViewVehicleType(null)}
        onEdit={openEditModal}
      />

      <DeleteModal
        vehicleType={deleteVehicleType}
        deleting={deleting}
        onClose={() => {
          if (!deleting) setDeleteVehicleType(null);
        }}
        onConfirm={confirmDelete}
      />
    </AdminLayout>
  );
}
