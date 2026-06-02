import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import { apiRequest } from "../services/api";

// Theme map cho các loại xe để hiển thị icon/màu sắc tương ứng trên Card
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
    icon: "grid_view",
};

const getVehicleTheme = (typeName = "") => vehicleThemes[typeName] || defaultTheme;

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
                Create the first parking zone to manage layouts, capacities, and assign vehicle types.
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
                <div key={item} className="h-64 animate-pulse rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
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
        <div className="relative mb-7 overflow-hidden rounded-[32px] border border-slate-200 bg-slate-950 p-6 shadow-xl shadow-slate-900/10 md:p-8">
            <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-blue-500/30 blur-3xl" />
            <div className="absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 font-['Inter'] text-xs font-medium text-blue-100 backdrop-blur">
                        <span className="material-symbols-outlined text-base">grid_view</span>
                        Admin zone configuration
                    </div>
                    <h2 className="mt-5 max-w-3xl font-['Geist'] text-3xl font-bold tracking-tight text-white md:text-4xl">
                        Parking Zone Management
                    </h2>
                    <p className="mt-3 max-w-2xl font-['Inter'] text-sm leading-6 text-slate-300">
                        Configure physical parking blocks, limit capacities, and bind them to specific vehicle categories.
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center">
                    <div className="rounded-3xl border border-white/10 bg-white/10 px-5 py-4 backdrop-blur">
                        <p className="font-['Inter'] text-xs text-slate-300">Total Zones</p>
                        <p className="mt-1 font-['Geist'] text-3xl font-bold text-white">{total}</p>
                    </div>
                    <div className="rounded-3xl border border-white/10 bg-white/10 px-5 py-4 backdrop-blur">
                        <p className="font-['Inter'] text-xs text-slate-300">Showing</p>
                        <p className="mt-1 font-['Geist'] text-3xl font-bold text-white">{filteredTotal}</p>
                    </div>
                    <button
                        onClick={onAdd}
                        className="col-span-2 inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-white px-5 font-['Inter'] text-sm font-semibold text-slate-950 shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:bg-blue-50 active:translate-y-0 sm:col-span-1"
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
        <div className="mb-6 rounded-[24px] border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="relative flex-1 lg:max-w-xl">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        search
                    </span>
                    <input
                        value={keyword}
                        onChange={(event) => onKeywordChange(event.target.value)}
                        placeholder="Search by zone name or vehicle type..."
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 font-['Inter'] text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                    />
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <select
                        value={sortBy}
                        onChange={(event) => onSortChange(event.target.value)}
                        className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 font-['Inter'] text-sm font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                    >
                        <option value="name-asc">Zone Name A-Z</option>
                        <option value="name-desc">Zone Name Z-A</option>
                        <option value="capacity-desc">Capacity (High to Low)</option>
                        <option value="capacity-asc">Capacity (Low to High)</option>
                    </select>

                    <div className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-4 font-['Inter'] text-sm text-slate-500">
                        <span className="font-semibold text-slate-900">{total}</span>
                        <span className="ml-1">results</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ZoneCard({ zone, onEdit, onDelete }) {
    const theme = getVehicleTheme(zone.vehicleTypeName);

    return (
        <article className="group relative rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md">
            <div className="flex items-center gap-4">
                <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br ${theme.gradient} text-white shadow-md`}>
                    <span className="material-symbols-outlined text-2xl">{theme.icon}</span>
                </div>
                <div className="min-w-0 flex-1">
                    <h3 className="font-['Geist'] text-lg font-bold tracking-tight text-slate-950 truncate">
                        {zone.zoneName}
                    </h3>
                    <span className={`mt-1 inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${theme.soft}`}>
                        {zone.vehicleTypeName || "Unassigned"}
                    </span>
                </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-100">
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Capacity</p>
                    <p className="mt-0.5 font-['Geist'] text-base font-bold text-slate-800">{zone.totalCapacity} slots</p>
                </div>
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Zone ID</p>
                    <p className="mt-0.5 text-xs font-medium text-slate-500 truncate">#{zone.id?.slice(-6) || zone.id}</p>
                </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
                <button
                    onClick={() => onEdit(zone)}
                    className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 font-['Inter'] text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                    <span className="material-symbols-outlined text-base">edit</span>
                    Edit
                </button>
                <button
                    onClick={() => onDelete(zone)}
                    className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-red-50 px-4 font-['Inter'] text-xs font-semibold text-red-600 ring-1 ring-red-100 transition hover:bg-red-100"
                >
                    <span className="material-symbols-outlined text-base">delete</span>
                    Delete
                </button>
            </div>
        </article>
    );
}

function ZoneFormModal({ mode, initialData, vehicleTypes, submitting, onClose, onSubmit }) {
    const [form, setForm] = useState(() => ({
        zoneName: initialData?.zoneName || "",
        vehicleTypeId: initialData?.vehicleTypeId || "",
        totalCapacity: initialData?.totalCapacity || "",
    }));

    const isEdit = mode === "edit";

    const handleSubmit = (event) => {
        event.preventDefault();
        if (!form.zoneName.trim() || !form.vehicleTypeId || !form.totalCapacity) return;

        onSubmit({
            zoneName: form.zoneName.trim(),
            vehicleTypeId: form.vehicleTypeId,
            totalCapacity: parseInt(form.totalCapacity, 10),
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-xl overflow-hidden rounded-[28px] bg-white shadow-2xl shadow-slate-950/30">
                <div className="relative overflow-hidden bg-slate-950 px-6 py-6">
                    <div className="absolute -right-12 -top-16 h-40 w-40 rounded-full bg-blue-500/30 blur-2xl" />
                    <div className="relative flex items-start justify-between gap-4">
                        <div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white">
                                <span className="material-symbols-outlined text-3xl">
                                    {isEdit ? "edit_note" : "add_box"}
                                </span>
                            </div>
                            <h3 className="mt-4 font-['Geist'] text-2xl font-bold text-white">
                                {isEdit ? "Edit Parking Zone" : "Create Parking Zone"}
                            </h3>
                            <p className="mt-1 font-['Inter'] text-sm text-slate-300">
                                Specify details to partition your physical slots layout.
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            disabled={submitting}
                            className="rounded-2xl bg-white/10 p-2 text-white transition hover:bg-white/20 disabled:opacity-50"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5 p-6">
                    <div>
                        <label className="mb-2 block font-['Inter'] text-sm font-semibold text-slate-700">
                            Zone Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            required
                            value={form.zoneName}
                            onChange={(e) => setForm(p => ({ ...p, zoneName: e.target.value }))}
                            placeholder="Example: Khu vực A, Block B..."
                            className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 font-['Inter'] text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block font-['Inter'] text-sm font-semibold text-slate-700">
                            Allowed Vehicle Type <span className="text-red-500">*</span>
                        </label>
                        <select
                            required
                            value={form.vehicleTypeId}
                            onChange={(e) => setForm(p => ({ ...p, vehicleTypeId: e.target.value }))}
                            className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 font-['Inter'] text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                        >
                            <option value="">-- Choose a Vehicle Category --</option>
                            {vehicleTypes.map((type) => (
                                <option key={type.id} value={type.id}>
                                    {type.typeName}
                                </option>
                            ))}
                        </select>
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
                            onChange={(e) => setForm(p => ({ ...p, totalCapacity: e.target.value }))}
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
                            {submitting && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
                            {submitting ? "Saving..." : isEdit ? "Update Zone" : "Create Zone"}
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
                    Are you sure you want to delete zone <span className="font-semibold text-slate-900">"{zone.zoneName}"</span>?
                    This will fail if any slots within this zone are tied to active reservations or operations.
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
                        {deleting && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
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
        <div className={`mb-5 flex items-start justify-between gap-4 rounded-2xl border px-4 py-3 font-['Inter'] text-sm shadow-sm ${isError ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}>
            <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-xl">{isError ? "error" : "check_circle"}</span>
                <span className="leading-6">{alert.message}</span>
            </div>
            <button onClick={onClose} className="rounded-lg p-1 transition hover:bg-black/5">
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

    // Hàm gọi API nạp dữ liệu đồng thời từ server
    const loadData = async () => {
        try {
            setLoading(true);
            const [zonesRes, vehicleTypesRes] = await Promise.all([
                apiRequest("/api/zones"),
                apiRequest("/api/vehicle-types"),
            ]);

            // Map tên vehicle type vào từng zone để hiển thị giao diện chính xác
            const zonesData = zonesRes.data || [];
            const vTypesData = vehicleTypesRes.data || [];

            const enrichedZones = zonesData.map(zone => {
                const foundType = vTypesData.find(t => t.id === zone.vehicleTypeId);
                return {
                    ...zone,
                    vehicleTypeName: foundType ? foundType.typeName : "Unknown"
                };
            });

            setZones(enrichedZones);
            setVehicleTypes(vTypesData);
            setError("");
        } catch (err) {
            setError(err.message || "Cannot synchronize component database data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Xử lý bộ lọc tìm kiếm và sắp xếp client-side
    const filteredZones = useMemo(() => {
        let result = [...zones];

        if (keyword.trim()) {
            const lowTerm = keyword.toLowerCase();
            result = result.filter(
                (z) =>
                    z.zoneName.toLowerCase().includes(lowTerm) ||
                    (z.vehicleTypeName && z.vehicleTypeName.toLowerCase().includes(lowTerm))
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
    }, [zones, keyword, sortBy]);

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
            if (modalMode === "create") {
                await apiRequest("/api/zones", {
                    method: "POST",
                    body: JSON.stringify(formData),
                });
                setAlert({ type: "success", message: `Successfully created zone "${formData.zoneName}".` });
            } else if (modalMode === "edit") {
                await apiRequest(`/api/zones/${selectedZone.id}`, {
                    method: "PUT",
                    body: JSON.stringify(formData),
                });
                setAlert({ type: "success", message: `Successfully updated zone "${formData.zoneName}".` });
            }
            closeFormModal();
            await loadData();
        } catch (err) {
            setAlert({ type: "error", message: err.message || "Failed to save zone changes." });
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
            setAlert({ type: "success", message: `Successfully deleted zone "${deleteZone.zoneName}".` });
            setDeleteZone(null);
            await loadData();
        } catch (err) {
            setAlert({ type: "error", message: err.message || "Failed to delete target zone." });
        } finally {
            setDeleting(false);
        }
    };

    return (
        <AdminLayout>
            <PageHero
                total={zones.length}
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
                    <h3 className="mt-4 font-['Geist'] text-lg font-semibold text-red-800">Cannot load parking zones</h3>
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
                    onClose={() => { if (!deleting) setDeleteZone(null); }}
                    onConfirm={handleConfirmDelete}
                />
            )}
        </AdminLayout>
    );
}