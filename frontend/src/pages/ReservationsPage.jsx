import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import { apiRequest } from "../services/api";

const statusConfig = {
  PENDING: {
    label: "Pending",
    className: "bg-amber-100 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
  },
  CONFIRMED: {
    label: "Confirmed",
    className: "bg-green-100 text-green-700 border-green-200",
    dot: "bg-green-500",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-red-100 text-red-700 border-red-200",
    dot: "bg-red-500",
  },
  FULFILLED: {
    label: "Fulfilled",
    className: "bg-blue-100 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
  },
};

function getStatusMeta(status) {
  return (
    statusConfig[status] || {
      label: status || "Unknown",
      className: "bg-slate-100 text-slate-700 border-slate-200",
      dot: "bg-slate-400",
    }
  );
}

function formatDateTime(value) {
  if (!value) return "N/A";

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatDate(value) {
  if (!value) return "N/A";

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function formatTimeRange(start, end) {
  if (!start || !end) return "N/A";

  const startTime = new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(start));

  const endTime = new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(end));

  return `${startTime} - ${endTime}`;
}

function PageHeader() {
  return (
    <div className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
      <div>
        <h2 className="font-['Geist'] text-3xl font-semibold text-[#191b23]">
          Reservation Management
        </h2>
        <p className="mt-2 max-w-3xl font-['Inter'] text-sm text-[#6b7280]">
          Track upcoming parking bookings, assigned slots, vehicle types, and
          reservation status.
        </p>
      </div>
    </div>
  );
}

function SummaryCard({ title, value, icon, iconWrapClass, iconClass }) {
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

function StatsGrid({ reservations }) {
  const countByStatus = (status) =>
    reservations.filter((reservation) => reservation.status === status).length;

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
      <SummaryCard
        title="Total Reservations"
        value={reservations.length}
        icon="event_note"
        iconWrapClass="bg-slate-100"
        iconClass="text-slate-700"
      />
      <SummaryCard
        title="Pending"
        value={countByStatus("PENDING")}
        icon="schedule"
        iconWrapClass="bg-amber-50"
        iconClass="text-amber-600"
      />
      <SummaryCard
        title="Confirmed"
        value={countByStatus("CONFIRMED")}
        icon="check_circle"
        iconWrapClass="bg-green-50"
        iconClass="text-green-600"
      />
      <SummaryCard
        title="Fulfilled"
        value={countByStatus("FULFILLED")}
        icon="task_alt"
        iconWrapClass="bg-blue-50"
        iconClass="text-blue-600"
      />
      <SummaryCard
        title="Cancelled"
        value={countByStatus("CANCELLED")}
        icon="event_busy"
        iconWrapClass="bg-red-50"
        iconClass="text-red-600"
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
  filteredCount,
  onResetFilters,
}) {
  return (
    <div className="mb-6 rounded-2xl border border-[#d7d9e4] bg-white shadow-sm">
      <div className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex w-full flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative w-full lg:max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]">
              search
            </span>
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Search user, email, slot, vehicle type..."
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

          <button
            onClick={onResetFilters}
            className="h-11 rounded-xl border border-[#d7d9e4] bg-white px-4 font-['Inter'] text-sm font-medium text-[#374151] transition hover:bg-[#f8f9fc]"
          >
            Reset Filters
          </button>
        </div>

        <div className="flex items-center justify-between gap-3 lg:justify-end">
          <span className="font-['Inter'] text-sm text-[#6b7280]">
            Showing{" "}
            <span className="font-semibold text-[#191b23]">
              {filteredCount}
            </span>{" "}
            reservations
          </span>

          <button className="rounded-xl border border-[#d7d9e4] bg-white px-4 py-2.5 font-['Inter'] text-sm font-medium text-[#374151] transition hover:bg-[#f8f9fc]">
            Export
          </button>
        </div>
      </div>
    </div>
  );
}

