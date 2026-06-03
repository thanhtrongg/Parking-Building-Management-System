import { useCallback, useEffect, useMemo, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import { apiRequest } from "../services/api";

const initialForm = {
  vehicleTypeId: "",
  basePrice: "",
  hourlyRate: "",
  nightRate: "",
  effectiveDate: "",
};

function getApiData(result) {
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.data)) return result.data;
  return [];
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

function formatCurrency(value) {
  const amount = Number(value || 0);

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(value) {
  if (!value) return "N/A";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function toDateInputValue(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toISOString().slice(0, 10);
}

function getPolicyVehicleName(policy) {
  return (
    policy?.vehicleType?.typeName ||
    policy?.vehicle_types?.type_name ||
    policy?.vehicleTypeName ||
    "All vehicle types"
  );
}

function PageHero({ total, canManage, onAdd }) {
  return (
    <section className="relative mb-7 overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-white via-blue-50 to-cyan-50 p-6 shadow-sm md:p-8">
      <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-200/70 blur-3xl" />
      <div className="absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-cyan-200/60 blur-3xl" />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/80 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-blue-600 shadow-sm">
            <span className="material-symbols-outlined text-base">
              price_change
            </span>
            Pricing Policies
          </div>

          <h2 className="mt-5 text-3xl font-black tracking-tight text-slate-950 md:text-4xl">
            Manage parking pricing rules
          </h2>

          <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-slate-500">
            Set base price, hourly rate, night rate, and effective date by
            vehicle type. These policies can later be reused for reservations,
            parking sessions, and payments.
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            <span className="rounded-full border border-blue-100 bg-white/80 px-3 py-1.5 text-xs font-bold text-blue-700 shadow-sm">
              {total} policies
            </span>
            <span className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
              View: ADMIN / MANAGER / STAFF / USER
            </span>
            <span className="rounded-full border border-amber-100 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700">
              Edit: ADMIN / MANAGER
            </span>
          </div>
        </div>

        {canManage && (
          <button
            type="button"
            onClick={onAdd}
            className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 text-sm font-black text-white shadow-lg shadow-blue-600/25 transition hover:-translate-y-0.5 hover:bg-blue-700 active:translate-y-0"
          >
            <span className="material-symbols-outlined text-xl">add</span>
            Add Policy
          </button>
        )}
      </div>
    </section>
  );
}

function Toolbar({ keyword, onKeywordChange, sortBy, onSortChange, total }) {
  return (
    <section className="mb-6 rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex-1 lg:max-w-xl">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            search
          </span>
          <input
            value={keyword}
            onChange={(event) => onKeywordChange(event.target.value)}
            placeholder="Search vehicle type or policy id..."
            className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <select
            value={sortBy}
            onChange={(event) => onSortChange(event.target.value)}
            className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
          >
            <option value="newest">Newest effective date</option>
            <option value="oldest">Oldest effective date</option>
            <option value="base-high">Base price high-low</option>
            <option value="base-low">Base price low-high</option>
          </select>

          <div className="inline-flex h-12 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 px-4 text-sm text-blue-700">
            <span className="font-black">{total}</span>
            <span className="ml-1 font-semibold">results</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-blue-600">
          <span className="material-symbols-outlined text-2xl">{icon}</span>
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-wider text-slate-400">
            {label}
          </p>
          <p className="mt-1 text-xl font-black text-slate-950">{value}</p>
        </div>
      </div>
    </div>
  );
}

function PricingPolicyCard({ policy, canManage, onEdit, onDelete }) {
  return (
    <article className="group overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/70">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 place-items-center rounded-3xl bg-blue-600 text-white shadow-lg shadow-blue-600/20 transition group-hover:scale-105">
            <span className="material-symbols-outlined text-4xl">sell</span>
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-xl font-black text-slate-950">
              {getPolicyVehicleName(policy)}
            </h3>
            <p className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-400">
              Effective{" "}
              {formatDate(policy.effectiveDate || policy.effective_date)}
            </p>
          </div>
        </div>

        <span className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
          Active
        </span>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
            Base
          </p>
          <p className="mt-1 text-sm font-black text-slate-950">
            {formatCurrency(policy.basePrice ?? policy.base_price)}
          </p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
            Hourly
          </p>
          <p className="mt-1 text-sm font-black text-slate-950">
            {formatCurrency(policy.hourlyRate ?? policy.hourly_rate)}
          </p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
            Night
          </p>
          <p className="mt-1 text-sm font-black text-slate-950">
            {formatCurrency(policy.nightRate ?? policy.night_rate)}
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
          Policy ID
        </p>
        <p className="mt-1 truncate text-xs font-bold text-slate-600">
          {policy.id}
        </p>
      </div>

      {canManage && (
        <div className="mt-5 flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={() => onEdit(policy)}
            className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 text-xs font-black text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
          >
            <span className="material-symbols-outlined text-base">edit</span>
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(policy)}
            className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-red-50 px-4 text-xs font-black text-red-600 ring-1 ring-red-100 transition hover:bg-red-100"
          >
            <span className="material-symbols-outlined text-base">delete</span>
            Delete
          </button>
        </div>
      )}
    </article>
  );
}

function PolicyModal({
  mode,
  form,
  vehicleTypes,
  loading,
  error,
  onChange,
  onClose,
  onSubmit,
}) {
  const title =
    mode === "edit" ? "Update Pricing Policy" : "Create Pricing Policy";

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl shadow-slate-950/20"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h3 className="text-xl font-black text-slate-950">{title}</h3>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Use real vehicle type ids from the API response.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="space-y-5 px-6 py-5">
          {error && (
            <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-500">
              Vehicle Type
            </label>
            <select
              value={form.vehicleTypeId}
              onChange={(event) =>
                onChange("vehicleTypeId", event.target.value)
              }
              className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
            >
              <option value="">All vehicle types / no vehicle type</option>
              {vehicleTypes.map((vehicleType) => (
                <option key={vehicleType.id} value={vehicleType.id}>
                  {vehicleType.typeName || vehicleType.type_name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-500">
                Base Price *
              </label>
              <input
                type="number"
                min="0"
                value={form.basePrice}
                onChange={(event) => onChange("basePrice", event.target.value)}
                placeholder="10000"
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-800 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-500">
                Hourly Rate
              </label>
              <input
                type="number"
                min="0"
                value={form.hourlyRate}
                onChange={(event) => onChange("hourlyRate", event.target.value)}
                placeholder="5000"
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-800 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-500">
                Night Rate
              </label>
              <input
                type="number"
                min="0"
                value={form.nightRate}
                onChange={(event) => onChange("nightRate", event.target.value)}
                placeholder="8000"
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-800 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-500">
              Effective Date *
            </label>
            <input
              type="date"
              value={form.effectiveDate}
              onChange={(event) =>
                onChange("effectiveDate", event.target.value)
              }
              className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-800 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
            />
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50 px-6 py-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="h-12 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-700 transition hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <span className="material-symbols-outlined animate-spin text-xl">
                progress_activity
              </span>
            ) : (
              <span className="material-symbols-outlined text-xl">save</span>
            )}
            Save Policy
          </button>
        </div>
      </form>
    </div>
  );
}

function DeleteModal({ policy, loading, error, onClose, onConfirm }) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl shadow-slate-950/20">
        <div className="px-6 py-5">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-red-50 text-red-600">
            <span className="material-symbols-outlined text-4xl">delete</span>
          </div>
          <h3 className="mt-5 text-center text-xl font-black text-slate-950">
            Delete pricing policy?
          </h3>
          <p className="mt-2 text-center text-sm font-medium leading-6 text-slate-500">
            This will permanently delete the policy for{" "}
            <span className="font-black text-slate-700">
              {getPolicyVehicleName(policy)}
            </span>
            .
          </p>

          {error && (
            <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
              {error}
            </div>
          )}
        </div>

        <div className="flex gap-3 border-t border-slate-100 bg-slate-50 px-6 py-5">
          <button
            type="button"
            onClick={onClose}
            className="h-12 flex-1 rounded-2xl border border-slate-200 bg-white text-sm font-black text-slate-700 transition hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className="h-12 flex-1 rounded-2xl bg-red-600 text-sm font-black text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ canManage, onAdd }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-white/80 px-6 py-14 text-center shadow-sm backdrop-blur">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
        <span className="material-symbols-outlined text-4xl">price_change</span>
      </div>
      <h3 className="mt-5 text-xl font-black text-slate-950">
        No pricing policies found
      </h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        Create the first pricing policy to calculate parking fees by vehicle
        type.
      </p>
      {canManage && (
        <button
          type="button"
          onClick={onAdd}
          className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-600/25 transition hover:-translate-y-0.5 hover:bg-blue-700 active:translate-y-0"
        >
          <span className="material-symbols-outlined text-xl">add</span>
          Add Policy
        </button>
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
      {[1, 2, 3, 4].map((item) => (
        <div
          key={item}
          className="h-64 animate-pulse rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-3xl bg-slate-100" />
            <div className="flex-1">
              <div className="h-5 w-1/2 rounded-full bg-slate-100" />
              <div className="mt-3 h-4 w-1/3 rounded-full bg-slate-100" />
            </div>
          </div>
          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="h-20 rounded-2xl bg-slate-100" />
            <div className="h-20 rounded-2xl bg-slate-100" />
            <div className="h-20 rounded-2xl bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function PricingPoliciesPage() {
  const [pricingPolicies, setPricingPolicies] = useState([]);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [modalError, setModalError] = useState("");
  const [keyword, setKeyword] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [modalMode, setModalMode] = useState(null);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [form, setForm] = useState(initialForm);

  const role = getUserRole();
  const canManage = ["ADMIN", "MANAGER"].includes(role);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [policiesResult, vehicleTypesResult] = await Promise.all([
        apiRequest("/api/pricing-policies"),
        apiRequest("/api/vehicle-types"),
      ]);

      setPricingPolicies(getApiData(policiesResult));
      setVehicleTypes(getApiData(vehicleTypesResult));
    } catch (err) {
      setError(err.message || "Cannot load pricing policies");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadData();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadData]);

  const filteredPolicies = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    const result = pricingPolicies.filter((policy) => {
      if (!normalizedKeyword) return true;

      const vehicleName = getPolicyVehicleName(policy).toLowerCase();
      const policyId = String(policy.id || "").toLowerCase();

      return (
        vehicleName.includes(normalizedKeyword) ||
        policyId.includes(normalizedKeyword)
      );
    });

    return [...result].sort((a, b) => {
      if (sortBy === "oldest") {
        return (
          new Date(a.effectiveDate || a.effective_date) -
          new Date(b.effectiveDate || b.effective_date)
        );
      }

      if (sortBy === "base-high") {
        return (
          Number(b.basePrice ?? b.base_price ?? 0) -
          Number(a.basePrice ?? a.base_price ?? 0)
        );
      }

      if (sortBy === "base-low") {
        return (
          Number(a.basePrice ?? a.base_price ?? 0) -
          Number(b.basePrice ?? b.base_price ?? 0)
        );
      }

      return (
        new Date(b.effectiveDate || b.effective_date) -
        new Date(a.effectiveDate || a.effective_date)
      );
    });
  }, [keyword, pricingPolicies, sortBy]);

  const stats = useMemo(() => {
    const totalBase = pricingPolicies.reduce(
      (sum, item) => sum + Number(item.basePrice ?? item.base_price ?? 0),
      0,
    );
    const avgBase = pricingPolicies.length
      ? Math.round(totalBase / pricingPolicies.length)
      : 0;
    const vehicleTypeCount = new Set(
      pricingPolicies
        .map((item) => item.vehicleTypeId || item.vehicle_type_id)
        .filter(Boolean),
    ).size;

    return {
      total: pricingPolicies.length,
      avgBase,
      vehicleTypeCount,
    };
  }, [pricingPolicies]);

  const openCreateModal = () => {
    setSelectedPolicy(null);
    setForm(initialForm);
    setModalError("");
    setModalMode("create");
  };

  const openEditModal = (policy) => {
    setSelectedPolicy(policy);
    setForm({
      vehicleTypeId: policy.vehicleTypeId || policy.vehicle_type_id || "",
      basePrice: String(policy.basePrice ?? policy.base_price ?? ""),
      hourlyRate: String(policy.hourlyRate ?? policy.hourly_rate ?? ""),
      nightRate: String(policy.nightRate ?? policy.night_rate ?? ""),
      effectiveDate: toDateInputValue(
        policy.effectiveDate || policy.effective_date,
      ),
    });
    setModalError("");
    setModalMode("edit");
  };

  const openDeleteModal = (policy) => {
    setSelectedPolicy(policy);
    setModalError("");
    setModalMode("delete");
  };

  const resetModal = () => {
    setModalMode(null);
    setSelectedPolicy(null);
    setModalError("");
    setForm(initialForm);
  };

  const closeModal = () => {
    if (submitting) return;
    resetModal();
  };

  const updateForm = (field, value) => {
    setForm((currentForm) => ({ ...currentForm, [field]: value }));
  };

  const validateForm = () => {
    if (!form.basePrice || !form.effectiveDate) {
      return "basePrice and effectiveDate are required";
    }

    const priceFields = ["basePrice", "hourlyRate", "nightRate"];

    for (const field of priceFields) {
      if (form[field] === "") continue;

      const value = Number(form[field]);
      if (Number.isNaN(value) || value < 0) {
        return `${field} must be a non-negative number`;
      }
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setModalError(validationError);
      return;
    }

    const payload = {
      vehicleTypeId: form.vehicleTypeId || null,
      basePrice: Number(form.basePrice),
      hourlyRate: Number(form.hourlyRate || 0),
      nightRate: Number(form.nightRate || 0),
      effectiveDate: form.effectiveDate,
    };

    try {
      setSubmitting(true);
      setModalError("");

      if (modalMode === "edit" && selectedPolicy) {
        await apiRequest(`/api/pricing-policies/${selectedPolicy.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await apiRequest("/api/pricing-policies", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      resetModal();
      await loadData();
    } catch (err) {
      setModalError(err.message || "Cannot save pricing policy");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedPolicy) return;

    try {
      setSubmitting(true);
      setModalError("");

      await apiRequest(`/api/pricing-policies/${selectedPolicy.id}`, {
        method: "DELETE",
      });

      resetModal();
      await loadData();
    } catch (err) {
      setModalError(err.message || "Cannot delete pricing policy");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <PageHero
        total={pricingPolicies.length}
        canManage={canManage}
        onAdd={openCreateModal}
      />

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard
          icon="receipt_long"
          label="Total policies"
          value={stats.total}
        />
        <StatCard
          icon="directions_car"
          label="Vehicle types"
          value={stats.vehicleTypeCount}
        />
        <StatCard
          icon="payments"
          label="Avg base price"
          value={formatCurrency(stats.avgBase)}
        />
      </div>

      <Toolbar
        keyword={keyword}
        onKeywordChange={setKeyword}
        sortBy={sortBy}
        onSortChange={setSortBy}
        total={filteredPolicies.length}
      />

      {error && (
        <div className="mb-6 rounded-3xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <LoadingState />
      ) : filteredPolicies.length === 0 ? (
        <EmptyState canManage={canManage} onAdd={openCreateModal} />
      ) : (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          {filteredPolicies.map((policy) => (
            <PricingPolicyCard
              key={policy.id}
              policy={policy}
              canManage={canManage}
              onEdit={openEditModal}
              onDelete={openDeleteModal}
            />
          ))}
        </div>
      )}

      {(modalMode === "create" || modalMode === "edit") && (
        <PolicyModal
          mode={modalMode}
          form={form}
          vehicleTypes={vehicleTypes}
          loading={submitting}
          error={modalError}
          onChange={updateForm}
          onClose={closeModal}
          onSubmit={handleSubmit}
        />
      )}

      {modalMode === "delete" && selectedPolicy && (
        <DeleteModal
          policy={selectedPolicy}
          loading={submitting}
          error={modalError}
          onClose={closeModal}
          onConfirm={handleDelete}
        />
      )}
    </AdminLayout>
  );
}
