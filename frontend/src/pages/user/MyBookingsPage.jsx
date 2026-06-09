import { useEffect, useMemo, useState } from "react";
import UserLayout from "../../components/UserLayout";
import { apiRequest } from "../../services/api";

function toDateTimeLocalValue(date) {
  const pad = (value) => String(value).padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function getDefaultStartTime() {
  const date = new Date();
  date.setMinutes(0, 0, 0);
  date.setHours(date.getHours() + 1);
  return toDateTimeLocalValue(date);
}

function getDefaultEndTime() {
  const date = new Date();
  date.setMinutes(0, 0, 0);
  date.setHours(date.getHours() + 3);
  return toDateTimeLocalValue(date);
}

function normalizeArray(value) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  return [];
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(Number(amount || 0));
}

function toIsoString(localValue) {
  return new Date(localValue).toISOString();
}

function calculateHours(startTime, endTime) {
  return Math.max(
    1,
    Math.ceil((new Date(endTime) - new Date(startTime)) / (1000 * 60 * 60)),
  );
}

function isNightHour(date) {
  const hour = date.getHours();
  return hour >= 22 || hour < 6;
}

function getBestPricingPolicy(policies, vehicleTypeId, startTime) {
  const effectiveDate = new Date(startTime);
  const candidates = policies
    .filter((policy) => {
      const policyVehicleTypeId = policy.vehicleTypeId || null;
      const matchesVehicle =
        policyVehicleTypeId === vehicleTypeId || policyVehicleTypeId === null;
      return matchesVehicle && new Date(policy.effectiveDate) <= effectiveDate;
    })
    .sort((a, b) => {
      const aExact = a.vehicleTypeId === vehicleTypeId ? 1 : 0;
      const bExact = b.vehicleTypeId === vehicleTypeId ? 1 : 0;

      if (aExact !== bExact) return bExact - aExact;
      return new Date(b.effectiveDate) - new Date(a.effectiveDate);
    });

  return candidates[0] || null;
}

function calculateEstimatedFee({ policies, vehicleTypeId, startTime, endTime }) {
  if (!vehicleTypeId || !startTime || !endTime) return null;
  if (new Date(startTime) >= new Date(endTime)) return null;

  const policy = getBestPricingPolicy(policies, vehicleTypeId, startTime);
  if (!policy) return null;

  const parkingHours = calculateHours(startTime, endTime);
  const basePrice = Number(policy.basePrice || 0);
  const hourlyRate = Number(policy.hourlyRate || 0);
  const nightRate = Number(policy.nightRate ?? hourlyRate);
  const startDate = new Date(startTime);
  let billableHourlyHours = 0;
  let billableNightHours = 0;

  for (let hourIndex = 2; hourIndex < parkingHours; hourIndex += 1) {
    const hourStart = new Date(startDate);
    hourStart.setHours(startDate.getHours() + hourIndex);

    if (isNightHour(hourStart)) {
      billableNightHours += 1;
    } else {
      billableHourlyHours += 1;
    }
  }

  return {
    total: basePrice + billableHourlyHours * hourlyRate + billableNightHours * nightRate,
    parkingHours,
    basePrice,
    hourlyRate,
    nightRate,
  };
}

