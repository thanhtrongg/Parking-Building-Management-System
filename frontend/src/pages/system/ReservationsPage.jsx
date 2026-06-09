import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { apiRequest } from "../../services/api";

const RESERVATION_STATUSES = [
  "CONFIRMED",
  "CHECKED_IN",
  "CANCELLED",
  "COMPLETED",
];

const ACTIVE_STATUSES = ["CONFIRMED", "CHECKED_IN"];

const decodeJwtPayload = (token) => {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;

    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((char) => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join(""),
    );

    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

const getStoredUserRole = () => {
  const directRole = localStorage.getItem("role");
  if (directRole) return directRole.toUpperCase();

  const userStorageKeys = [
    "user",
    "currentUser",
    "authUser",
    "profile",
    "auth",
  ];

  for (const key of userStorageKeys) {
    try {
      const value = localStorage.getItem(key);
      if (!value) continue;

      const parsedValue = JSON.parse(value);
      const role =
        parsedValue?.role ||
        parsedValue?.user?.role ||
        parsedValue?.data?.role ||
        parsedValue?.data?.user?.role;

      if (role) return role.toUpperCase();
    } catch {
      // Ignore invalid localStorage JSON.
    }
  }

  const tokenKeys = ["token", "accessToken", "authToken"];

  for (const key of tokenKeys) {
    const token = localStorage.getItem(key);
    const payload = token ? decodeJwtPayload(token) : null;
    const role = payload?.role || payload?.user?.role;

    if (role) return role.toUpperCase();
  }

  return "";
};

const statusConfig = {
  CONFIRMED: {
    label: "Confirmed",
    description: "Slot is reserved",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
    icon: "event_available",
  },
  CHECKED_IN: {
    label: "Checked in",
    description: "User has arrived",
    className: "bg-blue-50 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
    icon: "login",
  },
  CANCELLED: {
    label: "Cancelled",
    description: "Reservation cancelled",
    className: "bg-rose-50 text-rose-700 border-rose-200",
    dot: "bg-rose-500",
    icon: "event_busy",
  },
  COMPLETED: {
    label: "Completed",
    description: "Reservation completed",
    className: "bg-violet-50 text-violet-700 border-violet-200",
    dot: "bg-violet-500",
    icon: "task_alt",
  },
};

const initialForm = {
  parkingSlotId: "",
  vehicleTypeId: "",
  startTime: "",
  endTime: "",
  status: "CONFIRMED",
  licensePlate: "",
};

function getStatusMeta(status) {
  return (
    statusConfig[status] || {
      label: status || "Unknown",
      description: "Unknown status",
      className: "bg-slate-50 text-slate-700 border-slate-200",
      dot: "bg-slate-400",
      icon: "help",
    }
  );
}

function getApiData(result) {
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.data)) return result.data;
  return [];
}

function getApiItem(result) {
  return result?.data || result;
}

function toDateTimeLocalValue(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const timezoneOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
}

function toIsoDateTime(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toISOString();
}

