package com.parking.config;

import com.parking.enums.FeedbackStatus;
import com.parking.enums.PaymentMethod;
import com.parking.enums.PaymentStatus;
import com.parking.enums.ReservationStatus;
import com.parking.enums.SessionStatus;
import com.parking.enums.SlotStatus;
import com.parking.enums.UserRole;
import com.parking.enums.VehicleTypeEnum;
import com.parking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

@Component
@Profile("dev")
@RequiredArgsConstructor
public class DatabaseSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DatabaseSeeder.class);

    private final UserRepository userRepository;
    private final JdbcTemplate jdbcTemplate;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0) {
            log.info("Database already seeded. Skipping DatabaseSeeder.");
            return;
        }

        log.info("Seeding database with development mock data...");

        try {
            // 1. Seed Users
            String adminId = "d8b5c92c-6fa4-46ab-8cb3-c3f2b45a49dc";
            String managerId = "c7e5a013-149b-44bb-8b74-0f2c417b12d5";
            String staffId = "3d6b38c2-28df-4a67-9cfb-816223cf5311";
            String driverId = "6b88b2a3-83cf-424a-b9c1-512c0199e52c";
            String driver2Id = "7b98b2a3-83cf-424a-b9c1-512c0199e52d";

            insertUser(adminId, "admin@parking.com", "admin123", "Administrator", "0901234567", UserRole.ADMIN.name());
            insertUser(managerId, "manager@parking.com", "manager123", "Parking Manager", "0907654321", UserRole.MANAGER.name());
            insertUser(staffId, "staff@parking.com", "staff123", "Parking Staff", "0908888888", UserRole.STAFF.name());
            insertUser(driverId, "driver@parking.com", "driver123", "Regular Driver", "0909999999", UserRole.DRIVER.name());
            insertUser(driver2Id, "driver2@parking.com", "driver123", "Secondary Driver", "0909999998", UserRole.DRIVER.name());

            log.info("Users seeded successfully.");

            // 2. Seed Vehicle Types
            String carTypeId = "e2a8340b-0c81-4ada-b084-03975d3f5ddb";
            String motoTypeId = "65f98d46-5e40-4400-9575-328ec9cf18f8";
            String bikeTypeId = "e4ef4ea8-21ff-4c8c-89d5-924847c1cf39";
            String electricTypeId = "151a22a1-8ff0-4ec7-bee4-ca2444d381fc";
            String truckTypeId = "b220a840-e57b-4141-8071-55c41a485604";

            insertVehicleType(carTypeId, "CAR", "Private cars, family cars, service vehicles under 9 seats");
            insertVehicleType(motoTypeId, "MOTORBIKE", "Personal motorbikes, scooters, geared motorbikes");
            insertVehicleType(bikeTypeId, "BICYCLE", "Regular bicycles, sport bicycles");
            insertVehicleType(electricTypeId, "ELECTRIC_VEHICLE", "Electric motorbikes, electric bicycles");
            insertVehicleType(truckTypeId, "LIGHT_TRUCK", "Light trucks or delivery vans permitted in designated areas");

            log.info("Vehicle types seeded successfully.");

            // 3. Seed Parking Building
            String buildingId = "8b72da1f-50b3-4632-a5e2-632b8ac425f1";
            insertBuilding(buildingId, "Building A - Center", "123 Le Loi Street, District 1, Ho Chi Minh City", "02812345678", LocalTime.of(6, 0), LocalTime.of(23, 30));

            log.info("Parking buildings seeded successfully.");

            // 4. Seed Pricing Policies
            insertPricing("cee917e1-4ebf-460c-b728-b6df8c4d5eaf", buildingId, carTypeId, new BigDecimal("10000.00"), new BigDecimal("150000.00"), new BigDecimal("250000.00"), new BigDecimal("1.5"), LocalDateTime.of(2026, 6, 1, 0, 0), new BigDecimal("20000.00"), new BigDecimal("15000.00"));
            insertPricing("e5cdba26-c078-4f48-8df8-3e9499f88fa8", buildingId, motoTypeId, new BigDecimal("3000.00"), new BigDecimal("50000.00"), new BigDecimal("100000.00"), new BigDecimal("1.5"), LocalDateTime.of(2026, 6, 1, 0, 0), new BigDecimal("5000.00"), new BigDecimal("5000.00"));
            insertPricing("fe60d9b7-9458-4d62-9870-e2852de35f3d", buildingId, bikeTypeId, new BigDecimal("1000.00"), new BigDecimal("15000.00"), new BigDecimal("50000.00"), new BigDecimal("1.5"), LocalDateTime.of(2026, 6, 1, 0, 0), new BigDecimal("3000.00"), new BigDecimal("2000.00"));
            insertPricing("33fde9df-43d1-4051-982a-c8fb035e796b", buildingId, electricTypeId, new BigDecimal("4000.00"), new BigDecimal("60000.00"), new BigDecimal("120000.00"), new BigDecimal("1.5"), LocalDateTime.of(2026, 6, 1, 0, 0), new BigDecimal("7000.00"), new BigDecimal("6000.00"));
            insertPricing("89360edb-0e14-45a1-ac6a-a5010355a1db", buildingId, truckTypeId, new BigDecimal("15000.00"), new BigDecimal("200000.00"), new BigDecimal("300000.00"), new BigDecimal("1.5"), LocalDateTime.of(2026, 6, 1, 0, 0), new BigDecimal("30000.00"), new BigDecimal("20000.00"));

            log.info("Pricing policies seeded successfully.");

            // 5. Seed Floors
            String floor1Id = "9f3c1d9b-a48e-49b0-9b43-982823a0b12f";
            String floor2Id = "4f2d3a9b-b48e-49b0-9b43-982823a0b13f";
            String floor3Id = "5f2d3a9b-b48e-49b0-9b43-982823a0b14f";

            insertFloor(floor1Id, buildingId, "Floor 1", 1, 10);
            insertFloor(floor2Id, buildingId, "Floor 2", 2, 15);
            insertFloor(floor3Id, buildingId, "Floor 3", 3, 10);

            log.info("Floors seeded successfully.");

            // 6. Seed Slots
            // CAR Slots (Floor 1)
            String slotA01 = "1a1a1a1a-1a1a-1a1a-1a1a-1a1a1a1a1a01";
            String slotA02 = "1a1a1a1a-1a1a-1a1a-1a1a-1a1a1a1a1a02";
            String slotA03 = "1a1a1a1a-1a1a-1a1a-1a1a-1a1a1a1a1a03";
            String slotA04 = "1a1a1a1a-1a1a-1a1a-1a1a-1a1a1a1a1a04";

            insertSlot(slotA01, floor1Id, "1A-01", SlotStatus.AVAILABLE.name(), VehicleTypeEnum.CAR.name(), "A");
            insertSlot(slotA02, floor1Id, "1A-02", SlotStatus.AVAILABLE.name(), VehicleTypeEnum.CAR.name(), "A");
            insertSlot(slotA03, floor1Id, "1A-03", SlotStatus.OCCUPIED.name(), VehicleTypeEnum.CAR.name(), "A");
            insertSlot(slotA04, floor1Id, "1A-04", SlotStatus.RESERVED.name(), VehicleTypeEnum.CAR.name(), "A");
            insertSlot(UUID.randomUUID().toString(), floor1Id, "1A-05", SlotStatus.AVAILABLE.name(), VehicleTypeEnum.CAR.name(), "A");
            for (int i = 1; i <= 5; i++) {
                insertSlot(UUID.randomUUID().toString(), floor1Id, "1B-0" + i, SlotStatus.AVAILABLE.name(), VehicleTypeEnum.CAR.name(), "B");
            }

            // MOTORBIKE Slots (Floor 2)
            String slotB01 = "2b2b2b2b-2b2b-2b2b-2b2b-2b2b2b2b2b01";
            String slotB02 = "2b2b2b2b-2b2b-2b2b-2b2b-2b2b2b2b2b02";

            insertSlot(slotB01, floor2Id, "2A-01", SlotStatus.AVAILABLE.name(), VehicleTypeEnum.MOTORBIKE.name(), "A");
            insertSlot(slotB02, floor2Id, "2A-02", SlotStatus.OCCUPIED.name(), VehicleTypeEnum.MOTORBIKE.name(), "A");
            for (int i = 3; i <= 7; i++) {
                insertSlot(UUID.randomUUID().toString(), floor2Id, "2A-0" + i, SlotStatus.AVAILABLE.name(), VehicleTypeEnum.MOTORBIKE.name(), "A");
            }
            for (int i = 1; i <= 8; i++) {
                insertSlot(UUID.randomUUID().toString(), floor2Id, "2B-0" + i, SlotStatus.AVAILABLE.name(), VehicleTypeEnum.MOTORBIKE.name(), "B");
            }

            // BICYCLE Slots (Floor 3)
            String slotC01 = "3c3c3c3c-3c3c-3c3c-3c3c-3c3c3c3c3c01";
            String slotC02 = "3c3c3c3c-3c3c-3c3c-3c3c-3c3c3c3c3c02";

            insertSlot(slotC01, floor3Id, "3A-01", SlotStatus.AVAILABLE.name(), VehicleTypeEnum.BICYCLE.name(), "A");
            insertSlot(slotC02, floor3Id, "3A-02", SlotStatus.OCCUPIED.name(), VehicleTypeEnum.BICYCLE.name(), "A");
            for (int i = 3; i <= 5; i++) {
                insertSlot(UUID.randomUUID().toString(), floor3Id, "3A-0" + i, SlotStatus.AVAILABLE.name(), VehicleTypeEnum.BICYCLE.name(), "A");
            }
            for (int i = 1; i <= 5; i++) {
                insertSlot(UUID.randomUUID().toString(), floor3Id, "3B-0" + i, SlotStatus.AVAILABLE.name(), VehicleTypeEnum.BICYCLE.name(), "B");
            }

            log.info("Parking slots seeded successfully.");

            // 7. Seed Parking Sessions & Payments
            String session1Id = "a1111111-1111-1111-1111-111111111111";
            String session2Id = "a2222222-2222-2222-2222-222222222222";
            String session3Id = "a3333333-3333-3333-3333-333333333333";
            String session4Id = "a4444444-4444-4444-4444-444444444444";

            // Session 1: Completed CAR (Cash payment)
            insertSession(session1Id, slotA01, driverId, staffId, staffId, "29A-12345", VehicleTypeEnum.CAR.name(), "TKT-CAR-001",
                    LocalDateTime.of(2026, 6, 8, 8, 0, 0), LocalDateTime.of(2026, 6, 8, 12, 0, 0),
                    LocalDateTime.of(2026, 6, 8, 8, 5, 0), SessionStatus.COMPLETED.name(), "Gate 1", "Gate 1");
            insertPayment(UUID.randomUUID().toString(), session1Id, new BigDecimal("60000.00"), BigDecimal.ZERO, PaymentMethod.CASH.name(), PaymentStatus.PAID.name(), LocalDateTime.of(2026, 6, 8, 12, 0, 0));

            // Session 2: Completed MOTORBIKE (VNPay payment)
            insertSession(session2Id, slotB01, driver2Id, staffId, staffId, "29B-54321", VehicleTypeEnum.MOTORBIKE.name(), "TKT-BIKE-002",
                    LocalDateTime.of(2026, 6, 9, 10, 0, 0), LocalDateTime.of(2026, 6, 9, 13, 0, 0),
                    LocalDateTime.of(2026, 6, 9, 10, 2, 0), SessionStatus.COMPLETED.name(), "Gate 2", "Gate 2");
            insertPayment(UUID.randomUUID().toString(), session2Id, new BigDecimal("14000.00"), BigDecimal.ZERO, PaymentMethod.VNPAY.name(), PaymentStatus.PAID.name(), LocalDateTime.of(2026, 6, 9, 13, 0, 0));

            // Session 3: Active CAR
            insertSession(session3Id, slotA03, driverId, staffId, null, "30H-99999", VehicleTypeEnum.CAR.name(), "TKT-CAR-003",
                    LocalDateTime.of(2026, 6, 10, 1, 0, 0), null,
                    LocalDateTime.of(2026, 6, 10, 1, 10, 0), SessionStatus.ACTIVE.name(), "Gate 1", null);

            // Session 4: Lost Ticket MOTORBIKE
            insertSession(session4Id, slotB02, driver2Id, staffId, null, "29C-88888", VehicleTypeEnum.MOTORBIKE.name(), "TKT-BIKE-004",
                    LocalDateTime.of(2026, 6, 9, 18, 0, 0), null,
                    LocalDateTime.of(2026, 6, 9, 18, 15, 0), SessionStatus.LOST_TICKET.name(), "Gate 2", null);

            log.info("Parking sessions and payments seeded successfully.");

            // 8. Seed Reservations
            insertReservation("91111111-1111-1111-1111-111111111111", driverId, slotA04, VehicleTypeEnum.CAR.name(),
                    LocalDateTime.of(2026, 6, 10, 10, 0, 0), LocalDateTime.of(2026, 6, 10, 12, 0, 0),
                    ReservationStatus.CONFIRMED.name(), LocalDateTime.of(2026, 6, 9, 15, 0, 0), buildingId);

            log.info("Reservations seeded successfully.");

            // 9. Seed Feedbacks
            insertFeedback("f1111111-1111-1111-1111-111111111111", driverId, session1Id, "Service", "Friendly staff, clean and safe parking space.", FeedbackStatus.OPEN.name(), LocalDateTime.of(2026, 6, 8, 12, 30, 0));

            log.info("Feedbacks seeded successfully.");
            log.info("Development mock data seeding complete!");

        } catch (Exception e) {
            log.error("Failed to seed database: ", e);
            throw e;
        }
    }

    private void insertUser(String id, String email, String password, String fullName, String phone, String role) {
        String query = "INSERT INTO users (id, email, password_hash, full_name, phone, role, is_active, created_at, updated_at) " +
                       "VALUES (?, ?, ?, ?, ?, ?, true, NOW(), NOW())";
        jdbcTemplate.update(query, UUID.fromString(id), email, passwordEncoder.encode(password), fullName, phone, role);
    }

    private void insertVehicleType(String id, String name, String description) {
        String query = "INSERT INTO vehicle_types (id, name, description) VALUES (?, ?, ?)";
        jdbcTemplate.update(query, UUID.fromString(id), name, description);
    }

    private void insertBuilding(String id, String name, String address, String phone, LocalTime openingTime, LocalTime closingTime) {
        String query = "INSERT INTO parking_buildings (id, name, address, phone, opening_time, closing_time, is_active, created_at, updated_at) " +
                       "VALUES (?, ?, ?, ?, ?, ?, true, NOW(), NOW())";
        jdbcTemplate.update(query, UUID.fromString(id), name, address, phone, openingTime, closingTime);
    }

    private void insertPricing(String id, String buildingId, String vehicleTypeId, BigDecimal hourlyRate, BigDecimal dailyRate,
                               BigDecimal lostTicketFee, BigDecimal overtimeFeeMultiplier, LocalDateTime effectiveFrom,
                               BigDecimal basePrice, BigDecimal nightRate) {
        String query = "INSERT INTO pricing (id, building_id, vehicle_type_id, hourly_rate, daily_rate, lost_ticket_fee, " +
                       "overtime_fee_multiplier, effective_from, effective_to, base_price, night_rate) " +
                       "VALUES (?, ?, ?, ?, ?, ?, ?, ?, null, ?, ?)";
        jdbcTemplate.update(query, UUID.fromString(id), UUID.fromString(buildingId), UUID.fromString(vehicleTypeId),
                hourlyRate, dailyRate, lostTicketFee, overtimeFeeMultiplier, effectiveFrom, basePrice, nightRate);
    }

    private void insertFloor(String id, String buildingId, String floorName, int floorNumber, int totalSlots) {
        String query = "INSERT INTO floors (id, building_id, floor_name, floor_number, total_slots, is_active) " +
                       "VALUES (?, ?, ?, ?, ?, true)";
        jdbcTemplate.update(query, UUID.fromString(id), UUID.fromString(buildingId), floorName, floorNumber, totalSlots);
    }

    private void insertSlot(String id, String floorId, String slotCode, String status, String vehicleType, String zone) {
        String query = "INSERT INTO parking_slots (id, floor_id, slot_code, status, vehicle_type, zone) VALUES (?, ?, ?, ?, ?, ?)";
        jdbcTemplate.update(query, UUID.fromString(id), UUID.fromString(floorId), slotCode, status, vehicleType, zone);
    }

    private void insertSession(String id, String slotId, String driverId, String staffInId, String staffOutId,
                              String licensePlate, String vehicleType, String ticketCode, LocalDateTime checkInTime,
                              LocalDateTime checkOutTime, LocalDateTime parkedAt, String status, String gateIn, String gateOut) {
        String query = "INSERT INTO parking_sessions (id, slot_id, driver_id, staff_in_id, staff_out_id, license_plate, " +
                       "vehicle_type, ticket_code, check_in_time, check_out_time, parked_at, status, gate_in, gate_out) " +
                       "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        jdbcTemplate.update(query,
                UUID.fromString(id),
                slotId != null ? UUID.fromString(slotId) : null,
                driverId != null ? UUID.fromString(driverId) : null,
                staffInId != null ? UUID.fromString(staffInId) : null,
                staffOutId != null ? UUID.fromString(staffOutId) : null,
                licensePlate,
                vehicleType,
                ticketCode,
                checkInTime,
                checkOutTime,
                parkedAt,
                status,
                gateIn,
                gateOut);
    }

    private void insertPayment(String id, String sessionId, BigDecimal amount, BigDecimal extraFee, String method, String status, LocalDateTime paidAt) {
        String query = "INSERT INTO payments (id, session_id, amount, extra_fee, method, status, paid_at) VALUES (?, ?, ?, ?, ?, ?, ?)";
        jdbcTemplate.update(query, UUID.fromString(id), UUID.fromString(sessionId), amount, extraFee, method, status, paidAt);
    }

    private void insertReservation(String id, String driverId, String slotId, String vehicleType, LocalDateTime reservedFrom,
                                   LocalDateTime reservedTo, String status, LocalDateTime createdAt, String buildingId) {
        String query = "INSERT INTO reservations (id, driver_id, slot_id, vehicle_type, reserved_from, reserved_to, status, created_at, building_id) " +
                       "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        jdbcTemplate.update(query,
                UUID.fromString(id),
                UUID.fromString(driverId),
                slotId != null ? UUID.fromString(slotId) : null,
                vehicleType,
                reservedFrom,
                reservedTo,
                status,
                createdAt,
                UUID.fromString(buildingId));
    }

    private void insertFeedback(String id, String driverId, String sessionId, String category, String content, String status, LocalDateTime createdAt) {
        String query = "INSERT INTO feedbacks (id, driver_id, session_id, category, content, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)";
        jdbcTemplate.update(query,
                UUID.fromString(id),
                UUID.fromString(driverId),
                sessionId != null ? UUID.fromString(sessionId) : null,
                category,
                content,
                status,
                createdAt);
    }
}
