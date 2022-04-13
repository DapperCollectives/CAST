ALTER TYPE strategies ADD VALUE 'staked-token-weighted-default';
COMMIT;
INSERT INTO voting_strategies (key, name, description)
VALUES ('staked-token-weighted-default', 'Staked Token Weighted', 'Vote weight is proportional to the number tokens staked.');