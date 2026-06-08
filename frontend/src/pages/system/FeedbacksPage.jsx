import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { apiRequest } from "../../services/api";

const feedbackStatuses = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];

const statusConfig = {
  OPEN: {
    label: "Open",
    className: "border-blue-100 bg-blue-50 text-blue-700",
    icon: "mark_unread_chat_alt",
  },
  IN_PROGRESS: {
    label: "In Progress",
    className: "border-amber-100 bg-amber-50 text-amber-700",
    icon: "hourglass_top",
  },
  RESOLVED: {
    label: "Resolved",
    className: "border-emerald-100 bg-emerald-50 text-emerald-700",
    icon: "task_alt",
  },
  CLOSED: {
    label: "Closed",
    className: "border-slate-200 bg-slate-100 text-slate-700",
    icon: "lock",
  },
};

function getStatusMeta(status) {
  return (
    statusConfig[status] || {
      label: status || "Unknown",
      className: "border-slate-200 bg-slate-100 text-slate-700",
      icon: "help",
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

function PageHeader() {
  return (
    <div className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
      <div>
        <h2 className="font-['Geist'] text-3xl font-semibold text-[#191b23]">
          Feedback Management
        </h2>
        <p className="mt-2 max-w-3xl font-['Inter'] text-sm text-[#6b7280]">
          Review user feedback, inspect linked parking sessions, and update
          support status.
        </p>
      </div>
    </div>
  );
}

function SummaryCard({ title, value, icon, className }) {
  return (
    <div className="rounded-2xl border border-[#d7d9e4] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-['Geist'] text-[11px] font-semibold uppercase tracking-wider text-[#6b7280]">
            {title}
          </p>
          <h3 className="mt-2 font-['Geist'] text-2xl font-bold text-[#191b23]">
            {value}
          </h3>
        </div>
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${className}`}
        >
          <span className="material-symbols-outlined text-[24px]">{icon}</span>
        </div>
      </div>
    </div>
  );
}

function OverviewGrid({ feedbacks }) {
  return (
    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <SummaryCard
        title="Total Feedbacks"
        value={feedbacks.length}
        icon="forum"
        className="bg-blue-50 text-blue-600"
      />
      <SummaryCard
        title="Open"
        value={feedbacks.filter((feedback) => feedback.status === "OPEN").length}
        icon="mark_unread_chat_alt"
        className="bg-blue-50 text-blue-600"
      />
      <SummaryCard
        title="In Progress"
        value={
          feedbacks.filter((feedback) => feedback.status === "IN_PROGRESS")
            .length
        }
        icon="hourglass_top"
        className="bg-amber-50 text-amber-600"
      />
      <SummaryCard
        title="Resolved / Closed"
        value={
          feedbacks.filter((feedback) =>
            ["RESOLVED", "CLOSED"].includes(feedback.status),
          ).length
        }
        icon="task_alt"
        className="bg-emerald-50 text-emerald-600"
      />
    </div>
  );
}

function StatusBadge({ status }) {
  const meta = getStatusMeta(status);

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-black ${meta.className}`}
    >
      <span className="material-symbols-outlined text-[16px]">{meta.icon}</span>
      {meta.label}
    </span>
  );
}

function FeedbackTable({
  feedbacks,
  loading,
  updatingId,
  onStatusChange,
  onSelectFeedback,
}) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-[#d7d9e4] bg-white p-6 shadow-sm">
        <div className="space-y-3">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-14 animate-pulse rounded-xl bg-slate-100"
            />
          ))}
        </div>
      </div>
    );
  }

  if (feedbacks.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <span className="material-symbols-outlined text-3xl">forum</span>
        </div>
        <h3 className="mt-4 font-['Geist'] text-lg font-bold text-slate-950">
          No feedback found
        </h3>
        <p className="mt-2 text-sm text-slate-500">
          New user reports will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[#d7d9e4] bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-[1120px] border-collapse text-left">
          <thead className="border-b border-[#d7d9e4] bg-[#f8f9fc]">
            <tr>
              {[
                "Customer",
                "Booking",
                "Subject",
                "Status",
                "Created",
                "Update Status",
              ].map((heading) => (
                <th
                  key={heading}
                  className="px-5 py-4 font-['Geist'] text-[11px] font-semibold uppercase tracking-wider text-[#6b7280]"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#eef0f5]">
            {feedbacks.map((feedback) => (
              <tr
                key={feedback.id}
                className="transition hover:bg-[#f8f9fc]"
              >
                <td className="px-5 py-4">
                  <button
                    type="button"
                    onClick={() => onSelectFeedback(feedback)}
                    className="text-left"
                  >
                    <p className="font-['Geist'] text-sm font-bold text-[#191b23]">
                      {feedback.customerName || "Unknown user"}
                    </p>
                    <p className="mt-0.5 max-w-[220px] truncate font-['Inter'] text-xs text-[#6b7280]">
                      {feedback.user?.email || "No email"}
                    </p>
                  </button>
                </td>
                <td className="px-5 py-4">
                  <p className="font-['Geist'] text-sm font-bold text-[#191b23]">
                    {feedback.reservationCode || feedback.ticketCode || "No booking"}
                  </p>
                  <p className="mt-0.5 text-xs text-[#6b7280]">
                    {feedback.parkingSession?.licensePlate || "RSV booking"}
                  </p>
                </td>
                <td className="px-5 py-4">
                  <p className="max-w-[280px] truncate font-['Geist'] text-sm font-bold text-[#191b23]">
                    {feedback.subject}
                  </p>
                  <p className="mt-0.5 max-w-[320px] truncate font-['Inter'] text-xs text-[#6b7280]">
                    {feedback.message}
                  </p>
                </td>
                <td className="px-5 py-4">
                  <StatusBadge status={feedback.status} />
                </td>
                <td className="px-5 py-4 font-['Inter'] text-sm text-[#6b7280]">
                  {formatDateTime(feedback.createdAt)}
                </td>
                <td className="px-5 py-4">
                  <select
                    value={feedback.status || "OPEN"}
                    disabled={updatingId === feedback.id}
                    onChange={(event) =>
                      onStatusChange(feedback, event.target.value)
                    }
                    className="h-10 rounded-xl border border-[#d7d9e4] bg-white px-3 font-['Inter'] text-sm font-semibold text-[#374151] outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {feedbackStatuses.map((status) => (
                      <option key={status} value={status}>
                        {getStatusMeta(status).label}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DetailPanel({ feedback }) {
  if (!feedback) {
    return (
      <aside className="rounded-2xl border border-[#d7d9e4] bg-white p-5 shadow-sm">
        <h3 className="font-['Geist'] text-lg font-bold text-[#191b23]">
          Feedback Detail
        </h3>
        <p className="mt-2 text-sm leading-6 text-[#6b7280]">
          Select a feedback row to inspect the full message and linked parking
          session.
        </p>
      </aside>
    );
  }

  return (
    <aside className="rounded-2xl border border-[#d7d9e4] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-['Geist'] text-lg font-bold text-[#191b23]">
            {feedback.subject}
          </h3>
          <p className="mt-1 text-xs font-semibold text-[#6b7280]">
            {formatDateTime(feedback.createdAt)}
          </p>
        </div>
        <StatusBadge status={feedback.status} />
      </div>

      <div className="mt-5 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-700 ring-1 ring-slate-100">
        {feedback.message}
      </div>

      <div className="mt-5 space-y-3">
        <div className="rounded-xl border border-slate-200 p-4">
          <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">
            Customer
          </p>
          <p className="mt-1 font-['Geist'] text-sm font-bold text-slate-900">
            {feedback.customerName || "Unknown user"}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            {feedback.user?.email || "No email"}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 p-4">
          <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">
            Booking
          </p>
          <p className="mt-1 font-['Geist'] text-sm font-bold text-slate-900">
            {feedback.reservationCode || feedback.ticketCode || "No linked booking"}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            License plate: {feedback.parkingSession?.licensePlate || "N/A"}
          </p>
        </div>
      </div>
    </aside>
  );
}

export default function FeedbacksPage() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [updatingId, setUpdatingId] = useState("");

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        setLoading(true);
        setError("");
        const result = await apiRequest("/api/feedbacks");
        const nextFeedbacks = result.data || [];
        setFeedbacks(nextFeedbacks);
        setSelectedFeedback(nextFeedbacks[0] || null);
      } catch (fetchError) {
        setError(fetchError.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, []);

  const filteredFeedbacks = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    return feedbacks.filter((feedback) => {
      const matchesStatus =
        statusFilter === "ALL" || feedback.status === statusFilter;
      const matchesKeyword =
        !normalizedKeyword ||
        [
          feedback.customerName,
          feedback.reservationCode,
          feedback.ticketCode,
          feedback.subject,
          feedback.message,
          feedback.user?.email,
          feedback.parkingSession?.licensePlate,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value).toLowerCase().includes(normalizedKeyword),
          );

      return matchesStatus && matchesKeyword;
    });
  }, [feedbacks, keyword, statusFilter]);

  const handleStatusChange = async (feedback, status) => {
    try {
      setUpdatingId(feedback.id);
      const result = await apiRequest(`/api/feedbacks/${feedback.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });

      setFeedbacks((currentFeedbacks) =>
        currentFeedbacks.map((currentFeedback) =>
          currentFeedback.id === feedback.id ? result.data : currentFeedback,
        ),
      );
      setSelectedFeedback((currentFeedback) =>
        currentFeedback?.id === feedback.id ? result.data : currentFeedback,
      );
    } catch (updateError) {
      alert(updateError.message);
    } finally {
      setUpdatingId("");
    }
  };

  return (
    <AdminLayout>
      <PageHeader />
      <OverviewGrid feedbacks={feedbacks} />

      <div className="mb-6 rounded-2xl border border-[#d7d9e4] bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1 lg:max-w-xl">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              search
            </span>
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Search customer, ticket, subject, message..."
              className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-4 font-['Inter'] text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 font-['Inter'] text-sm font-bold text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
          >
            <option value="ALL">All Statuses</option>
            {feedbackStatuses.map((status) => (
              <option key={status} value={status}>
                {getStatusMeta(status).label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center text-red-700">
          <span className="material-symbols-outlined text-4xl">error</span>
          <p className="mt-3 font-['Geist'] text-lg font-bold">
            Cannot load feedbacks
          </p>
          <p className="mt-1 text-sm">{error}</p>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <FeedbackTable
            feedbacks={filteredFeedbacks}
            loading={loading}
            updatingId={updatingId}
            onStatusChange={handleStatusChange}
            onSelectFeedback={setSelectedFeedback}
          />
          <DetailPanel feedback={selectedFeedback} />
        </div>
      )}
    </AdminLayout>
  );
}
