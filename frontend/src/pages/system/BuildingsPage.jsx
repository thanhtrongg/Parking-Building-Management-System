import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { apiRequest } from "../../services/api";

function EmptyState({ onAdd }) {
  return (
    <div className="rounded-[28px] border border-dashed border-slate-300 bg-white/80 px-6 py-14 text-center shadow-sm backdrop-blur dark:bg-[#11100c]/80 dark:border-white/10">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400">
        <span className="material-symbols-outlined text-4xl">apartment</span>
      </div>
      <h3 className="mt-5 font-['Geist'] text-xl font-semibold text-slate-950 dark:text-[#fbf4e7]">
        No parking buildings found
      </h3>
      <p className="mx-auto mt-2 max-w-md font-['Inter'] text-sm leading-6 text-slate-500 dark:text-[#b9af9d]">
        Create the first building to define floors, zones, slots, and rules.
      </p>
      <button
        onClick={onAdd}
        className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 font-['Inter'] text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:-translate-y-0.5 hover:bg-blue-700 active:translate-y-0"
      >
        <span className="material-symbols-outlined text-xl">add</span>
        Add Parking Building
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
          className="h-64 animate-pulse rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm dark:bg-[#11100c] dark:border-white/10"
        >
          <div className="h-24 rounded-3xl bg-slate-100 dark:bg-white/5" />
          <div className="mt-5 h-5 w-1/2 rounded-full bg-slate-100 dark:bg-white/5" />
          <div className="mt-3 h-4 w-4/5 rounded-full bg-slate-100 dark:bg-white/5" />
          <div className="mt-6 h-10 rounded-2xl bg-slate-100 dark:bg-white/5" />
        </div>
      ))}
    </div>
  );
}

