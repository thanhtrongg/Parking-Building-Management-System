import { useEffect, useMemo, useState } from "react";
import UserLayout from "../../components/UserLayout";
import { apiRequest } from "../../services/api";
import useAutoRefresh from "../../hooks/useAutoRefresh";
import { getReservationCode } from "../../utils/reservation";
import CustomSelect from "../../components/CustomSelect";

function normalizeBookings(value) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  return [];
}

function normalizeFeedbacks(value) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  return [];
}

const statusStyles = {
  OPEN: "bg-blue-50 text-blue-700 ring-blue-100",
  IN_PROGRESS: "bg-amber-50 text-amber-700 ring-amber-100",
  RESOLVED: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  CLOSED: "bg-slate-100 text-slate-700 ring-slate-200",
};

const feedbackStatusFilters = [
  { label: "All", value: "ALL" },
  { label: "Open", value: "OPEN" },
  { label: "In Progress", value: "IN_PROGRESS" },
  { label: "Resolved", value: "RESOLVED" },
  { label: "Closed", value: "CLOSED" },
];

const MAX_FEEDBACK_SUBJECT_LENGTH = 50;
const feedbackCategories = [
  { value: "GENERAL", label: "General feedback", icon: "forum" },
  { value: "PARKING_SERVICE", label: "Parking service", icon: "local_parking" },
  { value: "FACILITY", label: "Facility & equipment", icon: "domain" },
  { value: "PAYMENT", label: "Payment & fee", icon: "payments" },
  { value: "TECHNICAL", label: "Website / technical issue", icon: "bug_report" },
  { value: "STAFF_ATTITUDE", label: "Staff attitude", icon: "support_agent" },
];

const getCategoryLabel = (category) =>
  feedbackCategories.find((item) => item.value === category)?.label ||
  "General feedback";

