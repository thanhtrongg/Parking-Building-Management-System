-- ============================================================================
-- V8__remove_vehicle_type_from_floors.sql
-- Flyway migration: Drop vehicle_type column from floors table
-- ============================================================================

ALTER TABLE floors DROP COLUMN vehicle_type;
