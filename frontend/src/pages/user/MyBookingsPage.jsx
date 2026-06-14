import { useEffect, useMemo, useRef, useState } from "react";
import UserLayout from "../../components/UserLayout";
import { apiRequest } from "../../services/api";
import useAutoRefresh from "../../hooks/useAutoRefresh";

function normalizeArray(value) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  return [];
}

function pad2(value) {
  return String(value).padStart(2, "0");
}

function toIsoString(localValue) {
  if (!localValue) return "";
  const date = new Date(localValue);
  if (Number.isNaN(date.getTime())) return "";
  const tzOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 19);
}

function toDateKey(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function toTimeValue(date) {
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

function parseDateKey(dateKey) {
  if (!dateKey) return null;

  const [year, month, day] = String(dateKey).split("-").map(Number);
  if (!year || !month || !day) return null;

  return new Date(year, month - 1, day);
}

function combineDateAndTime(dateKey, timeValue) {
  const date = parseDateKey(dateKey);
  if (!date || !timeValue) return null;

  const [hours, minutes] = String(timeValue).split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;

  date.setHours(hours, minutes, 0, 0);
  return date;
}


function roundUpToMinute(date) {
  const next = new Date(date);
  next.setSeconds(0, 0);
  if (date.getSeconds() > 0 || date.getMilliseconds() > 0) {
    next.setMinutes(next.getMinutes() + 1);
  }
  return next;
}

function getDefaultStartDateTime() {
  const date = roundUpToMinute(new Date());
  date.setMinutes(date.getMinutes() + 10);
  return date;
}

function formatDisplayDate(date) {
  if (!date) return null;

  const dayMonth = new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
  }).format(date);
  const year = new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
  }).format(date);

  return { dayMonth, year };
}

function formatDisplayTime(dateKey, timeValue) {
  const combined = combineDateAndTime(dateKey, timeValue);
  if (!combined) return { time: "--:--", meridiem: "" };

  const parts = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).formatToParts(combined);

  const time = `${parts.find((part) => part.type === "hour")?.value || "--"}:${parts.find((part) => part.type === "minute")?.value || "--"}`;
  const meridiem = parts.find((part) => part.type === "dayPeriod")?.value || "";

  return { time, meridiem };
}