function ReservationRow({ reservation }) {
  return (
    <tr className="transition hover:bg-[#fafbff]">
      <td className="px-6 py-5">
        <div>
          <p className="font-mono text-[13px] font-bold text-[#2563eb]">
            {reservation.id.slice(0, 8).toUpperCase()}
          </p>
          <p className="mt-1 font-['Inter'] text-xs text-[#6b7280]">
            Created {formatDateTime(reservation.createdAt)}
          </p>
        </div>
      </td>

      <td className="px-6 py-5">
        <div>
          <p className="font-['Inter'] text-sm font-semibold text-[#191b23]">
            {reservation.user?.fullName || "Guest User"}
          </p>
          <p className="mt-1 font-['Inter'] text-xs text-[#6b7280]">
            {reservation.user?.email || "No email"}
          </p>
        </div>
      </td>

      <td className="px-6 py-5">
        <div>
          <p className="font-['Inter'] text-sm font-medium text-[#191b23]">
            {reservation.vehicleType?.typeName || "N/A"}
          </p>
          <p className="mt-1 font-['Inter'] text-xs text-[#6b7280]">
            {reservation.parkingSlot?.zoneName || "No zone"}
          </p>
        </div>
      </td>

      <td className="px-6 py-5">
        <span className="inline-flex items-center gap-2 rounded-xl bg-[#eef3ff] px-3 py-2 font-['Inter'] text-sm font-semibold text-[#2563eb]">
          <span className="material-symbols-outlined text-[18px]">
            local_parking
          </span>
          {reservation.parkingSlot?.slotName || "Not assigned"}
        </span>
      </td>

      <td className="px-6 py-5">
        <div>
          <p className="font-['Inter'] text-sm font-medium text-[#191b23]">
            {formatDate(reservation.expectedStartTime)}
          </p>
          <p className="mt-1 font-['Inter'] text-xs text-[#6b7280]">
            {formatTimeRange(
              reservation.expectedStartTime,
              reservation.expectedEndTime,
            )}
          </p>
        </div>
      </td>

      <td className="px-6 py-5">
        <StatusBadge status={reservation.status} />
      </td>

      <td className="px-6 py-5 text-right">
        <div className="flex items-center justify-end gap-1">
          <button className="rounded-lg p-2 text-[#6b7280] transition hover:bg-[#f3f4f8]">
            <span className="material-symbols-outlined">visibility</span>
          </button>
          <button className="rounded-lg p-2 text-[#6b7280] transition hover:bg-[#f3f4f8]">
            <span className="material-symbols-outlined">edit</span>
          </button>
          <button className="rounded-lg p-2 text-red-500 transition hover:bg-red-50">
            <span className="material-symbols-outlined">delete</span>
          </button>
        </div>
      </td>
    </tr>
  );
}

function ReservationsTable({ reservations, loading, error }) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-[#d7d9e4] bg-white p-10 text-center font-['Inter'] text-sm text-[#6b7280] shadow-sm">
        Loading reservations...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-10 text-center font-['Inter'] text-sm text-red-600 shadow-sm">
        {error}
      </div>
    );
  }

  if (reservations.length === 0) {
    return (
      <div className="rounded-2xl border border-[#d7d9e4] bg-white p-10 text-center font-['Inter'] text-sm text-[#6b7280] shadow-sm">
        No reservations found.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[#d7d9e4] bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left">
          <thead className="bg-[#f7f8fc]">
            <tr>
              {[
                "Reservation",
                "User",
                "Vehicle Type / Zone",
                "Slot",
                "Schedule",
                "Status",
                "Actions",
              ].map((heading) => (
                <th
                  key={heading}
                  className={`px-6 py-4 font-['Geist'] text-[11px] font-semibold uppercase tracking-wider text-[#6b7280] ${
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
              <ReservationRow key={reservation.id} reservation={reservation} />
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-[#eceef5] bg-[#f8f9fc] px-6 py-4">
        <span className="font-['Inter'] text-sm text-[#6b7280]">
          Showing {reservations.length} reservation(s)
        </span>
      </div>
    </div>
  );
}

export default function ReservationsPage() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [keyword, setKeyword] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        setLoading(true);
        setError("");

        const result = await apiRequest("/api/reservations");
        setReservations(result.data || []);
      } catch (error) {
        setError(error.message || "Cannot load reservations");
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, []);

  const filteredReservations = useMemo(() => {
    return reservations.filter((reservation) => {
      const searchText = `
        ${reservation.id || ""}
        ${reservation.user?.fullName || ""}
        ${reservation.user?.email || ""}
        ${reservation.vehicleType?.typeName || ""}
        ${reservation.parkingSlot?.slotName || ""}
        ${reservation.parkingSlot?.zoneName || ""}
      `.toLowerCase();

      const matchesKeyword = searchText.includes(keyword.toLowerCase());
      const matchesStatus =
        selectedStatus === "ALL" || reservation.status === selectedStatus;

      return matchesKeyword && matchesStatus;
    });
  }, [reservations, keyword, selectedStatus]);

  const resetFilters = () => {
    setKeyword("");
    setSelectedStatus("ALL");
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
      searchPlaceholder="Search reservations, users, or slots..."
    >
      <PageHeader />
      <StatsGrid reservations={reservations} />

      <FilterToolbar
        keyword={keyword}
        setKeyword={setKeyword}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
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