function PageHeader() {
  return (
    <div className="mb-6">
      <h1 className="font-['Geist'] text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
        Book a Parking Slot
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
        Choose vehicle type and reservation time, then pick one of the real
        available slots returned by the backend.
      </p>
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

function SlotCard({ slot, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(slot)}
      className={`rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
        selected
          ? "border-blue-500 ring-4 ring-blue-100"
          : "border-slate-200 hover:border-blue-200"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-['Geist'] text-lg font-black text-slate-950">
            {slot.slotName || slot.slotNumber}
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-500">
            {slot.zoneName || "No zone"}
          </p>
        </div>
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600">
          <span className="material-symbols-outlined text-[22px]">
            local_parking
          </span>
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700 ring-1 ring-emerald-100">
          {slot.status || "AVAILABLE"}
        </span>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
          {slot.vehicleTypeName || "Vehicle"}
        </span>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
          {slot.distanceToGate ?? 0}m to gate
        </span>
      </div>
    </button>
  );
}

export default function UserMyBookingsPage() {
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [pricingPolicies, setPricingPolicies] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [form, setForm] = useState(() => ({
    vehicleTypeId: "",
    startTime: getDefaultStartTime(),
    endTime: getDefaultEndTime(),
  }));
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });

  useEffect(() => {
    let ignore = false;

    async function loadVehicleTypes() {
      try {
        const result = await apiRequest("/api/vehicle-types");
        const pricingResult = await apiRequest("/api/pricing-policies");

        if (!ignore) {
          const types = normalizeArray(result);
          setPricingPolicies(normalizeArray(pricingResult));
          const defaultVehicleTypeId = types[0]?.id || "";
          const defaultStartTime = getDefaultStartTime();
          const defaultEndTime = getDefaultEndTime();

          setVehicleTypes(types);
          setForm({
            vehicleTypeId: defaultVehicleTypeId,
            startTime: defaultStartTime,
            endTime: defaultEndTime,
          });

          if (defaultVehicleTypeId) {
            setLoadingSlots(true);
            setSelectedSlot(null);

            const params = new URLSearchParams({
              vehicleTypeId: defaultVehicleTypeId,
              startTime: toIsoString(defaultStartTime),
              endTime: toIsoString(defaultEndTime),
            });

            try {
              const slotsResult = await apiRequest(
                `/api/parking-slots/available-for-reservation?${params.toString()}`,
              );

              if (!ignore) {
                setAvailableSlots(normalizeArray(slotsResult));
              }
            } catch (error) {
              if (!ignore) {
                setAvailableSlots([]);
                setAlert({
                  type: "error",
                  message: error.message || "Cannot load available slots",
                });
              }
            } finally {
              if (!ignore) {
                setLoadingSlots(false);
              }
            }
          }
        }
      } catch (error) {
        if (!ignore) {
          setAlert({
            type: "error",
            message: error.message || "Cannot load vehicle types",
          });
        }
      } finally {
        if (!ignore) {
          setLoadingTypes(false);
        }
      }
    }

    loadVehicleTypes();

    return () => {
      ignore = true;
    };
  }, []);

  const canSearchSlots = useMemo(() => {
    if (!form.vehicleTypeId || !form.startTime || !form.endTime) return false;
    return new Date(form.startTime) < new Date(form.endTime);
  }, [form]);

  const estimatedFee = useMemo(
    () =>
      calculateEstimatedFee({
        policies: pricingPolicies,
        vehicleTypeId: form.vehicleTypeId,
        startTime: form.startTime,
        endTime: form.endTime,
      }),
    [form, pricingPolicies],
  );

  const loadAvailableSlots = async () => {
    if (!canSearchSlots) {
      setAlert({
        type: "error",
        message: "Please select vehicle type and a valid time range.",
      });
      return;
    }

    try {
      setLoadingSlots(true);
      setSelectedSlot(null);
      setAlert({ type: "", message: "" });

      const params = new URLSearchParams({
        vehicleTypeId: form.vehicleTypeId,
        startTime: toIsoString(form.startTime),
        endTime: toIsoString(form.endTime),
      });

      const result = await apiRequest(
        `/api/parking-slots/available-for-reservation?${params.toString()}`,
      );

      setAvailableSlots(normalizeArray(result));
    } catch (error) {
      setAvailableSlots([]);
      setAlert({
        type: "error",
        message: error.message || "Cannot load available slots",
      });
    } finally {
      setLoadingSlots(false);
    }
  };

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));

    if (field === "vehicleTypeId") {
      setSelectedSlot(null);
      setAvailableSlots([]);
    }
  };

  const submitReservation = async (event) => {
    event.preventDefault();

    if (!selectedSlot) {
      setAlert({
        type: "error",
        message: "Please choose an available parking slot.",
      });
      return;
    }

    if (selectedSlot.vehicleTypeId !== form.vehicleTypeId) {
      setAlert({
        type: "error",
        message: "Selected slot does not match the selected vehicle type.",
      });
      setSelectedSlot(null);
      return;
    }

    try {
      setSubmitting(true);
      setAlert({ type: "", message: "" });

      await apiRequest("/api/reservations", {
        method: "POST",
        body: JSON.stringify({
          parkingSlotId: selectedSlot.id,
          vehicleTypeId: form.vehicleTypeId,
          startTime: toIsoString(form.startTime),
          endTime: toIsoString(form.endTime),
        }),
      });

      setAlert({
        type: "success",
        message: "Reservation created successfully.",
      });
      setSelectedSlot(null);
      await loadAvailableSlots();
    } catch (error) {
      setAlert({
        type: "error",
        message: error.message || "Cannot create reservation",
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

      <form
        onSubmit={submitReservation}
        className="grid gap-6 lg:grid-cols-[360px_1fr]"
      >
        <section className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-['Geist'] text-lg font-black text-slate-950">
            Reservation Details
          </h2>

          <div className="mt-5 space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">
                Vehicle type
              </span>
              <select
                value={form.vehicleTypeId}
                onChange={(event) =>
                  updateField("vehicleTypeId", event.target.value)
                }
                disabled={loadingTypes}
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                required
              >
                <option value="">Select vehicle type</option>
                {vehicleTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.typeName}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">
                Start time
              </span>
              <input
                type="datetime-local"
                value={form.startTime}
                onChange={(event) => updateField("startTime", event.target.value)}
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">
                End time
              </span>
              <input
                type="datetime-local"
                value={form.endTime}
                onChange={(event) => updateField("endTime", event.target.value)}
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                required
              />
            </label>

            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-blue-700">
                    Estimated fee
                  </p>
                  <p className="mt-1 font-['Geist'] text-2xl font-black text-slate-950">
                    {estimatedFee ? formatCurrency(estimatedFee.total) : "N/A"}
                  </p>
                </div>
                <span className="material-symbols-outlined text-[24px] text-blue-600">
                  payments
                </span>
              </div>
              {estimatedFee && (
                <p className="mt-2 text-xs font-semibold text-blue-700">
                  {estimatedFee.parkingHours} hour(s), base{" "}
                  {formatCurrency(estimatedFee.basePrice)}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={loadAvailableSlots}
              disabled={loadingSlots || !canSearchSlots}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-blue-200 bg-blue-50 text-sm font-black text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loadingSlots ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-700" />
              ) : (
                <span className="material-symbols-outlined text-[20px]">
                  search
                </span>
              )}
              Find available slots
            </button>

            <button
              type="submit"
              disabled={submitting || !selectedSlot}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 text-sm font-black text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              )}
              Create reservation
            </button>
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-['Geist'] text-xl font-black text-slate-950">
                Available Slots
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {availableSlots.length} slots match your selected criteria.
              </p>
            </div>
          </div>

          {loadingSlots ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div
                  key={item}
                  className="h-40 animate-pulse rounded-2xl bg-slate-100"
                />
              ))}
            </div>
          ) : availableSlots.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center shadow-sm">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-blue-50 text-blue-600">
                <span className="material-symbols-outlined text-[34px]">
                  event_busy
                </span>
              </div>
              <h3 className="mt-5 font-['Geist'] text-xl font-black text-slate-950">
                No slots found
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Try another vehicle type or reservation time range.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {availableSlots.map((slot) => (
                <SlotCard
                  key={slot.id}
                  slot={slot}
                  selected={selectedSlot?.id === slot.id}
                  onSelect={setSelectedSlot}
                />
              ))}
            </div>
          )}
        </section>
      </form>
    </UserLayout>
  );
}
