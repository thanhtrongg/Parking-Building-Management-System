ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS reservation_id uuid,
  ADD COLUMN IF NOT EXISTS sepay_payment_code varchar(50),
  ADD COLUMN IF NOT EXISTS sepay_transaction_id varchar(50),
  ADD COLUMN IF NOT EXISTS sepay_reference_code varchar(100),
  ADD COLUMN IF NOT EXISTS sepay_payload jsonb;

ALTER TABLE payments
  ALTER COLUMN status SET DEFAULT 'PENDING';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'payments_reservation_id_fkey'
  ) THEN
    ALTER TABLE payments
      ADD CONSTRAINT payments_reservation_id_fkey
      FOREIGN KEY (reservation_id) REFERENCES reservations(id)
      ON DELETE NO ACTION ON UPDATE NO ACTION;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS payments_sepay_payment_code_key
  ON payments(sepay_payment_code)
  WHERE sepay_payment_code IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS payments_sepay_transaction_id_key
  ON payments(sepay_transaction_id)
  WHERE sepay_transaction_id IS NOT NULL;
