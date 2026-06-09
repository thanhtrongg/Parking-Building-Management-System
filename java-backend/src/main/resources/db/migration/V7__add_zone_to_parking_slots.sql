-- ============================================================================
-- V7__add_zone_to_parking_slots.sql
-- Flyway migration: Add zone column to parking_slots table
-- ============================================================================

ALTER TABLE parking_slots ADD COLUMN zone VARCHAR(50);
