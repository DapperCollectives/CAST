BEGIN;
ALTER TYPE strategies ADD VALUE IF NOT EXISTS 'custom-script';
END TRANSACTION;
COMMIT;

INSERT INTO voting_strategies (key, name, description)
VALUES ('custom-script', 'Custom Script', 'Vote weight is calculated via a custom script.');