ALTER TABLE balances
DROP COLUMN id;

ALTER TABLE balances
ADD COLUMN id BIGSERIAL primary key;

ALTER TABLE balances
ADD COLUMN proposal_id INT;