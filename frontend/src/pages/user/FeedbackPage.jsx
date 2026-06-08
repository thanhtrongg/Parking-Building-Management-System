import { useEffect, useMemo, useState } from "react";
import UserLayout from "../../components/UserLayout";
import { apiRequest } from "../../services/api";
import { getReservationCode } from "./BookingHistoryPage";

function normalizeBookings(value) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  return [];
}

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

function PageHeader() {
  return (
    <div className="mb-6">
      <h1 className="font-['Geist'] text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
        Feedback & Issue Report
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
        Choose one of your booking IDs, then send feedback or report a parking
        issue to the support team.
      </p>
    </div>
  );
}

function BookingPreview({ booking }) {
  if (!booking) {
    return (
      <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-500 shadow-sm">
        Select a booking ID to preview its slot, zone, and reservation time.
      </section>
    );
  }

  const slotName = booking.parkingSlot?.slotName || "Unassigned";
  const zoneName = booking.parkingSlot?.zone?.zoneName || "N/A";
  const vehicleType = booking.vehicleType?.typeName || "N/A";

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-wider text-slate-400">
            Selected Booking
          </p>
          <h2 className="mt-1 font-['Geist'] text-xl font-black text-slate-950">
            {getReservationCode(booking.id)}
          </h2>
        </div>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black uppercase text-blue-700 ring-1 ring-blue-100">
          {booking.status || "PENDING"}
        </span>
      </div>

      <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
        <Info label="Slot" value={slotName} />
        <Info label="Zone" value={zoneName} />
        <Info label="Vehicle" value={vehicleType} />
        <Info label="Start" value={formatDateTime(booking.startTime)} />
      </div>
    </section>
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

export default function UserFeedbackPage() {
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });
  const [form, setForm] = useState({
    bookingId: "",
    subject: "",
    message: "",
  });

  useEffect(() => {
    let ignore = false;

    async function loadBookings() {
      try {
        setLoadingBookings(true);
        const result = await apiRequest("/api/reservations");

        if (!ignore) {
          const nextBookings = normalizeBookings(result);
          setBookings(nextBookings);
          setForm((current) => ({
            ...current,
            bookingId: nextBookings[0] ? getReservationCode(nextBookings[0].id) : "",
          }));
        }
      } catch (error) {
        if (!ignore) {
          setAlert({
            type: "error",
            message: error.message || "Cannot load your bookings",
          });
        }
      } finally {
        if (!ignore) {
          setLoadingBookings(false);
        }
      }
    }

    loadBookings();

    return () => {
      ignore = true;
    };
  }, []);

  const bookingOptions = useMemo(() => {
    return bookings.map((booking) => ({
      value: getReservationCode(booking.id),
      label: `${getReservationCode(booking.id)} - ${
        booking.parkingSlot?.slotName || "Unassigned"
      }`,
    }));
  }, [bookings]);

  const selectedBooking = useMemo(() => {
    return bookings.find((booking) => getReservationCode(booking.id) === form.bookingId);
  }, [bookings, form.bookingId]);

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.bookingId) {
      setAlert({
        type: "error",
        message: "Please select one of your booking IDs.",
      });
      return;
    }

    try {
      setSubmitting(true);
      setAlert({ type: "", message: "" });

      await apiRequest("/api/feedbacks", {
        method: "POST",
        body: JSON.stringify({
          bookingId: form.bookingId,
          subject: form.subject.trim(),
          message: form.message.trim(),
        }),
      });

      setForm((current) => ({
        ...current,
        subject: "",
        message: "",
      }));
      setAlert({
        type: "success",
        message: "Feedback submitted successfully. Staff will review it soon.",
      });
    } catch (error) {
      setAlert({
        type: "error",
        message: error.message || "Cannot submit feedback",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <UserLayout>
      <PageHeader />
      <Alert
        type={alert.type}
        message={alert.message}
        onClose={() => setAlert({ type: "", message: "" })}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-amber-50 text-amber-600 ring-1 ring-amber-100">
              <span className="material-symbols-outlined text-[24px]">
                report_problem
              </span>
            </div>
            <div>
              <h2 className="font-['Geist'] text-lg font-black text-slate-950">
                Send Feedback
              </h2>
              <p className="text-sm text-slate-500">
                Feedback must be linked to one of your booking IDs.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="block">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                Booking ID
              </span>
              <select
                value={form.bookingId}
                onChange={(event) => updateField("bookingId", event.target.value)}
                disabled={loadingBookings || bookingOptions.length === 0}
                className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
              >
                <option value="">
                  {loadingBookings ? "Loading bookings..." : "Select booking ID"}
                </option>
                {bookingOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                Subject
              </span>
              <input
                value={form.subject}
                onChange={(event) => updateField("subject", event.target.value)}
                className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
                required
              />
            </label>

            <label className="block">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                Message
              </span>
              <textarea
                value={form.message}
                onChange={(event) => updateField("message", event.target.value)}
                rows={6}
                className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
                placeholder="Describe what happened..."
                required
              />
            </label>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting || !form.bookingId}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-black text-white shadow-md shadow-blue-200 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                )}
                {submitting ? "Submitting..." : "Submit Feedback"}
              </button>
            </div>
          </form>
        </section>

        <BookingPreview booking={selectedBooking} />
      </div>
    </UserLayout>
  );
}
