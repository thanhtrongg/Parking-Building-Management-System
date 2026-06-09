UPDATE reservations
SET status = 'CONFIRMED'
WHERE status = 'PENDING';

ALTER TABLE reservations
  ALTER COLUMN status SET DEFAULT 'CONFIRMED';
