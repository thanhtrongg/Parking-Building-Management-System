-- ============================================================================
-- V9__create_zones_table.sql
-- Flyway migration: Create zones table
-- ============================================================================

CREATE TABLE zones (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    zone_name       VARCHAR(50) NOT NULL,
    vehicle_type_id UUID        REFERENCES vehicle_types(id) ON DELETE SET NULL,
    total_capacity  INT         NOT NULL
);
