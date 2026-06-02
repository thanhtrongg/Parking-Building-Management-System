import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import { apiRequest } from "../services/api";

const statusConfig = {
  PENDING: {
    label: "Pending",
    description: "Waiting for confirmation",
    className: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
    icon: "pending_actions",
  },
  CONFIRMED: {
    label: "Confirmed",
    description: "Slot is reserved",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
    icon: "event_available",
  },
  FULFILLED: {
    label: "Fulfilled",
    description: "Reservation completed",
    className: "bg-blue-50 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
    icon: "task_alt",
  },
  CANCELLED: {
    label: "Cancelled",
    description: "Reservation cancelled",
    className: "bg-rose-50 text-rose-700 border-rose-200",
    dot: "bg-rose-500",
    icon: "event_busy",
  },
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
    reservation.expectedStartTime ||
    reservation.expected_start_time ||
    reservation.expected_start;

  const expectedEndTime =
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
    user.email ||
    reservation.email ||
    reservation.customerEmail ||
    reservation.customer_email ||
    "";

  const customerPhone =
    user.phone ||
    reservation.phone ||
    reservation.customerPhone ||
    reservation.customer_phone ||
    "";

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
    customerName,
    customerEmail,
    customerPhone,
    slotName,
    zoneName,
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
              Slot Reservation Flow
            </div>

            <h2 className="font-['Geist'] text-3xl font-bold tracking-tight text-[#191b23]">
              Reservation Management
            </h2>

            <p className="mt-2 max-w-3xl font-['Inter'] text-sm leading-6 text-[#6b7280]">
              Quản lý người dùng đang đặt trước slot gửi xe. Các reservation có
              trạng thái Pending hoặc Confirmed sẽ tương ứng với slot đang được
              giữ trước trong parking slots.
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
  const pending = reservations.filter(
    (item) => item.status === "PENDING",
  ).length;
  const confirmed = reservations.filter(
    (item) => item.status === "CONFIRMED",
  ).length;
  const activeReservations = reservations.filter((item) =>
    ["PENDING", "CONFIRMED"].includes(item.status),
  ).length;
  const fulfilled = reservations.filter(
    (item) => item.status === "FULFILLED",
  ).length;

  const totalDuration = reservations.reduce((sum, item) => {
    return sum + (item.durationHours || 0);
  }, 0);

  const durationCount = reservations.filter(
    (item) => item.durationHours !== null,
  ).length;

  const avgDuration =
    durationCount > 0
      ? `${Math.round((totalDuration / durationCount) * 10) / 10}h`
      : "N/A";

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
      <SummaryCard
        title="Total"
        value={total}
        subtitle="All reservations"
        icon="event_note"
        className="bg-slate-100 text-slate-700"
      />
      <SummaryCard
        title="Reserved Slots"
        value={activeReservations}
        subtitle="Pending + confirmed"
        icon="local_parking"
        className="bg-blue-50 text-blue-700"
      />
      <SummaryCard
        title="Pending"
        value={pending}
        subtitle="Need confirmation"
        icon="pending_actions"
        className="bg-amber-50 text-amber-700"
      />
      <SummaryCard
        title="Confirmed"
        value={confirmed}
        subtitle="Slot already held"
        icon="event_available"
        className="bg-emerald-50 text-emerald-700"
      />
      <SummaryCard
        title="Avg Duration"
        value={avgDuration}
        subtitle={`${fulfilled} fulfilled`}
        icon="timer"
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
          <option value="PENDING">Pending</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="FULFILLED">Fulfilled</option>
          <option value="CANCELLED">Cancelled</option>
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
    <div className="flex min-w-[190px] items-center gap-3">
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

function ReservationRow({ reservation }) {
  const meta = getStatusMeta(reservation.status);

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
        <div className="inline-flex min-w-[130px] items-center gap-2 rounded-xl bg-[#eef3ff] px-3 py-2">
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
          <p className="mt-1 max-w-[240px] truncate font-['Inter'] text-xs text-[#6b7280]">
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
            className="rounded-lg p-2 text-[#6b7280] transition hover:bg-[#f3f4f8] hover:text-[#2563eb]"
          >
            <span className="material-symbols-outlined text-[20px]">
              visibility
            </span>
          </button>

          <button
            title="Edit reservation"
            className="rounded-lg p-2 text-[#6b7280] transition hover:bg-[#f3f4f8] hover:text-[#2563eb]"
          >
            <span className="material-symbols-outlined text-[20px]">edit</span>
          </button>

          <button
            title="Cancel reservation"
            className="rounded-lg p-2 text-[#6b7280] transition hover:bg-rose-50 hover:text-rose-600"
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

function ReservationsTable({ reservations, loading, error }) {
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
                key={
                  reservation.id ||
                  `${reservation.slotName}-${reservation.customerName}`
                }
                reservation={reservation}
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
    ["PENDING", "CONFIRMED"].includes(item.status),
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
              Pending/Confirmed reservations are the records that should match
              RESERVED parking slots.
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
            title="Reservation is active"
            text="Pending hoặc Confirmed sẽ giữ trước slot."
          />
          <FlowInfoCard
            icon="local_parking"
            title="Slot becomes reserved"
            text="Parking slot tương ứng nên có status RESERVED."
          />
        </div>
      </div>

      <div className="rounded-2xl border border-[#d7d9e4] bg-white p-5 shadow-sm">
        <h3 className="font-['Geist'] text-base font-semibold text-[#191b23]">
          Reserved by Vehicle Type
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

export default function ReservationsPage() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [keyword, setKeyword] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedVehicleType, setSelectedVehicleType] = useState("ALL");
  const [selectedZone, setSelectedZone] = useState("ALL");

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        setLoading(true);
        setError("");

        const result = await apiRequest("/api/reservations");
        const apiData = Array.isArray(result) ? result : result.data || [];

        setReservations(apiData.map(normalizeReservation));
      } catch (error) {
        setError(error.message || "Cannot load reservations");
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, []);

  const vehicleTypes = useMemo(() => {
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

  const headerAction = (
    <button className="flex items-center gap-2 rounded-xl bg-[#2563eb] px-5 py-2.5 font-['Inter'] text-sm font-medium text-white shadow-md shadow-blue-900/20 transition hover:brightness-110 active:scale-95">
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
        vehicleTypes={vehicleTypes}
        zones={zones}
        filteredCount={filteredReservations.length}
        onResetFilters={resetFilters}
      />

      <ReservationsTable
        reservations={filteredReservations}
        loading={loading}
        error={error}
      />
    </AdminLayout>
  );
}
