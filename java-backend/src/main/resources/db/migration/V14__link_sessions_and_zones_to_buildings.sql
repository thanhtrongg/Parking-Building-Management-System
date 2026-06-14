-- V14__link_sessions_and_zones_to_buildings.sql

-- Add building_id to parking_sessions
ALTER TABLE parking_sessions ADD COLUMN building_id UUID;
ALTER TABLE parking_sessions ADD CONSTRAINT fk_sessions_building FOREIGN KEY (building_id) REFERENCES parking_buildings(id);

-- Add building_id to zones
ALTER TABLE zones ADD COLUMN building_id UUID;
ALTER TABLE zones ADD CONSTRAINT fk_zones_building FOREIGN KEY (building_id) REFERENCES parking_buildings(id);

-- Populate existing records using the first building's ID
UPDATE parking_sessions SET building_id = (SELECT id FROM parking_buildings LIMIT 1) WHERE building_id IS NULL;
UPDATE zones SET building_id = (SELECT id FROM parking_buildings LIMIT 1) WHERE building_id IS NULL;

-- Enforce NOT NULL constraints
ALTER TABLE parking_sessions ALTER COLUMN building_id SET NOT NULL;
ALTER TABLE zones ALTER COLUMN building_id SET NOT NULL;
