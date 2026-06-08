-- ============================================================================
-- V3__add_vnpay_payment_method.sql
-- Flyway migration: Allow 'VNPAY' in payments check constraint
-- ============================================================================

ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_method_check;
ALTER TABLE payments ADD CONSTRAINT payments_method_check CHECK (method IN ('CASH', 'TRANSFER', 'EWALLET', 'VNPAY'));
