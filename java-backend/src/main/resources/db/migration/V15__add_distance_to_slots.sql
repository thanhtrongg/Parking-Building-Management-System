-- V15__add_distance_to_slots.sql

-- Add distance_to_exit column (measured in meters)
ALTER TABLE parking_slots ADD COLUMN distance_to_exit INT DEFAULT 10;

-- Link parking_slots directly to zones via foreign key for relational integrity
ALTER TABLE parking_slots ADD COLUMN zone_id UUID REFERENCES zones(id) ON DELETE SET NULL;
