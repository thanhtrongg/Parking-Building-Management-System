CREATE TABLE parking_rules (
    id UUID PRIMARY KEY,
    building_id UUID NOT NULL,
    content TEXT NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_rules_building FOREIGN KEY (building_id) REFERENCES parking_buildings(id) ON DELETE CASCADE
);

CREATE INDEX idx_rules_building ON parking_rules(building_id);

INSERT INTO parking_rules (id, building_id, content, display_order, is_active) VALUES
('b1111111-1111-1111-1111-111111111111', '8b72da1f-50b3-4632-a5e2-632b8ac425f1', 'Reserve a slot before arrival when possible so the system can hold availability.', 0, TRUE),
('b2222222-2222-2222-2222-222222222222', '8b72da1f-50b3-4632-a5e2-632b8ac425f1', 'Use the registered license plate at check-in for faster ticket matching.', 1, TRUE),
('b3333333-3333-3333-3333-333333333333', '8b72da1f-50b3-4632-a5e2-632b8ac425f1', 'Follow the assigned zone and slot shown by staff or by your booking detail.', 2, TRUE),
('b4444444-4444-4444-4444-444444444444', '8b72da1f-50b3-4632-a5e2-632b8ac425f1', 'Night rate may apply based on the active pricing policy for your vehicle type.', 3, TRUE),
('b5555555-5555-5555-5555-555555555555', '8b72da1f-50b3-4632-a5e2-632b8ac425f1', 'Contact staff before leaving a vehicle in maintenance or restricted zones.', 4, TRUE);
