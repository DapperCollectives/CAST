ALTER TABLE balances
DROP COLUMN id;

ALTER TABLE balances
DROP COLUMN proposal_id;

ALTER TABLE balances
ADD COLUMN id uuid;