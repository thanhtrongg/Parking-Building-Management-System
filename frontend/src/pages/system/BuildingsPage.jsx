import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { apiRequest } from "../../services/api";

function EmptyState({ title, description, actionLabel, onAction }) {
  return (
    <div className="rounded-[28px] border border-dashed border-slate-300 bg-white/80 px-6 py-10 text-center shadow-sm">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
        <span className="material-symbols-outlined text-4xl">apartment</span>
      </div>
      <h3 className="mt-5 font-['Geist'] text-xl font-semibold text-slate-950">
        {title}
      </h3>
      <p className="mx-auto mt-2 max-w-md font-['Inter'] text-sm leading-6 text-slate-500">
        {description}
      </p>
      {onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 font-['Inter'] text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:-translate-y-0.5 hover:bg-blue-700"
        >
          <span className="material-symbols-outlined text-xl">add</span>
          {actionLabel}
        </button>
      )}
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
        type="button"
        onClick={onClose}
        className="rounded-lg p-1 transition hover:bg-black/5"
      >
        <span className="material-symbols-outlined text-lg">close</span>
      </button>
    </div>
  );
}

function SectionHeader({ title, description, actionLabel, onAction }) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h3 className="font-['Geist'] text-2xl font-black text-slate-950">
          {title}
        </h3>
        <p className="mt-1 font-['Inter'] text-sm text-slate-500">
          {description}
        </p>
      </div>
      {onAction && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-2.5 font-['Inter'] text-sm font-bold text-white shadow-lg shadow-slate-950/20 transition hover:-translate-y-0.5 hover:bg-blue-700"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          {actionLabel}
        </button>
      )}
    </div>
  );
}

function BuildingListItem({
  building,
  isActive,
  onSelect,
  onEdit,
  onDelete,
}) {
  return (
    <article
      className={`rounded-[24px] border p-4 shadow-sm transition ${
        isActive
          ? "border-blue-200 bg-blue-50/80 shadow-blue-100"
          : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-blue-600">
            {building.buildingCode}
          </p>
          <h3 className="mt-1 truncate font-['Geist'] text-xl font-black text-slate-950">
            {building.buildingName}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm text-slate-500">
            {building.address || "No address available"}
          </p>
        </div>
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700">
          {building.status}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-100">
        <div>
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
            Floors
          </p>
          <p className="mt-1 text-lg font-black text-slate-950">
            {building.floorCount}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
            Gates
          </p>
          <p className="mt-1 text-lg font-black text-slate-950">
            {building.gateCount}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onSelect}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
            isActive
              ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700"
              : "border border-slate-200 bg-white text-slate-700 hover:bg-blue-50 hover:text-blue-700"
          }`}
        >
          <span className="material-symbols-outlined text-base">
            {isActive ? "check_circle" : "visibility"}
          </span>
          {isActive ? "Managing" : "Manage"}
        </button>

        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
        >
          <span className="material-symbols-outlined text-base">edit</span>
          Edit
        </button>

        <button
          type="button"
          onClick={onDelete}
          className="inline-flex items-center gap-1.5 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-bold text-red-600 ring-1 ring-red-100 transition hover:bg-red-100"
        >
          <span className="material-symbols-outlined text-base">delete</span>
          Delete
        </button>
      </div>
    </article>
  );
}

function DetailHero({
  building,
  floorCount,
  gateCount,
  onEdit,
  onAddFloor,
  onAddGate,
}) {
  if (!building) return null;

  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
      <div className="relative border-b border-amber-200/70 bg-gradient-to-br from-[#fffaf0] via-[#fff4db] to-[#f4d98b] px-6 py-6 text-slate-950">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-amber-300/35 blur-3xl" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-700">
              Now Managing
            </p>
            <h3 className="mt-2 font-['Geist'] text-3xl font-black">
              {building.buildingName}
            </h3>
            <p className="mt-2 text-sm font-bold text-amber-800">
              {building.buildingCode}
            </p>
            <p className="mt-4 text-sm leading-6 text-slate-700">
              {building.description || building.address || "No building description yet."}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
            <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-sm backdrop-blur">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-700">
                Floors
              </p>
              <p className="mt-1 text-2xl font-black text-slate-950">{floorCount}</p>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-sm backdrop-blur">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-700">
                Gates
              </p>
              <p className="mt-1 text-2xl font-black text-slate-950">{gateCount}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 px-6 py-5 sm:flex-row sm:flex-wrap">
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
        >
          <span className="material-symbols-outlined text-lg">edit</span>
          Edit Building Info
        </button>
        <button
          type="button"
          onClick={onAddFloor}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition hover:-translate-y-0.5 hover:bg-blue-700"
        >
          <span className="material-symbols-outlined text-lg">stairs_2</span>
          Add Floor
        </button>
        <button
          type="button"
          onClick={onAddGate}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-slate-950/20 transition hover:-translate-y-0.5 hover:bg-blue-700"
        >
          <span className="material-symbols-outlined text-lg">door_front</span>
          Add Gate
        </button>
      </div>
    </section>
  );
}

