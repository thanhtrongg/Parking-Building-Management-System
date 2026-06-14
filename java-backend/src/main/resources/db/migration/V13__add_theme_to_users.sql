ALTER TABLE users ADD COLUMN theme VARCHAR(20) DEFAULT 'light' NOT NULL CHECK (theme IN ('light', 'dark'));
