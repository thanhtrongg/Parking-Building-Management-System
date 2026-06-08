-- Add parked_at column to parking_sessions
ALTER TABLE parking_sessions ADD COLUMN parked_at TIMESTAMP;

-- Make slot_id nullable in reservations
ALTER TABLE reservations ALTER COLUMN slot_id DROP NOT NULL;

-- Add building_id to reservations
ALTER TABLE reservations ADD COLUMN building_id UUID REFERENCES parking_buildings(id) ON DELETE CASCADE;

-- Populate building_id for existing reservations using the slot relation
UPDATE reservations r
SET building_id = (
    SELECT f.building_id
    FROM parking_slots s
    JOIN floors f ON s.floor_id = f.id
    WHERE s.id = r.slot_id
)
WHERE r.slot_id IS NOT NULL;

-- Set building_id as NOT NULL now that it is fully populated
ALTER TABLE reservations ALTER COLUMN building_id SET NOT NULL;
