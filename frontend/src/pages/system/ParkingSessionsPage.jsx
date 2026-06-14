import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import { apiRequest } from "../../services/api";
import {
    calculateLiveSessionFee,
    formatElapsedTime,
} from "../../utils/parkingSession";
import useAutoRefresh from "../../hooks/useAutoRefresh";

// Helper to format date-time
const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(amount || 0);
};

const paymentMethods = [
    { value: "CASH", label: "Cash", icon: "payments" },
    { value: "CARD", label: "Card", icon: "credit_card" },
    { value: "SEPAY", label: "SePay", icon: "qr_code_2" },
];

function EmptyState({ onRefresh }) {
    return (
        <div className="rounded-[28px] border border-dashed border-slate-300 bg-white/80 px-6 py-14 text-center shadow-sm backdrop-blur">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <span className="material-symbols-outlined text-4xl">hourglass_top</span>
            </div>
            <h3 className="mt-5 font-['Geist'] text-xl font-semibold text-slate-950">
                No parking sessions found
            </h3>
            <p className="mx-auto mt-2 max-w-md font-['Inter'] text-sm leading-6 text-slate-500">
                There are no active or completed parking sessions matching your current filters.
            </p>
            <button
                onClick={onRefresh}
                className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 font-['Inter'] text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:-translate-y-0.5 hover:bg-blue-700 active:translate-y-0"
            >
                <span className="material-symbols-outlined text-xl">refresh</span>
                Refresh Data
            </button>
        </div>
    );
}

function LoadingState() {
    return (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
                <div
                    key={item}
                    className="h-64 animate-pulse rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm"
                >
                    <div className="flex justify-between">
                        <div className="h-6 w-24 rounded-full bg-slate-100" />
                        <div className="h-6 w-16 rounded-full bg-slate-100" />
                    </div>
                    <div className="mt-6 h-5 w-3/4 rounded-full bg-slate-100" />
                    <div className="mt-3 h-4 w-1/2 rounded-full bg-slate-100" />
                    <div className="mt-6 h-10 rounded-2xl bg-slate-100" />
                </div>
            ))}
        </div>
    );
}

