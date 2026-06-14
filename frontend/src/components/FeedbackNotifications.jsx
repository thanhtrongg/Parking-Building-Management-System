import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAutoRefresh from "../hooks/useAutoRefresh";
import { apiRequest } from "../services/api";

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

function formatTime(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function FeedbackNotifications({ audience }) {
  const navigate = useNavigate();
  const user = useMemo(() => getStoredUser(), []);
  const storageKey = `feedbackNotificationsSeen:${audience}:${user?.id || "current"}`;
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [seenAt, setSeenAt] = useState(() => localStorage.getItem(storageKey) || "");
  const containerRef = useRef(null);

  const loadNotifications = useCallback(async () => {
    const endpoint = audience === "user" ? "/api/user/feedbacks" : "/api/feedbacks";
    const result = await apiRequest(endpoint);
    const feedbacks = result.data || [];
    const nextItems =
      audience === "user"
        ? feedbacks.filter((feedback) => feedback.reply)
        : feedbacks;

    setItems(
      nextItems
        .map((feedback) => ({
          id: feedback.id,
          title:
            audience === "user"
              ? `Response: ${feedback.subject}`
              : `New feedback: ${feedback.subject}`,
          description:
            audience === "user"
              ? feedback.reply
              : `${feedback.customerName || "User"} · ${feedback.message}`,
          timestamp:
            audience === "user"
              ? feedback.replyCreatedAt || feedback.createdAt
              : feedback.createdAt,
        }))
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 8),
    );
  }, [audience]);

  useEffect(() => {
    const initialLoad = window.setTimeout(loadNotifications, 0);
    const closeOnOutsideClick = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", closeOnOutsideClick);

    return () => {
      window.clearTimeout(initialLoad);
      document.removeEventListener("mousedown", closeOnOutsideClick);
    };
  }, [loadNotifications]);

  useAutoRefresh(loadNotifications, { intervalMs: 10_000 });

  const unreadCount = items.filter(
    (item) => !seenAt || new Date(item.timestamp) > new Date(seenAt),
  ).length;

  const handleToggle = () => {
    setOpen((current) => {
      const nextOpen = !current;
      if (nextOpen) {
        const nextSeenAt = new Date().toISOString();
        localStorage.setItem(storageKey, nextSeenAt);
        setSeenAt(nextSeenAt);
      }
      return nextOpen;
    });
  };

  const handleOpenFeedbacks = () => {
    setOpen(false);
    navigate(audience === "user" ? "/user-feedback" : "/feedbacks");
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={handleToggle}
        aria-label="Open notifications"
        className="relative grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
      >
        <span className="material-symbols-outlined text-[21px] leading-none">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 grid min-h-5 min-w-5 place-items-center rounded-full bg-red-500 px-1 text-[10px] font-black text-white ring-2 ring-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+0.75rem)] w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/15">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div>
              <p className="text-sm font-black text-slate-950">Feedback notifications</p>
              <p className="text-xs font-semibold text-slate-500">{items.length} recent items</p>
            </div>
            <span className="material-symbols-outlined text-blue-600">notifications_active</span>
          </div>

          <div className="max-h-80 overflow-y-auto p-2">
            {items.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm font-semibold text-slate-500">
                No feedback notifications yet.
              </div>
            ) : (
              items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={handleOpenFeedbacks}
                  className="w-full rounded-xl px-3 py-3 text-left transition hover:bg-slate-50"
                >
                  <p className="truncate text-sm font-black text-slate-950">{item.title}</p>
                  <p className="mt-1 line-clamp-2 text-xs font-medium leading-5 text-slate-500">
                    {item.description}
                  </p>
                  <p className="mt-1 text-[11px] font-bold text-blue-600">{formatTime(item.timestamp)}</p>
                </button>
              ))
            )}
          </div>

          <button
            type="button"
            onClick={handleOpenFeedbacks}
            className="flex h-11 w-full items-center justify-center gap-2 border-t border-slate-100 text-sm font-black text-blue-600 hover:bg-blue-50"
          >
            View all feedbacks
            <span className="material-symbols-outlined text-lg">arrow_forward</span>
          </button>
        </div>
      )}
    </div>
  );
}
