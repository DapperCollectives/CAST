BEGIN;
ALTER TYPE strategies ADD VALUE IF NOT EXISTS 'one-address-one-vote';
END TRANSACTION;
COMMIT;

INSERT INTO voting_strategies (key, name, description)
VALUES ('one-address-one-vote', 'One Address One Vote', 'one address is simply only allowed one vote, assets do not come into play.');