function formatDateTime(value) {
  if (!value) return "N/A";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatDate(value) {
  if (!value) return "N/A";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";

  return new Intl.DateTimeFormat("vi-VN", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function formatTime(value) {
  if (!value) return "N/A";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";

  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatTimeRange(start, end) {
  if (!start || !end) return "N/A";
  return `${formatTime(start)} - ${formatTime(end)}`;
}

function getDurationHours(start, end) {
  if (!start || !end) return null;

  const startDate = new Date(start);
  const endDate = new Date(end);

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return null;
  }

  const diffMs = endDate.getTime() - startDate.getTime();
  if (diffMs <= 0) return null;

  return Math.round((diffMs / (1000 * 60 * 60)) * 10) / 10;
}

function getInitials(name) {
  if (!name) return "GU";

  return name
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
}

function normalizeSlot(slot) {
  const zone = slot.zone || slot.zones || {};
  const vehicleType =
    slot.vehicleType ||
    slot.vehicle_type ||
    slot.vehicle_types ||
    zone.vehicleType ||
    zone.vehicle_type ||
    zone.vehicle_types ||
    {};

  return {
    id: slot.id,
    slotName: slot.slotName || slot.slot_name || "Unnamed slot",
    status: slot.status || "UNKNOWN",
    zoneId: slot.zoneId || slot.zone_id || zone.id || "",
    zoneName: zone.zoneName || zone.zone_name || slot.zoneName || "No zone",
    vehicleTypeId:
      slot.vehicleTypeId ||
      slot.vehicle_type_id ||
      zone.vehicleTypeId ||
      zone.vehicle_type_id ||
      vehicleType.id ||
      "",
    vehicleTypeName:
      vehicleType.typeName ||
      vehicleType.type_name ||
      slot.vehicleTypeName ||
      slot.vehicle_type_name ||
      "N/A",
  };
}

function normalizeVehicleType(vehicleType) {
  return {
    id: vehicleType.id,
    typeName: vehicleType.typeName || vehicleType.type_name || "Unnamed type",
    description: vehicleType.description || "",
  };
}

function normalizeReservation(reservation) {
  const parkingSlot =
    reservation.parkingSlot ||
    reservation.parking_slot ||
    reservation.parking_slots ||
    {};

  const slotZone = parkingSlot.zone || parkingSlot.zones || {};
  const user = reservation.user || reservation.users || {};

  const vehicleType =
    reservation.vehicleType ||
    reservation.vehicle_type ||
    reservation.vehicle_types ||
    parkingSlot.vehicleType ||
    parkingSlot.vehicle_type ||
    parkingSlot.vehicle_types ||
    slotZone.vehicleType ||
    slotZone.vehicle_type ||
    slotZone.vehicle_types ||
    {};

  const id = reservation.id;

  const expectedStartTime =
    reservation.startTime ||
    reservation.expectedStartTime ||
    reservation.expected_start_time ||
    reservation.expected_start;

  const expectedEndTime =
    reservation.endTime ||
    reservation.expectedEndTime ||
    reservation.expected_end_time ||
    reservation.expected_end;

  const customerName =
    user.fullName ||
    user.full_name ||
    reservation.fullName ||
    reservation.full_name ||
    reservation.customerName ||
    reservation.customer_name ||
    "Guest User";

  const customerEmail =
    user.email || reservation.email || reservation.customerEmail || "";

  const customerPhone =
    user.phone || reservation.phone || reservation.customerPhone || "";

  const slotName =
    parkingSlot.slotName ||
    parkingSlot.slot_name ||
    reservation.slotName ||
    reservation.slot_name ||
    "Not assigned";

  const zoneName =
    slotZone.zoneName ||
    slotZone.zone_name ||
    parkingSlot.zoneName ||
    parkingSlot.zone_name ||
    reservation.zoneName ||
    reservation.zone_name ||
    "No zone";

  const vehicleTypeName =
    vehicleType.typeName ||
    vehicleType.type_name ||
    reservation.vehicleTypeName ||
    reservation.vehicle_type_name ||
    "N/A";

  const status = reservation.status || "UNKNOWN";
  const durationHours = getDurationHours(expectedStartTime, expectedEndTime);

  return {
    raw: reservation,
    id,
    displayId: id ? id.slice(0, 8).toUpperCase() : "N/A",
    userId: reservation.userId || reservation.user_id || user.id || "",
    customerName,
    customerEmail,
    customerPhone,
    parkingSlotId:
      reservation.parkingSlotId ||
      reservation.parking_slot_id ||
      parkingSlot.id ||
      "",
    slotName,
    zoneName,
    vehicleTypeId:
      reservation.vehicleTypeId ||
      reservation.vehicle_type_id ||
      vehicleType.id ||
      "",
    vehicleTypeName,
    status,
    expectedStartTime,
    expectedEndTime,
    createdAt:
      reservation.createdAt || reservation.created_at || reservation.created,
    updatedAt:
      reservation.updatedAt || reservation.updated_at || reservation.updated,
    durationHours,
  };
}

function PageHeader() {
  return (
    <div className="mb-8 overflow-hidden rounded-3xl border border-[#d7d9e4] bg-white shadow-sm">
      <div className="relative p-7">
        <div className="absolute right-0 top-0 h-32 w-32 rounded-bl-full bg-blue-50" />
        <div className="absolute bottom-0 right-24 h-20 w-20 rounded-full bg-amber-50" />

        <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 font-['Inter'] text-xs font-semibold text-blue-700">
              <span className="material-symbols-outlined text-[16px]">
                event_seat
              </span>
              Reservation CRUD API
            </div>

            <h2 className="font-['Geist'] text-3xl font-bold tracking-tight text-[#191b23]">
              Reservation Management
            </h2>

            <p className="mt-2 max-w-3xl font-['Inter'] text-sm leading-6 text-[#6b7280]">
              Quản lý lịch đặt chỗ gửi xe, kiểm tra trùng lịch, trạng thái đặt
              chỗ và thông tin user, slot, zone, vehicle type từ backend.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 rounded-2xl border border-[#eceef5] bg-[#f8f9fc] p-3">
            <FlowStep icon="person" label="User" />
            <FlowStep icon="event_available" label="Reserve" />
            <FlowStep icon="local_parking" label="Slot" />
          </div>
        </div>
      </div>
    </div>
  );
}

function FlowStep({ icon, label }) {
  return (
    <div className="flex min-w-20 flex-col items-center justify-center rounded-xl bg-white px-4 py-3 text-center shadow-sm">
      <span className="material-symbols-outlined text-[22px] text-[#2563eb]">
        {icon}
      </span>
      <span className="mt-1 font-['Inter'] text-xs font-semibold text-[#374151]">
        {label}
      </span>
    </div>
  );
}

function SummaryCard({ title, value, subtitle, icon, className }) {
  return (
    <div className="rounded-2xl border border-[#d7d9e4] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-['Geist'] text-[11px] font-semibold uppercase tracking-wider text-[#6b7280]">
            {title}
          </p>

          <h3 className="mt-2 font-['Geist'] text-3xl font-bold text-[#191b23]">
            {value}
          </h3>

          <p className="mt-1 font-['Inter'] text-xs text-[#6b7280]">
            {subtitle}
          </p>
        </div>

        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${className}`}
        >
          <span className="material-symbols-outlined text-[24px]">{icon}</span>
        </div>
      </div>
    </div>
  );
}

function StatsGrid({ reservations }) {
  const total = reservations.length;
  const confirmed = reservations.filter(
    (item) => item.status === "CONFIRMED",
  ).length;
  const checkedIn = reservations.filter(
    (item) => item.status === "CHECKED_IN",
  ).length;
  const completed = reservations.filter(
    (item) => item.status === "COMPLETED",
  ).length;
  const activeReservations = reservations.filter((item) =>
    ACTIVE_STATUSES.includes(item.status),
  ).length;

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <SummaryCard
        title="Total"
        value={total}
        subtitle="All reservations"
        icon="event_note"
        className="bg-slate-100 text-slate-700"
      />
      <SummaryCard
        title="Active"
        value={activeReservations}
        subtitle="Confirmed + checked-in"
        icon="local_parking"
        className="bg-blue-50 text-blue-700"
      />
      <SummaryCard
        title="Confirmed"
        value={confirmed}
        subtitle="Slot already held"
        icon="event_available"
        className="bg-emerald-50 text-emerald-700"
      />
      <SummaryCard
        title="Done"
        value={completed + checkedIn}
        subtitle={`${checkedIn} checked-in, ${completed} completed`}
        icon="task_alt"
        className="bg-violet-50 text-violet-700"
      />
    </div>
  );
}

function StatusBadge({ status }) {
  const meta = getStatusMeta(status);

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 font-['Geist'] text-[11px] font-semibold ${meta.className}`}
    >
      <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
}

function Alert({ type = "info", message, onClose }) {
  if (!message) return null;

  const config =
    type === "error"
      ? "border-rose-200 bg-rose-50 text-rose-700"
      : "border-emerald-200 bg-emerald-50 text-emerald-700";

  return (
    <div
      className={`mb-5 flex items-center justify-between gap-4 rounded-2xl border px-5 py-4 font-['Inter'] text-sm ${config}`}
    >
      <span>{message}</span>
      <button onClick={onClose} className="font-semibold hover:opacity-70">
        Close
      </button>
    </div>
  );
}

function FilterToolbar({
  keyword,
  setKeyword,
  selectedStatus,
  setSelectedStatus,
  selectedVehicleType,
  setSelectedVehicleType,
  selectedZone,
  setSelectedZone,
  vehicleTypes,
  zones,
  filteredCount,
  onResetFilters,
}) {
  return (
    <div className="mb-6 rounded-2xl border border-[#d7d9e4] bg-white shadow-sm">
      <div className="border-b border-[#eceef5] px-5 py-4">
        <div className="flex flex-col justify-between gap-2 lg:flex-row lg:items-center">
          <div>
            <h3 className="font-['Geist'] text-base font-semibold text-[#191b23]">
              Reservation Filters
            </h3>
            <p className="mt-1 font-['Inter'] text-xs text-[#6b7280]">
              Tìm theo khách hàng, email, slot, zone hoặc loại xe.
            </p>
          </div>

          <div className="font-['Inter'] text-sm text-[#6b7280]">
            Showing{" "}
            <span className="font-semibold text-[#191b23]">
              {filteredCount}
            </span>{" "}
            reservation(s)
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 p-5 md:grid-cols-2 xl:grid-cols-[1.5fr_1fr_1fr_1fr_auto]">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]">
            search
          </span>
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Search customer, email, phone, slot..."
            className="h-11 w-full rounded-xl border border-[#d7d9e4] bg-[#f8f9fc] pl-11 pr-4 font-['Inter'] text-sm outline-none transition focus:border-[#2563eb] focus:bg-white"
          />
        </div>

        <select
          value={selectedStatus}
          onChange={(event) => setSelectedStatus(event.target.value)}
          className="h-11 rounded-xl border border-[#d7d9e4] bg-[#f8f9fc] px-4 font-['Inter'] text-sm outline-none transition focus:border-[#2563eb]"
        >
          <option value="ALL">All Status</option>
          {RESERVATION_STATUSES.map((status) => (
            <option key={status} value={status}>
              {getStatusMeta(status).label}
            </option>
          ))}
        </select>

        <select
          value={selectedVehicleType}
          onChange={(event) => setSelectedVehicleType(event.target.value)}
          className="h-11 rounded-xl border border-[#d7d9e4] bg-[#f8f9fc] px-4 font-['Inter'] text-sm outline-none transition focus:border-[#2563eb]"
        >
          <option value="ALL">All Vehicle Types</option>
          {vehicleTypes.map((vehicleType) => (
            <option key={vehicleType} value={vehicleType}>
              {vehicleType}
            </option>
          ))}
        </select>

        <select
          value={selectedZone}
          onChange={(event) => setSelectedZone(event.target.value)}
          className="h-11 rounded-xl border border-[#d7d9e4] bg-[#f8f9fc] px-4 font-['Inter'] text-sm outline-none transition focus:border-[#2563eb]"
        >
          <option value="ALL">All Zones</option>
          {zones.map((zone) => (
            <option key={zone} value={zone}>
              {zone}
            </option>
          ))}
        </select>

        <button
          onClick={onResetFilters}
          className="h-11 rounded-xl border border-[#d7d9e4] bg-white px-4 font-['Inter'] text-sm font-semibold text-[#374151] transition hover:bg-[#f8f9fc]"
        >
          Reset
        </button>
      </div>
    </div>
  );
}

function ReservationTimeline({ reservation }) {
  return (
    <div className="flex min-w-47.5 items-center gap-3">
      <div className="flex flex-col items-center">
        <span className="h-2.5 w-2.5 rounded-full bg-[#2563eb]" />
        <span className="h-8 w-px bg-[#d7d9e4]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#191b23]" />
      </div>

      <div>
        <p className="font-['Inter'] text-sm font-semibold text-[#191b23]">
          {formatDate(reservation.expectedStartTime)}
        </p>
        <p className="mt-1 font-['Inter'] text-xs text-[#6b7280]">
          {formatTimeRange(
            reservation.expectedStartTime,
            reservation.expectedEndTime,
          )}
        </p>
        <p className="mt-1 font-['Inter'] text-xs font-medium text-[#2563eb]">
          {reservation.durationHours
            ? `${reservation.durationHours} hours`
            : "No duration"}
        </p>
      </div>
    </div>
  );
}

function ReservationRow({ reservation, onView, onEdit, onCancel }) {
  const meta = getStatusMeta(reservation.status);
  const canCancel = !["CHECKED_IN", "COMPLETED", "CANCELLED"].includes(
    reservation.status,
  );

  return (
    <tr className="transition hover:bg-[#fafbff]">
      <td className="px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#eef3ff] font-['Geist'] text-sm font-bold text-[#2563eb]">
            {getInitials(reservation.customerName)}
          </div>

          <div>
            <p className="font-['Inter'] text-sm font-semibold text-[#191b23]">
              {reservation.customerName}
            </p>
            <p className="mt-1 font-['Inter'] text-xs text-[#6b7280]">
              {reservation.customerEmail ||
                reservation.customerPhone ||
                "No contact"}
            </p>
          </div>
        </div>
      </td>

      <td className="px-6 py-5">
        <div>
          <p className="font-mono text-[13px] font-bold text-[#2563eb]">
            RSV-{reservation.displayId}
          </p>
          <p className="mt-1 font-['Inter'] text-xs text-[#6b7280]">
            Created {formatDateTime(reservation.createdAt)}
          </p>
        </div>
      </td>

      <td className="px-6 py-5">
        <div className="inline-flex min-w-32.5 items-center gap-2 rounded-xl bg-[#eef3ff] px-3 py-2">
          <span className="material-symbols-outlined text-[18px] text-[#2563eb]">
            local_parking
          </span>
          <div>
            <p className="font-['Inter'] text-sm font-bold text-[#2563eb]">
              {reservation.slotName}
            </p>
            <p className="font-['Inter'] text-[11px] text-[#6b7280]">
              Reserved slot
            </p>
          </div>
        </div>
      </td>

      <td className="px-6 py-5">
        <div>
          <p className="font-['Inter'] text-sm font-semibold text-[#191b23]">
            {reservation.vehicleTypeName}
          </p>
          <p className="mt-1 max-w-60 truncate font-['Inter'] text-xs text-[#6b7280]">
            {reservation.zoneName}
          </p>
        </div>
      </td>

      <td className="px-6 py-5">
        <ReservationTimeline reservation={reservation} />
      </td>

      <td className="px-6 py-5">
        <div>
          <StatusBadge status={reservation.status} />
          <p className="mt-2 font-['Inter'] text-xs text-[#6b7280]">
            {meta.description}
          </p>
        </div>
      </td>

      <td className="px-6 py-5 text-right">
        <div className="flex items-center justify-end gap-1">
          <button
            title="View details"
            onClick={() => onView(reservation)}
            className="rounded-lg p-2 text-[#6b7280] transition hover:bg-[#f3f4f8] hover:text-[#2563eb]"
          >
            <span className="material-symbols-outlined text-[20px]">
              visibility
            </span>
          </button>

          <button
            title="Edit reservation"
            onClick={() => onEdit(reservation)}
            className="rounded-lg p-2 text-[#6b7280] transition hover:bg-[#f3f4f8] hover:text-[#2563eb]"
          >
            <span className="material-symbols-outlined text-[20px]">edit</span>
          </button>

          <button
            title="Cancel reservation"
            disabled={!canCancel}
            onClick={() => onCancel(reservation)}
            className="rounded-lg p-2 text-[#6b7280] transition hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <span className="material-symbols-outlined text-[20px]">
              event_busy
            </span>
          </button>
        </div>
      </td>
    </tr>
  );
}

function LoadingState() {
  return (
    <div className="rounded-2xl border border-[#d7d9e4] bg-white p-10 shadow-sm">
      <div className="mx-auto flex max-w-md flex-col items-center text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
          <span className="material-symbols-outlined animate-pulse text-3xl text-[#2563eb]">
            event_note
          </span>
        </div>
        <h3 className="mt-4 font-['Geist'] text-lg font-semibold text-[#191b23]">
          Loading reservations
        </h3>
        <p className="mt-2 font-['Inter'] text-sm text-[#6b7280]">
          Fetching reservation data from backend API...
        </p>
      </div>
    </div>
  );
}

function ErrorState({ error }) {
  return (
    <div className="rounded-2xl border border-rose-200 bg-rose-50 p-10 shadow-sm">
      <div className="mx-auto flex max-w-md flex-col items-center text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white">
          <span className="material-symbols-outlined text-3xl text-rose-600">
            error
          </span>
        </div>
        <h3 className="mt-4 font-['Geist'] text-lg font-semibold text-rose-700">
          Cannot load reservations
        </h3>
        <p className="mt-2 font-['Inter'] text-sm text-rose-600">{error}</p>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-[#d7d9e4] bg-white p-10 shadow-sm">
      <div className="mx-auto flex max-w-md flex-col items-center text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f8f9fc]">
          <span className="material-symbols-outlined text-3xl text-[#6b7280]">
            event_busy
          </span>
        </div>
        <h3 className="mt-4 font-['Geist'] text-lg font-semibold text-[#191b23]">
          No reservations found
        </h3>
        <p className="mt-2 font-['Inter'] text-sm text-[#6b7280]">
          Không có reservation nào khớp với bộ lọc hiện tại.
        </p>
      </div>
    </div>
  );
}

function ReservationsTable({
  reservations,
  loading,
  error,
  onView,
  onEdit,
  onCancel,
}) {
  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;
  if (reservations.length === 0) return <EmptyState />;

  return (
    <div className="overflow-hidden rounded-2xl border border-[#d7d9e4] bg-white shadow-sm">
      <div className="border-b border-[#eceef5] px-6 py-5">
        <div className="flex flex-col justify-between gap-2 lg:flex-row lg:items-center">
          <div>
            <h3 className="font-['Geist'] text-lg font-semibold text-[#191b23]">
              Reservation List
            </h3>
            <p className="mt-1 font-['Inter'] text-sm text-[#6b7280]">
              Danh sách người dùng đang đặt trước slot gửi xe.
            </p>
          </div>

          <div className="rounded-full bg-[#f8f9fc] px-4 py-2 font-['Inter'] text-sm font-medium text-[#374151]">
            {reservations.length} result(s)
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left">
          <thead className="bg-[#f7f8fc]">
            <tr>
              {[
                "Customer",
                "Reservation",
                "Reserved Slot",
                "Vehicle / Zone",
                "Schedule",
                "Status",
                "Actions",
              ].map((heading) => (
                <th
                  key={heading}
                  className={`whitespace-nowrap px-6 py-4 font-['Geist'] text-[11px] font-semibold uppercase tracking-wider text-[#6b7280] ${
                    heading === "Actions" ? "text-right" : ""
                  }`}
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-[#eceef5]">
            {reservations.map((reservation) => (
              <ReservationRow
                key={reservation.id}
                reservation={reservation}
                onView={onView}
                onEdit={onEdit}
                onCancel={onCancel}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ReservationInsight({ reservations }) {
  const active = reservations.filter((item) =>
    ACTIVE_STATUSES.includes(item.status),
  );

  const byVehicleType = active.reduce((acc, item) => {
    acc[item.vehicleTypeName] = (acc[item.vehicleTypeName] || 0) + 1;
    return acc;
  }, {});

  const topVehicleTypes = Object.entries(byVehicleType)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
      <div className="rounded-2xl border border-[#d7d9e4] bg-white p-5 shadow-sm xl:col-span-2">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-['Geist'] text-base font-semibold text-[#191b23]">
              Active Reservation Flow
            </h3>
            <p className="mt-1 font-['Inter'] text-xs text-[#6b7280]">
              Confirmed and checked-in reservations are active records and
              must not overlap in the same parking slot.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <FlowInfoCard
            icon="person_add"
            title="User creates booking"
            text="Khách chọn loại xe, thời gian và slot phù hợp."
          />
          <FlowInfoCard
            icon="event_available"
            title="Backend validates"
            text="API kiểm tra slot tồn tại, trạng thái slot và trùng lịch."
          />
          <FlowInfoCard
            icon="local_parking"
            title="Staff operates"
            text="Staff có thể cập nhật trạng thái check-in/cancel/completed."
          />
        </div>
      </div>

      <div className="rounded-2xl border border-[#d7d9e4] bg-white p-5 shadow-sm">
        <h3 className="font-['Geist'] text-base font-semibold text-[#191b23]">
          Active by Vehicle Type
        </h3>

        <div className="mt-4 space-y-3">
          {topVehicleTypes.length === 0 ? (
            <p className="font-['Inter'] text-sm text-[#6b7280]">
              No active reservation data.
            </p>
          ) : (
            topVehicleTypes.map(([vehicleType, count]) => (
              <div
                key={vehicleType}
                className="flex items-center justify-between rounded-xl bg-[#f8f9fc] px-4 py-3"
              >
                <span className="font-['Inter'] text-sm font-medium text-[#374151]">
                  {vehicleType}
                </span>
                <span className="rounded-full bg-white px-3 py-1 font-['Geist'] text-xs font-bold text-[#2563eb] shadow-sm">
                  {count}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function FlowInfoCard({ icon, title, text }) {
  return (
    <div className="rounded-2xl border border-[#eceef5] bg-[#f8f9fc] p-4">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
        <span className="material-symbols-outlined text-[22px] text-[#2563eb]">
          {icon}
        </span>
      </div>
      <h4 className="font-['Inter'] text-sm font-semibold text-[#191b23]">
        {title}
      </h4>
      <p className="mt-1 font-['Inter'] text-xs leading-5 text-[#6b7280]">
        {text}
      </p>
    </div>
  );
}

function ModalShell({ title, subtitle, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-[#eceef5] px-6 py-5">
          <div>
            <h3 className="font-['Geist'] text-xl font-bold text-[#191b23]">
              {title}
            </h3>
            {subtitle ? (
              <p className="mt-1 font-['Inter'] text-sm text-[#6b7280]">
                {subtitle}
              </p>
            ) : null}
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-[#6b7280] transition hover:bg-[#f3f4f8] hover:text-[#191b23]"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function ReservationFormModal({
  mode,
  form,
  setForm,
  slots,
  vehicleTypes,
  submitting,
  isStaffEdit,
  onSubmit,
  onClose,
}) {
  const selectedSlot = slots.find((slot) => slot.id === form.parkingSlotId);

  const availableSlots = slots.filter((slot) => {
    if (mode === "edit" && slot.id === form.parkingSlotId) return true;
    return !["OCCUPIED", "MAINTENANCE"].includes(slot.status);
  });

  return (
    <ModalShell
      title={mode === "create" ? "New Reservation" : "Edit Reservation"}
      subtitle="Dữ liệu gửi lên backend dùng camelCase, controller sẽ map sang Prisma snake_case."
      onClose={onClose}
    >
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block font-['Inter'] text-sm font-semibold text-[#374151]">
              Parking Slot <span className="text-rose-600">*</span>
            </label>
            <select
              value={form.parkingSlotId}
              onChange={(event) => {
                const nextSlot = slots.find(
                  (slot) => slot.id === event.target.value,
                );

                setForm((prev) => ({
                  ...prev,
                  parkingSlotId: event.target.value,
                  vehicleTypeId: nextSlot?.vehicleTypeId || prev.vehicleTypeId,
                }));
              }}
              disabled={false}
              className="h-12 w-full rounded-xl border border-[#d7d9e4] bg-[#f8f9fc] px-4 font-['Inter'] text-sm outline-none transition focus:border-[#2563eb] focus:bg-white disabled:cursor-not-allowed disabled:opacity-70"
              required
            >
              <option value="">Select parking slot</option>
              {availableSlots.map((slot) => (
                <option key={slot.id} value={slot.id}>
                  {slot.slotName} - {slot.zoneName} - {slot.status}
                </option>
              ))}
            </select>
            <p className="mt-2 font-['Inter'] text-xs text-[#6b7280]">
              Chỉ chọn slot thật lấy từ GET /api/parking-slots, không dùng
              placeholder.
            </p>
          </div>

          <div>
            <label className="mb-2 block font-['Inter'] text-sm font-semibold text-[#374151]">
              Vehicle Type <span className="text-rose-600">*</span>
            </label>
            <select
              value={form.vehicleTypeId}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  vehicleTypeId: event.target.value,
                }))
              }
              disabled={isStaffEdit}
              className="h-12 w-full rounded-xl border border-[#d7d9e4] bg-[#f8f9fc] px-4 font-['Inter'] text-sm outline-none transition focus:border-[#2563eb] focus:bg-white disabled:cursor-not-allowed disabled:opacity-70"
              required
            >
              <option value="">Select vehicle type</option>
              {vehicleTypes.map((vehicleType) => (
                <option key={vehicleType.id} value={vehicleType.id}>
                  {vehicleType.typeName}
                </option>
              ))}
            </select>
            {selectedSlot?.vehicleTypeName &&
            selectedSlot.vehicleTypeName !== "N/A" ? (
              <p className="mt-2 font-['Inter'] text-xs text-[#6b7280]">
                Slot này thuộc loại xe: {selectedSlot.vehicleTypeName}
              </p>
            ) : null}
          </div>

          <div>
            <label className="mb-2 block font-['Inter'] text-sm font-semibold text-[#374151]">
              Start Time <span className="text-rose-600">*</span>
            </label>
            <input
              type="datetime-local"
              value={form.startTime}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, startTime: event.target.value }))
              }
              disabled={isStaffEdit}
              className="h-12 w-full rounded-xl border border-[#d7d9e4] bg-[#f8f9fc] px-4 font-['Inter'] text-sm outline-none transition focus:border-[#2563eb] focus:bg-white disabled:cursor-not-allowed disabled:opacity-70"
              required
            />
          </div>

          <div>
            <label className="mb-2 block font-['Inter'] text-sm font-semibold text-[#374151]">
              End Time <span className="text-rose-600">*</span>
            </label>
            <input
              type="datetime-local"
              value={form.endTime}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, endTime: event.target.value }))
              }
              disabled={isStaffEdit}
              className="h-12 w-full rounded-xl border border-[#d7d9e4] bg-[#f8f9fc] px-4 font-['Inter'] text-sm outline-none transition focus:border-[#2563eb] focus:bg-white disabled:cursor-not-allowed disabled:opacity-70"
              required
            />
          </div>

          {mode === "edit" ? (
            <div>
              <label className="mb-2 block font-['Inter'] text-sm font-semibold text-[#374151]">
                Status
              </label>
              <select
                value={form.status}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, status: event.target.value }))
                }
                className="h-12 w-full rounded-xl border border-[#d7d9e4] bg-[#f8f9fc] px-4 font-['Inter'] text-sm outline-none transition focus:border-[#2563eb] focus:bg-white"
              >
                {RESERVATION_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {getStatusMeta(status).label}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          {mode === "edit" && form.status === "CHECKED_IN" ? (
            <div>
              <label className="mb-2 block font-['Inter'] text-sm font-semibold text-[#374151]">
                License Plate <span className="text-rose-600">*</span>
              </label>
              <input
                value={form.licensePlate}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    licensePlate: event.target.value,
                  }))
                }
                placeholder="Example: 59A-12345"
                className="h-12 w-full rounded-xl border border-[#d7d9e4] bg-[#f8f9fc] px-4 font-['Inter'] text-sm uppercase outline-none transition focus:border-[#2563eb] focus:bg-white"
                required
              />
            </div>
          ) : null}
        </div>

        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 font-['Inter'] text-sm text-blue-700">
          Khi chuyển sang CHECKED_IN, hệ thống sẽ tạo parking session từ thời
          điểm hiện tại. Nếu slot đã đặt đang bận, chọn slot khác còn trống để
          xếp xe thực tế.
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[#d7d9e4] bg-white px-5 py-2.5 font-['Inter'] text-sm font-semibold text-[#374151] transition hover:bg-[#f8f9fc]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-[#2563eb] px-5 py-2.5 font-['Inter'] text-sm font-semibold text-white shadow-md shadow-blue-900/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting
              ? "Saving..."
              : mode === "create"
                ? "Create Reservation"
                : "Save Changes"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

function ReservationDetailModal({ reservation, onClose }) {
  if (!reservation) return null;

  return (
    <ModalShell
      title={`Reservation RSV-${reservation.displayId}`}
      subtitle="Chi tiết reservation lấy từ API backend."
      onClose={onClose}
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <DetailCard label="Customer" value={reservation.customerName} />
        <DetailCard
          label="Contact"
          value={
            reservation.customerEmail || reservation.customerPhone || "N/A"
          }
        />
        <DetailCard label="Parking Slot" value={reservation.slotName} />
        <DetailCard label="Zone" value={reservation.zoneName} />
        <DetailCard label="Vehicle Type" value={reservation.vehicleTypeName} />
        <DetailCard
          label="Status"
          value={<StatusBadge status={reservation.status} />}
        />
        <DetailCard
          label="Start Time"
          value={formatDateTime(reservation.expectedStartTime)}
        />
        <DetailCard
          label="End Time"
          value={formatDateTime(reservation.expectedEndTime)}
        />
        <DetailCard
          label="Duration"
          value={
            reservation.durationHours
              ? `${reservation.durationHours} hours`
              : "N/A"
          }
        />
        <DetailCard
          label="Created At"
          value={formatDateTime(reservation.createdAt)}
        />
      </div>
    </ModalShell>
  );
}

function DetailCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-[#eceef5] bg-[#f8f9fc] p-4">
      <p className="font-['Geist'] text-[11px] font-semibold uppercase tracking-wider text-[#6b7280]">
        {label}
      </p>
      <div className="mt-2 font-['Inter'] text-sm font-semibold text-[#191b23]">
        {value}
      </div>
    </div>
  );
}

export default function ReservationsPage() {
  const [reservations, setReservations] = useState([]);
  const [parkingSlots, setParkingSlots] = useState([]);
  const [vehicleTypes, setVehicleTypes] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [keyword, setKeyword] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedVehicleType, setSelectedVehicleType] = useState("ALL");
  const [selectedZone, setSelectedZone] = useState("ALL");

  const [modalMode, setModalMode] = useState(null);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [form, setForm] = useState(initialForm);

  const currentUserRole = useMemo(() => getStoredUserRole(), []);
  const isStaff = currentUserRole === "STAFF";

  useEffect(() => {
    let isMounted = true;

    Promise.all([
      apiRequest("/api/reservations"),
      apiRequest("/api/parking-slots"),
      apiRequest("/api/vehicle-types"),
    ])
      .then(([reservationResult, slotResult, vehicleTypeResult]) => {
        if (!isMounted) return;

        setReservations(
          getApiData(reservationResult).map(normalizeReservation),
        );
        setParkingSlots(getApiData(slotResult).map(normalizeSlot));
        setVehicleTypes(
          getApiData(vehicleTypeResult).map(normalizeVehicleType),
        );
      })
      .catch((error) => {
        if (!isMounted) return;

        setError(error.message || "Cannot load reservations");
      })
      .finally(() => {
        if (!isMounted) return;

        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const filterVehicleTypes = useMemo(() => {
    return [...new Set(reservations.map((item) => item.vehicleTypeName))]
      .filter(Boolean)
      .sort();
  }, [reservations]);

  const zones = useMemo(() => {
    return [...new Set(reservations.map((item) => item.zoneName))]
      .filter(Boolean)
      .sort();
  }, [reservations]);

  const filteredReservations = useMemo(() => {
    return reservations.filter((reservation) => {
      const searchText = `
        ${reservation.id || ""}
        ${reservation.displayId || ""}
        ${reservation.customerName || ""}
        ${reservation.customerEmail || ""}
        ${reservation.customerPhone || ""}
        ${reservation.vehicleTypeName || ""}
        ${reservation.slotName || ""}
        ${reservation.zoneName || ""}
        ${reservation.status || ""}
      `.toLowerCase();

      const matchesKeyword = searchText.includes(keyword.trim().toLowerCase());

      const matchesStatus =
        selectedStatus === "ALL" || reservation.status === selectedStatus;

      const matchesVehicleType =
        selectedVehicleType === "ALL" ||
        reservation.vehicleTypeName === selectedVehicleType;

      const matchesZone =
        selectedZone === "ALL" || reservation.zoneName === selectedZone;

      return (
        matchesKeyword && matchesStatus && matchesVehicleType && matchesZone
      );
    });
  }, [
    reservations,
    keyword,
    selectedStatus,
    selectedVehicleType,
    selectedZone,
  ]);

  const resetFilters = () => {
    setKeyword("");
    setSelectedStatus("ALL");
    setSelectedVehicleType("ALL");
    setSelectedZone("ALL");
  };

  const openCreateModal = () => {
    setSelectedReservation(null);
    setForm(initialForm);
    setModalMode("create");
  };

  const openEditModal = (reservation) => {
    setSelectedReservation(reservation);
    setForm({
      parkingSlotId: reservation.parkingSlotId || "",
      vehicleTypeId: reservation.vehicleTypeId || "",
      startTime: toDateTimeLocalValue(reservation.expectedStartTime),
      endTime: toDateTimeLocalValue(reservation.expectedEndTime),
      status: reservation.status || "CONFIRMED",
      licensePlate: "",
    });
    setModalMode("edit");
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedReservation(null);
    setForm(initialForm);
  };

  const validateForm = () => {
    if (
      !form.parkingSlotId ||
      !form.vehicleTypeId ||
      !form.startTime ||
      !form.endTime
    ) {
      return "Please fill in all required fields";
    }

    const startTime = new Date(form.startTime);
    const endTime = new Date(form.endTime);

    if (Number.isNaN(startTime.getTime()) || Number.isNaN(endTime.getTime())) {
      return "Invalid start time or end time";
    }

    if (startTime >= endTime) {
      return "Start time must be before end time";
    }

    if (
      modalMode === "edit" &&
      selectedReservation?.status !== "CHECKED_IN" &&
      form.status === "CHECKED_IN" &&
      !form.licensePlate.trim()
    ) {
      return "License plate is required for check-in";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationMessage = validateForm();
    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setNotice("");

      const shouldCreateSession =
        modalMode === "edit" &&
        selectedReservation?.status !== "CHECKED_IN" &&
        form.status === "CHECKED_IN";

      const payload =
        shouldCreateSession
          ? {
              reservationId: selectedReservation.id,
              assignedSlotId: form.parkingSlotId,
              licensePlate: form.licensePlate,
            }
          : modalMode === "edit" && isStaff
          ? {
              status: form.status,
              parkingSlotId: form.parkingSlotId,
            }
          : {
              parkingSlotId: form.parkingSlotId,
              vehicleTypeId: form.vehicleTypeId,
              startTime: toIsoDateTime(form.startTime),
              endTime: toIsoDateTime(form.endTime),
              ...(modalMode === "edit" && { status: form.status }),
            };

      const endpoint = shouldCreateSession
        ? "/api/parking-sessions/check-in"
        : modalMode === "create"
          ? "/api/reservations"
          : `/api/reservations/${selectedReservation.id}`;

      const method = shouldCreateSession || modalMode === "create" ? "POST" : "PUT";

      const result = await apiRequest(endpoint, {
        method,
        body: JSON.stringify(payload),
      });

      const savedReservation = shouldCreateSession
        ? { ...selectedReservation, parkingSlotId: form.parkingSlotId, status: "CHECKED_IN" }
        : normalizeReservation(getApiItem(result));

      if (modalMode === "create") {
        setReservations((prev) => [savedReservation, ...prev]);
        setNotice("Create reservation successfully");
      } else {
        setReservations((prev) =>
          prev.map((item) =>
            item.id === savedReservation.id ? savedReservation : item,
          ),
        );
        setNotice(
          shouldCreateSession
            ? "Check-in successfully and parking session started"
            : "Update reservation successfully",
        );
      }

      closeModal();
    } catch (error) {
      setError(error.message || "Cannot save reservation");
    } finally {
      setSubmitting(false);
    }
  };

  const handleView = async (reservation) => {
    try {
      setError("");
      const result = await apiRequest(`/api/reservations/${reservation.id}`);
      setSelectedReservation(normalizeReservation(getApiItem(result)));
      setModalMode("detail");
    } catch (error) {
      setError(error.message || "Cannot load reservation detail");
    }
  };

  const handleCancel = async (reservation) => {
    if (
      !window.confirm(
        `Cancel reservation RSV-${reservation.displayId}? This will set status to CANCELLED.`,
      )
    ) {
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setNotice("");

      const result = await apiRequest(`/api/reservations/${reservation.id}`, {
        method: "DELETE",
      });

      const cancelledReservation = normalizeReservation(getApiItem(result));

      setReservations((prev) =>
        prev.map((item) =>
          item.id === cancelledReservation.id ? cancelledReservation : item,
        ),
      );

      setNotice("Cancel reservation successfully");
    } catch (error) {
      setError(error.message || "Cannot cancel reservation");
    } finally {
      setSubmitting(false);
    }
  };

  const headerAction = (
    <button
      onClick={openCreateModal}
      className="flex items-center gap-2 rounded-xl bg-[#2563eb] px-5 py-2.5 font-['Inter'] text-sm font-medium text-white shadow-md shadow-blue-900/20 transition hover:brightness-110 active:scale-95"
    >
      <span className="material-symbols-outlined">add_circle</span>
      New Reservation
    </button>
  );

  return (
    <AdminLayout
      activeLabel="Reservations"
      headerAction={headerAction}
      searchPlaceholder="Search reservations, customers, slots..."
    >
      <PageHeader />

      <Alert type="error" message={error} onClose={() => setError("")} />
      <Alert type="success" message={notice} onClose={() => setNotice("")} />

      <StatsGrid reservations={reservations} />

      <ReservationInsight reservations={reservations} />

      <FilterToolbar
        keyword={keyword}
        setKeyword={setKeyword}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        selectedVehicleType={selectedVehicleType}
        setSelectedVehicleType={setSelectedVehicleType}
        selectedZone={selectedZone}
        setSelectedZone={setSelectedZone}
        vehicleTypes={filterVehicleTypes}
        zones={zones}
        filteredCount={filteredReservations.length}
        onResetFilters={resetFilters}
      />

      <ReservationsTable
        reservations={filteredReservations}
        loading={loading}
        error={loading ? "" : ""}
        onView={handleView}
        onEdit={openEditModal}
        onCancel={handleCancel}
      />

      {(modalMode === "create" || modalMode === "edit") && (
        <ReservationFormModal
          mode={modalMode}
          form={form}
          setForm={setForm}
          slots={parkingSlots}
          vehicleTypes={vehicleTypes}
          submitting={submitting}
          isStaffEdit={modalMode === "edit" && isStaff}
          onSubmit={handleSubmit}
          onClose={closeModal}
        />
      )}

      {modalMode === "detail" && (
        <ReservationDetailModal
          reservation={selectedReservation}
          onClose={closeModal}
        />
      )}
    </AdminLayout>
  );
}