function BuildingFormModal({ initialData, submitting, onClose, onSubmit }) {
  const [form, setForm] = useState({
    buildingCode: initialData?.buildingCode || "",
    buildingName: initialData?.buildingName || "",
    address: initialData?.address || "",
    description: initialData?.description || "",
    status: initialData?.status || "ACTIVE",
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl rounded-[28px] bg-white p-6 shadow-2xl shadow-slate-950/25"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-['Geist'] text-2xl font-black text-slate-950">
              {initialData ? "Edit Building" : "Create Building"}
            </h3>
            <p className="mt-1 font-['Inter'] text-sm text-slate-500">
              Define the parking building before arranging floors, gates, and zones.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">
              Building Code
            </span>
            <input
              value={form.buildingCode}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  buildingCode: event.target.value,
                }))
              }
              required
              className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">
              Building Name
            </span>
            <input
              value={form.buildingName}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  buildingName: event.target.value,
                }))
              }
              required
              className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
            />
          </label>
          <label className="block md:col-span-2">
            <span className="mb-2 block text-sm font-semibold text-slate-700">
              Address
            </span>
            <input
              value={form.address}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  address: event.target.value,
                }))
              }
              className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
            />
          </label>
          <label className="block md:col-span-2">
            <span className="mb-2 block text-sm font-semibold text-slate-700">
              Description
            </span>
            <textarea
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              rows={3}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
            />
          </label>
          <label className="block md:max-w-xs">
            <span className="mb-2 block text-sm font-semibold text-slate-700">
              Status
            </span>
            <select
              value={form.status}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  status: event.target.value,
                }))
              }
              className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 disabled:opacity-60"
          >
            {submitting ? "Saving..." : initialData ? "Update Building" : "Create Building"}
          </button>
        </div>
      </form>
    </div>
  );
}

function FloorFormModal({
  buildings,
  initialData,
  selectedBuildingId,
  submitting,
  onClose,
  onSubmit,
}) {
  const [form, setForm] = useState({
    buildingId: initialData?.buildingId || selectedBuildingId || buildings[0]?.id || "",
    floorCode: initialData?.floorCode || "",
    floorName: initialData?.floorName || "",
    levelNumber: initialData?.levelNumber ?? "",
    description: initialData?.description || "",
    status: initialData?.status || "ACTIVE",
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({
      ...form,
      levelNumber: Number(form.levelNumber),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl rounded-[28px] bg-white p-6 shadow-2xl shadow-slate-950/25"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-['Geist'] text-2xl font-black text-slate-950">
              {initialData ? "Edit Floor" : "Create Floor"}
            </h3>
            <p className="mt-1 font-['Inter'] text-sm text-slate-500">
              Attach each floor to the right building before assigning zones.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">
              Building
            </span>
            <select
              value={form.buildingId}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  buildingId: event.target.value,
                }))
              }
              required
              className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
            >
              {buildings.map((building) => (
                <option key={building.id} value={building.id}>
                  {building.buildingCode} - {building.buildingName}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">
              Floor Code
            </span>
            <input
              value={form.floorCode}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  floorCode: event.target.value,
                }))
              }
              required
              className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">
              Floor Name
            </span>
            <input
              value={form.floorName}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  floorName: event.target.value,
                }))
              }
              required
              className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">
              Level Number
            </span>
            <input
              type="number"
              value={form.levelNumber}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  levelNumber: event.target.value,
                }))
              }
              required
              className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
            />
          </label>
          <label className="block md:col-span-2">
            <span className="mb-2 block text-sm font-semibold text-slate-700">
              Description
            </span>
            <textarea
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              rows={3}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
            />
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 disabled:opacity-60"
          >
            {submitting ? "Saving..." : initialData ? "Update Floor" : "Create Floor"}
          </button>
        </div>
      </form>
    </div>
  );
}

