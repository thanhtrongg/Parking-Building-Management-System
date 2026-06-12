import { useEffect, useMemo, useState } from "react";
import UserLayout from "../../components/UserLayout";
import { apiRequest } from "../../services/api";
import { getReservationCode } from "../../utils/reservation";
import useAutoRefresh from "../../hooks/useAutoRefresh";

const statusStyles = {
  CONFIRMED: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  CHECKED_IN: "bg-blue-50 text-blue-700 ring-blue-100",
  CANCELLED: "bg-red-50 text-red-700 ring-red-100",
  COMPLETED: "bg-slate-100 text-slate-700 ring-slate-200",
  FULFILLED: "bg-slate-100 text-slate-700 ring-slate-200",
};

const cancellableStatuses = ["CONFIRMED"];

function formatDateTime(value) {
  if (!value) return "N/A";

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function normalizeBookings(value) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  return [];
}

function buildQrImageUrl(qrText) {
  if (!qrText) return "";

  const params = new URLSearchParams({
    size: "280x280",
    data: qrText,
    margin: "16",
  });

  return `https://api.qrserver.com/v1/create-qr-code/?${params.toString()}`;
}

function StatusBadge({ status }) {
  const normalizedStatus = String(status || "CONFIRMED").toUpperCase();

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-black uppercase ring-1 ${
        statusStyles[normalizedStatus] || statusStyles.CONFIRMED
      }`}
    >
      {normalizedStatus}
    </span>
  );
}

function PageHeader({ total }) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <h1 className="font-['Geist'] text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
          Booking History
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Review reservations, parking location, vehicle type, schedule, and
          current status from your real account data.
        </p>
      </div>
      <div className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 shadow-sm">
        <span className="material-symbols-outlined text-[20px]">
          event_available
        </span>
        {total} bookings
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center shadow-sm">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-blue-50 text-blue-600">
        <span className="material-symbols-outlined text-[34px]">
          event_busy
        </span>
      </div>
      <h2 className="mt-5 font-['Geist'] text-xl font-black text-slate-950">
        No bookings yet
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        Your reservations will appear here after you book a parking slot.
      </p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
      {[1, 2, 3, 4].map((item) => (
        <div
          key={item}
          className="h-56 animate-pulse rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="h-6 w-32 rounded-full bg-slate-100" />
          <div className="mt-5 h-4 w-2/3 rounded-full bg-slate-100" />
          <div className="mt-8 grid grid-cols-2 gap-3">
            <div className="h-16 rounded-xl bg-slate-100" />
            <div className="h-16 rounded-xl bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

function Alert({ type, message, onClose }) {
  if (!message) return null;

  const isError = type === "error";

  return (
    <div
      className={`mb-5 flex items-start justify-between gap-4 rounded-2xl border px-4 py-3 text-sm font-bold ${
        isError
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-emerald-200 bg-emerald-50 text-emerald-700"
      }`}
    >
      <span>{message}</span>
      <button type="button" onClick={onClose}>
        <span className="material-symbols-outlined text-[18px]">close</span>
      </button>
    </div>
  );
}

function BookingCard({ booking, cancelling, onCancel }) {
  const slotName = booking.parkingSlot?.slotName || "Unassigned";
  const zoneName = booking.parkingSlot?.zone?.zoneName || "N/A";
  const vehicleType = booking.vehicleType?.typeName || "N/A";
  const reservationCode = getReservationCode(booking.id);
  const status = String(booking.status || "").toUpperCase();
  const canCancel = cancellableStatuses.includes(status);
  const qrImageUrl = buildQrImageUrl(booking.qr?.text);

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-['Geist'] text-lg font-black text-slate-950">
              {reservationCode}
            </h2>
            <StatusBadge status={booking.status} />
          </div>
          <p className="mt-2 text-sm font-semibold text-slate-700">
            {zoneName}
          </p>
        </div>
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
          <span className="material-symbols-outlined text-[24px]">
            local_parking
          </span>
        </div>
      </div>

      <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
        <Info label="Booking ID" value={reservationCode} />
        <Info label="Slot" value={slotName} />
        <Info label="Vehicle" value={vehicleType} />
        <Info label="Start" value={formatDateTime(booking.startTime)} />
        <Info label="Payment" value="Pay when checkout" />
      </div>

      {qrImageUrl && (
        <div className="mt-5 flex flex-col gap-4 rounded-2xl border border-blue-100 bg-blue-50/70 p-4 sm:flex-row sm:items-center">
          <div className="grid h-72 w-72 shrink-0 place-items-center rounded-2xl bg-white p-2 ring-1 ring-blue-100">
            <img
              src={qrImageUrl}
              alt={`${reservationCode} check-in QR`}
              className="h-68 w-68"
            />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-wider text-blue-500">
              Check-in QR
            </p>
            <p className="mt-1 font-['Geist'] text-lg font-black text-slate-950">
              Scan at entrance
            </p>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
              Show this QR to staff camera when you arrive. After scan, this
              booking moves from CONFIRMED to CHECKED_IN.
            </p>
          </div>
        </div>
      )}

      <div className="mt-5 flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-4">
        {canCancel ? (
          <button
            type="button"
            onClick={() => onCancel(booking)}
            disabled={cancelling}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-red-50 px-4 text-sm font-black text-red-700 ring-1 ring-red-100 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {cancelling ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-200 border-t-red-700" />
            ) : (
              <span className="material-symbols-outlined text-[19px]">
                event_busy
              </span>
            )}
            {cancelling ? "Cancelling..." : "Cancel reservation"}
          </button>
        ) : (
          <span className="text-xs font-bold text-slate-400">
            Cancellation unavailable
          </span>
        )}
      </div>
    </article>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-100">
      <p className="text-xs font-black uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-1 font-black text-slate-950">{value}</p>
    </div>
  );
}

export default function BookingHistoryPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [alert, setAlert] = useState({ type: "", message: "" });
  const [cancellingId, setCancellingId] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadBookings() {
      try {
        setLoading(true);
        setError("");

        const result = await apiRequest("/api/reservations");

        if (!ignore) {
          setBookings(normalizeBookings(result));
        }
      } catch (loadError) {
        if (!ignore) {
          setError(loadError.message || "Cannot load bookings");
          setBookings([]);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadBookings();

    return () => {
      ignore = true;
    };
  }, []);

  useAutoRefresh(async () => {
    const result = await apiRequest("/api/reservations");
    setBookings(normalizeBookings(result));
  });

  const handleCancelReservation = async (booking) => {
    const slotName = booking.parkingSlot?.slotName || "this slot";
    const confirmed = window.confirm(
      `Cancel reservation for ${slotName}?`,
    );

    if (!confirmed) return;

    try {
      setCancellingId(booking.id);
      setAlert({ type: "", message: "" });

      const result = await apiRequest(
        `/api/user/reservations/${booking.id}/cancel`,
        {
          method: "PATCH",
        },
      );

      const updatedReservation = result.data?.reservation || {
        ...booking,
        status: result.data?.status || "CANCELLED",
        parkingSlot: {
          ...booking.parkingSlot,
          slotName: result.data?.slotName || booking.parkingSlot?.slotName,
        },
      };

      setBookings((currentBookings) =>
        currentBookings.map((currentBooking) =>
          currentBooking.id === booking.id
            ? updatedReservation
            : currentBooking,
        ),
      );
      setAlert({
        type: "success",
        message: "Reservation cancelled successfully.",
      });
    } catch (cancelError) {
      setAlert({
        type: "error",
        message: cancelError.message || "Cannot cancel reservation",
      });
    } finally {
      setCancellingId("");
    }
  };

  const sortedBookings = useMemo(() => {
    return [...bookings].sort((a, b) => {
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
  }, [bookings]);

  return (
    <UserLayout>
      <PageHeader total={bookings.length} />
      <Alert
        type={alert.type}
        message={alert.message}
        onClose={() => setAlert({ type: "", message: "" })}
      />

      {loading ? (
        <LoadingState />
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center text-sm font-bold text-red-700">
          {error}
        </div>
      ) : sortedBookings.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          {sortedBookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              cancelling={cancellingId === booking.id}
              onCancel={handleCancelReservation}
            />
          ))}
        </div>
      )}
    </UserLayout>
  );
}