function PageHero({ total, activeCount }) {
    return (
        <div className="relative mb-7 overflow-hidden rounded-[32px] border border-amber-200 bg-[#fffaf0] p-6 shadow-xl shadow-amber-900/10 md:p-8">
            <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-amber-200/55 blur-3xl" />
            <div className="absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-[#d7b46a]/25 blur-3xl" />
            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 font-['Inter'] text-xs font-bold text-amber-800">
                        <span className="material-symbols-outlined text-base">hourglass_top</span>
                        Live Parking Sessions
                    </div>
                    <h2 className="mt-5 max-w-3xl font-['Geist'] text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
                        Session Management
                    </h2>
                    <p className="mt-3 max-w-2xl font-['Inter'] text-sm leading-6 text-slate-600">
                        Monitor active parking sessions, track durations, and manage check-outs or completed sessions.
                    </p>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center">
                    <Link
                        to="/parking-sessions/create"
                        className="col-span-2 inline-flex min-h-16 items-center justify-center gap-2 rounded-3xl bg-slate-950 px-5 font-['Inter'] text-sm font-bold text-white shadow-lg shadow-slate-950/20 transition hover:-translate-y-0.5 hover:bg-blue-700 sm:col-span-1"
                    >
                        <span className="material-symbols-outlined text-xl">add</span>
                        Create
                    </Link>
                    <div className="rounded-3xl border border-amber-200 bg-[#f7ecd5] px-5 py-4 shadow-sm">
                        <p className="font-['Inter'] text-xs font-bold text-amber-800">Total Sessions</p>
                        <p className="mt-1 font-['Geist'] text-3xl font-bold text-slate-950">{total}</p>
                    </div>
                    <div className="rounded-3xl border border-emerald-200 bg-emerald-50 px-5 py-4 shadow-sm">
                        <p className="font-['Inter'] text-xs font-bold text-emerald-700">Currently Active</p>
                        <p className="mt-1 font-['Geist'] text-3xl font-bold text-emerald-400">{activeCount}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function FilterBar({ keyword, onKeywordChange, statusFilter, onStatusChange, total }) {
    return (
        <div className="mb-6 rounded-[24px] border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="relative flex-1 lg:max-w-xl">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        search
                    </span>
                    <input
                        value={keyword}
                        onChange={(event) => onKeywordChange(event.target.value)}
                        placeholder="Search by user name, phone, or slot name..."
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 font-['Inter'] text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                    />
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <select
                        value={statusFilter}
                        onChange={(event) => onStatusChange(event.target.value)}
                        className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 font-['Inter'] text-sm font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/5 dark:text-[#fbf4e7] dark:focus:bg-[#070705]"
                    >
                        <option value="all" className="dark:bg-[#11100c] dark:text-[#fbf4e7]">All Statuses</option>
                        <option value="ACTIVE" className="dark:bg-[#11100c] dark:text-[#fbf4e7]">Active</option>
                        <option value="COMPLETED" className="dark:bg-[#11100c] dark:text-[#fbf4e7]">Completed</option>
                    </select>

                    <div className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-4 font-['Inter'] text-sm text-slate-500">
                        <span className="font-semibold text-slate-900">{total}</span>
                        <span className="ml-1">results</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SessionCard({ session, now, onView, onCheckout }) {
    const isActive = session.status === "ACTIVE";
    const displayedFee = calculateLiveSessionFee(session, now);

    return (
        <article className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${isActive ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"}`}>
                        <span className="material-symbols-outlined text-2xl">
                            {isActive ? "hourglass_top" : "check_circle"}
                        </span>
                    </div>
                    <div>
                        <h3 className="font-['Geist'] text-lg font-bold text-slate-950">
                            {session.parkingSlot?.slotName || "Unknown Slot"}
                        </h3>
                        <p className="font-['Inter'] text-xs text-slate-500">
                            {session.parkingSlot?.zone?.zoneName || "Unknown Zone"}
                        </p>
                    </div>
                </div>
                <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${isActive
                        ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                        : "bg-slate-100 text-slate-600 ring-1 ring-slate-200"
                    }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
                    {session.status}
                </span>
            </div>

            <div className="mt-5 space-y-3">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="material-symbols-outlined text-lg text-slate-400">person</span>
                    <span className="font-['Inter'] font-medium">{session.user?.fullName || "Guest"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="material-symbols-outlined text-lg text-slate-400">directions_car</span>
                    <span className="font-['Inter'] font-medium">{session.vehicleType?.typeName || "Unknown"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="material-symbols-outlined text-lg text-slate-400">schedule</span>
                    <span className="font-['Inter'] font-medium">
                        {formatDateTime(session.startTime)}
                    </span>
                </div>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                <div>
                    <p className="font-['Inter'] text-xs text-slate-400">Elapsed Time</p>
                    <p className="font-['Geist'] text-lg font-bold text-blue-700">
                        {formatElapsedTime(session, now)}
                    </p>
                    <p className="font-['Inter'] text-xs text-slate-400">Current Fee</p>
                    <p className="font-['Geist'] text-xl font-bold text-slate-950">
                        {formatCurrency(displayedFee)}
                    </p>
                    <p className="mt-1 font-['Inter'] text-xs font-semibold text-slate-500">
                        {session.payment
                            ? `${session.payment.status} via ${session.payment.method}`
                            : "Unpaid"}
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => onView(session)}
                        className="px-4 py-2.5 rounded-xl bg-slate-100 font-['Inter'] text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
                    >
                        Details
                    </button>
                    {isActive && (
                        <button
                            onClick={() => onCheckout(session)}
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 font-['Inter'] text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700"
                        >
                            <span className="material-symbols-outlined text-lg">logout</span>
                            Complete
                        </button>
                    )}
                </div>
            </div>
        </article>
    );
}

function SessionGrid({ sessions, now, loading, error, onRefresh, onView, onCheckout }) {
    if (loading) return <LoadingState />;
    if (error) {
        return (
            <div className="rounded-[28px] border border-red-200 bg-red-50 px-6 py-10 text-center shadow-sm">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600">
                    <span className="material-symbols-outlined text-3xl">error</span>
                </div>
                <h3 className="mt-4 font-['Geist'] text-lg font-semibold text-red-800">
                    Cannot load sessions
                </h3>
                <p className="mt-2 font-['Inter'] text-sm text-red-600">{error}</p>
                <button
                    onClick={onRefresh}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 font-['Inter'] text-sm font-semibold text-white transition hover:bg-red-700"
                >
                    <span className="material-symbols-outlined text-lg">refresh</span>
                    Try Again
                </button>
            </div>
        );
    }

    if (sessions.length === 0) return <EmptyState onRefresh={onRefresh} />;

    return (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {sessions.map((session) => (
                <SessionCard
                    key={session.id}
                    session={session}
                    now={now}
                    onView={onView}
                    onCheckout={onCheckout}
                />
            ))}
        </div>
    );
}

function DetailModal({ session, now, onClose }) {
    if (!session) return null;
    const isActive = session.status === "ACTIVE";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg overflow-hidden rounded-[28px] bg-white shadow-2xl shadow-slate-950/30">
                <div className={`relative h-36 ${isActive ? "bg-gradient-to-br from-emerald-500 to-teal-600" : "bg-gradient-to-br from-amber-200 to-[#d7b46a]"}`}>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent_40%)]" />
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-4 rounded-2xl bg-white/60 p-2 text-slate-800 backdrop-blur transition hover:bg-white/80"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                    <div className="relative flex h-full items-center justify-center">
                        <div className="flex h-20 w-20 items-center justify-center rounded-[24px] bg-white/55 text-slate-900 shadow-xl backdrop-blur">
                            <span className="material-symbols-outlined text-5xl">
                                {isActive ? "hourglass_top" : "check_circle"}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    <div className="flex items-center justify-between">
                        <span className={`inline-flex rounded-full px-3 py-1 font-['Inter'] text-xs font-bold uppercase tracking-wide ${isActive ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100" : "bg-slate-100 text-slate-600 ring-1 ring-slate-200"
                            }`}>
                            {session.status}
                        </span>
                        <span className="font-['Geist'] text-2xl font-bold text-slate-950">
                            {formatCurrency(calculateLiveSessionFee(session, now))}
                        </span>
                    </div>

                    <h3 className="mt-4 font-['Geist'] text-2xl font-bold text-slate-950">
                        {session.parkingSlot?.slotName || "Unknown Slot"}
                    </h3>
                    <p className="font-['Inter'] text-sm text-slate-500">
                        {session.parkingSlot?.zone?.zoneName || "Unknown Zone"}
                    </p>

                    <div className="mt-6 space-y-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                        <div className="flex items-start gap-3">
                            <span className="material-symbols-outlined mt-0.5 text-slate-400">person</span>
                            <div>
                                <p className="font-['Inter'] text-xs font-semibold uppercase tracking-wide text-slate-400">Customer</p>
                                <p className="font-['Inter'] text-sm font-semibold text-slate-800">{session.user?.fullName || "N/A"}</p>
                                <p className="font-['Inter'] text-xs text-slate-500">{session.user?.phone || "N/A"}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="material-symbols-outlined mt-0.5 text-slate-400">directions_car</span>
                            <div>
                                <p className="font-['Inter'] text-xs font-semibold uppercase tracking-wide text-slate-400">Vehicle</p>
                                <p className="font-['Inter'] text-sm font-semibold text-slate-800">{session.vehicleType?.typeName || "N/A"}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="material-symbols-outlined mt-0.5 text-slate-400">schedule</span>
                            <div>
                                <p className="font-['Inter'] text-xs font-semibold uppercase tracking-wide text-slate-400">Duration</p>
                                <p className="font-['Inter'] text-sm font-semibold text-slate-800">
                                    From: {formatDateTime(session.startTime)}
                                </p>
                                <p className="font-['Inter'] text-sm text-blue-700">
                                    Elapsed: {formatElapsedTime(session, now)}
                                </p>
                                {session.endTime && (
                                    <p className="font-['Inter'] text-sm text-slate-600">
                                        To: {formatDateTime(session.endTime)}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="material-symbols-outlined mt-0.5 text-slate-400">payments</span>
                            <div>
                                <p className="font-['Inter'] text-xs font-semibold uppercase tracking-wide text-slate-400">Payment</p>
                                <p className="font-['Inter'] text-sm font-semibold text-slate-800">
                                    {session.payment
                                        ? `${session.payment.status} - ${session.payment.method}`
                                        : "Unpaid"}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                        <button
                            onClick={onClose}
                            className="rounded-2xl border border-slate-200 px-5 py-3 font-['Inter'] text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function CheckoutModal({
    session,
    now,
    paymentMethod,
    processing,
    onClose,
    onConfirm,
    onPaymentMethodChange,
}) {
    if (!session) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl shadow-slate-950/30">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                    <span className="material-symbols-outlined text-3xl">logout</span>
                </div>
                <h3 className="mt-5 font-['Geist'] text-2xl font-bold text-slate-950">
                    Complete Session?
                </h3>
                <p className="mt-2 font-['Inter'] text-sm leading-6 text-slate-500">
                    You are about to end the parking session for{" "}
                    <span className="font-semibold text-slate-900">
                        {session.parkingSlot?.slotName}
                    </span>
                    . The final fee will be calculated and the slot will be marked as available.
                </p>

                <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <p className="font-['Inter'] text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Final fee
                    </p>
                    <p className="mt-1 font-['Geist'] text-3xl font-bold text-slate-950">
                        {formatCurrency(calculateLiveSessionFee(session, now))}
                    </p>
                    <label className="mt-4 block">
                        <span className="mb-2 block font-['Inter'] text-sm font-semibold text-slate-700">
                            Payment method
                        </span>
                        <select
                            value={paymentMethod}
                            onChange={(event) => onPaymentMethodChange(event.target.value)}
                            disabled={processing}
                            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 font-['Inter'] text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-[#fbf4e7] dark:focus:bg-[#070705]"
                        >
                            {paymentMethods.map((method) => (
                                <option key={method.value} value={method.value} className="dark:bg-[#11100c] dark:text-[#fbf4e7]">
                                    {method.label}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        disabled={processing}
                        className="rounded-2xl border border-slate-200 px-5 py-3 font-['Inter'] text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={processing}
                        className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 font-['Inter'] text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {processing && (
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                        )}
                        {processing ? "Processing..." : "Confirm Checkout"}
                    </button>
                </div>
            </div>
        </div>
    );
}

function Alert({ alert, onClose }) {
    if (!alert.message) return null;
    const isError = alert.type === "error";

    return (
        <div
            className={`mb-5 flex items-start justify-between gap-4 rounded-2xl border px-4 py-3 font-['Inter'] text-sm shadow-sm ${isError
                    ? "border-red-200 bg-red-50 text-red-700"
                    : "border-emerald-200 bg-emerald-50 text-emerald-700"
                }`}
        >
            <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-xl">
                    {isError ? "error" : "check_circle"}
                </span>
                <span className="leading-6">{alert.message}</span>
            </div>
            <button
                onClick={onClose}
                className="rounded-lg p-1 transition hover:bg-black/5"
            >
                <span className="material-symbols-outlined text-lg">close</span>
            </button>
        </div>
    );
}

// ==========================================
// MAIN COMPONENT: Admin Parking Sessions Page
// ==========================================
export default function ParkingSessionsPage() {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Filter State
    const [keyword, setKeyword] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
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

    // Modal State
    const [viewSession, setViewSession] = useState(null);
    const [checkoutSession, setCheckoutSession] = useState(null);
    const [checkoutPaymentMethod, setCheckoutPaymentMethod] = useState("CASH");

    // Action State
    const [processing, setProcessing] = useState(false);
    const [alert, setAlert] = useState({ type: "", message: "" });
    const [now, setNow] = useState(() => new Date());

    useEffect(() => {
        const timer = window.setInterval(() => setNow(new Date()), 1000);
        return () => window.clearInterval(timer);
    }, []);

    const fetchSessions = async () => {
        setLoading(true);
        try {
            // Note: Adjust endpoint '/api/parking-sessions' if your backend uses a different path
            const result = await apiRequest("/api/parking-sessions");
            setSessions(result.data || []);
            setError("");
        } catch (err) {
            setError(err.message || "Cannot load parking sessions");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const initialLoad = window.setTimeout(fetchSessions, 0);
        return () => window.clearTimeout(initialLoad);
    }, []);

    useAutoRefresh(async () => {
        const result = await apiRequest("/api/parking-sessions");
        setSessions(result.data || []);
    });

    const buildingSessions = useMemo(() => {
        if (!activeBuildingId) return sessions;
        return sessions.filter((s) => s.buildingId === activeBuildingId);
    }, [sessions, activeBuildingId]);

    const filteredSessions = useMemo(() => {
        let result = [...buildingSessions];

        if (statusFilter !== "all") {
            result = result.filter((s) => s.status === statusFilter);
        }

        if (keyword.trim()) {
            const lowerKeyword = keyword.toLowerCase();
            result = result.filter(
                (s) =>
                    s.user?.fullName?.toLowerCase().includes(lowerKeyword) ||
                    s.user?.phone?.toLowerCase().includes(lowerKeyword) ||
                    s.parkingSlot?.slotName?.toLowerCase().includes(lowerKeyword) ||
                    s.vehicleType?.typeName?.toLowerCase().includes(lowerKeyword)
            );
        }

        // Sort: Active first, then by startTime descending
        result.sort((a, b) => {
            if (a.status === "ACTIVE" && b.status !== "ACTIVE") return -1;
            if (a.status !== "ACTIVE" && b.status === "ACTIVE") return 1;
            return new Date(b.startTime) - new Date(a.startTime);
        });

        return result;
    }, [buildingSessions, keyword, statusFilter]);

    const handleCheckout = async () => {
        if (!checkoutSession) return;
        setProcessing(true);
        try {
            // Step 1: Initiate check-out to calculate fee
            const checkoutResult = await apiRequest(`/api/sessions/${checkoutSession.id}/check-out?gateOut=Gate 1`, {
                method: "POST",
            });

            const totalAmount = checkoutResult.data.totalAmount;

            // Map frontend checkout payment methods to Spring Boot PaymentMethod enum
            let mappedMethod = checkoutPaymentMethod;
            if (mappedMethod === "CARD" || mappedMethod === "BANK") {
                mappedMethod = "TRANSFER";
            } else if (mappedMethod === "SEPAY" || mappedMethod === "EWALLET") {
                mappedMethod = "VNPAY";
            }

            // Step 2: Process payment to release slot and complete session
            await apiRequest("/api/payments", {
                method: "POST",
                body: JSON.stringify({
                    sessionId: checkoutSession.id,
                    amount: totalAmount,
                    extraFee: 0,
                    method: mappedMethod,
                }),
            });

            setAlert({ type: "success", message: "Session completed and payment processed successfully!" });
            setCheckoutSession(null);
            fetchSessions();
        } catch (err) {
            setAlert({ type: "error", message: err.message || "Failed to complete session" });
        } finally {
            setProcessing(false);
        }
    };

    const activeCount = useMemo(() => buildingSessions.filter((s) => s.status === "ACTIVE").length, [buildingSessions]);

    return (
        <AdminLayout>
            <div className="parking-sessions-page">
            <PageHero total={buildingSessions.length} activeCount={activeCount} />

            <Alert alert={alert} onClose={() => setAlert({ type: "", message: "" })} />

            <FilterBar
                keyword={keyword}
                onKeywordChange={setKeyword}
                statusFilter={statusFilter}
                onStatusChange={setStatusFilter}
                total={filteredSessions.length}
            />

            <SessionGrid
                sessions={filteredSessions}
                now={now}
                loading={loading}
                error={error}
                onRefresh={fetchSessions}
                onView={setViewSession}
                onCheckout={(session) => {
                    setCheckoutPaymentMethod("CASH");
                    setCheckoutSession(session);
                }}
            />

            <DetailModal
                session={viewSession}
                now={now}
                onClose={() => setViewSession(null)}
            />

            <CheckoutModal
                session={checkoutSession}
                now={now}
                paymentMethod={checkoutPaymentMethod}
                processing={processing}
                onClose={() => {
                    if (!processing) setCheckoutSession(null);
                }}
                onConfirm={handleCheckout}
                onPaymentMethodChange={setCheckoutPaymentMethod}
            />
            </div>
        </AdminLayout>
    );
}