function GateFormModal({
  buildings,
  initialData,
  selectedBuildingId,
  submitting,
  onClose,
  onSubmit,
}) {
  const [form, setForm] = useState({
    buildingId: initialData?.buildingId || selectedBuildingId || buildings[0]?.id || "",
    gateCode: initialData?.gateCode || "",
    gateName: initialData?.gateName || "",
    gateType: initialData?.gateType || "ENTRY",
    locationDescription: initialData?.locationDescription || "",
    status: initialData?.status || "ACTIVE",
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl rounded-[28px] bg-white p-6 shadow-2xl shadow-slate-950/25"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-['Geist'] text-2xl font-black text-slate-950">
              {initialData ? "Edit Gate" : "Create Gate"}
            </h3>
            <p className="mt-1 font-['Inter'] text-sm text-slate-500">
              Maintain entry and exit gates for each building.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">
              Building
            </span>
            <select
              value={form.buildingId}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  buildingId: event.target.value,
                }))
              }
              required
              className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
            >
              {buildings.map((building) => (
                <option key={building.id} value={building.id}>
                  {building.buildingCode} - {building.buildingName}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">
              Gate Code
            </span>
            <input
              value={form.gateCode}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  gateCode: event.target.value,
                }))
              }
              required
              className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">
              Gate Name
            </span>
            <input
              value={form.gateName}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  gateName: event.target.value,
                }))
              }
              required
              className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">
              Gate Type
            </span>
            <select
              value={form.gateType}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  gateType: event.target.value,
                }))
              }
              className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
            >
              <option value="ENTRY">ENTRY</option>
              <option value="EXIT">EXIT</option>
              <option value="BOTH">BOTH</option>
            </select>
          </label>
          <label className="block md:col-span-2">
            <span className="mb-2 block text-sm font-semibold text-slate-700">
              Location Description
            </span>
            <textarea
              value={form.locationDescription}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  locationDescription: event.target.value,
                }))
              }
              rows={3}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
            />
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 disabled:opacity-60"
          >
            {submitting ? "Saving..." : initialData ? "Update Gate" : "Create Gate"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function BuildingsPage() {
  const [buildings, setBuildings] = useState([]);
  const [floors, setFloors] = useState([]);
  const [gates, setGates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ type: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [selectedBuildingId, setSelectedBuildingId] = useState("");
  const [buildingModal, setBuildingModal] = useState(null);
  const [floorModal, setFloorModal] = useState(null);
  const [gateModal, setGateModal] = useState(null);

  const loadData = async () => {
    const [buildingRes, floorRes, gateRes] = await Promise.all([
      apiRequest("/api/buildings"),
      apiRequest("/api/building-floors"),
      apiRequest("/api/building-gates"),
    ]);

    const nextBuildings = buildingRes.data || [];
    setBuildings(nextBuildings);
    setFloors(floorRes.data || []);
    setGates(gateRes.data || []);

    if (!selectedBuildingId && nextBuildings[0]?.id) {
      setSelectedBuildingId(nextBuildings[0].id);
    }

    if (
      selectedBuildingId &&
      !nextBuildings.some((building) => building.id === selectedBuildingId)
    ) {
      setSelectedBuildingId(nextBuildings[0]?.id || "");
    }
  };

  useEffect(() => {
    let ignore = false;

    async function bootstrap() {
      try {
        await loadData();
      } catch (error) {
        if (!ignore) {
          setAlert({
            type: "error",
            message: error.message || "Cannot load building layout data",
          });
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    bootstrap();

    return () => {
      ignore = true;
    };
  }, []);

  const selectedBuilding = useMemo(
    () => buildings.find((building) => building.id === selectedBuildingId) || null,
    [buildings, selectedBuildingId],
  );

  const selectedFloors = useMemo(
    () => floors.filter((floor) => floor.buildingId === selectedBuildingId),
    [floors, selectedBuildingId],
  );

  const selectedGates = useMemo(
    () => gates.filter((gate) => gate.buildingId === selectedBuildingId),
    [gates, selectedBuildingId],
  );

  const submitResource = async (
    url,
    payload,
    currentModal,
    setModal,
    method = "POST",
  ) => {
    try {
      setSubmitting(true);
      await apiRequest(url, {
        method,
        body: JSON.stringify(payload),
      });
      await loadData();
      setModal(null);
      setAlert({
        type: "success",
        message: `${currentModal ? "Updated" : "Created"} successfully`,
      });
    } catch (error) {
      setAlert({
        type: "error",
        message: error.message || "Save failed",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const deleteResource = async (url, label) => {
    const confirmed = window.confirm(`Delete "${label}"?`);
    if (!confirmed) return;

    try {
      await apiRequest(url, { method: "DELETE" });
      await loadData();
      setAlert({
        type: "success",
        message: `Deleted ${label} successfully`,
      });
    } catch (error) {
      setAlert({
        type: "error",
        message: error.message || "Delete failed",
      });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="overflow-hidden rounded-[32px] border border-blue-100 bg-gradient-to-br from-white via-blue-50/80 to-sky-50 p-6 shadow-sm ring-1 ring-white md:p-8">
          <div className="relative">
            <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-blue-200/55 blur-3xl" />
            <div className="absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-cyan-200/40 blur-3xl" />
            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/80 px-3 py-1.5 font-['Inter'] text-xs font-black uppercase tracking-[0.18em] text-blue-600 shadow-sm">
                  <span className="material-symbols-outlined text-base">apartment</span>
                  Building Layout
                </div>
                <h2 className="mt-5 font-['Geist'] text-3xl font-black tracking-tight text-slate-950 md:text-4xl">
                  Building, Floor, and Gate Management
                </h2>
                <p className="mt-3 max-w-3xl font-['Inter'] text-sm leading-6 text-slate-500">
                  Manage each building from a clear control panel. Select a building from the list, then edit its information, floors, and gates in one place.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setBuildingModal({})}
                className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 font-['Inter'] text-sm font-black text-white shadow-lg shadow-blue-600/25 transition hover:-translate-y-0.5 hover:bg-blue-700"
              >
                <span className="material-symbols-outlined text-xl">add</span>
                Add Building
              </button>
            </div>
          </div>
        </div>

        <Alert alert={alert} onClose={() => setAlert({ type: "", message: "" })} />

        {loading ? (
          <div className="rounded-[28px] border border-slate-200 bg-white p-10 text-center shadow-sm">
            <span className="material-symbols-outlined animate-spin text-4xl text-blue-600">
              progress_activity
            </span>
            <p className="mt-4 text-sm font-semibold text-slate-500">
              Loading building layout data...
            </p>
          </div>
        ) : buildings.length === 0 ? (
          <EmptyState
            title="No buildings found"
            description="Create the first building to start organizing floors, gates, zones, and slots."
            actionLabel="Add Building"
            onAction={() => setBuildingModal({})}
          />
        ) : (
          <div className="grid grid-cols-1 gap-8 xl:grid-cols-[360px_minmax(0,1fr)]">
            <aside className="space-y-4">
              <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-blue-600">
                      Building Directory
                    </p>
                    <h3 className="mt-2 font-['Geist'] text-2xl font-black text-slate-950">
                      Choose a Building
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      Click the clear `Manage` button on any building card to open its details on the right.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-blue-50 px-3 py-2 text-sm font-black text-blue-700">
                    {buildings.length} total
                  </div>
                </div>
              </section>

              <div className="space-y-4">
                {buildings.map((building) => (
                  <BuildingListItem
                    key={building.id}
                    building={building}
                    isActive={building.id === selectedBuildingId}
                    onSelect={() => setSelectedBuildingId(building.id)}
                    onEdit={() => setBuildingModal(building)}
                    onDelete={() =>
                      deleteResource(`/api/buildings/${building.id}`, building.buildingName)
                    }
                  />
                ))}
              </div>
            </aside>

            <div className="space-y-8">
              <DetailHero
                building={selectedBuilding}
                floorCount={selectedFloors.length}
                gateCount={selectedGates.length}
                onEdit={() => setBuildingModal(selectedBuilding)}
                onAddFloor={() => setFloorModal({})}
                onAddGate={() => setGateModal({})}
              />

              {selectedBuilding && (
                <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
                  <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                    <SectionHeader
                      title={`Floors of ${selectedBuilding.buildingName}`}
                      description="Manage levels for this building. Use Add Floor or edit any row below."
                      actionLabel="Add Floor"
                      onAction={() => setFloorModal({})}
                    />
                    {selectedFloors.length === 0 ? (
                      <EmptyState
                        title="No floors yet"
                        description="Create the first floor for this building."
                      />
                    ) : (
                      <div className="space-y-3">
                        {selectedFloors.map((floor) => (
                          <div
                            key={floor.id}
                            className="rounded-3xl border border-slate-200 bg-slate-50 p-4"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
                                  {floor.floorCode}
                                </p>
                                <h4 className="mt-1 font-['Geist'] text-xl font-black text-slate-950">
                                  {floor.floorName}
                                </h4>
                                <p className="mt-2 text-sm text-slate-500">
                                  Level {floor.levelNumber} | {floor.zoneCount} zones
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => setFloorModal(floor)}
                                  className="rounded-2xl p-2 text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
                                >
                                  <span className="material-symbols-outlined">edit</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    deleteResource(`/api/building-floors/${floor.id}`, floor.floorName)
                                  }
                                  className="rounded-2xl p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                                >
                                  <span className="material-symbols-outlined">delete</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>

                  <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                    <SectionHeader
                      title={`Gates of ${selectedBuilding.buildingName}`}
                      description="Manage entry and exit points. Use Add Gate or edit any row below."
                      actionLabel="Add Gate"
                      onAction={() => setGateModal({})}
                    />
                    {selectedGates.length === 0 ? (
                      <EmptyState
                        title="No gates yet"
                        description="Create entry and exit gates for this building."
                      />
                    ) : (
                      <div className="space-y-3">
                        {selectedGates.map((gate) => (
                          <div
                            key={gate.id}
                            className="rounded-3xl border border-slate-200 bg-slate-50 p-4"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
                                  {gate.gateCode}
                                </p>
                                <h4 className="mt-1 font-['Geist'] text-xl font-black text-slate-950">
                                  {gate.gateName}
                                </h4>
                                <p className="mt-2 text-sm text-slate-500">
                                  {gate.gateType} | {gate.locationDescription || "No location description"}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => setGateModal(gate)}
                                  className="rounded-2xl p-2 text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
                                >
                                  <span className="material-symbols-outlined">edit</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    deleteResource(`/api/building-gates/${gate.id}`, gate.gateName)
                                  }
                                  className="rounded-2xl p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                                >
                                  <span className="material-symbols-outlined">delete</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                </div>
              )}
            </div>
          </div>
        )}

        {buildingModal && (
          <BuildingFormModal
            initialData={buildingModal.id ? buildingModal : null}
            submitting={submitting}
            onClose={() => setBuildingModal(null)}
            onSubmit={(payload) =>
              submitResource(
                buildingModal.id ? `/api/buildings/${buildingModal.id}` : "/api/buildings",
                payload,
                buildingModal.id,
                setBuildingModal,
                buildingModal.id ? "PUT" : "POST",
              )
            }
          />
        )}

        {floorModal && (
          <FloorFormModal
            buildings={buildings}
            initialData={floorModal.id ? floorModal : null}
            selectedBuildingId={selectedBuildingId}
            submitting={submitting}
            onClose={() => setFloorModal(null)}
            onSubmit={(payload) =>
              submitResource(
                floorModal.id
                  ? `/api/building-floors/${floorModal.id}`
                  : "/api/building-floors",
                payload,
                floorModal.id,
                setFloorModal,
                floorModal.id ? "PUT" : "POST",
              )
            }
          />
        )}

        {gateModal && (
          <GateFormModal
            buildings={buildings}
            initialData={gateModal.id ? gateModal : null}
            selectedBuildingId={selectedBuildingId}
            submitting={submitting}
            onClose={() => setGateModal(null)}
            onSubmit={(payload) =>
              submitResource(
                gateModal.id ? `/api/building-gates/${gateModal.id}` : "/api/building-gates",
                payload,
                gateModal.id,
                setGateModal,
                gateModal.id ? "PUT" : "POST",
              )
            }
          />
        )}
      </div>
    </AdminLayout>
  );
}
