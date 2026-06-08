-- ============================================================================
-- V2__add_advanced_pricing.sql
-- Flyway migration: Add base_price and night_rate to pricing table
-- ============================================================================

ALTER TABLE pricing 
ADD COLUMN base_price DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN night_rate DECIMAL(10,2) DEFAULT NULL;
