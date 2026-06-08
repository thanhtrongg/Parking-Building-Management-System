-- ============================================================================
-- V1__init_schema.sql
-- Flyway migration: Initial schema for Parking Building Management System
-- PostgreSQL DDL
-- ============================================================================

-- ============================================================
-- 1. Users
-- ============================================================
CREATE TABLE users (
    id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name     VARCHAR(255) NOT NULL,
    phone         VARCHAR(20),
    role          VARCHAR(20)  NOT NULL CHECK (role IN ('ADMIN', 'MANAGER', 'STAFF', 'DRIVER')),
    is_active     BOOLEAN      NOT NULL DEFAULT true,
    created_at    TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 2. Parking Buildings
-- ============================================================
CREATE TABLE parking_buildings (
    id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    name         VARCHAR(255) NOT NULL,
    address      VARCHAR(500) NOT NULL,
    phone        VARCHAR(20),
    opening_time TIME,
    closing_time TIME,
    is_active    BOOLEAN      NOT NULL DEFAULT true,
    created_at   TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 3. Floors
-- ============================================================
CREATE TABLE floors (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    building_id   UUID        NOT NULL REFERENCES parking_buildings(id) ON DELETE CASCADE,
    floor_name    VARCHAR(100) NOT NULL,
    floor_number  INT         NOT NULL,
    vehicle_type  VARCHAR(20) CHECK (vehicle_type IN ('CAR', 'MOTORBIKE', 'BICYCLE')),
    total_slots   INT,
    is_active     BOOLEAN     NOT NULL DEFAULT true
);

-- ============================================================
-- 4. Parking Slots
-- ============================================================
CREATE TABLE parking_slots (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    floor_id     UUID        NOT NULL REFERENCES floors(id) ON DELETE CASCADE,
    slot_code    VARCHAR(50) NOT NULL,
    status       VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE'
                             CHECK (status IN ('AVAILABLE', 'OCCUPIED', 'RESERVED', 'MAINTENANCE', 'LOCKED')),
    vehicle_type VARCHAR(20) CHECK (vehicle_type IN ('CAR', 'MOTORBIKE', 'BICYCLE'))
);

-- ============================================================
-- 5. Vehicle Types (lookup table for pricing)
-- ============================================================
CREATE TABLE vehicle_types (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(500)
);

-- ============================================================
-- 6. Pricing
-- ============================================================
CREATE TABLE pricing (
    id                      UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    building_id             UUID          REFERENCES parking_buildings(id) ON DELETE SET NULL,
    vehicle_type_id         UUID          REFERENCES vehicle_types(id) ON DELETE SET NULL,
    hourly_rate             DECIMAL(10,2) NOT NULL,
    daily_rate              DECIMAL(10,2),
    lost_ticket_fee         DECIMAL(10,2),
    overtime_fee_multiplier DECIMAL(5,2)  DEFAULT 1.5,
    effective_from          TIMESTAMP,
    effective_to            TIMESTAMP
);

-- ============================================================
-- 7. Parking Sessions
-- ============================================================
CREATE TABLE parking_sessions (
    id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    slot_id        UUID         REFERENCES parking_slots(id) ON DELETE SET NULL,
    driver_id      UUID         REFERENCES users(id) ON DELETE SET NULL,
    staff_in_id    UUID         REFERENCES users(id) ON DELETE SET NULL,
    staff_out_id   UUID         REFERENCES users(id) ON DELETE SET NULL,
    license_plate  VARCHAR(20)  NOT NULL,
    vehicle_type   VARCHAR(20)  CHECK (vehicle_type IN ('CAR', 'MOTORBIKE', 'BICYCLE')),
    ticket_code    VARCHAR(100) NOT NULL UNIQUE,
    check_in_time  TIMESTAMP    NOT NULL,
    check_out_time TIMESTAMP,
    status         VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE'
                                CHECK (status IN ('ACTIVE', 'COMPLETED', 'LOST_TICKET', 'EXCEPTION')),
    gate_in        VARCHAR(50),
    gate_out       VARCHAR(50)
);

-- ============================================================
-- 8. Payments
-- ============================================================
CREATE TABLE payments (
    id         UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID          NOT NULL REFERENCES parking_sessions(id) ON DELETE CASCADE,
    amount     DECIMAL(12,2) NOT NULL,
    extra_fee  DECIMAL(12,2) DEFAULT 0,
    method     VARCHAR(20)   CHECK (method IN ('CASH', 'TRANSFER', 'EWALLET')),
    status     VARCHAR(20)   NOT NULL DEFAULT 'PENDING'
                             CHECK (status IN ('PENDING', 'PAID', 'REFUNDED')),
    paid_at    TIMESTAMP
);

-- ============================================================
-- 9. Reservations
-- ============================================================
CREATE TABLE reservations (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    slot_id       UUID        NOT NULL REFERENCES parking_slots(id) ON DELETE CASCADE,
    vehicle_type  VARCHAR(20) CHECK (vehicle_type IN ('CAR', 'MOTORBIKE', 'BICYCLE')),
    reserved_from TIMESTAMP   NOT NULL,
    reserved_to   TIMESTAMP   NOT NULL,
    status        VARCHAR(20) NOT NULL DEFAULT 'PENDING'
                              CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELLED', 'EXPIRED', 'USED')),
    created_at    TIMESTAMP   NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 10. Feedbacks
-- ============================================================
CREATE TABLE feedbacks (
    id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id  UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id UUID         REFERENCES parking_sessions(id) ON DELETE SET NULL,
    category   VARCHAR(100),
    content    TEXT         NOT NULL,
    status     VARCHAR(20)  NOT NULL DEFAULT 'OPEN'
                            CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED')),
    created_at TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Floors
CREATE INDEX idx_floors_building_id ON floors(building_id);

-- Parking Slots
CREATE INDEX idx_parking_slots_floor_id ON parking_slots(floor_id);
CREATE INDEX idx_parking_slots_status ON parking_slots(status);

-- Pricing
CREATE INDEX idx_pricing_building_id ON pricing(building_id);
CREATE INDEX idx_pricing_vehicle_type_id ON pricing(vehicle_type_id);

-- Parking Sessions
CREATE INDEX idx_parking_sessions_slot_id ON parking_sessions(slot_id);
CREATE INDEX idx_parking_sessions_driver_id ON parking_sessions(driver_id);
CREATE INDEX idx_parking_sessions_status ON parking_sessions(status);
CREATE INDEX idx_parking_sessions_ticket_code ON parking_sessions(ticket_code);

-- Payments
CREATE INDEX idx_payments_session_id ON payments(session_id);
CREATE INDEX idx_payments_status ON payments(status);

-- Reservations
CREATE INDEX idx_reservations_driver_id ON reservations(driver_id);
CREATE INDEX idx_reservations_slot_id ON reservations(slot_id);
CREATE INDEX idx_reservations_status ON reservations(status);

-- Feedbacks
CREATE INDEX idx_feedbacks_driver_id ON feedbacks(driver_id);
CREATE INDEX idx_feedbacks_status ON feedbacks(status);