function PageHeader() {
  return (
    <div className="mb-6">
      <h1 className="font-['Geist'] text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
        Book a Parking Slot
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
        Choose your vehicle type, then pick a date and time from the live
        picker. Past moments are locked out completely.
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
      aria-pressed={selected}
      className={`relative rounded-2xl border p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
        selected
          ? "border-blue-600 bg-blue-600 text-white shadow-blue-200 ring-4 ring-blue-100"
          : "border-slate-200 bg-white text-slate-950 hover:border-blue-200"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p
            className={`font-['Geist'] text-lg font-black ${
              selected ? "text-white" : "text-slate-950"
            }`}
          >
            {slot.slotCode || slot.slotName || slot.slotNumber}
          </p>
          <p
            className={`mt-1 text-sm font-semibold ${
              selected ? "text-blue-100" : "text-slate-500"
            }`}
          >
            {slot.zone || slot.zoneName || "No zone"}
          </p>
        </div>
        <span
          className={`grid h-10 w-10 place-items-center rounded-xl ${
            selected ? "bg-white text-blue-600" : "bg-blue-50 text-blue-600"
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">
            {selected ? "check" : "local_parking"}
          </span>
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {selected && (
          <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-blue-700 ring-1 ring-white/70">
            SELECTED
          </span>
        )}
        <span
          className={`rounded-full px-3 py-1 text-xs font-black ring-1 ${
            selected
              ? "bg-blue-500 text-white ring-white/30"
              : "bg-emerald-50 text-emerald-700 ring-emerald-100"
          }`}
        >
          {slot.status || "AVAILABLE"}
        </span>
        <span
          className={`rounded-full px-3 py-1 text-xs font-black ${
            selected
              ? "bg-blue-500 text-blue-50"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {slot.vehicleTypeName || slot.vehicleType?.typeName || "Vehicle"}
        </span>
        <span
          className={`rounded-full px-3 py-1 text-xs font-black ${
            selected
              ? "bg-blue-500 text-blue-50"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {slot.distanceToGate ?? 0}m to gate
        </span>
      </div>
    </button>
  );
}

function BookingDateTimeField({
  now,
  selectedDate,
  selectedTime,
  onDateChange,
  onTimeChange,
}) {
  const todayKey = toDateKey(now);
  const minTime =
    selectedDate === todayKey
      ? toTimeValue(roundUpToMinute(now))
      : "";
  const displayDate = selectedDate ? formatDisplayDate(parseDateKey(selectedDate)) : null;
  const displayTime = formatDisplayTime(selectedDate, selectedTime);
  const dateInputRef = useRef(null);
  const timeInputRef = useRef(null);

  const openPicker = (inputRef) => {
    const input = inputRef.current;
    if (!input) return;

    input.focus();

    try {
      if (typeof input.showPicker === "function") {
        input.showPicker();
        return;
      }
    } catch {
      // Fall through to the native click fallback.
    }

    input.click();
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-sm">
      <div className="border-b border-blue-100 bg-gradient-to-br from-blue-50 to-white px-4 py-4">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-200">
            <span className="material-symbols-outlined text-[21px]">
              calendar_clock
            </span>
          </span>
          <div className="min-w-0">
            <h3 className="font-['Geist'] text-base font-black text-slate-950">
              Arrival time
            </h3>
            <p className="mt-0.5 text-xs font-semibold leading-5 text-slate-500">
              Select any future date and minute.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3 p-4">
        <div className="relative">
          <button
            type="button"
            onClick={() => openPicker(dateInputRef)}
            className="group flex min-h-16 w-full items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-left transition hover:border-blue-200 hover:bg-blue-50/60 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-blue-600 shadow-sm ring-1 ring-slate-200">
              <span className="material-symbols-outlined text-[20px]">
                calendar_month
              </span>
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                Date
              </span>
              <span className="mt-0.5 block whitespace-nowrap font-['Geist'] text-lg font-black text-slate-950">
                {displayDate
                  ? `${displayDate.dayMonth}/${displayDate.year}`
                  : "Select date"}
              </span>
            </span>
            <span className="material-symbols-outlined shrink-0 text-[20px] text-slate-400">
              expand_more
            </span>
          </button>
          <input
            ref={dateInputRef}
            type="date"
            value={selectedDate || ""}
            min={todayKey}
            onChange={(event) => onDateChange(event.target.value)}
            className="pointer-events-none absolute h-px w-px opacity-0"
            required
          />
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => openPicker(timeInputRef)}
            className="group flex min-h-16 w-full items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-left transition hover:border-blue-200 hover:bg-blue-50/60 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-blue-600 shadow-sm ring-1 ring-slate-200">
              <span className="material-symbols-outlined text-[20px]">
                schedule
              </span>
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                Time
              </span>
              <span className="mt-0.5 flex items-baseline gap-1 whitespace-nowrap font-['Geist'] text-lg font-black text-slate-950">
                <span>{displayTime.time}</span>
                {displayTime.meridiem ? (
                  <span className="text-xs font-black uppercase tracking-wider text-blue-600">
                    {displayTime.meridiem}
                  </span>
                ) : null}
              </span>
            </span>
            <span className="material-symbols-outlined shrink-0 text-[20px] text-slate-400">
              expand_more
            </span>
          </button>
          <input
            ref={timeInputRef}
            type="time"
            value={selectedTime || ""}
            step={60}
            min={minTime || undefined}
            onChange={(event) => onTimeChange(event.target.value)}
            className="pointer-events-none absolute h-px w-px opacity-0"
            required
          />
        </div>

        <div className="flex items-start gap-2 rounded-2xl bg-emerald-50 px-3 py-2.5 text-emerald-700 ring-1 ring-emerald-100">
          <span className="material-symbols-outlined mt-0.5 text-[17px]">
            verified
          </span>
          <p className="text-xs font-bold leading-5">
            Past dates and times are automatically blocked.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function UserMyBookingsPage() {
  const defaultStart = getDefaultStartDateTime();
  const defaultParts = {
    dateKey: toDateKey(defaultStart),
    timeValue: toTimeValue(defaultStart),
  };

  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [now, setNow] = useState(() => new Date());
  const [form, setForm] = useState(() => ({
    vehicleTypeId: "",
    startDate: defaultParts.dateKey,
    startTime: defaultParts.timeValue,
  }));
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 30000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let ignore = false;

    async function loadVehicleTypes() {
      try {
        const result = await apiRequest("/api/vehicle-types");
        if (!ignore) {
          const types = normalizeArray(result);
          const defaultVehicleTypeId = types[0]?.id || "";
          const defaultStart = getDefaultStartDateTime();
          const defaultDateKey = toDateKey(defaultStart);
          const defaultTimeValue = toTimeValue(defaultStart);

          setVehicleTypes(types);
          setForm({
            vehicleTypeId: defaultVehicleTypeId,
            startDate: defaultDateKey,
            startTime: defaultTimeValue,
          });
          if (defaultVehicleTypeId) {
            setLoadingSlots(true);
            setSelectedSlot(null);

            const params = new URLSearchParams({
              vehicleTypeId: defaultVehicleTypeId,
              startTime: toIsoString(
                combineDateAndTime(defaultDateKey, defaultTimeValue),
              ),
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

  const selectedStartDateTime = useMemo(() => {
    return combineDateAndTime(form.startDate, form.startTime);
  }, [form.startDate, form.startTime]);

  const canSearchSlots = useMemo(() => {
    return (
      Boolean(form.vehicleTypeId && selectedStartDateTime) &&
      selectedStartDateTime >= now
    );
  }, [form.vehicleTypeId, selectedStartDateTime, now]);

  const loadAvailableSlots = async () => {
    if (!canSearchSlots) {
      setAlert({
        type: "error",
        message: "Please select a future date and time.",
      });
      return;
    }

    try {
      setLoadingSlots(true);
      setSelectedSlot(null);
      setAlert({ type: "", message: "" });

      const params = new URLSearchParams({
        vehicleTypeId: form.vehicleTypeId,
        startTime: toIsoString(selectedStartDateTime),
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

  useEffect(() => {
    if (canSearchSlots) {
      loadAvailableSlots();
    } else {
      setAvailableSlots([]);
    }
  }, [form.vehicleTypeId, form.startDate, form.startTime, canSearchSlots]);

  useAutoRefresh(async () => {
    if (!canSearchSlots || availableSlots.length === 0) return;

    const params = new URLSearchParams({
      vehicleTypeId: form.vehicleTypeId,
      startTime: toIsoString(selectedStartDateTime),
    });
    const result = await apiRequest(
      `/api/parking-slots/available-for-reservation?${params.toString()}`,
    );
    const nextSlots = normalizeArray(result);
    setAvailableSlots(nextSlots);
    setSelectedSlot((current) =>
      current && nextSlots.some((slot) => slot.id === current.id)
        ? current
        : null,
    );
  });

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setSelectedSlot(null);
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

    if (!selectedStartDateTime || selectedStartDateTime < now) {
      setAlert({
        type: "error",
        message: "Start time cannot be in the past.",
      });
      return;
    }

    const selectedType = vehicleTypes.find((t) => t.id === form.vehicleTypeId);
    const slotTypeStr = selectedSlot?.vehicleTypeName || selectedSlot?.vehicleType?.name || selectedSlot?.vehicleType;
    if (!selectedType || !slotTypeStr || String(slotTypeStr).toUpperCase() !== String(selectedType.name).toUpperCase()) {
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
          startTime: toIsoString(selectedStartDateTime),
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
      if (error.message && (error.message.includes("already reserved") || error.message.includes("capacity"))) {
        setSelectedSlot(null);
        loadAvailableSlots();
      }
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
        <section className="h-fit rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
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

            <BookingDateTimeField
              now={now}
              selectedDate={form.startDate}
              selectedTime={form.startTime}
              onDateChange={(dateKey) => {
                setForm((current) => ({ ...current, startDate: dateKey }));
                setSelectedSlot(null);
                setAvailableSlots([]);
              }}
              onTimeChange={(timeValue) => {
                setForm((current) => ({ ...current, startTime: timeValue }));
                setSelectedSlot(null);
                setAvailableSlots([]);
              }}
            />

            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-blue-700">
                    Pay on checkout
                  </p>
                  <p className="mt-1 font-['Geist'] text-lg font-black text-slate-950">
                    Fee starts at check-in
                  </p>
                </div>
                <span className="material-symbols-outlined text-[24px] text-blue-600">
                  payments
                </span>
              </div>
              <p className="mt-2 text-xs font-semibold text-blue-700">
                The live session shows elapsed time and current fee.
              </p>
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
                {displayedSlots.length} slots match your selected criteria.
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
          ) : displayedSlots.length === 0 ? (
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
                Try another vehicle type or choose a later time.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {displayedSlots.map((slot) => (
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
