ALTER TABLE balances
DROP COLUMN id;

ALTER TABLE balances
ADD COLUMN id BIGSERIAL primary key;

ALTER TABLE balances
ADD COLUMN proposal_id INT;

UPDATE balances set proposal_id=1;

ALTER TABLE balances ALTER COLUMN proposal_id set NOT NULL;