function PageHero({ onAdd }) {
  return (
    <div className="relative mb-7 overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-white via-blue-50/80 to-sky-50 p-6 shadow-sm ring-1 ring-white md:p-8 dark:from-[#11100c] dark:via-blue-950/10 dark:to-sky-950/10 dark:border-white/10 dark:ring-0">
      <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-blue-200/60 blur-3xl dark:bg-blue-500/10" />
      <div className="absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-cyan-200/50 blur-3xl dark:bg-cyan-500/10" />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/80 px-3 py-1.5 font-['Inter'] text-xs font-black uppercase tracking-[0.18em] text-blue-600 shadow-sm dark:bg-[#070705]/80 dark:border-white/10 dark:text-blue-400">
            <span className="material-symbols-outlined text-base">apartment</span>
            Infrastructure
          </div>

          <h2 className="mt-5 max-w-3xl font-['Geist'] text-3xl font-black tracking-tight text-slate-950 md:text-4xl dark:text-[#fbf4e7]">
            Parking Building Management
          </h2>
          <p className="mt-3 max-w-[42rem] font-['Inter'] text-sm leading-6 text-slate-500 dark:text-[#b9af9d]">
            Register new physical buildings, manage their operating schedules, toggle active status, and review real-time occupancy limits.
          </p>
        </div>

        <button
          onClick={onAdd}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-4 font-['Inter'] text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition duration-200 hover:-translate-y-0.5 hover:bg-blue-700 active:translate-y-0"
        >
          <span className="material-symbols-outlined text-xl">add</span>
          Add Building
        </button>
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
          ? "border-red-200 bg-red-50 text-red-700 dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-400"
          : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-400"
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
        className="rounded-lg p-1 transition hover:bg-black/5 dark:hover:bg-white/5"
      >
        <span className="material-symbols-outlined text-lg">close</span>
      </button>
    </div>
  );
}

function BuildingFormModal({ mode, building, saving, onClose, onSubmit }) {
  const [form, setForm] = useState({
    name: building?.name || "",
    address: building?.address || "",
    phone: building?.phone || "",
    openingTime: building?.openingTime || "00:00:00",
    closingTime: building?.closingTime || "00:00:00",
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
    if (!form.name.trim() || !form.address.trim()) return;
    
    // Ensure times are formatted properly with seconds if needed
    const formatted = {
      ...form,
      name: form.name.trim(),
      address: form.address.trim(),
      phone: form.phone.trim() || null,
      openingTime: form.openingTime.includes(":") && form.openingTime.split(":").length === 2 ? `${form.openingTime}:00` : form.openingTime,
      closingTime: form.closingTime.includes(":") && form.closingTime.split(":").length === 2 ? `${form.closingTime}:00` : form.closingTime,
    };
    onSubmit(formatted);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm dark:bg-black/60">
      <div className="w-full max-w-lg overflow-hidden rounded-[2rem] border border-slate-100 bg-white p-6 shadow-2xl dark:bg-[#11100c] dark:border-white/10">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-white/5">
          <h3 className="font-['Geist'] text-xl font-bold text-slate-950 dark:text-[#fbf4e7]">
            {isEdit ? "Edit Building" : "Add Parking Building"}
          </h3>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4 font-['Inter']">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#b9af9d] mb-2">
              Building Name
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="e.g. Building A Center"
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 text-sm outline-none transition duration-200 focus:border-blue-500 focus:bg-white dark:border-white/10 dark:bg-white/5 dark:focus:bg-[#070705] dark:focus:border-blue-500 dark:text-[#fbf4e7]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#b9af9d] mb-2">
              Address
            </label>
            <input
              type="text"
              required
              value={form.address}
              onChange={(e) => updateField("address", e.target.value)}
              placeholder="e.g. 123 Innovation Street"
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 text-sm outline-none transition duration-200 focus:border-blue-500 focus:bg-white dark:border-white/10 dark:bg-white/5 dark:focus:bg-[#070705] dark:focus:border-blue-500 dark:text-[#fbf4e7]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#b9af9d] mb-2">
              Contact Phone
            </label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              placeholder="e.g. +84 912 345 678"
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 text-sm outline-none transition duration-200 focus:border-blue-500 focus:bg-white dark:border-white/10 dark:bg-white/5 dark:focus:bg-[#070705] dark:focus:border-blue-500 dark:text-[#fbf4e7]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#b9af9d] mb-2">
                Opening Time
              </label>
              <input
                type="time"
                value={form.openingTime.substring(0, 5)}
                onChange={(e) => updateField("openingTime", e.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 text-sm outline-none transition duration-200 focus:border-blue-500 focus:bg-white dark:border-white/10 dark:bg-white/5 dark:focus:bg-[#070705] dark:focus:border-blue-500 dark:text-[#fbf4e7]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#b9af9d] mb-2">
                Closing Time
              </label>
              <input
                type="time"
                value={form.closingTime.substring(0, 5)}
                onChange={(e) => updateField("closingTime", e.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 text-sm outline-none transition duration-200 focus:border-blue-500 focus:bg-white dark:border-white/10 dark:bg-white/5 dark:focus:bg-[#070705] dark:focus:border-blue-500 dark:text-[#fbf4e7]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-white/5">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-white/10 dark:text-[#b9af9d] dark:hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 disabled:opacity-50"
            >
              {saving && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              )}
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function BuildingsPage() {
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [keyword, setKeyword] = useState("");
  const [sortBy, setSortBy] = useState("name-asc");

  const [modalMode, setModalMode] = useState(null); // 'create' | 'edit' | null
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [alert, setAlert] = useState({ type: "", message: "" });

  const loadData = async () => {
    try {
      const res = await apiRequest("/api/buildings");
      setBuildings(res.data || []);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to retrieve building records.");
    }
  };

  useEffect(() => {
    let ignore = false;
    async function init() {
      try {
        const res = await apiRequest("/api/buildings");
        if (ignore) return;
        setBuildings(res.data || []);
      } catch (err) {
        if (ignore) return;
        setError(err.message || "Failed to retrieve building records.");
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    init();
    return () => {
      ignore = true;
    };
  }, []);

  const filteredBuildings = useMemo(() => {
    let result = [...buildings];

    if (keyword.trim()) {
      const lowTerm = keyword.toLowerCase();
      result = result.filter(
        (b) =>
          b.name.toLowerCase().includes(lowTerm) ||
          b.address.toLowerCase().includes(lowTerm)
      );
    }

    result.sort((a, b) => {
      if (sortBy === "name-asc") return a.name.localeCompare(b.name);
      if (sortBy === "name-desc") return b.name.localeCompare(a.name);
      if (sortBy === "slots-desc") return b.totalSlots - a.totalSlots;
      if (sortBy === "slots-asc") return a.totalSlots - b.totalSlots;
      return 0;
    });

    return result;
  }, [buildings, keyword, sortBy]);

  const openCreateModal = () => {
    setSelectedBuilding(null);
    setModalMode("create");
  };

  const openEditModal = (building) => {
    setSelectedBuilding(building);
    setModalMode("edit");
  };

  const handleModalSubmit = async (formData) => {
    setSaving(true);
    setAlert({ type: "", message: "" });

    try {
      if (modalMode === "create") {
        const res = await apiRequest("/api/buildings", {
          method: "POST",
          body: JSON.stringify(formData),
        });
        setBuildings((current) => [...current, res.data]);
        setAlert({ type: "success", message: `Building "${formData.name}" created successfully!` });
      } else {
        const res = await apiRequest(`/api/buildings/${selectedBuilding.id}`, {
          method: "PUT",
          body: JSON.stringify(formData),
        });
        setBuildings((current) =>
          current.map((b) => (b.id === selectedBuilding.id ? res.data : b))
        );
        setAlert({ type: "success", message: `Building "${formData.name}" updated successfully!` });
      }
      setModalMode(null);
    } catch (err) {
      setAlert({ type: "error", message: err.message || "Failed to save building information." });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (building) => {
    setTogglingId(building.id);
    setAlert({ type: "", message: "" });

    try {
      await apiRequest(`/api/buildings/${building.id}/toggle-status`, {
        method: "PATCH",
      });
      setBuildings((current) =>
        current.map((b) => (b.id === building.id ? { ...b, active: !b.active } : b))
      );
      setAlert({
        type: "success",
        message: `Status of "${building.name}" toggled successfully!`,
      });
    } catch (err) {
      setAlert({ type: "error", message: err.message || "Failed to toggle building status." });
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="mx-auto max-w-7xl">
        <PageHero onAdd={openCreateModal} />

        <Alert alert={alert} onClose={() => setAlert({ type: "", message: "" })} />

        {error && (
          <div className="mb-5 flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 font-['Inter'] text-sm text-red-700 dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-400">
            <span className="material-symbols-outlined text-xl">error</span>
            <span>{error}</span>
          </div>
        )}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between font-['Inter']">
          <div className="relative flex-1 max-w-md">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[20px] text-slate-400">
              search
            </span>
            <input
              type="text"
              placeholder="Search buildings by name or address..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="h-11 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none transition duration-200 focus:border-blue-500 dark:border-white/10 dark:bg-[#11100c] dark:focus:border-blue-500 dark:text-[#fbf4e7]"
            />
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Sort</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold outline-none transition duration-200 focus:border-blue-500 dark:border-white/10 dark:bg-[#11100c] dark:text-[#fbf4e7]"
            >
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="slots-desc">Capacity (High-Low)</option>
              <option value="slots-asc">Capacity (Low-High)</option>
            </select>
          </div>
        </div>

        {loading ? (
          <LoadingState />
        ) : filteredBuildings.length === 0 ? (
          <EmptyState onAdd={openCreateModal} />
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredBuildings.map((building) => {
              const occupancyPct = building.totalSlots > 0 
                ? Math.round(((building.totalSlots - building.availableSlots) / building.totalSlots) * 100)
                : 0;

              return (
                <article
                  key={building.id}
                  className="group relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md dark:bg-[#11100c] dark:border-white/10"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="font-['Geist'] text-lg font-black text-slate-950 truncate dark:text-[#fbf4e7]">
                        {building.name}
                      </h3>
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 truncate dark:text-[#b9af9d]">
                        <span className="material-symbols-outlined text-[15px] text-slate-400">
                          location_on
                        </span>
                        {building.address}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(building)}
                        aria-label="Edit building"
                        className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 dark:bg-white/5 dark:border-white/5 dark:text-[#b9af9d] dark:hover:bg-white/10"
                      >
                        <span className="material-symbols-outlined text-lg">edit</span>
                      </button>
                    </div>
                  </div>

                  <div className="mt-5 space-y-2 border-t border-slate-100 pt-4 font-['Inter'] text-xs text-slate-600 dark:border-white/5 dark:text-[#b9af9d]">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-base text-slate-400">phone</span>
                      <span>{building.phone || "No phone listed"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-base text-slate-400">schedule</span>
                      <span>
                        Hours: {building.openingTime && building.closingTime
                          ? `${building.openingTime.substring(0, 5)} - ${building.closingTime.substring(0, 5)}`
                          : "24/7"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 space-y-4 rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
                    <div className="grid grid-cols-2 gap-4 text-center font-['Inter']">
                      <div>
                        <p className="text-xl font-black text-slate-950 dark:text-[#fbf4e7]">
                          {building.totalFloors}
                        </p>
                        <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Floors
                        </p>
                      </div>
                      <div className="border-l border-slate-200 dark:border-white/10">
                        <p className="text-xl font-black text-slate-950 dark:text-[#fbf4e7]">
                          {building.totalSlots}
                        </p>
                        <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Total Capacity
                        </p>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1.5 dark:text-[#b9af9d]">
                        <span>Occupied Slots</span>
                        <span>{building.totalSlots - building.availableSlots}/{building.totalSlots} ({occupancyPct}%)</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                        <div
                          className="h-full bg-blue-600 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, occupancyPct)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-white/5">
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${building.active ? "bg-emerald-500" : "bg-red-400 animate-pulse"}`} />
                      <span className="text-xs font-bold text-slate-500 dark:text-[#b9af9d]">
                        {building.active ? "Active & Open" : "Closed / Inactive"}
                      </span>
                    </div>

                    <button
                      onClick={() => handleToggleStatus(building)}
                      disabled={togglingId === building.id}
                      className={`rounded-xl px-3.5 py-2 text-xs font-bold ring-1 transition duration-200 ${
                        building.active
                          ? "bg-red-50 text-red-600 ring-red-100 hover:bg-red-100 dark:bg-red-950/20 dark:text-red-400 dark:ring-red-900/30"
                          : "bg-emerald-50 text-emerald-700 ring-emerald-100 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:ring-emerald-900/30"
                      }`}
                    >
                      {togglingId === building.id ? "Updating..." : building.active ? "Deactivate" : "Activate"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {modalMode && (
          <BuildingFormModal
            mode={modalMode}
            building={selectedBuilding}
            saving={saving}
            onClose={() => setModalMode(null)}
            onSubmit={handleModalSubmit}
          />
        )}
      </div>
    </AdminLayout>
  );
}
