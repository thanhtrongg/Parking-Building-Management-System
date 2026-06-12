import { useEffect, useMemo, useState } from "react";
import UserLayout from "../../components/UserLayout";
import { apiRequest } from "../../services/api";
import {
  calculateLiveSessionFee,
  formatElapsedTime,
} from "../../utils/parkingSession";
import useAutoRefresh from "../../hooks/useAutoRefresh";

const filters = [
  { label: "All", value: "" },
  { label: "Active", value: "ACTIVE" },
  { label: "Completed", value: "COMPLETED" },
];

const statusStyles = {
  ACTIVE: "bg-blue-50 text-blue-700 ring-blue-100",
  COMPLETED: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  CANCELLED: "bg-red-50 text-red-700 ring-red-100",
};

function normalizeSessions(value) {
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

function formatCurrency(amount) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(Number(amount || 0));
}

function Badge({ value, styles, fallback = "N/A" }) {
  const normalizedValue = String(value || fallback).toUpperCase();

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-black uppercase ring-1 ${
        styles[normalizedValue] || "bg-slate-100 text-slate-700 ring-slate-200"
      }`}
    >
      {normalizedValue}
    </span>
  );
}

function PageHeader({ total }) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <h1 className="font-['Geist'] text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
          Parking Sessions
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Track your active and completed parking sessions with ticket,
          vehicle, location, and payment status.
        </p>
      </div>

      <div className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 shadow-sm">
        <span className="material-symbols-outlined text-[20px]">
          confirmation_number
        </span>
        {total} sessions
      </div>
    </div>
  );
}

function FilterTabs({ value, onChange }) {
  return (
    <div className="mb-5 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
      <div className="flex min-w-max gap-2">
        {filters.map((filter) => {
          const isActive = filter.value === value;

          return (
            <button
              key={filter.label}
              type="button"
              onClick={() => onChange(filter.value)}
              className={`h-10 rounded-xl px-4 text-sm font-black transition ${
                isActive
                  ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
              }`}
            >
              {filter.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
      {[1, 2, 3, 4].map((item) => (
        <div
          key={item}
          className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="h-6 w-40 rounded-full bg-slate-100" />
          <div className="mt-5 h-4 w-2/3 rounded-full bg-slate-100" />
          <div className="mt-8 grid grid-cols-2 gap-3">
            <div className="h-16 rounded-xl bg-slate-100" />
            <div className="h-16 rounded-xl bg-slate-100" />
            <div className="h-16 rounded-xl bg-slate-100" />
            <div className="h-16 rounded-xl bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ status }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center shadow-sm">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-blue-50 text-blue-600">
        <span className="material-symbols-outlined text-[34px]">
          local_parking
        </span>
      </div>
      <h2 className="mt-5 font-['Geist'] text-xl font-black text-slate-950">
        No parking sessions found
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        {status
          ? `You do not have ${status.toLowerCase()} parking sessions yet.`
          : "Your parking sessions will appear here after check-in."}
      </p>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="min-w-0 rounded-xl bg-slate-50 p-3 ring-1 ring-slate-100">
      <p className="truncate text-xs font-black uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-1 break-words font-black text-slate-950">
        {value || "N/A"}
      </p>
    </div>
  );
}

function SessionCard({ session, now }) {
  const isActive = String(session.status || "").toUpperCase() === "ACTIVE";
  const hasAssignedSlot = Boolean(session.assignedSlotName);
  const displayedFee = calculateLiveSessionFee(session, now);

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="break-all font-['Geist'] text-lg font-black text-slate-950">
              {session.ticketCode || "No ticket"}
            </h2>
            <Badge value={session.status} styles={statusStyles} />
          </div>
          <p className="mt-2 text-sm font-semibold text-slate-700">
            {isActive ? "Currently parked" : "Completed parking session"}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:flex-col sm:items-end">
          <span className="text-xs font-black uppercase tracking-wider text-slate-400">
            {isActive ? "Current fee" : "Final fee"}
          </span>
          <span className="font-['Geist'] text-lg font-black text-slate-950">
            {formatCurrency(displayedFee)}
          </span>
        </div>
      </div>

      <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
        <Info label="Vehicle Type" value={session.vehicleTypeName} />
        <Info label="License Plate" value={session.licensePlate} />
        <Info label="Actual Slot" value={session.slotName} />
        <Info label="Zone" value={session.zoneName} />
        {hasAssignedSlot ? (
          <Info
            label="Reserved Slot"
            value={`${session.reservedSlotName || "N/A"} - ${
              session.reservedZoneName || "N/A"
            }`}
          />
        ) : null}
        <Info label="Entry Time" value={formatDateTime(session.entryTime)} />
        <Info label="Exit Time" value={formatDateTime(session.exitTime)} />
        <Info
          label="Duration"
          value={formatElapsedTime(session, now)}
        />
        <Info
          label="Payment"
          value={
            isActive
              ? "Pay on checkout"
              : `${session.paymentStatus || "PENDING"}${
                  session.paymentMethod ? ` - ${session.paymentMethod}` : ""
                }`
          }
        />
      </div>
    </article>
  );
}

export default function UserParkingSessionsPage() {
  const [status, setStatus] = useState("");
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let ignore = false;

    async function loadSessions() {
      try {
        setLoading(true);
        setError("");

        const query = status ? `?status=${status}` : "";
        const result = await apiRequest(`/api/user/parking-sessions${query}`);

        if (!ignore) {
          setSessions(normalizeSessions(result));
        }
      } catch (loadError) {
        if (!ignore) {
          setError(loadError.message || "Cannot load parking sessions");
          setSessions([]);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadSessions();

    return () => {
      ignore = true;
    };
  }, [status]);

  useAutoRefresh(async () => {
    const query = status ? `?status=${status}` : "";
    const result = await apiRequest(`/api/user/parking-sessions${query}`);
    setSessions(normalizeSessions(result));
  });

  const sortedSessions = useMemo(() => {
    return [...sessions].sort((a, b) => {
      return new Date(b.entryTime || 0) - new Date(a.entryTime || 0);
    });
  }, [sessions]);

  return (
    <UserLayout>
      <PageHeader total={sessions.length} />
      <FilterTabs value={status} onChange={setStatus} />

      {loading ? (
        <LoadingState />
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center text-sm font-bold text-red-700">
          {error}
        </div>
      ) : sortedSessions.length === 0 ? (
        <EmptyState status={status} />
      ) : (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          {sortedSessions.map((session) => (
            <SessionCard key={session.id} session={session} now={now} />
          ))}
        </div>
      )}
    </UserLayout>
  );
}
