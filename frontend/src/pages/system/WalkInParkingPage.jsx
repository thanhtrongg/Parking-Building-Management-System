import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import { apiRequest } from "../../services/api";
import CustomSelect from "../../components/CustomSelect";
import useAutoRefresh from "../../hooks/useAutoRefresh";

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
  const [vehicleTypeId, setVehicleTypeId] = useState("");
  const [parkingSlotId, setParkingSlotId] = useState("");
  const [suggestedSlotId, setSuggestedSlotId] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState({ type: "", message: "" });
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
      const [vehicleResult, slotResult] = await Promise.all([
        apiRequest(`/api/vehicle-types?buildingId=${activeBuildingId}`),
        apiRequest("/api/parking-slots"),
      ]);
      setVehicleTypes(vehicleResult.data || []);
      setSlots(slotResult.data || []);
    } catch (error) {
      setNotice({ type: "error", message: error.message || "Cannot load parking data" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeBuildingId]);

  useAutoRefresh(async () => {
    const result = await apiRequest("/api/parking-slots");
    setSlots(result.data || []);
  }, { intervalMs: 5_000 });

  useEffect(() => {
    if (!vehicleTypeId || !activeBuildingId) {
      setSuggestedSlotId("");
      return;
    }

    const fetchRecommendation = async () => {
      try {
        const type = vehicleTypes.find((t) => t.id === vehicleTypeId);
        const vehicleTypeEnum = type?.name || type?.typeName;
        if (!vehicleTypeEnum) return;

        const result = await apiRequest("/api/slots/recommend", {
          method: "POST",
          body: JSON.stringify({
            buildingId: activeBuildingId,
            vehicleType: vehicleTypeEnum.toUpperCase().replace(/\s+/g, '_'),
          }),
        });

        if (result.data?.slot?.id) {
          setSuggestedSlotId(result.data.slot.id);
          setParkingSlotId(result.data.slot.id);
        }
      } catch (error) {
        console.error("Failed to fetch smart allocation suggestion:", error);
      }
    };

    fetchRecommendation();
  }, [vehicleTypeId, activeBuildingId, vehicleTypes]);

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


  const handleCheckIn = async (event) => {
    event.preventDefault();

    if (!licensePlate.trim() || !vehicleTypeId || !parkingSlotId) {
      setNotice({
        type: "error",
        message: "Please enter a license plate, vehicle type, and parking slot.",
      });
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
                Guest Check-in
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100">
                Create a parking session for walk-in guests. Complete sessions from the Parking Sessions page.
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

        <section className="mx-auto max-w-2xl rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
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
                required
              />
            </Field>

            <Field label="Vehicle Type" icon="directions_car">
              <CustomSelect
                options={[
                  { value: "", label: "Select vehicle type" },
                  ...vehicleTypes.map((type) => ({ value: type.id, label: type.typeName }))
                ]}
                value={vehicleTypeId}
                onChange={(val) => {
                  setVehicleTypeId(val);
                  setParkingSlotId("");
                }}
                className="h-13 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 font-semibold text-slate-800 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/5 dark:text-[#fbf4e7]"
              />
            </Field>

            <Field label={`Available Slot (${availableSlots.length})`} icon="local_parking">
              <CustomSelect
                options={[
                  { value: "", label: vehicleTypeId ? "Select available slot" : "Select vehicle type first" },
                  ...availableSlots.map((slot) => ({
                    value: slot.id,
                    label: `${slot.slotName || slot.slotCode} - ${slot.zoneName || slot.zone || "Unknown zone"}${slot.id === suggestedSlotId ? " (Suggested)" : ""}`
                  }))
                ]}
                value={parkingSlotId}
                onChange={setParkingSlotId}
                disabled={!vehicleTypeId}
                className="h-13 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 font-semibold text-slate-800 outline-none transition disabled:cursor-not-allowed disabled:opacity-55 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/5 dark:text-[#fbf4e7]"
              />
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
      </div>
    </AdminLayout>
  );
}
