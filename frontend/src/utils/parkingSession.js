const BASE_PRICE_HOURS = 2;
const NIGHT_START_HOUR = 22;
const NIGHT_END_HOUR = 6;

function isNightHour(date) {
  const hour = date.getHours();
  return hour >= NIGHT_START_HOUR || hour < NIGHT_END_HOUR;
}

export function getSessionEndTime(session, now = new Date()) {
  return session.exitTime || session.endTime || now;
}

export function getElapsedSeconds(session, now = new Date()) {
  const startTime = session.entryTime || session.startTime;
  if (!startTime) return 0;

  return Math.max(
    0,
    Math.floor(
      (new Date(getSessionEndTime(session, now)) - new Date(startTime)) / 1000,
    ),
  );
}

export function formatElapsedTime(session, now = new Date()) {
  const totalSeconds = getElapsedSeconds(session, now);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (value) => String(value).padStart(2, "0");

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

export function calculateLiveSessionFee(session, now = new Date()) {
  if (String(session.status || "").toUpperCase() !== "ACTIVE") {
    return Number(session.totalFee || 0);
  }

  const startTime = session.entryTime || session.startTime;
  if (!startTime) return Number(session.totalFee || 0);

  const elapsedMs = new Date(now) - new Date(startTime);
  const parkingHours = Math.max(1, Math.ceil(elapsedMs / (1000 * 60 * 60)));
  const basePrice = Number(session.basePrice || 0);
  const hourlyRate = Number(session.hourlyRate || 0);
  const nightRate = Number(session.nightRate ?? hourlyRate);
  const startDate = new Date(startTime);
  let total = basePrice;

  for (let hourIndex = BASE_PRICE_HOURS; hourIndex < parkingHours; hourIndex += 1) {
    const hourStart = new Date(startDate);
    hourStart.setHours(startDate.getHours() + hourIndex);
    total += isNightHour(hourStart) ? nightRate : hourlyRate;
  }

  return total;
}