function formatDateTime(value) {
  if (!value) return "N/A";

  return new Intl.DateTimeFormat("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function StatusBadge({ status }) {
  const normalizedStatus = String(status || "OPEN").toUpperCase();

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-black uppercase ring-1 ${
        statusStyles[normalizedStatus] || statusStyles.OPEN
      }`}
    >
      {normalizedStatus.replace("_", " ")}
    </span>
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
          {booking.status || "CONFIRMED"}
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

function FeedbackHistory({
  feedbacks,
  loading,
  statusFilter,
  onStatusFilterChange,
}) {
  if (loading) {
    return (
      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="h-6 w-40 animate-pulse rounded-full bg-slate-100" />
        <div className="mt-5 grid gap-4">
          {[1, 2].map((item) => (
            <div
              key={item}
              className="h-36 animate-pulse rounded-xl bg-slate-100"
            />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-['Geist'] text-lg font-black text-slate-950">
            My Feedbacks
          </h2>
          <p className="text-sm text-slate-500">
            Track staff responses and support status.
          </p>
        </div>
        <span className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-50 px-3 text-sm font-black text-slate-700 ring-1 ring-slate-100">
          <span className="material-symbols-outlined text-[19px]">forum</span>
          {feedbacks.length} items
        </span>
      </div>

      <div className="mb-5 overflow-x-auto rounded-xl bg-slate-50 p-1 ring-1 ring-slate-100">
        <div className="flex min-w-max gap-1">
          {feedbackStatusFilters.map((filter) => {
            const isActive = statusFilter === filter.value;

            return (
              <button
                key={filter.value}
                type="button"
                onClick={() => onStatusFilterChange(filter.value)}
                className={`h-9 rounded-lg px-3 text-xs font-black transition ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-white hover:text-slate-950"
                }`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>

      {feedbacks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 px-5 py-10 text-center text-sm font-semibold text-slate-500">
          {statusFilter === "ALL"
            ? "You have not submitted feedback yet."
            : `No ${statusFilter.toLowerCase().replace("_", " ")} feedbacks found.`}
        </div>
      ) : (
        <div className="grid gap-4">
          {feedbacks.map((feedback) => (
            <article
              key={feedback.id}
              className="rounded-xl border border-slate-200 p-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-['Geist'] text-base font-black text-slate-950">
                      {feedback.subject}
                    </h3>
                    <StatusBadge status={feedback.status} />
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-black text-slate-600 ring-1 ring-slate-200">
                      {getCategoryLabel(feedback.category)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs font-bold text-slate-400">
                    {feedback.reservationCode ||
                      feedback.bookingId ||
                      feedback.ticketCode ||
                      "No booking"}{" "}
                    - {formatDateTime(feedback.createdAt)}
                  </p>
                </div>
              </div>

              <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm leading-6 text-slate-700 ring-1 ring-slate-100">
                {feedback.message}
              </p>

              {feedback.reply ? (
                <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                  <div className="flex items-center gap-2 text-sm font-black text-emerald-800">
                    <span className="material-symbols-outlined text-[19px]">
                      support_agent
                    </span>
                    Staff Response
                  </div>
                  <p className="mt-2 text-sm leading-6 text-emerald-900">
                    {feedback.reply}
                  </p>
                  <p className="mt-2 text-xs font-bold text-emerald-700/80">
                    {formatDateTime(feedback.replyCreatedAt)}
                  </p>
                </div>
              ) : (
                <div className="mt-4 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-700">
                  Staff has not responded yet.
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default function UserFeedbackPage() {
  const [bookings, setBookings] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(true);
  const [feedbackStatusFilter, setFeedbackStatusFilter] = useState("ALL");
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });
  const [form, setForm] = useState({
    bookingId: "",
    category: "GENERAL",
    subject: "",
    message: "",
  });

  useEffect(() => {
    let ignore = false;

    async function loadBookings() {
      try {
        setLoadingBookings(true);
        const bookingsResult = await apiRequest("/api/reservations");

        if (!ignore) {
          const nextBookings = normalizeBookings(bookingsResult);
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

  useEffect(() => {
    let ignore = false;

    async function loadFeedbacks() {
      try {
        setLoadingFeedbacks(true);
        const query =
          feedbackStatusFilter === "ALL"
            ? ""
            : `?status=${feedbackStatusFilter}`;
        const feedbacksResult = await apiRequest(`/api/user/feedbacks${query}`);

        if (!ignore) {
          setFeedbacks(normalizeFeedbacks(feedbacksResult));
        }
      } catch (error) {
        if (!ignore) {
          setAlert({
            type: "error",
            message: error.message || "Cannot load your feedbacks",
          });
          setFeedbacks([]);
        }
      } finally {
        if (!ignore) {
          setLoadingFeedbacks(false);
        }
      }
    }

    loadFeedbacks();

    return () => {
      ignore = true;
    };
  }, [feedbackStatusFilter]);

  useAutoRefresh(async () => {
    const query =
      feedbackStatusFilter === "ALL" ? "" : `?status=${feedbackStatusFilter}`;
    const [bookingsResult, feedbacksResult] = await Promise.all([
      apiRequest("/api/reservations"),
      apiRequest(`/api/user/feedbacks${query}`),
    ]);
    setBookings(normalizeBookings(bookingsResult));
    setFeedbacks(normalizeFeedbacks(feedbacksResult));
  });

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

      const result = await apiRequest("/api/user/feedbacks", {
        method: "POST",
        body: JSON.stringify({
          bookingId: form.bookingId,
          category: form.category,
          subject: form.subject.trim(),
          message: form.message.trim(),
        }),
      });

      if (feedbackStatusFilter === "ALL" || feedbackStatusFilter === "OPEN") {
        setFeedbacks((currentFeedbacks) => [
          result.data,
          ...currentFeedbacks,
        ]);
      }
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
              <CustomSelect
                options={[
                  { value: "", label: loadingBookings ? "Loading bookings..." : "Select booking ID" },
                  ...bookingOptions
                ]}
                value={form.bookingId}
                onChange={(val) => updateField("bookingId", val)}
                disabled={loadingBookings || bookingOptions.length === 0}
                className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 dark:border-white/10 dark:bg-white/5 dark:text-[#fbf4e7]"
              />
            </label>

            <label className="block">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                Feedback category
              </span>
              <CustomSelect
                options={feedbackCategories}
                value={form.category}
                onChange={(val) => updateField("category", val)}
                className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/5 dark:text-[#fbf4e7]"
              />
              {form.category === "STAFF_ATTITUDE" && (
                <span className="mt-2 block rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold leading-5 text-amber-700">
                  Staff attitude feedback is private and only visible to Admin and Manager.
                </span>
              )}
            </label>

            <label className="block">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                Subject
              </span>
              <input
                value={form.subject}
                onChange={(event) => updateField("subject", event.target.value)}
                maxLength={MAX_FEEDBACK_SUBJECT_LENGTH}
                className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
                required
              />
              <span className="mt-1 block text-right text-xs font-bold text-slate-400">
                {form.subject.length}/{MAX_FEEDBACK_SUBJECT_LENGTH}
              </span>
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

      <FeedbackHistory
        feedbacks={feedbacks}
        loading={loadingFeedbacks}
        statusFilter={feedbackStatusFilter}
        onStatusFilterChange={setFeedbackStatusFilter}
      />
    </UserLayout>
  );
}
