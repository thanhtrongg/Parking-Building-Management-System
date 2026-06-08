package com.parking.service;

import com.parking.entity.Reservation;
import com.parking.enums.ReservationStatus;
import com.parking.enums.SlotStatus;
import com.parking.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Scheduled job that auto-expires reservations whose reserved_to time has passed
 * without check-in, releasing the associated slots back to AVAILABLE.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ReservationScheduler {

    private final ReservationRepository reservationRepository;

    /**
     * Runs every 60 seconds to find and expire stale reservations.
     */
    @Scheduled(fixedRate = 60_000)
    @Transactional
    public void expireStaleReservations() {
        LocalDateTime now = LocalDateTime.now();
        List<Reservation> expired = reservationRepository.findExpiredActiveReservations(now);

        if (expired.isEmpty()) {
            return;
        }

        for (Reservation reservation : expired) {
            reservation.setStatus(ReservationStatus.EXPIRED);

            // Release the slot back to available if it was reserved
            if (reservation.getSlot() != null
                    && reservation.getSlot().getStatus() == SlotStatus.RESERVED) {
                reservation.getSlot().setStatus(SlotStatus.AVAILABLE);
            }
        }

        reservationRepository.saveAll(expired);
        log.info("Auto-expired {} stale reservation(s)", expired.size());
    }
}
