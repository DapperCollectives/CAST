ALTER TABLE votes ADD COLUMN voucher jsonb;
ALTER TABLE proposals ADD COLUMN voucher jsonb;
ALTER TABLE communities ADD COLUMN voucher jsonb;