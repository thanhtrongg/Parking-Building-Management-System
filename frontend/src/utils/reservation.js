export function getReservationCode(reservationId) {
  return reservationId
    ? `RSV-${String(reservationId).slice(0, 8).toUpperCase()}`
    : "RSV-N/A";
}
