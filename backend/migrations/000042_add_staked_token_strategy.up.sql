ALTER TYPE strategies ADD VALUE 'total-token-weighted-default';
COMMIT;
INSERT INTO voting_strategies (key, name, description)
VALUES ('total-token-weighted-default', 'Total Token Weighted', 'Vote weight is proportional to the number tokens total ( primary / staked / locked ).');