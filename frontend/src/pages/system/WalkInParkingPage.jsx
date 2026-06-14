import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import { apiRequest } from "../../services/api";
import {
  calculateLiveSessionFee,
  formatElapsedTime,
} from "../../utils/parkingSession";
import useAutoRefresh from "../../hooks/useAutoRefresh";

const paymentMethods = ["CASH", "CARD", "SEPAY"];

const formatCurrency = (amount) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount || 0);

const formatTime = (value) =>
  value
    ? new Date(value).toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "N/A";

function Notice({ notice, onClose }) {
  if (!notice.message) return null;

  return (
    <div
      className={`mb-6 flex items-start justify-between gap-4 rounded-2xl border px-4 py-3 text-sm font-semibold ${
        notice.type === "error"
          ? "border-rose-200 bg-rose-50 text-rose-700"
          : "border-emerald-200 bg-emerald-50 text-emerald-700"
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-xl">
          {notice.type === "error" ? "error" : "check_circle"}
        </span>
        {notice.message}
      </div>
      <button type="button" onClick={onClose} className="rounded-lg p-1 hover:bg-black/5">
        <span className="material-symbols-outlined text-lg">close</span>
      </button>
    </div>
  );
}

function Field({ label, icon, children }) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
        <span className="material-symbols-outlined text-lg text-slate-400">{icon}</span>
        {label}
      </span>
      {children}
    </label>
  );
}

export default function WalkInParkingPage() {
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [slots, setSlots] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [vehicleTypeId, setVehicleTypeId] = useState("");
  const [parkingSlotId, setParkingSlotId] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [search, setSearch] = useState("");
  const [paymentMethodsBySession, setPaymentMethodsBySession] = useState({});
  const [checkingOutId, setCheckingOutId] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState({ type: "", message: "" });
  const [now, setNow] = useState(() => new Date());
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

  const loadData = async () => {
    setLoading(true);
    try {
      const [vehicleResult, slotResult, sessionResult] = await Promise.all([
        apiRequest("/api/vehicle-types"),
        apiRequest("/api/parking-slots"),
        apiRequest("/api/parking-sessions"),
      ]);
      setVehicleTypes(vehicleResult.data || []);
      setSlots(slotResult.data || []);
      setSessions(sessionResult.data || []);
    } catch (error) {
      setNotice({ type: "error", message: error.message || "Cannot load parking data" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initialLoad = window.setTimeout(loadData, 0);
    return () => window.clearTimeout(initialLoad);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useAutoRefresh(async () => {
    const [slotResult, sessionResult] = await Promise.all([
      apiRequest("/api/parking-slots"),
      apiRequest("/api/parking-sessions"),
    ]);
    setSlots(slotResult.data || []);
    setSessions(sessionResult.data || []);
  }, { intervalMs: 5_000 });

  const availableSlots = useMemo(
    () =>
      slots.filter(
        (slot) =>
          slot.status === "AVAILABLE" &&
          (!vehicleTypeId || slot.vehicleTypeId === vehicleTypeId) &&
          (!activeBuildingId || slot.buildingId === activeBuildingId),
      ),
    [slots, vehicleTypeId, activeBuildingId],
  );

  const activeSessions = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    let result = sessions.filter((session) => session.status === "ACTIVE");
    
    if (activeBuildingId) {
      result = result.filter((session) => session.buildingId === activeBuildingId);
    }
    
    return result.filter(
      (session) =>
        !keyword ||
        session.licensePlate?.toLowerCase().includes(keyword) ||
        session.ticketCode?.toLowerCase().includes(keyword) ||
        session.parkingSlot?.slotName?.toLowerCase().includes(keyword),
    );
  }, [sessions, search, activeBuildingId]);

  const handleVehicleTypeChange = (event) => {
    setVehicleTypeId(event.target.value);
    setParkingSlotId("");
  };

  const handleCheckIn = async (event) => {
    event.preventDefault();
    if (!licensePlate.trim() || !vehicleTypeId || !parkingSlotId) {
      setNotice({ type: "error", message: "Please enter a license plate, vehicle type, and parking slot." });
      return;
    }

    setSubmitting(true);
    try {
      const result = await apiRequest("/api/parking-sessions/check-in", {
        method: "POST",
        body: JSON.stringify({
          licensePlate: licensePlate.trim().toUpperCase(),
          vehicleTypeId,
          parkingSlotId,
          buildingId: activeBuildingId,
        }),
      });
      setNotice({
        type: "success",
        message: `Guest checked in successfully. Ticket: ${result.data?.ticket_code || "created"}`,
      });
      setLicensePlate("");
      setParkingSlotId("");
      await loadData();
    } catch (error) {
      setNotice({ type: "error", message: error.message || "Check-in failed" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckOut = async (session) => {
    const paymentMethod = paymentMethodsBySession[session.id] || "CASH";
    setCheckingOutId(session.id);
    try {
      const result = await apiRequest(`/api/parking-sessions/${session.id}/checkout`, {
        method: "PUT",
        body: JSON.stringify({ paymentMethod }),
      });
      setNotice({
        type: "success",
        message: `${session.licensePlate} checked out. Total: ${formatCurrency(result.totalAmount)}`,
      });
      await loadData();
    } catch (error) {
      setNotice({ type: "error", message: error.message || "Check-out failed" });
    } finally {
      setCheckingOutId("");
    }
  };

  return (
    <AdminLayout>
      <div className="mx-auto max-w-[1500px]">
        <section className="mb-7 overflow-hidden rounded-[32px] border border-blue-200 bg-gradient-to-br from-slate-950 via-blue-950 to-blue-800 p-6 text-white shadow-xl shadow-blue-950/15 md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em]">
                <span className="material-symbols-outlined text-base">door_open</span>
                Front Desk Operations
              </div>
              <h1 className="mt-5 font-['Geist'] text-3xl font-black tracking-tight md:text-4xl">
                Guest Check-in & Check-out
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100">
                Create a parking session for walk-in guests and complete active sessions at departure.
              </p>
            </div>
            <Link
              to="/parking-sessions"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 text-sm font-bold text-white transition hover:bg-white/20"
            >
              <span className="material-symbols-outlined text-xl">arrow_back</span>
              All Sessions
            </Link>
          </div>
        </section>

        <Notice notice={notice} onClose={() => setNotice({ type: "", message: "" })} />

        <div className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
          <section className="h-fit rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                <span className="material-symbols-outlined text-2xl">add_road</span>
              </div>
              <div>
                <h2 className="font-['Geist'] text-xl font-black text-slate-950">Walk-in Check-in</h2>
                <p className="mt-1 text-sm text-slate-500">For guests arriving without a reservation.</p>
              </div>
            </div>

            <form onSubmit={handleCheckIn} className="mt-7 space-y-5">
              <Field label="License Plate" icon="pin">
                <input
                  value={licensePlate}
                  onChange={(event) => setLicensePlate(event.target.value.toUpperCase())}
                  placeholder="Example: 51A-123.45"
                  className="h-13 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 font-bold uppercase text-slate-950 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                />
              </Field>

              <Field label="Vehicle Type" icon="directions_car">
                <select
                  value={vehicleTypeId}
                  onChange={handleVehicleTypeChange}
                  className="h-13 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 font-semibold text-slate-800 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                >
                  <option value="">Select vehicle type</option>
                  {vehicleTypes.map((type) => (
                    <option key={type.id} value={type.id}>{type.typeName}</option>
                  ))}
                </select>
              </Field>

              <Field label={`Available Slot (${availableSlots.length})`} icon="local_parking">
                <select
                  value={parkingSlotId}
                  onChange={(event) => setParkingSlotId(event.target.value)}
                  disabled={!vehicleTypeId}
                  className="h-13 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 font-semibold text-slate-800 outline-none transition disabled:cursor-not-allowed disabled:opacity-55 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                >
                  <option value="">{vehicleTypeId ? "Select available slot" : "Select vehicle type first"}</option>
                  {availableSlots.map((slot) => (
                    <option key={slot.id} value={slot.id}>
                      {slot.slotName} - {slot.zoneName || "Unknown zone"}
                    </option>
                  ))}
                </select>
              </Field>

              <button
                type="submit"
                disabled={submitting || loading}
                className="inline-flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="material-symbols-outlined text-xl">
                  {submitting ? "progress_activity" : "login"}
                </span>
                {submitting ? "Creating Session..." : "Check In Guest"}
              </button>
            </form>
          </section>

          <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-600">Currently Parked</p>
                <h2 className="mt-2 font-['Geist'] text-2xl font-black text-slate-950">
                  Active Sessions <span className="text-slate-400">({activeSessions.length})</span>
                </h2>
              </div>
            </div>

            <div className="relative mt-5">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-xl text-slate-400">search</span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search license plate, ticket, or slot..."
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm font-semibold outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              />
            </div>

            <div className="mt-5 max-h-[620px] space-y-3 overflow-y-auto pr-1">
              {loading ? (
                <div className="py-16 text-center text-sm font-semibold text-slate-400">Loading active sessions...</div>
              ) : activeSessions.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-14 text-center text-sm font-semibold text-slate-500">
                  No active sessions found.
                </div>
              ) : (
                activeSessions.map((session) => (
                  <article key={session.id} className="rounded-2xl border border-slate-200 p-4 transition hover:border-blue-200 hover:bg-blue-50/30">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-['Geist'] text-lg font-black text-slate-950">{session.licensePlate}</h3>
                          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-black text-emerald-700">ACTIVE</span>
                        </div>
                        <p className="mt-1 text-sm font-semibold text-slate-600">
                          {session.parkingSlot?.slotName || "Unknown slot"} · {session.vehicleType?.typeName || "Unknown type"}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          {session.ticketCode} · {formatTime(session.startTime)}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-3 md:justify-end">
                        <div className="text-right">
                          <p className="text-xs font-semibold text-slate-400">{formatElapsedTime(session, now)}</p>
                          <p className="mt-1 font-['Geist'] text-lg font-black text-blue-700">
                            {formatCurrency(calculateLiveSessionFee(session, now))}
                          </p>
                        </div>
                        <div
                          className="flex rounded-xl border border-slate-200 bg-slate-50 p-1"
                          aria-label={`Payment method for ${session.licensePlate}`}
                        >
                          {paymentMethods.map((method) => (
                            <button
                              key={method}
                              type="button"
                              onClick={() =>
                                setPaymentMethodsBySession((current) => ({
                                  ...current,
                                  [session.id]: method,
                                }))
                              }
                              disabled={Boolean(checkingOutId)}
                              className={`h-9 rounded-lg px-3 text-xs font-black transition disabled:cursor-not-allowed disabled:opacity-55 ${
                                (paymentMethodsBySession[session.id] || "CASH") === method
                                  ? "bg-white text-blue-700 shadow-sm ring-1 ring-slate-200"
                                  : "text-slate-500 hover:text-slate-950"
                              }`}
                            >
                              {method === "SEPAY" ? "SePay" : method[0] + method.slice(1).toLowerCase()}
                            </button>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCheckOut(session)}
                          disabled={Boolean(checkingOutId)}
                          className="inline-flex h-11 items-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-55"
                        >
                          <span className="material-symbols-outlined text-lg">logout</span>
                          {checkingOutId === session.id ? "Processing..." : "Check Out"}
                        </button>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </AdminLayout>
  );
}
