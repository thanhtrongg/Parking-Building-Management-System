import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { apiRequest } from "../../services/api";
import useAutoRefresh from "../../hooks/useAutoRefresh";
import CustomSelect from "../../components/CustomSelect";

const feedbackStatuses = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];
const feedbackCategories = {
  GENERAL: "General",
  PARKING_SERVICE: "Parking Service",
  FACILITY: "Facility",
  PAYMENT: "Payment",
  TECHNICAL: "Technical",
  STAFF_ATTITUDE: "Staff Attitude",
};

function CategoryBadge({ category }) {
  const isPrivate = category === "STAFF_ATTITUDE";
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-black ${
      isPrivate
        ? "border-rose-200 bg-rose-50 text-rose-700"
        : "border-slate-200 bg-slate-100 text-slate-600"
    }`}>
      {isPrivate ? "Private · " : ""}
      {feedbackCategories[category] || "General"}
    </span>
  );
}

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

  return new Intl.DateTimeFormat("en-US", {
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
    <div className="feedback-surface rounded-2xl border border-[#d2b77a] bg-[#fffdfa] p-5 shadow-[0_18px_42px_rgba(86,63,23,0.16)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-['Geist'] text-[11px] font-semibold uppercase tracking-wider text-[#6b5a3d]">
            {title}
          </p>
          <h3 className="mt-2 font-['Geist'] text-2xl font-bold text-[#191b23]">
            {value}
          </h3>
        </div>
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-inner ${className}`}
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
  onOpenDetail,
}) {
  if (loading) {
    return (
      <div className="feedback-panel rounded-2xl border border-amber-200 bg-[#fffaf0] p-6 shadow-sm shadow-amber-900/10">
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
      <div className="feedback-panel rounded-2xl border border-dashed border-amber-300 bg-[#fffaf0] px-6 py-12 text-center shadow-sm shadow-amber-900/10">
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
    <div className="feedback-panel overflow-hidden rounded-2xl border border-amber-200 bg-[#fffaf0] shadow-sm shadow-amber-900/10">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1120px] border-collapse text-left">
          <thead className="border-b border-[#d7d9e4] bg-[#f8f9fc]">
            <tr>
              {[
                "Customer",
                "Booking",
                "Category",
                "Subject",
                "Status",
                "Created",
                "Actions",
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
                  <CategoryBadge category={feedback.category} />
                </td>
                <td className="px-5 py-4">
                  <div className="text-left">
                    <p className="font-['Geist'] text-sm font-bold text-[#191b23]">
                      {feedback.customerName || "Unknown user"}
                    </p>
                    <p className="mt-0.5 max-w-[220px] truncate font-['Inter'] text-xs text-[#6b7280]">
                      {feedback.user?.email || "No email"}
                    </p>
                  </div>
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
                  <div className="flex items-center gap-2">
                    <CustomSelect
                      options={feedbackStatuses.map(status => ({ value: status, label: getStatusMeta(status).label }))}
                      value={feedback.status || "OPEN"}
                      disabled={updatingId === feedback.id}
                      onChange={(val) => onStatusChange(feedback, val)}
                      className="h-10 rounded-xl border border-amber-200 bg-[#fffaf0] px-3 font-['Inter'] text-sm font-semibold text-[#374151] outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-[#fbf4e7] dark:focus:bg-[#070705] min-w-[125px]"
                      popupClassName="w-36 right-0 mt-1.5"
                    />

                    <button
                      type="button"
                      onClick={() => onOpenDetail(feedback)}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3 font-['Inter'] text-sm font-black text-blue-700 transition hover:bg-blue-100"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        visibility
                      </span>
                      Detail
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DetailPage({
  feedback,
  updatingId,
  reply,
  replySentAt,
  replying,
  onBack,
  onReplyChange,
  onReplySubmit,
  onStatusChange,
}) {
  if (!feedback) {
    return null;
  }

  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="mb-5 inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-amber-200 bg-[#fffaf0] px-4 font-['Inter'] text-sm font-black text-slate-700 transition hover:bg-[#f7ecd5]"
      >
        <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        Back to feedbacks
      </button>

      <section className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <div className="rounded-xl border border-amber-200 bg-[#fffaf0] p-5 shadow-sm shadow-amber-900/10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-['Inter'] text-xs font-black uppercase tracking-wider text-[#6b7280]">
                Feedback Detail
              </p>
              <h3 className="mt-1 font-['Geist'] text-2xl font-bold text-[#191b23]">
                {feedback.subject}
              </h3>
              <div className="mt-2">
                <CategoryBadge category={feedback.category} />
              </div>
              <p className="mt-1 text-xs font-semibold text-[#6b7280]">
                {formatDateTime(feedback.createdAt)}
              </p>
            </div>
            <StatusBadge status={feedback.status} />
          </div>

          <div className="mt-5 rounded-xl bg-[#f7ecd5] p-4 text-sm leading-6 text-slate-700 ring-1 ring-amber-200">
            {feedback.message}
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
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
              <p className="mt-0.5 text-xs text-slate-500">
                Phone: {feedback.user?.phone || "N/A"}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                Booking
              </p>
              <p className="mt-1 font-['Geist'] text-sm font-bold text-slate-900">
                {feedback.reservationCode ||
                  feedback.ticketCode ||
                  "No linked booking"}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                License plate: {feedback.parkingSession?.licensePlate || "N/A"}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                Ticket: {feedback.ticketCode || "N/A"}
              </p>
            </div>
          </div>
        </div>

        <form
          onSubmit={onReplySubmit}
          className="rounded-xl border border-amber-200 bg-[#fffaf0] p-5 shadow-sm shadow-amber-900/10"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-['Geist'] text-lg font-bold text-[#191b23]">
                Reply to Customer
              </h3>
              <p className="mt-1 text-sm leading-6 text-[#6b7280]">
                Send and save a support response for this feedback.
              </p>
            </div>
            <span className="material-symbols-outlined text-blue-600">
              outgoing_mail
            </span>
          </div>

          <label className="mt-5 block">
            <span className="font-['Inter'] text-xs font-black uppercase tracking-wider text-slate-400">
              Customer Response
            </span>
            <textarea
              value={reply}
              onChange={(event) => onReplyChange(event.target.value)}
              rows={8}
              className="mt-2 w-full resize-none rounded-xl border border-amber-200 bg-[#f7ecd5] px-4 py-3 font-['Inter'] text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:bg-[#fffaf0] focus:ring-4 focus:ring-amber-500/10"
              placeholder="Write the response to send to the customer..."
              required
            />
          </label>

          {replySentAt ? (
            <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
              Reply saved at {formatDateTime(replySentAt)}.
            </div>
          ) : null}

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CustomSelect
              options={feedbackStatuses.map(status => ({ value: status, label: getStatusMeta(status).label }))}
              value={feedback.status || "OPEN"}
              disabled={updatingId === feedback.id}
              onChange={(val) => onStatusChange(feedback, val)}
              className="h-11 rounded-xl border border-amber-200 bg-[#fffaf0] px-3 font-['Inter'] text-sm font-semibold text-[#374151] outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-[#fbf4e7] dark:focus:bg-[#070705] min-w-[130px]"
              popupClassName="w-40 mt-1.5"
            />

            <button
              type="submit"
              disabled={replying}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 font-['Inter'] text-sm font-black text-white shadow-md shadow-blue-200 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {replying ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              ) : (
                <span className="material-symbols-outlined text-[20px]">
                  send
                </span>
              )}
              {replying ? "Sending..." : "Send Reply"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default function FeedbacksPage() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeBuildingId, setActiveBuildingId] = useState(() => localStorage.getItem("activeSystemBuildingId") || "");

  useEffect(() => {
    const handleBuildingChange = (e) => {
      setActiveBuildingId(e.detail);
    };
    window.addEventListener("systemBuildingChanged", handleBuildingChange);
    return () => {
      window.removeEventListener("systemBuildingChanged", handleBuildingChange);
    };
  }, []);

  const buildingFeedbacks = useMemo(() => {
    if (!activeBuildingId) return feedbacks;
    return feedbacks.filter((f) => !f.buildingId || f.buildingId === activeBuildingId);
  }, [feedbacks, activeBuildingId]);
  const [error, setError] = useState("");
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [detailFeedback, setDetailFeedback] = useState(null);
  const [replies, setReplies] = useState({});
  const [updatingId, setUpdatingId] = useState("");
  const [replyingId, setReplyingId] = useState("");

  const normalizeFeedback = (fb) => {
    if (!fb) return null;
    return {
      ...fb,
      customerName: fb.driverName || "Unknown user",
      user: {
        email: fb.driverEmail || "No email",
        phone: fb.driverPhone || "N/A"
      },
      subject: fb.category || "No category",
      message: fb.content || ""
    };
  };

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        setLoading(true);
        setError("");
        const result = await apiRequest("/api/feedbacks");
        const nextFeedbacks = (result.data || []).map(normalizeFeedback);
        setFeedbacks(nextFeedbacks);
      } catch (fetchError) {
        setError(fetchError.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, []);

  useAutoRefresh(async () => {
    const result = await apiRequest("/api/feedbacks");
    setFeedbacks(result.data || []);
  });

  const filteredFeedbacks = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    return buildingFeedbacks.filter((feedback) => {
      const matchesStatus =
        statusFilter === "ALL" || feedback.status === statusFilter;
      const matchesCategory =
        categoryFilter === "ALL" || feedback.category === categoryFilter;
      const matchesKeyword =
        !normalizedKeyword ||
        [
          feedback.customerName,
          feedback.reservationCode,
          feedback.ticketCode,
          feedback.subject,
          feedback.category,
          feedback.message,
          feedback.user?.email,
          feedback.parkingSession?.licensePlate,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value).toLowerCase().includes(normalizedKeyword),
          );

      return matchesStatus && matchesCategory && matchesKeyword;
    });
  }, [buildingFeedbacks, keyword, statusFilter, categoryFilter]);

  const handleStatusChange = async (feedback, status) => {
    try {
      setUpdatingId(feedback.id);
      const result = await apiRequest(`/api/feedbacks/${feedback.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });

      const normalized = normalizeFeedback(result.data);
      setFeedbacks((currentFeedbacks) =>
        currentFeedbacks.map((currentFeedback) =>
          currentFeedback.id === feedback.id ? normalized : currentFeedback,
        ),
      );
      setDetailFeedback((currentFeedback) =>
        currentFeedback?.id === feedback.id ? normalized : currentFeedback,
      );
    } catch (updateError) {
      alert(updateError.message);
    } finally {
      setUpdatingId("");
    }
  };

  const handleOpenDetail = (feedback) => {
    setDetailFeedback(feedback);
  };

  const handleReplyChange = (value) => {
    if (!detailFeedback) return;

    setReplies((currentReplies) => ({
      ...currentReplies,
      [detailFeedback.id]: {
        ...(currentReplies[detailFeedback.id] || {}),
        message: value,
      },
    }));
  };

  const handleReplySubmit = async (event) => {
    event.preventDefault();
    if (!detailFeedback) return;

    const message = replies[detailFeedback.id]?.message?.trim();
    if (!message) return;

    try {
      setReplyingId(detailFeedback.id);
      const result = await apiRequest(`/api/feedbacks/${detailFeedback.id}/reply`, {
        method: "PATCH",
        body: JSON.stringify({ reply: message }),
      });

      const normalized = normalizeFeedback(result.data);
      setFeedbacks((currentFeedbacks) =>
        currentFeedbacks.map((feedback) =>
          feedback.id === detailFeedback.id ? normalized : feedback,
        ),
      );
      setDetailFeedback(normalized);
      setReplies((currentReplies) => ({
        ...currentReplies,
        [detailFeedback.id]: {
          message: result.data.reply || message,
          sentAt: result.data.replyCreatedAt || new Date().toISOString(),
        },
      }));
    } catch (replyError) {
      alert(replyError.message);
    } finally {
      setReplyingId("");
    }
  };

  if (detailFeedback) {
    const detailReply = replies[detailFeedback.id] || {};
    const replyMessage = detailReply.message ?? detailFeedback.reply ?? "";
    const replySentAt = detailReply.sentAt || detailFeedback.replyCreatedAt || "";

    return (
      <AdminLayout>
        <DetailPage
          feedback={detailFeedback}
          updatingId={updatingId}
          reply={replyMessage}
          replySentAt={replySentAt}
          replying={replyingId === detailFeedback.id}
          onBack={() => setDetailFeedback(null)}
          onReplyChange={handleReplyChange}
          onReplySubmit={handleReplySubmit}
          onStatusChange={handleStatusChange}
        />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="feedback-management-page">
        <PageHeader />
        <OverviewGrid feedbacks={buildingFeedbacks} />

        <div className="feedback-panel mb-6 rounded-2xl border border-amber-200 bg-[#fffaf0] p-4 shadow-sm shadow-amber-900/10">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative flex-1 lg:max-w-xl">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                search
              </span>
              <input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="Search customer, ticket, subject, message..."
                className="h-12 w-full rounded-xl border border-amber-200 bg-[#f7ecd5] pl-12 pr-4 font-['Inter'] text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:bg-[#fffaf0] focus:ring-4 focus:ring-amber-500/10"
              />
            </div>

            <CustomSelect
              options={[
                { value: "ALL", label: "All Categories" },
                ...Object.entries(feedbackCategories).map(([value, label]) => ({ value, label }))
              ]}
              value={categoryFilter}
              onChange={setCategoryFilter}
              className="h-12 rounded-xl border border-amber-200 bg-[#f7ecd5] px-4 font-['Inter'] text-sm font-bold text-slate-700 outline-none transition focus:border-amber-400 focus:bg-[#fffaf0] focus:ring-4 focus:ring-amber-500/10 dark:border-white/10 dark:bg-white/5 dark:text-[#fbf4e7] dark:focus:bg-[#070705] min-w-[160px]"
              popupClassName="w-48 mt-1.5"
            />

            <CustomSelect
              options={[
                { value: "ALL", label: "All Statuses" },
                ...feedbackStatuses.map(status => ({ value: status, label: getStatusMeta(status).label }))
              ]}
              value={statusFilter}
              onChange={setStatusFilter}
              className="h-12 rounded-xl border border-amber-200 bg-[#f7ecd5] px-4 font-['Inter'] text-sm font-bold text-slate-700 outline-none transition focus:border-amber-400 focus:bg-[#fffaf0] focus:ring-4 focus:ring-amber-500/10 dark:border-white/10 dark:bg-white/5 dark:text-[#fbf4e7] dark:focus:bg-[#070705] min-w-[160px]"
              popupClassName="w-48 mt-1.5"
            />
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
          <div>
            <FeedbackTable
              feedbacks={filteredFeedbacks}
              loading={loading}
              updatingId={updatingId}
              onStatusChange={handleStatusChange}
              onOpenDetail={handleOpenDetail}
            />
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
