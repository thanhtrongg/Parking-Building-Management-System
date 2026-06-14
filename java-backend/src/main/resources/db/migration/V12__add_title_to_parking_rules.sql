ALTER TABLE parking_rules ADD COLUMN title VARCHAR(255);

-- Update existing seeded rules with their corresponding titles
UPDATE parking_rules SET title = 'Reserve before arrival' WHERE id = 'b1111111-1111-1111-1111-111111111111';
UPDATE parking_rules SET title = 'Use the registered plate' WHERE id = 'b2222222-2222-2222-2222-222222222222';
UPDATE parking_rules SET title = 'Follow the assigned zone' WHERE id = 'b3333333-3333-3333-3333-333333333333';
UPDATE parking_rules SET title = 'Check night rate rules' WHERE id = 'b4444444-4444-4444-4444-444444444444';
UPDATE parking_rules SET title = 'Ask before restricted parking' WHERE id = 'b5555555-5555-5555-5555-555555555555';

-- Set title constraint to NOT NULL once populated
ALTER TABLE parking_rules ALTER COLUMN title SET NOT NULL;
