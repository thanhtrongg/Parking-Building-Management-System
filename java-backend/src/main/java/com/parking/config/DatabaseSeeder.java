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
        // Force database reset and re-seeding to apply the new physical building layout and distances
        log.info("Resetting and seeding database with new development mock data layout...");
        jdbcTemplate.execute("TRUNCATE TABLE users, parking_slots, floors, zones, parking_buildings, pricing, reservations, parking_sessions, payments, feedbacks, vehicle_types CASCADE");

        log.info("Seeding database with development mock data...");

        try {
            // 1. Seed Users (Gmail accounts to match typical frontend defaults)
            String adminId = "1a8b5c9d-6fa4-46ab-8cb3-c3f2b45a49dc";
            String managerId = "2b8b5c9d-6fa4-46ab-8cb3-c3f2b45a49dc";
            String staffId = "3c8b5c9d-6fa4-46ab-8cb3-c3f2b45a49dc";
            String driverId = "4d8b5c9d-6fa4-46ab-8cb3-c3f2b45a49dc";

            insertUser(adminId, "admin@gmail.com", "123456", "Admin", "0911234567", UserRole.ADMIN.name());
            insertUser(managerId, "manager@gmail.com", "123456", "Manager", "0917654321", UserRole.MANAGER.name());
            insertUser(staffId, "staff@gmail.com", "123456", "Staff", "0918888888", UserRole.STAFF.name());
            insertUser(driverId, "driver@gmail.com", "123456", "Driver", "0919999999", UserRole.DRIVER.name());

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

            String buildingBId = "9c83eb2a-61c4-5743-b6f3-743c9bd536f2";
            insertBuilding(buildingBId, "Building B - East Gate", "456 Nguyen Hue Street, District 1, Ho Chi Minh City", "02887654321", LocalTime.of(5, 0), LocalTime.of(23, 0));

            log.info("Parking buildings seeded successfully.");

            // 4. Seed Pricing Policies
            insertPricing("cee917e1-4ebf-460c-b728-b6df8c4d5eaf", buildingId, carTypeId, new BigDecimal("10000.00"), new BigDecimal("150000.00"), new BigDecimal("250000.00"), new BigDecimal("1.5"), LocalDateTime.of(2026, 6, 1, 0, 0), new BigDecimal("20000.00"), new BigDecimal("15000.00"));
            insertPricing("e5cdba26-c078-4f48-8df8-3e9499f88fa8", buildingId, motoTypeId, new BigDecimal("3000.00"), new BigDecimal("50000.00"), new BigDecimal("100000.00"), new BigDecimal("1.5"), LocalDateTime.of(2026, 6, 1, 0, 0), new BigDecimal("5000.00"), new BigDecimal("5000.00"));
            insertPricing("fe60d9b7-9458-4d62-9870-e2852de35f3d", buildingId, bikeTypeId, new BigDecimal("1000.00"), new BigDecimal("15000.00"), new BigDecimal("50000.00"), new BigDecimal("1.5"), LocalDateTime.of(2026, 6, 1, 0, 0), new BigDecimal("3000.00"), new BigDecimal("2000.00"));
            insertPricing("33fde9df-43d1-4051-982a-c8fb035e796b", buildingId, electricTypeId, new BigDecimal("4000.00"), new BigDecimal("60000.00"), new BigDecimal("120000.00"), new BigDecimal("1.5"), LocalDateTime.of(2026, 6, 1, 0, 0), new BigDecimal("7000.00"), new BigDecimal("6000.00"));
            insertPricing("89360edb-0e14-45a1-ac6a-a5010355a1db", buildingId, truckTypeId, new BigDecimal("15000.00"), new BigDecimal("200000.00"), new BigDecimal("300000.00"), new BigDecimal("1.5"), LocalDateTime.of(2026, 6, 1, 0, 0), new BigDecimal("30000.00"), new BigDecimal("2000.00"));

            insertPricing("cee917e1-4ebf-460c-b728-b6df8c4d5eb0", buildingBId, carTypeId, new BigDecimal("12000.00"), new BigDecimal("180000.00"), new BigDecimal("300000.00"), new BigDecimal("1.5"), LocalDateTime.of(2026, 6, 1, 0, 0), new BigDecimal("25000.00"), new BigDecimal("18000.00"));
            insertPricing("e5cdba26-c078-4f48-8df8-3e9499f88fa9", buildingBId, motoTypeId, new BigDecimal("4000.00"), new BigDecimal("60000.00"), new BigDecimal("120000.00"), new BigDecimal("1.5"), LocalDateTime.of(2026, 6, 1, 0, 0), new BigDecimal("6000.00"), new BigDecimal("6000.00"));

            log.info("Pricing policies seeded successfully.");

            // 5. Seed Floors
            String floor1Id = "9f3c1d9b-a48e-49b0-9b43-982823a0b12f";
            String floor2Id = "4f2d3a9b-b48e-49b0-9b43-982823a0b13f";
            String floor3Id = "5f2d3a9b-b48e-49b0-9b43-982823a0b14f";
            String floor4Id = "6f2d3a9b-b48e-49b0-9b43-982823a0b15f";
            String floor5Id = "7f2d3a9b-b48e-49b0-9b43-982823a0b16f";

            insertFloor(floor1Id, buildingId, "Ground Floor", 1, 10);
            insertFloor(floor2Id, buildingId, "Level 2", 2, 15);
            insertFloor(floor3Id, buildingId, "Level 3", 3, 10);
            insertFloor(floor4Id, buildingId, "Basement 1", -1, 5);
            insertFloor(floor5Id, buildingId, "Basement 2", -2, 5);

            String floorB1Id = "1f3c1d9b-a48e-49b0-9b43-982823a0b12f";
            insertFloor(floorB1Id, buildingBId, "Ground Floor", 1, 5);

            log.info("Floors seeded successfully.");

            // Zone constants for foreign keys
            String zoneA_CarId = "11111111-2222-3333-4444-55555555555a";
            String zoneB_MotoId = "11111111-2222-3333-4444-55555555555b";
            String zoneC_BikeId = "11111111-2222-3333-4444-55555555555c";
            String zoneD_ElecId = "11111111-2222-3333-4444-55555555555d";
            String zoneE_TruckId = "11111111-2222-3333-4444-55555555555e";
            String zoneA_B_CarId = "11111111-2222-3333-4444-55555555555f";

            // 6. Seed Slots
            // CAR Slots (Floor 1)
            String slotA01 = "1a1a1a1a-1a1a-1a1a-1a1a-1a1a1a1a1a01";
            String slotA02 = "1a1a1a1a-1a1a-1a1a-1a1a-1a1a1a1a1a02";
            String slotA03 = "1a1a1a1a-1a1a-1a1a-1a1a-1a1a1a1a1a03";
            String slotA04 = "1a1a1a1a-1a1a-1a1a-1a1a-1a1a1a1a1a04";
            String slotA05 = "1a1a1a1a-1a1a-1a1a-1a1a-1a1a1a1a1a05";

            insertSlot(slotA01, floor1Id, "1A-01", SlotStatus.AVAILABLE.name(), VehicleTypeEnum.CAR.name(), "Zone A", 8, zoneA_CarId);
            insertSlot(slotA02, floor1Id, "1A-02", SlotStatus.OCCUPIED.name(), VehicleTypeEnum.CAR.name(), "Zone A", 9, zoneA_CarId);
            insertSlot(slotA03, floor1Id, "1A-03", SlotStatus.OCCUPIED.name(), VehicleTypeEnum.CAR.name(), "Zone A", 10, zoneA_CarId);
            insertSlot(slotA04, floor1Id, "1A-04", SlotStatus.RESERVED.name(), VehicleTypeEnum.CAR.name(), "Zone A", 11, zoneA_CarId);
            insertSlot(slotA05, floor1Id, "1A-05", SlotStatus.OCCUPIED.name(), VehicleTypeEnum.CAR.name(), "Zone A", 12, zoneA_CarId);
            for (int i = 1; i <= 5; i++) {
                String status = SlotStatus.AVAILABLE.name();
                if (i == 4) status = SlotStatus.MAINTENANCE.name();
                if (i == 5) status = SlotStatus.LOCKED.name();
                insertSlot(UUID.randomUUID().toString(), floor1Id, "1B-0" + i, status, VehicleTypeEnum.CAR.name(), "Zone B", 35 + i, null);
            }

            // Building B Floor 1 slots
            insertSlot(UUID.randomUUID().toString(), floorB1Id, "1B-01", SlotStatus.AVAILABLE.name(), VehicleTypeEnum.CAR.name(), "Zone A", 10, zoneA_B_CarId);
            insertSlot(UUID.randomUUID().toString(), floorB1Id, "1B-02", SlotStatus.AVAILABLE.name(), VehicleTypeEnum.CAR.name(), "Zone A", 12, zoneA_B_CarId);

            // MOTORBIKE Slots (Floor 2)
            String slotB01 = "2b2b2b2b-2b2b-2b2b-2b2b-2b2b2b2b2b01";
            String slotB02 = "2b2b2b2b-2b2b-2b2b-2b2b-2b2b2b2b2b02";
            String slotB03 = "2b2b2b2b-2b2b-2b2b-2b2b-2b2b2b2b2b03";

            insertSlot(slotB01, floor2Id, "2A-01", SlotStatus.OCCUPIED.name(), VehicleTypeEnum.MOTORBIKE.name(), "Zone B", 68, zoneB_MotoId);
            insertSlot(slotB02, floor2Id, "2A-02", SlotStatus.OCCUPIED.name(), VehicleTypeEnum.MOTORBIKE.name(), "Zone B", 69, zoneB_MotoId);
            insertSlot(slotB03, floor2Id, "2A-03", SlotStatus.OCCUPIED.name(), VehicleTypeEnum.MOTORBIKE.name(), "Zone B", 70, zoneB_MotoId);
            for (int i = 4; i <= 7; i++) {
                insertSlot(UUID.randomUUID().toString(), floor2Id, "2A-0" + i, SlotStatus.AVAILABLE.name(), VehicleTypeEnum.MOTORBIKE.name(), "Zone B", 67 + i, zoneB_MotoId);
            }
            for (int i = 1; i <= 8; i++) {
                String status = SlotStatus.AVAILABLE.name();
                if (i == 7) status = SlotStatus.MAINTENANCE.name();
                if (i == 8) status = SlotStatus.LOCKED.name();
                insertSlot(UUID.randomUUID().toString(), floor2Id, "2B-0" + i, status, VehicleTypeEnum.MOTORBIKE.name(), "Zone B", 95 + i, zoneB_MotoId);
            }

            // BICYCLE Slots (Floor 3)
            String slotC01 = "3c3c3c3c-3c3c-3c3c-3c3c-3c3c3c3c3c01";
            String slotC02 = "3c3c3c3c-3c3c-3c3c-3c3c-3c3c3c3c3c02";

            insertSlot(slotC01, floor3Id, "3A-01", SlotStatus.AVAILABLE.name(), VehicleTypeEnum.BICYCLE.name(), "Zone C", 129, zoneC_BikeId);
            insertSlot(slotC02, floor3Id, "3A-02", SlotStatus.OCCUPIED.name(), VehicleTypeEnum.BICYCLE.name(), "Zone C", 130, zoneC_BikeId);
            for (int i = 3; i <= 5; i++) {
                insertSlot(UUID.randomUUID().toString(), floor3Id, "3A-0" + i, SlotStatus.AVAILABLE.name(), VehicleTypeEnum.BICYCLE.name(), "Zone C", 128 + i, zoneC_BikeId);
            }
            for (int i = 1; i <= 5; i++) {
                String status = SlotStatus.AVAILABLE.name();
                if (i == 5) status = SlotStatus.MAINTENANCE.name();
                insertSlot(UUID.randomUUID().toString(), floor3Id, "3B-0" + i, status, VehicleTypeEnum.BICYCLE.name(), "Zone C", 155 + i, zoneC_BikeId);
            }

            // ELECTRIC_VEHICLE Slots (Floor 4)
            for (int i = 1; i <= 5; i++) {
                String status = SlotStatus.AVAILABLE.name();
                if (i == 5) status = SlotStatus.MAINTENANCE.name();
                insertSlot(UUID.randomUUID().toString(), floor4Id, "4D-0" + i, status, VehicleTypeEnum.ELECTRIC_VEHICLE.name(), "Zone D", 60 + i, zoneD_ElecId);
            }

            // LIGHT_TRUCK Slots (Floor 5)
            for (int i = 1; i <= 5; i++) {
                String status = SlotStatus.AVAILABLE.name();
                if (i == 5) status = SlotStatus.MAINTENANCE.name();
                insertSlot(UUID.randomUUID().toString(), floor5Id, "5E-0" + i, status, VehicleTypeEnum.LIGHT_TRUCK.name(), "Zone E", 115 + i, zoneE_TruckId);
            }

            log.info("Parking slots seeded successfully.");

            // 7. Seed Parking Sessions & Payments
            String session1Id = "a1111111-1111-1111-1111-111111111111";
            String session2Id = "a2222222-2222-2222-2222-222222222222";
            String session3Id = "a3333333-3333-3333-3333-333333333333";
            String session4Id = "a4444444-4444-4444-4444-444444444444";
            String session5Id = "a5555555-5555-5555-5555-555555555555";
            String session6Id = "a6666666-6666-6666-6666-666666666666";
            String session7Id = "a7777777-7777-7777-7777-777777777777";
            String session8Id = "a8888888-8888-8888-8888-888888888888";
            String session9Id = "a9999999-9999-9999-9999-999999999999";
            String session10Id = "a1010101-1010-1010-1010-101010101010";
            String session11Id = "a1111111-2222-3333-4444-555555555555";
            String session12Id = "a1212121-1212-1212-1212-121212121212";
            String session13Id = "a1313131-1313-1313-1313-131313131313";
            String session14Id = "a1414141-1414-1414-1414-141414141414";
            String session15Id = "a1515151-1515-1515-1515-151515151515";
            String session16Id = "a1616161-1616-1616-1616-161616161616";
            String session17Id = "a1717171-1717-1717-1717-171717171717";
            String session18Id = "a1818181-1818-1818-1818-181818181818";
            String session19Id = "a1919191-1919-1919-1919-191919191919";
            String session20Id = "a2020202-2020-2020-2020-202020202020";

            // Session 1: Completed CAR (Cash payment)
            insertSession(session1Id, slotA01, driverId, staffId, staffId, "29A-12345", VehicleTypeEnum.CAR.name(), "TKT-CAR-001",
                    LocalDateTime.of(2026, 6, 8, 8, 0, 0), LocalDateTime.of(2026, 6, 8, 12, 0, 0),
                    LocalDateTime.of(2026, 6, 8, 8, 5, 0), SessionStatus.COMPLETED.name(), "Gate 1", "Gate 1");
            insertPayment(UUID.randomUUID().toString(), session1Id, new BigDecimal("60000.00"), BigDecimal.ZERO, PaymentMethod.CASH.name(), PaymentStatus.PAID.name(), LocalDateTime.of(2026, 6, 8, 12, 0, 0));

            // Session 2: Completed MOTORBIKE (VNPay payment)
            insertSession(session2Id, slotB01, driverId, staffId, staffId, "29B-54321", VehicleTypeEnum.MOTORBIKE.name(), "TKT-BIKE-002",
                    LocalDateTime.of(2026, 6, 9, 10, 0, 0), LocalDateTime.of(2026, 6, 9, 13, 0, 0),
                    LocalDateTime.of(2026, 6, 9, 10, 2, 0), SessionStatus.COMPLETED.name(), "Gate 2", "Gate 2");
            insertPayment(UUID.randomUUID().toString(), session2Id, new BigDecimal("14000.00"), BigDecimal.ZERO, PaymentMethod.VNPAY.name(), PaymentStatus.PAID.name(), LocalDateTime.of(2026, 6, 9, 13, 0, 0));

            // Session 3: Active CAR
            insertSession(session3Id, slotA03, driverId, staffId, null, "30H-99999", VehicleTypeEnum.CAR.name(), "TKT-CAR-003",
                    LocalDateTime.of(2026, 6, 10, 1, 0, 0), null,
                    LocalDateTime.of(2026, 6, 10, 1, 10, 0), SessionStatus.ACTIVE.name(), "Gate 1", null);

            // Session 4: Lost Ticket MOTORBIKE
            insertSession(session4Id, slotB02, driverId, staffId, null, "29C-88888", VehicleTypeEnum.MOTORBIKE.name(), "TKT-BIKE-004",
                    LocalDateTime.of(2026, 6, 9, 18, 0, 0), null,
                    LocalDateTime.of(2026, 6, 9, 18, 15, 0), SessionStatus.LOST_TICKET.name(), "Gate 2", null);

            // Session 5: Active MOTORBIKE (Driver)
            insertSession(session5Id, slotB01, driverId, staffId, null, "59G-99999", VehicleTypeEnum.MOTORBIKE.name(), "TKT-BIKE-005",
                    LocalDateTime.of(2026, 6, 10, 8, 30, 0), null,
                    LocalDateTime.of(2026, 6, 10, 8, 35, 0), SessionStatus.ACTIVE.name(), "Gate 2", null);

            // Session 6: Completed BICYCLE (Guest/Walk-in, EWALLET payment)
            insertSession(session6Id, slotC01, null, staffId, staffId, "GUEST-BIKE-1", VehicleTypeEnum.BICYCLE.name(), "TKT-BIKE-006",
                    LocalDateTime.of(2026, 6, 9, 7, 0, 0), LocalDateTime.of(2026, 6, 9, 17, 0, 0),
                    LocalDateTime.of(2026, 6, 9, 7, 5, 0), SessionStatus.COMPLETED.name(), "Gate 1", "Gate 1");
            insertPayment(UUID.randomUUID().toString(), session6Id, new BigDecimal("10000.00"), BigDecimal.ZERO, PaymentMethod.EWALLET.name(), PaymentStatus.PAID.name(), LocalDateTime.of(2026, 6, 9, 17, 0, 0));

            // Session 7: Active CAR from reservation (Driver)
            insertSession(session7Id, slotA02, driverId, staffId, null, "51F-11111", VehicleTypeEnum.CAR.name(), "TKT-CAR-007",
                    LocalDateTime.of(2026, 6, 10, 9, 0, 0), null,
                    LocalDateTime.of(2026, 6, 10, 9, 5, 0), SessionStatus.ACTIVE.name(), "Gate 1", null);

            // Session 8: Completed CAR (Transfer payment)
            insertSession(session8Id, slotA01, null, staffId, staffId, "51A-99999", VehicleTypeEnum.CAR.name(), "TKT-CAR-008",
                    LocalDateTime.of(2026, 6, 8, 14, 0, 0), LocalDateTime.of(2026, 6, 8, 19, 30, 0),
                    LocalDateTime.of(2026, 6, 8, 14, 5, 0), SessionStatus.COMPLETED.name(), "Gate 1", "Gate 1");
            insertPayment(UUID.randomUUID().toString(), session8Id, new BigDecimal("75000.00"), BigDecimal.ZERO, PaymentMethod.TRANSFER.name(), PaymentStatus.PAID.name(), LocalDateTime.of(2026, 6, 8, 19, 30, 0));

            // Session 9: Completed MOTORBIKE (EWALLET payment)
            insertSession(session9Id, slotB02, driverId, staffId, staffId, "59D-33333", VehicleTypeEnum.MOTORBIKE.name(), "TKT-BIKE-009",
                    LocalDateTime.of(2026, 6, 8, 7, 30, 0), LocalDateTime.of(2026, 6, 8, 10, 0, 0),
                    LocalDateTime.of(2026, 6, 8, 7, 32, 0), SessionStatus.COMPLETED.name(), "Gate 2", "Gate 2");
            insertPayment(UUID.randomUUID().toString(), session9Id, new BigDecimal("10000.00"), BigDecimal.ZERO, PaymentMethod.EWALLET.name(), PaymentStatus.PAID.name(), LocalDateTime.of(2026, 6, 8, 10, 0, 0));

            // Session 10: Completed CAR (VNPay payment)
            insertSession(session10Id, slotA02, driverId, staffId, staffId, "30A-44444", VehicleTypeEnum.CAR.name(), "TKT-CAR-010",
                    LocalDateTime.of(2026, 6, 7, 8, 0, 0), LocalDateTime.of(2026, 6, 7, 18, 0, 0),
                    LocalDateTime.of(2026, 6, 7, 8, 5, 0), SessionStatus.COMPLETED.name(), "Gate 1", "Gate 1");
            insertPayment(UUID.randomUUID().toString(), session10Id, new BigDecimal("150000.00"), BigDecimal.ZERO, PaymentMethod.VNPAY.name(), PaymentStatus.PAID.name(), LocalDateTime.of(2026, 6, 7, 18, 0, 0));

            // Session 11: Completed BICYCLE (Cash payment)
            insertSession(session11Id, slotC02, null, staffId, staffId, "GUEST-BIKE-2", VehicleTypeEnum.BICYCLE.name(), "TKT-BIKE-011",
                    LocalDateTime.of(2026, 6, 10, 9, 0, 0), LocalDateTime.of(2026, 6, 10, 13, 0, 0),
                    LocalDateTime.of(2026, 6, 10, 9, 2, 0), SessionStatus.COMPLETED.name(), "Gate 1", "Gate 1");
            insertPayment(UUID.randomUUID().toString(), session11Id, new BigDecimal("4000.00"), BigDecimal.ZERO, PaymentMethod.CASH.name(), PaymentStatus.PAID.name(), LocalDateTime.of(2026, 6, 10, 13, 0, 0));

            // Session 12: Completed CAR (Transfer payment)
            insertSession(session12Id, slotA03, null, staffId, staffId, "43A-55555", VehicleTypeEnum.CAR.name(), "TKT-CAR-012",
                    LocalDateTime.of(2026, 6, 6, 10, 0, 0), LocalDateTime.of(2026, 6, 6, 15, 0, 0),
                    LocalDateTime.of(2026, 6, 6, 10, 5, 0), SessionStatus.COMPLETED.name(), "Gate 3", "Gate 3");
            insertPayment(UUID.randomUUID().toString(), session12Id, new BigDecimal("75000.00"), BigDecimal.ZERO, PaymentMethod.TRANSFER.name(), PaymentStatus.PAID.name(), LocalDateTime.of(2026, 6, 6, 15, 0, 0));

            // Session 13: Completed MOTORBIKE (EWALLET payment)
            insertSession(session13Id, slotB01, driverId, staffId, staffId, "92A-66666", VehicleTypeEnum.MOTORBIKE.name(), "TKT-BIKE-013",
                    LocalDateTime.of(2026, 6, 6, 8, 0, 0), LocalDateTime.of(2026, 6, 6, 12, 0, 0),
                    LocalDateTime.of(2026, 6, 6, 8, 2, 0), SessionStatus.COMPLETED.name(), "Gate 2", "Gate 2");
            insertPayment(UUID.randomUUID().toString(), session13Id, new BigDecimal("15000.00"), BigDecimal.ZERO, PaymentMethod.EWALLET.name(), PaymentStatus.PAID.name(), LocalDateTime.of(2026, 6, 6, 12, 0, 0));

            // Session 14: Active CAR (Guest entry)
            insertSession(session14Id, slotA05, null, staffId, null, "59A-12345", VehicleTypeEnum.CAR.name(), "TKT-CAR-014",
                    LocalDateTime.of(2026, 6, 10, 16, 30, 0), null,
                    LocalDateTime.of(2026, 6, 10, 16, 35, 0), SessionStatus.ACTIVE.name(), "Gate 1", null);

            // Session 15: Active MOTORBIKE (Guest entry)
            insertSession(session15Id, slotB03, null, staffId, null, "59C-77777", VehicleTypeEnum.MOTORBIKE.name(), "TKT-BIKE-015",
                    LocalDateTime.of(2026, 6, 10, 17, 0, 0), null,
                    LocalDateTime.of(2026, 6, 10, 17, 2, 0), SessionStatus.ACTIVE.name(), "Gate 2", null);

            // Session 16: Exception CAR (Refunded payment)
            insertSession(session16Id, slotA03, driverId, staffId, staffId, "30F-55555", VehicleTypeEnum.CAR.name(), "TKT-CAR-016",
                    LocalDateTime.of(2026, 6, 5, 9, 0, 0), LocalDateTime.of(2026, 6, 5, 11, 0, 0),
                    LocalDateTime.of(2026, 6, 5, 9, 5, 0), SessionStatus.EXCEPTION.name(), "Gate 1", "Gate 1");
            insertPayment(UUID.randomUUID().toString(), session16Id, new BigDecimal("30000.00"), BigDecimal.ZERO, PaymentMethod.TRANSFER.name(), PaymentStatus.REFUNDED.name(), LocalDateTime.of(2026, 6, 5, 11, 10, 0));

            // Session 17: Active BICYCLE (Guest)
            insertSession(session17Id, slotC02, null, staffId, null, "GUEST-BIKE-3", VehicleTypeEnum.BICYCLE.name(), "TKT-BIKE-017",
                    LocalDateTime.of(2026, 6, 10, 15, 0, 0), null,
                    LocalDateTime.of(2026, 6, 10, 15, 2, 0), SessionStatus.ACTIVE.name(), "Gate 1", null);

            // Session 18: Completed MOTORBIKE (VNPay payment, PENDING status)
            insertSession(session18Id, slotB03, driverId, staffId, null, "30F-99999", VehicleTypeEnum.MOTORBIKE.name(), "TKT-BIKE-018",
                    LocalDateTime.of(2026, 6, 10, 10, 0, 0), null,
                    LocalDateTime.of(2026, 6, 10, 10, 5, 0), SessionStatus.ACTIVE.name(), "Gate 2", null);
            insertPayment(UUID.randomUUID().toString(), session18Id, new BigDecimal("8000.00"), BigDecimal.ZERO, PaymentMethod.VNPAY.name(), PaymentStatus.PENDING.name(), LocalDateTime.of(2026, 6, 10, 12, 0, 0));

            // Session 19: Completed CAR (Ewallet payment, PENDING status)
            insertSession(session19Id, slotA05, null, staffId, null, "29A-88888", VehicleTypeEnum.CAR.name(), "TKT-CAR-019",
                    LocalDateTime.of(2026, 6, 9, 15, 0, 0), null,
                    LocalDateTime.of(2026, 6, 9, 15, 5, 0), SessionStatus.ACTIVE.name(), "Gate 1", null);
            insertPayment(UUID.randomUUID().toString(), session19Id, new BigDecimal("45000.00"), BigDecimal.ZERO, PaymentMethod.EWALLET.name(), PaymentStatus.PENDING.name(), LocalDateTime.of(2026, 6, 9, 18, 0, 0));

            // Session 20: Completed CAR (Cash payment, REFUNDED status)
            insertSession(session20Id, slotA04, driverId, staffId, staffId, "51D-77777", VehicleTypeEnum.CAR.name(), "TKT-CAR-020",
                    LocalDateTime.of(2026, 6, 5, 8, 0, 0), LocalDateTime.of(2026, 6, 5, 12, 0, 0),
                    LocalDateTime.of(2026, 6, 5, 8, 5, 0), SessionStatus.EXCEPTION.name(), "Gate 1", "Gate 1");
            insertPayment(UUID.randomUUID().toString(), session20Id, new BigDecimal("50000.00"), BigDecimal.ZERO, PaymentMethod.CASH.name(), PaymentStatus.REFUNDED.name(), LocalDateTime.of(2026, 6, 5, 12, 10, 0));

            log.info("Parking sessions and payments seeded successfully.");

            // 8. Seed Reservations
            // Confirmed Reservation 1
            insertReservation("91111111-1111-1111-1111-111111111111", driverId, slotA04, VehicleTypeEnum.CAR.name(),
                    LocalDateTime.of(2026, 6, 10, 10, 0, 0), LocalDateTime.of(2026, 6, 10, 12, 0, 0),
                    ReservationStatus.CONFIRMED.name(), LocalDateTime.of(2026, 6, 9, 15, 0, 0), buildingId);

            // Checked-in Reservation 2 (corresponds to Session 7)
            insertReservation("92222222-2222-2222-2222-222222222222", driverId, slotA02, VehicleTypeEnum.CAR.name(),
                    LocalDateTime.of(2026, 6, 10, 8, 30, 0), LocalDateTime.of(2026, 6, 10, 18, 30, 0),
                    ReservationStatus.USED.name(), LocalDateTime.of(2026, 6, 9, 20, 0, 0), buildingId);

            // Completed Reservation 3
            insertReservation("93333333-3333-3333-3333-333333333333", driverId, slotA01, VehicleTypeEnum.CAR.name(),
                    LocalDateTime.of(2026, 6, 8, 8, 0, 0), LocalDateTime.of(2026, 6, 8, 12, 0, 0),
                    ReservationStatus.USED.name(), LocalDateTime.of(2026, 6, 7, 12, 0, 0), buildingId);

            // Cancelled Reservation 4
            insertReservation("94444444-4444-4444-4444-444444444444", driverId, slotA02, VehicleTypeEnum.CAR.name(),
                    LocalDateTime.of(2026, 6, 9, 14, 0, 0), LocalDateTime.of(2026, 6, 9, 16, 0, 0),
                    ReservationStatus.CANCELLED.name(), LocalDateTime.of(2026, 6, 8, 10, 0, 0), buildingId);

            // Confirmed Reservation 5 (Future reservation for driver@gmail.com)
            insertReservation("95555555-5555-5555-5555-555555555555", driverId, slotA01, VehicleTypeEnum.CAR.name(),
                    LocalDateTime.of(2026, 6, 12, 9, 0, 0), LocalDateTime.of(2026, 6, 12, 18, 0, 0),
                    ReservationStatus.CONFIRMED.name(), LocalDateTime.of(2026, 6, 10, 14, 0, 0), buildingId);

            // Expired Reservation 6
            insertReservation("96666666-6666-6666-6666-666666666666", driverId, slotA01, VehicleTypeEnum.CAR.name(),
                    LocalDateTime.of(2026, 6, 5, 10, 0, 0), LocalDateTime.of(2026, 6, 5, 12, 0, 0),
                    ReservationStatus.EXPIRED.name(), LocalDateTime.of(2026, 6, 4, 10, 0, 0), buildingId);

            // Pending Reservation 7
            insertReservation("97777777-7777-7777-7777-777777777777", driverId, slotA01, VehicleTypeEnum.CAR.name(),
                    LocalDateTime.of(2026, 6, 13, 10, 0, 0), LocalDateTime.of(2026, 6, 13, 12, 0, 0),
                    ReservationStatus.PENDING.name(), LocalDateTime.of(2026, 6, 10, 15, 0, 0), buildingId);

            log.info("Reservations seeded successfully.");

            // Seed Zones
            insertZone("11111111-2222-3333-4444-55555555555a", "Zone A", carTypeId, 10, buildingId);
            insertZone("11111111-2222-3333-4444-55555555555b", "Zone B", motoTypeId, 15, buildingId);
            insertZone("11111111-2222-3333-4444-55555555555c", "Zone C", bikeTypeId, 10, buildingId);
            insertZone("11111111-2222-3333-4444-55555555555d", "Zone D", electricTypeId, 5, buildingId);
            insertZone("11111111-2222-3333-4444-55555555555e", "Zone E", truckTypeId, 5, buildingId);
            insertZone("11111111-2222-3333-4444-55555555555f", "Zone A", carTypeId, 5, buildingBId);

            log.info("Zones seeded successfully.");

            // 9. Seed Feedbacks
            insertFeedback("f1111111-1111-1111-1111-111111111111", driverId, session1Id, "Service", "Friendly staff, clean and safe parking space.", FeedbackStatus.OPEN.name(), LocalDateTime.of(2026, 6, 8, 12, 30, 0));
            insertFeedback("f2222222-2222-2222-2222-222222222222", driverId, session2Id, "Payment", "VNPay payment failed first time, but succeeded on second try.", FeedbackStatus.RESOLVED.name(), LocalDateTime.of(2026, 6, 9, 13, 15, 0));
            insertFeedback("f3333333-3333-3333-3333-333333333333", driverId, session5Id, "Parking Slot", "Floor 2 slot 2A-01 is a bit tight for larger motorbikes.", FeedbackStatus.IN_PROGRESS.name(), LocalDateTime.of(2026, 6, 10, 9, 0, 0));
            insertFeedback("f4444444-4444-4444-4444-444444444444", driverId, session8Id, "Safety", "Excellent lighting in Floor 1 at night. Feel very safe.", FeedbackStatus.OPEN.name(), LocalDateTime.of(2026, 6, 8, 20, 0, 0));
            insertFeedback("f5555555-5555-5555-5555-555555555555", driverId, session10Id, "System Bug", "The app showed reservation failed but my card was charged.", FeedbackStatus.RESOLVED.name(), LocalDateTime.of(2026, 6, 7, 18, 30, 0));

            log.info("Feedbacks seeded successfully.");
            log.info("Development mock data seeding complete!");

        } catch (Exception e) {
            log.error("Failed to seed database: ", e);
            throw e;
        }
    }

    private void insertUser(String id, String email, String password, String fullName, String phone, String role) {
        String query = "INSERT INTO users (id, email, password_hash, full_name, phone, role, is_active, created_at, updated_at) " +
                       "VALUES (?, ?, ?, ?, ?, ?, true, NOW(), NOW()) ON CONFLICT (id) DO NOTHING";
        jdbcTemplate.update(query, UUID.fromString(id), email, passwordEncoder.encode(password), fullName, phone, role);
    }

    private void insertVehicleType(String id, String name, String description) {
        String query = "INSERT INTO vehicle_types (id, name, description) VALUES (?, ?, ?) ON CONFLICT (id) DO NOTHING";
        jdbcTemplate.update(query, UUID.fromString(id), name, description);
    }

    private void insertBuilding(String id, String name, String address, String phone, LocalTime openingTime, LocalTime closingTime) {
        String query = "INSERT INTO parking_buildings (id, name, address, phone, opening_time, closing_time, is_active, created_at, updated_at) " +
                       "VALUES (?, ?, ?, ?, ?, ?, true, NOW(), NOW()) ON CONFLICT (id) DO NOTHING";
        jdbcTemplate.update(query, UUID.fromString(id), name, address, phone, openingTime, closingTime);
    }

    private void insertPricing(String id, String buildingId, String vehicleTypeId, BigDecimal hourlyRate, BigDecimal dailyRate,
                               BigDecimal lostTicketFee, BigDecimal overtimeFeeMultiplier, LocalDateTime effectiveFrom,
                               BigDecimal basePrice, BigDecimal nightRate) {
        String query = "INSERT INTO pricing (id, building_id, vehicle_type_id, hourly_rate, daily_rate, lost_ticket_fee, " +
                       "overtime_fee_multiplier, effective_from, effective_to, base_price, night_rate) " +
                       "VALUES (?, ?, ?, ?, ?, ?, ?, ?, null, ?, ?) ON CONFLICT (id) DO NOTHING";
        jdbcTemplate.update(query, UUID.fromString(id), UUID.fromString(buildingId), UUID.fromString(vehicleTypeId),
                hourlyRate, dailyRate, lostTicketFee, overtimeFeeMultiplier, effectiveFrom, basePrice, nightRate);
    }

    private void insertFloor(String id, String buildingId, String floorName, int floorNumber, int totalSlots) {
        String query = "INSERT INTO floors (id, building_id, floor_name, floor_number, total_slots, is_active) " +
                       "VALUES (?, ?, ?, ?, ?, true) ON CONFLICT (id) DO NOTHING";
        jdbcTemplate.update(query, UUID.fromString(id), UUID.fromString(buildingId), floorName, floorNumber, totalSlots);
    }

    private void insertSlot(String id, String floorId, String slotCode, String status, String vehicleType, String zone, Integer distanceToExit, String zoneId) {
        String query = "INSERT INTO parking_slots (id, floor_id, slot_code, status, vehicle_type, zone, distance_to_exit, zone_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT (id) DO NOTHING";
        jdbcTemplate.update(query, 
                UUID.fromString(id), 
                UUID.fromString(floorId), 
                slotCode, 
                status, 
                vehicleType, 
                zone, 
                distanceToExit, 
                zoneId != null ? UUID.fromString(zoneId) : null);
    }

    private void insertSession(String id, String slotId, String driverId, String staffInId, String staffOutId,
                              String licensePlate, String vehicleType, String ticketCode, LocalDateTime checkInTime,
                              LocalDateTime checkOutTime, LocalDateTime parkedAt, String status, String gateIn, String gateOut) {
        String query = "INSERT INTO parking_sessions (id, slot_id, driver_id, staff_in_id, staff_out_id, license_plate, " +
                       "vehicle_type, ticket_code, check_in_time, check_out_time, parked_at, status, gate_in, gate_out, building_id) " +
                       "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT (id) DO NOTHING";
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
                gateOut,
                UUID.fromString("8b72da1f-50b3-4632-a5e2-632b8ac425f1"));
    }

    private void insertPayment(String id, String sessionId, BigDecimal amount, BigDecimal extraFee, String method, String status, LocalDateTime paidAt) {
        String query = "INSERT INTO payments (id, session_id, amount, extra_fee, method, status, paid_at) VALUES (?, ?, ?, ?, ?, ?, ?) ON CONFLICT (id) DO NOTHING";
        jdbcTemplate.update(query, UUID.fromString(id), UUID.fromString(sessionId), amount, extraFee, method, status, paidAt);
    }

    private void insertReservation(String id, String driverId, String slotId, String vehicleType, LocalDateTime reservedFrom,
                                   LocalDateTime reservedTo, String status, LocalDateTime createdAt, String buildingId) {
        String query = "INSERT INTO reservations (id, driver_id, slot_id, vehicle_type, reserved_from, reserved_to, status, created_at, building_id) " +
                       "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT (id) DO NOTHING";
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
        String query = "INSERT INTO feedbacks (id, driver_id, session_id, category, content, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?) ON CONFLICT (id) DO NOTHING";
        jdbcTemplate.update(query,
                UUID.fromString(id),
                UUID.fromString(driverId),
                sessionId != null ? UUID.fromString(sessionId) : null,
                category,
                content,
                status,
                createdAt);
    }

    private void insertZone(String id, String zoneName, String vehicleTypeId, int totalCapacity, String buildingId) {
        String query = "INSERT INTO zones (id, zone_name, vehicle_type_id, total_capacity, building_id) VALUES (?, ?, ?, ?, ?) ON CONFLICT (id) DO NOTHING";
        jdbcTemplate.update(query, UUID.fromString(id), zoneName, UUID.fromString(vehicleTypeId), totalCapacity, UUID.fromString(buildingId));
    }
}
